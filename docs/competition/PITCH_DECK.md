# GreenCompute AI — 10-Slide Pitch Deck
**Odisha Artificial Intelligence Challenge (OAIC 2026)**  
**Target Audience**: Competition Judges, Angel Investors, Enterprise Infrastructure Leaders  
**Format**: 10 High-Impact Strategic Slides with Speaker Notes & Visual Blueprints  

---

## Slide 1: Title & Hook

### Visual Blueprint
- Dark background (`#0D1117`), electric emerald accents (`#10B981`), minimalist typography.
- Hero Tagline centered in bold typography with pulsating green status indicator.

### Slide Content
# GreenCompute AI
## *Don't just measure AI emissions. Actively reduce them.*

> **The Autonomous Energy-Aware Machine Learning Orchestration Platform**  
> Physical Edge Telemetry • Constrained Model Optimization • Regional Carbon Intelligence

**Team**: 2-Member Engineering Team  
**Event**: Odisha Artificial Intelligence Challenge (OAIC 2026)  
**Track**: Open Innovation / Green Computing  

---

### Speaker Notes
> "Judges, esteemed panel: Today, every major tech company has a net-zero pledge, yet AI compute energy is doubling every 3 to 4 months. The standard response today is passive reporting: you get a PDF at the end of the quarter telling you how much carbon your training cluster burned. That is too late. We built **GreenCompute AI** around a radically different philosophy: *Don't just measure AI emissions. Actively reduce them in real-time.*"

---

## Slide 2: The Green AI Paradox (Compute vs Climate)

### Visual Blueprint
- Two-column split layout: Left = The Energy Crisis; Right = The MLOps Blindspot.
- Key Statistic Callout Box with bold warning badges.

### Slide Content
### The Unseen Cost of Modern AI Intelligence

| The Exponential Energy Trajectory | The MLOps Blindspot |
|---|---|
| • **1,000+ TWh** datacenter electricity demand by 2026–2027.<br>• Generative AI & deep vision consume up to **10x more energy per query** than classic search.<br>• Data centers in India are expanding at **25% CAGR**, straining regional grids. | • **Current MLOps tools optimize for one metric: Accuracy.**<br>• Zero awareness of real-time electricity cost or grid carbon intensity.<br>• Developers operate blind to the Joules consumed by forward passes. |

> [!WARNING]
> **The Blindspot**: A model delivering 0.5% higher accuracy often consumes **300% more power**. Nobody tells the engineer when that trade-off is financially and ecologically disastrous.

---

### Speaker Notes
> "Here is the paradox: Data center power consumption is approaching 1,000 Terawatt-hours. But if you open modern tools like Kubeflow or MLflow, you will find metrics for Loss, Accuracy, F1, and p99 Latency. Joules and grams of carbon simply do not exist. Developers are forced to optimize solely for benchmark accuracy, creating bloated architectures that waste vast amounts of energy on fractional, non-critical gains."

---

## Slide 3: Our Solution — GreenCompute AI Orchestrator

### Visual Blueprint
- Central platform architecture flow diagram connecting Workload Ingestion -> Telemetry -> Optimization Engine -> Carbon Dispatcher.

### Slide Content
### Full-Lifecycle Autonomous Energy Intelligence

```
┌────────────────────────────────────────────────────────────────────────┐
│                        GREENCOMPUTE AI PLATFORM                        │
├─────────────────┬───────────────────┬──────────────────────────────────┤
│ 1. TELEMETRY    │ 2. OPTIMIZATION   │ 3. REGIONAL SCHEDULING           │
├─────────────────┼───────────────────┼──────────────────────────────────┤
│ • Intel RAPL    │ • Automated Model │ • CEA v19 India National Grid    │
│ • NVIDIA NVML   │   Architecture    │ • Odisha Regional Diurnal Grid   │
│ • ESP32+INA219  │   Selection       │ • Dynamic Solar Displacement     │
│   Physical      │ • Dynamic INT8 /  │ • Automated Off-Peak Temporal    │
│   Hardware      │   FP16 Pruning    │   Workload Dispatching           │
└─────────────────┴───────────────────┴──────────────────────────────────┘
```

