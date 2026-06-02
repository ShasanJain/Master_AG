"use client";

import { useEffect, useState, useRef } from 'react';

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
      const body: Record<string, string> = { engine: voiceEngine, mode: scriptInputType };
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
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white font-mono text-sm">Loading Environment...</div>;
  }

  return (
    <div className="min-h-screen bg-[#000000] text-gray-100 font-sans tracking-tight">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        
        {/* Minimal Header */}
        <header className="flex justify-between items-center pb-8 border-b border-white/10">
          <div>
            <h1 className="text-2xl font-semibold tracking-tighter text-white">
              Studio Workspace
            </h1>
            <div className="mt-4 flex items-center gap-4">
              <span className="flex items-center gap-2 text-[11px] text-gray-400 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span> Online
              </span>
              <audio ref={audioRef} controls src={`/api/audio?v=${refreshKey}`} className="h-6 opacity-60 hover:opacity-100 transition-opacity filter invert-[0.9] grayscale" />
            </div>


          </div>
          
          <div className="flex gap-6 items-center relative">
            
            
            <div className="flex flex-col gap-1.5 border-l border-white/10 pl-6">
              <label className="text-[10px] text-gray-500 font-medium uppercase">Engine</label>
              <select 
                value={voiceEngine} 
                onChange={e => setVoiceEngine(e.target.value)}
                className="bg-transparent border border-white/10 rounded-md px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-white/30 cursor-pointer"
              >
                <option value="edge">Edge TTS</option>
                <option value="piper">Piper (CPU)</option>
                <option value="bark">Bark (GPU)</option>
              </select>
            </div>
            
            <button 
              onClick={handleGenerateVoice}
              disabled={isGeneratingVoice || isRendering}
              className="mt-5 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              {isGeneratingVoice ? 'Generating...' : 'Regenerate Voice'}
            </button>

            <div className="flex flex-col gap-1.5 border-l border-white/10 pl-6">
              <label className="text-[10px] text-gray-500 font-medium uppercase">Profile</label>
              <select 
                value={renderProfile} 
                onChange={e => setRenderProfile(e.target.value)}
                className="bg-transparent border border-white/10 rounded-md px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-white/30 cursor-pointer"
              >
                <option value="FastViral">FastViral</option>
                <option value="CorporateClean">CorporateClean</option>
              </select>
            </div>
            
            <button 
              onClick={handleSave}
              className="mt-5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Save Timeline
            </button>
            <button 
              onClick={handleRender}
              disabled={isRendering || isGeneratingVoice}
              className="mt-5 bg-white text-black px-4 py-1.5 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRendering ? 'Rendering...' : 'Build Video'}
            </button>
          </div>
        </header>

        {/* Content Generation Control Panel */}
        <section className="bg-[#111] border border-white/10 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-300">Content Generation</h2>
            <div className="flex gap-2">
              {(['auto', 'topic', 'script'] as const).map(type => (
                <button 
                  key={type}
                  onClick={() => { setScriptInputType(type); setSelectedViralTopic(null); setTrendingTopics([]); }}
                  className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded transition-colors ${scriptInputType === type ? 'bg-white text-black' : 'bg-black text-gray-500 border border-white/10 hover:border-white/30'}`}
                >
                  {type === 'auto' ? '🔥 Viral' : type === 'topic' ? '🔍 Topic' : '✍️ Script'}
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
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-300 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isFetchingTrends ? (
                    <><div className="w-3 h-3 border border-orange-400 border-t-transparent rounded-full animate-spin" /> Fetching...</>
                  ) : (
                    <>⚡ Fetch Today&apos;s Trending Topics</>
                  )}
                </button>
                {selectedViralTopic && (
                  <span className="text-[10px] text-green-400 font-mono">✓ Ready — hit Regenerate Voice</span>
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
                          ? 'border-orange-500/60 bg-orange-500/10 text-orange-100'
                          : 'border-white/10 bg-black hover:border-white/30 text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <span className="text-gray-600 mr-2 font-mono">#{i+1}</span>
                      {t.topic.replace(/^TIL\s*(that)?\s*/i, '')}
                    </button>
                  ))}
                </div>
              )}
              {trendingTopics.length === 0 && !isFetchingTrends && (
                <p className="text-xs text-gray-600 font-mono">Hit &quot;Fetch&quot; to load today&apos;s top Reddit facts and pick one.</p>
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
                className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/50 transition-colors font-mono text-sm"
              />
              <p className="text-[10px] text-gray-600 font-mono">Agent will search Reddit + Twitter/TikTok for the most viral post on this topic and build a hook from it.</p>
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
                className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/50 transition-colors font-mono text-sm resize-none"
              />
              <p className="text-[10px] text-gray-600 font-mono">No scraping. Your exact words go straight into the voice engine.</p>
            </div>
          )}
          
          <div className="pt-4 border-t border-white/10 mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <div className={`w-10 h-5 rounded-full p-1 transition-colors ${enableAvatar ? 'bg-orange-500' : 'bg-gray-700'}`}>
                  <div className={`bg-white w-3 h-3 rounded-full transition-transform ${enableAvatar ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
                <span className="text-xs font-semibold text-gray-300">Enable Split-Screen Avatar</span>
              </label>
              <input type="checkbox" className="hidden" checked={enableAvatar} onChange={() => setEnableAvatar(!enableAvatar)} />
            </div>
            
            {enableAvatar && (
              <div className="flex items-center gap-3">
                {avatarImagePath && (
                  <span className="text-[10px] text-green-400 font-mono">✓ Face Ready</span>
                )}
                <label className="cursor-pointer px-3 py-1.5 text-[10px] font-bold bg-white text-black hover:bg-gray-200 rounded transition-colors flex items-center gap-2">
                  {isUploadingAvatar ? 'Uploading...' : 'Upload Presenter Face (PNG/JPG)'}
                  <input type="file" className="hidden" accept="image/jpeg,image/png" onChange={handleAvatarUpload} disabled={isUploadingAvatar} />
                </label>
              </div>
            )}
          </div>
        </section>


        {/* Minimal Terminal Log */}
        {(isRendering || isGeneratingVoice || renderLogs) && (
          <div className="bg-[#111] border border-white/10 rounded-lg p-4 relative">
            <button className="absolute top-4 right-4 text-xs text-gray-600 hover:text-gray-300 transition-colors" onClick={() => setRenderLogs('')}>Clear</button>
            <h3 className="text-xs text-gray-500 uppercase tracking-widest font-mono mb-3">Build Output</h3>
            <pre className="text-[11px] text-gray-400 whitespace-pre-wrap max-h-32 overflow-y-auto font-mono scrollbar-hide">
              {renderLogs || "Waiting for signal..."}
            </pre>
          </div>
        )}

        <main className="grid grid-cols-12 gap-10">
          
          {/* Structured Timeline Editor */}
          <div className="col-span-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-300">
              Sequence Editor
            </h2>
            
            <div className="flex flex-col gap-2 overflow-y-auto h-[60vh] pr-2 scrollbar-thin scrollbar-thumb-white/10">
              {timeline?.segments.map((seg, idx) => (
                <div 
                  key={idx} 
                  className={`relative p-4 rounded-md cursor-pointer transition-all border ${
                    selectedSegmentIdx === idx 
                      ? 'border-white/30 bg-[#111] z-10' 
                      : 'border-transparent hover:bg-[#111]/50'
                  }`}
                  onClick={() => {
                    setSelectedSegmentIdx(idx);
                    playSegment(seg.start);
                  }}
                >
                  <div className="flex items-center gap-4 mb-2">
                    <span className="font-mono text-[10px] text-gray-500">
                      {seg.start.toFixed(2)}s &rarr; {seg.end.toFixed(2)}s
                    </span>
                    <span className="text-[10px] bg-[#222] text-gray-300 px-2 py-0.5 rounded border border-white/5 truncate max-w-[150px]">
                      {seg.clip_path.split('\\').pop()?.split('/').pop()}
                    </span>
                  </div>
                  
                  {selectedSegmentIdx === idx ? (
                     <textarea 
                       className="w-full bg-black border border-white/20 rounded text-sm text-gray-200 p-2 mt-1 focus:outline-none focus:border-white/40 resize-none transition-colors"
                       rows={2}
                       value={seg.text}
                       onChange={(e) => updateSegmentText(e.target.value)}
                       onClick={(e) => e.stopPropagation()}
                     />
                  ) : (
                    <p className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">{seg.text}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Clean Video Asset Gallery */}
          <div className="col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-300">
                Media Library
              </h2>
              
              <div className="flex items-center gap-3">
                {selectedSegmentIdx !== null && (
                  <span className="text-[10px] text-gray-500 font-mono">Targeting Sequence {selectedSegmentIdx + 1}</span>
                )}
                <label className="cursor-pointer bg-[#222] hover:bg-[#333] border border-white/10 text-gray-300 px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-2">
                  {isUploading ? (
                    <span className="flex items-center gap-1"><div className="w-2 h-2 border border-white/50 border-t-white rounded-full animate-spin"/> Uploading...</span>
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
              <div className="h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 pr-2">
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
                            ? 'border-white' 
                            : 'border-white/10 hover:border-white/40'
                        }`}
                      >
                        <video
                          src={videoUrl}
                          muted
                          loop
                          playsInline
                          onMouseEnter={handleVideoHover}
                          onMouseLeave={handleVideoLeave}
                          className="absolute inset-0 w-full h-full object-cover bg-[#0a0a0a]"
                        />
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                        
                        <div className="absolute bottom-0 left-0 right-0 p-2 pointer-events-none">
                          <span className="text-[10px] font-medium text-gray-300 truncate block w-full drop-shadow-md">
                            {asset.split('\\').pop()?.split('/').pop()?.replace('.mp4', '')}
                          </span>
                        </div>
                        
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-white text-black rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
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
                            className="bg-black/60 hover:bg-black/80 backdrop-blur border border-white/20 text-white p-1.5 rounded-full"
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
              <div className="border border-dashed border-white/10 rounded-lg p-12 text-center flex flex-col items-center justify-center h-[60vh]">
                <p className="text-gray-500 text-sm">Select a sequence to browse media.</p>
              </div>
            )}
          </div>
        </main>

        {/* Full-width History Section */}
        <div className="border border-white/10 rounded-lg overflow-hidden bg-[#0a0a0a]">
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="w-full p-4 flex justify-between items-center bg-[#111] hover:bg-[#1a1a1a] transition-colors"
          >
            <h2 className="text-sm font-semibold text-gray-300">Version History ({history.length})</h2>
            <span className="text-gray-500">{showHistory ? '▲' : '▼'}</span>
          </button>
          
          {showHistory && (
            <div className="p-4 border-t border-white/5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[40vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                {history.length === 0 ? (
                  <div className="col-span-full text-center text-xs text-gray-500 py-8">No history found.</div>
                ) : (
                  history.map((v, i) => (
                    <div key={v.id} className="p-4 border border-white/5 bg-[#111] rounded-md hover:border-white/20 transition-colors flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-mono text-gray-300">{new Date(v.timestamp).toLocaleString()}</span>
                        <span className="text-[10px] bg-[#222] px-2 py-1 rounded text-gray-400">{v.engine} | {v.profile}</span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button 
                          onClick={() => handleRestoreVersion(v.id)}
                          className="flex-1 text-[11px] py-1.5 bg-white/10 hover:bg-white/20 text-white rounded transition-colors"
                        >
                          Restore
                        </button>
                        <button 
                          onClick={() => handlePinVersion(v.id)}
                          className={`text-[11px] px-3 py-1.5 rounded transition-colors ${v.pinned ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50' : 'bg-transparent border border-white/10 text-gray-400 hover:text-white'}`}
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
        </div>
      </div>

      {/* Editor Modal */}
      {editingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/10 rounded-xl p-6 w-[400px] max-w-[90vw] shadow-2xl">
            <div className="flex justify-between items-center mb-5 border-b border-white/5 pb-3">
              <h3 className="text-sm font-semibold text-white">Media Editor</h3>
              <button onClick={() => setEditingAsset(null)} className="text-gray-500 hover:text-white">✕</button>
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-center bg-black/50 rounded-lg p-4 h-[200px] items-center border border-white/5 overflow-hidden relative">
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
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider flex justify-between">
                    Rotation <span>{editRotate}°</span>
                  </label>
                  <div className="flex gap-2">
                    {[0, 90, 180, 270].map(deg => (
                      <button 
                        key={deg}
                        onClick={() => setEditRotate(deg)}
                        className={`flex-1 py-1.5 rounded text-xs border transition-colors ${
                          editRotate === deg ? 'bg-white text-black border-white' : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30'
                        }`}
                      >
                        {deg}°
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider flex justify-between">
                    Brightness <span>{editBrightness.toFixed(1)}x</span>
                  </label>
                  <input 
                    type="range" min="0.1" max="2.0" step="0.1" 
                    value={editBrightness} 
                    onChange={e => setEditBrightness(parseFloat(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setEditingAsset(null)}
                  className="flex-1 py-2 text-xs font-medium border border-white/10 rounded hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleProcessMedia}
                  disabled={isProcessing}
                  className="flex-1 py-2 text-xs font-medium bg-white text-black rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Apply & Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
