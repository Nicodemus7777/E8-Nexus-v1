
export interface Vector8D {
  coords: number[];
  category?: ParticleCategory;
}

export interface Node2D {
  id: number;
  x: number;
  y: number;
  original: Vector8D;
  isMassive?: boolean;
}

export interface ProjectionMatrix {
  x: number[];
  y: number[];
}

export interface Discovery {
  id: string;
  name: string;
  discoverer: string;
  matrix: ProjectionMatrix;
  symmetryRank: 'Common' | 'High' | 'Perfect';
  type: string;
  timestamp: number;
}

export interface Edge {
  source: number;
  target: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export type ParticleCategory = 'Strong' | 'Weak' | 'Electromagnetic' | 'Fermion' | 'Gravitational' | 'Massive' | 'Broken' | 'Entangled' | 'None' | 'TensorNode';

export type LieGroupType = 'G2' | 'F4' | 'E6' | 'E7' | 'E8';

export type AppTheme = 'primal' | 'dual';

export type DefectType = 'Monopole' | 'CosmicString' | 'HiggsVEV';

export interface TopologicalDefect {
  type: DefectType;
  x: number;
  y: number;
  strength: number;
}

export interface EntangledPair {
  node1: Node2D;
  node2: Node2D;
}

export interface CosmicState {
  temperature: number; // 0 (Now, 2.7K) to 1 (Big Bang, 10^32K)
  era: string;
  unification: number; // 0 to 1
}

export interface DecayInteraction {
  parent: Vector8D;
  children: [Vector8D, Vector8D];
  timestamp: number;
}

export interface MeraState {
  isActive: boolean;
  renormalizationScale: number; // 0 to 1 (depth of tree)
  bulkCurvature: number; // Emergent geometry curvature
}

export interface EvaluationLog {
  id: string;
  timestamp: number;
  parameters: {
    temp: number;
    mera: number;
    wick: number;
  };
  analysis: string;
  stabilityScore: number;
}

export interface ParameterSweep {
  parameter: 'temperature' | 'renormalization' | 'wick';
  start: number;
  end: number;
  steps: number;
}

export interface LieGroupInfo {
  id: LieGroupType;
  name: string;
  rank: number;
  dimension: number;
  rootCount: number;
  description: string;
}

export const LIE_GROUPS: LieGroupInfo[] = [
  {
    id: 'G2',
    name: 'G₂',
    rank: 2,
    dimension: 14,
    rootCount: 12,
    description: 'The smallest exceptional group, describing symmetries of octonions.'
  },
  {
    id: 'F4',
    name: 'F₄',
    rank: 4,
    dimension: 52,
    rootCount: 48,
    description: 'The symmetry group of the 24-cell, a self-dual regular polychoron.'
  },
  {
    id: 'E6',
    name: 'E₆',
    rank: 6,
    dimension: 78,
    rootCount: 72,
    description: 'Often used in Grand Unified Theories (GUTs) as a precursor to E8.'
  },
  {
    id: 'E7',
    name: 'E₇',
    rank: 7,
    dimension: 133,
    rootCount: 126,
    description: 'A large subgroup of E8 with complex quaternary structures.'
  },
  {
    id: 'E8',
    name: 'E₈',
    rank: 8,
    dimension: 248,
    rootCount: 240,
    description: 'The ultimate exceptional group, centerpiece of the Theory of Everything.'
  }
];

export interface Subgroup {
  id: string;
  name: string;
  description: string;
  categories: ParticleCategory[];
  color: string;
  dualColor: string;
}

export const SUBGROUPS: Subgroup[] = [
  {
    id: 'sm',
    name: 'Standard Model',
    description: 'The SU(3)xSU(2)xU(1) gauge groups describing strong, weak, and electromagnetic forces.',
    categories: ['Strong', 'Weak', 'Electromagnetic'],
    color: '#06b6d4',
    dualColor: '#0369a1'
  },
  {
    id: 'su3',
    name: 'Strong (SU(3))',
    description: 'The 8 gluons mediating the strong nuclear force between quarks.',
    categories: ['Strong'],
    color: '#10b981',
    dualColor: '#047857'
  },
  {
    id: 'su2',
    name: 'Weak (SU(2))',
    description: 'The W and Z bosons mediating the weak interaction.',
    categories: ['Weak'],
    color: '#8b5cf6',
    dualColor: '#6d28d9'
  },
  {
    id: 'fermions',
    name: 'Fermions',
    description: 'Quarks and leptons (matter particles) embedded in the E8 lattice.',
    categories: ['Fermion'],
    color: '#ec4899',
    dualColor: '#be185d'
  }
];
