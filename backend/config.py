"""GreenCompute AI — centralised configuration."""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from typing import Dict


@dataclass
class Settings:
    """Application‑wide settings loaded from env vars with sane defaults."""

    # ── Database ──────────────────────────────────────────────────────────
    database_url: str = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://postgres:postgres@localhost:5432/greencompute",
    )

    # ── Carbon intensity defaults (kg CO₂e / kWh) ────────────────────────
    # India national grid average ≈ 0.82; Odisha ≈ 0.91
    default_carbon_intensity: float = float(
        os.getenv("DEFAULT_CARBON_INTENSITY", "0.82")
    )

    # Regional overrides
    regional_carbon_intensity: Dict[str, float] = field(
        default_factory=lambda: {
            "india": 0.82,
            "odisha": 0.91,
            "eu": 0.28,
            "us": 0.42,
            "nordics": 0.02,
        }
    )

    # Time‑of‑day variation multipliers (hour → multiplier)
    # Peak hours carry heavier carbon intensity.
    tod_carbon_multipliers: Dict[int, float] = field(
        default_factory=lambda: {
            0: 0.85, 1: 0.82, 2: 0.80, 3: 0.78, 4: 0.80, 5: 0.85,
            6: 0.90, 7: 0.95, 8: 1.00, 9: 1.05, 10: 1.10, 11: 1.12,
            12: 1.15, 13: 1.12, 14: 1.10, 15: 1.05, 16: 1.00, 17: 1.05,
            18: 1.15, 19: 1.20, 20: 1.15, 21: 1.10, 22: 1.00, 23: 0.90,
        }
    )

    # ── Optimisation weights ──────────────────────────────────────────────
    alpha: float = float(os.getenv("OPT_ALPHA", "0.4"))   # energy weight
    beta: float = float(os.getenv("OPT_BETA", "0.3"))     # accuracy weight
    gamma: float = float(os.getenv("OPT_GAMMA", "0.2"))   # latency weight
    delta: float = float(os.getenv("OPT_DELTA", "0.1"))   # memory weight

    # ── General ───────────────────────────────────────────────────────────
    cors_origins: list[str] = field(
        default_factory=lambda: os.getenv("CORS_ORIGINS", "*").split(",")
    )
    ws_telemetry_interval: float = float(
        os.getenv("WS_TELEMETRY_INTERVAL", "1.0")
    )


settings = Settings()
