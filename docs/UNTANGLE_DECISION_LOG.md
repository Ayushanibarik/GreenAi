# Codebase Untangling Decision Log
**Skill**: `untangle-codebase` (Caldo AI)  
**Execution Objective**: Untangle hidden links, needless links, surplus, and special cases in one pass.  
**Options Approved**: Comments cleanup + Tests refinement.  
**Date**: November 2026  

---

## 1. Problem List & Root Causes

### Hidden Links
- **HL-01**: `frontend/src/utils/format.ts` defined standard formatters (`formatWh`, `formatCO2`, `formatLatency`, `formatNumber`), but all pages (`Dashboard.tsx`, `WorkloadPage.tsx`, `BenchmarkPage.tsx`, `OptimizerPage.tsx`, `HardwarePage.tsx`, `MetricCard.tsx`) duplicated bespoke inline `.toFixed(1) Wh`, `(mw/1000).toFixed(2) W` logic with inconsistent decimal precision.
- **HL-02**: Parameter mismatch in Pareto loss weights: `backend/config.py` defined $\beta$ as accuracy and $\gamma$ as latency, whereas `frontend/src/utils/constants.ts` and `OptimizerPage.tsx` defined $\beta$ as latency and $\gamma$ as accuracy.
- **HL-03**: Redundant hardcoded carbon factor defaults (`0.82`) scattered across `backend/config.py`, `frontend/src/utils/constants.ts`, and individual UI pages instead of single-source propagation.

### Needless Links
- **NL-01**: `tests/test_day5_dashboard.py:16` directly asserted the existence of `frontend/dist/index.html` and bundled `.js`/`.css` files. A backend Python test suite should test backend behavior, not whether a local developer ran `npm run build` beforehand.
- **NL-02**: `tests/test_day7_e2e_integration.py:143-192` and `tests/test_day7_integration.py:109-136` asserted word counts and line counts of Markdown files (`OAIC_2026_EXECUTIVE_SUMMARY.md`, `PITCH_DECK.md`, etc.). Documentation edits caused CI unit test failures.
- **NL-03**: `tests/test_day7_integration.py` duplicated the exact assertions and endpoints of `tests/test_day7_e2e_integration.py`, wasting CI execution time without providing additional regression coverage.

### Surplus (Dead Code & Wrappers)
- **SP-01**: `frontend/src/utils/constants.ts:3-23` exported `COLORS` and `CHART_COLORS` palette objects that were never imported by any file in the application (leftover before CSS token adoption).
- **SP-02**: `backend/profiler/energy_profiler.py:57-64` repeatedly attempted `pynvml.nvmlInit()` inside every `snapshot()` call on CPU-only machines because `self._gpu_initialised` remained `False` on failure.

### Special Cases & Swallowed Exceptions
- **SC-01**: Empty `catch {}` blocks across frontend data fetching hooks (`Dashboard.tsx`, `WorkloadPage.tsx`, `BenchmarkPage.tsx`) swallowed network and parsing errors without diagnostic logging.
- **SC-02**: Bare `except Exception: pass` in `backend/hardware/esp32_receiver.py` and `backend/optimizer/model_optimizer.py` suppressed genuine bugs during model profiling.

---

## 2. Redesign From First Principles: Unified Architectural Solutions

### Fix 1: Unified Formatting & Metric Presentation (`frontend/src/utils/format.ts`)
*Solves HL-01, SP-01.*
- Consolidate all scientific scalar formatting into `format.ts`.
- Remove dead `COLORS` and `CHART_COLORS` from `constants.ts`.
- Adopt `formatWh`, `formatCO2`, `formatLatency`, `formatPower` across all views so precision and unit scaling (Wh $\to$ kWh, g $\to$ kg) are colocated in one place.

### Fix 2: Align Pareto Parameter Terminology Across Stack
*Solves HL-02.*
- Standardize mathematical variable names across backend and frontend:
  - $\alpha$: Energy Weight (`alpha_energy`)
  - $\beta$: Latency Weight (`beta_latency`)
  - $\gamma$: Accuracy Weight (`gamma_accuracy`)
  - $\delta$: Memory Weight (`delta_memory`)

### Fix 3: Decouple Python Unit Tests from Frontend Dist & Markdown Files
*Solves NL-01, NL-02, NL-03.*
- Remove filesystem checks of `frontend/dist` and Markdown file line count tests from `tests/`.
- Deduplicate `tests/test_day7_integration.py` into `tests/test_day7_e2e_integration.py` so integration tests run once cleanly.
- Tests now verify behavioral contracts rather than static documentation length.

### Fix 4: GPU Initialization State Machine in EnergyProfiler
*Solves SP-02.*
- Introduce `_gpu_init_attempted: bool` in `EnergyProfiler`. If NVML is not available or initialization fails on CPU-only machines, do not retry on every subsequent 10Hz telemetry tick.

### Fix 5: Meaningful Logging on Fallback Catches (Comments & Exceptions Cleanup)
*Solves SC-01, SC-02.*
- Remove restating comments (e.g., `# Test connection`, `// Reset filters`).
- Replace silent empty `catch {}` blocks with informative debug logger calls.
