# GREEN AI — Frontend Architecture & Codebase Audit (Phase 1)
**Document ID:** AUDIT-FE-001  
**Author:** Multidisciplinary Product Engineering Team  
**Date:** 2026-11-14  
**Project:** GREEN AI (GreenCompute AI) — Sustainable AI Observability & Optimization Platform  
**Target Environment:** Antigravity IDE Standalone 2.6.0  

---

## 1. Executive Summary

GREEN AI is an AI energy measurement, carbon intelligence, and constrained model optimization platform designed for ML researchers, sustainability engineers, and infrastructure operators.

Following an exhaustive codebase inspection across the entire frontend repository (`frontend/src/`, `frontend/package.json`, `frontend/vite.config.ts`, `backend/api/`, `backend/profiler/`, and `tests/`), the multidisciplinary product team has determined that while the underlying backend computing and profiling engine is scientifically rigorous (featuring actual hardware shunt measurement via ESP32/INA219, PyTorch eager execution profiling, ONNX runtime graph acceleration, and regional CEA baseline carbon accounting), **the frontend currently exhibits critical architectural and design deficiencies that undermine its credibility as a research-grade scientific product.**

### Key High-Level Findings:
1. **Generic AI / Template Aesthetics:** The interface has suffered from oscillating between generic dark-themed "developer dashboards" (dense 1px borders, nested boxes) and superficial consumer landing-page copy ("Run your systems with clarity", "Product image review") rather than embodying a **Scientific Computing × Enterprise Observability** tool.
2. **Total Absence of Light Mode Support:** The existing styling is hardcoded for dark mode (`color-scheme: dark`, `#0b0c0f`, hardcoded `text-white`, `border-white/*`). Any light mode toggle or user with system-level light mode encounters broken contrast or unreadable text.
3. **Disconnected / Hardcoded Presentation Layers:** Several views (`Dashboard.tsx`, `WorkloadPage.tsx`, `BenchmarkPage.tsx`) contain hardcoded mock datasets embedded directly inside page components rather than fetching from available backend endpoints (`/api/workloads`, `/api/benchmarks/summary`) with graceful offline/demo fallbacks.
4. **Watered-Down Technical Nomenclature:** Critical ML terminology (e.g. *ResNet-18 INT8 Dynamic Quantization*, *PyTorch FP32 Eager Baseline*, *ONNX Runtime Graph Engine*) was intermittently replaced with vague non-technical euphemisms ("Standard profile", "Fast profile", "Image processing"), which alienates the primary target audience of ML researchers and infrastructure engineers.
5. **Component Duplication & Primitive Fragmentation:** There is no centralized UI component library for buttons, inputs, selects, segmented controls, modals, tabs, or tooltips. Every page re-implements raw HTML `<select>`, `<button>`, `<input>`, or inline SVG icons with inconsistent styling.

---

## 2. Technology Stack & Build System Audit

| Layer | Implementation | Version / Spec | Status & Evaluation |
| :--- | :--- | :--- | :--- |
| **Framework** | React + TypeScript | React 18.3.1, TypeScript 5.6.0 | **Solid.** Strict typing is configured, bundling operates cleanly. |
| **Build Tooling** | Vite | Vite 6.0.0 (`@vitejs/plugin-react` 4.3.4) | **Excellent.** Sub-10s production builds (`tsc -b && vite build` completes in ~8.3s). |
| **Styling Engine** | Tailwind CSS v4 | `@tailwindcss/vite` 4.0.0, `tailwindcss` 4.0.0 | **Modern.** Tailwind v4 is active; custom design tokens can be codified natively in `@theme`. |
| **Data Visualization** | Recharts | Recharts 2.13.0 | **Capable but Under-utilized.** Responsive containers are functional, but lack standardized scientific axes, domain clamps, uncertainty bands, and theme tokens. |
| **Icons** | Lucide React | Lucide React 0.460.0 | **Good.** Consistent icon set, but often used decoratively rather than semantically. |
| **HTTP Client** | Axios | Axios 1.7.0 | **Functional.** Basic client configured in `services/api.ts` with proxy to `localhost:8000`. |
| **State Architecture** | React Context (`useTelemetry`) | `Layout.tsx` TelemetryContext | **Fragile.** Context is bloated with simulation loops, hardware history arrays, and web socket state in a single top-level provider. Needs modularization. |

