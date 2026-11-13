"""Day 7 Verification: Full End-to-End System Integration and Submission Readiness."""

from __future__ import annotations

import json
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

from backend.main import app
from backend.database.models import Workload
from backend.profiler.energy_profiler import EnergyProfiler
from ml.prediction.resource_predictor import MLResourcePredictor


class TestDay7EndToEndIntegration:
    """Verify cohesive end-to-end workflow connecting all 6 core modules and 7 days of deliverables."""

    def test_full_pipeline_orchestration_cycle(self):
        client = TestClient(app)

        # Step 1: Health and System Readiness (Day 1)
        res_health = client.get("/health")
        assert res_health.status_code == 200
        assert res_health.json()["status"] == "healthy"

        # Step 2: Telemetry Snapshot and Hardware Profiling (Day 2)
        profiler = EnergyProfiler()
        snapshot = profiler.snapshot()
        assert snapshot.cpu_percent >= 0.0
        assert snapshot.power_w > 0.0
        assert snapshot.gpu_memory_used_mb >= 0.0

        # Step 3: Real Benchmarks and Empirical Data (Day 3)
        res_summary = client.get("/api/benchmarks/summary")
        assert res_summary.status_code == 200
        bench_data = res_summary.json()
        assert bench_data["total_benchmarks"] >= 1

        # Step 4: ML Prediction and Constrained Optimization (Day 4)
        pred_res = client.post(
            "/api/predict",
            json={
                "model_name": "resnet18",
                "precision": "int8",
                "batch_size": 32,
                "samples": 100,
                "region": "odisha",
            },
        )
        assert pred_res.status_code == 200
        assert pred_res.json()["predicted_energy_wh"] > 0.0

        opt_res = client.post(
            "/api/optimize",
            json={
                "model_architecture": "resnet18",
                "accuracy_min": 0.08,
                "latency_max_ms": 250.0,
                "memory_max_mb": 500.0,
                "region": "odisha",
            },
        )
        assert opt_res.status_code == 200
        opt_data = opt_res.json()
        assert opt_data["selected_config"]["config_name"] in ["FP32", "FP16", "INT8", "ONNX"]
        assert opt_data["energy_saved_pct"] >= 0.0

        # Step 5: Dashboard and Static Asset Integrity (Day 5)
        dist_html = Path("frontend/dist/index.html")
        assert dist_html.exists()
        assert dist_html.stat().st_size > 200

        # Step 6: Edge Hardware Telemetry & Carbon Scheduling (Day 6)
        hw_post = client.post(
            "/api/hardware/telemetry",
            json={
                "voltage": 5.01,
                "current": 480.0,
                "power": 2.4048,
                "energy": 0.12,
                "device_id": "esp32-day7-integration",
            },
        )
        assert hw_post.status_code in (200, 201)

        sched_res = client.post(
            "/api/schedule/recommend",
            json={
                "energy_wh": 250.0,
                "duration_hours": 1.0,
                "deadline_hours": 24.0,
                "region": "odisha",
            },
        )
        assert sched_res.status_code == 200
        sched_data = sched_res.json()
        assert "optimal_window" in sched_data
        assert sched_data["emissions_saved_g"] >= 0.0

        # Step 7: Live WebSocket Telemetry Broadcast (Day 7)
        with client.websocket_connect("/ws/telemetry") as ws:
            event = ws.receive_json()
            assert event["type"] == "telemetry_tick"
            assert "system_power_w" in event
            assert "effective_power_w" in event


class TestDay7CompetitionDeliverables:
    """Validate completeness and integrity of OAIC 2026 competition documentation."""

    def test_executive_summary_exists_and_comprehensive(self):
        doc = Path("docs/competition/OAIC_2026_EXECUTIVE_SUMMARY.md")
        assert doc.exists()
        content = doc.read_text(encoding="utf-8")
        assert "OAIC 2026" in content
        assert "Odisha" in content
        assert "4-Question Evaluation Framework" in content
        assert "Dual-Layer Telemetry" in content or "DUAL-LAYER" in content
        assert len(content.splitlines()) >= 150

    def test_pitch_deck_structure(self):
        doc = Path("docs/competition/PITCH_DECK.md")
        assert doc.exists()
        content = doc.read_text(encoding="utf-8")
        assert "Slide 1" in content or "SLIDE 1" in content
        assert "Slide 10" in content or "SLIDE 10" in content
        assert len(content.splitlines()) >= 100

    def test_video_script_timing(self):
        doc = Path("docs/competition/THREE_MINUTE_VIDEO_SCRIPT.md")
        assert doc.exists()
        content = doc.read_text(encoding="utf-8")
        assert "0:00" in content
        assert "3:00" in content or "2:45" in content or "180" in content

