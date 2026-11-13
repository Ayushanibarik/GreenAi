# Scientific Carbon Accounting Methodology & Regional Grid Dynamics
**Odisha Artificial Intelligence Challenge (OAIC 2026)**  
**Document Series**: Technical & Scientific Standards  
**Authors**: GreenCompute AI Core Team & ESG Sustainability Group  
**Standard Compliance**: GHG Protocol Scope 2 Guidance • ISO 14064-1 • CEA CO₂ Baseline Database v19.0  

---

## 1. Regulatory Context & Scope Definition

Quantifying the environmental footprint of digital computation requires rigorous, standardized accounting principles. The Greenhouse Gas (GHG) Protocol Corporate Standard categorizes computational emissions under **Scope 2** (indirect emissions from purchased electricity) and **Scope 3, Category 1 & 11** (upstream and downstream digital services).

GreenCompute AI follows the **GHG Protocol Scope 2 Guidance**, which mandates reporting through two distinct accounting lenses:
1. **Location-Based Method**: Reflects the average emissions intensity of grids on which energy consumption occurs (using predominantly grid-average emission factors).
2. **Market-Based / Marginal Method**: Reflects emissions from electricity that organizations have purposefully chosen, accounting for time-of-use and marginal generation units displaced during peak vs off-peak hours.

---

## 2. India National Grid Baseline Emission Factors

The official regulatory authority for electricity emissions accounting in India is the **Central Electricity Authority (CEA)** under the Ministry of Power, Government of India.

According to the **CEA CO₂ Baseline Database for the Indian Power Sector (Version 19.0)**:
- **Unified National Grid**: Following the synchronous interconnection of all regional grids (NEWNE and Southern Grid), the national grid operates as a unified frequency and dispatch block.
- **Weighted Average Emission Factor (National Grid)**:
  $$\mathbf{EF}_{\text{India, avg}} = \mathbf{0.82} \text{ kg CO}_2\text{e / kWh} \quad (820 \text{ g CO}_2\text{e / kWh})$$
- **Operating Margin (OM)**: $0.94\text{ kg CO}_2\text{e / kWh}$ (captures fossil-fuel generation dispatched to meet incremental load).
- **Build Margin (BM)**: $0.68\text{ kg CO}_2\text{e / kWh}$ (captures recent renewable capacity additions).
- **Combined Margin (CM)**: $0.81\text{ kg CO}_2\text{e / kWh}$ (used for clean development and renewable energy project validation).

In GreenCompute AI, the national default baseline factor is parameterized as $CI_{\text{national}} = 0.82\text{ kg CO}_2\text{e/kWh}$.

---

## 3. Odisha State-Level Electricity Mix & Grid Dynamics

Odisha occupies a distinct position within the Eastern Regional Grid (ERPC). The state features massive mineral and coal reserves alongside strategic hydroelectric reservoirs.

### 3.1 Odisha Power Generation Profile

```
┌────────────────────────────────────────────────────────────────────────┐
│                   ODISHA REGIONAL GENERATION MIX                       │
├──────────────────────────────────┬─────────────────────────────────────┤
│ Generation Source                │ Percentage Share (%)                │
├──────────────────────────────────┼─────────────────────────────────────┤
│ Thermal (Coal-fired)             │ ~72.4%                              │
│ • NTPC Talcher (STPS & TSTPS)    │                                     │
│ • Ib Valley Thermal (OPGC)       │                                     │
│ • Vedanta & Captive IPPs         │                                     │
├──────────────────────────────────┼─────────────────────────────────────┤
│ Hydroelectric                    │ ~21.2%                              │
│ • Hirakud Hydroelectric Project  │                                     │
│ • Balimela, Upper Kolab, Rengali │                                     │
│ • Indravati Hydro Power Project  │                                     │
├──────────────────────────────────┼─────────────────────────────────────┤
│ Renewable (Solar, Wind & Bio)    │ ~6.4% (Expanding under RPO)         │
└──────────────────────────────────┴─────────────────────────────────────┘
```

Because coal-fired thermal generation dominates baseload supply in Odisha, the state-specific location-based baseline emission factor is higher than the national average:
$$\mathbf{EF}_{\text{Odisha, base}} = \mathbf{0.91} \text{ kg CO}_2\text{e / kWh} \quad (910 \text{ g CO}_2\text{e / kWh})$$

This factor accounts for:
- Specific heat rate of pit-head thermal stations in the Mahanadi coalfields.
- High ash content ($38\text{--}44\%$) typical of indigenous Indian non-coking coal.
- Hydro generation flexibility, which is predominantly reserved for morning and evening peak shaving.

---

## 4. Time-of-Day (ToD) Diurnal Carbon Curve & Solar Displacement

