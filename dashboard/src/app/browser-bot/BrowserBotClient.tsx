'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Play, Globe, Video, RefreshCw, Layers } from 'lucide-react';

export default function BrowserBotClient() {
  const [urlInput, setUrlInput] = useState('https://news.ycombinator.com');
  const [scriptType, setScriptType] = useState<'generic' | 'e2e'>('generic');
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  const logsEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const handleRun = () => {
    if (isRunning) return;

    setLogs([]);
    setVideoUrl(null);
    setIsRunning(true);

    const query = scriptType === 'e2e' 
      ? `script=e2e` 
      : `script=generic&url=${encodeURIComponent(urlInput)}`;

    const sse = new EventSource(`/api/browser-bot?${query}`);
    eventSourceRef.current = sse;

    sse.onmessage = (event) => {
      setLogs((prev) => [...prev, event.data]);

      if (event.data.includes('Session complete.')) {
        setIsRunning(false);
        sse.close();
        
        // Trigger video reload after execution finishes
        const timestamp = Date.now();
        if (scriptType === 'e2e') {
          setVideoUrl(`/final_e2e_test.mp4?t=${timestamp}`);
        } else {
          setVideoUrl(`/browser_run.webm?t=${timestamp}`);
        }
      }
    };

    sse.onerror = () => {
      setLogs((prev) => [...prev, '[ERROR] Connection lost.']);
      setIsRunning(false);
      sse.close();
    };
  };

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Title & Navigation */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-mono">
          🤖 PLAYWRIGHT BROWSER BOT
        </h1>
        <p className="text-xs text-[var(--muted)] font-mono mt-1">
          Orchestrate headless browser sessions and record user actions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Panel: Configuration & Console */}
        <div className="space-y-6">
          <div className="border border-[var(--border)] bg-[var(--surface)] p-5 rounded-lg space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-[var(--primary)] flex items-center gap-2">
              <Layers className="w-4 h-4" /> Parameters
            </h2>

            <div className="space-y-4 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-[var(--muted)]">Automation Script</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setScriptType('generic')}
                    disabled={isRunning}
                    className={`flex-1 py-2 border rounded font-bold transition-all ${
                      scriptType === 'generic' 
                        ? 'bg-blue-500/20 border-blue-500 text-blue-400' 
                        : 'border-[var(--border)] text-[var(--muted)] hover:text-white'
                    }`}
                  >
                    Generic URL Capture
                  </button>
                  <button
                    onClick={() => setScriptType('e2e')}
                    disabled={isRunning}
                    className={`flex-1 py-2 border rounded font-bold transition-all ${
                      scriptType === 'e2e' 
                        ? 'bg-purple-500/20 border-purple-500 text-purple-400' 
                        : 'border-[var(--border)] text-[var(--muted)] hover:text-white'
                    }`}
                  >
                    E2E Stripe Flow
                  </button>
                </div>
              </div>

              {scriptType === 'generic' && (
                <div className="space-y-1">
                  <label className="text-[var(--muted)]">Target URL</label>
                  <div className="flex gap-2">
                    <Globe className="w-4 h-4 self-center text-[var(--muted)]" />
                    <input
                      type="text"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      disabled={isRunning}
                      className="w-full bg-[var(--background)] border border-[var(--border)] p-2 rounded text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleRun}
                disabled={isRunning || (scriptType === 'generic' && !urlInput)}
                className="w-full bg-blue-500 text-black py-2.5 rounded font-bold hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
              >
                {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {isRunning ? 'Executing Session...' : 'Launch Headless Session'}
              </button>
            </div>
          </div>

          {/* Terminal Console */}
          <div className="border border-[var(--border)] bg-[var(--surface)] p-5 rounded-lg space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-[var(--muted)] flex items-center gap-2">
              <Terminal className="w-4 h-4" /> Live Telemetry
            </h3>
            <pre className="p-4 bg-black text-blue-300 font-mono text-xs overflow-y-auto h-64 rounded border border-[var(--border)] leading-relaxed whitespace-pre-wrap">
              {logs.length === 0 ? (
                <span className="opacity-40">Ready to initiate connection...</span>
              ) : (
                logs.map((log, i) => (
                  <div 
                    key={i} 
                    className={
                      log.includes('✅') || log.includes('✓') 
                        ? 'text-emerald-400' 
                        : log.includes('❌') || log.includes('[ERROR]') 
                        ? 'text-rose-400' 
                        : 'text-blue-300'
                    }
                  >
                    {log}
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </pre>
          </div>
        </div>

        {/* Right Panel: Video Output */}
        <div className="border border-[var(--border)] bg-[var(--surface)] p-5 rounded-lg flex flex-col h-[520px]">
          <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-[var(--muted)] flex items-center gap-2 mb-4">
            <Video className="w-4 h-4" /> Session Recording Playback
          </h2>

          <div className="flex-1 bg-black/40 rounded border border-[var(--border)] flex items-center justify-center overflow-hidden relative">
            {videoUrl ? (
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                autoPlay
                loop
                muted
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center font-mono text-xs text-[var(--muted)] space-y-2">
                <Video className="w-8 h-8 mx-auto opacity-30 animate-pulse" />
                <p className="opacity-50">No Recording Loaded</p>
                <p className="text-[10px] opacity-35 max-w-[280px] mx-auto">
                  Launch a headless session. The video recording will appear here when completed.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
