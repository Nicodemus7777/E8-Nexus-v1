
import React, { useMemo } from 'react';
import { AppTheme, MeraState } from '../types';
import { Network, X, Layers, Activity, Info, BarChart3 } from 'lucide-react';

interface MeraSlateProps {
  state: MeraState;
  setState: React.Dispatch<React.SetStateAction<MeraState>>;
  theme: AppTheme;
}

const MeraSlate: React.FC<MeraSlateProps> = ({ state, setState, theme }) => {
  const textClass = theme === 'primal' ? 'text-slate-100' : 'text-slate-900';
  const accentClass = theme === 'primal' ? 'text-emerald-400' : 'text-emerald-600';

  // Generate a mock Entropy curve based on renormalization scale
  const entropyData = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 20; i++) {
      const x = i / 20;
      // Area Law simulation: S ~ Log(L) or L^(d-1)
      const y = Math.log(1 + x * 10) * state.bulkCurvature * 20;
      points.push(y);
    }
    return points;
  }, [state.renormalizationScale, state.bulkCurvature]);

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-300">
      <section>
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Renormalization Scale</span>
          <span className={`text-[10px] font-mono font-bold ${accentClass}`}>{Math.round(state.renormalizationScale * 100)}%</span>
        </div>
        <input 
          type="range" min="0.05" max="1" step="0.01" 
          value={state.renormalizationScale}
          onChange={e => setState(prev => ({ ...prev, renormalizationScale: parseFloat(e.target.value) }))}
          className="w-full h-1 bg-slate-800 rounded-full appearance-none cursor-pointer accent-emerald-500"
        />
      </section>

      <section>
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">AdS Bulk Curvature</span>
          <span className={`text-[10px] font-mono font-bold ${accentClass}`}>{state.bulkCurvature.toFixed(2)}</span>
        </div>
        <input 
          type="range" min="0.1" max="2" step="0.1" 
          value={state.bulkCurvature}
          onChange={e => setState(prev => ({ ...prev, bulkCurvature: parseFloat(e.target.value) }))}
          className="w-full h-1 bg-slate-800 rounded-full appearance-none cursor-pointer accent-emerald-500"
        />
      </section>

      <section className="pt-4 border-t border-white/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 size={14} className={accentClass} />
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Entanglement Entropy (S_EE)</span>
          </div>
        </div>
        <div className="h-20 flex items-end gap-1 px-2 bg-black/20 rounded-xl overflow-hidden border border-white/5 shadow-inner">
          {entropyData.map((val, i) => (
            <div 
              key={i} 
              className={`flex-1 transition-all duration-700 ${i / 20 <= state.renormalizationScale ? 'bg-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-slate-800/30'}`}
              style={{ height: `${Math.min(100, val)}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-[8px] font-mono text-slate-600 uppercase tracking-widest">
          <span>UV (Boundary)</span>
          <span>IR (Bulk Center)</span>
        </div>
      </section>

      <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 space-y-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Info size={12} className={accentClass} />
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Holographic Emergence</span>
        </div>
        <p className="text-[10px] text-slate-500 leading-relaxed italic">
          Spacetime is not fundamental but emergent. The E8 root connections you see represent unitary gates. As renormalization scale increases, coarse-grained degrees of freedom construct the interior bulk geometry via entanglement.
        </p>
      </div>
    </div>
  );
};

export default MeraSlate;
