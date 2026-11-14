# Design System Audit: Token Architecture, Primitives & Component Governance
**Auditor**: Design Systems Architect (`head-design-creative` / Department `[DESIGN]`)  
**Product**: GREEN AI Enterprise Observability Suite  
**Scope**: Token Architecture, CSS Variables, UI Primitives, Component Prop Schemas  
**Date**: November 2026  

---

## 1. Executive Summary

A mature enterprise software platform requires a unified design system where visual tokens (colors, typography, spacing, borders, shadows) and core UI primitives (`Button`, `Badge`, `Modal`, `SegmentedControl`, `MetricCard`, `Table`) are managed through strict declarative contracts.

The recent migration to Tailwind CSS v4 in `frontend/src/index.css` established an initial foundation of CSS custom properties:
- `--surface-bg`, `--surface-card`, `--surface-muted`, `--surface-overlay`
- `--border-subtle`, `--border-prominent`
- `--text-primary`, `--text-secondary`, `--text-muted`
- `--accent-primary`, `--accent-hover`, `--accent-subtle`

However, forensic scanning of the codebase reveals **token leakage**: hardcoded utility classes (e.g., `text-sky-600 dark:text-sky-400`, `border-emerald-500/30`, `bg-emerald-500/10`) are used alongside semantic variables, creating minor discrepancies across views.

---

## 2. Design Token Governance & Architecture

```
Layer 1: Global Primitive Tokens (Raw Colors, Font Stacks)
   ↓
Layer 2: Semantic Design Tokens (Surface, Text, Border, Accent, Status)
   ↓
Layer 3: Component Primitives (Button, Badge, Modal, MetricCard, Gauge)
   ↓
Layer 4: Composed Views (Dashboard, Workloads, Benchmarks, Optimizer)
```

### 2.1 Color Tokens Analysis
- **Strengths**: Theme switching is centralized in `index.css` using `:root` and `.dark` blocks, responding dynamically to `document.documentElement.classList.contains('dark')`.
- **Weaknesses**:
  - Semantic status colors (success, warning, error, info) lack standardized CSS custom properties in `index.css`. Pages are directly invoking `text-emerald-600 dark:text-emerald-400` or `text-amber-500`.
  - Recommendation: Introduce explicit status variables in `index.css`:
    - `--status-success`, `--status-success-bg`, `--status-success-border`
    - `--status-warning`, `--status-warning-bg`, `--status-warning-border`
    - `--status-error`, `--status-error-bg`, `--status-error-border`
    - `--status-info`, `--status-info-bg`, `--status-info-border`

---

## 3. UI Primitive Component Contracts

### 3.1 Button (`components/ui/Button.tsx`)
- **Props Contract**:
  ```typescript
  interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
  }
  ```
- **Audit Findings**:
  - Clean implementation, proper accessibility attributes (`aria-disabled`), and loading spinner state.
  - Fix needed: In some pages, native `<button>` tags were written instead of using `<Button>`. These should be refactored to consume `<Button>`.

### 3.2 Badge (`components/ui/Badge.tsx`)
- **Props Contract**:
  ```typescript
  interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
    size?: 'sm' | 'md';
    dot?: boolean;
  }
  ```
- **Audit Findings**:
  - The badge primitive exists, but `StatusBadge.tsx` was implemented separately with hardcoded Tailwind styles rather than composing `Badge`.
  - Fix: Refactor `StatusBadge.tsx` to wrap `Badge`.

### 3.3 Modal (`components/ui/Modal.tsx`)
- **Props Contract**:
  ```typescript
  interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    children: React.ReactNode;
  }
  ```
- **Audit Findings**:
  - Includes backdrop blur, keyboard `Escape` dismissal listener, body scroll lock, and `role="dialog"`.
  - Fix needed: Add focus trapping so Tab navigation cycles within the active modal.

---

## 4. Design System Validation Checklist
- [x] Dual-theme variables declared in `:root` and `.dark`
- [x] Zero reliance on external Google Fonts CDN (uses system fonts for privacy and zero network delay)
- [x] Tabular numerical figures (`font-mono`) enforced on all telemetry displays
- [ ] Centralize status color variables (`--status-success`, `--status-warning`, etc.) in `index.css`
- [ ] Migrate standalone status pills to use `ui/Badge`
