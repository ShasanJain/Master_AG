'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import CommandPalette from './components/CommandPalette';
import { FloatingJack } from './components/FloatingJack';

import Link from 'next/link';
import { Settings, Sun, Moon, LayoutGrid, CircleUser, Layers } from 'lucide-react';

interface LayoutClientWrapperProps {
  children: React.ReactNode;
}

export default function LayoutClientWrapper({ children }: LayoutClientWrapperProps) {
  const [pinnedSkills, setPinnedSkills] = useState<string[]>([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState<string | null>(null);
  const [isLight, setIsLight] = useState(false);

  // Load pinned state and active workspace from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('jack-pinned-skills');
      if (stored) {
        setPinnedSkills(JSON.parse(stored));
      }
      const storedWs = localStorage.getItem('jack-active-workspace');
      if (storedWs) {
        setActiveWorkspace(storedWs);
      }
      if (document.documentElement.classList.contains('light-mode')) {
        setIsLight(true);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const toggleTheme = () => {
    const nextLight = !isLight;
    setIsLight(nextLight);
    if (nextLight) {
      document.documentElement.classList.add('light-mode');
      localStorage.setItem('jack-theme', 'light');
    } else {
      document.documentElement.classList.remove('light-mode');
      localStorage.setItem('jack-theme', 'dark');
    }
  };

  const selectWorkspace = (ws: string | null) => {
    setActiveWorkspace(ws);
    try {
      if (ws) {
        localStorage.setItem('jack-active-workspace', ws);
      } else {
        localStorage.removeItem('jack-active-workspace');
      }
      window.dispatchEvent(new Event('storage'));
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  const togglePin = (key: string) => {
    setPinnedSkills((prev) => {
      const next = prev.includes(key) 
        ? prev.filter((k) => k !== key) 
        : [...prev, key];
      try {
        localStorage.setItem('jack-pinned-skills', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  return (
    <>
      <Sidebar pinnedSkills={pinnedSkills} togglePin={togglePin} />
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen relative min-w-0">
        {/* Global Header */}
        <header className="h-16 border-b border-[var(--border)] flex items-center justify-between px-8 sticky top-0 bg-[var(--background)] z-40">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.3em]">Session // 0xAF32</span>
            <div className="h-4 w-px bg-[var(--border)]" />
            <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest font-mono">Build 5.0.0-Stable</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative group cursor-pointer" onClick={() => {
              // Trigger CommandPalette by dispatching key event helper
              const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
              window.dispatchEvent(event);
            }}>
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-full px-6 py-2 text-[10px] font-bold tracking-widest outline-none focus:border-[var(--primary)] transition-all w-64 placeholder:text-[var(--muted)] text-[var(--foreground)] flex items-center justify-between">
                <span>QUICK DISPATCH</span>
                <kbd className="px-1.5 py-0.5 bg-[var(--background)] border border-[var(--border)] rounded text-[8px] font-mono text-[var(--muted)]">CTRL+K</kbd>
              </div>
            </div>
            <div className="relative">
              <div 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-10 h-10 rounded-full border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center text-[var(--foreground)] overflow-hidden relative group cursor-pointer hover:border-[var(--primary)] transition-all"
              >
                <div className="absolute inset-0 bg-[var(--primary-glow)] opacity-0 group-hover:opacity-100 transition-all" />
                <span className="text-xs font-bold font-mono">SJ</span>
              </div>

              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-64 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-[0_4px_20px_rgba(16,185,129,0.15)] z-50 p-4 space-y-4">
                  <div className="border-b border-[var(--border)] pb-2">
                    <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider block mb-1">User Session</span>
                    <span className="text-xs font-bold text-[var(--foreground)]">Swayam Jain</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider block mb-1">Workspace Filter</span>
                    {[
                      { id: null, label: 'All Modules' },
                      { id: 'command', label: 'Command Cockpit' },
                      { id: 'studio', label: 'Studio Cockpit' },
                      { id: 'monitor', label: 'Monitor Cockpit' },
                      { id: 'configure', label: 'Configure Heuristics' },
                    ].map(w => (
                      <button
                        key={w.id || 'all'}
                        onClick={() => selectWorkspace(w.id)}
                        className={`w-full text-left px-2 py-1.5 rounded text-xs font-mono transition-colors flex items-center gap-2 ${
                          activeWorkspace === w.id
                            ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-bold'
                            : 'hover:bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)]'
                        }`}
                      >
                        <Layers size={12} /> {w.label}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-[var(--border)] pt-2 flex flex-col gap-2">
                    <button
                      onClick={toggleTheme}
                      className="w-full text-left px-2 py-1.5 rounded text-xs font-mono hover:bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        {isLight ? <Sun size={12} /> : <Moon size={12} />} Switch Theme
                      </span>
                      <span className="text-[10px] uppercase font-bold text-[var(--primary)]">{isLight ? 'Light' : 'Dark'}</span>
                    </button>

                    <Link href="/settings" onClick={() => setShowProfileMenu(false)}>
                      <div className="w-full text-left px-2 py-1.5 rounded text-xs font-mono hover:bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors flex items-center gap-2 cursor-pointer">
                        <Settings size={12} /> System Settings
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
      <FloatingJack />
      <CommandPalette />
    </>
  );
}
