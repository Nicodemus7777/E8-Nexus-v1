
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Hexagon, X, Grid3X3, Moon, Sun, Zap, Sliders, Volume2, VolumeX, 
  Share2, Telescope, FileCode, Thermometer, Network, ChevronRight, 
  ChevronLeft, Play, Pause, Info, Sparkles, Binary, Settings2,
  MessageSquare, Layout, Activity
} from 'lucide-react';
import Visualizer from './components/Visualizer';
import ChatAssistant from './components/ChatAssistant';
import ProjectionSandbox from './components/ProjectionSandbox';
import DiscoveryFeed from './components/DiscoveryFeed';
import LagrangianSlate from './components/LagrangianSlate';
import MeraSlate from './components/MeraSlate';
import { 
  Node2D, SUBGROUPS, Subgroup, LIE_GROUPS, LieGroupType, AppTheme, 
  Vector8D, ProjectionMatrix, TopologicalDefect, DefectType, 
  EntangledPair, Discovery, CosmicState, DecayInteraction, MeraState 
} from './types';
import { getLieGroupRoots, findDecayPair, getPetrieBasis } from './utils/e8';
import { audioEngine } from './utils/audio';

type ActiveTab = 'projection' | 'physics' | 'mera' | 'discoveries';

const App: React.FC = () => {
  // Global View State
  const [activeTab, setActiveTab] = useState<ActiveTab>('projection');
  const [isLabOpen, setIsLabOpen] = useState(true);
  const [isIntelOpen, setIsIntelOpen] = useState(false);
  const [theme, setTheme] = useState<AppTheme>('primal');
  
  // Motion Controls - Default to OFF to prevent headaches
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [rotationSpeed, setRotationSpeed] = useState(0.0003);
  
  // Physics State
  const [activeGroupType, setActiveGroupType] = useState<LieGroupType>('E8');
  const [activeSubgroup, setActiveSubgroup] = useState<Subgroup | null>(null);
  const [cosmicTemp, setCosmicTemp] = useState(0); 
  const [wickRotation, setWickRotation] = useState(0);
  const [meraState, setMeraState] = useState<MeraState>({
    isActive: false,
    renormalizationScale: 0.4,
    bulkCurvature: 0.8
  });

  // Visualization State
  const [selectedNode, setSelectedNode] = useState<Node2D | null>(null);
  const [hoveredNode, setHoveredNode] = useState<Node2D | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  
  // Projection State
  const defaultBasis = useMemo(() => getPetrieBasis(activeGroupType === 'G2' ? 2 : activeGroupType === 'F4' ? 4 : 8), [activeGroupType]);
  const [customMatrix, setCustomMatrix] = useState<ProjectionMatrix>({
    x: defaultBasis[0],
    y: defaultBasis[1]
  });

  // Reset matrix when group changes if it hasn't been customized heavily
  useEffect(() => {
    const basis = getPetrieBasis(activeGroupType === 'G2' ? 2 : activeGroupType === 'F4' ? 4 : 8);
    setCustomMatrix({ x: basis[0], y: basis[1] });
  }, [activeGroupType]);

  const cosmicInfo = useMemo((): CosmicState => {
    if (cosmicTemp > 0.9) return { temperature: cosmicTemp, era: "Planck Epoch", unification: 1 };
    if (cosmicTemp > 0.7) return { temperature: cosmicTemp, era: "GUT Era", unification: 0.8 };
    if (cosmicTemp > 0.4) return { temperature: cosmicTemp, era: "Electroweak", unification: 0.5 };
    if (cosmicTemp > 0.2) return { temperature: cosmicTemp, era: "Q-Plasma", unification: 0.2 };
    return { temperature: cosmicTemp, era: "Current Era", unification: 0 };
  }, [cosmicTemp]);

  const toggleTheme = () => setTheme(prev => prev === 'primal' ? 'dual' : 'primal');
  const toggleAudio = () => {
    const next = !isAudioEnabled;
    setIsAudioEnabled(next);
    audioEngine.toggle(next);
  };

  const navClass = theme === 'primal' ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200';
  const sidebarBg = theme === 'primal' ? 'bg-slate-900/40' : 'bg-white/40';

  return (
    <div className={`flex h-screen w-screen overflow-hidden transition-colors duration-500 font-sans ${theme === 'primal' ? 'bg-slate-950 text-slate-200' : 'bg-[#fcfaf7] text-slate-800'}`}>
      
      {/* LEFT: LATTICE LAB (Unified Controls) */}
      <aside className={`relative h-full flex transition-all duration-500 z-30 ${isLabOpen ? 'w-80 md:w-96' : 'w-0'}`}>
        <div className={`w-full h-full border-r flex flex-col overflow-hidden backdrop-blur-xl ${navClass} ${sidebarBg}`}>
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg">
                <Settings2 size={18} className="text-white" />
              </div>
              <h2 className="font-bold tracking-tight">Lattice Lab</h2>
            </div>
            <button onClick={() => setIsLabOpen(false)} className="lg:hidden p-1 hover:bg-white/10 rounded">
              <ChevronLeft size={20} />
            </button>
          </div>

          {/* Tab Navigation - Intuitive and clear */}
          <div className="flex p-2 gap-1 border-b border-white/5 bg-black/10">
            <button 
              onClick={() => setActiveTab('projection')} 
              className={`flex-1 flex flex-col items-center py-2 rounded-lg transition-all ${activeTab === 'projection' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
            >
              <Layout size={16} className="mb-1" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Map</span>
            </button>
            <button 
              onClick={() => setActiveTab('physics')} 
              className={`flex-1 flex flex-col items-center py-2 rounded-lg transition-all ${activeTab === 'physics' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
            >
              <Zap size={16} className="mb-1" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Forces</span>
            </button>
            <button 
              onClick={() => setActiveTab('mera')} 
              className={`flex-1 flex flex-col items-center py-2 rounded-lg transition-all ${activeTab === 'mera' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
            >
              <Network size={16} className="mb-1" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Topo</span>
            </button>
            <button 
              onClick={() => setActiveTab('discoveries')} 
              className={`flex-1 flex flex-col items-center py-2 rounded-lg transition-all ${activeTab === 'discoveries' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
            >
              <Telescope size={16} className="mb-1" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Vault</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {activeTab === 'projection' && (
              <ProjectionSandbox 
                matrix={customMatrix} 
                onChange={setCustomMatrix} 
                theme={theme} 
                onReset={() => {
                  const basis = getPetrieBasis(activeGroupType === 'G2' ? 2 : activeGroupType === 'F4' ? 4 : 8);
                  setCustomMatrix({ x: basis[0], y: basis[1] });
                }} 
              />
            )}
            {activeTab === 'physics' && (
              <div className="p-6 space-y-8 animate-in fade-in duration-300">
                <section>
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block mb-4">Symmetry Group</label>
                  <div className="grid grid-cols-3 gap-2">
                    {LIE_GROUPS.map(g => (
                      <button 
                        key={g.id}
                        onClick={() => setActiveGroupType(g.id)}
                        className={`py-2 rounded-lg text-xs font-bold border transition-all ${activeGroupType === g.id ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                      >
                        {g.name}
                      </button>
                    ))}
                  </div>
                </section>
                <section>
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block mb-4">Lagrangian Coupling</label>
                  <LagrangianSlate activeSubgroup={activeSubgroup} hoveredNode={hoveredNode} theme={theme} />
                </section>
              </div>
            )}
            {activeTab === 'mera' && (
              <MeraSlate state={meraState} setState={setMeraState} theme={theme} />
            )}
            {activeTab === 'discoveries' && (
              <DiscoveryFeed onJump={(d) => setCustomMatrix(d.matrix)} theme={theme} />
            )}
          </div>
        </div>

        {/* Lab Toggle Tab */}
        {!isLabOpen && (
          <button 
            onClick={() => setIsLabOpen(true)}
            className={`absolute left-0 top-1/2 translate-x-16 -translate-y-1/2 w-8 h-24 flex flex-col items-center justify-center rounded-r-xl border shadow-xl transition-all z-40 ${navClass} ${theme === 'primal' ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}
          >
            <ChevronRight size={16} />
            <span className="[writing-mode:vertical-lr] text-[8px] font-bold uppercase tracking-widest mt-2">Lab</span>
          </button>
        )}
      </aside>

      {/* CENTER: EXPLORATION STAGE */}
      <main className="flex-1 relative flex flex-col min-w-0">
        <header className="absolute top-0 left-0 w-full p-8 z-10 pointer-events-none flex justify-between items-start">
          <div className="max-w-xl">
            <h1 className="text-3xl font-black tracking-tighter transition-colors duration-500 uppercase italic">
              {activeGroupType} <span className="text-blue-500 not-italic">Nexus</span>
            </h1>
            <p className="text-[10px] font-mono uppercase tracking-[0.4em] opacity-40 mt-1">Unified Symmetry Field</p>
          </div>
          
          <div className="pointer-events-auto flex items-center gap-2">
             <button onClick={toggleAudio} className={`p-3 rounded-xl transition-all ${isAudioEnabled ? 'bg-blue-500 text-white shadow-lg' : 'bg-slate-800/50 text-slate-400 hover:text-white border border-white/5'}`}>
                {isAudioEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
             </button>
             <button onClick={toggleTheme} className={`p-3 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white transition-all border border-white/5`}>
                {theme === 'primal' ? <Sun size={18} /> : <Moon size={18} />}
             </button>
             <button 
              onClick={() => setIsIntelOpen(!isIntelOpen)}
              className={`p-3 rounded-xl transition-all ${isIntelOpen ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-800/50 text-slate-400 border border-white/5'}`}
             >
                <MessageSquare size={18} />
             </button>
          </div>
        </header>

        <div className="flex-1 relative">
          <Visualizer 
            onNodeSelect={setSelectedNode} 
            activeSubgroup={activeSubgroup} 
            groupType={activeGroupType} 
            theme={theme}
            customMatrix={customMatrix}
            isAudioEnabled={isAudioEnabled}
            isAutoRotating={isAutoRotating}
            rotationSpeed={rotationSpeed}
            cosmicState={cosmicInfo}
            meraState={meraState}
            onNodeHover={setHoveredNode}
          />

          {/* Node Detail HUD */}
          {selectedNode && (
            <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 p-6 backdrop-blur-2xl border rounded-3xl shadow-2xl z-20 animate-in slide-in-from-bottom-8 duration-500 ${navClass} w-[90%] max-w-lg`}>
               <div className="flex justify-between items-center mb-4 gap-12">
                  <div>
                    <span className="text-[9px] font-mono text-blue-500 uppercase tracking-widest">Quantum Root Identified</span>
                    <h2 className="text-xl font-bold">Vector #{selectedNode.id}</h2>
                  </div>
                  <button onClick={() => setSelectedNode(null)} className="p-2 rounded-full hover:bg-white/10 text-slate-500"><X size={18} /></button>
               </div>
               <div className="grid grid-cols-4 md:grid-cols-8 gap-1">
                  {selectedNode.original.coords.map((c, i) => (
                    <div key={i} className="flex flex-col items-center p-2 rounded-lg bg-black/20 border border-white/5">
                      <span className="text-[8px] text-slate-500 font-mono mb-1">D{i+1}</span>
                      <span className="text-xs font-bold text-blue-300">{c}</span>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </div>

        {/* BOTTOM: UNIVERSE STATE BAR */}
        <footer className={`h-24 md:h-20 border-t flex flex-col md:flex-row items-center px-8 z-30 backdrop-blur-xl ${navClass} ${sidebarBg}`}>
           <div className="flex items-center gap-6 md:gap-12 w-full h-full">
              {/* Motion Controls - Intuitive Play/Pause */}
              <div className="flex items-center gap-4 border-r border-white/5 pr-8">
                 <button 
                  onClick={() => setIsAutoRotating(!isAutoRotating)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isAutoRotating ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 border border-white/5'}`}
                  title={isAutoRotating ? "Stop Rotation" : "Start Rotation"}
                 >
                   {isAutoRotating ? <Pause size={20} /> : <Play size={20} />}
                 </button>
                 <div className="hidden sm:flex flex-col gap-1 w-24">
                   <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Speed</span>
                   <input 
                    type="range" min="0" max="0.003" step="0.0001" 
                    value={rotationSpeed} 
                    onChange={e => setRotationSpeed(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-full appearance-none accent-blue-500 cursor-pointer"
                   />
                 </div>
              </div>

              {/* Cosmic Temperature Slider - Integrated, not floating */}
              <div className="flex-1 flex items-center gap-6">
                <div className="flex flex-col min-w-[100px] md:min-w-[140px]">
                   <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Thermometer size={10} className="text-blue-500" /> Cosmic Era
                   </span>
                   <span className="text-xs font-bold uppercase tracking-tight text-blue-400 truncate">{cosmicInfo.era}</span>
                </div>
                <div className="flex-1 relative group">
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 via-yellow-500 to-red-600 transition-all duration-500"
                      style={{ width: `${cosmicTemp * 100}%` }}
                    />
                  </div>
                  <input 
                    type="range" min="0" max="1" step="0.01" 
                    value={cosmicTemp} 
                    onChange={e => setCosmicTemp(parseFloat(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* State Metadata */}
              <div className="hidden lg:flex items-center gap-3 pl-8 border-l border-white/5">
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isAutoRotating ? 'bg-blue-500/10 text-blue-500' : 'bg-slate-800 text-slate-600'}`}>
                    {/* Add comment above fix: Added missing Activity icon here */}
                    <Activity size={18} className={isAutoRotating ? 'animate-pulse' : ''} />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[9px] font-mono text-slate-500 uppercase">System Status</span>
                    <span className="text-[10px] font-bold tracking-tight">STABLE_FIELD</span>
                 </div>
              </div>
           </div>
        </footer>
      </main>

      {/* RIGHT: NEXUS INTEL (Collapsable Chat) */}
      <aside className={`relative h-full flex transition-all duration-500 z-30 ${isIntelOpen ? 'w-80 md:w-96' : 'w-0'}`}>
        <div className={`w-full h-full flex flex-col overflow-hidden backdrop-blur-xl ${navClass} ${sidebarBg}`}>
           <ChatAssistant 
            theme={theme}
            currentMatrix={customMatrix}
            simulationQueue={[]}
            removeFromQueue={() => {}}
            clearQueue={() => {}}
           />
        </div>
      </aside>
    </div>
  );
};

export default App;
