import asyncio
import json
from contextlib import asynccontextmanager
from typing import List, Set
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database.db import init_db
from app.simulation.engine import simulation_engine
from app.api.dashboard import router as dashboard_router
from app.api.traffic import router as traffic_router
from app.api.signals import router as signals_router
from app.api.predictions import router as predictions_router
from app.api.emergency import router as emergency_router
from app.api.routes import router as routes_router
from app.api.analytics import router as analytics_router
from app.api.simulation import router as simulation_router

# WebSocket Client Connection Pool
class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)

    async def broadcast(self, message: dict):
        dead_connections = set()
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                dead_connections.add(connection)
        for dead in dead_connections:
            self.active_connections.discard(dead)

manager = ConnectionManager()

# Background simulation runner
async def simulation_worker():
    while True:
        try:
            if simulation_engine.running:
                simulation_engine.step()
                # Broadcast state to all connected frontends
                state = simulation_engine.get_state()
                await manager.broadcast({
                    "type": "SIMULATION_UPDATE",
                    "data": state
                })
        except Exception as e:
            print(f"[Simulation Worker Error]: {e}")
        
        # Sleep interval adjusted by speed multiplier (supports up to 10x speed)
        sleep_interval = max(0.08, 1.0 / max(0.1, simulation_engine.speed_multiplier))
        await asyncio.sleep(sleep_interval)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database and Simulation Worker
    init_db()
    worker_task = asyncio.create_task(simulation_worker())
    print("[SATMS Backend] Server started with database initialized and simulation loop active.")
    yield
    # Shutdown
    worker_task.cancel()
    try:
        await worker_task
    except asyncio.CancelledError:
        pass
    print("[SATMS Backend] Simulation worker shut down cleanly.")

app = FastAPI(
    title="Smart Autonomous Traffic Management System (SATMS) API",
    description="Real-time AI-Powered Urban Traffic Optimization and Preemption Platform",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for local development and demonstration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(dashboard_router)
app.include_router(traffic_router)
app.include_router(signals_router)
app.include_router(predictions_router)
app.include_router(emergency_router)
app.include_router(routes_router)
app.include_router(analytics_router)
app.include_router(simulation_router)

@app.get("/api/health")
def health_check():
    return {
        "status": "HEALTHY",
        "service": "SATMS AI Traffic Core",
        "simulation_running": simulation_engine.running,
        "mode": simulation_engine.mode,
        "clients_connected": len(manager.active_connections)
    }

# Real-Time WebSocket Endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    # Send immediate initial state on connect
    try:
        await websocket.send_json({
            "type": "INITIAL_STATE",
            "data": simulation_engine.get_state()
        })
        while True:
            # Listen for optional incoming client commands
            data = await websocket.receive_text()
            try:
                cmd = json.loads(data)
                if cmd.get("action") == "PING":
                    await websocket.send_json({"type": "PONG"})
            except Exception:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
