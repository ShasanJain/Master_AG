'use client';

import { useState, useEffect } from "react";

import { StatusBadge } from "../components/StatusBadge";
import { getConfig, updateConfig } from "../actions/config";

export default function SettingsPage() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isFloatingEnabled, setIsFloatingEnabled] = useState(false);

  const [isLocalInference, setIsLocalInference] = useState(false);
  const [advisorModel, setAdvisorModel] = useState('llama3.2');
  const [synthesisModel, setSynthesisModel] = useState('gemma4');

  const applyTheme = (e: React.MouseEvent | Event, newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    document.documentElement.classList.remove('light-mode', 'light-mode-clinical', 'dark');
    if (newTheme === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.add('dark');
    }
    localStorage.setItem('jack-theme', newTheme);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('jack-theme') as 'dark' | 'light';
    const floating = localStorage.getItem('jack-floating-enabled') === 'true';
    if (savedTheme) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme(savedTheme);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      applyTheme(new Event('init') as any, savedTheme);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsFloatingEnabled(floating);

    // Fetch engine config
    getConfig(['LOCAL_INFERENCE', 'OLLAMA_MODEL_ADVISOR', 'OLLAMA_MODEL_SYNTHESIS']).then(config => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLocalInference(config['LOCAL_INFERENCE'] === 'true');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (config['OLLAMA_MODEL_ADVISOR']) setAdvisorModel(config['OLLAMA_MODEL_ADVISOR']);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (config['OLLAMA_MODEL_SYNTHESIS']) setSynthesisModel(config['OLLAMA_MODEL_SYNTHESIS']);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleFloating = () => {
    const newState = !isFloatingEnabled;
    setIsFloatingEnabled(newState);
    localStorage.setItem('jack-floating-enabled', newState.toString());
    window.location.reload(); 
  };

  const toggleLocalInference = async () => {
    const newState = !isLocalInference;
    setIsLocalInference(newState);
    await updateConfig('LOCAL_INFERENCE', newState.toString());
  };

  return (
    <>
      <div className="atmospheric-orb orb-emerald"></div>
      <div className="atmospheric-orb orb-sapphire"></div>
      <div className="max-w-4xl mx-auto space-y-12 pb-20 relative z-10 p-6">
        <section>
          <h2 className="text-5xl font-bold tracking-tighter mb-3 text-[var(--foreground)]">Settings</h2>
          <p className="text-[var(--muted)] text-sm">Industrial Engine Configuration // v5.0.0-STABLE</p>
        </section>

      <section className="space-y-12">
        {/* Visual Theme */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-[0.4em] text-[var(--muted)] border-b border-[var(--border)] pb-4">Visual Atmosphere</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div 
               onClick={(e) => applyTheme(e, 'dark')}
               className={`glass-card p-6 cursor-pointer border transition-all ${theme === 'dark' ? 'border-[var(--primary)] !bg-[var(--surface)]' : 'border-transparent opacity-40 hover:opacity-100'} hover:border-[var(--primary)]`}
             >
                <div className="flex justify-between items-start mb-4">
                   <div className="w-12 h-12 rounded !bg-[var(--background)] border border-[var(--border)]" />
                   {theme === 'dark' && <StatusBadge status="ACTIVE" label="Selected" />}
                </div>
                <h4 className="font-bold text-[var(--foreground)] uppercase tracking-widest text-sm">Industrial Dark</h4>
                <p className="text-xs text-[var(--faint)] mt-1">Sovereign black with blue accents.</p>
             </div>

             <div 
               onClick={(e) => applyTheme(e, 'light')}
               className={`glass-card p-6 cursor-pointer border transition-all ${theme === 'light' ? 'border-[#5D4037] !bg-[#EBEAE4]' : 'border-transparent opacity-40 hover:opacity-100'} !bg-[#F5F5F0]`}
             >
                <div className="flex justify-between items-start mb-4">
                   <div className="w-12 h-12 rounded !bg-[#F5F5F0] border border-[#3D2B1F]/20" />
                   {theme === 'light' && <StatusBadge status="ACTIVE" label="Selected" />}
                </div>
                <h4 className="font-bold text-[#2A1D15] uppercase tracking-widest text-xs">Ivory & Walnut Wood</h4>
                <p className="text-xs text-[var(--faint)] mt-1">Soft warm palette for reading.</p>
             </div>
          </div>
        </div>

        {/* Diagnostic Terminal */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-[0.4em] text-[var(--muted)] border-b border-[var(--border)] pb-4">Diagnostic Terminal</h3>
          <div className="glass-card p-6 flex items-center justify-between group hover:border-[var(--primary)] transition-all">
            <div className="space-y-1">
              <h4 className="font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">Live HUD Terminal</h4>
              <p className="text-sm text-[var(--muted)]">Enable floatable mission logs and engine chatbox.</p>
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
          <h3 className="text-xs font-bold uppercase tracking-[0.4em] text-[var(--muted)] border-b border-[var(--border)] pb-4">Engine Core</h3>
          <div className="grid grid-cols-1 gap-4">
            <SettingItem title="Caveman Mode" desc="Ultra-compressed token-saving communication protocol." active />
            <SettingItem title="Fractal Logic" desc="Enable recursive problem-solving heuristics." active />
            <SettingItem title="Auto-Deploy" desc="Automatically commit and push changes to origin." />
            <SettingItem title="Safe Execution" desc="Prompt for approval on destructive shell commands." active />
          </div>
        </div>

        {/* Sovereignty Control */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-[0.4em] text-[var(--muted)] border-b border-[var(--border)] pb-4">Sovereignty Control</h3>
          <div className="grid grid-cols-1 gap-4">
             <SettingItem title="File System Agency" desc="Allows the agent to write & edit workspace files autonomously." active />
             <SettingItem title="Strict Validation Gate" desc="Blocks output deployment on lint/build failure." active />
             
             {/* Evolutionary Profile */}
             <div className="glass-card p-6 flex flex-col group hover:border-[var(--primary)] transition-all">
               <div className="space-y-1 mb-5">
                 <h4 className="font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">Evolutionary Profile</h4>
                 <p className="text-xs text-[var(--muted)]">Manage autonomous decision levels and safety bounds.</p>
               </div>
               <div className="grid grid-cols-3 gap-3">
                 {['safe', 'autonomous', 'aggressive'].map((mode) => (
                   <button
                     key={mode}
                     className={`py-3 px-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                       mode === 'autonomous' 
                         ? 'bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)]' 
                         : 'bg-[var(--surface)] border-[var(--border)] text-[var(--muted)] hover:bg-[var(--border)] hover:text-[var(--foreground)]'
                     }`}
                   >
                     {mode}
                   </button>
                 ))}
               </div>
             </div>

             {/* Neural Sync Rate */}
             <div className="glass-card p-6 flex flex-col group hover:border-[var(--primary)] transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">Neural Sync Rate</h4>
                    <p className="text-xs text-[var(--muted)]">Determine the volatility of heuristic updates.</p>
                  </div>
                  <span className="font-mono text-[var(--primary)] font-bold text-xl">85%</span>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="100" 
                  defaultValue="85"
                  className="w-full h-1 mt-2 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                />
             </div>
          </div>
        </div>

        {/* API Management */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-[0.4em] text-[var(--muted)] border-b border-[var(--border)] pb-4">Identity & Access</h3>
          <div className="glass-card p-0 divide-y divide-[var(--border)]">
            <ApiItem provider="Ollama" status="CONNECTED" />
            <ApiItem provider="OpenRouter" status="CONNECTED" />
            <ApiItem provider="GitHub" status="CONNECTED" />
          </div>
        </div>

        {/* Neural Engine */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-[0.4em] text-[var(--muted)] border-b border-[var(--border)] pb-4">Neural Engine</h3>
          <div className="grid grid-cols-1 gap-4">
             <div className="glass-card p-6 flex items-center justify-between group">
               <div className="space-y-1">
                 <h4 className="font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">Local Inference Mode</h4>
                 <p className="text-xs text-[var(--muted)]">Route all cognitive logic to local Ollama models (Zero Token Cost).</p>
               </div>
               <div 
                 onClick={toggleLocalInference}
                 className={`w-12 h-6 rounded-full relative transition-all cursor-pointer ${isLocalInference ? 'bg-[var(--primary)]' : 'bg-[var(--surface)] border border-[var(--border)]'}`}
               >
                 <div className={`absolute top-1 w-4 h-4 rounded-full bg-[var(--background)] transition-all ${isLocalInference ? 'left-7' : 'left-1'}`} />
               </div>
             </div>

             <div className="glass-card p-6 flex flex-col group gap-4">
               <div>
                 <h4 className="font-bold text-[var(--foreground)]">Active Neural Models</h4>
                 <p className="text-xs text-[var(--muted)]">Assign specific Ollama models to their optimal roles.</p>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2 p-4 border border-[var(--border)] rounded-xl bg-[var(--surface)]/30">
                   <label className="text-[10px] font-black tracking-widest text-[var(--faint)] uppercase">Advisor Model (Logic/Text)</label>
                   <select 
                     value={advisorModel}
                     onChange={(e) => {
                       setAdvisorModel(e.target.value);
                       updateConfig('OLLAMA_MODEL_ADVISOR', e.target.value);
                     }}
                     className="w-full bg-[var(--background)] border border-[var(--border)] rounded p-2 text-xs font-mono text-[var(--primary)] outline-none"
                   >
                     <option value="llama3.2">llama3.2 (Fast/Logical)</option>
                     <option value="gemma4">gemma4 (Detailed/Coding)</option>
                     <option value="dolphin-llama3">dolphin-llama3 (Uncensored)</option>
                     <option value="qwen3.6">qwen3.6 (Custom Model)</option>
                   </select>
                 </div>
                 
                 <div className="space-y-2 p-4 border border-[var(--border)] rounded-xl bg-[var(--surface)]/30">
                   <label className="text-[10px] font-black tracking-widest text-[var(--faint)] uppercase">Synthesis Model (JSON/Structs)</label>
                   <select 
                     value={synthesisModel}
                     onChange={(e) => {
                       setSynthesisModel(e.target.value);
                       updateConfig('OLLAMA_MODEL_SYNTHESIS', e.target.value);
                     }}
                     className="w-full bg-[var(--background)] border border-[var(--border)] rounded p-2 text-xs font-mono text-[var(--primary)] outline-none"
                   >
                     <option value="llama3.2">llama3.2 (Fast)</option>
                     <option value="gemma4">gemma4 (Reliable JSON)</option>
                     <option value="dolphin-llama3">dolphin-llama3 (Uncensored)</option>
                     <option value="qwen3.6">qwen3.6 (Custom Model)</option>
                   </select>
                 </div>
               </div>
             </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-12 space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-[0.4em] text-rose-500/40 border-b border-rose-500/10 pb-4">Danger Zone</h3>
          
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
              <button className="px-6 py-2 rounded-xl bg-rose-500 text-[var(--foreground)] text-[10px] font-bold uppercase tracking-widest hover:bg-rose-600 transition-all shadow-[0_0_20px_rgba(244,63,94,0.2)]">
                Initiate Purge
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}

function SettingItem({ title, desc, active = false }: { title: string; desc: string; active?: boolean }) {
  return (
    <div className="glass-card p-6 flex items-center justify-between group hover:border-[var(--primary)] transition-all">
      <div className="space-y-1">
        <h4 className="font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">{title}</h4>
        <p className="text-sm text-[var(--muted)]">{desc}</p>
      </div>
      <div className={`w-12 h-6 rounded-full relative transition-all cursor-pointer ${active ? 'bg-[var(--primary)]' : 'bg-[var(--surface)] border border-[var(--border)]'}`}>
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-[var(--background)] transition-all ${active ? 'left-7' : 'left-1'}`} />
      </div>
    </div>
  );
}

function ApiItem({ provider, status }: { provider: string; status: 'CONNECTED' | 'OFFLINE' }) {
  return (
    <div className="px-8 py-6 flex items-center justify-between hover:bg-[var(--surface)] transition-all group">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-xs font-mono font-bold text-[var(--muted)]">
          {provider[0]}
        </div>
        <span className="font-bold text-sm text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">{provider}</span>
      </div>
      <div className="flex items-center gap-6">
        <StatusBadge status={status === 'CONNECTED' ? 'SUCCESS' : 'ERROR'} label={status} />
        <button className="text-xs font-bold text-[var(--muted)] hover:text-[var(--foreground)] uppercase tracking-widest transition-colors shiny-button p-2 rounded">Configure</button>
      </div>
    </div>
  );
}
