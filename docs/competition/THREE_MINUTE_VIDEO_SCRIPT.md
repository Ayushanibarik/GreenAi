# GreenCompute AI — 3-Minute Video Presentation Script
**Competition**: Odisha Artificial Intelligence Challenge (OAIC 2026)  
**Track**: Open Innovation / Sustainable Computing  
**Total Target Duration**: Exactly 3 Minutes (180 Seconds)  
**Cast**:  
- **Speaker 1 (Ayush / ML & Software Lead)**: Leads problem setup, software optimization demo, carbon scheduler.  
- **Speaker 2 (Hardware & Systems Co-Lead)**: Leads dual-telemetry architecture, physical hardware demo, business impact.  

---

## Production & Choreography Overview

```
[00:00 - 00:30]  Scene 1: The Hook & The AI Carbon Blindspot          (30s) | Speaker 1
[00:30 - 01:00]  Scene 2: GreenCompute AI Architecture & Telemetry      (30s) | Speaker 2
[01:00 - 01:45]  Scene 3: Live Demos 1 & 2 (Optimization & ESP32 Telemetry) (45s) | Speaker 1 & 2
[01:45 - 02:20]  Scene 4: Live Demo 3 (Odisha Carbon-Aware Scheduling)  (35s) | Speaker 1
[02:20 - 02:45]  Scene 5: Market Opportunity & Scalability              (25s) | Speaker 2
[02:45 - 03:00]  Scene 6: Final Closing & Call to Action                (15s) | Both Speakers
```

---

## Detailed Word-for-Word Script

### [00:00 - 00:30] Scene 1: The Hook & The AI Carbon Blindspot (30s)

**[Visual Cue]**:
*Opening shot: Clean camera on Speaker 1 in front of a sleek dark-mode workstation. Behind them, an illuminated monitor displays real-time fluctuating power waveforms. At 00:08, screen transitions to a split graphic: on the left, an exponential curve of global AI datacenter energy reaching 1,000 TWh; on the right, traditional MLOps tools showing only Loss and Accuracy metrics.*

**Speaker 1 (Ayush)**:
> "Every day, millions of machine learning models process billions of queries across the globe. By 2026, AI data centers will consume over one thousand Terawatt-hours of electricity. 
> 
> Yet, if you look at any standard MLOps dashboard today, you will see Loss, Accuracy, and Latency. Energy consumption and carbon emissions are completely invisible.
> 
> A fractional 0.5% boost in accuracy often burns 300% more power—and engineers have no way to know. 
> 
> We are here to change that. Welcome to **GreenCompute AI**."

---

### [00:30 - 01:00] Scene 2: Platform Architecture & Dual Telemetry (30s)

**[Visual Cue]**:
*Camera cuts smoothly to Speaker 2 holding an ESP32 microcontroller with an INA219 breakout board wired neatly into a test bench. B-roll cutaway: 3D animated diagram showing software telemetry (RAPL/NVML) and physical sensing converging into the FastAPI backend and React 18 dashboard.*

**Speaker 2 (Co-Lead)**:
> "Most carbon estimators rely on coarse, theoretical guesses. GreenCompute AI grounds carbon accounting in **physical reality**.
> 
> We engineered a dual-layer telemetry pipeline:
> 
> First, software-level Intel RAPL and NVIDIA NVML counters measure exact on-die CPU and GPU package Joules.
> 
> Second, our custom ESP32 edge sensor with an INA219 precision shunt physically measures bus voltage and current draw at one Hertz. 
> 
> This provides verified, empirical ground truth for every inference pass running across our infrastructure."

---

### [01:00 - 01:45] Scene 3: Live Demos 1 & 2 — Optimization & Hardware Telemetry (45s)

**[Visual Cue]**:
*Picture-in-picture: Full-screen capture of the GreenCompute AI React Dashboard (`http://localhost:5173/benchmark`). Speaker 1 clicks 'Run Benchmark & Optimize' with SLA constraints set to Min Accuracy: 12%, Max Latency: 150ms. A second split window shows the live physical WebSocket power graph responding instantly.*

**Speaker 1 (Ayush)**:
> "Let’s watch it in action. Here is an image classification workload running an unoptimized ResNet-18 baseline at 221 milliseconds per batch, consuming 2.23 milliwatt-hours.
> 
> With one click, our **Constrained Optimization Engine** benchmarks candidate architectures against strict SLA constraints: minimum twelve percent accuracy, maximum one-hundred-fifty milliseconds latency.
> 
> The engine automatically selects MobileNetV3. Look at the numbers: **a 44.8% reduction in energy consumption**, and throughput jumps **2.1 times** from 289 to 608 requests per second!"

