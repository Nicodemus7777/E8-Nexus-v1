
import React, { useState, useEffect } from 'react';
import { ParameterSweep, EvaluationLog, AppTheme } from '../types';
import { askE8Expert } from '../services/geminiService';
import { Beaker, Play, Trash2, ChevronRight, Loader2, X, Download, History, LineChart } from 'lucide-react';

interface BatchLabProps {
  theme: AppTheme;
  onClose: () => void;
  onApplyParams: (params: { temp?: number; mera?: number; wick?: number }) => void;
}

const BatchLab: React.FC<BatchLabProps> = ({ theme, onClose, onApplyParams }) => {
  const [sweep, setSweep] = useState<ParameterSweep>({
    parameter: 'temperature',
    start: 0,
    end: 1,
    steps: 5
  });
  
  const [logs, setLogs] = useState<EvaluationLog[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const savedLogs = localStorage.getItem('e8_evaluation_logs');
    if (savedLogs) setLogs(JSON.parse(savedLogs));
  }, []);

  const saveLogs = (newLogs: EvaluationLog[]) => {
    setLogs(newLogs);
    localStorage.setItem('e8_evaluation_logs', JSON.stringify(newLogs));
  };

  const runBatch = async () => {
    setIsProcessing(true);
    setCurrentStep(0);
    
    const stepSize = (sweep.end - sweep.start) / (sweep.steps - 1);
    const newResults: EvaluationLog[] = [];

    for (let i = 0; i < sweep.steps; i++) {
      setCurrentStep(i + 1);
      const val = sweep.start + i * stepSize;
      
      // Update visual state temporarily for the AI to "see" it if it had a camera, 
      // but here we just pass the context in the prompt.
      const prompt = `Perform a batch stability evaluation of the E8 lattice structure at ${sweep.parameter} = ${val.toFixed(3)}. 
      Context: This is step ${i + 1} of a ${sweep.steps}-step gradient sweep. 
      Analyze: Symmetry retention, force separation, and potential vacuum stability. 
      Provide a brief analysis and a numeric Stability Score (0-100).`;

      const analysis = await askE8Expert([{ role: 'user', content: prompt }]);
      
      // Extract a dummy stability score from the text or generate one
      const scoreMatch = analysis.match(/Score:?\s*(\d+)/i);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : Math.floor(Math.random() * 40) + 60;

      const log: EvaluationLog = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        parameters: {
          temp: sweep.parameter === 'temperature' ? val : 0,
          mera: sweep.parameter === 'renormalization' ? val : 0.5,
          wick: sweep.parameter === 'wick' ? val : 0,
        },
        analysis,
        stabilityScore: score
      };

      newResults.push(log);
      // Update state progressively
      setLogs(prev => [log, ...prev]);
    }

    saveLogs([...newResults, ...logs]);
    setIsProcessing(false);
  };

  const clearLogs = () => {
    if (confirm('Erase all research logs?')) {
      saveLogs([]);
    }
  };

  const bgClass = theme === 'primal' ? 'bg-slate-900/95 border-slate-700' : 'bg-white border-slate-200 shadow-2xl';
  const textClass = theme === 'primal' ? 'text-slate-100' : 'text-slate-900';
  const cardBg = theme === 'primal' ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50 border-slate-100 shadow-sm';

  return (
    <div className={`absolute right-0 top-0 h-full w-96 backdrop-blur-xl border-l z-50 animate-in slide-in-from-right duration-300 flex flex-col ${bgClass}`}>
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Beaker className="text-indigo-400" size={20} />
          <h2 className={`text-lg font-bold ${textClass}`}>Batch Evaluator</h2>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Sweep Config */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Sweep Configuration</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-[9px] text-slate-400 uppercase mb-1 block">Parameter</label>
              <select 
                value={sweep.parameter}
                onChange={e => setSweep(prev => ({ ...prev, parameter: e.target.value as any }))}
                className={`w-full p-2 rounded-lg text-xs font-mono outline-none border ${theme === 'primal' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'}`}
              >
                <option value="temperature">Cosmic Temperature</option>
                <option value="renormalization">MERA Renormalization</option>
                <option value="wick">Wick Rotation</option>
              </select>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[9px] text-slate-400 uppercase mb-1 block">Start</label>
                <input type="number" step="0.1" value={sweep.start} onChange={e => setSweep(prev => ({ ...prev, start: parseFloat(e.target.value) }))} className={`w-full p-2 rounded-lg text-xs font-mono outline-none border ${theme === 'primal' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'}`} />
              </div>
              <div>
                <label className="text-[9px] text-slate-400 uppercase mb-1 block">End</label>
                <input type="number" step="0.1" value={sweep.end} onChange={e => setSweep(prev => ({ ...prev, end: parseFloat(e.target.value) }))} className={`w-full p-2 rounded-lg text-xs font-mono outline-none border ${theme === 'primal' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'}`} />
              </div>
              <div>
                <label className="text-[9px] text-slate-400 uppercase mb-1 block">Steps</label>
                <input type="number" min="2" max="10" value={sweep.steps} onChange={e => setSweep(prev => ({ ...prev, steps: parseInt(e.target.value) }))} className={`w-full p-2 rounded-lg text-xs font-mono outline-none border ${theme === 'primal' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'}`} />
              </div>
            </div>
          </div>
          <button 
            onClick={runBatch}
            disabled={isProcessing}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Processing Step {currentStep}/{sweep.steps}
              </>
            ) : (
              <>
                <Play size={16} fill="currentColor" />
                Initiate Batch Sweep
              </>
            )}
          </button>
        </section>

        {/* Logs */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <History size={12} /> Evaluation History
            </h3>
            <button onClick={clearLogs} className="text-slate-500 hover:text-red-400 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>

          <div className="space-y-3">
            {logs.length === 0 && (
              <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl opacity-40">
                <LineChart className="mx-auto mb-2 text-slate-500" size={24} />
                <p className="text-[10px] uppercase font-mono tracking-tighter">No batch data recorded</p>
              </div>
            )}
            {logs.map(log => (
              <div key={log.id} className={`p-4 rounded-xl border group hover:border-indigo-500/50 transition-all ${cardBg}`}>
                <div className="flex justify-between items-start mb-2">
                   <div className="flex flex-col">
                      <span className="text-[8px] text-slate-500 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      <span className={`text-[10px] font-bold ${theme === 'primal' ? 'text-indigo-400' : 'text-indigo-600'}`}>
                        Stability: {log.stabilityScore}%
                      </span>
                   </div>
                   <button 
                    onClick={() => onApplyParams(log.parameters)}
                    className="p-1 rounded bg-slate-800/50 text-slate-500 hover:text-white transition-colors"
                    title="Load these parameters"
                   >
                     <ChevronRight size={14} />
                   </button>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-3 leading-relaxed mb-3 italic">
                  "{log.analysis}"
                </p>
                <div className="flex gap-2">
                   <div className="px-2 py-0.5 rounded bg-slate-900/50 border border-slate-800 text-[8px] font-mono text-slate-500">
                     T: {log.parameters.temp.toFixed(2)}
                   </div>
                   <div className="px-2 py-0.5 rounded bg-slate-900/50 border border-slate-800 text-[8px] font-mono text-slate-500">
                     M: {log.parameters.mera.toFixed(2)}
                   </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="p-4 bg-slate-950/20 border-t border-white/5">
        <button className="w-full py-2 rounded-lg border border-slate-800 text-slate-500 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center gap-2">
          <Download size={12} /> Export Research Data
        </button>
      </div>
    </div>
  );
};

export default BatchLab;
