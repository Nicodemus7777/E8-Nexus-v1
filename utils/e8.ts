
import { Vector8D, ParticleCategory, LieGroupType } from '../types';

/**
 * Generates all 240 E8 roots as a base set.
 */
const generateE8RootsRaw = (): Vector8D[] => {
  const roots: Vector8D[] = [];
  // 112 roots: (±1, ±1, 0^6)
  for (let i = 0; i < 8; i++) {
    for (let j = i + 1; j < 8; j++) {
      for (const s1 of [1, -1]) {
        for (const s2 of [1, -1]) {
          const coords = new Array(8).fill(0);
          coords[i] = s1; coords[j] = s2;
          roots.push({ coords });
        }
      }
    }
  }
  // 128 roots: (±1/2^8) with even minus signs
  for (let i = 0; i < 256; i++) {
    const coords = [];
    let minusCount = 0;
    for (let j = 0; j < 8; j++) {
      if ((i >> j) & 1) { coords.push(-0.5); minusCount++; }
      else { coords.push(0.5); }
    }
    if (minusCount % 2 === 0) roots.push({ coords });
  }
  return roots;
};

/**
 * Finds a pair of roots (beta, gamma) such that alpha = beta + gamma.
 */
export const findDecayPair = (alpha: Vector8D, allRoots: Vector8D[]): [Vector8D, Vector8D] | null => {
  for (const beta of allRoots) {
    let dot = 0;
    for (let i = 0; i < 8; i++) dot += alpha.coords[i] * beta.coords[i];
    
    if (Math.abs(dot - 1) < 0.001) {
      const gammaCoords = alpha.coords.map((val, i) => val - beta.coords[i]);
      let gammaNormSq = 0;
      for (const gc of gammaCoords) gammaNormSq += gc * gc;
      
      if (Math.abs(gammaNormSq - 2) < 0.001) {
        const gamma: Vector8D = { 
          coords: gammaCoords,
          category: gammaCoords.some(c => Math.abs(c) === 0.5) ? 'Fermion' : 'Strong'
        };
        return [beta, gamma];
      }
    }
  }
  return null;
};

/**
 * Master function to fetch roots for any exceptional Lie group.
 */
export const getLieGroupRoots = (type: LieGroupType): Vector8D[] => {
  switch (type) {
    case 'G2': {
      return [
        { coords: [1, -1, 0, 0, 0, 0, 0, 0], category: 'Strong' },
        { coords: [-1, 1, 0, 0, 0, 0, 0, 0], category: 'Strong' },
        { coords: [1, 0, -1, 0, 0, 0, 0, 0], category: 'Strong' },
        { coords: [-1, 0, 1, 0, 0, 0, 0, 0], category: 'Strong' },
        { coords: [0, 1, -1, 0, 0, 0, 0, 0], category: 'Strong' },
        { coords: [0, -1, 1, 0, 0, 0, 0, 0], category: 'Strong' },
        { coords: [2, -1, -1, 0, 0, 0, 0, 0], category: 'Weak' },
        { coords: [-2, 1, 1, 0, 0, 0, 0, 0], category: 'Weak' },
        { coords: [1, -2, 1, 0, 0, 0, 0, 0], category: 'Weak' },
        { coords: [-1, 2, -1, 0, 0, 0, 0, 0], category: 'Weak' },
        { coords: [1, 1, -2, 0, 0, 0, 0, 0], category: 'Weak' },
        { coords: [-1, -1, 2, 0, 0, 0, 0, 0], category: 'Weak' },
      ];
    }
    case 'F4': {
      const roots: Vector8D[] = [];
      for (let i = 0; i < 4; i++) {
        for (let j = i + 1; j < 4; j++) {
          for (const s1 of [1, -1]) {
            for (const s2 of [1, -1]) {
              const c = [0,0,0,0,0,0,0,0]; c[i]=s1; c[j]=s2; roots.push({ coords: c, category: 'Strong' });
            }
          }
        }
      }
      for (let i = 0; i < 4; i++) {
        for (const s of [1, -1]) {
          const c = [0,0,0,0,0,0,0,0]; c[i]=s; roots.push({ coords: c, category: 'Weak' });
        }
      }
      for (let i = 0; i < 16; i++) {
        const c = [0,0,0,0,0,0,0,0];
        for (let j = 0; j < 4; j++) c[j] = ((i >> j) & 1) ? -0.5 : 0.5;
        roots.push({ coords: c, category: 'Fermion' });
      }
      return roots;
    }
    case 'E6': {
      return generateE8RootsRaw()
        .filter(r => Math.abs(r.coords[0] + r.coords[1]) < 0.001 && Math.abs(r.coords[1] + r.coords[2]) < 0.001)
        .map(r => ({ ...r, category: r.coords.some(c => c === 0.5 || c === -0.5) ? 'Fermion' : 'Strong' }));
    }
    case 'E7': {
      return generateE8RootsRaw()
        .filter(r => Math.abs(r.coords[0] + r.coords[1]) < 0.001)
        .map(r => ({ ...r, category: r.coords.some(c => c === 0.5 || c === -0.5) ? 'Fermion' : 'Strong' }));
    }
    case 'E8': {
      return generateE8RootsRaw().map((r, i) => {
        let category: ParticleCategory = 'None';
        const c = r.coords;
        if (c.some(v => Math.abs(v) === 0.5)) category = 'Fermion';
        else if (c[0] !== 0 && c[1] !== 0) category = 'Weak';
        else if (c[2] !== 0 || c[3] !== 0) category = 'Strong';
        else if (c[4] !== 0 || c[5] !== 0) category = 'Electromagnetic';
        else category = 'Gravitational';
        return { ...r, category };
      });
    }
    default: return [];
  }
};