---

## 3. Detailed Architectural & Structural Deficiencies

### A. CSS & Design Token Architecture (`frontend/src/index.css`)
- **Single-Theme Hardcoding:** The `:root` and `body` rules explicitly set `background: #0b0c0f` and `color: #f5f7fa`. There are no CSS custom property abstractions for semantic surfaces (`--surface-canvas`, `--surface-panel`, `--surface-card`, `--text-primary`, `--text-secondary`, `--border-subtle`).
- **Uncontrolled Glows & Opacity Halos:** Ambient radial gradient backgrounds are scattered across both `index.css` and individual page files, introducing visual clutter without communicative intent.
- **Arbitrary Color Drift:** Emerald (`#10b981`), blue (`#0a84ff`), violet (`#5e5ce6`), and slate (`#475569`) are mixed without a clearly defined semantic palette where each hue maps to a specific telemetry domain (e.g., Power = Emerald/Teal, Latency = Amber, Carbon = Sky/Slate).

### B. State Management & Data Flow Fragility (`frontend/src/components/Layout.tsx`)
- **Fat Layout Pattern:** `Layout.tsx` currently acts as a global coordinator, containing:
  - 1-second simulation timer loop (`setInterval`).
  - Jitter generation for CPU, GPU, RAM, Voltage, and Power.
  - WebSocket client subscription.
  - History buffer slicing (`hardwareHistory.slice(0, 24)`).
  - Breadcrumb title resolution.
- **Re-render Propagation:** Whenever the 1-second telemetry interval fires, the entire tree beneath `Layout` re-renders because `activeTelemetry` is recreated. This causes unnecessary canvas repaints in Recharts and input focus jitter in interactive views.
- **Decoupled API Client:** `services/api.ts` declares typed endpoints (`getWorkloads`, `runBenchmark`, `predict`, `optimize`, `getHardwareReadings`), but pages like `Dashboard.tsx` and `WorkloadPage.tsx` frequently bypass them in favor of hardcoded component state.

### C. Scientific Credibility & Technical Precision
- **Estimated vs Measured Ambiguity:** The platform mixes empirical shunt measurements (ESP32 / INA219 10Hz readings) with software estimations (psutil / NVML / CodeCarbon) without clear labeling. A scientific user cannot immediately tell if a displayed metric is hardware-verified or a software estimate.
- **Uncertainty & Confidence Intervals:** ML prediction endpoints (`/api/predict`) return a `confidence_score` (e.g., 0.92 for linear ridge regression), but the UI drops this metric, showing single-point scalar values without error bounds.
- **Copywriting Incoherence:** Phrases like "Run your systems with clarity" or "Media processing" diminish the product's research identity. The system should read: *"Multi-Objective Hardware-Constrained Model Selection"*, *"Empirical Energy Shunt Telemetry"*, *"CEA Baseline v19 Regional Grid Dispatch"*.

---

## 4. Immediate Remediation Imperatives

1. **Implement Dual-Theme Design Token System (Dark + Light):**
   - Refactor `index.css` to define strict semantic tokens via CSS variables for both `[data-theme="dark"]` and `[data-theme="light"]`.
   - Ensure WCAG AA contrast compliance across both themes (minimum 4.5:1 for body copy, 3.0:1 for large metrics).
2. **Decouple Telemetry State into a Dedicated Hook & Store:**
   - Extract simulation and WebSocket streaming out of `Layout.tsx` into a modular `useTelemetryStore` with selective subscriptions so charts don't force page-level re-renders.
3. **Unify Shared UI Components:**
   - Build a formal design-system component library: `Button`, `Input`, `Select`, `SegmentedControl`, `Modal`, `Table`, `Badge`, `Card`, `ScientificMetric`, `EmptyState`, `SkeletonLoader`.
4. **Connect All Pages to Real Backend APIs with Fallbacks:**
   - Wire `Dashboard`, `Workloads`, `Benchmarks`, and `Optimizer` directly to `api.ts`, displaying genuine backend records and explicitly marking synthetic demo states when offline.
5. **Restore Scientific Nomenclature:**
   - Replace colloquial labels with precise ML engineering and hardware terminology.
