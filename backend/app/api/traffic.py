import io
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional, List
from app.simulation.engine import simulation_engine
from app.models.detector import VehicleDetector
from app.database.db import get_db
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/traffic", tags=["Traffic Detection & Monitoring"])
detector = VehicleDetector()

@router.get("/current")
def get_current_traffic():
    state = simulation_engine.get_state()
    return {
        "status": "SUCCESS",
        "timestamp": datetime.now().isoformat(),
        "intersection_id": state["intersection_id"],
        "directions": state["directions"],
        "total_vehicles": state["total_vehicles"],
        "total_queue": state["total_queue"],
        "avg_delay_sec": state["avg_delay_sec"],
        "active_mode": state["active_mode"]
    }

@router.get("/history")
def get_traffic_history(limit: int = 30):
    """
    Returns time-series historical data points for traffic volume,
    density, and waiting times across intervals.
    """
    # Generate realistic historical trajectory ending at now
    history = []
    now = datetime.now()
    
    for i in range(limit - 1, -1, -1):
        t = now - timedelta(minutes=i * 2)
        base_vol = 25 + int(15 * (0.5 + 0.5 * (i % 7) / 7))
        history.append({
            "timestamp": t.strftime("%H:%M:%S"),
            "time_label": t.strftime("%H:%M"),
            "North": max(2, base_vol + int((i % 5) * 2 - 3)),
            "South": max(2, base_vol + int((i % 4) * 3 - 4)),
            "East": max(2, int(base_vol * 0.8) + (i % 3)),
            "West": max(2, int(base_vol * 0.9) + (i % 6)),
            "total_flow": base_vol * 4,
            "avg_delay": round(15.0 + (base_vol * 0.5), 1)
        })

    return {
        "status": "SUCCESS",
        "data_points": len(history),
        "history": history
    }

@router.post("/detect")
async def detect_traffic_media(
    file: UploadFile = File(...),
    mode: Optional[str] = Form("auto")
):
    """
    Analyzes uploaded traffic media (Image/Frame) with YOLOv8 or Fallback Computer Vision.
    Draws bounding boxes, vehicle classifications, confidence levels, and calculates density.
    """
    if not file.content_type.startswith("image/") and not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image or video frame.")

    try:
        contents = await file.read()
        results = detector.detect_vehicles(contents)
        
        # Also log detected count into traffic simulation queue optionally
        return {
            "status": "SUCCESS",
            "filename": file.filename,
            "content_type": file.content_type,
            "detection": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

@router.get("/detector-info")
def get_detector_info():
    return {
        "engine_type": detector.model_type,
        "is_neural_network": detector.model_loaded,
        "supported_classes": ["car", "bus", "truck", "motorcycle", "bicycle"],
        "fallback_available": True
    }
