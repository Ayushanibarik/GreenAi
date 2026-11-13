"""ModelOptimizer — constrained green‑optimal model selection.

Objective: minimise  E × CI
Subject to:
    A  ≥  A_min          (accuracy constraint)
    L  ≤  L_max          (latency constraint, ms)
    Mem ≤ Mem_avail      (memory constraint, MB)

Generates candidate configs (FP32 / FP16 / INT8 / ONNX), benchmarks each via
the EnergyProfiler, filters by constraints, and returns the greenest config.
"""

from __future__ import annotations

import copy
import time
from dataclasses import dataclass, field
from typing import Any, Callable, Dict, List, Optional

import torch
import torch.nn as nn

from backend.config import settings
from backend.optimizer.quantizer import (
    dynamic_quantize,
    fp16_convert,
    model_size_mb,
    onnx_export,
)
from backend.profiler.energy_profiler import EnergyProfiler


@dataclass
class CandidateResult:
    config_name: str
    accuracy: float
    latency_ms: float
    energy_wh: float
    memory_mb: float
    co2e_grams: float
    feasible: bool = True


@dataclass
class ModelOptimizer:
    """Green‑aware model optimiser with constrained selection."""

    carbon_intensity: float = settings.default_carbon_intensity
    profiler: EnergyProfiler = field(default_factory=EnergyProfiler)

    # ── Candidate generation ─────────────────────────────────────────────

    @staticmethod
    def _generate_candidates(
        base_model: nn.Module,
        dummy_input: torch.Tensor,
    ) -> Dict[str, nn.Module | str]:
        """Return a dict of config_name → model (or ONNX path)."""
        candidates: Dict[str, Any] = {"FP32": copy.deepcopy(base_model)}

        try:
            candidates["FP16"] = fp16_convert(copy.deepcopy(base_model))
        except Exception:
            pass

        try:
            candidates["INT8"] = dynamic_quantize(copy.deepcopy(base_model))
        except Exception:
            pass

        try:
            onnx_path = onnx_export(copy.deepcopy(base_model), dummy_input)
            candidates["ONNX"] = onnx_path
        except Exception:
            pass

        return candidates

    # ── Benchmark a single candidate ─────────────────────────────────────

    def _benchmark_candidate(
        self,
        name: str,
        model_or_path: nn.Module | str,
        eval_fn: Callable[..., float],
        dummy_input: torch.Tensor,
        n_runs: int = 3,
    ) -> CandidateResult:
        """Profile a candidate and return structured metrics."""

        if isinstance(model_or_path, str):
            # ONNX path — run via onnxruntime
            import onnxruntime as ort

            sess = ort.InferenceSession(model_or_path)
            inp_name = sess.get_inputs()[0].name
            np_input = dummy_input.numpy()

            def _run() -> None:
                sess.run(None, {inp_name: np_input})

            accuracy = eval_fn(model_or_path)
            mem = 0.0  # ONNX session mem is opaque; use file size
            import os

            mem = os.path.getsize(model_or_path) / (1024 * 1024)
        else:
            model_or_path.eval()

            def _run() -> None:
                with torch.no_grad():
                    model_or_path(dummy_input)

            accuracy = eval_fn(model_or_path)
            mem = model_size_mb(model_or_path)

        # Average latency over n_runs
        latencies: list[float] = []
        for _ in range(n_runs):
            t0 = time.perf_counter()
            _run()
            latencies.append((time.perf_counter() - t0) * 1000)
        avg_latency = sum(latencies) / len(latencies)

        # Energy via profiler (single run)
        snap = self.profiler.profile(_run)
        energy_wh = snap.energy_wh
        co2e_g = energy_wh * self.carbon_intensity * 1000  # kgCO2/kWh → g

        return CandidateResult(
            config_name=name,
            accuracy=accuracy,
            latency_ms=avg_latency,
            energy_wh=energy_wh,
            memory_mb=mem,
            co2e_grams=co2e_g,
        )

    # ── Main optimise entry‑point ────────────────────────────────────────

    def optimize(
        self,
        base_model: nn.Module,
        dummy_input: torch.Tensor,
        eval_fn: Callable[..., float],
        accuracy_min: float = 0.0,
        latency_max_ms: float = float("inf"),
        memory_max_mb: float = float("inf"),
    ) -> List[CandidateResult]:
        """Benchmark all candidates, filter by constraints, sort by energy×CI.

        Returns the full candidate list; first element is the greenest feasible
        candidate.
        """
        candidates = self._generate_candidates(base_model, dummy_input)
        results: List[CandidateResult] = []

        for name, model_or_path in candidates.items():
            try:
                res = self._benchmark_candidate(
                    name, model_or_path, eval_fn, dummy_input
                )
            except Exception:
                continue

            # Constraint validation
            if res.accuracy < accuracy_min:
                res.feasible = False
            if res.latency_ms > latency_max_ms:
                res.feasible = False
            if res.memory_mb > memory_max_mb:
                res.feasible = False

            results.append(res)

        # Sort: feasible first, then by ascending energy × carbon_intensity
        results.sort(
            key=lambda r: (
                not r.feasible,
                r.energy_wh * self.carbon_intensity,
            )
        )
        return results
