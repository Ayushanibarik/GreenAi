# GREEN AI — Page Inventory & Functional Assessment (Phase 1)
**Document ID:** AUDIT-PAGE-002  
**Author:** Multidisciplinary Product Engineering Team  
**Date:** 2026-11-14  
**Project:** GREEN AI (GreenCompute AI)  

---

## 1. Overview of Existing Application Routes

The platform currently mounts 7 top-level client routes within a shared `Layout` wrapper (`frontend/src/App.tsx`):
1. `/` — Executive Overview (Dashboard)
2. `/workloads` — Workload Pipeline & Queue Management
3. `/benchmark` — Model Benchmark Matrix
4. `/optimizer` — Constrained Model Pareto Optimizer
5. `/carbon` — Regional Carbon Intelligence & Dispatcher
6. `/hardware` — Edge Telemetry & Physical Oscilloscope
7. `/settings` — System Preferences & Governance Policies

Below is an exhaustive technical audit of each route.

---

## 2. Page-by-Page Audit & Inventory

### Page 1: Executive Overview (Dashboard)
- **Route:** `/`
- **File:** `frontend/src/pages/Dashboard.tsx`
- **Primary Purpose:** Provide an immediate high-level overview of live telemetry, aggregate energy savings, carbon avoidance, recent workload executions, and power consumption distribution.
- **Main Components:**
  - `Hero Banner` (high-level value proposition callout)
  - `MetricCard` (Energy Saved, Carbon Avoided, Governed Workloads)
  - `EnergyTimeChart` (24-hour time-series power trace: baseline vs optimized)
  - `EnergyGauge` (Circular SVG activity meter for instantaneous power draw)
  - `Recent Workload Table` (Summary of latest executions)
- **Data Dependencies:**
  - `useTelemetry()` context for `telemetry.power_w`.
  - Static internal array `recentWorkloads` (4 mocked items).
  - Static fallback data in `EnergyTimeChart`.
- **User Interactions:**
  - Click "Review options" link to `/optimizer`.
  - Click "View all" link to `/workloads`.
- **Existing Visual Problems:**
  - Hero card text uses colloquial marketing copy ("Run your systems with clarity") rather than technical observability insights.
  - Hardcoded dark theme styles (`bg-white/[0.02]`, `text-white`, `border-white/10`).
  - No indication of measurement uncertainty or data origin (hardware shunt vs software simulation).
- **Functional Problems:**
  - Does not query `api.getWorkloads()` or `api.getBenchmarksSummary()` on mount; relies on a static in-memory array.
  - Recent activity items are generic ("Product image review") instead of actual ML models (ResNet, BERT, YOLO, MobileNet).
- **Responsiveness Problems:**
  - Table overflows horizontally on mobile devices without clear column prioritization.
  - Top metric grid shifts abruptly on narrow tablet viewports (3-column layout leaves uneven gaps).
- **Audit Verdict:** **REFACTOR & ELEVATE.** Retain core information architecture, but rewire to backend workload history, restore research-grade ML nomenclature, and implement full light/dark theme tokens.

---

### Page 2: Workload Pipeline & Queue Management
- **Route:** `/workloads`
- **File:** `frontend/src/pages/WorkloadPage.tsx`
- **Primary Purpose:** Manage the submission, tracking, SLA configuration, and execution status of AI model training and batch inference workloads.
- **Main Components:**
  - Top header with "Submit New Workload" trigger.
  - Search and filter bar (Search query + status dropdown).
  - Workload Data Table with `StatusBadge`.
  - Workload Submission Modal (Name, Architecture, Quantization precision, Accuracy SLA slider, Latency SLA slider).
- **Data Dependencies:**
  - Internal state `mockWorkloads` (5 mocked items).
  - `api.submitWorkload` exists in `api.ts` but is bypassed by a local `setTimeout` state update!
- **User Interactions:**
  - Text search filter by workload name/ID.
  - Status dropdown filtering (`all`, `completed`, `running`, `pending`, `failed`).
  - Open/close workload submission modal.
  - Sliders for Min Accuracy SLA (80-99%) and Max Latency SLA (10-500ms).
  - Submit new workload form.
- **Existing Visual Problems:**
  - Modal uses a dark overlay that breaks contrast in light theme.
  - Form inputs are raw styled HTML elements lacking validation feedback or helper tooltips.
  - Workload names are non-technical ("Customer note review", "Monthly content export").
- **Functional Problems:**
  - Form submission does not dispatch to `POST /api/workloads`! It only adds a mock object to local React state, which is lost on page reload.
  - No connection to backend workload persistence database.
- **Responsiveness Problems:**
  - Table is wide (8 columns); shrinks uncomfortably on tablet screens without a stacked mobile card alternative.
- **Audit Verdict:** **REFACTOR & RECONNECT.** Connect directly to `api.getWorkloads()` and `api.submitWorkload()`, add actual backend submission with offline demo fallback, and polish the submission modal into an accessible dialog.