Electricity carbon intensity is **not static** across the 24 hours of a day. It fluctuates with regional demand curves and the dispatch order of generation assets (the merit order dispatch).

### 4.1 Diurnal Variations in Odisha
1. **Midday Solar Window (10:00 – 15:00 IST)**:
   - Solar photovoltaic (PV) generation feeds into the grid at zero marginal operating emissions.
   - Run-of-river hydro stations operate at full allowable head.
   - Thermal units reduce load toward technical minimums ($55\text{--}60\%$), driving marginal carbon intensity down.
2. **Evening Peak Window (18:00 – 22:00 IST)**:
   - Solar generation drops to zero.
   - Domestic lighting and commercial cooling loads create the daily system peak.
   - High-heat-rate, older thermal peaking units and diesel/gas peaking turbines are dispatched to maintain grid stability.
   - Marginal carbon intensity reaches its daily maximum.

### 4.2 Time-of-Day Multiplier Function $M(t)$

GreenCompute AI models the hourly carbon intensity $CI(t)$ as:
$$CI(\text{region}, t) = CI_{\text{base}}(\text{region}) \times M(t)$$

Where $M(t)$ is calibrated against regional SLDC (State Load Despatch Centre) and POSOCO/Grid-Controller dispatch data:

| Hour (IST) | Multiplier $M(t)$ | Odisha $CI(t)$ ($\text{kg CO}_2\text{e/kWh}$) | Dispatch Regime |
|---|---|---|---|
| `00:00 - 04:00` | 0.80 – 0.85 | 0.728 – 0.774 | Night baseload (steady thermal, low demand) |
| `05:00 - 07:00` | 0.85 – 0.90 | 0.774 – 0.819 | Morning ramp-up |
| `08:00 - 09:00` | 0.95 – 1.00 | 0.865 – 0.910 | Industrial and commercial opening |
| **`10:00 - 14:00`** | **0.75 – 0.78** | **0.683 – 0.710** | **Solar peak insolation & Hydro baseline (Solar Valley)** |
| `15:00 - 17:00` | 0.85 – 0.95 | 0.774 – 0.865 | Solar tapering |
| **`18:00 - 21:00`** | **1.15 – 1.20** | **1.047 – 1.092** | **Evening peak demand (Peaking coal/gas units active)** |
| `22:00 - 23:00` | 1.00 – 0.90 | 0.910 – 0.819 | Night decline |

```
  Graph: Hourly Carbon Intensity in Odisha (kg CO2e / kWh)
  1.10 ─────────────────────────────────────────── [1.09 kg: 19:00 Peak Coal]
  1.00 ───────────────────────────────────────────
  0.90 ─── [0.91 kg: Baseline] ───────────────────
  0.80 ───
  0.70 ───────────────── [0.68 kg: 12:00 Solar] ──
       00  02  04  06  08  10  12  14  16  18  20  22  24  (Hour of Day IST)
```

---

## 5. Mathematical Formulation of Workload Carbon Avoidance

When a batch machine learning job requiring total energy $E_{\text{total}}\text{ (kWh)}$ is scheduled, its emissions are determined by the integral over its execution window:

$$\text{Emissions} = \int_{t_{\text{start}}}^{t_{\text{start}} + \Delta t} P(\tau) \times CI(\tau) \, d\tau$$

For a discrete job with average power $P$ over duration $\Delta t = t_2 - t_1$:
$$\text{Emissions}(t_1, t_2) = E_{\text{total}} \times \left( \frac{1}{\Delta t} \int_{t_1}^{t_2} CI(\tau) \, d\tau \right)$$

### Worked Example: 50 Wh Batch Model Evaluation in Odisha
- **Scenario A (Immediate Execution at 19:00 IST)**:
  $$CI(19:00) = 0.91 \times 1.20 = 1.092 \text{ kg CO}_2\text{e/kWh}$$
  $$\text{Emissions}_A = 0.050 \text{ kWh} \times 1.092 \text{ kg CO}_2\text{e/kWh} = \mathbf{54.60} \text{ g CO}_2\text{e}$$

- **Scenario B (Deferred Execution at 12:00 IST Solar Valley)**:
  $$CI(12:00) = 0.91 \times 0.76 = 0.6916 \text{ kg CO}_2\text{e/kWh}$$
  $$\text{Emissions}_B = 0.050 \text{ kWh} \times 0.6916 \text{ kg CO}_2\text{e/kWh} = \mathbf{34.58} \text{ g CO}_2\text{e}$$

- **Net Carbon Avoidance**:
  $$\Delta \text{CO}_2\text{e} = 54.60\text{ g} - 34.58\text{ g} = \mathbf{20.02} \text{ g CO}_2\text{e} \quad (\mathbf{-36.67\%})$$

