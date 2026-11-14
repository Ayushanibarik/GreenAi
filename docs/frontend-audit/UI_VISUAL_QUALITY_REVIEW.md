# UI Visual Quality Review: Aesthetics, Typography & Dual-Theme Craftsmanship
**Auditor**: Chief Design Officer & Visual Systems Architect (`head-design-creative` / Department `[DESIGN]`)  
**Product**: GREEN AI Enterprise Observability Suite  
**Evaluation Scope**: Visual Aesthetics, Apple/Google Benchmarks, Typography, Color Palette, Token Systems  
**Date**: November 2026  

---

## 1. Visual Benchmark & Design Ethos

The visual language of GREEN AI must reflect the precision and restraint of high-performance scientific instrumentation. Drawing inspiration from **Apple Human Interface Guidelines** (system clarity, refined translucency, strict typography scale) and **Google DeepMind / Material You Scientific Workbench** (calm neutral canvases, high-contrast metric figures, purposeful categorical palettes), the UI must project institutional credibility.

---

## 2. Forensic Visual Evaluation

### 2.1 Color Palette & Theme Tokens
The dual-theme architecture in `frontend/src/index.css` establishes distinct palettes:
- **Dark Mode (Obsidian Deep Scientific)**:
  - Background Canvas: `#090a0f` (deep space obsidian with subtle atmospheric mesh gradient).
  - Surface Cards: `#11131c` with 1px border `rgba(255, 255, 255, 0.08)`.
  - Contrast Ratio: 14.8:1 text-to-background, exceeding WCAG AAA standards.
  - Evaluation: Excellent depth. Eliminates the muddy gray of generic Tailwind dark modes.
- **Light Mode (Studio Porcelain Scientific)**:
  - Background Canvas: `#f8f9fb` (crisp photographic porcelain).
  - Surface Cards: `#ffffff` with 1px border `rgba(0, 0, 0, 0.07)` and micro-elevation `box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.04)`.
  - Contrast Ratio: 16.2:1 text-to-background.
  - Evaluation: Clean and clinical. No washed-out low-contrast text.

### 2.2 Semantic Accent Evaluation
- **Primary Accent (`--accent-primary`)**:
  - Dark Mode: `#38bdf8` (Electric Sky Blue)
  - Light Mode: `#0284c7` (Deep Azure Blue)
  - Purpose: Navigation highlights, primary buttons, active slider thumbs, active chart series.
- **Efficiency Green**: `#059669` (Light) / `#34d399` (Dark). Used strictly for carbon reductions, optimal Pareto candidates, and green grid windows.
- **Alert Amber**: `#d97706` (Light) / `#fbbf24` (Dark). Used strictly for voltage threshold cautions and moderate grid carbon intensity.
- **Critical Rose**: `#e11d48` (Light) / `#f43f5e` (Dark). Used strictly for power spikes, latency violations, and failed workloads.
- **Verdict**: Color restraint is well-observed. No extraneous decorative rainbow gradients remain.

---

## 3. Typography & Spacing Rhythm

### 3.1 Typographic Hierarchy
- **Primary Display Figures**: Tabular Monospace (`font-mono`, `tracking-tight`).
  - Example: Large KPI values (`1,428.6 Wh`, `62.9%`, `12.02V`).
  - Alignment: Right-aligned in tabular contexts; left-aligned in standalone metric cards.
  - Tabular Numbers: Enforces fixed glyph widths, preventing UI jitter during 10Hz live telemetry streams.
- **Headings & Body Copy**:
  - H1 Page Titles: `text-xl font-bold tracking-tight text-[var(--text-primary)]`.
  - Section Headers: `text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]`.
  - Table Cell Copy: `text-xs text-[var(--text-secondary)]`.
  - Code & Register Addresses: `font-mono text-[11px] text-[var(--accent-primary)]`.
- **Spacing Rhythm**:
  - Standard container padding: `p-4 sm:p-5` with `rounded-xl` borders.
  - Consistent gap rhythm: `gap-3.5` to `gap-5` throughout all grid sections.

---

## 4. Visual Flaws & Refinement Directives

1. **Table Header Consistency**: In `BenchmarkPage.tsx` and `Dashboard.tsx`, table headers use slightly different background tokens (`bg-[var(--surface-muted)]` vs inline borders). Standardize to a shared `.sci-table` CSS class.
2. **Radial Energy Gauge Contrast**: In `EnergyGauge.tsx`, the background circle track is rendered as `stroke="#e2e8f0"` in light mode and `stroke="#1e293b"` in dark mode. It should consume CSS variable `var(--border-subtle)` to guarantee theme synchronization.
3. **Heatmap Cell Border Alignment**: In `ScheduleHeatmap.tsx`, the 24×7 grid cells have 1px borders that occasionally display subpixel moiré artifacts on non-retina displays. Simplify cell border rendering using CSS grid gap spacing.