**Speaker 2 (Co-Lead)**:
*(Camera cuts to close-up of ESP32 LED pulsing as the INA219 graph spikes during the inference burst)*
> "And you can see the physical confirmation right here on our live telemetry stream. As the model executes, the INA219 captures the real-world current spike, streaming verified milliwatts over WebSockets directly to the interface. Software prediction meets physical proof."

---

### [01:45 - 02:20] Scene 4: Live Demo 3 — Regional Carbon-Aware Scheduling (35s)

**[Visual Cue]**:
*Screen transitions to the 'Carbon Scheduler' view (`http://localhost:5173/schedule`). An interactive 24-hour diurnal carbon intensity chart for the Odisha regional grid appears, showing the thermal peak at 19:00 IST ($1.09\text{ kg CO}_2\text{e/kWh}$) and the deep solar valley at 12:00 IST ($0.69\text{ kg CO}_2\text{e/kWh}$). Speaker 1 inputs a 50 Wh batch workload with a 12-hour deadline.*

**Speaker 1 (Ayush)**:
> "Saving Joules is only step one. Where and when you consume power matters just as much.
> 
> We integrated the official Central Electricity Authority Baseline Database Version 19, modeling Odisha’s regional power grid. In Odisha, evening peak hours rely heavily on thermal coal plants. But during midday, abundant solar and hydro generation flood the grid.
> 
> When we queue this 50 Watt-hour batch job with a twelve-hour completion deadline, our scheduler automatically defers execution from seven PM to noon tomorrow. 
> 
> The result? An immediate **36.7% operational carbon reduction**—with zero loss in model precision and zero changes to user code."

---

### [02:20 - 02:45] Scene 5: Market Opportunity & Scalability (25s)

**[Visual Cue]**:
*Clean graphics showing target sectors: Developer SDK (PyTorch/ONNX logo), Enterprise Cloud Clusters (Kubernetes logo), and Edge / Smart City IoT (camera/drone icons). Key compliance tags appear: 'SEBI BRSR Ready', 'Scope 2/3 GHG Protocol'.*

**Speaker 2 (Co-Lead)**:
> "This represents a four-billion-dollar global market opportunity.
> 
> For enterprise cloud teams, GreenCompute AI automates compliance with emerging SEBI BRSR and international ESG disclosure mandates.
> 
> For drone operators and smart city edge cameras in Odisha, our battery-aware optimization multiplies mission runtime in the field. 
> 
> It is an open-core architecture ready to drop into any existing PyTorch, Triton, or Kubernetes cluster today."

---

### [02:45 - 03:00] Scene 6: Final Closing & Call to Action (15s)

**[Visual Cue]**:
*Both speakers side-by-side in center frame. Lower third displays the GitHub URL (`github.com/greencompute-ai/greencompute-orchestrator`) and live demo address (`http://localhost:5173`). End with bold title card and the GreenCompute AI logo.*

**Speaker 1 (Ayush)**:
> "GreenCompute AI proves that sustainable AI is not about doing less with artificial intelligence..."

**Speaker 2 (Co-Lead)**:
> "...it’s about doing intelligence intelligently."

**Speaker 1 & 2 (In Unison)**:
> "Explore our code, test our live demo, and join us in building the green future of computing. Thank you!"

*Fade to black with project link and OAIC 2026 emblem.*

---

## Technical Director's Production Checklist

| Timecode | Audio Track | Visual Source | On-Screen Graphic |
|---|---|---|---|
| `00:00 - 00:08` | Narration (Spk 1) | Speaker 1 Medium Close-Up | GreenCompute AI title card |
| `00:08 - 00:30` | Narration (Spk 1) | Screen B-roll | 1,000 TWh Stat & MLOps Blindspot split |
| `00:30 - 00:45` | Narration (Spk 2) | Speaker 2 Medium Close-Up | Physical ESP32 + INA219 hardware highlight |
| `00:45 - 01:00` | Narration (Spk 2) | Architecture Diagram | Dual-layer telemetry data flow |
| `01:00 - 01:30` | Narration (Spk 1) | Screen Capture (Dashboard) | Model Optimizer: -44.8% Energy, 2.1x Throughput |
| `01:30 - 01:45` | Narration (Spk 2) | Hardware Camera + Screen Pip | Live WebSocket current waveform |
| `01:45 - 02:20` | Narration (Spk 1) | Screen Capture (Scheduler) | Odisha Grid 24h Diurnal Curve: 36.7% CO2 saved |
| `02:20 - 02:45` | Narration (Spk 2) | Slide Graphics | Enterprise ESG, Developer SDK, Edge IoT TAM |
| `02:45 - 03:00` | Narration (Both) | Both Speakers Wide Shot | GitHub repo, live demo URL, OAIC 2026 logo |
