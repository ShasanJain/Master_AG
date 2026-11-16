// =====================================================================
//  SCENES — The Younger Dryas: Earth's Lost Cataclysm
//  Tactile Cut-Paper Collage across 1,200 years of cosmic disaster,
//  megafauna extinction, megafloods, and the rebirth of civilization.
// =====================================================================

// ---------------------------------------------------------------------
// SCENE 0: INTRO TITLE CARD (0.0 - 7.2s) — Earth on the Brink
// ---------------------------------------------------------------------
function sceneIntro() {
  const t = seg(TT, 0.0, 7.2);

  // 1. Ice-Age Deep Navy Paper with subtle latitude grid
  cut(rect(-30, -30, W + 60, H + 60, 0), PAL.night, {
    key: 'intro_bg', shadow: false, tear: 0,
    pat: pat.lines('rgba(200,230,255,0.08)', 44)
  });

  // 2. Glacial Frost Torana / Vignette Frame
  cut(rect(50, 180, W - 100, 30, 4), PAL.snow, { key: 'frost_top', sy: 4, sb: 8 });
  cut(rect(50, 210, 30, H - 420, 4), PAL.ice, { key: 'frost_l', sy: 4, sb: 8 });
  cut(rect(W - 80, 210, 30, H - 420, 4), PAL.ice, { key: 'frost_r', sy: -4, sb: 8 });

  // 3. Planet Earth Globe & Massive Laurentide Ice Sheet
  const cx = CX, cy = 960;
  const pulse = 1.0 + Math.sin(t * TAU * 0.4) * 0.03;

  // Ocean Globe Disc
  cut(ellipsePts(cx, cy, 320 * pulse, 320 * pulse, 0, 48), PAL.blue, {
    key: 'earth_globe', sy: 14, sb: 24,
    pat: pat.stripes('rgba(255,255,255,0.08)', 10, 30, 0.3)
  });

  // Continent Landmass (Greenish-brown Tundra)
  const landPts = [
    [cx - 240, cy - 80], [cx - 60, cy - 220], [cx + 180, cy - 140],
    [cx + 250, cy + 60], [cx + 100, cy + 220], [cx - 160, cy + 180],
    [cx - 250, cy + 40]
  ];
  cut(landPts, PAL.lamp, { key: 'land_tundra', sy: 6, sb: 12 });

  // Massive Northern Laurentide Ice Sheet (Pure White / Ice Blue)
  const iceSheetPts = [
    [cx - 200, cy - 250], [cx + 190, cy - 260],
    [cx + 220, cy - 90],  [cx + 80, cy - 20],
    [cx - 80, cy - 30],   [cx - 210, cy - 100]
  ];
  cut(iceSheetPts, PAL.snow, {
    key: 'laurentide_ice', sy: 10, sb: 16,
    pat: pat.dots('rgba(169,200,220,0.4)', 3, 18)
  });

  // Glacial Meltwater Streams pooling south
  ink([[cx - 40, cy - 30], [cx - 20, cy + 70], [cx - 80, cy + 140]], { w: 6, color: PAL.ice, key: 'melt_1' });
  ink([[cx + 40, cy - 20], [cx + 60, cy + 80], [cx + 30, cy + 150]], { w: 6, color: PAL.ice, key: 'melt_2' });

  // 4. Grand Title Card Banners
  tag('THE YOUNGER DRYAS', CX, 510, 64, {
    rot: -0.012, fill: PAL.snow, color: PAL.night, s: popS(E0 + 0.3)
  });

  tag("EARTH'S LOST CATACLYSM", CX, 630, 42, {
    rot: 0.01, fill: PAL.ice, color: PAL.ink, s: popS(E0 + 0.6)
  });

  tag('12,800 YEARS AGO • THE SUDDEN FLASH FREEZE', CX, 1390, 36, {
    rot: -0.008, fill: PAL.paper, color: PAL.ink, s: popS(E0 + 0.9)
  });

  // Tags & Captions
  yearTag('12,800 BP • 10,800 BCE');
  capStrip('Prologue • Warming Climate Interrupted by Cataclysm');
}

