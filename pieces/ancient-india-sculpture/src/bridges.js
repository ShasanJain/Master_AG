// =====================================================================
//  ERAS, CAMERAS, BRIDGES — Ancient Indian Sculpture
//  Colours use inkRGB plate tones so all cross-fades remain within Risograph inks.
// =====================================================================

// Background tones per era:
// 0. Indus: Terracotta Ochre (pink 0.45, yellow 0.85, teal 0.05)
// 1. Maurya: Polished Sandstone Cream (yellow 0.65, pink 0.25, teal 0.1)
// 2. Gupta: Sacred Lotus Ivory (yellow 0.4, pink 0.15, teal 0.12)
// 3. Elephanta: Deep Basalt Shadow (teal 0.65, pink 0.5, yellow 0.35)
// 4. Chola: Sacred Bronze Patina & Fire (teal 0.35, pink 0.65, yellow 0.9)
const ERA_BG = [
  rgbHex(inkRGB({ pink: 0.35, yellow: 0.75, teal: 0.05 })),
  rgbHex(inkRGB({ yellow: 0.55, pink: 0.22, teal: 0.08 })),
  rgbHex(inkRGB({ yellow: 0.35, pink: 0.15, teal: 0.15 })),
  rgbHex(inkRGB({ teal: 0.55, pink: 0.45, yellow: 0.25 })),
  rgbHex(inkRGB({ pink: 0.5, yellow: 0.8, teal: 0.2 }))
];

function pieceCam(era, t) {
  // Gentle cinematic push/pull per era
  if (era === 0) return push(t, 1.0, 7.5, { z: 1.06, p: [540, 960], to: [540, 920] });
  if (era === 1) return push(t, 10.0, 16.5, { z: 1.08, p: [540, 960], to: [540, 900] });
  if (era === 2) return push(t, 19.0, 25.5, { z: 1.05, p: [540, 960], to: [540, 940] });
  if (era === 3) return push(t, 28.0, 34.5, { z: 1.1, p: [540, 960], to: [540, 910] });
  return push(t, 37.0, 43.5, { z: 1.12, p: [540, 960], to: [540, 960] });
}

// Geometric point generators for morph targets
function circleShapePts(cx, cy, r, n = 64) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return pts;
}

function chakraSpokePts(cx, cy, rOuter, rInner, spokes = 24) {
  const pts = [];
  const n = spokes * 2;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    const r = (i % 2 === 0) ? rOuter : rInner;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return pts;
}

function lotusHaloPts(cx, cy, r, petals = 16) {
  const pts = [];
  const n = petals * 4;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    const wave = 0.82 + 0.18 * Math.cos(petals * a);
    pts.push([cx + Math.cos(a) * r * wave, cy + Math.sin(a) * r * wave]);
  }
  return pts;
}

function flameRingPts(cx, cy, r, flames = 28) {
  const pts = [];
  const n = flames * 4;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    const tooth = 0.8 + 0.2 * Math.pow(Math.abs(Math.sin(flames * a * 0.5)), 2.5);
    pts.push([cx + Math.cos(a) * r * tooth, cy + Math.sin(a) * r * tooth]);
  }
  return pts;
}

const BRIDGES = [
  // Bridge 0 (t=9.0): Indus Arm Bangles -> Mauryan Ashoka Chakra
  {
    tc: 9.0,
    A: () => ({
      P: circleShapePts(540, 960, 220),
      c: rgbHex(inkRGB({ pink: 0.6, yellow: 0.8, teal: 0.2 }))
    }),
    B: () => ({
      P: chakraSpokePts(540, 960, 230, 205, 24),
      c: rgbHex(inkRGB({ teal: 0.9, pink: 0.3, yellow: 0.2 }))
    })
  },
  // Bridge 1 (t=18.0): Mauryan Chakra -> Gupta Lotus Halo (Prabhamandala)
  {
    tc: 18.0,
    A: () => ({
      P: chakraSpokePts(540, 780, 260, 230, 24),
      c: rgbHex(inkRGB({ teal: 0.8, pink: 0.4, yellow: 0.3 }))
    }),
    B: () => ({
      P: lotusHaloPts(540, 780, 270, 16),
      c: rgbHex(inkRGB({ yellow: 0.9, pink: 0.5, teal: 0.1 }))
    })
  },
  // Bridge 2 (t=27.0): Gupta Lotus Halo -> Elephanta Rock Arch Cavern
  {
    tc: 27.0,
    A: () => ({
      P: lotusHaloPts(540, 780, 280, 16),
      c: rgbHex(inkRGB({ yellow: 0.8, pink: 0.4, teal: 0.15 }))
    }),
    B: () => ({
      P: circleShapePts(540, 840, 310),
      c: rgbHex(inkRGB({ teal: 0.85, pink: 0.7, yellow: 0.4 }))
    })
  },
  // Bridge 3 (t=36.0): Elephanta Rock Arch -> Chola Cosmic Ring of Fire (Tiruvasi)
  {
    tc: 36.0,
    A: () => ({
      P: circleShapePts(540, 840, 310),
      c: rgbHex(inkRGB({ teal: 0.8, pink: 0.65, yellow: 0.3 }))
    }),
    B: () => ({
      P: flameRingPts(540, 940, 360, 28),
      c: rgbHex(inkRGB({ pink: 0.8, yellow: 0.95, teal: 0.15 }))
    })
  }
];

