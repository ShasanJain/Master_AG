// =====================================================================
//  ERAS, CAMERAS, BRIDGES — abs-isometric
// =====================================================================
const ERA_BG = [PAL.paper, PAL.paper, PAL.paper];

const ISO1 = { ox: 520, oy: 960, u: 1.0 };
const ISO2 = { ox: 520, oy: 950, u: 1.0 };
const ISO3 = { ox: 520, oy: 970, u: 1.0 };

function pieceCam(era, t) {
  if (era === 0) return push(t, 0.5, 5.0, { z: 1.03, p: [520, 960], to: [520, 940] });
  if (era === 1) return push(t, 6.0, 10.5, { z: 1.03, p: [520, 950], to: [520, 960] });
  return push(t, 11.5, 16.0, { z: 1.03, p: [520, 970], to: [520, 950] });
}

const BRIDGES = [
  {
    tc: 5.57,
    A: () => ({ P: ellipsePts(520, 930, 180, 180, 0, 48), c: PAL.accent }),
    B: () => ({ P: ellipsePts(520, 930, 190, 190, 0, 48), c: PAL.edge })
  },
  {
    tc: 11.13,
    A: () => ({ P: ellipsePts(520, 930, 190, 190, 0, 48), c: PAL.edge }),
    B: () => ({ P: ellipsePts(520, 930, 180, 180, 0, 48), c: PAL.accent })
  }
];