// ---------------------------------------------------------------------
// SCENE 1: THE COMET AIRBURST (7.2 - 14.4s) — Detonation Over the Ice
// ---------------------------------------------------------------------
function sceneImpact() {
  const t = seg(TT, 7.2, 14.4);

  // 1. Fiery Crimson-Orange Atmospheric Background
  cut(rect(-30, -30, W + 60, H + 60, 0), '#381308', {
    key: 'impact_bg', shadow: false, tear: 0,
    pat: pat.stripes('rgba(246,207,85,0.14)', 18, 50, -0.4)
  });

  // 2. Exploding Core Fireball (Central Shockwave)
  const fireX = CX;
  const fireY = 880;
  const blastR = 260 + Math.sin(t * TAU * 1.5) * 20;

  // Outer Shockwave Rings
  cut(flameBurstPts(fireX, fireY, blastR + 90, 24), PAL.orange, {
    key: 'shockwave_outer', sy: 16, sb: 28,
    rot: t * TAU * 0.2
  });

  // Blazing Mid Blast Layer
  cut(flameBurstPts(fireX, fireY, blastR, 18), PAL.yellow, {
    key: 'shockwave_mid', sy: 10, sb: 18,
    rot: -t * TAU * 0.25
  });

  // Blinding Core White Detonation
  cut(ellipsePts(fireX, fireY, 140, 140, 0, 36), PAL.snow, {
    key: 'blast_core', shadow: false
  });

  // 3. Falling Comet Bolide Fragments (Streaking Streaks)
  for (let c = 0; c < 5; c++) {
    const sx = 200 + c * 170;
    const sy = 240 + Math.sin(c * 1.8) * 80 + t * 90;
    // Trailing plasma streak
    ink([[sx - 80, sy - 200], [sx, sy]], { w: 10 + c * 2, color: PAL.orange, key: 'comet_tail_' + c });
    ink([[sx - 50, sy - 140], [sx, sy]], { w: 6, color: PAL.yellow, key: 'comet_core_' + c });
    cut(ellipsePts(sx, sy, 22, 34, 0.3, 14), PAL.snow, { key: 'bolide_head_' + c, shadow: false });
  }

  // 4. Shattered Melting Ice Sheet Horizon below
  const iceHorizonY = 1460;
  cut([
    [-20, iceHorizonY], [260, iceHorizonY - 60], [540, iceHorizonY - 20],
    [800, iceHorizonY - 80], [W + 20, iceHorizonY], [W + 20, H + 20], [-20, H + 20]
  ], PAL.ice, { key: 'ice_horizon', sy: -10, sb: 20 });

  // Molten Glass Spherules / Flying Ejecta
  for (let s = 0; s < 12; s++) {
    const spX = 140 + (s * 73) % 800;
    const spY = 1100 + ((s * 97) % 350) + Math.sin(t * 8 + s) * 20;
    sparkle(spX, spY, 8 + (s % 6), PAL.yellow);
  }

  // Tags & Captions
  yearTag('10,800 BCE • Cosmic Airburst');
  capStrip('Fragmented Comet Detonates Over Laurentide Ice Sheet');
}

