#!/usr/bin/env python3
"""
GreenCompute AI — ESP32 + INA219 Physical Hardware Telemetry Simulator
=====================================================================

Emulates high-precision current, voltage, power, and accumulated energy
telemetry from an ESP32 microcontroller reading an INA219 High-Side DC
Current/Power Sensor over I2C.

Physics & Sensor Model:
  * Bus Voltage: Nominal 5.0V DC rail with small load-induced voltage sag:
      V_bus = V_source - (I_load * R_internal_wire)
  * Shunt Resistor: R_shunt = 0.100 Ohm (Adafruit standard)
  * Shunt Voltage Drop: V_shunt = I_load * R_shunt (in mV, up to 250mV at 2.5A)
  * Dynamic DC Load:
      - Idle / Standby: 100 mA – 250 mA (~0.5W – 1.25W)
      - Medium Compute: 600 mA – 1100 mA (~3.0W – 5.5W)
      - Peak Inference Workload: 1800 mA – 2500 mA (~9.0W – 12.5W)
  * Energy Integration:
      P = V * I (Watts)
      E = sum(P * dt) / 3600 (Watt-hours)

Transport:
  * HTTP POST to GreenCompute AI backend endpoint (default: /api/hardware/telemetry)
  * Optional WebSocket client mode to pipe directly to dashboard / frontend
"""

from __future__ import annotations

import argparse
import asyncio
import json
import logging
import math
import os
import random
import signal
import sys
import time
from datetime import datetime, timezone
from typing import Any, Dict, Optional
import urllib.error
import urllib.request

# Optional websockets support
try:
    import websockets
    HAS_WEBSOCKETS = True
except ImportError:
    HAS_WEBSOCKETS = False

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("esp32_simulator")


class INA219HardwareModel:
    """Simulates physical characteristics of INA219 high-side sensor and DC load."""

    def __init__(
        self,
        nominal_voltage_v: float = 5.0,
        shunt_resistance_ohms: float = 0.100,
        wire_resistance_ohms: float = 0.040,
        idle_current_ma: float = 160.0,
        peak_current_ma: float = 2350.0,
    ):
        self.nominal_v = nominal_voltage_v
        self.r_shunt = shunt_resistance_ohms
        self.r_wire = wire_resistance_ohms
        self.idle_current_ma = idle_current_ma
        self.peak_current_ma = peak_current_ma
        self._target_current_ma = idle_current_ma
        self._current_ma = idle_current_ma
        self._workload_active = False

    def set_workload_state(self, active: bool) -> None:
        """Toggle heavy AI inference workload load profile."""
        self._workload_active = active
        if active:
            # Randomize peak target between 1800mA and peak_current_ma
            self._target_current_ma = random.uniform(1850.0, self.peak_current_ma)
        else:
            # Idle baseline with slight jitter
            self._target_current_ma = random.uniform(self.idle_current_ma - 30.0, self.idle_current_ma + 60.0)

    def sample(self, dt: float) -> Dict[str, float]:
        """Advance time by dt seconds and compute electrical readings."""
        # Realistic slew rate / smoothing toward target current (simulating thermal/capacitive inertia)
        slew_factor = min(1.0, dt * 3.5)
        self._current_ma += (self._target_current_ma - self._current_ma) * slew_factor

        # Add realistic sensor ADC noise (0.8mA quantization + white noise)
        current_noise_ma = random.gauss(0.0, 3.2)
        measured_current_ma = max(50.0, self._current_ma + current_noise_ma)

        # High-side shunt voltage drop in millivolts: V_shunt = I * R_shunt
        shunt_voltage_mv = (measured_current_ma / 1000.0) * self.r_shunt * 1000.0

        # Bus voltage sag under DC load: V_bus = V_nom - I * R_wire + thermal drift
        voltage_sag = (measured_current_ma / 1000.0) * self.r_wire
        voltage_noise = random.gauss(0.0, 0.008)
        measured_voltage_v = max(4.0, self.nominal_v - voltage_sag + voltage_noise)

        # Power in Watts: P = V_bus * I_load (A)
        power_w = measured_voltage_v * (measured_current_ma / 1000.0)

        return {
            "voltage_v": round(measured_voltage_v, 3),
            "current_ma": round(measured_current_ma, 2),
            "shunt_voltage_mv": round(shunt_voltage_mv, 3),
            "power_w": round(power_w, 3),
            "power_mw": round(power_w * 1000.0, 2),
        }


