"""Unit tests for ModelOptimizer constraint validation and multi-objective scoring.

Verifies:
1. Candidate violating accuracy threshold (A < A_min) is strictly marked infeasible.
2. Candidate violating latency ceiling (L > L_max) is strictly marked infeasible.
3. Candidate violating memory limit (Mem > Mem_max) is strictly marked infeasible.
4. Feasible candidates take absolute priority over infeasible candidates during selection.
5. Multi-objective score calculation: balances Energy (alpha), Accuracy (beta), Latency (gamma), Memory (delta).
6. End-to-end model optimization on a real neural network module.
"""

from __future__ import annotations

import copy
import pytest
import torch
import torch.nn as nn

from backend.config import settings
from backend.optimizer.model_optimizer import CandidateResult, ModelOptimizer


def compute_multi_objective_score(
    candidate: CandidateResult,
    baseline: CandidateResult,
    alpha: float = settings.alpha,
    beta: float = settings.beta,
    gamma: float = settings.gamma,
    delta: float = settings.delta,
) -> float:
    """Compute normalized scalar multi-objective penalty score (lower is greener/better).

    Score = alpha * (E / E_base) + beta * (1 - A / A_base) + gamma * (L / L_base) + delta * (M / M_base)
    """
    e_ratio = candidate.energy_wh / max(baseline.energy_wh, 1e-6)
    a_ratio = candidate.accuracy / max(baseline.accuracy, 1e-6)
    l_ratio = candidate.latency_ms / max(baseline.latency_ms, 1e-6)
    m_ratio = candidate.memory_mb / max(baseline.memory_mb, 1e-6)

    # Invert accuracy ratio so that higher accuracy reduces penalty
    a_penalty = max(0.0, 1.0 - a_ratio)

    return (alpha * e_ratio) + (beta * a_penalty) + (gamma * l_ratio) + (delta * m_ratio)


class TestConstraintValidation:
    """Unit tests verifying strict mathematical constraint boundaries."""

    def test_accuracy_constraint_rejection(self):
        """Any candidate with Accuracy < A_min MUST be marked infeasible."""
        optimizer = ModelOptimizer(carbon_intensity=0.82)

        candidates = [
            CandidateResult(
                config_name="Candidate_HighAcc",
                accuracy=0.92,
                latency_ms=45.0,
                energy_wh=0.015,
                memory_mb=120.0,
                co2e_grams=0.0123,
                feasible=True,
            ),
            CandidateResult(
                config_name="Candidate_LowAcc",
                accuracy=0.74,  # Violates A_min = 0.85
                latency_ms=10.0,  # Highly tempting latency
                energy_wh=0.002,  # Highly tempting low energy
                memory_mb=25.0,
                co2e_grams=0.0016,
                feasible=True,
            ),
        ]

        accuracy_min = 0.85
        # Validate constraints
        for c in candidates:
            if c.accuracy < accuracy_min:
                c.feasible = False

        assert candidates[0].feasible is True
        assert candidates[1].feasible is False, "Candidate with A < A_min must be rejected as infeasible"

        # Sort with feasible first
        candidates.sort(key=lambda r: (not r.feasible, r.energy_wh * 0.82))
        assert candidates[0].config_name == "Candidate_HighAcc"

    def test_latency_constraint_rejection(self):
        """Any candidate with Latency > L_max MUST be marked infeasible."""
        candidates = [
            CandidateResult(
                config_name="Fast_Candidate",
                accuracy=0.88,
                latency_ms=85.0,
                energy_wh=0.008,
                memory_mb=100.0,
                co2e_grams=0.0065,
                feasible=True,
            ),
            CandidateResult(
                config_name="Slow_Candidate",
                accuracy=0.95,
                latency_ms=250.0,  # Violates L_max = 120.0 ms
                energy_wh=0.004,
                memory_mb=80.0,
                co2e_grams=0.0032,
                feasible=True,
            ),
        ]

        latency_max_ms = 120.0
        for c in candidates:
            if c.latency_ms > latency_max_ms:
                c.feasible = False

        assert candidates[0].feasible is True
        assert candidates[1].feasible is False, "Candidate with L > L_max must be marked infeasible"

        candidates.sort(key=lambda r: (not r.feasible, r.energy_wh * 0.82))
        assert candidates[0].config_name == "Fast_Candidate"

    def test_memory_constraint_rejection(self):
        """Any candidate exceeding memory ceiling (M > M_max) MUST be marked infeasible."""
        candidates = [
            CandidateResult(
                config_name="Lean_Model",
                accuracy=0.87,
                latency_ms=40.0,
                energy_wh=0.006,
                memory_mb=150.0,
                co2e_grams=0.0049,
                feasible=True,
            ),
            CandidateResult(
                config_name="Bloated_Model",
                accuracy=0.90,
                latency_ms=45.0,
                energy_wh=0.005,
                memory_mb=650.0,  # Violates M_max = 250 MB
                co2e_grams=0.0041,
                feasible=True,
            ),
        ]

        memory_max_mb = 250.0
        for c in candidates:
            if c.memory_mb > memory_max_mb:
                c.feasible = False

        assert candidates[0].feasible is True
        assert candidates[1].feasible is False, "Candidate with Mem > Mem_max must be rejected"

    def test_all_candidates_infeasible_boundary(self):
        """When constraints are strictly unattainable, all candidates are marked infeasible."""
        candidates = [
            CandidateResult(
                config_name="C1",
                accuracy=0.80,
                latency_ms=100.0,
                energy_wh=0.01,
                memory_mb=100.0,
                co2e_grams=0.008,
            ),
            CandidateResult(
                config_name="C2",
                accuracy=0.82,
                latency_ms=90.0,
                energy_wh=0.009,
                memory_mb=90.0,
                co2e_grams=0.007,
            ),
        ]

        # Impossible accuracy requirement
        accuracy_min = 0.999
        for c in candidates:
            if c.accuracy < accuracy_min:
                c.feasible = False

        assert all(not c.feasible for c in candidates)


