'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Activity, BarChart3, Database, GitMerge, Layout, Settings, Terminal, Zap } from 'lucide-react';

export default function OpenDesignLiveDashboard() {
  const [dataFilter, setDataFilter] = useState('7d');

  // Staggered animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 min-h-[calc(100vh-4rem)]">
      {/* Header Area */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="od-text-micro px-2 py-1 bg-[var(--faint)] rounded border border-[var(--border)] text-[var(--primary)] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
              LIVE ARTIFACT
            </span>
            <span className="od-text-micro">open-design.ai/engine</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            System Telemetry
          </h1>
          <p className="text-sm text-[var(--muted)] mt-2 max-w-lg">
            Real-time inference and generation metrics across all sovereign agent clusters. 
            Rendered via Open Design Sandboxed Artifact constraints.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-3 od-glass-panel p-1.5">
          {['24h', '7d', '30d', 'all'].map(filter => (
            <button
              key={filter}
              onClick={() => setDataFilter(filter)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase od-transition ${
                dataFilter === filter 
                  ? 'bg-[var(--primary)] text-black' 
                  : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--faint)]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </motion.div>

      {/* KPI Wall */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <KpiCard title="Active Clusters" value="12" change="+3" icon={<Database className="w-5 h-5" />} trend="up" />
        <KpiCard title="Tokens Streamed" value="2.4M" change="+12%" icon={<Zap className="w-5 h-5 text-[var(--primary)]" />} trend="up" />
        <KpiCard title="Avg Latency" value="142ms" change="-18ms" icon={<Activity className="w-5 h-5" />} trend="down" />
        <KpiCard title="Error Rate" value="0.04%" change="stable" icon={<Terminal className="w-5 h-5" />} trend="neutral" />
      </motion.div>

      {/* Main Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Data Table & Charts */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 space-y-8"
        >
          <div className="od-glass-panel p-6 h-[400px] flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none transition-transform group-hover:scale-110 duration-700">
              <BarChart3 className="w-64 h-64" />
            </div>
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                <h3 className="text-lg font-bold tracking-tight">Inference Volume</h3>
                <span className="od-text-micro">Token generation throughput over time</span>
              </div>
              <button className="p-2 hover:bg-[var(--faint)] rounded-lg od-transition text-[var(--muted)] hover:text-[var(--foreground)]">
                <Settings className="w-4 h-4" />
              </button>
            </div>
            
            {/* Fake Chart Area */}
            <div className="flex-1 flex items-end gap-2 relative z-10 pb-4">
              {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 85].map((h, i) => (
                <div key={i} className="flex-1 bg-white/5 hover:bg-[var(--primary)] rounded-t-sm od-transition relative group/bar" style={{ height: `${h}%` }}>
                  {/* Tooltip */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-mono px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {Math.floor(h * 12.4)}k tkns
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="od-glass-panel p-6">
            <h3 className="text-lg font-bold tracking-tight mb-6">Recent Deployments</h3>
            <div className="space-y-4">
              <DeploymentRow name="ui-guidelines-v2" status="Success" time="2 mins ago" />
              <DeploymentRow name="neural-memory-sync" status="Success" time="1 hour ago" />
              <DeploymentRow name="ollama-engine-boot" status="Warning" time="3 hours ago" />
              <DeploymentRow name="task-scheduler-tick" status="Success" time="5 hours ago" />
            </div>
          </div>
        </motion.div>

        {/* Right Column: Tweaks Panel */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-1"
        >
          <div className="od-glass-panel p-6 sticky top-24">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
              <Layout className="w-5 h-5 text-[var(--primary)]" />
              <h3 className="text-lg font-bold tracking-tight">Tweaks Panel</h3>
            </div>

            <div className="space-y-8">
              <TweakControl label="Render Mode" value="HyperFrames GPU" />
              <TweakControl label="Context Window" value="128,000 tokens" />
              <TweakControl label="Sandboxing" value="Strict Iframe Isolation" />
              
              <div className="pt-6 mt-6 border-t border-white/5">
                <button className="w-full py-3 bg-[var(--faint)] hover:bg-[var(--primary)] text-[var(--foreground)] hover:text-black rounded-lg text-xs font-bold uppercase tracking-widest od-transition">
                  Force Sync Registry
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Subcomponents

function KpiCard({ title, value, change, icon, trend }: { title: string, value: string, change: string, icon: React.ReactNode, trend: 'up'|'down'|'neutral' }) {
  const trendColor = trend === 'up' ? 'text-[var(--primary)]' : trend === 'down' ? 'text-rose-400' : 'text-[var(--muted)]';
  
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
      className="od-glass-panel p-6 od-hover-lift group cursor-default relative overflow-hidden"
    >
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-[var(--primary-glow)] transition-colors duration-500 pointer-events-none" />
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-[var(--faint)] rounded-lg border border-[var(--border)] text-[var(--muted)] group-hover:text-[var(--foreground)] od-transition">
          {icon}
        </div>
        <span className={`text-[10px] font-bold font-mono px-2 py-1 rounded bg-white/5 border border-white/5 ${trendColor}`}>
          {change}
        </span>
      </div>
      <div>
        <h4 className="text-3xl font-black tracking-tighter mb-1">{value}</h4>
        <span className="od-text-micro">{title}</span>
      </div>
    </motion.div>
  );
}

function DeploymentRow({ name, status, time }: { name: string, status: string, time: string }) {
  const isSuccess = status === 'Success';
  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 od-transition border border-transparent hover:border-white/5 cursor-pointer group">
      <div className="flex items-center gap-4">
        <div className={`w-2 h-2 rounded-full ${isSuccess ? 'bg-[var(--primary)] shadow-[0_0_8px_var(--primary-glow)]' : 'bg-amber-400'}`} />
        <div>
          <p className="text-sm font-bold tracking-tight text-[var(--foreground)] group-hover:text-[var(--foreground)] od-transition">{name}</p>
          <p className="text-[10px] text-[var(--muted)] font-mono mt-0.5">{time}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-[10px] uppercase tracking-widest font-bold ${isSuccess ? 'text-[var(--primary)]' : 'text-amber-400'}`}>
          {status}
        </span>
        <GitMerge className="w-4 h-4 text-[var(--muted)] group-hover:text-[var(--foreground)] od-transition" />
      </div>
    </div>
  );
}

function TweakControl({ label, value }: { label: string, value: string }) {
  return (
    <div>
      <div className="flex justify-between items-end mb-2">
        <span className="od-text-micro">{label}</span>
      </div>
      <div className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg p-3 text-sm font-mono text-[var(--foreground)] shadow-inner">
        {value}
      </div>
    </div>
  );
}
