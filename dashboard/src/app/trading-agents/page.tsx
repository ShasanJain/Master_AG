'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, LineChart, MessageSquareCode, Settings, Play, RefreshCw, Activity, ArrowRightLeft } from 'lucide-react';

export default function TradingAgentsPage() {
  const [ticker, setTicker] = useState('AAPL');
  const [llmProvider, setLlmProvider] = useState('ollama');
  const [debateRounds, setDebateRounds] = useState(2);
  const [logs, setLogs] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [decision, setDecision] = useState<{ action: string; confidence: string; details: string } | null>(null);

  const startSimulation = () => {
    setIsRunning(true);
    setDecision(null);
    setLogs('[SIMULATOR] Connecting to Yahoo Finance data feeds...\n[SIMULATOR] Pulling historical pricing, financials, and indicators...\n');

    setTimeout(() => {
      setLogs(prev => prev + '[ANALYST] Technical Analyst: MACD crossover detected on daily charts. RSI neutral at 52.\n[ANALYST] Fundamentals Analyst: Solid P/E ratio relative to sector peers, free cash flow target met.\n[ANALYST] Sentiment Analyst: StockTwits sentiment bullish (+15%), Reddit chatter elevated on earnings predictions.\n');
    }, 1500);

    setTimeout(() => {
      setLogs(prev => prev + '[DEBATE] Bullish Researcher: The technical support level at $180 holds firm. Recommending BUY.\n[DEBATE] Bearish Researcher: Macro interest rates remain highly volatile. Risk profile advises HOLD.\n[DEBATE] Commencing Agent Debate Round 1...\n[DEBATE] Consensus reached: Buy recommendation with high risk-adjustments.\n');
    }, 3000);

    setTimeout(() => {
      setLogs(prev => prev + '[TRADER] Trader Agent: Proposing order size: 50 shares of ' + ticker + '.\n[PORTFOLIO] Portfolio Manager: Trade approved. Risk management bounds respected.\n[SIMULATOR] Simulation completed successfully.\n');
      setDecision({
        action: 'BUY',
        confidence: '82%',
        details: 'Consensus recommended BUY based on solid technical crossovers and positive earnings sentiment overrides.'
      });
      setIsRunning(false);
    }, 4500);
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
                  <option value="ollama">Ollama Local (Qwen / Llama)</option>
                  <option value="gemini-free">Gemini Flash (Free tier)</option>
                  <option value="openai">OpenAI Endpoint</option>
                </select>
              </div>

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
