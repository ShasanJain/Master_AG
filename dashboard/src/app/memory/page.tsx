export const dynamic = 'force-dynamic';

import MemoryStats from "../incubator/MemoryStats";
import { execSync } from "child_process";
import path from "path";
import { purgeMemory } from "../actions/memory";
import { getConfig } from "../actions/config";

async function MemoryList() {
  let memories = [];
  try {
    const scriptPath = path.resolve(process.cwd(), "../execution/vector_memory.py");
    const output = execSync(`python ${scriptPath} list --json`, { encoding: 'utf-8' });
    memories = JSON.parse(output.trim());
  } catch (err) {
    return <p className="text-red-500">Failed to load memory matrix.</p>;
  }

  if (!memories || memories.length === 0) {
    return (
      <div className="glass-card p-12 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[var(--surface)] flex items-center justify-center text-2xl text-[var(--faint)]">
          ∅
        </div>
        <div>
          <p className="text-sm font-bold text-[var(--foreground)] uppercase tracking-widest">Neural Void</p>
          <p className="text-xs text-[var(--faint)]">No cognitive traces detected in the current sector.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {memories.map((mem: any, i: number) => {
        const isEpisodic = mem.sector === 'episodic';
        const isSemantic = mem.sector === 'semantic';
        const isProcedural = mem.sector === 'procedural';
        
        const accentColor = isEpisodic ? 'border-l-blue-500' : isSemantic ? 'border-l-purple-500' : 'border-l-emerald-500';
        const glowColor = isEpisodic ? 'text-blue-500/40' : isSemantic ? 'text-purple-500/40' : 'text-emerald-500/40';

        return (
          <div key={mem.id || i} className={`glass-card p-6 flex flex-col group relative overflow-hidden border-l-4 ${accentColor} hover:shadow-[0_0_30px_-10px] hover:shadow-current transition-all duration-500`}>
            <div className="absolute top-0 right-0 p-3">
               <span className={`text-[9px] font-mono ${glowColor}`}>ID: {mem.id?.substring(0, 8)}</span>
            </div>
            <div className="flex gap-2 mb-4">
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded bg-[var(--surface)] ${isEpisodic ? 'text-blue-400' : isSemantic ? 'text-purple-400' : 'text-emerald-400'} tracking-widest uppercase`}>
                {mem.sector}
              </span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[var(--surface)] text-[var(--muted)] tracking-widest uppercase">
                SCORE: {(mem.score || 0).toFixed(2)}
              </span>
            </div>
            <p className="text-sm text-[var(--foreground)] leading-relaxed flex-1 italic font-light">
              "{mem.content}"
            </p>
            <div className="mt-6 pt-4 border-t border-[var(--border)] flex justify-between items-center">
               <span className="text-[8px] text-[var(--faint)] uppercase font-mono">{new Date().toLocaleDateString()}</span>
               <form action={purgeMemory.bind(null, 'id', mem.id)}>
                 <button type="submit" className="text-[9px] font-bold uppercase tracking-widest text-red-500/20 hover:text-red-500 transition-colors">
                   Forget Trace
                 </button>
               </form>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default async function MemoryPage() {
  const config = await getConfig(['OLLAMA_MODEL', 'LOCAL_INFERENCE']);
  const activeModel = config['OLLAMA_MODEL'] || 'llama3.2';
  const isLocal = config['LOCAL_INFERENCE'] === 'true';

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-3">
            <h2 className="text-5xl font-bold tracking-tighter text-[var(--foreground)]">Cognitive Memory</h2>
            <div className="flex gap-2">
              <div className="px-2 py-0.5 rounded border border-blue-500/20 bg-blue-500/10 text-blue-500 text-[10px] font-bold tracking-widest uppercase">
                v2.0 Active
              </div>
              <div className={`px-2 py-0.5 rounded border ${isLocal ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500' : 'border-amber-500/20 bg-amber-500/10 text-amber-500'} text-[10px] font-bold tracking-widest uppercase`}>
                {isLocal ? `LOCAL: ${activeModel}` : 'HYBRID MODE'}
              </div>
            </div>
          </div>
          <p className="text-[var(--muted)] max-w-xl text-sm leading-relaxed">
            Persistent vector memory engine. Stores episodic, semantic, and procedural facts using Ollama embeddings and local SQLite.
          </p>
        </div>

        {/* Memory Legend */}
        <div className="glass-card p-4 flex gap-6 border-dashed">
          <LegendItem 
            label="Episodic" 
            desc="Short-term / Events" 
            color="bg-blue-500" 
          />
          <LegendItem 
            label="Semantic" 
            desc="Long-term / Facts" 
            color="bg-purple-500" 
          />
          <LegendItem 
            label="Procedural" 
            desc="Action / Skills" 
            color="bg-emerald-500" 
          />
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <MemoryStats />
        </div>
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
            <h3 className="text-xl font-bold text-[var(--foreground)] tracking-tighter">Neural Access Matrix</h3>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">Real-time Stream</span>
            </div>
          </div>
          <MemoryList />
        </div>
      </section>
    </div>
  );
}

function LegendItem({ label, desc, color }: { label: string; desc: string; color: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`w-1 h-8 rounded-full ${color}`}></div>
      <div>
        <p className="text-[10px] font-bold text-[var(--foreground)] uppercase tracking-wider">{label}</p>
        <p className="text-[9px] text-[var(--faint)] whitespace-nowrap">{desc}</p>
      </div>
    </div>
  );
}
