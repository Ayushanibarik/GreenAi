# GREEN AI — API & Functionality Map (Phase 1)
**Document ID:** AUDIT-API-004  
**Author:** Multidisciplinary Product Engineering Team  
**Date:** 2026-11-14  
**Project:** GREEN AI (GreenCompute AI)  

---

## 1. Overview & Architectural Principle

A core finding of the Phase 1 audit is that the **backend computing, profiling, and optimization engine is extraordinarily comprehensive and completely functional**. It implements:
- Real-time hardware shunt ingestion (`ESP32Payload` $\rightarrow$ `Texas Instruments INA219` high-side DC current sensor).
- Software profiler using `pynvml` (NVIDIA GPU power & memory) and `psutil` (CPU & RAM).
- Trained Ridge regression resource predictor (`ml/prediction/resource_predictor.py`) predicting latency, energy, and memory with confidence scores.
- Constrained multi-objective Pareto optimizer (`backend/optimizer/model_optimizer.py`).
- Central Electricity Authority (CEA) Baseline v19 carbon calculator and diurnal solar forecast dispatcher.
- Async WebSocket telemetry bus (`/ws/telemetry`) streaming at 1Hz or 10Hz.

However, the frontend currently has a **bifurcated connection status**: some endpoints are genuinely integrated, while others are shadowed by mock state or `setTimeout` stubs.

Below is the definitive mapping between backend contracts, frontend services, and UI components.

---

## 2. API Contract & Frontend Integration Matrix

