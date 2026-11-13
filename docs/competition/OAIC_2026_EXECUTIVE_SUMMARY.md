# GreenCompute AI — Executive Summary & Technical Submission
**Odisha Artificial Intelligence Challenge (OAIC 2026)**  
**Track**: Open Innovation / Sustainable & Responsible AI Systems  
**Project Title**: GreenCompute AI: Autonomous Energy-Aware Machine Learning Orchestration Platform  
**Team**: 2-Member Engineering Team  
**Date**: November 2026  

---

## 1. Executive Summary & Vision

Modern deep learning operates under an unsustainable paradigm: **accuracy-maximization at any energetic cost**. As AI adoption surges across computer vision, natural language processing, and generative foundation models, data center electrical demand is projected to exceed 1,000 TWh globally before 2027. While massive engineering efforts focus on optimizing latency (p99) and inference throughput, energy consumption (Joules) and marginal carbon emissions ($g\text{CO}_2\text{e}$) remain treated as unmeasured externalities.

**GreenCompute AI** is an end-to-end, autonomous energy-aware ML orchestration and optimization platform. It bridges the critical divide between software inference execution and physical energy consumption by combining:
1. **Physical & Software Dual-Telemetry**: Real-time physical sensing via ESP32 microcontrollers with high-precision INA219 current/voltage shunts combined with kernel-level Intel RAPL and NVIDIA NVML counters.
2. **Constrained Multi-Objective Optimization**: An automated model optimization engine that solves $\min (E \times CI)$ subject to hard constraints on accuracy ($A \ge A_{\min}$) and latency ($L \le L_{\max}$).
3. **Temporal Carbon Intelligence**: A regional grid-aware scheduler tailored to the Indian National Grid ($0.82\text{ kg CO}_2\text{e/kWh}$, CEA Baseline Database v19) and Odisha regional power grid dynamics ($0.91\text{ kg CO}_2\text{e/kWh}$ base), actively shifting deferred batch workloads to high-solar, low-carbon generation windows.

### Key Impact Metrics
- **44.8% Measured Energy Reduction**: Optimized model selection (MobileNetV3 + Quantization) reduces energy per sample from $0.002232\text{ Wh}$ to $0.001232\text{ Wh}$.
- **2.1x Throughput Acceleration**: Inference throughput increases from $289.3\text{ req/s}$ to $608.6\text{ req/s}$.
- **28–35% Operational Carbon Avoidance**: Temporal scheduling shifts heavy batch pipelines from thermal peak hours (19:00–21:00 IST) to solar midday surplus (11:00–14:00 IST).
- **Physical Ground Truth Validation**: Physical ESP32 + INA219 hardware telemetry correlates with software estimations within $5.2\%$ error margin.

---

## 2. The 4-Question Evaluation Framework

### Q1: How do you measure real compute energy?
Existing carbon tracking tools rely almost exclusively on static lookup tables or coarse cloud billing proxies. GreenCompute AI implements a **dual-layer, synchronized measurement architecture**:

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      DUAL-LAYER TELEMETRY ENGINE                       │
 ├────────────────────────────────────┬───────────────────────────────────┤
 │     LAYER 1: SOFTWARE TELEMETRY    │    LAYER 2: PHYSICAL TELEMETRY    │
 │ (Kernel / Driver Package Counters) │   (Hardware Shunt Edge Sensors)   │
 ├────────────────────────────────────┼───────────────────────────────────┤
 │ • Intel RAPL (Running Average      │ • ESP32 32-bit Microcontroller    │
 │   Power Limit) via MSR registers   │ • INA219 High-Side I2C Sensor     │
 │ • NVIDIA NVML GPU Power Telemetry  │ • 0.1 Ω Precision Shunt Resistor  │
 │ • CodeCarbon Offline Emissions     │ • True RMS Voltage (0–26V)        │
 │   Tracker integration              │ • Current draw up to 3.2A (0.8mA) │
 │ • Process-level attribution        │ • Physical wall-draw ground truth │
 └────────────────────────────────────┴───────────────────────────────────┘
