"""Day 6 Verification: Edge Hardware Telemetry (ESP32/INA219) & Carbon-Aware Grid Scheduler."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
import pytest
from fastapi.testclient import TestClient

from backend.main import app
from backend.scheduler.carbon_scheduler import CarbonAwareScheduler
from hardware.simulator import INA219HardwareModel


class TestINA219HardwarePhysics:
    """Validate physical electrical models for ESP32 + INA219 current/power telemetry."""

    def test_ina219_sensor_sampling_and_slew(self):
        model = INA219HardwareModel(
            nominal_voltage_v=5.0,
            idle_current_ma=150.0,
            peak_current_ma=2200.0,
        )
        # Sample at idle
        sample_idle = model.sample(dt=1.0)
        assert 4.5 <= sample_idle["voltage_v"] <= 5.1
        assert 100.0 <= sample_idle["current_ma"] <= 300.0
        assert sample_idle["power_w"] > 0.5

        # Switch to peak inference workload
        model.set_workload_state(True)
        # Advance 2 seconds
        sample_peak = model.sample(dt=2.0)
        assert sample_peak["current_ma"] > sample_idle["current_ma"]
        assert sample_peak["power_w"] > sample_idle["power_w"]
        # Shunt voltage drop must be proportional to current
        assert sample_peak["shunt_voltage_mv"] > sample_idle["shunt_voltage_mv"]

    def test_energy_accumulation(self):
        model = INA219HardwareModel()
        dt = 1.0
        sample = model.sample(dt)
        power_w = sample["power_w"]
        energy_wh = (power_w * dt) / 3600.0
        assert energy_wh > 0.0


class TestHardwareTelemetryEndpoints:
    """Validate FastAPI hardware telemetry ingestion and aggregation."""

    def test_hardware_telemetry_pipeline(self):
        client = TestClient(app)
        reading = {
            "voltage": 5.02,
            "current": 620.0,
            "power": 3.1124,
            "energy": 0.0864,
            "device_id": "esp32-ina219-node-01",
        }
        res_post = client.post("/api/hardware/telemetry", json=reading)
        assert res_post.status_code in (200, 201)
        assert res_post.json()["status"] in ("ok", "success")

        res_latest = client.get("/api/hardware/latest")
        assert res_latest.status_code == 200
        latest_data = res_latest.json()
        assert latest_data["device_id"] == "esp32-ina219-node-01"
        assert abs(latest_data["voltage"] - 5.02) < 0.01

        res_summary = client.get("/api/hardware/summary")
        assert res_summary.status_code == 200
        summary_data = res_summary.json()
        assert summary_data["sample_count"] >= 1
        assert "avg_power_w" in summary_data


class TestCarbonAwareScheduler:
    """Validate Carbon-Aware temporal workload dispatching algorithms."""

    def test_intensity_forecast_diurnal_variation(self):
        scheduler = CarbonAwareScheduler()
        forecast = scheduler.get_intensity_forecast(hours_ahead=24, region="odisha")
        assert len(forecast) == 24
        intensities = [step["carbon_intensity"] for step in forecast]
        # Diurnal curve must not be completely flat (solar midday drop vs evening peak)
        assert max(intensities) > min(intensities)

    def test_recommend_window_carbon_shifting(self):
        scheduler = CarbonAwareScheduler()
        # Start during evening peak (19:00 UTC) with 24-hour deadline
        start = datetime(2026, 11, 13, 19, 0, tzinfo=timezone.utc)
        deadline = start + timedelta(hours=24)

        rec = scheduler.recommend_window(
            energy_wh=1000.0,
            duration_hours=2.0,
            deadline=deadline,
            region="odisha",
            start_time=start,
        )
        assert rec.optimal_window is not None
        assert rec.immediate_window is not None
        assert rec.emissions_saved_g >= 0.0
        assert rec.emissions_saved_pct >= 0.0

    def test_scheduler_api_endpoints(self):
        client = TestClient(app)
        # 1. Forecast endpoint
        res_fc = client.get("/api/scheduler/forecast?hours=24&region=odisha")
        assert res_fc.status_code == 200
        forecast_data = res_fc.json()
        assert isinstance(forecast_data, list)
        assert len(forecast_data) == 24

        # 2. Recommendation endpoint
        payload = {
            "energy_wh": 500.0,
            "duration_hours": 1.5,
            "deadline_hours": 18.0,
            "region": "odisha",
        }
        res_rec = client.post("/api/scheduler/recommend", json=payload)
        assert res_rec.status_code == 200
        data = res_rec.json()
        assert "optimal_window" in data
        assert "emissions_saved_g" in data
