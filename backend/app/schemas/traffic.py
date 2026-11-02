from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime

class VehicleCounts(BaseModel):
    cars: int = 0
    buses: int = 0
    trucks: int = 0
    motorcycles: int = 0
    bicycles: int = 0
    total: int = 0

class DirectionTraffic(BaseModel):
    direction: str # North, South, East, West
    vehicle_count: int
    queue_length: int
    density_level: str # LOW, MEDIUM, HIGH, SEVERE
    congestion_index: float # 0.0 to 1.0
    waiting_time_sec: float
    signal_status: str # RED, YELLOW, GREEN
    remaining_timer_sec: int
    vehicle_breakdown: VehicleCounts

class IntersectionState(BaseModel):
    intersection_id: str
    name: str
    active_mode: str # TRADITIONAL, AI_ADAPTIVE, MANUAL_OVERRIDE, EMERGENCY_CORRIDOR
    active_direction: str
    remaining_timer: int
    pedestrian_wait_time: int
    total_vehicles: int
    avg_delay_sec: float
    directions: Dict[str, DirectionTraffic]
    ai_reasoning: Optional[str] = None
    emergency_active: bool = False
    emergency_type: Optional[str] = None
    emergency_direction: Optional[str] = None

class DetectionResult(BaseModel):
    total_vehicles: int
    category_counts: Dict[str, int]
    density_level: str # LOW, MEDIUM, HIGH, SEVERE
    congestion_index: float
    mean_confidence: float
    detections: List[Dict[str, Any]]
    annotated_image: Optional[str] = None # Base64 encoded string

class PredictionItem(BaseModel):
    horizon_minutes: int
    predicted_count: int
    congestion_level: str
    expected_queue: int
    expected_wait_sec: float
    confidence_interval: List[int]

class PredictionResponse(BaseModel):
    intersection_id: str
    timestamp: str
    peak_traffic_period: str
    current_trend: str
    forecast: List[PredictionItem]
    hourly_projection: List[Dict[str, Any]]

class EmergencyTriggerRequest(BaseModel):
    vehicle_type: str # Ambulance, Fire Truck, Police Vehicle
    intersection_id: str = "INT-01"
    direction: str # North, South, East, West
    priority_level: int = 1

class RouteRequest(BaseModel):
    origin: str
    destination: str
    avoid_congested: bool = True

class RouteSegment(BaseModel):
    from_node: str
    to_node: str
    road_name: str
    distance_km: float
    speed_limit_kmh: float
    congestion_level: str
    travel_time_min: float
    coordinates: List[List[float]]

class RouteOption(BaseModel):
    route_id: str
    name: str
    is_recommended: bool
    total_distance_km: float
    total_time_min: float
    avg_congestion: str
    co2_emissions_kg: float
    segments: List[RouteSegment]
    path_nodes: List[str]

class RouteResponse(BaseModel):
    origin: str
    destination: str
    recommended_route: RouteOption
    alternative_routes: List[RouteOption]

class ComparisonMetrics(BaseModel):
    metric: str
    traditional: Any
    ai_controlled: Any
    unit: str
    improvement_percent: float
    trend: str # 'positive', 'negative'
