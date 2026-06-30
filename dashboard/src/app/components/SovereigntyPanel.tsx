import { useState, useEffect, useRef } from 'react';
import { TerminalSquare, Activity, ShieldAlert } from 'lucide-react';

export default function SovereigntyPanel() {
  const [terminalOutput, setTerminalOutput] = useState<string>('');
  const [isLive, setIsLive] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);

  const fetchTerminal = async () => {
    if (!isLive) return;
    try {
      const res = await fetch('/api/terminal');
      const data = await res.json();
      setTerminalOutput(data.output);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const runFetch = () => {
      if (!isLive) return;
      fetchTerminal();
    };
    runFetch();
    const interval = setInterval(runFetch, 3000);
    return () => clearInterval(interval);
  }, [isLive]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  return (
    <div className="glass-card flex flex-col border border-[var(--border)] rounded-2xl overflow-hidden bg-black/90 shadow-2xl">
      {/* Terminal Header */}
      <div className="bg-[#0f1115] border-b border-[var(--border)] px-4 py-3 flex justify-between items-center select-none">
        <div className="flex items-center gap-3">
          <TerminalSquare className="w-4 h-4 text-emerald-500" />
          <h3 className="text-xs font-bold text-[var(--faint)] uppercase tracking-widest">Sovereignty Panel</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse' : 'bg-rose-500'}`}></span>
            <span className="text-[10px] font-mono text-[var(--muted)] uppercase tracking-widest">{isLive ? 'LIVE' : 'PAUSED'}</span>
          </div>
          <button 
            onClick={() => setIsLive(!isLive)}
            className="text-[10px] font-bold text-[var(--foreground)] bg-[var(--surface)] px-2 py-1 rounded border border-[var(--border)] hover:bg-[var(--border)] transition-colors uppercase tracking-widest"
          >
            {isLive ? 'Pause Stream' : 'Resume'}
          </button>
        </div>
      </div>
      
      {/* Terminal Body */}
      <div 
        ref={terminalRef}
        className="p-4 h-64 overflow-y-auto font-mono text-[11px] leading-relaxed text-emerald-400/90 whitespace-pre-wrap custom-scrollbar"
      >
        {terminalOutput || "Connecting to Jack-Prime execution socket..."}
      </div>
    </div>
  );
}
