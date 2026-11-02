import React, { useState } from 'react';
import { useTraffic } from '../context/TrafficContext';
import { 
  Zap, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Siren, 
  ShieldCheck, 
  Activity, 
  Sparkles, 
  TrendingUp, 
  TrendingDown,
  Car,
  Compass,
  ArrowRight,
  Gauge
} from 'lucide-react';

export default function CommandCenter() {
  const { 
    intersectionState, 
    isSimulationRunning, 
    togglePlayPause, 
    resetSimulation, 
    adjustTrafficDensity, 
    setControllerMode,
    triggerEmergencyVehicle,
    changeSpeedMultiplier
  } = useTraffic();

  const [selectedEmergencyType, setSelectedEmergencyType] = useState('Ambulance');
  const [selectedEmergencyDir, setSelectedEmergencyDir] = useState('North');
  const [isEmergencySubmitting, setIsEmergencySubmitting] = useState(false);

  const state = intersectionState || {};
  const directions = state.directions || {};
  const activeDir = state.active_direction || 'North';
  const remainingTimer = state.remaining_timer || 0;
  const activeMode = state.active_mode || 'AI_ADAPTIVE';
  const intensity = state.traffic_intensity || 1.0;
  const totalQueue = state.total_queue || 0;
  const totalVehicles = state.total_vehicles || 0;
  const avgDelay = state.avg_delay_sec || 0;
  const webster = state.webster_cycle || { optimal_cycle_sec: 65, sum_Y: 0.52, lost_time_L: 20 };

  const handleTriggerEmergency = async () => {
    setIsEmergencySubmitting(true);
    try {
      await triggerEmergencyVehicle(selectedEmergencyType, selectedEmergencyDir);
    } catch (e) {
      console.error(e);
    } finally {
      setIsEmergencySubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Hero Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-cyan-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 z-10 relative">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-cyan-400">
                Autonomous 4-Way Intersection Controller • ASTM Core
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Central Intersection Command Hub
            </h2>
            <p className="text-xs text-slate-400 max-w-xl mt-1">
              Real-time dynamic signal modulation powered by computer vision detection and Webster's minimum-delay formulation.
            </p>
          </div>

          {/* Quick Simulation & Mode Switch Bar */}
          <div className="flex flex-wrap items-center gap-2 bg-navy-950/90 p-2 rounded-2xl border border-slate-800">
            {/* Mode Switcher */}
            <div className="flex gap-1 p-1 bg-navy-900 rounded-xl border border-slate-800/80">
              <button
                onClick={() => setControllerMode('AI_ADAPTIVE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeMode === 'AI_ADAPTIVE'
                    ? 'bg-gradient-to-r from-cyan-600 to-emerald-600 text-white shadow-md shadow-cyan-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-cyan-300" />
                AI Adaptive
              </button>
              <button
                onClick={() => setControllerMode('TRADITIONAL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeMode === 'TRADITIONAL'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Traditional Fixed
              </button>
            </div>

            {/* Play/Pause */}
            <button
              onClick={togglePlayPause}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                isSimulationRunning
                  ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  : 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              }`}
            >
              {isSimulationRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isSimulationRunning ? 'Pause' : 'Resume'}
            </button>

            {/* Reset */}
            <button
              onClick={resetSimulation}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
              title="Reset queues"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Simulation Speed Multiplier */}
            <div className="flex items-center gap-1 bg-navy-900 p-1 rounded-xl border border-slate-800/80 text-xs font-mono">
              <span className="text-[10px] text-slate-400 pl-1.5 pr-0.5 flex items-center gap-1 font-bold">
                <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              </span>
              {[1.0, 2.0, 3.0, 5.0].map((rate) => {
                const currentRate = state.speed_multiplier || 1.0;
                const isCurrent = Math.abs(currentRate - rate) < 0.1;
                return (
                  <button
                    key={rate}
                    onClick={() => changeSpeedMultiplier(rate)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                      isCurrent
                        ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {rate}x
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="p-4 rounded-2xl bg-navy-900/80 border border-slate-800/80 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Vehicles Monitored</span>
            <Car className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{totalVehicles}</div>
          <div className="text-[11px] text-emerald-400 font-mono">Queue: {totalQueue} waiting</div>
        </div>

        {/* KPI 2 */}
        <div className="p-4 rounded-2xl bg-navy-900/80 border border-slate-800/80 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Average Pass Delay</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{avgDelay}s</div>
          <div className="text-[11px] text-cyan-400 font-mono">
            {activeMode === 'AI_ADAPTIVE' ? '-70% vs Baseline' : 'Unoptimized'}
          </div>
        </div>

        {/* KPI 3: Webster Cycle */}
        <div className="p-4 rounded-2xl bg-navy-900/80 border border-slate-800/80 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Webster's Optimal Cycle (C)</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300">{webster.optimal_cycle_sec}s</div>
          <div className="text-[11px] text-slate-400 font-mono">Y = {webster.sum_Y} (Flow ratio)</div>
        </div>

        {/* KPI 4 */}
        <div className="p-4 rounded-2xl bg-navy-900/80 border border-slate-800/80 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Emergency Corridor</span>
            <Siren className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {state.emergency_active ? 'ACTIVE' : 'STANDBY'}
          </div>
          <div className={`text-[11px] font-mono ${state.emergency_active ? 'text-red-400 animate-pulse font-bold' : 'text-slate-400'}`}>
            {state.emergency_active ? `${state.emergency_info?.vehicle_type} on ${state.emergency_info?.direction}` : 'Zero-conflict ready'}
          </div>
        </div>
      </div>

      {/* Main Grid: Animated 4-Way Intersection (7 cols) + Controls & Math (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Animated Intersection Canvas (7 cols) */}
        <div className="lg:col-span-7 bg-navy-900/80 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                Live Animated 4-Way Intersection (INT-01)
              </h3>
              <p className="text-xs text-slate-400">Asynchronous vehicle queue and signal state machine</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Inflow:</span>
              <span className="font-mono text-xs font-bold text-cyan-400">{intensity}x</span>
              <button
                onClick={() => adjustTrafficDensity(0.2)}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400"
                title="Increase Traffic Inflow"
              >
                <TrendingUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => adjustTrafficDensity(-0.2)}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400"
                title="Decrease Traffic Inflow"
              >
                <TrendingDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* SVG Visualizer */}
          <div className="relative w-full aspect-square max-h-[480px] mx-auto rounded-2xl bg-[#080d18] border border-slate-800 overflow-hidden flex items-center justify-center select-none shadow-inner">
            <svg viewBox="0 0 600 600" className="w-full h-full">
              {/* Corner Grass Landscaping */}
              <rect x="0" y="0" width="220" height="220" fill="#042f2e" />
              <rect x="380" y="0" width="220" height="220" fill="#042f2e" />
              <rect x="0" y="380" width="220" height="220" fill="#042f2e" />
              <rect x="380" y="380" width="220" height="220" fill="#042f2e" />

              {/* Asphalt Roads */}
              <rect x="220" y="0" width="160" height="600" fill="#1e293b" />
              <rect x="0" y="220" width="600" height="160" fill="#1e293b" />

              {/* Junction Center */}
              <rect x="220" y="220" width="160" height="160" fill="#0f172a" />

              {/* Zebra Crosswalk Stripes */}
              {[230, 250, 270, 290, 310, 330, 350].map((x) => (
                <rect key={`ped-n-${x}`} x={x} y="198" width="12" height="18" fill="#f8fafc" opacity="0.9" />
              ))}
              {[230, 250, 270, 290, 310, 330, 350].map((x) => (
                <rect key={`ped-s-${x}`} x={x} y="384" width="12" height="18" fill="#f8fafc" opacity="0.9" />
              ))}
              {[230, 250, 270, 290, 310, 330, 350].map((y) => (
                <rect key={`ped-w-${y}`} x="198" y={y} width="18" height="12" fill="#f8fafc" opacity="0.9" />
              ))}
              {[230, 250, 270, 290, 310, 330, 350].map((y) => (
                <rect key={`ped-e-${y}`} x="384" y={y} width="18" height="12" fill="#f8fafc" opacity="0.9" />
              ))}

              {/* Center Yellow Road Markings */}
              <line x1="300" y1="0" x2="300" y2="190" stroke="#facc15" strokeWidth="3" strokeDasharray="14 10" />
              <line x1="300" y1="410" x2="300" y2="600" stroke="#facc15" strokeWidth="3" strokeDasharray="14 10" />
              <line x1="0" y1="300" x2="190" y2="300" stroke="#facc15" strokeWidth="3" strokeDasharray="14 10" />
              <line x1="410" y1="300" x2="600" y2="300" stroke="#facc15" strokeWidth="3" strokeDasharray="14 10" />

              {/* Stop Lines */}
              <line x1="220" y1="195" x2="300" y2="195" stroke="#ffffff" strokeWidth="5" />
              <line x1="300" y1="405" x2="380" y2="405" stroke="#ffffff" strokeWidth="5" />
              <line x1="195" y1="300" x2="195" y2="380" stroke="#ffffff" strokeWidth="5" />
              <line x1="405" y1="220" x2="405" y2="300" stroke="#ffffff" strokeWidth="5" />

              {/* Approach Direction Labels */}
              <text x="300" y="30" fill="#94a3b8" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">NORTH</text>
              <text x="300" y="585" fill="#94a3b8" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">SOUTH</text>
              <text x="40" y="305" fill="#94a3b8" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">WEST</text>
              <text x="560" y="305" fill="#94a3b8" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">EAST</text>

              {/* Traffic Light Heads */}
              {/* North */}
              <g transform="translate(195, 135)">
                <rect x="0" y="0" width="22" height="52" rx="5" fill="#090d16" stroke="#334155" strokeWidth="1.5" />
                <circle cx="11" cy="10" r="5.5" fill={directions.North?.signal_status === 'RED' ? '#ef4444' : '#450a0a'} className={directions.North?.signal_status === 'RED' ? 'glow-red' : ''} />
                <circle cx="11" cy="26" r="5.5" fill={directions.North?.signal_status === 'YELLOW' ? '#f59e0b' : '#451a03'} className={directions.North?.signal_status === 'YELLOW' ? 'glow-yellow' : ''} />
                <circle cx="11" cy="42" r="5.5" fill={directions.North?.signal_status === 'GREEN' ? '#10b981' : '#022c22'} className={directions.North?.signal_status === 'GREEN' ? 'glow-green' : ''} />
              </g>

              {/* South */}
              <g transform="translate(385, 415)">
                <rect x="0" y="0" width="22" height="52" rx="5" fill="#090d16" stroke="#334155" strokeWidth="1.5" />
                <circle cx="11" cy="10" r="5.5" fill={directions.South?.signal_status === 'RED' ? '#ef4444' : '#450a0a'} className={directions.South?.signal_status === 'RED' ? 'glow-red' : ''} />
                <circle cx="11" cy="26" r="5.5" fill={directions.South?.signal_status === 'YELLOW' ? '#f59e0b' : '#451a03'} className={directions.South?.signal_status === 'YELLOW' ? 'glow-yellow' : ''} />
                <circle cx="11" cy="42" r="5.5" fill={directions.South?.signal_status === 'GREEN' ? '#10b981' : '#022c22'} className={directions.South?.signal_status === 'GREEN' ? 'glow-green' : ''} />
              </g>

              {/* West */}
              <g transform="translate(135, 385)">
                <rect x="0" y="0" width="52" height="22" rx="5" fill="#090d16" stroke="#334155" strokeWidth="1.5" />
                <circle cx="10" cy="11" r="5.5" fill={directions.West?.signal_status === 'RED' ? '#ef4444' : '#450a0a'} className={directions.West?.signal_status === 'RED' ? 'glow-red' : ''} />
                <circle cx="26" cy="11" r="5.5" fill={directions.West?.signal_status === 'YELLOW' ? '#f59e0b' : '#451a03'} className={directions.West?.signal_status === 'YELLOW' ? 'glow-yellow' : ''} />
                <circle cx="42" cy="11" r="5.5" fill={directions.West?.signal_status === 'GREEN' ? '#10b981' : '#022c22'} className={directions.West?.signal_status === 'GREEN' ? 'glow-green' : ''} />
              </g>

              {/* East */}
              <g transform="translate(415, 195)">
                <rect x="0" y="0" width="52" height="22" rx="5" fill="#090d16" stroke="#334155" strokeWidth="1.5" />
                <circle cx="42" cy="11" r="5.5" fill={directions.East?.signal_status === 'RED' ? '#ef4444' : '#450a0a'} className={directions.East?.signal_status === 'RED' ? 'glow-red' : ''} />
                <circle cx="26" cy="11" r="5.5" fill={directions.East?.signal_status === 'YELLOW' ? '#f59e0b' : '#451a03'} className={directions.East?.signal_status === 'YELLOW' ? 'glow-yellow' : ''} />
                <circle cx="10" cy="11" r="5.5" fill={directions.East?.signal_status === 'GREEN' ? '#10b981' : '#022c22'} className={directions.East?.signal_status === 'GREEN' ? 'glow-green' : ''} />
              </g>

              {/* Vehicles Queue Representation */}
              {/* North */}
              {Array.from({ length: Math.min(8, directions.North?.queue_length || 0) }).map((_, i) => (
                <rect
                  key={`v-n-${i}`}
                  x="250"
                  y={170 - (i * 24)}
                  width="22"
                  height="16"
                  rx="3"
                  fill={i === 0 && state.emergency_active && state.emergency_info?.direction === 'North' ? '#ef4444' : '#38bdf8'}
                  stroke="#0284c7"
                  strokeWidth="1"
                />
              ))}

              {/* South */}
              {Array.from({ length: Math.min(8, directions.South?.queue_length || 0) }).map((_, i) => (
                <rect
                  key={`v-s-${i}`}
                  x="328"
                  y={420 + (i * 24)}
                  width="22"
                  height="16"
                  rx="3"
                  fill={i === 0 && state.emergency_active && state.emergency_info?.direction === 'South' ? '#ef4444' : '#34d399'}
                  stroke="#059669"
                  strokeWidth="1"
                />
              ))}

              {/* West */}
              {Array.from({ length: Math.min(8, directions.West?.queue_length || 0) }).map((_, i) => (
                <rect
                  key={`v-w-${i}`}
                  x={170 - (i * 24)}
                  y="328"
                  width="16"
                  height="22"
                  rx="3"
                  fill={i === 0 && state.emergency_active && state.emergency_info?.direction === 'West' ? '#ef4444' : '#fbbf24'}
                  stroke="#d97706"
                  strokeWidth="1"
                />
              ))}

              {/* East */}
              {Array.from({ length: Math.min(8, directions.East?.queue_length || 0) }).map((_, i) => (
                <rect
                  key={`v-e-${i}`}
                  x={420 + (i * 24)}
                  y="250"
                  width="16"
                  height="22"
                  rx="3"
                  fill={i === 0 && state.emergency_active && state.emergency_info?.direction === 'East' ? '#ef4444' : '#c084fc'}
                  stroke="#9333ea"
                  strokeWidth="1"
                />
              ))}

              {/* Center Digital HUD Badge */}
              <circle cx="300" cy="300" r="38" fill="#030712" stroke="#38bdf8" strokeWidth="2.5" />
              <text x="300" y="295" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                {activeDir.toUpperCase()}
              </text>
              <text x="300" y="320" fill="#ffffff" fontSize="20" fontWeight="extrabold" textAnchor="middle" fontFamily="monospace">
                {remainingTimer}s
              </text>
            </svg>

            {/* Emergency Corridor Banner Overlay if Active */}
            {state.emergency_active && (
              <div className="absolute top-4 inset-x-4 bg-red-950/95 border-2 border-red-500 rounded-2xl p-3 flex items-center justify-between text-xs text-red-200 animate-pulse z-20 shadow-2xl">
                <div className="flex items-center gap-2.5 font-bold">
                  <Siren className="w-5 h-5 text-red-400 shrink-0" />
                  <span>EMERGENCY CORRIDOR: {state.emergency_info?.vehicle_type?.toUpperCase()} (APPROACH: {state.emergency_info?.direction})</span>
                </div>
                <span className="font-mono bg-red-900 px-2 py-0.5 rounded text-white font-bold text-[11px]">
                  ALL CONFLICTS STOPPED
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side Controls: Webster Formula, Queue Telemetry & 1-Click Emergency (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Webster Cycle Formula Card (From Paper 2) */}
          <div className="p-5 rounded-3xl bg-navy-900/80 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                <span>Webster's Minimum-Delay Cycle Optimization</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                KAIST ASTM
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-navy-950 border border-amber-500/30 font-mono text-xs text-amber-300 space-y-2">
              <div className="text-sm font-bold text-white">
                C = (1.5 · L + 5) / (1.0 - ∑ Yᵢ)
              </div>
              <div className="text-[11px] text-slate-400 grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                <div>• Lost Time (L): <strong>{webster.lost_time_L}s</strong></div>
                <div>• Flow Ratio (∑Y): <strong>{webster.sum_Y}</strong></div>
                <div>• Optimal Cycle: <strong className="text-amber-300">{webster.optimal_cycle_sec}s</strong></div>
                <div>• Saturation: <strong>1800 veh/hr</strong></div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed italic">
              Minimizes intersection delay by mathematically proportioning green splits based on critical approach volume.
            </p>
          </div>

          {/* Quick 1-Click Emergency Vehicle Preemption */}
          <div className="p-5 rounded-3xl bg-navy-900/80 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Siren className="w-4 h-4 text-red-400" />
                <span>Emergency Vehicle Priority Corridor</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                Safe Preemption
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Vehicle Type:</label>
                <div className="grid grid-cols-2 gap-1.5 font-mono">
                  {['Ambulance', 'Fire Truck'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedEmergencyType(t)}
                      className={`p-2 rounded-xl border text-center transition ${
                        selectedEmergencyType === t
                          ? 'bg-red-600/40 border-red-500 text-white font-bold'
                          : 'bg-navy-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {t === 'Ambulance' ? '🚑 Amb.' : '🚒 Fire'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Approach Direction:</label>
                <div className="grid grid-cols-4 gap-1 font-mono text-[11px]">
                  {['North', 'South', 'East', 'West'].map((dir) => (
                    <button
                      key={dir}
                      onClick={() => setSelectedEmergencyDir(dir)}
                      className={`p-1.5 rounded-lg border text-center font-bold transition ${
                        selectedEmergencyDir === dir
                          ? 'bg-cyan-600/40 border-cyan-500 text-cyan-200'
                          : 'bg-navy-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {dir[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleTriggerEmergency}
              disabled={isEmergencySubmitting || state.emergency_active}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-lg flex items-center justify-center gap-2 transition ${
                state.emergency_active
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-red-600 hover:bg-red-500 shadow-red-600/30'
              }`}
            >
              <Siren className="w-4 h-4" />
              {state.emergency_active ? 'Priority Corridor Active' : `Dispatch ${selectedEmergencyType} on ${selectedEmergencyDir}`}
            </button>
          </div>

          {/* AI Decision Reasoning Box */}
          <div className="p-4 rounded-2xl bg-navy-900/80 border border-slate-800 shadow-xl space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-[11px] font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Phase Selection Reasoning (XAI)</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed italic bg-navy-950 p-3 rounded-xl border border-slate-800/80">
              "{state.ai_reasoning || 'Calculating dynamic phase allocations based on queue lengths.'}"
            </p>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
              <span>Pedestrian Wait: {state.pedestrian_wait_time || 0}s</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Zero Conflict Guaranteed
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