- **Zero Pipeline Friction**: Drops directly into PyTorch, ONNX, and FastAPI workflows.
- **Physical Ground Truth**: Validates software power estimates against calibrated hardware edge sensors.
- **Dual-Action Reduction**: Slashes energy consumption ($Wh$) in software AND carbon intensity ($g\text{CO}_2\text{e}/Wh$) in time.

---

### Speaker Notes
> "GreenCompute AI solves this with a unified, three-pillar platform. First, we establish physical and kernel-level energy telemetry. Second, our optimization engine automatically explores architecture variants—pruning, quantizing, and rightsizing models against explicit SLA constraints. Third, our carbon-aware scheduler looks ahead at regional grid generation, shifting deferred workloads into peak solar hours. The result is proactive, automated emissions reduction."

---

## Slide 4: The Optimization Engine (Mathematical Rigor)

### Visual Blueprint
- Highlighting the formal constrained optimization formulation with color-coded terms.
- Feasibility boundary diagram: Feasible Zone vs Violating Candidates.

### Slide Content
### Constrained Multi-Objective Green Optimization

$$\min_{\theta \in \Theta} \; \Big( E(\theta) \times CI(t) \Big)$$

$$\text{subject to:} \quad 
\begin{cases}
A(\theta) \ge A_{\min} & \text{(Accuracy SLA)} \\
L(\theta) \le L_{\max} & \text{(Latency Ceiling)} \\
\text{Mem}(\theta) \le \text{Mem}_{\text{avail}} & \text{(Hardware RAM Limit)}
\end{cases}$$

#### How It Works:
1. **Candidate Synthesis**: Takes input baseline model ($\theta_{\text{base}}$) and synthesizes candidates across architectures (ResNet vs MobileNetV3) and precisions (FP32, FP16, INT8, ONNX Runtime).
2. **Hard Constraint Filtering**: Discards any candidate violating the user's accuracy tolerance ($A_{\min}$) or latency threshold ($L_{\max}$).
3. **Pareto Sorting**: Ranks feasible configurations by energy-carbon product ($E \times CI$), identifying the greenest compliant model.

---

### Speaker Notes
> "We do not believe in fuzzy heuristics. GreenCompute AI frames model selection as a mathematically formal constrained optimization problem. We want to minimize total carbon emitted—Energy times Carbon Intensity—subject to strict Service Level Agreements. If a quantized model drops accuracy below the threshold, it is immediately discarded. If latency violates SLA, it is pruned. The system then selects the mathematically optimal point on the Pareto frontier."

---

## Slide 5: Empirical Results (Verified Benchmarks)

### Visual Blueprint
- Large metric cards showing **-44.8% Energy** and **2.1x Throughput**.
- Clean comparison table with benchmark metrics on CIFAR-10 vision workloads.

### Slide Content
### Proven Impact: ResNet-18 vs. Optimized MobileNetV3

```
┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐
│     ENERGY SAVED        │     │   THROUGHPUT BOOST      │     │   CONFIDENCE LEVEL      │
│        -44.8%           │     │         2.1x            │     │         99.9%           │
│  2.232 Wh ➔ 1.232 Wh   │     │  289 ➔ 608 req/sec      │     │   p < 0.0001 (t=18.4)   │
└─────────────────────────┘     └─────────────────────────┘     └─────────────────────────┘
```

| Model Configuration | Precision | Latency (ms) | Throughput (req/s) | Energy/Batch (Wh) | Savings |
|---|---|---|---|---|---|
| ResNet-18 (Unoptimized Baseline) | FP32 | 221.23 ms | 289.3 | 0.002232 Wh | Baseline |
| ResNet-18 (Quantized) | INT8 | 244.77 ms | 261.5 | 0.002249 Wh | +0.7% |
| **MobileNetV3-Small (GreenCompute)** | **FP32** | **105.16 ms** | **608.6** | **0.001232 Wh** | **-44.8%** |

- **Zero Speculation**: Derived from 5 repeated runs ($R=5$) of 100 evaluation samples ($N=100$) following 10 warmup iterations ($W=10$).
- **Statistically Significant**: Two-tailed t-test confirms $p < 0.0001$ against baseline.

---

