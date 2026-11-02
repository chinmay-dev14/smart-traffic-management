import networkx as nx
from typing import Dict, Any, List, Optional
import math

class RouteOptimizer:
    """
    Intelligent City Route Recommendation Service.
    Constructs a weighted urban road graph and computes the optimal route
    incorporating live traffic congestion weights, distance, and CO2 emissions.
    """
    def __init__(self):
        self.graph = nx.DiGraph()
        self.node_positions = {
            "INT-01": {"name": "Central Plaza (Main Demo)", "lat": 40.7128, "lng": -74.0060},
            "INT-02": {"name": "Tech District East", "lat": 40.7180, "lng": -73.9920},
            "INT-03": {"name": "West Harbor Avenue", "lat": 40.7100, "lng": -74.0200},
            "INT-04": {"name": "North Uptown Crossing", "lat": 40.7280, "lng": -74.0040},
            "INT-05": {"name": "South Business Park", "lat": 40.7020, "lng": -74.0080},
            "INT-06": {"name": "Medical Center", "lat": 40.7240, "lng": -73.9850},
            "INT-07": {"name": "University Campus", "lat": 40.7320, "lng": -73.9980},
            "INT-08": {"name": "Expressway Interchange", "lat": 40.7050, "lng": -73.9780},
            "INT-09": {"name": "Riverfront Boulevard", "lat": 40.6960, "lng": -74.0150}
        }
        self.base_edges = [
            # from, to, road_name, distance_km, base_speed_kmh
            ("INT-01", "INT-02", "Broadway Ave", 1.8, 45),
            ("INT-02", "INT-01", "Broadway Ave", 1.8, 45),
            ("INT-01", "INT-03", "Hudson Parkway", 1.5, 50),
            ("INT-03", "INT-01", "Hudson Parkway", 1.5, 50),
            ("INT-01", "INT-04", "5th Avenue North", 2.0, 40),
            ("INT-04", "INT-01", "5th Avenue South", 2.0, 40),
            ("INT-01", "INT-05", "Financial Way", 1.6, 35),
            ("INT-05", "INT-01", "Financial Way", 1.6, 35),
            ("INT-02", "INT-06", "Health Science Rd", 1.2, 40),
            ("INT-06", "INT-02", "Health Science Rd", 1.2, 40),
            ("INT-04", "INT-07", "University Boulevard", 1.4, 45),
            ("INT-07", "INT-04", "University Boulevard", 1.4, 45),
            ("INT-06", "INT-07", "North Ring Bypass", 2.1, 55),
            ("INT-07", "INT-06", "North Ring Bypass", 2.1, 55),
            ("INT-02", "INT-08", "East Expressway Spur", 2.4, 65),
            ("INT-08", "INT-02", "East Expressway Spur", 2.4, 65),
            ("INT-05", "INT-08", "Grand South Link", 3.0, 60),
            ("INT-08", "INT-05", "Grand South Link", 3.0, 60),
            ("INT-03", "INT-09", "Harbor Promenade", 1.9, 45),
            ("INT-09", "INT-03", "Harbor Promenade", 1.9, 45),
            ("INT-05", "INT-09", "Maritime Blvd", 1.7, 40),
            ("INT-09", "INT-05", "Maritime Blvd", 1.7, 40),
            ("INT-04", "INT-02", "Midtown Diagonal", 2.3, 35),
            ("INT-02", "INT-04", "Midtown Diagonal", 2.3, 35),
            ("INT-03", "INT-04", "West Uptown Connector", 2.7, 40),
            ("INT-04", "INT-03", "West Uptown Connector", 2.7, 40)
        ]
        self._build_graph()

    def _build_graph(self):
        for node_id, data in self.node_positions.items():
            self.graph.add_node(node_id, **data)
            
        for u, v, road_name, dist, speed in self.base_edges:
            self.graph.add_edge(u, v,
                                road_name=road_name,
                                distance_km=dist,
                                speed_kmh=speed,
                                congestion_factor=0.2, # default low
                                weight=dist / speed * 60) # minutes

    def update_live_congestion(self, congestion_map: Dict[str, float]):
        """
        Updates edge weights dynamically according to live intersection densities.
        congestion_factor is 0.0 (empty) to 1.0 (jammed).
        """
        for u, v, data in self.graph.edges(data=True):
            # Edge congestion is influenced by end-node bottleneck
            u_cong = congestion_map.get(u, 0.2)
            v_cong = congestion_map.get(v, 0.2)
            edge_cong = (u_cong + v_cong) / 2.0
            
            data["congestion_factor"] = edge_cong
            
            # Non-linear delay penalty: Bureau of Public Roads (BPR) function
            # travel_time = free_flow_time * (1 + 0.15 * (V/C)^4)
            free_flow_time = (data["distance_km"] / data["speed_kmh"]) * 60.0 # in minutes
            delay_multiplier = 1.0 + (3.2 * (edge_cong ** 3))
            
            data["travel_time_min"] = free_flow_time * delay_multiplier
            data["weight"] = data["travel_time_min"]

    def _get_congestion_label(self, factor: float) -> str:
        if factor < 0.35:
            return "LOW"
        elif factor < 0.65:
            return "MEDIUM"
        elif factor < 0.85:
            return "HIGH"
        else:
            return "SEVERE"

    def calculate_routes(self, 
                         origin: str, 
                         destination: str, 
                         avoid_congested: bool = True) -> Dict[str, Any]:
        """
        Computes the recommended fastest route and up to two viable alternative routes.
        Returns detailed route segments, coordinates, metrics, and navigation instructions.
        """
        if origin not in self.graph or destination not in self.graph:
            raise ValueError(f"Origin '{origin}' or destination '{destination}' does not exist.")
            
        if origin == destination:
            raise ValueError("Origin and destination must be distinct intersections.")

        # Find shortest paths using Dijkstra's with congestion weight
        weight_key = "weight" if avoid_congested else "distance_km"
        
        try:
            # Get up to 3 simple paths
            paths = list(nx.shortest_simple_paths(self.graph, origin, destination, weight=weight_key))
            candidate_paths = paths[:3]
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            candidate_paths = []

        if not candidate_paths:
            return {"origin": origin, "destination": destination, "recommended_route": None, "alternative_routes": []}

        route_options = []
        for idx, path in enumerate(candidate_paths):
            total_dist = 0.0
            total_time = 0.0
            segments = []
            cong_sum = 0.0
            
            for i in range(len(path) - 1):
                u = path[i]
                v = path[i + 1]
                edge_data = self.graph[u][v]
                
                dist = edge_data["distance_km"]
                t_min = edge_data.get("travel_time_min", (dist / edge_data["speed_kmh"]) * 60)
                cong = edge_data.get("congestion_factor", 0.2)
                
                total_dist += dist
                total_time += t_min
                cong_sum += cong
                
                u_pos = self.node_positions[u]
                v_pos = self.node_positions[v]
                
                segments.append({
                    "from_node": u,
                    "to_node": v,
                    "road_name": edge_data["road_name"],
                    "distance_km": round(dist, 2),
                    "speed_limit_kmh": edge_data["speed_kmh"],
                    "congestion_level": self._get_congestion_label(cong),
                    "travel_time_min": round(t_min, 1),
                    "coordinates": [[u_pos["lat"], u_pos["lng"]], [v_pos["lat"], v_pos["lng"]]]
                })

            avg_cong_val = cong_sum / max(1, len(path) - 1)
            # CO2 emission estimate: ~130g CO2/km base, increases with stop-and-go congestion
            co2_kg = round(total_dist * 0.130 * (1.0 + avg_cong_val * 0.8), 2)
            
            route_options.append({
                "route_id": f"RT-{idx + 1}",
                "name": f"Route Option {chr(65 + idx)}: {'via Bypass' if idx == 1 else 'via Express' if idx == 2 else 'Optimal AI Corridor'}",
                "is_recommended": (idx == 0),
                "total_distance_km": round(total_dist, 2),
                "total_time_min": round(total_time, 1),
                "avg_congestion": self._get_congestion_label(avg_cong_val),
                "co2_emissions_kg": co2_kg,
                "segments": segments,
                "path_nodes": path
            })

        return {
            "origin": origin,
            "destination": destination,
            "recommended_route": route_options[0],
            "alternative_routes": route_options[1:],
            "all_intersections": self.node_positions
        }
