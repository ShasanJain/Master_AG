// =====================================================================
//  SCENES — Rise of Hybrid Vehicles in India (Crosshatch Ink Style)
// =====================================================================

function sceneTax() {
  const t = seg(TT, 0.0, 11.0);

  // 1. Archival Parchment Sheet with Fine Ruled Ledger Lines
  paperSheet('tax_sheet', { fill: C.paper, ruled: true });

  const cx = CX, cy = 880;

  // 2. Classical Scales of Justice (Engraved Brass Balance)
  const beamY = cy - 240;
  // Central Pillar
  paint(rrectPts(cx - 14, beamY - 40, 28, 480, 8), {
    fill: C.woodD, key: 'scale_pillar', w: 3,
    tex: [{ k: 'cross', c: C.ink, al: 0.45, gap: 5 }]
  });
  // Top Finial
  paint(ellipsePts(cx, beamY - 50, 32, 32, 0, 24), {
    fill: C.wood, key: 'pillar_top', w: 2.5
  });

  // Tilted Beam: heavy tax side (right) pulled downward
  const tilt = 0.12 * Math.sin(t * 1.5);
  ctx.save();
  ctx.translate(cx, beamY);
  ctx.rotate(tilt);

  // Balance Arm
  paint(rrectPts(-340, -10, 680, 20, 6), {
    fill: C.wood, key: 'balance_arm', w: 2.8,
    tex: [{ k: 'hatch', a: 0.3, gap: 4, al: 0.35 }]
  });

  // Left Pan: 5% EV Plug
  const leftX = -300, leftY = 160;
  ink([[-300, 0], [leftX, leftY]], { w: 2, color: C.ink, key: 'chain_l' });
  paint(rrectPts(leftX - 90, leftY, 180, 24, 8), { fill: C.woodD, key: 'pan_l', w: 2.2 });
  // EV Battery Plug Symbol
  paint(rrectPts(leftX - 45, leftY - 80, 90, 70, 14), {
    fill: C.tealL, key: 'ev_plug', w: 2.5,
    tex: [{ k: 'hatch', a: -0.5, gap: 4, al: 0.4 }]
  });
  monoText('5% GST', leftX - 42, leftY - 35, 24, C.teal, { weight: 700 });
  monoText('EV SUBSIDY', leftX - 52, leftY + 50, 18, C.ink, { weight: 500 });

  // Right Pan: 43% Massive Hybrid Tax Gavel & SUV Block
  const rightX = 300, rightY = 220;
  ink([[300, 0], [rightX, rightY]], { w: 2, color: C.ink, key: 'chain_r' });
  paint(rrectPts(rightX - 120, rightY, 240, 28, 8), { fill: C.woodD, key: 'pan_r', w: 2.5 });
  // Crushing Tax Gavel Weight
  paint(rrectPts(rightX - 85, rightY - 140, 170, 125, 16), {
    fill: C.roseD, key: 'tax_weight', w: 3.5,
    tex: [{ k: 'cross', c: C.ink, al: 0.6, gap: 4 }]
  });
  monoText('43% GST', rightX - 55, rightY - 70, 32, C.white, { weight: 800 });
  monoText('28% + 15% CESS', rightX - 68, rightY - 30, 18, C.cream, { weight: 600 });
  monoText('HYBRID TAX PENALTY', rightX - 88, rightY + 55, 18, C.red, { weight: 700 });

  ctx.restore();

  // 3. Counter-Intuitive Demand Badge (Surge Banner)
  const bannerPop = popS(E0 + 0.5);
  if (bannerPop > 0.01) {
    ctx.save();
    ctx.translate(cx, cy + 340);
    ctx.scale(bannerPop, bannerPop);
    paint(rrectPts(-220, -50, 440, 100, 20), {
      fill: C.cream, key: 'surge_banner', w: 3,
      tex: [{ k: 'stipple', c: C.ink, al: 0.3, s: 2, n: 400 }]
    });
    monoText('BOOKINGS: >50% HYBRID', -180, -10, 26, C.ink, { weight: 700 });
    monoText('HYCROSS & GRAND VITARA', -150, 25, 20, C.woodD, { weight: 600 });
    ctx.restore();
  }

  inkTag('The Tax Paradox');
  inkCaption('43% Tax Burden Fails to Stop Indian Hybrid Boom');
}

