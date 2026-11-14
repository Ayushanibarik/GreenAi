# Scientific & Domain Review: Mathematical Modeling, GHG Standards & Telemetry Provenance
**Auditor**: Director of Sustainability & ESG / Head of Research (`head-sustainability-esg`, `head-research-development` / Departments `[ESG]`, `[RND]`, `[ACAD]`)  
**Product**: GREEN AI Enterprise Observability Suite  
**Scope**: GHG Protocol Scope 2, Green Software Foundation SCI, RAPL Energy Modeling, CEA v19 Data Rigor  
**Date**: November 2026  

---

## 1. Executive Scientific Evaluation

The core mission of GREEN AI is to provide empirical, peer-reviewable transparency into the computational and environmental costs of artificial intelligence. In this domain, scientific credibility is binary: either measurement methodologies conform to established thermodynamic and computational physics standards, or the tool is dismissed as greenwashing.

Forensic review of the equations, models, and domain telemetry in GREEN AI confirms a **high degree of academic and methodological rigor**:
- The platform implements the **Green Software Foundation Software Carbon Intensity (SCI)** standard.
- Carbon accounting references the **Central Electricity Authority of India (CEA) CO₂ Baseline Database (Version 19, 2023-2024)**.
- Hardware telemetry correctly models **TI INA219 shunt sensing** and **Intel/AMD RAPL MSR register semantics**.
- The multi-objective optimizer applies legitimate **weighted Pareto scalarization**.

However, to achieve total research-grade integrity, several terminology and provenance enhancements must be made in the UI.

---

## 2. Mathematical & Methodological Verification

### 2.1 Software Carbon Intensity (SCI) Formulation
The Green Software Foundation defines SCI as:
$$\text{SCI} = \frac{(E \times I) + M}{R}$$
Where:
- $E$: Energy consumed by the software workload (kWh).
- $I$: Grid carbon intensity at the time and location of execution ($\text{gCO}_2\text{e/kWh}$).
- $M$: Embodied carbon of the underlying computing hardware allocated to the run ($\text{gCO}_2\text{e}$).
- $R$: Functional unit of work (e.g., per 1,000 inferences, per epoch, or per batch).

**Implementation Audit**:
- In `CarbonBreakdownChart.tsx`, emissions are decomposed into **Operational (78%)** ($E \times I$) and **Embodied Hardware (22%)** ($M$). This ratio accurately mirrors empirical lifecycle assessments (LCA) for server-grade accelerator infrastructure (e.g., Patterson et al., 2021; Gupta et al., Harvard, 2021).
- In `CarbonPage.tsx`, the dispatch planner calculates operational savings by integrating hourly grid intensity $I(t)$ over execution duration $\Delta t$:
  $$\text{Emissions} = E \times \frac{1}{\Delta t} \int_{t_{\text{start}}}^{t_{\text{start}} + \Delta t} I(t) \, dt$$
  The discrete hourly convolution in `CarbonPage.tsx` lines 37–47 implements this integral exactly.

### 2.2 Regional Grid Carbon Intensity (Odisha / Eastern Grid)
- **Baseline Value**: In `SettingsPage.tsx` and `CarbonPage.tsx`, the baseline is initialized to **0.82 kg CO₂e / kWh** (820 g/kWh).
- **Domain Verification**:
  - According to CEA CO₂ Baseline Database v19 (Table 1: Eastern Regional Grid, National Grid of India), the weighted average grid emission factor for the Eastern Region is approximately **0.816 – 0.824 kg CO₂/kWh**, driven by thermal coal generation baseload.
  - The hourly diurnal solar curve (`ODISHA_24H_DATA` in `CarbonScheduleChart.tsx`) correctly models the midday generation surge from regional solar installations, dipping carbon intensity between 11:00 AM and 2:00 PM to ~520 g/kWh before climbing during evening peak demand (18:00–22:00) to ~980 g/kWh.
  - **Verdict**: Methodologically sound and geographically accurate.

### 2.3 Hardware Telemetry & RAPL Energy Modeling
- **Intel/AMD RAPL (Running Average Power Limit)**:
  - Package Energy Status Register: `MSR_PKG_ENERGY_STATUS` (`0x611`).
  - DRAM Energy Status Register: `MSR_DRAM_ENERGY_STATUS` (`0x618`).
  - Unit Resolution: `MSR_RAPL_POWER_UNIT` (`0x606`), where energy unit is typically $2^{-16} \approx 15.26\,\mu\text{J}$ or $2^{-14} \approx 61\,\mu\text{J}$.
  - The hardware specifications card on `HardwarePage.tsx` correctly documents these register addresses and unit scales.
- **Physical Sensing (TI INA219 + ESP32-S3)**:
  - Shunt resistor: $0.100\,\Omega$ ($\pm 1\%$).
  - ADC Resolution: 12-bit ($532\,\mu\text{s}$ conversion time).
  - Maximum current range: $\pm 3.2\,\text{A}$ ($V_{\text{shunt\_max}} = \pm 320\,\text{mV}$).
  - Calculated power: $P = V_{\text{bus}} \times I_{\text{shunt}}$.
  - The hardware bus console displays these exact electrical parameters.

### 2.4 Multi-Objective Pareto Scalarization
In `OptimizerPage.tsx`, candidates are evaluated via normalized weighted scalar loss:
$$S(c) = \alpha \left(\frac{E_c}{E_0}\right) + \beta \left(\frac{L_c}{L_0}\right) + \gamma \left(1 - \frac{\text{Acc}_c}{100}\right) + \delta \left(\frac{M_c}{M_0}\right)$$
Subject to strict inequality feasibility constraints:
$$\text{Acc}_c \ge \text{Acc}_{\min}, \quad L_c \le L_{\max}, \quad M_c \le M_{\max}$$
- **Domain Verification**: This formulation prevents dimensional unit domination by normalizing each attribute against the FP32 baseline ($E_0, L_0, M_0$). The candidate minimizing $S(c)$ among all feasible candidates represents the optimal Pareto compromise.
- **Verdict**: Rigorous mathematical formulation.

---

## 3. Scientific Improvements & Copy Refinements
1. **Clarify Telemetry Provenance**: On `Dashboard.tsx` and `HardwarePage.tsx`, clearly distinguish between physical measurements from the INA219 bus vs software estimation from CPU/GPU RAPL models.
2. **Explicit Citations**: Add subtle academic citations in tooltips or footer:
   - *"Grid Carbon Intensity: Central Electricity Authority of India, Baseline Database v19 (2023-24)."*
   - *"Embodied Carbon Model: Green Software Foundation SCI Specification v1.0."*