| Backend Endpoint | HTTP Method | Request / Response Schema | Frontend Service (`api.ts`) | Consuming Page / Component | Genuine Connection Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/health` | `GET` | `HealthResponse` (status, version, default_ci, gpu_available) | `api.health()` | Used in health diagnostics. | **Connected.** Returns 200 OK with GPU availability and CEA baseline. |
| `/api/workloads` | `GET` | Returns `List[Dict]` (id, name, framework, baseline_power, optimized_power, region, co2e_reduction_pct) | `api.getWorkloads()` | `Dashboard.tsx`, `WorkloadPage.tsx` | **Partially Connected.** `api.ts` defines the function, but `Dashboard.tsx` and `WorkloadPage.tsx` currently initialize with hardcoded local arrays! Needs direct wiring. |
| `/api/workloads` | `POST` | `WorkloadRequest` $\rightarrow$ `WorkloadPlan` (triggers full end-to-end `GreenComputeOrchestrator` pipeline) | `api.submitWorkload(data)` | `WorkloadPage.tsx` | **Shadowed.** The form currently uses a mock `setTimeout(600ms)`. Needs direct dispatch to `api.submitWorkload`. |
| `/api/benchmark` | `POST` | `BenchmarkRequest` (workload_name, matrix_dim, iterations, region) $\rightarrow$ `BenchmarkResponse` | `api.runBenchmark(id)` | `BenchmarkPage.tsx` | **Connected.** Executes synthetic GEMM benchmarks and measures execution time, power, and CO₂e. |
| `/api/benchmark/run` | `POST` | `BenchmarkRunRequest` (model_name, precision, samples, repeats, batch_size, synthetic, region) | Custom payload in background | `BenchmarkPage.tsx` | **Partially Connected.** Endpoint is live on backend; frontend button currently simulates execution with a 1200ms timer. |
| `/api/benchmarks/summary` | `GET` | Aggregated JSON summary across all benchmark runs in `benchmarks/reports/` | `api.getBenchmarksSummary()` | `BenchmarkPage.tsx` | **Connected.** Returns empirical telemetry records. |
| `/api/predict` | `POST` | `PredictRequest` (model_name, precision, batch_size, samples, region) $\rightarrow$ `PredictResponse` | `api.predict(params)` | `OptimizerPage.tsx` | **Connected.** Invoked via "Recompute ML Predictor" button; calls trained machine learning predictor model. |
| `/api/optimize` | `POST` | `OptimizeRequest` (model_architecture, accuracy_min, latency_max_ms, memory_max_mb, region) $\rightarrow$ `OptimizeResponse` | `api.optimize(params)` | `OptimizerPage.tsx` | **Connected.** Synchronized via `useEffect` in `OptimizerPage.tsx`; returns Pareto frontier and optimal configuration. |
| `/api/carbon/calculate` | `POST` | `CarbonCalcRequest` (energy_wh, region, hour_of_day) $\rightarrow$ `CarbonCalcResponse` | `api.getCarbonEstimates()` | `CarbonPage.tsx` | **Connected.** Returns regional grid conversion, CO₂e in grams, and regional comparisons. |
| `/api/carbon/intensity` | `GET` | `current_intensity`, `region`, `timestamp`, `grid_type` | Referenced in constants | `CarbonPage.tsx`, `Layout.tsx` | **Connected.** Returns current CEA baseline grid factor for India/Odisha (0.82 kg/kWh). |
| `/api/schedule` | `POST` | `ScheduleRequest` (energy_wh, duration_hours, deadline_hours, region) $\rightarrow$ `ScheduleRecommendation` | `api.getScheduleRecommendation()` | `CarbonPage.tsx` | **Connected.** Invoked on "Dispatch to Carbon-Aware Scheduler"; returns recommended green solar window. |
| `/api/schedule/forecast` | `GET` | 24-hour diurnal carbon intensity curve for region | Available on backend | `CarbonPage.tsx`, `CarbonScheduleChart.tsx` | **Partially Connected.** Chart uses high-fidelity constant `ODISHA_24H_DATA` (CEA Baseline v19); can dynamically refresh from endpoint. |
| `/api/hardware/telemetry` | `POST` | `ESP32Payload` (voltage, current, power, energy, device_id) | `api.postHardwareTelemetry()` | `HardwarePage.tsx`, Hardware Simulator | **Connected.** Ingests physical 10Hz readings, stores in rolling buffer, and broadcasts over WebSocket. |
| `/api/hardware/summary` | `GET` | `HardwareMetricsSummary` (avg_power_w, min_power_w, max_power_w, total_energy_wh, sample_count) | `api.getHardwareReadings()` | `HardwarePage.tsx` | **Connected.** Returns rolling statistics over active hardware session. |
| `/ws/telemetry` | `WebSocket` | Real-time JSON stream (`cpu_percent`, `gpu_percent`, `gpu_power_w`, `ram_used_mb`, `power_w`, `voltage_v`, `cumulative_energy_wh`) | `useTelemetryWebSocket` hook | `Layout.tsx`, `Dashboard.tsx`, `EnergyGauge.tsx` | **Connected.** Real-time 1-second broadcast loop actively streaming when clients connect. |

---

## 3. Preservation Invariants for Redesign (Non-Negotiable)

During the Phase 2–9 execution, the following rules must strictly govern frontend engineering:
1. **Never mutate existing endpoint paths or HTTP verbs** in `backend/api/routes.py` or `backend/api/websocket.py`.
2. **Preserve the `useTelemetryWebSocket` payload contract**: Any refactored telemetry store must consume `type: 'telemetry_tick'`, `power_w`, `voltage_v`, `current_ma`, `cpu_percent`, `gpu_percent`, and `cumulative_energy_wh`.
3. **Preserve the Multi-Objective Mathematical Formulation**:
   The Pareto optimization scoring equation:
   $$\text{Score} = \alpha \left(\frac{E}{E_0}\right) + \beta \left(\frac{L}{L_0}\right) + \gamma (1 - A) + \delta \left(\frac{M}{M_0}\right)$$
   and constraint checking ($A \ge A_{\min}, L \le L_{\max}, M \le M_{\max}$) must remain mathematically identical.
4. **Preserve Carbon Emission Equations**:
   $$CO_2e\text{ (kg)} = E\text{ (kWh)} \times CI\text{ (kg }CO_2e/\text{kWh)}$$
   $$\text{Emissions Avoided} = E \times (CI_{\text{immediate}} - CI_{\text{optimal}})$$
   Must accurately reflect the Central Electricity Authority (CEA) Baseline Database for Indian Power Sector.
5. **Implement Graceful Offline / Fallback Buffering**:
   If the FastAPI backend is running in offline demo mode (or backend server is stopped during frontend-only editing), the frontend must seamlessly display authentic benchmark datasets rather than crashing or rendering blank error pages.
