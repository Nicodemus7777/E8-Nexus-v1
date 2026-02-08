
import React from 'react';
import { RefreshCw, RotateCw } from 'lucide-react';
import { ProjectionMatrix, AppTheme } from '../types';

interface ProjectionSandboxProps {
  matrix: ProjectionMatrix;
  onChange: (matrix: ProjectionMatrix) => void;
  theme: AppTheme;
  onReset: () => void;
}

const ProjectionSandbox: React.FC<ProjectionSandboxProps> = ({ matrix, onChange, theme, onReset }) => {
  const handleSliderChange = (axis: 'x' | 'y', index: number, value: number) => {
    const newMatrix = { ...matrix };
    newMatrix[axis] = [...newMatrix[axis]];
    newMatrix[axis][index] = value;
    onChange(newMatrix);
  };

  const handleRandomize = () => {
    const random = () => parseFloat((Math.random() * 2 - 1).toFixed(2));
    onChange({
      x: Array.from({ length: 8 }, random),
      y: Array.from({ length: 8 }, random),
    });
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-300">
      <div className="grid grid-cols-2 gap-2">
        <button onClick={handleRandomize} className="flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all uppercase tracking-widest"><RefreshCw size={12}/> Random</button>
        <button onClick={onReset} className="flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-all uppercase tracking-widest border border-blue-500/30"><RotateCw size={12}/> Petrie</button>
      </div>

      {['x', 'y'].map((axis) => (
        <section key={axis}>
          <h3 className="text-[10px] font-mono uppercase tracking-widest mb-4 text-slate-500">{axis}-Axis Mapping</h3>
          <div className="space-y-4">
            {matrix[axis as 'x' | 'y'].map((val, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-[8px] font-mono text-slate-500 w-4">D{i+1}</span>
                <input
                  type="range" min="-1" max="1" step="0.05"
                  value={val}
                  onChange={(e) => handleSliderChange(axis as 'x' | 'y', i, parseFloat(e.target.value))}
                  className="flex-1 h-1 bg-slate-800 rounded-full appearance-none accent-blue-500 cursor-pointer"
                />
                <span className="text-[10px] font-mono text-blue-400 w-8 text-right">{val.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default ProjectionSandbox;
