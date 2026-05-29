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
    <div className="min-h-screen bg-[#000000] text-gray-100 font-sans tracking-tight">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        
        {/* Header */}
        <header className="flex justify-between items-center pb-8 border-b border-white/10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/">
                <button className="text-gray-500 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
              </Link>
              <h1 className="text-2xl font-semibold tracking-tighter text-white">
                Audio Engineering Studio
              </h1>
            </div>
            <div className="flex items-center gap-3 ml-8">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">DSP Engine:</span>
              <StatusBadge status="OPTIMAL" />
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* Controls Panel */}
          <section className="bg-[#111] border border-white/10 p-8 rounded-xl space-y-6 h-fit">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-white/10 pb-4">Mixer Controls</h3>
            
            <div>
              <div className="flex gap-2 mb-4">
                {['local', 'link', 'device'].map(type => (
                  <button 
                    key={type}
                    onClick={() => { setInputType(type as any); setInputFile(''); }}
                    className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-widest rounded transition-colors ${inputType === type ? 'bg-white text-black' : 'bg-black text-gray-500 border border-white/10 hover:border-white/30'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block">
                {inputType === 'local' ? 'Select Media' : inputType === 'link' ? 'Paste URL' : 'Upload File'}
              </label>

              {inputType === 'local' && (
                <select 
                  value={inputFile}
                  onChange={(e) => setInputFile(e.target.value)}
                  className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/50 transition-colors font-mono text-sm"
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
                  className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/50 transition-colors font-mono text-sm"
                />
              )}

              {inputType === 'device' && (
                <div className="border border-dashed border-white/20 rounded-lg p-6 text-center bg-black hover:border-white/50 transition-colors">
                  <label className="cursor-pointer">
                    <span className="text-gray-400 text-sm font-medium block mb-2">{isUploading ? 'Uploading...' : 'Click to Upload Audio'}</span>
                    <input type="file" className="hidden" accept="audio/*,video/mp4" onChange={handleFileUpload} disabled={isUploading} />
                  </label>
                  {inputFile && !isUploading && <p className="text-green-400 text-xs mt-2 truncate">{inputFile}</p>}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex justify-between">
                <span>Gain Adjust (dB)</span>
                <span className={volume > 0 ? 'text-green-400' : volume < 0 ? 'text-blue-400' : 'text-gray-500'}>{volume > 0 ? `+${volume}` : volume} dB</span>
              </label>
              <input 
                type="range" 
                min="-30" 
                max="30" 
                step="1"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="pt-4">
              <button 
                onClick={handleProcess}
                disabled={loading || !inputFile}
                className="w-full bg-white text-black px-8 py-3 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing DSP...' : 'Render Audio'}
              </button>
            </div>
            
            {error && <p className="text-red-400 text-sm mt-3 bg-red-400/10 p-3 rounded">{error}</p>}
          </section>

          {/* Timeline / Visualizer Mock */}
          <section className="space-y-6">
            <div className="bg-[#111] border border-white/10 p-8 rounded-xl min-h-[300px] flex flex-col justify-center items-center relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-10" />
               
               {/* Waveform Mock UI */}
               <div className="absolute inset-0 flex items-center justify-center opacity-30 gap-1 px-4">
                 {[...Array(50)].map((_, i) => (
                   <div key={i} className="w-2 bg-indigo-500 rounded-full" style={{ height: `${Math.random() * 80 + 10}%`, transition: 'height 0.2s ease' }} />
                 ))}
               </div>

               <div className="relative z-20 text-center space-y-4">
                 {processedFile ? (
                   <>
                     <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest flex items-center justify-center gap-2 mb-4">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Render Complete
                     </span>
                     <p className="text-xs text-gray-400 font-mono mb-4 bg-black/50 p-2 rounded">{processedFile.split('\\').pop()?.split('/').pop()}</p>
                     
                     {/* Web Playback endpoint is assumed to be /api/audio?v=timestamp or direct static path if mounted */}
                     <audio controls src={`/api/video?path=${encodeURIComponent(processedFile)}`} className="filter invert-[0.9] grayscale mx-auto" />
                   </>
                 ) : (
                   <>
                     <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center justify-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                        Awaiting Input
                     </span>
                     <p className="text-xs text-gray-500 font-mono">Select a file and process to visualize.</p>
                   </>
                 )}
               </div>
            </div>

            {/* Terminal */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-4">
               <h3 className="text-xs text-gray-500 uppercase tracking-widest font-mono mb-3">DSP Engine Logs</h3>
               <pre className="text-[11px] text-gray-400 whitespace-pre-wrap max-h-32 overflow-y-auto font-mono scrollbar-hide min-h-[4rem]">
                 {logs || "Ready."}
               </pre>
            </div>
          </section>

        </main>

      </div>
    </div>
  );
}
