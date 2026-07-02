"use client";

import { useEffect, useState, useRef } from 'react';
import { Play, Pause, Square, Wand2, Upload, FileAudio, Video, Search, Type, Image as ImageIcon, Download, Settings, Trash2, Edit3, Flame, PenTool } from 'lucide-react';

interface Segment {
  text: string;
  start: number;
  end: number;
  clip_path: string;
}

interface Timeline {
  segments: Segment[];
}

export default function Studio() {
  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [selectedSegmentIdx, setSelectedSegmentIdx] = useState<number | null>(null);
  const [assets, setAssets] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(() => Date.now());
  
  // Render State
  const [renderProfile, setRenderProfile] = useState('FastViral');
  const [voiceEngine, setVoiceEngine] = useState('edge');
  const [ttsVoice, setTtsVoice] = useState('Jasper');
  const [ttsSpeed, setTtsSpeed] = useState(1.0);
  const [scriptInputType, setScriptInputType] = useState<'auto' | 'topic' | 'script'>('auto');
  const [topicInput, setTopicInput] = useState('');
  const [scriptInput, setScriptInput] = useState('');
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Avatar Settings
  const [enableAvatar, setEnableAvatar] = useState(false);
  const [avatarImagePath, setAvatarImagePath] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  
  // Viral topic picker
  const [trendingTopics, setTrendingTopics] = useState<{topic: string; traffic: string}[]>([]);
  const [selectedViralTopic, setSelectedViralTopic] = useState<string | null>(null);
  const [isFetchingTrends, setIsFetchingTrends] = useState(false);
  
  // Media Editor State
  const [editingAsset, setEditingAsset] = useState<string | null>(null);
  const [editRotate, setEditRotate] = useState(0);
  const [editBrightness, setEditBrightness] = useState(1.0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  
  // History State
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const [renderLogs, setRenderLogs] = useState('');
  
  // Audio Player
  const audioRef = useRef<HTMLAudioElement>(null);

  const fetchHistory = async () => {
    const data = await fetch('/api/history/list').then(res => res.json());
    setHistory(data.versions || []);
  };

  useEffect(() => {
    Promise.all([
      fetch('/api/timeline').then(res => res.json()),
      fetch('/api/assets').then(res => res.json())
    ]).then(([timelineData, assetsData]) => {
      setTimeline(timelineData);
      setAssets(assetsData.assets || []);
      setLoading(false);
      fetchHistory();
    });
  }, []);

  const handleProcessMedia = async () => {
    if (!editingAsset) return;
    setIsProcessing(true);
    setRenderLogs(`Processing ${editingAsset}...\n`);
    
    try {
      const res = await fetch('/api/process-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filePath: editingAsset,
          rotate: editRotate,
          brightness: editBrightness
        }),
      });
      const data = await res.json();
      
      if (data.success) {
        setRenderLogs(prev => prev + `Processing complete.\n`);
        setEditingAsset(null);
        setEditRotate(0);
        setEditBrightness(1.0);
        // Add cache busting param to force video reload
        setAssets([...assets]);
        setRefreshKey(Date.now());
      } else {
        setRenderLogs(prev => prev + `Processing failed: ${data.error}\n`);
      }
    } catch (err) {
      setRenderLogs(prev => prev + 'Failed to process media.\n');
    }
    
    setIsProcessing(false);
  };

  const handleSave = async () => {
    if (!timeline) return;
    await fetch('/api/timeline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(timeline),
    });
    // Trigger history backup
    await fetch('/api/history/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ engine: voiceEngine, profile: renderProfile }),
    });
    fetchHistory();
    alert('Timeline saved successfully!');
  };

  const handleFetchTrends = async () => {
    setIsFetchingTrends(true);
    setSelectedViralTopic(null);
    try {
      const data = await fetch('/api/trending').then(r => r.json());
      setTrendingTopics(data.topics || []);
    } catch {
      setRenderLogs(prev => prev + 'Failed to fetch trending topics.\n');
    }
    setIsFetchingTrends(false);
  };

  const handleGenerateVoice = async () => {
    setIsGeneratingVoice(true);
    setRenderLogs(`Initiating voice generation using ${voiceEngine}...\n`);
    try {
      const body: Record<string, any> = { 
        engine: voiceEngine, 
        mode: scriptInputType,
        voice: ttsVoice,
        speed: ttsSpeed
      };
      if (scriptInputType === 'auto' && selectedViralTopic) body.viralTopic = selectedViralTopic;
      if (scriptInputType === 'topic' && topicInput) body.topic = topicInput;
      if (scriptInputType === 'script' && scriptInput) body.script = scriptInput;

      const res = await fetch('/api/generate-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setRenderLogs(prev => prev + 'Voice & Timeline generated successfully!\n' + data.logs);
        // Trigger history backup
        await fetch('/api/history/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ engine: voiceEngine, profile: renderProfile }),
        });
        const [timelineData, assetsData] = await Promise.all([
          fetch('/api/timeline').then(res => res.json()),
          fetch('/api/assets').then(res => res.json())
        ]);
        setTimeline(timelineData);
        setAssets(assetsData.assets || []);
        fetchHistory();
        setRefreshKey(Date.now());
      } else {
        setRenderLogs(prev => prev + 'Error:\n' + data.error + '\n' + data.details);
      }
    } catch (err) {
      setRenderLogs(prev => prev + 'Failed to trigger voice generation.\n');
    }
    setIsGeneratingVoice(false);
  };

  const handleRender = async () => {
    setIsRendering(true);
    setRenderLogs('Initiating render...\n');
    try {
      const res = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            profile: renderProfile, 
            enableAvatar, 
            avatarImagePath 
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRenderLogs(prev => prev + 'Render Complete!\n' + data.logs);
        alert('Video rendered successfully! Check scratch/final_output.mp4');
      } else {
        setRenderLogs(prev => prev + 'Render Error:\n' + data.error + '\n' + data.details);
      }
    } catch (err) {
      setRenderLogs(prev => prev + 'Failed to trigger render.\n');
    }
    setIsRendering(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setIsUploading(true);
    setRenderLogs(`Uploading ${file.name}...\n`);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (data.success) {
        setRenderLogs(prev => prev + `Upload complete: ${file.name}\n`);
        // Refresh assets list
        const assetsData = await fetch('/api/assets').then(res => res.json());
        setAssets(assetsData.assets || []);
      } else {
        setRenderLogs(prev => prev + `Upload failed: ${data.error}\n`);
      }
    } catch (err) {
      setRenderLogs(prev => prev + 'Failed to upload file.\n');
    }
    
    setIsUploading(false);
    // Reset file input
    e.target.value = '';
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setIsUploadingAvatar(true);
    setRenderLogs(`Uploading Presenter Face: ${file.name}...\n`);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'avatar');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (data.success) {
        setRenderLogs(prev => prev + `Face upload complete: ${file.name}\n`);
        setAvatarImagePath(data.filePath);
      } else {
        setRenderLogs(prev => prev + `Upload failed: ${data.error}\n`);
      }
    } catch (err) {
      setRenderLogs(prev => prev + 'Failed to upload file.\n');
    }
    
    setIsUploadingAvatar(false);
    e.target.value = '';
  };

  const updateSegmentClip = (clip_path: string) => {
    if (selectedSegmentIdx !== null && timeline) {
      const newTimeline = { ...timeline };
      newTimeline.segments[selectedSegmentIdx].clip_path = clip_path;
      setTimeline(newTimeline);
    }
  };

  const updateSegmentText = (newText: string) => {
    if (selectedSegmentIdx !== null && timeline) {
      const newTimeline = { ...timeline };
      newTimeline.segments[selectedSegmentIdx].text = newText;
      setTimeline(newTimeline);
    }
  };

  const playSegment = (start: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = start;
      audioRef.current.play();
    }
  };

  const handleVideoHover = (e: React.MouseEvent<HTMLVideoElement>) => {
    e.currentTarget.play().catch(() => {});
  };

  const handleVideoLeave = (e: React.MouseEvent<HTMLVideoElement>) => {
    e.currentTarget.pause();
    e.currentTarget.currentTime = 0;
  };

  const handleRestoreVersion = async (id: string) => {
    const res = await fetch('/api/history/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      window.location.reload();
    }
  };

  const handlePinVersion = async (id: string) => {
    await fetch('/api/history/pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchHistory();
  };

  if (loading) {
    return <div className="min-h-screen bg-[var(--background)] flex items-center justify-center text-[var(--foreground)] font-mono text-sm">Loading Environment...</div>;
  }

  return (
    <>
      <div className="atmospheric-orb orb-emerald"></div>
      <div className="atmospheric-orb orb-sapphire"></div>
      <div className="min-h-screen bg-transparent text-[var(--foreground)] font-sans tracking-tight relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        
        {/* Minimal Header */}
        <header className="flex justify-between items-center pb-8 border-b border-[var(--border)]">
          <div>
            <h1 className="text-2xl font-semibold tracking-tighter text-[var(--foreground)]">
              Studio Workspace
            </h1>
            <div className="mt-4 flex items-center gap-4">
              <span className="flex items-center gap-2 text-xs text-[var(--muted)] font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span> Online
              </span>
              <audio ref={audioRef} controls src={`/api/audio?v=${refreshKey}`} className="h-6 opacity-60 hover:opacity-100 transition-opacity filter invert-[0.9] grayscale" />
            </div>


          </div>
          
          <div className="flex gap-6 items-center relative">
            
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
            
            <button 
              onClick={handleGenerateVoice}
              disabled={isGeneratingVoice || isRendering}
              className="mt-5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors disabled:opacity-50"
            >
              {isGeneratingVoice ? 'Generating...' : 'Regenerate Voice'}
            </button>



            <div className="flex flex-col gap-1.5 border-l border-[var(--border)] pl-6">
              <label className="text-xs text-[var(--muted)] font-medium uppercase">Profile</label>
              <select 
                value={renderProfile} 
                onChange={e => setRenderProfile(e.target.value)}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-md px-3 py-1.5 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] cursor-pointer"
              >
                <option value="FastViral" className="bg-[var(--surface)] text-[var(--foreground)]">FastViral</option>
                <option value="CorporateClean" className="bg-[var(--surface)] text-[var(--foreground)]">CorporateClean</option>
              </select>
            </div>
            
            <button 
              onClick={handleSave}
              className="mt-5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              Save Timeline
            </button>
            <button 
              onClick={handleRender}
              disabled={isRendering || isGeneratingVoice}
              className="mt-5 px-8 py-2 rounded-md text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed shiny-button"
            >
              {isRendering ? 'Rendering...' : 'Build Video'}
            </button>
          </div>
        </header>

        {/* Content Generation Control Panel */}
        <section className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 space-y-4 hover:border-[var(--primary)] transition-all">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Content Generation</h2>
            <div className="flex gap-2">
              {(['auto', 'topic', 'script'] as const).map(type => (
                <button 
                  key={type}
                  onClick={() => { setScriptInputType(type); setSelectedViralTopic(null); setTrendingTopics([]); }}
                  className={`px-6 py-2 text-xs font-bold uppercase tracking-widest rounded transition-colors ${scriptInputType === type ? 'shiny-button active' : 'bg-[var(--background)] text-[var(--muted)] border border-[var(--border)] hover:border-[var(--primary)]'}`}
                >
                  {type === 'auto' ? <span className="flex items-center gap-1"><Flame size={12}/> Viral</span> : type === 'topic' ? <span className="flex items-center gap-1"><Search size={12}/> Topic</span> : <span className="flex items-center gap-1"><PenTool size={12}/> Script</span>}
                </button>
              ))}
            </div>
          </div>

          {/* VIRAL AUTO: fetch + pick a trending topic */}
          {scriptInputType === 'auto' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleFetchTrends}
                  disabled={isFetchingTrends}
                  className="flex items-center gap-2 px-6 py-2 text-xs font-bold bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 border border-[var(--primary)]/30 text-[var(--primary)] rounded-lg transition-colors disabled:opacity-50"
                >
                  {isFetchingTrends ? (
                    <><div className="w-3 h-3 border border-[var(--primary)] border-t-transparent rounded-full animate-spin" /> Fetching...</>
                  ) : (
                    <>⚡ Fetch Today&apos;s Trending Topics</>
                  )}
                </button>
                {selectedViralTopic && (
                  <span className="text-xs text-green-400 font-mono">✓ Ready — hit Regenerate Voice</span>
                )}
              </div>
              {trendingTopics.length > 0 && (
                <div className="space-y-2">
                  {trendingTopics.map((t, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedViralTopic(t.topic)}
                      className={`w-full text-left px-4 py-3 rounded-lg text-xs border transition-all ${
                        selectedViralTopic === t.topic
                          ? 'border-[var(--primary)]/60 bg-[var(--primary)]/10 text-[var(--foreground)]'
                          : 'border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)] text-[var(--muted)] hover:text-[var(--foreground)]'
                      }`}
                    >
                      <span className="text-[var(--muted)] mr-2 font-mono">#{i+1}</span>
                      {t.topic.replace(/^TIL\s*(that)?\s*/i, '')}
                    </button>
                  ))}
                </div>
              )}
              {trendingTopics.length === 0 && !isFetchingTrends && (
                <p className="text-xs text-[var(--faint)] font-mono">Hit &quot;Fetch&quot; to load today&apos;s top Reddit facts and pick one.</p>
              )}
            </div>
          )}

          {/* TOPIC: custom search term → social scraping */}
          {scriptInputType === 'topic' && (
            <div className="space-y-2">
              <input 
                type="text" 
                value={topicInput}
                onChange={e => setTopicInput(e.target.value)}
                placeholder="Enter a topic (e.g. The history of AI, Space exploration)" 
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--faint)] focus:outline-none focus:border-[var(--primary)] transition-colors font-mono text-sm"
              />
              <p className="text-xs text-[var(--faint)] font-mono">Agent will search Reddit + Twitter/TikTok for the most viral post on this topic and build a hook from it.</p>
            </div>
          )}

          {/* SCRIPT: verbatim */}
          {scriptInputType === 'script' && (
            <div className="space-y-2">
              <textarea 
                value={scriptInput}
                onChange={e => setScriptInput(e.target.value)}
                placeholder="Paste your exact script here — read word for word by the AI voice." 
                rows={4}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--faint)] focus:outline-none focus:border-[var(--primary)] transition-colors font-mono text-sm resize-none"
              />
              <p className="text-xs text-[var(--faint)] font-mono">No scraping. Your exact words go straight into the voice engine.</p>
            </div>
          )}
          
          <div className="pt-4 border-t border-[var(--border)] mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <div className={`w-10 h-5 rounded-full p-1 transition-colors ${enableAvatar ? 'bg-[var(--primary)]' : 'bg-[var(--surface)] border border-[var(--border)]'}`}>
                  <div className={`bg-white w-3 h-3 rounded-full transition-transform ${enableAvatar ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
                <span className="text-xs font-semibold text-[var(--foreground)]">Enable Split-Screen Avatar</span>
              </label>
              <input type="checkbox" className="hidden" checked={enableAvatar} onChange={() => setEnableAvatar(!enableAvatar)} />
            </div>
            
            {enableAvatar && (
              <div className="flex items-center gap-3">
                {avatarImagePath && (
                  <span className="text-xs text-green-400 font-mono">✓ Face Ready</span>
                )}
                <label className="cursor-pointer px-6 py-2 text-xs font-bold rounded flex items-center gap-2 shiny-button">
                  {isUploadingAvatar ? 'Uploading...' : 'Upload Presenter Face (PNG/JPG)'}
                  <input type="file" className="hidden" accept="image/jpeg,image/png" onChange={handleAvatarUpload} disabled={isUploadingAvatar} />
                </label>
              </div>
            )}
          </div>
        </section>


        {/* Minimal Terminal Log */}
        {(isRendering || isGeneratingVoice || renderLogs) && (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 relative hover:border-[var(--primary)] transition-all">
            <button className="absolute top-4 right-4 text-xs text-[var(--faint)] hover:text-[var(--foreground)] transition-colors" onClick={() => setRenderLogs('')}>Clear</button>
            <h3 className="text-xs text-[var(--muted)] uppercase tracking-widest font-mono mb-3">Build Output</h3>
            <pre className="text-xs text-[var(--foreground)] whitespace-pre-wrap max-h-32 overflow-y-auto font-mono scrollbar-hide">
              {renderLogs || "Waiting for signal..."}
            </pre>
          </div>
        )}

        <main className="grid grid-cols-12 gap-10">
            
            {/* Structured Timeline Editor */}
            <div className="col-span-6 space-y-4">
              <h2 className="text-sm font-semibold text-[var(--foreground)]">
                Sequence Editor
              </h2>
              
              <div className="flex flex-col gap-2 overflow-y-auto h-[60vh] pr-2 scrollbar-thin scrollbar-thumb-[var(--border)]">
                {timeline?.segments.map((seg, idx) => (
                  <div 
                    key={idx} 
                    className={`relative p-4 rounded-md cursor-pointer transition-all border ${
                      selectedSegmentIdx === idx 
                        ? 'border-[var(--primary)] bg-[var(--surface)] z-10' 
                        : 'border-[var(--border)] hover:border-[var(--primary)] bg-[var(--background)]'
                    }`}
                    onClick={() => {
                      setSelectedSegmentIdx(idx);
                      playSegment(seg.start);
                    }}
                  >
                    <div className="flex items-center gap-4 mb-2">
                      <span className="font-mono text-xs text-[var(--faint)]">
                        {seg.start.toFixed(2)}s &rarr; {seg.end.toFixed(2)}s
                      </span>
                      <span className="text-xs bg-[var(--background)] text-[var(--foreground)] px-2 py-0.5 rounded border border-[var(--border)] truncate max-w-[150px]">
                        {seg.clip_path.split('\\').pop()?.split('/').pop()}
                      </span>
                    </div>
                    
                    {selectedSegmentIdx === idx ? (
                       <textarea 
                         className="w-full bg-[var(--background)] border border-[var(--border)] rounded text-sm text-[var(--foreground)] p-2 mt-1 focus:outline-none focus:border-[var(--primary)] resize-none transition-colors"
                         rows={2}
                         value={seg.text}
                         onChange={(e) => updateSegmentText(e.target.value)}
                         onClick={(e) => e.stopPropagation()}
                       />
                    ) : (
                      <p className="text-sm text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors">{seg.text}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Clean Video Asset Gallery */}
            <div className="col-span-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[var(--foreground)]">
                  Media Library
                </h2>
                
                <div className="flex items-center gap-3">
                  {selectedSegmentIdx !== null && (
                    <span className="text-xs text-[var(--muted)] font-mono">Targeting Sequence {selectedSegmentIdx + 1}</span>
                  )}
                  <label className="cursor-pointer bg-[var(--surface)] hover:bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-2">
                    {isUploading ? (
                      <span className="flex items-center gap-1"><div className="w-2 h-2 border border-[var(--primary)] border-t-transparent rounded-full animate-spin"/> Uploading...</span>
                    ) : (
                      <>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        Upload Media
                      </>
                    )}
                    <input type="file" className="hidden" accept="video/mp4,image/jpeg,image/png" onChange={handleFileUpload} disabled={isUploading} />
                  </label>
                </div>
              </div>
              
              {selectedSegmentIdx !== null ? (
                <div className="h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--border)] pr-2">
                  <div className="grid grid-cols-3 gap-4">
                    {assets.map((asset, i) => {
                      const isSelected = timeline?.segments[selectedSegmentIdx].clip_path === asset;
                      // Encode path for query parameter securely
                      const videoUrl = `/api/video?path=${encodeURIComponent(asset)}`;
                      
                      return (
                        <div 
                          key={i}
                          onClick={() => updateSegmentClip(asset)}
                          className={`group relative aspect-[9/16] rounded-md cursor-pointer overflow-hidden border transition-colors ${
                            isSelected 
                              ? 'border-[var(--primary)] shadow-[0_0_15px_var(--primary)]' 
                              : 'border-[var(--border)] hover:border-[var(--primary)]'
                          }`}
                        >
                          <video
                            src={videoUrl}
                            muted
                            loop
                            playsInline
                            onMouseEnter={handleVideoHover}
                            onMouseLeave={handleVideoLeave}
                            className="absolute inset-0 w-full h-full object-cover bg-[var(--background)]"
                          />
                          
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                          
                          <div className="absolute bottom-0 left-0 right-0 p-2 pointer-events-none">
                            <span className="text-xs font-medium text-[var(--foreground)] truncate block w-full drop-shadow-md">
                              {asset.split('\\').pop()?.split('/').pop()?.replace('.mp4', '')}
                            </span>
                          </div>
                          
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-[var(--primary)] text-[var(--foreground)] rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">
                              ✓
                            </div>
                          )}

                          {/* Edit Button overlay */}
                          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingAsset(asset);
                              }}
                              className="bg-[var(--background)]/60 hover:bg-[var(--background)]/80 backdrop-blur border border-[var(--border)] text-[var(--foreground)] p-1.5 rounded-full"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="h-[60vh] bg-[var(--surface)] border border-[var(--border)] rounded-md flex flex-col items-center justify-center p-6 text-center">
                  <p className="text-sm font-medium text-[var(--foreground)]">No active sequence selected</p>
                  <p className="text-xs text-[var(--muted)] mt-1 max-w-[280px]">Select any timeline box on the left to view candidate assets and assign clips.</p>
                </div>
              )}
            </div>

            {/* Minimal History Version Control */}
            {showHistory && (
              <div className="col-span-12 space-y-4 pt-6 border-t border-[var(--border)]">
                <h2 className="text-sm font-semibold text-[var(--foreground)]">
                  Local Version History
                </h2>
                
                <div className="grid grid-cols-4 gap-6">
                  {history.length === 0 ? (
                    <div className="col-span-4 bg-[var(--surface)] border border-[var(--border)] rounded-md p-6 text-center text-xs text-[var(--muted)] font-mono">
                      No saved history checkpoints found in logs/
                    </div>
                  ) : (
                    history.map((v, i) => (
                      <div key={i} className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-md flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-[var(--primary)] font-mono">{v.id}</span>
                            {v.pinned && <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-mono">PINNED</span>}
                          </div>
                          <span className="text-[11px] font-mono text-[var(--muted)]">{new Date(v.timestamp).toLocaleString()}</span>
                          <span className="text-xs bg-[var(--background)] px-2 py-1 rounded text-[var(--faint)]">{v.engine} | {v.profile}</span>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button 
                            onClick={() => handleRestoreVersion(v.id)}
                            className="flex-1 text-[11px] py-1.5 bg-[var(--background)] hover:bg-[var(--border)] text-[var(--foreground)] border border-[var(--border)] rounded transition-colors"
                          >
                            Restore
                          </button>
                          <button 
                            onClick={() => handlePinVersion(v.id)}
                            className={`text-[11px] px-3 py-1.5 rounded transition-colors ${v.pinned ? 'bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)]' : 'bg-transparent border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--primary)]'}`}
                          >
                            {v.pinned ? 'Pinned 📌' : 'Pin'}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </main>
      </div>

      {/* Editor Modal */}
      {editingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--background)]/80 backdrop-blur-sm">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 w-[400px] max-w-[90vw] shadow-[0_0_50px_var(--primary)]">
            <div className="flex justify-between items-center mb-5 border-b border-[var(--border)] pb-3">
              <h3 className="text-sm font-semibold text-[var(--foreground)]">Media Editor</h3>
              <button onClick={() => setEditingAsset(null)} className="text-[var(--muted)] hover:text-[var(--foreground)]">✕</button>
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-center bg-[var(--background)] rounded-lg p-4 h-[200px] items-center border border-[var(--border)] overflow-hidden relative">
                {editingAsset.toLowerCase().endsWith('.mp4') ? (
                  <video 
                    src={`/api/video?path=${encodeURIComponent(editingAsset)}&v=${refreshKey}`} 
                    className="max-h-full object-contain transition-transform"
                    autoPlay
                    loop
                    muted 
                    style={{ transform: `rotate(${editRotate}deg)`, filter: `brightness(${editBrightness})` }}
                  />
                ) : (
                  <img 
                    src={`/api/video?path=${encodeURIComponent(editingAsset)}&v=${refreshKey}`} 
                    className="max-h-full object-contain transition-transform" 
                    style={{ transform: `rotate(${editRotate}deg)`, filter: `brightness(${editBrightness})` }}
                  />
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-[var(--faint)] uppercase tracking-wider flex justify-between">
                    Rotation <span className="text-[var(--foreground)]">{editRotate}°</span>
                  </label>
                  <div className="flex gap-2">
                    {[0, 90, 180, 270].map(deg => (
                      <button 
                        key={deg}
                        onClick={() => setEditRotate(deg)}
                        className={`flex-1 py-2 rounded text-xs font-bold border transition-colors ${
                          editRotate === deg ? 'shiny-button active' : 'bg-transparent text-[var(--muted)] border-[var(--border)] hover:border-[var(--primary)]'
                        }`}
                      >
                        {deg}°
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs text-[var(--faint)] uppercase tracking-wider flex justify-between">
                    Brightness <span className="text-[var(--foreground)]">{editBrightness.toFixed(1)}x</span>
                  </label>
                  <input 
                    type="range" min="0.1" max="2.0" step="0.1" 
                    value={editBrightness} 
                    onChange={e => setEditBrightness(parseFloat(e.target.value))}
                    className="w-full h-1 bg-[var(--border)] rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setEditingAsset(null)}
                  className="flex-1 py-2 text-xs font-medium border border-[var(--border)] text-[var(--foreground)] rounded hover:bg-[var(--background)] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleProcessMedia}
                  disabled={isProcessing}
                  className="flex-1 py-3 text-xs font-bold rounded disabled:opacity-50 shiny-button"
                >
                  {isProcessing ? 'Processing...' : 'Apply & Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