// ---------------------------------------------------------------------
// SCENE 2: THE BLACK MAT LAYER (14.4 - 21.6s) — Megafauna Extinction
// ---------------------------------------------------------------------
function sceneBlackMat() {
  const t = seg(TT, 14.4, 21.6);

  // 1. Dark Geological Stratigraphy Background
  cut(rect(-30, -30, W + 60, H + 60, 0), PAL.charcoal, {
    key: 'strata_bg', shadow: false, tear: 0
  });

  // Top Holocene Sand Layer (Post-Impact)
  cut(rect(-20, 260, W + 40, 360, 0), PAL.woodL, {
    key: 'holocene_soil', sy: 8, sb: 14,
    pat: pat.stripes('rgba(255,255,255,0.12)', 10, 30, 0)
  });
  tag('POST-IMPACT SEDIMENTS', CX, 380, 30, { fill: PAL.paper, color: PAL.ink, key: 'sed_tag' });

  // 2. The Famous "BLACK MAT" Boundary Layer (Carbon, Soot & Nanodiamonds)
  const matY = 660;
  const matH = 140;
  cut(rect(-20, matY, W + 40, matH, 0), PAL.ink, {
    key: 'black_mat_layer', sy: 12, sb: 20,
    pat: pat.dots('rgba(255,255,255,0.22)', 2.5, 16)
  });
  tag('THE BLACK MAT LAYER (YD BOUNDARY)', CX, matY + 70, 38, {
    fill: PAL.mustard, color: PAL.ink, key: 'mat_tag'
  });

  // Glistening Nanodiamonds & Iridium Peak in the soot
  for (let d = 0; d < 14; d++) {
    const dx = 100 + d * 64;
    const dy = matY + 30 + ((d * 37) % (matH - 60));
    sparkle(dx, dy, 7 + (d % 5), PAL.snow);
  }

  // 3. Pre-Impact Pleistocene Ground (Where Megafauna Lived)
  cut(rect(-20, matY + matH, W + 40, H - (matY + matH) + 40, 0), PAL.woodD, {
    key: 'pleistocene_soil', sy: 10, sb: 18,
    pat: pat.grainWood('rgba(0,0,0,0.25)')
  });

  // 4. The Woolly Mammoth Silhouette & Bones
  const mamX = CX - 30;
  const mamY = 1240 + Math.sin(t * TAU * 0.4) * 6;
  const boneCol = PAL.cream;

  // Massive Mammoth Hump & Body
  const mamBodyPts = [
    [mamX - 180, mamY + 120], [mamX - 170, mamY - 80],
    [mamX - 70, mamY - 180],  [mamX + 90, mamY - 150],
    [mamX + 180, mamY - 40],  [mamX + 160, mamY + 130],
    [mamX - 20, mamY + 150]
  ];
  cut(mamBodyPts, PAL.charcoal, { key: 'mam_body', sy: 10, sb: 16 });

  // Massive Curved Mammoth Tusk (Ivory Arch)
  ink([[mamX - 120, mamY - 60], [mamX - 240, mamY - 40], [mamX - 310, mamY - 170]], {
    w: 22, color: boneCol, key: 'tusk_main'
  });
  ink([[mamX - 90, mamY - 70], [mamX - 200, mamY - 70], [mamX - 260, mamY - 190]], {
    w: 16, color: PAL.ice, key: 'tusk_inner'
  });

  // Mammoth Skull & Trunk
  cut(ellipsePts(mamX - 120, mamY - 90, 75, 85, 0.2, 24), PAL.tweed, { key: 'mam_head', sy: 6, sb: 10 });
  ink([[mamX - 150, mamY - 40], [mamX - 200, mamY + 80], [mamX - 170, mamY + 220]], {
    w: 18, color: PAL.tweed, key: 'mam_trunk'
  });

  // Sturdy Legs
  cut(rect(mamX - 140, mamY + 100, 55, 220, 10), PAL.tweed, { key: 'mam_leg_1' });
  cut(rect(mamX + 110, mamY + 90, 55, 230, 10), PAL.tweed, { key: 'mam_leg_2' });

  // Clovis Spearhead Embedded Beside Skeleton
  const clovX = CX + 240, clovY = 1380;
  const clovisPts = [
    [clovX, clovY - 70], [clovX + 28, clovY + 30],
    [clovX, clovY + 60], [clovX - 28, clovY + 30]
  ];
  cut(clovisPts, PAL.snow, { key: 'clovis_point', sy: 4, sb: 8 });
  tag('CLOVIS POINT', clovX, clovY + 95, 22, { fill: PAL.paper, color: PAL.ink, key: 'clov_tag' });

  // Tags & Captions
  yearTag('The Boundary Layer • Extinction');
  capStrip('Soot, Nanodiamonds & The Fall of Giant Megafauna');
}

