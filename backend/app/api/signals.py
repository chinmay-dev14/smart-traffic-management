from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.simulation.engine import simulation_engine

router = APIRouter(prefix="/api/signals", tags=["Signal Control & AI Decisioning"])

class ModeSwitchRequest(BaseModel):
    mode: str # TRADITIONAL, AI_ADAPTIVE, MANUAL_OVERRIDE
    direction: Optional[str] = None

class ManualOverrideRequest(BaseModel):
    direction: str # North, South, East, West
    force_clearance: bool = True

@router.get("")
def get_signal_status():
    state = simulation_engine.get_state()
    return {
        "status": "SUCCESS",
        "intersection_id": state["intersection_id"],
        "active_mode": state["active_mode"],
        "active_direction": state["active_direction"],
        "current_signal_phase": state["current_signal_phase"],
        "remaining_timer": state["remaining_timer"],
        "pedestrian_wait_time": state["pedestrian_wait_time"],
        "ai_reasoning": state["ai_reasoning"],
        "emergency_active": state["emergency_active"],
        "directions": state["directions"]
    }

@router.post("/mode")
def set_signal_mode(req: ModeSwitchRequest):
    valid_modes = ["TRADITIONAL", "AI_ADAPTIVE", "MANUAL_OVERRIDE"]
    if req.mode not in valid_modes:
        raise HTTPException(status_code=400, detail=f"Mode must be one of {valid_modes}")
    
    simulation_engine.set_mode(req.mode, req.direction)
    return {
        "status": "SUCCESS",
        "message": f"Signal controller mode set to {req.mode}",
        "active_mode": simulation_engine.mode,
        "active_direction": simulation_engine.active_direction,
        "reasoning": simulation_engine.latest_reasoning
    }

@router.post("/override")
def human_operator_override(req: ManualOverrideRequest):
    if req.direction not in simulation_engine.directions_list:
        raise HTTPException(status_code=400, detail="Invalid direction")

    simulation_engine.set_mode("MANUAL_OVERRIDE", req.direction)
    return {
        "status": "SUCCESS",
        "message": f"Human operator manually granted GREEN to {req.direction}",
        "active_direction": simulation_engine.active_direction,
        "current_signal_phase": simulation_engine.current_signal_phase
    }
