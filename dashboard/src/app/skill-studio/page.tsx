'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wand2, ChevronRight, ChevronLeft, Check, AlertTriangle,
  Loader2, FileText, Code2, PlayCircle, Upload, Zap, Copy, CheckCheck
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ExtractResult {
  steps: string[];
  inputs: string[];
  outputs: string[];
  suggested_name: string;
  has_api_calls: boolean;
  has_file_io: boolean;
  estimated_complexity: string;
}

interface BrainstormQuestion {
  key: string;
  question: string;
}

interface BriefEntry {
  key: string;
  question: string;
  answer: string;
}

interface DesignDoc {
  skill_name: string;
  description: string;
  directory_structure: string[];
  needs_code: boolean;
  pattern: string;
  workflow_steps: { step: number; name: string; description: string }[];
  [key: string]: any;
}

interface GeneratedFiles {
  skill_name: string;
  files: { 'SKILL.md': string; 'scripts/skill_cli.py': string };
}

interface ValidateResult {
  success: boolean;
  stdout: string;
  stderr: string;
  returncode: number;
  subcommands_detected: string[];
}

interface PublishResult {
  success: boolean;
  skill_name: string;
  install_path: string;
  files_written: string[];
  message: string;
}

// ─── Phase config ─────────────────────────────────────────────────────────────
const PHASES = [
  { id: 1, label: 'Capture', icon: FileText, desc: 'Describe your workflow' },
  { id: 2, label: 'Brainstorm', icon: Wand2, desc: 'Refine through Q&A' },
  { id: 3, label: 'Design', icon: Code2, desc: 'Review the blueprint' },
  { id: 4, label: 'Generate', icon: Zap, desc: 'Build the skill' },
  { id: 5, label: 'Validate', icon: PlayCircle, desc: 'Test it works' },
  { id: 6, label: 'Publish', icon: Upload, desc: 'Install to workspace' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`border border-[var(--border)] bg-[var(--surface)] rounded-sm p-6 ${className}`}>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--primary)] font-mono mb-2">{children}</p>;
}

