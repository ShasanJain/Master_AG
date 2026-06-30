'use client';

import { useState, useEffect, use } from 'react';
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

interface VaultMatch {
  name: string;
  category: string;
  similarity: number;
  gap: string;
  action: string;
}

// ─── Skill suggestion engine ─────────────────────────────────────────────────
const SKILL_UNIVERSE: Record<string, string[]> = {
  PYTHON:      ['FASTAPI', 'PYDANTIC', 'ASYNCIO', 'CELERY', 'PYTEST'],
  REACT:       ['NEXTJS', 'ZUSTAND', 'TANSTACK', 'FRAMER', 'SHADCN'],
  NODEJS:      ['EXPRESS', 'PRISMA', 'REDIS', 'BULLMQ', 'SOCKET.IO'],
  TYPESCRIPT:  ['ZOD', 'TRPC', 'DRIZZLE', 'VITEST', 'ESBUILD'],
  GRAPHDB:     ['NEO4J', 'CYPHER', 'APOC', 'GREMLIN', 'TIGERGRAPH'],
  VECTORDB:    ['CHROMA', 'PINECONE', 'WEAVIATE', 'QDRANT', 'MILVUS'],
  AUDIO:       ['WHISPER', 'FFMPEG', 'LIBROSA', 'WEBRTC', 'OPUS'],
  WHISPER:     ['FASTER-WHISPER', 'PYAUDIO', 'SPEECHBRAIN', 'NLP', 'DIARIZATION'],
  RAG:         ['LLAMAINDEX', 'LANGCHAIN', 'EMBEDDINGS', 'FAISS', 'RERANKER'],
  ML:          ['PYTORCH', 'SKLEARN', 'ONNX', 'TRITON', 'MLFLOW'],
  CACHE:       ['REDIS', 'MEMCACHED', 'DRAGONFLY', 'VARNISH', 'HAZELCAST'],
  REDIS:       ['BULLMQ', 'KEYDB', 'REDISEARCH', 'REDIS-STREAMS', 'VALKEY'],
  GIT:         ['GITOPS', 'SEMANTIC-RELEASE', 'CHANGESETS', 'CONVENTIONAL-COMMITS', 'HUSKY'],
  THREEJS:     ['R3F', 'DREI', 'WEBGL', 'GLSL', 'CANNON-ES'],
  D3:          ['OBSERVABLE', 'VEGA', 'RECHARTS', 'VISX', 'NIVO'],
  DOM:         ['MUTATION-OBSERVER', 'INTERSECTION-OBSERVER', 'WEB-WORKERS', 'WASM', 'SHADOW-DOM'],
  JEST:        ['TESTING-LIBRARY', 'PLAYWRIGHT', 'MSW', 'SUPERTEST', 'ISTANBUL'],
  AST:         ['BABEL', 'ACORN', 'TREESITTER', 'ESTREE', 'JSCODESHIFT'],
  CHROMA:      ['OPENAI-EMBED', 'BGE', 'COHERE', 'INSTRUCTOR', 'SENTENCE-TRANSFORMERS'],
  ETL:         ['AIRFLOW', 'DAGSTER', 'DBT', 'GREAT-EXPECTATIONS', 'POLARS'],
};

function getSuggestedSkills(currentTags: string[]): string[] {
  const suggestions = new Set<string>();
  const tagSet = new Set(currentTags.map(t => t.toUpperCase()));

  for (const tag of currentTags) {
    const related = SKILL_UNIVERSE[tag.toUpperCase()] || [];
    for (const s of related) {
      if (!tagSet.has(s)) suggestions.add(s);
    }
  }

  // If no suggestions from map, add generic ones
  if (suggestions.size === 0) {
    ['DOCKER', 'POSTGRES', 'GITHUB-ACTIONS', 'OPENTELEMETRY', 'GRAFANA'].forEach(s => {
      if (!tagSet.has(s)) suggestions.add(s);
    });
  }

  return Array.from(suggestions).slice(0, 7);
}

