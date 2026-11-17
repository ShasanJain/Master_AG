// Bridges and camera definitions for abs-cut-paper
const ERA_BG = ['#162238', '#2d1c16', '#261214'];

function pieceCam(era, t) {
  if (era === 0) return push(t, 0.4, 3.9, { z: 1.02, p: [540, 900], to: [540, 890] });
  if (era === 1) return push(t, 4.6, 9.5, { z: 1.02, p: [540, 900], to: [540, 890] });
  return push(t, 10.2, 16.2, { z: 1.02, p: [540, 900], to: [540, 890] });
}

const BRIDGES = [
  // Bridge 0 (t=4.30): Bread Slice / Toast -> Stomach Sac
  {
    tc: 4.30,
    A: () => ({ P: rrectPts(390, 750, 300, 300, 40), c: PAL.wood || '#c08048' }),
    B: () => ({ P: ellipsePts(540, 900, 240, 190, 0.2, 32), c: PAL.orange || '#ec7a4f' })
  },
  // Bridge 1 (t=9.90): Yeast Cell Cluster -> Liver Silhouette
  {
    tc: 9.90,
    A: () => ({ P: ellipsePts(540, 900, 220, 220, 0, 32), c: PAL.yellow || '#f6cf55' }),
    B: () => ({ P: ellipsePts(540, 900, 260, 180, -0.2, 32), c: PAL.brick || '#b98576' })
  }
];
