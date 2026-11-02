import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Upload, 
  Camera, 
  Video, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Cpu, 
  Layers, 
  ShieldCheck, 
  Info,
  Car,
  Truck,
  Bike
} from 'lucide-react';

export default function DetectionPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [annotatedResult, setAnnotatedResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modelInfo, setModelInfo] = useState(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [webcamFps, setWebcamFps] = useState(0);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const webcamIntervalRef = useRef(null);

  useEffect(() => {
    api.getDetectorInfo()
      .then(setModelInfo)
      .catch((err) => console.error('Detector info error:', err));
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnnotatedResult(null);
      processFile(file);
    }
  };

  const processFile = async (file) => {
    setIsLoading(true);
    try {
      const res = await api.detectMedia(file);
      setAnnotatedResult(res.detection);
    } catch (err) {
      alert(`Detection failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 1-Click Load Sample Traffic Scene
  const handleLoadSample = async () => {
    setIsLoading(true);
    try {
      // Create a canvas-based sample traffic image
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 420;
      const ctx = canvas.getContext('2d');

      // Asphalt Road
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 80, 640, 340);

      // Grass border
      ctx.fillStyle = '#065f46';
      ctx.fillRect(0, 0, 640, 80);

      // Lane dividers
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 4;
      ctx.setLineDash([25, 20]);
      ctx.beginPath();
      ctx.moveTo(0, 240);
      ctx.lineTo(640, 240);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw simulated vehicles
      // Red Car
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(80, 140, 110, 60);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(95, 135, 80, 10);
      ctx.beginPath(); ctx.arc(105, 200, 10, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(165, 200, 10, 0, Math.PI * 2); ctx.fill();

      // Yellow Bus
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(260, 110, 170, 80);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(280, 125, 130, 20); // windows
      ctx.fillStyle = '#0f172a';
      ctx.beginPath(); ctx.arc(290, 190, 12, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(400, 190, 12, 0, Math.PI * 2); ctx.fill();

      // Blue SUV
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(160, 270, 120, 65);
      ctx.fillStyle = '#0f172a';
      ctx.beginPath(); ctx.arc(185, 335, 11, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(255, 335, 11, 0, Math.PI * 2); ctx.fill();

      // Motorcycle
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(450, 280, 45, 60);
      ctx.fillStyle = '#0f172a';
      ctx.beginPath(); ctx.arc(460, 340, 9, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(485, 340, 9, 0, Math.PI * 2); ctx.fill();

      canvas.toBlob(async (blob) => {
        const sampleFile = new File([blob], 'urban_sample_traffic.jpg', { type: 'image/jpeg' });
        setSelectedFile(sampleFile);
        setPreviewUrl(URL.createObjectURL(sampleFile));
        await processFile(sampleFile);
      }, 'image/jpeg');
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  // Live Webcam Support
  const toggleWebcam = async () => {
    if (isWebcamActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        stream.getTracks().forEach((track) => track.stop());
      }
      clearInterval(webcamIntervalRef.current);
      setIsWebcamActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setIsWebcamActive(true);

        // Periodically capture frame and run detection
        webcamIntervalRef.current = setInterval(() => {
          captureWebcamFrame();
        }, 1500);
      } catch (err) {
        alert('Webcam access was denied or is unavailable on this device.');
      }
    }
  };

  const captureWebcamFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (video.videoWidth === 0) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], 'webcam_frame.jpg', { type: 'image/jpeg' });
      try {
        const res = await api.detectMedia(file);
        setAnnotatedResult(res.detection);
      } catch (e) {
        console.error('Frame error', e);
      }
    }, 'image/jpeg', 0.8);
  };

  useEffect(() => {
    return () => {
      if (webcamIntervalRef.current) clearInterval(webcamIntervalRef.current);
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const counts = annotatedResult?.category_counts || { car: 0, bus: 0, truck: 0, motorcycle: 0, bicycle: 0 };
  const density = annotatedResult?.density_level || 'LOW';
  const conf = annotatedResult ? Math.round(annotatedResult.mean_confidence * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-navy-900 border border-slate-800 glow-card">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
              Computer Vision & Object Localization Engine
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Live Vehicle Detection & Classification</h2>
          <p className="text-sm text-slate-400">
            Powered by YOLOv8 deep convolutional network with resilient Computer Vision fallback
          </p>
        </div>

        {/* Engine status badge */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-navy-950 border border-slate-800 text-xs font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300">{modelInfo?.engine_type || 'YOLOv8 Core Ready'}</span>
          </div>
        </div>
      </div>

      {/* Main Detection Workplace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Media Feed & Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-navy-900/80 border border-slate-800 glow-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-cyan-400" />
                Input Source & Annotated Preview
              </h3>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleLoadSample}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-600/30 flex items-center gap-1.5 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Load Sample Scene
                </button>

                <button
                  onClick={toggleWebcam}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    isWebcamActive 
                      ? 'bg-red-600/20 text-red-300 border border-red-500/40' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  {isWebcamActive ? 'Stop Webcam' : 'Use Webcam'}
                </button>
              </div>
            </div>

            {/* Media Screen Area */}
            <div className="relative w-full aspect-video rounded-xl bg-navy-950 border border-slate-800 overflow-hidden flex items-center justify-center">
              {isLoading && (
                <div className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                  <span className="text-xs font-mono text-cyan-300">Processing Neural Inference...</span>
                </div>
              )}

              {/* Webcam Video (hidden or active) */}
              <video
                ref={videoRef}
                playsInline
                muted
                className={`w-full h-full object-contain ${isWebcamActive && !annotatedResult ? 'block' : 'hidden'}`}
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Annotated Image display */}
              {annotatedResult?.annotated_image ? (
                <img
                  src={annotatedResult.annotated_image}
                  alt="Detected traffic"
                  className="w-full h-full object-contain"
                />
              ) : previewUrl && !isWebcamActive ? (
                <img
                  src={previewUrl}
                  alt="Uploaded traffic"
                  className="w-full h-full object-contain opacity-80"
                />
              ) : !isWebcamActive ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-xl m-6 transition group"
                >
                  <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="font-semibold text-white text-sm">Upload Traffic Video / Image</div>
                  <div className="text-xs text-slate-400 mt-1">Supports MP4, JPG, PNG, WEBM • Up to 50MB</div>
                  <div className="mt-3 px-3 py-1 rounded bg-slate-800 text-[11px] text-slate-300">
                    Or click "Load Sample Scene" above
                  </div>
                </div>
              ) : null}
            </div>

            {/* Upload Button bar */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="hover:text-cyan-400 flex items-center gap-1.5 transition"
              >
                <Upload className="w-3.5 h-3.5" />
                Choose local traffic file...
              </button>
              {selectedFile && (
                <span className="font-mono text-cyan-300 truncate max-w-xs">{selectedFile.name}</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Telemetry & Classification Results (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-navy-900/80 border border-slate-800 glow-card space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Frame Analytics & Density HUD
            </h3>

            {/* Total Vehicles Card */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-navy-950 border border-slate-800/80">
                <div className="text-xs text-slate-400">Total Vehicles Detected</div>
                <div className="text-3xl font-extrabold font-mono text-cyan-300 mt-1">
                  {annotatedResult ? annotatedResult.total_vehicles : '--'}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Real-time object count</div>
              </div>

              <div className="p-4 rounded-xl bg-navy-950 border border-slate-800/80">
                <div className="text-xs text-slate-400">Traffic Density Level</div>
                <div className="mt-1">
                  <span className={`inline-block px-2.5 py-1 rounded text-sm font-extrabold font-mono border ${
                    density === 'LOW'
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      : density === 'MEDIUM'
                      ? 'bg-yellow-950 text-yellow-400 border-yellow-800'
                      : density === 'HIGH'
                      ? 'bg-amber-950 text-amber-400 border-amber-800'
                      : 'bg-red-950 text-red-400 border-red-800'
                  }`}>
                    {density}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-mono">
                  Congestion: {annotatedResult ? Math.round(annotatedResult.congestion_index * 100) : 0}%
                </div>
              </div>
            </div>

            {/* Vehicle Classification Breakdown List */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-semibold text-slate-300">Vehicle Classification Breakdown</div>
              
              <div className="space-y-1.5 font-mono text-xs">
                {/* Cars */}
                <div className="p-2.5 rounded-lg bg-navy-950/70 border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-200">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Passenger Cars</span>
                  </div>
                  <span className="font-bold text-white px-2 py-0.5 rounded bg-slate-800">
                    {counts.car || 0}
                  </span>
                </div>

                {/* Buses */}
                <div className="p-2.5 rounded-lg bg-navy-950/70 border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-200">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>Public Transit Buses</span>
                  </div>
                  <span className="font-bold text-white px-2 py-0.5 rounded bg-slate-800">
                    {counts.bus || 0}
                  </span>
                </div>

                {/* Trucks */}
                <div className="p-2.5 rounded-lg bg-navy-950/70 border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-200">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span>Heavy Trucks / Freight</span>
                  </div>
                  <span className="font-bold text-white px-2 py-0.5 rounded bg-slate-800">
                    {counts.truck || 0}
                  </span>
                </div>

                {/* Motorcycles */}
                <div className="p-2.5 rounded-lg bg-navy-950/70 border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-200">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    <span>Motorcycles / Scooters</span>
                  </div>
                  <span className="font-bold text-white px-2 py-0.5 rounded bg-slate-800">
                    {counts.motorcycle || 0}
                  </span>
                </div>

                {/* Bicycles */}
                <div className="p-2.5 rounded-lg bg-navy-950/70 border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-200">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                    <span>Bicycles</span>
                  </div>
                  <span className="font-bold text-white px-2 py-0.5 rounded bg-slate-800">
                    {counts.bicycle || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Model Architecture & Fallback Assurance Notice */}
            <div className="p-3.5 rounded-xl bg-navy-950/90 border border-cyan-500/20 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-cyan-400 font-semibold font-mono">
                <ShieldCheck className="w-4 h-4" />
                <span>Detection Engine Diagnostics</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Operating with <strong className="text-white">{modelInfo?.engine_type || 'YOLOv8 Nano'}</strong>. 
                Average confidence: <strong className="text-emerald-400">{conf}%</strong>. If weights are offline,
                the automated Computer Vision Fallback ensures continuous zero-crash operation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