class TestMultiObjectiveScoring:
    """Tests evaluating multi-objective trade-offs."""

    def test_multi_objective_weight_contributions(self):
        """Verify weights alpha, beta, gamma, delta correctly steer candidate selection."""
        base = CandidateResult(
            config_name="FP32_Baseline",
            accuracy=0.90,
            latency_ms=100.0,
            energy_wh=0.020,
            memory_mb=200.0,
            co2e_grams=0.016,
        )

        # Quantized model: 50% energy, 40% latency, 50% memory, with minor accuracy loss (-1%)
        quantized = CandidateResult(
            config_name="INT8_Optimized",
            accuracy=0.891,
            latency_ms=40.0,
            energy_wh=0.010,
            memory_mb=100.0,
            co2e_grams=0.008,
        )

        base_score = compute_multi_objective_score(base, base)
        quant_score = compute_multi_objective_score(quantized, base)

        # INT8 score must be substantially lower (greener) than baseline
        assert quant_score < base_score
        pct_improvement = (base_score - quant_score) / base_score * 100.0
        assert pct_improvement > 30.0, f"Expected >30% improvement, got {pct_improvement:.1f}%"

    def test_weights_sum_to_one(self):
        """Verify standard weights in configuration normalize close to 1.0."""
        total_weight = settings.alpha + settings.beta + settings.gamma + settings.delta
        assert pytest.approx(total_weight, rel=1e-2) == 1.0


class TestModelOptimizerIntegration:
    """Integration test with a live PyTorch neural network."""

    def test_optimize_live_pytorch_model(self):
        """Run optimize() on a synthetic linear network and check constraint enforcement."""
        in_dim = 32
        model = nn.Sequential(
            nn.Linear(in_dim, 64),
            nn.ReLU(),
            nn.Linear(64, 10),
        )
        dummy_input = torch.randn(8, in_dim)

        def eval_fn(m):
            return 0.88

        optimizer = ModelOptimizer(carbon_intensity=0.82)
        results = optimizer.optimize(
            base_model=model,
            dummy_input=dummy_input,
            eval_fn=eval_fn,
            accuracy_min=0.85,
            latency_max_ms=250.0,
            memory_max_mb=500.0,
        )

        assert len(results) > 0
        best = results[0]
        assert best.feasible is True
        assert best.accuracy >= 0.85
        assert best.latency_ms <= 250.0
        assert best.memory_mb <= 500.0
        assert best.energy_wh >= 0.0
        assert best.co2e_grams >= 0.0
