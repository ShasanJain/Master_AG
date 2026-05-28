'use client';

import { useState, useEffect } from 'react';

interface TokenUsage {
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
}

interface TokenData {
  today: TokenUsage[];
  total: TokenUsage[];
  history: number[]; // 7 days of totals
}

export function TokenWidget() {
  const [data, setData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTokens() {
      try {
        const res = await fetch('/api/tokens');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error("Failed to fetch token data", e);
      } finally {
        setLoading(false);
      }
    }
    fetchTokens();
  }, []);

  if (loading) {
    return (
      <div className="glass-card p-6 h-full flex flex-col justify-between animate-pulse">
        <div className="h-4 w-24 bg-white/10 rounded mb-4"></div>
        <div className="h-12 w-full bg-white/5 rounded"></div>
      </div>
    );
  }

  if (!data || (data.today.length === 0 && data.total.length === 0)) {
    return (
      <div className="glass-card p-6 h-full flex flex-col justify-center items-center text-center">
        <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">Token Matrix</span>
        <p className="text-xs text-[var(--faint)] mt-2">No usage data recorded yet.</p>
      </div>
    );
  }

  const todayTotal = data.today.reduce((acc, curr) => acc + curr.prompt_tokens + curr.completion_tokens, 0);
  const maxHistory = Math.max(...data.history, 1);

  return (
    <div className="glass-card p-6 h-full flex flex-col relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/10 blur-[40px] rounded-full group-hover:bg-cyan-500/20 transition-all"></div>
      
      <div className="flex items-center justify-between mb-4 z-10">
        <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_#06b6d4]"></span>
          API Quotas
        </span>
        <span className="text-[9px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">LIVE</span>
      </div>

      <div className="flex-1 flex flex-col justify-center z-10">
        <div className="flex items-end gap-2">
          <h3 className="text-3xl font-bold tracking-tighter text-white">
            {todayTotal.toLocaleString()}
          </h3>
          <span className="text-xs font-bold text-[var(--faint)] uppercase tracking-widest mb-1.5">Tokens / 24h</span>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-2 text-[9px] font-mono uppercase text-[var(--muted)] tracking-wider">
          {data.today.slice(0, 4).map(u => (
            <div key={u.model} className="flex justify-between border-b border-[var(--border)] pb-1">
              <span className="truncate pr-2">{u.model.replace('-latest', '').replace('claude-3-5-', '')}</span>
              <span className="text-white">{(u.prompt_tokens + u.completion_tokens).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mini Bar Chart */}
      <div className="mt-4 h-8 flex items-end gap-1 z-10">
        {data.history.map((val, idx) => {
          const heightPct = Math.max(10, (val / maxHistory) * 100);
          return (
            <div key={idx} className="flex-1 flex flex-col justify-end group/bar relative">
              <div 
                className="w-full bg-cyan-500/20 rounded-sm hover:bg-cyan-400 transition-all cursor-pointer"
                style={{ height: `${heightPct}%` }}
              ></div>
              <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 bg-black text-white text-[8px] px-1 py-0.5 rounded font-mono pointer-events-none transition-opacity z-20 whitespace-nowrap">
                {val.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
