// =====================================================================
//  SCENES — abs-isometric (Auto-Brewery Syndrome)
//  2:1 dimetric isometric precision line art, white ground, hairline edges.
// =====================================================================

function sceneAct1() {
  const t = seg(TT, 0.0, 5.57);
  setIso(ISO1);

  // Laboratory Plinth: base stacked plates
  const PL = { x: -220, y: -200, w: 440, d: 400 };
  isoPlates(PL.x, PL.y, 0, PL.w, PL.d, [
    { h: 18, r: 36 },
    { h: 14, gap: 6, inset: 12, r: 30 },
    { h: 22, gap: 6, inset: 24, r: 24 }
  ]);
  const PZ = 18 + 6 + 14 + 6 + 22; // 66

  // Carbohydrate Bread Slab on left
  const bx = -150, by = -60, bz = PZ;
  isoBox(bx, by, bz, 110, 110, 32, { r: 16 });
  // Texture on bread top face
  const bTop = faceOf([bx, by, bz + 32], [1, 0, 0], [0, 1, 0]);
  faceRR(bTop, 18, 18, 20, 20, 6, { stroke: PAL.inner });
  faceRR(bTop, 62, 54, 24, 24, 8, { stroke: PAL.inner });
  isoText(bTop, 'CARBS', 55, 100, 16, { color: PAL.textD, align: 'center' });

  // Breathalyzer Diagnostic Testing Console Unit on right
  const dev = { x: 10, y: -120, w: 180, d: 200, h: 80 };
  isoBox(dev.x, dev.y, PZ, dev.w, dev.d, dev.h, { r: 18 });

  // Console Slanted Screen / Control Interface Face
  const devTop = faceOf([dev.x, dev.y, PZ + dev.h], [1, 0, 0], [0, 1, 0]);
  faceRR(devTop, 14, 16, dev.w - 28, dev.d - 32, 10, { fill: PAL.inner, stroke: PAL.edge });

  // Digital LCD Display Screen on Console
  faceRR(devTop, 24, 26, dev.w - 48, 85, 6, { fill: PAL.face, stroke: PAL.accent, w: 3 });
  isoText(devTop, 'BAC: 0.16%', dev.w / 2, 60, 22, { color: PAL.accent, align: 'center', weight: 700 });
  isoText(devTop, 'ALCOHOL: 0.0g', dev.w / 2, 92, 15, { color: PAL.textD, align: 'center' });

  // Status Indicator Lamps
  const lampOn = blinkOn(TT, 0.8);
  lamp(devTop, 40, 140, 6, lampOn);
  accentDot(devTop, 80, 140, 5);
  lamp(devTop, 120, 140, 6, !lampOn);
  isoText(devTop, 'FAIL / ALARM', dev.w / 2, 172, 13, { color: PAL.accent, align: 'center', weight: 600 });

  // Connecting test cable
  isoCable([
    [bx + 110, by + 55, PZ + 16],
    [dev.x - 25, by + 55, PZ + 8],
    [dev.x, dev.y + 60, PZ + 24]
  ], { w: 6 });

  // CubeBot Hero in front, hopping and looking up at testing screen
  const hopPhase = spring(TT, 1.2, { k: 180, damp: 0.5 });
  cubeBot(-40, 100, PZ, 68, {
    key: 'act1_bot',
    hop: [1.2, 3.2],
    look: 0.7
  });

  isoTag('01', 'THE ANOMALY');
  isoCaption('0.16% BAC WITH ZERO DRINKS', { size: 40 });
}

