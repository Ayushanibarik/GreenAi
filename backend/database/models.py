"""SQLAlchemy ORM models for GreenCompute AI."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    Float,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Shared declarative base."""


class Workload(Base):
    __tablename__ = "workloads"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(256), nullable=False)
    model_type = Column(String(128), nullable=False)
    framework = Column(String(64), nullable=False, default="pytorch")
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class BenchmarkResult(Base):
    __tablename__ = "benchmark_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workload_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    config_name = Column(String(64), nullable=False)
    accuracy = Column(Float, nullable=True)
    latency_ms = Column(Float, nullable=False)
    energy_wh = Column(Float, nullable=False)
    memory_mb = Column(Float, nullable=False)
    co2e_grams = Column(Float, nullable=False)
    throughput = Column(Float, nullable=True)
    selected = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class EnergyReading(Base):
    __tablename__ = "energy_readings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workload_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    cpu_percent = Column(Float, nullable=False)
    gpu_percent = Column(Float, nullable=True)
    ram_mb = Column(Float, nullable=False)
    power_w = Column(Float, nullable=False)
    energy_wh = Column(Float, nullable=False)
    exec_time_s = Column(Float, nullable=False)
    throughput = Column(Float, nullable=True)
    timestamp = Column(DateTime(timezone=True), default=datetime.utcnow)


class CarbonEstimate(Base):
    __tablename__ = "carbon_estimates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workload_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    energy_wh = Column(Float, nullable=False)
    carbon_intensity = Column(Float, nullable=False)
    co2e_grams = Column(Float, nullable=False)
    region = Column(String(64), nullable=False, default="india")
    timestamp = Column(DateTime(timezone=True), default=datetime.utcnow)


class HardwareReading(Base):
    __tablename__ = "hardware_readings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    voltage = Column(Float, nullable=False)
    current = Column(Float, nullable=False)
    power = Column(Float, nullable=False)
    energy = Column(Float, nullable=False)
    source = Column(String(64), default="esp32_ina219")
    timestamp = Column(DateTime(timezone=True), default=datetime.utcnow)


class OptimizationResult(Base):
    __tablename__ = "optimization_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workload_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    original_config = Column(String(64), nullable=False)
    optimized_config = Column(String(64), nullable=False)
    energy_saved_pct = Column(Float, nullable=False)
    co2e_saved_grams = Column(Float, nullable=False)
    accuracy_delta = Column(Float, nullable=True)
    latency_delta_ms = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