function scenePowertrain() {
  const t = seg(TT, 11.0, 23.0);

  // 1. Engraved Technical Drafting Background
  paint(box(-30, -30, W + 60, H + 60), {
    raw: true, line: false, fill: '#1d1916', key: 'mech_draft_bg',
    tex: [{ k: 'hatch', a: -0.4, gap: 7, c: '#362b24', al: 0.4 }]
  });

  const cx = CX, cy = 860;

  // 2. Hybrid Synergy Drive Architectural Schematic
  // Central Power Split Device (Planetary Ring Gear)
  const rot = t * TAU * 1.5;
  ctx.save();
  ctx.translate(cx, cy - 60);
  paint(ellipsePts(0, 0, 180, 180, 0, 48), {
    fill: '#2a221b', key: 'ring_gear', w: 3.5, line: C.cream,
    tex: [{ k: 'cross', c: C.ink, al: 0.5, gap: 5 }]
  });
  // Gear Teeth Rim
  for (let a = 0; a < TAU; a += TAU / 16) {
    const gx = Math.cos(a + rot) * 180, gy = Math.sin(a + rot) * 180;
    dot(gx, gy, 8, C.woodL);
  }
  // Sun Gear Core
  paint(ellipsePts(0, 0, 75, 75, 0, 36), {
    fill: C.woodD, key: 'sun_gear', w: 2.5, line: C.white
  });
  monoText('POWER SPLIT', -58, 6, 17, C.white, { weight: 600 });
  ctx.restore();

  // Left Component: 1.5L Petrol Engine Block (Cutaway with Piston)
  paint(rrectPts(cx - 360, cy - 180, 170, 240, 14), {
    fill: '#3a271d', key: 'engine_block', w: 3, line: C.cream,
    tex: [{ k: 'hatch', a: 0.7, gap: 5, al: 0.4 }]
  });
  monoText('PETROL ENGINE', cx - 345, cy - 130, 18, C.white, { weight: 700 });
  // Engine State Tag (SHUT DOWN in city jams)
  const engineOff = Math.sin(t * 8) > 0;
  paint(rrectPts(cx - 345, cy - 20, 140, 45, 8), {
    fill: engineOff ? C.green : '#662211', key: 'eng_tag', w: 2
  });
  monoText(engineOff ? 'IDLE: OFF' : 'CHARGE', cx - 325, cy + 8, 18, C.white, { weight: 700 });

  // Right Component: Electric Traction Motor & Battery Buffer
  paint(rrectPts(cx + 190, cy - 180, 170, 240, 14), {
    fill: '#1b322a', key: 'motor_block', w: 3, line: C.tealL,
    tex: [{ k: 'cross', c: '#0f1f1a', al: 0.5, gap: 5 }]
  });
  monoText('ELECTRIC MOTOR', cx + 205, cy - 130, 18, C.tealL, { weight: 700 });
  // Battery State (Regenerative Flow)
  paint(rrectPts(cx + 205, cy - 20, 140, 45, 8), {
    fill: C.teal, key: 'bat_tag', w: 2
  });
  monoText('EV GLIDE 60%', cx + 215, cy + 8, 17, C.white, { weight: 700 });

  // Energy Linkages (Shafts)
  ink([[cx - 190, cy - 60], [cx - 180, cy - 60]], { w: 5, color: C.woodL, key: 'shaft_l' });
  ink([[cx + 180, cy - 60], [cx + 190, cy - 60]], { w: 5, color: C.tealL, key: 'shaft_r' });

  // 3. Technical Mileage Gauge Plaque
  const plaquePop = popS(E0 + 0.4);
  if (plaquePop > 0.01) {
    ctx.save();
    ctx.translate(cx, cy + 280);
    ctx.scale(plaquePop, plaquePop);
    paint(rrectPts(-260, -70, 520, 140, 24), {
      fill: C.paper, key: 'mileage_plaque', w: 3.5,
      tex: [{ k: 'hatch', a: 0.2, gap: 4, al: 0.25 }]
    });
    monoText('CERTIFIED FUEL ECONOMY', -175, -28, 22, C.woodD, { weight: 700 });
    monoText('27.97 KM/L', -150, 25, 46, C.ink, { weight: 900 });
    monoText('ARAI OFFICIAL STANDARD', -120, 52, 17, C.green, { weight: 600 });
    ctx.restore();
  }

  inkTag('Dual Powertrain');
  inkCaption('Engine Shuts Off in City Traffic -> 28 km/L');
}

