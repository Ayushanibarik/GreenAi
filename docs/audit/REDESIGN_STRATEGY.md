# GREEN AI — Product Redesign Strategy & Design System Blueprint (Phase 1)
**Document ID:** AUDIT-STRAT-005  
**Author:** Multidisciplinary Product Engineering Team  
**Date:** 2026-11-14  
**Project:** GREEN AI (GreenCompute AI)  

---

## 1. Product Identity & Design Philosophy

### The Core Synthesis:
$$\mathbf{GREEN\ AI} = \mathbf{Scientific\ Computing} \times \mathbf{Enterprise\ Observability} \times \mathbf{Sustainability\ Analytics}$$

GREEN AI is neither a generic commercial SaaS dashboard nor an eco-activism landing page with soft green gradients and stock leaves. It is an **industrial-grade scientific observability and ML optimization instrument**.

The visual language communicates:
1. **Mathematical Precision & Rigor:** High typographic discipline, clear axis grids, scientific measurement units ($W, Wh, kWh, ms, MB, kg\ CO_2e$), and explicit error/confidence bounds.
2. **Observability Clarity (Linear + Grafana + Datadog):** High information density without visual crowding; sharp, readable monospaced telemetry; intuitive time-series navigation; clear visual resting zones.
3. **Restrained Elegance (Apple + Vercel):** Clean spatial pacing, purposeful whitespace, subtle top-specular highlights, and zero decorative noise (no gratuitous neon blooms, no glassmorphic blur pollution).
4. **Design Token Discipline (Google Material 3):** Strict semantic tokens for surfaces, text, borders, and interaction states across both Light and Dark themes.

---

## 2. Complete Dual-Theme Architecture (Dark & Light)

A critical mandate of the transformation is that **Dark and Light themes are first-class, co-equal design systems**. Neither is a secondary invert.

### Semantic Color Hierarchy:

```
Token                  Light Theme Value           Dark Theme Value            Purpose
──────────────────────────────────────────────────────────────────────────────────────────────────
--surface-canvas       #F8FAFC (Slate 50)          #0A0D14 (Obsidian Slate)    Base application background
--surface-panel        #FFFFFF (Pure White)        #101522 (Deep Navy Slate)   Sidebar, headers, modals
--surface-card         #FFFFFF (Elevated White)    #161D2E (Card Slate)        Elevated bento cards & charts
--surface-card-hover   #F1F5F9 (Slate 100)         #1E273D (Hover Slate)       Card hover elevation
--surface-muted        #F1F5F9 (Slate 100)         #131927 (Subtle Inset)      Table headers, search track

--border-subtle        #E2E8F0 (Slate 200)         #1E293B (Slate 800)         Card borders, dividers
--border-strong        #CBD5E1 (Slate 300)         #334155 (Slate 700)         Interactive inputs, active cards
--border-focus         #0071E3 (Apple/Google Blue) #38BDF8 (Sky/Cyan 400)      Keyboard focus rings

--text-primary         #0F172A (Slate 900)         #F8FAFC (Slate 50)          Headlines, primary metrics
--text-secondary       #475569 (Slate 600)         #94A3B8 (Slate 400)         Body text, table values
--text-muted           #94A3B8 (Slate 400)         #64748B (Slate 500)         Micro-labels, timestamps

--brand-primary        #059669 (Botanical Emerald) #10B981 (Luminous Emerald)  Primary green actions
--brand-primary-hover  #047857 (Deep Emerald)      #34D399 (Bright Emerald)    Button hover states
--brand-accent-blue    #0284C7 (Observability Sky) #38BDF8 (Telemetry Cyan)    Power / Throughput metrics
--brand-accent-amber   #D97706 (Amber 600)         #FBBF24 (Amber 400)         Latency & thermal limits
--brand-accent-rose    #DC2626 (Rose 600)          #F43F5E (Rose 500)          Fossil peaks, SLA violations

--chart-grid           #E2E8F0 (Slate 200)         #1E293B (Slate 800)         Recharts CartesianGrid
--chart-tooltip-bg     #FFFFFF (Pure White)        #0F172A (Deep Slate)        Floating chart tooltip
--chart-tooltip-border #CBD5E1 (Slate 300)         #334155 (Slate 700)         Tooltip border
```

---

## 3. Typography Architecture

