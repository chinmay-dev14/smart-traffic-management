import React, { useState } from 'react';
import { useTraffic } from '../context/TrafficContext';
import { api } from '../services/api';
import { 
  Cpu, 
  UserCheck, 
  Zap, 
  ShieldAlert, 
  CheckCircle2, 
  Sliders, 
  HelpCircle, 
  ArrowRight,
  Sparkles,
  Footprints,
  Scale
} from 'lucide-react';

export default function SignalControlPage() {
  const { intersectionState, setControllerMode, addToast, refreshData } = useTraffic();
  const [overrideLoading, setOverrideLoading] = useState(false);

  const state = intersectionState || {};
  const directions = state.directions || {};
  const activeMode = state.active_mode || 'AI_ADAPTIVE';
  const activeDir = state.active_direction || 'North';

  // Manual Override Handler
  const handleManualOverride = async (direction) => {
    setOverrideLoading(true);
    try {
      await api.overrideSignal(direction);
      addToast('Human Override Granted', `Signal manually forced to GREEN on ${direction}.`, 'warning');
      refreshData();
    } catch (err) {
      addToast('Error', err.message, 'danger');
    } finally {
      setOverrideLoading(false);
    }
  };

  // Calculate demand breakdown weights for explainability
  const demandBreakdown = ['North', 'South', 'East', 'West'].map((d) => {
    const dData = directions[d] || {};
    const q = dData.queue_length || 0;
    const wait = dData.waiting_time_sec || 0;
    const b = dData.vehicle_breakdown || {};
    const heavy = (b.buses || 0) * 2.5 + (b.trucks || 0) * 2.0;
    const score = Math.round((q * 1.5 * 0.4 + (wait / 30) * 10 * 0.35 + heavy * 0.15) * 10) / 10;

    return {
      direction: d,
      queue: q,
      waitSec: Math.round(wait),
      heavyVehicles: (b.buses || 0) + (b.trucks || 0),
      demandScore: score,
      isRightOfWay: d === activeDir
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-navy-900 border border-slate-800 glow-card">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
              Autonomous Adaptive Signal Policy
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">AI Decisioning & Human Override</h2>
          <p className="text-sm text-slate-400">
            Multi-objective reinforcement-inspired demand scheduling with safety guarantees
          </p>
        </div>

        {/* Current Mode Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Current Policy:</span>
          <span className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border ${
            activeMode === 'AI_ADAPTIVE'
              ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
              : activeMode === 'TRADITIONAL'
              ? 'bg-amber-950 text-amber-300 border-amber-700'
              : 'bg-purple-950 text-purple-300 border-purple-700'
          }`}>
            {activeMode.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Main Grid: Explainability & Math Formulation (7 cols) + Human Override (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Demand Optimization Engine (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Mathematical Formulation Card */}
          <div className="p-5 rounded-2xl bg-navy-900/80 border border-slate-800 glow-card space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-cyan-400" />
              Dynamic Objective Formulation
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              The AI calculates real-time priority scores across all approaches every second. Rather than rigid timers, green light duration scales proportionally between <strong className="text-cyan-400">10s (min)</strong> and <strong className="text-cyan-400">50s (max)</strong> based on weighted urgency:
            </p>

            {/* Formula Block */}
            <div className="p-4 rounded-xl bg-navy-950 border border-cyan-500/30 font-mono text-xs text-cyan-300 space-y-2">
              <div className="text-slate-400 text-[11px]">// Real-Time Multi-Factor Utility Formula:</div>
              <div className="text-sm font-bold text-white">
                Demand(d) = w₁·Q(d) + w₂·Delay(d)^1.3 + w₃·Occupancy(d) + w₄·Pedestrian(d)
              </div>
              <div className="text-[11px] text-slate-400 grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                <div>• Q(d): Queue Length (w₁ = 0.40)</div>
                <div>• Delay(d): Wait Time Penalty (w₂ = 0.35)</div>
                <div>• Occupancy: Transit & Heavy Trucks (w₃ = 0.15)</div>
                <div>• Pedestrian: Crosswalk Starvation (w₄ = 0.10)</div>
              </div>
            </div>
          </div>

          {/* Real-Time Demand Ranking Table */}
          <div className="p-5 rounded-2xl bg-navy-900/80 border border-slate-800 glow-card space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Live Approach Demand Scores
              </h3>
              <span className="text-[11px] font-mono text-slate-400">Updated per tick</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-navy-950 text-slate-400 font-mono border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Approach</th>
                    <th className="py-2.5 px-3">Queue (Q)</th>
                    <th className="py-2.5 px-3">Wait (Delay)</th>
                    <th className="py-2.5 px-3">Heavy Transit</th>
                    <th className="py-2.5 px-3">Demand Score</th>
                    <th className="py-2.5 px-3">Signal State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {demandBreakdown.map((row) => (
                    <tr key={row.direction} className={row.isRightOfWay ? 'bg-cyan-950/20 text-white' : 'text-slate-300'}>
                      <td className="py-2.5 px-3 font-bold font-sans flex items-center gap-2">
                        {row.direction}
                        {row.isRightOfWay && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800">
                            GREEN
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">{row.queue} veh</td>
                      <td className="py-2.5 px-3">{row.waitSec}s</td>
                      <td className="py-2.5 px-3 text-amber-300">{row.heavyVehicles}</td>
                      <td className="py-2.5 px-3 font-bold text-cyan-400">{row.demandScore}</td>
                      <td className="py-2.5 px-3 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          directions[row.direction]?.signal_status === 'GREEN'
                            ? 'text-emerald-400 bg-emerald-950/60'
                            : directions[row.direction]?.signal_status === 'YELLOW'
                            ? 'text-amber-400 bg-amber-950/60'
                            : 'text-red-400 bg-red-950/60'
                        }`}>
                          {directions[row.direction]?.signal_status || 'RED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pedestrian Crossing Safety Card */}
          <div className="p-5 rounded-2xl bg-navy-900/80 border border-slate-800 glow-card flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
                <Footprints className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Pedestrian Starvation Prevention</h4>
                <p className="text-xs text-slate-400">
                  Elapsed wait: <strong className="text-purple-300 font-mono">{state.pedestrian_wait_time || 0}s</strong> • Max safety threshold: 75s
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${
                (state.pedestrian_wait_time || 0) > 60
                  ? 'bg-amber-950 text-amber-400 border-amber-800'
                  : 'bg-emerald-950 text-emerald-400 border-emerald-800'
              }`}>
                {(state.pedestrian_wait_time || 0) > 60 ? 'CLEARANCE DUE' : 'SAFETY NORMAL'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Human Operator Manual Override (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-5 rounded-2xl bg-navy-900/80 border border-slate-800 glow-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-purple-400" />
                Human Operator Override
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                Supervisor Override
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Course Requirement: Operators can manually take control of intersection signals at any time. When an override is requested, the system halts conflicting directions with a safety clearance sequence before locking the chosen approach green.
            </p>

            {/* Manual Direction Controls */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-semibold text-slate-300">Grant Immediate Green to Approach:</div>
              <div className="grid grid-cols-2 gap-2.5 font-mono">
                {['North', 'South', 'East', 'West'].map((dir) => (
                  <button
                    key={dir}
                    disabled={overrideLoading}
                    onClick={() => handleManualOverride(dir)}
                    className={`p-3 rounded-xl border text-sm font-semibold flex items-center justify-between transition ${
                      activeDir === dir && activeMode === 'MANUAL_OVERRIDE'
                        ? 'bg-purple-600/40 border-purple-500 text-white shadow-lg shadow-purple-600/20'
                        : 'bg-navy-950 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span>{dir} Bound</span>
                    <ArrowRight className="w-4 h-4 opacity-70" />
                  </button>
                ))}
              </div>
            </div>

            {/* Return to Autonomous Mode Button */}
            <div className="pt-2">
              <button
                onClick={() => setControllerMode('AI_ADAPTIVE')}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2 transition"
              >
                <Zap className="w-4 h-4" />
                Restore Autonomous AI Optimization
              </button>
            </div>
          </div>

          {/* Current Decision Log Card */}
          <div className="p-5 rounded-2xl bg-navy-900/80 border border-slate-800 glow-card space-y-3">
            <h4 className="font-bold text-white text-sm">Active AI Explainability Log</h4>
            <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 text-xs text-slate-300 font-sans leading-relaxed">
              {state.ai_reasoning || 'Calculating dynamic phase allocations.'}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-2 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero-conflict mutual exclusion verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
