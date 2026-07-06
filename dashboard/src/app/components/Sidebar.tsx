'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconDashboard, IconSkills, IconLogs, IconIncubator, IconSettings
} from '../components/Icons';
import { StatusBadge } from '../components/StatusBadge';
import {
  Radio, Brain, Palette, Search, Globe, CalendarClock,
  MonitorPlay, Mic2, Clapperboard, Frame, Activity,
  ScrollText, Stethoscope, Cpu, Database, MessageSquare,
  ChevronDown, ChevronRight, Pin, Star, Scale, Wand2, TrendingUp, Video, ArrowRightLeft, BookOpen
} from "lucide-react";

interface SidebarProps {
  pinnedSkills: string[];
  togglePin: (name: string) => void;
}

export default function Sidebar({ pinnedSkills = [], togglePin }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    command: false,
    studio: false,
    monitor: false,
    configure: false,
  });

  const [activeWorkspace, setActiveWorkspace] = useState<string | null>(null);

  // Load collapse and workspace state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('jack-sidebar-collapsed');
      if (stored) {
        setCollapsed(JSON.parse(stored));
      }
      const storedWs = localStorage.getItem('jack-active-workspace');
      if (storedWs) {
        setActiveWorkspace(storedWs);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const selectWorkspace = (ws: string | null) => {
    setActiveWorkspace(ws);
    try {
      if (ws) {
        localStorage.setItem('jack-active-workspace', ws);
      } else {
        localStorage.removeItem('jack-active-workspace');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleSection = (section: string) => {
    const updated = { ...collapsed, [section]: !collapsed[section] };
    setCollapsed(updated);
    try {
      localStorage.setItem('jack-sidebar-collapsed', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const isLinkActive = (href: string) => pathname === href;

  // List of all dynamic tools that support pinning
  const allPinableSkills = [
    { label: "Journalist", href: "/journalist", icon: <Globe className="w-4 h-4" />, colorClass: "group-hover:text-amber-400", key: "journalist" },
    { label: "Ideas Lab", href: "/incubator", icon: <IconIncubator className="w-4 h-4" />, colorClass: "group-hover:text-rose-400", key: "incubator" },
    { label: "Browser Bot", href: "/browser-bot", icon: <MonitorPlay className="w-4 h-4" />, colorClass: "group-hover:text-blue-400", key: "browser-bot" },
    { label: "Academic Search", href: "/academic", icon: <Search className="w-4 h-4" />, colorClass: "group-hover:text-rose-400", key: "academic" },
    { label: "SEO Analyzer", href: "/seo-analyzer", icon: <Activity className="w-4 h-4" />, colorClass: "group-hover:text-green-400", key: "seo" },
    { label: "Scheduler", href: "/scheduler", icon: <CalendarClock className="w-4 h-4" />, colorClass: "group-hover:text-cyan-400", key: "scheduler" },
    { label: "UI Master", href: "/ui-master", icon: <Palette className="w-4 h-4" />, colorClass: "group-hover:text-purple-400", key: "ui-master" },
    { label: "Audio Studio", href: "/audio-studio", icon: <Mic2 className="w-4 h-4" />, colorClass: "group-hover:text-pink-400", key: "audio" },
    { label: "Reel Studio", href: "/reel-studio", icon: <Clapperboard className="w-4 h-4" />, colorClass: "group-hover:text-orange-400", key: "reel" },
    { label: "Video Gen", href: "/video-generator", icon: <Video className="w-4 h-4" />, colorClass: "group-hover:text-sky-400", key: "video-generator" },
    { label: "Canvas", href: "/open-design", icon: <Frame className="w-4 h-4" />, colorClass: "group-hover:text-sky-400", key: "canvas" },
    { label: "Skill Studio", href: "/skill-studio", icon: <Wand2 className="w-4 h-4" />, colorClass: "group-hover:text-violet-400", key: "skill-studio" },
    { label: "Fincept Terminal", href: "/fincept", icon: <TrendingUp className="w-4 h-4" />, colorClass: "group-hover:text-amber-500", key: "fincept" },
    { label: "Trading Agents", href: "/trading-agents", icon: <ArrowRightLeft className="w-4 h-4" />, colorClass: "group-hover:text-emerald-500", key: "trading-agents" },
    { label: "OpenWiki", href: "/openwiki", icon: <BookOpen className="w-4 h-4" />, colorClass: "group-hover:text-indigo-400", key: "openwiki" },
  ];

  const pinnedItems = allPinableSkills.filter(item => pinnedSkills.includes(item.key));

  const renderNavItem = (
    label: string, 
    href: string, 
    icon: React.ReactNode, 
    colorClass: string = "group-hover:text-[var(--primary)]",
    pinKey?: string
  ) => {
    const active = isLinkActive(href);
    return (
      <div className="flex items-center group w-full pr-2">
        <Link 
          href={href} 
          className={`flex-1 flex items-center gap-4 px-4 py-2 rounded-xl text-xs font-bold tracking-widest uppercase transition-all ${
            active 
              ? 'text-[var(--foreground)] bg-[var(--surface)] border border-[var(--border)]' 
              : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]/50'
          }`}
        >
          <div className={`${active ? 'text-[var(--primary)]' : 'text-[var(--muted)]'} ${colorClass} transition-colors`}>
            {icon}
          </div>
          <span className="sidebar-label">{label}</span>
        </Link>
        {pinKey && (
          <button 
            onClick={() => togglePin(pinKey)}
            className={`opacity-0 group-hover:opacity-100 p-1.5 hover:text-amber-400 text-[var(--muted)] transition-opacity cursor-pointer`}
            title={pinnedSkills.includes(pinKey) ? "Unpin from top" : "Pin to top"}
          >
            <Star className={`w-3.5 h-3.5 ${pinnedSkills.includes(pinKey) ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>
        )}
      </div>
    );
  };

  const renderSectionHeader = (label: string, sectionKey: string) => {
    const isCollapsed = collapsed[sectionKey];
    return (
      <div className="flex items-center justify-between pt-5 pb-1 px-4 group/section">
        <Link 
          href={`/skills?category=${label.toUpperCase()}`}
          className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--muted)] opacity-60 hover:opacity-100 hover:text-[var(--primary)] transition-all cursor-pointer flex-1"
        >
          {label}
        </Link>
        <button 
          onClick={() => toggleSection(sectionKey)}
          className="text-[var(--muted)] opacity-40 hover:opacity-100 p-1 cursor-pointer transition-opacity"
        >
          {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>
    );
  };

  return (
    <aside className="relative w-64 shrink-0 border-r border-[var(--border)] bg-[var(--sidebar-bg)] flex flex-col p-6 sticky top-0 h-screen z-50 transition-all duration-300">
      <div className="mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center shadow-[0_0_20px_var(--primary-glow)]">
            <span className="text-xl font-bold text-[var(--foreground)] tracking-tighter italic">J</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tighter text-[var(--foreground)]">JACK-05</h1>
            <p className="text-[9px] uppercase tracking-[0.2em] text-[var(--muted)] font-bold">Industrial Engine</p>
          </div>
        </div>
      </div>

      {/* ── WORKSPACE SELECTOR COCKPITS ── */}
      <div className="grid grid-cols-2 gap-1 mb-4 p-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg">
        <button 
          onClick={() => selectWorkspace(null)}
          className={`col-span-2 text-[9px] font-bold font-mono py-1 rounded transition-all uppercase cursor-pointer ${
            activeWorkspace === null ? 'bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)]/30' : 'text-[var(--muted)] hover:text-white'
          }`}
        >
          All Modules
        </button>
        {['command', 'studio', 'monitor', 'configure'].map((ws) => (
          <button 
            key={ws}
            onClick={() => selectWorkspace(ws)}
            className={`text-[9px] font-bold font-mono py-1 rounded transition-all uppercase cursor-pointer ${
              activeWorkspace === ws ? 'bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)]/30' : 'text-[var(--muted)] hover:text-white'
            }`}
          >
            {ws}
          </button>
        ))}
      </div>
      
      <label
        htmlFor="sidebar-toggle"
        className="absolute top-10 -right-3 w-6 h-6 bg-[var(--background)] hover:bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center rounded-full cursor-pointer shadow-lg z-50 transition-all toggle-btn text-[var(--muted)] hover:text-[var(--foreground)]"
      >
        <svg className="w-3 h-3 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </label>      <nav className="flex-1 overflow-y-auto space-y-0.5 pr-1 -mr-1">
        {/* Core Dashboard Link */}
        {renderNavItem("Dashboard", "/", <IconDashboard className="w-4 h-4" />, "group-hover:text-emerald-400")}

        {/* ── PINNED SECTION ── */}
        {pinnedItems.length > 0 && (
          <>
            <div className="flex items-center gap-2 pt-4 pb-1 px-4 text-[8px] font-black uppercase tracking-[0.2em] text-amber-400 opacity-80">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Pinned Board</span>
            </div>
            <div className="space-y-0.5">
              {pinnedItems.map(item => (
                <div key={item.key}>
                  {renderNavItem(item.label, item.href, item.icon, item.colorClass, item.key)}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── COMMAND ── */}
        {(activeWorkspace === null || activeWorkspace === 'command') && (
          <>
            {renderSectionHeader("Command", "command")}
            {!collapsed.command && (
              <div className="space-y-0.5">
                {renderNavItem("Journalist", "/journalist", <Globe className="w-4 h-4" />, "group-hover:text-amber-400", "journalist")}
                {renderNavItem("Ideas Lab", "/incubator", <IconIncubator className="w-4 h-4" />, "group-hover:text-rose-400", "incubator")}
                {renderNavItem("Browser Bot", "/browser-bot", <MonitorPlay className="w-4 h-4" />, "group-hover:text-blue-400", "browser-bot")}
                {renderNavItem("Academic Search", "/academic", <Search className="w-4 h-4" />, "group-hover:text-rose-400", "academic")}
                {renderNavItem("SEO Analyzer", "/seo-analyzer", <Activity className="w-4 h-4" />, "group-hover:text-green-400", "seo")}
                {renderNavItem("Scheduler", "/scheduler", <CalendarClock className="w-4 h-4" />, "group-hover:text-cyan-400", "scheduler")}
                {renderNavItem("Council Room", "/incubator/council", <Scale className="w-4 h-4" />, "group-hover:text-purple-400", "council-room")}
                {renderNavItem("Skill Armory", "/skills", <IconSkills className="w-4 h-4" />, "group-hover:text-amber-400")}
                {renderNavItem("Fincept Terminal", "/fincept", <TrendingUp className="w-4 h-4" />, "group-hover:text-amber-500", "fincept")}
              </div>
            )}
          </>
        )}

        {/* ── STUDIO ── */}
        {(activeWorkspace === null || activeWorkspace === 'studio') && (
          <>
            {renderSectionHeader("Studio", "studio")}
            {!collapsed.studio && (
              <div className="space-y-0.5">
                {renderNavItem("UI Master", "/ui-master", <Palette className="w-4 h-4" />, "group-hover:text-purple-400", "ui-master")}
                {renderNavItem("Audio Studio", "/audio-studio", <Mic2 className="w-4 h-4" />, "group-hover:text-pink-400", "audio")}
                {renderNavItem("Reel Studio", "/reel-studio", <Clapperboard className="w-4 h-4" />, "group-hover:text-orange-400", "reel")}
                {renderNavItem("Video Gen", "/video-generator", <Video className="w-4 h-4" />, "group-hover:text-sky-400", "video-generator")}
                {renderNavItem("Canvas", "/open-design", <Frame className="w-4 h-4" />, "group-hover:text-sky-400", "canvas")}
                {renderNavItem("App Sandbox", "/incubator/sandbox", <Radio className="w-4 h-4" />, "group-hover:text-amber-400")}
              </div>
            )}
          </>
        )}

        {/* ── MONITOR ── */}
        {(activeWorkspace === null || activeWorkspace === 'monitor') && (
          <>
            {renderSectionHeader("Monitor", "monitor")}
            {!collapsed.monitor && (
              <div className="space-y-0.5">
                {renderNavItem("Telemetry", "/telemetry", <Activity className="w-4 h-4" />, "group-hover:text-emerald-400")}
                {renderNavItem("Mission Logs", "/logs", <ScrollText className="w-4 h-4" />, "group-hover:text-blue-400")}
                {renderNavItem("Diagnostics", "/diagnostics", <Stethoscope className="w-4 h-4" />, "group-hover:text-yellow-400")}
                {renderNavItem("Trading Agents", "/trading-agents", <ArrowRightLeft className="w-4 h-4" />, "group-hover:text-emerald-500", "trading-agents")}
              </div>
            )}
          </>
        )}

        {/* ── CONFIGURE ── */}
        {(activeWorkspace === null || activeWorkspace === 'configure') && (
          <>
            {renderSectionHeader("Configure", "configure")}
            {!collapsed.configure && (
              <div className="space-y-0.5">
                {renderNavItem("Agent Brain", "/neural", <Cpu className="w-4 h-4" />, "group-hover:text-fuchsia-400")}
                {renderNavItem("Memory", "/memory", <Database className="w-4 h-4" />, "group-hover:text-violet-400")}
                {renderNavItem("OpenWiki", "/openwiki", <BookOpen className="w-4 h-4" />, "group-hover:text-indigo-400", "openwiki")}
                {renderNavItem("Settings", "/settings", <IconSettings className="w-4 h-4" />, "group-hover:text-[var(--foreground)]")}
              </div>
            )}
          </>
        )}
      </nav>

      {/* Persistent Neural Link */}
      <div className="mt-4 pt-4 border-t border-[var(--border)]">
        {renderNavItem("Neural Link", "/chat", <MessageSquare className="w-4 h-4" />, "group-hover:text-cyan-400")}
      </div>
      
      <div className="pt-4 border-t border-[var(--border)] mt-auto">
        <div className="glass-card p-3 bg-[var(--surface)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest">Engine Status</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
          </div>
          <StatusBadge status="OPTIMAL" className="w-full justify-center py-0.5" />
        </div>
      </div>
    </aside>
  );
}