---

### Page 3: Model Benchmark Matrix
- **Route:** `/benchmark`
- **File:** `frontend/src/pages/BenchmarkPage.tsx`
- **Primary Purpose:** Enable empirical comparison across precision tiers (FP32, FP16, INT8, ONNX Runtime) across latency, throughput, energy per sample, and accuracy retention.
- **Main Components:**
  - Model family selector dropdown (`ResNet-18`, `MobileNet-V3`, `BERT-Base`, `Whisper-Tiny`).
  - "Run Benchmark" action button with spinner state.
  - Head-to-Head Highlight Metric Cards (Energy Reduction %, Latency Speedup %, Accuracy Delta).
  - `ModelComparisonChart` (dual-axis energy vs latency bar chart).
  - Empirical Telemetry Data Table.
- **Data Dependencies:**
  - `defaultBenchmarks` array.
  - `api.getBenchmarksSummary()` and `api.runBenchmark()` available in `api.ts`.
- **User Interactions:**
  - Select active model architecture.
  - Trigger "Run Benchmark" execution.
- **Existing Visual Problems:**
  - The dropdown labels are colloquial ("Image processing", "Content generation") instead of canonical model names ("ResNet-50", "BERT-Base").
  - Table headers lack mathematical units in column titles (e.g. `Throughput (req/s)`, `Latency (ms)`).
- **Functional Problems:**
  - "Run Benchmark" button runs a fake `setTimeout(1200ms)` rather than triggering `POST /api/benchmark/run`.
- **Responsiveness Problems:**
  - Bar chart can clip labels on screens below 640px width.
- **Audit Verdict:** **REFACTOR.** Wire to backend benchmark reports (`/api/benchmarks/summary`), connect trigger button to background execution API, and standardize data grid columns.

---

### Page 4: Constrained Model Pareto Optimizer
- **Route:** `/optimizer`
- **File:** `frontend/src/pages/OptimizerPage.tsx`
- **Primary Purpose:** Evaluate candidate neural network configurations against user-defined SLA constraints (Min Accuracy, Max Latency, Max Memory) and multi-factor objective weights ($\alpha$ Energy, $\beta$ Latency, $\gamma$ Accuracy penalty, $\delta$ Memory footprint) to recommend the optimal Pareto-efficient deployment.
- **Main Components:**
  - SLA Constraint Sliders (Accuracy, Latency, Memory).
  - Quick Optimization Preset Pills (`Edge ≤30ms`, `Balanced`, `High Accuracy`).
  - Objective Weight Sliders ($\alpha, \beta, \gamma, \delta$).
  - Side-by-Side Comparison: Baseline FP32 vs Recommended Green Configuration.
  - Full Architecture & Quantization Matrix Table with feasibility status badges.
- **Data Dependencies:**
  - `ALL_CANDIDATES` dataset (ResNet-18 and MobileNet-V3 configs across FP32, FP16, INT8, ONNX).
  - Synchronizes dynamically with `POST /api/optimize` via `useEffect`.
  - Fallback to local Pareto calculation if backend is unreachable.
- **User Interactions:**
  - Slider adjustments with live reactive updates.
  - Preset buttons that automatically configure thresholds.
  - "Apply Config" action.
  - "Recompute ML Predictor" trigger.
- **Existing Visual Problems:**
  - High information density without visual breathing room; sliders feel cramped in the left column.
  - Candidate table is very wide; non-feasible rows have a simple opacity reduction that can look like a visual bug on low-contrast screens.
- **Functional Problems:**
  - Highly functional! Correctly computes Pareto optimality:
    $$\text{Score} = \alpha \frac{E}{E_0} + \beta \frac{L}{L_0} + \gamma (1 - A) + \delta \frac{M}{M_0}$$
    Subject to: $A \ge A_{\min}, L \le L_{\max}, M \le M_{\max}$.
- **Responsiveness Problems:**
  - Layout is split 1:2 (`grid-cols-1 lg:grid-cols-3`); on mobile the slider panel pushes the recommendation below the fold.
- **Audit Verdict:** **RETAIN & REFINE.** The underlying mathematical logic is rock-solid. Re-architect the visual hierarchy with clear tabbed or stepped scientific panels, and support light/dark theme contrast.

---

### Page 5: Regional Carbon Intelligence & Dispatcher
- **Route:** `/carbon`
- **File:** `frontend/src/pages/CarbonPage.tsx`
- **Primary Purpose:** Convert computational energy consumption into real-world carbon emissions ($CO_2e = E \times CI$) using regional grid marginal emissions factors, and dynamically schedule flexible batch workloads into optimal green windows (solar peak generation).
- **Main Components:**
  - Active Grid Region Indicator (Odisha State Grid / Eastern Region, 0.82 kg/kWh).
  - Regional Highlights Cards (Current CI, Solar Window, Evening Fossil Peak, Solar Displacement Delta).
  - `CarbonScheduleChart` (24-hour diurnal curve comparing Odisha grid to All-India baseline).
  - Workload Execution Timing Controller (Duration slider, Completion deadline slider, Batch energy slider).
  - Side-by-Side Window Comparison (Immediate Coal Run vs Optimal Green Window).
  - `ScheduleHeatmap` (Interactive 24-hour hour-by-hour grid heatmap).
