import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api } from '../services/api';

const TrafficContext = createContext(null);

export function TrafficProvider({ children }) {
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [intersectionState, setIntersectionState] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [isSimulationRunning, setIsSimulationRunning] = useState(true);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const addToast = (title, message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [{ id, title, message, type }, ...prev].slice(0, 5));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // Fetch initial dashboard and state data
  const refreshData = async () => {
    try {
      const data = await api.getDashboard();
      setDashboardData(data);
      if (data.intersection_state) {
        setIntersectionState(data.intersection_state);
        setIsSimulationRunning(data.intersection_state.running);
      }
    } catch (err) {
      console.warn('Dashboard fetch fallback error:', err);
    }
  };

  // WebSocket Connection
  useEffect(() => {
    let isMounted = true;

    const connectWebSocket = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = window.location.hostname || '127.0.0.1';
      const wsUrl = `${protocol}//${wsHost}:8000/ws`;

      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!isMounted) return;
          setConnectionStatus('connected');
        };

        ws.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'SIMULATION_UPDATE' || msg.type === 'INITIAL_STATE') {
              setIntersectionState(msg.data);
              setIsSimulationRunning(msg.data.running);
            }
          } catch (e) {
            console.error('Error parsing WS message:', e);
          }
        };

        ws.onclose = () => {
          if (!isMounted) return;
          setConnectionStatus('disconnected');
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
        };

        ws.onerror = () => {
          if (!isMounted) return;
          setConnectionStatus('disconnected');
          ws.close();
        };
      } catch (err) {
        setConnectionStatus('disconnected');
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
      }
    };

    refreshData();
    connectWebSocket();

    // Polling safety fallback if WS is disconnected
    const pollInterval = setInterval(() => {
      if (connectionStatus !== 'connected') {
        refreshData();
      }
    }, 2000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // Quick Simulation Actions
  const togglePlayPause = async () => {
    try {
      if (isSimulationRunning) {
        await api.stopSimulation();
        setIsSimulationRunning(false);
        addToast('Simulation Paused', 'Vehicle movement and timers halted.', 'warning');
      } else {
        await api.startSimulation();
        setIsSimulationRunning(true);
        addToast('Simulation Resumed', 'Autonomous traffic cycles active.', 'info');
      }
      refreshData();
    } catch (err) {
      addToast('Error', err.message, 'danger');
    }
  };

  const resetSimulation = async () => {
    try {
      await api.resetSimulation();
      addToast('System Reset', 'All queues, timers, and signals reset.', 'info');
      refreshData();
    } catch (err) {
      addToast('Error', err.message, 'danger');
    }
  };

  const changeSpeedMultiplier = async (speed) => {
    try {
      await api.adjustSpeed(speed);
      addToast('Simulation Speed', `Simulation rate set to ${speed}x speed.`, 'info');
      refreshData();
    } catch (err) {
      addToast('Error', err.message, 'danger');
    }
  };

  const adjustTrafficDensity = async (delta) => {
    try {
      const res = await api.adjustTraffic(delta);
      addToast('Traffic Inflow Updated', res.message, 'info');
      refreshData();
    } catch (err) {
      addToast('Error', err.message, 'danger');
    }
  };

  const setControllerMode = async (mode, direction = null) => {
    try {
      const res = await api.setSignalMode(mode, direction);
      addToast('Mode Changed', res.message, 'info');
      refreshData();
    } catch (err) {
      addToast('Error', err.message, 'danger');
    }
  };

  const triggerEmergencyVehicle = async (vehicleType, direction) => {
    try {
      const res = await api.triggerEmergency(vehicleType, direction);
      addToast(
        `🚨 EMERGENCY: ${vehicleType.toUpperCase()}`,
        `Green corridor assigned for ${direction}.`,
        'danger'
      );
      refreshData();
      return res;
    } catch (err) {
      addToast('Error', err.message, 'danger');
      throw err;
    }
  };

  return (
    <TrafficContext.Provider
      value={{
        connectionStatus,
        intersectionState,
        dashboardData,
        isSimulationRunning,
        toasts,
        addToast,
        refreshData,
        togglePlayPause,
        resetSimulation,
        adjustTrafficDensity,
        setControllerMode,
        triggerEmergencyVehicle,
        changeSpeedMultiplier,
      }}
    >
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-lg border shadow-xl text-sm flex items-start gap-3 transition-all duration-300 animate-slideIn ${
              toast.type === 'danger'
                ? 'bg-red-950/90 border-red-500/50 text-red-200'
                : toast.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500/50 text-amber-200'
                : 'bg-navy-900/95 border-cyan-500/40 text-cyan-200'
            }`}
          >
            <div className="mt-0.5">
              {toast.type === 'danger' ? '🚨' : toast.type === 'warning' ? '⚠️' : 'ℹ️'}
            </div>
            <div>
              <div className="font-semibold text-white">{toast.title}</div>
              <div className="text-xs opacity-90 mt-0.5">{toast.message}</div>
            </div>
          </div>
        ))}
      </div>
    </TrafficContext.Provider>
  );
}

export const useTraffic = () => {
  const context = useContext(TrafficContext);
  if (!context) throw new Error('useTraffic must be used within TrafficProvider');
  return context;
};
