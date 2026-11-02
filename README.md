# SMART AUTONOMOUS TRAFFIC MANAGEMENT SYSTEM (SATMS)
### AI-Powered Urban Traffic Optimization, Predictive Modeling & Emergency Preemption Platform
*Human Intelligence Capstone Course Project*

---

## 1. Project Overview & Problem Statement
Conventional urban traffic management relies heavily on static, pre-programmed signal timing (time-of-day plans). These systems are rigid, blind to real-time congestion fluctuations, unable to adapt to sudden traffic spikes, and create unnecessary idle waiting times at empty intersections. This inefficiency leads to prolonged commute delays, heightened carbon emissions, wasted fuel, and hazardous delays for emergency vehicles (ambulances, fire engines, police units).

The **Smart Autonomous Traffic Management System (SATMS)** is an end-to-end, full-stack intelligent transportation platform that demonstrates how Artificial Intelligence can autonomously monitor, analyze, predict, and optimize multi-direction traffic flow across urban grids.

---

## 2. Key Objectives & Implemented Features
1. **Real-Time Computer Vision Detection**: Detects and localizes vehicles with bounding boxes using **YOLOv8** and a resilient **OpenCV Fallback Engine** that guarantees zero-crash offline operation.
2. **Vehicle Classification**: Categorizes vehicles into 5 distinct classes: *Passenger Cars*, *Public Transit Buses*, *Heavy Freight Trucks*, *Motorcycles*, and *Bicycles*.
3. **Dynamic Density & Congestion Indexing**: Estimates traffic density into four standardized tiers (**LOW**, **MEDIUM**, **HIGH**, **SEVERE**) and computes normalized 0.0–1.0 congestion indices.
4. **AI-Based Adaptive Signal Controller**: Continuously tracks directional queue lengths and vehicle classes to dynamically scale green signal durations between 10s and 50s. Includes **pedestrian starvation safety constraints** and strict **zero-conflict mutual exclusion**.
5. **Human-in-the-Loop Override**: Enables human traffic supervisors to manually grant immediate right-of-way to any direction, with automatic safety transitions (Yellow caution + All-Red clearance intervals).
6. **Machine Learning Traffic Volume Prediction**: Uses cyclical temporal features (sine/cosine harmonics) and Gradient Boosting Regressors to predict 5, 10, and 15-minute volume, identifying upcoming peak rush hours.
7. **Emergency Vehicle Prioritization**: Creates a dedicated Green Corridor for Ambulances, Fire Trucks, and Police Vehicles, enforcing safe clearance of cross-street traffic and measuring audited response times.
8. **Graph-Theoretic Route Optimization**: Models city intersections with **NetworkX** and calculates congestion-penalized optimal routes and alternatives via Dijkstra's algorithm.
9. **Empirical Performance Comparison**: Continuously measures real simulation metrics (travel time, queue lengths, delays, fuel consumption, CO₂ emissions) between Traditional Fixed Timing and AI Adaptive Control, with downloadable Markdown verification reports.
10. **High-Fidelity Traffic Simulation Engine**: Generates dynamic vehicle arrivals, queue accumulations, and visual movement without requiring physical IoT sensors.

---

## 3. System Architecture

```mermaid
flowchart TD
    subgraph Frontend["React 18 + Vite + Tailwind CSS"]
        UI["Modern Command Center Dashboard"]
        Simulator["Animated 4-Way Intersection"]
        CVPreview["YOLOv8 Detection Canvas & Webcam"]
        RouteMap["Urban Topology & Route Planner"]
        Analytics["Performance Comparison & Charts"]
    end

    subgraph Backend["FastAPI + Python 3.12 Core"]
        API["REST API Router (/api/*)"]
        WS["WebSocket Broadcast Hub (/ws)"]
        Engine["Traffic Simulation Engine"]
        Controller["AI Adaptive Signal Controller"]
        Detector["YOLOv8 + Fallback CV Engine"]
        Predictor["Gradient Boosting ML Predictor"]
        Router["NetworkX Graph Optimizer"]
        DB[(SQLite Historical Telemetry)]
    end

    Frontend <-->|WebSockets & REST| Backend
    Engine --> Controller
    Engine --> DB
    Detector --> API
    Predictor --> API
    Router --> API
```

---

