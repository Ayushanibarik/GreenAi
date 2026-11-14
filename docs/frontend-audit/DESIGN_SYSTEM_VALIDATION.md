# Design System Validation: Apple & Google Benchmark Verification
**Auditor**: Design Systems Architecture Group (`head-design-creative` / Department `[DESIGN]`)  
**Product**: GREEN AI Enterprise Observability Suite  
**Date**: November 2026  

---

## 1. Design System Verification Against Tier-1 Benchmarks

To ensure GREEN AI feels like a top-tier scientific product (comparable to Google DeepMind lab tools or Apple Pro workflows) rather than a cookie-cutter dashboard template, we benchmark every token layer:

| Dimension | Generic AI Template Trap (Eliminated) | Apple HIG / DeepMind Standard (Validated) | Status |
| :--- | :--- | :--- | :---: |
| **Color Depth** | Muddy `#1e293b` grays with purple/blue gradients | True deep obsidian (`#090a0f`) in dark mode; pure photographic porcelain (`#f8f9fb`) in light mode | **Validated** |
| **Surfaces** | Heavy frosted glassmorphism (`backdrop-blur-md bg-white/10`) | Opaque structured cards with subtle 1px border dividers (`border-[var(--border-subtle)]`) | **Validated** |
| **Typography** | Inconsistent sans-serif with proportional numbers that jitter | High-contrast sans-serif paired with strict tabular monospace (`font-mono`) for all scalar numbers | **Validated** |
| **Accents** | Rainbow gradient fills and glowing neon box-shadows | Restrained single-hue accents (Sky Blue, Emerald Green, Amber Warning) used purely for semantic meaning | **Validated** |
| **Borders** | Rounded-3xl pill containers with heavy black drop shadows | Micro-elevation (`shadow-sm`) with `rounded-xl` geometry and 1px crisp separation | **Validated** |

---

## 2. Canonical Token Specification (`index.css`)

```css
:root {
  --surface-bg: #f8f9fb;
  --surface-card: #ffffff;
  --surface-muted: #f1f3f7;
  --surface-overlay: rgba(255, 255, 255, 0.95);
  --border-subtle: rgba(15, 23, 42, 0.08);
  --border-prominent: rgba(15, 23, 42, 0.16);
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #64748b;
  --accent-primary: #0284c7;
  --accent-hover: #0369a1;
  --accent-subtle: rgba(2, 132, 199, 0.08);
  --status-success: #059669;
  --status-warning: #d97706;
  --status-danger: #e11d48;
}

.dark {
  --surface-bg: #090a0f;
  --surface-card: #11131c;
  --surface-muted: #181b26;
  --surface-overlay: rgba(17, 19, 28, 0.95);
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-prominent: rgba(255, 255, 255, 0.16);
  --text-primary: #f8f9fb;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --accent-primary: #38bdf8;
  --accent-hover: #7dd3fc;
  --accent-subtle: rgba(56, 189, 248, 0.1);
  --status-success: #34d399;
  --status-warning: #fbbf24;
  --status-danger: #f43f5e;
}
```

---

## 3. Component Design Token Guidelines

1. **Card Elements (`.sci-card`)**:
   - Must use `bg-[var(--surface-card)]` and `border border-[var(--border-subtle)]`.
   - Never apply hardcoded colored borders or neon glow shadows.
2. **Tabular Displays (`.sci-table`)**:
   - Header row must use `bg-[var(--surface-muted)]` with `text-[var(--text-muted)] font-semibold uppercase text-[10px] tracking-wider`.
   - Data cells must use `py-2.5 px-3 text-xs` with `font-mono` on numbers.
   - Alternating row hovers must use `hover:bg-[var(--surface-muted)] transition-colors`.
3. **Buttons (`<Button>`)**:
   - Primary: `bg-[var(--accent-primary)] text-white hover:opacity-90`.
   - Outline: `border border-[var(--border-subtle)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--surface-muted)]`.
