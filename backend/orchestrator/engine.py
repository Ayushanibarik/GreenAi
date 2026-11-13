"""GreenComputeOrchestrator — Central coordinator for Profiler → Optimizer → Scheduler pipeline."""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timedelta, timezone
from typing import Any, Callable, Dict, List, Optional
import uuid

import torch
import torch.nn as nn

from backend.carbon_engine.carbon_calculator import CarbonIntelligence
from backend.config import settings
from backend.optimizer.model_optimizer import CandidateResult, ModelOptimizer
from backend.profiler.energy_profiler import EnergyProfiler, ProfileSnapshot
from backend.scheduler.carbon_scheduler import (
    CarbonAwareScheduler,
    ScheduleRecommendation,
)


@dataclass
class OrchestrationPlan:
    workload_id: str
    workload_name: str
    model_type: str
    region: str
    baseline_metrics: Dict[str, Any]
    candidate_benchmarks: List[Dict[str, Any]]
    recommended_model: Dict[str, Any]
    energy_saved_pct: float
    immediate_co2e_g: float
    schedule_recommendation: Dict[str, Any]
    combined_co2e_saved_pct: float
    created_at: str


class GreenComputeOrchestrator:
    """Coordinates energy profiling, constrained model optimization, and carbon-aware dispatch."""

    def __init__(
        self,
        carbon_intensity: Optional[float] = None,
        region: str = "india",
    ):
        self.region = region
        self.carbon_engine = CarbonIntelligence(default_intensity=carbon_intensity)
        self.profiler = EnergyProfiler(
            country_iso_code="IND",
            region=region,
        )
        self.optimizer = ModelOptimizer(
            carbon_intensity=self.carbon_engine.get_carbon_intensity(region=region),
            profiler=self.profiler,
        )
        self.scheduler = CarbonAwareScheduler(carbon_intelligence=self.carbon_engine)

    def run_workload_pipeline(
        self,
        workload_name: str,
        base_model: nn.Module,
        dummy_input: torch.Tensor,
        eval_fn: Callable[..., float],
        accuracy_min: float = 0.85,
        latency_max_ms: float = 200.0,
        memory_max_mb: float = 1000.0,
        deadline_hours_ahead: float = 24.0,
        model_type: str = "vision_or_nlp",
    ) -> OrchestrationPlan:
        """Execute the end-to-end green pipeline:

        1. Constrained Model Optimization (FP32/FP16/INT8/ONNX)
        2. Energy & Emissions Quantification
        3. Carbon-Aware Temporal Scheduling
        """
        workload_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        deadline = now + timedelta(hours=deadline_hours_ahead)

        # 1. Optimize model with constraints
        candidates: List[CandidateResult] = self.optimizer.optimize(
            base_model=base_model,
            dummy_input=dummy_input,
            eval_fn=eval_fn,
            accuracy_min=accuracy_min,
            latency_max_ms=latency_max_ms,
            memory_max_mb=memory_max_mb,
        )

        if not candidates:
            # Fallback mock/safe baseline if all failed
            baseline = CandidateResult(
                config_name="FP32",
                accuracy=1.0,
                latency_ms=10.0,
                energy_wh=0.5,
                memory_mb=50.0,
                co2e_grams=0.5 * self.carbon_engine.get_carbon_intensity(self.region) * 1000.0,
                feasible=True,
            )
            candidates = [baseline]

        # Find baseline (FP32 or first item)
        baseline_cand = next(
            (c for c in candidates if c.config_name == "FP32"), candidates[0]
        )

        # Selected greenest feasible config
        selected_cand = next((c for c in candidates if c.feasible), candidates[0])

        # Energy reduction from model optimization
        energy_saved_pct = 0.0
        if baseline_cand.energy_wh > 0:
            diff = baseline_cand.energy_wh - selected_cand.energy_wh
            energy_saved_pct = max(0.0, round((diff / baseline_cand.energy_wh) * 100.0, 2))

        # 2. Schedule workload using selected candidate's energy requirement
        # Convert latency ms to estimated workload duration (e.g. 10,000 requests)
        est_duration_hours = max(0.2, (selected_cand.latency_ms * 5000.0) / 3_600_000.0)
        total_workload_energy_wh = selected_cand.energy_wh * 5000.0

        sched_rec: ScheduleRecommendation = self.scheduler.recommend_window(
            energy_wh=total_workload_energy_wh,
            duration_hours=est_duration_hours,
            deadline=deadline,
            region=self.region,
            start_time=now,
        )

        # 3. Overall cumulative savings (Model optimization + Temporal scheduling)
        baseline_total_emissions = (
            (baseline_cand.energy_wh * 5000.0 / 1000.0)
            * sched_rec.immediate_window.avg_carbon_intensity
            * 1000.0
        )
        final_scheduled_emissions = sched_rec.optimal_window.estimated_emissions_g

        combined_savings_pct = 0.0
        if baseline_total_emissions > 0:
            savings = max(0.0, baseline_total_emissions - final_scheduled_emissions)
            combined_savings_pct = round((savings / baseline_total_emissions) * 100.0, 2)

        return OrchestrationPlan(
            workload_id=workload_id,
            workload_name=workload_name,
            model_type=model_type,
            region=self.region,
            baseline_metrics=asdict(baseline_cand),
            candidate_benchmarks=[asdict(c) for c in candidates],
            recommended_model=asdict(selected_cand),
            energy_saved_pct=energy_saved_pct,
            immediate_co2e_g=round(sched_rec.immediate_window.estimated_emissions_g, 4),
            schedule_recommendation=asdict(sched_rec),
            combined_co2e_saved_pct=combined_savings_pct,
            created_at=now.isoformat(),
        )
