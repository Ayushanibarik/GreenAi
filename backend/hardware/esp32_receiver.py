"""ESP32DataReceiver — Ingestion and processing of high-frequency power data from ESP32 + INA219 sensor module."""

from __future__ import annotations

from collections import deque
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from typing import Any, Deque, Dict, List, Optional


@dataclass
class ESP32Payload:
    voltage: Optional[float] = None  # Volts (V)
    current: Optional[float] = None  # Milliamps (mA) or Amps (A)
    power: Optional[float] = None    # Watts (W)
    energy: Optional[float] = None   # Accumulated energy (Wh or Joules)
    voltage_v: Optional[float] = None
    current_ma: Optional[float] = None
    power_w: Optional[float] = None
    energy_wh: Optional[float] = None
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
        # Resolve fields from either standard or suffixed naming
        voltage_val = payload.voltage if payload.voltage is not None else (
            payload.voltage_v if payload.voltage_v is not None else 5.0
        )
        current_val = payload.current if payload.current is not None else (
            payload.current_ma if payload.current_ma is not None else 0.0
        )
        power_val = payload.power if payload.power is not None else (
            payload.power_w if payload.power_w is not None else 0.0
        )
        energy_val = payload.energy if payload.energy is not None else (
            payload.energy_wh if payload.energy_wh is not None else 0.0
        )

        # Normalize current to Amps if provided in mA (> 50 typically means mA for micro systems)
        current_a = current_val
        if abs(current_val) > 50.0:  # Value is in mA
            current_a = current_val / 1000.0

        # Calculate power if missing or 0
        calculated_power = power_val
        if calculated_power <= 0.0 and voltage_val > 0:
            calculated_power = voltage_val * current_a

        record = {
            "voltage": round(float(voltage_val), 3),
            "voltage_v": round(float(voltage_val), 3),
            "current": round(float(current_a), 4),
            "current_ma": round(float(current_val if abs(current_val) > 50.0 else current_val * 1000.0), 2),
            "power": round(float(calculated_power), 3),
            "power_w": round(float(calculated_power), 3),
            "energy": round(float(energy_val), 4),
            "energy_wh": round(float(energy_val), 4),
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
