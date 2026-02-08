
import React, { useEffect, useState } from 'react';
import { X, Telescope, MapPin, Calendar, User, Zap, Sparkles, Orbit } from 'lucide-react';
import { AppTheme, Discovery } from '../types';
// Fixed: getPetrieBasis is exported from utils/e8, not types
import { getPetrieBasis } from '../utils/e8';

interface DiscoveryFeedProps {
  onJump: (discovery: Discovery) => void;
  onClose: () => void;
  theme: AppTheme;
}

const PRESET_DISCOVERIES: Discovery[] = [
  {
    id: 'petrie-8',
    name: 'Canonical Petrie Projection',
    discoverer: 'H.S.M. Coxeter',
    matrix: { x: getPetrieBasis(8)[0], y: getPetrieBasis(8)[1] },
    symmetryRank: 'Perfect',
    type: 'Orthographic Petrie',
    timestamp: Date.now() - 10000000
  },
  {
    id: 'quasi-10',
    name: 'Decagonal Quasi-Crystal Alignment',
    discoverer: 'Global Network',
    matrix: { 
      x: [0.3, 0.7, -0.4, 0.1, 0.9, -0.2, 0.5, -0.8], 
      y: [0.7, -0.3, 0.2, -0.9, 0.1, 0.5, -0.4, 0.6] 
    },
    symmetryRank: 'High',
    type: 'Quasicrystalline Slice',
    timestamp: Date.now() - 5000000
  }
];

const DiscoveryFeed: React.FC<DiscoveryFeedProps> = ({ onJump, onClose, theme }) => {
  const [discoveries, setDiscoveries] = useState<Discovery[]>(PRESET_DISCOVERIES);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('e8_discoveries') || '[]');
    setDiscoveries([...stored, ...PRESET_DISCOVERIES]);
  }, []);

  const bgClass = theme === 'primal' ? 'bg-slate-900/95 border-slate-700' : 'bg-white border-slate-200 shadow-2xl';
  const textClass = theme === 'primal' ? 'text-slate-100' : 'text-slate-900';
  const cardBg = theme === 'primal' ? 'bg-slate-800/40 border-slate-700/50' : 'bg-slate-50 border-slate-100 shadow-sm';

  return (
    <div className={`absolute left-16 top-0 h-full w-80 md:w-96 backdrop-blur-xl border-r z-20 animate-in slide-in-from-left duration-300 ${bgClass}`}>
      <div className="p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Telescope className="text-amber-500" size={20} />
            <h2 className={`text-lg font-bold ${textClass}`}>Discovery Feed</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {discoveries.map((discovery) => (
            <div 
              key={discovery.id}
              className={`p-4 rounded-xl border transition-all group hover:border-amber-500/50 ${cardBg}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${discovery.symmetryRank === 'Perfect' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/10 text-blue-400'}`}>
                  {discovery.symmetryRank === 'Perfect' ? <Sparkles size={10} className="inline mr-1" /> : <Orbit size={10} className="inline mr-1" />}
                  {discovery.symmetryRank} SYMMETRY
                </span>
                <span className="text-[9px] text-slate-500 font-mono">#{discovery.id.substring(0, 4)}</span>
              </div>
              
              <h3 className={`font-bold text-sm mb-1 ${textClass}`}>{discovery.name}</h3>
              
              <div className="flex flex-col gap-1 mb-4">
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <User size={10} /> {discovery.discoverer}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <MapPin size={10} /> {discovery.type}
                </div>
              </div>

              <button 
                onClick={() => onJump(discovery)}
                className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Zap size={14} className="text-yellow-400" /> Jump into Projection
              </button>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[10px] text-amber-500 leading-relaxed italic">
          High-Symmetry Events are detected using AI heuristic analysis of lattice node overlaps. Findings are shared instantly across the community cloud.
        </div>
      </div>
    </div>
  );
};

export default DiscoveryFeed;