class ESP32TelemetrySimulator:
    """Simulates an ESP32 microcontroller reading INA219 and transmitting telemetry."""

    def __init__(
        self,
        device_id: str = "esp32_ina219_node1",
        backend_url: str = "http://localhost:8000",
        endpoint: str = "/api/hardware/telemetry",
        interval: float = 1.0,
        spike_on_workload: bool = False,
        burst_interval: float = 8.0,
        burst_duration: float = 3.0,
        ws_url: Optional[str] = None,
        quiet: bool = False,
        json_output: bool = False,
    ):
        self.device_id = device_id
        self.backend_url = backend_url.rstrip("/")
        self.endpoint = endpoint if endpoint.startswith("/") else f"/{endpoint}"
        self.interval = max(0.05, float(interval))
        self.spike_on_workload = spike_on_workload
        self.burst_interval = burst_interval
        self.burst_duration = burst_duration
        self.ws_url = ws_url
        self.quiet = quiet
        self.json_output = json_output

        self.hardware = INA219HardwareModel()
        self.cumulative_energy_wh: float = 0.0
        self.sample_count: int = 0
        self.peak_power_w: float = 0.0
        self.start_time: float = time.time()
        self.last_sample_time: float = time.monotonic()
        self.running: bool = True

        # Workload burst cycle tracking
        self._workload_cycle_start: float = time.monotonic()

    def generate_packet(self) -> Dict[str, Any]:
        """Generate one telemetry packet with physical sensor measurements."""
        now_mono = time.monotonic()
        dt = max(0.001, now_mono - self.last_sample_time)
        self.last_sample_time = now_mono

        # Handle automatic workload burst oscillation if enabled
        if self.spike_on_workload:
            elapsed_in_cycle = (now_mono - self._workload_cycle_start) % (self.burst_interval + self.burst_duration)
            is_burst = elapsed_in_cycle >= self.burst_interval
            self.hardware.set_workload_state(is_burst)
        else:
            # Gentle stochastic fluctuations
            if random.random() < 0.15:
                self.hardware.set_workload_state(random.choice([True, False, False]))

        reading = self.hardware.sample(dt)

        # Accumulate energy: E = P * dt / 3600 (Watt-hours)
        power_w = reading["power_w"]
        energy_increment_wh = (power_w * dt) / 3600.0
        self.cumulative_energy_wh += energy_increment_wh
        self.sample_count += 1

        if power_w > self.peak_power_w:
            self.peak_power_w = power_w

        iso_timestamp = datetime.now(timezone.utc).isoformat()

        # Build dual-compatible schema: conforms to {voltage_v, current_ma, power_w, energy_wh}
        # and standard {voltage, current, power, energy}
        packet = {
            "device_id": self.device_id,
            "timestamp": iso_timestamp,
            "voltage_v": reading["voltage_v"],
            "current_ma": reading["current_ma"],
            "power_w": reading["power_w"],
            "energy_wh": round(self.cumulative_energy_wh, 5),
            "shunt_voltage_mv": reading["shunt_voltage_mv"],
            "power_mw": reading["power_mw"],
            "energy_mwh": round(self.cumulative_energy_wh * 1000.0, 3),
            # Backwards-compatible aliases for legacy consumers
            "voltage": reading["voltage_v"],
            "current": reading["current_ma"],
            "power": reading["power_w"],
            "energy": round(self.cumulative_energy_wh, 5),
            "sample_index": self.sample_count,
            "workload_spike": self.hardware._workload_active,
        }
        return packet

    def send_http_packet(self, packet: Dict[str, Any]) -> tuple[bool, str]:
        """POST telemetry packet to backend API with fallback."""
        payload_bytes = json.dumps(packet).encode("utf-8")
        target_urls = [
            f"{self.backend_url}{self.endpoint}",
            f"{self.backend_url}/api/hardware",  # fallback if custom endpoint not routed
        ]

        last_error = ""
        for url in target_urls:
            req = urllib.request.Request(
                url,
                data=payload_bytes,
                headers={
                    "Content-Type": "application/json",
                    "User-Agent": "ESP32-INA219-Client/1.0",
                },
                method="POST",
            )
            try:
                with urllib.request.urlopen(req, timeout=2.5) as response:
                    code = response.getcode()
                    if code in (200, 201):
                        return True, f"HTTP {code}"
                    last_error = f"HTTP {code}"
            except urllib.error.HTTPError as he:
                last_error = f"HTTP {he.code}: {he.reason}"
            except urllib.error.URLError as ue:
                last_error = f"Connection error: {ue.reason}"
            except Exception as ex:
                last_error = f"Request error: {ex}"

        return False, last_error

    async def run_websocket_loop(self, ws_url: str, count: int = 0) -> None:
        """Stream telemetry directly over WebSocket."""
        if not HAS_WEBSOCKETS:
            logger.error("The 'websockets' library is required for WebSocket mode.")
            return

        logger.info(f"Connecting to WebSocket: {ws_url}")
        sent_packets = 0
        while self.running and (count <= 0 or sent_packets < count):
            try:
                async with websockets.connect(ws_url) as ws:
                    logger.info(f"[WS] Connected to {ws_url}. Streaming telemetry...")
                    while self.running and (count <= 0 or sent_packets < count):
                        packet = self.generate_packet()
                        await ws.send(json.dumps(packet))
                        sent_packets += 1
                        self._log_packet_status(packet, True, "WS OK")
                        await asyncio.sleep(self.interval)
            except Exception as e:
                logger.warning(f"[WS] Connection failed ({e}). Retrying in 2.0s...")
                await asyncio.sleep(2.0)

    def _log_packet_status(self, packet: Dict[str, Any], ok: bool, status_msg: str) -> None:
        """Print formatted telemetry metrics to console."""
        if self.json_output:
            sys.stdout.write(json.dumps(packet) + "\n")
            sys.stdout.flush()
            return

        if self.quiet:
            return

        spike_badge = "[WORKLOAD PEAK]" if packet.get("workload_spike") else " [IDLE/NOMINAL]"
        status_badge = "\033[92m" + status_msg + "\033[0m" if ok else "\033[93m" + status_msg + "\033[0m"

        sys.stdout.write(
            f"\r[ESP32+INA219] #{packet['sample_index']:<4} | "
            f"V: {packet['voltage_v']:>5.3f} V | "
            f"I: {packet['current_ma']:>7.2f} mA | "
            f"P: {packet['power_w']:>6.3f} W | "
            f"E: {packet['energy_wh']:>7.4f} Wh | "
            f"{spike_badge} | {status_badge}\n"
        )
        sys.stdout.flush()

    def run_sync_http_loop(self, count: int = 0) -> None:
        """Main synchronous telemetry loop for HTTP transmission."""
        target_url = f"{self.backend_url}{self.endpoint}"
        logger.info(f"Starting ESP32 INA219 Simulator for [{self.device_id}]")
        logger.info(f"Reporting to: {target_url} every {self.interval:.2f}s")
        if self.spike_on_workload:
            logger.info(
                f"Workload spikes ENABLED: cycle every {self.burst_interval:.1f}s for {self.burst_duration:.1f}s peak."
            )

        sent_packets = 0
        try:
            while self.running and (count <= 0 or sent_packets < count):
                tick_start = time.monotonic()
                packet = self.generate_packet()

                ok, status_msg = self.send_http_packet(packet)
                sent_packets += 1
                self._log_packet_status(packet, ok, status_msg)

                # Maintain steady sample timing
                elapsed = time.monotonic() - tick_start
                sleep_time = max(0.01, self.interval - elapsed)
                time.sleep(sleep_time)

        except KeyboardInterrupt:
            pass
        finally:
            self.print_summary()

    def print_summary(self) -> None:
        """Display final session summary table upon termination."""
        duration_s = max(0.1, time.time() - self.start_time)
        avg_power = (self.cumulative_energy_wh * 3600.0) / duration_s if duration_s > 0 else 0.0

        print("\n" + "=" * 60)
        print(" ESP32 + INA219 Telemetry Simulator — Session Summary")
        print("=" * 60)
        print(f" Device ID           : {self.device_id}")
        print(f" Total Samples       : {self.sample_count}")
        print(f" Elapsed Time        : {duration_s:.1f} seconds")
        print(f" Peak Power          : {self.peak_power_w:.3f} W")
        print(f" Average Power       : {avg_power:.3f} W")
        print(f" Cumulative Energy   : {self.cumulative_energy_wh:.5f} Wh ({self.cumulative_energy_wh * 1000:.2f} mWh)")
        print("=" * 60)


