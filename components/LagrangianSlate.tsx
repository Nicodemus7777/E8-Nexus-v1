
import React, { useMemo } from 'react';
import { AppTheme, Subgroup, Node2D } from '../types';
import { FileCode, Activity, Sparkles } from 'lucide-react';

interface LagrangianSlateProps {
  activeSubgroup: Subgroup | null;
  hoveredNode: Node2D | null;
  theme: AppTheme;
  onClose: () => void;
}

const LagrangianSlate: React.FC<LagrangianSlateProps> = ({ activeSubgroup, hoveredNode, theme, onClose }) => {
  const getLagrangianTerms = useMemo(() => {
    const terms = [];
    const h = hoveredNode?.original.category;

    // Standard Model Base
    if (!activeSubgroup || activeSubgroup.id === 'sm') {
      terms.push({ 
        id: 'kinetic', 
        latex: '\\mathcal{L} = \\sum_{k} (i \\bar{\\psi}_k \\cancel{D} \\psi_k)', 
        highlight: h === 'Fermion',
        description: 'Fermion Kinetic Term'
      });
    }

    // Gauge Sectors
    if (!activeSubgroup || activeSubgroup.id === 'su3' || activeSubgroup.id === 'sm') {
      terms.push({ 
        id: 'su3', 
        latex: '-\\frac{1}{4} G_{\\mu\\nu}^a G^{a\\mu\\nu}', 
        highlight: h === 'Strong',
        description: 'SU(3) Gluon Field Strength'
      });
    }

    if (!activeSubgroup || activeSubgroup.id === 'su2' || activeSubgroup.id === 'sm') {
      terms.push({ 
        id: 'su2', 
        latex: '-\\frac{1}{4} W_{\\mu\\nu}^a W^{a\\mu\\nu}', 
        highlight: h === 'Weak',
        description: 'SU(2) Weak Field Strength'
      });
    }

    if (!activeSubgroup || activeSubgroup.id === 'sm') {
      terms.push({ 
        id: 'u1', 
        latex: '-\\frac{1}{4} F_{\\mu\\nu} F^{\\mu\\nu}', 
        highlight: h === 'Electromagnetic',
        description: 'U(1) Electromagnetic Field'
      });
    }

    // Higgs/E8 Specific
    if (h === 'Massive' || h === 'Broken') {
      terms.push({ 
        id: 'higgs', 
        latex: '+ |D_\\mu \\phi|^2 - V(\\phi)', 
        highlight: true,
        description: 'Higgs Sector / VEV Potential'
      });
    }

    return terms;
  }, [activeSubgroup, hoveredNode]);

  const bgClass = theme === 'primal' ? 'bg-slate-900/80 border-slate-700' : 'bg-white/90 border-slate-200 shadow-2xl';
  const textClass = theme === 'primal' ? 'text-slate-100' : 'text-slate-900';

  return (
    <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] md:w-[600px] p-6 backdrop-blur-xl border rounded-3xl z-50 animate-in slide-in-from-bottom duration-500 overflow-hidden ${bgClass}`}>
      <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
            <FileCode size={18} />
          </div>
          <h2 className={`text-sm font-bold tracking-tight uppercase ${textClass}`}>Lagrangian Decoder</h2>
        </div>
        <div className="flex items-center gap-3">
          {hoveredNode && (
            <div className="flex items-center gap-2 animate-pulse">
              <Sparkles size={12} className="text-yellow-500" />
              <span className="text-[10px] font-mono text-slate-400 uppercase">Coupling to Field...</span>
            </div>
          )}
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-6 py-4">
        {getLagrangianTerms.map((term) => (
          <div 
            key={term.id} 
            className={`relative group transition-all duration-300 ${term.highlight ? 'scale-110 -translate-y-1' : 'opacity-60 grayscale hover:grayscale-0 hover:opacity-100'}`}
          >
            <div className={`font-serif text-lg md:text-xl transition-colors ${term.highlight ? (theme === 'primal' ? 'text-blue-400' : 'text-blue-600') : textClass}`}>
              {/* Note: In a production app, we'd use KaTeX here. Using text representation for this environment */}
              <span className="mono">{term.latex.replace(/\\/g, '').replace(/mathcal{L}/, 'L')}</span>
            </div>
            
            {term.highlight && (
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded bg-blue-500/10 text-[8px] font-mono text-blue-400 border border-blue-500/20 uppercase">
                {term.description}
              </div>
            )}

            {term.highlight && (
              <div className="absolute -inset-2 bg-blue-500/5 rounded-xl blur-md -z-10 animate-pulse" />
            )}
          </div>
        ))}
      </div>

      {!getLagrangianTerms.length && (
        <div className="text-center py-6 text-slate-500 text-[10px] font-mono uppercase tracking-widest">
          Analyzing Field Strengths... Select a Subgroup
        </div>
      )}
    </div>
  );
};

const X = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
);

export default LagrangianSlate;