export const getPetrieBasis = (rank: number) => {
  const basisX = [];
  const basisY = [];
  for (let i = 0; i < 8; i++) {
    const angle = (2 * Math.PI * i) / rank;
    basisX.push(Math.cos(angle));
    basisY.push(Math.sin(angle));
  }
  return [basisX, basisY];
};

export const SIMPLE_BASIS = [
  [1, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 0, 0, 0, 0, 0, 0]
];

/**
 * Projects 8D roots to 2D with optional Wick Rotation time evolution.
 * Wick Rotation: mixes dimensions according to a time parameter to simulate Lorentzian drift.
 */
export const projectTo2D = (
  roots: Vector8D[],
  angle: number,
  basisVectors: number[][],
  progress: number = 1,
  wickRotation: number = 0,
  universeTime: number = 0
): { id: number; x: number; y: number; original: Vector8D }[] => {
  const interpolatedBasis = basisVectors.map((targetRow, rowIndex) => {
    const simpleRow = SIMPLE_BASIS[rowIndex];
    return targetRow.map((targetVal, colIndex) => {
      return (1 - progress) * simpleRow[colIndex] + progress * targetVal;
    });
  });

  return roots.map((root, idx) => {
    // Apply Wick Distortion: Drift along the vector itself as if it were a velocity
    // modulated by universeTime and the wickRotation parameter.
    const evolvedCoords = root.coords.map((c, i) => {
      // Each dimension expands/contracts based on its own value and the 8th dimension (Time-like)
      const drift = c * Math.sin(universeTime + idx) * wickRotation * 0.4;
      return c + drift;
    });

    let x = 0;
    let y = 0;
    for (let i = 0; i < 8; i++) {
      x += evolvedCoords[i] * interpolatedBasis[0][i];
      y += evolvedCoords[i] * interpolatedBasis[1][i];
    }
    const rx = x * Math.cos(angle) - y * Math.sin(angle);
    const ry = x * Math.sin(angle) + y * Math.cos(angle);
    return { id: idx, x: rx, y: ry, original: root };
  });
};

export const projectSingleVector = (
  vector: Vector8D,
  angle: number,
  basisVectors: number[][],
  progress: number = 1,
  wickRotation: number = 0,
  universeTime: number = 0
): { x: number; y: number } => {
  const interpolatedBasis = basisVectors.map((targetRow, rowIndex) => {
    const simpleRow = SIMPLE_BASIS[rowIndex];
    return targetRow.map((targetVal, colIndex) => {
      return (1 - progress) * simpleRow[colIndex] + progress * targetVal;
    });
  });

  const evolvedCoords = vector.coords.map((c, i) => {
    const drift = c * Math.sin(universeTime) * wickRotation * 0.4;
    return c + drift;
  });

  let x = 0;
  let y = 0;
  for (let i = 0; i < 8; i++) {
    x += evolvedCoords[i] * interpolatedBasis[0][i];
    y += evolvedCoords[i] * interpolatedBasis[1][i];
  }
  const rx = x * Math.cos(angle) - y * Math.sin(angle);
  const ry = x * Math.sin(angle) + y * Math.cos(angle);
  return { x: rx, y: ry };
};
