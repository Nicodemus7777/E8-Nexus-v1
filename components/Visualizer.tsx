
import React, { useEffect, useRef, useMemo, useState } from 'react';
import * as d3 from 'd3';
import { getLieGroupRoots, projectTo2D, getPetrieBasis, projectSingleVector, findDecayPair } from '../utils/e8';
import { audioEngine } from '../utils/audio';
import { Node2D, Subgroup, LieGroupType, AppTheme, Vector8D, ParticleCategory, ProjectionMatrix, TopologicalDefect, EntangledPair, CosmicState, MeraState } from '../types';
import { Move, Atom, LayoutTemplate, Play, Pause, Download, Loader2, Sparkles, Focus, Orbit, Zap, Share2 } from 'lucide-react';

interface VisualizerProps {
  onNodeSelect: (node: Node2D) => void;
  activeSubgroup: Subgroup | null;
  groupType: LieGroupType;
  simulationQueue: Node2D[];
  theme: AppTheme;
  decayRequest: Vector8D | null;
  onDecayComplete: () => void;
  customMatrix: ProjectionMatrix | null;
  isAudioEnabled: boolean;
  isFrameBundleActive: boolean;
  isHolographicActive: boolean;
  wickRotation: number;
  isBreakingLabActive: boolean;
  activeDefect: TopologicalDefect | null;
  onDefectPlaced: (x: number, y: number) => void;
  entangledPair: EntangledPair | null;
  ripplePulse: number;
  onNodeHover?: (node: Node2D | null) => void;
  cosmicState: CosmicState;
  meraState: MeraState;
}

const getParticleName = (category: ParticleCategory | undefined) => {
  if (!category || category === 'None') return 'Root Vector';
  return category;
};

