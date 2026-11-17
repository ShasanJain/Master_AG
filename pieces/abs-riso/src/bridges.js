// =====================================================================
//  BRIDGES & CAMERAS — abs-riso
//  Colors must use rgbHex(inkRGB(...)) so morph fades stay within spot inks.
// =====================================================================
const ERA_BG = [
  rgbHex(inkRGB({ teal: 0.08, pink: 0.18, yellow: 0.35 })), // Warm amber print tone
  rgbHex(inkRGB({ teal: 0.22, pink: 0.12, yellow: 0.28 })), // Teal-yellow gut tone
  rgbHex(inkRGB({ pink: 0.35, teal: 0.15, yellow: 0.08 }))  // Alarm coral tone
];

function pieceCam(era, t) {
  if (era === 0) return push(t, 0.5, 5.0, { z: 1.04, p: [540, 960], to: [540, 930] });
  if (era === 1) return push(t, 6.0, 10.5, { z: 1.05, p: [540, 940], to: [540, 980] });
  return push(t, 11.5, 16.0, { z: 1.06, p: [540, 960], to: [540, 920] });
}

const BRIDGES = [
  {
    tc: 5.57,
    A: () => ({ P: ellipsePts(540, 920, 200, 200, 0, 48), c: rgbHex(inkRGB(MIX.coral)) }),
    B: () => ({ P: ellipsePts(540, 940, 210, 210, 0, 48), c: rgbHex(inkRGB(MIX.green)) })
  },
  {
    tc: 11.13,
    A: () => ({ P: ellipsePts(540, 940, 210, 210, 0, 48), c: rgbHex(inkRGB(MIX.green)) }),
    B: () => ({ P: ellipsePts(540, 920, 200, 200, 0, 48), c: rgbHex(inkRGB(MIX.rust)) })
  }
];
