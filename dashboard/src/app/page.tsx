'use client';

import Link from "next/link";
import { StatusBadge } from "./components/StatusBadge";
import { TokenWidget } from "./components/TokenWidget";
import { motion, Variants } from "framer-motion";
import { Terminal } from "lucide-react";
import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';

const NeuralGraph3D = dynamic(() => import('./components/NeuralGraph3D'), { ssr: false });

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  const [time, setTime] = useState<string>("00:00:00");

  useEffect(() => {
    setTime(new Date().toLocaleTimeString('en-GB'));
    const interval = setInterval(() => setTime(new Date().toLocaleTimeString('en-GB')), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Atmospheric Orbs */}
      <div className="atmospheric-orb orb-emerald"></div>
      <div className="atmospheric-orb orb-sapphire"></div>
      
      <div className="w-full h-full max-w-7xl mx-auto flex flex-col space-y-6 relative z-10">
        {/* Header */}
      <motion.section 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-end border-b border-[var(--border)] pb-4"
      >
        <div>
          <h2 className="text-4xl font-bold tracking-tight mb-2 text-[var(--foreground)] font-mono">Command Center</h2>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest font-mono">Engine Status:</span>
            <StatusBadge status="OPTIMAL" />
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-[var(--faint)] uppercase tracking-widest mb-1 font-mono">Local Time</p>
          <p className="text-xl font-mono text-[var(--primary)] font-bold">{time}</p>
        </div>
      </motion.section>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1"
      >
        {/* Left Column (Stats + Widgets) */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Registry" value="151" unit="Skills" trend="+151%" delay={0.1} />
            <StatCard label="Missions" value="06" unit="Tasks" delay={0.2} />
            <StatCard label="Token Eff." value="98.4" unit="%" trend="optimal" delay={0.3} />
            <StatCard label="Uptime" value="142" unit="Hrs" delay={0.4} />
          </div>
          
          <motion.div variants={item} className="h-48 border border-[var(--border)] bg-[var(--surface)] p-0 rounded-sm overflow-hidden relative group">
            <TokenWidget />
          </motion.div>

          <motion.div variants={item} className="flex-1 min-h-[160px] border border-[var(--border)] bg-[var(--background)] p-0 flex flex-col relative overflow-hidden group hover:border-[var(--primary)] transition-colors">
            <div className="absolute top-4 left-4 z-10">
              <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-widest flex items-center gap-2 font-mono">
                <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse shadow-[0_0_8px_var(--primary-glow)]"></span>
                System Telemetry
              </span>
            </div>
            {/* 3D Neural Graph rendering (Dynamic SSR False) */}
            <NeuralGraph3D />
          </motion.div>
        </div>

        {/* Right Column (Armory + Terminal) */}
        <div className="md:col-span-8 flex flex-col gap-6">
          <motion.div variants={item} className="flex items-center justify-between border-b border-[var(--border)] pb-2">
            <div className="flex items-center gap-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--foreground)] font-mono">Deployable Intelligence</h3>
            </div>
            <Link href="/skills">
              <button className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-widest hover:underline font-mono">VIEW ARMORY [↗]</button>
            </Link>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SkillCard title="reel-studio" desc="AI-powered timeline sequence editor with live preview, voice generation, and media processing." category="MEDIA" status="OPTIMAL" href="/reel-studio" />
            <SkillCard title="audio-studio" desc="Professional DSP engine for mixing, equalization, and local audio stem rendering." category="PRODUCTION" status="OPTIMAL" href="/audio-studio" />
            <SkillCard title="seo-analyzer" desc="Live page auditing, semantic structure mapping, and AI search (GEO) optimization engine." category="MARKETING" status="OPTIMAL" href="/seo-analyzer" />
            <SkillCard title="design-audit" desc="UX & Accessibility verification using premium design tokens. Ensures visual excellence." category="DESIGN" status="OPTIMAL" />
            <SkillCard title="systematic-debugging" desc="Scientific method approach to resolving complex state bugs in high-autonomy environments." category="SRE" status="OPTIMAL" />
            <SkillCard title="writing-skills" desc="High-Density BLUF Communication for executive reports. Industrial core module." category="CORE" status="OPTIMAL" />
          </div>

          <motion.div variants={item} className="mt-auto bg-[var(--background)] p-4 relative overflow-hidden group hover:border-[var(--primary)] transition-all border-beam">
            <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
              <span className="text-6xl font-black tracking-tighter text-[var(--foreground)]">CMD</span>
            </div>
            <div className="flex items-center gap-4 relative z-10">
              <Terminal className="w-5 h-5 text-[var(--primary)]" />
              <div className="flex-1">
                <input 
                  type="text" 
                  placeholder="Orchestrate the swarm... (e.g. /audit --deep)" 
                  className="bg-transparent border-none outline-none w-full text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] font-mono"
                />
              </div>
              <div className="flex items-center gap-2 px-2 py-1 rounded bg-[var(--surface)] border border-[var(--border)]">
                <span className="text-[9px] font-bold text-[var(--primary)]">ENTER</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
      </div>
    </>
  );
}

function StatCard({ label, value, unit, trend, delay = 0 }: { label: string; value: string; unit: string; trend?: string; delay?: number }) {
  return (
    <motion.div variants={item} whileHover={{ scale: 1.02 }} className="border border-[var(--border)] bg-[var(--surface)] p-4 group relative overflow-hidden hover:border-[var(--primary)] transition-all hover:shadow-[0_0_15px_var(--primary-glow)]">
      <div className="flex justify-between items-start mb-2">
        <p className="text-[9px] uppercase tracking-widest font-bold text-[var(--muted)] font-mono">{label}</p>
        {trend && (
          <span className={`text-[9px] font-bold font-mono ${trend === 'optimal' ? 'text-[var(--primary)]' : 'text-[var(--status-blue)]'}`}>
            {trend}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-2xl font-bold text-[var(--foreground)] font-mono tracking-tight">{value}</span>
        <span className="text-[10px] uppercase text-[var(--muted)] font-bold tracking-widest font-mono">{unit}</span>
      </div>
    </motion.div>
  );
}

function SkillCard({ title, desc, category, status, href = "/skills" }: { title: string; desc: string; category: string; status: any; href?: string }) {
  return (
    <motion.div variants={item} whileHover={{ scale: 1.02 }} className="border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col h-full group hover:border-[var(--primary)] transition-all cursor-pointer hover:shadow-[0_0_15px_var(--primary-glow)]">
      <div className="flex justify-between items-start mb-3">
        <div className="space-y-2">
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] text-[var(--primary)] tracking-widest uppercase font-mono">{category}</span>
          <h4 className="font-bold text-sm text-[var(--foreground)] font-mono">{title}</h4>
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] shadow-[0_0_5px_var(--primary-glow)]"></div>
      </div>
      <p className="text-xs text-[var(--muted)] leading-relaxed mb-4 flex-1">{desc}</p>
      <Link href={href} className="mt-auto">
        <button className="w-full py-2 bg-[var(--background)] border border-[var(--border)] text-[10px] font-bold uppercase tracking-widest hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all text-[var(--foreground)] font-mono shiny-button">
          INIT
        </button>
      </Link>
    </motion.div>
  );
}