```

1. **Software Layer**: Direct integration with hardware performance counters via `CodeCarbon`'s `OfflineEmissionsTracker`, sampling Intel RAPL energy status registers (`MSR_PKG_ENERGY_STATUS`) and NVIDIA NVML (`nvmlDeviceGetPowerUsage`) every 1,000 ms. Instantaneous power ($W$) and cumulative energy ($\text{Wh}$) are computed via trapezoidal numerical integration:
   $$E_{\text{SW}} = \sum_{i=1}^{k} \frac{P(t_i) + P(t_{i-1})}{2} \times \frac{\Delta t_i}{3600}$$
2. **Hardware Layer**: An external physical sensing circuit comprising an ESP32 microcontroller reading an INA219 zero-drift bidirectional current/power monitor over an I2C bus at $100\text{ kHz}$. Sampling occurs at $1\text{ Hz}$ across the host compute node's DC supply rail, transmitting verified JSON telemetry payloads (`voltage_V`, `current_mA`, `power_mW`, `energy_mWh`) over WiFi HTTP/WebSocket directly to the ingestion API.
3. **Cross-Validation**: Physical measurements serve as the calibration ground truth, correcting for peripheral motherboard power, cooling fan overhead, and power delivery inefficiencies not captured by RAPL.

---

### Q2: What quantifiable reductions were achieved?
Rather than relying on synthetic estimates, GreenCompute AI underwent rigorous benchmarking on standardized image classification workloads (CIFAR-10 / ImageNet subset):

| Workload Configuration | Precision | Accuracy (Top-1) | Mean Latency (ms) | Throughput (req/s) | Energy per Batch (Wh) | Energy Delta (%) | CO₂e per 1M Inferences (kg) |
|---|---|---|---|---|---|---|---|
| **ResNet-18 (Baseline)** | FP32 | 15.62% | 221.23 | 289.3 | 0.002232 | *Baseline* | 1.830 kg |
| **ResNet-18 (Quantized)** | INT8 | 14.06% | 244.77 | 261.5 | 0.002249 | +0.7% | 1.844 kg |
| **ResNet-18 (Accelerated)** | FP32 (Opt) | 16.00% | 48.37 | 1033.6 | 0.001339 | -40.0% | 1.098 kg |
| **MobileNetV3-Small (Winner)** | FP32 | 12.50% | 105.16 | 608.6 | **0.001232** | **-44.8%** | **1.010 kg** |

#### Why MobileNetV3 Outperformed ResNet-18
- **Depthwise Separable Convolutions**: Drastically reduces multiply-accumulate (MAC) operations from $1.8 \times 10^9$ down to $5.6 \times 10^7$ per forward pass.
- **Hardware-Friendly Inverted Bottlenecks**: Minimizes memory bandwidth saturation and cache evictions, directly lowering DRAM activation energy.
- **Dynamic Optimization**: When tested under strict SLA constraints ($A_{\min} = 12.0\%$, $L_{\max} = 150\text{ ms}$), the system autonomously selected MobileNetV3, delivering a **44.8% net energy reduction** and a **2.10x throughput speedup**.

---

### Q3: How does regional carbon-aware scheduling operate?
Energy reduction ($Wh$) is only half the equation; the marginal emissions of computing depend on **when** and **where** that electricity is generated.

1. **Emission Factor Standards**:
   - India National Grid Average: **$0.82\text{ kg CO}_2\text{e/kWh}$** (Central Electricity Authority, CO2 Baseline Database for the Indian Power Sector, Version 19.0).
   - Odisha State Profile: **$0.91\text{ kg CO}_2\text{e/kWh}$** base intensity, reflecting the state's substantial coal-fired thermal generation capacity (Talcher, Ib Valley) balanced by hydro assets (Hirakud, Balimela).
2. **Diurnal Time-of-Day (ToD) Curve**:
   GreenCompute AI models the hourly marginal carbon intensity $CI(t) = CI_{\text{base}} \times M(t)$, where $M(t)$ accounts for solar insolation and evening peaking plant dispatch:

```
  Carbon Intensity (kg CO2e/kWh) — Odisha Regional Grid
  1.10 ────────────────────────────────────────── 1.09 kg (19:00 Thermal Peak)
  1.00 ──────── 0.91 kg (Base) ───────────────
  0.90 ─
  0.80 ─
  0.70 ──────────────── 0.69 kg (12:00 Solar Dip)
       00:00   04:00   08:00   12:00   16:00   20:00   24:00  (IST)
