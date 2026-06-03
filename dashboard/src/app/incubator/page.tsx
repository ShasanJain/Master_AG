'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface DraftMission {
  id: string;
  title: string;
  desc: string;
  progress: number;
  tags: string[];
  difficulty: string;
  status: 'DRAFT' | 'ACTIVE';
  prd?: { problem: string; audience: string; solution: string };
  notes?: string;
  version?: string;
}

interface CouncilResult {
  advisors: {
    contrarian: string;
    firstPrinciples: string;
    expansionist: string;
    outsider: string;
    executor: string;
  };
  enrichment: {
    refinedDesc: string;
    skills: string[];
    difficulty: string;
    confidence: number;
    scopeEstimate: string;
    miniPRD: { problem: string; audience: string; solution: string };
    verdict: string;
  };
  ollamaAvailable: boolean;
}

export default function IncubatorPage() {
  const [drafts, setDrafts] = useState<DraftMission[]>([]);
  const [activeMissions, setActiveMissions] = useState<DraftMission[]>([]);
  const [deletedDrafts, setDeletedDrafts] = useState<DraftMission[]>([]);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [councilResults, setCouncilResults] = useState<Record<string, CouncilResult>>({});
  const [isCounciling, setIsCounciling] = useState<Record<string, boolean>>({});
  const [activeWarRoomId, setActiveWarRoomId] = useState<string | null>(null);
  
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDeletedModalOpen, setIsDeletedModalOpen] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    const savedDrafts = localStorage.getItem('ag_drafts');
    const savedActive = localStorage.getItem('ag_active');
    const savedDeleted = localStorage.getItem('ag_deleted');

    const defaultDrafts = [
      { id: '1', title: "Autonomous Debugger", progress: 65, desc: "Self-healing code engine using real-time LSP analysis and backpropagation.", tags: ["PYTHON", "LSP"], difficulty: "EXTREME", status: 'DRAFT' as const, version: "1.0.0" },
      { id: '2', title: "Neural Memory Graph", progress: 40, desc: "Local knowledge graph that tracks entity relationships across conversation histories using a graph database.", tags: ["GRAPHDB", "RAG"], difficulty: "HIGH", status: 'DRAFT' as const, version: "1.0.0" },
      { id: '3', title: "Voice-to-Task Pipeline", progress: 85, desc: "Process audio logs directly into structured actionable mission objectives via Whisper.", tags: ["AUDIO", "WHISPER", "ETL"], difficulty: "MEDIUM", status: 'DRAFT' as const, version: "1.0.0" },
      { id: '4', title: "Predictive Caching Node", progress: 20, desc: "Pre-fetch and compile likely next-step dependencies based on developer's active context window.", tags: ["NODEJS", "CACHE", "ML"], difficulty: "HIGH", status: 'DRAFT' as const, version: "1.0.0" },
      { id: '5', title: "UI Telemetry Overlay", progress: 10, desc: "Heatmap visualization overlaid directly on the running application DOM to track hover and click density without third-party scripts.", tags: ["REACT", "DOM", "ANALYTICS"], difficulty: "MEDIUM", status: 'DRAFT' as const, version: "1.0.0" },
      { id: '6', title: "Self-Healing Test Synthesizer", progress: 5, desc: "Automatically writes and runs unit tests for undocumented code, mutating the test suite until coverage hits 90%.", tags: ["JEST", "AST", "LLVM"], difficulty: "EXTREME", status: 'DRAFT' as const, version: "1.0.0" },
      { id: '7', title: "Semantic Workspace Search", progress: 15, desc: "A vector-based local search engine that indexes the entire workspace for meaning and architectural patterns rather than regex.", tags: ["CHROMA", "VECTORDB", "EMBEDDINGS"], difficulty: "HIGH", status: 'DRAFT' as const, version: "1.0.0" },
      { id: '8', title: "Temporal Diff Visualizer", progress: 30, desc: "A 3D graph interface that replays Git history over time to spot architectural rot before it happens.", tags: ["THREEJS", "GIT", "D3"], difficulty: "HIGH", status: 'DRAFT' as const, version: "1.0.0" }
    ];

    if (savedDrafts) {
      try {
        const parsed = JSON.parse(savedDrafts);
        const missing = defaultDrafts.filter(d => !parsed.find((p: any) => p.id === d.id));
        setDrafts([...parsed, ...missing]);
      } catch {
        setDrafts(defaultDrafts);
      }
    } else {
      setDrafts(defaultDrafts);
    }

    if (savedActive) setActiveMissions(JSON.parse(savedActive));
    if (savedDeleted) setDeletedDrafts(JSON.parse(savedDeleted));
  }, []);

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    if (drafts.length > 0) localStorage.setItem('ag_drafts', JSON.stringify(drafts));
    if (activeMissions.length > 0) localStorage.setItem('ag_active', JSON.stringify(activeMissions));
    localStorage.setItem('ag_deleted', JSON.stringify(deletedDrafts));
  }, [drafts, activeMissions, deletedDrafts]);

  const capitalizeFirst = (str: string) => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    setIsProcessing(true);
    try {
      const res = await fetch('/api/incubator/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const newMission = await res.json();
      if (newMission.title) newMission.title = capitalizeFirst(newMission.title);
      if (newMission.desc) newMission.desc = capitalizeFirst(newMission.desc);
      setDrafts(prev => [newMission, ...prev]);
      setPrompt('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCouncil = async (draft: DraftMission) => {
    setIsCounciling(prev => ({ ...prev, [draft.id]: true }));
    try {
      const res = await fetch('/api/incubator/council', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: draft.title, desc: draft.desc })
      });
      const result: CouncilResult = await res.json();
      setCouncilResults(prev => ({ ...prev, [draft.id]: result }));
    } catch (e) {
      console.error('Council failed:', e);
    } finally {
      setIsCounciling(prev => ({ ...prev, [draft.id]: false }));
    }
  };

  const handleApplyEnrichment = (id: string) => {
    const result = councilResults[id];
    if (!result?.enrichment) return;
    const { refinedDesc, skills, difficulty, confidence, miniPRD } = result.enrichment;
    setDrafts(prev => prev.map(d =>
      d.id === id
        ? { ...d, desc: capitalizeFirst(refinedDesc), tags: skills, difficulty, progress: confidence, prd: miniPRD }
        : d
    ));
    setCouncilResults(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleActivate = (id: string) => {
    const missionToMove = drafts.find(m => m.id === id);
    if (!missionToMove) return;
    const updatedMission = { ...missionToMove, status: 'ACTIVE' as const };
    setDrafts(prev => prev.filter(m => m.id !== id));
    setActiveMissions(prev => [updatedMission, ...prev]);
  };

  const handleDelete = (id: string, isDraft: boolean) => {
    if (!window.confirm("Are you sure you want to move this mission to the trash?")) return;
    
    let toDelete;
    if (isDraft) {
      toDelete = drafts.find(m => m.id === id);
      setDrafts(prev => prev.filter(m => m.id !== id));
      localStorage.setItem('ag_drafts', JSON.stringify(drafts.filter(m => m.id !== id)));
    } else {
      toDelete = activeMissions.find(m => m.id === id);
      setActiveMissions(prev => prev.filter(m => m.id !== id));
      localStorage.setItem('ag_active', JSON.stringify(activeMissions.filter(m => m.id !== id)));
    }

    if (toDelete) {
      setDeletedDrafts(prev => [toDelete, ...prev]);
    }
  };

  const handleRestore = (id: string) => {
    const toRestore = deletedDrafts.find(m => m.id === id);
    if (!toRestore) return;
    
    setDeletedDrafts(prev => prev.filter(m => m.id !== id));
    if (toRestore.status === 'ACTIVE') {
      setActiveMissions(prev => [toRestore, ...prev]);
    } else {
      setDrafts(prev => [toRestore, ...prev]);
    }
  };

  const handlePermanentDelete = (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this? It cannot be recovered.")) return;
    setDeletedDrafts(prev => prev.filter(m => m.id !== id));
  };

  return (
    <>
      <div className="atmospheric-orb orb-emerald"></div>
      <div className="atmospheric-orb orb-sapphire"></div>
      <div className="max-w-7xl mx-auto space-y-12 p-8 relative z-10">
        {/* Header */}
        <section className="flex justify-between items-end">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <h1 className="text-6xl font-black tracking-tighter text-[var(--foreground)] uppercase italic">Incubator</h1>
              <div className="px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-500 text-[10px] font-black tracking-[0.3em] uppercase shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                Experimental Core
              </div>
            </div>
            <p className="text-xs font-bold text-[var(--foreground)]/30 uppercase tracking-[0.5em]">Staging area for sovereign heuristics & neural growth.</p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-[10px] font-mono text-[var(--foreground)]/40 uppercase tracking-widest leading-relaxed">System Clock: {new Date().toISOString()}<br/>Status: Beta Stress Test</p>
          </div>
        </section>

        {/* Core Operations Grid */}
        <section>
          <IncubatorStats drafts={drafts} activeMissions={activeMissions} />
        </section>



        {/* Active Operations */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMinimized(!isMinimized)} className="text-[10px] font-bold text-[var(--faint)] hover:text-[var(--primary)] tracking-widest uppercase shrink-0 transition-colors">
              {isMinimized ? '⊞ Expand' : '⊟ Minimize'}
            </button>
            <div className="h-px flex-1 bg-[var(--primary)]/20" />
            <p className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-[0.5em] shrink-0">Active Operations</p>
            <div className="h-px flex-1 bg-[var(--primary)]/20" />
            <button onClick={() => setIsDeletedModalOpen(true)} className="text-[10px] font-bold text-rose-400/80 hover:text-rose-400 tracking-widest uppercase shrink-0 transition-colors">
              🗑️ Trash ({deletedDrafts.length})
            </button>
          </div>

          {activeMissions.length === 0 ? (
            <div className="glass-card p-8 border-dashed border-2 border-[var(--border)] flex flex-col items-center justify-center text-center space-y-4 min-h-[150px]">
              <p className="text-xs font-mono text-[var(--faint)]">NO ACTIVE MISSIONS</p>
              <p className="text-[10px] text-[var(--muted)]">Promote a draft mission to initialize execution protocol.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeMissions.map((mission) => (
                <DraftCard
                  key={mission.id}
                  {...mission}
                  title={capitalizeFirst(mission.title)}
                  desc={capitalizeFirst(mission.desc)}
                  onDelete={(e: any) => { e?.stopPropagation(); handleDelete(mission.id, false); }}
                  onClick={() => setActiveWarRoomId(mission.id)}
                  isActive={true}
                  isMinimized={isMinimized}
                />
              ))}
            </div>
          )}
        </section>

        {/* Draft Mission Registry */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMinimized(!isMinimized)} className="text-[10px] font-bold text-[var(--faint)] hover:text-[var(--primary)] tracking-widest uppercase shrink-0 transition-colors">
              {isMinimized ? '⊞ Expand' : '⊟ Minimize'}
            </button>
            <div className="h-px flex-1 bg-[var(--surface)]" />
            <p className="text-[10px] font-bold text-[var(--foreground)]/30 uppercase tracking-[0.5em] shrink-0">Draft Mission Registry</p>
            <div className="h-px flex-1 bg-[var(--surface)]" />
            <button onClick={() => setIsDeletedModalOpen(true)} className="text-[10px] font-bold text-rose-400/80 hover:text-rose-400 tracking-widest uppercase shrink-0 transition-colors">
              🗑️ Trash ({deletedDrafts.length})
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* New Prompt Input */}
            <div className={`glass-card p-6 border-dashed border-2 border-[var(--border)] flex flex-col justify-between space-y-4 hover:border-[var(--primary)]/30 transition-all ${isMinimized ? 'min-h-[150px]' : 'min-h-[280px]'}`}>
              <div>
                <h3 className="text-sm font-bold text-[var(--foreground)]/70">Incubate New Mission</h3>
                {!isMinimized && <p className="text-[10px] font-mono text-[var(--faint)] mt-1">NLP Engine linked to Local LLM</p>}
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe an idea, capability, or mission..."
                className={`w-full flex-1 bg-[var(--background)]/50 border border-[var(--border)] rounded-lg p-3 text-xs text-[var(--foreground)] outline-none resize-none placeholder-[var(--faint)] focus:border-[var(--primary)]/50 transition-all ${isMinimized ? 'min-h-[40px]' : 'min-h-[80px]'}`}
              />
              <button
                onClick={handleSubmit}
                disabled={isProcessing || !prompt.trim()}
                className="w-full py-3 rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-xs font-bold text-[var(--primary)] uppercase tracking-widest hover:bg-[var(--primary)] hover:text-[var(--background)] transition-all shiny-button disabled:opacity-50"
              >
                {isProcessing ? 'ANALYZING...' : 'INITIALIZE'}
              </button>
            </div>

            {drafts.map((draft) => (
              <DraftCard
                key={draft.id}
                {...draft}
                title={capitalizeFirst(draft.title)}
                desc={capitalizeFirst(draft.desc)}
                onActivate={(e: any) => { e?.stopPropagation(); handleActivate(draft.id); }}
                onDelete={(e: any) => { e?.stopPropagation(); handleDelete(draft.id, true); }}
                onCouncil={(e: any) => { e?.stopPropagation(); handleCouncil(draft); }}
                onApplyEnrichment={(e: any) => { e?.stopPropagation(); handleApplyEnrichment(draft.id); }}
                onClick={() => setActiveWarRoomId(draft.id)}
                isActive={false}
                councilResult={councilResults[draft.id]}
                isCounciling={!!isCounciling[draft.id]}
                isMinimized={isMinimized}
              />
            ))}
          </div>
        </section>
      </div>

      {/* War Room Modal */}
      {activeWarRoomId && (
        <WarRoomModal
          draft={drafts.find(d => d.id === activeWarRoomId) || activeMissions.find(m => m.id === activeWarRoomId)!}
          onClose={() => setActiveWarRoomId(null)}
          onUpdateDraft={(updated: DraftMission) => {
            if (updated.status === 'DRAFT') {
              setDrafts(prev => prev.map(d => d.id === updated.id ? updated : d));
            } else {
              setActiveMissions(prev => prev.map(d => d.id === updated.id ? updated : d));
            }
          }}
          onCouncil={() => handleCouncil(drafts.find(d => d.id === activeWarRoomId) || activeMissions.find(m => m.id === activeWarRoomId)!)}
          isCounciling={!!isCounciling[activeWarRoomId]}
          councilResult={councilResults[activeWarRoomId]}
          onApplyEnrichment={() => handleApplyEnrichment(activeWarRoomId)}
        />
      )}

      {/* Deleted / Trash Modal */}
      {isDeletedModalOpen && (
        <DeletedModal 
          drafts={deletedDrafts} 
          onRestore={handleRestore} 
          onPermanentDelete={handlePermanentDelete} 
          onClose={() => setIsDeletedModalOpen(false)} 
        />
      )}
    </>
  );
}

