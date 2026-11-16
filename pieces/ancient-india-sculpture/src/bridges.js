// =====================================================================
//  ERAS, CAMERAS, BRIDGES — Ancient Indian Sculpture (Cut-Paper Style)
//  ERA_BG: dominant wall color per era (morph fade to blank paper).
//  BRIDGES: { tc, A: () => ({ P, c }), B: () => ({ P, c }) }
// =====================================================================

const ERA_BG = ['#c08048', '#d9a441', '#a9d9c6', '#141c40', '#26315f'];

function pieceCam(era, t) {
  if (era === 0) return push(t, 1.0, 7.5, { z: 1.05, p: [540, 960], to: [540, 920] });
  if (era === 1) return push(t, 10.0, 16.5, { z: 1.06, p: [540, 960], to: [540, 900] });
  if (era === 2) return push(t, 19.0, 25.5, { z: 1.05, p: [540, 960], to: [540, 940] });
  if (era === 3) return push(t, 28.0, 34.5, { z: 1.08, p: [540, 960], to: [540, 910] });
  return push(t, 37.0, 43.5, { z: 1.1, p: [540, 960], to: [540, 960] });
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
  // Bridge 0 (t=9.0): Indus Bangles -> Mauryan 24-Spoke Chakra
  {
    tc: 9.0,
    A: () => ({ P: ellipsePts(540, 960, 220, 220, 0, 64), c: PAL.yellow }),
    B: () => ({ P: chakraSpokePts(540, 960, 230, 205, 24), c: PAL.blue })
  },
  // Bridge 1 (t=18.0): Mauryan Chakra -> Gupta Lotus Halo (Prabhamandala)
  {
    tc: 18.0,
    A: () => ({ P: chakraSpokePts(540, 780, 260, 230, 24), c: PAL.blue }),
    B: () => ({ P: lotusHaloPts(540, 780, 270, 16), c: PAL.yellow })
  },
  // Bridge 2 (t=27.0): Gupta Lotus Halo -> Elephanta Rock Arch Cavern
  {
    tc: 27.0,
    A: () => ({ P: lotusHaloPts(540, 780, 280, 16), c: PAL.yellow }),
    B: () => ({ P: ellipsePts(540, 840, 310, 310, 0, 64), c: PAL.charcoal })
  },
  // Bridge 3 (t=36.0): Elephanta Rock Arch -> Chola Cosmic Ring of Fire (Tiruvasi)
  {
    tc: 36.0,
    A: () => ({ P: ellipsePts(540, 840, 310, 310, 0, 64), c: PAL.charcoal }),
    B: () => ({ P: flameRingPts(540, 960, 380, 28), c: PAL.orange })
  }
];
