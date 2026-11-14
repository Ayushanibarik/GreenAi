# Consolidated Frontend Improvement Roadmap & Prioritization Matrix
**Product**: GREEN AI Enterprise Observability Suite (Standalone 2.6.0)  
**Document**: Master Engineering Roadmap  
**Governance**: Autonomous Enterprise Operating System  
**Date**: November 2026  

---

## 1. Remediation Prioritization Framework

All issues identified across the 12 departmental reviews and the Red-Team critique are consolidated and classified using the standard enterprise impact-effort matrix:
- **P0 (Critical / Blockers)**: Integrity compromises, scientific ambiguities, memory leaks, TypeScript type holes.
- **P1 (High Priority)**: User workflow blockers, missing empty states, export capabilities, bundle optimization, accessibility focus rings.
- **P2 (Medium Priority)**: Ergonomic polish, table style unification, interactive chart tooltips, stream pause controls.
- **P3 (Low Priority / Roadmap)**: External API keys, WebGPU browser benchmarks, multi-tenant authentication.

---

## 2. Master Improvement Matrix

| Issue ID | Priority | Domain / View | Description | Target Files | Assigned Department | Acceptance Criteria |
| :---: | :---: | :--- | :--- | :--- | :---: | :--- |
| **IMP-01** | **P0** | Global / Header | Telemetry Provenance Transparency: Clearly label whether live stream is `PHYSICAL SHUNT (10Hz)` or `SIMULATED TEST BENCH`. | `Layout.tsx`, `Sidebar.tsx`, `HardwarePage.tsx` | `[PROD]`, `[RND]` | Telemetry badge dynamically reflects provenance state with zero ambiguity. |
| **IMP-02** | **P0** | Workloads | Empty State Handling: Add actionable empty state when searches yield 0 results. | `WorkloadPage.tsx` | `[UX]`, `[QA]` | Searching for nonexistent term displays clean card with "Reset Filters" action. |
| **IMP-03** | **P0** | Engineering | TypeScript Strictness: Replace `any` with typed DTO for backend benchmarks. | `BenchmarkPage.tsx`, `types/index.ts` | `[ENG]` | Zero `any` usages; compile passes with strict type checking. |
| **IMP-04** | **P0** | Architecture | WebSocket Memory Leak: Clear reconnect timers in `useEffect` cleanup. | `TelemetryContext.tsx` | `[ENG]`, `[IT_AUTO]` | No dangling timeouts upon unmounting or HMR reloads. |
| **IMP-05** | **P1** | Performance | Route Code-Splitting: Wrap all 7 pages in `React.lazy()` with `<Suspense>`. | `App.tsx` | `[IT_AUTO]` | Main entry bundle decreases, chunks split by route. |
| **IMP-06** | **P1** | UX / Domain | Workloads Data Export: Add functional CSV download button. | `WorkloadPage.tsx` | `[PROD]`, `[DATA]` | Clicking "Export CSV" downloads valid RFC 4180 CSV file. |
| **IMP-07** | **P1** | UX / Optimizer | Preset State Tracking & Feasibility Banner: Highlight active preset and warn if 0 candidates meet constraints. | `OptimizerPage.tsx` | `[UX]`, `[DESIGN]` | Active preset has distinctive highlight; constraint conflict shows warning banner. |
| **IMP-08** | **P1** | Accessibility | High-Contrast Focus Visible Rings: Ensure keyboard navigation shows clear focus rings. | `index.css`, `Button.tsx`, `Modal.tsx` | `[A11Y_L10N]` | Tabbing shows 2px high-contrast focus ring on all interactive elements. |
| **IMP-09** | **P2** | Hardware | Oscilloscope Pause/Resume Toggle: Allow researchers to freeze real-time waveform for inspection. | `HardwarePage.tsx`, `TelemetryContext.tsx` | `[SPEC_ENG]`, `[UX]` | "Pause Stream" halts incoming telemetry chart updates without dropping socket. |
| **IMP-10** | **P2** | Design System | Unify Table Styling: Standardize table headers, hover transitions, and monospace cells. | `index.css`, `Dashboard.tsx`, `WorkloadPage.tsx`, `BenchmarkPage.tsx` | `[DESIGN]` | Consistent `.sci-table` design system classes across all tables. |
| **IMP-11** | **P2** | Data Viz | Heatmap Tooltips: Add hover card to each of the 168 cells in `ScheduleHeatmap.tsx`. | `ScheduleHeatmap.tsx` | `[DATA]` | Hovering over day/hour tile reveals exact timestamp and gCO₂e/kWh value. |

---

## 3. Phased Execution Sequence

1. **Step 1: Core Engineering & Types** (IMP-03, IMP-04, IMP-05) — Secure TypeScript contracts, fix WebSocket cleanup, enable lazy loading.
2. **Step 2: Design System & Tokens** (IMP-08, IMP-10) — Establish unified `.sci-table` tokens and focus rings.
3. **Step 3: UX & Capability Enhancements** (IMP-01, IMP-02, IMP-06, IMP-07, IMP-09, IMP-11) — Implement provenance banner, empty states, CSV export, optimizer preset tracking, oscilloscope pause, and heatmap tooltips.
4. **Step 4: Verification & Git Commit** — Run build and test suite, verify clean tree, push to GitHub.
