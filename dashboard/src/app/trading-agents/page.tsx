'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, LineChart, MessageSquareCode, Settings, Play, RefreshCw, Activity, ArrowRightLeft } from 'lucide-react';

export default function TradingAgentsPage() {
  const [ticker, setTicker] = useState('AAPL');
  const [llmProvider, setLlmProvider] = useState('ollama');
  const [selectedModel, setSelectedModel] = useState('gemma4:latest');
  const [debateRounds, setDebateRounds] = useState(2);
  const [logs, setLogs] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [decision, setDecision] = useState<{ action: string; confidence: string; details: string } | null>(null);

  const startSimulation = async () => {
    setIsRunning(true);
    setDecision(null);
    setLogs('[SIMULATOR] Launching Swarm simulation...\n');
    try {
      const res = await fetch('/api/trading-agents/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ticker, 
          provider: llmProvider, 
          rounds: debateRounds,
          model: llmProvider === 'ollama' ? selectedModel : '' 
        })
      });
      const data = await res.json();
      
      setLogs(data.logs || '[SIMULATOR] Simulation ended.');
      if (data.decision) {
        setDecision({
          action: data.decision.action,
          confidence: data.decision.confidence,
          details: data.decision.details
        });
      }
    } catch (err: any) {
      setLogs(prev => prev + `[SIMULATOR] Error occurred: ${err.message || err}\n`);
    }
    setIsRunning(false);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <header className="flex justify-between items-center border-b border-[var(--border)] pb-4">
          <div>
            <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-widest flex items-center gap-2 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse shadow-[0_0_8px_var(--primary-glow)]"></span>
              Monitor Cockpit // Multi-Agent Trading Firms
            </span>
            <h1 className="text-xl font-black uppercase tracking-tight text-[var(--foreground)] mt-1 font-mono">
              Trading Agents Simulator
            </h1>
          </div>
        </header>

        {/* 12-Column Grid */}
        <main className="grid grid-cols-12 gap-10">
          
          {/* Config column */}
          <div className="col-span-4 space-y-6">
            <section className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 space-y-5 hover:border-[var(--primary)] transition-all">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] border-b border-[var(--border)] pb-3">Simulation Config</h2>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[var(--muted)] uppercase tracking-wider font-mono">Ticker Asset</label>
                <select 
                  value={ticker} 
                  onChange={e => setTicker(e.target.value)}
                  className="bg-[var(--background)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] cursor-pointer font-mono"
                >
                  <option value="AAPL">AAPL (Apple Inc.)</option>
                  <option value="MSFT">MSFT (Microsoft Corp.)</option>
                  <option value="TSLA">TSLA (Tesla Inc.)</option>
                  <option value="SPY">SPY (S&P 500 ETF)</option>
                  <option value="BTC-USD">BTC-USD (Bitcoin)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[var(--muted)] uppercase tracking-wider font-mono">LLM Provider</label>
                <select 
                  value={llmProvider} 
                  onChange={e => setLlmProvider(e.target.value)}
                  className="bg-[var(--background)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] cursor-pointer font-mono"
                >
                  <option value="ollama">Ollama Local Swarm</option>
                  <option value="gemini-free">Gemini Flash (Free tier)</option>
                  <option value="openai">OpenAI Endpoint</option>
                </select>
              </div>

              {llmProvider === 'ollama' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[var(--muted)] uppercase tracking-wider font-mono">Ollama Model</label>
                  <select 
                    value={selectedModel} 
                    onChange={e => setSelectedModel(e.target.value)}
                    className="bg-[var(--background)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] cursor-pointer font-mono"
                  >
                    <option value="gemma4:latest">Gemma 4 (9.6 GB)</option>
                    <option value="llama3.2:latest">Llama 3.2 (2.0 GB)</option>
                    <option value="hermes3:latest">Hermes 3 (4.7 GB)</option>
                    <option value="dolphin-llama3:latest">Dolphin Llama 3 (4.7 GB)</option>
                  </select>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[var(--muted)] uppercase tracking-wider font-mono">Debate Rounds ({debateRounds})</label>
                <input 
                  type="range" min="1" max="5" 
                  value={debateRounds} 
                  onChange={e => setDebateRounds(parseInt(e.target.value))}
                  className="w-full h-1 bg-[var(--border)] rounded-lg appearance-none cursor-pointer mt-1"
                />
              </div>

              <button
                onClick={startSimulation}
                disabled={isRunning}
                className="w-full py-3 rounded-lg text-xs font-bold shiny-button flex items-center justify-center gap-2 mt-4"
              >
                <Play size={12} /> {isRunning ? 'Running Simulation...' : 'Launch Simulation Swarm'}
              </button>
            </section>
          </div>

          {/* Simulator Visualizer & Logs */}
          <div className="col-span-8 space-y-6">
            <h2 className="text-sm font-semibold text-[var(--foreground)] flex justify-between">
              <span>Swarm Thought Process</span>
              <span className={`text-xs font-mono ${isRunning ? 'text-amber-400 animate-pulse' : 'text-green-400'}`}>
                ● {isRunning ? 'Processing' : 'Idle'}
              </span>
            </h2>

            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 space-y-4">
              <div className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-4 h-[30vh] overflow-y-auto">
                <pre className="text-xs text-[var(--foreground)] font-mono whitespace-pre-wrap leading-relaxed">
                  {logs || 'Swarm ready. Click Launch to commence financial analysis.'}
                </pre>
              </div>

              {decision && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 flex gap-4 items-center">
                  <ShieldCheck className="text-emerald-500 w-10 h-10 shrink-0" />
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black bg-emerald-500 text-[var(--background)] px-2 py-0.5 rounded font-mono">
                        {decision.action} Proposal
                      </span>
                      <span className="text-xs text-[var(--muted)] font-mono">Confidence: {decision.confidence}</span>
                    </div>
                    <p className="text-xs text-[var(--foreground)] font-mono mt-1">{decision.details}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </main>
      </div>
    </>
  );
}