// ─── Deleted Modal ──────────────────────────────────────────────────────────
function DeletedModal({ drafts, onRestore, onPermanentDelete, onClose }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b border-[var(--border)] bg-[var(--background)]">
          <h2 className="text-xl font-black uppercase tracking-tighter text-rose-400 flex items-center gap-2">🗑️ Trash Bin</h2>
          <button onClick={onClose} className="text-2xl text-[var(--faint)] hover:text-white">&times;</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {drafts.length === 0 ? (
            <p className="text-center text-[var(--faint)] font-mono text-xs py-10">Trash is empty.</p>
          ) : (
            drafts.map((d: any) => (
              <div key={d.id} className="flex justify-between items-center p-4 rounded-lg bg-[var(--background)]/50 border border-[var(--border)] hover:border-rose-500/30 transition-colors">
                <div className="pr-4">
                  <h4 className="text-sm font-bold text-[var(--foreground)] capitalize">{d.title}</h4>
                  <p className="text-xs text-[var(--muted)]">{d.desc}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => onRestore(d.id)} className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] uppercase font-bold tracking-widest rounded hover:bg-emerald-500 hover:text-[var(--background)] transition-colors">Restore</button>
                  <button onClick={() => onPermanentDelete(d.id)} className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] uppercase font-bold tracking-widest rounded hover:bg-rose-500 hover:text-[var(--background)] transition-colors">Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Council Panel ──────────────────────────────────────────────────────────

const ADVISOR_META: Record<string, { label: string; icon: string; color: string }> = {
  contrarian:     { label: 'Contrarian',         icon: '⚠', color: 'text-rose-400' },
  firstPrinciples:{ label: 'First Principles',   icon: '🔬', color: 'text-blue-400' },
  expansionist:   { label: 'Expansionist',       icon: '🚀', color: 'text-emerald-400' },
  outsider:       { label: 'Outsider',           icon: '👁', color: 'text-purple-400' },
  builder:       { label: 'Builder',           icon: '⚡', color: 'text-amber-400' },
};

function CouncilPanel({ result, onApply }: { result: CouncilResult; onApply: () => void }) {
  const [activeAdvisor, setActiveAdvisor] = useState<string | null>(null);
  const { advisors, enrichment, ollamaAvailable } = result;

  return (
    <div className="mt-4 border-t border-[var(--border)] pt-4 space-y-4" onClick={e => e.stopPropagation()}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 text-sm">⚖</span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">Council Analysis</span>
        </div>
        {!ollamaAvailable && (
          <span className="text-[9px] font-mono text-rose-400/70 border border-rose-400/20 px-2 py-0.5 rounded">Ollama offline — heuristic</span>
        )}
      </div>

      {/* Advisor Tabs */}
      <div className="flex gap-1 flex-wrap">
        {Object.entries(ADVISOR_META).map(([key, meta]) => (
          <button
            key={key}
            onClick={(e) => { e.stopPropagation(); setActiveAdvisor(activeAdvisor === key ? null : key); }}
            className={`text-[9px] font-bold px-2 py-1 rounded border transition-all tracking-widest uppercase ${
              activeAdvisor === key
                ? `border-[var(--primary)] bg-[var(--primary)]/10 ${meta.color}`
                : 'border-[var(--border)] text-[var(--faint)] hover:border-[var(--primary)]/30'
            }`}
          >
            {meta.icon} {meta.label}
          </button>
        ))}
      </div>

      {/* Advisor Content */}
      {activeAdvisor && advisors[activeAdvisor as keyof typeof advisors] && (
        <div className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-3 text-[10px] text-[var(--muted)] leading-relaxed font-mono">
          <span className={`${ADVISOR_META[activeAdvisor].color} font-bold uppercase text-[9px] tracking-widest block mb-2`}>
            {ADVISOR_META[activeAdvisor].icon} {ADVISOR_META[activeAdvisor].label}
          </span>
          {advisors[activeAdvisor as keyof typeof advisors]}
        </div>
      )}

      {/* Enrichment Summary */}
      <div className="bg-[var(--surface)] border border-amber-500/20 rounded-lg p-3 space-y-2">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-500 mb-2">Chairman's Enrichment</p>
        <p className="text-[10px] text-[var(--foreground)] leading-relaxed italic">"{enrichment.verdict}"</p>
        <div className="grid grid-cols-2 gap-2 pt-2">
          <div>
            <p className="text-[9px] text-[var(--faint)] uppercase tracking-widest">Difficulty</p>
            <p className="text-xs font-bold text-[var(--foreground)]">{enrichment.difficulty}</p>
          </div>
          <div>
            <p className="text-[9px] text-[var(--faint)] uppercase tracking-widest">Confidence</p>
            <p className="text-xs font-bold text-[var(--foreground)]">{enrichment.confidence}%</p>
          </div>
          <div>
            <p className="text-[9px] text-[var(--faint)] uppercase tracking-widest">Scope</p>
            <p className="text-xs font-bold text-[var(--foreground)]">{enrichment.scopeEstimate}</p>
          </div>
          <div>
            <p className="text-[9px] text-[var(--faint)] uppercase tracking-widest">Skills</p>
            <p className="text-xs font-bold text-[var(--foreground)]">{enrichment.skills.join(', ')}</p>
          </div>
        </div>
        {enrichment.refinedDesc && (
          <div className="pt-2 border-t border-[var(--border)]">
            <p className="text-[9px] text-[var(--faint)] uppercase tracking-widest mb-1">Refined Description</p>
            <p className="text-[10px] text-[var(--muted)] leading-relaxed">{enrichment.refinedDesc}</p>
          </div>
        )}
        {enrichment.miniPRD && (
          <div className="pt-2 border-t border-[var(--border)] space-y-2">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-500 mb-1">Miniature PRD</p>
            <div>
              <span className="text-[9px] text-[var(--faint)] uppercase tracking-widest mr-2">Problem</span>
              <span className="text-[10px] text-[var(--muted)]">{enrichment.miniPRD.problem}</span>
            </div>
            <div>
              <span className="text-[9px] text-[var(--faint)] uppercase tracking-widest mr-2">Audience</span>
              <span className="text-[10px] text-[var(--muted)]">{enrichment.miniPRD.audience}</span>
            </div>
            <div>
              <span className="text-[9px] text-[var(--faint)] uppercase tracking-widest mr-2">Solution</span>
              <span className="text-[10px] text-[var(--muted)]">{enrichment.miniPRD.solution}</span>
            </div>
          </div>
        )}
      </div>

      {/* Apply Button */}
      <button
        onClick={(e) => { e.stopPropagation(); onApply(); }}
        className="w-full py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[10px] font-black text-amber-500 uppercase tracking-widest hover:bg-amber-500 hover:text-[var(--background)] transition-all"
      >
        ⚡ Apply Enrichment to Draft
      </button>
    </div>
  );
}

// ─── Draft Card ─────────────────────────────────────────────────────────────

function DraftCard({
  title, progress, desc, tags, difficulty, isActive, prd,
  onActivate, onDelete, onCouncil, onApplyEnrichment, onClick,
  councilResult, isCounciling, isMinimized
}: any) {
  const colorClass = isActive ? 'emerald' : 'amber';

  return (
    <div 
      onClick={onClick}
      className={`glass-card p-6 flex flex-col group relative overflow-hidden border-l-4 border-l-${colorClass}-600/20 hover:border-l-${colorClass}-600 transition-all ${isMinimized ? 'min-h-[150px]' : 'min-h-[280px]'} ${onClick ? 'cursor-pointer hover:-translate-y-1' : ''}`}
    >
      <div className="absolute top-0 right-0 p-4 flex gap-3 items-center">
        {difficulty && <span className="text-[8px] font-black uppercase tracking-widest text-[var(--foreground)]/20 border border-[var(--border)] px-2 py-0.5 rounded">{difficulty}</span>}
        <span className={`text-xs font-mono text-${colorClass}-500/40`}>{progress}% {isActive ? 'ACTIVE' : 'STABLE'}</span>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {tags?.map((tag: string) => (
          <span key={tag} className="text-[9px] font-bold px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] text-[var(--faint)] tracking-widest">{tag}</span>
        ))}
      </div>

      <h4 className={`text-xl font-bold text-[var(--foreground)] mb-2 group-hover:text-${colorClass}-500 transition-colors capitalize`}>{title}</h4>
      <p className="text-xs text-[var(--muted)] leading-relaxed mb-4 flex-1">{desc}</p>

      {!isMinimized && prd && (
        <div className="mb-6 p-3 rounded-lg bg-[var(--background)] border border-[var(--border)] space-y-2">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--foreground)]/50">Miniature PRD</p>
          <div className="space-y-1">
            <p className="text-[10px] leading-relaxed"><span className="text-[var(--faint)] uppercase tracking-widest text-[9px] mr-2">Problem</span> <span className="text-[var(--muted)]">{prd.problem}</span></p>
            <p className="text-[10px] leading-relaxed"><span className="text-[var(--faint)] uppercase tracking-widest text-[9px] mr-2">Audience</span> <span className="text-[var(--muted)]">{prd.audience}</span></p>
            <p className="text-[10px] leading-relaxed"><span className="text-[var(--faint)] uppercase tracking-widest text-[9px] mr-2">Solution</span> <span className="text-[var(--muted)]">{prd.solution}</span></p>
          </div>
        </div>
      )}

      <div className="space-y-3 mt-auto">
        {!isMinimized && (
          <div className="h-1 w-full bg-[var(--background)] rounded-full overflow-hidden">
            <div className={`h-full bg-${colorClass}-600 transition-all duration-1000`} style={{ width: `${progress}%` }} />
          </div>
        )}

        <div className="flex justify-between items-center mt-2">
          <button onClick={onDelete} className="text-lg font-bold text-[var(--faint)] hover:text-rose-400 transition-colors" title="Move to Trash">🗑️</button>
          <div className="flex gap-2 items-center">
            {!isActive && onCouncil && (
              <button
                onClick={onCouncil}
                disabled={isCounciling}
                className="px-3 py-1.5 rounded-lg bg-amber-500/5 border border-amber-500/20 text-[9px] font-black text-amber-500/70 uppercase tracking-widest hover:bg-amber-500/20 hover:text-amber-400 transition-all disabled:opacity-40 disabled:cursor-wait"
                title="Run LLM Council to enrich this draft"
              >
                {isCounciling ? (
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping inline-block"></span>
                    Council...
                  </span>
                ) : '⚖ Council'}
              </button>
            )}
            {!isActive && onActivate && (
              <button onClick={onActivate} className={`px-4 py-2 rounded-lg bg-${colorClass}-600/10 border border-${colorClass}-600/20 text-[10px] font-bold text-${colorClass}-500 uppercase tracking-widest hover:bg-${colorClass}-600 hover:text-[var(--background)] transition-all shiny-button`}>Continue</button>
            )}
          </div>
        </div>

        {!isMinimized && councilResult && (
          <CouncilPanel result={councilResult} onApply={onApplyEnrichment} />
        )}
      </div>
    </div>
  );
}

