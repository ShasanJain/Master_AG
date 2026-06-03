'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { StatusBadge } from "../components/StatusBadge";
import { useRouter } from 'next/navigation';

interface Skill {
  title: string;
  status: 'OPTIMAL' | 'ACTIVE' | 'ERROR';
  desc: string;
  category: 'CORE' | 'AUTOMATION' | 'DESIGN' | 'SRE' | 'DEV' | 'PLANNING' | 'REVIEW' | 'MEDIA' | 'PRODUCTION' | 'MARKETING' | 'NEURAL';
  path?: string;
  href?: string;
}

const SKILLS_DATA: Skill[] = [
  // CORE
  { title: "writing-skills", status: "OPTIMAL", desc: "High-Density BLUF Communication for executive reports.", category: "CORE", path: "skills/meta/writing-skills" },
  { title: "find-skills", status: "OPTIMAL", desc: "Deep semantic search across the industrial module registry.", category: "CORE", path: "skills/meta/find-skills" },
  { title: "organize-skills", status: "OPTIMAL", desc: "Structural categorization of cognitive modules.", category: "CORE", path: "skills/meta/organize-skills" },
  { title: "caveman-protocol", status: "ACTIVE", desc: "Ultra-compressed token-saving communication protocol.", category: "CORE", path: "skills/meta/caveman" },
  { title: "using-superpowers", status: "OPTIMAL", desc: "Industrial agentic tool-use heuristics.", category: "CORE", path: "skills/meta/using-superpowers" },

  // SRE / OPS
  { title: "security-review", status: "OPTIMAL", desc: "Hardened audit trail for vulnerability detection in mission code.", category: "SRE", path: "skills/review/security-review" },
  { title: "systematic-debugging", status: "OPTIMAL", desc: "Scientific method approach to resolving complex state bugs.", category: "SRE", path: "skills/review/systematic-debugging" },
  { title: "qa-protocol", status: "OPTIMAL", desc: "CI/CD Verification: LINT + BUILD + TEST industrial audit.", category: "SRE", path: "skills/review/qa" },

  // AUTOMATION
  { title: "task-scheduler", status: "OPTIMAL", desc: "Industrial background cron engine for persistent missions.", category: "AUTOMATION", path: "skills/meta/task-scheduler" },
  { title: "doc-coauthoring", status: "ACTIVE", desc: "Real-time collaborative documentation generation.", category: "AUTOMATION", path: "skills/execution/doc-coauthoring" },
  { title: "postgres-dba", status: "OPTIMAL", desc: "Deep Postgres management and performance tuning.", category: "AUTOMATION", path: "skills/execution/postgres" },

  // DESIGN
  { title: "design-audit", status: "OPTIMAL", desc: "UX & Accessibility verification using premium design tokens.", category: "DESIGN", path: "skills/design/audit" },
  { title: "figma-connect", status: "OPTIMAL", desc: "Direct synchronization between Figma designs and code components.", category: "DESIGN", path: "skills/figma/figma-code-connect" },
  { title: "canvas-design", status: "ACTIVE", desc: "Interactive canvas-based layout generation engine.", category: "DESIGN", path: "skills/execution/canvas-design" },

  // PLANNING
  { title: "prd-to-plan", status: "OPTIMAL", desc: "Transform business requirements into technical implementation plans.", category: "PLANNING", path: "skills/planning/prd-to-plan" },
  { title: "brainstorming", status: "OPTIMAL", desc: "Divergent thinking engine for architectural creative sessions.", category: "PLANNING", path: "skills/planning/brainstorming" },
  { title: "writing-plans", status: "OPTIMAL", desc: "High-fidelity technical planning and SOP generation.", category: "PLANNING", path: "skills/planning/writing-plans" },

  // DEV
  { title: "deploy-vercel", status: "OPTIMAL", desc: "Production-ready deployment orchestrator for Vercel.", category: "DEV", path: "skills/execution/deploy-to-vercel" },
  { title: "scaffold-exercises", status: "OPTIMAL", desc: "Automatic generation of unit and integration test suites.", category: "DEV", path: "skills/execution/scaffold-exercises" },
  { title: "triage-issue", status: "OPTIMAL", desc: "High-speed GitHub issue categorization and prioritization.", category: "DEV", path: "skills/review/triage-issue" },

  // DASHBOARD TOOLS
  { title: "chat", status: "OPTIMAL", desc: "Neural conversation and thought exploration hub.", category: "NEURAL", href: "/chat" },
  { title: "memory", status: "ACTIVE", desc: "Persistent vector memory engine. Stores episodic, semantic, and procedural facts.", category: "NEURAL", href: "/memory" },
  { title: "reel-studio", status: "OPTIMAL", desc: "AI-powered timeline sequence editor with live preview, voice generation, and media processing.", category: "MEDIA", href: "/reel-studio" },
  { title: "audio-studio", status: "OPTIMAL", desc: "Professional DSP engine for mixing, equalization, and local audio stem rendering.", category: "PRODUCTION", href: "/audio-studio" },
  { title: "seo-analyzer", status: "OPTIMAL", desc: "Live page auditing, semantic structure mapping, and AI search (GEO) optimization engine.", category: "MARKETING", href: "/seo-analyzer" },
  { title: "incubator", status: "ACTIVE", desc: "Experimental core. Staging area for sovereign heuristics & neural growth.", category: "CORE", href: "/incubator" },
];

