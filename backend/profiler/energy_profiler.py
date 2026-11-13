"""EnergyProfiler — wraps CodeCarbon + psutil + pynvml for energy telemetry."""

from __future__ import annotations

import time
from contextlib import contextmanager
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Callable, Generator, Optional

import psutil

try:
    import pynvml

    _NVML_AVAILABLE = True
except Exception:
    _NVML_AVAILABLE = False

from codecarbon import OfflineEmissionsTracker


@dataclass
class ProfileSnapshot:
    """Single‑point telemetry reading."""

    cpu_percent: float = 0.0
    gpu_percent: float = 0.0
    gpu_memory_used_mb: float = 0.0
    gpu_power_w: float = 0.0
    ram_used_mb: float = 0.0
    power_w: float = 0.0
    energy_wh: float = 0.0
    exec_time_s: float = 0.0
    throughput: float = 0.0
    co2e_kg: float = 0.0
    timestamp: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )


@dataclass
class EnergyProfiler:
    """Measures energy & hardware utilisation during workload execution."""

    country_iso_code: str = "IND"
    region: Optional[str] = "odisha"
    project_name: str = "greencompute"
    last_snapshot: Optional[ProfileSnapshot] = field(default=None, init=False)
    _tracker: Optional[OfflineEmissionsTracker] = field(
        default=None, init=False, repr=False
    )
    _gpu_initialised: bool = field(default=False, init=False)

    # ── GPU helpers ──────────────────────────────────────────────────────

    def _init_gpu(self) -> None:
        if _NVML_AVAILABLE and not self._gpu_initialised:
            try:
                pynvml.nvmlInit()
                self._gpu_initialised = True
            except Exception:
                pass

    def _gpu_utilisation(self) -> float:
        if not self._gpu_initialised:
            return 0.0
        try:
            handle = pynvml.nvmlDeviceGetHandleByIndex(0)
            util = pynvml.nvmlDeviceGetUtilizationRates(handle)
            return float(util.gpu)
        except Exception:
            return 0.0

    def _gpu_power_w(self) -> float:
        if not self._gpu_initialised:
            return 0.0
        try:
            handle = pynvml.nvmlDeviceGetHandleByIndex(0)
            return pynvml.nvmlDeviceGetPowerUsage(handle) / 1000.0  # mW → W
        except Exception:
            return 0.0

    def _gpu_memory_mb(self) -> float:
        if not self._gpu_initialised:
            return 0.0
        try:
            handle = pynvml.nvmlDeviceGetHandleByIndex(0)
            mem = pynvml.nvmlDeviceGetMemoryInfo(handle)
            return float(mem.used) / (1024.0 * 1024.0)
        except Exception:
            return 0.0

    # ── Snapshot (used by WebSocket telemetry) ───────────────────────────

    def snapshot(self) -> ProfileSnapshot:
        """Capture a single instantaneous telemetry reading."""
        self._init_gpu()
        cpu = psutil.cpu_percent(interval=0)
        ram = psutil.virtual_memory().used / (1024 * 1024)
        gpu_pct = self._gpu_utilisation()
        gpu_pw = self._gpu_power_w()
        gpu_mem = self._gpu_memory_mb()
        # Rough system power estimate: 50 W baseline + CPU‑proportional + GPU
        power_est = 50.0 + (cpu / 100.0) * 100.0 + gpu_pw
        return ProfileSnapshot(
            cpu_percent=cpu,
            gpu_percent=gpu_pct,
            gpu_memory_used_mb=gpu_mem,
            gpu_power_w=gpu_pw,
            ram_used_mb=ram,
            power_w=power_est,
        )

    # ── Full profiling run ───────────────────────────────────────────────

    def profile(
        self,
        workload_fn: Callable[..., Any],
        *args: Any,
        **kwargs: Any,
    ) -> ProfileSnapshot:
        """Run *workload_fn* inside a CodeCarbon tracker and return metrics."""
        self._init_gpu()
        self._tracker = OfflineEmissionsTracker(
            country_iso_code=self.country_iso_code,
            project_name=self.project_name,
            log_level="error",
            save_to_file=False,
        )
        self._tracker.start()

        start = time.perf_counter()
        result = workload_fn(*args, **kwargs)
        elapsed = time.perf_counter() - start

        emissions = self._tracker.stop()  # kg CO₂e

        cpu = psutil.cpu_percent(interval=0)
        ram = psutil.virtual_memory().used / (1024 * 1024)
        gpu_pct = self._gpu_utilisation()
        gpu_pw = self._gpu_power_w()
        gpu_mem = self._gpu_memory_mb()
        power_est = 50.0 + (cpu / 100.0) * 100.0 + gpu_pw
        energy_wh = (power_est * elapsed) / 3600.0
        throughput = (1.0 / elapsed) if elapsed > 0 else 0.0

        snap = ProfileSnapshot(
            cpu_percent=cpu,
            gpu_percent=gpu_pct,
            gpu_memory_used_mb=gpu_mem,
            gpu_power_w=gpu_pw,
            ram_used_mb=ram,
            power_w=power_est,
            energy_wh=energy_wh,
            exec_time_s=elapsed,
            throughput=throughput,
            co2e_kg=emissions if emissions else 0.0,
        )
        self.last_snapshot = snap
        return snap

    @contextmanager
    def profile_workload(
        self, task_name: str = "workload"
    ) -> Generator[ProfileSnapshot, None, None]:
        """Context manager to measure energy and resource consumption for a block."""
        self._init_gpu()
        tracker = OfflineEmissionsTracker(
            country_iso_code=self.country_iso_code,
            project_name=f"{self.project_name}_{task_name}",
            log_level="error",
            save_to_file=False,
        )
        tracker.start()
        start = time.perf_counter()
        snap = ProfileSnapshot()
        try:
            yield snap
        finally:
            elapsed = time.perf_counter() - start
            emissions = tracker.stop()
            cpu = psutil.cpu_percent(interval=0)
            ram = psutil.virtual_memory().used / (1024 * 1024)
            gpu_pct = self._gpu_utilisation()
            gpu_pw = self._gpu_power_w()
            gpu_mem = self._gpu_memory_mb()
            power_est = 50.0 + (cpu / 100.0) * 100.0 + gpu_pw
            energy_wh = (power_est * elapsed) / 3600.0
            throughput = (1.0 / elapsed) if elapsed > 0 else 0.0

            snap.cpu_percent = cpu
            snap.gpu_percent = gpu_pct
            snap.gpu_memory_used_mb = gpu_mem
            snap.gpu_power_w = gpu_pw
            snap.ram_used_mb = ram
            snap.power_w = power_est
            snap.energy_wh = energy_wh
            snap.exec_time_s = elapsed
            snap.throughput = throughput
            snap.co2e_kg = emissions if emissions else 0.0
            self.last_snapshot = snap
