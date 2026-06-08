'use client';

import { useState } from 'react';
import { Search, Filter, Download, ArrowUpRight, ArrowDownRight, MoreVertical } from 'lucide-react';

const MOCK_DATA = Array.from({ length: 15 }).map((_, i) => ({
  id: `TRX-${1000 + i}`,
  date: new Date(Date.now() - i * 86400000).toLocaleDateString(),
  amount: (Math.random() * 5000 + 100).toFixed(2),
  status: Math.random() > 0.2 ? 'Completed' : 'Pending',
  client: `Client Entity ${String.fromCharCode(65 + (i % 26))}`
}));

export function DataMatrix() {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-6 h-full font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)] font-mono">Telemetry Data Matrix</h2>
          <p className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-widest font-mono mt-1">High-Density Transaction Log</p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
            <input 
              type="text" 
              placeholder="Search matrix..." 
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-sm py-2 pl-9 pr-3 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-all font-mono placeholder:text-[var(--faint)]"
            />
          </div>
          <button className="bg-[var(--surface)] border border-[var(--border)] p-2 rounded-sm hover:border-[var(--primary)] transition-colors cursor-pointer text-[var(--foreground)] hover:text-[var(--primary)] shadow-sm">
            <Filter size={18} />
          </button>
          <button className="bg-[var(--background)] border border-[var(--border)] text-[var(--primary)] p-2 rounded-sm transition-colors cursor-pointer flex items-center gap-2 px-4 shadow-[0_0_10px_var(--primary-glow)] hover:border-[var(--primary)] hover:bg-[var(--surface)]">
            <Download size={16} />
            <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest font-mono">Export</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Chart + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[500px]">
        
        {/* Chart Area */}
        <div className="lg:col-span-1 border border-[var(--border)] bg-[var(--surface)] rounded-sm p-5 shadow-sm flex flex-col group hover:border-[var(--primary)] transition-colors">
          <h2 className="text-xs uppercase tracking-widest font-bold mb-4 border-b border-[var(--border)] pb-2 text-[var(--foreground)] font-mono">Volume Trend</h2>
          <div className="flex-1 flex items-end gap-1 group cursor-pointer relative">
            {Array.from({ length: 24 }).map((_, i) => {
              const h = Math.random() * 80 + 20;
              return (
                <div key={i} className="flex-1 flex flex-col justify-end opacity-60 group-hover:opacity-30 hover:!opacity-100 transition-opacity relative">
                  {/* Tooltip Simulation */}
                  <div className="opacity-0 hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--background)] text-[var(--foreground)] border border-[var(--primary)] shadow-[0_0_10px_var(--primary-glow)] text-[10px] py-1 px-2 rounded-sm font-mono pointer-events-none z-10 whitespace-nowrap">
                    ${(h * 10).toFixed(0)}
                  </div>
                  <div 
                    className="bg-[var(--primary)] rounded-t-sm transition-all duration-300"
                    style={{ height: `${h}%` }}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* Data Table */}
        <div className="lg:col-span-2 border border-[var(--border)] bg-[var(--surface)] rounded-sm shadow-sm overflow-hidden flex flex-col group hover:border-[var(--primary)] transition-colors">
          <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--background)]">
            <h2 className="text-xs uppercase tracking-widest font-bold text-[var(--foreground)] font-mono">Recent Transactions</h2>
            <button className="text-[10px] text-[var(--primary)] hover:underline font-bold cursor-pointer font-mono tracking-widest uppercase">View All</button>
          </div>
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-[var(--muted)] uppercase tracking-widest bg-[var(--surface)] sticky top-0 shadow-sm z-10 font-mono">
                <tr>
                  <th className="px-4 py-3 font-bold border-b border-[var(--border)]">ID</th>
                  <th className="px-4 py-3 font-bold border-b border-[var(--border)]">Date</th>
                  <th className="px-4 py-3 font-bold border-b border-[var(--border)]">Client</th>
                  <th className="px-4 py-3 font-bold border-b border-[var(--border)]">Status</th>
                  <th className="px-4 py-3 font-bold text-right border-b border-[var(--border)]">Amount</th>
                  <th className="px-4 py-3 border-b border-[var(--border)]"></th>
                </tr>
              </thead>
              <tbody>
                {MOCK_DATA.map((row, i) => (
                  <tr 
                    key={row.id} 
                    className={`border-b border-[var(--border)] transition-colors cursor-pointer ${hoveredRow === i ? 'bg-[var(--background)]' : 'bg-transparent'}`}
                    onMouseEnter={() => setHoveredRow(i)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td className="px-4 py-3 font-mono text-[10px] font-bold text-[var(--foreground)]">{row.id}</td>
                    <td className="px-4 py-3 text-[10px] font-mono text-[var(--muted)]">{row.date}</td>
                    <td className="px-4 py-3 font-medium text-[var(--foreground)] text-xs">{row.client}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-sm text-[9px] font-bold uppercase tracking-widest ${row.status === 'Completed' ? 'bg-[var(--status-emerald-bg)] text-[var(--status-emerald)]' : 'bg-[var(--status-blue-bg)] text-[var(--status-blue)]'}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs font-bold text-[var(--foreground)]">${row.amount}</td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-[var(--faint)] hover:text-[var(--primary)] transition-colors p-1 rounded-sm hover:bg-[var(--background)]">
                        <MoreVertical size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
