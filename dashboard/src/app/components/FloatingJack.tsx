'use client';

import { useState, useEffect, useRef } from 'react';
import { StatusBadge } from './StatusBadge';

export function FloatingJack() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'LOGS' | 'CHAT'>('LOGS');
  const [logs, setLogs] = useState<any[]>([]);
  const [messages, setMessages] = useState<{ role: 'JACK' | 'USER'; text: string }[]>([
    { role: 'JACK', text: 'Diagnostics synchronized. All cognitive modules at peak efficiency. Ready for orchestration.' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const enabled = localStorage.getItem('jack-floating-enabled') === 'true';
    setIsOpen(enabled);

    // Set initial position to bottom right if not already moved
    if (!position) {
      setPosition({ x: window.innerWidth - 340, y: window.innerHeight - 420 });
    }

    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/logs');
        const data = await res.json();
        setLogs(data.slice(0, 10)); // Just the latest 10
      } catch (e) {}
    };

    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    setMessages([...messages, { role: 'USER', text: inputValue }]);
    setInputValue('');
    
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'JACK', text: 'PROTOCOL_ACK: Transaction recorded in session buffer. Optimizing sub-processes...' }]);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    offsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - offsetRef.current.x,
        y: e.clientY - offsetRef.current.y
      });
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (!isOpen || !position) return null;

  return (
    <div 
      className="fixed z-[9999] shadow-2xl transition-shadow duration-300"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
    >
      <div className="w-80 glass-card bg-[var(--sidebar-bg)] backdrop-blur-3xl border-[var(--foreground)]/10 overflow-hidden flex flex-col h-[400px]">
        {/* Draggable Header */}
        <div 
          onMouseDown={handleMouseDown}
          className="p-4 bg-white/[0.03] border-b border-white/5 flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Live Diagnostics</span>
          </div>
          <div className="flex gap-2">
             <button onClick={() => setActiveTab('LOGS')} className={`text-[9px] font-bold uppercase tracking-widest ${activeTab === 'LOGS' ? 'text-blue-400' : 'text-white/20'}`}>Logs</button>
             <button onClick={() => setActiveTab('CHAT')} className={`text-[9px] font-bold uppercase tracking-widest ${activeTab === 'CHAT' ? 'text-blue-400' : 'text-white/20'}`}>Chat</button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {activeTab === 'LOGS' ? (
            <div className="space-y-3">
              {logs.map((log, i) => (
                <div key={log.id} className="text-[10px] font-mono border-l border-blue-500/30 pl-3 py-1 animate-in fade-in slide-in-from-left-1" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="text-white/20 flex justify-between">
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className="text-blue-500/50">[{log.skill}]</span>
                  </div>
                  <p className="text-white/60 mt-1 leading-relaxed">{log.mission}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col">
               <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2">
                  {messages.map((msg, i) => (
                    <div key={i} className={`text-[10px] font-mono p-3 rounded-lg leading-relaxed border ${msg.role === 'JACK' ? 'bg-white/5 text-white/60 border-white/5' : 'bg-blue-600/20 text-blue-300 border-blue-500/30 self-end'}`}>
                      <span className={`font-bold mr-2 ${msg.role === 'JACK' ? 'text-blue-400' : 'text-emerald-400'}`}>{msg.role === 'JACK' ? 'JACK:' : 'USER:'}</span>
                      {msg.text}
                    </div>
                  ))}
               </div>
               <form 
                 onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                 className="mt-4 pt-4 border-t border-white/5 flex gap-2"
               >
                  <input 
                    type="text" 
                    placeholder="TRANSMIT TO ENGINE..." 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-[10px] font-bold tracking-widest text-white/80 placeholder:text-white/20 outline-none focus:border-blue-500/50 transition-all"
                  />
                  <button 
                    type="submit"
                    className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-600/20"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/></svg>
                  </button>
               </form>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-3 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
           <span className="text-[8px] font-bold text-white/10 uppercase tracking-widest italic">Jack-05 Diagnostics v1.2</span>
           <button 
             onClick={() => {
                setIsOpen(false);
                localStorage.setItem('jack-floating-enabled', 'false');
             }}
             className="text-[8px] font-bold text-rose-500/40 hover:text-rose-500 uppercase tracking-widest transition-colors"
           >
             Terminal Kill
           </button>
        </div>
      </div>
    </div>
  );
}
