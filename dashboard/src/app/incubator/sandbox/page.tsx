'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Smartphone, Monitor, Play, Loader2, ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface AppMeta {
  id: string;
  name: string;
  desc: string;
  defaultPort: number;
  tech: string;
  emoji: string;
  repo: string;
  path: string;
}

const APPS: AppMeta[] = [
  {
    id: 'hackkit',
    name: 'EdConnect AI (Base Wrapper)',
    desc: 'The initial Next.js education wrapper with Firebase & Gemini features.',
    defaultPort: 3000,
    tech: 'Next.js 15, TSX, Firebase',
    emoji: '🎓',
    repo: 'Local Workspace',
    path: 'hackkit'
  },
  {
    id: 'finswipe',
    name: 'FinSwipe (Winner)',
    desc: 'Gamified financial literacy with cards and vision receipt scanner.',
    defaultPort: 5174,
    tech: 'React 19, Vite, Tailwind CSS',
    emoji: '💸',
    repo: 'aryan-sharma21/FinSwipe',
    path: 'FinSwipe'
  },
  {
    id: 'finbuddy',
    name: 'FinBuddy (Finalist)',
    desc: 'Vernacular-first conversational onboarding, doc scanner & calculators.',
    defaultPort: 3001,
    tech: 'Next.js 16, TSX, Translate API',
    emoji: '🤖',
    repo: 'Adides21/FinBuddy_PromptWarsMUM',
    path: 'FinBuddy_PromptWarsMUM'
  },
  {
    id: 'finlit-agent',
    name: 'FinLit Agent (Winner)',
    desc: 'Flask app featuring 50/30/20 budgeting, speech translation, and sentiment analysis.',
    defaultPort: 8080,
    tech: 'Python Flask, Text-To-Speech',
    emoji: '🚀',
    repo: 'hvt77/gcp-promptwars-hvt-finlit-agent',
    path: 'gcp-promptwars-hvt-finlit-agent'
  },
  {
    id: 'caresync',
    name: 'CareSync AI (Winner)',
    desc: 'AI-powered doctor-patient coordinator, portal schedules, and records manager.',
    defaultPort: 5173,
    tech: 'React 18, Express, Zustand',
    emoji: '🏥',
    repo: 'Programmer-NITIN/CareSync-AI',
    path: 'CareSync-AI'
  },
  {
    id: 'ecopulse',
    name: 'EcoPulse AI (Finalist)',
    desc: 'AI-powered carbon footprint monitoring and sustainability intelligence.',
    defaultPort: 3002,
    tech: 'Next.js 16, TSX, Recharts',
    emoji: '🌱',
    repo: 'vindhya-hv/EcoPulse-AI',
    path: 'EcoPulse-AI'
  }
];

