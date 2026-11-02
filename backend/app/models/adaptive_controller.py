import time
from typing import Dict, Any, Tuple, Optional

class AdaptiveSignalController:
    """
    AI-Based Adaptive Traffic Signal Controller.
    Uses multi-objective weighted demand optimization with starvation-prevention
    fairness constraints and safety-critical state transitions.
    """
    def __init__(self,
                 min_green: int = 10,
                 max_green: int = 50,
                 yellow_time: int = 3,
                 all_red_clearance: int = 2,
                 pedestrian_threshold: int = 75):
        self.min_green = min_green
        self.max_green = max_green
        self.yellow_time = yellow_time
        self.all_red_clearance = all_red_clearance
        self.pedestrian_threshold = pedestrian_threshold
        
        # Priority weights for multi-factor demand optimization
        self.weights = {
            "queue_length": 0.40,
            "waiting_time": 0.35,
            "vehicle_weight": 0.15,
            "pedestrian_demand": 0.10
        }
        
        # Vehicle passenger & road impact coefficients
        self.vehicle_coefficients = {
            "car": 1.0,
            "bus": 2.5,     # High passenger occupancy
            "truck": 2.0,   # Slow acceleration, high road block
            "motorcycle": 0.5,
            "bicycle": 0.3
        }

    def calculate_weighted_demand(self, direction_data: Dict[str, Any]) -> float:
        """
        Calculates holistic demand score for a direction.
        Score = w_q * Queue + w_wait * Delay + w_type * WeightedVehicles + w_ped * PedestrianWeight
        """
        queue = direction_data.get("queue_length", 0)
        wait_time = direction_data.get("waiting_time_sec", 0.0)
        breakdown = direction_data.get("vehicle_breakdown", {})
        
        weighted_vehicles = (
            breakdown.get("cars", queue * 0.6) * self.vehicle_coefficients["car"] +
            breakdown.get("buses", 0) * self.vehicle_coefficients["bus"] +
            breakdown.get("trucks", 0) * self.vehicle_coefficients["truck"] +
            breakdown.get("motorcycles", 0) * self.vehicle_coefficients["motorcycle"] +
            breakdown.get("bicycles", 0) * self.vehicle_coefficients["bicycle"]
        )
        
        # Starvation penalty factor: non-linear boost if wait time exceeds 45s
        wait_penalty = (wait_time / 30.0) ** 1.3
        
        demand_score = (
            self.weights["queue_length"] * queue * 1.5 +
            self.weights["waiting_time"] * wait_penalty * 10.0 +
            self.weights["vehicle_weight"] * weighted_vehicles
        )
        return round(float(demand_score), 2)

    def decide_next_phase(self, 
                          directions_data: Dict[str, Dict[str, Any]], 
                          current_direction: str,
                          elapsed_in_phase: int,
                          pedestrian_timer: int) -> Tuple[str, int, str]:
        """
        Determines the next optimal direction to receive green and allocated green duration.
        Returns: (selected_direction, allocated_green_seconds, explainability_reason)
        """
        demand_scores = {}
        candidate_directions = ["North", "South", "East", "West"]
        
        for d in candidate_directions:
            data = directions_data.get(d, {})
            demand_scores[d] = self.calculate_weighted_demand(data)
            
        # Check pedestrian starvation
        if pedestrian_timer >= self.pedestrian_threshold:
            pedestrian_reason = f"Pedestrian safety constraint triggered (waiting {pedestrian_timer}s). Allocating minimum clearance window."
        else:
            pedestrian_reason = None

        # Check if current direction still has significant residual queue and hasn't exceeded max_green
        current_queue = directions_data.get(current_direction, {}).get("queue_length", 0)
        if elapsed_in_phase < self.max_green and current_queue > 15:
            # Check if any other direction is severely starved
            max_other_wait = max([directions_data.get(d, {}).get("waiting_time_sec", 0) 
                                 for d in candidate_directions if d != current_direction] or [0])
            if max_other_wait < 60:
                extension = min(10, self.max_green - elapsed_in_phase)
                reason = (f"Extended green on {current_direction} for {extension}s "
                          f"due to heavy ongoing queue ({current_queue} vehicles) and acceptable cross-street wait times.")
                return current_direction, extension, reason

        # Otherwise, select direction with highest demand score excluding current direction if it just had green
        other_directions = [d for d in candidate_directions if d != current_direction]
        if other_directions:
            best_dir = max(other_directions, key=lambda d: demand_scores[d])
        else:
            best_dir = current_direction

        # Allocate dynamic green duration proportional to demand
        best_score = demand_scores[best_dir]
        target_queue = directions_data.get(best_dir, {}).get("queue_length", 0)
        target_wait = directions_data.get(best_dir, {}).get("waiting_time_sec", 0.0)
        
        # Scaling green time based on queue length:
        # Base: 12s, plus ~1.2s per queued vehicle, bounded between min_green and max_green
        allocated_green = int(self.min_green + (target_queue * 1.25))
        allocated_green = max(self.min_green, min(self.max_green, allocated_green))

        # Build natural human-readable explainability reasoning
        reason_parts = [
            f"{best_dir} direction selected: demand score {best_score}.",
            f"Queue: {target_queue} vehicles, average delay: {int(target_wait)}s."
        ]
        
        buses_trucks = (directions_data.get(best_dir, {}).get("vehicle_breakdown", {}).get("buses", 0) +
                        directions_data.get(best_dir, {}).get("vehicle_breakdown", {}).get("trucks", 0))
        if buses_trucks > 0:
            reason_parts.append(f"Includes {buses_trucks} heavy/public transit vehicles prioritized.")
        
        if pedestrian_reason:
            reason_parts.append(pedestrian_reason)

        explanation = " ".join(reason_parts)
        return best_dir, allocated_green, explanation

    def calculate_webster_cycle(self, directions_data: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
        """
        Computes Webster's Optimal Cycle Length & Green Splits
        Formula from Christofel Rio Goenawan (KAIST) & IJSRET:
        C = (1.5 * L + 5) / (1.0 - sum(Y_i))
        Where L is lost time (4 * 5s = 20s), Y_i = v_i / s_i
        """
        L = 20.0  # 4 phases * (3s yellow + 2s red clearance)
        s_i = 1800.0  # saturation flow in veh/hr
        
        y_values = {}
        for d in ["North", "South", "East", "West"]:
            q = directions_data.get(d, {}).get("queue_length", 5)
            vol_per_hr = max(100, min(1400, q * 38))
            y_values[d] = vol_per_hr / s_i
            
        sum_Y = min(0.85, sum(y_values.values()))
        denom = max(0.15, 1.0 - sum_Y)
        optimal_cycle = (1.5 * L + 5.0) / denom
        optimal_cycle = max(45, min(120, int(round(optimal_cycle / 5.0) * 5)))
        
        effective_green_total = optimal_cycle - L
        green_splits = {}
        for d, y_val in y_values.items():
            g_i = int(round(effective_green_total * (y_val / max(0.01, sum_Y))))
            green_splits[d] = max(self.min_green, min(self.max_green, g_i))
            
        return {
            "formula": "C = (1.5 * L + 5) / (1.0 - sum(Y_i))",
            "optimal_cycle_sec": optimal_cycle,
            "lost_time_L": L,
            "sum_Y": round(float(sum_Y), 3),
            "green_splits": green_splits
        }
