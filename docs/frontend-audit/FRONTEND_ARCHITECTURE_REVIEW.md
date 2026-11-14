# Frontend Architecture Review: Modularity, Dependency Graph & System Scalability
**Auditor**: Principal Software Architect (`head-software-engineering` / Department `[ENG]`)  
**Product**: GREEN AI Enterprise Observability Suite  
**Scope**: Directory Topology, Data Flow, Layer Decoupling, API Contracts, Extensibility  
**Date**: November 2026  

---

## 1. Architectural Topology Overview

The frontend codebase is organized cleanly within `frontend/src`:

```
frontend/src/
├── charts/             # Recharts analytical visualization components (6 modules)
├── components/         # Shared domain components (Layout, Sidebar, MetricCard, Gauge)
│   └── ui/             # Core design system primitives (Button, Badge, Modal, SegmentedControl)
├── context/            # Global application state (TelemetryContext, ThemeContext)
├── pages/              # Route views (7 pages)
├── services/           # Network communication (Axios api.ts, native websocket.ts)
├── types/              # Domain TypeScript interfaces and contracts
└── utils/              # Formatting helpers, scientific constants, calculation logic
```

This unidirectional dependency flow adheres to standard clean architecture principles:
`Utils/Types` → `Services` → `Context` → `UI Primitives` → `Charts` → `Pages` → `App/Router`.

---

## 2. Dependency Graph & Coupling Analysis

1. **Service Layer Decoupling (`api.ts` & `websocket.ts`)**:
   - The REST client (`api.ts`) wraps Axios and exposes typed asynchronous methods (`getWorkloads`, `submitWorkload`, `runBenchmark`, `optimize`, `predict`, etc.).
   - Benefit: Pages do not make direct Axios calls; all endpoints are cataloged centrally.
   - Scalability Gap: `api.ts` uses a hardcoded fallback baseURL `http://localhost:8000/api/v1`. While it checks `import.meta.env.VITE_API_URL`, dynamic reconfiguration from `SettingsPage.tsx` does not propagate to Axios instances without a page reload.
2. **Telemetry State Machine (`TelemetryContext.tsx`)**:
   - The context acts as a single source of truth for high-frequency (10Hz) telemetry.
   - Decouples UI pages from network transport (WebSocket vs HTTP polling vs local simulation generator).
   - Architectural Strength: Any page can consume `useTelemetry()` without re-establishing socket connections.
3. **Data Visualization Isolation (`charts/`)**:
   - Charts are isolated into independent files (`EnergyTimeChart`, `CarbonScheduleChart`, `ModelComparisonChart`, `HardwareTelemetryChart`, `ScheduleHeatmap`, `CarbonBreakdownChart`).
   - Advantage: Recharts SVGs and responsive containers (`<ResponsiveContainer>`) do not pollute page business logic.

---

## 3. Architectural Weaknesses & Scalability Constraints

### 3.1 Synchronous Telemetry State Churn
- In `TelemetryContext.tsx`, 10Hz updates trigger React re-renders on every context subscriber.
- Current impact: With lightweight cards, modern browsers easily handle 10 re-renders per second.
- Future risk: As charts accumulate hundreds of data points, re-rendering the entire page tree at 10Hz will cause layout thrashing and frame drops.
- Architectural Recommendation:
  - Separate high-frequency live scalar readings (e.g., `voltage_v`, `current_ma`) from slow-moving aggregate lists (`workloads`, `benchmarks`).
  - Use `useRef` for streaming oscilloscope data or throttle context broadcast to 2Hz while keeping internal buffer at 10Hz.

### 3.2 Dynamic Configuration Synchronization
- `SettingsPage.tsx` allows users to configure API URL, WebSocket URL, and regional carbon baseline.
- However, changing these settings writes to `localStorage` without triggering a reactive update in `api.ts` or `TelemetryContext.tsx`.
- Architectural Fix: Expose a `reloadConfiguration()` method or incorporate settings into an enterprise application config context.

---

## 4. Multi-Node & Future Cluster Scalability

To support enterprise ML clusters (e.g., Slurm / Kubernetes Ray clusters):
1. Workload model should support a `cluster_node_id` field (e.g., `node-01-h100`, `node-02-a100`).
2. Telemetry stream should accept a query param: `/ws/telemetry?node_id=master`.
3. The component hierarchy is already decoupled enough to support node-level filtering without structural refactoring.
