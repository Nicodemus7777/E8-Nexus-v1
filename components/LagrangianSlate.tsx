
import React from 'react';
import { AppTheme, Subgroup, Node2D } from '../types';

interface LagrangianSlateProps {
  activeSubgroup: Subgroup | null;
  hoveredNode: Node2D | null;
  theme: AppTheme;
}

const LagrangianSlate: React.FC<LagrangianSlateProps> = ({ hoveredNode, theme }) => {
  const h = hoveredNode?.original.category;

  const terms = [
    { id: 'k', eq: 'iψ̄⧸Dψ', cat: 'Fermion', label: 'Dirac Kinetic' },
    { id: 's', eq: '-1/4 G²', cat: 'Strong', label: 'SU(3) Glue' },
    { id: 'w', eq: '-1/4 W²', cat: 'Weak', label: 'SU(2) Weak' },
    { id: 'e', eq: '-1/4 F²', cat: 'Electromagnetic', label: 'Maxwell' },
  ];

  return (
    <div className="space-y-3">
      {terms.map(t => (
        <div 
          key={t.id}
          className={`p-3 rounded-xl border transition-all ${h === t.cat ? 'bg-blue-600/20 border-blue-500 scale-[1.02]' : 'bg-slate-800/20 border-white/5 opacity-50'}`}
        >
          <div className="flex justify-between items-center mb-1">
             <span className="text-[8px] font-mono text-slate-500 uppercase">{t.label}</span>
             {h === t.cat && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"/>}
          </div>
          <div className="text-lg font-serif italic text-blue-300 text-center py-1">
            {t.eq}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LagrangianSlate;
