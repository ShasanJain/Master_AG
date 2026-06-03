'use client';

import { useState, useRef, useEffect } from "react";
import { sendLocalMessage, getChatHistory } from "../actions/chat";

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const data = await getChatHistory();
    setHistory(data);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = { role: 'user' as const, content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    const response = await sendLocalMessage(userMsg.content, messages);
    setMessages(prev => [...prev, response as any]);
    setIsTyping(false);
    loadHistory(); // Refresh history sidebar
  };

  return (
    <>
      <div className="atmospheric-orb orb-emerald"></div>
      <div className="atmospheric-orb orb-sapphire"></div>
      <div className="flex gap-8 h-[calc(100vh-160px)] relative z-10">
      {/* Sidebar: Signal Archive */}
      <aside className="w-64 glass-card p-6 flex flex-col gap-6 border-[var(--border)] overflow-hidden hidden md:flex">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-[var(--muted)] uppercase tracking-widest">Signal Archive</h3>
          <p className="text-xs text-[var(--faint)]">EPISODIC TRACES</p>
        </div>
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {history.length === 0 && (
            <p className="text-xs text-[var(--faint)] italic">No previous signals found.</p>
          )}
          {history.map((item) => (
            <div key={item.id} className="p-3 rounded-lg bg-[var(--background)]/20 border border-[var(--border)] hover:border-[var(--primary)] transition-all cursor-pointer group">
              <p className="text-xs text-[var(--primary)] font-mono mb-1">{new Date(item.timestamp).toLocaleTimeString()}</p>
              <p className="text-xs text-[var(--muted)] line-clamp-2 group-hover:text-[var(--foreground)] transition-colors">
                {item.content.split('Jack:')[0].replace('User:', '')}
              </p>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-[var(--border)] pb-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--background)] border border-[var(--primary)] flex items-center justify-center text-xl shadow-[0_0_20px_var(--primary-glow)]">
              📡
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tighter text-[var(--foreground)]">Neural Link</h2>
              <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse shadow-[0_0_8px_var(--primary-glow)]"></span>
                Secure Offline Channel // Full Agency Mode
              </p>
            </div>
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">Inference Engine</p>
            <p className="text-xs font-mono text-[var(--primary)]">Ollama / Llama-3.2</p>
          </div>
        </header>

        {/* Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar"
        >
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
              <div className="w-20 h-20 rounded-full border border-dashed border-[var(--border)] flex items-center justify-center text-3xl grayscale">
                🤖
              </div>
              <div className="max-w-xs space-y-2">
                <p className="text-sm font-bold text-[var(--foreground)] uppercase tracking-widest">Neural Link Synchronized</p>
                <p className="text-xs text-[var(--muted)]">Jack has now been granted File System Agency and Episodic Recall.</p>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-[var(--primary)] text-[var(--background)] rounded-tr-none shadow-lg' 
                  : 'glass-card rounded-tl-none border-l-4 border-l-[var(--primary)] shadow-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="glass-card p-4 rounded-2xl rounded-tl-none flex gap-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50"></span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form 
          onSubmit={handleSubmit}
          className="glass-card p-2 flex items-center gap-2 border-[var(--border)] group focus-within:border-[var(--primary)]/50 transition-all shadow-xl mb-2"
        >
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Transmit signal (e.g., 'Read memory_config.json')..."
            className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--faint)]"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className="w-12 h-12 rounded-xl flex items-center justify-center disabled:opacity-50 disabled:grayscale shadow-[0_0_15px_var(--primary-glow)] shiny-button"
          >
            <span className="transform rotate-90 text-xl">➤</span>
          </button>
        </form>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 10px;
        }
      `}</style>
    </div>
    </>
  );
}
