import React, { useState } from 'react';
import { useTraffic } from '../context/TrafficContext';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  TrendingUp, 
  TrendingDown, 
  Siren, 
  Zap, 
  Clock, 
  Sliders, 
  ShieldCheck, 
  UserCheck, 
  Flame, 
  Sparkles,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

export default function SimulatorPage() {
  const { 
    intersectionState, 
    isSimulationRunning, 
    togglePlayPause, 
    resetSimulation, 
    adjustTrafficDensity, 
    setControllerMode,
    triggerEmergencyVehicle 
  } = useTraffic();

  const [selectedEmergencyType, setSelectedEmergencyType] = useState('Ambulance');
  const [selectedEmergencyDir, setSelectedEmergencyDir] = useState('North');
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  const state = intersectionState || {};
  const directions = state.directions || {};
  const activeDir = state.active_direction || 'North';
  const currentPhase = state.current_signal_phase || 'GREEN';
  const remainingTimer = state.remaining_timer || 0;
  const activeMode = state.active_mode || 'AI_ADAPTIVE';
  const intensity = state.traffic_intensity || 1.0;
  const activeVehicles = state.active_vehicles || [];

  const handleTriggerEmergency = () => {
    triggerEmergencyVehicle(selectedEmergencyType, selectedEmergencyDir);
    setShowEmergencyModal(false);
  };

  const getSignalColor = (dir) => {
    const dData = directions[dir];
    if (!dData) return 'bg-red-500 glow-red';
    if (dData.signal_status === 'GREEN') return 'bg-emerald-500 glow-green';
    if (dData.signal_status === 'YELLOW') return 'bg-amber-500 glow-yellow';
    return 'bg-red-500 glow-red';
  };

  return (
    <div className="space-y-6">
      {/* Top Simulator Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-navy-900 border border-slate-800 glow-card">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
              Interactive 4-Way Urban Intersection Simulator
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Adaptive Signal & Queue Engine</h2>
          <p className="text-sm text-slate-400">
            Real-time multi-agent vehicle flow simulation with dynamic phase scheduling
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Mode Switcher */}
          <div className="bg-navy-950 p-1 rounded-xl border border-slate-800 flex gap-1">
            <button
              onClick={() => setControllerMode('AI_ADAPTIVE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeMode === 'AI_ADAPTIVE'
                  ? 'bg-gradient-to-r from-cyan-600 to-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-cyan-300" />
              Mode B: AI Adaptive
            </button>
            <button
              onClick={() => setControllerMode('TRADITIONAL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeMode === 'TRADITIONAL'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Mode A: Traditional Fixed
            </button>
          </div>

          {/* Play/Pause */}
          <button
            onClick={togglePlayPause}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              isSimulationRunning
                ? 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
                : 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
            }`}
          >
            {isSimulationRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isSimulationRunning ? 'Pause Sim' : 'Resume Sim'}
          </button>

          {/* Reset */}
          <button
            onClick={resetSimulation}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            title="Reset simulation queues"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Emergency Trigger */}
          <button
            onClick={() => setShowEmergencyModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-red-600 text-white shadow-md shadow-red-500/20 hover:bg-red-500 flex items-center gap-1.5 transition"
          >
            <Siren className="w-3.5 h-3.5 animate-pulse" />
            Trigger Emergency
          </button>
        </div>
      </div>

      {/* Main Intersection Canvas and Live Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Animated 4-Way Intersection SVG/Canvas (7 cols) */}
        <div className="lg:col-span-7 bg-navy-900/80 border border-slate-800 rounded-2xl p-5 glow-card flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">4-Way Traffic Intersection (INT-01)</h3>
              <p className="text-xs text-slate-400">Live animated approaches with dynamic signal heads</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Traffic Inflow:</span>
              <span className="font-mono text-xs font-bold text-cyan-400">{intensity}x</span>
              <button
                onClick={() => adjustTrafficDensity(0.2)}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400"
                title="Increase Traffic"
              >
                <TrendingUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => adjustTrafficDensity(-0.2)}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400"
                title="Decrease Traffic"
              >
                <TrendingDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive 4-Way Animated SVG Canvas */}
          <div className="relative w-full aspect-square max-h-[500px] mx-auto rounded-xl bg-[#090d16] border border-slate-800/80 overflow-hidden flex items-center justify-center select-none">
            <svg viewBox="0 0 600 600" className="w-full h-full">
              {/* Grass Corner Zones */}
              <rect x="0" y="0" width="220" height="220" fill="#064e3b" />
              <rect x="380" y="0" width="220" height="220" fill="#064e3b" />
              <rect x="0" y="380" width="220" height="220" fill="#064e3b" />
              <rect x="380" y="380" width="220" height="220" fill="#064e3b" />

              {/* Asphalt Roads */}
              {/* North-South Road */}
              <rect x="220" y="0" width="160" height="600" fill="#1e293b" />
              {/* East-West Road */}
              <rect x="0" y="220" width="600" height="160" fill="#1e293b" />

              {/* Center Junction Asphalt */}
              <rect x="220" y="220" width="160" height="160" fill="#172554" />

              {/* Pedestrian Crosswalks (Stripes) */}
              {/* North Crosswalk */}
              {[230, 250, 270, 290, 310, 330, 350].map((x) => (
                <rect key={`ped-n-${x}`} x={x} y="200" width="12" height="16" fill="#f8fafc" />
              ))}
              {/* South Crosswalk */}
              {[230, 250, 270, 290, 310, 330, 350].map((x) => (
                <rect key={`ped-s-${x}`} x={x} y="384" width="12" height="16" fill="#f8fafc" />
              ))}
              {/* West Crosswalk */}
              {[230, 250, 270, 290, 310, 330, 350].map((y) => (
                <rect key={`ped-w-${y}`} x="200" y={y} width="16" height="12" fill="#f8fafc" />
              ))}
              {/* East Crosswalk */}
              {[230, 250, 270, 290, 310, 330, 350].map((y) => (
                <rect key={`ped-e-${y}`} x="384" y={y} width="16" height="12" fill="#f8fafc" />
              ))}

              {/* Lane Divider Lines (Yellow Dotted) */}
              {/* North */}
              <line x1="300" y1="0" x2="300" y2="190" stroke="#facc15" strokeWidth="3" strokeDasharray="14 10" />
              {/* South */}
              <line x1="300" y1="410" x2="300" y2="600" stroke="#facc15" strokeWidth="3" strokeDasharray="14 10" />
              {/* West */}
              <line x1="0" y1="300" x2="190" y2="300" stroke="#facc15" strokeWidth="3" strokeDasharray="14 10" />
              {/* East */}
              <line x1="410" y1="300" x2="600" y2="300" stroke="#facc15" strokeWidth="3" strokeDasharray="14 10" />

              {/* Stop Lines (Solid White) */}
              <line x1="220" y1="195" x2="300" y2="195" stroke="#ffffff" strokeWidth="5" />
              <line x1="300" y1="405" x2="380" y2="405" stroke="#ffffff" strokeWidth="5" />
              <line x1="195" y1="300" x2="195" y2="380" stroke="#ffffff" strokeWidth="5" />
              <line x1="405" y1="220" x2="405" y2="300" stroke="#ffffff" strokeWidth="5" />

              {/* Direction Indicator Labels */}
              <text x="300" y="30" fill="#94a3b8" fontSize="14" fontWeight="bold" textAnchor="middle">NORTH</text>
              <text x="300" y="585" fill="#94a3b8" fontSize="14" fontWeight="bold" textAnchor="middle">SOUTH</text>
              <text x="40" y="305" fill="#94a3b8" fontSize="14" fontWeight="bold" textAnchor="middle">WEST</text>
              <text x="560" y="305" fill="#94a3b8" fontSize="14" fontWeight="bold" textAnchor="middle">EAST</text>

              {/* Traffic Light Signal Heads */}
              {/* North Signal Head */}
              <g transform="translate(195, 140)">
                <rect x="0" y="0" width="20" height="48" rx="4" fill="#0a0f1d" stroke="#334155" strokeWidth="1.5" />
                <circle cx="10" cy="9" r="5" fill={directions.North?.signal_status === 'RED' ? '#ef4444' : '#450a0a'} className={directions.North?.signal_status === 'RED' ? 'glow-red' : ''} />
                <circle cx="10" cy="24" r="5" fill={directions.North?.signal_status === 'YELLOW' ? '#f59e0b' : '#451a03'} className={directions.North?.signal_status === 'YELLOW' ? 'glow-yellow' : ''} />
                <circle cx="10" cy="39" r="5" fill={directions.North?.signal_status === 'GREEN' ? '#10b981' : '#022c22'} className={directions.North?.signal_status === 'GREEN' ? 'glow-green' : ''} />
              </g>

              {/* South Signal Head */}
              <g transform="translate(385, 415)">
                <rect x="0" y="0" width="20" height="48" rx="4" fill="#0a0f1d" stroke="#334155" strokeWidth="1.5" />
                <circle cx="10" cy="9" r="5" fill={directions.South?.signal_status === 'RED' ? '#ef4444' : '#450a0a'} className={directions.South?.signal_status === 'RED' ? 'glow-red' : ''} />
                <circle cx="10" cy="24" r="5" fill={directions.South?.signal_status === 'YELLOW' ? '#f59e0b' : '#451a03'} className={directions.South?.signal_status === 'YELLOW' ? 'glow-yellow' : ''} />
                <circle cx="10" cy="39" r="5" fill={directions.South?.signal_status === 'GREEN' ? '#10b981' : '#022c22'} className={directions.South?.signal_status === 'GREEN' ? 'glow-green' : ''} />
              </g>

              {/* West Signal Head */}
              <g transform="translate(140, 385)">
                <rect x="0" y="0" width="48" height="20" rx="4" fill="#0a0f1d" stroke="#334155" strokeWidth="1.5" />
                <circle cx="9" cy="10" r="5" fill={directions.West?.signal_status === 'RED' ? '#ef4444' : '#450a0a'} className={directions.West?.signal_status === 'RED' ? 'glow-red' : ''} />
                <circle cx="24" cy="10" r="5" fill={directions.West?.signal_status === 'YELLOW' ? '#f59e0b' : '#451a03'} className={directions.West?.signal_status === 'YELLOW' ? 'glow-yellow' : ''} />
                <circle cx="39" cy="10" r="5" fill={directions.West?.signal_status === 'GREEN' ? '#10b981' : '#022c22'} className={directions.West?.signal_status === 'GREEN' ? 'glow-green' : ''} />
              </g>

              {/* East Signal Head */}
              <g transform="translate(415, 195)">
                <rect x="0" y="0" width="48" height="20" rx="4" fill="#0a0f1d" stroke="#334155" strokeWidth="1.5" />
                <circle cx="39" cy="10" r="5" fill={directions.East?.signal_status === 'RED' ? '#ef4444' : '#450a0a'} className={directions.East?.signal_status === 'RED' ? 'glow-red' : ''} />
                <circle cx="24" cy="10" r="5" fill={directions.East?.signal_status === 'YELLOW' ? '#f59e0b' : '#451a03'} className={directions.East?.signal_status === 'YELLOW' ? 'glow-yellow' : ''} />
                <circle cx="9" cy="10" r="5" fill={directions.East?.signal_status === 'GREEN' ? '#10b981' : '#022c22'} className={directions.East?.signal_status === 'GREEN' ? 'glow-green' : ''} />
              </g>

              {/* Moving Vehicles across approaches */}
              {/* Queued / Moving vehicles North */}
              {Array.from({ length: Math.min(10, directions.North?.queue_length || 0) }).map((_, i) => (
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

              {/* Queued / Moving vehicles South */}
              {Array.from({ length: Math.min(10, directions.South?.queue_length || 0) }).map((_, i) => (
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

              {/* Queued / Moving vehicles West */}
              {Array.from({ length: Math.min(10, directions.West?.queue_length || 0) }).map((_, i) => (
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

              {/* Queued / Moving vehicles East */}
              {Array.from({ length: Math.min(10, directions.East?.queue_length || 0) }).map((_, i) => (
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

              {/* Center HUD Digital Timer Badge */}
              <circle cx="300" cy="300" r="38" fill="#030712" stroke="#38bdf8" strokeWidth="2" />
              <text x="300" y="295" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                {activeDir.toUpperCase()}
              </text>
              <text x="300" y="318" fill="#ffffff" fontSize="20" fontWeight="extrabold" textAnchor="middle" fontFamily="monospace">
                {remainingTimer}s
              </text>
            </svg>

            {/* Emergency Corridor Banner Overlay if Active */}
            {state.emergency_active && (
              <div className="absolute top-4 inset-x-4 bg-red-950/90 border border-red-500 rounded-xl p-3 flex items-center justify-between text-xs text-red-200 animate-pulse z-20">
                <div className="flex items-center gap-2 font-bold">
                  <Siren className="w-4 h-4 text-red-400" />
                  <span>EMERGENCY CORRIDOR: {state.emergency_info?.vehicle_type?.toUpperCase()} APPROACHING FROM {state.emergency_info?.direction}</span>
                </div>
                <span className="font-mono bg-red-900 px-2 py-0.5 rounded text-white font-bold">
                  PRIORITY GREEN LOCKED
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 4-Way Approach Telemetry Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-navy-900/80 border border-slate-800 glow-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Approach Telemetry & Queue States
              </h3>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-navy-950 text-slate-300 border border-slate-800">
                Total: {state.total_queue || 0} Queued
              </span>
            </div>

            {/* 4 Approach Cards */}
            <div className="space-y-3">
              {['North', 'South', 'East', 'West'].map((dir) => {
                const d = directions[dir] || {};
                const isSelected = dir === activeDir;
                const sig = d.signal_status || 'RED';
                const q = d.queue_length || 0;
                const wait = d.waiting_time_sec || 0;
                const density = d.density_level || 'LOW';

                return (
                  <div
                    key={dir}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-navy-850/90 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                        : 'bg-navy-950/70 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-3.5 h-3.5 rounded-full shadow-md ${
                          sig === 'GREEN' ? 'bg-emerald-500 glow-green' : sig === 'YELLOW' ? 'bg-amber-500 glow-yellow' : 'bg-red-500 glow-red'
                        }`} />
                        <span className="font-bold text-white text-sm">{dir} Bound</span>
                        {isSelected && (
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                            RIGHT-OF-WAY
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                          density === 'LOW'
                            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                            : density === 'MEDIUM'
                            ? 'bg-yellow-950/60 text-yellow-400 border-yellow-800/60'
                            : density === 'HIGH'
                            ? 'bg-amber-950/60 text-amber-400 border-amber-800/60'
                            : 'bg-red-950/60 text-red-400 border-red-800/60'
                        }`}>
                          {density}
                        </span>
                        <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                          {d.remaining_timer_sec || 0}s
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar & Sub-stats */}
                    <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] font-mono text-slate-400 border-t border-slate-800/60 pt-2">
                      <div>
                        Queue: <strong className="text-white">{q} veh</strong>
                      </div>
                      <div>
                        Delay: <strong className="text-white">{Math.round(wait)}s</strong>
                      </div>
                      <div>
                        Congestion: <strong className="text-cyan-400">{Math.round((d.congestion_index || 0) * 100)}%</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AI Reasoning Summary */}
            <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-[11px] font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Explainable AI Phase Selection</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed italic">
                "{state.ai_reasoning || 'Monitoring real-time queues.'}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Trigger Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-navy-900 border border-red-500/60 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center">
                <Siren className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Emergency Vehicle Preemption</h3>
                <p className="text-xs text-slate-400">Dispatch priority green corridor with safe phase transitions</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold mb-1.5 block">Select Vehicle Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Ambulance', 'Fire Truck', 'Police Vehicle'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedEmergencyType(type)}
                      className={`p-2.5 rounded-xl border text-center font-medium transition ${
                        selectedEmergencyType === type
                          ? 'bg-red-600/30 border-red-500 text-white font-bold'
                          : 'bg-navy-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {type === 'Ambulance' ? '🚑' : type === 'Fire Truck' ? '🚒' : '🚓'}
                      <div className="text-[11px] mt-1">{type}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1.5 block">Approaching Direction</label>
                <div className="grid grid-cols-4 gap-2 font-mono">
                  {['North', 'South', 'East', 'West'].map((dir) => (
                    <button
                      key={dir}
                      type="button"
                      onClick={() => setSelectedEmergencyDir(dir)}
                      className={`p-2 rounded-lg border text-center transition ${
                        selectedEmergencyDir === dir
                          ? 'bg-cyan-600/30 border-cyan-500 text-cyan-200 font-bold'
                          : 'bg-navy-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {dir}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-navy-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="font-semibold text-slate-300">Safety Transition Sequence:</div>
                <div>1. Conflicting signals switched to Yellow clearance (3s)</div>
                <div>2. All-Red pedestrian & vehicle clearance interval (2s)</div>
                <div>3. Priority Green Corridor opened for {selectedEmergencyDir}</div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleTriggerEmergency}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 text-white shadow-lg shadow-red-600/30 hover:bg-red-500 flex items-center gap-1.5"
              >
                <Siren className="w-4 h-4" />
                Dispatch Green Corridor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
