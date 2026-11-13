"""Day 4 Verification: Constrained Pareto Optimizer & ML Resource Predictor."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from backend.main import app
from ml.prediction.resource_predictor import MLResourcePredictor


class TestMLResourcePredictorDirect:
    """Validate ML Resource Predictor model inference, feature extraction, and physics-informed bounds."""

    def test_predictor_feature_extraction(self):
        predictor = MLResourcePredictor()
        features = predictor.extract_features({
            "model_name": "resnet18",
            "precision": "fp32",
            "batch_size": 32,
            "input_size": 32,
            "is_gpu": 0,
        })
        assert len(features) == 5
        assert features[0] == 11.2  # 11.2M params for resnet18
        assert features[1] == 32.0  # input_size 32
        assert features[2] == 32.0  # fp32 -> 32 bits
        assert features[3] == 32.0  # batch size
        assert features[4] == 0.0   # CPU

    def test_predictor_default_model_inference(self):
        predictor = MLResourcePredictor.load_default()
        assert predictor._fitted is True

        pred = predictor.predict({
            "model_name": "mobilenetv3",
            "precision": "int8",
            "batch_size": 16,
            "is_gpu": 0,
        })
        assert "energy_wh" in pred
        assert "latency_ms" in pred
        assert "memory_mb" in pred
        assert pred["energy_wh"] > 0.0
        assert pred["latency_ms"] > 0.0
        assert pred["memory_mb"] > 0.0

    def test_predictor_batch_size_scaling(self):
        predictor = MLResourcePredictor.load_default()
        pred_b1 = predictor.predict({"model_name": "resnet18", "precision": "fp32", "batch_size": 1})
        pred_b64 = predictor.predict({"model_name": "resnet18", "precision": "fp32", "batch_size": 64})

        # Batch 64 overall uses more energy than batch 1
        assert pred_b64["energy_wh"] >= pred_b1["energy_wh"]


class TestOptimizerAndPredictorEndpoints:
    """Validate FastAPI endpoints for Day 4 ML prediction and constrained optimization."""

    def test_predict_endpoint_contract(self):
        client = TestClient(app)
        payload = {
            "model_name": "resnet18",
            "precision": "fp32",
            "batch_size": 32,
            "samples": 500,
            "region": "odisha",
        }
        res = client.post("/api/predict", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert "predicted_energy_wh" in data
        assert "predicted_latency_ms" in data
        assert "predicted_peak_memory_mb" in data
        assert "predicted_co2e_grams" in data
        assert data["predicted_energy_wh"] > 0.0

    def test_optimizer_recommend_endpoint(self):
        client = TestClient(app)
        payload = {
            "model_architecture": "resnet18",
            "accuracy_min": 0.08,
            "latency_max_ms": 250.0,
            "memory_max_mb": 500.0,
            "region": "odisha",
        }
        res = client.post("/api/optimizer/recommend", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert "selected_config" in data
        assert "candidates" in data
        assert len(data["candidates"]) > 0
        assert "energy_saved_pct" in data
        assert "co2e_saved_grams" in data
