
import React, { useState, useEffect, useMemo } from 'react';
import { Info, Maximize2, Layers, Hexagon, Github, Compass, X, Sigma, Grid3X3, FlaskConical, Plus, Moon, Sun, Sparkles, Zap, Sliders, Volume2, VolumeX, Focus, Activity, Orbit, Spline, Share2, RefreshCw, Telescope, FileCode, Thermometer, Network, Beaker } from 'lucide-react';
import Visualizer from './components/Visualizer';
import ChatAssistant from './components/ChatAssistant';
import MathOverlay from './components/MathOverlay';
import ProjectionSandbox from './components/ProjectionSandbox';
import DiscoveryFeed from './components/DiscoveryFeed';
import LagrangianSlate from './components/LagrangianSlate';
import FeynmanCanvas from './components/FeynmanCanvas';
import MeraSlate from './components/MeraSlate';
import BatchLab from './components/BatchLab';
import { Node2D, SUBGROUPS, Subgroup, LIE_GROUPS, LieGroupType, AppTheme, Vector8D, ProjectionMatrix, TopologicalDefect, DefectType, EntangledPair, Discovery, CosmicState, DecayInteraction, MeraState, EvaluationLog } from './types';
import { getLieGroupRoots, findDecayPair, getPetrieBasis } from './utils/e8';
import { audioEngine } from './utils/audio';

