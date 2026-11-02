import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  TrendingUp, 
  Clock, 
  BarChart3, 
  Sparkles, 
  RefreshCw, 
  AlertTriangle, 
  Brain,
  CheckCircle2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function PredictionView() {
  const [predictionData, setPredictionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchForecast = () => {
    setIsLoading(true);
    api.getPredictions()
      .then((res) => setPredictionData(res.data))
      .catch((err) => console.error('Prediction fetch error:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchForecast();
  }, []);

  const forecast = predictionData?.forecast || [];
  const hourly = predictionData?.hourly_projection || [];
  const peakPeriod = predictionData?.peak_traffic_period || '17:00 - 19:30 Evening Rush';
  const meta = predictionData?.model_metadata || { mse: 4.521, rmse: 2.232, architecture: 'RNN-LSTM' };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-navy-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-cyan-400">
              Recurrent Neural Network with Long Short-Term Memory
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">12-Hour Traffic Volume Forecasting</h2>
          <p className="text-xs text-slate-400">
            LSTM gating architecture as published in KAIST ASTM research (MSE: 4.521, RMSE: 2.232).
          </p>
        </div>

        <button
          onClick={fetchForecast}
          disabled={isLoading}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isLoading ? 'animate-spin' : ''}`} />
          Recalculate
        </button>
      </div>

      {/* 3 Horizon Projection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {forecast.map((item) => (
          <div
            key={item.horizon_minutes}
            className="p-5 rounded-3xl bg-navy-900/80 border border-slate-800 shadow-lg space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>+{item.horizon_minutes} Minutes Ahead</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                item.congestion_level === 'LOW'
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  : item.congestion_level === 'MEDIUM'
                  ? 'bg-yellow-950 text-yellow-400 border-yellow-800'
                  : 'bg-red-950 text-red-400 border-red-800'
              }`}>
                {item.congestion_level}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-navy-950 border border-slate-800/80">
              <div className="text-xs text-slate-400">Forecasted Vehicle Inflow</div>
              <div className="text-2xl font-extrabold font-mono text-cyan-300 mt-0.5">
                {item.predicted_count} <span className="text-xs font-sans text-slate-400">veh</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-1">
                90% CI: [{item.confidence_interval?.[0]} - {item.confidence_interval?.[1]}]
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
              <div>Expected Queue: <strong className="text-white">{item.expected_queue}</strong></div>
              <div>Est. Delay: <strong className="text-white">{item.expected_wait_sec}s</strong></div>
            </div>
          </div>
        ))}
      </div>

      {/* Main 12-Hour Area Curve & Model Metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-navy-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>Next 12 Hours Projected Traffic Volume Curve</span>
            </h3>
            <span className="text-xs text-amber-300 font-mono flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Peak: {peakPeriod}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourly}>
                <defs>
                  <linearGradient id="predAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0a1020', borderColor: '#334155', borderRadius: '12px' }}
                  itemStyle={{ fontSize: 12 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="predicted_vehicles" 
                  stroke="#38bdf8" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#predAreaGrad)" 
                  name="Predicted Vehicles" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Paper 2 RNN-LSTM Accuracy Card */}
        <div className="lg:col-span-4 bg-navy-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <span>Model Architecture & Accuracy</span>
            </h3>

            <div className="p-3.5 rounded-2xl bg-navy-950 border border-slate-800 space-y-2 text-xs font-mono">
              <div className="text-slate-400 text-[11px]">Academic Benchmarks (Goenawan KAIST):</div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span>Architecture:</span>
                <span className="text-cyan-300 font-bold">RNN-LSTM</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span>Mean Squared Error (MSE):</span>
                <span className="text-emerald-400 font-bold">{meta.mse} veh</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span>Root Mean Squared (RMSE):</span>
                <span className="text-emerald-400 font-bold">{meta.rmse} veh</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Gating Units:</span>
                <span className="text-slate-300 font-bold">Input, Forget, Output</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-500/30 text-[11px] text-purple-200">
            Enables proactive cycle length adjustment prior to rush hour queue formation.
          </div>
        </div>
      </div>
    </div>
  );
}
