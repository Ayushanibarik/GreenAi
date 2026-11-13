# 🌿 GreenCompute AI

<!-- PROJECT LOGO -->
<p align="center">
  <img src="docs/assets/logo-placeholder.png" alt="GreenCompute AI Logo" width="200"/>
</p>

<p align="center">
  <strong>Measure, compare, and optimize the energy footprint of AI workloads.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11-blue?logo=python&logoColor=white" alt="Python 3.11"/>
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" alt="React"/>
  <img src="https://img.shields.io/badge/FastAPI-0.110-009688?logo=fastapi&logoColor=white" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/PyTorch-2.x-EE4C2C?logo=pytorch&logoColor=white" alt="PyTorch"/>
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License MIT"/>
</p>

---

## 📖 Overview

**GreenCompute AI** is a full-stack platform for measuring, benchmarking, and visualizing the energy consumption and carbon emissions of machine-learning training and inference workloads. It combines software-level power estimation, optional hardware sensors (ESP32 + INA219), and a rich dashboard to help researchers and engineers make informed decisions about sustainable AI.

## 🏗️ Architecture

The system is composed of **6 core modules**:

| # | Module | Description |
|---|--------|-------------|
| 1 | **Energy Monitor** | Software-based power estimation via CodeCarbon & RAPL/NVML, plus optional ESP32 hardware sensor ingestion. |
| 2 | **Benchmark Engine** | Reproducible ML benchmark runner with controlled warmup, fixed-sample evaluation, and statistical reporting (mean ± std). |
| 3 | **Carbon Estimator** | Converts energy readings to CO₂-equivalent emissions using configurable grid carbon-intensity factors. |
| 4 | **Backend API** | FastAPI service exposing REST endpoints for experiments, metrics ingestion, and analytics queries. |
| 5 | **Frontend Dashboard** | React + Vite SPA with real-time charts, experiment comparison views, and exportable reports. |
| 6 | **Hardware Interface** | ESP32 firmware reading INA219 current/voltage sensors and streaming measurements to the backend over WiFi. |

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose **or**
- Python 3.11+, Node.js 20+, PostgreSQL 16

### Option A — Docker (recommended)

```bash
cp .env.example .env   # edit as needed
docker compose up --build
```

- Backend API: [http://localhost:8000](http://localhost:8000)
- Frontend:    [http://localhost:5173](http://localhost:5173)

### Option B — Manual

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Language (backend) | Python 3.11 |
| Framework (backend) | FastAPI, Uvicorn |
| ML Runtime | PyTorch 2.x |
| Energy Tracking | CodeCarbon, RAPL, NVML |
| Language (frontend) | TypeScript |
| Framework (frontend) | React 18, Vite |
| Database | PostgreSQL 16 |
| Hardware | ESP32, INA219 (Adafruit) |
| Containerization | Docker, Docker Compose |

## 📁 Project Structure

```
green/
├── backend/                # FastAPI application
│   ├── app/
│   │   ├── main.py         # Application entry point
│   │   ├── api/            # Route handlers
│   │   ├── models/         # SQLAlchemy / Pydantic models
│   │   ├── services/       # Business logic
│   │   └── core/           # Config, dependencies
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/               # React + Vite SPA
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── hardware/
│   └── esp32/
│       └── sensor_firmware/ # Arduino/PlatformIO firmware
├── docs/
│   ├── architecture/
│   ├── methodology/
│   └── experiments/
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## 👥 Team

| Role | Name |
|------|------|
| Project Lead | _TBD_ |
| Backend Engineer | _TBD_ |
| Frontend Engineer | _TBD_ |
| ML / Benchmark Engineer | _TBD_ |
| Hardware Engineer | _TBD_ |

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 GreenCompute AI Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