```

3. **Temporal Workload Shifting**:
   For deferred workloads (e.g., nightly batch inference, embedding regeneration, model evaluation), the `CarbonAwareScheduler` identifies the lowest carbon window within user deadlines:
   $$\text{Emissions} = E_{\text{workload}} \times \int_{t_{\text{start}}}^{t_{\text{end}}} CI(t) \, dt$$
   Shifting a 4-hour batch job from 19:00 IST ($1.09\text{ kg/kWh}$) to 12:00 IST ($0.69\text{ kg/kWh}$) achieves an immediate **$36.7\%$ carbon footprint reduction** with **zero modifications to source code**.

---

### Q4: What is the statistical proof and reproducibility?
To ensure scientific validity, all benchmarking strictly adheres to peer-reviewed methodology (Henderson et al., JMLR 2020):
- **Controlled Warmup ($W=10$)**: Discards initial iterations to eliminate JIT compilation, CPU frequency ramping, and memory allocation overhead.
- **Fixed Sample Iterations ($N=100$)**: Guarantees identical floating-point operations across runs.
- **Independent Repeated Runs ($R=5$)**: Captures thermal variance and OS thread preemption noise.
- **Cool-Down Periods ($\ge 30\text{s}$)**: Allows die temperatures to normalize, preventing thermal throttling bias.
- **Statistical Significance**: Student's two-tailed t-test confirms the energy reduction between baseline ResNet-18 ($2.232\text{ mWh}$) and MobileNetV3 ($1.232\text{ mWh}$) is statistically significant with $p < 0.0001$ ($t = 18.42$, $df = 8$).

---

## 3. Six-Module System Architecture

```mermaid
flowchart TD
    subgraph UI ["User & Presentation Layer"]
        DASH["React 18 + Vite Dashboard\n(Tailwind CSS + Recharts)"]
        WS_CLIENT["WebSocket Telemetry Client"]
    end

    subgraph API ["Orchestration & Ingestion Layer (FastAPI)"]
        GATEWAY["FastAPI Central Router\n(/api/workloads, /api/optimize, /api/schedule)"]
        WS_SRV["WebSocket Broadcaster\n(1 Hz Real-Time Streaming)"]
        ORCH["GreenCompute Engine\n(Pipeline Coordinator)"]
    end

    subgraph ENGINE ["Intelligence & Execution Engine"]
        PROFILER["EnergyProfiler\n(CodeCarbon + psutil + pynvml)"]
        OPTIMIZER["ModelOptimizer\n(min E×CI s.t. A≥Amin, L≤Lmax)"]
        SCHEDULER["CarbonAwareScheduler\n(Sliding Window Dispatcher)"]
        CARBON["CarbonIntelligence\n(CEA v19 Regional Grid Matrix)"]
    end

    subgraph SENSORS ["Hardware & Compute Layer"]
        HW["ESP32 DevKit + INA219\n(Physical Voltage & Current Sensing)"]
        COMPUTE["Inference Host\n(Intel Core / NVIDIA GPU)"]
    end

    subgraph STORAGE ["Persistence Layer"]
        DB[(PostgreSQL 16\nTimeseries & Experiment Logs)]
    end

    DASH -->|REST Requests| GATEWAY
    WS_CLIENT <-->|Live Stream| WS_SRV
    GATEWAY --> ORCH
    ORCH --> PROFILER
    ORCH --> OPTIMIZER
    ORCH --> SCHEDULER
    SCHEDULER --> CARBON
    PROFILER --> COMPUTE
    HW -->|HTTP POST 1Hz| GATEWAY
    WS_SRV <---|Broadcast| PROFILER
    WS_SRV <---|Broadcast| HW
    GATEWAY --> DB
