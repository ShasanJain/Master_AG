'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import CommandPalette from './components/CommandPalette';
import { FloatingJack } from './components/FloatingJack';

interface LayoutClientWrapperProps {
  children: React.ReactNode;
}

export default function LayoutClientWrapper({ children }: LayoutClientWrapperProps) {
  const [pinnedSkills, setPinnedSkills] = useState<string[]>([]);

  // Load pinned state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('jack-pinned-skills');
      if (stored) {
        setPinnedSkills(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

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
            <div className="w-10 h-10 rounded-full border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center text-[var(--foreground)] overflow-hidden relative group cursor-pointer hover:border-[var(--primary)] transition-all">
              <div className="absolute inset-0 bg-[var(--primary-glow)] opacity-0 group-hover:opacity-100 transition-all" />
              <span className="text-xs font-bold font-mono">SJ</span>
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
