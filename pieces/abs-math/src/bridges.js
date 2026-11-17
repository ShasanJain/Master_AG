// =====================================================================
//  BRIDGES & CAMERAS — abs-math
//  Manim math explainer: stages hold still on near-black MC.bg.
// =====================================================================
const ERA_BG = [MC.bg, MC.bg, MC.bg];

function pieceCam(era, t) {
  return null; // Manim cameras hold stage steady
}

const BRIDGES = [
  {
    tc: 5.57,
    A: () => ({ P: ellipsePts(540, 920, 200, 200, 0, 64), c: MC.red }),
    B: () => ({ P: ellipsePts(540, 920, 210, 210, 0, 64), c: MC.teal })
  },
  {
    tc: 11.13,
    A: () => ({ P: ellipsePts(540, 920, 210, 210, 0, 64), c: MC.teal }),
    B: () => ({ P: ellipsePts(540, 920, 200, 200, 0, 64), c: MC.maroon })
  }
];
