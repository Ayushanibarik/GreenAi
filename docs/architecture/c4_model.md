# GreenCompute AI — C4 Architecture Specification

This document provides a comprehensive architectural description of **GreenCompute AI** structured according to the **C4 Model** (Context, Container, Component, and Code). It documents how the system's modular software components interact with hardware power sensors and regional power grid models.

---

## Level 1: System Context Diagram

The System Context diagram illustrates the high-level boundary of GreenCompute AI, showing how external personas and external systems interact with the platform.

```mermaid
flowchart TD
    subgraph PERSONAS ["Human Actors"]
        MLE["ML Engineer / Data Scientist\n[Person]\nSubmits models, reviews energy metrics, sets SLA constraints"]
        ADMIN["Enterprise ESG & Infrastructure Lead\n[Person]\nMonitors datacenter carbon quotas and compliance reports"]
        HW_TECH["Embedded Hardware Operator\n[Person]\nDeploys and calibrates ESP32+INA219 edge power sensors"]
    end

    subgraph SYSTEM_BOUNDARY ["GreenCompute AI Platform Boundary"]
        GREENCOMPUTE["GreenCompute AI Platform\n[Software System]\nMeasures, profiles, optimizes, and schedules ML workloads for minimal energy and carbon footprint"]
    end

    subgraph EXTERNAL_SYSTEMS ["External Systems & Hardware"]
        GRID_DATA["Regional Grid Baseline Authority (CEA v19)\n[External System]\nProvides national and state-level CO2e emission factor databases"]
        COMPUTE_HOST["Target Compute Host (CPU/GPU)\n[Hardware System]\nExecutes ML inference workloads; exposes RAPL and NVML counters"]
        ESP32_SENSOR["ESP32 + INA219 Sensing Rig\n[Embedded Device]\nPhysically samples wall/bus voltage and current over I2C"]
    end

    MLE -->|"Submits workloads, views Pareto frontier (HTTPS)"| GREENCOMPUTE
    ADMIN -->|"Audits Scope 2/3 carbon emissions and schedules (HTTPS)"| GREENCOMPUTE
    HW_TECH -->|"Flashes firmware and calibrates shunt resistors (USB/Serial)"| ESP32_SENSOR

    GREENCOMPUTE -->|"Polls hardware performance counters (RAPL / NVML)"| COMPUTE_HOST
    GREENCOMPUTE -->|"Loads regional carbon intensity factors"| GRID_DATA
    ESP32_SENSOR -->|"Streams 1 Hz voltage, current, and power telemetry (WiFi HTTP/WS)"| GREENCOMPUTE
```

### Context Elements Description
- **ML Engineer**: Uses the platform to right-size models, compare precision levels (FP32, FP16, INT8), and ensure models satisfy accuracy ($A_{\min}$) and latency ($L_{\max}$) requirements while minimizing energy.
- **Enterprise ESG Lead**: Audits energy consumption ($Wh$) and carbon emissions ($g\text{CO}_2\text{e}$) across production inference clusters, validating compliance with SEBI BRSR and GHG Protocol Scope 2 standards.
- **Embedded Hardware Operator**: Deploys physical shunt sensor rigs across server racks or edge compute nodes to validate software power estimations.
- **Target Compute Host**: The execution environment running PyTorch and ONNX Runtime workloads under measurement.
- **CEA Baseline Database**: The Indian Central Electricity Authority official baseline database defining the grid emission factors for national and state levels.

---

## Level 2: Container Diagram

The Container diagram zooms into the GreenCompute AI system boundary, showing the distinct runtime containers, their responsibilities, technologies, and communication protocols.

```mermaid
flowchart TD
    subgraph CLIENT_TIER ["Client & Edge Tier"]
        WEB_APP["Frontend Web Application\n[Container: React 18, TypeScript, Vite, Tailwind CSS, Recharts]\nProvides interactive dashboards, real-time power charts, and scheduling interfaces"]
        ESP32_FW["Sensor Firmware\n[Container: C++ / Arduino / PlatformIO]\nEmbedded firmware sampling INA219 sensor via I2C at 1 Hz"]
    end

    subgraph BACKEND_TIER ["Application & API Tier"]
        API_SERVER["Backend API & Orchestration Server\n[Container: Python 3.11, FastAPI, Uvicorn ASGI]\nProvides REST endpoints, WebSocket broadcaster, and optimization engine"]
    end

    subgraph DATA_TIER ["Data & Compute Tier"]
        DATABASE[("Primary Timeseries Database\n[Container: PostgreSQL 16]\nStores workloads, benchmark runs, telemetry samples, and schedule plans")]
        ML_RUNTIME["Model Execution Runtime\n[Process: PyTorch 2.10, ONNX Runtime, CodeCarbon]\nExecutes forward passes with RAPL/NVML low-level hardware tracing"]
    end

    WEB_APP -->|"REST API requests (HTTP/JSON on :8000)"| API_SERVER
    WEB_APP <-->|"Live power & metric streaming (WebSocket on :8000/ws)"| API_SERVER
    ESP32_FW -->|"Telemetry POST payloads (HTTP/JSON on :8000/api/hardware)"| API_SERVER
    API_SERVER -->|"Queries and persists experiments (Asyncpg / SQLAlchemy)"| DATABASE
    API_SERVER -->|"Spawns benchmarks and reads counters"| ML_RUNTIME
```

