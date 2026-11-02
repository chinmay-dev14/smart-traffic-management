import React, { useState } from 'react';
import { TrafficProvider } from './context/TrafficContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import CommandCenter from './pages/CommandCenter';
import DetectionView from './pages/DetectionView';
import PredictionView from './pages/PredictionView';
import EvaluationView from './pages/EvaluationView';

export default function App() {
  const [activeTab, setActiveTab] = useState('command');

  const renderActivePage = () => {
    switch (activeTab) {
      case 'command':
        return <CommandCenter />;
      case 'detection':
        return <DetectionView />;
      case 'prediction':
        return <PredictionView />;
      case 'evaluation':
        return <EvaluationView />;
      default:
        return <CommandCenter />;
    }
  };

  return (
    <TrafficProvider>
      <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
        {/* Top Fixed Header */}
        <Navbar />

        {/* 2-Column Presentation Layout */}
        <div className="flex flex-1">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Main Visual Presentation Stage */}
          <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
            {renderActivePage()}
          </main>
        </div>
      </div>
    </TrafficProvider>
  );
}
