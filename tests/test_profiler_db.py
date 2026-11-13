"""Unit and integration tests for Day 2: EnergyProfiler, Database persistence, and Telemetry WebSocket."""

from __future__ import annotations

import asyncio
import time
import uuid
import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.profiler.energy_profiler import EnergyProfiler, ProfileSnapshot
from backend.database.models import (
    Workload,
    BenchmarkResult,
    EnergyReading,
    CarbonEstimate,
    HardwareReading,
    OptimizationResult,
)
from backend.main import app
from fastapi.testclient import TestClient


class TestEnergyProfiler:
    """Validate Day 2 EnergyProfiler software telemetry and context management."""

    def test_profiler_singleton_and_init(self):
        profiler = EnergyProfiler()
        assert profiler is not None
        # GPU detection flag should be a boolean
        assert isinstance(profiler._gpu_initialised, bool)

    def test_profiler_snapshot_structure(self):
        profiler = EnergyProfiler()
        snap = profiler.snapshot()
        assert isinstance(snap, ProfileSnapshot)
        assert snap.cpu_percent >= 0.0
        assert snap.gpu_percent >= 0.0
        assert snap.gpu_memory_used_mb >= 0.0
        assert snap.ram_used_mb > 0.0
        assert snap.power_w > 0.0
        assert snap.timestamp is not None

    def test_profiler_context_manager(self):
        profiler = EnergyProfiler()
        with profiler.profile_workload(task_name="unit_test_workload") as ctx:
            # Perform a tiny synthetic workload
            _ = [x * x for x in range(100_000)]
            time.sleep(0.05)

        snap = profiler.last_snapshot
        assert snap is not None
        assert snap.exec_time_s >= 0.04
        assert snap.energy_wh >= 0.0
        assert snap.throughput > 0.0


@pytest.mark.asyncio
class TestDatabasePersistence:
    """Validate Day 2 SQLAlchemy async persistence across all six schema tables."""

    async def test_full_database_crud_cycle(self, db_session: AsyncSession):
        # 1. Insert Workload
        workload = Workload(
            name="ResNet18-Day2-Test",
            model_type="image_classification",
            framework="pytorch",
            description="Day 2 verification workload",
        )
        db_session.add(workload)
        await db_session.commit()
        await db_session.refresh(workload)
        assert workload.id is not None

        # 2. Insert BenchmarkResult
        bench = BenchmarkResult(
            workload_id=workload.id,
            config_name="fp32_baseline",
            accuracy=0.925,
            latency_ms=45.2,
            energy_wh=0.85,
            memory_mb=128.0,
            co2e_grams=0.595,
            throughput=22.1,
            selected=1,
        )
        db_session.add(bench)

        # 3. Insert EnergyReading
        energy = EnergyReading(
            workload_id=workload.id,
            cpu_percent=42.5,
            gpu_percent=68.0,
            ram_mb=4096.0,
            power_w=85.0,
            energy_wh=0.85,
            exec_time_s=36.0,
            throughput=22.1,
        )
        db_session.add(energy)

        # 4. Insert CarbonEstimate
        carbon = CarbonEstimate(
            workload_id=workload.id,
            energy_wh=0.85,
            carbon_intensity=0.708,
            co2e_grams=0.6018,
            region="odisha",
        )
        db_session.add(carbon)

        # 5. Insert HardwareReading
        hw = HardwareReading(
            voltage=5.01,
            current=450.2,
            power=2.255,
            energy=0.062,
            source="esp32_ina219",
        )
        db_session.add(hw)

        # 6. Insert OptimizationResult
        opt = OptimizationResult(
            workload_id=workload.id,
            original_config="fp32_baseline",
            optimized_config="int8_quantized",
            energy_saved_pct=42.5,
            co2e_saved_grams=0.255,
            accuracy_delta=-0.008,
            latency_delta_ms=-21.5,
        )
        db_session.add(opt)

        await db_session.commit()

        # Query and assert persistence
        stmt = select(Workload).where(Workload.name == "ResNet18-Day2-Test")
        result = await db_session.execute(stmt)
        retrieved_workload = result.scalar_one_or_none()
        assert retrieved_workload is not None
        assert retrieved_workload.model_type == "image_classification"

        stmt_bench = select(BenchmarkResult).where(BenchmarkResult.workload_id == workload.id)
        result_bench = await db_session.execute(stmt_bench)
        retrieved_bench = result_bench.scalar_one_or_none()
        assert retrieved_bench is not None
        assert retrieved_bench.config_name == "fp32_baseline"
        assert retrieved_bench.energy_wh == 0.85

        stmt_hw = select(HardwareReading).where(HardwareReading.source == "esp32_ina219")
        result_hw = await db_session.execute(stmt_hw)
        retrieved_hw = result_hw.scalars().all()
        assert len(retrieved_hw) >= 1
        assert retrieved_hw[0].voltage == 5.01


class TestTelemetryWebSocket:
    """Validate Day 2 WebSocket telemetry broadcasting."""

    def test_websocket_telemetry_stream(self):
        client = TestClient(app)
        with client.websocket_connect("/ws/telemetry") as websocket:
            data = websocket.receive_json()
            assert "timestamp" in data
            assert "cpu_percent" in data
            assert "gpu_percent" in data
            assert "ram_used_mb" in data
            assert "power_w" in data
            assert data["cpu_percent"] >= 0.0