function CodeBlock({ code, language = 'python' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group">
      <pre className="bg-[var(--background)] border border-[var(--border)] rounded-sm p-4 text-[11px] font-mono text-[var(--foreground)] overflow-auto max-h-96 leading-relaxed whitespace-pre-wrap">
        {code}
      </pre>
      <button onClick={copy} className="absolute top-2 right-2 p-1.5 bg-[var(--surface)] border border-[var(--border)] rounded opacity-0 group-hover:opacity-100 transition-all hover:border-[var(--primary)]">
        {copied ? <CheckCheck size={12} className="text-[var(--primary)]" /> : <Copy size={12} className="text-[var(--muted)]" />}
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SkillStudioPage() {
  const [phase, setPhase] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Phase 1 — Capture
  const [workflowText, setWorkflowText] = useState('');
  const [extracted, setExtracted] = useState<ExtractResult | null>(null);

  // Phase 2 — Brainstorm
  const [round, setRound] = useState(1);
  const [brief, setBrief] = useState<Record<string, string>>({});
  const [questions, setQuestions] = useState<BrainstormQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [completionPct, setCompletionPct] = useState(0);
  const [briefEntries, setBriefEntries] = useState<BriefEntry[]>([]);
  const [brainstormComplete, setBrainstormComplete] = useState(false);

  // Phase 3 — Design
  const [design, setDesign] = useState<DesignDoc | null>(null);
  const [designApproved, setDesignApproved] = useState(false);

  // Phase 4 — Generate
  const [generated, setGenerated] = useState<GeneratedFiles | null>(null);
  const [activeFile, setActiveFile] = useState<'SKILL.md' | 'scripts/skill_cli.py'>('SKILL.md');

  // Phase 5 — Validate
  const [testInput, setTestInput] = useState('');
  const [validateResult, setValidateResult] = useState<ValidateResult | null>(null);

  // Phase 6 — Publish
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);

  // Load brainstorm questions on mount & round changes
  useEffect(() => {
    if (phase === 2) {
      loadBrainstormRound();
    }
  }, [phase, round]);

  // ─── API calls ──────────────────────────────────────────────────────────────
  async function handleExtract() {
    if (!workflowText.trim()) return;
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/skill-studio/extract', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow: workflowText }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setExtracted(data);
      setPhase(2);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function loadBrainstormRound() {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/skill-studio/brainstorm', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ round, brief }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setQuestions(data.questions || []);
      setCompletionPct(data.completion_pct || 0);
      setBrainstormComplete(data.is_complete || false);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  function submitAnswers() {
    const newBrief = { ...brief };
    const newEntries = [...briefEntries];
    questions.forEach(q => {
      if (answers[q.key]) {
        newBrief[q.key] = answers[q.key];
        newEntries.push({ key: q.key, question: q.question, answer: answers[q.key] });
      }
    });
    setBrief(newBrief);
    setBriefEntries(newEntries);
    setAnswers({});
    if (round < 5) setRound(r => r + 1);
  }

  async function handleDesign() {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/skill-studio/design', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDesign(data);
      setPhase(3);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function handleGenerate() {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/skill-studio/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ design, brief }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setGenerated(data);
      setPhase(4);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function handleValidate() {
    if (!generated) return;
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/skill-studio/validate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generated, testInput }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setValidateResult(data);
      setPhase(5);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function handlePublish() {
    if (!generated) return;
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/skill-studio/publish', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generated }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPublishResult(data);
      setPhase(6);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-[var(--border)] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[var(--primary)]/10 border border-[var(--primary)]/30 flex items-center justify-center">
            <Wand2 size={16} className="text-[var(--primary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-mono text-[var(--foreground)] tracking-tight">Skill Studio</h1>
            <p className="text-[10px] text-[var(--muted)] font-mono uppercase tracking-widest">Workflow → Reusable Agent Skill</p>
          </div>
        </div>
        <div className="ml-auto text-[10px] font-mono text-[var(--muted)]">
          Powered by Gemini API → Ollama fallback
        </div>
      </div>

      {/* Phase Progress Bar */}
      <div className="flex items-center gap-1">
        {PHASES.map((p, i) => {
          const Icon = p.icon;
          const isActive = phase === p.id;
          const isDone = phase > p.id;
          return (
            <div key={p.id} className="flex items-center gap-1 flex-1 min-w-0">
              <button
                onClick={() => isDone && setPhase(p.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-sm text-[9px] font-bold font-mono uppercase tracking-widest transition-all flex-1 min-w-0 ${
                  isActive ? 'bg-[var(--primary)] text-[var(--background)]' :
                  isDone ? 'bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 cursor-pointer hover:bg-[var(--primary)]/20' :
                  'bg-[var(--surface)] text-[var(--muted)] border border-[var(--border)] cursor-default'
                }`}
              >
                {isDone ? <Check size={10} /> : <Icon size={10} className="shrink-0" />}
                <span className="truncate hidden sm:block">{p.label}</span>
              </button>
              {i < PHASES.length - 1 && (
                <ChevronRight size={10} className={`shrink-0 ${isDone ? 'text-[var(--primary)]' : 'text-[var(--border)]'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 p-3 bg-red-950/30 border border-red-500/30 rounded-sm">
          <AlertTriangle size={14} className="text-red-400 shrink-0" />
          <p className="text-[11px] font-mono text-red-400">{error}</p>
          <button onClick={() => setError('')} className="ml-auto text-[9px] text-red-400 hover:underline font-mono">DISMISS</button>
        </div>
      )}

      {/* ── Phase 1: Capture ── */}
      <AnimatePresence mode="wait">
        {phase === 1 && (
          <motion.div key="p1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <Panel>
              <Label>Phase 1 — Capture Your Workflow</Label>
              <p className="text-xs text-[var(--muted)] font-mono mb-4 leading-relaxed">
                Describe your workflow in plain language. Paste a CLI log, a conversation transcript, or just explain what you do step by step.
                The more detail you give, the better the generated skill.
              </p>
              <textarea
                value={workflowText}
                onChange={e => setWorkflowText(e.target.value)}
                rows={10}
                placeholder={`Example:\nEvery morning I check git status, look at open issues, run the test suite, then push any pending commits. I also check if any API keys in .env are expired by hitting each endpoint. If something fails I send myself a Telegram message.`}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-sm p-4 text-xs font-mono text-[var(--foreground)] placeholder:text-[var(--muted)] resize-none focus:outline-none focus:border-[var(--primary)] transition-colors leading-relaxed"
              />
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleExtract}
                  disabled={loading || !workflowText.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[var(--primary)] text-[var(--background)] text-[10px] font-bold uppercase tracking-widest font-mono hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed rounded-sm"
                >
                  {loading ? <Loader2 size={12} className="animate-spin" /> : <ChevronRight size={12} />}
                  Extract Steps
                </button>
              </div>
            </Panel>

            {extracted && (
              <Panel>
                <Label>Extracted Workflow</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div>
                    <p className="text-[9px] text-[var(--muted)] font-mono uppercase tracking-widest mb-2">Steps Detected</p>
                    {extracted.steps.map((s, i) => (
                      <p key={i} className="text-[11px] font-mono text-[var(--foreground)] mb-1">
                        <span className="text-[var(--primary)] mr-2">{i + 1}.</span>{s}
                      </p>
                    ))}
                  </div>
                  <div>
                    <p className="text-[9px] text-[var(--muted)] font-mono uppercase tracking-widest mb-2">Inputs</p>
                    {extracted.inputs.map((s, i) => <p key={i} className="text-[11px] font-mono text-[var(--foreground)] mb-1">→ {s}</p>)}
                    <p className="text-[9px] text-[var(--muted)] font-mono uppercase tracking-widest mb-2 mt-3">Outputs</p>
                    {extracted.outputs.map((s, i) => <p key={i} className="text-[11px] font-mono text-[var(--foreground)] mb-1">← {s}</p>)}
                  </div>
                  <div>
                    <p className="text-[9px] text-[var(--muted)] font-mono uppercase tracking-widest mb-2">Metadata</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-[var(--muted)]">Suggested name</span>
                        <span className="text-[var(--primary)]">{extracted.suggested_name}</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-[var(--muted)]">API calls</span>
                        <span className={extracted.has_api_calls ? 'text-emerald-400' : 'text-[var(--muted)]'}>{extracted.has_api_calls ? 'YES' : 'NO'}</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-[var(--muted)]">Complexity</span>
                        <span className="text-[var(--foreground)]">{extracted.estimated_complexity}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Panel>
            )}
          </motion.div>
        )}

        {/* ── Phase 2: Brainstorm ── */}
        {phase === 2 && (
          <motion.div key="p2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Q&A Panel */}
            <div className="md:col-span-2 space-y-4">
              <Panel>
                <div className="flex justify-between items-center mb-4">
                  <Label>Phase 2 — Brainstorm (Round {round}/5)</Label>
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-24 bg-[var(--background)] rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--primary)] transition-all duration-500" style={{ width: `${completionPct}%` }} />
                    </div>
                    <span className="text-[9px] font-mono text-[var(--primary)]">{completionPct}%</span>
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--muted)] py-8 justify-center">
                    <Loader2 size={14} className="animate-spin text-[var(--primary)]" />
                    Loading questions...
                  </div>
                ) : (
                  <div className="space-y-5">
                    {questions.map(q => (
                      <div key={q.key}>
                        <p className="text-[11px] font-mono text-[var(--foreground)] mb-2 leading-relaxed">{q.question}</p>
                        <textarea
                          value={answers[q.key] || ''}
                          onChange={e => setAnswers(a => ({ ...a, [q.key]: e.target.value }))}
                          rows={3}
                          placeholder="Your answer..."
                          className="w-full bg-[var(--background)] border border-[var(--border)] rounded-sm p-3 text-[11px] font-mono text-[var(--foreground)] placeholder:text-[var(--muted)] resize-none focus:outline-none focus:border-[var(--primary)] transition-colors"
                        />
                      </div>
                    ))}

                    {questions.length === 0 && !brainstormComplete && (
                      <p className="text-[11px] font-mono text-[var(--muted)] text-center py-4">All questions answered for this round.</p>
                    )}

                    <div className="flex justify-between items-center pt-2">
                      <button onClick={() => setPhase(1)} className="text-[9px] font-mono text-[var(--muted)] hover:text-[var(--foreground)] flex items-center gap-1 transition-colors">
                        <ChevronLeft size={10} /> Back
                      </button>
                      <div className="flex gap-2">
                        {!brainstormComplete && (
                          <button
                            onClick={submitAnswers}
                            disabled={questions.every(q => !answers[q.key])}
                            className="px-4 py-2 bg-[var(--surface)] border border-[var(--border)] text-[9px] font-bold font-mono uppercase tracking-widest hover:border-[var(--primary)] transition-all disabled:opacity-40"
                          >
                            Next Round
                          </button>
                        )}
                        <button
                          onClick={handleDesign}
                          disabled={loading || (!brainstormComplete && completionPct < 50)}
                          className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-[var(--background)] text-[9px] font-bold uppercase tracking-widest font-mono hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {loading ? <Loader2 size={10} className="animate-spin" /> : <ChevronRight size={10} />}
                          {brainstormComplete ? 'Generate Design' : `Generate Design (${completionPct}% complete)`}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </Panel>
            </div>

            {/* Live Design Brief */}
            <div className="space-y-4">
              <Panel>
                <Label>Design Brief (Live)</Label>
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {briefEntries.length === 0 ? (
                    <p className="text-[10px] font-mono text-[var(--muted)]">Answers will appear here as you go...</p>
                  ) : briefEntries.map((e, i) => (
                    <div key={i} className="border-b border-[var(--border)] pb-2">
                      <p className="text-[9px] font-mono text-[var(--primary)] uppercase tracking-widest">{e.key}</p>
                      <p className="text-[10px] font-mono text-[var(--foreground)] mt-1 leading-relaxed">{e.answer}</p>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </motion.div>
        )}

        {/* ── Phase 3: Design ── */}
        {phase === 3 && design && (
          <motion.div key="p3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <Panel>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Label>Phase 3 — Design Review</Label>
                  <p className="text-xs text-[var(--muted)] font-mono">Review the generated blueprint before code is produced. Edit if needed, then approve.</p>
                </div>
                <span className={`text-[9px] font-bold px-2 py-1 border font-mono ${design.needs_code ? 'text-blue-400 border-blue-400/30 bg-blue-400/10' : 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10'}`}>
                  {design.pattern?.toUpperCase()} PATTERN
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-[9px] text-[var(--muted)] font-mono uppercase tracking-widest mb-1">Skill Name</p>
                    <p className="text-sm font-bold font-mono text-[var(--primary)]">{design.skill_name}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-[var(--muted)] font-mono uppercase tracking-widest mb-1">Description</p>
                    <p className="text-[11px] font-mono text-[var(--foreground)] leading-relaxed">{design.description}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-[var(--muted)] font-mono uppercase tracking-widest mb-2">Directory Structure</p>
                    {design.directory_structure?.map((f: string, i: number) => (
                      <p key={i} className="text-[11px] font-mono text-[var(--foreground)] mb-1">
                        <span className="text-[var(--primary)] mr-2">📄</span>{f}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-[9px] text-[var(--muted)] font-mono uppercase tracking-widest mb-2">Workflow Steps</p>
                    {design.workflow_steps?.map((step: any) => (
                      <div key={step.step} className="flex gap-3 mb-3 p-2 bg-[var(--background)] border border-[var(--border)] rounded-sm">
                        <span className="text-[var(--primary)] font-bold font-mono text-[11px] shrink-0">{step.step}.</span>
                        <div>
                          <p className="text-[11px] font-bold font-mono text-[var(--foreground)]">{step.name}</p>
                          <p className="text-[10px] font-mono text-[var(--muted)] mt-0.5">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {design.error_handling_strategy && (
                    <div>
                      <p className="text-[9px] text-[var(--muted)] font-mono uppercase tracking-widest mb-1">Error Handling</p>
                      <p className="text-[11px] font-mono text-[var(--foreground)] leading-relaxed">{design.error_handling_strategy}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-[var(--border)]">
                <button onClick={() => setPhase(2)} className="text-[9px] font-mono text-[var(--muted)] hover:text-[var(--foreground)] flex items-center gap-1 transition-colors">
                  <ChevronLeft size={10} /> Revise Brief
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[var(--primary)] text-[var(--background)] text-[10px] font-bold uppercase tracking-widest font-mono hover:opacity-90 transition-all disabled:opacity-40"
                >
                  {loading ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                  {loading ? 'Generating (up to 60s)...' : 'Approve & Generate'}
                </button>
              </div>
            </Panel>
          </motion.div>
        )}

        {/* ── Phase 4: Generate ── */}
        {phase === 4 && generated && (
          <motion.div key="p4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <Panel>
              <Label>Phase 4 — Generated Files</Label>
              {/* File tabs */}
              <div className="flex gap-1 mb-4">
                {(Object.keys(generated.files) as Array<keyof typeof generated.files>)
                  .filter(k => generated.files[k])
                  .map(k => (
                    <button
                      key={k}
                      onClick={() => setActiveFile(k as any)}
                      className={`px-3 py-1.5 text-[9px] font-bold font-mono uppercase tracking-widest transition-all ${
                        activeFile === k ? 'bg-[var(--primary)] text-[var(--background)]' : 'bg-[var(--background)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]'
                      }`}
                    >
                      {k}
                    </button>
                  ))}
              </div>
              <CodeBlock code={generated.files[activeFile] || '// No content'} language={activeFile === 'SKILL.md' ? 'markdown' : 'python'} />

              <div className="flex justify-between items-center mt-4">
                <button onClick={() => setPhase(3)} className="text-[9px] font-mono text-[var(--muted)] hover:text-[var(--foreground)] flex items-center gap-1 transition-colors">
                  <ChevronLeft size={10} /> Back to Design
                </button>
                <button
                  onClick={handleValidate}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[var(--primary)] text-[var(--background)] text-[10px] font-bold uppercase tracking-widest font-mono hover:opacity-90 transition-all disabled:opacity-40"
                >
                  {loading ? <Loader2 size={12} className="animate-spin" /> : <PlayCircle size={12} />}
                  Validate Skill
                </button>
              </div>
            </Panel>
          </motion.div>
        )}

        {/* ── Phase 5: Validate ── */}
        {phase === 5 && (
          <motion.div key="p5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <Panel>
              <Label>Phase 5 — Validate</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-[9px] text-[var(--muted)] font-mono uppercase tracking-widest mb-2">Test Input (Optional)</p>
                    <textarea
                      value={testInput}
                      onChange={e => setTestInput(e.target.value)}
                      rows={3}
                      placeholder="Sample input to test the skill with..."
                      className="w-full bg-[var(--background)] border border-[var(--border)] rounded-sm p-3 text-[11px] font-mono text-[var(--foreground)] placeholder:text-[var(--muted)] resize-none focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                  </div>
                  <button
                    onClick={handleValidate}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-[var(--background)] text-[9px] font-bold uppercase tracking-widest font-mono hover:opacity-90 transition-all disabled:opacity-40"
                  >
                    {loading ? <Loader2 size={10} className="animate-spin" /> : <PlayCircle size={10} />}
                    Run Validation
                  </button>
                </div>

                {validateResult && (
                  <div className="space-y-3">
                    <div className={`flex items-center gap-2 p-3 border rounded-sm ${validateResult.success ? 'border-emerald-500/30 bg-emerald-950/20' : 'border-red-500/30 bg-red-950/20'}`}>
                      {validateResult.success ? <Check size={14} className="text-emerald-400" /> : <AlertTriangle size={14} className="text-red-400" />}
                      <span className={`text-[11px] font-bold font-mono ${validateResult.success ? 'text-emerald-400' : 'text-red-400'}`}>
                        {validateResult.success ? 'VALIDATION PASSED' : 'VALIDATION FAILED'}
                      </span>
                      <span className="text-[9px] font-mono text-[var(--muted)] ml-auto">exit {validateResult.returncode}</span>
                    </div>

                    {validateResult.subcommands_detected?.length > 0 && (
                      <div>
                        <p className="text-[9px] font-mono text-[var(--muted)] uppercase tracking-widest mb-1">Subcommands Detected</p>
                        <div className="flex flex-wrap gap-1">
                          {validateResult.subcommands_detected.map(s => (
                            <span key={s} className="text-[9px] font-mono px-2 py-0.5 bg-[var(--background)] border border-[var(--border)] text-[var(--primary)]">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {validateResult.stdout && (
                      <div>
                        <p className="text-[9px] font-mono text-[var(--muted)] uppercase tracking-widest mb-1">Output</p>
                        <pre className="text-[10px] font-mono text-[var(--foreground)] bg-[var(--background)] border border-[var(--border)] p-3 rounded-sm overflow-auto max-h-36 whitespace-pre-wrap">{validateResult.stdout}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-[var(--border)]">
                <button onClick={() => setPhase(4)} className="text-[9px] font-mono text-[var(--muted)] hover:text-[var(--foreground)] flex items-center gap-1 transition-colors">
                  <ChevronLeft size={10} /> Back to Code
                </button>
                <button
                  onClick={handlePublish}
                  disabled={loading || !validateResult?.success}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[var(--primary)] text-[var(--background)] text-[10px] font-bold uppercase tracking-widest font-mono hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                  {validateResult?.success ? 'Install to Workspace' : 'Validation Required First'}
                </button>
              </div>
            </Panel>
          </motion.div>
        )}

        {/* ── Phase 6: Publish ── */}
        {phase === 6 && publishResult && (
          <motion.div key="p6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <Panel>
              <Label>Phase 6 — Published</Label>
              <div className="flex flex-col items-center py-8 space-y-6 text-center">
                <div className="w-16 h-16 bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-full flex items-center justify-center">
                  <Check size={28} className="text-[var(--primary)]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-mono text-[var(--foreground)]">{publishResult.skill_name}</h2>
                  <p className="text-[11px] font-mono text-[var(--muted)] mt-1">{publishResult.message}</p>
                </div>
                <div className="w-full max-w-lg text-left space-y-2">
                  <p className="text-[9px] font-mono text-[var(--muted)] uppercase tracking-widest">Files Written</p>
                  {publishResult.files_written.map(f => (
                    <p key={f} className="text-[10px] font-mono text-[var(--foreground)] flex items-center gap-2">
                      <Check size={10} className="text-emerald-400 shrink-0" />
                      {f}
                    </p>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setPhase(1); setWorkflowText(''); setExtracted(null);
                      setBrief({}); setBriefEntries([]); setRound(1); setDesign(null);
                      setGenerated(null); setValidateResult(null); setPublishResult(null);
                    }}
                    className="px-6 py-2.5 bg-[var(--surface)] border border-[var(--border)] text-[10px] font-bold uppercase tracking-widest font-mono hover:border-[var(--primary)] transition-all"
                  >
                    Build Another Skill
                  </button>
                </div>
              </div>
            </Panel>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
