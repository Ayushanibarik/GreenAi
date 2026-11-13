"""Pytest fixtures for GreenCompute AI test suite.

Includes:
- FastAPI TestClient and AsyncClient
- In-memory / isolated SQLite AsyncSession fixture
- Mock telemetry data, optimization requests, and workload profiles
"""

from __future__ import annotations

import asyncio
from datetime import datetime, timezone
import os
from pathlib import Path
import sys
from typing import Any, AsyncGenerator, Dict

import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.config import settings
from backend.database.connection import init_db
from backend.database.models import Base
from backend.main import app


# ── Database Initialization ──────────────────────────────────────────────


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """Ensure database schema is created on test startup."""
    asyncio.run(init_db())
    yield


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Provide an isolated, transactional in-memory SQLite async session for testing."""
    test_engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        echo=False,
        connect_args={"check_same_thread": False},
    )
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(
        test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    async with session_factory() as session:
        yield session

    await test_engine.dispose()


# ── Test Clients ─────────────────────────────────────────────────────────


@pytest.fixture
def client() -> TestClient:
    """Synchronous FastAPI TestClient."""
    return TestClient(app)


@pytest_asyncio.fixture
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    """Asynchronous HTTP client for non-blocking endpoint validation."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac


# ── Mock Data Fixtures ────────────────────────────────────────────────────


@pytest.fixture
def mock_telemetry_reading() -> Dict[str, Any]:
    """Sample valid ESP32 + INA219 power telemetry reading."""
    return {
        "voltage": 5.02,
        "current": 420.5,
        "power": 2.1109,
        "energy": 0.0528,
        "device_id": "esp32-ina219-edge01",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@pytest.fixture
def mock_workload_request() -> Dict[str, Any]:
    """Sample workload submission payload."""
    return {
        "name": "ResNet18-Inference-Job",
        "model_type": "computer_vision",
        "region": "odisha",
        "accuracy_min": 0.80,
        "latency_max_ms": 200.0,
        "memory_max_mb": 500.0,
        "deadline_hours": 12.0,
    }


@pytest.fixture
def mock_predict_request() -> Dict[str, Any]:
    """Sample ML resource prediction payload."""
    return {
        "model_name": "mobilenetv3",
        "precision": "int8",
        "batch_size": 32,
        "samples": 500,
        "region": "odisha",
    }


@pytest.fixture
def mock_optimize_request() -> Dict[str, Any]:
    """Sample optimization payload with constraints."""
    return {
        "model_architecture": "mlp_classifier",
        "input_dim": 64,
        "hidden_dim": 128,
        "output_dim": 10,
        "accuracy_min": 0.80,
        "latency_max_ms": 150.0,
        "memory_max_mb": 300.0,
        "region": "odisha",
    }


@pytest.fixture
def mock_schedule_request() -> Dict[str, Any]:
    """Sample batch scheduling payload."""
    return {
        "energy_wh": 100.0,
        "duration_hours": 2.0,
        "deadline_hours": 24.0,
        "region": "odisha",
    }
