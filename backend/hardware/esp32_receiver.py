"""ESP32DataReceiver — Ingestion and processing of high-frequency power data from ESP32 + INA219 sensor module."""

from __future__ import annotations

from collections import deque
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from typing import Any, Deque, Dict, List, Optional


@dataclass
class ESP32Payload:
    voltage: float  # Volts (V)
    current: float  # Milliamps (mA) or Amps (A)
    power: float    # Watts (W)
    energy: float   # Accumulated energy (Wh or Joules)
    timestamp: Optional[str] = None
    device_id: Optional[str] = "esp32_ina219_node1"


@dataclass
class HardwareMetricsSummary:
    sample_count: int
    latest_voltage_v: float
    latest_current_a: float
    latest_power_w: float
    peak_power_w: float
    avg_power_w: float
    total_energy_wh: float
    last_updated: str


class ESP32DataReceiver:
    """Ingests, buffers, and aggregates real-time hardware power readings."""

    def __init__(self, max_buffer_size: int = 3600):
        self.buffer: Deque[Dict[str, Any]] = deque(maxlen=max_buffer_size)
        self.peak_power: float = 0.0
        self.total_energy_wh: float = 0.0

    def ingest(self, payload: ESP32Payload) -> Dict[str, Any]:
        """Validate and record an incoming reading from ESP32 hardware."""
        # Normalize current to Amps if provided in mA (> 50 typically means mA for micro systems)
        current_a = payload.current
        if abs(payload.current) > 50.0:  # Value is in mA
            current_a = payload.current / 1000.0

        # Calculate power if missing or 0
        calculated_power = payload.power
        if calculated_power <= 0.0 and payload.voltage > 0:
            calculated_power = payload.voltage * current_a

        record = {
            "voltage": round(float(payload.voltage), 3),
            "current": round(float(current_a), 4),
            "power": round(float(calculated_power), 3),
            "energy": round(float(payload.energy), 4),
            "timestamp": payload.timestamp or datetime.now(timezone.utc).isoformat(),
            "device_id": payload.device_id or "esp32_ina219_node1",
        }

        self.buffer.append(record)
        if record["power"] > self.peak_power:
            self.peak_power = record["power"]

        # Track cumulative energy
        if record["energy"] > self.total_energy_wh:
            self.total_energy_wh = record["energy"]
        elif len(self.buffer) >= 2:
            # Trapezoidal integration if device resets energy counter
            prev = self.buffer[-2]
            try:
                t1 = datetime.fromisoformat(prev["timestamp"])
                t2 = datetime.fromisoformat(record["timestamp"])
                dt_hours = max(0.0, (t2 - t1).total_seconds() / 3600.0)
                avg_p = (prev["power"] + record["power"]) / 2.0
                self.total_energy_wh += avg_p * dt_hours
            except Exception:
                pass

        return record

    def get_latest(self) -> Optional[Dict[str, Any]]:
        """Return the most recent reading from the sensor."""
        if not self.buffer:
            return None
        return self.buffer[-1]

    def get_history(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Return the last `limit` readings."""
        return list(self.buffer)[-limit:]

    def get_summary(self) -> HardwareMetricsSummary:
        """Calculate operational summary of monitored hardware load."""
        if not self.buffer:
            return HardwareMetricsSummary(
                sample_count=0,
                latest_voltage_v=0.0,
                latest_current_a=0.0,
                latest_power_w=0.0,
                peak_power_w=0.0,
                avg_power_w=0.0,
                total_energy_wh=0.0,
                last_updated=datetime.now(timezone.utc).isoformat(),
            )

        latest = self.buffer[-1]
        all_powers = [r["power"] for r in self.buffer]
        avg_power = sum(all_powers) / len(all_powers)

        return HardwareMetricsSummary(
            sample_count=len(self.buffer),
            latest_voltage_v=latest["voltage"],
            latest_current_a=latest["current"],
            latest_power_w=latest["power"],
            peak_power_w=round(self.peak_power, 3),
            avg_power_w=round(avg_power, 3),
            total_energy_wh=round(self.total_energy_wh, 4),
            last_updated=latest["timestamp"],
        )

    def clear(self) -> None:
        """Clear internal buffer and counters."""
        self.buffer.clear()
        self.peak_power = 0.0
        self.total_energy_wh = 0.0


# Shared singleton instance for API usage
hardware_receiver = ESP32DataReceiver()
