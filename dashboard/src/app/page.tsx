'use client';

import Link from "next/link";
import { StatusBadge } from "./components/StatusBadge";
import { useState, useEffect } from "react";import { TokenWidget } from "./components/TokenWidget";

export default function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Header */}
      <section className="flex justify-between items-end">
        <div>
          <h2 className="text-5xl font-bold tracking-tighter mb-3 text-[var(--foreground)]">Command Center</h2>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.2em]">Engine Status:</span>
            <StatusBadge status="OPTIMAL" />
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-[var(--faint)] uppercase tracking-widest mb-1">Local Time</p>
          <p className="text-xl font-mono text-[var(--muted)]">13:54:22</p>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Registry Density" value="151" unit="Skills" trend="+15100%" />
        <StatCard label="Active Missions" value="06" unit="Tasks" />
        <StatCard label="Token Efficiency" value="98.4" unit="%" trend="optimal" />
        <StatCard label="Uptime" value="142" unit="Hrs" />
      </section>

      {/* Dynamic Widgets */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 min-h-[220px]">
          <TokenWidget />
        </div>
        <div className="md:col-span-2 glass-card p-6 flex flex-col justify-center items-center border border-[var(--border)] relative overflow-hidden group">
           <div className="absolute inset-0 bg-[var(--surface)] opacity-50"></div>
           <div className="relative z-10 text-center">
             <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest flex items-center gap-2 justify-center mb-2">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
               System Telemetry
             </span>
             <p className="text-xs text-[var(--faint)] font-mono">Listening for live orchestration streams...</p>
           </div>
        </div>
      </section>

      {/* Skill Armory Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-[var(--faint)] pb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-bold uppercase tracking-[0.2em] text-[var(--muted)]">Skill Armory</h3>
            <div className="h-4 w-px bg-[var(--faint)]" />
            <span className="text-[10px] font-bold text-[var(--faint)] uppercase tracking-widest">Deployable Intelligence</span>
          </div>
          <Link href="/skills">
            <button className="px-4 py-2 rounded-lg bg-[var(--faint)] border border-[var(--faint)] text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--muted)]/10 transition-all text-[var(--muted)]">VIEW ALL SKILLS</button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <SkillCard 
            title="audio-studio" 
            desc="Professional DSP engine for mixing, equalization, and local audio stem rendering." 
            category="PRODUCTION"
            status="OPTIMAL"
            href="/audio-studio"
          />
          <SkillCard 
            title="reel-studio" 
            desc="AI-powered timeline sequence editor with live preview, voice generation, and media processing." 
            category="MEDIA"
            status="OPTIMAL"
            href="/reel-studio"
          />
          <SkillCard 
            title="seo-analyzer" 
            desc="Live page auditing, semantic structure mapping, and AI search (GEO) optimization engine." 
            category="MARKETING"
            status="OPTIMAL"
            href="/seo-analyzer"
          />
          <SkillCard 
            title="writing-skills" 
            desc="High-Density BLUF Communication for executive reports. Industrial core module." 
            category="CORE"
            status="OPTIMAL"
          />
          <SkillCard 
            title="systematic-debugging" 
            desc="Scientific method approach to resolving complex state bugs in high-autonomy environments." 
            category="SRE"
            status="OPTIMAL"
          />
          <SkillCard 
            title="design-audit" 
            desc="UX & Accessibility verification using premium design tokens. Ensures visual excellence." 
            category="DESIGN"
            status="OPTIMAL"
          />
        </div>
      </section>

      {/* Terminal Footer */}
      <section className="glass-card p-6 border-l-4 border-l-[var(--primary)] bg-[var(--primary-glow)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <span className="text-6xl font-black italic tracking-tighter text-[var(--foreground)]">CMD</span>
        </div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] font-mono text-xl font-bold">
            {">_"}
          </div>
          <div className="flex-1">
            <input 
              type="text" 
              placeholder="Orchestrate the swarm... (e.g. /audit --deep)" 
              className="bg-transparent border-none outline-none w-full text-lg text-[var(--foreground)] placeholder:text-[var(--faint)] font-medium"
            />
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[var(--faint)] border border-[var(--faint)]">
            <span className="text-[10px] font-bold text-[var(--muted)]">ENTER</span>
            <span className="text-[10px] font-bold text-[var(--faint)] uppercase">Dispatch</span>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, unit, trend }: { label: string; value: string; unit: string; trend?: string }) {
  return (
    <div className="glass-card p-8 group relative overflow-hidden">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-[var(--primary-glow)] rounded-full blur-3xl group-hover:bg-[var(--primary)] transition-all opacity-50" />
      <div className="flex justify-between items-start mb-4">
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--muted)]">{label}</p>
        {trend && (
          <span className={`text-[10px] font-bold ${trend === 'optimal' ? 'text-[var(--status-emerald)]' : 'text-[var(--status-blue)]'}`}>
            {trend.startsWith('+') ? trend : '• ' + trend.toUpperCase()}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold text-[var(--foreground)] tracking-tighter">{value}</span>
        <span className="text-xs uppercase text-[var(--status-blue)] font-bold tracking-widest opacity-60">{unit}</span>
      </div>
    </div>
  );
}

function SkillCard({ title, desc, category, status, href = "/skills" }: { title: string; desc: string; category: string; status: any; href?: string }) {
  return (
    <div className="glass-card p-8 flex flex-col h-full group border-b-2 border-b-transparent hover:border-b-[var(--primary)]">
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-1">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--faint)] text-[var(--muted)] tracking-widest uppercase">{category}</span>
          <h4 className="font-bold text-xl leading-tight text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">{title}</h4>
        </div>
        <StatusBadge status={status} />
      </div>
      <p className="text-sm text-[var(--muted)] leading-relaxed mb-8 flex-1">{desc}</p>
      <Link href={href}>
        <button className="w-full py-3 rounded-xl bg-[var(--primary-glow)] border border-[var(--primary)] text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[var(--primary)] hover:text-white transition-all shadow-xl text-[var(--primary)]">
          Initialize Session
        </button>
      </Link>
    </div>
  );
}