// ---------------------------------------------------------------------
// SCENE 3: THE MEGAFLOODS (21.6 - 28.8s) — Lake Agassiz Cataclysm
// ---------------------------------------------------------------------
function sceneMegaflood() {
  const t = seg(TT, 21.6, 28.8);

  // 1. Churning Storm-Deluge Teal Background
  cut(rect(-30, -30, W + 60, H + 60, 0), '#0c2236', {
    key: 'flood_bg', shadow: false, tear: 0,
    pat: pat.stripes('rgba(169,216,220,0.12)', 24, 70, 0.2)
  });

  // 2. Collapsing Glacial Ice Dam at Top Right
  const damPts = [
    [W - 320, 220], [W + 40, 180], [W + 40, 720],
    [W - 180, 840], [W - 280, 620]
  ];
  cut(damPts, PAL.snow, { key: 'ice_dam_breach', sy: 14, sb: 24 });
  // Shattered ice blocks tumbling
  for (let b = 0; b < 6; b++) {
    const bx = W - 340 + Math.sin(b * 2) * 80 - t * 40;
    const by = 500 + b * 90 + t * 60;
    cut(rect(bx, by, 60, 50, 4), PAL.ice, { key: 'berg_' + b, rot: b * 0.6 + t });
  }

  // 3. Colossal Wall of Torrents / Surging Tsunami Wave
  const waveY = 1040 + Math.sin(t * TAU * 0.8) * 25;
  const wavePts = [
    [-40, waveY + 200], [200, waveY - 80], [480, waveY - 260],
    [760, waveY - 80],  [W + 40, waveY - 200], [W + 40, H + 40], [-40, H + 40]
  ];
  cut(wavePts, PAL.teal, {
    key: 'deluge_wave', sy: 16, sb: 28,
    pat: pat.stripes('rgba(255,255,255,0.22)', 14, 40, -0.3)
  });

  // White Water Crests (Foam Curling)
  cut(ellipsePts(460, waveY - 240, 180, 70, -0.2, 28), PAL.snow, { key: 'wave_crest_1', shadow: false });
  cut(ellipsePts(220, waveY - 60, 140, 50, -0.1, 24), PAL.snow, { key: 'wave_crest_2', shadow: false });

  // 4. Glacial Erratics (Giant Boulders Ripped by Floodwaters)
  cut(ellipsePts(320, waveY + 240, 80, 60, 0.3, 16), PAL.charcoal, { key: 'boulder_1', sy: 8, sb: 12 });
  cut(ellipsePts(680, waveY + 310, 110, 75, -0.2, 18), PAL.charcoal, { key: 'boulder_2', sy: 8, sb: 12 });
  tag('GLACIAL ERRATIC', 680, waveY + 310, 20, { fill: PAL.paper, color: PAL.ink, key: 'erratic_tag' });

  // 5. Gulf Stream Ocean Conveyor Belt Disrupted (Halted Loop Arrow)
  const convX = 280, convY = 460;
  ink([[convX - 120, convY], [convX + 120, convY]], { w: 10, color: PAL.orange, key: 'conveyor_line' });
  tag('ATLANTIC CONVEYOR: HALTED', convX + 60, convY - 40, 26, {
    fill: PAL.mustard, color: PAL.ink, key: 'amoc_tag'
  });

  // Tags & Captions
  yearTag('Meltwater Pulse • Deluge');
  capStrip('Lake Agassiz Breach Shuts Down Ocean Heat Circulation');
}

// ---------------------------------------------------------------------
// SCENE 4: THE 1,200-YEAR DEEP FREEZE (28.8 - 36.0s) — Glacial Winter
// ---------------------------------------------------------------------
function sceneFreeze() {
  const t = seg(TT, 28.8, 36.0);

  // 1. Permafrost Blue-Grey Atmospheric Paper
  cut(rect(-30, -30, W + 60, H + 60, 0), '#182434', {
    key: 'freeze_bg', shadow: false, tear: 0,
    pat: pat.dots('rgba(255,255,255,0.18)', 2, 24)
  });

  // 2. Jagged Advancing Glacial Wall Across Horizon
  const glY = 820;
  const glacierPts = [
    [-30, glY + 60],   [140, glY - 140], [310, glY - 40],
    [520, glY - 220],  [740, glY - 80],  [920, glY - 180],
    [W + 30, glY - 60],[W + 30, H],     [-30, H]
  ];
  cut(glacierPts, PAL.snow, {
    key: 'advancing_glacier', sy: 16, sb: 28,
    pat: pat.stripes('rgba(160,200,230,0.25)', 12, 35, 0.4)
  });

  // Ice Crevasses in Glacier
  ink([[310, glY - 30], [280, glY + 180]], { w: 6, color: PAL.blue, key: 'crevasse_1' });
  ink([[530, glY - 200], [560, glY + 120]], { w: 6, color: PAL.blue, key: 'crevasse_2' });

  // 3. Falling Snow & Ice Needle Grains (Driven by howling wind)
  for (let sn = 0; sn < 24; sn++) {
    const snX = (sn * 47 + t * 300) % W;
    const snY = (sn * 71 + t * 240) % (H - 300) + 150;
    dot(snX, snY, 2.5 + (sn % 3), '#ffffff');
  }

  // 4. Human Nomadic Hunter Campfire (Survival Resilience)
  const campX = CX;
  const campY = 1380;

  // Tent / Mammoth Bone Shelter
  const tentPts = [
    [campX - 180, campY + 140], [campX, campY - 120],
    [campX + 180, campY + 140]
  ];
  cut(tentPts, PAL.woodD, { key: 'bone_tent', sy: 8, sb: 14 });
  ink([[campX, campY - 120], [campX - 180, campY + 140]], { w: 10, color: PAL.cream, key: 'tent_rib_l' });
  ink([[campX, campY - 120], [campX + 180, campY + 140]], { w: 10, color: PAL.cream, key: 'tent_rib_r' });

  // Flickering Campfire Glow
  const flk = Math.sin(t * 16) * 10;
  cut(ellipsePts(campX, campY + 120, 110 + flk, 50, 0, 24), PAL.orange, {
    key: 'camp_glow', shadow: false
  });
  cut(ellipsePts(campX, campY + 105, 30 + flk * 0.5, 45, 0, 16), PAL.yellow, {
    key: 'camp_flame', shadow: false
  });

  // Human Hunter Silhouette Warming Hands
  cut(ellipsePts(campX - 90, campY + 60, 20, 20, 0, 16), PAL.ink, { key: 'hunter_head' });
  cut(rect(campX - 105, campY + 80, 30, 60, 6), PAL.ink, { key: 'hunter_body' });

  // Tags & Captions
  yearTag('1,200-Year Freeze • 10,800–9,600 BCE');
  capStrip('Sub-Zero Permafrost Tests Human Survival to the Limit');
}

