# Functional QA Review: Edge Cases, Input Validation & State Synchronization
**Auditor**: Head of Quality Assurance & Testing Group (`head-qa-testing` / Department `[QA]`)  
**Product**: GREEN AI Enterprise Observability Suite  
**Scope**: Manual & Automated QA Verification, Edge Cases, Boundary Testing, Input Sanitization  
**Date**: November 2026  

---

## 1. Executive Summary & Test Pass Verification

The GREEN AI test harness currently consists of:
- **Backend Test Suite**: 72 automated pytest tests executing in ~66 seconds (`python -m pytest tests/ -q`), covering data ingestion, RAPL reading, carbon modeling, Pareto optimization, and REST API endpoints. All 72 tests pass (100% success rate).
- **Frontend Build Verification**: TypeScript static type checking (`tsc -b`) and Vite production bundle compilation (`vite build`) complete with zero errors and zero warnings.

This functional QA audit focused on **runtime edge cases**, user input validation, state synchronization across routes, and fault tolerance during network outages.

---

## 2. Edge Case & Boundary Value Analysis

### 2.1 Workload Submission Edge Cases (`WorkloadPage.tsx`)
- **Case 1: Empty Workload Name**:
  - Behavior: Form enforces `required` attribute. If bypassed via script, fallback names default to `'Untitled Benchmark Workload'`.
  - Severity: Handled safely.
- **Case 2: Special Characters in Workload Name**:
  - Test Input: `<script>alert('xss')</script>`, `Test -- drop table workloads;`, unicode emojis 🍃⚡.
  - Behavior: Rendered safely as escaped text nodes by React DOM. Zero script execution.
  - Severity: PASS.
- **Case 3: Extreme Numeric Ranges**:
  - Test Input: Accuracy = 0%, Latency = 999999ms, Energy = 0.0001 Wh.
  - Behavior: Formats gracefully with fixed decimal filters (`.toFixed(1)`).
  - Severity: PASS.

### 2.2 Pareto Optimizer Boundary Testing (`OptimizerPage.tsx`)
- **Case 1: Impossible Constraints**:
  - Test Scenario: Set `Min Accuracy = 99%`, `Max Latency = 10ms`, `Max Memory = 128MB`.
  - Result: 0 candidate models satisfy all three criteria (`feasibleCandidates.length === 0`).
  - Observed Behavior: The UI falls back to `evaluatedCandidates[0]` (the baseline).
  - Defect Found: The UI does not clearly state that the baseline was selected because zero models met the user's extreme constraints.
  - QA Remediation: Display an amber alert banner: *"Constraint Conflict: No candidate meets all 3 criteria. Showing baseline."*

### 2.3 Regional Carbon Dispatch Boundaries (`CarbonPage.tsx`)
- **Case 1: Deadline Equal to or Less Than Duration**:
  - Test Scenario: Set `Duration = 6 hours`, `Deadline = 4 hours`.
  - Observed Behavior: The component code includes `Math.max(durationHours, parseInt(e.target.value, 10))`. The slider automatically clamps the deadline so it cannot precede the duration.
  - Severity: Handled cleanly.

### 2.4 Offline & Network Disconnection Testing
- **Scenario**: Simulate complete backend server shutdown (`net stop` or invalid API URL).
  - Telemetry Socket: Switches to internal 10Hz synthetic generator within 3 seconds. Page continues rendering live power waveforms without freezing.
  - Workloads Table: Renders cached local workloads array.
  - Optimization API: Executes client-side Pareto loss calculation without crashing.
  - Severity: Highly Resilient.

---

## 3. Responsive Breakpoint & Cross-Browser Verification

| Viewport / Device | Breakpoint | Header & Sidebar Behavior | Grid & Table Layout | Chart Responsiveness |
| :--- | :---: | :--- | :--- | :--- |
| **Mobile (390px - iPhone 14)** | `< 640px` | Sidebar collapses to drawer; hamburger menu functional | Tables scroll horizontally with `overflow-x-auto` | Charts resize cleanly via `<ResponsiveContainer>` |
| **Tablet (768px - iPad)** | `768px - 1024px`| Compact icon sidebar; breadcrumbs visible | 2-column KPI grids; side-by-side charts stack | Gauge scales proportionally |
| **Desktop (1440px - Retina)** | `1440px+` | Persistent expanded sidebar | Full 4-column KPI layout; multi-pane dashboard | High-DPI crisp SVG line rendering |

---

## 4. QA Actionable Defect Register
1. **Defect QA-01**: In `WorkloadPage.tsx`, fast double-clicking the "Submit" button can trigger duplicate workload creation requests if network latency is high.
   - *Fix*: Disable the submit button immediately upon form submission (`disabled={isSubmitting}`).
2. **Defect QA-02**: In `SettingsPage.tsx`, entering negative baseline carbon intensity (e.g., `-0.5`) is allowed by the input field.
   - *Fix*: Add `min="0.01"` validation constraint on the input.