- **Primary Typeface:** System Stack (`-apple-system, BlinkMacSystemFont, "SF Pro Display", "Google Sans", "Inter", sans-serif`)
- **Technical & Monospace Typeface:** `ui-monospace, "SF Mono", "Cascadia Code", "Fira Code", monospace`
- **Typographic Scale:**
  1. **Display / Hero Numbers:** `text-4xl` to `text-5xl` (`font-extrabold`, tracking tight `-0.04em`, tabular numbers `font-mono`).
  2. **Page Titles:** `text-xl` to `text-2xl` (`font-bold`, tracking tight `-0.02em`).
  3. **Section Headings:** `text-sm` (`font-bold`, uppercase, tracking widest `0.05em`).
  4. **Body Copy:** `text-xs` to `text-sm` (`font-normal`, leading relaxed).
  5. **Micro-Labels & Column Headers:** `text-[10px]` to `text-[11px]` (`font-semibold`, uppercase, tracking wider).

---

## 4. Information Architecture & UX Restructuring

Rather than treating every screen as an isolated dashboard, GREEN AI will organize into a coherent **Scientific Workflow**:

```
[SYSTEM HEADER]
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  GREEN AI  ·  Scientific Observability Engine   [Live 10Hz Feed] [Theme Toggle] [84.6W]│
└────────────────────────────────────────────────────────────────────────────────────────┘

[SIDEBAR DOCK]              [WORKFLOW CANVAS]
┌──────────────────┐        ┌────────────────────────────────────────────────────────────┐
│ 1. Overview      │ ───►   │ • Hero Impact Bento: Empirical Joule & Carbon Reduction    │
│ 2. Benchmarks    │        │ • Live Activity Arc: High-precision shunt wattage meter    │
│ 3. Optimizer     │        │ • 24h Telemetry Time-Series: Baseline vs Optimized trace   │
│ 4. Carbon Intel  │        │ • Recent Execution Queue: Live status & verification delta │
│ 5. Hardware Lab  │        └────────────────────────────────────────────────────────────┘
│ 6. Workloads     │
│ 7. Settings      │
└──────────────────┘
```

### Page Transformation Goals:
1. **Overview (Dashboard):** Establish instant scientific credibility. Combine macro-metrics with real-time shunt telemetry and empirical workload records.
2. **Model Benchmarks (`/benchmark`):** Precision comparative table and dual-panel charts comparing FP32 vs FP16 vs INT8 vs ONNX. Genuine trigger to backend test suite.
3. **Constrained Optimizer (`/optimizer`):** Refined research console with dual-axis interactive Pareto curves, SLA preset capsules, and clear mathematical formulation.
4. **Carbon Intelligence (`/carbon`):** High-precision diurnal curve based on CEA Baseline v19, interactive grid dispatch timing slider, and hour-by-hour solar influx heatmap.
5. **Hardware Lab (`/hardware`):** Dedicated Oscilloscope view featuring ESP32-WROOM-32D & INA219 instrumentation specs, calibration accuracy, multi-channel V/I/P/E stream, and raw telemetry packet inspector.
6. **Workloads (`/workloads`):** Robust job submission dialog with proper client validation, dispatch to `api.submitWorkload()`, and responsive data grid.
7. **Settings (`/settings`):** Global preferences persisted to `localStorage` and synchronized across all views, with Light/Dark/System theme switch.

---

## 5. Staged Execution Plan (Phase 2 through Phase 9)

- **Stage 1 (Phase 2 & 3):** Implement Global Design System in `index.css` (dual-theme CSS variables, typography, tactile sliders, Recharts themes) and create the `ThemeToggle` mechanism with `localStorage` persistence.
- **Stage 2 (Phase 3 & 4):** Refactor `Layout.tsx` & `Sidebar.tsx` into a lightweight, decoupled shell; extract simulation/WebSocket into `useTelemetry` hook.
- **Stage 3 (Phase 5):** Reconstruct Core Dashboard (`Dashboard.tsx`), `MetricCard.tsx`, and `EnergyGauge.tsx` with light/dark contrast and real backend data wiring.
- **Stage 4 (Phase 5):** Reconstruct `OptimizerPage.tsx` and `BenchmarkPage.tsx` with rigorous ML nomenclature and connected API execution triggers.
- **Stage 5 (Phase 5):** Reconstruct `CarbonPage.tsx` and `HardwarePage.tsx` into an authoritative Environmental and Hardware Instruments console.
- **Stage 6 (Phase 5):** Reconstruct `WorkloadPage.tsx` and `SettingsPage.tsx` with functional backend job submissions and persistent global preferences.
- **Stage 7 (Phase 6, 7 & 8):** Advanced interaction states, keyboard accessibility (focus rings, ARIA roles), and responsive tablet/mobile layouts.
- **Stage 8 (Phase 9):** End-to-end visual and functional QA in both light and dark modes, build verification, and generation of `FRONTEND_QA_REPORT.md`.
