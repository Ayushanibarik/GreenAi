# UX & Product Design Review: Ergonomics, Cognitive Load & Interaction Flows
**Auditor**: Chief Design Officer & UX Architecture Group (`head-design-creative` / Department `[DESIGN]`)  
**Product**: GREEN AI Enterprise Observability Suite  
**Evaluation Scope**: User Journeys, Cognitive Ergonomics, Empty & Error States, Interaction Design  
**Date**: November 2026  

---

## 1. Executive UX Diagnosis

Scientific computing applications frequently fall into one of two traps: either overwhelming the user with unformatted raw tabular telemetry (the "Unix terminal" trap) or masking technical realities behind toy-like, over-simplified consumer dashboards (the "SaaS landing page" trap).

GREEN AI has successfully established a clean, modern aesthetic with dual obsidian/porcelain color schemes. However, forensic UX examination identifies **several critical ergonomic and interaction weaknesses**:
1. **Low Information Density on Wide Screens**: On 1440px+ displays, several primary metrics and tables leave excessive empty space while cramming complex multivariate data into narrow columns.
2. **Missing Action Feedback & Optimistic Confirmations**: When triggering actions such as "Run Suite" on `BenchmarkPage.tsx` or "Schedule Workload" on `CarbonPage.tsx`, the interface provides brief timeouts (`setTimeout(..., 1000)`) without displaying state transitions, job IDs, or progress bars.
3. **Incomplete Empty State Design**: If the workload list is filtered to zero results (e.g., search term mismatch), several views render empty white space or an abrupt blank table body rather than an actionable empty state.
4. **Cognitive Disconnect Between Navigation Items**: The user frequently hops between "Benchmark", "Optimizer", and "Workloads" without clear contextual breadcrumbs showing how a benchmark run translates into an optimized workload.

---

## 2. Granular UX Breakdown by View

### 2.1 Dashboard (`/`)
- **Hierarchy Assessment**:
  - The top banner provides immediate orientation, but its 3 quick-action chips (`Optimizer`, `Scheduler`, `Hardware Bus`) lack visual cues that they are navigational shortcuts rather than system toggles.
  - The 4 KPI cards (`Energy Saved`, `CO₂ Avoided`, `Workloads`, `Power Draw`) have clear visual hierarchy, but the trend labels (`vs FP32`, `offset`, `under cap`) are inconsistent in phrasing.
  - The Recent Workloads table truncates long workload names without full-name hover tooltips.

### 2.2 Workloads Registry (`/workloads`)
- **Filter Ergonomics**:
  - The status filter tabs (`all`, `completed`, `running`, `pending`, `failed`) are rendered as inline button pills. When a filter yields 0 matches, the table renders a blank body with no explanation.
  - Recommendation: Implement a dedicated empty state: *"No workloads found matching '[query]'. Clear filters or submit a new run."*
- **Modal Ergonomics**:
  - The "Submit Workload" modal lacks field helper tooltips explaining the difference between `INT8 Quantized` and `ONNX Runtime` for novice users.

### 2.3 Pareto Optimizer (`/optimizer`)
- **Slider Interaction**:
  - The 7 sliders for constraints and loss weights provide immediate interactive recalculation of the Pareto frontier. This is a best-in-class UX pattern.
  - **Weakness**: When a user selects a preset (e.g., "Ultra-Low Edge"), the sliders update, but there is no visual indicator highlighting *which* preset is currently active.
  - The recommendation card at the bottom displays high-value metrics, but clicking "Deploy Configuration" shows only a temporary "Applied" badge without detailing what environment received the deployment.

### 2.4 Regional Carbon Dispatch (`/carbon`)
- **Mental Model & Visual Flow**:
  - Comparing the "Immediate Execution" window against the "Optimal Clean-Window" is intuitive and immediately communicates carbon savings.
  - **Weakness**: The 7-day × 24-hour heatmap (`ScheduleHeatmap.tsx`) provides rich grid intensity data, but hovering over a tile does not display an exact numerical value tooltip with the timestamp and carbon intensity in gCO₂/kWh.

### 2.5 Hardware Bus Console (`/hardware`)
- **Oscilloscope Interaction**:
  - The real-time chart updates smoothly at 10Hz.
  - **Weakness**: There is no "Pause / Freeze Stream" button. In scientific hardware testing, engineers must pause the oscilloscope stream to inspect transient voltage drops or current spikes.

---

## 3. Empty States, Error Boundaries & Micro-Interactions

| View | Current Behavior on Error / Empty | Prescribed Scientific UX Standard | Priority |
| :--- | :--- | :--- | :---: |
| **Workloads Table** | Blank table rows with raw border lines | Centered subtle card with `Inbox` icon, clear search button, and submission CTA | P1 |
| **Benchmark Chart** | Shows empty SVG coordinates if array empty | Skeleton loader with fallback demonstration notice | P2 |
| **Hardware Telemetry** | Displays static fallback object if disconnected | Visual pulse warning: "Hardware Disconnected · Emulating Baseline Bus" | P1 |
| **Pareto Optimizer** | Reverts to baseline config if 0 candidates feasible | Warning alert banner: "No candidates satisfy all constraints. Loosen latency or accuracy constraints." | P1 |

---

## 4. Key UX Action Items
1. **Add Telemetry Stream Freeze/Resume**: Provide a manual toggle on `HardwarePage.tsx` allowing researchers to inspect freeze-frame data points.
2. **Implement Informative Tooltips**: Add hover explanations on all technical acronyms (RAPL, PUE, CEA, INA219, FP16, INT8, ONNX).
3. **Unify Status Badges**: Standardize status badge colors and iconography across tables to avoid cognitive discordance.