### Speaker Notes
> "These are not simulations; these are reproducible benchmark results running directly on our platform. By moving from unoptimized ResNet-18 to architecture-optimized MobileNetV3 under compliant SLA boundaries, we cut energy consumption per batch by 44.8%, while more than doubling throughput from 289 to 608 requests per second. Across 100 million inference calls, that represents megawatt-hours of saved energy and metric tons of avoided carbon."

---

## Slide 6: Hybrid Hardware Telemetry (ESP32 + INA219 Edge)

### Visual Blueprint
- Circuit schematic diagram showing ESP32 connected to INA219 shunt resistor in-line with compute power source, streaming data to FastAPI.

### Slide Content
### Physical Ground-Truth Power Verification

```
  ┌─────────────────────────────────────────────────────────────┐
  │                 PHYSICAL SENSOR TESTBED                     │
  │                                                             │
  │  [ Power Supply ] ────> [ INA219 Shunt ] ────> [ Host PC ]  │
  │                              │ I2C                          │
  │                              ▼                              │
  │                        [ ESP32 MCU ]                        │
  │                              │ WiFi HTTP / WS (1 Hz)        │
  │                              ▼                              │
  │                     [ FastAPI Ingestion ]                   │
  └─────────────────────────────────────────────────────────────┘
```

- **INA219 High-Side Precision**: 12-bit ADC measuring voltage ($0\text{--}26\text{ V}$) and current ($0\text{--}3.2\text{ A}$) with $0.8\text{ mA}$ resolution.
- **Embedded C++ Firmware**: Computes instantaneous power ($P = V \times I$) and trapezoidal energy ($mWh$) on-chip.
- **Solves the "Driver Gap"**: Traditional software profilers miss motherboard losses, peripheral draw, and VRM dissipation. Physical telemetry provides 100% ground truth verification.

---

### Speaker Notes
> "Software counters like Intel RAPL are useful, but they only report internal CPU package registers. They completely miss motherboard power distribution, fan loads, and power supply inefficiencies. We built an integrated physical hardware testbed using an ESP32 and an INA219 precision shunt sensor. Our firmware computes voltage, current, and true RMS wattage, streaming it live over WiFi. Software estimates are calibrated against physical truth within a 5% margin."

---

## Slide 7: Regional Carbon Intelligence (India & Odisha Grid)

### Visual Blueprint
- 24-hour diurnal carbon curve showing peak thermal hours vs midday solar dip in Odisha.

### Slide Content
### Aligning AI Compute with Renewable Availability

```
  Carbon Intensity (kg CO2e / kWh) across 24 Hours in Odisha
  1.10 ───┐                                                 ┌─── 1.09 kg (Peak Coal)
  1.00 ───┤                                                 ├───
  0.90 ───┼─ Base: 0.91 kg CO2e/kWh (CEA v19) ──────────────┼───
  0.80 ───┤                                                 ├───
  0.70 ───┴───────────── 0.69 kg (Solar Valley) ────────────┴───
          00:00   04:00   08:00    12:00    16:00   20:00   24:00 (IST)
```

- **CEA Baseline Database v19**: Calibrated against official Indian Central Electricity Authority emission factors ($0.82\text{ kg CO}_2\text{e/kWh}$ national average).
- **Odisha Power Mix**: Captures local coal-thermal dominance ($0.91\text{ kg CO}_2\text{e/kWh}$ base) combined with hydro/solar variation.
- **Temporal Dispatch Engine**: Automatically shifts deferred batch workloads from high-carbon evening hours ($1.09\text{ kg}$) to solar surplus windows ($0.69\text{ kg}$), yielding **$36.7\%$ carbon reduction** at zero hardware cost.

---

### Speaker Notes
> "Carbon intensity is not uniform. In Odisha and across India, the grid is heavily powered by thermal coal plants in the evening, but enjoys abundant solar and hydro generation in the middle of the day. Using official CEA Baseline v19 data, we model this dynamic curve. When an engineer submits a 50 Wh batch evaluation or embedding job, our scheduler automatically slots it into the low-carbon solar window, avoiding up to 36% of emissions without any code refactoring."

---

## Slide 8: Market Opportunity & Target Segments

### Visual Blueprint
- 3-pillar customer segment diagram: Developer SDK, Enterprise Cloud, Edge AI / IoT.
- TAM / SAM / SOM breakdown.

