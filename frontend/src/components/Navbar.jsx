import React, { useState, useEffect } from 'react';
import { useTraffic } from '../context/TrafficContext';
import { 
  Activity, 
  Sparkles, 
  Clock, 
  HelpCircle,
  ShieldCheck,
  Zap
} from 'lucide-react';
import PresentationGuideModal from './PresentationGuideModal';

export default function Navbar() {
  const { connectionStatus, intersectionState } = useTraffic();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const mode = intersectionState?.active_mode || 'AI_ADAPTIVE';

  return (
    <>
      <header className="h-16 border-b border-slate-800/80 bg-navy-900/95 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 shadow-lg shadow-cyan-500/20">
            <Activity className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-sm tracking-wide text-white font-sans">
                SATMS <span className="text-cyan-400 font-light">| Autonomous Traffic Core</span>
              </h1>
              <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                ASTM-AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400">YOLOv8 + RNN-LSTM + Webster's Adaptive Optimization</p>
          </div>
        </div>

        {/* Telemetry & Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Live Guide Button */}
          <button
            onClick={() => setIsGuideOpen(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600/30 to-cyan-600/30 border border-purple-500/50 text-purple-200 hover:text-white flex items-center gap-2 transition hover:scale-105 shadow-md shadow-purple-900/30"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Instructor Pitch & Q&A Guide</span>
          </button>

          {/* Mode Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-navy-950 border border-slate-800 text-xs">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Policy:</span>
            <span className={`font-mono font-bold ${mode === 'AI_ADAPTIVE' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {mode.replace('_', ' ')}
            </span>
          </div>

          {/* Connection Status */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-navy-950 border border-slate-800 text-xs font-mono">
            <span className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'
            }`} />
            <span className="text-slate-300">
              {connectionStatus === 'connected' ? 'LIVE SYNC' : 'CONNECTING'}
            </span>
          </div>

          {/* Clock */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-300 font-mono bg-navy-950/80 px-2.5 py-1 rounded-xl border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{currentTime.toLocaleTimeString([], { hour12: false })}</span>
          </div>
        </div>
      </header>

      {/* Presentation Cheat-Sheet Modal */}
      <PresentationGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </>
  );
}
