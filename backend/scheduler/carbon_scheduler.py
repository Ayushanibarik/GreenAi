"""CarbonAwareScheduler — Intelligent temporal workload dispatching based on grid carbon intensity."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional

from backend.carbon_engine.carbon_calculator import CarbonIntelligence


@dataclass
class ScheduleWindow:
    start_time: str
    end_time: str
    avg_carbon_intensity: float
    estimated_emissions_g: float
    is_optimal: bool = False


@dataclass
class ScheduleRecommendation:
    workload_duration_hours: float
    energy_wh: float
    deadline: str
    region: str
    optimal_window: ScheduleWindow
    immediate_window: ScheduleWindow
    emissions_saved_g: float
    emissions_saved_pct: float
    candidate_windows: List[ScheduleWindow] = field(default_factory=list)


class CarbonAwareScheduler:
    """Schedules batch or deferred workloads in windows with the lowest grid carbon intensity."""

    def __init__(self, carbon_intelligence: Optional[CarbonIntelligence] = None):
        self.ci_engine = carbon_intelligence or CarbonIntelligence()

    def get_intensity_forecast(
        self,
        hours_ahead: int = 24,
        region: str = "india",
        start_time: Optional[datetime] = None,
    ) -> List[Dict[str, float | str]]:
        """Generate a time-series forecast of grid carbon intensity (hourly)."""
        base = start_time or datetime.now(timezone.utc)
        forecast: List[Dict[str, float | str]] = []

        for h in range(hours_ahead):
            dt = base + timedelta(hours=h)
            intensity = self.ci_engine.get_carbon_intensity(
                region=region, timestamp=dt, apply_tod=True
            )
            forecast.append({
                "timestamp": dt.isoformat(),
                "hour": dt.hour,
                "carbon_intensity": intensity,
            })
        return forecast

    def recommend_window(
        self,
        energy_wh: float,
        duration_hours: float,
        deadline: datetime,
        region: str = "india",
        start_time: Optional[datetime] = None,
        custom_forecast: Optional[List[Dict[str, float]]] = None,
    ) -> ScheduleRecommendation:
        """Find the optimal execution window before deadline to minimize CO2 emissions."""
        now = start_time or datetime.now(timezone.utc)
        if deadline <= now:
            deadline = now + timedelta(hours=24)

        duration_hours = max(duration_hours, 0.1)
        duration_delta = timedelta(hours=duration_hours)

        # Available planning window in hours
        total_available_hours = int(
            max(1, (deadline - now).total_seconds() / 3600.0)
        )

        candidate_windows: List[ScheduleWindow] = []

        # Iterate over possible start offsets (hour by hour)
        step_hours = 1.0
        current_offset = 0.0

        while (now + timedelta(hours=current_offset) + duration_delta) <= deadline:
            w_start = now + timedelta(hours=current_offset)
            w_end = w_start + duration_delta

            # Calculate average carbon intensity during this window
            # Sample at 30-min intervals or hour boundaries
            samples: List[float] = []
            sample_time = w_start
            while sample_time < w_end:
                samples.append(
                    self.ci_engine.get_carbon_intensity(
                        region=region, timestamp=sample_time, apply_tod=True
                    )
                )
                sample_time += timedelta(minutes=30)
            if not samples:
                samples.append(
                    self.ci_engine.get_carbon_intensity(
                        region=region, timestamp=w_start, apply_tod=True
                    )
                )

            avg_ci = sum(samples) / len(samples)
            emissions_g = (energy_wh / 1000.0) * avg_ci * 1000.0

            candidate_windows.append(
                ScheduleWindow(
                    start_time=w_start.isoformat(),
                    end_time=w_end.isoformat(),
                    avg_carbon_intensity=round(avg_ci, 4),
                    estimated_emissions_g=round(emissions_g, 4),
                )
            )

            current_offset += step_hours

        # Fallback if window is too tight for full hourly step
        if not candidate_windows:
            w_start = now
            w_end = now + duration_delta
            avg_ci = self.ci_engine.get_carbon_intensity(
                region=region, timestamp=w_start, apply_tod=True
            )
            emissions_g = (energy_wh / 1000.0) * avg_ci * 1000.0
            immediate_win = ScheduleWindow(
                start_time=w_start.isoformat(),
                end_time=w_end.isoformat(),
                avg_carbon_intensity=round(avg_ci, 4),
                estimated_emissions_g=round(emissions_g, 4),
                is_optimal=True,
            )
            return ScheduleRecommendation(
                workload_duration_hours=duration_hours,
                energy_wh=energy_wh,
                deadline=deadline.isoformat(),
                region=region,
                optimal_window=immediate_win,
                immediate_window=immediate_win,
                emissions_saved_g=0.0,
                emissions_saved_pct=0.0,
                candidate_windows=[immediate_win],
            )

        immediate_win = candidate_windows[0]
        optimal_win = min(candidate_windows, key=lambda w: w.estimated_emissions_g)
        optimal_win.is_optimal = True

        saved_g = max(0.0, immediate_win.estimated_emissions_g - optimal_win.estimated_emissions_g)
        saved_pct = (
            (saved_g / immediate_win.estimated_emissions_g * 100.0)
            if immediate_win.estimated_emissions_g > 0
            else 0.0
        )

        return ScheduleRecommendation(
            workload_duration_hours=duration_hours,
            energy_wh=energy_wh,
            deadline=deadline.isoformat(),
            region=region,
            optimal_window=optimal_win,
            immediate_window=immediate_win,
            emissions_saved_g=round(saved_g, 4),
            emissions_saved_pct=round(saved_pct, 2),
            candidate_windows=candidate_windows,
        )