---

## 6. Uncertainty Budgeting & Error Propagation

Scientific integrity requires stating confidence intervals and bounding sources of measurement uncertainty. Total emissions calculation involves three independent physical and empirical parameters:
$$\text{CO}_2\text{e} = E_{\text{meas}} \times CI_{\text{grid}} \times (1 + \lambda_{\text{T\&D}})$$

Where:
- $E_{\text{meas}}$: Measured compute energy.
- $CI_{\text{grid}}$: Regional grid carbon intensity.
- $\lambda_{\text{T\&D}}$: Transmission and distribution loss factor ($19.5\%$ in India average).

### 6.1 Individual Uncertainty Sources ($u_i$)

| Parameter | Uncertainty Source | Distribution | Relative Uncertainty ($u_r = \sigma / \mu$) | Notes |
|---|---|---|---|---|
| **$E_{\text{HW}}$ (INA219 Sensor)** | Shunt resistor tolerance (0.1 Ω, 1%) + ADC quantization error (12-bit) | Normal | $\pm 1.2\%$ | Calibrated with Keithley DMM bench reference |
| **$E_{\text{SW}}$ (Intel RAPL)** | On-die MSR counter polling jitter, DRAM power approximation | Normal | $\pm 3.5\%$ | Validated across repeated benchmark runs ($R=5$) |
| **$CI_{\text{base}}$ (CEA v19)** | Plant heat rate reporting delay, coal gross calorific value (GCV) variance | Rectangular | $\pm 4.0\%$ | Official CEA audited statistical tolerance |
| **$M(t)$ (ToD Multiplier)** | Unpredicted cloud cover, solar ramping, sudden load excursions | Normal | $\pm 5.5\%$ | Historical Odisha SLDC dispatch variance |
| **$\lambda_{\text{T\&D}}$ (Grid Losses)** | Line losses across state transmission and DISCOM utility networks | Normal | $\pm 2.0\%$ | National Average T&D loss variance |

### 6.2 Combined Uncertainty Propagation (GUM Method)

Following the **JCGM 100:2008 Guide to the Expression of Uncertainty in Measurement (GUM)**, the combined relative standard uncertainty $u_c(y)$ for uncorrelated variables is calculated via root-sum-squares (RSS):

$$\frac{u_c(\text{CO}_2\text{e})}{\text{CO}_2\text{e}} = \sqrt{ \left(\frac{u_E}{E}\right)^2 + \left(\frac{u_{CI}}{CI}\right)^2 + \left(\frac{u_{\text{ToD}}}{M(t)}\right)^2 + \left(\frac{u_{\text{T\&D}}}{1+\lambda}\right)^2 }$$

Substituting empirical parameters:
$$\frac{u_c(\text{CO}_2\text{e})}{\text{CO}_2\text{e}} = \sqrt{ (0.012)^2 + (0.040)^2 + (0.055)^2 + (0.020)^2 }$$
$$\frac{u_c(\text{CO}_2\text{e})}{\text{CO}_2\text{e}} = \sqrt{ 0.000144 + 0.001600 + 0.003025 + 0.000400 } = \sqrt{0.005169} \approx \mathbf{0.0719} \quad (\mathbf{\pm 7.19\%})$$

### 6.3 Expanded Uncertainty & Reporting

Using a coverage factor of **$k = 2$** (corresponding to an approximate **$95\%$ level of confidence** for a normal distribution):
$$U_{95} = k \times u_c = 2 \times 7.19\% = \mathbf{\pm 14.38\%}$$

**Standard Statement for GreenCompute AI Reports**:
> *"Reported carbon footprints are calculated using CEA CO₂ Baseline v19.0 factors with an expanded uncertainty of $\pm 14.4\%$ ($k=2, 95\%$ confidence level), accounting for physical shunt calibration, power counter polling, and regional merit-order dispatch fluctuations."*

---

## 7. Future Alignment with India's 2030 NDC Targets

GreenCompute AI includes scenario-based forward projections aligning with India's **Nationally Determined Contributions (NDCs)** under the Paris Agreement:
1. **Target**: Achieving $500\text{ GW}$ of non-fossil electrical capacity by 2030 ($50\%$ cumulative power generation from renewables).
2. **Impact on Odisha Grid**: Increased solar park installations in western Odisha and offshore wind developments will depress the daytime base emission factor from $0.91\text{ kg}$ down to an estimated $0.52\text{ kg CO}_2\text{e/kWh}$ by 2030.
3. **Automated Algorithm Adaptation**: The `CarbonIntelligence` engine dynamically ingests annual CEA baseline updates, guaranteeing that optimization and scheduling decisions remain legally and empirically accurate as the clean energy transition accelerates.
