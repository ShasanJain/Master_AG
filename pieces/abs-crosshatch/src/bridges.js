// Bridges and camera definitions for abs-crosshatch
const ERA_BG = ['#f4ecd9', '#2a1a12', '#0c0d1c'];

function pieceCam(era, t) {
  if (era === 0) return push(t, 0.4, 3.9, { z: 1.02, p: [540, 900], to: [540, 890] });
  if (era === 1) return push(t, 4.6, 9.5, { z: 1.02, p: [540, 900], to: [540, 890] });
  return push(t, 10.2, 16.2, { z: 1.02, p: [540, 900], to: [540, 890] });
}

const BRIDGES = [
  // Bridge 0 (t=4.30): Inked Bread Slice -> Stomach Cross-Section
  {
    tc: 4.30,
    A: () => ({ P: rrectPts(390, 750, 300, 300, 30), c: C.woodD || '#a8773f' }),
    B: () => ({ P: ellipsePts(540, 900, 240, 190, 0.15, 32), c: C.orange || '#e58a4e' })
  },
  // Bridge 1 (t=9.90): Yeast Spore Ring -> Inked Liver Contour
  {
    tc: 9.90,
    A: () => ({ P: ellipsePts(540, 900, 220, 220, 0, 32), c: C.yellow || '#f0c55a' }),
    B: () => ({ P: ellipsePts(540, 900, 260, 180, -0.2, 32), c: C.red || '#d4382c' })
  }
];
