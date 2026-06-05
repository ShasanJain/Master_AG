'use client';

import { useState, useEffect, useMemo } from 'react';
import { StatusBadge } from "../components/StatusBadge";
import { ChevronDown, ChevronUp, Activity, TerminalSquare, AlertTriangle, CheckCircle2 } from "lucide-react";
import SovereigntyPanel from '../components/SovereigntyPanel';

interface MissionLog {
  id: string;
  timestamp: string;
  mission: string;
  status: 'SUCCESS' | 'ACTIVE' | 'ERROR';
  agent: string;
  skill: string;
  details?: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<MissionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'DATE' | 'MISSION' | 'STATUS'>('DATE');
  const [showStats, setShowStats] = useState(false);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      setLogs(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    const totalMissions = logs.length;
    if (totalMissions === 0) return { totalMissions: 0, topSkills: [], efficiency: 0, errorRate: 0, successRate: 0 };
    
    let successes = 0;
    let errors = 0;
    const skillCounts: Record<string, number> = {};

    logs.forEach(log => {
      if (log.status === 'SUCCESS') successes++;
      if (log.status === 'ERROR') errors++;
      
      skillCounts[log.skill] = (skillCounts[log.skill] || 0) + 1;
    });

    const successRate = ((successes / totalMissions) * 100).toFixed(1);
    const errorRate = ((errors / totalMissions) * 100).toFixed(1);
    
    // Sort skills to find top
    const sortedSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count, percentage: Math.round((count / totalMissions) * 100) }))
      .slice(0, 4);

    return {
      totalMissions,
      topSkills: sortedSkills,
      successRate,
      errorRate,
      efficiency: 98.4, // Industrial placeholder
    };
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs
      .filter(log => 
        log.mission.toLowerCase().includes(search.toLowerCase()) || 
        log.agent.toLowerCase().includes(search.toLowerCase()) ||
        log.skill.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === 'DATE') return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        if (sortBy === 'MISSION') return a.mission.localeCompare(b.mission);
        return a.status.localeCompare(b.status);
      });
  }, [logs, search, sortBy]);

  return (
    <>
      <div className="atmospheric-orb orb-emerald"></div>
      <div className="atmospheric-orb orb-sapphire"></div>
      <div className="max-w-6xl mx-auto space-y-12 relative z-10 p-6">
        <section className="flex justify-between items-start">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <h2 className="text-5xl font-bold tracking-tighter text-[var(--foreground)]">Mission Logs</h2>
            <StatusBadge status="SYNCED" />
          </div>
          <p className="text-[var(--muted)] max-w-xl text-sm leading-relaxed">
            Real-time audit trail for all sovereign engine operations. All missions are cryptographically signed and logged to the industrial registry.
          </p>
        </div>
        <button 
          onClick={() => setShowStats(!showStats)}
          className={`px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border ${showStats ? 'shiny-button active' : 'bg-[var(--surface)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]'}`}
        >
          {showStats ? 'Close Analytics' : 'Engine Analytics'}
        </button>
      </section>

      {showStats && (
        <section className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard label="Total Missions" value={stats.totalMissions.toString()} icon={<TerminalSquare className="w-4 h-4" />} />
            <StatCard label="Fulfillment Rate" value={`${stats.successRate}%`} status="OPTIMAL" icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />} />
            <StatCard label="Error Rate" value={`${stats.errorRate}%`} status={parseFloat(stats.errorRate as string) > 5 ? "ERROR" : "OPTIMAL"} icon={<AlertTriangle className={`w-4 h-4 ${parseFloat(stats.errorRate as string) > 5 ? 'text-red-500' : 'text-emerald-500'}`} />} />
            <StatCard label="Primary Engine" value={stats.topSkills[0]?.name || 'N/A'} icon={<Activity className="w-4 h-4" />} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="glass-card p-8 bg-[var(--surface)] space-y-6">
                <h3 className="text-xs font-bold text-[var(--faint)] uppercase tracking-[0.2em]">Skill Invocation Distribution</h3>
                <div className="space-y-4">
                   {stats.topSkills.map((skill, idx) => (
                     <UsageBar key={idx} label={skill.name} percentage={skill.percentage} count={skill.count} />
                   ))}
                </div>
             </div>
             <div className="glass-card p-8 bg-[var(--surface)] flex flex-col justify-center items-center text-center space-y-4 border-beam">
                <div className="flex flex-col items-center gap-6">
                   <div className="flex items-end gap-2">
                     <span className="pixel-3d text-5xl">94</span>
                     <span className="pixel-3d text-2xl">%</span>
                   </div>
                   <div className="flex gap-2">
                     {[...Array(20)].map((_, i) => (
                       <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < 19 ? 'bg-[var(--foreground)] shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'bg-[var(--surface)] border border-[var(--border)]'}`} />
                     ))}
                   </div>
                </div>
                <div>
                   <h3 className="text-xs font-bold text-[var(--faint)] uppercase tracking-[0.2em]">System Optimization</h3>
                   <p className="text-sm text-[var(--muted)] mt-1">Engine performing at peak industrial capacity.</p>
                </div>
              </div>
           </div>
           
           {/* Terminal Panel */}
           <SovereigntyPanel />
        </section>
      )}

      <section className="space-y-8">
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-6 items-end justify-between border-b border-[var(--border)] pb-8">
          <div className="w-full md:w-96 space-y-2">
            <label className="text-[10px] font-bold text-[var(--faint)] uppercase tracking-[0.2em]">Filter Audit Trail</label>
            <input 
              type="text" 
              placeholder="SEARCH BY MISSION, AGENT, OR SKILL..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-5 py-3 text-xs font-bold tracking-widest outline-none focus:border-[var(--primary)] transition-all placeholder:text-[var(--faint)] text-[var(--foreground)]"
            />
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold text-[var(--faint)] uppercase tracking-widest">Sort:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-bold uppercase tracking-widest text-[var(--primary)] outline-none cursor-pointer"
            >
              <option value="DATE">Newest First</option>
              <option value="MISSION">Mission Name</option>
              <option value="STATUS">System Status</option>
            </select>
          </div>
        </div>

        <div className="glass-card overflow-hidden bg-[var(--surface)] shadow-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--surface)] border-b border-[var(--border)]">
                <th className="px-8 py-5 text-xs uppercase tracking-[0.2em] font-bold text-[var(--muted)]">Timestamp / Date</th>
                <th className="px-8 py-5 text-xs uppercase tracking-[0.2em] font-bold text-[var(--muted)]">Mission / Operation</th>
                <th className="px-8 py-5 text-xs uppercase tracking-[0.2em] font-bold text-[var(--muted)]">System Status</th>
                <th className="px-8 py-5 text-xs uppercase tracking-[0.2em] font-bold text-[var(--muted)]">Assigned Agent</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-[var(--faint)] font-bold uppercase tracking-widest animate-pulse">
                    Synchronizing Log Stream...
                  </td>
                </tr>
              ) : filteredLogs.map(log => (
                <LogEntry key={log.id} {...log} />
              ))}
              {!isLoading && filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-[var(--faint)] font-bold uppercase tracking-widest">
                    No Mission History Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
    </>
  );
}