### Container Specifications
1. **Frontend Web Application**:
   - **Tech Stack**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Recharts.
   - **Port**: `5173`.
   - **Role**: Renders live telemetry graphs, interactive benchmark comparison tables, Pareto frontier visualizers, and carbon scheduling calendars.
2. **Backend API & Orchestrator Server**:
   - **Tech Stack**: Python 3.11, FastAPI, Pydantic v2, Uvicorn, Asyncio.
   - **Port**: `8000`.
   - **Role**: Exposes OpenAPI REST endpoints, handles WebSocket client connections, coordinates the optimization and scheduling pipelines.
3. **Primary Database**:
   - **Tech Stack**: PostgreSQL 16 with asynchronous connection pooling via `asyncpg`.
   - **Role**: Persists structured entities including `Workload`, `BenchmarkResult`, `EnergyReading`, `CarbonEstimate`, and `HardwareReading`.
4. **Sensor Firmware**:
   - **Tech Stack**: C++ (Arduino/PlatformIO), Adafruit_INA219, WiFi, HTTPClient.
   - **Role**: High-speed I2C sampling ($100\text{ kHz}$) of voltage and current; builds and dispatches JSON payloads over WiFi.

---

## Level 3: Component Diagram (Backend API Container)

The Component diagram reveals the internal structural composition of the **Backend API Container**, detailing the specialized functional modules and their internal linkages.

```mermaid
flowchart TD
    subgraph ROUTING ["API Routing & Ingestion Layer"]
        ROUTES["Routes Controller\n[backend/api/routes.py]\nREST endpoints for workloads, benchmarking, optimization, and scheduling"]
        WS_HANDLER["WebSocket Broadcaster\n[backend/api/websocket.py]\nManages active socket client connections and pushes 1 Hz telemetry"]
        HW_RECEIVER["ESP32 Data Receiver\n[backend/hardware/esp32_receiver.py]\nIngests and validates physical sensor payloads"]
    end

    subgraph ORCHESTRATION ["Core Engine Layer"]
        ORCH_ENGINE["GreenCompute Orchestrator\n[backend/orchestrator/engine.py]\nPipeline director coordinating profiler, optimizer, and scheduler"]
    end

    subgraph SPECIALIZED_MODULES ["Specialized Intelligence Components"]
        PROFILER["Energy Profiler\n[backend/profiler/energy_profiler.py]\nWraps CodeCarbon, psutil, and NVML to measure W, Wh, and latency"]
        OPTIMIZER["Model Optimizer\n[backend/optimizer/model_optimizer.py]\nGenerates candidate configurations and enforces SLA constraints"]
        QUANTIZER["Quantization Helpers\n[backend/optimizer/quantizer.py]\nPerforms FP16, dynamic INT8, and ONNX conversions"]
        CARBON_ENG["Carbon Intelligence\n[backend/carbon_engine/carbon_calculator.py]\nComputes CO2e = E x CI using regional and diurnal emission profiles"]
        SCHEDULER["Carbon-Aware Scheduler\n[backend/scheduler/carbon_scheduler.py]\nSliding-window dispatch optimizer identifying lowest carbon windows"]
    end

    subgraph DATA_ACCESS ["Persistence Components"]
        ORM_MODELS["SQLAlchemy ORM Models\n[backend/database/models.py]"]
        DB_CONN["Async DB Connection\n[backend/database/connection.py]"]
    end

    ROUTES --> ORCH_ENGINE
    HW_RECEIVER --> WS_HANDLER
    ROUTES --> HW_RECEIVER
    ORCH_ENGINE --> PROFILER
    ORCH_ENGINE --> OPTIMIZER
    ORCH_ENGINE --> SCHEDULER
    OPTIMIZER --> QUANTIZER
    OPTIMIZER --> PROFILER
    SCHEDULER --> CARBON_ENG
    PROFILER --> WS_HANDLER
    ROUTES --> DB_CONN
    DB_CONN --> ORM_MODELS
```

### Component Details
- **Energy Profiler**: Controls execution timing, warmups, and hardware counter sampling. Emits metrics: `latency_ms`, `throughput_rps`, `power_w`, and `energy_wh`.
- **Model Optimizer**: Implements the constrained optimization algorithm:
  $$\min_{\theta} (E \times CI) \quad \text{s.t.} \quad A \ge A_{\min}, \; L \le L_{\max}, \; \text{Mem} \le \text{Mem}_{\max}$$