// ─── Stats ──────────────────────────────────────────────────────────────────

function IncubatorStats({ drafts, activeMissions }: { drafts: any[], activeMissions: any[] }) {
  const [page, setPage] = useState(0);

  // Calculations
  const allMissions = [...drafts, ...activeMissions];
  
  // 1. Active / Draft counts
  const activeCount = activeMissions.length;
  const draftCount = drafts.length;

  // 2. Complexity
  const difficultyMap: Record<string, number> = { 'EXTREME': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
  const avgComplexity = allMissions.length ? 
    (allMissions.reduce((acc, m) => acc + (difficultyMap[m.difficulty] || 2), 0) / allMissions.length).toFixed(1) : '0.0';

  // 3. Convergence (AI vs Manual)
  let aiPivots = 0;
  let manualEdits = 0;
  allMissions.forEach(m => {
    if (m.notes) {
      aiPivots += (m.notes.match(/Pivot to/g) || []).length;
      manualEdits += (m.notes.match(/Manual Edit/g) || []).length;
    }
  });
  const totalEdits = aiPivots + manualEdits;
  const convergence = totalEdits === 0 ? '100%' : `${Math.round((aiPivots / totalEdits) * 100)}%`;

  // 4. Skill Matrix
  const uniqueSkills = new Set(allMissions.flatMap(m => m.tags || []));
  const skillCoverage = uniqueSkills.size;

  // 5. Version Bumps
  let totalBumps = 0;
  allMissions.forEach(m => {
    if (m.version) {
      const parts = m.version.split('.');
      totalBumps += parseInt(parts[0] || '1') - 1 + parseInt(parts[1] || '0') + parseInt(parts[2] || '0');
    }
  });

  // 6. System Readiness (Capability Match)
  const AVAILABLE_SKILLS = new Set(["PYTHON", "REACT", "NODEJS", "TYPESCRIPT", "TAILWIND", "AUDIO", "WHISPER", "ETL", "JEST"]);
  const allTags = allMissions.flatMap(m => m.tags || []);
  const knownTags = allTags.filter(tag => AVAILABLE_SKILLS.has(tag));
  const readinessRatio = allTags.length ? (knownTags.length / allTags.length) : 1;
  const readinessDisplay = readinessRatio.toFixed(2);

  return (
    <div className="relative group min-h-[260px] w-full">
      <button 
        onClick={() => setPage(0)} 
        className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-24 flex items-center justify-center rounded-r-xl border border-l-0 transition-all duration-300 backdrop-blur-xl ${
          page === 0 
            ? 'opacity-0 -translate-x-2 pointer-events-none' 
            : 'bg-[var(--background)]/60 border-[var(--border)] text-[var(--faint)] hover:text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/50 shadow-[4px_0_15px_rgba(0,0,0,0.3)] translate-x-0'
        }`}
      >
        <span className="text-xl font-light tracking-tighter">‹</span>
      </button>

      <button 
        onClick={() => setPage(1)} 
        className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-24 flex items-center justify-center rounded-l-xl border border-r-0 transition-all duration-300 backdrop-blur-xl ${
          page === 1 
            ? 'opacity-0 translate-x-2 pointer-events-none' 
            : 'bg-[var(--background)]/60 border-[var(--border)] text-[var(--faint)] hover:text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/50 shadow-[-4px_0_15px_rgba(0,0,0,0.3)] translate-x-0'
        }`}
      >
        <span className="text-xl font-light tracking-tighter">›</span>
      </button>

      <div className="glass-card p-10 flex flex-col justify-between space-y-8 relative overflow-hidden h-full border border-[var(--border)] rounded-[2rem] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="flex justify-center items-center mb-2 z-10 relative">
          <div className="flex items-center gap-3 px-6 py-2 rounded-full bg-[var(--background)]/50 border border-[var(--border)] shadow-lg backdrop-blur-md">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
            <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-[0.3em] font-mono">
              {page === 0 ? 'Primary Telemetry' : 'Agent Growth Metrics'}
            </h3>
          </div>
        </div>

        <div className="relative w-full px-12">
          <div className={`transition-all duration-500 ease-out grid grid-cols-2 lg:grid-cols-4 gap-6 ${page === 0 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute top-0 w-full pointer-events-none'}`}>
            <MetricCard label="Active Operations" value={activeCount.toString().padStart(2, '0')} sub="Missions in staging" type="bar" percentage={(activeCount / (allMissions.length || 1)) * 100} />
            <MetricCard label="Draft Pipeline" value={draftCount.toString().padStart(2, '0')} sub="Ideas incubating" type="wave" />
            <MetricCard label="Complexity Index" value={`${avgComplexity}`} sub="Average difficulty / 4" status={parseFloat(avgComplexity) > 3 ? 'WARNING' : ''} type="radial" />
            <MetricCard label="Neural Network" value="Llama 3.2" sub="Local Engine Online" type="pulse" />
          </div>

          <div className={`transition-all duration-500 ease-out grid grid-cols-2 lg:grid-cols-4 gap-6 ${page === 1 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 absolute top-0 w-full pointer-events-none'}`}>
            <MetricCard label="Autonomy Rate" value={convergence} sub="AI vs Manual actions" status={parseFloat(convergence) < 50 ? 'WARNING' : ''} type="bar" percentage={parseFloat(convergence) || 100} />
            <MetricCard label="Skill Matrix" value={skillCoverage.toString()} sub="Unique domains mapped" type="wave" />
            <MetricCard label="Backprop Cycles" value={totalBumps.toString()} sub="Total version bumps" type="radial" />
            <MetricCard label="System Readiness" value={readinessDisplay} sub="Skill overlap ratio" type="pulse" status={readinessRatio < 0.7 ? 'WARNING' : ''} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, status, type, percentage = 50 }: { label: string; value: string; sub: string; status?: string; type?: 'bar'|'wave'|'radial'|'pulse', percentage?: number }) {
  const isWarning = status === 'WARNING';
  const colorClass = isWarning ? 'text-amber-500' : 'text-[var(--foreground)]';
  const glowClass = isWarning ? 'shadow-[inset_0_0_40px_rgba(245,158,11,0.05)]' : 'shadow-[inset_0_0_40px_rgba(255,255,255,0.02)]';
  const borderClass = isWarning ? 'border-amber-500/30' : 'border-[var(--border)]';

  return (
    <div className={`relative p-6 rounded-2xl bg-[var(--surface)]/40 ${borderClass} border backdrop-blur-2xl ${glowClass} hover:-translate-y-1.5 hover:shadow-2xl hover:bg-[var(--surface)]/80 transition-all duration-300 group overflow-hidden`}>
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      <div className="relative z-10 space-y-4">
        <span className="text-[9px] font-black text-[var(--foreground)]/40 uppercase tracking-[0.2em] block">{label}</span>
        <h4 className={`${value.length > 5 ? 'text-3xl' : 'text-5xl'} font-black font-mono tracking-tighter ${colorClass} drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] leading-none pt-1`}>{value}</h4>
        <p className="text-[10px] font-mono text-[var(--foreground)]/50 pt-1">{sub}</p>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-1/2 z-0 opacity-30 pointer-events-none group-hover:opacity-60 transition-opacity duration-500">
        {type === 'bar' && (
          <div className="absolute bottom-0 left-0 h-1.5 bg-gradient-to-r from-amber-500/50 to-amber-500 transition-all duration-1000 ease-out" style={{ width: `${percentage}%` }} />
        )}
        {type === 'wave' && (
          <div className="absolute -bottom-8 w-full h-20 bg-gradient-to-t from-[var(--primary)]/10 to-transparent rounded-[100%] scale-x-150" />
        )}
        {type === 'pulse' && (
          <div className="absolute bottom-4 right-4 w-12 h-12 rounded-full border border-amber-500/20 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
        )}
        {type === 'radial' && (
          <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-amber-500/10 blur-2xl group-hover:bg-amber-500/20 transition-all duration-700" />
        )}
      </div>
    </div>
  );
}

