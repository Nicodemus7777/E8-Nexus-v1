
import React, { useEffect, useRef, useMemo, useState } from 'react';
import * as d3 from 'd3';
import { getLieGroupRoots, projectTo2D, getPetrieBasis } from '../utils/e8';
import { audioEngine } from '../utils/audio';
import { Node2D, Subgroup, LieGroupType, AppTheme, ProjectionMatrix, CosmicState, MeraState } from '../types';

interface VisualizerProps {
  onNodeSelect: (node: Node2D) => void;
  activeSubgroup: Subgroup | null;
  groupType: LieGroupType;
  theme: AppTheme;
  customMatrix: ProjectionMatrix | null;
  isAudioEnabled: boolean;
  isAutoRotating: boolean;
  rotationSpeed: number;
  cosmicState: CosmicState;
  meraState: MeraState;
  onNodeHover?: (node: Node2D | null) => void;
}

const Visualizer: React.FC<VisualizerProps> = ({ 
  onNodeSelect, activeSubgroup, groupType, theme, customMatrix, isAudioEnabled, 
  isAutoRotating, rotationSpeed, cosmicState, meraState, onNodeHover 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [angle, setAngle] = useState(0);
  const [transform, setTransform] = useState(d3.zoomIdentity);
  
  const roots = useMemo(() => getLieGroupRoots(groupType), [groupType]);
  const currentBasis = useMemo(() => {
    if (customMatrix) return [customMatrix.x, customMatrix.y];
    return getPetrieBasis(groupType === 'E8' ? 8 : 4);
  }, [groupType, customMatrix]);

  // Handle Rotation
  useEffect(() => {
    if (!isAutoRotating) return;
    let frameId: number;
    const animate = () => {
      setAngle(prev => prev + rotationSpeed);
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isAutoRotating, rotationSpeed]);

  // Handle Zoom/Pan
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 40])
      .on('zoom', (event) => setTransform(event.transform));
    svg.call(zoom as any);
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;
    const width = containerRef.current?.clientWidth || 800;
    const height = containerRef.current?.clientHeight || 600;
    const size = Math.min(width, height) * 0.85;
    
    const projectedNodes = projectTo2D(roots, angle, currentBasis);
    const baseScale = d3.scaleLinear().domain([-2.5, 2.5]).range([0, size]);
    const svg = d3.select(svgRef.current);
    
    svg.selectAll('*').remove();
    const g = svg.append('g')
      .attr('transform', `translate(${(width - size) / 2 + transform.x}, ${(height - size) / 2 + transform.y}) scale(${transform.k})`);

    // Draw Edges (Simplified for clarity)
    if (!meraState.isActive) {
      const edges: any[] = [];
      const threshold = 0.05;
      for (let i = 0; i < projectedNodes.length; i++) {
        for (let j = i + 1; j < projectedNodes.length; j++) {
          const r1 = projectedNodes[i].original.coords;
          const r2 = projectedNodes[j].original.coords;
          let dot = 0; for (let k = 0; k < 8; k++) dot += r1[k] * r2[k];
          if (Math.abs(dot - 1) < threshold) {
            edges.push({ s: projectedNodes[i], t: projectedNodes[j] });
          }
        }
      }

      g.selectAll('.edge')
        .data(edges)
        .enter().append('line')
        .attr('x1', d => baseScale(d.s.x))
        .attr('y1', d => baseScale(d.s.y))
        .attr('x2', d => baseScale(d.t.x))
        .attr('y2', d => baseScale(d.t.y))
        .attr('stroke', theme === 'primal' ? 'rgba(148, 163, 184, 0.08)' : 'rgba(100, 116, 139, 0.1)')
        .attr('stroke-width', 0.5 / transform.k);
    }

    // Draw Nodes
    g.selectAll('.node')
      .data(projectedNodes)
      .enter().append('circle')
      .attr('cx', d => baseScale(d.x))
      .attr('cy', d => baseScale(d.y))
      .attr('r', 3 / Math.sqrt(transform.k))
      .attr('fill', d => {
        const cat = d.original.category;
        if (cat === 'Fermion') return '#ec4899';
        if (cat === 'Strong') return '#10b981';
        if (cat === 'Weak') return '#8b5cf6';
        return theme === 'primal' ? '#3b82f6' : '#64748b';
      })
      .attr('stroke', theme === 'primal' ? '#020617' : '#ffffff')
      .attr('stroke-width', 0.5 / transform.k)
      .style('cursor', 'pointer')
      .on('mouseover', function(e, d) {
        d3.select(this).transition().duration(200).attr('r', 8 / transform.k).attr('fill', '#fbbf24');
        onNodeHover?.(d);
        if (isAudioEnabled) audioEngine.sonifyNode(d);
      })
      .on('mouseout', function(e, d) {
        d3.select(this).transition().duration(200).attr('r', 3 / Math.sqrt(transform.k))
          .attr('fill', d.original.category === 'Fermion' ? '#ec4899' : (theme === 'primal' ? '#3b82f6' : '#64748b'));
        onNodeHover?.(null);
      })
      .on('click', (e, d) => onNodeSelect(d));

  }, [roots, angle, transform, theme, currentBasis, isAudioEnabled, meraState, cosmicState]);

  return (
    <div ref={containerRef} className="w-full h-full relative cursor-crosshair overflow-hidden">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};

export default Visualizer;
