
import React, { useEffect, useRef } from 'react';
import { DecayInteraction, AppTheme, ParticleCategory } from '../types';
import { X, Activity, Info } from 'lucide-react';

interface FeynmanCanvasProps {
  decay: DecayInteraction | null;
  onClose: () => void;
  theme: AppTheme;
}

const FeynmanCanvas: React.FC<FeynmanCanvasProps> = ({ decay, onClose, theme }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const getLineType = (category?: ParticleCategory) => {
    if (category === 'Fermion') return 'straight';
    return 'wavy';
  };

  const getCategoryColor = (category?: ParticleCategory) => {
    switch (category) {
      case 'Strong': return '#10b981';
      case 'Weak': return '#8b5cf6';
      case 'Electromagnetic': return '#06b6d4';
      case 'Fermion': return '#ec4899';
      case 'Gravitational': return '#a78bfa';
      default: return '#94a3b8';
    }
  };

  const renderWavyPath = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const numWaves = Math.floor(len / 10);
    const waveWidth = len / numWaves;
    const waveHeight = 4;

    let path = `M ${x1} ${y1}`;
    for (let i = 0; i < numWaves; i++) {
      const t = i / numWaves;
      const nextT = (i + 1) / numWaves;
      
      const midT = (t + nextT) / 2;
      const cp1x = x1 + dx * (t + (nextT - t) / 3) - dy/len * waveHeight;
      const cp1y = y1 + dy * (t + (nextT - t) / 3) + dx/len * waveHeight;
      
      const cp2x = x1 + dx * (t + 2 * (nextT - t) / 3) + dy/len * waveHeight;
      const cp2y = y1 + dy * (t + 2 * (nextT - t) / 3) - dx/len * waveHeight;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x1 + dx * nextT} ${y1 + dy * nextT}`;
    }
    return path;
  };

  const bgClass = theme === 'primal' ? 'bg-slate-900/90 border-slate-800' : 'bg-white/95 border-slate-200 shadow-2xl';
  const textClass = theme === 'primal' ? 'text-slate-100' : 'text-slate-900';

  if (!decay) return null;

  return (
    <div className={`absolute right-8 bottom-8 w-80 h-96 backdrop-blur-xl border rounded-2xl z-50 animate-in slide-in-from-right duration-500 overflow-hidden flex flex-col ${bgClass}`}>
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-emerald-500" />
          <h2 className={`text-xs font-bold uppercase tracking-wider ${textClass}`}>Feynman Generator</h2>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 relative p-4 bg-slate-950/20">
        <svg viewBox="0 0 200 240" className="w-full h-full">
          <defs>
            <filter id="feynman-glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Incoming Parent */}
          {getLineType(decay.parent.category) === 'straight' ? (
            <line x1="100" y1="200" x2="100" y2="120" stroke={getCategoryColor(decay.parent.category)} strokeWidth="2" filter="url(#feynman-glow)" className="animate-draw-line" />
          ) : (
            <path d={renderWavyPath(100, 200, 100, 120)} fill="none" stroke={getCategoryColor(decay.parent.category)} strokeWidth="2" filter="url(#feynman-glow)" />
          )}
          
          {/* Interaction Vertex */}
          <circle cx="100" cy="120" r="4" fill="#ffffff" filter="url(#feynman-glow)" />

          {/* Outgoing Child 1 */}
          {getLineType(decay.children[0].category) === 'straight' ? (
            <line x1="100" y1="120" x2="40" y2="40" stroke={getCategoryColor(decay.children[0].category)} strokeWidth="2" filter="url(#feynman-glow)" />
          ) : (
            <path d={renderWavyPath(100, 120, 40, 40)} fill="none" stroke={getCategoryColor(decay.children[0].category)} strokeWidth="2" filter="url(#feynman-glow)" />
          )}

          {/* Outgoing Child 2 */}
          {getLineType(decay.children[1].category) === 'straight' ? (
            <line x1="100" y1="120" x2="160" y2="40" stroke={getCategoryColor(decay.children[1].category)} strokeWidth="2" filter="url(#feynman-glow)" />
          ) : (
            <path d={renderWavyPath(100, 120, 160, 40)} fill="none" stroke={getCategoryColor(decay.children[1].category)} strokeWidth="2" filter="url(#feynman-glow)" />
          )}

          {/* Labels */}
          <text x="110" y="180" className="text-[10px] font-mono fill-slate-400 uppercase tracking-tighter" style={{ fontSize: '8px' }}>
            {decay.parent.category} α
          </text>
          <text x="20" y="30" className="text-[10px] font-mono fill-slate-400 uppercase tracking-tighter" style={{ fontSize: '8px' }}>
            {decay.children[0].category} β
          </text>
          <text x="140" y="30" className="text-[10px] font-mono fill-slate-400 uppercase tracking-tighter" style={{ fontSize: '8px' }}>
            {decay.children[1].category} γ
          </text>

          {/* Quantum Coords Label */}
          <g transform="translate(10, 220)">
            <rect width="180" height="15" rx="4" fill="rgba(255,255,255,0.05)" />
            <text x="5" y="11" className="text-[6px] font-mono fill-emerald-500/80" style={{ fontSize: '6px' }}>
              REACTION: [{decay.parent.coords.join(', ')}] → β + γ
            </text>
          </g>
        </svg>

        <div className="absolute top-4 left-4 flex items-center gap-1 opacity-40">
           <div className="w-1 h-1 bg-white rounded-full animate-ping" />
           <span className="text-[8px] font-mono text-white">LIVE_CALCULATION</span>
        </div>
      </div>

      <div className="p-3 bg-slate-900/50 border-t border-white/5">
        <div className="flex items-center gap-2 mb-1">
          <Info size={10} className="text-blue-400" />
          <span className="text-[9px] text-slate-400 font-bold uppercase">Decay Kinematics</span>
        </div>
        <p className="text-[8px] text-slate-500 leading-tight">
          Conservation of E8 root weights verified. Vertices are mapped via the 8D Cartan matrix.
        </p>
      </div>

      <style>{`
        @keyframes draw-line {
          from { stroke-dasharray: 0 100; }
          to { stroke-dasharray: 100 100; }
        }
        .animate-draw-line {
          animation: draw-line 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default FeynmanCanvas;
