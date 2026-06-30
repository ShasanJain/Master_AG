"use client";

import { useState, useEffect } from "react";
import MemoryTile from "./MemoryTile";
import { fetchMemories } from "../actions/memory";

export default function MemoryMatrix() {
  const [memories, setMemories] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sector, setSector] = useState("all");
  const [search, setSearch] = useState("");
  const [layout, setLayout] = useState<'grid' | 'list'>('list');
  const [loading, setLoading] = useState(true);

  const limit = 12;

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await fetchMemories(page, limit, sector, search);
      setMemories(res.items || []);
      setTotal(res.total || 0);
      setLoading(false);
    }
    loadData();
  }, [page, sector, search]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex flex-col gap-6">
      {/* Controls */}
      <div className="flex flex-wrap justify-between items-center gap-4 glass-card p-4">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {["all", "episodic", "semantic", "procedural", "structural"].map(s => (
            <button
              key={s}
              onClick={() => { setSector(s); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-bold rounded uppercase tracking-wider transition-colors ${sector === s ? 'bg-[var(--foreground)] text-[var(--background)]' : 'bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)]'}`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Search & Layout */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Search traces..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="bg-[var(--surface)] border border-[var(--border)] rounded px-3 py-1.5 text-sm text-[var(--foreground)] outline-none focus:border-blue-500 transition-colors flex-1 md:w-64"
          />
          <button 
            onClick={() => setLayout(l => l === 'grid' ? 'list' : 'grid')}
            className="p-1.5 bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] rounded transition-colors"
            title={layout === 'grid' ? 'Switch to List View' : 'Switch to Grid View'}
          >
            {layout === 'grid' ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="glass-card p-12 flex items-center justify-center animate-pulse">
          <span className="text-[var(--muted)] text-sm tracking-widest uppercase">SYNCING MATRIX...</span>
        </div>
      ) : memories.length === 0 ? (
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[var(--surface)] flex items-center justify-center text-2xl text-[var(--faint)]">∅</div>
          <div>
            <p className="text-sm font-bold text-[var(--foreground)] uppercase tracking-widest">Neural Void</p>
            <p className="text-xs text-[var(--faint)]">No traces match the current filters.</p>
          </div>
        </div>
      ) : (
        <div className={layout === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "glass-card flex flex-col divide-y divide-[var(--border)] overflow-hidden"}>
          {memories.map((mem) => (
            <MemoryTile key={mem.id} mem={mem} layout={layout} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 bg-[var(--surface)] text-[var(--muted)] disabled:opacity-50 hover:text-[var(--foreground)] text-xs font-bold rounded uppercase tracking-wider"
          >
            PREV
          </button>
          <span className="text-xs font-mono text-[var(--faint)]">PAGE {page} OF {totalPages}</span>
          <button 
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 bg-[var(--surface)] text-[var(--muted)] disabled:opacity-50 hover:text-[var(--foreground)] text-xs font-bold rounded uppercase tracking-wider"
          >
            NEXT
          </button>
        </div>
      )}
    </div>
  );
}