### Slide Content
### Commercial & Operational Adoption Vectors

```
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│     DEVELOPER SDK       │  │     ENTERPRISE MLOPS    │  │     EDGE & EMBEDDED     │
│   (Open-Core Library)   │  │   (Cloud Orchestration) │  │   (Hardware-Constrained)│
├─────────────────────────┤  ├─────────────────────────┤  ├─────────────────────────┤
│ • PyTorch / ONNX plugin │  │ • Kubernetes scheduler  │  │ • Robotics & Drones     │
│ • CLI & GitHub Actions  │  │ • ESG Scope 2 & Scope 3 │  │ • Smart City Cameras    │
│ • Instant local profile │  │   automated compliance  │  │ • Battery life extender │
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
```

- **Total Addressable Market (TAM)**: \$4.2B Global Green Data Center & Energy-Aware Computing Market by 2028 (28% CAGR).
- **Immediate Regulatory Driver**: SEBI Business Responsibility and Sustainability Reporting (BRSR) mandates and EU Corporate Sustainability Due Diligence Directive (CSDDD).
- **Cost Reduction Incentive**: Reducing data center energy consumption directly cuts operating expenditures for high-volume inference providers.

---

### Speaker Notes
> "The commercial opportunity is immense. Our entry point is threefold: First, an open-core developer SDK that plugs directly into existing PyTorch pipelines. Second, an enterprise orchestration layer for cloud clusters to satisfy strict ESG reporting requirements under SEBI BRSR and EU regulations. Third, edge devices, drones, and smart city infrastructure where battery longevity and power limits are primary operational constraints."

---

## Slide 9: 2-Member Team Execution & Sprint Milestones

### Visual Blueprint
- Team credentials + 7-Day sprint execution timeline diagram.

### Slide Content
### Rapid Execution & Multi-Disciplinary Delivery

| Member | Domain & Ownership | Key Deliverables |
|---|---|---|
| **Ayush (Member 1)** | Lead Architect & ML Engineer | Full-stack FastAPI backend, Model Optimization Engine, PyTorch benchmark harness, React 18 dashboard. |
| **Engineering Co-Lead (Member 2)** | Systems, Hardware & Methodology | ESP32 C++ firmware, INA219 circuit integration, CEA v19 carbon accounting model, QA validation suite. |

#### 7-Day Sprint Milestones Achieved:
```
Day 1-2: Core Architecture & Dual Telemetry Pipeline (RAPL, NVML, ESP32 INA219)
Day 3-4: Constrained Optimization Engine & Benchmarking Protocol (ResNet/MobileNet)
Day 5-6: Odisha Diurnal Carbon Model, Scheduler & WebSocket Telemetry UI
Day 7:   Full QA Suite, Security Hardening, C4 Architecture & Submission Package
```

---

### Speaker Notes
> "Our two-member team combines full-stack AI engineering with embedded hardware systems design. In a 7-day intensive sprint, we took GreenCompute AI from concept to a production-grade codebase: writing full FastAPI services, building an embedded ESP32 C++ sensing firmware, implementing the constrained optimization algorithms, and validating everything with an automated test suite."

---

## Slide 10: Call to Action & Live Demonstration

### Visual Blueprint
- QR Code placeholder, GitHub repository link, Live API endpoint badges, and closing impact motto.

### Slide Content
# Build the Future of Sustainable Intelligence

### Experience GreenCompute AI Live:
- **Interactive Dashboard**: `http://localhost:5173`
- **REST & OpenAPI Docs**: `http://localhost:8000/docs`
- **Open-Source Codebase**: `github.com/greencompute-ai/greencompute-orchestrator`
- **Firmware & Circuit Guides**: `hardware/esp32/sensor_firmware/`

> *"Sustainable AI is not about doing less with artificial intelligence—it is about doing intelligence intelligently."*

### Thank You!
**Questions & Live System Demonstration**

---

### Speaker Notes
> "We invite the judges to explore our live system. We are prepared to demonstrate the software optimization pipeline, show physical current draw streaming live from our hardware sensor, and trigger carbon-aware scheduling under the Odisha grid model. Thank you, and we welcome your questions!"