export default function SandboxPage() {
  const [selectedApp, setSelectedApp] = useState<AppMeta>(APPS[1]); // Default to FinSwipe
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'desktop'>('mobile');
  const [status, setStatus] = useState<Record<string, 'online' | 'offline' | 'checking'>>({});
  const [reloadKey, setReloadKey] = useState(0);

  const checkStatus = async (app: AppMeta) => {
    setStatus(prev => ({ ...prev, [app.id]: 'checking' }));
    try {
      // Use client-side ping (no-cors) to test if local port is serving
      const res = await fetch(`http://localhost:${app.defaultPort}/`, { mode: 'no-cors' });
      setStatus(prev => ({ ...prev, [app.id]: 'online' }));
    } catch {
      setStatus(prev => ({ ...prev, [app.id]: 'offline' }));
    }
  };

  useEffect(() => {
    // Perform initial status checks
    APPS.forEach(app => checkStatus(app));
    const interval = setInterval(() => {
      APPS.forEach(app => checkStatus(app));
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setReloadKey(prev => prev + 1);
    checkStatus(selectedApp);
  };

  return (
    <>
      <div className="atmospheric-orb orb-emerald"></div>
      <div className="atmospheric-orb orb-sapphire"></div>
      
      <div className="w-full h-full max-w-7xl mx-auto flex flex-col space-y-6 relative z-10 p-4 sm:p-6">
        
        {/* Header */}
        <section className="flex justify-between items-end border-b border-[var(--border)] pb-4 mt-2">
          <div>
            <h2 className="text-4xl font-bold tracking-tight mb-2 text-[var(--foreground)] font-mono">App Sandbox</h2>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest font-mono">Interactive Stage:</span>
              <span className="text-[9px] font-black px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 uppercase tracking-widest font-mono">ACTIVE</span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* App Registry Sidebar (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col gap-4">
              <span className="text-[10px] font-mono text-[var(--muted)] uppercase tracking-widest font-bold">Hackathon Finalists</span>
              <div className="flex flex-col gap-3">
                {APPS.map(app => {
                  const appStatus = status[app.id] || 'checking';
                  return (
                    <button
                      key={app.id}
                      onClick={() => {
                        setSelectedApp(app);
                        setReloadKey(prev => prev + 1);
                      }}
                      className={`flex items-start gap-4 p-4 text-left border transition-all ${selectedApp.id === app.id ? 'border-[var(--primary)] bg-[var(--background)] shadow-[0_0_15px_var(--primary-glow)]' : 'border-[var(--border)] hover:border-[var(--muted)] bg-transparent'}`}
                    >
                      <span className="text-2xl mt-1 select-none">{app.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center gap-2 mb-1">
                          <h4 className="font-bold text-xs font-mono text-[var(--foreground)] truncate">{app.name}</h4>
                          <span className="shrink-0 flex items-center">
                            {appStatus === 'online' ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            ) : appStatus === 'offline' ? (
                              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                            ) : (
                              <Loader2 className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                            )}
                          </span>
                        </div>
                        <p className="text-[10px] text-[var(--muted)] leading-relaxed line-clamp-2 mb-2">{app.desc}</p>
                        <div className="flex justify-between items-center text-[9px] font-mono text-[var(--faint)]">
                          <span>{app.tech}</span>
                          <span className="text-[var(--primary)] font-bold">Port {app.defaultPort}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Run Commands Info Card */}
            <div className="border border-[var(--border)] bg-[var(--background)] p-5 space-y-3">
              <span className="text-[10px] font-mono text-[var(--muted)] uppercase tracking-widest font-bold">Quick Launch Runbook</span>
              <p className="text-[10px] text-[var(--muted)] leading-relaxed">
                If an app is <span className="text-rose-500 font-bold">Offline</span>, open your terminal and start its dev server:
              </p>
              <div className="bg-[var(--surface)] p-3 rounded font-mono text-[9px] text-[var(--foreground)] space-y-2 border border-[var(--border)] overflow-x-auto">
                <div>
                  <p className="text-[var(--primary)] font-bold mb-0.5"># FinSwipe (Port 5174)</p>
                  <p className="select-all">cd FinSwipe && npm run dev -- --port 5174</p>
                </div>
                <div>
                  <p className="text-[var(--primary)] font-bold mb-0.5"># FinBuddy (Port 3001)</p>
                  <p className="select-all">cd FinBuddy_PromptWarsMUM && npm run dev -- --port 3001</p>
                </div>
                <div>
                  <p className="text-[var(--primary)] font-bold mb-0.5"># CareSync AI (Port 5173)</p>
                  <p className="select-all">cd CareSync-AI/caresync-ai/frontend && npm run dev</p>
                </div>
                <div>
                  <p className="text-[var(--primary)] font-bold mb-0.5"># EcoPulse AI (Port 3002)</p>
                  <p className="select-all">cd EcoPulse-AI && npm run dev -- --port 3002</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sandbox Frame Canvas (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            
            {/* Control Bar */}
            <div className="flex justify-between items-center bg-[var(--surface)] border border-[var(--border)] p-2 px-4 rounded-sm">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDeviceMode('mobile')}
                  className={`p-2 rounded-sm transition-all ${deviceMode === 'mobile' ? 'bg-[var(--background)] border border-[var(--border)] text-[var(--primary)]' : 'text-[var(--muted)] hover:text-[var(--foreground)]'}`}
                  title="Mobile Layout (Portrait)"
                >
                  <Smartphone size={16} />
                </button>
                <button
                  onClick={() => setDeviceMode('desktop')}
                  className={`p-2 rounded-sm transition-all ${deviceMode === 'desktop' ? 'bg-[var(--background)] border border-[var(--border)] text-[var(--primary)]' : 'text-[var(--muted)] hover:text-[var(--foreground)]'}`}
                  title="Desktop Layout"
                >
                  <Monitor size={16} />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--background)] border border-[var(--border)] text-[10px] uppercase font-bold tracking-widest font-mono text-[var(--muted)] hover:text-[var(--foreground)] transition-colors hover:border-[var(--primary)]"
                >
                  <RefreshCw size={12} className={status[selectedApp.id] === 'checking' ? 'animate-spin' : ''} />
                  Reload Frame
                </button>
                <a
                  href={`http://localhost:${selectedApp.defaultPort}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--primary)] text-[var(--background)] border border-transparent text-[10px] uppercase font-bold tracking-widest font-mono hover:opacity-90 transition-opacity"
                >
                  Open Direct
                  <ArrowUpRight size={12} />
                </a>
              </div>
            </div>

            {/* Stage Frame Area */}
            <div className="flex-1 min-h-[500px] border border-[var(--border)] bg-[var(--background)] flex items-center justify-center p-6 relative overflow-hidden bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.08),rgba(255,255,255,0))]">
              
              {status[selectedApp.id] === 'offline' ? (
                <div className="max-w-md text-center p-8 border border-[var(--border)] bg-[var(--surface)] space-y-4">
                  <span className="text-3xl">⚠️</span>
                  <h3 className="font-bold text-sm font-mono text-[var(--foreground)]">Port {selectedApp.defaultPort} Offline</h3>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">
                    No active development server detected on port {selectedApp.defaultPort}. Please start the server in your local terminal.
                  </p>
                  <button
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-[var(--primary)] text-[var(--background)] text-[10px] uppercase font-black tracking-widest font-mono hover:opacity-90"
                  >
                    Check Port Again
                  </button>
                </div>
              ) : (
                <div
                  className={`border border-[var(--border)] bg-black shadow-2xl transition-all duration-300 flex flex-col ${deviceMode === 'mobile' ? 'w-[375px] h-[667px] rounded-[36px] border-[12px] border-zinc-800' : 'w-full h-full min-h-[550px] rounded-lg'}`}
                >
                  {/* Phone Notch/Speaker mockup if mobile */}
                  {deviceMode === 'mobile' && (
                    <div className="w-full h-6 flex justify-center items-center bg-zinc-800 relative select-none">
                      <div className="w-20 h-3 bg-black rounded-full mb-1" />
                    </div>
                  )}

                  <iframe
                    key={`${selectedApp.id}-${reloadKey}`}
                    src={`http://localhost:${selectedApp.defaultPort}/`}
                    className="w-full h-full border-none bg-white rounded-b-lg"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  />
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </>
  );
}