const Visualizer: React.FC<VisualizerProps> = ({ 
  onNodeSelect, activeSubgroup, groupType, simulationQueue, theme, decayRequest, onDecayComplete, customMatrix, isAudioEnabled, isFrameBundleActive, isHolographicActive, wickRotation, isBreakingLabActive, activeDefect, onDefectPlaced, entangledPair, ripplePulse, onNodeHover, cosmicState, meraState
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [angle, setAngle] = useState(0);
  const [universeTime, setUniverseTime] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [projectionProgress, setProjectionProgress] = useState(1);
  const [isUnfolding, setIsUnfolding] = useState(false);
  const [transform, setTransform] = useState(d3.zoomIdentity);
  
  const [hoveredNode, setHoveredNode] = useState<Node2D | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const roots = useMemo(() => getLieGroupRoots(groupType), [groupType]);
  const currentBasis = useMemo(() => {
    if (customMatrix) return [customMatrix.x, customMatrix.y];
    const rank = groupType === 'G2' ? 2 : groupType === 'F4' ? 4 : groupType === 'E6' ? 6 : groupType === 'E7' ? 7 : 8;
    return getPetrieBasis(rank);
  }, [groupType, customMatrix]);

  useEffect(() => {
    if (isAudioEnabled) audioEngine.updateAmbientDrone(angle);
  }, [angle, isAudioEnabled]);

  useEffect(() => {
    let frameId: number;
    const animate = () => {
      if (isAutoRotating && !isUnfolding) setAngle(prev => prev + 0.0008);
      setUniverseTime(prev => prev + 0.015);
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isAutoRotating, isUnfolding]);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.4, 60])
      .on('zoom', (event) => setTransform(event.transform));
    const drag = d3.drag<SVGSVGElement, unknown>()
      .on('start', () => setIsAutoRotating(false))
      .on('drag', (event) => setAngle(prev => prev + event.dx * 0.004));
    svg.call(zoom as any);
    svg.call(drag as any);
    return () => {
      svg.on('.zoom', null);
      svg.on('.drag', null);
    };
  }, []);

  const handleSvgClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!isBreakingLabActive || !svgRef.current) return;
    const pt = svgRef.current.createSVGPoint();
    pt.x = event.clientX; pt.y = event.clientY;
    const cursor = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const size = Math.min(width, height) * 0.82;
    const baseScale = d3.scaleLinear().domain([-2.5, 2.5]).range([0, size]);
    const localX = baseScale.invert((cursor.x - transform.x - (width - size) / 2) / transform.k);
    const localY = baseScale.invert((cursor.y - transform.y - (height - size) / 2) / transform.k);
    onDefectPlaced(localX, localY);
  };

  useEffect(() => {
    if (!svgRef.current) return;
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const size = Math.min(width, height) * 0.82;
    
    let projectedNodes = projectTo2D(roots, angle, currentBasis, projectionProgress, wickRotation, universeTime);
    const distortionFactor = 1 - cosmicState.unification;

    projectedNodes = projectedNodes.map((node, idx) => {
      let nx = node.x; let ny = node.y;
      const jitter = cosmicState.temperature * 0.05 * Math.sin(universeTime * 5 + idx);
      nx += jitter; ny += jitter;

      if (distortionFactor > 0.1) {
        const cat = node.original.category;
        nx += (cat === 'Strong' ? 0.2 : cat === 'Weak' ? -0.2 : 0) * distortionFactor;
        ny += (cat === 'Electromagnetic' ? 0.2 : cat === 'Fermion' ? -0.2 : 0) * distortionFactor;
      }

      if (isHolographicActive || meraState.isActive) {
        const rSq = nx * nx + ny * ny;
        const r = Math.sqrt(rSq);
        const targetR = meraState.isActive ? 2.2 : r; // Clamp to circle for MERA boundary
        const factor = (targetR / (r + 0.0001));
        nx *= factor; ny *= factor;
      }

      if (activeDefect) {
        const dx = nx - activeDefect.x; const dy = ny - activeDefect.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const force = (activeDefect.strength * 0.5) / (dist + 0.5);
        nx += dx * force; ny += dy * force;
      }
      return { ...node, x: nx, y: ny };
    });

    const baseScale = d3.scaleLinear().domain([-2.5, 2.5]).range([0, size]);
    const svg = d3.select(svgRef.current);
    
    svg.selectAll('.main-group').remove();
    svg.selectAll('.field-group').remove();
    svg.selectAll('.mera-group').remove();

    const g = svg.append('g').attr('class', 'main-group')
      .attr('transform', `translate(${(width - size) / 2 + transform.x}, ${(height - size) / 2 + transform.y}) scale(${transform.k})`);

    // MERA TREE RENDERING
    if (meraState.isActive) {
      const meraG = svg.append('g').attr('class', 'mera-group')
        .attr('transform', `translate(${(width - size) / 2 + transform.x}, ${(height - size) / 2 + transform.y}) scale(${transform.k})`);
      
      const numLayers = 4;
      let currentLayerNodes = projectedNodes;
      
      const edgeColor = theme === 'primal' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(5, 150, 105, 0.15)';
      const tensorColor = theme === 'primal' ? '#10b981' : '#059669';

      for (let l = 1; l <= numLayers; l++) {
        const depth = l / numLayers;
        if (depth > meraState.renormalizationScale + 0.1) break;

        const nextLayerCount = Math.max(1, Math.floor(currentLayerNodes.length / 4));
        const nextLayerNodes: {x: number, y: number}[] = [];

        for (let i = 0; i < nextLayerCount; i++) {
          const theta = (i / nextLayerCount) * 2 * Math.PI + angle * (1 / l);
          const r = 2.2 * (1 - depth * meraState.bulkCurvature);
          const tx = Math.cos(theta) * r;
          const ty = Math.sin(theta) * r;
          nextLayerNodes.push({ x: tx, y: ty });

          // Connect child nodes to this tensor
          const startIdx = i * 4;
          const endIdx = Math.min(currentLayerNodes.length, (i + 1) * 4);
          for (let j = startIdx; j < endIdx; j++) {
            const child = currentLayerNodes[j];
            meraG.append('path')
              .attr('d', `M${baseScale(child.x)},${baseScale(child.y)} Q${baseScale(child.x * 0.8)},${baseScale(child.y * 0.8)} ${baseScale(tx)},${baseScale(ty)}`)
              .attr('fill', 'none')
              .attr('stroke', edgeColor)
              .attr('stroke-width', (2 - depth) / transform.k)
              .attr('stroke-dasharray', l === 1 ? 'none' : '2,2');
          }
        }

        // Draw Tensors
        nextLayerNodes.forEach(tn => {
          meraG.append('rect')
            .attr('x', baseScale(tn.x) - 2 / transform.k)
            .attr('y', baseScale(tn.y) - 2 / transform.k)
            .attr('width', 4 / transform.k)
            .attr('height', 4 / transform.k)
            .attr('fill', tensorColor)
            .attr('transform', `rotate(${angle * 50}, ${baseScale(tn.x)}, ${baseScale(tn.y)})`)
            .attr('opacity', 0.8);
        });

        currentLayerNodes = nextLayerNodes as any;
      }
    }

    // Decay animation
    if (decayRequest && roots.length > 0) {
      const pair = findDecayPair(decayRequest, roots);
      if (pair) {
        const parentPos = projectSingleVector(decayRequest, angle, currentBasis, projectionProgress, wickRotation, universeTime);
        const child1Pos = projectSingleVector(pair[0], angle, currentBasis, projectionProgress, wickRotation, universeTime);
        const child2Pos = projectSingleVector(pair[1], angle, currentBasis, projectionProgress, wickRotation, universeTime);
        const decayG = g.append('g');
        decayG.append('circle').attr('cx', baseScale(parentPos.x)).attr('cy', baseScale(parentPos.y)).attr('r', 10 / transform.k).attr('fill', '#ffffff').attr('opacity', 0.8).transition().duration(800).attr('opacity', 0).remove();
        const c1 = decayG.append('circle').attr('cx', baseScale(parentPos.x)).attr('cy', baseScale(parentPos.y)).attr('r', 4 / transform.k).attr('fill', '#10b981');
        c1.transition().duration(1200).ease(d3.easeExpOut).attr('cx', baseScale(child1Pos.x * 2)).attr('cy', baseScale(child1Pos.y * 2)).attr('opacity', 0).remove();
        const c2 = decayG.append('circle').attr('cx', baseScale(parentPos.x)).attr('cy', baseScale(parentPos.y)).attr('r', 4 / transform.k).attr('fill', '#ec4899');
        c2.transition().duration(1200).ease(d3.easeExpOut).attr('cx', baseScale(child2Pos.x * 2)).attr('cy', baseScale(child2Pos.y * 2)).attr('opacity', 0).remove().on('end', onDecayComplete);
      }
    }

    const edges: { s: Node2D; t: Node2D }[] = [];
    if (!meraState.isActive) {
      const threshold = 0.01;
      for (let i = 0; i < projectedNodes.length; i++) {
        for (let j = i + 1; j < projectedNodes.length; j++) {
          const r1 = projectedNodes[i].original.coords;
          const r2 = projectedNodes[j].original.coords;
          let dot = 0; for (let k = 0; k < 8; k++) dot += r1[k] * r2[k];
          if (Math.abs(dot - 1) < threshold) edges.push({ s: projectedNodes[i], t: projectedNodes[j] });
        }
      }
    }
    
    const edgeColorBase = theme === 'primal' ? '148, 163, 184' : '100, 116, 139';
    const unifiedColor = theme === 'primal' ? '#fde047' : '#ca8a04'; 

    g.selectAll('.edge').data(edges).enter().append('line').attr('class', 'edge')
      .attr('x1', d => baseScale(d.s.x)).attr('y1', d => baseScale(d.s.y))
      .attr('x2', d => baseScale(d.t.x)).attr('y2', d => baseScale(d.t.y))
      .attr('stroke', d => (cosmicState.unification > 0.8) ? unifiedColor : (activeSubgroup?.categories.includes(d.s.original.category!) ? (theme === 'primal' ? activeSubgroup.color : activeSubgroup.dualColor) : `rgba(${edgeColorBase}, 0.05)`))
      .attr('stroke-opacity', d => activeSubgroup ? 0.6 : 0.2)
      .attr('stroke-width', (0.45 + cosmicState.temperature * 1.5) / transform.k);

    g.selectAll('.node').data(projectedNodes).enter().append('circle').attr('class', 'node')
      .attr('cx', d => baseScale(d.x)).attr('cy', d => baseScale(d.y))
      .attr('r', d => (2.8 + (meraState.isActive ? 1 : 0)) / Math.sqrt(transform.k))
      .attr('fill', d => (cosmicState.unification > 0.8) ? unifiedColor : (activeSubgroup?.categories.includes(d.original.category!) ? (theme === 'primal' ? activeSubgroup.color : activeSubgroup.dualColor) : (theme === 'primal' ? '#60a5fa' : '#475569')))
      .attr('stroke', theme === 'primal' ? '#020617' : '#ffffff')
      .attr('stroke-width', 0.6 / transform.k)
      .style('cursor', 'pointer')
      .on('mouseover', function(e, d) {
        d3.select(this).transition().duration(200).attr('r', 7 / transform.k).attr('fill', '#fbbf24');
        setHoveredNode(d); onNodeHover?.(d);
        if (isAudioEnabled) audioEngine.sonifyNode(d);
      })
      .on('mouseout', function(e, d) {
        const r = (2.8 + (meraState.isActive ? 1 : 0)) / Math.sqrt(transform.k);
        const f = (cosmicState.unification > 0.8) ? unifiedColor : (activeSubgroup?.categories.includes(d.original.category!) ? (theme === 'primal' ? activeSubgroup.color : activeSubgroup.dualColor) : (theme === 'primal' ? '#60a5fa' : '#475569'));
        d3.select(this).transition().duration(200).attr('r', r).attr('fill', f);
        setHoveredNode(null); onNodeHover?.(null);
      })
      .on('click', (e, d) => { e.stopPropagation(); onNodeSelect(d); });

  }, [roots, angle, transform, activeSubgroup, projectionProgress, currentBasis, simulationQueue, theme, isAudioEnabled, isFrameBundleActive, hoveredNode, wickRotation, universeTime, isHolographicActive, isBreakingLabActive, activeDefect, entangledPair, onNodeHover, cosmicState, decayRequest, meraState]);

  return (
    <div ref={containerRef} className={`w-full h-full relative group cursor-crosshair overflow-hidden transition-colors duration-500 ${theme === 'primal' ? 'bg-slate-950' : 'bg-[#fcfaf7]'}`}>
      <svg ref={svgRef} onClick={handleSvgClick} className="w-full h-full active:cursor-grabbing" />
      <div className="absolute top-8 right-32 pointer-events-none text-right">
        <div className={`text-[10px] font-mono uppercase tracking-[0.3em] mb-1 ${theme === 'primal' ? 'text-blue-500' : 'text-blue-600'}`}>{meraState.isActive ? 'Entanglement Bulk' : 'Universe Instability'}</div>
        <div className={`text-2xl font-bold font-mono ${theme === 'primal' ? 'text-slate-100' : 'text-slate-900'}`}>{meraState.isActive ? 'MERA RENORM' : `${(cosmicState.temperature * 100).toFixed(1)}%`}</div>
      </div>
    </div>
  );
};

export default Visualizer;
