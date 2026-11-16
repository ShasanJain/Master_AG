// =====================================================================
//  ERAS, CAMERAS, BRIDGES — Ancient Indian Sculpture (Cut-Paper Style)
//  ERA_BG: dominant wall color per era (morph fade to blank paper).
//  BRIDGES: { tc, A: () => ({ P, c }), B: () => ({ P, c }) }
// =====================================================================

const ERA_BG = ['#1a1f38', '#c08048', '#d9a441', '#a9d9c6', '#141c40', '#26315f', '#221929'];

function pieceCam(era, t) {
  if (era === 0) return push(t, 0.5, 6.8, { z: 1.05, p: [540, 960], to: [540, 940] });
  if (era === 1) return push(t, 8.2, 14.2, { z: 1.05, p: [540, 960], to: [540, 920] });
  if (era === 2) return push(t, 15.8, 21.8, { z: 1.06, p: [540, 960], to: [540, 900] });
  if (era === 3) return push(t, 23.2, 29.2, { z: 1.05, p: [540, 960], to: [540, 940] });
  if (era === 4) return push(t, 30.8, 36.8, { z: 1.08, p: [540, 960], to: [540, 910] });
  if (era === 5) return push(t, 38.2, 44.2, { z: 1.08, p: [540, 960], to: [540, 960] });
  return push(t, 45.8, 51.5, { z: 1.05, p: [540, 960], to: [540, 950] });
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
  // Bridge 0 (t=7.5): Intro Lotus Medallion -> Indus Disc
  {
    tc: 7.5,
    A: () => ({ P: lotusHaloPts(540, 960, 240, 16), c: PAL.yellow }),
    B: () => ({ P: ellipsePts(540, 960, 220, 220, 0, 64), c: PAL.woodD })
  },
  // Bridge 1 (t=15.0): Indus Bangles -> Mauryan 24-Spoke Chakra
  {
    tc: 15.0,
    A: () => ({ P: ellipsePts(540, 960, 220, 220, 0, 64), c: PAL.yellow }),
    B: () => ({ P: chakraSpokePts(540, 960, 230, 205, 24), c: PAL.blue })
  },
  // Bridge 2 (t=22.5): Mauryan Chakra -> Gupta Lotus Halo (Prabhamandala)
  {
    tc: 22.5,
    A: () => ({ P: chakraSpokePts(540, 780, 260, 230, 24), c: PAL.blue }),
    B: () => ({ P: lotusHaloPts(540, 780, 270, 16), c: PAL.yellow })
  },
  // Bridge 3 (t=30.0): Gupta Lotus Halo -> Elephanta Rock Arch Cavern
  {
    tc: 30.0,
    A: () => ({ P: lotusHaloPts(540, 780, 280, 16), c: PAL.yellow }),
    B: () => ({ P: ellipsePts(540, 840, 310, 310, 0, 64), c: PAL.charcoal })
  },
  // Bridge 4 (t=37.5): Elephanta Rock Arch -> Chola Cosmic Ring of Fire (Tiruvasi)
  {
    tc: 37.5,
    A: () => ({ P: ellipsePts(540, 840, 310, 310, 0, 64), c: PAL.charcoal }),
    B: () => ({ P: flameRingPts(540, 960, 380, 28), c: PAL.orange })
  },
  // Bridge 5 (t=45.0): Chola Cosmic Ring of Fire -> Outro Sun Lotus Emblem
  {
    tc: 45.0,
    A: () => ({ P: flameRingPts(540, 960, 380, 28), c: PAL.orange }),
    B: () => ({ P: lotusHaloPts(540, 960, 280, 20), c: PAL.yellow })
  }
];
