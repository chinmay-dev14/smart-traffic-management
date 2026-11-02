export const BASE_URL = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:8000` : 'http://127.0.0.1:8000'
);

async function handleResponse(res) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'API request failed');
  }
  return res.json();
}

export const api = {
  // System
  getHealth: () => fetch(`${BASE_URL}/api/health`).then(handleResponse),

  // Dashboard
  getDashboard: () => fetch(`${BASE_URL}/api/dashboard`).then(handleResponse),

  // Traffic & Detection
  getCurrentTraffic: () => fetch(`${BASE_URL}/api/traffic/current`).then(handleResponse),
  getTrafficHistory: (limit = 30) => fetch(`${BASE_URL}/api/traffic/history?limit=${limit}`).then(handleResponse),
  getDetectorInfo: () => fetch(`${BASE_URL}/api/traffic/detector-info`).then(handleResponse),
  
  detectMedia: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE_URL}/api/traffic/detect`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },

  // Signals & Control
  getSignals: () => fetch(`${BASE_URL}/api/signals`).then(handleResponse),
  setSignalMode: (mode, direction = null) =>
    fetch(`${BASE_URL}/api/signals/mode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, direction }),
    }).then(handleResponse),
    
  overrideSignal: (direction) =>
    fetch(`${BASE_URL}/api/signals/override`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ direction, force_clearance: true }),
    }).then(handleResponse),

  // Predictions
  getPredictions: () => fetch(`${BASE_URL}/api/predictions`).then(handleResponse),

  // Emergency Management
  triggerEmergency: (vehicleType, direction) =>
    fetch(`${BASE_URL}/api/emergency/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehicle_type: vehicleType, direction }),
    }).then(handleResponse),
    
  getEmergencyStatus: () => fetch(`${BASE_URL}/api/emergency/status`).then(handleResponse),
  getEmergencyHistory: () => fetch(`${BASE_URL}/api/emergency/history`).then(handleResponse),

  // Route Optimization
  getRoadNetwork: () => fetch(`${BASE_URL}/api/routes/network`).then(handleResponse),
  calculateRoutes: (origin, destination, avoidCongested = true) =>
    fetch(`${BASE_URL}/api/routes/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin, destination, avoid_congested: avoidCongested }),
    }).then(handleResponse),

  // Performance Analytics
  getAnalyticsComparison: () => fetch(`${BASE_URL}/api/analytics/comparison`).then(handleResponse),
  getReportDownloadUrl: () => `${BASE_URL}/api/analytics/report/download`,

  // Simulation Controls
  startSimulation: () => fetch(`${BASE_URL}/api/simulation/start`, { method: 'POST' }).then(handleResponse),
  stopSimulation: () => fetch(`${BASE_URL}/api/simulation/stop`, { method: 'POST' }).then(handleResponse),
  resetSimulation: () => fetch(`${BASE_URL}/api/simulation/reset`, { method: 'POST' }).then(handleResponse),
  adjustTraffic: (delta) =>
    fetch(`${BASE_URL}/api/simulation/traffic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta }),
    }).then(handleResponse),
  adjustSpeed: (speed) =>
    fetch(`${BASE_URL}/api/simulation/speed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ speed }),
    }).then(handleResponse),
};
