"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { StatusBadge } from '../components/StatusBadge';

export default function AudioStudio() {
  const [inputFile, setInputFile] = useState('');
  const [volume, setVolume] = useState(0);
  const [loading, setLoading] = useState(false);
  const [processedFile, setProcessedFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState('');
  const [inputType, setInputType] = useState<'local' | 'link' | 'device'>('local');
  const [assets, setAssets] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetch('/api/assets').then(res => res.json()).then(data => setAssets(data.assets || []));
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setIsUploading(true);
    setLogs(prev => prev + `Uploading ${file.name}...\n`);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      
      if (data.success) {
        setLogs(prev => prev + `Upload complete: ${file.name}\n`);
        setInputFile(`scratch/${file.name}`);
        fetch('/api/assets').then(res => res.json()).then(d => setAssets(d.assets || []));
      } else {
        setLogs(prev => prev + `Upload failed: ${data.error}\n`);
      }
    } catch (err) {
      setLogs(prev => prev + 'Failed to upload file.\n');
    }
    setIsUploading(false);
  };

  const handleProcess = async () => {
    if (!inputFile) return;
    setLoading(true);
    setError(null);
    setLogs('Initializing Audio Processing Engine...\n');

    try {
      const res = await fetch('/api/audio-studio/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputFile, volumeChange: volume })
      });
      const data = await res.json();
      
      if (data.success) {
        setLogs(prev => prev + `Processed audio successfully!\nOutput: ${data.result.output_file}\nDuration: ${data.result.duration_ms}ms\n`);
        setProcessedFile(data.result.output_file);
      } else {
        setError(data.error || 'Failed to process audio');
        setLogs(prev => prev + `Error: ${data.error}\n`);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setLogs(prev => prev + `Critical failure: ${err.message}\n`);
    }
    setLoading(false);
  };

  return (
    <>
      <div className="atmospheric-orb orb-emerald"></div>
      <div className="atmospheric-orb orb-sapphire"></div>
      
      <div className="min-h-screen bg-transparent text-[var(--foreground)] font-sans tracking-tight relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        
        {/* Header */}
        <header className="flex justify-between items-center pb-8 border-b border-[var(--border)]">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/">
                <button className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
              </Link>
              <h1 className="text-2xl font-semibold tracking-tighter text-[var(--foreground)]">
                Audio Engineering Studio
              </h1>
            </div>
            <div className="flex items-center gap-3 ml-8">
              <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest">DSP Engine:</span>
              <StatusBadge status="OPTIMAL" />
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* Controls Panel */}
          <section className="bg-[var(--surface)] border border-[var(--border)] p-8 rounded-xl space-y-6 h-fit relative overflow-hidden group hover:border-[var(--primary)] transition-all">
            <h3 className="text-sm font-bold text-[var(--muted)] uppercase tracking-widest border-b border-[var(--border)] pb-4">Mixer Controls</h3>
            
            <div>
              <div className="flex gap-2 mb-4">
                {['local', 'link', 'device'].map(type => (
                  <button 
                    key={type}
                    onClick={() => { setInputType(type as any); setInputFile(''); }}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-lg transition-colors ${inputType === type ? 'shiny-button active' : 'bg-[var(--background)] text-[var(--muted)] border border-[var(--border)] hover:border-[var(--primary)]'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest mb-3 block">
                {inputType === 'local' ? 'Select Media' : inputType === 'link' ? 'Paste URL' : 'Upload File'}
              </label>

              {inputType === 'local' && (
                <select 
                  value={inputFile}
                  onChange={(e) => setInputFile(e.target.value)}
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors font-mono text-sm"
                >
                  <option value="">-- Select an asset --</option>
                  {assets.filter(a => a.toLowerCase().endsWith('.wav') || a.toLowerCase().endsWith('.mp3') || a.toLowerCase().endsWith('.mp4')).map(asset => (
                    <option key={asset} value={asset}>{asset.split('\\').pop()?.split('/').pop()}</option>
                  ))}
                </select>
              )}

              {inputType === 'link' && (
                <input 
                  type="text" 
                  value={inputFile}
                  onChange={(e) => setInputFile(e.target.value)}
                  placeholder="https://example.com/audio.mp3" 
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--primary)] transition-colors font-mono text-sm"
                />
              )}

              {inputType === 'device' && (
                <div className="border border-dashed border-[var(--border)] rounded-lg p-6 text-center bg-[var(--background)] hover:border-[var(--primary)] transition-colors">
                  <label className="cursor-pointer">
                    <span className="text-[var(--muted)] text-sm font-medium block mb-2">{isUploading ? 'Uploading...' : 'Click to Upload Audio'}</span>
                    <input type="file" className="hidden" accept="audio/*,video/mp4" onChange={handleFileUpload} disabled={isUploading} />
                  </label>
                  {inputFile && !isUploading && <p className="text-[var(--primary)] text-xs mt-2 truncate">{inputFile}</p>}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest mb-3 flex justify-between">
                <span>Gain Adjust (dB)</span>
                <span className={volume > 0 ? 'text-[var(--primary)]' : volume < 0 ? 'text-blue-400' : 'text-[var(--muted)]'}>{volume > 0 ? `+${volume}` : volume} dB</span>
              </label>
              <input 
                type="range" 
                min="-30" 
                max="30" 
                step="1"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full h-1 bg-[var(--border)] rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="pt-4">
              <button 
                onClick={handleProcess}
                disabled={loading || !inputFile}
                className="w-full px-10 py-4 rounded-lg font-bold text-sm disabled:opacity-50 shiny-button"
              >
                {loading ? 'Processing DSP...' : 'Render Audio'}
              </button>
            </div>
            
            {error && <p className="text-red-400 text-sm mt-3 bg-red-400/10 p-3 rounded border border-red-500/20">{error}</p>}
          </section>

          {/* Timeline / Visualizer Mock */}
          <section className="space-y-6 flex flex-col h-full">
            <div className="bg-[var(--surface)] border border-[var(--border)] p-8 rounded-xl min-h-[300px] flex flex-col justify-center items-center relative overflow-hidden group hover:border-[var(--primary)] transition-all">
               <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)]/80 to-transparent pointer-events-none z-10" />
               
               {/* Waveform Mock UI */}
               <div className="absolute inset-0 flex items-center justify-center opacity-30 gap-1 px-4">
                 {[...Array(50)].map((_, i) => (
                   <div key={i} className="w-2 bg-[var(--primary)] rounded-full" style={{ height: `${Math.random() * 80 + 10}%`, transition: 'height 0.2s ease' }} />
                 ))}
               </div>

               <div className="relative z-20 text-center space-y-4">
                 {processedFile ? (
                   <>
                     <span className="text-xs font-bold text-[var(--primary)] uppercase tracking-widest flex items-center justify-center gap-2 mb-4">
                        <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse"></span>
                        Render Complete
                     </span>
                     <p className="text-sm text-[var(--muted)] font-mono mb-4 bg-[var(--background)]/50 p-2 rounded border border-[var(--border)]">{processedFile.split('\\').pop()?.split('/').pop()}</p>
                     
                     <audio controls src={`/api/video?path=${encodeURIComponent(processedFile)}`} className="filter invert-[0.9] grayscale mx-auto" />
                   </>
                 ) : (
                   <>
                     <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest flex items-center justify-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[var(--faint)] animate-pulse"></span>
                        Awaiting Input
                     </span>
                     <p className="text-sm text-[var(--muted)] font-mono">Select a file and process to visualize.</p>
                   </>
                 )}
               </div>
            </div>

            {/* Terminal */}
            <div className="bg-[var(--background)] p-4 relative overflow-hidden group border-beam mt-auto flex-1">
               <h3 className="text-xs text-[var(--muted)] uppercase tracking-widest font-mono mb-3">DSP Engine Logs</h3>
               <pre className="text-xs text-[var(--faint)] whitespace-pre-wrap max-h-32 overflow-y-auto font-mono scrollbar-hide min-h-[4rem]">
                 {logs || "Ready."}
               </pre>
            </div>
          </section>

        </main>

      </div>
    </div>
    </>
  );
}