def build_cli() -> argparse.ArgumentParser:
    """Construct CLI argument parser for the simulator."""
    parser = argparse.ArgumentParser(
        description="Realistic ESP32 + INA219 Hardware Telemetry Simulator for GreenCompute AI",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--interval",
        type=float,
        default=1.0,
        help="Telemetry sampling and transmission interval in seconds",
    )
    parser.add_argument(
        "--backend-url",
        type=str,
        default="http://localhost:8000",
        help="Target GreenCompute AI backend base URL",
    )
    parser.add_argument(
        "--endpoint",
        type=str,
        default="/api/hardware/telemetry",
        help="Backend hardware telemetry POST route",
    )
    parser.add_argument(
        "--device-id",
        type=str,
        default="esp32_ina219_node1",
        help="Unique identifier for the simulated ESP32 node",
    )
    parser.add_argument(
        "--spike-on-workload",
        action="store_true",
        help="Simulate realistic inference workload current spikes (spikes current from 160mA to 2400mA)",
    )
    parser.add_argument(
        "--burst-interval",
        type=float,
        default=8.0,
        help="Seconds of idle load between workload bursts",
    )
    parser.add_argument(
        "--burst-duration",
        type=float,
        default=3.0,
        help="Duration in seconds of each peak inference workload burst",
    )
    parser.add_argument(
        "--ws-mode",
        action="store_true",
        help="Run in WebSocket client mode instead of HTTP POST",
    )
    parser.add_argument(
        "--ws-url",
        type=str,
        default="ws://localhost:8000/ws/telemetry",
        help="WebSocket URL when --ws-mode is enabled",
    )
    parser.add_argument(
        "-n", "--count",
        type=int,
        default=0,
        help="Number of packets to send (0 = run indefinitely)",
    )
    parser.add_argument(
        "--quiet",
        action="store_true",
        help="Suppress per-second terminal status lines",
    )
    parser.add_argument(
        "--json-output",
        action="store_true",
        help="Output raw JSON stream to stdout for Unix pipes",
    )
    return parser


def main() -> None:
    """CLI entrypoint."""
    parser = build_cli()
    args = parser.parse_args()

    simulator = ESP32TelemetrySimulator(
        device_id=args.device_id,
        backend_url=args.backend_url,
        endpoint=args.endpoint,
        interval=args.interval,
        spike_on_workload=args.spike_on_workload,
        burst_interval=args.burst_interval,
        burst_duration=args.burst_duration,
        ws_url=args.ws_url if args.ws_mode else None,
        quiet=args.quiet,
        json_output=args.json_output,
    )

    def handle_signal(sig, frame):
        simulator.running = False

    signal.signal(signal.SIGINT, handle_signal)
    signal.signal(signal.SIGTERM, handle_signal)

    if args.ws_mode:
        if not HAS_WEBSOCKETS:
            sys.stderr.write("Error: 'websockets' library is required for --ws-mode. Run: pip install websockets\n")
            sys.exit(1)
        asyncio.run(simulator.run_websocket_loop(args.ws_url, count=args.count))
    else:
        simulator.run_sync_http_loop(count=args.count)


if __name__ == "__main__":
    main()
