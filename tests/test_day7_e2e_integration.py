"""Day 7: Final System Integration, Full Pipeline E2E & Competition Validation.

Validates:
1. End-to-End GreenCompute Pipeline:
   - Workload Registration -> ML Resource Prediction -> Carbon Footprint Quantification
   - Constrained Optimization (SLA filter) -> Carbon-Aware Temporal Scheduling
   - Physical Edge Hardware Telemetry Ingestion -> Telemetry Aggregation & History
2. Competition Submission Deliverables:
   - OAIC 2026 Executive Summary (4-Question Framework, CEA v19 Grid Model)
   - 10-Slide Pitch Deck (Problem, Solution, Benchmarks, Business Case)
   - 3-Minute Timed Presentation Video Script
   - C4 Architecture Model (Context, Container, Component, Code in Mermaid)
   - Carbon Accounting Methodology (Scope 2, Diurnal Curve, Uncertainty Budgeting)
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict
import pytest
from fastapi.testclient import TestClient

PROJECT_ROOT = Path(__file__).resolve().parent.parent


class TestEndToEndPipeline:
    """Full lifecycle validation simulating an end-to-end user and edge hardware workflow."""

    def test_complete_workload_lifecycle_e2e(self, client: TestClient):
        # 1. Register a new AI inference workload
        workload_payload = {
            "name": "E2E-Vision-Production-Job",
            "model_type": "computer_vision",
            "region": "odisha",
            "accuracy_min": 0.80,
            "latency_max_ms": 150.0,
            "memory_max_mb": 450.0,
            "deadline_hours": 12.0,
        }
        wl_resp = client.post("/api/workloads", json=workload_payload)
        assert wl_resp.status_code == 200
        plan = wl_resp.json()
        assert "workload_id" in plan
        assert plan["workload_name"] == workload_payload["name"]
        assert "recommended_model" in plan
        assert "schedule_recommendation" in plan

        # 2. Query ML Resource Predictor for candidate configuration
        pred_payload = {
            "model_name": "mobilenetv3",
            "precision": "onnx",
            "batch_size": 32,
            "samples": 1000,
            "region": "odisha",
        }
        pred_resp = client.post("/api/predict", json=pred_payload)
        assert pred_resp.status_code == 200
        pred_data = pred_resp.json()
        assert pred_data["predicted_energy_wh"] > 0
        assert pred_data["predicted_latency_ms"] > 0
        assert pred_data["predicted_co2e_grams"] > 0
        assert pred_data["carbon_intensity_kg_kwh"] > 0

        # 3. Calculate Regional Carbon Footprint across India & global grids
        calc_payload = {
            "energy_wh": pred_data["predicted_energy_wh"],
            "region": "odisha",
            "hour_of_day": 13,  # Solar peak
        }
        calc_resp = client.post("/api/carbon/calculate", json=calc_payload)
        assert calc_resp.status_code == 200
        calc_data = calc_resp.json()
        assert calc_data["co2e_grams"] > 0
        assert "regional_comparison" in calc_data

        # 4. Run Constrained Model Optimizer
        opt_payload = {
            "model_architecture": "mlp_classifier",
            "input_dim": 64,
            "hidden_dim": 128,
            "output_dim": 10,
            "accuracy_min": 0.82,
            "latency_max_ms": 120.0,
            "memory_max_mb": 350.0,
            "region": "odisha",
        }
        opt_resp = client.post("/api/optimize", json=opt_payload)
        assert opt_resp.status_code == 200
        opt_data = opt_resp.json()
        assert "selected_config" in opt_data
        selected = opt_data["selected_config"]
        assert selected["feasible"] is True
        assert selected["accuracy"] >= opt_payload["accuracy_min"]
        assert selected["latency_ms"] <= opt_payload["latency_max_ms"]

        # 5. Carbon-Aware Temporal Scheduling for batch execution
        sched_payload = {
            "energy_wh": selected["energy_wh"] or 25.0,
            "duration_hours": 2.0,
            "deadline_hours": 24.0,
            "region": "odisha",
        }
        sched_resp = client.post("/api/schedule/recommend", json=sched_payload)
        assert sched_resp.status_code == 200
        sched_data = sched_resp.json()
        assert "optimal_window" in sched_data
        assert "immediate_window" in sched_data
        assert sched_data["emissions_saved_pct"] >= 0.0

        # 6. Ingest Physical Edge Telemetry (ESP32 + INA219 current sensor)
        sensor_payload = {
            "voltage": 5.04,
            "current": 1350.0,
            "power": 6.804,
            "energy": 0.0142,
            "device_id": "esp32-ina219-bench-node",
        }
        hw_resp = client.post("/api/hardware/telemetry", json=sensor_payload)
        assert hw_resp.status_code == 201
        hw_data = hw_resp.json()
        assert hw_data["status"] == "success"
        assert hw_data["reading"]["voltage"] == sensor_payload["voltage"]

        # 7. Query Hardware Status, Summary, and History
        latest_resp = client.get("/api/hardware/latest")
        assert latest_resp.status_code == 200
        assert latest_resp.json()["device_id"] == "esp32-ina219-bench-node"

        summary_resp = client.get("/api/hardware/summary")
        assert summary_resp.status_code == 200
        assert summary_resp.json()["sample_count"] >= 1

        history_resp = client.get("/api/hardware/history?limit=10")
        assert history_resp.status_code == 200
        assert len(history_resp.json()) >= 1

        # 8. Verify Benchmark Aggregated Summary
        bench_summary_resp = client.get("/api/benchmarks/summary")
        assert bench_summary_resp.status_code == 200
        assert "benchmarks" in bench_summary_resp.json()


class TestCompetitionSubmissionDeliverables:
    """Validates presence, structure, and integrity of OAIC 2026 competition package."""

    def test_executive_summary_content(self):
        doc_path = PROJECT_ROOT / "docs" / "competition" / "OAIC_2026_EXECUTIVE_SUMMARY.md"
        assert doc_path.exists(), f"Missing file: {doc_path}"
        content = doc_path.read_text(encoding="utf-8")

        # Must answer 4-Question Framework and Executive Summary
        assert "Executive Summary" in content
        assert "4-Question Evaluation Framework" in content
        assert "Q1: How do you measure real compute energy?" in content
        assert "Q2: What quantifiable reductions were achieved?" in content
        assert "India" in content or "Odisha" in content
        assert "MobileNet" in content or "ResNet" in content

    def test_pitch_deck_content(self):
        deck_path = PROJECT_ROOT / "docs" / "competition" / "PITCH_DECK.md"
        assert deck_path.exists(), f"Missing file: {deck_path}"
        content = deck_path.read_text(encoding="utf-8")

        # Must include presentation slides and speaker notes
        assert "Slide 1" in content or "SLIDE 1" in content
        assert "GreenCompute" in content

    def test_video_script_timing(self):
        script_path = PROJECT_ROOT / "docs" / "competition" / "THREE_MINUTE_VIDEO_SCRIPT.md"
        assert script_path.exists(), f"Missing file: {script_path}"
        content = script_path.read_text(encoding="utf-8")

        # Must be structured timed script
        assert "0:00" in content or "00:00" in content or "Speaker" in content or "Visual" in content

    def test_c4_architecture_diagrams(self):
        c4_path = PROJECT_ROOT / "docs" / "architecture" / "c4_model.md"
        assert c4_path.exists(), f"Missing file: {c4_path}"
        content = c4_path.read_text(encoding="utf-8")

        # Must contain Mermaid diagram blocks
        assert "```mermaid" in content
        assert "System Context" in content or "Container" in content

    def test_carbon_accounting_methodology(self):
        method_path = PROJECT_ROOT / "docs" / "methodology" / "carbon_accounting.md"
        assert method_path.exists(), f"Missing file: {method_path}"
        content = method_path.read_text(encoding="utf-8")

        # Must reference official standards
        assert "Scope 2" in content or "GHG Protocol" in content
        assert "0.82" in content or "CEA" in content
