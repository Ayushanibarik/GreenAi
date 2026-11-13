"""Machine Learning Resource Predictor for GreenCompute AI.

Predicts energy consumption (Wh), inference latency (ms), and peak memory (MB)
from model configuration features using ensemble regression (RandomForest/GradientBoosting).
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any

import numpy as np

try:
    from sklearn.ensemble import RandomForestRegressor
    from sklearn.metrics import mean_squared_error, r2_score
    import joblib
    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False
    RandomForestRegressor = None  # type: ignore[assignment,misc]
    joblib = None  # type: ignore[assignment]


DEFAULT_SAVED_MODEL_PATH = Path(__file__).resolve().parent / "saved_models" / "predictor.joblib"


class MLResourcePredictor:
    """Ensemble regression predictor for inference energy, latency, and memory.

    Features:
        [model_params_m, input_size, precision_bits, batch_size, is_gpu]
    Targets:
        [energy_wh, mean_latency_ms, peak_memory_mb]
    """

    FEATURE_NAMES = [
        "model_params_m",
        "input_size",
        "precision_bits",
        "batch_size",
        "is_gpu",
    ]

    PRECISION_BITS_MAP = {
        "fp32": 32,
        "float32": 32,
        "fp16": 16,
        "float16": 16,
        "half": 16,
        "int8": 8,
        "qint8": 8,
        "onnx": 32,
        "onnx_fp32": 32,
        "onnx_fp16": 16,
        "onnx_int8": 8,
    }

    MODEL_PARAM_MAP = {
        "resnet18": 11.2,
        "resnet-18": 11.2,
        "resnet50": 25.6,
        "mobilenetv3": 2.5,
        "mobilenetv3_small": 2.5,
        "mobilenet_v3_small": 2.5,
        "mobilenetv3_large": 5.4,
        "efficientnet_b0": 5.3,
    }

    def __init__(self, n_estimators: int = 100, random_state: int = 42) -> None:
        if not HAS_SKLEARN:
            raise ImportError("scikit-learn and joblib are required for MLResourcePredictor.")

        self.energy_model = RandomForestRegressor(
            n_estimators=n_estimators, random_state=random_state, min_samples_leaf=1
        )
        self.latency_model = RandomForestRegressor(
            n_estimators=n_estimators, random_state=random_state, min_samples_leaf=1
        )
        self.memory_model = RandomForestRegressor(
            n_estimators=n_estimators, random_state=random_state, min_samples_leaf=1
        )
        self._fitted = False
        self.metrics: dict[str, float] = {}

    def extract_features(self, config: dict[str, Any]) -> list[float]:
        """Extract [model_params_m, input_size, precision_bits, batch_size, is_gpu]."""
        # 1. model_params_m
        if "model_params_m" in config:
            params = float(config["model_params_m"])
        elif "param_count_m" in config:
            params = float(config["param_count_m"])
        else:
            model_name = str(config.get("model_name", config.get("model", "resnet18"))).lower()
            params = self.MODEL_PARAM_MAP.get(model_name, 11.2)

        # 2. input_size
        input_size = float(config.get("input_size", config.get("image_size", 32)))

        # 3. precision_bits
        precision = config.get("precision", "fp32")
        if isinstance(precision, (int, float)):
            precision_bits = float(precision)
        else:
            precision_bits = float(self.PRECISION_BITS_MAP.get(str(precision).lower(), 32))

        # 4. batch_size
        batch_size = float(config.get("batch_size", 64))

        # 5. is_gpu
        is_gpu_val = config.get("is_gpu")
        if is_gpu_val is None:
            device = str(config.get("device", "cpu")).lower()
            is_gpu = 1.0 if "cuda" in device or "gpu" in device else 0.0
        else:
            is_gpu = 1.0 if is_gpu_val else 0.0

        return [params, input_size, precision_bits, batch_size, is_gpu]

    def _prepare_matrices(
        self, records: list[dict[str, Any]]
    ) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        X_list = []
        y_energy = []
        y_lat = []
        y_mem = []

        for r in records:
            X_list.append(self.extract_features(r))
            y_energy.append(float(r.get("energy_wh", 0.0)))
            y_lat.append(float(r.get("mean_latency_ms", r.get("latency_ms", 0.0))))
            y_mem.append(float(r.get("peak_memory_mb", r.get("memory_mb", 0.0))))

        return (
            np.array(X_list, dtype=np.float64),
            np.array(y_energy, dtype=np.float64),
            np.array(y_lat, dtype=np.float64),
            np.array(y_mem, dtype=np.float64),
        )

    def train(self, benchmark_records: list[dict[str, Any]]) -> dict[str, float]:
        """Train models on benchmark records and return R2 and RMSE metrics."""
        if len(benchmark_records) < 3:
            raise ValueError("Need at least 3 benchmark records to train MLResourcePredictor.")

        X, y_energy, y_lat, y_mem = self._prepare_matrices(benchmark_records)

        self.energy_model.fit(X, y_energy)
        self.latency_model.fit(X, y_lat)
        self.memory_model.fit(X, y_mem)
        self._fitted = True

        pred_energy = self.energy_model.predict(X)
        pred_lat = self.latency_model.predict(X)
        pred_mem = self.memory_model.predict(X)

        self.metrics = {
            "energy_r2": float(r2_score(y_energy, pred_energy)),
            "latency_r2": float(r2_score(y_lat, pred_lat)),
            "memory_r2": float(r2_score(y_mem, pred_mem)),
            "energy_rmse": float(np.sqrt(mean_squared_error(y_energy, pred_energy))),
            "latency_rmse": float(np.sqrt(mean_squared_error(y_lat, pred_lat))),
            "memory_rmse": float(np.sqrt(mean_squared_error(y_mem, pred_mem))),
            "num_samples": len(benchmark_records),
        }
        return self.metrics

    def predict(self, config: dict[str, Any]) -> dict[str, float]:
        """Predict energy (Wh), mean latency (ms), and peak memory (MB) for a config."""
        if not self._fitted:
            # Try to auto-load saved model if available
            if DEFAULT_SAVED_MODEL_PATH.exists():
                self.load(DEFAULT_SAVED_MODEL_PATH)
            else:
                # Pre-train with synthetic data on the fly
                self.pretrain_with_synthetic()

        feats = np.array([self.extract_features(config)], dtype=np.float64)
        pred_energy = float(self.energy_model.predict(feats)[0])
        pred_lat = float(self.latency_model.predict(feats)[0])
        pred_mem = float(self.memory_model.predict(feats)[0])

        return {
            "predicted_energy_wh": max(round(pred_energy, 6), 0.0),
            "predicted_latency_ms": max(round(pred_lat, 2), 0.1),
            "predicted_memory_mb": max(round(pred_mem, 1), 10.0),
        }

    def save(self, path: str | Path | None = None) -> Path:
        """Save trained models to disk."""
        target_path = Path(path) if path else DEFAULT_SAVED_MODEL_PATH
        target_path.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            "energy_model": self.energy_model,
            "latency_model": self.latency_model,
            "memory_model": self.memory_model,
            "metrics": self.metrics,
            "fitted": self._fitted,
        }
        joblib.dump(payload, target_path)
        return target_path

    def load(self, path: str | Path | None = None) -> None:
        """Load trained models from disk."""
        target_path = Path(path) if path else DEFAULT_SAVED_MODEL_PATH
        if not target_path.exists():
            raise FileNotFoundError(f"Model file not found at {target_path}")
        payload = joblib.load(target_path)
        self.energy_model = payload["energy_model"]
        self.latency_model = payload["latency_model"]
        self.memory_model = payload["memory_model"]
        self.metrics = payload.get("metrics", {})
        self._fitted = payload.get("fitted", True)

    @classmethod
    def generate_synthetic_records(cls, n_samples: int = 300) -> list[dict[str, Any]]:
        """Generate realistic synthetic benchmark records spanning models, precisions, batch sizes."""
        rng = np.random.RandomState(42)
        records: list[dict[str, Any]] = []

        models_pool = [
            ("mobilenetv3", 2.5),
            ("resnet18", 11.2),
            ("resnet50", 25.6),
        ]
        precisions = ["fp32", "fp16", "int8", "onnx"]
        batch_sizes = [1, 8, 16, 32, 64, 128]
        devices = ["cpu", "cuda"]

        for _ in range(n_samples):
            model_name, params_m = models_pool[rng.randint(len(models_pool))]
            prec = precisions[rng.randint(len(precisions))]
            batch_sz = batch_sizes[rng.randint(len(batch_sizes))]
            dev = devices[rng.choice([0, 1], p=[0.7, 0.3])]
            is_gpu = 1.0 if dev == "cuda" else 0.0

            # Compute precision scaling
            prec_factor = {"fp32": 1.0, "fp16": 0.65, "int8": 0.40, "onnx": 0.70}[prec]

            # Device speedup
            gpu_factor = 0.25 if is_gpu else 1.0

            # Base latency per sample
            base_latency_per_sample = (params_m / 10.0) * 0.8 * prec_factor * gpu_factor
            latency_ms = (base_latency_per_sample * batch_sz * 10.0) * (1.0 + rng.uniform(-0.08, 0.08))
            latency_ms = max(latency_ms, 2.0)

            # Memory: base overhead + model weights + activation memory
            weight_mb = params_m * (32 if prec in ["fp32", "onnx"] else (16 if prec == "fp16" else 8)) / 8.0
            act_mb = batch_sz * 0.8 * (0.5 if prec != "fp32" else 1.0)
            peak_memory_mb = 150.0 + weight_mb + act_mb + rng.uniform(5.0, 25.0)

            # Energy (Wh): Power (Watts) * time (hours)
            # Typical CPU power: 35-65W, GPU power: 60-150W
            power_w = (100.0 if is_gpu else 45.0) * (1.0 + (batch_sz / 128.0) * 0.3)
            time_hours = (latency_ms / 1000.0) / 3600.0
            energy_wh = power_w * time_hours * (1.0 + rng.uniform(-0.05, 0.05))

            records.append({
                "model_name": model_name,
                "model_params_m": params_m,
                "precision": prec,
                "input_size": 32,
                "batch_size": batch_sz,
                "device": dev,
                "is_gpu": is_gpu,
                "mean_latency_ms": round(latency_ms, 2),
                "energy_wh": round(energy_wh, 7),
                "peak_memory_mb": round(peak_memory_mb, 1),
            })

        return records

    def pretrain_with_synthetic(self, save_path: str | Path | None = None) -> dict[str, float]:
        """Pre-train the model immediately with synthetic records and optional real reports."""
        records = self.generate_synthetic_records(n_samples=400)

        # Merge any real benchmark reports if available
        reports_dir = Path(__file__).resolve().parent.parent.parent / "benchmarks" / "reports"
        if reports_dir.exists():
            import json
            for p in reports_dir.glob("*.json"):
                try:
                    with open(p) as f:
                        data = json.load(f)
                    if "model_name" in data and "mean_latency_ms" in data:
                        records.append({
                            "model_name": data.get("model_name"),
                            "precision": data.get("precision", "fp32"),
                            "batch_size": data.get("batch_size", 64),
                            "input_size": 32,
                            "device": data.get("device", "cpu"),
                            "mean_latency_ms": data.get("mean_latency_ms"),
                            "energy_wh": data.get("energy_wh", 0.001),
                            "peak_memory_mb": data.get("peak_memory_mb", 350.0),
                        })
                except Exception:
                    pass

        metrics = self.train(records)
        self.save(save_path)
        return metrics


# Backwards compatibility alias
ResourcePredictor = MLResourcePredictor


if __name__ == "__main__":
    predictor = MLResourcePredictor()
    metrics = predictor.pretrain_with_synthetic()
    print("✅ MLResourcePredictor trained and saved successfully!")
    print("Training Metrics (R² / RMSE):")
    for k, v in metrics.items():
        print(f"  {k}: {v:.4f}" if isinstance(v, float) else f"  {k}: {v}")

    # Test prediction
    test_cfg = {"model_name": "resnet18", "precision": "fp32", "batch_size": 64, "device": "cpu"}
    pred = predictor.predict(test_cfg)
    print("\nTest Prediction for ResNet-18 FP32 (CPU, batch=64):")
    print(f"  Predicted Latency : {pred['predicted_latency_ms']} ms")
    print(f"  Predicted Energy  : {pred['predicted_energy_wh']} Wh")
    print(f"  Predicted Memory  : {pred['predicted_memory_mb']} MB")
