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
  group: 'personal' | 'industrial' | 'ast';
  content?: string;
  sector?: string;
  salience?: number;
  source_file?: string;
  source_location?: string;
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
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

    if (selectedGroup !== 'ALL') {
      nodes = nodes.filter(n => n.group === selectedGroup || n.sector === selectedGroup);
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
  }, [searchTerm, selectedGroup, graphData]);

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
    <div ref={containerRef} className={"flex flex-col relative overflow-hidden bg-black " + (isFullscreen ? "w-screen h-screen fixed inset-0 z-[9999]" : "h-[calc(100vh-120px)] rounded-2xl border border-[var(--border)]")}>
      {/* HUD Header */}
      <section className="absolute top-4 left-4 z-10 space-y-3 pointer-events-auto">
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

          <div className="space-y-2">
            <label className="text-[9px] font-bold text-[var(--faint)] uppercase tracking-widest">Filter Sector</label>
            <div className="grid grid-cols-2 gap-2">
              {['ALL', 'personal', 'industrial', 'ast', 'semantic', 'procedural'].map((group) => (
                <button
                  key={group}
                  onClick={() => setSelectedGroup(group)}
                  className={`py-1.5 px-2 rounded border text-[8px] font-bold uppercase tracking-wider transition-all ${
                    selectedGroup === group
                      ? 'bg-blue-600/20 border-blue-500 text-blue-400 font-black'
                      : 'bg-white/5 border-white/5 text-[var(--muted)] hover:bg-white/10'
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>
          </div>

          {/* Key Legend */}
          <div className="space-y-2 border-t border-[var(--border)] pt-4">
            <label className="text-[9px] font-bold text-[var(--faint)] uppercase tracking-widest block">Node Key Legend</label>
            <div className="space-y-2 text-[9px] font-mono text-[var(--muted)]">
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#60a5fa] block shadow-[0_0_8px_#60a5fa80]"></span> <span>Episodic Memory</span></div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#c084fc] block shadow-[0_0_8px_#c084fc80]"></span> <span>Semantic Memory</span></div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#34d399] block shadow-[0_0_8px_#34d39980]"></span> <span>Procedural Memory</span></div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#10b981] block shadow-[0_0_8px_#10b98180]"></span> <span>Industrial Skill</span></div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#fbbf24] block shadow-[0_0_8px_#fbbf2480]"></span> <span>AST Structural Symbol</span></div>
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--border)] flex justify-between text-[9px] text-[var(--muted)] font-mono">
            <span>Nodes: {filteredData.nodes.length}</span>
            <span>Links: {filteredData.links.length}</span>
          </div>
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
            ref={fgRef}
            graphData={filteredData}
            nodeLabel="label"
            nodeColor={getNodeColor}
            nodeVal={(node: any) => (node.salience || 1.0) * 4}
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
        <section className="absolute bottom-4 right-4 z-10 w-96 pointer-events-auto">
          <div className="glass-card p-6 bg-[var(--sidebar-bg)] border-[var(--border)] max-h-[350px] overflow-y-auto flex flex-col space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className={`text-[8px] font-bold px-2 py-0.5 rounded bg-white/5 uppercase tracking-widest ${
                  selectedNode.group === 'ast' ? 'text-amber-400' : 'text-blue-400'
                }`}>
                  {selectedNode.group.toUpperCase()} / {selectedNode.sector?.toUpperCase()}
                </span>
                <h3 className="text-lg font-bold text-white leading-tight">{selectedNode.label}</h3>
              </div>
              <button 
                onClick={() => setSelectedNode(null)} 
                className="text-[var(--faint)] hover:text-white text-lg"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed flex-1">
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
                  <div className="bg-black/40 p-3 rounded-lg border border-white/5 font-mono text-[10px] text-white/70 overflow-x-auto whitespace-pre-wrap max-h-36">
                    {selectedNode.content}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