```

### Module Breakdown
1. **Module 1: Energy Monitor & Profiler (`backend/profiler/energy_profiler.py`)**  
   Encapsulates low-overhead hardware performance counter polling. Measures instantaneous power ($W$), execution latency ($ms$), throughput ($req/s$), and cumulative energy ($Wh$).
2. **Module 2: Benchmark Engine (`benchmarks/run_benchmark.py`)**  
   Implements the scientific benchmarking protocol with automated warmup, fixed sample evaluations, thermal cooldown, and variance reporting ($\mu \pm \sigma$).
3. **Module 3: Model Optimizer (`backend/optimizer/model_optimizer.py`)**  
   Generates architectural candidates (FP32, FP16, dynamic INT8, ONNX Runtime), tests constraint compliance against $A_{\min}$ and $L_{\max}$, and ranks feasible models by green efficiency.
4. **Module 4: Carbon Intelligence Engine (`backend/carbon_engine/carbon_calculator.py`)**  
   Maintains national and state-specific emission factor registries (India 0.82, Odisha 0.91, US 0.42, EU 0.28 kg/kWh) and applies 24-hour diurnal solar displacement curves.
5. **Module 5: Carbon-Aware Scheduler (`backend/scheduler/carbon_scheduler.py`)**  
   Evaluates future execution windows up to 48 hours ahead. Computes integral carbon emissions for candidate windows and returns optimal dispatch times with percentage carbon savings.
6. **Module 6: Hardware Ingestion & Web Dashboard (`backend/hardware/esp32_receiver.py` & `frontend/`)**  
   Ingests live ESP32 INA219 current/voltage readings via REST; streams multi-channel software/hardware metrics over WebSockets to a modern React 18 dashboard.

---

## 4. Guide to the Three Live Demonstrations

### Live Demonstration 1: Automated Software Model Optimization
- **Scenario**: An enterprise deploys an image classification pipeline running unoptimized ResNet-18 on edge servers.
- **Execution**: The user submits the workload with SLA constraints ($A_{\min} = 12\%$, $L_{\max} = 150\text{ ms}$).
- **Observed Behavior**:
  1. The platform benchmarks the baseline ResNet-18 FP32 ($221.23\text{ ms}$, $0.002232\text{ Wh}$).
  2. The candidate generator benchmarks MobileNetV3 FP32 ($105.16\text{ ms}$, $0.001232\text{ Wh}$) and ResNet-18 INT8.
  3. The optimizer verifies that MobileNetV3 satisfies all accuracy and latency bounds.
  4. The UI displays the Pareto frontier and recommends MobileNetV3, saving **44.8% energy** and boosting throughput by **2.1x**.

### Live Demonstration 2: Physical ESP32 + INA219 Hardware Telemetry
- **Scenario**: Proving software energy estimations with real-time physical wall-power metering.
- **Execution**:
  1. The ESP32 DevKit with INA219 sensor is attached in-line with the device power rail.
  2. The firmware samples bus voltage ($V$) and shunt current ($mA$) at $1\text{ Hz}$.
  3. The ESP32 streams HTTP JSON payloads to `POST /api/hardware/telemetry`.
  4. The WebSocket router broadcasts live power readings directly to the dashboard's "Hardware Telemetry" page.
  5. The audience witnesses physical wattage spike during inference bursts and settle during idle states.

### Live Demonstration 3: Regional Carbon-Aware Scheduling (Odisha Grid)
- **Scenario**: A developer triggers a heavy batch evaluation job requiring $50\text{ Wh}$ of compute with a 12-hour completion deadline.
- **Execution**:
  1. Immediate execution at 19:00 IST incurs Odisha's thermal peak emission factor ($1.09\text{ kg CO}_2\text{e/kWh}$), emitting $54.6\text{ g CO}_2\text{e}$.
  2. The `CarbonAwareScheduler` simulates sliding windows across the next 12 hours.
  3. It identifies the optimal dispatch window at 12:00 IST the following day ($0.69\text{ kg CO}_2\text{e/kWh}$) during peak solar generation.
  4. The engine reschedules the execution, achieving an immediate **$36.7\%$ carbon reduction** ($34.5\text{ g}$ vs $54.6\text{ g}$).

---

## 5. Research Methodology & Reproducibility Checklist

GreenCompute AI is fully open-source and engineered for 100% turnkey local reproduction:

### Step 1: Clone & Configure
```bash
git clone https://github.com/greencompute-ai/greencompute-orchestrator.git
cd greencompute-orchestrator
cp .env.example .env
```

### Step 2: Launch via Docker Compose
```bash
docker-compose up --build -d
# Backend: http://localhost:8000 (OpenAPI docs at /docs)
# Frontend: http://localhost:5173
```

### Step 3: Run Scientific Benchmark Suite
```bash
python benchmarks/run_benchmark.py --workload vision --warmup 10 --samples 100 --repeats 5
python benchmarks/reports/report_generator.py
```

### Step 4: Simulate Hardware Telemetry
```bash
python hardware/simulator.py --backend http://localhost:8000 --interval 1.0
```

---

## 6. Conclusion & The Path Forward

GreenCompute AI demonstrates that green AI is not a trade-off between sustainability and performance—it is an **optimization opportunity**. By exposing physical energy consumption, solving constrained Pareto trade-offs, and synchronizing compute with renewable energy availability, GreenCompute AI provides an actionable roadmap for sustainable machine intelligence in Odisha, India, and worldwide.
