'use client';

import React, { useState } from 'react';

export default function SovereigntyPanel() {
  const [fileAgency, setFileAgency] = useState(true);
  const [safetyGate, setSafetyGate] = useState(true);
  const [syncRate, setSyncRate] = useState(85);
  const [evolvingMode, setEvolvingMode] = useState('autonomous'); // safe, autonomous, aggressive
  const [successMsg, setSuccessMsg] = useState('');

  const handleApply = () => {
    setSuccessMsg('Sovereignty policy applied and synched to Jack Heuristics.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="glass-card p-8 flex flex-col group relative overflow-hidden border-l-4 border-l-emerald-600/20 hover:border-l-emerald-600 transition-all min-h-[350px] bg-black/40 backdrop-blur-md rounded-xl text-white">
      {/* Live Badge */}
      <div className="absolute top-0 right-0 p-4 flex gap-2">
         <span className="text-[10px] font-mono text-emerald-500">ACTIVE</span>
         <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
         </span>
      </div>
      
      {/* Category Tags */}
      <div className="flex gap-2 mb-4">
        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-white/5 text-white/40 tracking-widest uppercase">Cognitive Security</span>
        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-white/5 text-white/40 tracking-widest uppercase">Fractal Policies</span>
      </div>
      
      {/* Header */}
      <h4 className="text-2xl font-black text-white mb-2 group-hover:text-emerald-500 transition-colors uppercase italic tracking-tight">Sovereignty Control</h4>
      <p className="text-xs text-white/40 leading-relaxed mb-6">Manage autonomous decision levels and safety bounds.</p>
      
      {/* Controls Grid */}
      <div className="space-y-5 flex-1">
        {/* Toggle 1: File Agency */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:border-emerald-500/20 transition-all">
          <div>
            <span className="text-xs font-bold block">File System Agency</span>
            <span className="text-[9px] text-white/40">Allows the agent to write & edit workspace files</span>
          </div>
          <button 
            onClick={() => setFileAgency(!fileAgency)}
            className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ${fileAgency ? 'bg-emerald-600' : 'bg-white/10'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${fileAgency ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Toggle 2: Safety Gate */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:border-emerald-500/20 transition-all">
          <div>
            <span className="text-xs font-bold block">Strict Validation Gate</span>
            <span className="text-[9px] text-white/40">Blocks output deployment on lint/build failure</span>
          </div>
          <button 
            onClick={() => setSafetyGate(!safetyGate)}
            className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ${safetyGate ? 'bg-emerald-600' : 'bg-white/10'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${safetyGate ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Slider: Neural Sync Rate */}
        <div className="space-y-2 p-3 rounded-lg bg-white/5 border border-white/5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold">Neural Sync Rate</span>
            <span className="font-mono text-emerald-500 font-bold">{syncRate}%</span>
          </div>
          <input 
            type="range" 
            min="20" 
            max="100" 
            value={syncRate} 
            onChange={(e) => setSyncRate(Number(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-[8px] text-white/30 font-mono">
            <span>STABLE</span>
            <span>HYPER-EVOLVING</span>
          </div>
        </div>

        {/* Radio/Selector: Evolving Mode */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold text-white/30 tracking-wider">Evolutionary Profile</span>
          <div className="grid grid-cols-3 gap-2">
            {['safe', 'autonomous', 'aggressive'].map((mode) => (
              <button
                key={mode}
                onClick={() => setEvolvingMode(mode)}
                className={`py-2 px-3 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all ${
                  evolvingMode === mode 
                    ? 'bg-emerald-600/10 border-emerald-500 text-emerald-400' 
                    : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Success Alert */}
      {successMsg && (
        <div className="mt-4 p-3 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 uppercase tracking-wider text-center animate-fade-in font-black">
          {successMsg}
        </div>
      )}

      {/* Action Area */}
      <div className="flex gap-2 items-center mt-6 pt-4 border-t border-white/5">
        <button 
          onClick={handleApply}
          className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-[10px] font-black uppercase tracking-wider text-white transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] ml-auto"
        >
          Apply Policy
        </button>
      </div>
    </div>
  );
}