// ---------------------------------------------------------------------
// SCENE 5: THE THAW & GÖBEKLI TEPE (36.0 - 43.2s) — Rebirth in Stone
// ---------------------------------------------------------------------
function sceneGobekli() {
  const t = seg(TT, 36.0, 43.2);

  // 1. Warm Golden Anatolian Sandstone Horizon (+10°C Flash Thaw)
  cut(rect(-30, -30, W + 60, H + 60, 0), '#382516', {
    key: 'anatolian_sky', shadow: false, tear: 0,
    pat: pat.lines('rgba(255,220,130,0.14)', 36)
  });

  // 2. Rolling Anatolian Hillside Base
  cut([
    [-20, 1420], [260, 1360], [580, 1390],
    [880, 1340], [W + 20, 1400], [W + 20, H + 20], [-20, H + 20]
  ], PAL.woodL, { key: 'gobekli_hill', sy: 10, sb: 16 });

  // Wild Einkorn Wheat Grass Sprouting (Birth of Agriculture)
  for (let w = 0; w < 10; w++) {
    const wx = 120 + w * 90;
    const wy = 1380 + Math.sin(w * 1.5) * 20;
    ink([[wx, wy + 60], [wx + 10, wy - 30], [wx + 5, wy - 80]], {
      w: 4, color: PAL.yellow, key: 'wheat_stem_' + w
    });
    cut(ellipsePts(wx + 5, wy - 85, 12, 28, 0.1, 10), PAL.mustard, { key: 'wheat_head_' + w });
  }

  // 3. Colossal Megalithic T-Shaped Pillar (Pillar 43 / Vulture Stone)
  const pilX = CX;
  const pilY = 940;
  const pilW = 210, pilH = 580;
  const capW = 420, capH = 150;

  // The T-Pillar Cutout
  cut(tPillarPts(pilX, pilY, pilW, pilH, capW, capH), PAL.mustard, {
    key: 'gobekli_tpillar', sy: 16, sb: 28,
    pat: pat.dots('rgba(50,20,5,0.18)', 3, 22)
  });

  // 4. Carved High Reliefs on Pillar 43:
  // A. The Celestial Vulture (Holding the Sun / Cosmic Orb)
  const vultX = pilX - 10, vultY = pilY - 140;
  cut(ellipsePts(vultX, vultY, 45, 60, 0.3, 20), PAL.woodD, { key: 'vulture_body', sy: 4, sb: 6 });
  cut(ellipsePts(vultX - 45, vultY - 35, 25, 20, -0.4, 14), PAL.woodD, { key: 'vulture_head' });
  ink([[vultX - 20, vultY - 20], [vultX + 55, vultY - 50]], { w: 8, color: PAL.woodD, key: 'vulture_wing' });

  // Cosmic Sphere / Comet Orb balanced by vulture
  cut(ellipsePts(vultX + 55, vultY - 80, 32, 32, 0, 18), PAL.orange, {
    key: 'vulture_orb', sy: 4, sb: 8
  });
  tag('COMET ORB', vultX + 55, vultY - 120, 20, { fill: PAL.paper, color: PAL.ink, key: 'orb_tag' });

  // B. The Scorpion of the Underworld Relief below
  const scorpY = pilY + 80;
  cut(ellipsePts(pilX, scorpY, 35, 50, 0, 16), PAL.woodD, { key: 'scorp_body', sy: 3, sb: 5 });
  ink([[pilX, scorpY + 45], [pilX + 25, scorpY + 80], [pilX + 15, scorpY + 110]], {
    w: 5, color: PAL.woodD, key: 'scorp_tail'
  });

  // C. Humanoid Relief Arms Wrapping around Pillar shaft
  ink([[pilX - pilW / 2 + 10, pilY + 160], [pilX, pilY + 200], [pilX + pilW / 2 - 10, pilY + 160]], {
    w: 12, color: PAL.woodD, key: 'pillar_hands'
  });

  // Tags & Captions
  yearTag('9,600 BCE • Göbekli Tepe');
  capStrip('Pillar 43 • The Memory of Cataclysm Carved in Megalithic Stone');
}

