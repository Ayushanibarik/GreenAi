"""Lightweight predictor for energy/latency from model configuration features."""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np

try:
    from sklearn.ensemble import RandomForestRegressor
except ImportError:
    RandomForestRegressor = None  # type: ignore[assignment,misc]


class ResourcePredictor:
    """Predict energy (Wh) and latency (ms) from model config features.

    Features: [param_count_M, flops_G, precision_code, batch_size]
    precision_code: fp32=0, fp16=1, int8=2, onnx=3
    """

    PRECISION_MAP = {"fp32": 0, "fp16": 1, "int8": 2, "onnx": 3}

    def __init__(self) -> None:
        if RandomForestRegressor is None:
            raise ImportError("scikit-learn is required for ResourcePredictor")
        self.energy_model = RandomForestRegressor(n_estimators=50, random_state=42)
        self.latency_model = RandomForestRegressor(n_estimators=50, random_state=42)
        self._fitted = False

    def _encode(self, configs: list[dict]) -> np.ndarray:
        rows = []
        for c in configs:
            rows.append([
                c.get("param_count_m", 11.0),
                c.get("flops_g", 1.8),
                self.PRECISION_MAP.get(c.get("precision", "fp32"), 0),
                c.get("batch_size", 64),
            ])
        return np.array(rows, dtype=np.float64)

    def fit(self, configs: list[dict], energy_wh: list[float], latency_ms: list[float]) -> None:
        X = self._encode(configs)
        self.energy_model.fit(X, np.array(energy_wh))
        self.latency_model.fit(X, np.array(latency_ms))
        self._fitted = True

    def predict(self, configs: list[dict]) -> list[dict]:
        if not self._fitted:
            raise RuntimeError("Call fit() before predict()")
        X = self._encode(configs)
        energies = self.energy_model.predict(X)
        latencies = self.latency_model.predict(X)
        return [
            {"energy_wh": float(e), "latency_ms": float(l)}
            for e, l in zip(energies, latencies)
        ]

    def save(self, path: str | Path) -> None:
        import pickle
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "wb") as f:
            pickle.dump({"energy": self.energy_model, "latency": self.latency_model}, f)

    def load(self, path: str | Path) -> None:
        import pickle
        with open(path, "rb") as f:
            data = pickle.load(f)
        self.energy_model = data["energy"]
        self.latency_model = data["latency"]
        self._fitted = True
