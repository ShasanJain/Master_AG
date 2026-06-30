'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { StatusBadge } from "../components/StatusBadge";
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { openInEditor } from '../actions/skills';
import type { Skill } from '../actions/skills';

const categoryDescriptions: Record<string, string> = {
  CORE: "Core foundational capabilities and heuristics.",
  NEURAL: "Persistent memory, reasoning, and context engines.",
  DESIGN: "UX, UI, and aesthetic mastery modules.",
  AUTOMATION: "Background execution and persistent workflows.",
  SRE: "Security, reliability, and operations audits.",
  DEV: "Code execution, compilation, and deployment pipelines.",
  PLANNING: "Strategic layout and architectural planning.",
  MEDIA: "Video, timeline, and sequencing tools.",
  PRODUCTION: "Audio and deep rendering engines.",
  MARKETING: "SEO, growth, and analytics systems.",
  COMMAND: "Core action protocols, agents, and scrapers.",
  STUDIO: "Aesthetic interfaces, sandboxes, and media studios.",
  MONITOR: "Telemetry dashboards, logs, and system health checks.",
  CONFIGURE: "Agent brain settings, memory profiles, and skills."
};

const getCategoryColor = (cat: string) => {
  const designCats = ['DESIGN', 'MEDIA', 'PRODUCTION', 'STUDIO'];
  const engCats = ['DEV', 'SRE', 'AUTOMATION', 'MONITOR'];
  const coreCats = ['CORE', 'NEURAL', 'PLANNING', 'COMMAND'];
  const marketingCats = ['MARKETING', 'CONFIGURE'];

  if (designCats.includes(cat)) return { text: 'text-fuchsia-500', border: 'border-fuchsia-500/30', hover: 'hover:border-fuchsia-500', bg: 'bg-fuchsia-500/10' };
  if (engCats.includes(cat)) return { text: 'text-blue-500', border: 'border-blue-500/30', hover: 'hover:border-blue-500', bg: 'bg-blue-500/10' };
  if (coreCats.includes(cat)) return { text: 'text-emerald-500', border: 'border-emerald-500/30', hover: 'hover:border-emerald-500', bg: 'bg-emerald-500/10' };
  if (marketingCats.includes(cat)) return { text: 'text-amber-500', border: 'border-amber-500/30', hover: 'hover:border-amber-500', bg: 'bg-amber-500/10' };
  
  return { text: 'text-slate-400', border: 'border-slate-400/30', hover: 'hover:border-slate-400', bg: 'bg-slate-400/10' };
};

