
import React from 'react';
import { X, Sigma, Hash, Zap, Binary } from 'lucide-react';
import { LIE_GROUPS, LieGroupType, AppTheme } from '../types';

interface MathOverlayProps {
  onClose: () => void;
  activeGroupType: LieGroupType;
  theme: AppTheme;
}

const MathOverlay: React.FC<MathOverlayProps> = ({ onClose, activeGroupType, theme }) => {
  const group = LIE_GROUPS.find(g => g.id === activeGroupType) || LIE_GROUPS[4];

  const getCartanMatrix = (type: LieGroupType) => {
    switch(type) {
      case 'G2': return `[ 2 -1 ]\n[-3  2 ]`;
      case 'F4': return `[ 2 -1  0  0 ]\n[-1  2 -2  0 ]\n[ 0 -1  2 -1 ]\n[ 0  0 -1  2 ]`;
      case 'E6': return `[ 2  0 -1  0  0  0 ]\n[ 0  2  0 -1  0  0 ]\n[-1  0  2 -1  0  0 ]\n[ 0 -1 -1  2 -1  0 ]\n[ 0  0  0 -1  2 -1 ]\n[ 0  0  0  0 -1  2 ]`;
      default: return `[ 2 -1  0  0  0  0  0  0 ]\n[-1  2 -1  0  0  0  0  0 ]\n[ 0 -1  2 -1  0  0  0 -1 ]\n[ 0  0 -1  2 -1  0  0  0 ]\n[ 0  0  0 -1  2 -1  0  0 ]\n[ 0  0  0  0 -1  2 -1  0 ]\n[ 0  0  0  0  0 -1  2  0 ]\n[ 0  0 -1  0  0  0  0  2 ]`;
    }
  };

  const textClass = theme === 'primal' ? 'text-slate-200' : 'text-slate-800';
  const subTextClass = theme === 'primal' ? 'text-slate-500' : 'text-slate-500';
  const labelClass = theme === 'primal' ? 'text-indigo-400' : 'text-indigo-600';
  const bgClass = theme === 'primal' ? 'bg-slate-900/90 border-slate-700/50' : 'bg-white/95 border-slate-200 shadow-2xl';
  const cardClass = theme === 'primal' ? 'bg-slate-800/50 border-slate-700/30' : 'bg-slate-50 border-slate-100 shadow-sm';

  return (
    <div className={`absolute top-8 right-8 w-80 max-h-[calc(100vh-100px)] overflow-y-auto backdrop-blur-xl border rounded-2xl z-40 animate-in fade-in slide-in-from-right-4 duration-300 ${bgClass}`}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Sigma className={labelClass} size={20} />
            <h2 className={`text-lg font-bold tracking-tight ${textClass}`}>{group.name} Formalism</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <section>
            <h3 className={`text-[10px] font-mono uppercase tracking-[0.2em] mb-3 flex items-center gap-2 ${labelClass}`}>
              <Hash size={12} /> Fundamental Constants
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className={`p-3 rounded-xl border ${cardClass}`}>
                <div className={`text-[10px] font-mono mb-1 ${subTextClass}`}>Rank</div>
                <div className={`text-xl font-bold ${textClass}`}>{group.rank}</div>
              </div>
              <div className={`p-3 rounded-xl border ${cardClass}`}>
                <div className={`text-[10px] font-mono mb-1 ${subTextClass}`}>Dim(g)</div>
                <div className={`text-xl font-bold ${textClass}`}>{group.dimension}</div>
              </div>
              <div className={`p-3 rounded-xl border ${cardClass}`}>
                <div className={`text-[10px] font-mono mb-1 ${subTextClass}`}>Roots</div>
                <div className={`text-xl font-bold ${textClass}`}>{group.rootCount}</div>
              </div>
            </div>
          </section>

          <section>
            <h3 className={`text-[10px] font-mono uppercase tracking-[0.2em] mb-3 flex items-center gap-2 ${labelClass}`}>
              <Binary size={12} /> Cartan Matrix
            </h3>
            <div className={`p-3 rounded-lg font-mono text-[9px] overflow-x-auto whitespace-pre leading-tight ${theme === 'primal' ? 'bg-black/40 text-blue-300/80' : 'bg-slate-100 text-slate-600'}`}>
              {getCartanMatrix(activeGroupType)}
            </div>
          </section>

          <section className={`p-4 rounded-xl border ${cardClass}`}>
            <h3 className={`text-[10px] font-mono uppercase tracking-[0.2em] mb-2 ${labelClass}`}>Description</h3>
            <p className={`text-xs leading-relaxed ${theme === 'primal' ? 'text-slate-400' : 'text-slate-600'}`}>{group.description}</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default MathOverlay;