function StatCard({ label, value, delta, sub, status, icon }: { label: string; value: string; delta?: string; sub?: string; status?: string; icon?: React.ReactNode }) {
  return (
    <div className="glass-card p-6 bg-[var(--surface)] space-y-2 hover:border-[var(--primary)] transition-all">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.2em]">{label}</span>
        {icon && <span className="opacity-50">{icon}</span>}
      </div>
      <div className="flex items-end justify-between">
        <h4 className="text-2xl font-bold text-[var(--foreground)] truncate pr-2">{value}</h4>
        {delta && <span className={`text-[10px] font-bold ${status === 'OPTIMAL' ? 'text-emerald-500' : 'text-[var(--primary)]'}`}>{delta}</span>}
      </div>
      {sub && <p className="text-xs text-[var(--faint)] font-medium">{sub}</p>}
    </div>
  );
}

function UsageBar({ label, percentage, count }: { label: string; percentage: number; count: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
        <span className="text-[var(--muted)]">{label}</span>
        <span className="text-[var(--primary)]">{count} OPS</span>
      </div>
      <div className="h-1 w-full bg-[var(--background)] rounded-full overflow-hidden">
        <div className="h-full bg-[var(--primary)] transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}


function LogEntry({ timestamp, mission, status, agent, id, skill, details }: MissionLog) {
  const [isOpen, setIsOpen] = useState(false);
  const dateObj = new Date(timestamp);
  const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  const dateAbbr = dateObj.toLocaleDateString([], { month: 'short', day: '2-digit' }).toUpperCase();
  
  return (
    <>
      <tr onClick={() => setIsOpen(!isOpen)} className="border-b border-[var(--border)] hover:bg-[var(--background)] transition-all group cursor-pointer">
        <td className="px-8 py-6 group-hover:text-[var(--primary)] transition-colors">
          <div className="flex items-center gap-4">
            {isOpen ? <ChevronUp className="w-4 h-4 text-[var(--primary)]" /> : <ChevronDown className="w-4 h-4 text-[var(--muted)]" />}
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[var(--faint)] uppercase tracking-tighter">{dateAbbr}</span>
              <span className="font-mono text-xs text-[var(--muted)] group-hover:text-[var(--primary)]">{time}</span>
            </div>
          </div>
        </td>
        <td className="px-8 py-6">
          <div className="flex flex-col gap-1">
            <span className="font-bold text-[var(--foreground)] group-hover:text-[var(--foreground)] transition-colors">{mission}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--faint)] uppercase tracking-widest font-mono">ID // {id}</span>
              <span className="text-xs text-[var(--primary)]/60 uppercase tracking-widest font-bold">SKILL // {skill}</span>
            </div>
          </div>
        </td>
        <td className="px-8 py-6">
          <StatusBadge status={status} />
        </td>
        <td className="px-8 py-6">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[8px] font-bold text-[var(--muted)]">
              {agent[0]}
            </div>
            <span className="text-xs text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors font-medium">{agent}</span>
          </div>
        </td>
      </tr>
      {isOpen && (
        <tr className="bg-[var(--background)]/50 border-b border-[var(--border)]">
          <td colSpan={4} className="p-0">
            <div className="px-12 py-6 border-l-2 border-[var(--primary)] ml-8 my-4 bg-[var(--surface)]/50 rounded-r-xl">
              <h4 className="text-[10px] font-bold text-[var(--faint)] uppercase tracking-[0.2em] mb-4">Execution Diagnostics</h4>
              <div className="grid grid-cols-2 gap-8 text-sm">
                <div>
                  <span className="text-[var(--muted)] text-xs uppercase tracking-widest">Routing Agent</span>
                  <p className="font-mono text-[var(--foreground)] mt-1">{agent} - Auto-invoked via {skill}</p>
                </div>
                <div>
                  <span className="text-[var(--muted)] text-xs uppercase tracking-widest">Compute Trace</span>
                  <p className="font-mono text-[var(--foreground)] mt-1">{id}.mem_shard_x9</p>
                </div>
              </div>
              <div className="mt-6">
                <span className="text-[var(--muted)] text-xs uppercase tracking-widest">Payload Data</span>
                <pre className="mt-2 p-4 bg-black/40 rounded-lg text-xs font-mono text-[var(--faint)] whitespace-pre-wrap border border-white/5">
                  {details || `{\n  "event": "PROCESS_SPAWN",\n  "status": "${status}",\n  "vector_id": "${id}"\n}`}
                </pre>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
