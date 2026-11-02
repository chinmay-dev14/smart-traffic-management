from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.route_optimizer import RouteOptimizer
from app.simulation.engine import simulation_engine

router = APIRouter(prefix="/api/routes", tags=["Intelligent Route Recommendations"])
optimizer = RouteOptimizer()

class RouteCalculateRequest(BaseModel):
    origin: str
    destination: str
    avoid_congested: bool = True

@router.get("/network")
def get_road_network():
    # Update live congestion from simulation engine
    sim_state = simulation_engine.get_state()
    avg_ci = sum(d["congestion_index"] for d in sim_state["directions"].values()) / 4.0
    
    congestion_map = {
        "INT-01": avg_ci,
        "INT-02": 0.45,
        "INT-03": 0.20,
        "INT-04": 0.75,
        "INT-05": 0.50,
        "INT-06": 0.35,
        "INT-07": 0.60,
        "INT-08": 0.30,
        "INT-09": 0.25
    }
    optimizer.update_live_congestion(congestion_map)

    nodes = []
    for node_id, data in optimizer.node_positions.items():
        nodes.append({
            "id": node_id,
            "name": data["name"],
            "lat": data["lat"],
            "lng": data["lng"],
            "congestion": congestion_map.get(node_id, 0.2)
        })

    edges = []
    for u, v, data in optimizer.graph.edges(data=True):
        edges.append({
            "from": u,
            "to": v,
            "road_name": data["road_name"],
            "distance_km": data["distance_km"],
            "speed_kmh": data["speed_kmh"],
            "congestion": data.get("congestion_factor", 0.2),
            "travel_time_min": round(data.get("travel_time_min", 2.0), 1)
        })

    return {
        "status": "SUCCESS",
        "nodes": nodes,
        "edges": edges
    }

@router.post("/calculate")
def calculate_optimal_route(req: RouteCalculateRequest):
    # Feed current congestion
    sim_state = simulation_engine.get_state()
    avg_ci = sum(d["congestion_index"] for d in sim_state["directions"].values()) / 4.0
    congestion_map = {
        "INT-01": avg_ci,
        "INT-02": 0.45,
        "INT-03": 0.20,
        "INT-04": 0.75,
        "INT-05": 0.50,
        "INT-06": 0.35,
        "INT-07": 0.60,
        "INT-08": 0.30,
        "INT-09": 0.25
    }
    optimizer.update_live_congestion(congestion_map)

    try:
        result = optimizer.calculate_routes(req.origin, req.destination, req.avoid_congested)
        return {
            "status": "SUCCESS",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
