# GREEN AI — Component Inventory & Structural Audit (Phase 1)
**Document ID:** AUDIT-COMP-003  
**Author:** Multidisciplinary Product Engineering Team  
**Date:** 2026-11-14  
**Project:** GREEN AI (GreenCompute AI)  

---

## 1. Executive Summary

A comprehensive component audit was performed across `frontend/src/components/`, `frontend/src/charts/`, and page-level inline structures. 

The primary structural finding is that **the codebase currently suffers from component polarization**:
- On one hand, there are monolithic composite components (`Layout.tsx`, `Dashboard.tsx`, `OptimizerPage.tsx`) that bundle data generation, simulation loops, responsive state, formatting, and layout rendering into single 300+ line files.
- On the other hand, there is a severe shortage of **foundational primitive components** (`Button`, `Badge`, `Input`, `Select`, `Modal`, `Tooltip`, `Card`, `Table`). As a consequence, raw HTML `<button>`, `<select>`, and `<table>` tags are styled ad-hoc across each view with varying border radii, padding, and text colors.

---

## 2. Reusable & Shared Components Audit

### 1. `Sidebar.tsx`
- **Current Role:** Primary vertical navigation dock on desktop, slide-out drawer on mobile.
- **Props:** `isOpen?: boolean`, `onClose?: () => void`, `isWsConnected?: boolean`.
- **Strengths:** Clean routing integration using React Router's `NavLink`; active indicators with glowing dot markers; mobile drawer integration.
- **Deficiencies:**
  - Hardcoded dark background (`glass-panel bg-[#0b0c0f]`). In light theme, the sidebar remains dark or causes stark contrast dissonance.
  - Hardware status pill at the bottom is tightly coupled to `useTelemetry()` context instead of receiving modular status props.
- **Action:** **Refactor for Design System.** Decouple hardware widget, support semantic theme variables (`--surface-sidebar`, `--border-sidebar`, `--text-sidebar`).

### 2. `Layout.tsx`
- **Current Role:** Root application scaffold, header bar, and global telemetry context provider.
- **Strengths:** Provides unified application shell and manages global header with simulator toggle.
- **Deficiencies:**
  - **Severe architectural anti-pattern:** Embeds a 1-second `setInterval` simulator loop directly in the component, generating random jitter for CPU, GPU, RAM, power, voltage, and current.
  - Re-renders all child routes every 1000ms.
  - No theme switching toggle in the top bar.
- **Action:** **Deconstruct.** Move telemetry polling and simulation into an isolated React hook (`useTelemetryStore` / `useTelemetry`). Reduce `Layout.tsx` to pure structural orchestration (Sidebar + Header + Content Container). Add Light/Dark theme toggle control to header.

### 3. `MetricCard.tsx`
- **Current Role:** Standardized KPI display card (value, unit, label, trend badge, icon, subtext).
- **Props:** `label`, `value`, `unit?`, `trend?`, `icon?`, `subtext?`.
- **Strengths:** Clean macro-typography, positive/negative trend pills.
- **Deficiencies:**
  - Lacks semantic color support (e.g., green for energy, blue for power, amber for latency, slate for count).
  - Background has a hardcoded dark radial gradient that does not adapt to light theme.
  - Cannot display uncertainty bounds (e.g. $\pm 0.5\text{ Wh}$ or confidence intervals).
- **Action:** **Promote to Core Design System Component (`ScientificMetricCard`).** Support domain variants (`energy`, `carbon`, `performance`, `hardware`), uncertainty bounds, and light/dark theme tokens.

### 4. `EnergyGauge.tsx`
- **Current Role:** Circular activity ring visualizing real-time power draw against a maximum power ceiling.
- **Props:** `currentPower: number`, `maxPower?: number`.
- **Strengths:** Smooth 240-degree SVG arc with glowing gradient stroke and digital numerical readout.
- **Deficiencies:**
  - Stroke track background is hardcoded `rgba(255, 255, 255, 0.06)`, invisible on light backgrounds.
  - No threshold color shifting (e.g., green at $<100\text{W}$, amber at $100\text{--}180\text{W}$, rose at $>180\text{W}$).
