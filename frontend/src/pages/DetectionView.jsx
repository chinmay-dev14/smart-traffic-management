import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { 
  ScanLine, 
  Upload, 
  Camera, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw, 
  Cpu, 
  Car, 
  Layers, 
  ShieldCheck 
} from 'lucide-react';

export default function DetectionView() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [annotatedResult, setAnnotatedResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [modelInfo, setModelInfo] = useState(null);

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
      ctx.fillRect(280, 125, 130, 20);
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
      <div className="p-6 rounded-3xl bg-navy-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ScanLine className="w-4 h-4 text-cyan-400" />
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-cyan-400">
              Computer Vision & Object Localization Engine
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">YOLOv8 Real-Time Vehicle Detection</h2>
          <p className="text-xs text-slate-400">
            Perception pipeline as formulated in IJSRET 2025: Video Frame Extraction → Preprocessing → YOLO CNN → Vehicle Counting.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLoadSample}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-600 to-emerald-600 text-white shadow-lg shadow-cyan-600/30 hover:from-cyan-500 hover:to-emerald-500 flex items-center gap-2 transition"
          >
            <Sparkles className="w-4 h-4" />
            1-Click Sample Scene
          </button>

          <button
            onClick={toggleWebcam}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              isWebcamActive 
                ? 'bg-red-600/30 text-red-300 border border-red-500' 
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            <Camera className="w-4 h-4" />
            {isWebcamActive ? 'Stop Webcam' : 'Use Webcam'}
          </button>
        </div>
      </div>

      {/* Main Grid: Screen & Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Screen (7 cols) */}
        <div className="lg:col-span-7 bg-navy-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Annotated Camera Stream Preview</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-navy-950 text-cyan-300 border border-slate-800">
              {modelInfo?.engine_type || 'YOLOv8 Active'}
            </span>
          </div>

          <div className="relative w-full aspect-video rounded-2xl bg-[#090d16] border border-slate-800 overflow-hidden flex items-center justify-center">
            {isLoading && (
              <div className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                <span className="text-xs font-mono text-cyan-300">Processing Neural Inference...</span>
              </div>
            )}

            <video
              ref={videoRef}
              playsInline
              muted
              className={`w-full h-full object-contain ${isWebcamActive && !annotatedResult ? 'block' : 'hidden'}`}
            />
            <canvas ref={canvasRef} className="hidden" />

            {annotatedResult?.annotated_image ? (
              <img
                src={annotatedResult.annotated_image}
                alt="Detected vehicles"
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
                className="cursor-pointer flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-2xl m-6 transition group"
              >
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="font-bold text-white text-sm">Upload Traffic Video / Image</div>
                <div className="text-xs text-slate-400 mt-1">Click to browse or press "1-Click Sample Scene" above</div>
              </div>
            ) : null}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Right Column: Classification Results (5 cols) */}
        <div className="lg:col-span-5 bg-navy-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Detection Counts & Density Telemetry</span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800">
              <div className="text-xs text-slate-400">Total Vehicles</div>
              <div className="text-3xl font-extrabold font-mono text-cyan-300 mt-1">
                {annotatedResult ? annotatedResult.total_vehicles : '--'}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-1">Confidence: {conf}%</div>
            </div>

            <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800">
              <div className="text-xs text-slate-400">Traffic Density Tier</div>
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
              <div className="text-[10px] text-slate-400 font-mono mt-1">
                Congestion Index: {annotatedResult ? Math.round(annotatedResult.congestion_index * 100) : 0}%
              </div>
            </div>
          </div>

          {/* Breakdown List */}
          <div className="space-y-2 pt-1">
            <div className="text-xs font-semibold text-slate-300">Vehicle Classification Breakdown:</div>
            <div className="space-y-1.5 font-mono text-xs">
              <div className="p-2.5 rounded-xl bg-navy-950 border border-slate-800/80 flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Passenger Cars
                </span>
                <span className="font-bold text-white px-2 py-0.5 rounded bg-slate-800">{counts.car || 0}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-navy-950 border border-slate-800/80 flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Public Transit Buses
                </span>
                <span className="font-bold text-white px-2 py-0.5 rounded bg-slate-800">{counts.bus || 0}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-navy-950 border border-slate-800/80 flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Heavy Trucks
                </span>
                <span className="font-bold text-white px-2 py-0.5 rounded bg-slate-800">{counts.truck || 0}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-navy-950 border border-slate-800/80 flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Motorcycles & Bicycles
                </span>
                <span className="font-bold text-white px-2 py-0.5 rounded bg-slate-800">
                  {(counts.motorcycle || 0) + (counts.bicycle || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
