import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.simulation.engine import simulation_engine
from app.models.detector import VehicleDetector
import numpy as np

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "HEALTHY"

def test_dashboard():
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "kpis" in data
    assert "intersection_state" in data
    assert "city_intersections" in data

def test_traffic_current():
    response = client.get("/api/traffic/current")
    assert response.status_code == 200
    data = response.json()
    assert "directions" in data
    assert "North" in data["directions"]

def test_traffic_history():
    response = client.get("/api/traffic/history?limit=10")
    assert response.status_code == 200
    data = response.json()
    assert len(data["history"]) == 10

def test_signal_status_and_mode_toggle():
    # 1. Get status
    res = client.get("/api/signals")
    assert res.status_code == 200
    
    # 2. Switch to Traditional
    res2 = client.post("/api/signals/mode", json={"mode": "TRADITIONAL"})
    assert res2.status_code == 200
    assert res2.json()["active_mode"] == "TRADITIONAL"
    
    # 3. Switch back to AI_ADAPTIVE
    res3 = client.post("/api/signals/mode", json={"mode": "AI_ADAPTIVE"})
    assert res3.status_code == 200
    assert res3.json()["active_mode"] == "AI_ADAPTIVE"

def test_human_override():
    res = client.post("/api/signals/override", json={"direction": "West", "force_clearance": True})
    assert res.status_code == 200
    assert res.json()["active_direction"] == "West"

def test_predictions():
    res = client.get("/api/predictions")
    assert res.status_code == 200
    data = res.json()["data"]
    assert "forecast" in data
    assert len(data["forecast"]) == 3
    assert data["forecast"][0]["horizon_minutes"] == 5

def test_emergency_vehicle_trigger():
    res = client.post("/api/emergency/trigger", json={
        "vehicle_type": "Ambulance",
        "direction": "East"
    })
    assert res.status_code == 200
    assert res.json()["status"] == "SUCCESS"
    assert simulation_engine.emergency_active is True

def test_route_calculation():
    res = client.post("/api/routes/calculate", json={
        "origin": "INT-01",
        "destination": "INT-06",
        "avoid_congested": True
    })
    assert res.status_code == 200
    data = res.json()["data"]
    assert "recommended_route" in data
    assert data["recommended_route"]["total_distance_km"] > 0

def test_performance_analytics():
    res = client.get("/api/analytics/comparison")
    assert res.status_code == 200
    data = res.json()["data"]
    assert "metrics" in data
    assert len(data["metrics"]) >= 5

def test_detector_fallback():
    detector = VehicleDetector()
    dummy_img = np.ones((400, 600, 3), dtype=np.uint8) * 128
    result = detector.detect_vehicles(dummy_img)
    assert result["total_vehicles"] >= 0
    assert "annotated_image" in result
    assert "density_level" in result
