
import React, { useState } from 'react';
import { X, Sliders, RotateCw, RefreshCw, Box, Search, Upload, Loader2, Sparkles } from 'lucide-react';
import { AppTheme, ProjectionMatrix, Discovery } from '../types';
import { askE8Expert } from '../services/geminiService';

interface ProjectionSandboxProps {
  matrix: ProjectionMatrix;
  onChange: (matrix: ProjectionMatrix) => void;
  onClose: () => void;
  theme: AppTheme;
  onReset: () => void;
}

const ProjectionSandbox: React.FC<ProjectionSandboxProps> = ({ matrix, onChange, onClose, theme, onReset }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const handleSliderChange = (axis: 'x' | 'y', index: number, value: number) => {
    const newMatrix = { ...matrix };
    newMatrix[axis] = [...newMatrix[axis]];
    newMatrix[axis][index] = value;
    onChange(newMatrix);
  };

  const handleRandomize = () => {
    const random = () => parseFloat((Math.random() * 2 - 1).toFixed(3));
    onChange({
      x: Array.from({ length: 8 }, random),
      y: Array.from({ length: 8 }, random),
    });
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysis(null);
    const prompt = `Analyze this 8D-to-2D projection matrix for symmetries. 
    X-Basis: [${matrix.x.join(', ')}]
    Y-Basis: [${matrix.y.join(', ')}]
    Does it reveal decagonal, hexadecanal, or aperiodic (quasi-crystal) structures? Give it a name and a 'Symmetry Class'.`;
    const res = await askE8Expert([{ role: 'user', content: prompt }]);
    setAnalysis(res);
    setIsAnalyzing(false);
  };

  const handlePublish = () => {
    // Simulating a publish to global feed (session local for this implementation)
    const stored = JSON.parse(localStorage.getItem('e8_discoveries') || '[]');
    const newDiscovery: Discovery = {
      id: Math.random().toString(36).substr(2, 9),
      name: analysis ? (analysis.split('\n')[0].substring(0, 30) || "Unnamed Discovery") : "Manual Alignment",
      discoverer: "Anonymous Researcher",
      matrix: matrix,
      symmetryRank: analysis && analysis.toLowerCase().includes('high') ? 'High' : 'Common',
      type: "Quantum Slice",
      timestamp: Date.now()
    };
    localStorage.setItem('e8_discoveries', JSON.stringify([newDiscovery, ...stored]));
    alert("Discovery Published to Global Lattice Feed!");
  };

  const textClass = theme === 'primal' ? 'text-slate-200' : 'text-slate-800';
  const labelClass = theme === 'primal' ? 'text-blue-400' : 'text-blue-600';
  const bgClass = theme === 'primal' ? 'bg-slate-900/95 border-slate-700' : 'bg-white border-slate-200 shadow-2xl';
  const sliderTrack = theme === 'primal' ? 'bg-slate-800' : 'bg-slate-100';

  return (
    <div className={`absolute top-8 left-20 w-80 max-h-[calc(100vh-100px)] overflow-y-auto backdrop-blur-xl border rounded-2xl z-40 animate-in slide-in-from-left-4 duration-300 ${bgClass}`}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Sliders className={labelClass} size={20} />
            <h2 className={`text-lg font-bold tracking-tight ${textClass}`}>Projection Sandbox</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleRandomize}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold transition-all ${theme === 'primal' ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              <RefreshCw size={14} /> Randomize
            </button>
            <button
              onClick={onReset}
              className="flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold bg-blue-600 text-white hover:bg-blue-500 transition-all"
            >
              <RotateCw size={14} /> Reset Petrie
            </button>
          </div>

          <section>
            <h3 className={`text-[10px] font-mono uppercase tracking-widest mb-3 ${labelClass}`}>Basis Configuration</h3>
            <div className="space-y-4">
              {['x', 'y'].map((axis) => (
                <div key={axis} className="space-y-2">
                  <div className="text-[9px] text-slate-500 uppercase font-bold">{axis}-Basis Projection</div>
                  <div className="grid grid-cols-4 gap-1">
                    {matrix[axis as 'x' | 'y'].map((val, i) => (
                      <div key={i} className="flex flex-col gap-1">
                        <input
                          type="range"
                          min="-1"
                          max="1"
                          step="0.1"
                          value={val}
                          onChange={(e) => handleSliderChange(axis as 'x' | 'y', i, parseFloat(e.target.value))}
                          className={`h-0.5 rounded-full appearance-none cursor-pointer ${sliderTrack}`}
                        />
                        <span className="text-[8px] font-mono text-slate-400 text-center">{(val >= 0 ? '+' : '') + val.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
             <button
               onClick={handleAnalyze}
               disabled={isAnalyzing}
               className={`w-full py-2.5 rounded-xl text-[10px] font-bold flex items-center justify-center gap-2 transition-all ${isAnalyzing ? 'bg-slate-800' : 'bg-indigo-600 hover:bg-indigo-500'} text-white shadow-lg`}
             >
               {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
               AI Symmetry Analysis
             </button>
             {analysis && (
               <div className={`p-3 rounded-lg border text-[9px] italic ${theme === 'primal' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' : 'bg-indigo-50 border-indigo-100 text-indigo-700'}`}>
                 {analysis.substring(0, 100)}...
                 <button onClick={handlePublish} className="mt-2 w-full py-1.5 rounded-md bg-amber-600 text-white font-bold flex items-center justify-center gap-1 hover:bg-amber-500">
                    <Upload size={10} /> Publish to Discovery Feed
                 </button>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectionSandbox;