export default function SkillsClient({ initialSkills }: { initialSkills: Skill[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'NAME' | 'STATUS'>('NAME');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [modalState, setModalState] = useState<'IDLE' | 'INITIALIZING' | 'SUCCESS' | 'SOURCE'>('IDLE');
  const [isSyncing, setIsSyncing] = useState(false);
  const [browserDeployableOnly, setBrowserDeployableOnly] = useState(false);
  
  // Compact state (tiles minimized) starts as TRUE
  const [globalCompactState, setGlobalCompactState] = useState<Record<string, boolean>>({});
  // Collapsed state (grid hidden) starts as TRUE to save space
  const [categoryCollapsed, setCategoryCollapsed] = useState<Record<string, boolean>>({});

  // Sync category state and auto-expand category from query parameter
  useEffect(() => {
    const queryCat = searchParams.get('category');
    if (queryCat) {
      setCategory(queryCat);
      setBrowserDeployableOnly(true);
      
      // Auto-expand any category matching the section mapping
      const designCats = ['DESIGN', 'MEDIA', 'PRODUCTION', 'STUDIO'];
      const engCats = ['DEV', 'SRE', 'AUTOMATION', 'MONITOR'];
      const coreCats = ['CORE', 'NEURAL', 'PLANNING', 'COMMAND', 'CONTENT'];
      const marketingCats = ['MARKETING', 'CONFIGURE'];

      let subCats: string[] = [];
      if (queryCat === 'STUDIO') subCats = designCats;
      else if (queryCat === 'MONITOR') subCats = engCats;
      else if (queryCat === 'COMMAND') subCats = coreCats;
      else if (queryCat === 'CONFIGURE') subCats = marketingCats;
      else subCats = [queryCat];

      setCategoryCollapsed(prev => {
        const next = { ...prev };
        subCats.forEach(c => {
          next[c] = false;
        });
        return next;
      });
    }
  }, [searchParams]);

  const isCategoryCompact = (cat: string) => globalCompactState[cat] ?? true;
  const toggleCategoryCompact = (cat: string) => setGlobalCompactState(prev => ({...prev, [cat]: !isCategoryCompact(cat)}));
  
  const isCategoryCollapsed = (cat: string) => categoryCollapsed[cat] ?? true;
  const toggleCategoryCollapsed = (cat: string) => setCategoryCollapsed(prev => ({...prev, [cat]: !isCategoryCollapsed(cat)}));

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
    if (!selectedSkill.path) return;
    
    setModalState('INITIALIZING');
    try {
      const success = await openInEditor(selectedSkill.path);
      if (success) {
        setModalState('SUCCESS');
        setTimeout(() => setModalState('IDLE'), 2000);
      } else {
        console.error('Failed to open editor');
        setModalState('IDLE');
        alert("Failed to open VS Code. Is 'code' in your PATH?");
      }
    } catch (error) {
      console.error('Failed to open editor:', error);
      setModalState('IDLE');
    }
  };

  const handleViewSource = () => {
    setModalState('SOURCE');
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await fetch('/api/sync', { method: 'POST' });
      // UI feedback, then revert
      setTimeout(() => setIsSyncing(false), 2000);
    } catch (e) {
      console.error('Failed to sync:', e);
      setIsSyncing(false);
    }
  };

  const groupedSkills = useMemo(() => {
    // Map backend database categories to the 4 visual sidebar sections
    const getTaxonomySection = (cat: string): string => {
      const designCats = ['DESIGN', 'MEDIA', 'PRODUCTION', 'STUDIO'];
      const engCats = ['DEV', 'SRE', 'AUTOMATION', 'MONITOR'];
      const coreCats = ['CORE', 'NEURAL', 'PLANNING', 'COMMAND', 'CONTENT'];
      const marketingCats = ['MARKETING', 'CONFIGURE'];

      if (designCats.includes(cat)) return 'STUDIO';
      if (engCats.includes(cat)) return 'MONITOR';
      if (coreCats.includes(cat)) return 'COMMAND';
      if (marketingCats.includes(cat)) return 'CONFIGURE';
      return cat;
    };

    const filtered = initialSkills
      .filter(skill => {
        const matchesSearch = skill.title.toLowerCase().includes(search.toLowerCase()) || 
                             skill.desc.toLowerCase().includes(search.toLowerCase());
        
        // Match either direct category OR sidebar taxonomy section
        const taxSection = getTaxonomySection(skill.category);
        const matchesCategory = category === 'ALL' || 
                                skill.category === category || 
                                taxSection === category;
                                
        const matchesDeployable = !browserDeployableOnly || !!skill.href;
        return matchesSearch && matchesCategory && matchesDeployable;
      })
      .sort((a, b) => {
        if (sortBy === 'NAME') return a.title.localeCompare(b.title);
        return a.status.localeCompare(b.status);
      });

    const groups: Record<string, Skill[]> = {};
    for (const skill of filtered) {
      if (!groups[skill.category]) groups[skill.category] = [];
      groups[skill.category].push(skill);
    }
    
    const sortedGroups: Record<string, Skill[]> = {};
    Object.keys(groups).sort().forEach(k => {
      sortedGroups[k] = groups[k];
    });
    return sortedGroups;
  }, [initialSkills, search, category, sortBy, browserDeployableOnly]);

  const availableCategories = useMemo(() => {
    const cats = new Set(initialSkills.map(s => s.category));
    return ['ALL', ...Array.from(cats).sort()];
  }, [initialSkills]);

  return (
    <>
      <div className="atmospheric-orb orb-emerald"></div>
      <div className="atmospheric-orb orb-sapphire"></div>
      
      <div className="max-w-6xl mx-auto space-y-8 relative z-10 p-6">
        
        <section className="mb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <h2 className="text-5xl font-bold tracking-tighter text-[var(--foreground)]">Skill Armory</h2>
              <StatusBadge status="PLATINUM-DENSITY" />
            </div>
            <p className="text-[var(--muted)] max-w-xl text-sm leading-relaxed mb-6">
              The complete cognitive arsenal of the Antigravity engine. Monitoring {initialSkills.length} active modules across the system architecture.
            </p>
            <div className="flex flex-wrap gap-3">
              {Object.entries(groupedSkills).map(([cat, skills]) => {
                const colors = getCategoryColor(cat);
                return (
                  <div key={cat} className="px-3 py-1.5 bg-[var(--surface)]/50 backdrop-blur-md border border-[var(--border)] rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm">
                    <span className={`${colors.text}`}>{cat}</span>
                    <span className="text-[var(--muted)]">|</span>
                    <span className="text-[var(--foreground)]">{skills.length}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className={`px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border shrink-0 ${isSyncing ? 'shiny-button active cursor-wait opacity-80' : 'bg-[var(--surface)] border-[var(--border)] hover:border-[var(--primary)] text-[var(--foreground)] shadow-lg'}`}
          >
            {isSyncing ? 'Syncing Vault...' : 'Sync Vault'}
          </button>
        </section>

        {/* Floating Filter Ribbon (Container Margins + Iconography) */}
        <section className="sticky top-6 z-40">
          <div className="bg-[var(--surface)]/90 backdrop-blur-xl border border-[var(--border)] rounded-3xl p-5 shadow-2xl flex flex-col gap-5">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              
              {/* Search */}
              <div className="w-full md:w-96 relative">
                 <svg className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--faint)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                 </svg>
                <input 
                  type="text" 
                  placeholder="SEARCH PROTOCOLS..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl pl-11 pr-5 py-3 text-xs font-bold tracking-widest outline-none focus:border-[var(--primary)] transition-all placeholder:text-[var(--faint)] text-[var(--foreground)]"
                />
              </div>
              
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4">
                <label className="flex items-center gap-2 bg-[var(--background)] border border-[var(--border)] rounded-2xl px-4 py-3 cursor-pointer hover:border-[var(--primary)] transition-colors">
                  <input 
                    type="checkbox" 
                    className="accent-[var(--primary)] w-4 h-4 cursor-pointer" 
                    checked={browserDeployableOnly} 
                    onChange={e => setBrowserDeployableOnly(e.target.checked)} 
                  />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)] whitespace-nowrap">Browser Deployable</span>
                </label>
                
                <div className="flex items-center gap-2 bg-[var(--background)] border border-[var(--border)] rounded-2xl px-4 py-3">
                  <svg className="w-4 h-4 text-[var(--faint)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'NAME' | 'STATUS')}
                    className="bg-transparent text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)] outline-none cursor-pointer"
                  >
                    <option value="NAME">Sort: A-Z</option>
                    <option value="STATUS">Sort: Status</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Pill Tabs */}
            <div className="flex overflow-x-auto custom-scrollbar gap-2 pb-1">
              {availableCategories.map(cat => {
                const color = cat === 'ALL' ? { bg: 'bg-[var(--primary)]', text: 'text-[var(--background)]', border: 'border-[var(--primary)]' } : getCategoryColor(cat);
                const isSelected = category === cat;
                return (
                  <button 
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-5 py-2.5 shrink-0 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${isSelected ? `${color.bg} ${cat==='ALL'?color.text:color.text} border-transparent` : `bg-transparent border-[var(--border)] text-[var(--muted)] hover:border-[var(--faint)]`}`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Results Grouped Grid */}
        <section className="space-y-6">
          {Object.keys(groupedSkills).length === 0 && (
            <div className="py-20 text-center glass-card bg-[var(--faint)] border-dashed border-2 border-[var(--faint)] rounded-3xl">
              <p className="text-sm font-bold text-[var(--faint)] uppercase tracking-[0.3em]">No Modules Matching Current Protocol</p>
            </div>
          )}
          
          {Object.entries(groupedSkills).map(([cat, skills]) => {
            const colors = getCategoryColor(cat);
            const isCompact = isCategoryCompact(cat);
            const isCollapsed = isCategoryCollapsed(cat);
            return (
              <div key={cat} className="space-y-4">
                <div 
                  className={`flex items-center justify-between border-b ${isCollapsed ? 'border-[var(--border)] pb-4 hover:border-[var(--primary)]' : 'border-[var(--border)] pb-3'} cursor-pointer transition-colors group/header`}
                  onClick={() => toggleCategoryCollapsed(cat)}
                >
                  <div className="flex flex-col gap-1">
                    <h3 className={`text-xl font-bold tracking-widest ${colors.text} uppercase flex items-center gap-2`}>
                      <span className={`w-2 h-2 rounded-full ${colors.bg.replace('/10', '')} shadow-[0_0_10px_currentColor]`}></span>
                      {cat}
                      <span className="ml-2 px-2.5 py-0.5 rounded-lg bg-[var(--faint)]/10 border border-[var(--border)] text-[11px] text-[var(--foreground)] backdrop-blur-md shadow-sm">
                        {skills.length}
                      </span>
                    </h3>
                    {!isCollapsed && <p className="text-xs text-[var(--muted)]">{categoryDescriptions[cat] || `Collection of ${cat.toLowerCase()} modules.`}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {!isCollapsed && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleCategoryCompact(cat); }}
                        className={`p-2 rounded-lg hover:bg-[var(--faint)]/10 text-[var(--faint)] hover:${colors.text} transition-colors`}
                        title={isCompact ? "Expand All Tiles" : "Compact All Tiles"}
                      >
                        {isCompact ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 14h6m0 0v6m0-6l-7 7m17-11h-6m0 0V4m0 6l7-7M4 10h6m0 0V4m0 6l-7-7m17 11h-6m0 0v6m0-6l7 7" />
                          </svg>
                        )}
                      </button>
                    )}
                    <div className="text-[var(--faint)] group-hover/header:text-[var(--foreground)] transition-colors p-2">
                      {isCollapsed ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
                
                {!isCollapsed && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                    {skills.map(skill => (
                      <RegistryCard 
                        key={skill.title} 
                        {...skill} 
                        colors={colors}
                        globalCompact={isCompact}
                        onClick={() => { setSelectedSkill(skill); setModalState('IDLE'); }} 
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {/* Modal Logic Remains Same */}
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
                      <span className={`text-[10px] font-bold ${getCategoryColor(selectedSkill.category).text} uppercase tracking-widest`}>{selectedSkill.category}</span>
                    </div>
                    <h3 className="text-6xl font-bold tracking-tighter text-[var(--foreground)]">{selectedSkill.title}</h3>
                    <p className="text-xl text-[var(--muted)] leading-relaxed font-medium">{selectedSkill.desc}</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-10 border-t border-[var(--faint)]">
                    <MetricItem label="Complexity" value={selectedSkill.metrics?.size || "Unknown"} status="OPTIMAL" />
                    <MetricItem label="Last Updated" value={selectedSkill.metrics?.modifiedAt || "Unknown"} />
                    <MetricItem label="Module Type" value={selectedSkill.metrics?.type || "Unknown"} />
                    <MetricItem label="Registry" value={selectedSkill.path || "N/A"} full />
                  </div>

                  <div className="flex gap-4 pt-10">
                    <button 
                      disabled={modalState === 'INITIALIZING' || modalState === 'SUCCESS' || (!selectedSkill.path && !selectedSkill.href)}
                      onClick={handleInitialize}
                      className={`flex-1 py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all shiny-button ${modalState === 'INITIALIZING' ? 'opacity-50 animate-pulse cursor-wait' : modalState === 'SUCCESS' ? 'active' : ''}`}
                    >
                      {modalState === 'INITIALIZING' ? 'Connecting IDE...' : modalState === 'SUCCESS' ? 'Protocol Connected' : (selectedSkill.href ? 'Launch Protocol' : 'Open In Editor')}
                    </button>
                    {selectedSkill.path && (
                      <button 
                        onClick={handleViewSource}
                        className="px-8 py-4 bg-[var(--faint)] hover:bg-[var(--faint)]/20 text-[var(--muted)] rounded-xl font-bold uppercase tracking-widest text-xs transition-all"
                      >
                        View Source
                      </button>
                    )}
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

function RegistryCard({ title, status, desc, category, colors, globalCompact, onClick }: Skill & { colors: Record<string, string>, globalCompact: boolean, onClick: () => void }) {
  const [isCompact, setIsCompact] = useState(globalCompact);

  // Sync when category level toggle changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsCompact(globalCompact);
  }, [globalCompact]);

  return (
    <div 
      className={`glass-card flex flex-col group border-l-4 ${colors.border} ${colors.hover} hover:bg-[var(--faint)]/5 transition-all overflow-hidden ${isCompact ? 'p-4' : 'p-6'}`}
    >
      <div className="flex justify-between items-center">
        <div 
          onClick={onClick}
          className="flex-1 cursor-pointer flex flex-col"
        >
          {!isCompact && <span className={`text-[10px] font-bold text-[var(--faint)] uppercase tracking-widest mb-1`}>{category}</span>}
          <h4 className={`text-[var(--foreground)] group-hover:${colors.text} transition-colors font-bold ${isCompact ? 'text-sm' : 'text-lg leading-tight'}`}>{title}</h4>
        </div>
        
        <div className="flex items-center gap-2">
          {!isCompact && <StatusBadge status={status} />}
          <button 
            onClick={(e) => { e.stopPropagation(); setIsCompact(!isCompact); }}
            className={`p-1.5 rounded-md hover:bg-[var(--faint)]/10 text-[var(--faint)] hover:${colors.text} transition-colors`}
            title={isCompact ? "Expand" : "Collapse"}
          >
            {isCompact ? (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {!isCompact && (
        <>
          <p onClick={onClick} className="text-xs text-[var(--muted)] leading-relaxed flex-1 mt-4 mb-6 cursor-pointer">{desc}</p>
          <div onClick={onClick} className="flex items-center justify-between pt-4 border-t border-[var(--faint)] cursor-pointer">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--faint)] group-hover:text-[var(--foreground)] transition-colors">Inspect Module</span>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${colors.text} group-hover:opacity-80 transition-colors`}>Details →</span>
          </div>
        </>
      )}
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
