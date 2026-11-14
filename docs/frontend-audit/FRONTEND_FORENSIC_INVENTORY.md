# Frontend Forensic Inventory & Component Taxonomy
**Product**: GREEN AI Enterprise Platform (Standalone 2.6.0)  
**Execution Context**: Comprehensive Granular Forensic Audit (Phase 2)  
**Scope**: 100% of routes, pages, shared components, chart modules, contexts, and utility layers  
**Date**: November 2026  

---

## 1. Executive Summary & Taxonomy Metrics

This forensic inventory accounts for every structural element across the entire GREEN AI frontend application. The codebase comprises:
- **Routes & Pages**: 7 top-level views (`/`, `/workloads`, `/benchmark`, `/optimizer`, `/carbon`, `/hardware`, `/settings`).
- **Core Layout & Shell**: 2 structural components (`Layout.tsx`, `Sidebar.tsx`).
- **Domain & UI Primitives**: 8 shared reusable components (`MetricCard`, `EnergyGauge`, `StatusBadge`, `ThemeToggle`, `ui/Button`, `ui/Badge`, `ui/Modal`, `ui/SegmentedControl`).
- **Data Visualization Engines**: 6 custom Recharts-based analytical charts (`EnergyTimeChart`, `CarbonBreakdownChart`, `ModelComparisonChart`, `CarbonScheduleChart`, `HardwareTelemetryChart`, `ScheduleHeatmap`).
- **State & Communication Layers**: 2 React Context providers (`ThemeContext`, `TelemetryContext`), 1 REST API client (`api.ts`), 1 WebSocket stream manager (`websocket.ts`).

### Forensic Metric Separation
To avoid conflating source definitions with DOM scale:
1. **Unique Component Definitions**: 16 unique UI/visual components + 6 chart modules = **22 unique component implementations**.
2. **Component Instances (Static JSX Invocations)**: **84 static component instantiations** across the 7 page views and layouts.
3. **Rendered Runtime Occurrences (Dynamic DOM Elements)**: **~340-420 active DOM nodes** depending on workload array length (5 table rows, 24 hourly heatmap cells, 7 Pareto candidates, 10-60 hardware telemetry points).

---

## 2. Granular Inventory by Page & View

### 2.1 Global Application Shell (`Layout.tsx` & `Sidebar.tsx`)
- **File**: `frontend/src/components/Layout.tsx` (4,206 bytes) & `frontend/src/components/Sidebar.tsx` (4,298 bytes)
- **Visual Structure**:
  - Top Navigation Bar: Mobile hamburger trigger (`Menu`), Breadcrumb path generator, Live telemetry status indicator (`Radio` icon with pulse animation), Theme toggle shortcut (`ThemeToggle`), GitHub source link (`Github` icon).
  - Collapsible Sidebar: Brand identity badge (Deep emerald leaf logo + "GREEN AI"), Version pill (`v0.1.0-alpha`), Navigation links (7 items: Dashboard, Workloads, Benchmarks, Optimizer, Carbon Dispatch, Hardware Console, Settings), System status indicator (Live WebSocket / Simulation badge with latency counter).
- **Icons Utilized**: `Menu`, `X`, `Radio`, `Github`, `LayoutDashboard`, `Layers`, `BarChart3`, `Sliders`, `Calendar`, `Cpu`, `Settings`, `ChevronLeft`, `ChevronRight`.
- **Component Instances**:
  - `<Sidebar>`: 1 instance.
  - `<ThemeToggle>`: 1 instance in top header.
  - Navigation Link Items: 7 instances with active state highlighting.
- **Rendered Occurrences**: 14 persistent DOM elements in header/sidebar + dynamic modal overlays.

---

### 2.2 Dashboard View (`Dashboard.tsx`)
- **Route**: `/` (Index route)
- **File**: `frontend/src/pages/Dashboard.tsx` (10,604 bytes, 257 lines)
- **Sections & Elements**:
  1. **Top Banner (Real-Time Workload Intelligence)**:
     - Heading: H1 "Real-Time Workload Intelligence" (`text-xl sm:text-2xl font-bold`).
     - Quick Navigation Chips: 3 pills linking to `/optimizer`, `/carbon`, `/hardware` with icons (`Sliders`, `Calendar`, `Cpu`).
     - Executive KPI Card: "Energy Reduction" (62.9% vs FP32 baseline), Tag "INT8 / ONNX", Bus metrics "12.02V · 7.04A", "PUE 1.15".
  2. **Primary KPI Metric Grid**:
     - 4 `<MetricCard>` instances:
       - Energy Saved: `1,428.6 Wh` (Trend: +62.9% vs FP32, Icon: `Zap`).
       - CO₂ Avoided: `1,171.5 g` (Trend: +44.8% offset, Icon: `Leaf`).
       - Active Workloads: Dynamic count (Trend: completed count, Icon: `CheckCircle2`).
       - Power Draw: `84.6 W` or live WebSocket reading (Trend: under cap, Icon: `Cpu`).
  3. **Main Analytical Grid**:
     - Column 1 (2 cols): `<EnergyTimeChart>` (Recharts Area/Line chart of power draw over time).
     - Column 2 (1 col): `<EnergyGauge>` (Custom SVG radial gauge displaying live power vs 250W ceiling).
  4. **Recent Workloads Registry Table**:
     - Table header with columns: ID, Model, Status, Energy, Emissions, Latency, Time.
     - Dynamic rows: 5 rows rendered from `workloads` state.
     - Link to `/workloads` (`ArrowUpRight` icon).