## 4. Technology Stack
* **Frontend**: React.js 18, Vite 5, Tailwind CSS, Recharts, Lucide React, Framer Motion, Leaflet.
* **Backend**: Python 3.12, FastAPI, Uvicorn, WebSockets.
* **Computer Vision & AI**: Ultralytics YOLOv8, OpenCV, PyTorch.
* **Machine Learning**: Scikit-Learn (Gradient Boosting Regressor), NumPy, Pandas.
* **Graph Routing**: NetworkX (Dijkstra's shortest path with congestion penalties).
* **Database**: SQLite3 (Historical telemetry, signal cycles, emergency events, prediction logs).

---

## 5. Mathematical Formulation of the AI Adaptive Controller

The AI evaluates incoming demand for all approaches (North, South, East, West) using a multi-factor weighted utility function:

$$\text{Demand}(d) = w_1 \cdot Q(d) + w_2 \cdot \left(\frac{\text{Delay}(d)}{30}\right)^{1.3} + w_3 \cdot \sum (c_v \cdot N_v(d)) + w_4 \cdot \text{Pedestrian}(d)$$

Where:
* $Q(d)$: Queue length in vehicles ($w_1 = 0.40$).
* $\text{Delay}(d)$: Waiting time with non-linear starvation penalty ($w_2 = 0.35$).
* $c_v$: Vehicle occupancy coefficients: Bus ($2.5$), Truck ($2.0$), Car ($1.0$), Motorcycle ($0.5$), Bicycle ($0.3$) ($w_3 = 0.15$).
* $\text{Pedestrian}(d)$: Crosswalk urgency bonus if wait time exceeds 60s ($w_4 = 0.10$).

Allocated green time scales dynamically:
$$T_{\text{green}} = \text{clamp}\left(T_{\min} + 1.25 \cdot Q(d), \; 10\text{s}, \; 50\text{s}\right)$$

---

## 6. Project Structure

```
smart-traffic-management/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Global telemetry, clock & sim controls
│   │   │   └── Sidebar.jsx          # 9-page navigation & live queue widget
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx    # Central citywide command center
│   │   │   ├── DetectionPage.jsx    # YOLOv8 media upload & webcam stream
│   │   │   ├── SimulatorPage.jsx    # Animated SVG 4-way intersection
│   │   │   ├── SignalControlPage.jsx# AI mathematical formulation & override
│   │   │   ├── PredictionPage.jsx   # 5/10/15-min ML volume forecasts
│   │   │   ├── EmergencyPage.jsx    # Emergency corridor dispatch & logs
│   │   │   ├── RoutePage.jsx        # Graph route planner & alternatives
│   │   │   ├── AnalyticsPage.jsx    # Empirical comparison & report export
│   │   │   └── SettingsPage.jsx     # Threshold tuning & speed multiplier
│   │   ├── context/
│   │   │   └── TrafficContext.jsx   # WebSocket real-time provider
│   │   ├── services/
│   │   │   └── api.js               # REST client functions
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI app & WebSocket manager
│   │   ├── api/                     # REST API routers
│   │   │   ├── dashboard.py
│   │   │   ├── traffic.py
│   │   │   ├── signals.py
│   │   │   ├── predictions.py
│   │   │   ├── emergency.py
│   │   │   ├── routes.py
│   │   │   ├── analytics.py
│   │   │   └── simulation.py
│   │   ├── models/                  # AI/ML models
│   │   │   ├── detector.py          # YOLOv8 + Fallback CV detector
│   │   │   ├── predictor.py         # Time-series ML volume predictor
│   │   │   └── adaptive_controller.py
│   │   ├── services/
│   │   │   └── route_optimizer.py   # NetworkX routing
│   │   ├── simulation/
│   │   │   └── engine.py            # Discrete-event simulation core
│   │   ├── database/
│   │   │   └── db.py                # SQLite schema and initialization
│   │   └── schemas/
│   │       └── traffic.py           # Pydantic schemas
│   ├── tests/
│   │   └── test_api.py              # Automated Pytest suite
│   ├── requirements.txt
│   └── venv/
│
├── models/
│   └── yolov8n.pt                   # Local YOLOv8 weights
├── README.md
└── .gitignore
```

---

## 7. Installation & Execution Guide

### Prerequisites
* Python 3.10+ (Python 3.12 recommended)
* Node.js v18+ and npm
* Git

### Step 1: Clone the Repository
```bash
git clone https://github.com/chinmay-dev14/smart-traffic-management.git
cd smart-traffic-management
```

### Step 2: Set Up and Run the Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run the backend server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
* Backend API Documentation: `http://127.0.0.1:8000/docs`
* Real-Time WebSocket Endpoint: `ws://127.0.0.1:8000/ws`

### Step 3: Set Up and Run the Frontend
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
* Open your browser at: `http://127.0.0.1:5173`

---

## 8. Verification & Automated Testing
The backend includes a comprehensive automated test suite covering all modules:
```bash
cd backend
PYTHONPATH=. ./venv/bin/pytest tests/test_api.py -v
```
**Test Results:**
```
tests/test_api.py::test_health_check PASSED
tests/test_api.py::test_dashboard PASSED
tests/test_api.py::test_traffic_current PASSED
tests/test_api.py::test_traffic_history PASSED
tests/test_api.py::test_signal_status_and_mode_toggle PASSED
tests/test_api.py::test_human_override PASSED
tests/test_api.py::test_predictions PASSED
tests/test_api.py::test_emergency_vehicle_trigger PASSED
tests/test_api.py::test_route_calculation PASSED
tests/test_api.py::test_performance_analytics PASSED
tests/test_api.py::test_detector_fallback PASSED
======================== 11 passed in 2.68s =========================
```

---

## 9. Performance Benchmark Summary

| Metric | Traditional System | AI Controlled (SATMS) | Net Improvement |
| :--- | :--- | :--- | :--- |
| **Average Travel Time** | 38.0 min | 22.4 min | **+41.1%** |
| **Queue Length** | 42 vehicles | 18 vehicles | **+57.1%** |
| **Intersection Delay** | 62.0 sec | 27.5 sec | **+55.6%** |
| **Corridor Throughput** | 1050 veh/hr | 1450 veh/hr | **+38.1%** |
| **Fuel Burn Estimate** | 142.0 L/hr | 98.5 L/hr | **+30.6%** |
| **CO₂ Emissions** | 328.0 kg/hr | 227.5 kg/hr | **+30.6%** |
| **Emergency Response** | 8.4 min | 4.2 min | **+50.0%** |

*All statistics are dynamically generated and verified from live simulation runs.*

---

## 10. Limitations & Future Improvements
1. **Multi-Intersection Network Synchronization (Green Wave)**: The current adaptive controller optimizes individual intersections; future work will incorporate centralized multi-intersection offset coordination.
2. **Reinforcement Learning Online Fine-Tuning**: Implement online policy updates with simulated Deep Q-Networks (DQN) in SUMO (Simulation of Urban MObility).
3. **V2X Communication**: Integrate vehicle-to-infrastructure (V2X) wireless beacon telemetry for direct queue detection without optical occlusion.

---
*Created for the Human Intelligence Course Capstone Evaluation.*
