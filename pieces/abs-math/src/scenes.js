// =====================================================================
//  SCENES — abs-math (Auto-Brewery Syndrome)
//  Manim math / biochemical dynamics explainer.
// =====================================================================

function sceneAct1() {
  const t = seg(TT, 0.0, 5.57);
  fillAll(MC.bg);

  // Title equation: BAC Anomaly
  const EQ_BAC = [
    mv('BAC', MC.red, { id: 'bac' }),
    '=',
    mn('0.16', MC.red, { id: 'val' }),
    mn('%', MC.yellow, { id: 'pct' }),
    '>',
    mn('0.08', MC.yellow, { id: 'lim' }),
    mn('%', MC.grey, { id: 'lim_pct' })
  ];
  writeTex(EQ_BAC, CX, 410, 68, runS(0.2, 0.8));

  const SUB_IN = [
    mv('Ethanol', MC.blue, { id: 'et' }),
    mv('Intake', MC.blue, { id: 'in' }),
    '=',
    mn('0.00', MC.green, { id: 'zero' }),
    mv('g', MC.grey, { id: 'g' })
  ];
  writeTex(SUB_IN, CX, 480, 42, runS(0.8, 0.6));

  // Coordinate axes for BAC trajectory (scoped to 180..810 px width)
  const ORIGIN = [220, 1140];
  const A = axes2({
    at: ORIGIN,
    ux: 125,
    uy: 380,
    x: [0, 4.4],
    y: [0, 0.22],
    ext: 0.15,
    p: runS(0.6, 0.9),
    step: 1,
    tick: 8,
    labels: 22,
    dp: 0
  });

  numberPlane(A, { p: runS(0.5, 0.8), step: 1, sub: 2, x: [0, 4.4], y: [0, 0.22] });

  // Axis Labels
  if (TT >= 1.0) {
    mText('Hours Post-Carbs', ORIGIN[0] + 340, ORIGIN[1] + 45, 24, { color: MC.grey, align: 'right' });
    mText('BAC (%)', ORIGIN[0] - 20, ORIGIN[1] - 90, 24, { color: MC.grey, align: 'right' });
  }

  // Legal Limit reference threshold (0.08% BAC)
  const [limX0, limY] = A.to(0, 0.08);
  const [limX1] = A.to(4.4, 0.08);
  segLine(limX0, limY, limX1, limY, MC.yellow, 2.5, runS(1.2, 0.6));
  ctx.save();
  ctx.setLineDash([8, 8]);
  segLine(limX0, limY, limX1, limY, MC.yellow, 2.5, 1);
  ctx.restore();
  if (TT >= 1.5) {
    mText('Legal Limit (0.08%)', limX0 + 15, limY - 14, 22, { color: MC.yellow, align: 'left' });
  }

  // Anomaly Curve: BAC trajectory spiking up to 0.16%
  const spikeProgress = runS(1.4, 2.2);
  const bacFn = (x) => 0.16 / (1 + Math.exp(-2.8 * (x - 2.2)));
  graphM(A, bacFn, 0, 4.3, spikeProgress, { c: MC.red, w: 5, area: 0.16 });

  // Tracking dot at current BAC reading
  const currT = lerp(0, 4.3, spikeProgress);
  const currBAC = bacFn(currT);
  const dotPos = A.to(currT, currBAC);
  trackDot(dotPos[0], dotPos[1], MC.yellowP, { r: 10, al: spikeProgress > 0 ? 1 : 0 });

  // Live BAC readout widget pinned above graph (avoids edge collisions)
  if (spikeProgress > 0.05) {
    readout([mv('Current', MC.grey), mv('BAC', MC.red)], currBAC, 3, CX - 60, 560, 36, { c: MC.yellowP, align: 'center' });
  }

  // Flash warning at threshold breach
  if (TT >= 2.6 && TT <= 3.4) {
    const breachPos = A.to(2.2, 0.08);
    flashAt(breachPos[0], breachPos[1], (TT - 2.6) / 0.5, MC.yellowP, 40, 4);
  }

  // Pi hero watching graph
  piHero(860, 1320, 0.88, {
    key: 'pi1',
    look: dotPos,
    mood: TT >= 2.5 ? 'wow' : 'calm',
    hop: TT >= 2.5 ? (TT - 2.5) / 0.4 : 0
  });

  mathTag('Auto-Brewery Anomaly');
  mathCaption('0.16% BAC with zero ethanol consumed');
}