- **Component Instances**: 4 `<MetricCard>`, 1 `<EnergyTimeChart>`, 1 `<EnergyGauge>`, 5 `<StatusBadge>`, 4 `<Link>`.
- **Rendered Occurrences**: 42 table cells, 4 card containers, 1 SVG gauge canvas, 1 Recharts SVG canvas.

---

### 2.3 Workloads Management (`WorkloadPage.tsx`)
- **Route**: `/workloads`
- **File**: `frontend/src/pages/WorkloadPage.tsx` (15,689 bytes, 384 lines)
- **Sections & Elements**:
  1. **Header & Actions**:
     - H1 "Workloads" with count badge.
     - Action Buttons: `Refresh` (icon: `RefreshCw`, loading state), `Submit Workload` (icon: `PlusCircle`).
  2. **Aggregate KPI Strip**:
     - 4 summary cards: Total Workloads, Running Count, Cumulative Energy (`totalEnergy.toFixed(1) Wh`), Cumulative Emissions (`totalCarbon.toFixed(1) g`).
  3. **Filter & Search Bar**:
     - Search input field with leading `Search` icon.
     - Status segmented filters: `all`, `completed`, `running`, `pending`, `failed`.
  4. **Workload Data Table**:
     - Full-width tabular registry with 8 columns: ID, Name, Status, Energy, CO₂e, Latency, Accuracy, Time.
     - Dynamic mapping with empty state fallback.
  5. **Submit Workload Modal (`Modal.tsx`)**:
     - Form fields: Workload Name (text input), Model Type (select: Computer Vision, Edge Vision, NLP Transformer, Audio Processing, Generative AI), Precision (select: INT8, ONNX, FP16, FP32), Dataset (text input).
     - Action buttons: Cancel, Submit (loading spinner).
- **Component Instances**: 1 `<Modal>`, 3 `<Button>`, 5 `<StatusBadge>`, 5 Filter buttons.
- **Rendered Occurrences**: 8 columns × N rows (default 5 = 40 cells), 4 KPI containers, 1 search bar, 1 modal dialog.

---

### 2.4 Model Benchmark Suite (`BenchmarkPage.tsx`)
- **Route**: `/benchmark`
- **File**: `frontend/src/pages/BenchmarkPage.tsx` (10,768 bytes, 259 lines)
- **Sections & Elements**:
  1. **Header & Controls**:
     - H1 "Model Benchmarks" with model architecture selector (`resnet18`, `mobilenetv3`).
     - Action button: `Run Suite` (icon: `Play`, executing backend benchmark run).
  2. **Comparative Summary Strip**:
     - 3 comparative cards: Optimal Config (`config_name`), Maximum Energy Reduction (`energyReduction%`), Throughput Gain (`throughput` RPS).
  3. **Comparative Chart**:
     - `<ModelComparisonChart>` (Recharts multi-metric Bar chart comparing Energy, Latency, and Memory across configurations).
  4. **Benchmarking Results Matrix**:
     - Table with columns: Configuration, Precision, Energy (Wh), Latency (ms), Accuracy (%), Memory (MB), Throughput (RPS), CO₂ (g).
     - 5 benchmark rows (ResNet-18 FP32, ResNet-18 INT8, MobileNet-V3 FP32, MobileNet-V3 ONNX, MobileNet-V3 INT8).
- **Component Instances**: 1 `<ModelComparisonChart>`, 1 `<Button>`, 5 table rows.
- **Rendered Occurrences**: 40 table cells, 3 summary cards, 1 Recharts SVG canvas.

---

