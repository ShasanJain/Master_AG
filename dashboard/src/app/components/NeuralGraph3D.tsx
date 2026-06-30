'use client';

import { useEffect, useRef, useState } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';

export default function NeuralGraph3D() {
  const fgRef = useRef<any>(null);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [dimensions, setDimensions] = useState({ width: 400, height: 160 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate simple data for a low-poly performant graph
    const N = 30; // Fewer nodes for performance
    const nodes = [...Array(N).keys()].map(i => ({ id: i }));
    const links = [...Array(N).keys()]
      .filter(id => id)
      .map(id => ({
        source: id,
        target: Math.round(Math.random() * (id - 1))
      }));

    setGraphData({ nodes, links } as any);

    // Responsive sizing
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full bg-[var(--background)]">
      <ForceGraph3D
        ref={fgRef}
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        nodeRelSize={4}
        nodeColor={() => '#22C55E'}
        linkColor={() => 'rgba(34, 197, 94, 0.4)'}
        linkWidth={1}
        enableNodeDrag={false}
        enableNavigationControls={true}
        showNavInfo={false}
        backgroundColor="#020617"
        // Performance optimization: Low poly spheres
        nodeThreeObject={(node) => {
          const geometry = new THREE.SphereGeometry(4, 8, 8);
          const material = new THREE.MeshBasicMaterial({ color: '#22C55E' });
          return new THREE.Mesh(geometry, material);
        }}
        onEngineStop={() => {
          if (fgRef.current) {
            // Setup a slow orbit when simulation settles
            fgRef.current.cameraPosition({ x: 0, y: 0, z: 200 }, { x: 0, y: 0, z: 0 }, 3000);
          }
        }}
      />
    </div>
  );
}
