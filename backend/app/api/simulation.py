from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.simulation.engine import simulation_engine

router = APIRouter(prefix="/api/simulation", tags=["Simulation Controls"])

class TrafficAdjustRequest(BaseModel):
    delta: float # e.g. +0.2 or -0.2

class SpeedAdjustRequest(BaseModel):
    speed: float # e.g. 1.0, 2.0

@router.post("/start")
def start_simulation():
    simulation_engine.running = True
    return {"status": "SUCCESS", "running": True, "message": "Simulation started"}

@router.post("/stop")
def stop_simulation():
    simulation_engine.running = False
    return {"status": "SUCCESS", "running": False, "message": "Simulation paused"}

@router.post("/reset")
def reset_simulation():
    simulation_engine.reset()
    return {"status": "SUCCESS", "message": "Simulation reset successfully"}

@router.post("/traffic")
def adjust_traffic(req: TrafficAdjustRequest):
    simulation_engine.set_traffic_intensity(req.delta)
    return {
        "status": "SUCCESS",
        "traffic_intensity": simulation_engine.traffic_intensity,
        "message": f"Traffic intensity set to {simulation_engine.traffic_intensity}x"
    }

@router.post("/speed")
def adjust_speed(req: SpeedAdjustRequest):
    if req.speed <= 0 or req.speed > 10:
        raise HTTPException(status_code=400, detail="Speed must be between 0.1 and 10.0")
    simulation_engine.speed_multiplier = req.speed
    return {"status": "SUCCESS", "speed": simulation_engine.speed_multiplier}
