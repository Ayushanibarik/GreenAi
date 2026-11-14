# Data Visualization Review: Scientific Scale Integrity, Chart Usability & Recharts Architecture
**Auditor**: Chief Data Officer & Data Visualization Architect (`head-data-science-analytics` / Department `[DATA]`)  
**Product**: GREEN AI Enterprise Observability Suite  
**Scope**: 6 Visualization Modules, Scale Rigor, Color Palette Coherence, Tooltip Accuracy  
**Date**: November 2026  

---

## 1. Executive Summary & Scientific Rigor Criteria

In scientific computing and sustainability benchmarking, data visualization is not decorative: it is the primary interface through which researchers detect anomalies, verify energy models, and evaluate optimization frontiers.

Visualizations must satisfy four core scientific criteria:
1. **Zero Scale Distortion**: Axes must never truncate baselines deceptively; dual-axis scales must clearly indicate units on both left and right y-axes.
2. **Standardized Unit Hygiene**: Watts (W), milliWatts (mW), Watt-hours (Wh), kilowatt-hours (kWh), grams of CO₂e (g), and kilograms (kg) must be formatted with consistent precision and clear unit suffixes.
3. **Responsive Stability**: SVGs must dynamically adapt to viewport changes without breaking aspect ratios or causing clipping in tooltips.
4. **Theme-Adaptive Rendering**: Chart grids, axis labels, crosshairs, and tooltip surfaces must seamlessly adapt to light and dark modes without illegible low-contrast text.

---

## 2. Granular Review of the 6 Visualization Modules

### 2.1 `EnergyTimeChart.tsx` (Power Draw Over Time)
- **Chart Type**: Area & Line chart with gradient fill.
- **Metrics Tracked**: Active Power Draw (W) over dynamic time window.
- **Audit Findings**:
  - Positive: Clean Cartesian grid with low opacity (`stroke="var(--border-subtle)"`).
  - Weakness: The Y-axis domain starts from `dataMin - 10`. While this enhances visual sensitivity to small power variations, in scientific benchmarks, zero-baseline representation is essential to convey the relative magnitude of baseline idle power vs active compute.
  - Recommendation: Provide a toggle for `[Zero Baseline | Dynamic Zoom]`.

### 2.2 `ModelComparisonChart.tsx` (Multi-Metric Architecture Benchmark)
- **Chart Type**: Multi-metric grouped Bar chart.
- **Metrics Tracked**: Energy (Wh), Latency (ms), Accuracy (%), Memory (MB) across 5 configurations.
- **Audit Findings**:
  - Severe Dimensional Incommensurability: Energy (1–5 Wh), Latency (10–120 ms), and Memory (100–500 MB) are plotted on disparate scales. Plotting memory in hundreds alongside energy in single digits creates visual confusion if rendered on a single y-axis.
  - Remediation: The chart correctly normalizes metrics or groups them with dedicated scale axes, but metric selection pills (`Energy`, `Latency`, `Accuracy`, `Memory`) should be provided so users can view one metric at a time or view normalized percentages relative to the FP32 baseline.

### 2.3 `CarbonScheduleChart.tsx` (24-Hour Regional Grid Intensity)
- **Chart Type**: Composed Area & Line chart.
- **Metrics Tracked**: Hourly Grid Carbon Intensity (gCO₂e/kWh) across 24 hours based on Odisha CEA v19 grid data.
- **Audit Findings**:
  - Best-in-Class Implementation: Highlights the mid-day solar generation dip (10:00–14:00) with shaded green window overlay and demarcates the optimal execution window.
  - Tooltip: Custom tooltip formats hour, intensity, and clean generation percentage accurately.

### 2.4 `CarbonBreakdownChart.tsx` (Emissions Decomposition)
- **Chart Type**: Donut / Radial Pie chart.
- **Metrics Tracked**: Scope 2 Operational Electricity (78%) vs Embodied Hardware Carbon Amortization (22%).
- **Audit Findings**:
  - Clean representation complying with GHG Protocol Scope 2 and Green Software Foundation embodied carbon standards.
  - Center metric pill displays Total Operational + Embodied emissions in gCO₂e.

### 2.5 `HardwareTelemetryChart.tsx` (High-Speed Dual-Axis Bus Oscilloscope)
- **Chart Type**: Dual Y-Axis Real-Time Line Chart.
- **Metrics Tracked**: Primary Left Y-Axis: Current (mA) & Power (W); Secondary Right Y-Axis: Voltage (V).
- **Audit Findings**:
  - Voltage fluctuates within a tight band (11.95V–12.05V), while Current swings from 3,000mA to 7,500mA. The dual-axis cleanly handles this difference without crushing the voltage line.
  - Tooltip: Formats all three metrics with full scientific precision (3 decimal places for Volts, integer for mA, 2 decimal places for Watts).

### 2.6 `ScheduleHeatmap.tsx` (7-Day × 24-Hour Grid Intensity Matrix)
- **Chart Type**: Custom CSS Grid Matrix with color intensity mapping.
- **Metrics Tracked**: 168 individual hourly time slots colored from Emerald (cleanest solar/wind hours, ~450 gCO₂/kWh) to Slate/Amber (coal/gas peak hours, ~980 gCO₂/kWh).
- **Audit Findings**:
  - Excellent spatial intelligence visualization.
  - Fix: Add interactive hover tooltip to each cell displaying Day, Hour, and precise gCO₂/kWh.

---

## 3. Tooltip & Color Standardization Matrix

| Chart Module | Series Color (Light) | Series Color (Dark) | Tooltip Surface Token | Unit Suffix |
| :--- | :--- | :--- | :--- | :--- |
| `EnergyTimeChart` | `#0284c7` (Sky) | `#38bdf8` (Cyan) | `var(--surface-card)` | `W` |
| `HardwareTelemetry` | `#059669` (Power), `#d97706` (Volt) | `#34d399`, `#fbbf24` | `var(--surface-card)` | `mA, V, W` |
| `CarbonSchedule` | `#059669` (Intensity) | `#10b981` (Intensity) | `var(--surface-card)` | `gCO₂/kWh` |
| `ModelComparison` | Multi-category | Multi-category | `var(--surface-card)` | `Wh, ms, MB, %` |
| `ScheduleHeatmap` | 5-step gradient | 5-step gradient | Dynamic overlay | `gCO₂/kWh` |
