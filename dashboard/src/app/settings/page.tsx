'use client';

import { useState, useEffect } from "react";
import { StatusBadge } from "../components/StatusBadge";

export default function SettingsPage() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isFloatingEnabled, setIsFloatingEnabled] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('jack-theme') as 'dark' | 'light';
    const floating = localStorage.getItem('jack-floating-enabled') === 'true';
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(new Event('init') as any, savedTheme);
    }
    setIsFloatingEnabled(floating);
  }, []);

  const applyTheme = (e: React.MouseEvent | Event, newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.add('light-mode');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.remove('light-mode');
      document.documentElement.classList.add('dark');
    }
    localStorage.setItem('jack-theme', newTheme);
  };

  const toggleFloating = () => {
    const newState = !isFloatingEnabled;
    setIsFloatingEnabled(newState);
    localStorage.setItem('jack-floating-enabled', newState.toString());
    window.location.reload(); // Quickest way to sync the global component state
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <section>
        <h2 className="text-5xl font-bold tracking-tighter mb-3 text-[var(--foreground)]">Settings</h2>
        <p className="text-[var(--muted)] text-sm">Industrial Engine Configuration // v5.0.0-STABLE</p>
      </section>

      <section className="space-y-12">
        {/* Visual Theme */}
        <div className="space-y-6">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--muted)] border-b border-[var(--border)] pb-4">Visual Atmosphere</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div 
               onClick={(e) => applyTheme(e, 'dark')}
               className={`glass-card p-6 cursor-pointer border-2 transition-all ${theme === 'dark' ? 'border-blue-500 !bg-gray-800' : 'border-transparent opacity-40 hover:opacity-100'} !bg-gray-800`}
             >
                <div className="flex justify-between items-start mb-4">
                   <div className="w-12 h-12 rounded !bg-[#0a0b0e] border border-white/10" />
                   {theme === 'dark' && <StatusBadge status="ACTIVE" label="Selected" />}
                </div>
                <h4 className="font-bold text-white uppercase tracking-widest text-xs">Industrial Dark</h4>
                <p className="text-[10px] text-white/40 mt-1">Sovereign black with blue accents.</p>
             </div>

             <div 
               onClick={(e) => applyTheme(e, 'light')}
               className={`glass-card p-6 cursor-pointer border-2 transition-all ${theme === 'light' ? 'border-[#5D4037] !bg-[#EBEAE4]' : 'border-transparent opacity-40 hover:opacity-100'} !bg-[#F5F5F0]`}
             >
                <div className="flex justify-between items-start mb-4">
                   <div className="w-12 h-12 rounded !bg-[#F5F5F0] border border-[#3D2B1F]/20" />
                   {theme === 'light' && <StatusBadge status="ACTIVE" label="Selected" />}
                </div>
                <h4 className="font-bold text-[#2A1D15] uppercase tracking-widest text-xs">Ivory & Walnut Wood</h4>
                <p className="text-[10px] text-[#2A1D15]/40 mt-1">Premium organic aesthetic for deep focus.</p>
             </div>
          </div>
        </div>

        {/* Diagnostic Terminal */}
        <div className="space-y-6">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--muted)] border-b border-[var(--border)] pb-4">Diagnostic Terminal</h3>
          <div className="glass-card p-6 flex items-center justify-between group">
            <div className="space-y-1">
              <h4 className="font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">Live HUD Terminal</h4>
              <p className="text-xs text-[var(--muted)]">Enable floatable mission logs and engine chatbox.</p>
            </div>
            <div 
              onClick={toggleFloating}
              className={`w-12 h-6 rounded-full relative transition-all cursor-pointer ${isFloatingEnabled ? 'bg-[var(--accent)]' : 'bg-[var(--surface)] border border-[var(--border)]'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-[var(--background)] transition-all ${isFloatingEnabled ? 'left-7' : 'left-1'}`} />
            </div>
          </div>
        </div>

        {/* Core Configuration */}
        <div className="space-y-6">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--muted)] border-b border-[var(--border)] pb-4">Engine Core</h3>
          <div className="grid grid-cols-1 gap-4">
            <SettingItem title="Caveman Mode" desc="Ultra-compressed token-saving communication protocol." active />
            <SettingItem title="Fractal Logic" desc="Enable recursive problem-solving heuristics." active />
            <SettingItem title="Auto-Deploy" desc="Automatically commit and push changes to origin." />
            <SettingItem title="Safe Execution" desc="Prompt for approval on destructive shell commands." active />
          </div>
        </div>

        {/* API Management */}
        <div className="space-y-6">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--muted)] border-b border-[var(--border)] pb-4">Identity & Access</h3>
          <div className="glass-card p-0 divide-y divide-[var(--border)]">
            <ApiItem provider="OpenRouter" status="CONNECTED" />
            <ApiItem provider="GitHub" status="CONNECTED" />
            <ApiItem provider="Google Cloud" status="OFFLINE" />
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-12 space-y-6">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-rose-500/40 border-b border-rose-500/10 pb-4">Danger Zone</h3>
          
          <div className="grid grid-cols-1 gap-4">
            {/* Soft Reset */}
            <div className="p-6 rounded-2xl bg-[var(--status-rose-bg)] border border-[var(--status-rose)]/20 flex items-center justify-between group hover:border-[var(--status-rose)]/50 transition-all">
              <div>
                <h4 className="font-bold text-[var(--foreground)] group-hover:text-[var(--status-rose)] transition-colors">Clear Intermediate Cache</h4>
                <p className="text-xs text-[var(--muted)] text-balance">Wipe all local `.tmp` data and temporary exports. Conversation history remains intact.</p>
              </div>
              <button className="px-6 py-2 rounded-xl bg-rose-500/5 border border-rose-500/10 text-rose-500/60 text-[10px] font-bold uppercase tracking-widest hover:bg-rose-500/10 hover:text-rose-500 transition-all">
                Run Cleanup
              </button>
            </div>

            {/* Hard Reset */}
            <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between group">
              <div>
                <h4 className="font-bold text-rose-500">Hard System Reset</h4>
                <p className="text-xs text-rose-500/40 text-balance">Complete purge of all local states, `.tmp` files, and session logs. Irreversible.</p>
              </div>
              <button className="px-6 py-2 rounded-xl bg-rose-500 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-rose-600 transition-all shadow-[0_0_20px_rgba(244,63,94,0.2)]">
                Initiate Purge
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function SettingItem({ title, desc, active = false }: { title: string; desc: string; active?: boolean }) {
  return (
    <div className="glass-card p-6 flex items-center justify-between group">
      <div className="space-y-1">
        <h4 className="font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">{title}</h4>
        <p className="text-xs text-[var(--muted)]">{desc}</p>
      </div>
      <div className={`w-12 h-6 rounded-full relative transition-all cursor-pointer ${active ? 'bg-[var(--primary)]' : 'bg-[var(--surface)] border border-[var(--border)]'}`}>
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-[var(--background)] transition-all ${active ? 'left-7' : 'left-1'}`} />
      </div>
    </div>
  );
}

function ApiItem({ provider, status }: { provider: string; status: 'CONNECTED' | 'OFFLINE' }) {
  return (
    <div className="px-8 py-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[10px] font-mono font-bold text-[var(--muted)]">
          {provider[0]}
        </div>
        <span className="font-bold text-sm text-[var(--foreground)]">{provider}</span>
      </div>
      <div className="flex items-center gap-6">
        <StatusBadge status={status === 'CONNECTED' ? 'SUCCESS' : 'ERROR'} label={status} />
        <button className="text-[10px] font-bold text-[var(--muted)] hover:text-[var(--foreground)] uppercase tracking-widest transition-colors">Configure</button>
      </div>
    </div>
  );
}
