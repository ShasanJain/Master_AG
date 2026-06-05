'use client';

import { useState, useRef, useEffect } from "react";
import { sendLocalMessage, getChatHistory, getEngineStatus, deleteMemory, togglePinMemory, toggleArchiveMemory, startEngine, searchMemories } from "../actions/chat";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Menu, X, Pin, Archive, Trash2, MessageSquare } from 'lucide-react';

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [engineStatus, setEngineStatus] = useState<{ online: boolean, model: string }>({ online: false, model: '...' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'recent' | 'archived'>('recent');
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isStartingEngine, setIsStartingEngine] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadHistory();
    checkEngine();
    
    // Poll engine status every 10 seconds
    const interval = setInterval(checkEngine, 10000);
    return () => clearInterval(interval);
  }, []);

  const checkEngine = async () => {
    const status = await getEngineStatus();
    setEngineStatus(status);
    if (status.online) setIsStartingEngine(false);
  };

  const loadHistory = async () => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      const data = await searchMemories(searchQuery);
      setHistory(data);
      setIsSearching(false);
    } else {
      const data = await getChatHistory();
      setHistory(data);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadHistory();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleClearCache = () => {
    setMessages([]);
    setInput("");
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteMemory(id);
    loadHistory();
  };

  const handlePin = async (id: string, currentlyPinned: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    await togglePinMemory(id, !currentlyPinned);
    loadHistory();
  };

  const handleArchive = async (id: string, currentlyArchived: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleArchiveMemory(id, !currentlyArchived);
    loadHistory();
  };

  const handleStartEngine = async () => {
    if (engineStatus.online || isStartingEngine) return;
    setIsStartingEngine(true);
    await startEngine();
    // Poll more frequently while starting
    const interval = setInterval(async () => {
      const status = await getEngineStatus();
      if (status.online) {
        setEngineStatus(status);
        setIsStartingEngine(false);
        clearInterval(interval);
      }
    }, 2000);
    setTimeout(() => clearInterval(interval), 30000); // Stop polling fast after 30s
  };

  const activeHistory = history.filter(h => 
    activeTab === 'archived' 
      ? h.metadata?.archived === true 
      : !h.metadata?.archived
  ).sort((a, b) => {
    if (a.metadata?.pinned && !b.metadata?.pinned) return -1;
    if (!a.metadata?.pinned && b.metadata?.pinned) return 1;
    return b.timestamp - a.timestamp;
  });

  return (
    <>
      <div className="atmospheric-orb orb-emerald"></div>
      <div className="atmospheric-orb orb-sapphire"></div>
      <div className="flex gap-8 h-[calc(100vh-160px)] relative z-10 min-w-0">
          
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Slide-out Sidebar */}
        <div className={`fixed lg:static top-0 left-0 h-full lg:h-auto w-80 glass-card border-[var(--border)] z-50 shrink-0 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col`}>
          
          <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--muted)] uppercase tracking-widest flex items-center gap-2">
              <MessageSquare size={16} className="text-[var(--primary)]" />
              Signal Archive
            </h3>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex px-4 pt-4 gap-2">
            <button 
              onClick={() => { setActiveTab('recent'); setSearchQuery(''); }}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-t-lg transition-all ${activeTab === 'recent' ? 'bg-[var(--primary)]/10 text-[var(--primary)] border-b-2 border-[var(--primary)]' : 'text-[var(--muted)] hover:bg-[var(--background)]'}`}
            >
              Recent
            </button>
            <button 
              onClick={() => { setActiveTab('archived'); setSearchQuery(''); }}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-t-lg transition-all ${activeTab === 'archived' ? 'bg-[var(--primary)]/10 text-[var(--primary)] border-b-2 border-[var(--primary)]' : 'text-[var(--muted)] hover:bg-[var(--background)]'}`}
            >
              Archived
            </button>
          </div>

          <div className="px-4 py-3 bg-[var(--background)]/30 border-b border-[var(--border)]">
            <input 
              type="text" 
              placeholder="Search episodic traces..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--primary)] transition-colors placeholder:text-[var(--faint)]"
            />
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar relative">
            {isSearching && (
              <div className="absolute inset-0 bg-[var(--background)]/50 backdrop-blur-sm z-10 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full border-2 border-transparent border-t-[var(--primary)] animate-spin"></div>
              </div>
            )}
            {activeHistory.length === 0 ? (
              <p className="text-center text-xs text-[var(--faint)] mt-10">No signals found.</p>
            ) : (
              activeHistory.map((h, i) => (
                <div key={h.id || i} className="group relative p-3 rounded-lg bg-[var(--background)]/50 border border-transparent hover:border-[var(--primary)]/30 transition-all">
                  {h.metadata?.pinned && (
                    <div className="absolute -top-2 -right-2 text-[10px] bg-[var(--primary)] text-[var(--background)] px-2 py-0.5 rounded-full font-bold shadow-[0_0_10px_var(--primary-glow)] z-10 flex items-center gap-1">
                      <Pin size={10} className="fill-current" /> Pinned
                    </div>
                  )}
                  <p className="text-xs text-[var(--foreground)] line-clamp-2 leading-relaxed">
                    {h.content}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] font-mono text-[var(--muted)]">
                      {new Date(h.timestamp * 1000).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--background)] rounded-md border border-[var(--border)] p-1">
                      <button 
                        onClick={(e) => handlePin(h.id, h.metadata?.pinned, e)}
                        title={h.metadata?.pinned ? "Unpin" : "Pin"}
                        className={`p-1.5 rounded hover:bg-[var(--primary)]/20 transition-colors ${h.metadata?.pinned ? 'text-[var(--primary)]' : 'text-[var(--muted)] hover:text-[var(--primary)]'}`}
                      >
                        <Pin size={12} className={h.metadata?.pinned ? 'fill-current' : ''} />
                      </button>
                      <button 
                        onClick={(e) => handleArchive(h.id, h.metadata?.archived, e)}
                        title={h.metadata?.archived ? "Unarchive" : "Archive"}
                        className={`p-1.5 rounded hover:bg-[var(--primary)]/20 transition-colors ${h.metadata?.archived ? 'text-[var(--primary)]' : 'text-[var(--muted)] hover:text-[var(--primary)]'}`}
                      >
                        <Archive size={12} />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(h.id, e)}
                        title="Delete"
                        className="p-1.5 rounded hover:bg-rose-500/20 text-[var(--muted)] hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden min-w-0">
          {/* Header */}
        <header className="glass-card p-4 md:p-6 mb-6 flex items-center justify-between border-[var(--border)] relative z-20 shadow-lg">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="w-10 h-10 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--foreground)] hover:border-[var(--primary)] transition-all lg:hidden"
            >
              <Menu size={20} />
            </button>
            <div className="w-10 h-10 rounded-xl bg-[var(--background)] border border-[var(--primary)] flex items-center justify-center text-xl shadow-[0_0_20px_var(--primary-glow)]">
              📡
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tighter text-[var(--foreground)]">Neural Link</h2>
              <div className="flex items-center gap-3 mt-1">
                <button 
                  onClick={handleStartEngine}
                  disabled={engineStatus.online || isStartingEngine}
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border transition-all ${engineStatus.online ? 'bg-[var(--background)] border-[var(--border)] cursor-default' : 'bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/20 cursor-pointer'}`}
                >
                  <span className={`w-2 h-2 rounded-full ${engineStatus.online ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : isStartingEngine ? 'bg-yellow-500 shadow-[0_0_8px_#eab308] animate-pulse' : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'} ${engineStatus.online ? 'animate-pulse' : ''}`}></span>
                  <span className={`text-[9px] font-bold uppercase tracking-widest ${engineStatus.online ? 'text-emerald-500' : isStartingEngine ? 'text-yellow-500' : 'text-rose-500'}`}>
                    {engineStatus.online ? 'ONLINE' : isStartingEngine ? 'STARTING...' : 'OFFLINE (CLICK TO RESTART)'}
                  </span>
                </button>
                <span className="hidden sm:inline text-xs font-bold text-[var(--muted)] uppercase tracking-widest">
                  Secure Offline Channel
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-right">
            <div className="flex flex-col items-end">
              <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest">Inference Engine</p>
              <p className="text-xs font-mono text-[var(--primary)]">{engineStatus.model}</p>
            </div>
            <button 
              onClick={handleClearCache}
              className="px-4 py-2 border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap"
            >
              Clear Cache
            </button>
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
                  ? 'bg-[var(--primary)] text-[var(--background)] rounded-tr-none shadow-lg whitespace-pre-wrap' 
                  : 'glass-card rounded-tl-none border-l-4 border-l-[var(--primary)] shadow-sm'
              }`}>
                {msg.role === 'user' ? (
                  msg.content
                ) : (
                  <div className="prose prose-invert max-w-none text-xs md:text-sm">
                    <ReactMarkdown
                      components={{
                        code(props: any) {
                          const {children, className, node, ...rest} = props;
                          const match = /language-(\w+)/.exec(className || '');
                          return match ? (
                            <SyntaxHighlighter
                              {...rest}
                              PreTag="div"
                              language={match[1]}
                              style={vscDarkPlus}
                              customStyle={{ margin: '1em 0', borderRadius: '0.5rem', fontSize: '0.8rem' }}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code {...rest} className="bg-[var(--background)]/50 px-1.5 py-0.5 rounded text-emerald-400 font-mono text-xs">
                              {children}
                            </code>
                          );
                        }
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}
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
          className="glass-card p-2 flex items-end gap-2 border-[var(--border)] group focus-within:border-[var(--primary)]/50 transition-all shadow-xl mb-2"
        >
          <textarea 
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
            }}
            onKeyDown={handleKeyDown}
            placeholder="Transmit signal (e.g., 'Read memory_config.json')... [Shift+Enter for newline]"
            className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--faint)] resize-none min-h-[48px] max-h-[200px] custom-scrollbar"
            rows={1}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className="w-12 h-12 shrink-0 rounded-xl flex items-center justify-center disabled:opacity-50 disabled:grayscale shadow-[0_0_15px_var(--primary-glow)] shiny-button"
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