- **Data Dependencies:**
  - `ODISHA_24H_DATA` (24 hourly data points based on CEA Baseline v19).
  - Calls `api.getScheduleRecommendation()` (`POST /api/schedule`).
- **User Interactions:**
  - Workload duration, deadline, and energy volume sliders.
  - "Dispatch to Carbon-Aware Scheduler" button.
  - Clickable hour slots in 24h heatmap.
- **Existing Visual Problems:**
  - Hero card background glow overlaps with chart.
  - Sliders are basic HTML range inputs.
- **Functional Problems:**
  - Strong functionality; cleanly calculates avoided emissions and dispatches recommendations to the scheduler API.
- **Responsiveness Problems:**
  - 24-hour heatmap buttons wrap into 6 columns on mobile, causing vertical stretching. Needs horizontal scrolling track on small displays.
- **Audit Verdict:** **RETAIN & REFINE.** High scientific value; upgrade chart styling, improve heatmap responsive behavior, and enable light theme readability.

---

### Page 6: Physical Hardware Telemetry & Oscilloscope
- **Route:** `/hardware`
- **File:** `frontend/src/pages/HardwarePage.tsx`
- **Primary Purpose:** Provide microsecond-resolution hardware shunt measurement observability (voltage, current, power, energy) streaming from physical ESP32 + INA219 sensor testbeds.
- **Main Components:**
  - 4 Real-time Sensor Vitals Cards (Bus Voltage, Load Current, Power Draw, Accumulated Energy).
  - `HardwareTelemetryChart` (4-channel oscilloscope line chart with channel selector: All, Power, Current, Voltage, Energy).
- **Data Dependencies:**
  - `useTelemetry()` for live readings (`latest`) and ring buffer history (`hardwareHistory`).
- **User Interactions:**
  - Channel switching tabs on the oscilloscope chart.
- **Existing Visual Problems:**
  - Oversimplified: The previous version stripped out device connection details, I2C addresses, calibration accuracy, and raw packet feeds!
  - Lacks visual resemblance to high-precision hardware instruments (e.g. Keysight/Tektronix/Grafana).
- **Functional Problems:**
  - No hardware connection configuration controls (baud rate, COM port selection, sampling frequency setting).
  - No comparison showing physical shunt measurement vs software estimation delta (the fundamental empirical thesis of the project!).
- **Responsiveness Problems:**
  - 4 vitals cards collapse to 2x2 on mobile, which is acceptable, but the chart requires landscape viewing for detailed time-series inspection.
- **Audit Verdict:** **REBUILD.** Expand into a true **Edge Hardware Instruments Console** featuring device status (ESP32-WROOM-32D, INA219, 0.1Ω R100 shunt), live oscilloscope stream, physical vs software calibration delta, and recent packet inspector.

---

### Page 7: System Preferences & Governance Policies
- **Route:** `/settings`
- **File:** `frontend/src/pages/SettingsPage.tsx`
- **Primary Purpose:** Configure global platform parameters including regional grid emissions factors, multi-objective Pareto optimization weights ($\alpha, \beta, \gamma, \delta$), API base URLs, and WebSocket telemetry stream endpoints.
- **Main Components:**
  - Regional Grid Carbon Selector (Odisha ~0.82 kg/kWh, US-East ~0.38 kg/kWh, EU-Central ~0.28 kg/kWh, Custom).
  - Multi-Objective Weight Sliders.
  - Backend & Hardware Connection Endpoints.
  - Action Bar (Reset to Defaults, Save Configuration).
- **Data Dependencies:**
  - Local state initialized from constants.
  - Saves to local state; currently lacks persistent localStorage or backend sync.
- **User Interactions:**
  - Select grid region.
  - Sliders for $\alpha, \beta, \gamma, \delta$.
  - Text input for API URL and WebSocket URL.
  - Reset and Save buttons.
- **Existing Visual Problems:**
  - Grouped cards look sparse and lack visual hierarchy.
  - No theme toggle option!
- **Functional Problems:**
  - Saved settings are only stored in memory; refreshing the page resets them.
  - Does not emit an event to update global Pareto weights in `OptimizerPage` or `Layout`.
- **Responsiveness Problems:**
  - Acceptable on mobile, but could use a unified 2-column layout on wide desktop displays.
- **Audit Verdict:** **REFACTOR.** Add `localStorage` persistence, add Light/Dark/System theme selector, synchronize weights globally across the application, and improve form feedback.
