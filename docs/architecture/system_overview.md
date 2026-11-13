# GreenCompute AI — System Architecture Overview

## 1. Introduction

GreenCompute AI is a modular platform for measuring, benchmarking, and visualizing the energy consumption and carbon footprint of machine-learning workloads. The architecture separates concerns into six independent modules that communicate through well-defined interfaces.

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend Dashboard                    │
│               (React 18 + Vite + Charts)                │
└────────────────────────┬────────────────────────────────┘
                         │ REST / WebSocket
┌────────────────────────▼────────────────────────────────┐
│                    Backend API                          │
│                (FastAPI + Uvicorn)                       │
├─────────┬──────────┬───────────┬───────────┬────────────┤
│ Energy  │Benchmark │  Carbon   │  Data     │  Hardware  │
│ Monitor │ Engine   │ Estimator │  Storage  │  Ingestion │
└────┬────┴─────┬────┴─────┬────┴─────┬─────┴──────┬─────┘
     │          │          │          │             │
  RAPL/NVML  PyTorch   Intensity  PostgreSQL    ESP32
  CodeCarbon  Models    Factors       16        INA219
```

## 3. Module Descriptions

### 3.1 Energy Monitor

**Responsibility**: Capture real-time power consumption from software and hardware sources.

- **Software path**: Uses [CodeCarbon](https://codecarbon.io/) to read Intel RAPL (CPU) and NVIDIA NVML (GPU) counters, producing per-process energy estimates in kWh.
- **Hardware path**: Ingests HTTP-POSTed readings from ESP32 + INA219 current/voltage sensors for direct wall-power measurement.
- **Output**: Timestamped power samples (watts) and cumulative energy (watt-hours) stored in the database.

### 3.2 Benchmark Engine

**Responsibility**: Execute ML workloads under controlled, reproducible conditions.

- Configurable warmup iterations to reach thermal and frequency steady-state.
- Fixed sample count per evaluation run.
- Multiple independent repeats to capture variance.
- Reports mean ± standard deviation for latency, throughput, and energy per sample.
- See `docs/methodology/benchmark_protocol.md` for the full scientific protocol.

### 3.3 Carbon Estimator

**Responsibility**: Convert energy measurements into CO₂-equivalent emissions.

- Accepts a configurable **carbon intensity factor** (gCO₂/kWh), defaulting to the world-average grid intensity (~475 gCO₂/kWh).
- Supports per-region override via a lookup table of national/regional grid intensities.
- Computes `emissions_gCO2 = energy_kWh × carbon_intensity_gCO2_per_kWh`.

### 3.4 Backend API

**Responsibility**: Central orchestration and data access layer.

- Built with **FastAPI** running on **Uvicorn** (ASGI).
- RESTful endpoints for:
  - Experiment CRUD (create, list, get, update, delete).
  - Metrics ingestion (batch and streaming from sensors).
  - Analytics queries (aggregations, comparisons, time-series).
- Pydantic request/response models with automatic OpenAPI docs.
- SQLAlchemy ORM for PostgreSQL access.

### 3.5 Frontend Dashboard

**Responsibility**: Interactive visualization and experiment management UI.

- **React 18** SPA bootstrapped with **Vite** for fast HMR.
- Real-time power/energy charts (line, bar, comparison overlays).
- Experiment table with filtering, sorting, and drill-down.
- Carbon footprint summary cards and exportable PDF/CSV reports.
- Responsive layout for desktop and tablet.

### 3.6 Hardware Interface (ESP32 + INA219)

**Responsibility**: Physical power measurement at the wall outlet.

- **INA219** high-side current/voltage sensor on I²C bus, read by an **ESP32** microcontroller.
- Firmware (Arduino / PlatformIO) computes instantaneous power (P = V × I) and cumulative energy.
- Streams JSON payloads `{voltage_V, current_mA, power_mW, energy_mWh, timestamp_ms}` to the backend via HTTP POST every 1 second over WiFi.

## 4. Data Flow

1. User starts an experiment via the **Dashboard** or API.
2. **Benchmark Engine** executes the configured ML workload.
3. **Energy Monitor** captures software power readings (RAPL/NVML) throughout.
4. Optionally, **Hardware Interface** streams wall-power readings concurrently.
5. **Carbon Estimator** annotates energy data with CO₂ estimates.
6. All metrics are persisted in **PostgreSQL**.
7. **Dashboard** renders real-time and historical charts for analysis.

## 5. Deployment

| Component | Container | Port |
|-----------|-----------|------|
| Backend API | `backend` (python:3.11-slim) | 8000 |
| Frontend | `frontend` (node:20-alpine) | 5173 |
| Database | `db` (postgres:16-alpine) | 5432 |

Orchestrated via `docker-compose.yml` at the project root.

## 6. Security & Configuration

- Secrets managed through environment variables (`.env`), never committed.
- `.env.example` documents all required variables.
- Database credentials isolated to the Docker network; only the backend connects directly.

## 7. Extensibility

- **New sensors**: Add ingestion endpoints and a parser; the schema supports arbitrary metric types.
- **New ML frameworks**: Implement the `BenchmarkRunner` interface for JAX, TensorFlow, etc.
- **Cloud deployment**: Swap Docker Compose for Kubernetes manifests or a managed PaaS.
