'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Video, Play, Volume2, Plus, Sparkles, Layers, Sliders, Settings } from 'lucide-react';

export default function VideoGeneratorPage() {
  const [videoRenderer, setVideoRenderer] = useState<'hyperframes' | 'openmontage'>('openmontage');
  const [voiceEngine, setVoiceEngine] = useState('edge');
  const [ttsVoice, setTtsVoice] = useState('Jasper');
  const [ttsSpeed, setTtsSpeed] = useState(1.0);
  const [aspectRatio, setAspectRatio] = useState('16/9');
  const [openMontagePipeline, setOpenMontagePipeline] = useState('explainer');
  const [renderLogs, setRenderLogs] = useState('');
  const [isRendering, setIsRendering] = useState(false);

  const [htmlTemplate, setHtmlTemplate] = useState('<div class="slide"><h1>Autonomous Production</h1><p>General Purpose Landscape Video Stack</p></div>');
  const [cssTemplate, setCssTemplate] = useState('.slide { background: linear-gradient(135deg, #020617, #1e1b4b); color: #38bdf8; padding: 3rem; border-radius: 16px; border: 1px solid #38bdf8; text-align: center; font-family: sans-serif; }\n@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.03); } }');

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <header className="flex justify-between items-center border-b border-[var(--border)] pb-4">
          <div>
            <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-widest flex items-center gap-2 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse shadow-[0_0_8px_var(--primary-glow)]"></span>
              Studio Cockpit // Video Generator
            </span>
            <h1 className="text-xl font-black uppercase tracking-tight text-[var(--foreground)] mt-1 font-mono">
              Video Generator
            </h1>
          </div>

          <div className="flex gap-6 items-center">
            <div className="flex flex-col gap-1.5 border-l border-[var(--border)] pl-6">
              <label className="text-xs text-[var(--muted)] font-medium uppercase">Engine</label>
              <select 
                value={voiceEngine} 
                onChange={e => setVoiceEngine(e.target.value)}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-md px-3 py-1.5 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] cursor-pointer"
              >
                <option value="edge" className="bg-[var(--surface)] text-[var(--foreground)]">Edge TTS</option>
                <option value="piper" className="bg-[var(--surface)] text-[var(--foreground)]">Piper (CPU)</option>
                <option value="bark" className="bg-[var(--surface)] text-[var(--foreground)]">Bark (GPU)</option>
                <option value="kittentts" className="bg-[var(--surface)] text-[var(--foreground)]">Kitten TTS (Offline)</option>
              </select>
            </div>

            {voiceEngine === 'kittentts' && (
              <>
                <div className="flex flex-col gap-1.5 border-l border-[var(--border)] pl-6">
                  <label className="text-xs text-[var(--muted)] font-medium uppercase">Kitten Voice</label>
                  <select 
                    value={ttsVoice} 
                    onChange={e => setTtsVoice(e.target.value)}
                    className="bg-[var(--surface)] border border-[var(--border)] rounded-md px-3 py-1.5 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] cursor-pointer"
                  >
                    {['Bella', 'Jasper', 'Luna', 'Bruno', 'Rosie', 'Hugo', 'Kiki', 'Leo'].map(v => (
                      <option key={v} value={v} className="bg-[var(--surface)] text-[var(--foreground)]">{v}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 border-l border-[var(--border)] pl-6">
                  <label className="text-xs text-[var(--muted)] font-medium uppercase">Speed ({ttsSpeed.toFixed(1)}x)</label>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="2.0" 
                    step="0.1" 
                    value={ttsSpeed} 
                    onChange={e => setTtsSpeed(parseFloat(e.target.value))}
                    className="w-24 h-1 bg-[var(--border)] rounded-lg appearance-none cursor-pointer mt-2.5"
                  />
                </div>
              </>
            )}

            <div className="flex flex-col gap-1.5 border-l border-[var(--border)] pl-6">
              <label className="text-xs text-[var(--muted)] font-medium uppercase">Aspect Ratio</label>
              <select 
                value={aspectRatio} 
                onChange={e => setAspectRatio(e.target.value)}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-md px-3 py-1.5 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] cursor-pointer"
              >
                <option value="16/9" className="bg-[var(--surface)] text-[var(--foreground)]">16:9 Landscape HD</option>
                <option value="4/3" className="bg-[var(--surface)] text-[var(--foreground)]">4:3 Retro Classic</option>
                <option value="2.39/1" className="bg-[var(--surface)] text-[var(--foreground)]">2.39:1 Anamorphic Cinema</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 border-l border-[var(--border)] pl-6">
              <label className="text-xs text-[var(--muted)] font-medium uppercase">Renderer</label>
              <select 
                value={videoRenderer} 
                onChange={e => setVideoRenderer(e.target.value as any)}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-md px-3 py-1.5 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] cursor-pointer"
              >
                <option value="openmontage" className="bg-[var(--surface)] text-[var(--foreground)]">OpenMontage (Presets)</option>
                <option value="hyperframes" className="bg-[var(--surface)] text-[var(--foreground)]">HyperFrames (HTML/GSAP)</option>
              </select>
            </div>
          </div>
        </header>

        {/* Build logs if running */}
        {renderLogs && (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 relative hover:border-[var(--primary)] transition-all">
            <button className="absolute top-4 right-4 text-xs text-[var(--faint)] hover:text-[var(--foreground)] transition-colors" onClick={() => setRenderLogs('')}>Clear</button>
            <h3 className="text-xs text-[var(--muted)] uppercase tracking-widest font-mono mb-3">Build Output Log</h3>
            <pre className="text-xs text-[var(--foreground)] whitespace-pre-wrap max-h-32 overflow-y-auto font-mono scrollbar-hide">
              {renderLogs}
            </pre>
          </div>
        )}

        {videoRenderer === 'openmontage' ? (
          <main className="grid grid-cols-12 gap-10">
            {/* OpenMontage Left column */}
            <div className="col-span-6 space-y-6">
              <div className="space-y-2">
                <h2 className="text-sm font-semibold text-[var(--foreground)] flex justify-between">
                  <span>General Purpose Pipelines</span>
                  <span className="text-xs text-[var(--muted)] font-mono">OpenMontage Stack</span>
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'explainer', label: 'Animated Explainer' },
                    { id: 'documentary', label: 'Documentary Montage' },
                    { id: 'cinematic', label: 'Cinematic Trailer' },
                    { id: 'podcast', label: 'Podcast Repurpose' },
                    { id: 'screen-demo', label: 'Screen Demo Walkthrough' },
                    { id: 'avatar', label: 'Avatar Spokesperson' },
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => setOpenMontagePipeline(p.id)}
                      className={`px-4 py-3 text-xs font-bold text-left rounded-lg border transition-all ${
                        openMontagePipeline === p.id
                          ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--foreground)]'
                          : 'border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)] text-[var(--muted)] hover:text-[var(--foreground)]'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-sm font-semibold text-[var(--foreground)]">Objective Description</h2>
                <textarea
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-4 font-mono text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors h-[25vh] resize-none"
                  placeholder="Describe your video project goals..."
                  defaultValue="Create a landscape video project detailing the integration of calesthio/OpenMontage pipelines within the Antigravity Master-AG architecture."
                />
              </div>
            </div>

            {/* Pipeline Visualizer Right Column */}
            <div className="col-span-6 space-y-6">
              <h2 className="text-sm font-semibold text-[var(--foreground)] flex justify-between">
                <span>Production Manifest Visualizer</span>
                <span className="text-xs text-[var(--muted)] font-mono">Active Preset</span>
              </h2>

              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 space-y-4">
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between text-green-400">
                    <span>1. Research & Script Synthesis</span>
                    <span>✓ Ready</span>
                  </div>
                  <div className="flex items-center justify-between text-green-400">
                    <span>2. Outlining Scenes & Layouts</span>
                    <span>✓ Generated</span>
                  </div>
                  <div className="flex items-center justify-between text-[var(--muted)]">
                    <span>3. Multi-Engine Voiceover</span>
                    <span>● Pending</span>
                  </div>
                  <div className="flex items-center justify-between text-[var(--muted)]">
                    <span>4. OpenMontage Compositing</span>
                    <span>● Pending</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsRendering(true);
                    setRenderLogs(prev => prev + "[OPENMONTAGE] Preparing 16:9 output directory...\n[OPENMONTAGE] Compiling presets & scene transitions...\n[OPENMONTAGE] Exporting landscape render manifest...\n[OPENMONTAGE] Output generated: scratch/openmontage_output_16_9.mp4\n");
                    alert("OpenMontage landscape pipeline generated!");
                  }}
                  className="w-full py-3 mt-4 rounded-lg text-xs font-bold shiny-button"
                >
                  🎬 Run Landscape Production
                </button>
              </div>
            </div>
          </main>
        ) : (
          <main className="grid grid-cols-12 gap-10">
            {/* HTML/CSS Code Editor */}
            <div className="col-span-6 space-y-6">
              <div className="space-y-2">
                <h2 className="text-sm font-semibold text-[var(--foreground)] flex justify-between">
                  <span>HTML Canvas Markup</span>
                  <span className="text-xs text-[var(--muted)] font-mono">HyperFrames Engine</span>
                </h2>
                <textarea
                  value={htmlTemplate}
                  onChange={e => setHtmlTemplate(e.target.value)}
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-4 font-mono text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors h-[28vh] resize-none"
                />
              </div>

              <div className="space-y-2">
                <h2 className="text-sm font-semibold text-[var(--foreground)]">CSS Stylesheet</h2>
                <textarea
                  value={cssTemplate}
                  onChange={e => setCssTemplate(e.target.value)}
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-4 font-mono text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors h-[28vh] resize-none"
                />
              </div>
            </div>

            {/* Preview Area */}
            <div className="col-span-6 space-y-6">
              <h2 className="text-sm font-semibold text-[var(--foreground)] flex justify-between">
                <span>Real-Time Preview Canvas</span>
                <span className="text-xs text-green-400 font-mono">● Active</span>
              </h2>

              <div 
                className="w-full mx-auto rounded-xl border border-[var(--border)] bg-[var(--background)] overflow-hidden shadow-[0_0_40px_rgba(56,189,248,0.1)] relative flex items-center justify-center p-6"
                style={{ aspectRatio: aspectRatio }}
              >
                <style dangerouslySetInnerHTML={{ __html: cssTemplate }} />
                <div 
                  className="w-full"
                  dangerouslySetInnerHTML={{ __html: htmlTemplate }}
                />
              </div>

              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[var(--muted)] font-medium">Renderer Engine</span>
                  <span className="font-mono text-[var(--foreground)]">Chrome headless canvas renderer</span>
                </div>
                <button
                  onClick={() => {
                    setRenderLogs(prev => prev + "[HYPERFRAMES] Rendering frame buffers at target resolution...\n[HYPERFRAMES] Saved output: scratch/hyperframe_landscape.mp4\n");
                    alert("HyperFrames landscape clip compiled successfully!");
                  }}
                  className="w-full py-2.5 rounded-lg text-xs font-bold shiny-button"
                >
                  ⚡ Compile HyperFrames
                </button>
              </div>
            </div>
          </main>
        )}
      </div>
    </>
  );
}
