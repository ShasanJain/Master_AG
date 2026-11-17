// =====================================================================
//  SCENES — Auto-Brewery Syndrome (Crosshatch Ink Style)
// =====================================================================

function sceneHook() {
  const t = seg(TT, 0.0, 4.30);

  // 1. Warm Aged Paper Ground with Faint Ruled Lines
  paperSheet('hook_sheet', { fill: C.paper, ruled: true });

  const cx = CX, cy = 880;

  // 2. Anatomical Bread Slice Illustration
  const w = 300, h = 320;
  // Outer Crust with Dense Hatching
  paint(rrectPts(cx - w / 2, cy - h / 2, w, h, 40), {
    fill: C.woodD, key: 'bread_crust', w: 3,
    tex: [{ k: 'cross', c: C.ink, al: 0.35, gap: 5 }]
  });
  // Soft Bread Crumb Center
  paint(rrectPts(cx - w / 2 + 25, cy - h / 2 + 25, w - 50, h - 50, 30), {
    fill: C.cream, key: 'bread_crumb', w: 2.2,
    tex: [{ k: 'stipple', c: C.woodD, al: 0.45, s: 2, n: 600 }]
  });

  // 3. Medical Dial / Breath Tester
  const dialX = cx + 170, dialY = cy + 100;
  const pop = popS(E0 + 0.5);
  if (pop > 0.01) {
    ctx.save(); ctx.translate(dialX, dialY); ctx.scale(pop, pop);
    paint(ellipsePts(0, 0, 110, 110, 0, 36), {
      fill: C.paper, key: 'dial_body', w: 3,
      tex: [{ k: 'hatch', a: 0.8, gap: 4, al: 0.25 }]
    });
    // Inked Gauge Needle Pointing into Red Danger Zone
    ink([[-20, 20], [55, -55]], { w: 4, color: C.red, key: 'needle' });
    dot(0, 0, 8, C.ink);
    // Measured Readout
    monoText('0.16% BAC', -70, -25, 26, C.red, { weight: 700 });
    monoText('LIMIT: 0.08', -65, 45, 18, C.ink, { weight: 400 });
    ctx.restore();
  }

  // 4. Inked Alert Banner
  toolPill('BAC_Surge', '0.16%', cx - 220, 500, E0 + 0.3);

  inkTag('Dietary Ingestion');
  inkCaption('Bread & Carbohydrates Triggering Intoxication');
}

function sceneMechanism() {
  const t = seg(TT, 4.30, 9.90);

  // 1. Dark Visceral Background
  paint(box(-30, -30, W + 60, H + 60), {
    raw: true, line: false, fill: '#24140e', key: 'mech_bg',
    tex: [{ k: 'hatch', a: -0.4, gap: 6, c: '#402014', al: 0.5 }]
  });

  const cx = CX, cy = 870;

  // 2. Stomach Organ Cavity
  paint(ellipsePts(cx, cy, 320, 240, -0.1, 36), {
    fill: '#4a2416', key: 'stomach_sac', w: 3, line: C.cream,
    tex: [{ k: 'cross', c: '#1f0d06', al: 0.45, gap: 6 }]
  });

  // 3. Microscopic Fungal Yeast Colonies (Saccharomyces)
  const colonies = [
    { x: cx - 80, y: cy - 25, r: 54 },
    { x: cx + 75, y: cy - 15, r: 62 },
    { x: cx - 10, y: cy + 55, r: 46 }
  ];

  colonies.forEach((col, i) => {
    paint(ellipsePts(col.x, col.y, col.r, col.r * 1.08, 0, 28), {
      fill: C.yellow, key: 'yeast_' + i, w: 2.6, line: C.ink,
      tex: [{ k: 'stipple', c: C.ink, al: 0.6, s: 2.2, n: 400 }]
    });
    // Budding spore
    paint(ellipsePts(col.x + col.r * 0.7, col.y - col.r * 0.5, col.r * 0.45, col.r * 0.45, 0, 18), {
      fill: C.orange, key: 'yeast_bud_' + i, w: 2, line: C.ink
    });
  });

  // 4. Rising Ethanol Gas Dashes
  for (let s = 0; s < 6; s++) {
    const sx = cx - 140 + s * 55;
    const sy = cy + 100 - ((t * 180 + s * 35) % 240);
    planInk([[sx, sy], [sx + 10, sy - 40]], { w: 3, c: C.cyan, key: 'ethanol_' + s });
  }

  // 5. Inked Chemical Equation Pill
  toolPill('Ferment', 'C6H12O6 -> EtOH', cx - 240, 500, E0 + 0.3);

  inkTag('Gut Fermentation');
  inkCaption('Fungal Colonies Digesting Carbs into Ethanol');
}

function sceneReality() {
  const t = seg(TT, 9.90, 16.70);

  // 1. Dark Medical Reality World (Navy Inside the Machine)
  darkWorld('reality_bg', { fill: C.navy, dust: 200 });

  const cx = CX, cy = 870;

  // 2. Crosshatched Anatomical Liver Organ
  const liverPts = [
    [cx - 190, cy - 50], [cx - 60, cy - 130], [cx + 150, cy - 110],
    [cx + 230, cy - 10], [cx + 200, cy + 120], [cx + 50, cy + 150],
    [cx - 130, cy + 120], [cx - 210, cy + 35]
  ];
  paint(liverPts, {
    fill: C.red, key: 'liver_body', w: 3, line: C.white,
    tex: [{ k: 'cross', c: '#400808', al: 0.55, gap: 5 }]
  });

  // Cirrhosis Necrosis Lines (Red/Black Pencil Inks)
  planInk([[cx - 70, cy - 50], [cx - 10, cy + 20], [cx + 80, cy - 20]], { w: 4, c: C.white, key: 'liver_fissure_1' });
  planInk([[cx + 20, cy + 10], [cx + 100, cy + 80]], { w: 4, c: C.white, key: 'liver_fissure_2' });

  // 3. Siren Lights Flashing in Crosshatch
  const sirY = cy - 240;
  const redOn = Math.sin(t * 18) > 0;
  paint(rrectPts(cx - 140, sirY, 120, 50, 12), {
    fill: redOn ? C.red : '#401010', key: 'siren_red', w: 2.4, line: C.white
  });
  paint(rrectPts(cx + 20, sirY, 120, 50, 12), {
    fill: !redOn ? C.cyan : '#102040', key: 'siren_blue', w: 2.4, line: C.white
  });

  // 4. Clinical Diagnosis Pills
  toolPill('Diagnosis', 'Hepatic Toxicity', cx - 220, 500, E0 + 0.3);

  inkTag('Medical Reality');
  inkCaption('Severe Liver Stress & Involuntary DUI Arrests');
}
