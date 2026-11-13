"""API integration tests for GreenCompute AI backend endpoints.

Validates all REST endpoints:
- GET /health -> 200 OK
- POST /api/workloads -> create / orchestrate workload
- GET /api/workloads -> list sample workloads
- POST /api/predict -> ML resource prediction returns positive metrics
- POST /api/optimize -> constrained recommendation honors accuracy and latency ceiling
- GET /api/carbon/grid-intensity -> returns regional intensity (India/Odisha)
- POST /api/schedule/recommend -> returns optimal green execution window
- POST /api/hardware/telemetry -> stores sensor readings & broadcasts
"""

from __future__ import annotations

from typing import Any, Dict
import pytest
from fastapi.testclient import TestClient


class TestSystemEndpoints:
    """Core health and metadata endpoints."""

    def test_root_endpoint(self, client: TestClient):
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["service"] == "GreenCompute AI Backend"
        assert data["status"] == "operational"
        assert "features" in data
        assert len(data["features"]) > 0

    def test_health_check(self, client: TestClient):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data
        assert data["default_carbon_intensity"] > 0
        assert "gpu_available" in data

    def test_api_health_alias(self, client: TestClient):
        response = client.get("/api/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"


class TestWorkloadEndpoints:
    """Workload creation, orchestration, and listing."""

    def test_list_sample_workloads(self, client: TestClient):
        response = client.get("/api/workloads")
        assert response.status_code == 200
        workloads = response.json()
        assert isinstance(workloads, list)
        assert len(workloads) >= 3
        first = workloads[0]
        assert "id" in first
        assert "name" in first
        assert "co2e_reduction_pct" in first
        assert first["co2e_reduction_pct"] > 0

    def test_run_workload_orchestration(self, client: TestClient, mock_workload_request: Dict[str, Any]):
        response = client.post("/api/workloads", json=mock_workload_request)
        assert response.status_code == 200
        plan = response.json()
        assert "workload_id" in plan
        assert plan["workload_name"] == mock_workload_request["name"]
        assert "baseline_metrics" in plan
        assert "candidate_benchmarks" in plan
        assert "recommended_model" in plan
        assert "schedule_recommendation" in plan
        assert plan["energy_saved_pct"] >= 0.0


class TestMLPredictorEndpoint:
    """ML resource predictor endpoint."""

    def test_predict_resources_valid_positive_values(self, client: TestClient, mock_predict_request: Dict[str, Any]):
        response = client.post("/api/predict", json=mock_predict_request)
        assert response.status_code == 200
        data = response.json()

        assert data["model_name"] == "mobilenetv3"
        assert data["precision"] == "int8"
        assert data["batch_size"] == 32

        # Verify all predicted values are strictly positive
        assert data["predicted_latency_ms"] > 0.0, "Latency must be positive"
        assert data["predicted_throughput_rps"] > 0.0, "Throughput must be positive"
        assert data["predicted_energy_wh"] > 0.0, "Energy Wh must be positive"
        assert data["predicted_peak_memory_mb"] > 0.0, "Peak memory must be positive"
        assert data["carbon_intensity_kg_kwh"] > 0.0, "Carbon intensity must be positive"
        assert data["predicted_co2e_grams"] > 0.0, "CO2e emissions must be positive"
        assert 0.0 <= data["confidence_score"] <= 1.0, "Confidence score must be in [0, 1]"

    def test_predict_resnet_fp32(self, client: TestClient):
        payload = {
            "model_name": "resnet18",
            "precision": "fp32",
            "batch_size": 64,
            "samples": 1000,
            "region": "india",
        }
        response = client.post("/api/predict", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["predicted_latency_ms"] > 0.0
        assert data["predicted_energy_wh"] > 0.0


class TestOptimizerEndpoint:
    """Constrained model optimization."""

    def test_optimize_honors_accuracy_and_latency_constraints(
        self, client: TestClient, mock_optimize_request: Dict[str, Any]
    ):
        response = client.post("/api/optimize", json=mock_optimize_request)
        assert response.status_code == 200
        data = response.json()

        assert "candidates" in data
        assert len(data["candidates"]) > 0
        assert "selected_config" in data

        selected = data["selected_config"]
        # Invariant: Selected model must be feasible and meet the constraints
        assert selected["feasible"] is True
        assert selected["accuracy"] >= mock_optimize_request["accuracy_min"]
        assert selected["latency_ms"] <= mock_optimize_request["latency_max_ms"]
        assert selected["memory_mb"] <= mock_optimize_request["memory_max_mb"]

        # Invariant: Metrics must be non-negative
        assert selected["energy_wh"] >= 0.0
        assert selected["co2e_grams"] >= 0.0


class TestCarbonIntelligenceEndpoints:
    """Carbon intensity and regional emissions."""

    def test_get_carbon_grid_intensity(self, client: TestClient):
        response = client.get("/api/carbon/grid-intensity")
        assert response.status_code == 200
        data = response.json()
        assert "current_intensity_kg_kwh" in data
        intensities = data["current_intensity_kg_kwh"]

        # Must report India and Odisha regional intensities
        assert "odisha" in intensities or "india" in intensities
        if "odisha" in intensities:
            assert intensities["odisha"] > 0.0
        if "india" in intensities:
            assert intensities["india"] > 0.0

        assert "tod_multipliers" in data

    def test_carbon_calculate(self, client: TestClient):
        payload = {
            "energy_wh": 50.0,
            "region": "odisha",
            "hour_of_day": 14,
        }
        response = client.post("/api/carbon/calculate", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["energy_wh"] == 50.0
        assert data["co2e_grams"] > 0.0
        assert data["co2e_kg"] > 0.0
        assert "regional_comparison" in data
        assert "scenario_projections" in data


class TestSchedulerEndpoints:
    """Carbon-aware scheduler."""

    def test_schedule_recommend_optimal_green_window(
        self, client: TestClient, mock_schedule_request: Dict[str, Any]
    ):
        response = client.post("/api/schedule/recommend", json=mock_schedule_request)
        assert response.status_code == 200
        data = response.json()

        assert "optimal_window" in data
        assert "immediate_window" in data
        assert "emissions_saved_g" in data
        assert "emissions_saved_pct" in data

        # Optimal emissions must be <= immediate emissions
        optimal = data["optimal_window"]
        immediate = data["immediate_window"]
        assert optimal["estimated_emissions_g"] <= immediate["estimated_emissions_g"] + 1e-4
        assert data["emissions_saved_pct"] >= 0.0

    def test_schedule_forecast(self, client: TestClient):
        response = client.get("/api/schedule/forecast?region=odisha&hours=24")
        assert response.status_code == 200
        forecast = response.json()
        assert isinstance(forecast, list)
        assert len(forecast) == 24
        assert "hour" in forecast[0]
        assert "carbon_intensity" in forecast[0]


class TestHardwareTelemetryEndpoints:
    """ESP32 + INA219 hardware telemetry ingestion and querying."""

    def test_hardware_telemetry_ingestion(self, client: TestClient, mock_telemetry_reading: Dict[str, Any]):
        response = client.post("/api/hardware/telemetry", json=mock_telemetry_reading)
        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "success"
        assert "reading" in data
        assert data["reading"]["voltage"] == mock_telemetry_reading["voltage"]
        assert abs(data["reading"]["power"] - mock_telemetry_reading["power"]) < 0.01

    def test_get_latest_hardware_reading(self, client: TestClient):
        response = client.get("/api/hardware/latest")
        assert response.status_code == 200
        data = response.json()
        assert "voltage" in data or "message" in data

    def test_get_hardware_summary(self, client: TestClient):
        response = client.get("/api/hardware/summary")
        assert response.status_code == 200
        data = response.json()
        assert "sample_count" in data
        assert "avg_power_w" in data
        assert "total_energy_wh" in data


class TestBenchmarkSummaryEndpoints:
    """Benchmark reports and summaries."""

    def test_get_benchmarks_summary(self, client: TestClient):
        response = client.get("/api/benchmarks/summary")
        assert response.status_code == 200
        data = response.json()
        assert "benchmarks" in data
        assert isinstance(data["benchmarks"], list)
