'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

// Import ForceGraph3D dynamically to prevent SSR issues
const ForceGraph3D = dynamic(
  () => import('react-force-graph-3d').then((mod) => mod.default),
  { ssr: false }
);

interface GraphNode {
  id: string;
  label: string;
  group: 'personal' | 'industrial' | 'ast' | 'community';
  content?: string;
  sector?: string;
  salience?: number;
  source_file?: string;
  source_location?: string;
  cluster?: number;
  cohesion?: number;
  member_count?: number;
}

interface GraphLink {
  source: string;
  target: string;
  value: number;
  relation?: string;
}

export default function NeuralMapPage() {
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; links: GraphLink[] }>({ nodes: [], links: [] });
  const [filteredData, setFilteredData] = useState<{ nodes: GraphNode[]; links: GraphLink[] }>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<string[]>(['ALL']);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Drag, minimize, and resize states for Inspector
  const [inspectorPosition, setInspectorPosition] = useState({ x: 16, y: 16 });
  const [isInspectorMinimized, setIsInspectorMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const positionStart = useRef({ x: 16, y: 16 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY };
      positionStart.current = { ...inspectorPosition };
      e.preventDefault();
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setInspectorPosition({
        x: Math.max(10, positionStart.current.x - dx),
        y: Math.max(10, positionStart.current.y + dy),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error('Error enabling fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/neural');
        const data = await res.json();
        setGraphData(data);
        setFilteredData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching neural graph:', err);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    let nodes = graphData.nodes;
    let links = graphData.links;

    if (!selectedGroups.includes('ALL') && selectedGroups.length > 0) {
      nodes = nodes.filter(n => selectedGroups.includes(n.group) || (n.sector && selectedGroups.includes(n.sector)));
      const nodeIds = new Set(nodes.map(n => n.id));
      links = links.filter(l => {
        const sourceId = typeof l.source === 'object' ? (l.source as any).id : l.source;
        const targetId = typeof l.target === 'object' ? (l.target as any).id : l.target;
        return nodeIds.has(sourceId) && nodeIds.has(targetId);
      });
    }

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      nodes = nodes.filter(n => 
        n.label.toLowerCase().includes(term) || 
        (n.content && n.content.toLowerCase().includes(term))
      );
      const nodeIds = new Set(nodes.map(n => n.id));
      links = links.filter(l => {
        const sourceId = typeof l.source === 'object' ? (l.source as any).id : l.source;
        const targetId = typeof l.target === 'object' ? (l.target as any).id : l.target;
        return nodeIds.has(sourceId) && nodeIds.has(targetId);
      });
    }

    setFilteredData({ nodes, links });
  }, [searchTerm, selectedGroups, graphData]);

  const handleNodeClick = (node: any) => {
    setSelectedNode(node);
    
    // Aim camera at clicked node
    if (fgRef.current) {
      const distance = 40;
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
      fgRef.current.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
        node,
        3000
      );
    }
  };

  const getNodeColor = (node: any) => {
    if (node.group === 'community') return '#fb7185'; // Rose — cluster hub
    if (node.group === 'personal') {
      if (node.sector === 'episodic') return '#60a5fa'; // Blue
      if (node.sector === 'procedural') return '#34d399'; // Emerald
      return '#c084fc'; // Purple (Semantic)
    }
    if (node.group === 'industrial') return '#10b981'; // Green
    return '#fbbf24'; // Amber (AST / structural)
  };

  const getLinkLabel = (link: GraphLink) => {
    return `${link.relation || 'relates'} (Weight: ${link.value.toFixed(2)})`;
  };

  return (
    <div ref={containerRef} className={"flex flex-col relative overflow-hidden bg-black " + (isFullscreen ? "w-screen h-screen fixed inset-0 z-[9999]" : "h-[calc(100vh-160px)] rounded-2xl border border-[var(--border)]")}>
      {/* HUD Header */}
      <section className="absolute top-4 left-4 z-10 flex items-start pointer-events-auto">
        <div className="relative flex items-start">
          <div className={`transition-all duration-300 ease-in-out overflow-hidden flex ${isSidebarMinimized ? 'w-0 opacity-0 pointer-events-none' : 'w-80 opacity-100'}`}>
            <div className="glass-card p-6 w-80 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold tracking-tighter text-white">NEURAL MAP</h2>
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">
                    Unified semantic-structural graph
                  </p>
                </div>
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded bg-white/5 border border-white/10 hover:bg-white/15 text-[10px] text-white/70 hover:text-white transition-all flex items-center justify-center font-bold"
                  title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                  {isFullscreen ? "⛶" : "⬜"}
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-bold text-[var(--faint)] uppercase tracking-widest">Search Matrix</label>
                <input
                  type="text"
                  placeholder="LOCATE SYMBOL OR MEMORY..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-[10px] font-bold tracking-widest text-white placeholder:text-[var(--faint)] outline-none focus:border-[var(--primary)] transition-all"
                />
              </div>

              <div className="space-y-2 relative">
                  <label className="text-[9px] font-bold text-[var(--faint)] uppercase tracking-widest">Filter Sectors (Multi-Select)</label>
                  
                  <details className="group relative">
                    <summary className="w-full bg-black/40 border border-[var(--border)] rounded-lg px-3 py-2 text-[10px] font-bold tracking-widest uppercase text-white outline-none focus:border-[var(--primary)] transition-all cursor-pointer hover:bg-white/5 list-none flex justify-between items-center select-none">
                      <span className="truncate">
                        {selectedGroups.includes('ALL') ? 'ALL SECTORS' : selectedGroups.join(', ')}
                      </span>
                      <svg className="w-3 h-3 transition-transform group-open:rotate-180 text-[var(--faint)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                    </summary>
                    
                    <div className="absolute top-full left-0 mt-1 w-full z-30 bg-[#0f1115] border border-[var(--border)] rounded-lg shadow-xl overflow-hidden">
                      <div className="max-h-48 overflow-y-auto p-2 flex flex-col gap-1">
                        {['ALL', 'personal', 'industrial', 'ast', 'community', 'semantic', 'procedural'].map((group) => (
                          <label key={group} className="flex items-center gap-2 cursor-pointer bg-white/5 px-3 py-2 rounded border border-transparent hover:border-white/10 hover:bg-white/10 transition-colors">
                            <input 
                              type="checkbox" 
                              checked={selectedGroups.includes(group)}
                              onChange={() => {
                                if (group === 'ALL') {
                                   setSelectedGroups(['ALL']);
                                } else {
                                   let newGroups = selectedGroups.filter(g => g !== 'ALL');
                                   if (newGroups.includes(group)) {
                                       newGroups = newGroups.filter(g => g !== group);
                                   } else {
                                       newGroups.push(group);
                                   }
                                   if (newGroups.length === 0) newGroups = ['ALL'];
                                   setSelectedGroups(newGroups);
                                }
                              }}
                              className="w-3.5 h-3.5 accent-[var(--primary)]"
                            />
                            <span className="text-[10px] font-bold tracking-wider uppercase text-white/80">
                              {group}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </details>
                  
                {/* Sector Description */}
                <div className="p-2 rounded bg-white/5 border border-white/5 mt-2">
                  <p className="text-[8px] leading-normal text-[var(--muted)] font-mono uppercase tracking-wider">
                    {selectedGroups.includes('ALL') && "Unified view of codebase structure & cognitive/procedural memory systems."}
                    {!selectedGroups.includes('ALL') && selectedGroups.map(g => {
                      if (g === 'personal') return "Cognitive memory traces, episodic events, and fact retention. ";
                      if (g === 'industrial') return "Automated procedural script workflow instructions. ";
                      if (g === 'ast') return "Structural code elements (files, components, imports, syntax). ";
                      if (g === 'community') return "Leiden-detected architectural clusters. Hub nodes summarizing code communities. ";
                      if (g === 'semantic') return "Long-term general factual relations and concept links. ";
                      if (g === 'procedural') return "Active system execution scripts and procedural tasks. ";
                      return "";
                    }).join("")}
                  </p>
                </div>
              </div>

              {/* Key Legend */}
              <details className="group border-t border-[var(--border)] pt-4">
                <summary className="text-[9px] font-bold text-[var(--faint)] uppercase tracking-widest cursor-pointer list-none flex items-center justify-between hover:text-white transition-colors">
                  Node Key Legend
                  <span className="text-[8px] transition-transform group-open:rotate-180">▼</span>
                </summary>
                <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-[9px] font-mono text-[var(--muted)] mt-3">
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 shrink-0 rounded-full bg-[#60a5fa] block shadow-[0_0_8px_#60a5fa80]"></span> <span className="truncate">Episodic</span></div>
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 shrink-0 rounded-full bg-[#c084fc] block shadow-[0_0_8px_#c084fc80]"></span> <span className="truncate">Semantic</span></div>
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 shrink-0 rounded-full bg-[#34d399] block shadow-[0_0_8px_#34d39980]"></span> <span className="truncate">Procedural</span></div>
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 shrink-0 rounded-full bg-[#10b981] block shadow-[0_0_8px_#10b98180]"></span> <span className="truncate">Skill</span></div>
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 shrink-0 rounded-full bg-[#fbbf24] block shadow-[0_0_8px_#fbbf2480]"></span> <span className="truncate">AST Symbol</span></div>
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 shrink-0 rounded-full bg-[#fb7185] block shadow-[0_0_8px_#fb718580]"></span> <span className="truncate">Cluster</span></div>
                </div>
              </details>

              {/* Controls Hint */}
              <details className="group border-t border-[var(--border)] pt-4">
                <summary className="text-[9px] font-bold text-[var(--faint)] uppercase tracking-widest cursor-pointer list-none flex items-center justify-between hover:text-white transition-colors">
                  Camera Controls
                  <span className="text-[8px] transition-transform group-open:rotate-180">▼</span>
                </summary>
                <div className="grid grid-cols-2 gap-2 text-[8px] font-mono text-[var(--muted)] mt-3">
                  <div className="bg-white/5 p-1.5 rounded text-center">Left-Click + Drag<br/><span className="text-white font-bold">Rotate</span></div>
                  <div className="bg-white/5 p-1.5 rounded text-center">Right-Click + Drag<br/><span className="text-white font-bold">Pan View</span></div>
                  <div className="bg-white/5 p-1.5 rounded text-center">Scroll Wheel<br/><span className="text-white font-bold">Zoom</span></div>
                  <div className="bg-white/5 p-1.5 rounded text-center">Click Node<br/><span className="text-white font-bold">Center</span></div>
                </div>
              </details>

              <div className="pt-2 border-t border-[var(--border)] flex justify-between text-[9px] text-[var(--muted)] font-mono">
                <span>Nodes: {filteredData.nodes.length}</span>
                <span>Links: {filteredData.links.length}</span>
              </div>
            </div>
          </div>

          {/* Small circular toggle button */}
          <button
            onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
            className="absolute top-6 w-6 h-6 bg-[var(--background)] hover:bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:text-white flex items-center justify-center rounded-full cursor-pointer shadow-lg z-20 transition-all duration-300"
            style={{ left: isSidebarMinimized ? '0px' : '308px' }}
            title={isSidebarMinimized ? "Expand Controls" : "Minimize Controls"}
          >
            <svg className="w-3 h-3 transition-transform duration-300" style={{ transform: isSidebarMinimized ? 'rotate(180deg)' : 'rotate(0deg)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </section>

      {/* 3D Force Graph Container */}
      <div className="flex-1 w-full h-full bg-black relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center text-white font-mono text-sm uppercase tracking-widest animate-pulse z-20">
            Initializing 3D Neural Map...
          </div>
        ) : (
          <ForceGraph3D
            graphData={filteredData}
            ref={fgRef}
            nodeLabel={(node: any) => {
              const baseStyle = 'padding: 6px 10px; background: rgba(0,0,0,0.85); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; font-family: monospace; font-size: 11px; backdrop-filter: blur(4px); box-shadow: 0 4px 12px rgba(0,0,0,0.5);';
              if (node.group === 'community') {
                return `<div style="${baseStyle} border-color: #fb7185; color: white;"><strong style="color: #fb7185; text-transform: uppercase; font-size: 10px; letter-spacing: 1px;">Cluster Hub</strong><br/>${node.label}</div>`;
              } else if (node.group === 'ast') {
                return `<div style="${baseStyle} border-color: #fbbf24; color: white;"><strong style="color: #fbbf24; text-transform: uppercase; font-size: 10px; letter-spacing: 1px;">AST Node</strong><br/>${node.label}</div>`;
              } else if (node.group === 'industrial') {
                return `<div style="${baseStyle} border-color: #10b981; color: white;"><strong style="color: #10b981; text-transform: uppercase; font-size: 10px; letter-spacing: 1px;">Skill</strong><br/>${node.label}</div>`;
              }
              return `<div style="${baseStyle} border-color: #60a5fa; color: white;"><strong style="color: #60a5fa; text-transform: uppercase; font-size: 10px; letter-spacing: 1px;">Memory</strong><br/>${node.label}</div>`;
            }}
            nodeColor={getNodeColor}
            nodeVal={(node: any) => node.group === 'community' ? (node.member_count || 3) * 2 : (node.salience || 1.0) * 4}
            nodeResolution={24}
            linkLabel={getLinkLabel as any}
            linkWidth={(link: any) => link.value * 1.5}
            linkColor={() => '#ffffff30'}
            linkDirectionalParticles={2}
            linkDirectionalParticleSpeed={0.005}
            onNodeClick={handleNodeClick}
            backgroundColor="#000000"
          />
        )}
      </div>

      {/* Inspector Panel */}
      {selectedNode && (
        <section 
          className="absolute z-20 pointer-events-auto"
          style={{ 
            top: `${inspectorPosition.y}px`, 
            right: `${inspectorPosition.x}px`,
          }}
        >
          <div 
            className="glass-card flex flex-col bg-[var(--sidebar-bg)] border-[var(--border)] overflow-hidden shadow-2xl transition-all"
            style={{ 
              width: isInspectorMinimized ? '240px' : '384px',
              height: isInspectorMinimized ? 'auto' : 'auto',
              resize: isInspectorMinimized ? 'none' : 'both',
              minWidth: '240px',
              minHeight: '40px',
              maxHeight: 'calc(100vh - 180px)',
            }}
          >
            {/* Header / Drag Handle */}
            <div 
              onMouseDown={handleMouseDown}
              className="drag-handle cursor-move p-4 bg-white/5 border-b border-white/5 flex justify-between items-center select-none"
            >
              <div className="space-y-1">
                <span className={`text-[8px] font-bold px-2 py-0.5 rounded bg-white/5 uppercase tracking-widest ${
                  selectedNode.group === 'community' ? 'text-rose-400' : selectedNode.group === 'ast' ? 'text-amber-400' : 'text-blue-400'
                }`}>
                  {selectedNode.group.toUpperCase()}{selectedNode.group === 'community' && selectedNode.cohesion != null ? ` (cohesion ${selectedNode.cohesion.toFixed(2)})` : ''} / {selectedNode.sector?.toUpperCase()}
                </span>
                {!isInspectorMinimized && (
                  <h3 className="text-sm font-bold text-white leading-tight truncate max-w-[200px]">{selectedNode.label}</h3>
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* Minimize Button */}
                <button
                  onClick={() => setIsInspectorMinimized(!isInspectorMinimized)}
                  className="text-[var(--faint)] hover:text-white text-xs p-1 font-bold"
                  title={isInspectorMinimized ? "Expand" : "Minimize"}
                >
                  {isInspectorMinimized ? "🗖" : "🗕"}
                </button>
                {/* Close Button */}
                <button 
                  onClick={() => setSelectedNode(null)} 
                  className="text-[var(--faint)] hover:text-white text-sm p-1 font-bold"
                  title="Close"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Body */}
            {!isInspectorMinimized && (
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <div className="space-y-3 text-xs leading-relaxed">
                  <div>
                    <span className="text-[9px] font-bold text-[var(--faint)] uppercase tracking-wider block">ID</span>
                    <span className="font-mono text-[10px] text-white/50">{selectedNode.id}</span>
                  </div>

                  {selectedNode.source_file && (
                    <div>
                      <span className="text-[9px] font-bold text-[var(--faint)] uppercase tracking-wider block">Source File</span>
                      <span className="font-mono text-[10px] text-emerald-400">{selectedNode.source_file}:{selectedNode.source_location}</span>
                    </div>
                  )}

                  {selectedNode.content && (
                    <div>
                      <span className="text-[9px] font-bold text-[var(--faint)] uppercase tracking-wider block">Decoded Trace</span>
                      <div className="bg-black/40 p-3 rounded-lg border border-white/5 font-mono text-[10px] text-white/70 overflow-x-auto whitespace-pre-wrap max-h-80">
                        {selectedNode.content}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
