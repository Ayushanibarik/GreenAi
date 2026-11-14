# GREEN AI — Design System Specification
**Version:** 2.0.0 (Scientific Observability Release)  
**Status:** Implemented & Verified  
**Date:** 2026-11-14  

---

## 1. Design System Foundations

The GREEN AI design system bridges **Scientific Computing, Enterprise Observability, and Sustainability Analytics**.

### Core Tenets:
1. **Restraint over Decoration:** Eliminate gratuitous gradients, heavy shadows, and decorative neon halos. Every visual container, line, and color must communicate telemetry state.
2. **First-Class Dual-Theme Parity:** Both Light and Dark themes share an identical semantic hierarchy and are fully contrast-compliant with WCAG 2.1 AA standards.
3. **Typographic Rigor:** Tabular numerals for telemetry (`font-mono`), uppercase micro-labels with wide letter spacing for telemetry parameters, and clean system typography for reading ease.
4. **Data Accuracy over Approximation:** Distinguish between measured hardware values ($\pm 0.1\%$ shunt precision) and predicted ML values with clear source metadata.

---

## 2. Semantic Color Tokens

### Surface Hierarchy

| CSS Variable | Light Theme | Dark Theme | Role |
| :--- | :--- | :--- | :--- |
| `--surface-canvas` | `#F8FAFC` | `#0A0D14` | The outermost application canvas |
| `--surface-panel` | `#FFFFFF` | `#101522` | Sidebars, headers, dialog surfaces |
| `--surface-card` | `#FFFFFF` | `#151B2B` | Primary content cards and charts |
| `--surface-card-hover` | `#F1F5F9` | `#1C2438` | Hover elevation state |
| `--surface-muted` | `#F1F5F9` | `#131927` | Subdued tracks, table headers, insets |
| `--surface-pill` | `rgba(0,0,0,0.04)` | `rgba(255,255,255,0.06)` | Segmented button tracks and chips |

### Border Tokens

| CSS Variable | Light Theme | Dark Theme | Role |
| :--- | :--- | :--- | :--- |
| `--border-subtle` | `#E2E8F0` | `#1E293B` | Structural dividers, card borders |
| `--border-strong` | `#CBD5E1` | `#334155` | Focused inputs, hover borders |
| `--border-focus` | `#0284C7` | `#38BDF8` | Accessible keyboard focus indicator |

### Text & Typographic Colors

| CSS Variable | Light Theme | Dark Theme | Role |
| :--- | :--- | :--- | :--- |
| `--text-primary` | `#0F172A` | `#F8FAFC` | Headlines, primary data values |
| `--text-secondary` | `#475569` | `#94A3B8` | Body descriptions, table rows |
| `--text-muted` | `#94A3B8` | `#64748B` | Timestamps, micro-labels, units |

### Domain & Semantic Brand Tokens

| Token Name | Light Theme | Dark Theme | Domain Usage |
| :--- | :--- | :--- | :--- |
| `--brand-primary` | `#059669` | `#10B981` | Green AI branding, energy savings, Pareto optimal choice |
| `--brand-blue` | `#0284C7` | `#38BDF8` | Real-time power draw, throughput, hardware oscilloscope |
| `--brand-amber` | `#D97706` | `#FBBF24` | Moderate latency, thermal ceilings, warning limits |
| `--brand-rose` | `#DC2626` | `#F43F5E` | Fossil grid peaks, SLA threshold violations, error states |

---

## 3. Typography Scale & Hierarchy

- **Font Family (Prose):** `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Google Sans", "Inter", sans-serif`
- **Font Family (Technical Data):** `ui-monospace, "SF Mono", "Cascadia Code", "Fira Code", monospace`

| Level | Size | Weight | Tracking | Sample Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Metric** | `36px - 48px` | `800` (Extrabold) | `-0.04em` | Large KPI numbers (`1,428.6 Wh`) |
| **Page Title** | `20px - 24px` | `700` (Bold) | `-0.025em` | Workspace titles (`Model Benchmark Matrix`) |
| **Section Header** | `13px - 14px` | `700` (Bold) | `0.05em` | Card labels (`SLA CONSTRAINTS`) |
| **Body Primary** | `13px - 14px` | `400` (Normal) | `-0.01em` | Explanatory text & descriptions |
| **Technical Label** | `10px - 11px` | `600` (Semibold) | `0.08em` | Units, parameters (`VOLTAGE (V)`) |

---

## 4. Spacing, Layout & Elevation Standards

- **Spacing Scale:** Standard 4px grid (`4px, 8px, 12px, 16px, 20px, 24px, 32px, 48px`).
- **Container Max-Width:** `max-w-7xl` (`1280px`) centered with responsive padding (`px-4 sm:px-6 lg:px-8`).
- **Card Radius:** Standardized at `16px` (`rounded-2xl`) for primary bento cards and `12px` (`rounded-xl`) for inputs and buttons.
- **Elevation Philosophy:** No heavy fuzzy drop-shadows. Shadows are subtle ambient contact shadows (`0 1px 3px rgba(0,0,0,0.05)` in light, tonal surface step-ups in dark).

---

## 5. UI Primitives Specification

1. **`Button`**: Accessible keyboard navigation, loading state with spinner, `primary`, `secondary`, `outline`, `ghost`, and `danger` variants.
2. **`Badge`**: Pill status indicator with optional pulsing radar dot (`success`, `warning`, `error`, `info`, `neutral`).
3. **`SegmentedControl`**: Tactile mode/tab switcher with radio group semantics (`role="radiogroup"`).
4. **`Modal`**: Accessible dialog overlay with focus trap, `Escape` key dismissal, and backdrop blur.
5. **`ThemeToggle`**: Segmented selector (`Light`, `Dark`, `System`) or compact icon toggle with persistent `localStorage` synchronization.
6. **`ScientificMetricCard`**: Domain-aware KPI card featuring tabular numbers, percentage deltas, and uncertainty bounds.