function sceneRange() {
  const t = seg(TT, 23.0, 34.0);

  // 1. Classical Cartographic Parchment Ground
  paperSheet('range_sheet', { fill: C.paper, ruled: false });

  const cx = CX, cy = 870;

  // 2. Navigational Odometer & Compass Dial (1,000 KM Range)
  paint(ellipsePts(cx, cy - 80, 260, 260, 0, 64), {
    fill: '#241a12', key: 'compass_outer', w: 4, line: C.woodL,
    tex: [{ k: 'cross', c: C.ink, al: 0.5, gap: 5 }]
  });
  // Inner Dial
  paint(ellipsePts(cx, cy - 80, 210, 210, 0, 48), {
    fill: C.paper, key: 'compass_inner', w: 2.8,
    tex: [{ k: 'stipple', c: C.woodD, al: 0.35, s: 2, n: 600 }]
  });
  // Compass Cardinal Marks
  dot(cx, cy - 80 - 180, 8, C.red);
  dot(cx, cy - 80 + 180, 8, C.ink);
  dot(cx - 180, cy - 80, 8, C.ink);
  dot(cx + 180, cy - 80, 8, C.ink);

  // Digital Odometer Readout Box
  paint(rrectPts(cx - 170, cy - 130, 340, 100, 16), {
    fill: '#151210', key: 'odo_box', w: 3, line: C.cream
  });
  monoText('RANGE AUTONOMY', cx - 110, cy - 95, 20, C.woodL, { weight: 600 });
  monoText('1,020 KM', cx - 120, cy - 45, 44, C.white, { weight: 900 });

  // Range Sub-Text
  monoText('ONE TANK = DELHI TO MUMBAI', cx - 155, cy + 20, 20, C.ink, { weight: 700 });

  // 3. Crossed-out Broken Highway Charger Motif
  const cordX = cx, cordY = cy + 280;
  paint(rrectPts(cordX - 220, cordY - 60, 440, 120, 20), {
    fill: C.cream, key: 'charger_box', w: 3,
    tex: [{ k: 'hatch', a: -0.3, gap: 4, al: 0.25 }]
  });
  // Broken Charger Icon
  ink([[cordX - 160, cordY - 20], [cordX - 120, cordY + 20]], { w: 4, color: C.red, key: 'cord_wire' });
  dot(cordX - 140, cordY, 14, C.red);
  // Red Strike-through Line
  ink([[cordX - 180, cordY + 30], [cordX - 100, cordY - 30]], { w: 4, color: C.red, key: 'cross_line' });

  monoText('ZERO CHARGER QUEUES', cordX - 85, cordY - 10, 24, C.red, { weight: 800 });
  monoText('REFUELS IN 2 MINUTES', cordX - 85, cordY + 25, 20, C.ink, { weight: 600 });

  inkTag('Range Autonomy');
  inkCaption('1,000 Kilometers on One Tank -> Zero Charging Anxiety');
}

function sceneTriumph() {
  const t = seg(TT, 34.0, 45.0);

  // 1. Imperial Cartographic Background (Map of India Silhouette)
  paperSheet('triumph_sheet', { fill: C.paper, ruled: true });

  const cx = CX, cy = 870;

  // 2. India Arterial Highway Network (Stylized Engraved Hexagonal Grid)
  paint(rrectPts(cx - 240, cy - 250, 480, 500, 32), {
    fill: '#221812', key: 'india_frame', w: 4, line: C.woodL,
    tex: [{ k: 'cross', c: C.ink, al: 0.55, gap: 5 }]
  });

  // National Highway Corridors (Gold / Ivory Engraved Lines)
  const nhLines = [
    [[-160, -180], [0, -60]],
    [[0, -60], [140, -120]],
    [[0, -60], [-80, 120]],
    [[-80, 120], [20, 200]],
    [[140, -120], [80, 140]],
    [[80, 140], [20, 200]]
  ];
  ctx.save();
  ctx.translate(cx, cy);
  for (let i = 0; i < nhLines.length; i++) {
    const [p0, p1] = nhLines[i];
    ink([p0, p1], { w: 3.5, color: C.woodL, key: 'nh_' + i });
    dot(p0[0], p0[1], 7, C.white);
    dot(p1[0], p1[1], 7, C.white);
  }
  // Major Metro Hub Dots
  dot(0, -60, 12, C.red); // Delhi
  dot(-160, -180, 10, C.cream);
  dot(80, 140, 10, C.tealL); // Chennai
  dot(-80, 120, 10, C.green); // Mumbai
  ctx.restore();

  // 3. Triumphant Laurel Crest Banner
  const crestPop = popS(E0 + 0.4);
  if (crestPop > 0.01) {
    ctx.save();
    ctx.translate(cx, cy + 320);
    ctx.scale(crestPop, crestPop);
    paint(rrectPts(-240, -65, 480, 130, 22), {
      fill: C.paper, key: 'triumph_plaque', w: 3.8,
      tex: [{ k: 'stipple', c: C.ink, al: 0.35, s: 2, n: 500 }]
    });
    monoText('THE MARKET VERDICT', -150, -22, 24, C.woodD, { weight: 700 });
    monoText('PRAGMATISM CONQUERS', -175, 18, 28, C.ink, { weight: 900 });
    monoText('MASS MARKET TRANSITION TODAY', -170, 46, 18, C.green, { weight: 600 });
    ctx.restore();
  }

  inkTag('The Market Verdict');
  inkCaption('Pragmatic Hybrid Engineering Wins the Indian Road');
}
