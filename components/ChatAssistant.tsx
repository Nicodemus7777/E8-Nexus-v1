
import React, { useState, useRef, useEffect } from 'react';
import { askE8Expert, simulateInteraction } from '../services/geminiService';
import { ChatMessage, Node2D, AppTheme, TopologicalDefect, EntangledPair, ProjectionMatrix } from '../types';
import { Send, Sparkles, Loader2, User, Bot, FlaskConical, X, Zap, Spline, Share2, Telescope } from 'lucide-react';

interface ChatAssistantProps {
  simulationQueue: Node2D[];
  removeFromQueue: (node: Node2D) => void;
  clearQueue: () => void;
  theme: AppTheme;
  isBreakingLabActive?: boolean;
  activeDefect?: TopologicalDefect | null;
  entangledPair?: EntangledPair | null;
  ripplePulse?: number;
  currentMatrix?: ProjectionMatrix;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ simulationQueue, removeFromQueue, clearQueue, theme, isBreakingLabActive, activeDefect, entangledPair, ripplePulse, currentMatrix }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: "Welcome to the Nexus. I am an observer of the E8 lattice. How can I assist your exploration of the 'Theory of Everything'?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle Defect Explanation
  useEffect(() => {
    if (activeDefect && isBreakingLabActive) {
      const explainDefect = async () => {
        setIsLoading(true);
        const prompt = `A ${activeDefect.type} topological defect has been injected into the E8 lattice with a strength of ${activeDefect.strength}. Explain how this breaks the E8 symmetry and which particles might gain mass via the Higgs mechanism in this specific configuration.`;
        const response = await askE8Expert([...messages, { role: 'user', content: prompt }]);
        setMessages(prev => [...prev, { role: 'model', content: response }]);
        setIsLoading(false);
      };
      explainDefect();
    }
  }, [activeDefect]);

  // Handle Matrix Updates (Automatic Symmetry Watch)
  useEffect(() => {
    if (currentMatrix && Math.random() > 0.95) { // Occasional AI observation
        const watchSymmetry = async () => {
          setIsLoading(true);
          const prompt = `Observing a new projection coordinate shift. X-basis sum: ${currentMatrix.x.reduce((a, b) => a + b, 0)}. 
          Comment briefly on the stability of the lattice at these coordinates. Is a 'High Symmetry Event' likely?`;
          const response = await askE8Expert([...messages, { role: 'user', content: prompt }]);
          setMessages(prev => [...prev, { role: 'model', content: response }]);
          setIsLoading(false);
        };
        watchSymmetry();
    }
  }, [currentMatrix]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const response = await askE8Expert([...messages, userMsg]);
    setMessages(prev => [...prev, { role: 'model', content: response }]);
    setIsLoading(false);
  };

  const runSimulation = async () => {
    if (simulationQueue.length < 1 || isLoading) return;
    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: `Simulating interaction between ${simulationQueue.length} particles.` }]);
    const result = await simulateInteraction(simulationQueue);
    setMessages(prev => [...prev, { role: 'model', content: result || "Simulation failed to converge." }]);
    setIsLoading(false);
  };

  const panelBg = theme === 'primal' ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-inner';
  const textClass = theme === 'primal' ? 'text-slate-100' : 'text-slate-900';
  const stageBg = theme === 'primal' ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-sm';
  const botBubble = theme === 'primal' ? 'bg-slate-800 border-slate-700/50 text-slate-200' : 'bg-white border-slate-100 text-slate-800 shadow-sm';
  const userBubble = theme === 'primal' ? 'bg-blue-700 text-white' : 'bg-blue-600 text-white shadow-md';
  const inputBg = theme === 'primal' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900';

  return (
    <div className={`flex flex-col h-full border-l transition-colors duration-500 ${panelBg}`}>
      <div className={`p-4 border-b flex items-center justify-between ${theme === 'primal' ? 'border-slate-800' : 'border-slate-100'}`}>
        <div className="flex items-center gap-2">
          <Sparkles className={`w-5 h-5 ${theme === 'primal' ? 'text-yellow-500' : 'text-yellow-600'}`} />
          <h2 className={`font-semibold ${textClass}`}>Nexus Intel</h2>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Telescope size={10} /> CLOUD
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-blue-600 shadow-lg' : (theme === 'primal' ? 'bg-slate-700' : 'bg-slate-100 border border-slate-200')}`}>
              {m.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className={theme === 'primal' ? 'text-slate-200' : 'text-slate-600'} />}
            </div>
            <div className={`p-3 rounded-2xl max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap border ${
              m.role === 'user' ? `${userBubble} rounded-tr-none border-transparent` : `${botBubble} rounded-tl-none`
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${theme === 'primal' ? 'bg-slate-700' : 'bg-slate-100'}`}>
              <Loader2 size={16} className="animate-spin text-blue-400" />
            </div>
            <div className={`p-3 rounded-2xl text-sm italic ${theme === 'primal' ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
              Parsing cloud data...
            </div>
          </div>
        )}
      </div>

      {simulationQueue.length > 0 && (
        <div className={`p-3 border-t animate-in slide-in-from-bottom duration-300 ${stageBg}`}>
          <button 
            onClick={runSimulation}
            disabled={isLoading || simulationQueue.length < 2}
            className={`w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${theme === 'primal' ? 'bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white' : 'bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white'}`}
          >
            <Zap size={14} className={simulationQueue.length >= 2 ? (theme === 'primal' ? 'text-yellow-400' : 'text-yellow-300') : ''} />
            Simulate Particle Interaction
          </button>
        </div>
      )}

      <div className={`p-4 transition-colors ${theme === 'primal' ? 'bg-slate-950/50' : 'bg-slate-50'}`}>
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Search lattice intel..."
            className={`w-full rounded-full py-2.5 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 transition-all ${inputBg} ${theme === 'primal' ? 'focus:ring-blue-500/50' : 'focus:ring-blue-400/30'}`}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-1.5 top-1.5 p-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-full"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;