- **Action:** **Refactor into `PowerTelemetryGauge`.** Add dynamic color thresholds, support both themes, and display empirical shunt status badge.

### 5. `StatusBadge.tsx`
- **Current Role:** Displays workload status (`pending`, `running`, `completed`, `failed`).
- **Props:** `status: 'pending' | 'running' | 'completed' | 'failed'`.
- **Strengths:** Excellent micro-indicators with pulsing radar effect for `running` status.
- **Deficiencies:**
  - Hardcoded dark backgrounds (`bg-amber-500/15`, `bg-emerald-500/15`, etc.).
  - Limited to workload states; cannot be used for hardware health, SLA compliance, or benchmark tiers.
- **Action:** **Generalize into Design System `Badge` component.** Support statuses: `success`, `warning`, `error`, `info`, `neutral`, with solid and subtle variants for both themes.

---

## 3. Data Visualization & Charts Audit

| Chart Component | Visualization Type | Data Domain | Current Issues | Target Architecture |
| :--- | :--- | :--- | :--- | :--- |
| `EnergyTimeChart.tsx` | Recharts `AreaChart` | 24h Baseline vs Optimized Power | Hardcoded fallback array; tooltips have hardcoded dark background; no zoom or time range selector. | Add 1h / 6h / 24h time-scale tabs; connect to actual workload power log; implement light/dark tooltip tokens. |
| `CarbonBreakdownChart.tsx` | Recharts `PieChart` (Donut) | Scope 2 vs Scope 3 Emissions | Static percentages (72% Operational vs 28% Embodied); lacks interactive segment inspection. | Add dynamic emissions source breakdown based on active region carbon intensity. |
| `ModelComparisonChart.tsx` | Recharts `BarChart` | Precision tiers (FP32, FP16, INT8, ONNX) | Dual Y-axes (Latency vs Energy) can confuse users due to overlapping scale ranges. | Split into a comparative dual-panel chart or normalized index chart with clear unit legends. |
| `CarbonScheduleChart.tsx` | Recharts `AreaChart` + `Line` | Odisha Grid vs National Average (24h) | ReferenceArea highlights (optimal vs immediate) can clip tooltip hover events. | Refine reference window styling; ensure axes adapt to theme background. |
| `HardwareTelemetryChart.tsx` | Recharts `LineChart` | 4-channel V, I, P, E Oscilloscope | High sampling rate (10Hz) can cause frame drops in Recharts if buffer exceeds 50 points; channel filter tabs are custom inline buttons. | Implement windowed buffer (max 30 visible ticks) with smooth interpolation; use standardized `SegmentedControl`. |
| `ScheduleHeatmap.tsx` | Custom Grid of 24 Buttons | Hourly Carbon Intensity & Green Windows | Buttons wrap awkwardly on mobile; active ring styling is hardcoded dark. | Implement smooth horizontally scrollable track on mobile with clear day/night demarcation. |

---

## 4. Missing Components to be Created in Design System

The audit reveals that the following core components are missing from the shared layer and must be implemented:

1. **`Button`**: Variants (`primary`, `secondary`, `outline`, `ghost`, `danger`), sizes (`sm`, `md`, `lg`), with loading spinner and icon support.
2. **`Input` & `SearchInput`**: Accessible text inputs with label, helper text, error state, and icon slots.
3. **`Select`**: Accessible dropdown select replacement for ugly native browser dropdowns.
4. **`SegmentedControl`**: Tactile pill-based switcher for tabs, ranges, and modes (replacing ad-hoc button groups).
5. **`Slider`**: Research-grade range slider with dual ticks, live value readout, and keyboard navigation.
6. **`Modal` / `Dialog`**: Accessible portal-based dialog with backdrop blur, focus trap, and escape key listener.
7. **`DataTable`**: Reusable data grid with column sorting, empty state, pagination, and responsive mobile card view.
8. **`Tooltip`**: Floating technical tooltip for scientific formulas, units, and methodology explanations.
9. **`ThemeToggle`**: Sun/Moon/Monitor segmented switch with smooth SVG transitions.
10. **`EmptyState`**: Standardized fallback when no workloads or benchmark results exist.
11. **`SkeletonLoader`**: Shimmering placeholder during async API calls.
