"""GreenCompute AI — Core FastAPI Application Entry Point."""

from __future__ import annotations

from contextlib import asynccontextmanager
import logging
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routes import api_router
from backend.api.websocket import ws_router
from backend.config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("greencompute")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan manager for clean startup & shutdown."""
    logger.info("Initializing GreenCompute AI backend engine...")
    logger.info(f"Default Carbon Intensity: {settings.default_carbon_intensity} kg CO2e/kWh")
    logger.info("Hardware receiver & EnergyProfiler ready.")
    yield
    logger.info("Shutting down GreenCompute AI backend engine. Cleaning up resources...")


app = FastAPI(
    title="GreenCompute AI Backend",
    description=(
        "Carbon-Aware AI & High-Performance Computing Optimization Engine. "
        "Coordinates Energy Profiling (CodeCarbon + NVML), Multi-format Constrained Quantization, "
        "Carbon Intensity Intelligence, and Temporal Workload Scheduling."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── Cross-Origin Resource Sharing (CORS) ──────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins if settings.cors_origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Include Routers ───────────────────────────────────────────────────────
app.include_router(api_router, prefix="/api")
app.include_router(ws_router)


@app.get("/", tags=["root"])
async def root():
    """Root metadata & service locator."""
    return {
        "service": "GreenCompute AI Backend",
        "status": "operational",
        "docs": "/docs",
        "version": "1.0.0",
        "features": [
            "Energy Profiling (CodeCarbon + NVML + psutil)",
            "Constrained Model Optimization (FP32/FP16/INT8/ONNX)",
            "Carbon Intelligence (India & Regional Grids)",
            "Carbon-Aware Workload Scheduling",
            "ESP32 + INA219 Hardware Telemetry Ingestion",
            "Live Telemetry Streaming via WebSocket (/ws/telemetry)",
        ],
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