// ─── War Room Modal ─────────────────────────────────────────────────────────

function WarRoomModal({ draft, onClose, onUpdateDraft, onCouncil, isCounciling, councilResult, onApplyEnrichment }: any) {
  const router = useRouter();
  const [notes, setNotes] = useState('');
  const [isPivoting, setIsPivoting] = useState(false);
  const [pivotResult, setPivotResult] = useState<any>(null);

  const [editTitle, setEditTitle] = useState(draft.title);
  const [editDesc, setEditDesc] = useState(draft.desc);
  const [editPrd, setEditPrd] = useState(draft.prd || { problem: '', audience: '', solution: '' });

  const hasManualEdits = editTitle !== draft.title || editDesc !== draft.desc || JSON.stringify(editPrd) !== JSON.stringify(draft.prd);

  const handlePivot = async () => {
    setIsPivoting(true);
    try {
      const res = await fetch('/api/incubator/pivot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: draft.title, desc: draft.desc, notes })
      });
      const data = await res.json();
      setPivotResult(data.pivot);
    } catch (e) {
      console.error(e);
    } finally {
      setIsPivoting(false);
    }
  };

  const getTimestamp = () => {
    return new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleSaveManualEdits = () => {
    const currentVersion = draft.version || "1.0.0";
    let [major, minor, patch] = currentVersion.split('.').map(Number);
    patch += 1;
    const newVersion = `${major}.${minor}.${patch}`;
    
    let changedFields = [];
    if (editTitle !== draft.title) changedFields.push("Title");
    if (editDesc !== draft.desc) changedFields.push("Description");
    if (JSON.stringify(editPrd) !== JSON.stringify(draft.prd)) changedFields.push("PRD");

    const formattedNotes = `${draft.notes || ''}\n\n[${getTimestamp()} Manual Edit to v${newVersion}]\nModified fields: ${changedFields.join(', ')}`.trim();

    onUpdateDraft({
      ...draft,
      version: newVersion,
      notes: formattedNotes,
      title: editTitle,
      desc: editDesc,
      prd: editPrd,
    });
  };

  const handleApply = () => {
    if (!pivotResult) return;
    
    const currentVersion = draft.version || "1.0.0";
    let [major, minor, patch] = currentVersion.split('.').map(Number);
    
    if (pivotResult.pivotSeverity === "MAJOR") {
      major += 1; minor = 0; patch = 0;
    } else if (pivotResult.pivotSeverity === "MEDIUM") {
      minor += 1; patch = 0;
    } else {
      patch += 1;
    }
    
    const newVersion = `${major}.${minor}.${patch}`;
    const formattedNotes = `${draft.notes || ''}\n\n[${getTimestamp()} Pivot to v${newVersion} - ${pivotResult.pivotSeverity || 'MINOR'}]\n${notes}`.trim();
    const cleanDesc = pivotResult.newDesc.replace(/^\[v\d+(\.\d+\.\d+)?\]\s*/, '');

    onUpdateDraft({
      ...draft,
      version: newVersion,
      notes: formattedNotes,
      title: draft.title,
      desc: `[v${newVersion}] ${cleanDesc}`,
      tags: pivotResult.newSkills,
      difficulty: pivotResult.newDifficulty,
      prd: pivotResult.newMiniPRD,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-[var(--background)] border border-[var(--border)] rounded-2xl w-full max-w-6xl h-[80vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-[var(--foreground)]">Mission War Room</h2>
            <span className="px-2 py-0.5 rounded border border-amber-500/20 text-amber-500 text-[10px] uppercase font-bold tracking-widest bg-amber-500/10">Brainstorming</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
                onClick={() => { onClose(); router.push(`/incubator/${draft.id}`); }}
                className="text-[10px] font-bold text-[var(--faint)] uppercase tracking-widest hover:text-[var(--primary)] transition-colors border border-transparent hover:border-[var(--primary)]/30 px-3 py-1.5 rounded">
              Expand to Full Page ↗
            </button>
            <button onClick={onClose} className="text-xl text-[var(--faint)] hover:text-white transition-colors">&times;</button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-1/3 border-r border-[var(--border)] p-6 overflow-y-auto space-y-6 bg-[var(--surface)]/50">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-[var(--faint)] mb-1">Current Title</p>
              <input 
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="w-full bg-transparent border-b border-transparent hover:border-[var(--border)] focus:border-[var(--primary)]/50 text-xl font-bold text-[var(--foreground)] outline-none transition-all px-1 py-0.5 -ml-1 capitalize"
              />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-[var(--faint)] mb-1">Current Description</p>
              <textarea 
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
                className="w-full bg-transparent border border-transparent hover:border-[var(--border)] focus:border-[var(--primary)]/50 text-xs text-[var(--muted)] leading-relaxed outline-none transition-all resize-none min-h-[80px] p-2 -ml-2 rounded"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap px-1">
              {draft.tags?.map((tag: string) => (
                <span key={tag} className="text-[9px] font-bold px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] text-[var(--faint)] tracking-widest">{tag}</span>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-[var(--background)] border border-[var(--border)] space-y-3">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--primary)]">Current PRD</p>
              <div className="space-y-2">
                <div>
                  <p className="text-[var(--faint)] uppercase tracking-widest text-[9px] mb-1">Problem</p>
                  <textarea value={editPrd.problem} onChange={e => setEditPrd({...editPrd, problem: e.target.value})} className="w-full bg-[var(--surface)] border border-transparent hover:border-[var(--border)] focus:border-[var(--primary)]/30 rounded p-2 text-[10px] text-[var(--muted)] outline-none resize-none min-h-[50px]"/>
                </div>
                <div>
                  <p className="text-[var(--faint)] uppercase tracking-widest text-[9px] mb-1">Audience</p>
                  <input value={editPrd.audience} onChange={e => setEditPrd({...editPrd, audience: e.target.value})} className="w-full bg-[var(--surface)] border border-transparent hover:border-[var(--border)] focus:border-[var(--primary)]/30 rounded p-2 text-[10px] text-[var(--muted)] outline-none"/>
                </div>
                <div>
                  <p className="text-[var(--faint)] uppercase tracking-widest text-[9px] mb-1">Solution</p>
                  <textarea value={editPrd.solution} onChange={e => setEditPrd({...editPrd, solution: e.target.value})} className="w-full bg-[var(--surface)] border border-transparent hover:border-[var(--border)] focus:border-[var(--primary)]/30 rounded p-2 text-[10px] text-[var(--muted)] outline-none resize-none min-h-[50px]"/>
                </div>
              </div>
            </div>

            {hasManualEdits && (
              <button 
                onClick={handleSaveManualEdits}
                className="w-full py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:bg-emerald-500 hover:text-[var(--background)] transition-all animate-in fade-in slide-in-from-top-2"
              >
                💾 Save Manual Edits
              </button>
            )}
          </div>

          <div className="flex-1 flex flex-col p-6 space-y-6 overflow-y-auto">
            
            {/* Top: Council Analysis */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-widest">Council Analysis</h3>
                  <p className="text-[10px] text-[var(--faint)]">Run the board of advisors for full analysis.</p>
                </div>
                {draft.status === 'DRAFT' && onCouncil && (
                  <button 
                    onClick={onCouncil}
                    disabled={isCounciling}
                    className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:bg-emerald-500 hover:text-[var(--background)] transition-all disabled:opacity-50 disabled:cursor-wait"
                  >
                    {isCounciling ? 'COUNCIL RUNNING...' : '⚖ RUN FULL COUNCIL'}
                  </button>
                )}
              </div>

              {councilResult && !pivotResult && (
                <div className="mt-2">
                  <CouncilPanel result={councilResult} onApply={() => { onApplyEnrichment(); onClose(); }} />
                </div>
              )}
            </div>

            <hr className="border-[var(--border)] opacity-50" />

            {/* Middle: Brainstorming Scratchpad */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-widest">Brainstorming Scratchpad</h3>
                  <p className="text-[10px] text-[var(--faint)]">Dump your raw ideas, pivots, constraints, or links here.</p>
                </div>
                <button 
                  onClick={handlePivot}
                  disabled={isPivoting || !notes.trim()}
                  className="px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[10px] font-black text-amber-500 uppercase tracking-widest hover:bg-amber-500 hover:text-[var(--background)] transition-all disabled:opacity-50 disabled:cursor-wait"
                >
                  {isPivoting ? 'ANALYZING PIVOT...' : '⚖ RUN PIVOT COUNCIL'}
                </button>
              </div>
              
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Actually, instead of X, let's use Y because it's faster..."
                className="w-full bg-[var(--background)]/50 border border-[var(--border)] rounded-lg p-4 text-sm text-[var(--foreground)] font-mono outline-none resize-none focus:border-amber-500/50 transition-all min-h-[120px]"
              />

              {pivotResult && (
                <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-500 mb-1">Council Verdict</p>
                    <p className="text-xs text-[var(--foreground)] italic">"{pivotResult.pivotSummary}"</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-[var(--faint)] mb-1">Proposed Skills</p>
                      <p className="text-[10px] font-bold text-amber-400">{pivotResult.newSkills.join(', ')}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-[var(--faint)] mb-1">Proposed Difficulty</p>
                      <p className="text-[10px] font-bold text-[var(--foreground)]">{pivotResult.newDifficulty}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-[var(--faint)] mb-1">Proposed Description</p>
                    <p className="text-xs text-[var(--muted)]">{pivotResult.newDesc}</p>
                  </div>

                  <button 
                    onClick={handleApply}
                    className="w-full py-2 rounded bg-amber-500 text-[10px] font-black text-[var(--background)] uppercase tracking-widest hover:bg-amber-400 transition-colors"
                  >
                    ⚡ ACCEPT PIVOT & OVERWRITE DRAFT
                  </button>
                </div>
              )}
            </div>

            {draft.notes && <hr className="border-[var(--border)] opacity-50" />}

            {/* Bottom: Mission Log */}
            {draft.notes && (
              <div className="space-y-4 pb-8">
                <div>
                  <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-widest">Mission Log</h3>
                  <p className="text-[10px] text-[var(--faint)]">Historical record of manual edits and pivots.</p>
                </div>
                <div className="w-full bg-[var(--surface)]/30 border border-[var(--border)] rounded-lg p-4 font-mono text-xs text-[var(--muted)] whitespace-pre-wrap">
                  {draft.notes}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}