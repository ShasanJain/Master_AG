'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Settings, Play, RefreshCw, Eye, Code, Terminal, FileText, CheckCircle2 } from 'lucide-react';

export default function OpenWikiPage() {
  const [config, setConfig] = useState({
    OPENWIKI_PROVIDER: 'openai',
    OPENWIKI_MODEL_ID: '',
    OPENAI_API_KEY: '',
    ANTHROPIC_API_KEY: '',
    OPENROUTER_API_KEY: '',
    FIREWORKS_API_KEY: '',
    OPENAI_COMPATIBLE_API_KEY: '',
    ANTHROPIC_BASE_URL: '',
    OPENAI_COMPATIBLE_BASE_URL: '',
    LANGCHAIN_API_KEY: '',
  });

  const [prompt, setPrompt] = useState('Generate documentation for this repository');
  const [status, setStatus] = useState('idle');
  const [logs, setLogs] = useState('');
  const [files, setFiles] = useState<{ name: string; content: string }[]>([]);
  const [selectedFile, setSelectedFile] = useState<{ name: string; content: string } | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load config and status on mount
  useEffect(() => {
    fetchConfig();
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/openwiki/config');
      const data = await res.json();
      if (data.success && data.config) {
        setConfig(data.config);
      }
    } catch (e) {
      console.error('Error fetching OpenWiki config:', e);
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/openwiki/status');
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
        setStatus(data.status);
        setIsRunning(data.status === 'running');
        if (data.files && data.files.length > 0) {
          setFiles(data.files);
          // Auto select first file if none selected
          if (!selectedFile && data.files.length > 0) {
            setSelectedFile(data.files[0]);
          }
        }
      }
    } catch (e) {
      console.error('Error fetching OpenWiki status:', e);
    }
  };

  const saveConfig = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/openwiki/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) {
        alert('Configuration saved successfully!');
      } else {
        alert('Failed to save configuration: ' + data.error);
      }
    } catch (e: any) {
      alert('Error saving configuration: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const startOpenWiki = async (update = false) => {
    setIsRunning(true);
    setLogs('[OpenWiki Console] Initiating agent execution...\n');
    try {
      // First save the current form settings to backend config
      await fetch('/api/openwiki/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const activeApiKey = getApiKeyForProvider();

      const res = await fetch('/api/openwiki/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: config.OPENWIKI_PROVIDER,
          apiKey: activeApiKey,
          modelId: config.OPENWIKI_MODEL_ID,
          baseUrl: config.OPENWIKI_PROVIDER === 'anthropic' ? config.ANTHROPIC_BASE_URL : config.OPENAI_COMPATIBLE_BASE_URL,
          langsmithKey: config.LANGCHAIN_API_KEY,
          update,
          prompt,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setLogs(prev => prev + `[OpenWiki Console] Launch failed: ${data.error}\n`);
        setIsRunning(false);
      }
    } catch (e: any) {
      setLogs(prev => prev + `[OpenWiki Console] Error occurred: ${e.message}\n`);
      setIsRunning(false);
    }
  };

  const getApiKeyForProvider = () => {
    switch (config.OPENWIKI_PROVIDER) {
      case 'openai': return config.OPENAI_API_KEY;
      case 'anthropic': return config.ANTHROPIC_API_KEY;
      case 'openrouter': return config.OPENROUTER_API_KEY;
      case 'fireworks': return config.FIREWORKS_API_KEY;
      case 'openai-compatible': return config.OPENAI_COMPATIBLE_API_KEY;
      default: return '';
    }
  };

  const updateConfigValue = (key: string, val: string) => {
    setConfig(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex justify-between items-center border-b border-[var(--border)] pb-4">
        <div>
          <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-widest flex items-center gap-2 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse shadow-[0_0_8px_var(--primary-glow)]"></span>
            Configure // OpenWiki Document Engine
          </span>
          <h1 className="text-xl font-black uppercase tracking-tight text-[var(--foreground)] mt-1 font-mono">
            OpenWiki Document Workspace
          </h1>
        </div>
      </header>

      {/* 12-Column Grid Layout */}
      <main className="grid grid-cols-12 gap-8">
        
        {/* Settings Form Column */}
        <section className="col-span-4 space-y-6">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 space-y-5 hover:border-[var(--primary)] transition-all">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] border-b border-[var(--border)] pb-3 flex items-center gap-2">
              <Settings className="w-4 h-4 text-[var(--primary)]" />
              Agent Configuration
            </h2>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[var(--muted)] uppercase tracking-wider font-mono">LLM Provider</label>
              <select
                value={config.OPENWIKI_PROVIDER}
                onChange={e => updateConfigValue('OPENWIKI_PROVIDER', e.target.value)}
                className="bg-[var(--background)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] cursor-pointer font-mono"
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="openrouter">OpenRouter</option>
                <option value="fireworks">Fireworks</option>
                <option value="openai-compatible">OpenAI Compatible Gateway</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[var(--muted)] uppercase tracking-wider font-mono">API Key</label>
              <input
                type="password"
                value={getApiKeyForProvider()}
                onChange={e => {
                  const p = config.OPENWIKI_PROVIDER;
                  if (p === 'openai') updateConfigValue('OPENAI_API_KEY', e.target.value);
                  else if (p === 'anthropic') updateConfigValue('ANTHROPIC_API_KEY', e.target.value);
                  else if (p === 'openrouter') updateConfigValue('OPENROUTER_API_KEY', e.target.value);
                  else if (p === 'fireworks') updateConfigValue('FIREWORKS_API_KEY', e.target.value);
                  else if (p === 'openai-compatible') updateConfigValue('OPENAI_COMPATIBLE_API_KEY', e.target.value);
                }}
                placeholder="••••••••••••••••••••••••"
                className="bg-[var(--background)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[var(--muted)] uppercase tracking-wider font-mono">Custom Model ID (Optional)</label>
              <input
                type="text"
                value={config.OPENWIKI_MODEL_ID}
                onChange={e => updateConfigValue('OPENWIKI_MODEL_ID', e.target.value)}
                placeholder="e.g. claude-3-5-sonnet-latest"
                className="bg-[var(--background)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] font-mono"
              />
            </div>

            {(config.OPENWIKI_PROVIDER === 'anthropic' || config.OPENWIKI_PROVIDER === 'openai-compatible') && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[var(--muted)] uppercase tracking-wider font-mono">Custom Base URL (Optional)</label>
                <input
                  type="text"
                  value={config.OPENWIKI_PROVIDER === 'anthropic' ? config.ANTHROPIC_BASE_URL : config.OPENAI_COMPATIBLE_BASE_URL}
                  onChange={e => {
                    if (config.OPENWIKI_PROVIDER === 'anthropic') {
                      updateConfigValue('ANTHROPIC_BASE_URL', e.target.value);
                    } else {
                      updateConfigValue('OPENAI_COMPATIBLE_BASE_URL', e.target.value);
                    }
                  }}
                  placeholder="https://..."
                  className="bg-[var(--background)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] font-mono"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[var(--muted)] uppercase tracking-wider font-mono">LangSmith API Key (Optional)</label>
              <input
                type="password"
                value={config.LANGCHAIN_API_KEY}
                onChange={e => updateConfigValue('LANGCHAIN_API_KEY', e.target.value)}
                placeholder="LangSmith Tracing Key"
                className="bg-[var(--background)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] font-mono"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={saveConfig}
                disabled={isSaving}
                className="w-full bg-[var(--surface)] hover:bg-[var(--border)] border border-[var(--border)] text-xs text-[var(--foreground)] font-bold font-mono py-2.5 rounded-lg cursor-pointer transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </div>

          {/* Action Trigger Card */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] border-b border-[var(--border)] pb-3 flex items-center gap-2">
              <Play className="w-4 h-4 text-[var(--primary)]" />
              Run Operations
            </h2>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[var(--muted)] uppercase tracking-wider font-mono">Custom Execution Prompt</label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                rows={2}
                className="bg-[var(--background)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => startOpenWiki(false)}
                disabled={isRunning}
                className={`py-3 rounded-lg text-xs font-bold font-mono tracking-widest uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isRunning
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-[var(--primary)] text-[var(--foreground)] hover:brightness-110 shadow-[0_0_15px_var(--primary-glow)]'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                Initialize
              </button>
              
              <button
                onClick={() => startOpenWiki(true)}
                disabled={isRunning}
                className={`py-3 rounded-lg text-xs font-bold font-mono tracking-widest uppercase flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  isRunning
                    ? 'border-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'border-[var(--border)] hover:bg-[var(--border)] text-[var(--foreground)]'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
                Update
              </button>
            </div>
          </div>
        </section>

        {/* Live Terminal & Logs Column */}
        <section className="col-span-8 space-y-6">
          
          {/* Output Viewer / Live Terminal */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 space-y-4 flex flex-col h-[380px]">
            <div className="flex justify-between items-center border-b border-[var(--border)] pb-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[var(--primary)]" />
                Live Console Output
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold font-mono text-[var(--muted)] uppercase">Status:</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-black font-mono uppercase ${
                  status === 'running' ? 'bg-amber-500/25 text-amber-500 border border-amber-500/30' :
                  status === 'completed' ? 'bg-emerald-500/25 text-emerald-500 border border-emerald-500/30' :
                  status === 'error' ? 'bg-rose-500/25 text-rose-500 border border-rose-500/30' :
                  'bg-zinc-800 text-zinc-400 border border-zinc-700'
                }`}>
                  {status}
                </span>
              </div>
            </div>

            <pre className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-lg p-4 font-mono text-[11px] leading-relaxed text-zinc-300 overflow-y-auto whitespace-pre-wrap">
              {logs || '[OpenWiki Console] Waiting for command trigger...'}
            </pre>
          </div>

          {/* Generated Documents Viewer */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] border-b border-[var(--border)] pb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[var(--primary)]" />
              Generated Documentation Files
            </h2>

            {files.length === 0 ? (
              <div className="text-center py-6 text-xs text-[var(--muted)] font-mono">
                No OpenWiki documentation files generated yet. Launch "Initialize" to build documentation.
              </div>
            ) : (
              <div className="grid grid-cols-12 gap-6 h-[400px]">
                {/* File list sidebar */}
                <div className="col-span-3 border-r border-[var(--border)] pr-4 space-y-1.5 overflow-y-auto">
                  {files.map(file => (
                    <button
                      key={file.name}
                      onClick={() => setSelectedFile(file)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs font-bold font-mono transition-all border cursor-pointer ${
                        selectedFile?.name === file.name
                          ? 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/30'
                          : 'border-transparent text-[var(--muted)] hover:bg-[var(--surface)]/50 hover:text-[var(--foreground)]'
                      }`}
                    >
                      <FileText className="w-4 h-4 shrink-0" />
                      <span className="truncate">{file.name}</span>
                    </button>
                  ))}
                </div>

                {/* File content pre-viewer */}
                <div className="col-span-9 bg-[var(--background)] border border-[var(--border)] rounded-lg p-4 overflow-y-auto font-mono text-[11px] text-zinc-300 leading-relaxed">
                  {selectedFile ? (
                    <div>
                      <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 mb-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {selectedFile.name}
                        </span>
                      </div>
                      <pre className="whitespace-pre-wrap">{selectedFile.content}</pre>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-[var(--muted)]">
                      Select a file to preview its content
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}