function sceneAct2() {
  const t = seg(TT, 5.57, 11.13);
  setIso(ISO2);

  // Bioreactor Plinth
  const PL = { x: -230, y: -200, w: 460, d: 400 };
  isoPlates(PL.x, PL.y, 0, PL.w, PL.d, [
    { h: 18, r: 36 },
    { h: 14, gap: 6, inset: 14, r: 28 },
    { h: 20, gap: 6, inset: 26, r: 22 }
  ]);
  const PZ = 18 + 6 + 14 + 6 + 20; // 64

  // Central Fermentation Glass Cylinder Bioreactor
  const cyX = 0, cyY = -20, cylR = 72, cylH = 150;
  // Lower pedestal
  isoCyl(cyX, cyY, PZ, cylR + 10, 16);
  // Glass chamber
  isoCyl(cyX, cyY, PZ + 16, cylR, cylH, { fill: PAL.face, edge: PAL.edge });

  // Yeast Culture Colony Trays inside bioreactor
  const numTrays = 3;
  for (let k = 0; k < numTrays; k++) {
    const tz = PZ + 35 + k * 38;
    isoCyl(cyX, cyY, tz, cylR - 14, 10, { fill: PAL.inner, edge: PAL.inner });
  }

  // Fermentation rising bubbles inside chamber
  for (let b = 0; b < 6; b++) {
    const bPhase = (TT * 1.5 + b * 0.38) % 1.0;
    const bx = cyX + Math.sin(b * 1.8) * 35;
    const by = cyY + Math.cos(b * 1.8) * 35;
    const bz = PZ + 30 + bPhase * (cylH - 35);
    faceEll(faceOf([bx, by, bz], [1, 0, 0], [0, 1, 0]), 0, 0, 6, 6, { stroke: PAL.edge, w: 2 });
  }

  // Top reactor cap with exhaust pipe
  isoCyl(cyX, cyY, PZ + 16 + cylH, cylR + 8, 16);
  isoCyl(cyX, cyY, PZ + 32 + cylH, 20, 28);

  // Outflow transfer conduit pipe to ethanol collector vial
  isoCable([
    [cyX, cyY, PZ + 32 + cylH + 28],
    [cyX + 90, cyY - 40, PZ + cylH + 40],
    [150, -40, PZ + 90],
    [150, -40, PZ + 50]
  ], { w: 8 });

  // Ethanol collection flask on right
  isoCyl(150, -40, PZ, 34, 50);
  const vialTop = faceOf([150, -40, PZ + 50], [1, 0, 0], [0, 1, 0]);
  faceRR(vialTop, -22, -22, 44, 44, 12, { stroke: PAL.accent });
  accentDot(vialTop, 0, 0, 7);

  // Biochemical Formula Display Panel in foreground
  const pan = { x: -180, y: 80, w: 160, ht: 70, t: 10 };
  const S_pan = isoPanelY(pan.x, pan.y, PZ, pan.w, pan.ht, pan.t, { r: 8 });
  const panFace = slabFace(S_pan);
  isoText(panFace, 'BIO-FERMENTATION', pan.w / 2, 26, 13, { color: PAL.accent, align: 'center', weight: 700 });
  isoText(panFace, 'CARBS ➜ ETHANOL', pan.w / 2, 48, 12, { color: PAL.text, align: 'center', weight: 600 });

  // CubeBot inspecting reactor
  cubeBot(80, 80, PZ, 66, {
    key: 'act2_bot',
    look: -0.6
  });

  isoTag('02', 'GUT BIOREACTOR');
  isoCaption('YEAST FERMENTS CARBS INTO ETHANOL', { size: 40 });
}

function sceneAct3() {
  const t = seg(TT, 11.13, 16.7);
  setIso(ISO3);

  // Clinical & Legal Terminal Plinth
  const PL = { x: -220, y: -200, w: 440, d: 400 };
  isoPlates(PL.x, PL.y, 0, PL.w, PL.d, [
    { h: 18, r: 36 },
    { h: 14, gap: 6, inset: 12, r: 28 },
    { h: 22, gap: 6, inset: 24, r: 22 }
  ]);
  const PZ = 18 + 6 + 14 + 6 + 22; // 66

  // Central Medical Diagnostics Telemetry Console
  const con = { x: -140, y: -140, w: 280, d: 240, h: 75 };
  isoBox(con.x, con.y, PZ, con.w, con.d, con.h, { r: 18 });

  // Console Telemetry Face
  const conTop = faceOf([con.x, con.y, PZ + con.h], [1, 0, 0], [0, 1, 0]);
  faceRR(conTop, 16, 16, con.w - 32, con.d - 32, 10, { fill: PAL.inner, stroke: PAL.edge });

  // Telemetry Monitor Screen
  faceRR(conTop, 24, 24, con.w - 48, 90, 6, { fill: PAL.face, stroke: PAL.accent, w: 3 });
  isoText(conTop, 'SYSTEMIC TOXICITY', con.w / 2, 50, 16, { color: PAL.accent, align: 'center', weight: 700 });
  isoText(conTop, 'LIVER DAMAGE: +380%', con.w / 2, 75, 14, { color: PAL.accent, align: 'center', weight: 600 });
  isoText(conTop, 'HANGOVERS: CHRONIC', con.w / 2, 96, 13, { color: PAL.textD, align: 'center' });

  // Flashing Emergency Hazard Beacon on Console
  const beaconOn = blinkOn(TT, 0.4);
  isoCyl(-80, -90, PZ + con.h + 12, 18, 28, { fill: beaconOn ? PAL.accent : PAL.face });
  lamp(conTop, 40, 145, 8, beaconOn);
  lamp(conTop, con.w - 40, 145, 8, !beaconOn);

  // Ejected DUI Citation Ticket Card on console
  faceRR(conTop, con.w / 2 - 50, 130, 100, 60, 4, { fill: PAL.face, stroke: PAL.accent, w: 2 });
  isoText(conTop, 'DUI CITATION', con.w / 2, 156, 12, { color: PAL.accent, align: 'center', weight: 700 });
  isoText(conTop, 'COURT DATE REQ', con.w / 2, 176, 10, { color: PAL.textD, align: 'center' });

  // Staggered CubeBot Hero with swayed antenna
  const stumble = Math.sin(TT * 6) * 14;
  cubeBot(stumble, 90, PZ, 72, {
    key: 'act3_bot',
    hop: Math.sin(TT * 4) > 0.5 ? TT : null,
    look: Math.sin(TT * 5) * 0.8
  });

  isoTag('03', 'THE REALITY');
  isoCaption('HANGOVERS, LIVER DAMAGE, AND ARRESTS', { size: 38 });
}
