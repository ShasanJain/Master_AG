export default function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <section>
        <h2 className="text-4xl font-bold tracking-tight mb-2">Command Center</h2>
        <p className="text-white/40">Sovereign Engine Status: <span className="text-emerald-500 font-mono">OPTIMAL</span></p>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Registry Density" value="512" unit="Skills" />
        <StatCard label="Active Missions" value="03" unit="Tasks" />
        <StatCard label="Token Efficiency" value="94.2" unit="%" />
        <StatCard label="Uptime" value="142" unit="Hrs" />
      </section>

      {/* Skill Armory Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h3 className="text-xl font-bold uppercase tracking-widest text-white/80">Skill Armory</h3>
          <button className="text-xs text-blue-400 font-bold hover:text-blue-300 transition-colors">VIEW ALL SKILLS</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkillCard 
            title="Polyglot Master" 
            desc="Industrial execution in 22+ languages. Focus on memory safety and idiomatic patterns." 
            category="CODE"
          />
          <SkillCard 
            title="Incident Command" 
            desc="Outage management, rapid debugging, and system restoration protocol." 
            category="SRE"
          />
          <SkillCard 
            title="YouTube Visuals" 
            desc="High-CTR Engine: Generates viral thumbnails using 2026 visual psychology." 
            category="DESIGN"
          />
        </div>
      </section>

      {/* Terminal Footer */}
      <section className="glass-card p-4 border-l-4 border-l-blue-600 bg-blue-600/5">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded bg-blue-600/20 flex items-center justify-center text-blue-400 font-mono font-bold">/</div>
          <input 
            type="text" 
            placeholder="Type a command to orchestrate the swarm..." 
            className="bg-transparent border-none outline-none flex-1 text-sm text-white/80 placeholder:text-white/20"
          />
          <span className="text-[10px] font-mono text-white/20 uppercase">Press Enter to Dispatch</span>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="glass-card p-6">
      <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-white tracking-tighter">{value}</span>
        <span className="text-[10px] uppercase text-blue-400 font-bold">{unit}</span>
      </div>
    </div>
  );
}

function SkillCard({ title, desc, category }: { title: string; desc: string; category: string }) {
  return (
    <div className="glass-card p-6 flex flex-col h-full group">
      <div className="flex justify-between items-start mb-4">
        <h4 className="font-bold text-lg leading-tight group-hover:text-blue-400 transition-colors">{title}</h4>
        <span className="text-[10px] font-bold px-2 py-1 rounded bg-white/5 text-white/40">{category}</span>
      </div>
      <p className="text-sm text-white/50 leading-relaxed mb-6 flex-1">{desc}</p>
      <button className="w-full py-2 rounded-md bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-blue-600 hover:border-blue-500 transition-all">
        Load Skill
      </button>
    </div>
  );
}
