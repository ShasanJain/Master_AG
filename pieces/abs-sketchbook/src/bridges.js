// =====================================================================
//  BRIDGES & CAMERAS — abs-sketchbook
// =====================================================================
const ERA_BG = [SK.paper, SK.paper, SK.paper];

function pieceCam(era, t) {
  if (era === 0) return push(t, 0.5, 5.0, { z: 1.03, p: [540, 960], to: [540, 940] });
  if (era === 1) return push(t, 6.0, 10.5, { z: 1.04, p: [540, 940], to: [540, 970] });
  return push(t, 11.5, 16.0, { z: 1.04, p: [540, 960], to: [540, 930] });
}

const BRIDGES = [
  {
    tc: 5.57,
    A: () => ({ P: ellipsePts(540, 920, 190, 190, 0, 48), c: SK.terra }),
    B: () => ({ P: ellipsePts(540, 940, 200, 200, 0, 48), c: SK.blue })
  },
  {
    tc: 11.13,
    A: () => ({ P: ellipsePts(540, 940, 200, 200, 0, 48), c: SK.blue }),
    B: () => ({ P: ellipsePts(540, 920, 190, 190, 0, 48), c: SK.red })
  }
];
