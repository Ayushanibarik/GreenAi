# GreenCompute AI — Benchmark Protocol

## 1. Purpose

This document defines the scientific methodology for benchmarking ML workload energy consumption in GreenCompute AI. The goal is **reproducible, fair, and statistically sound** comparisons between models, hardware configurations, and optimization strategies.

## 2. Principles

| Principle | Rationale |
|-----------|-----------|
| **Controlled warmup** | Eliminate cold-start artifacts (JIT compilation, frequency scaling, cache warming). |
| **Fixed sample count** | Ensure identical computational work across compared runs. |
| **Multiple repeats** | Capture run-to-run variance caused by system noise, thermal throttling, and OS scheduling. |
| **Statistical reporting** | Report mean ± standard deviation; never a single-run number. |
| **Fair comparison rules** | Identical data, identical batch size, identical precision, identical hardware. |

## 3. Protocol Steps

### 3.1 Environment Preparation

1. **Isolate the system**: Close non-essential processes; disable background updates.
2. **Pin hardware state**: Fix CPU governor to `performance`, lock GPU clocks if supported.
3. **Record environment**: Log OS, kernel, driver versions, CPU/GPU model, RAM, ambient temperature.
4. **Set random seeds**: Fix all random seeds (Python, NumPy, PyTorch) for deterministic data loading.

### 3.2 Warmup Phase

- Execute **W** warmup iterations (default: W = 10) of the target workload.
- Discard all measurements from warmup iterations.
- Purpose: Allow JIT optimizers, frequency governors, and caches to reach steady-state.

### 3.3 Measurement Phase

- Execute **N** evaluation samples (default: N = 100) per run.
- Record per-sample:
  - Wall-clock latency (ms)
  - Software energy (RAPL/NVML via CodeCarbon, in mWh)
  - Hardware energy (INA219, in mWh) — if sensor is connected
- N must be identical across all compared experiments.

### 3.4 Repetition

- Repeat the full warmup + measurement cycle **R** times (default: R = 5).
- Allow a **cool-down period** of ≥ 30 seconds between repeats to avoid thermal bias.

### 3.5 Aggregation & Reporting

For each metric (latency, energy, power), compute across R repeats:

| Statistic | Formula |
|-----------|---------|
| Mean | μ = (1/R) Σ xᵢ |
| Std Dev | σ = √[(1/(R−1)) Σ (xᵢ − μ)²] |
| Min / Max | Reported for outlier awareness |

Results are reported as **μ ± σ** with R and N stated explicitly.

### 3.6 Derived Metrics

| Metric | Formula | Unit |
|--------|---------|------|
| Energy per sample | E_total / N | mWh/sample |
| Throughput | N / T_total | samples/sec |
| Carbon per sample | (E_total / N) × carbon_intensity | gCO₂/sample |
| Energy-Delay Product | E_total × T_total | mWh·s |

## 4. Fair Comparison Rules

When comparing two or more configurations (models, GPUs, optimizations):

1. **Same dataset**: Identical evaluation split, same preprocessing pipeline.
2. **Same batch size**: Unless batch size _is_ the variable under study.
3. **Same precision**: FP32 vs FP16 must be stated; do not mix unless studying precision impact.
4. **Same hardware**: Run on the identical machine; if comparing hardware, use the same software stack.
5. **Same N and R**: Sample count and repeat count must match.
6. **Sequential, not concurrent**: Only one experiment runs at a time on the target hardware.

## 5. Reporting Template

Each experiment report must include:

```
Experiment ID:    <uuid>
Date:             <ISO 8601>
Model:            <name, version, parameter count>
Dataset:          <name, split, size>
Hardware:         <CPU model, GPU model, RAM>
Batch Size:       <int>
Precision:        <FP32 | FP16 | INT8>
Warmup (W):       <int>
Samples (N):      <int>
Repeats (R):      <int>
Cool-down:        <seconds>

Results:
  Latency:        <mean> ± <std> ms/sample
  Throughput:     <mean> ± <std> samples/sec
  Energy (SW):    <mean> ± <std> mWh
  Energy (HW):    <mean> ± <std> mWh  (if available)
  Power (avg):    <mean> ± <std> W
  CO₂:            <mean> ± <std> gCO₂
```

## 6. Known Limitations

- Software energy estimation (RAPL) measures CPU package power, not total system power.
- NVML GPU readings may exclude memory controller power on some architectures.
- INA219 hardware measurement accuracy depends on shunt resistor calibration.
- Ambient temperature and thermal throttling introduce uncontrolled variance even with cool-down periods.

## 7. References

- Henderson, P. et al. (2020). "Towards the Systematic Reporting of the Energy and Carbon Footprints of Machine Learning." _JMLR_.
- Lacoste, A. et al. (2019). "Quantifying the Carbon Emissions of Machine Learning." _arXiv:1910.09700_.
- CodeCarbon documentation: https://codecarbon.io/
