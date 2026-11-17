// =====================================================================
//  SCENES — Auto-Brewery Syndrome (Cut-Paper Style)
// =====================================================================

function sceneHook() {
  const t = seg(TT, 0.0, 4.30);

  // Background
  cut(rect(-30, -30, W + 60, H + 60, 0), '#121826', {
    key: 'hook_bg', shadow: false, tear: 0,
    pat: pat.lines('rgba(255,255,255,0.05)', 40)
  });

  const cx = CX, cy = 880;

  // 1. Toast Bread Slice Cutout
  const breadW = 320, breadH = 340;
  // Crust
  cut(rrectPts(cx - breadW / 2, cy - breadH / 2, breadW, breadH, 50), PAL.woodD, {
    key: 'bread_crust', sy: 14, sb: 20
  });
  // Soft Crumb Center
  cut(rrectPts(cx - breadW / 2 + 25, cy - breadH / 2 + 25, breadW - 50, breadH - 50, 40), PAL.cream, {
    key: 'bread_crumb', shadow: false,
    pat: pat.dots('rgba(160,110,60,0.25)', 4, 22)
  });

  // 2. Breathalyzer Device Popping in on Right
  const bX = cx + 180, bY = cy + 120;
  const pop = popS(E0 + 0.6);
  if (pop > 0.01) {
    ctx.save(); ctx.translate(bX, bY); ctx.scale(pop, pop);
    // Body
    cut(rrectPts(-90, -140, 180, 280, 24), PAL.charcoal, { key: 'tester_body', sy: 12, sb: 18 });
    // LCD Screen
    cut(rrectPts(-70, -110, 140, 90, 10), '#1a2b22', { key: 'tester_lcd', shadow: false });
    // Red LED Warning Text
    handText('0.16%', -55, -45, 42, '#ff4a4a', { weight: 700 });
    handText('BAC', -30, -15, 20, '#ff9999');
    // Straw Tip
    cut(rrectPts(-20, -170, 40, 40, 6), PAL.paper, { key: 'tester_straw', shadow: false });
    ctx.restore();
  }

  // 3. Danger Pill
  tag('TWICE THE LEGAL LIMIT', cx, 520, 38, {
    fill: PAL.orange, color: PAL.ink, s: popS(E0 + 0.4)
  });

  yearTag('Dietary Carbs');
  capStrip('Bread & Pasta Ferment into Blood Alcohol');
}

function sceneMechanism() {
  const t = seg(TT, 4.30, 9.90);

  // Background: Warm Visceral Tone
  cut(rect(-30, -30, W + 60, H + 60, 0), '#281410', {
    key: 'mech_bg', shadow: false, tear: 0,
    pat: pat.stripes('rgba(255,200,100,0.06)', 16, 44, 0.3)
  });

  const cx = CX, cy = 870;

  // 1. Stomach Lumen Cross-Section Outline
  cut(ellipsePts(cx, cy, 320, 240, -0.1, 36), '#4a2016', { key: 'stomach_sac', sy: 14, sb: 22 });
  cut(ellipsePts(cx, cy, 270, 190, -0.1, 32), '#341610', {
    key: 'stomach_inner', shadow: false,
    pat: pat.dots('rgba(255,255,255,0.08)', 3, 20)
  });

  // 2. Fermenting Yeast Colonies (Saccharomyces cerevisiae)
  const yeasts = [
    { x: cx - 90, y: cy - 30, r: 52 },
    { x: cx + 80, y: cy - 20, r: 60 },
    { x: cx - 20, y: cy + 60, r: 48 },
    { x: cx + 120, y: cy + 50, r: 38 }
  ];

  yeasts.forEach((y, i) => {
    // Main Mother Yeast Cell
    cut(ellipsePts(y.x, y.y, y.r, y.r * 1.1, 0.2, 24), PAL.yellow, {
      key: 'yeast_' + i, sy: 6, sb: 12,
      pat: pat.dots('rgba(140,80,10,0.35)', 2.5, 12)
    });
    // Budding Daughter Cell
    cut(ellipsePts(y.x + y.r * 0.7, y.y - y.r * 0.6, y.r * 0.45, y.r * 0.45, 0, 16), PAL.mustard, {
      key: 'yeast_bud_' + i, shadow: false
    });
  });

  // 3. Bubbling Ethanol Droplets & CO2
  for (let b = 0; b < 9; b++) {
    const bx = cx - 180 + b * 45 + Math.sin(b * 2 + t * 6) * 15;
    const by = cy + 120 - ((t * 220 + b * 40) % 260);
    cut(ellipsePts(bx, by, 12, 16, 0, 12), PAL.snow, { key: 'bubble_' + b, shadow: false });
  }

  // Formula Tag
  tag('C6H12O6 -> ETHANOL', cx, 520, 36, {
    fill: PAL.snow, color: PAL.ink, s: popS(E0 + 0.3)
  });

  yearTag('Gut Fermentation');
  capStrip('Fungal Colonies Turn Sugars into Pure Alcohol');
}

function sceneReality() {
  const t = seg(TT, 9.90, 16.70);

  // Background: Emergency Crimson/Charcoal
  cut(rect(-30, -30, W + 60, H + 60, 0), '#180c10', {
    key: 'real_bg', shadow: false, tear: 0,
    pat: pat.lines('rgba(255,70,70,0.08)', 36)
  });

  const cx = CX, cy = 870;

  // 1. Liver Organ Cutout Showing Hepatic Strain
  const liverPts = [
    [cx - 200, cy - 60], [cx - 60, cy - 140], [cx + 160, cy - 120],
    [cx + 240, cy - 10], [cx + 210, cy + 130], [cx + 60, cy + 160],
    [cx - 140, cy + 130], [cx - 220, cy + 40]
  ];
  cut(liverPts, '#8c2d2d', { key: 'liver_body', sy: 14, sb: 22 });

  // Cirrhosis / Strain Fissures
  ink([[cx - 80, cy - 60], [cx - 10, cy + 20], [cx + 80, cy - 30]], {
    w: 5, color: '#381010', key: 'liver_crack_1'
  });
  ink([[cx + 30, cy + 10], [cx + 110, cy + 90]], {
    w: 5, color: '#381010', key: 'liver_crack_2'
  });

  // 2. Police Siren Lightbar Cutout on Top
  const sirY = cy - 250;
  const pulseL = Math.sin(t * 18) > 0 ? '#ff3b3b' : '#330808';
  const pulseR = Math.sin(t * 18) <= 0 ? '#3b7aff' : '#081833';

  // Light Bar Mount
  cut(rrectPts(cx - 160, sirY, 320, 45, 8), PAL.charcoal, { key: 'siren_mount', shadow: false });
  // Red Dome
  cut(rrectPts(cx - 140, sirY - 50, 120, 50, 16), pulseL, { key: 'siren_red', sy: 8, sb: 18 });
  // Blue Dome
  cut(rrectPts(cx + 20, sirY - 50, 120, 50, 16), pulseR, { key: 'siren_blue', sy: 8, sb: 18 });

  // 3. Diagnosis Pill Banners
  tag('CHRONIC TOXICITY', cx, 500, 42, {
    fill: PAL.snow, color: '#991111', s: popS(E0 + 0.3)
  });

  tag('LIVER DAMAGE • UNJUST DUIS', cx, 590, 32, {
    fill: PAL.yellow, color: PAL.ink, s: popS(E0 + 0.6)
  });

  yearTag('Severe Pathology');
  capStrip('Non-stop Hangovers Without Drinking a Drop');
}