function sceneAct2() {
  const t = seg(TT, 5.57, 11.13);
  fillAll(MC.bg);

  // Biochemical Equation (scaled to fit well within safe margins)
  const EQ_CHEM = [
    mv('C', MC.teal, { sub: '6', id: 'c1' }),
    mv('H', MC.teal, { sub: '12', id: 'h1' }),
    mv('O', MC.teal, { sub: '6', id: 'o1' }),
    '➜',
    mn('2', MC.yellow, { id: 'coeff' }),
    mv('C', MC.red, { sub: '2', id: 'c2' }),
    mv('H', MC.red, { sub: '5', id: 'h2' }),
    mv('OH', MC.red, { id: 'oh' }),
    '+',
    mn('2', MC.grey, { id: 'c2_coeff' }),
    mv('CO', MC.grey, { sub: '2', id: 'co2' })
  ];
  writeTex(EQ_CHEM, CX, 420, 56, runS(5.8, 1.0));

  mText('Carbohydrate Fermentation by Saccharomyces', CX, 480, 26, { color: MC.greyC, align: 'center' });

  // Central Biochemical Micro-Reactor Schematic
  const rx = CX, ry = 840;

  // Reactant Box (Glucose)
  showCreation([[rx - 310, ry - 65], [rx - 120, ry - 65], [rx - 120, ry + 65], [rx - 310, ry + 65]], runS(6.2, 0.6), {
    c: MC.teal, w: 3.5, closed: true, fill: 0.12
  });
  mText('GLUCOSE', rx - 215, ry - 15, 28, { color: MC.teal, align: 'center' });
  mText('Substrate', rx - 215, ry + 22, 20, { color: MC.grey, align: 'center' });

  // Enzymatic Conversion Catalyst (Yeast Biome)
  const catProgress = runS(6.6, 0.8);
  showCreation(ellipsePts(rx, ry, 80, 80, 0, 48), catProgress, {
    c: MC.yellow, w: 4, fill: 0.20
  });
  mText('YEAST', rx, ry - 12, 26, { color: MC.yellow, align: 'center' });
  mText('Catalyst', rx, ry + 22, 19, { color: MC.gold, align: 'center' });

  // Arrows bridging Reactant -> Catalyst -> Product
  mArrow(rx - 110, ry, rx - 90, ry, MC.yellow, 3.5, runS(6.8, 0.4));
  mArrow(rx + 90, ry, rx + 110, ry, MC.red, 3.5, runS(7.2, 0.4));

  // Product Box (Ethanol)
  showCreation([[rx + 120, ry - 65], [rx + 310, ry - 65], [rx + 310, ry + 65], [rx + 120, ry + 65]], runS(7.0, 0.6), {
    c: MC.red, w: 3.5, closed: true, fill: 0.15
  });
  mText('ETHANOL', rx + 215, ry - 15, 28, { color: MC.red, align: 'center' });
  mText('Endogenous', rx + 215, ry + 22, 20, { color: MC.grey, align: 'center' });

  // Mathematical Yield Metric Panel below
  const metricY = 1080;
  const MY = [
    mv('Yield', MC.white),
    '=',
    mn('0.51', MC.gold),
    mv('g', MC.grey),
    mv('Ethanol', MC.red),
    '/',
    mv('g', MC.grey),
    mv('Glucose', MC.teal)
  ];
  writeTex(MY, CX, metricY, 38, runS(7.8, 0.7));

  // Rate of Fermentation Live Counter
  const synthRate = lerp(12.4, 94.8, runS(7.5, 2.5));
  readout([mv('Synthesis', MC.grey), mv('Rate', MC.yellow)], synthRate, 1, CX - 40, metricY + 65, 34, {
    c: MC.yellowP, align: 'center'
  });

  // Pi hero examining molecular reaction
  piHero(180, 1320, 0.88, {
    key: 'pi2',
    look: [rx, ry],
    mood: 'wow'
  });

  mathTag('Endogenous Fermentation');
  mathCaption('Intestinal yeast synthesizes pure ethanol');
}

function sceneAct3() {
  const t = seg(TT, 11.13, 16.7);
  fillAll(MC.bg);

  // Impact Header: Clinical & Toxicological Vectors (width ~540px, safe from edges)
  const EQ_TOX = [
    mv('Toxicity', MC.red, { id: 'tox' }),
    '∝',
    mv('Δt', MC.yellow, { id: 'time' }),
    '×',
    mv('[EtOH]', MC.red, { id: 'etoh' })
  ];
  writeTex(EQ_TOX, CX, 420, 52, runS(11.4, 0.8));

  // Multi-Factor Clinical Damage Matrix
  const my = 490;
  mText('Systemic Pathology & Legal Fallout', CX, my, 26, { color: MC.greyC, align: 'center' });

  // Vector Breakdown Grid (width bounded inside 230..850)
  const rows = [
    { label: 'Hepatic AST/ALT', val: '+380%', col: MC.red },
    { label: 'Blood Acetaldehyde', val: '+420%', col: MC.orange },
    { label: 'Cognitive Disorientation', val: '+290%', col: MC.purple },
    { label: 'Arrest Probability', val: 'HIGH', col: MC.maroon }
  ];

  const gy = 590;
  rows.forEach((r, i) => {
    const rowY = gy + i * 105;
    const p = runS(11.8 + i * 0.25, 0.5);

    // Bounding row box
    showCreation([[CX - 310, rowY - 40], [CX + 310, rowY - 40], [CX + 310, rowY + 40], [CX - 310, rowY + 40]], p, {
      c: MC.greyD, w: 2, closed: true, fill: 0.10
    });

    if (p > 0.3) {
      mText(r.label, CX - 280, rowY + 8, 28, { color: MC.white, align: 'left' });
      mText(r.val, CX + 280, rowY + 8, 30, { color: r.col, align: 'right', bold: true });
    }
  });

  // Severe Warning Hazard Banner
  const hazP = runS(13.2, 0.6);
  if (hazP > 0) {
    const hy = 1080;
    showCreation([[CX - 310, hy - 36], [CX + 310, hy - 36], [CX + 310, hy + 36], [CX - 310, hy + 36]], hazP, {
      c: MC.red, w: 3.5, closed: true, fill: 0.20
    });
    mText('CLINICAL EMERGENCY: LIVER CIRRHOSIS', CX, hy + 8, 23, {
      color: MC.yellowP, align: 'center', bold: true
    });
  }

  // Stumbling Pi hero
  const stumble = Math.sin(TT * 6) * 12;
  piHero(CX + stumble, 1340, 0.95, {
    key: 'pi3',
    mood: 'wow',
    hop: Math.sin(TT * 4) * 0.4
  });

  mathTag('Clinical Toxicity');
  mathCaption('Chronic toxicity, liver trauma, and DUI charges');
}
