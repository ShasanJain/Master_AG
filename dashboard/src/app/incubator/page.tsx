export const dynamic = 'force-dynamic';

import { StatusBadge } from "../components/StatusBadge";
import MemoryStats from "./MemoryStats";
import SovereigntyPanel from "./SovereigntyPanel";

export default function IncubatorPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-12 p-8">
      {/* Header */}
      <section className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <h1 className="text-6xl font-black tracking-tighter text-white uppercase italic">Incubator</h1>
            <div className="px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-500 text-[10px] font-black tracking-[0.3em] uppercase shadow-[0_0_20px_rgba(245,158,11,0.1)]">
              Experimental Core
            </div>
          </div>
          <p className="text-xs font-bold text-white/30 uppercase tracking-[0.5em]">Staging area for sovereign heuristics & neural growth.</p>
        </div>
        <div className="text-right hidden md:block">
           <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest leading-relaxed">System Clock: {new Date().toISOString()}<br/>Status: Beta Stress Test</p>
        </div>
      </section>

      {/* Core Operations Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <MemoryStats />
        <SovereigntyPanel />
      </section>

      {/* Draft Skills */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
           <div className="h-px flex-1 bg-white/5" />
           <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.5em]">Draft Mission Registry</p>
           <div className="h-px flex-1 bg-white/5" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DraftCard 
            title="Autonomous Debugger" 
            progress={65} 
            desc="Self-healing code engine using real-time LSP analysis and backpropagation." 
            tags={["PYTHON", "LSP"]}
          />
          <DraftCard 
            title="Neural Auditor" 
            progress={12} 
            desc="Automated contradiction detection across vector memory sectors." 
            tags={["SEMANTIC", "AUDIT"]}
          />
          {/* Add New Prompt */}
          <div className="glass-card p-8 border-dashed border-2 border-white/5 flex flex-col items-center justify-center text-center space-y-6 hover:border-emerald-500/20 transition-all cursor-pointer group min-h-[280px]">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-2xl text-white/20 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-all">
              +
            </div>
            <div>
              <h3 className="text-sm font-bold text-white/40 group-hover:text-white transition-colors">Incubate New Mission</h3>
              <p className="text-[10px] font-mono text-white/20 mt-1">Scaffold a new industrial skill.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function DraftCard({ title, progress, desc, tags }: { title: string; progress: number; desc: string; tags: string[] }) {
  return (
    <div className="glass-card p-8 flex flex-col group relative overflow-hidden border-l-4 border-l-amber-600/20 hover:border-l-amber-600 transition-all min-h-[280px]">
      <div className="absolute top-0 right-0 p-4">
         <span className="text-[10px] font-mono text-amber-500/40">{progress}% STABLE</span>
      </div>
      <div className="flex gap-2 mb-6">
        {tags.map(tag => (
          <span key={tag} className="text-[9px] font-bold px-2 py-0.5 rounded bg-white/5 text-white/40 tracking-widest">{tag}</span>
        ))}
      </div>
      <h4 className="text-xl font-bold text-white mb-4 group-hover:text-amber-500 transition-colors">{title}</h4>
      <p className="text-xs text-white/50 leading-relaxed mb-8 flex-1">{desc}</p>
      
      <div className="space-y-4">
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-amber-600 transition-all duration-1000" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between items-center">
          <button className="text-[9px] font-bold uppercase tracking-widest text-white/20 hover:text-white transition-colors">Abort</button>
          <button className="px-4 py-2 rounded-lg bg-amber-600/10 border border-amber-600/20 text-[9px] font-bold text-amber-500 uppercase tracking-widest hover:bg-amber-600 hover:text-white transition-all">Continue</button>
        </div>
      </div>
    </div>
  );
}
