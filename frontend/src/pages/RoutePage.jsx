import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Navigation, 
  MapPin, 
  Clock, 
  Milestone, 
  ArrowRight, 
  Leaf, 
  AlertTriangle, 
  CheckCircle2, 
  Compass, 
  Sparkles,
  RefreshCw
} from 'lucide-react';

export default function RoutePage() {
  const [network, setNetwork] = useState(null);
  const [origin, setOrigin] = useState('INT-01');
  const [destination, setDestination] = useState('INT-06');
  const [routeResults, setRouteResults] = useState(null);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    api.getRoadNetwork()
      .then((res) => {
        setNetwork(res);
        handleCalculateRoutes('INT-01', 'INT-06');
      })
      .catch((err) => console.error('Network fetch error:', err));
  }, []);

  const handleCalculateRoutes = async (orig = origin, dest = destination) => {
    if (orig === dest) {
      alert('Origin and destination must be different intersections.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.calculateRoutes(orig, dest, true);
      setRouteResults(res.data);
      if (res.data?.recommended_route) {
        setSelectedRouteId(res.data.recommended_route.route_id);
      }
    } catch (err) {
      alert(`Route calculation error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const nodes = network?.nodes || [];
  const recommended = routeResults?.recommended_route;
  const alternatives = routeResults?.alternative_routes || [];
  const allRoutes = recommended ? [recommended, ...alternatives] : [];
  const activeRoute = allRoutes.find((r) => r.route_id === selectedRouteId) || recommended;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-navy-900 border border-slate-800 glow-card">
        <div>
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
              Graph-Theoretic Multi-Path Routing
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Dynamic City Route Optimization</h2>
          <p className="text-sm text-slate-400">
            Dijkstra shortest-path routing incorporating live queue density penalties and eco-routing
          </p>
        </div>

        {/* Quick Origin-Destination Selector */}
        <div className="flex flex-wrap items-center gap-2 bg-navy-950 p-2 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">From:</span>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="bg-navy-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-semibold focus:outline-none focus:border-cyan-500"
            >
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.id} ({n.name.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">To:</span>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="bg-navy-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-semibold focus:outline-none focus:border-cyan-500"
            >
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.id} ({n.name.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => handleCalculateRoutes(origin, destination)}
            disabled={isLoading}
            className="px-3.5 py-1 rounded-lg font-bold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5 transition ml-1"
          >
            <Compass className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Route
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Map Visualizer (7 cols) + Route Cards & Turn Directions (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map / Road Network Canvas (7 cols) */}
        <div className="lg:col-span-7 bg-navy-900/80 border border-slate-800 rounded-2xl p-5 glow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              Metropolitan Road Network Topology
            </h3>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Active Corridor
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600" /> Arterial Road
              </span>
            </div>
          </div>

          {/* Simulated Leaflet-Style Road Network Visualizer */}
          <div className="relative w-full aspect-video rounded-xl bg-navy-950 border border-slate-800/80 overflow-hidden bg-grid-pattern p-4 flex items-center justify-center">
            <svg viewBox="0 0 700 450" className="w-full h-full">
              {/* Draw road network edges */}
              {network?.edges?.map((edge, idx) => {
                const uNode = nodes.find((n) => n.id === edge.from);
                const vNode = nodes.find((n) => n.id === edge.to);
                if (!uNode || !vNode) return null;

                // Scale lat/lng to SVG coords
                const x1 = ((uNode.lng - (-74.025)) / 0.05) * 600 + 50;
                const y1 = 400 - ((uNode.lat - 40.69) / 0.05) * 350;
                const x2 = ((vNode.lng - (-74.025)) / 0.05) * 600 + 50;
                const y2 = 400 - ((vNode.lat - 40.69) / 0.05) * 350;

                // Check if this edge is in the currently selected route
                const isSelectedEdge = activeRoute?.path_nodes?.some((nodeId, i) => {
                  const nextNodeId = activeRoute.path_nodes[i + 1];
                  return (nodeId === edge.from && nextNodeId === edge.to) || (nodeId === edge.to && nextNodeId === edge.from);
                });

                return (
                  <g key={`edge-${idx}`}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={isSelectedEdge ? '#38bdf8' : '#334155'}
                      strokeWidth={isSelectedEdge ? 5 : 2}
                      strokeLinecap="round"
                    />
                  </g>
                );
              })}

              {/* Draw Intersections */}
              {nodes.map((node) => {
                const cx = ((node.lng - (-74.025)) / 0.05) * 600 + 50;
                const cy = 400 - ((node.lat - 40.69) / 0.05) * 350;
                const isOrigin = node.id === origin;
                const isDest = node.id === destination;
                const isInRoute = activeRoute?.path_nodes?.includes(node.id);

                let fill = '#1e293b';
                let stroke = '#64748b';
                if (isOrigin) {
                  fill = '#10b981';
                  stroke = '#34d399';
                } else if (isDest) {
                  fill = '#ef4444';
                  stroke = '#f87171';
                } else if (isInRoute) {
                  fill = '#0284c7';
                  stroke = '#38bdf8';
                }

                return (
                  <g key={node.id} className="cursor-pointer" onClick={() => setDestination(node.id)}>
                    {isOrigin && <circle cx={cx} cy={cy} r="14" fill="#10b981" opacity="0.3" className="animate-ping" />}
                    {isDest && <circle cx={cx} cy={cy} r="14" fill="#ef4444" opacity="0.3" className="animate-ping" />}
                    <circle cx={cx} cy={cy} r="8" fill={fill} stroke={stroke} strokeWidth="2" />
                    <text x={cx} y={cy - 12} fill="#cbd5e1" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                      {node.id}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Map Legend Overlay */}
            <div className="absolute bottom-3 left-3 bg-navy-900/90 border border-slate-800 px-3 py-1.5 rounded-lg text-[11px] text-slate-300 font-mono flex items-center gap-3">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Origin: {origin}</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Destination: {destination}</span>
            </div>
          </div>
        </div>

        {/* Route Cards & Navigation Turn Details (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-navy-900/80 border border-slate-800 glow-card space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Calculated Route Options
            </h3>

            {/* Candidate Route Cards */}
            <div className="space-y-2.5">
              {allRoutes.map((route) => {
                const isSelected = route.route_id === selectedRouteId;
                return (
                  <button
                    key={route.route_id}
                    onClick={() => setSelectedRouteId(route.route_id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition ${
                      isSelected
                        ? 'bg-navy-850 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                        : 'bg-navy-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-white text-sm flex items-center gap-2">
                        <span>{route.name}</span>
                        {route.is_recommended && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                            FASTEST AI ROUTE
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-base font-extrabold text-cyan-300">
                        {route.total_time_min} min
                      </span>
                    </div>

                    <div className="mt-2.5 grid grid-cols-3 gap-2 text-xs font-mono text-slate-400 border-t border-slate-800/80 pt-2">
                      <div className="flex items-center gap-1">
                        <Milestone className="w-3.5 h-3.5 text-slate-500" />
                        <span>{route.total_distance_km} km</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{route.co2_emissions_kg} kg CO₂</span>
                      </div>
                      <div className="text-right">
                        Cong: <strong className="text-white">{route.avg_congestion}</strong>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Step-by-Step Navigation Turn List */}
            {activeRoute && (
              <div className="pt-2 space-y-2">
                <div className="text-xs font-semibold text-slate-300">Route Segments & Congestion</div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {activeRoute.segments?.map((seg, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-navy-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-white">
                          {seg.from_node} → {seg.to_node} ({seg.road_name})
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {seg.distance_km} km @ {seg.speed_limit_kmh} km/h • Est. {seg.travel_time_min} min
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        seg.congestion_level === 'LOW'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-yellow-950 text-yellow-400 border border-yellow-800'
                      }`}>
                        {seg.congestion_level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
