// =====================================================================
//  ERAS, CAMERAS, BRIDGES — The Younger Dryas (Cut-Paper Style)
//  ERA_BG: dominant wall color per era.
//  BRIDGES: { tc, A: () => ({ P, c }), B: () => ({ P, c }) }
// =====================================================================

const ERA_BG = [
  '#121e33', // 0: Glacial Ice Sea Navy
  '#3a140d', // 1: Atmospheric Impact Crimson Fire
  '#141418', // 2: Soot Black Mat Charcoal
  '#10283e', // 3: Torrential Deluge Ocean Blue
  '#1c2838', // 4: Permafrost Deep Freeze Blue-Grey
  '#3a2618', // 5: Anatolian Megalithic Sandstone
  '#101526'  // 6: Cosmic Night Sky Coda
];

function pieceCam(era, t) {
  if (era === 0) return push(t, 0.4, 6.6, { z: 1.05, p: [540, 960], to: [540, 940] });
  if (era === 1) return push(t, 7.8, 13.8, { z: 1.08, p: [540, 960], to: [540, 900] });
  if (era === 2) return push(t, 15.0, 21.0, { z: 1.06, p: [540, 960], to: [540, 930] });
  if (era === 3) return push(t, 22.2, 28.2, { z: 1.07, p: [540, 960], to: [540, 950] });
  if (era === 4) return push(t, 29.4, 35.4, { z: 1.05, p: [540, 960], to: [540, 920] });
  if (era === 5) return push(t, 36.6, 42.6, { z: 1.06, p: [540, 960], to: [540, 940] });
  return push(t, 43.8, 49.2, { z: 1.05, p: [540, 960], to: [540, 950] });
}

function iceCrystalPts(cx, cy, r, points = 6) {
  const pts = [];
  const n = points * 4;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    const wave = 0.55 + 0.45 * Math.pow(Math.abs(Math.cos(points * a * 0.5)), 4);
    pts.push([cx + Math.cos(a) * r * wave, cy + Math.sin(a) * r * wave]);
  }
  return pts;
}

function flameBurstPts(cx, cy, r, flames = 24) {
  const pts = [];
  const n = flames * 4;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    const tooth = 0.75 + 0.25 * Math.pow(Math.abs(Math.sin(flames * a * 0.5)), 3.0);
    pts.push([cx + Math.cos(a) * r * tooth, cy + Math.sin(a) * r * tooth]);
  }
  return pts;
}

function tPillarPts(cx, cy, w, h, capW, capH) {
  const hw = w / 2, chw = capW / 2;
  return [
    [cx - chw, cy - h / 2], [cx + chw, cy - h / 2],
    [cx + chw, cy - h / 2 + capH], [cx + hw, cy - h / 2 + capH],
    [cx + hw, cy + h / 2], [cx - hw, cy + h / 2],
    [cx - hw, cy - h / 2 + capH], [cx - chw, cy - h / 2 + capH]
  ];
}

const BRIDGES = [
  // Bridge 0 (t=7.2): Northern Ice Cap Disc -> Incoming Comet Fireball
  {
    tc: 7.2,
    A: () => ({ P: ellipsePts(540, 960, 240, 240, 0, 48), c: PAL.snow }),
    B: () => ({ P: flameBurstPts(540, 960, 260, 20), c: PAL.orange })
  },
  // Bridge 1 (t=14.4): Comet Fireball -> Black Mat Carbon Layer / Tusk Arc
  {
    tc: 14.4,
    A: () => ({ P: flameBurstPts(540, 960, 260, 20), c: PAL.orange }),
    B: () => ({ P: ellipsePts(540, 960, 280, 180, 0, 48), c: PAL.charcoal })
  },
  // Bridge 2 (t=21.6): Mammoth Tusk / Soot Arch -> Megaflood Water Surge Wave
  {
    tc: 21.6,
    A: () => ({ P: ellipsePts(540, 960, 280, 180, 0, 48), c: PAL.charcoal }),
    B: () => ({ P: ellipsePts(540, 960, 290, 220, 0, 48), c: PAL.teal })
  },
  // Bridge 3 (t=28.8): Ocean Wave Surge -> Permafrost Glacial Crystal
  {
    tc: 28.8,
    A: () => ({ P: ellipsePts(540, 960, 290, 220, 0, 48), c: PAL.teal }),
    B: () => ({ P: iceCrystalPts(540, 960, 260, 6), c: PAL.snow })
  },
  // Bridge 4 (t=36.0): Glacial Crystal -> Göbekli Tepe Megalithic T-Pillar
  {
    tc: 36.0,
    A: () => ({ P: iceCrystalPts(540, 960, 260, 6), c: PAL.snow }),
    B: () => ({ P: tPillarPts(540, 960, 180, 520, 360, 140), c: PAL.mustard })
  },
  // Bridge 5 (t=43.2): Göbekli T-Pillar -> Cosmic Replay Constellation Disc
  {
    tc: 43.2,
    A: () => ({ P: tPillarPts(540, 960, 180, 520, 360, 140), c: PAL.mustard }),
    B: () => ({ P: ellipsePts(540, 960, 250, 250, 0, 48), c: PAL.yellow })
  }
];