// ─── Advisor meta ─────────────────────────────────────────────────────────────
const ADVISOR_META: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  contrarian:      { label: 'Contrarian',       icon: '⚠', color: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/20' },
  firstPrinciples: { label: 'First Principles', icon: '🔬', color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20' },
  expansionist:    { label: 'Expansionist',     icon: '🚀', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  outsider:        { label: 'Outsider',         icon: '👁', color: 'text-purple-400',  bg: 'bg-purple-500/10 border-purple-500/20' },
  executor:        { label: 'Executor',         icon: '⚡', color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20' },
};

const DIFF_COLOR: Record<string, string> = {
  MAJOR: 'text-rose-400 border-rose-500/30 bg-rose-500/5',
  MEDIUM: 'text-amber-400 border-amber-500/30 bg-amber-500/5',
  MINOR: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5',
  PATCH: 'text-blue-400 border-blue-500/30 bg-blue-500/5',
};

function parseVersionLog(notes: string) {
  if (!notes) return [];
  return notes.split('\n\n').filter(Boolean).map(entry => {
    const pivotMatch = entry.match(/\[(.+?) Pivot to (v[\d.]+) - (\w+)\]/);
    const manualMatch = entry.match(/\[(.+?) Manual Edit to (v[\d.]+)\]/);
    if (pivotMatch) return { type: 'pivot', date: pivotMatch[1], version: pivotMatch[2], severity: pivotMatch[3], body: entry.replace(pivotMatch[0], '').trim() };
    if (manualMatch) return { type: 'manual', date: manualMatch[1], version: manualMatch[2], severity: 'PATCH', body: entry.replace(manualMatch[0], '').trim() };
    return null;
  }).filter(Boolean).reverse() as any[];
}

// ─── Similarity bar ───────────────────────────────────────────────────────────
function SimilarityBar({ value }: { value: number }) {
  const color = value >= 75 ? 'bg-rose-500' : value >= 50 ? 'bg-amber-500' : 'bg-emerald-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-[var(--border)] rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-700`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[9px] font-mono text-[var(--faint)] w-7 text-right">{value}%</span>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function WarRoomFullPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [draft, setDraft] = useState<DraftMission | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editPrd, setEditPrd] = useState({ problem: '', audience: '', solution: '' });

  const [notes, setNotes] = useState('');
  const [isPivoting, setIsPivoting] = useState(false);
  const [waveStatus, setWaveStatus] = useState('');   // live status banner
  const [pivotResult, setPivotResult] = useState<any>(null);
  const [advisors, setAdvisors] = useState<Record<string, string> | null>(null);
  const [activeAdvisor, setActiveAdvisor] = useState<string | null>(null);

  const [vaultMatches, setVaultMatches] = useState<VaultMatch[] | null>(null);
  const [isMatching, setIsMatching] = useState(false);

  const [rightPanel, setRightPanel] = useState<'timeline' | 'vault'>('timeline');
  const [saved, setSaved] = useState(false);
  const [isCounciling, setIsCounciling] = useState(false);
  const [councilResult, setCouncilResult] = useState<any>(null);

  const handleCouncil = async () => {
    if (!draft) return;
    setIsCounciling(true);
    try {
      const res = await fetch('/api/incubator/council', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: draft.title, desc: draft.desc })
      });
      const result = await res.json();
      if (!res.ok || result.error) {
        throw new Error(result.error || 'Unknown server error');
      }
      setCouncilResult(result);
    } catch (e) {
      console.error('Council failed:', e);
    } finally {
      setIsCounciling(false);
    }
  };

  const handleApplyEnrichment = () => {
    if (!councilResult?.enrichment || !draft) return;
    const { refinedDesc, skills, difficulty, confidence, miniPRD } = councilResult.enrichment;
    
    const [major, minor, patch] = (draft.version || '1.0.0').split('.').map(Number);
    const newVersion = `${major}.${minor}.${patch + 1}`;
    const newNotes = `${draft.notes || ''}\n\n[${getTimestamp()} Applied Council Enrichment to v${newVersion}]`.trim();
    
    const updated = { 
      ...draft, 
      version: newVersion,
      notes: newNotes,
      desc: refinedDesc, 
      tags: skills, 
      difficulty, 
      progress: confidence, 
      prd: miniPRD 
    };
    
    setEditDesc(updated.desc);
    setEditTags(updated.tags || []);
    setEditPrd(updated.prd || { problem: '', audience: '', solution: '' });
    setCouncilResult(null);
    flashSaved(updated);
  };
  const [newTagInput, setNewTagInput] = useState('');

  useEffect(() => {
    const all = [
      ...(JSON.parse(localStorage.getItem('ag_drafts') || '[]')),
      ...(JSON.parse(localStorage.getItem('ag_active') || '[]')),
    ];
    const found = all.find((d: DraftMission) => d.id === id);
    if (found) {
      setDraft(found);
      setEditTitle(found.title);
      setEditDesc(found.desc);
      setEditTags(found.tags || []);
      setEditPrd(found.prd || { problem: '', audience: '', solution: '' });
    }
  }, [id]);

  const hasManualEdits = draft && (
    editTitle !== draft.title ||
    editDesc !== draft.desc ||
    JSON.stringify(editTags) !== JSON.stringify(draft.tags) ||
    JSON.stringify(editPrd) !== JSON.stringify(draft.prd)
  );

  const suggestedSkills = getSuggestedSkills(editTags);

  const getTimestamp = () => new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const persistDraft = (updated: DraftMission) => {
    const key = updated.status === 'DRAFT' ? 'ag_drafts' : 'ag_active';
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    localStorage.setItem(key, JSON.stringify(existing.map((d: DraftMission) => d.id === updated.id ? updated : d)));
  };

  const flashSaved = (updated: DraftMission) => {
    persistDraft(updated);
    setDraft(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveManual = () => {
    if (!draft) return;
    const [major, minor, patch] = (draft.version || '1.0.0').split('.').map(Number);
    const newVersion = `${major}.${minor}.${patch + 1}`;
    const changed = [];
    if (editTitle !== draft.title) changed.push('Title');
    if (editDesc !== draft.desc) changed.push('Description');
    if (JSON.stringify(editTags) !== JSON.stringify(draft.tags)) changed.push('Skills');
    if (JSON.stringify(editPrd) !== JSON.stringify(draft.prd)) changed.push('PRD');
    const newNotes = `${draft.notes || ''}\n\n[${getTimestamp()} Manual Edit to v${newVersion}]\nModified: ${changed.join(', ')}`.trim();
    flashSaved({ ...draft, version: newVersion, notes: newNotes, title: editTitle, desc: editDesc, tags: editTags, prd: editPrd });
  };

  const addTag = (tag: string) => {
    const clean = tag.trim().toUpperCase();
    if (!clean || editTags.includes(clean)) return;
    setEditTags(prev => [...prev, clean]);
  };

  const removeTag = (tag: string) => setEditTags(prev => prev.filter(t => t !== tag));

  const handlePivot = async () => {
    if (!draft || !notes.trim()) return;
    setIsPivoting(true);
    setWaveStatus('Connecting to council...');
    setPivotResult(null);
    setAdvisors(null);
    setActiveAdvisor(null);

    try {
      const res = await fetch('/api/incubator/pivot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: draft.title, desc: draft.desc, notes }),
      });

      if (!res.body) throw new Error('No stream body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse all complete SSE events in buffer
        const events = buffer.split('\n\n');
        buffer = events.pop() ?? '';  // last partial chunk stays in buffer

        for (const raw of events) {
          const line = raw.replace(/^data: /, '').trim();
          if (!line) continue;
          try {
            const event = JSON.parse(line);

            if (event.type === 'status') {
              setWaveStatus(event.message);
            }

            if (event.type === 'advisor') {
              // Add this advisor immediately — tabs appear as they stream in
              setAdvisors(prev => {
                const next = { ...(prev ?? {}), [event.name]: event.text };
                return next;
              });
              // Auto-select first wave-1 advisor that arrives
              setActiveAdvisor(prev => prev ?? event.name);
            }

            if (event.type === 'pivot') {
              setPivotResult(event.pivot);
            }

            if (event.type === 'done') {
              setWaveStatus('');
              setIsPivoting(false);
            }
          } catch {
            // malformed chunk — skip
          }
        }
      }
    } catch (e) {
      console.error(e);
      setWaveStatus('');
      setIsPivoting(false);
    }
  };

  const handleAcceptPivot = () => {
    if (!draft || !pivotResult) return;
    const [major, minor, patch] = (draft.version || '1.0.0').split('.').map(Number);
    let newVersion = `${major}.${minor}.${patch + 1}`;
    if (pivotResult.pivotSeverity === 'MAJOR') newVersion = `${major + 1}.0.0`;
    else if (pivotResult.pivotSeverity === 'MEDIUM') newVersion = `${major}.${minor + 1}.0`;
    const cleanDesc = pivotResult.newDesc.replace(/^\[v[\d.]+\]\s*/, '');
    const newNotes = `${draft.notes || ''}\n\n[${getTimestamp()} Pivot to v${newVersion} - ${pivotResult.pivotSeverity || 'MINOR'}]\n${notes}`.trim();
    const updated = { ...draft, version: newVersion, notes: newNotes, desc: `[v${newVersion}] ${cleanDesc}`, tags: pivotResult.newSkills, difficulty: pivotResult.newDifficulty, prd: pivotResult.newMiniPRD };
    setEditTags(pivotResult.newSkills);
    setEditDesc(updated.desc);
    setNotes('');
    setPivotResult(null);
    setAdvisors(null);
    flashSaved(updated);
  };

  const handleVaultMatch = async () => {
    if (!draft) return;
    setIsMatching(true);
    setRightPanel('vault');
    try {
      const res = await fetch('/api/incubator/similar-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: draft.title, desc: draft.desc, tags: editTags }),
      });
      const data = await res.json();
      setVaultMatches(data.matches);
    } catch (e) { console.error(e); }
    finally { setIsMatching(false); }
  };

  const versionLog = parseVersionLog(draft?.notes || '');

  if (!draft) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-xs font-mono text-[var(--faint)] animate-pulse uppercase tracking-widest">Loading War Room...</p>
    </div>
  );

  return (
    <>
      <div className="atmospheric-orb orb-emerald" />
      <div className="atmospheric-orb orb-sapphire" />

      <div className="min-h-screen flex flex-col relative z-10">

        {/* ── Top Bar ── */}
        <header className="flex items-center justify-between px-8 py-4 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="text-[10px] font-bold text-[var(--faint)] uppercase tracking-widest hover:text-[var(--foreground)] transition-colors flex items-center gap-1.5">
              ← Back
            </button>
            <div className="w-px h-4 bg-[var(--border)]" />
            <span className="text-[10px] font-mono text-[var(--faint)] uppercase tracking-widest">Mission War Room</span>
            <span className="px-2 py-0.5 rounded border border-amber-500/20 text-amber-500 text-[9px] uppercase font-bold tracking-widest bg-amber-500/10">Full Page</span>
          </div>
          <div className="flex items-center gap-4">
            {saved && <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest animate-in fade-in">✓ Saved</span>}
            <button
              onClick={handleVaultMatch}
              disabled={isMatching}
              className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-[9px] font-black text-purple-400 uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all disabled:opacity-40"
            >
              {isMatching ? '⟳ Scanning...' : '🔍 Vault Match'}
            </button>
            <span className="text-[10px] font-mono text-[var(--faint)]">v{draft.version || '1.0.0'}</span>
            <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${draft.status === 'ACTIVE' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 'text-amber-400 border-amber-500/30 bg-amber-500/10'}`}>
              {draft.status}
            </span>
          </div>
        </header>

        <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden" style={{ height: 'calc(100vh - 57px)' }}>

          {/* ── LEFT: Mission State (3 cols) ── */}
          <div className="col-span-3 border-r border-[var(--border)] overflow-y-auto bg-[var(--surface)]/40 p-6 space-y-5">

            {/* Title */}
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-[var(--faint)] mb-1.5">Mission Title</p>
              <input
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="w-full bg-transparent border-b border-transparent hover:border-[var(--border)] focus:border-[var(--primary)]/50 text-lg font-black text-[var(--foreground)] outline-none transition-all pb-1"
              />
            </div>

            {/* Description */}
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-[var(--faint)] mb-1.5">Description</p>
              <textarea
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
                className="w-full bg-[var(--background)]/30 border border-transparent hover:border-[var(--border)] focus:border-[var(--primary)]/30 rounded-lg p-2 text-xs text-[var(--muted)] leading-relaxed outline-none resize-none min-h-[72px] transition-all"
              />
            </div>

            {/* Skills / Tags with remove + add */}
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-[var(--faint)] mb-2">Skills / Tags</p>

              {/* Current tags — removable */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {editTags.map((tag) => (
                  <span
                    key={tag}
                    className="group flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] tracking-widest transition-all hover:border-rose-500/50 hover:bg-rose-500/10"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-300 transition-all leading-none text-[10px] font-black"
                      title={`Remove ${tag}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Suggested skills */}
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-[var(--faint)]/60 mb-1.5">Suggested</p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedSkills.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => addTag(skill)}
                      className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] text-[var(--faint)] tracking-widest hover:border-[var(--primary)]/50 hover:text-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all group"
                      title={`Add ${skill}`}
                    >
                      <span className="text-[var(--primary)] opacity-60 group-hover:opacity-100 font-black transition-opacity">+</span>
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom tag input */}
              <div className="flex gap-1.5 mt-2">
                <input
                  value={newTagInput}
                  onChange={e => setNewTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { addTag(newTagInput); setNewTagInput(''); } }}
                  placeholder="Custom skill..."
                  className="flex-1 bg-[var(--background)]/50 border border-[var(--border)] rounded-lg px-2 py-1 text-[9px] text-[var(--foreground)] outline-none focus:border-[var(--primary)]/40 transition-all placeholder-[var(--faint)]"
                />
                <button
                  onClick={() => { addTag(newTagInput); setNewTagInput(''); }}
                  className="px-2 py-1 rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] text-[9px] font-black hover:bg-[var(--primary)] hover:text-[var(--background)] transition-all"
                >
                  +
                </button>
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-[var(--faint)] mb-1.5">Difficulty</p>
              <div className="flex gap-1.5">
                {(['LOW', 'MEDIUM', 'HIGH', 'EXTREME'] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => { if (draft) { const u = { ...draft, difficulty: d }; persistDraft(u); setDraft(u); } }}
                    className={`flex-1 py-1 rounded text-[8px] font-black uppercase tracking-widest border transition-all ${
                      draft.difficulty === d
                        ? d === 'EXTREME' ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                          : d === 'HIGH' ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                          : d === 'MEDIUM' ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                          : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                        : 'border-[var(--border)] text-[var(--faint)] hover:border-[var(--border)] hover:text-[var(--foreground)]'
                    }`}
                  >
                    {d.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* PRD */}
            <div className="p-4 rounded-xl bg-[var(--background)] border border-[var(--border)] space-y-3">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--primary)]">PRD</p>
              {(['problem', 'audience', 'solution'] as const).map(field => (
                <div key={field}>
                  <p className="text-[var(--faint)] uppercase tracking-widest text-[9px] mb-1">{field}</p>
                  <textarea
                    value={editPrd[field]}
                    onChange={e => setEditPrd({ ...editPrd, [field]: e.target.value })}
                    className="w-full bg-[var(--surface)] border border-transparent hover:border-[var(--border)] focus:border-[var(--primary)]/30 rounded p-2 text-[10px] text-[var(--muted)] outline-none resize-none min-h-[44px] transition-all"
                  />
                </div>
              ))}
            </div>

            {/* Save */}
            {hasManualEdits && (
              <button
                onClick={handleSaveManual}
                className="w-full py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:bg-emerald-500 hover:text-[var(--background)] transition-all animate-in fade-in"
              >
                💾 Save Manual Edits
              </button>
            )}

            {/* Progress */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <p className="text-[9px] font-black uppercase tracking-widest text-[var(--faint)]">Progress</p>
                <p className="text-[9px] font-mono text-[var(--faint)]">{draft.progress}%</p>
              </div>
              <div className="h-1 w-full bg-[var(--background)] rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${draft.progress}%` }} />
              </div>
            </div>
          </div>

          {/* ── CENTER: Scratchpad + Council Results (6 cols) ── */}
          <div className="col-span-6 border-r border-[var(--border)] flex flex-col overflow-hidden">

            {/* Top Area: Initial Council */}
            <div className="p-6 border-b border-[var(--border)] shrink-0 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-black text-[var(--foreground)] uppercase tracking-widest">Initial Council</h3>
                  <p className="text-[10px] text-[var(--faint)] mt-0.5">Analyze and enrich the current draft before brainstorming.</p>
                </div>
                <button
                  onClick={handleCouncil}
                  disabled={isCounciling || draft.status === 'ACTIVE'}
                  className="px-5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[10px] font-black text-amber-500 uppercase tracking-widest hover:bg-amber-500 hover:text-[var(--background)] transition-all disabled:opacity-40 disabled:cursor-wait shrink-0"
                >
                  {isCounciling ? (
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping inline-block" />
                      Analyzing...
                    </span>
                  ) : '⚖ Run Initial Council'}
                </button>
              </div>
              {councilResult && <CouncilPanel result={councilResult} onApply={handleApplyEnrichment} />}
            </div>

            {/* Middle Area: Scratchpad & Pivot */}
            <div className="flex-1 flex flex-col p-6 space-y-4 overflow-y-auto">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-black text-[var(--foreground)] uppercase tracking-widest">Brainstorming Scratchpad</h3>
                  <p className="text-[10px] text-[var(--faint)] mt-0.5">Dump raw ideas, pivots, constraints, or links. Then run the pivot council.</p>
                </div>
                <button
                  onClick={handlePivot}
                  disabled={isPivoting || !notes.trim()}
                  className="px-5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[10px] font-black text-amber-500 uppercase tracking-widest hover:bg-amber-500 hover:text-[var(--background)] transition-all disabled:opacity-40 disabled:cursor-wait shrink-0"
                >
                  {isPivoting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping inline-block" />
                      Analyzing...
                    </span>
                  ) : '⚖ Run Pivot Council'}
                </button>
              </div>

              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Actually, instead of ML, let's use Redis LRU cache. Simpler, faster to ship..."
                className="w-full min-h-[120px] bg-[var(--background)]/50 border border-[var(--border)] rounded-xl p-4 text-sm text-[var(--foreground)] font-mono outline-none resize-none focus:border-amber-500/50 transition-all"
              />

              {/* Live wave status banner */}
              {isPivoting && waveStatus && (
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 animate-in fade-in">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping shrink-0" />
                  <p className="text-[10px] font-mono text-amber-400 tracking-wide">{waveStatus}</p>
                </div>
              )}

              {/* Pivot Advisor tabs */}
              {(advisors || isPivoting) && (
                <div className="border border-[var(--border)] bg-[var(--surface)]/30 rounded-xl overflow-hidden shrink-0 mt-4">
                  <div className="flex">
                    {Object.entries(ADVISOR_META).map(([key, meta]) => {
                      const hasData = !!advisors?.[key];
                      const isLoading = isPivoting && !hasData;
                      return (
                        <button
                          key={key}
                          onClick={() => hasData && setActiveAdvisor(activeAdvisor === key ? null : key)}
                          disabled={!hasData}
                          className={`flex-1 py-3 flex flex-col items-center gap-1 text-[9px] font-black uppercase tracking-widest transition-all border-r last:border-r-0 border-[var(--border)] ${
                            activeAdvisor === key
                              ? `${meta.color} bg-[var(--surface)] border-b-2 border-b-current`
                              : hasData
                              ? 'text-[var(--faint)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]/50'
                              : 'text-[var(--faint)]/30 cursor-not-allowed'
                          }`}
                          title={isLoading ? `${meta.label} — analyzing...` : meta.label}
                        >
                          {isLoading ? (
                            <span className="w-2 h-2 rounded-full bg-[var(--faint)]/30 animate-pulse" />
                          ) : (
                            <span className={`text-base transition-all ${hasData ? '' : 'opacity-20'}`}>{meta.icon}</span>
                          )}
                          {hasData && !isLoading && (
                            <span className={`text-[7px] font-black ${meta.color} opacity-70`}>✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {activeAdvisor && advisors?.[activeAdvisor] && (
                    <div className={`p-4 border-t border-[var(--border)] ${ADVISOR_META[activeAdvisor].bg} animate-in fade-in`}>
                      <p className={`text-[9px] font-black uppercase tracking-widest ${ADVISOR_META[activeAdvisor].color} mb-2`}>
                        {ADVISOR_META[activeAdvisor].icon} {ADVISOR_META[activeAdvisor].label}
                      </p>
                      <p className="text-xs text-[var(--muted)] leading-relaxed font-mono">
                        {advisors[activeAdvisor].startsWith('[Ollama')
                          ? <span className="text-rose-400/60 italic">{advisors[activeAdvisor]}</span>
                          : advisors[activeAdvisor]}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Chairman Pivot Result */}
              {pivotResult && (
                <div className="border border-amber-500/20 bg-amber-500/5 rounded-xl p-6 space-y-4 shrink-0 animate-in fade-in slide-in-from-top-2 mt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-500 mb-1">Chairman's Verdict</p>
                      <p className="text-sm text-[var(--foreground)] italic leading-relaxed">"{pivotResult.pivotSummary}"</p>
                    </div>
                    <span className={`shrink-0 text-[9px] font-black px-2 py-1 rounded border ${DIFF_COLOR[pivotResult.pivotSeverity] || DIFF_COLOR.MINOR}`}>
                      {pivotResult.pivotSeverity}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] text-[var(--faint)] uppercase tracking-widest mb-1">Proposed Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {pivotResult.newSkills?.map((s: string) => (
                          <span key={s} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 tracking-widest">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] text-[var(--faint)] uppercase tracking-widest mb-1">Difficulty</p>
                      <p className="text-sm font-black text-[var(--foreground)]">{pivotResult.newDifficulty}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] text-[var(--faint)] uppercase tracking-widest mb-1">Proposed Description</p>
                    <p className="text-xs text-[var(--muted)] leading-relaxed">{pivotResult.newDesc}</p>
                  </div>
                  <button
                    onClick={handleAcceptPivot}
                    className="w-full py-3 rounded-xl bg-amber-500 text-[10px] font-black text-[var(--background)] uppercase tracking-widest hover:bg-amber-400 transition-colors"
                  >
                    ⚡ Accept Pivot & Overwrite Draft
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Area: Prior notes log */}
            <div className="p-4 border-t border-[var(--border)] shrink-0 bg-[var(--surface)]/20">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--faint)] mb-2">Operation Log</p>
              {draft.notes ? (
                <div className="bg-[var(--background)]/30 border border-[var(--border)] rounded-xl p-3 font-mono text-[10px] text-[var(--faint)] whitespace-pre-wrap max-h-[120px] overflow-y-auto">
                  {draft.notes}
                </div>
              ) : (
                <p className="text-[10px] font-mono text-[var(--faint)]/50">No prior logs.</p>
              )}
            </div>
          </div>
          {/* ── RIGHT: Timeline | Competitor tabs (3 cols) ── */}
          <div className="col-span-3 flex flex-col overflow-hidden bg-[var(--surface)]/20">

            {/* Tab switcher */}
            <div className="flex border-b border-[var(--border)] shrink-0">
              {(['timeline', 'vault'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setRightPanel(tab)}
                  className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest transition-all border-r last:border-r-0 border-[var(--border)] ${
                    rightPanel === tab
                      ? 'text-[var(--primary)] bg-[var(--surface)] border-b-2 border-b-[var(--primary)]'
                      : 'text-[var(--faint)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]/50'
                  }`}
                >
                  {tab === 'timeline' ? '📋 Timeline' : '🔍 Vault'}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">

              {/* ── Version Timeline ── */}
              {rightPanel === 'timeline' && (
                <>
                  {versionLog.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 space-y-2 text-center">
                      <p className="text-2xl opacity-20">📋</p>
                      <p className="text-[10px] font-mono text-[var(--faint)]">NO HISTORY YET</p>
                      <p className="text-[9px] text-[var(--faint)]/50">Run a pivot or save edits to build a version log.</p>
                    </div>
                  ) : (
                    <div className="relative space-y-3">
                      <div className="absolute left-[11px] top-3 bottom-3 w-px bg-[var(--border)]" />
                      {versionLog.map((entry: any, i: number) => (
                        <div key={i} className="relative flex gap-3">
                          <div className={`shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-[8px] z-10 ${
                            entry.type === 'pivot'
                              ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                              : 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                          }`}>
                            {entry.type === 'pivot' ? '⚡' : '✏'}
                          </div>
                          <div className={`flex-1 p-3 rounded-xl border text-[10px] ${DIFF_COLOR[entry.severity] || DIFF_COLOR.MINOR}`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-black">{entry.version}</span>
                              <span className="opacity-50 text-[8px] uppercase tracking-widest">{entry.severity}</span>
                            </div>
                            <p className="text-[var(--faint)] text-[9px] mb-1">{entry.date}</p>
                            {entry.body && <p className="text-[9px] opacity-70 leading-relaxed line-clamp-3">{entry.body}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* PRD snapshot */}
                  {draft.prd && (
                    <div className="p-4 rounded-xl bg-[var(--background)] border border-[var(--border)] space-y-3 mt-2">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--primary)]">PRD Snapshot</p>
                      {(['problem', 'audience', 'solution'] as const).map(f => (
                        <div key={f}>
                          <p className="text-[9px] text-[var(--faint)] uppercase tracking-widest mb-0.5">{f}</p>
                          <p className="text-[10px] text-[var(--muted)] leading-relaxed">{draft.prd?.[f]}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* ── Vault Skills Match ── */}
              {rightPanel === 'vault' && (
                <>
                  {isMatching && (
                    <div className="flex flex-col items-center justify-center py-16 space-y-3">
                      <div className="w-8 h-8 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
                      <p className="text-[10px] font-mono text-[var(--faint)] animate-pulse">Scanning skills vault...</p>
                    </div>
                  )}

                  {!isMatching && !vaultMatches && (
                    <div className="flex flex-col items-center justify-center py-16 space-y-3 text-center">
                      <p className="text-3xl opacity-20">🔍</p>
                      <p className="text-[10px] font-mono text-[var(--faint)]">NO ANALYSIS YET</p>
                      <p className="text-[9px] text-[var(--faint)]/50 leading-relaxed">Click "Vault Match" in the top bar to find overlapping skills.</p>
                    </div>
                  )}

                  {!isMatching && vaultMatches && (
                    <div className="space-y-3">
                      <p className="text-[8px] font-black uppercase tracking-[0.3em] text-[var(--faint)]">Similar Skills Found</p>
                      {vaultMatches.map((c, i) => (
                        <div key={i} className="p-4 rounded-xl bg-[var(--background)] border border-[var(--border)] space-y-2.5 hover:border-purple-500/30 transition-all">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-xs font-black text-[var(--foreground)]">{c.name}</p>
                              <p className="text-[9px] text-[var(--faint)] font-mono">Action: {c.action}</p>
                            </div>
                            <span className="shrink-0 text-[8px] font-bold px-1.5 py-0.5 rounded border border-purple-500/30 bg-purple-500/10 text-purple-400 tracking-widest uppercase">
                              {c.category}
                            </span>
                          </div>
                          <div>
                            <p className="text-[8px] text-[var(--faint)] uppercase tracking-widest mb-1">Similarity</p>
                            <SimilarityBar value={c.similarity} />
                          </div>
                          <div>
                            <p className="text-[8px] text-[var(--faint)] uppercase tracking-widest mb-1">Gap / Overlap</p>
                            <p className="text-[10px] text-emerald-400 leading-relaxed italic">"{c.gap}"</p>
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={handleVaultMatch}
                        className="w-full py-2 rounded-lg border border-[var(--border)] text-[9px] font-bold text-[var(--faint)] uppercase tracking-widest hover:border-purple-500/30 hover:text-purple-400 transition-all"
                      >
                        ↻ Re-scan Vault
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}


function CouncilPanel({ result, onApply }: { result: any; onApply: () => void }) {
  const [activeAdvisor, setActiveAdvisor] = useState<string | null>(null);
  const { advisors, enrichment, ollamaAvailable } = result;

  return (
    <div className="mt-4 border border-[var(--border)] rounded-xl p-4 bg-[var(--surface)]/30 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 text-sm">⚖</span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">Initial Council Analysis</span>
        </div>
        {!ollamaAvailable && <span className="text-[9px] font-mono text-rose-400/70 border border-rose-400/20 px-2 py-0.5 rounded">Ollama offline — heuristic</span>}
      </div>

      <div className="flex gap-1 flex-wrap">
        {Object.entries(ADVISOR_META).map(([key, meta]) => (
          <button
            key={key}
            onClick={() => setActiveAdvisor(activeAdvisor === key ? null : key)}
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

      {activeAdvisor && advisors[activeAdvisor] && (
        <div className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-3 text-[10px] text-[var(--muted)] leading-relaxed font-mono">
          <span className={`${ADVISOR_META[activeAdvisor].color} font-bold uppercase text-[9px] tracking-widest block mb-2`}>
            {ADVISOR_META[activeAdvisor].icon} {ADVISOR_META[activeAdvisor].label}
          </span>
          {advisors[activeAdvisor]}
        </div>
      )}

      {enrichment && (
        <div className="bg-[var(--surface)] border border-amber-500/20 rounded-lg p-3 space-y-2">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-500 mb-2">Chairman's Enrichment</p>
          <p className="text-[10px] text-[var(--foreground)] leading-relaxed italic">"{enrichment.verdict}"</p>
          <div className="pt-2 border-t border-[var(--border)]">
            <p className="text-[9px] text-[var(--faint)] uppercase tracking-widest mb-1">Refined Description</p>
            <p className="text-[10px] text-[var(--muted)] leading-relaxed">{enrichment.refinedDesc}</p>
          </div>
        </div>
      )}

      <button
        onClick={onApply}
        className="w-full py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[10px] font-black text-amber-500 uppercase tracking-widest hover:bg-amber-500 hover:text-[var(--background)] transition-all"
      >
        ⚡ Apply Enrichment to Draft
      </button>
    </div>
  );
}
