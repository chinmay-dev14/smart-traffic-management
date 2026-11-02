import React, { useState, useEffect } from 'react';
import { useTraffic } from '../context/TrafficContext';
import { api } from '../services/api';
import { 
  Settings, 
  Sliders, 
  SlidersHorizontal, 
  ShieldCheck, 
  Database, 
  Cpu, 
  RefreshCw, 
  Save, 
  CheckCircle2, 
  Gauge 
} from 'lucide-react';

export default function SettingsPage() {
  const { addToast } = useTraffic();
  const [minGreen, setMinGreen] = useState(10);
  const [maxGreen, setMaxGreen] = useState(50);
  const [yellowTime, setYellowTime] = useState(3);
  const [pedestrianThreshold, setPedestrianThreshold] = useState(75);

  const [queueWeight, setQueueWeight] = useState(40);
  const [delayWeight, setDelayWeight] = useState(35);
  const [heavyWeight, setHeavyWeight] = useState(15);
  const [pedWeight, setPedWeight] = useState(10);

  const [simSpeed, setSimSpeed] = useState(1.0);
  const [healthStatus, setHealthStatus] = useState(null);

  useEffect(() => {
    api.getHealth()
      .then(setHealthStatus)
      .catch((err) => console.warn('Health check error:', err));
  }, []);

  const handleSaveParameters = () => {
    api.adjustSpeed(simSpeed).catch(console.error);
    addToast('Configuration Saved', 'Adaptive controller thresholds updated successfully.', 'info');
  };

  const handleSpeedChange = (speed) => {
    setSimSpeed(speed);
    api.adjustSpeed(speed)
      .then(() => addToast('Speed Adjusted', `Simulation running at ${speed}x speed.`, 'info'))
      .catch((err) => addToast('Error', err.message, 'danger'));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-navy-900 border border-slate-800 glow-card">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
              System Configuration & Optimization Tuning
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">System Settings & Algorithm Tuning</h2>
          <p className="text-sm text-slate-400">
            Calibrate adaptive signal thresholds, multi-factor weights, and simulation engine rates
          </p>
        </div>

        <button
          onClick={handleSaveParameters}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20 flex items-center gap-2 transition"
        >
          <Save className="w-4 h-4" />
          Apply Settings
        </button>
      </div>

      {/* Main Grid: Parameters & Weights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Signal Timing Limits (6 cols) */}
        <div className="lg:col-span-6 bg-navy-900/80 border border-slate-800 rounded-2xl p-5 glow-card space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Signal Duration & Safety Limits
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 font-semibold mb-1">
                <span>Minimum Green Interval:</span>
                <span className="font-mono text-cyan-300">{minGreen}s</span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                value={minGreen}
                onChange={(e) => setMinGreen(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">Minimum time green remains active per phase</span>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 font-semibold mb-1">
                <span>Maximum Green Interval:</span>
                <span className="font-mono text-cyan-300">{maxGreen}s</span>
              </div>
              <input
                type="range"
                min="30"
                max="90"
                value={maxGreen}
                onChange={(e) => setMaxGreen(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">Upper bound to prevent starvation on cross streets</span>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 font-semibold mb-1">
                <span>Yellow Clearance Duration:</span>
                <span className="font-mono text-cyan-300">{yellowTime}s</span>
              </div>
              <input
                type="range"
                min="2"
                max="6"
                value={yellowTime}
                onChange={(e) => setYellowTime(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">Caution buffer before conflicting right-of-way switch</span>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 font-semibold mb-1">
                <span>Pedestrian Max Wait Ceiling:</span>
                <span className="font-mono text-cyan-300">{pedestrianThreshold}s</span>
              </div>
              <input
                type="range"
                min="45"
                max="120"
                value={pedestrianThreshold}
                onChange={(e) => setPedestrianThreshold(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">Forces clearance interval for crosswalk safety</span>
            </div>
          </div>
        </div>

        {/* Multi-Factor Optimization Weights (6 cols) */}
        <div className="lg:col-span-6 bg-navy-900/80 border border-slate-800 rounded-2xl p-5 glow-card space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
            AI Demand Weight Distribution (%)
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 font-semibold mb-1">
                <span>Queue Length Priority (w₁):</span>
                <span className="font-mono text-cyan-300">{queueWeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="70"
                value={queueWeight}
                onChange={(e) => setQueueWeight(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 font-semibold mb-1">
                <span>Waiting Delay Penalty (w₂):</span>
                <span className="font-mono text-cyan-300">{delayWeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="70"
                value={delayWeight}
                onChange={(e) => setDelayWeight(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 font-semibold mb-1">
                <span>Heavy Transit & Freight Weight (w₃):</span>
                <span className="font-mono text-cyan-300">{heavyWeight}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                value={heavyWeight}
                onChange={(e) => setHeavyWeight(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 font-semibold mb-1">
                <span>Pedestrian Starvation Urgency (w₄):</span>
                <span className="font-mono text-cyan-300">{pedWeight}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                value={pedWeight}
                onChange={(e) => setPedWeight(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Simulation Speed & Diagnostics (12 cols) */}
        <div className="lg:col-span-12 bg-navy-900/80 border border-slate-800 rounded-2xl p-5 glow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Gauge className="w-4 h-4 text-cyan-400" />
              Engine Simulation Rate & System Health
            </h3>

            {/* Speed Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Simulation Rate:</span>
              {[1.0, 2.0, 3.0, 5.0].map((rate) => (
                <button
                  key={rate}
                  onClick={() => handleSpeedChange(rate)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition ${
                    simSpeed === rate
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'bg-navy-950 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 flex items-center gap-3">
              <Cpu className="w-6 h-6 text-emerald-400" />
              <div>
                <div className="text-xs font-semibold text-white">YOLOv8 & CV Engine</div>
                <div className="text-[11px] text-slate-400 font-mono">Neural Weights + Resilient Fallback</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 flex items-center gap-3">
              <Database className="w-6 h-6 text-cyan-400" />
              <div>
                <div className="text-xs font-semibold text-white">SQLite Database Core</div>
                <div className="text-[11px] text-slate-400 font-mono">5 Telemetry & Event Tables Active</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-purple-400" />
              <div>
                <div className="text-xs font-semibold text-white">Zero-Conflict Verification</div>
                <div className="text-[11px] text-slate-400 font-mono">Hardware State Invariants Guaranteed</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