// ---------------------------------------------------------------------
// SCENE 6: OUTRO END FRAME (43.2 - 50.0s) — The Dawn of Civilization
// ---------------------------------------------------------------------
function sceneOutro() {
  const t = seg(TT, 43.2, 50.0);

  // 1. Deep Midnight Cosmic Blue Textured Paper
  cut(rect(-30, -30, W + 60, H + 60, 0), '#101526', {
    key: 'outro_bg', shadow: false, tear: 0,
    pat: pat.dots('rgba(255,240,160,0.14)', 2.5, 32)
  });

  // 2. Outer Concentric Cosmic Orbit Rings (Celestial Memory)
  const cx = CX, cy = 960;
  const pulse = 1.0 + Math.sin(t * TAU * 0.3) * 0.03;

  cut(flameBurstPts(cx, cy, 330 * pulse, 32), PAL.orange, {
    key: 'outro_halo_outer', sy: 12, sb: 22,
    rot: t * TAU * 0.1
  });

  cut(iceCrystalPts(cx, cy, 270 * pulse, 8), PAL.snow, {
    key: 'outro_crystal_mid', sy: 8, sb: 16,
    rot: -t * TAU * 0.08
  });

  // Central Golden Sun Disc (The Holocene Sunrise)
  cut(ellipsePts(cx, cy, 180 * pulse, 180 * pulse, 0, 36), PAL.yellow, {
    key: 'outro_sun_disc', sy: 6, sb: 10
  });

  // Ancient Sprouting Seed / Wheat Sheaf in core
  cut(ellipsePts(cx, cy, 55, 90, 0, 24), PAL.lamp, { key: 'seed_leaf_l', shadow: false });
  cut(ellipsePts(cx + 30, cy - 20, 45, 75, 0.4, 20), PAL.lamp, { key: 'seed_leaf_r', shadow: false });
  cut(ellipsePts(cx, cy, 30, 30, 0, 16), PAL.paper, { key: 'seed_dot', shadow: false });

  // 3. Grand Epilogue Banners
  tag('FROM CATACLYSM TO CIVILIZATION', CX, 510, 56, {
    rot: 0.012, fill: PAL.snow, color: PAL.night, s: popS(E0 + 0.3)
  });

  tag('HOW A COMET SPARKED AGRICULTURE', CX, 630, 40, {
    rot: -0.01, fill: PAL.mustard, color: PAL.ink, s: popS(E0 + 0.6)
  });

  // Bottom Timeline Sequence Strip
  tag('IMPACT • SOOT • FLOOD • FREEZE • REBIRTH', CX, 1420, 34, {
    rot: 0.006, fill: PAL.paper, color: PAL.ink, s: popS(E0 + 0.8)
  });

  // Tags & Captions
  yearTag('The Holocene Begins');
  capStrip('Epilogue • How Disaster Forged the Modern World');
}