const App: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<Node2D | null>(null);
  const [hoveredNode, setHoveredNode] = useState<Node2D | null>(null);
  const [activeSubgroup, setActiveSubgroup] = useState<Subgroup | null>(null);
  const [activeGroupType, setActiveGroupType] = useState<LieGroupType>('E8');
  const [simulationQueue, setSimulationQueue] = useState<Node2D[]>([]);
  const [theme, setTheme] = useState<AppTheme>('primal');
  const [decayRequest, setDecayRequest] = useState<Vector8D | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isFrameBundleActive, setIsFrameBundleActive] = useState(false);
  const [isHolographicActive, setIsHolographicActive] = useState(false);
  const [wickRotation, setWickRotation] = useState(0); 
  
  const [showSubgroups, setShowSubgroups] = useState(false);
  const [showLattices, setShowLattices] = useState(false);
  const [showMathOverlay, setShowMathOverlay] = useState(false);
  const [showSandbox, setShowSandbox] = useState(false);
  const [showDiscoveryFeed, setShowDiscoveryFeed] = useState(false);
  const [showLagrangianSlate, setShowLagrangianSlate] = useState(false);
  const [showBatchLab, setShowBatchLab] = useState(false);
  
  // Feynman & Decay Logic
  const [activeDecay, setActiveDecay] = useState<DecayInteraction | null>(null);

  // Cosmic State
  const [cosmicTemp, setCosmicTemp] = useState(0); // 0 (Now) to 1 (Big Bang)
  
  // MERA State
  const [meraState, setMeraState] = useState<MeraState>({
    isActive: false,
    renormalizationScale: 0.5,
    bulkCurvature: 0.8
  });

  const cosmicInfo = useMemo((): CosmicState => {
    if (cosmicTemp > 0.9) return { temperature: cosmicTemp, era: "Planck Epoch (10³²K)", unification: 1 };
    if (cosmicTemp > 0.7) return { temperature: cosmicTemp, era: "GUT Symmetry Era", unification: 0.8 };
    if (cosmicTemp > 0.4) return { temperature: cosmicTemp, era: "Electroweak Symmetry", unification: 0.5 };
    if (cosmicTemp > 0.2) return { temperature: cosmicTemp, era: "Quark-Gluon Plasma", unification: 0.2 };
    return { temperature: cosmicTemp, era: "Current Era (2.7K)", unification: 0 };
  }, [cosmicTemp]);

  const roots = useMemo(() => getLieGroupRoots(activeGroupType), [activeGroupType]);

  useEffect(() => {
    if (cosmicTemp > 0.8) setActiveGroupType('E8');
    else if (cosmicTemp > 0.6) setActiveGroupType('E7');
    else if (cosmicTemp > 0.4) setActiveGroupType('E6');
  }, [cosmicTemp]);

  // Symmetry Breaking State
  const [isBreakingLabActive, setIsBreakingLabActive] = useState(false);
  const [activeDefect, setActiveDefect] = useState<TopologicalDefect | null>(null);
  const [defectType, setDefectType] = useState<DefectType>('HiggsVEV');
  const [defectStrength, setDefectStrength] = useState(0.5);

  // Entanglement State
  const [isEntangleMode, setIsEntangleMode] = useState(false);
  const [entangledPair, setEntangledPair] = useState<EntangledPair | null>(null);
  const [ripplePulse, setRipplePulse] = useState(0);

  // Initialize with Petrie basis for E8
  const defaultBasis = getPetrieBasis(8);
  const [customMatrix, setCustomMatrix] = useState<ProjectionMatrix>({
    x: defaultBasis[0],
    y: defaultBasis[1]
  });

  const toggleTheme = () => setTheme(prev => prev === 'primal' ? 'dual' : 'primal');
  
  const toggleAudio = () => {
    const next = !isAudioEnabled;
    setIsAudioEnabled(next);
    audioEngine.toggle(next);
  };

  const applyBatchParams = (params: { temp?: number; mera?: number; wick?: number }) => {
    if (params.temp !== undefined) setCosmicTemp(params.temp);
    if (params.mera !== undefined) setMeraState(prev => ({ ...prev, renormalizationScale: params.mera! }));
    if (params.wick !== undefined) setWickRotation(params.wick);
    setRipplePulse(prev => prev + 1);
  };

  const initiateDecay = (node: Node2D) => {
    const pair = findDecayPair(node.original, roots);
    if (pair) {
      setActiveDecay({
        parent: node.original,
        children: pair,
        timestamp: Date.now()
      });
      setDecayRequest(node.original);
    } else {
      setRipplePulse(prev => prev + 1);
    }
    setSelectedNode(null);
  };

  const handleNodeSelect = (node: Node2D) => {
    if (isEntangleMode) {
      if (selectedNode && selectedNode.id !== node.id) {
        setEntangledPair({ node1: selectedNode, node2: node });
        setIsEntangleMode(false);
        setSelectedNode(null);
      } else {
        setSelectedNode(node);
      }
    } else {
      setSelectedNode(node);
    }
  };

  const jumpToDiscovery = (discovery: Discovery) => {
    setCustomMatrix(discovery.matrix);
    setShowDiscoveryFeed(false);
    setRipplePulse(prev => prev + 1);
  };

  const resetProjection = () => {
    const rank = activeGroupType === 'G2' ? 2 : activeGroupType === 'F4' ? 4 : activeGroupType === 'E6' ? 6 : activeGroupType === 'E7' ? 7 : 8;
    const basis = getPetrieBasis(rank);
    setCustomMatrix({ x: basis[0], y: basis[1] });
  };

  const navClass = theme === 'primal' ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200';
  const textPrimary = theme === 'primal' ? 'text-slate-100' : 'text-slate-900';

  return (
    <div className={`flex h-screen w-screen overflow-hidden transition-colors duration-500 ${theme === 'primal' ? 'bg-slate-950 text-slate-200' : 'bg-[#fcfaf7] text-slate-800'}`}>
      {/* Left Navigation */}
      <div className={`w-16 flex flex-col items-center py-6 gap-8 border-r z-30 transition-colors ${navClass}`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 ${theme === 'primal' ? 'bg-blue-600 shadow-blue-900/20' : 'bg-blue-700 shadow-blue-200'}`}>
          <Hexagon className="text-white" size={24} />
        </div>
        <nav className="flex flex-col gap-6">
          <button onClick={() => { setShowLattices(!showLattices); setShowSubgroups(false); setShowMathOverlay(false); setShowSandbox(false); setShowDiscoveryFeed(false); }} 
            className={`p-2 transition-all duration-300 ${showLattices ? (theme === 'primal' ? 'text-blue-400 bg-blue-500/10 rounded-lg shadow-sm' : 'text-blue-600 bg-blue-50 rounded-lg shadow-sm') : 'text-slate-400 hover:text-blue-400'}`} title="Comparison Mode"><Grid3X3 size={24} /></button>
          
          <button onClick={() => { setShowSandbox(!showSandbox); setShowSubgroups(false); setShowLattices(false); setShowMathOverlay(false); setShowDiscoveryFeed(false); }} 
            className={`p-2 transition-all duration-300 ${showSandbox ? (theme === 'primal' ? 'text-blue-400 bg-blue-500/10 rounded-lg' : 'text-blue-600 bg-blue-50 rounded-lg') : 'text-slate-400 hover:text-blue-400'}`} title="Projection Sandbox"><Sliders size={24} /></button>

          <button onClick={() => { setShowDiscoveryFeed(!showDiscoveryFeed); setShowSandbox(false); setShowSubgroups(false); setShowLattices(false); setShowMathOverlay(false); }} 
            className={`p-2 transition-all duration-300 ${showDiscoveryFeed ? (theme === 'primal' ? 'text-amber-400 bg-amber-500/10 rounded-lg' : 'text-amber-600 bg-amber-50 rounded-lg') : 'text-slate-400 hover:text-amber-400'}`} title="Discovery Feed"><Telescope size={24} /></button>

          <button onClick={() => setMeraState(prev => ({ ...prev, isActive: !prev.isActive }))} 
            className={`p-2 transition-all duration-300 ${meraState.isActive ? (theme === 'primal' ? 'text-emerald-400 bg-emerald-500/10 rounded-lg' : 'text-emerald-600 bg-emerald-50 rounded-lg') : 'text-slate-400 hover:text-emerald-400'}`} title="MERA Tensor Network"><Network size={24} /></button>

          <button onClick={() => setShowBatchLab(!showBatchLab)} 
            className={`p-2 transition-all duration-300 ${showBatchLab ? (theme === 'primal' ? 'text-indigo-400 bg-indigo-500/10 rounded-lg' : 'text-indigo-600 bg-indigo-50 rounded-lg') : 'text-slate-400 hover:text-indigo-400'}`} title="Batch Evaluator"><Beaker size={24} /></button>

          <button onClick={() => setShowLagrangianSlate(!showLagrangianSlate)} 
            className={`p-2 transition-all duration-300 ${showLagrangianSlate ? (theme === 'primal' ? 'text-indigo-400 bg-indigo-500/10 rounded-lg' : 'text-indigo-600 bg-indigo-50 rounded-lg') : 'text-slate-400 hover:text-indigo-400'}`} title="Lagrangian Decoder"><FileCode size={24} /></button>
          
          <button onClick={() => { setIsBreakingLabActive(!isBreakingLabActive); setActiveDefect(null); }} 
            className={`p-2 transition-all duration-300 ${isBreakingLabActive ? (theme === 'primal' ? 'text-red-400 bg-red-500/10 rounded-lg' : 'text-red-600 bg-red-50 rounded-lg') : 'text-slate-400 hover:text-red-400'}`} title="Topological Defect Lab"><Zap size={24} /></button>

          <button onClick={() => setIsEntangleMode(!isEntangleMode)} 
            className={`p-2 transition-all duration-300 ${isEntangleMode ? (theme === 'primal' ? 'text-emerald-400 bg-emerald-500/10 rounded-lg' : 'text-emerald-600 bg-emerald-50 rounded-lg') : 'text-slate-400 hover:text-emerald-400'}`} title="Entanglement Bridge"><Share2 size={24} /></button>

          <div className={`h-px w-8 mx-auto ${theme === 'primal' ? 'bg-slate-800' : 'bg-slate-100'}`} />
          
          <button onClick={toggleAudio} className={`p-2 rounded-lg transition-all ${isAudioEnabled ? (theme === 'primal' ? 'text-blue-400 bg-blue-500/10' : 'text-blue-600 bg-blue-50') : 'text-slate-400 hover:text-slate-200'}`} title="Audio">
            {isAudioEnabled ? <Volume2 size={24} className="animate-pulse" /> : <VolumeX size={24} />}
          </button>

          <button onClick={toggleTheme} className={`p-2 rounded-lg transition-all ${theme === 'dual' ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' : 'text-slate-400 hover:text-yellow-400 bg-slate-900/50'}`} title="Theme">
            {theme === 'primal' ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </nav>
      </div>

      {/* Temperature Control Overlay */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 z-40">
        <div className={`group flex flex-col items-center p-3 rounded-full border transition-all ${theme === 'primal' ? 'bg-slate-900/80 border-slate-700' : 'bg-white/90 border-slate-200 shadow-xl'}`}>
          <div className="text-[10px] font-mono text-slate-500 rotate-90 w-32 text-center -translate-y-8 mb-4 pointer-events-none uppercase tracking-widest whitespace-nowrap">
            {cosmicInfo.era}
          </div>
          <div className="relative h-64 w-1 flex flex-col justify-end bg-slate-800 rounded-full overflow-hidden">
             <div 
              className="w-full bg-gradient-to-t from-blue-500 via-yellow-500 to-red-600 transition-all duration-500" 
              style={{ height: `${cosmicTemp * 100}%` }}
             />
             <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={cosmicTemp}
              onChange={(e) => setCosmicTemp(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rotate-180 [writing-mode:bt-lr]"
              style={{ appearance: 'slider-vertical' } as any}
             />
          </div>
          <Thermometer className={`mt-4 ${cosmicTemp > 0.8 ? 'text-red-500 animate-pulse' : 'text-blue-400'}`} size={20} />
        </div>
      </div>

      {/* Batch Lab Panel */}
      {showBatchLab && (
        <BatchLab 
          theme={theme} 
          onClose={() => setShowBatchLab(false)} 
          onApplyParams={applyBatchParams}
        />
      )}

      {/* MERA Panel */}
      {meraState.isActive && (
        <MeraSlate 
          state={meraState} 
          setState={setMeraState} 
          theme={theme} 
          onClose={() => setMeraState(prev => ({ ...prev, isActive: false }))} 
        />
      )}

      {/* Feynman Diagram Generator */}
      {activeDecay && (
        <FeynmanCanvas 
          decay={activeDecay} 
          onClose={() => setActiveDecay(null)} 
          theme={theme} 
        />
      )}

      {/* Lagrangian Slate */}
      {showLagrangianSlate && (
        <LagrangianSlate 
          activeSubgroup={activeSubgroup}
          hoveredNode={hoveredNode}
          theme={theme}
          onClose={() => setShowLagrangianSlate(false)}
        />
      )}

      {showDiscoveryFeed && (
        <DiscoveryFeed 
          onJump={jumpToDiscovery} 
          onClose={() => setShowDiscoveryFeed(false)} 
          theme={theme} 
        />
      )}

      {showSandbox && (
        <ProjectionSandbox 
          matrix={customMatrix} 
          onChange={setCustomMatrix} 
          onClose={() => setShowSandbox(false)} 
          theme={theme}
          onReset={resetProjection}
        />
      )}

      {/* Main Exploration Stage */}
      <main className="flex-1 relative flex flex-col">
        <header className="absolute top-0 left-0 w-full p-8 z-10 pointer-events-none">
          <div className="max-w-xl">
            <h1 className={`text-4xl font-bold tracking-tight mb-2 transition-colors duration-500 ${textPrimary}`}>
              {theme === 'primal' ? 'Nexus' : 'Lattice'}{' '}
              <span className={theme === 'primal' ? 'text-blue-500' : 'text-blue-600'}>{activeGroupType}</span>
            </h1>
          </div>
        </header>

        <div className={`flex-1 transition-colors duration-500 ${theme === 'primal' ? 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950' : 'bg-[#fcfaf7]'}`}>
          <Visualizer 
            onNodeSelect={handleNodeSelect} 
            activeSubgroup={activeSubgroup} 
            groupType={activeGroupType} 
            simulationQueue={simulationQueue}
            theme={theme}
            decayRequest={decayRequest}
            onDecayComplete={() => setDecayRequest(null)}
            customMatrix={customMatrix}
            isAudioEnabled={isAudioEnabled}
            isFrameBundleActive={isFrameBundleActive}
            isHolographicActive={isHolographicActive}
            wickRotation={wickRotation}
            isBreakingLabActive={isBreakingLabActive}
            activeDefect={activeDefect}
            onDefectPlaced={(x, y) => setActiveDefect({ type: defectType, x, y, strength: defectStrength })}
            entangledPair={entangledPair}
            ripplePulse={ripplePulse}
            onNodeHover={setHoveredNode}
            cosmicState={cosmicInfo}
            meraState={meraState}
          />
        </div>

        {selectedNode && (
          <div className={`absolute bottom-8 left-8 p-6 backdrop-blur-xl border rounded-2xl shadow-2xl z-20 animate-in fade-in slide-in-from-bottom-4 duration-300 ${theme === 'primal' ? 'bg-slate-900/90 border-slate-700' : 'bg-white/95 border-slate-200'}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className={`font-mono text-[10px] uppercase tracking-widest mb-1 ${theme === 'primal' ? 'text-blue-400' : 'text-blue-700'}`}>Root Vector Analysis</h3>
                <h2 className={`text-xl font-bold flex items-center gap-2 ${textPrimary}`}>
                  ID #{selectedNode.id}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-normal ${theme === 'primal' ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-50 text-blue-600'}`}>
                    {selectedNode.original.category}
                  </span>
                </h2>
              </div>
              <button onClick={() => setSelectedNode(null)} className="text-slate-500 hover:text-slate-900"><X size={18} /></button>
            </div>
            
            <div className="grid grid-cols-4 gap-2 mb-6">
              {selectedNode.original.coords.map((c, i) => (
                <div key={i} className={`p-2 rounded border text-center ${theme === 'primal' ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
                  <span className={`block text-[10px] font-mono mb-1 uppercase ${theme === 'primal' ? 'text-slate-500' : 'text-slate-400'}`}>X{i+1}</span>
                  <span className={`text-xs font-mono ${theme === 'primal' ? 'text-blue-300' : 'text-slate-800'}`}>{c}</span>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col gap-2 mt-4">
              <button onClick={() => initiateDecay(selectedNode)} className={`w-full text-white text-[10px] font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500`}>
                <Zap size={14} /> Simulate Decay & Generate Feynman
              </button>
            </div>
          </div>
        )}
      </main>

      <aside className={`w-80 md:w-96 shrink-0 h-full z-10 shadow-2xl transition-colors duration-500 ${theme === 'primal' ? 'bg-slate-900' : 'bg-white'}`}>
        <ChatAssistant 
          simulationQueue={simulationQueue} 
          removeFromQueue={(n) => setSimulationQueue(prev => prev.filter(q => q.id !== n.id))} 
          clearQueue={() => setSimulationQueue([])}
          theme={theme}
          isBreakingLabActive={isBreakingLabActive}
          activeDefect={activeDefect}
          entangledPair={entangledPair}
          ripplePulse={ripplePulse}
          currentMatrix={customMatrix}
        />
      </aside>
    </div>
  );
};

export default App;
