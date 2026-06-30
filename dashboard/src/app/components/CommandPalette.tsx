'use client';

import React, { useState, useEffect } from 'react';
import { Search, Command, CornerDownLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const commands = [
    { name: 'Dashboard', category: 'General', href: '/' },
    { name: 'Journalist Command Center', category: 'Command', href: '/journalist' },
    { name: 'Ideas Lab (Incubator)', category: 'Command', href: '/incubator' },
    { name: 'Browser Bot Scraper', category: 'Command', href: '/browser-bot' },
    { name: 'Academic Search Orchestrator', category: 'Command', href: '/academic' },
    { name: 'SEO Analyzer Portal', category: 'Command', href: '/seo-analyzer' },
    { name: 'Task Scheduler & Loop', category: 'Command', href: '/scheduler' },
    { name: 'Skill Armory', category: 'Command', href: '/skills' },
    { name: 'UI Master Visual Sandbox', category: 'Studio', href: '/ui-master' },
    { name: 'Audio Studio voice lab', category: 'Studio', href: '/audio-studio' },
    { name: 'Reel Studio video editor', category: 'Studio', href: '/reel-studio' },
    { name: 'Canvas (Open Design)', category: 'Studio', href: '/open-design' },
    { name: 'App Sandbox playground', category: 'Studio', href: '/incubator/sandbox' },
    { name: 'Telemetry dashboard', category: 'Monitor', href: '/telemetry' },
    { name: 'Mission Logs output viewer', category: 'Monitor', href: '/logs' },
    { name: 'Diagnostics test tool', category: 'Monitor', href: '/diagnostics' },
    { name: 'Agent Brain (Neural map)', category: 'Configure', href: '/neural' },
    { name: 'Memory store', category: 'Configure', href: '/memory' },
    { name: 'System Settings', category: 'Configure', href: '/settings' },
    { name: 'Neural Link Chat', category: 'General', href: '/chat' }
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!open) return null;

  const filtered = commands.filter((cmd) =>
    cmd.name.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-start justify-center pt-[15vh]">
      <div 
        className="w-full max-w-xl bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 border-b border-[var(--border)]">
          <Search className="w-4 h-4 text-[var(--muted)]" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command or destination (e.g. SEO, Logs, UI)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent py-4 text-sm text-white outline-none placeholder:text-[var(--muted)]"
          />
          <kbd className="flex items-center gap-0.5 px-2 py-0.5 bg-[var(--background)] border border-[var(--border)] rounded text-[9px] font-mono text-[var(--muted)]">
            <span className="text-[11px] font-sans">ESC</span>
          </kbd>
        </div>

        <div className="max-h-[320px] overflow-y-auto p-2 space-y-1">
          {filtered.length > 0 ? (
            filtered.map((cmd) => (
              <button
                key={cmd.name}
                onClick={() => {
                  router.push(cmd.href);
                  setOpen(false);
                  setQuery('');
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-xs font-mono text-[var(--muted)] hover:text-white hover:bg-[var(--background)] border border-transparent hover:border-[var(--border)] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Command className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                  <span>{cmd.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] uppercase tracking-widest px-1.5 py-0.5 border border-[var(--border)] bg-[var(--background)] rounded text-[var(--muted)]">
                    {cmd.category}
                  </span>
                  <CornerDownLeft className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-[var(--muted)] font-mono">
              No matching commands or pages found.
            </div>
          )}
        </div>
      </div>
      <div className="absolute inset-0 -z-10" onClick={() => setOpen(false)} />
    </div>
  );
}
