"use client";

import { useState } from 'react';
import Link from 'next/link';
import { StatusBadge } from '../../components/StatusBadge';
import { 
  ArrowLeft, Brain, Sparkles, AlertTriangle, 
  CheckCircle, MessageSquare, Scale, HelpCircle, 
  Play, RotateCcw
} from 'lucide-react';

interface CouncilResponse {
  advisors: {
    contrarian: string;
    firstPrinciples: string;
    expansionist: string;
    outsider: string;
    builder: string;
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

export default function CouncilRoom() {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CouncilResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeAdvisor, setActiveAdvisor] = useState<string>('contrarian');

  const runCouncil = async () => {
    if (!title || !desc) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/incubator/council', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, desc })
      });
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
        setActiveAdvisor('contrarian');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during council execution');
    }
    setLoading(false);
  };

  const resetRoom = () => {
    setTitle('');
    setDesc('');
    setResult(null);
    setError(null);
  };

  return (
    <>
      <div className="atmospheric-orb orb-emerald"></div>
      <div className="atmospheric-orb orb-sapphire"></div>
      <div className="min-h-screen bg-transparent text-[var(--foreground)] font-sans tracking-tight relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        
          {/* Header */}
          <header className="flex justify-between items-center pb-6 border-b border-[var(--border)]">
            <div className="flex items-center gap-4">
              <Link href="/">
                <button className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors p-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl cursor-pointer">
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </Link>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)] uppercase font-mono">
                  COUNCIL ROOM — WAR ROOM
                </h1>
                <p className="text-xs text-[var(--muted)] mt-1">Sovereign peer-review debate. Run decisions and technical drafts through 5 independent LLM advisors.</p>
              </div>
            </div>
            <StatusBadge status="ACTIVE" />
          </header>

          {/* Form and Input Section */}
          {!result && (
            <section className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-xl space-y-4 hover:border-[var(--primary)] transition-all">
              <div className="space-y-4">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted)] block mb-1.5 font-mono">Subject / Decision Title</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Integrate SQLite or write static files directly" 
                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-4 py-3 text-xs font-mono text-[var(--foreground)] placeholder:text-[var(--faint)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted)] block mb-1.5 font-mono">Decision Description / Context</label>
                  <textarea 
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Provide full technical trade-offs, constraints, timeline expectations, and core dilemma..." 
                    className="w-full h-32 bg-[var(--background)] border border-[var(--border)] rounded-lg p-4 text-xs font-mono text-[var(--foreground)] placeholder:text-[var(--faint)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  onClick={runCouncil}
                  disabled={loading || !title || !desc}
                  className="px-8 py-3 rounded-lg font-bold text-xs disabled:opacity-50 shiny-button cursor-pointer flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  {loading ? 'DEBATING PROPOSAL…' : 'SUMMON COUNCIL'}
                </button>
              </div>

              {error && <p className="text-red-400 text-xs mt-2 bg-red-400/10 p-3 rounded border border-red-500/20 font-mono">{error}</p>}
            </section>
          )}

          {/* Results Room Section */}
          {result && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Proposal Summary Card */}
              <div className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <span className="text-[8px] bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/30 font-mono px-2 py-0.5 rounded uppercase">Proposal Grade</span>
                  <h3 className="text-lg font-bold text-[var(--foreground)] font-mono">{title}</h3>
                  <p className="text-xs text-[var(--muted)] leading-relaxed max-w-2xl">{result.enrichment.refinedDesc}</p>
                </div>
                <button 
                  onClick={resetRoom}
                  className="flex items-center gap-1.5 text-[10px] font-mono px-3 py-2 border border-[var(--border)] rounded hover:border-[var(--muted)] text-[var(--muted)] hover:text-white transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Summon New Council
                </button>
              </div>

              {/* Grid of Advisors & Chairman synthesis */}
              <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
                {/* Advisor Selector */}
                <div className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-xl h-fit space-y-2">
                  <span className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-wider block mb-3 font-mono">The Five Advisors</span>
                  
                  {([
                    { id: 'contrarian', name: 'The Contrarian', style: 'border-l-red-500' },
                    { id: 'firstPrinciples', name: 'First Principles', style: 'border-l-purple-500' },
                    { id: 'expansionist', name: 'The Expansionist', style: 'border-l-yellow-500' },
                    { id: 'outsider', name: 'The Outsider', style: 'border-l-sky-500' },
                    { id: 'builder', name: 'The Builder', style: 'border-l-emerald-500' }
                  ] as const).map((adv) => (
                    <button 
                      key={adv.id}
                      onClick={() => setActiveAdvisor(adv.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg border border-l-4 transition-all text-xs font-mono cursor-pointer flex justify-between items-center ${
                        activeAdvisor === adv.id 
                          ? 'bg-[var(--background)] border-[var(--primary)] text-[var(--foreground)]' 
                          : 'border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]'
                      } ${adv.style}`}
                    >
                      {adv.name}
                    </button>
                  ))}
                </div>

                {/* Selected Advisor Response Box */}
                <div className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-xl space-y-4">
                  <h3 className="text-sm font-bold font-mono text-[var(--foreground)] uppercase border-b border-[var(--border)] pb-2 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-[var(--primary)]" /> Advisor Verdict Log
                  </h3>
                  
                  <div className="p-4 bg-[var(--background)] border border-[var(--border)] rounded-lg min-h-[140px] text-xs font-mono leading-relaxed text-[var(--foreground)] whitespace-pre-wrap">
                    {result.advisors[activeAdvisor as keyof typeof result.advisors]}
                  </div>
                </div>
              </div>

              {/* Chairman's Final Verdict */}
              <div className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-xl space-y-6">
                <h3 className="text-sm font-bold font-mono text-[var(--foreground)] uppercase border-b border-[var(--border)] pb-2 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-amber-500" /> Chairman's Verdict Heuristics
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* PRD solution */}
                  <div className="space-y-4 font-mono text-xs">
                    <div className="p-4 bg-[var(--background)] border border-[var(--border)] rounded-lg space-y-2">
                      <span className="text-[8px] text-[var(--muted)] block uppercase tracking-wider">Solution Specification</span>
                      <p className="text-[11px] text-[var(--foreground)] leading-relaxed">{result.enrichment.miniPRD.solution}</p>
                    </div>
                    <div className="p-4 bg-[var(--background)] border border-[var(--border)] rounded-lg space-y-2">
                      <span className="text-[8px] text-[var(--muted)] block uppercase tracking-wider">Target Audience</span>
                      <p className="text-[11px] text-[var(--foreground)] leading-relaxed">{result.enrichment.miniPRD.audience}</p>
                    </div>
                  </div>

                  {/* Verdict & Difficulty */}
                  <div className="space-y-4 font-mono text-xs">
                    <div className="p-4 bg-[var(--background)] border border-[var(--border)] rounded-lg space-y-2">
                      <span className="text-[8px] text-[var(--muted)] block uppercase tracking-wider">Final Recommendation</span>
                      <p className="text-[11px] text-[var(--foreground)] font-bold italic">"{result.enrichment.verdict}"</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-[var(--background)] border border-[var(--border)] p-3 rounded">
                        <div className="text-[8px] text-[var(--muted)] uppercase mb-1">Confidence</div>
                        <div className="text-xs font-bold text-[var(--primary)]">{result.enrichment.confidence}%</div>
                      </div>
                      <div className="bg-[var(--background)] border border-[var(--border)] p-3 rounded">
                        <div className="text-[8px] text-[var(--muted)] uppercase mb-1">Difficulty</div>
                        <div className="text-xs font-bold text-white">{result.enrichment.difficulty}</div>
                      </div>
                      <div className="bg-[var(--background)] border border-[var(--border)] p-3 rounded">
                        <div className="text-[8px] text-[var(--muted)] uppercase mb-1">Timeline</div>
                        <div className="text-xs font-bold text-white">{result.enrichment.scopeEstimate}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </>
  );
}