### 2.5 Multi-Objective Pareto Optimizer (`OptimizerPage.tsx`)
- **Route**: `/optimizer`
- **File**: `frontend/src/pages/OptimizerPage.tsx` (22,778 bytes, 557 lines)
- **Sections & Elements**:
  1. **Header & Preset Profiles**:
     - H1 "Pareto Optimizer" with API sync status indicator (`apiSynced`).
     - Quick preset buttons: `Balanced Standard`, `Ultra-Low Edge`, `High Accuracy`.
  2. **Constraint & Objective Weight Sliders**:
     - Constraints: Min Accuracy (slider: 80-99%), Max Latency (slider: 10-200ms), Max Memory (slider: 128-2048MB).
     - Loss Weights ($\alpha, \beta, \gamma, \delta$): Energy weight, Latency weight, Accuracy weight, Memory footprint weight.
  3. **Optimal Selection Card**:
     - Recommended Candidate Card (`Award` icon): Name, Precision, Energy reduction %, Latency reduction %, CO₂ avoided, Accuracy delta.
     - Action: `Deploy Configuration` button (`ArrowRight` icon).
  4. **Pareto Candidate Evaluation Matrix**:
     - Table listing 7 candidate architectures with feasibility badges (`Feasible` vs `Violates Latency/Memory/Accuracy`), objective score, and detailed metric breakdown.
- **Component Instances**: 3 Preset buttons, 7 Sliders, 1 Deploy `<Button>`, 7 Status badges, 1 Result card.
- **Rendered Occurrences**: 7 candidate rows × 9 columns = 63 table cells, 7 slider tracks, 4 metric cards.

---

### 2.6 Regional Carbon Dispatch (`CarbonPage.tsx`)
- **Route**: `/carbon`
- **File**: `frontend/src/pages/CarbonPage.tsx` (9,754 bytes, 228 lines)
- **Sections & Elements**:
  1. **Header & Grid Identifier**:
     - H1 "Carbon Dispatch" with regional grid badge: "Odisha Grid (CEA v19)" (`MapPin` icon).
  2. **Dispatch Planner Inputs**:
     - Sliders: Workload Duration (1-8h), Execution Deadline (2-24h), Estimated Energy (1-20 kWh).
     - Window Comparison Card: Immediate Window vs Optimal Clean-Window.
     - Savings pill: CO₂ Avoided (kg) and % emissions reduction.
     - Action: `Schedule Workload` button.
  3. **Visual Charts Grid**:
     - `<CarbonScheduleChart>`: 24-hour regional grid carbon intensity profile with solar dip highlighting and execution windows.
     - `<CarbonBreakdownChart>`: Donut chart decomposing emissions into Scope 2 Operational Electricity vs Embedded Hardware Embodied Carbon.
     - `<ScheduleHeatmap>`: 7-day × 24-hour carbon intensity matrix showing optimal green dispatch windows.
- **Component Instances**: 1 `<CarbonScheduleChart>`, 1 `<CarbonBreakdownChart>`, 1 `<ScheduleHeatmap>`, 3 Sliders, 1 `<Button>`.
- **Rendered Occurrences**: 168 heatmap tiles (7×24), 2 Recharts SVG canvases, 2 comparison summary cards.

---

### 2.7 Hardware Bus Console (`HardwarePage.tsx`)
- **Route**: `/hardware`
- **File**: `frontend/src/pages/HardwarePage.tsx` (8,387 bytes, 146 lines)
- **Sections & Elements**:
  1. **Header & Live Bus Indicator**:
     - H1 "Hardware Bus Console" with live telemetry connection pill (10Hz WebSocket or Simulation).
  2. **Primary Instrument Gauges**:
     - 4 live instrument cards: Voltage (`latest.voltage_v V`), Current (`latest.current_ma mA`), Power (`latest.power_mw W`), Energy (`latest.energy_mwh Wh`).
  3. **Telemetry Oscilloscope Chart**:
     - `<HardwareTelemetryChart>`: Real-time dual-axis chart tracking Voltage, Current, and Power draw at 10Hz sampling.
  4. **Hardware Specifications & Register Matrix**:
     - INA219 Specs Card: I2C Address (`0x40`), Shunt (`0.100 Ω`), Resolution (`12-bit`), Max Current (`±3.2 A`), Sampling Rate (`10 Hz`).
     - Intel/AMD RAPL Registers Card: Package Register (`0x611`), DRAM Register (`0x618`), Energy Unit (`~61 µJ`), Update Frequency.
- **Component Instances**: 4 Metric reading boxes, 1 `<HardwareTelemetryChart>`, 2 Specification panels.
- **Rendered Occurrences**: 2 Recharts SVG time-series paths, 10 register definition rows, 4 instrument containers.

---