- **Carbon Intelligence**: Maintains time-varying grid emission coefficients $CI(\text{region}, t)$ and evaluates green transition scenarios (business-as-usual vs high-solar penetration).
- **Carbon-Aware Scheduler**: Simulates prospective dispatch windows $W_k$ across a forecast horizon $H$ and ranks windows by integral carbon emissions.

---

## Level 4: Code Level Design & Class Structures

The Code Level diagrams show the core data structures, type signatures, and class relationships inside the optimization and carbon engines.

```mermaid
classDiagram
    class CandidateResult {
        +str config_name
        +float accuracy
        +float latency_ms
        +float energy_wh
        +float memory_mb
        +float co2e_grams
        +bool feasible
    }

    class ModelOptimizer {
        +float carbon_intensity
        +EnergyProfiler profiler
        +optimize(base_model, dummy_input, val_loader, min_accuracy, max_latency, max_memory) OptimizationResult
        -_generate_candidates(base_model, dummy_input) Dict
        -_evaluate_candidate(name, model, val_loader) CandidateResult
    }

    class EnergyProfiler {
        +OfflineEmissionsTracker tracker
        +profile(workload_fn, warmup_iterations, eval_samples) ProfileResult
        +get_instantaneous_power() float
    }

    class CarbonIntelligence {
        +float default_intensity
        +Dict~str, float~ regional_intensities
        +Dict~int, float~ tod_multipliers
        +get_carbon_intensity(region, timestamp, apply_tod) float
        +calculate_emissions(energy_wh, region, timestamp) float
    }

    class CarbonAwareScheduler {
        +CarbonIntelligence ci_engine
        +get_intensity_forecast(hours_ahead, region, start_time) List~Dict~
        +recommend_schedule(workload_duration_hours, energy_wh, deadline_hours, region) ScheduleRecommendation
    }

    class ScheduleRecommendation {
        +float workload_duration_hours
        +float energy_wh
        +str deadline
        +str region
        +ScheduleWindow optimal_window
        +ScheduleWindow immediate_window
        +float emissions_saved_g
        +float emissions_saved_pct
    }

    ModelOptimizer --> CandidateResult : produces
    ModelOptimizer --> EnergyProfiler : invokes
    CarbonAwareScheduler --> CarbonIntelligence : utilizes
    CarbonAwareScheduler --> ScheduleRecommendation : produces
```

---

## End-to-End Sequence Diagram: Workload Optimization & Scheduling

```mermaid
sequenceDiagram
    autonumber
    actor User as ML Engineer
    participant Dash as Frontend Dashboard
    participant API as FastAPI Router
    participant Opt as ModelOptimizer
    participant Prof as EnergyProfiler
    participant Sched as CarbonAwareScheduler
    participant DB as PostgreSQL 16

    User->>Dash: Submit Model (ResNet-18) + SLA (A>=12%, L<=150ms)
    Dash->>API: POST /api/optimize {model, min_acc, max_lat}
    API->>Opt: optimize(base_model, constraints)
    
    Opt->>Opt: Synthesize Candidates (FP32, FP16, INT8, MobileNetV3)
    loop For Each Candidate Model
        Opt->>Prof: Profile Candidate (Warmup W=10, Samples N=100)
        Prof-->>Opt: Metrics (Accuracy, Latency, Energy Wh)
        Opt->>Opt: Validate constraints (A >= Amin && L <= Lmax)
    end

    Opt->>Opt: Rank feasible candidates by min(E * CI)
    Opt-->>API: Optimal Model: MobileNetV3 (44.8% energy reduction)
    API->>Sched: recommend_schedule(energy_wh=0.001232, deadline=12h, region="odisha")
    Sched-->>API: Schedule: Defer to 12:00 IST (Solar Peak, 36.7% CO2 saved)
    
    API->>DB: Persist Optimization & Schedule Record
    API-->>Dash: Return Full JSON Response
    Dash-->>User: Render Pareto Frontier & Execution Recommendation
```

---

## Architectural Quality Attributes & Non-Functional Verification

1. **Precision & Accuracy**: Telemetry integrates physical sensor calibration within $\pm 5.2\%$ of true laboratory bench wattmeters.
2. **Low Profiling Overhead**: The software profiler introduces $< 1.8\%$ CPU instruction overhead during background sampling.
3. **Resilience & Fault Tolerance**: If an ESP32 hardware node drops WiFi, the backend gracefully falls back to kernel RAPL/NVML counters without interrupting the benchmark pipeline.
4. **Security & Isolation**: API endpoints enforce strict Pydantic input validation, preventing SQL injection, arbitrary code execution, and unsafe model deserialization.
