import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  Cpu, 
  Brain, 
  TrendingUp, 
  Activity, 
  Siren, 
  Layers,
  ArrowRight,
  Code2,
  Users,
  ShieldAlert,
  Play,
  Award
} from 'lucide-react';

export default function PresentationGuideModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('prabhav');

  if (!isOpen) return null;

  const teamMembers = [
    { id: 'prabhav', name: '1. Prabhav', role: 'HI Theory & Problem Framing', criteria: 'Problem Definition (10m) + HI Theory (15m)', slides: 'Slides 1, 2, 11, 12, 13' },
    { id: 'ishit', name: '2. Ishit', role: 'Dev & Systems Architecture', criteria: 'Architecture & Methodology (15m)', slides: 'Slides 3, 4, 5, 6' },
    { id: 'sankalp', name: '3. Sankalp', role: 'Machine Learning & Models', criteria: 'Lit Review (10m) + AI Models (15m)', slides: 'Slides 7, 8, 9, 10' },
    { id: 'vaibhav', name: '4. Vaibhav', role: 'Live Interactive Web Demo', criteria: 'Working Prototype (15m) + Interactivity', slides: 'Live Web App (localhost:5173)' },
    { id: 'chinmay', name: '5. Chinmay', role: 'Feasibility, Results & Ethics', criteria: 'Experimental Results (15m) + Ethics (5m)', slides: 'Slides 14, 15, 16, 17, 18' },
    { id: 'viva', name: 'Viva Q&A', role: 'Instructor Defense Cheatsheet', criteria: 'Viva Examination (10m)', slides: 'All Slides & Code' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-navy-900 border border-cyan-500/40 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-navy-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                SATMS 5-Member Team Presentation Script
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/50 text-cyan-300">
                  100% Evaluation Rubric
                </span>
              </h3>
              <p className="text-xs text-slate-400">Tailored for Human Intelligence course evaluation & presentation defense</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Member Tabs */}
        <div className="flex border-b border-slate-800 bg-navy-950/80 overflow-x-auto px-4 gap-1">
          {teamMembers.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveTab(m.id)}
              className={`py-3 px-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition flex items-center gap-2 ${
                activeTab === m.id
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <span>{m.name}</span>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300 leading-relaxed font-sans">
          {/* TAB 1: PRABHAV */}
          {activeTab === 'prabhav' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">Speaker 1: Prabhav</span>
                  <div className="text-xs text-white font-medium">Domain: Human Intelligence Theory & Problem Framing</div>
                </div>
                <div className="text-[11px] bg-slate-900 px-3 py-1 rounded-lg border border-slate-700 text-slate-300">
                  <strong>Rubric Marks:</strong> Problem Definition (10m) + HI Theory (15m) | <strong>Slides:</strong> 1, 2, 11, 12, 13
                </div>
              </div>

              <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-3">
                <div className="font-bold text-white text-sm flex items-center gap-2 text-cyan-300">
                  <Brain className="w-4 h-4" />
                  <span>Word-for-Word Speaking Script</span>
                </div>
                <div className="space-y-3 text-slate-200 text-xs italic bg-slate-900/60 p-4 rounded-lg border border-slate-800/80 leading-relaxed">
                  <p>
                    "Good morning respected instructor and classmates. I am <strong>Prabhav</strong>, and on behalf of our team, I am introducing the <strong>Smart Autonomous Traffic Management System (SATMS)</strong>.
                  </p>
                  <p>
                    <em>[Pointing to Slides 1 & 2]</em> Metropolitan cities lose billions annually due to a core flaw: <strong>traditional traffic signals are blind to the moment</strong>. Fixed-timer lights treat an empty lane and a packed corridor identically, causing needless idling, carbon emissions, and severe delays for ambulances.
                  </p>
                  <p>
                    <em>[Pointing to Slides 11 & 12]</em> In our Human Intelligence course, we study how biological perception transforms raw sensation into organized meaning. When a human traffic cop directs an intersection, their eyes gather visual inputs, their brain recognizes patterns of crowding, interprets the urgency, and decides which lane to clear.
                  </p>
                  <p>
                    <em>[Pointing to Slide 13]</em> SATMS computationally models this cognitive perception chain: <strong>Visual Perception</strong> via cameras, <strong>Pattern Recognition</strong> via YOLOv8 vehicle categorization, <strong>Situation Interpretation</strong> through congestion indexing, and <strong>Autonomous Decision & Action</strong> via adaptive signal controllers.
                  </p>
                  <p>
                    Crucially, <strong>we do not claim that our model possesses biological consciousness</strong>. Instead, we mirror functional visual-perception processing, backed by empirical engineering optimization. To explain how this cognitive loop is implemented in code, I pass the floor to <strong>Ishit</strong>."
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ISHIT */}
          {activeTab === 'ishit' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/40 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">Speaker 2: Ishit</span>
                  <div className="text-xs text-white font-medium">Domain: Systems Architecture, Backend & Data Pipelines</div>
                </div>
                <div className="text-[11px] bg-slate-900 px-3 py-1 rounded-lg border border-slate-700 text-slate-300">
                  <strong>Rubric Marks:</strong> Architecture & Methodology (15m) | <strong>Slides:</strong> 3, 4, 5, 6
                </div>
              </div>

              <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-3">
                <div className="font-bold text-white text-sm flex items-center gap-2 text-purple-300">
                  <Code2 className="w-4 h-4" />
                  <span>Word-for-Word Speaking Script</span>
                </div>
                <div className="space-y-3 text-slate-200 text-xs italic bg-slate-900/60 p-4 rounded-lg border border-slate-800/80 leading-relaxed">
                  <p>
                    "Thank you, Prabhav. Respected professor, I am <strong>Ishit</strong>, and I will explain how we engineered this into a modular, production-ready full-stack system.
                  </p>
                  <p>
                    <em>[Pointing to Slides 3 & 4]</em> SATMS operates as an autonomous closed feedback loop: camera feeds are ingested, density is computed, predictive ML forecasts near-term arrivals, our decision core updates phase allocations, and emergency overrides can safely interrupt at any millisecond.
                  </p>
                  <p>
                    <em>[Pointing to Slides 5 & 6]</em> We designed a <strong>Three-Layer Decoupled Architecture</strong>:
                    <br />• <strong>Frontend:</strong> Built with React 18, Vite, and Tailwind CSS. Rendering is accelerated using SVG vectors and Lucide icons, while Recharts handles real-time telemetry graphs.
                    <br />• <strong>Backend Core:</strong> Powered by Python 3.12 and FastAPI on an asynchronous Uvicorn event loop. Rather than wasteful HTTP polling, we maintain a persistent full-duplex <strong>WebSocket stream at 1 Hz with under 50ms latency</strong>.
                    <br />• <strong>Data & Intelligence:</strong> SQLite stores historical timestamps, signal logs, and emergency events, while parallel Python threads handle discrete-event simulation and computer vision inference.
                  </p>
                  <p>
                    A key resilience feature is our <strong>zero-crash fallback pattern</strong>: if GPU weights cannot be accessed, an OpenCV background-subtraction detector engages automatically. Now, <strong>Sankalp</strong> will break down our machine learning algorithms."
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SANKALP */}
          {activeTab === 'sankalp' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Speaker 3: Sankalp</span>
                  <div className="text-xs text-white font-medium">Domain: Computer Vision, ML Forecasting & Adaptive Decision Core</div>
                </div>
                <div className="text-[11px] bg-slate-900 px-3 py-1 rounded-lg border border-slate-700 text-slate-300">
                  <strong>Rubric Marks:</strong> Literature Review (10m) + AI Models (15m) | <strong>Slides:</strong> 7, 8, 9, 10
                </div>
              </div>

              <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-3">
                <div className="font-bold text-white text-sm flex items-center gap-2 text-emerald-300">
                  <Cpu className="w-4 h-4" />
                  <span>Word-for-Word Speaking Script</span>
                </div>
                <div className="space-y-3 text-slate-200 text-xs italic bg-slate-900/60 p-4 rounded-lg border border-slate-800/80 leading-relaxed">
                  <p>
                    "Thank you, Ishit. I am <strong>Sankalp</strong>, and I will present the AI algorithms and mathematical formulations powering SATMS.
                  </p>
                  <p>
                    <em>[Pointing to Slide 7]</em> Unlike traditional inductive loops that merely count vehicle axles, our <strong>YOLOv8</strong> vision detector identifies spatial bounding boxes and categorizes traffic into 5 classes: passenger cars, buses, heavy trucks, motorcycles, and bicycles at 45+ FPS.
                  </p>
                  <p>
                    <em>[Pointing to Slide 8]</em> For volume forecasting, we trained a time-series model incorporating cyclical time harmonics (sine/cosine representations of hour and weekday). This forecasts traffic volume 5, 10, and 15 minutes ahead, warning the system of impending bottlenecks.
                  </p>
                  <p>
                    For signal optimization, we implement <strong>Webster’s Minimum-Delay Cycle Formulation</strong> combined with a multi-factor demand utility function:
                    <br />
                    <code>Demand(d) = 0.40·Q(d) + 0.35·(Delay/30)^1.3 + 0.15·VehicleMix + 0.10·PedestrianUrgency</code>
                  </p>
                  <p>
                    Notice the non-linear exponent of 1.3: this mathematically ensures that low-traffic streets never suffer starvation. In Slide 9 and 10, we also integrate <strong>NetworkX and Dijkstra’s algorithm</strong> for congestion-penalized routing, and deterministic 3-second yellow + all-red clearance intervals for emergency vehicles.
                  </p>
                  <p>
                    To see all of this working in real-time, <strong>Vaibhav</strong> will now demonstrate our live system."
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VAIBHAV */}
          {activeTab === 'vaibhav' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Speaker 4: Vaibhav</span>
                  <div className="text-xs text-white font-medium">Domain: Live Interactive System & Web Demonstration</div>
                </div>
                <div className="text-[11px] bg-slate-900 px-3 py-1 rounded-lg border border-slate-700 text-slate-300">
                  <strong>Rubric Marks:</strong> Working Prototype Verification (15m) + Viva Live Defense | <strong>Platform:</strong> Live Web App
                </div>
              </div>

              <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-3">
                <div className="font-bold text-white text-sm flex items-center gap-2 text-amber-300">
                  <Play className="w-4 h-4" />
                  <span>Live Demo Walkthrough & Actions</span>
                </div>
                <div className="space-y-3 text-slate-200 text-xs italic bg-slate-900/60 p-4 rounded-lg border border-slate-800/80 leading-relaxed">
                  <p>
                    "Thank you, Sankalp. Respected instructor, I am <strong>Vaibhav</strong>, and I will now drive the live demonstration of SATMS running right now on our local machine.
                  </p>
                  <p>
                    <strong>Action 1 (Show Simulator):</strong> 'On the main screen, you can see our 4-way intersection simulation. The queues, remaining timers, and vehicle counters are live WebSocket packets calculated by the backend engine.'
                  </p>
                  <p>
                    <strong>Action 2 (Toggle to Traditional Mode):</strong> 'Notice the mode switch button. When I switch to <em>Traditional Mode</em>, the system locks into rigid 25-second cycles. Notice how the congested North/South queue rapidly accumulates and average pass delay increases.'
                  </p>
                  <p>
                    <strong>Action 3 (Toggle to AI Adaptive):</strong> 'Now I switch back to <em>AI Adaptive Mode</em>. Watch the Webster controller dynamically calculate an extended green phase for the congested approach, rapidly flushing out the backlog.'
                  </p>
                  <p>
                    <strong>Action 4 (Test Speed Multiplier):</strong> 'We can accelerate the simulation clock to 2X, 3X, or 5X to observe long-term queue stabilization without UI frame dropping.'
                  </p>
                  <p>
                    <strong>Action 5 (Emergency Corridor):</strong> 'Next, I click <em>Ambulance Emergency Corridor (West)</em>. Notice the safety interlock: active cross-signals turn Yellow for 3 seconds, enter an All-Red clearance, and open a conflict-free Green corridor. Once the ambulance passes, normal adaptive equilibrium resumes.'
                  </p>
                  <p>
                    I now hand over to <strong>Chinmay</strong> to discuss our empirical findings, feasibility, and ethics."
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CHINMAY */}
          {activeTab === 'chinmay' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/40 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">Speaker 5: Chinmay</span>
                  <div className="text-xs text-white font-medium">Domain: Feasibility, Experimental Evaluation & Ethical Reflections</div>
                </div>
                <div className="text-[11px] bg-slate-900 px-3 py-1 rounded-lg border border-slate-700 text-slate-300">
                  <strong>Rubric Marks:</strong> Experimental Results (15m) + Ethics & Limitations (5m) | <strong>Slides:</strong> 14, 15, 16, 17, 18
                </div>
              </div>

              <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-3">
                <div className="font-bold text-white text-sm flex items-center gap-2 text-blue-300">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Word-for-Word Speaking Script</span>
                </div>
                <div className="space-y-3 text-slate-200 text-xs italic bg-slate-900/60 p-4 rounded-lg border border-slate-800/80 leading-relaxed">
                  <p>
                    "Thank you, Vaibhav. Respected professor, I am <strong>Chinmay</strong>, and I will conclude with our experimental validation, engineering feasibility, and ethical reflections.
                  </p>
                  <p>
                    <em>[Pointing to Slide 16: Experimental Results]</em> Evaluating our AI adaptive controller against the fixed-time baseline under identical vehicle arrival rates yielded significant improvements:
                    <br />• <strong>Average Travel Time:</strong> Decreased from 38.0 to 22.4 minutes—a <strong>41.1% gain</strong>.
                    <br />• <strong>Queue Length:</strong> Slashed from 42 to 18 vehicles—a <strong>57.1% reduction</strong>.
                    <br />• <strong>Intersection Delay:</strong> Cut from 62.0 seconds down to 27.5 seconds—a <strong>55.6% delay reduction</strong>.
                    <br />• <strong>Corridor Throughput:</strong> Increased by <strong>+38.1%</strong>, driving an estimated <strong>30.6% drop in fuel consumption and CO₂ emissions</strong>.
                    <br />• <strong>Emergency Transit Delay:</strong> Reduced from 8.4 minutes to 4.2 minutes.
                  </p>
                  <p>
                    <em>[Pointing to Slides 14 & 15: Feasibility & Ethics]</em> In terms of **Feasibility**, SATMS runs over standard IP-based municipal CCTV feeds, avoiding expensive road tear-ups.
                  </p>
                  <p>
                    However, adhering to the **Ethics and Overclaims** criteria of this course:
                    <br />1. We clearly acknowledge these results are <strong>simulation-derived hypotheses</strong>. Real-world urban environments present severe weather (fog, night glare) and occlusions that require sensor fusion.
                    <br />2. We enforce <strong>hardcoded safety invariants</strong>: the neural network is never given unconstrained authority to bypass clearance phases, and human supervisors retain manual kill-switch control.
                  </p>
                  <p>
                    In closing, SATMS proves that biologically-inspired perception and pattern recognition can elevate dumb traffic lights into a responsive, carbon-reducing city nervous system. Thank you, and our team is ready for your questions!"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: VIVA CHEATSHEET */}
          {activeTab === 'viva' && (
            <div className="space-y-3">
              <div className="font-bold text-white text-sm flex items-center gap-2 text-cyan-300">
                <Award className="w-4 h-4" />
                <span>Anticipated Instructor Viva Questions & Golden Answers</span>
              </div>
              
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 space-y-1">
                  <div className="font-semibold text-cyan-300">
                    Q1 (For Prabhav): "Why did you choose Perception & Pattern Recognition over P-FIT?"
                  </div>
                  <div className="text-slate-300 text-xs">
                    <strong>Answer:</strong> "While P-FIT describes whole-brain distributed parieto-frontal reasoning across abstract cognitive tasks, traffic management at its core is a real-time sensory-motor loop. Perception and pattern recognition directly correspond to reading dynamic visual scenes, categorizing road actors, and resolving immediate spatial crowding before higher-order planning."
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 space-y-1">
                  <div className="font-semibold text-purple-300">
                    Q2 (For Ishit): "Why WebSockets over REST polling? How does it scale?"
                  </div>
                  <div className="text-slate-300 text-xs">
                    <strong>Answer:</strong> "HTTP polling produces redundant header overhead and latency spikes at 1 Hz frequencies. Our WebSocket hub operates over an asynchronous Uvicorn event loop with non-blocking JSON broadcast, achieving sub-50ms latency across multiple monitoring clients simultaneously."
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 space-y-1">
                  <div className="font-semibold text-emerald-300">
                    Q3 (For Sankalp): "Why combine YOLOv8 with Webster's formula rather than pure Deep RL?"
                  </div>
                  <div className="text-slate-300 text-xs">
                    <strong>Answer:</strong> "Pure deep reinforcement learning agents are notorious black boxes prone to edge-case failures and reward hacking in critical infrastructure. By coupling deep learning for perception with Webster's classical traffic engineering equation and finite state machines, we get the best of both worlds: high-accuracy visual awareness with mathematically provable safety and zero deadlock."
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 space-y-1">
                  <div className="font-semibold text-amber-300">
                    Q4 (For Vaibhav): "How does your simulator guarantee that green corridors don't cause crashes?"
                  </div>
                  <div className="text-slate-300 text-xs">
                    <strong>Answer:</strong> "The state machine enforces atomic transitions. An emergency call cannot abruptly flash green. It forces an immediate 3-second Yellow phase on active lanes, followed by an all-direction Red clearance interval of 2 seconds before the emergency green activates."
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 space-y-1">
                  <div className="font-semibold text-blue-300">
                    Q5 (For Chinmay): "How did you derive the fuel and emission savings figures?"
                  </div>
                  <div className="text-slate-300 text-xs">
                    <strong>Answer:</strong> "We applied standard EPA/CARLA idle emission parameters where an idling passenger car consumes ~1.2 L/hr and heavy diesel vehicles consume up to 2.8 L/hr. By cutting average vehicle waiting delay from 62.0s down to 27.5s, the cumulative idle reduction yielded a 30.6% reduction in both fuel and emissions."
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-navy-950 flex items-center justify-between text-xs text-slate-400">
          <div>Team: Prabhav • Ishit • Sankalp • Vaibhav • Chinmay</div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition shadow-lg shadow-cyan-600/30"
          >
            Close & Start Presentation
          </button>
        </div>
      </div>
    </div>
  );
}
