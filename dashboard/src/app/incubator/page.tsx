import { StatusBadge } from "../components/StatusBadge";

export default function IncubatorPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <section>
        <div className="flex items-center gap-4 mb-3">
          <h2 className="text-5xl font-bold tracking-tighter">Incubator</h2>
          <div className="px-2 py-0.5 rounded border border-amber-500/20 bg-amber-500/10 text-amber-500 text-[10px] font-bold tracking-widest uppercase">
            Laboratory
          </div>
        </div>
        <p className="text-[var(--muted)] max-w-xl text-sm leading-relaxed">
          Staging area for draft skills and experimental engine heuristics. Missions here are in <span className="text-amber-500/60 font-bold italic">BETA-STRESS-TESTING</span>.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <DraftCard 
          title="Autonomous Debugger" 
          progress={65} 
          desc="Self-healing code engine using real-time LSP analysis and backpropagation." 
          tags={["PYTHON", "LSP"]}
        />
        <DraftCard 
          title="Vector Memory v2" 
          progress={42} 
          desc="Long-term episodic memory for Jack using localized vector embeddings." 
          tags={["ML", "RAG"]}
        />
      </section>

      {/* New Project Prompt */}
      <section className="glass-card p-12 border-dashed border-2 border-[var(--border)] flex flex-col items-center justify-center text-center space-y-6 hover:border-blue-600/20 transition-all cursor-pointer group">
        <div className="w-16 h-16 rounded-full bg-[var(--surface)] flex items-center justify-center text-3xl group-hover:bg-blue-600/10 group-hover:text-blue-400 transition-all">
          +
        </div>
        <div>
          <h3 className="text-xl font-bold text-[var(--foreground)]">Incubate New Mission</h3>
          <p className="text-sm text-[var(--faint)]">Scaffold a new industrial skill or experimental tool.</p>
        </div>
      </section>
    </div>
  );
}

function DraftCard({ title, progress, desc, tags }: { title: string; progress: number; desc: string; tags: string[] }) {
  return (
    <div className="glass-card p-8 flex flex-col group relative overflow-hidden border-l-4 border-l-amber-600/20 hover:border-l-amber-600 transition-all">
      <div className="absolute top-0 right-0 p-4">
         <span className="text-[10px] font-mono text-amber-500/40">{progress}% STABLE</span>
      </div>
      <div className="flex gap-2 mb-6">
        {tags.map(tag => (
          <span key={tag} className="text-[9px] font-bold px-2 py-0.5 rounded bg-[var(--surface)] text-[var(--muted)] tracking-widest">{tag}</span>
        ))}
      </div>
      <h4 className="text-2xl font-bold text-[var(--foreground)] mb-4 group-hover:text-amber-500 transition-colors">{title}</h4>
      <p className="text-sm text-[var(--muted)] leading-relaxed mb-8 flex-1">{desc}</p>
      
      <div className="space-y-4">
        <div className="h-1 w-full bg-[var(--surface)] rounded-full overflow-hidden">
          <div className="h-full bg-amber-600 transition-all duration-1000" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between items-center">
          <button className="text-[10px] font-bold uppercase tracking-widest text-[var(--faint)] hover:text-[var(--foreground)] transition-colors">Abort Mission</button>
          <button className="px-4 py-2 rounded-lg bg-amber-600/10 border border-amber-600/20 text-[10px] font-bold text-amber-500 uppercase tracking-widest hover:bg-amber-600 hover:text-white transition-all">Continue Research</button>
        </div>
      </div>
    </div>
  );
}
