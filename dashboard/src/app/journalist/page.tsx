'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Sparkles, Send, Globe, ExternalLink, RefreshCw } from 'lucide-react';

export default function JournalistCommandCenter() {
  const [topic, setTopic] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  
  const logsEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Auto-scroll terminal
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const handleExecute = () => {
    if (!topic.trim() || isRunning) return;
    
    // Reset state
    setLogs([]);
    setPublishedUrl(null);
    setIsRunning(true);

    // Initialize Server-Sent Events connection
    const sse = new EventSource(`/api/journalist?topic=${encodeURIComponent(topic)}`);
    eventSourceRef.current = sse;

    sse.onmessage = (event) => {
      setLogs(prev => [...prev, event.data]);
      
      // Look for the success pattern in the logs to extract the URL
      if (event.data.includes('Live Article URL:')) {
        const urlMatch = event.data.match(/http:\/\/[^\s]+/);
        if (urlMatch) {
          setPublishedUrl(urlMatch[0]);
        }
      }
      
      // Stop execution when process exits
      if (event.data.includes('Process exited')) {
        setIsRunning(false);
        sse.close();
      }
    };

    sse.onerror = (err) => {
      setLogs(prev => [...prev, '[ERROR] Telemetry connection lost.']);
      setIsRunning(false);
      sse.close();
    };
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <>
      <div className="atmospheric-orb orb-emerald"></div>
      <div className="atmospheric-orb orb-sapphire"></div>
      <div className="max-w-6xl mx-auto space-y-12 p-8 relative z-10 min-h-screen">
        
        {/* Header */}
        <section className="flex justify-between items-end">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <h1 className="text-5xl font-black tracking-tighter text-[var(--foreground)] uppercase italic flex items-center gap-4">
                <Sparkles className="w-10 h-10 text-emerald-400" />
                Journalist HQ
              </h1>
              <div className="px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 text-[10px] font-black tracking-[0.3em] uppercase shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                Autonomous
              </div>
            </div>
            <p className="text-xs font-bold text-[var(--foreground)]/30 uppercase tracking-[0.5em]">Direct integration with LTX-2 & Ghost CMS</p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Controls & Terminal */}
          <div className="space-y-8">
            {/* Control Panel */}
            <div className="glass-card p-8 border border-[var(--border)] rounded-[2rem] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_8px_32px_rgba(0,0,0,0.4)]">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--foreground)]/50 mb-6">Mission Directives</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-[var(--faint)] uppercase tracking-widest mb-2 block">Target Topic</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={isRunning}
                    placeholder="e.g. The Future of Quantum Computing"
                    className="w-full bg-[var(--background)]/50 border border-[var(--border)] rounded-xl p-4 text-sm text-[var(--foreground)] outline-none placeholder-[var(--faint)] focus:border-emerald-500/50 transition-all disabled:opacity-50 shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[var(--background)] border border-[var(--border)] opacity-60">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[var(--faint)]">Logic Engine</p>
                    <p className="text-xs font-mono text-amber-500 mt-1">Llama 3.2 (Local)</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[var(--background)] border border-[var(--border)] opacity-60">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[var(--faint)]">Media Engine</p>
                    <p className="text-xs font-mono text-purple-400 mt-1">Modal LTX-2</p>
                  </div>
                </div>

                <button
                  onClick={handleExecute}
                  disabled={isRunning || !topic.trim()}
                  className={`w-full py-4 rounded-xl border font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-lg ${
                    isRunning 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 cursor-wait' 
                      : 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500 hover:text-[var(--background)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]'
                  } disabled:opacity-50`}
                >
                  {isRunning ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  {isRunning ? 'Orchestrating Pipeline...' : 'Commence Autonomous Research'}
                </button>
              </div>
            </div>

            {/* Terminal Window */}
            <div className="glass-card flex flex-col border border-[var(--border)] rounded-[2rem] overflow-hidden h-[400px]">
              <div className="flex items-center gap-2 p-4 bg-[var(--background)] border-b border-[var(--border)]">
                <Terminal className="w-4 h-4 text-[var(--faint)]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--faint)]">Live Telemetry</span>
                {isRunning && <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>}
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 bg-[#0a0a0c] font-mono text-[11px] leading-relaxed">
                {logs.length === 0 ? (
                  <p className="text-[var(--faint)]/50 italic">Awaiting operational directives...</p>
                ) : (
                  <div className="space-y-1.5">
                    {logs.map((log, i) => (
                      <p key={i} className={`
                        ${log.includes('SUCCESS') ? 'text-emerald-400 font-bold' : ''}
                        ${log.includes('ERROR') || log.includes('WARN') ? 'text-rose-400' : ''}
                        ${log.includes('[+]') ? 'text-blue-400' : ''}
                        ${!log.includes('SUCCESS') && !log.includes('ERROR') && !log.includes('[+]') ? 'text-gray-400' : ''}
                      `}>
                        {log}
                      </p>
                    ))}
                    <div ref={logsEndRef} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Live Preview */}
          <div className="glass-card border border-[var(--border)] rounded-[2rem] overflow-hidden flex flex-col shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_8px_32px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between p-4 bg-[var(--background)] border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[var(--faint)]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--faint)]">Ghost CMS Broadcast Preview</span>
              </div>
              
              {publishedUrl && (
                <a 
                  href={publishedUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 hover:text-emerald-300 uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 transition-all hover:bg-emerald-500/20"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open Live Link
                </a>
              )}
            </div>

            <div className="flex-1 bg-white/5 relative">
              {publishedUrl ? (
                <iframe 
                  src={publishedUrl} 
                  className="w-full h-full border-none bg-white animate-in fade-in duration-1000"
                  title="Ghost Live Preview"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--faint)]">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-[var(--border)] mb-4 animate-[spin_10s_linear_infinite]" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Broadcast Active</p>
                  <p className="text-[10px] mt-2 opacity-50 font-mono">The iframe will populate automatically upon pipeline success.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