### 2.8 System Settings (`SettingsPage.tsx`)
- **Route**: `/settings`
- **File**: `frontend/src/pages/SettingsPage.tsx` (11,170 bytes, 254 lines)
- **Sections & Elements**:
  1. **Header & Confirmation Toast**:
     - H1 "Settings" with `Saved` notification pill.
  2. **Appearance & Theme Configuration**:
     - Theme Mode segmented control (`<ThemeToggle variant="segmented">`): Dark, Light, System.
  3. **Regional Grid Carbon Parameters**:
     - Grid Selector: Odisha (IN-OD), National Average (IN-NAT), US PJM (US-EAST), Germany (EU-DE).
     - Baseline Emission Factor input field (kg CO₂e / kWh).
  4. **Pareto Optimizer Defaults**:
     - Default weight distribution inputs: $\alpha$ Energy, $\beta$ Latency, $\gamma$ Accuracy, $\delta$ Memory.
  5. **API & Telemetry Endpoints**:
     - REST API URL input, WebSocket Telemetry URL input.
  6. **Form Action Buttons**:
     - `Reset Defaults` button (`RotateCcw` icon).
     - `Save Settings` button (`Save` icon).
- **Component Instances**: 1 `<ThemeToggle>`, 2 `<Button>`, 7 form inputs/selects.
- **Rendered Occurrences**: 4 distinct card configuration sections, 8 interactive inputs.

---

## 3. Shared Reusable Component Taxonomy

| Component Name | File Path | Props Schema | Variants / States | Dependencies |
| :--- | :--- | :--- | :--- | :--- |
| **`Button`** | `components/ui/Button.tsx` | `variant`, `size`, `isLoading`, `leftIcon`, `rightIcon`, standard HTML button props | Variants: `primary`, `secondary`, `outline`, `ghost`, `danger`<br>Sizes: `sm`, `md`, `lg` | `lucide-react` |
| **`Badge`** | `components/ui/Badge.tsx` | `variant`, `size`, `dot`, standard HTML span props | Variants: `default`, `success`, `warning`, `danger`, `info`<br>Sizes: `sm`, `md` | Standard HTML |
| **`Modal`** | `components/ui/Modal.tsx` | `isOpen`, `onClose`, `title`, `description`, `size`, `children` | Sizes: `sm`, `md`, `lg`, `xl` | `lucide-react` (`X`) |
| **`SegmentedControl`**| `components/ui/SegmentedControl.tsx` | `options`, `value`, `onChange`, `size` | Options array with `value`, `label`, `icon` | Standard HTML |
| **`MetricCard`** | `components/MetricCard.tsx` | `label`, `value`, `unit`, `trend`, `icon`, `description` | Positive/Negative trend indicators, sub-labels | `lucide-react` |
| **`EnergyGauge`** | `components/EnergyGauge.tsx` | `currentPower`, `maxPower`, `label`, `unit` | SVG dynamic arc fill, tick marks, status threshold colors | Custom SVG Math |
| **`StatusBadge`** | `components/StatusBadge.tsx` | `status` (`'completed' \| 'running' \| 'pending' \| 'failed'`) | Colored pill with animated indicator pulse for running | Standard HTML |
| **`ThemeToggle`** | `components/ThemeToggle.tsx` | `variant` (`'icon' \| 'segmented' \| 'compact'`) | Supports Dark, Light, System modes with tooltip | `lucide-react`, `ThemeContext` |

---

## 4. Visual Assets & Typography Inventory

1. **Typography**:
   - Primary Sans: System UI / Inter font stack (`ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`).
   - Numerical Figures: Tabular Monospace (`ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`).
   - Font Weights Used: `font-normal` (400), `font-medium` (500), `font-semibold` (600), `font-bold` (700).
2. **Iconography**:
   - Sourced exclusively from `lucide-react` v0.460.0.
   - Total distinct icon glyphs used: 26 (`Zap`, `Leaf`, `CheckCircle2`, `ArrowUpRight`, `Layers`, `Cpu`, `Activity`, `Sliders`, `Calendar`, `PlusCircle`, `Search`, `Filter`, `RefreshCw`, `Play`, `AlertTriangle`, `ShieldCheck`, `ArrowRight`, `Award`, `MapPin`, `HardDrive`, `Save`, `RotateCcw`, `Globe`, `Server`, `Palette`, `Menu`, `X`, `Radio`, `Github`, `LayoutDashboard`, `BarChart3`, `Settings`, `ChevronLeft`, `ChevronRight`).
3. **Color Palette & Design Tokens**:
   - Dual-theme token architecture defined in `index.css`:
     - Surface tokens: `--surface-bg`, `--surface-card`, `--surface-muted`, `--surface-overlay`.
     - Border tokens: `--border-subtle`, `--border-prominent`.
     - Text tokens: `--text-primary`, `--text-secondary`, `--text-muted`.
     - Semantic accents: `--accent-primary` (Electric Sky Blue `#0284c7`/`#38bdf8`), Emerald Efficiency (`#059669`/`#34d399`), Amber Alert (`#d97706`/`#fbbf24`), Rose Critical (`#e11d48`/`#f43f5e`).
