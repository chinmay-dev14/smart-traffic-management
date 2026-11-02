from fastapi import APIRouter
from app.simulation.engine import simulation_engine
from app.models.predictor import TrafficPredictor

router = APIRouter(prefix="/api/predictions", tags=["Traffic Volume Prediction"])
predictor = TrafficPredictor()

@router.get("")
def get_traffic_predictions():
    state = simulation_engine.get_state()
    current_count = state["total_vehicles"]
    current_queue = state["total_queue"]
    
    forecast_data = predictor.get_forecast("INT-01", current_count, current_queue)
    return {
        "status": "SUCCESS",
        "data": forecast_data
    }
