import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { purgeMemory } from "../actions/memory";

const execAsync = promisify(exec);

export default async function MemoryStats() {
  let stats = null;
  let error = null;

  try {
    // Determine path to python script (assuming dashboard is one level down from root)
    const scriptPath = path.resolve(process.cwd(), "../execution/vector_memory.py");
    const { stdout } = await execAsync(`python "${scriptPath}" stats`);
    const match = stdout.match(/\{[\s\S]*\}/);
    if (match) {
      stats = JSON.parse(match[0]);
    } else {
      stats = JSON.parse(stdout.trim());
    }
  } catch (err) {
    error = "Failed to load memory engine stats.";
  }

  if (error) {
    return (
      <div className="glass-card p-8 flex flex-col group relative overflow-hidden border-l-4 border-l-red-600/20">
        <h4 className="text-2xl font-bold text-[var(--foreground)] mb-2">Vector Memory v2</h4>
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  const total = stats?.total || 0;
  const sectors = stats?.sectors || {};
  const semantic = sectors.semantic || 0;
  const episodic = sectors.episodic || 0;
  const procedural = sectors.procedural || 0;

  return (
    <div className="glass-card p-8 flex flex-col group relative overflow-hidden border-l-4 border-l-blue-600/20 hover:border-l-blue-600 transition-all">
      <div className="absolute top-0 right-0 p-4 flex gap-2">
         <span className="text-[10px] font-mono text-blue-500">LIVE</span>
         <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
         </span>
      </div>
      
      <div className="flex gap-2 mb-4">
        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[var(--surface)] text-[var(--muted)] tracking-widest">OLLAMA</span>
        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[var(--surface)] text-[var(--muted)] tracking-widest">SQLITE</span>
      </div>
      
      <h4 className="text-2xl font-bold text-[var(--foreground)] mb-2 group-hover:text-blue-500 transition-colors">Vector Memory Engine</h4>
      <p className="text-sm text-[var(--muted)] leading-relaxed mb-6">Persistent semantic long-term storage.</p>
      
      <div className="grid grid-cols-3 gap-4 mb-6 flex-1">
        <div className="flex flex-col">
          <span className="text-3xl font-light text-[var(--foreground)]">{total}</span>
          <span className="text-[10px] tracking-widest text-[var(--faint)] uppercase">Total</span>
        </div>
        <div className="flex flex-col">
          <span className="text-3xl font-light text-[var(--foreground)]">{semantic}</span>
          <span className="text-[10px] tracking-widest text-[var(--faint)] uppercase">Semantic</span>
        </div>
        <div className="flex flex-col">
          <span className="text-3xl font-light text-[var(--foreground)]">{episodic}</span>
          <span className="text-[10px] tracking-widest text-[var(--faint)] uppercase">Episodic</span>
        </div>
      </div>

      <div className="flex gap-2 items-center mt-auto">
        <form action={purgeMemory.bind(null, 'all')}>
          <button type="submit" className="text-[9px] font-bold uppercase tracking-widest text-red-500/60 hover:text-red-500 transition-colors">Purge All</button>
        </form>
        <span className="text-[var(--border)]">|</span>
        <form action={purgeMemory.bind(null, 'short')}>
          <button type="submit" className="text-[9px] font-bold uppercase tracking-widest text-[var(--faint)] hover:text-[var(--foreground)] transition-colors">Wipe Short-Term</button>
        </form>
        <span className="text-[var(--border)]">|</span>
        <form action={purgeMemory.bind(null, 'long')}>
          <button type="submit" className="text-[9px] font-bold uppercase tracking-widest text-[var(--faint)] hover:text-[var(--foreground)] transition-colors">Wipe Long-Term</button>
        </form>
      </div>
    </div>
  );
}
