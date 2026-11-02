from fastapi import APIRouter
from app.simulation.engine import simulation_engine
from app.database.db import get_db
from datetime import datetime

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("")
def get_dashboard_summary():
    state = simulation_engine.get_state()
    
    # Calculate vehicle totals and category breakdown
    category_totals = {"cars": 0, "buses": 0, "trucks": 0, "motorcycles": 0, "bicycles": 0}
    for d in state["directions"].values():
        b = d.get("vehicle_breakdown", {})
        for cat in category_totals:
            category_totals[cat] += b.get(cat, 0)

    # Average density across all directions
    avg_ci = sum(d["congestion_index"] for d in state["directions"].values()) / 4.0
    if avg_ci < 0.35:
        density_label = "LOW"
    elif avg_ci < 0.65:
        density_label = "MEDIUM"
    elif avg_ci < 0.85:
        density_label = "HIGH"
    else:
        density_label = "SEVERE"

    # Secondary intersections overview for the city map
    city_intersections = [
        {
            "id": "INT-01",
            "name": "Central Plaza (Monitored)",
            "lat": 40.7128,
            "lng": -74.0060,
            "density": density_label,
            "congestion_index": round(avg_ci, 2),
            "status": state["current_signal_phase"],
            "active_dir": state["active_direction"],
            "queue": state["total_queue"]
        },
        {
            "id": "INT-02",
            "name": "Tech District East",
            "lat": 40.7180,
            "lng": -73.9920,
            "density": "MEDIUM",
            "congestion_index": 0.48,
            "status": "GREEN",
            "active_dir": "East",
            "queue": 14
        },
        {
            "id": "INT-03",
            "name": "West Harbor Avenue",
            "lat": 40.7100,
            "lng": -74.0200,
            "density": "LOW",
            "congestion_index": 0.22,
            "status": "GREEN",
            "active_dir": "South",
            "queue": 6
        },
        {
            "id": "INT-04",
            "name": "North Uptown Crossing",
            "lat": 40.7280,
            "lng": -74.0040,
            "density": "HIGH",
            "congestion_index": 0.76,
            "status": "RED",
            "active_dir": "North",
            "queue": 24
        },
        {
            "id": "INT-05",
            "name": "South Business Park",
            "lat": 40.7020,
            "lng": -74.0080,
            "density": "MEDIUM",
            "congestion_index": 0.52,
            "status": "GREEN",
            "active_dir": "West",
            "queue": 15
        }
    ]

    return {
        "status": "SUCCESS",
        "timestamp": datetime.now().isoformat(),
        "kpis": {
            "total_vehicles_detected": state["total_vehicles"],
            "active_intersections": len(city_intersections),
            "average_traffic_density": density_label,
            "average_waiting_time_sec": state["avg_delay_sec"],
            "congestion_alerts": len([a for a in state["recent_alerts"] if a["type"] in ["warning", "danger"]]),
            "emergency_events": 1 if state["emergency_active"] else 0,
            "active_mode": state["active_mode"]
        },
        "intersection_state": state,
        "city_intersections": city_intersections,
        "category_distribution": [
            {"name": "Cars", "value": category_totals["cars"], "color": "#10b981"},
            {"name": "Buses", "value": category_totals["buses"], "color": "#f59e0b"},
            {"name": "Trucks", "value": category_totals["trucks"], "color": "#3b82f6"},
            {"name": "Motorcycles", "value": category_totals["motorcycles"], "color": "#8b5cf6"},
            {"name": "Bicycles", "value": category_totals["bicycles"], "color": "#06b6d4"}
        ],
        "alerts": state["recent_alerts"]
    }