export default function SkillsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'ALL' | Skill['category']>('ALL');
  const [sortBy, setSortBy] = useState<'NAME' | 'STATUS'>('NAME');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [modalState, setModalState] = useState<'IDLE' | 'INITIALIZING' | 'SUCCESS' | 'SOURCE'>('IDLE');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedSkill(null);
        setModalState('IDLE');
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleInitialize = async () => {
    if (!selectedSkill) return;

    if (selectedSkill.href) {
      router.push(selectedSkill.href);
      return;
    }

    setModalState('INITIALIZING');
    
    // Simulate deployment delay
    setTimeout(async () => {
      try {
        await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mission: `Initialize ${selectedSkill.title}`,
            status: 'SUCCESS',
            agent: 'Jack-05',
            skill: selectedSkill.title
          })
        });
        setModalState('SUCCESS');
        setTimeout(() => setModalState('IDLE'), 3000);
      } catch (error) {
        console.error('Failed to log mission:', error);
        setModalState('IDLE');
      }
    }, 2000);
  };

  const handleViewSource = () => {
    setModalState('SOURCE');
  };

  const filteredSkills = useMemo(() => {
    return SKILLS_DATA
      .filter(skill => {
        const matchesSearch = skill.title.toLowerCase().includes(search.toLowerCase()) || 
                             skill.desc.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === 'ALL' || skill.category === category;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'NAME') return a.title.localeCompare(b.title);
        return a.status.localeCompare(b.status);
      });
  }, [search, category, sortBy]);

  const categories: ('ALL' | Skill['category'])[] = ['ALL', 'CORE', 'AUTOMATION', 'DESIGN', 'SRE', 'DEV', 'PLANNING', 'MEDIA', 'PRODUCTION', 'MARKETING', 'NEURAL'];

  return (
    <>
      <div className="atmospheric-orb orb-emerald"></div>
      <div className="atmospheric-orb orb-sapphire"></div>
      <div className="max-w-6xl mx-auto space-y-12 relative z-10 p-6">
        <section>
          <div className="flex items-center gap-4 mb-3">
            <h2 className="text-5xl font-bold tracking-tighter text-[var(--foreground)]">Skill Armory</h2>
            <StatusBadge status="PLATINUM-DENSITY" />
          </div>
          <p className="text-[var(--muted)] max-w-xl text-sm leading-relaxed">
            The complete cognitive arsenal of the Jack-05 engine. 151 modules currently registered in the industrial core.
          </p>
        </section>

      {/* Controls */}
      <section className="flex flex-col gap-6 border-b border-[var(--border)] pb-6 sticky top-0 bg-[var(--surface)]/95 backdrop-blur-md z-40 py-6 px-8 -mx-8">
        <div className="flex flex-col md:flex-row gap-6 items-end justify-between">
          <div className="w-full md:w-96 space-y-2">
            <label className="text-xs font-bold text-[var(--foreground)]/40 uppercase tracking-[0.2em]">Locate Module</label>
            <input 
              type="text" 
              placeholder="SEARCH BY NAME OR PROTOCOL..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-5 py-3 text-sm font-bold tracking-widest outline-none focus:border-[var(--primary)] transition-all placeholder:text-[var(--faint)] text-[var(--foreground)]"
            />
          </div>

          <div className="flex items-center gap-4 pb-1 shrink-0">
            <span className="text-xs font-bold text-[var(--foreground)]/40 uppercase tracking-widest">Sort:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-bold uppercase tracking-widest text-[var(--primary)] outline-none cursor-pointer"
            >
              <option value="NAME">Name (A-Z)</option>
              <option value="STATUS">Engine Status</option>
            </select>
          </div>
        </div>

        {/* Scrollable Category Ribbon with Minimal Controls */}
        <div className="flex items-center gap-1">
          <button onClick={() => scroll('left')} className="p-2 shrink-0 text-[var(--faint)] hover:text-[var(--foreground)] transition-all flex items-center justify-center opacity-50 hover:opacity-100">
            <span className="text-xl leading-none">‹</span>
          </button>
          
          <div ref={scrollContainerRef} className="flex overflow-x-auto custom-scrollbar gap-2 pb-2 snap-x scroll-smooth">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-6 py-3 shrink-0 rounded-lg text-xs font-bold uppercase tracking-widest transition-all border snap-start ${category === cat ? 'shiny-button active' : 'bg-[var(--surface)] border-[var(--border)] text-[var(--muted)] hover:bg-[var(--border)] hover:text-[var(--foreground)]'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button onClick={() => scroll('right')} className="p-2 shrink-0 text-[var(--faint)] hover:text-[var(--foreground)] transition-all flex items-center justify-center opacity-50 hover:opacity-100">
            <span className="text-xl leading-none">›</span>
          </button>
        </div>
      </section>

      {/* Results Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredSkills.map(skill => (
          <RegistryCard key={skill.title} {...skill} onClick={() => { setSelectedSkill(skill); setModalState('IDLE'); }} />
        ))}
        {filteredSkills.length === 0 && (
          <div className="col-span-full py-20 text-center glass-card bg-[var(--faint)] border-dashed border-2 border-[var(--faint)]">
            <p className="text-sm font-bold text-[var(--faint)] uppercase tracking-[0.3em]">No Modules Matching Current Protocol</p>
          </div>
        )}
      </section>

      {/* Skill Detail Modal */}
      {selectedSkill && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[var(--background)]/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => { setSelectedSkill(null); setModalState('IDLE'); }}>
          <div 
            className="glass-card bg-[var(--surface)] max-w-2xl w-full p-12 space-y-10 relative overflow-hidden border-[var(--border)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 right-0 p-8">
              <button onClick={() => { setSelectedSkill(null); setModalState('IDLE'); }} className="text-[var(--faint)] hover:text-[var(--foreground)] text-xl">×</button>
            </div>

            {modalState === 'SOURCE' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <h3 className="text-xl font-bold text-[var(--foreground)]">Source: {selectedSkill.title}.skill</h3>
                   <button onClick={() => setModalState('IDLE')} className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Back to Protocol</button>
                </div>
                <div className="bg-[var(--background)]/50 p-6 rounded-xl border border-[var(--border)] font-mono text-[10px] text-emerald-500/80 leading-relaxed overflow-y-auto max-h-[300px]">
                  <pre>
                    {`# ${selectedSkill.title}\n\ntrigger: manual\ncategory: ${selectedSkill.category}\n\n// Protocol Logic\ninitialize() {\n  audit_trail.log("initializing ${selectedSkill.title}");\n  system.allocate(MEM_DENSE);\n  return EXEC_OPTIMAL;\n}\n\n// Metadata\nregistry_path: "${selectedSkill.path}"\nstatus: "${selectedSkill.status}"`}
                  </pre>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <StatusBadge status={modalState === 'SUCCESS' ? 'SUCCESS' : selectedSkill.status} label={modalState === 'SUCCESS' ? 'DEPLOYED' : undefined} />
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{selectedSkill.category}</span>
                  </div>
                  <h3 className="text-6xl font-bold tracking-tighter text-[var(--foreground)]">{selectedSkill.title}</h3>
                  <p className="text-xl text-[var(--muted)] leading-relaxed font-medium">{selectedSkill.desc}</p>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-10 border-t border-[var(--faint)]">
                  <MetricItem label="Latency" value={modalState === 'INITIALIZING' ? "..." : "14ms"} status="OPTIMAL" />
                  <MetricItem label="Efficiency" value={modalState === 'INITIALIZING' ? "..." : "98.2%"} status="OPTIMAL" />
                  <MetricItem label="Registry" value={selectedSkill.path || "N/A"} full />
                </div>

                <div className="flex gap-4 pt-10">
                  <button 
                    disabled={modalState === 'INITIALIZING' || modalState === 'SUCCESS'}
                    onClick={handleInitialize}
                    className={`flex-1 py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all shiny-button ${modalState === 'INITIALIZING' ? 'opacity-50 animate-pulse cursor-wait' : modalState === 'SUCCESS' ? 'active' : ''}`}
                  >
                    {modalState === 'INITIALIZING' ? 'Deploying Protocol...' : modalState === 'SUCCESS' ? 'Protocol Synchronized' : 'Initialize Protocol'}
                  </button>
                  <button 
                    onClick={handleViewSource}
                    className="px-8 py-4 bg-[var(--faint)] hover:bg-[var(--faint)]/20 text-[var(--muted)] rounded-xl font-bold uppercase tracking-widest text-xs transition-all"
                  >
                    View Source
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
}

function RegistryCard({ title, status, desc, category, onClick }: Skill & { onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="glass-card p-8 flex flex-col group border-l-4 border-l-[var(--primary)]/20 hover:border-l-[var(--primary)] hover:border-[var(--primary)] transition-all cursor-pointer active:scale-95"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-1">
           <span className="text-xs font-bold text-[var(--faint)] uppercase tracking-widest">{category}</span>
           <h4 className="text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors font-bold text-lg leading-tight">{title}</h4>
        </div>
        <StatusBadge status={status} />
      </div>
      <p className="text-sm text-[var(--muted)] leading-relaxed flex-1 mb-8">{desc}</p>
      <div className="flex items-center justify-between pt-6 border-t border-[var(--faint)]">
        <span className="text-xs font-bold uppercase tracking-widest text-[var(--faint)] group-hover:text-[var(--foreground)] transition-colors">Inspect Module</span>
        <span className="text-xs font-bold uppercase tracking-widest text-[var(--primary)] group-hover:text-[var(--primary)]/80 transition-colors">Details →</span>
      </div>
    </div>
  );
}

function MetricItem({ label, value, status, full }: { label: string; value: string; status?: string; full?: boolean }) {
  return (
    <div className={full ? "col-span-2 space-y-2" : "space-y-2"}>
      <span className="text-[10px] font-bold text-[var(--faint)] uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-mono font-bold ${status === 'OPTIMAL' ? 'text-emerald-500' : 'text-[var(--muted)]'}`}>{value}</span>
      </div>
    </div>
  );
}
