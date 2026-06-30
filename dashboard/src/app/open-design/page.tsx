'use client';

import { motion } from 'framer-motion';
import { Bot, Code2, Paintbrush, Play, Plug, Zap, Send, Settings2, Sparkles, Wand2 } from 'lucide-react';
import { useState } from 'react';

export default function OpenDesignHomeReplica() {
  const [activeSkill, setActiveSkill] = useState('HTML Prototype');
  const [activeSystem, setActiveSystem] = useState('Brand-Grade');
  const [isSkillOpen, setIsSkillOpen] = useState(false);
  const [isSystemOpen, setIsSystemOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--primary)]/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Top Navigation */}
      <header className="flex justify-between items-center p-6 border-b border-white/5 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-white/20 to-transparent border border-white/10 flex items-center justify-center backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold tracking-tight text-lg">Open Design</span>
        </div>

        <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10 backdrop-blur-xl">
          {['Home', 'Automation', 'Design System', 'Plugin', 'Integrations'].map((item) => (
            <button 
              key={item}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                item === 'Home' 
                  ? 'bg-white/10 text-white shadow-sm' 
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors">
            <Settings2 className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--primary)] to-blue-500 border border-white/20" />
        </div>
      </header>

      {/* Main Hero Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-4">
            Pick a skill and a design system, type the brief, and kick off everything from one place.
          </h1>
          <p className="text-lg text-white/50">
            Agent-native UI generation directly constrained by your strict guidelines.
          </p>
        </motion.div>
      </main>

      {/* Bottom Composer */}
      <div className="w-full max-w-4xl mx-auto p-6 relative z-20 pb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl relative"
        >
          {/* Top Controls (Skill & Design System) */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5 relative z-30">
            {/* Skill Selector */}
            <div className="relative">
              <button 
                onClick={() => { setIsSkillOpen(!isSkillOpen); setIsSystemOpen(false); }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors text-sm font-medium text-white/80"
              >
                <Bot className="w-4 h-4 text-emerald-400" />
                {activeSkill}
              </button>
              
              {isSkillOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-[#111] border border-white/10 rounded-xl shadow-2xl py-2 z-50">
                  <div className="px-3 pb-2 mb-2 border-b border-white/5 text-[10px] uppercase tracking-widest text-white/40 font-bold">Available Skills</div>
                  {['HTML Prototype', 'Live Dashboard', 'HyperFrame Video', 'Pitch Deck'].map(skill => (
                    <button
                      key={skill}
                      onClick={() => { setActiveSkill(skill); setIsSkillOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="text-white/20">+</span>

            {/* Design System Selector */}
            <div className="relative">
              <button 
                onClick={() => { setIsSystemOpen(!isSystemOpen); setIsSkillOpen(false); }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors text-sm font-medium text-white/80"
              >
                <Paintbrush className="w-4 h-4 text-blue-400" />
                {activeSystem}
              </button>

              {isSystemOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-[#111] border border-white/10 rounded-xl shadow-2xl py-2 z-50">
                  <div className="px-3 pb-2 mb-2 border-b border-white/5 text-[10px] uppercase tracking-widest text-white/40 font-bold">Design Systems</div>
                  {['Brand-Grade', 'Minimalist', 'Industrial Jack', 'Dating-Web'].map(sys => (
                    <button
                      key={sys}
                      onClick={() => { setActiveSystem(sys); setIsSystemOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      {sys}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Text Area */}
          <div className="relative">
            <textarea 
              className="w-full bg-transparent border-none outline-none resize-none text-white text-lg placeholder:text-white/20 min-h-[120px]"
              placeholder="Describe what you want to build..."
              autoFocus
            />
            
            <div className="absolute bottom-0 right-0 flex items-center gap-2">
              <button className="p-2 text-white/40 hover:text-white transition-colors">
                <Wand2 className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center hover:bg-gray-200 transition-colors shadow-lg">
                <Send className="w-5 h-5 ml-1" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
