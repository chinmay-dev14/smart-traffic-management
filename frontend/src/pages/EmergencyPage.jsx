import React, { useState, useEffect } from 'react';
import { useTraffic } from '../context/TrafficContext';
import { api } from '../services/api';
import { 
  Siren, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Shield, 
  ArrowRight,
  Sparkles,
  RotateCcw
} from 'lucide-react';

export default function EmergencyPage() {
  const { intersectionState, triggerEmergencyVehicle, addToast, refreshData } = useTraffic();
  const [vehicleType, setVehicleType] = useState('Ambulance');
  const [direction, setDirection] = useState('North');
  const [emergencyHistory, setEmergencyHistory] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchHistory = () => {
    api.getEmergencyHistory()
      .then((res) => setEmergencyHistory(res.history || []))
      .catch((err) => console.error('Emergency history fetch error:', err));
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const state = intersectionState || {};
  const isEmergencyActive = state.emergency_active;
  const emergencyInfo = state.emergency_info;

  const handleTrigger = async () => {
    setIsSubmitting(true);
    try {
      await triggerEmergencyVehicle(vehicleType, direction);
      fetchHistory();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-navy-900 border border-slate-800 glow-card">
        <div>
          <div className="flex items-center gap-2">
            <Siren className="w-4 h-4 text-red-400 animate-pulse" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-red-400">
              Critical Emergency Corridor Protocol
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Emergency Vehicle Prioritization</h2>
          <p className="text-sm text-slate-400">
            Autonomous green corridor dispatch with zero-conflict safe clearance guarantees
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 border ${
            isEmergencyActive
              ? 'bg-red-950 text-red-300 border-red-500 animate-pulse'
              : 'bg-navy-950 text-emerald-400 border-emerald-800'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isEmergencyActive ? 'bg-red-500' : 'bg-emerald-500'}`} />
            {isEmergencyActive ? 'CORRIDOR ENGAGED' : 'SYSTEM STANDBY'}
          </span>
        </div>
      </div>

      {/* Active Corridor HUD Banner */}
      {isEmergencyActive && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-red-950 via-navy-900 to-red-950 border-2 border-red-500 glow-red animate-pulse flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-600/30 border border-red-500 flex items-center justify-center text-2xl">
              {emergencyInfo?.vehicle_type === 'Ambulance' ? '🚑' : emergencyInfo?.vehicle_type === 'Fire Truck' ? '🚒' : '🚓'}
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider">
                Priority Preemption Engaged
              </div>
              <h3 className="text-lg font-bold text-white">
                {emergencyInfo?.vehicle_type} Approaching from {emergencyInfo?.direction} Bound
              </h3>
              <p className="text-xs text-red-200 mt-0.5">
                All intersecting signals held Red. Dedicated clearance corridor active.
              </p>
            </div>
          </div>

          <div className="text-right font-mono bg-red-900/60 p-3 rounded-xl border border-red-500/60">
            <div className="text-[11px] text-red-300">Phase Status</div>
            <div className="text-xl font-extrabold text-white">
              {state.current_signal_phase} ({state.remaining_timer}s)
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Trigger Dispatcher (5 cols) + Safety State Machine & History (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Dispatch Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-5 rounded-2xl bg-navy-900/80 border border-slate-800 glow-card space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              Simulate Approaching Emergency Vehicle
            </h3>

            {/* Vehicle Type Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">1. Emergency Unit Type</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Ambulance', icon: '🚑', desc: 'Medical Code 3' },
                  { id: 'Fire Truck', icon: '🚒', desc: 'Heavy Rescue' },
                  { id: 'Police Vehicle', icon: '🚓', desc: 'Urgent Transit' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setVehicleType(item.id)}
                    className={`p-3 rounded-xl border text-center transition ${
                      vehicleType === item.id
                        ? 'bg-red-600/30 border-red-500 text-white font-bold shadow-md shadow-red-600/20'
                        : 'bg-navy-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <div className="text-xs font-semibold">{item.id}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Direction Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">2. Arrival Direction</label>
              <div className="grid grid-cols-4 gap-2 font-mono text-xs">
                {['North', 'South', 'East', 'West'].map((dir) => (
                  <button
                    key={dir}
                    onClick={() => setDirection(dir)}
                    className={`p-2.5 rounded-xl border text-center font-bold transition ${
                      direction === dir
                        ? 'bg-cyan-600/30 border-cyan-500 text-cyan-200'
                        : 'bg-navy-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {dir}
                  </button>
                ))}
              </div>
            </div>

            {/* Trigger Button */}
            <div className="pt-2">
              <button
                onClick={handleTrigger}
                disabled={isSubmitting || isEmergencyActive}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-white shadow-xl flex items-center justify-center gap-2 transition ${
                  isEmergencyActive
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-red-600 hover:bg-red-500 shadow-red-600/30'
                }`}
              >
                <Siren className="w-4 h-4 animate-pulse" />
                {isEmergencyActive ? 'Corridor Already Active' : 'Dispatch Emergency Corridor Now'}
              </button>
            </div>
          </div>

          {/* Safety Constraints Explanatory Card */}
          <div className="p-5 rounded-2xl bg-navy-900/80 border border-slate-800 glow-card space-y-3">
            <h4 className="font-bold text-white text-xs uppercase font-mono tracking-wider text-cyan-400">
              Zero-Conflict Safety Protocol
            </h4>
            <div className="space-y-2 text-xs text-slate-300 font-mono">
              <div className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">1.</span>
                <span>Immediate 3s Yellow transition on active intersecting streets</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">2.</span>
                <span>2s All-Red total intersection clearance interval</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">3.</span>
                <span>Dedicated Green signal granted exclusively to emergency vehicle</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">4.</span>
                <span>Autonomous restoration of AI adaptive balancing post-clearance</span>
              </div>
            </div>
          </div>
        </div>

        {/* Historical Events & Response Times (7 cols) */}
        <div className="lg:col-span-7 bg-navy-900/80 border border-slate-800 rounded-2xl p-5 glow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                Emergency Response Log & Response Times
              </h3>
              <p className="text-xs text-slate-400">Audited emergency preemption telemetry</p>
            </div>

            <button
              onClick={fetchHistory}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              title="Refresh log"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* History Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-navy-950 text-slate-400 font-mono border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Vehicle</th>
                  <th className="py-2.5 px-3">Direction</th>
                  <th className="py-2.5 px-3">Response Time</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {emergencyHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-slate-400">
                      No recorded emergency events yet. Use the trigger above to test.
                    </td>
                  </tr>
                ) : (
                  emergencyHistory.map((item) => (
                    <tr key={item.id} className="text-slate-300 hover:bg-navy-950/40">
                      <td className="py-2.5 px-3 font-sans font-bold flex items-center gap-2">
                        {item.vehicle_type === 'Ambulance' ? '🚑' : item.vehicle_type === 'Fire Truck' ? '🚒' : '🚓'}
                        {item.vehicle_type}
                      </td>
                      <td className="py-2.5 px-3">{item.direction}</td>
                      <td className="py-2.5 px-3 text-emerald-400 font-bold">
                        {item.response_time_sec}s
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                          {item.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                        {item.timestamp?.split(' ')[1] || item.timestamp}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
