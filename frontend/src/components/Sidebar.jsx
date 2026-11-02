import React from 'react';
import { 
  Sliders, 
  ScanLine, 
  TrendingUp, 
  GitCompare, 
  Activity, 
  Sparkles,
  ShieldCheck,
  Siren
} from 'lucide-react';
import { useTraffic } from '../context/TrafficContext';

export const NAV_ITEMS = [
  { 
    id: 'command', 
    label: 'Command Center & 4-Way Simulator', 
    icon: Sliders, 
    badge: 'Core Demo',
    desc: 'Live 4-way intersection, Webster cycle & emergency corridor'
  },
  { 
    id: 'detection', 
    label: 'YOLO Computer Vision', 
    icon: ScanLine, 
    badge: 'YOLOv8',
    desc: 'Real-time vehicle localization & 5-class categorization'
  },
  { 
    id: 'prediction', 
    label: 'RNN-LSTM 12-Hour Forecast', 
    icon: TrendingUp, 
    badge: 'LSTM',
    desc: 'Temporal sequential prediction & peak hour analysis'
  },
  { 
    id: 'evaluation', 
    label: 'Academic Benchmarks & Evaluation', 
    icon: GitCompare, 
    badge: 'CARLA',
    desc: 'Empirical comparison: +50% flow, -70% pass delay'
  }
];

export default function Sidebar({ activeTab, setActiveTab }) {
  const { intersectionState } = useTraffic();
  const emergencyActive = intersectionState?.emergency_active;
  const webster = intersectionState?.webster_cycle || { optimal_cycle_sec: 65 };

  return (
    <aside className="w-72 bg-navy-900/95 border-r border-slate-800/80 flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 select-none p-4">
      <div className="space-y-4">
        {/* Section title */}
        <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
          Research Presentation Modules
        </div>

        {/* 4 Focused Navigation Buttons */}
        <nav className="space-y-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left p-3.5 rounded-2xl transition-all group border ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 via-navy-850 to-emerald-500/10 text-white border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                    : 'bg-navy-950/60 border-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2.5 font-bold text-xs text-white">
                    <Icon className={`w-4 h-4 transition ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                    <span>{item.label}</span>
                  </div>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    isActive 
                      ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/40' 
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 pl-6 leading-tight">
                  {item.desc}
                </p>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Live Intersection Telemetry Box */}
      <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800/80 space-y-2 font-mono text-[11px]">
        <div className="flex items-center justify-between text-xs font-bold text-white font-sans">
          <span>Intersection INT-01</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
            {intersectionState?.current_signal_phase || 'ONLINE'}
          </span>
        </div>

        <div className="space-y-1 text-slate-400 text-[10px]">
          <div className="flex justify-between">
            <span>Right-of-Way:</span>
            <span className="text-white font-bold">{intersectionState?.active_direction || 'North'}</span>
          </div>
          <div className="flex justify-between">
            <span>Phase Timer:</span>
            <span className="text-cyan-400 font-bold">{intersectionState?.remaining_timer || 0}s</span>
          </div>
          <div className="flex justify-between">
            <span>Webster Cycle:</span>
            <span className="text-amber-400 font-bold">{webster.optimal_cycle_sec}s</span>
          </div>
          <div className="flex justify-between">
            <span>Total Waiting:</span>
            <span className="text-white font-bold">{intersectionState?.total_queue || 0} veh</span>
          </div>
        </div>

        {emergencyActive && (
          <div className="mt-2 p-2 bg-red-950/80 border border-red-500/60 rounded-xl flex items-center gap-2 text-[10px] text-red-200 animate-pulse font-sans">
            <Siren className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span>Priority Green Corridor Engaged</span>
          </div>
        )}
      </div>
    </aside>
  );
}
