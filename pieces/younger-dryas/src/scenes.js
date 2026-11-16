// =====================================================================
//  SCENES — The Younger Dryas: Earth's Lost Cataclysm
//  Refined High-Fidelity Cut-Paper Collage Animation
//  Accurate geology, paleontology, and megalithic archaeology.
// =====================================================================

// ---------------------------------------------------------------------
// SCENE 0: INTRO TITLE CARD (0.0 - 7.2s) — Earth on the Brink
// ---------------------------------------------------------------------
function sceneIntro() {
  const t = seg(TT, 0.0, 7.2);

  // 1. Deep Space Indigo Paper with Subtle Latitude Grids
  cut(rect(-30, -30, W + 60, H + 60, 0), PAL.night, {
    key: 'intro_bg', shadow: false, tear: 0,
    pat: pat.lines('rgba(180,210,245,0.06)', 40)
  });

  // 2. The Earth Globe (Centered High to Clear Lower Margins)
  const cx = CX, cy = 930;
  const pulse = 1.0 + Math.sin(t * TAU * 0.35) * 0.015;

  // Ocean Globe Basin
  cut(ellipsePts(cx, cy, 310 * pulse, 310 * pulse, 0, 48), '#142c4a', {
    key: 'earth_globe', sy: 14, sb: 24,
    pat: pat.stripes('rgba(255,255,255,0.05)', 8, 28, 0.25)
  });

  // Atmospheric Blue Halo
  cut(ellipsePts(cx, cy, 324 * pulse, 324 * pulse, 0, 48), 'rgba(100,180,240,0.14)', {
    key: 'atmos_halo', shadow: false
  });

  // Detailed North American Continent (Accurate Steppe, Forests & Coastlines)
  const continentPts = [
    [cx - 210, cy - 60], [cx - 170, cy - 180], [cx - 80, cy - 240],
    [cx + 70, cy - 230], [cx + 180, cy - 130], [cx + 220, cy - 30],
    [cx + 180, cy + 80], [cx + 80, cy + 160],  [cx + 10, cy + 210],
    [cx - 60, cy + 140], [cx - 140, cy + 110], [cx - 200, cy + 30]
  ];
  cut(continentPts, '#33503b', { key: 'north_america', sy: 8, sb: 14 });

  // Massive Laurentide & Cordilleran Ice Sheets (Dominant Glacial Cap)
  const iceCapPts = [
    [cx - 180, cy - 170], [cx - 70, cy - 230], [cx + 70, cy - 210],
    [cx + 160, cy - 120], [cx + 145, cy - 40], [cx + 70, cy + 10],
    [cx - 30, cy],        [cx - 130, cy - 40], [cx - 170, cy - 90]
  ];
  cut(iceCapPts, PAL.snow, {
    key: 'laurentide_ice', sy: 10, sb: 16,
    pat: pat.dots('rgba(160,200,230,0.30)', 3, 18)
  });

  // Proglacial Meltwater Lakes Pooling at Ice Edge (Lake Agassiz Basin)
  cut(ellipsePts(cx - 20, cy + 25, 65, 38, -0.25, 20), PAL.ice, { key: 'lake_agassiz', sy: 4, sb: 6 });
  ink([[cx - 10, cy + 25], [cx + 35, cy + 80], [cx + 15, cy + 140]], { w: 4, color: PAL.ice, key: 'mississippi_melt' });

  // Wandering Steppe Mammoth Herd Silhouette on Southern Margin
  cut(ellipsePts(cx - 80, cy + 70, 18, 12, 0, 10), PAL.charcoal, { key: 'herd_mam_1' });
  cut(ellipsePts(cx - 50, cy + 85, 14, 9, 0, 10), PAL.charcoal, { key: 'herd_mam_2' });

  // 3. Clean Title Banners (Well Inside Safe Zone)
  tag('THE YOUNGER DRYAS', CX, 500, 48, {
    rot: -0.012, fill: PAL.snow, color: PAL.night, s: popS(E0 + 0.3)
  });

  tag("EARTH'S LOST CATACLYSM", CX, 590, 32, {
    rot: 0.01, fill: PAL.ice, color: PAL.ink, s: popS(E0 + 0.6)
  });

  // Tags & Captions
  yearTag('12,800 BP • 10,800 BCE');
  capStrip('Warming Earth Suddenly Interrupted by Cataclysm');
}

// ---------------------------------------------------------------------
// SCENE 1: THE COMET AIRBURST (7.2 - 14.4s) — Detonation Over the Ice
// ---------------------------------------------------------------------
function sceneImpact() {
  const t = seg(TT, 7.2, 14.4);

  // 1. Fiery Crimson-Orange Atmospheric Background
  cut(rect(-30, -30, W + 60, H + 60, 0), '#320f06', {
    key: 'impact_bg', shadow: false, tear: 0,
    pat: pat.stripes('rgba(246,207,85,0.10)', 20, 50, -0.35)
  });

  // 2. Incoming Fragmented Comet Swarm (Entering from High Atmosphere)
  const bolides = [
    { x: CX - 10, y: 640, r: 52, tail: 380 },
    { x: CX - 170, y: 560, r: 30, tail: 280 },
    { x: CX + 190, y: 600, r: 35, tail: 310 }
  ];

  bolides.forEach((b, i) => {
    // Billowing Black Smoke Trail Behind Plasma
    ink([[b.x - b.tail * 0.7, b.y - b.tail * 0.7], [b.x, b.y]], {
      w: b.r * 1.4, color: 'rgba(20,10,5,0.6)', key: 'smoke_' + i
    });
    // Incandescent Orange/Yellow Fire Trail
    ink([[b.x - b.tail * 0.5, b.y - b.tail * 0.5], [b.x, b.y]], {
      w: b.r * 0.85, color: PAL.orange, key: 'plasma_' + i
    });
    // White-hot Bolide Core
    cut(ellipsePts(b.x, b.y, b.r, b.r * 1.3, -0.78, 20), PAL.snow, { key: 'bolide_core_' + i, shadow: false });
  });

  // 3. Massive Airburst Blast Epicenter (Positioned Safe at Y=820)
  const blastX = CX + 20, blastY = 820;
  const blastR = 240 + Math.sin(t * TAU * 1.2) * 18;

  // Shockwave Distortion Ring
  ink(arcPts(blastX, blastY, blastR + 110, 0, TAU, 36), {
    w: 8, color: 'rgba(255,240,200,0.45)', key: 'shockwave_ring'
  });

  // Outer Thermal Radiation Front
  cut(flameBurstPts(blastX, blastY, blastR + 80, 24), PAL.orange, {
    key: 'blast_outer', sy: 12, sb: 22,
    rot: t * TAU * 0.2
  });

  // Middle Luminous Firestorm
  cut(flameBurstPts(blastX, blastY, blastR, 18), PAL.yellow, {
    key: 'blast_mid', sy: 8, sb: 14,
    rot: -t * TAU * 0.25
  });

  // Blinding Hypersonic Core
  cut(ellipsePts(blastX, blastY, 115, 115, 0, 32), PAL.snow, { key: 'blast_core_white', shadow: false });

  // 4. Shattered Laurentide Ice Horizon (Clear of Caption Zone)
  const iceY = 1180;
  cut([
    [-20, iceY + 20], [220, iceY - 35], [540, iceY - 10],
    [840, iceY - 45], [W + 20, iceY + 10], [W + 20, 1340], [-20, 1340]
  ], PAL.ice, { key: 'shattered_ice', sy: -6, sb: 14 });

  // Radiant Fissure Cracks in Ice
  ink([[540, iceY - 10], [480, iceY + 90], [520, iceY + 150]], { w: 4, color: '#102236', key: 'crack_1' });
  ink([[540, iceY - 10], [630, iceY + 60], [700, iceY + 140]], { w: 4, color: '#102236', key: 'crack_2' });

  // Superheated Steam Plumes
  for (let s = 0; s < 3; s++) {
    const sx = 380 + s * 160;
    ink([[sx, iceY], [sx + Math.sin(s + t * 4) * 20, iceY - 80]], {
      w: 12, color: 'rgba(240,250,255,0.4)', key: 'steam_' + s
    });
  }

  // Tags & Captions
  yearTag('10,800 BCE • Airburst');
  capStrip('Fragmented Comet Detonates Over Laurentide Ice');
}

// ---------------------------------------------------------------------
// SCENE 2: THE BLACK MAT LAYER (14.4 - 21.6s) — Megafauna Extinction
// ---------------------------------------------------------------------
function sceneBlackMat() {
  const t = seg(TT, 14.4, 21.6);

  // 1. Dark Geological Stratigraphy Background
  cut(rect(-30, -30, W + 60, H + 60, 0), '#18181c', { key: 'strata_bg', shadow: false, tear: 0 });

  // Upper Holocene Soil Layer (Top Stratum)
  const holoY = 400, holoH = 130;
  cut(rect(-20, holoY, W + 40, holoH, 0), '#6e523c', {
    key: 'holocene_layer', sy: 5, sb: 10,
    pat: pat.stripes('rgba(255,255,255,0.06)', 6, 22, 0)
  });

  // 2. THE BLACK MAT LAYER (Prominent Carbon Soot Stratum)
  const matY = 530, matH = 110;
  cut(rect(-20, matY, W + 40, matH, 0), PAL.ink, {
    key: 'black_mat_layer', sy: 8, sb: 16,
    pat: pat.dots('rgba(255,255,255,0.22)', 2.2, 14)
  });

  // Glistening Nanodiamonds & Iridium Peak in Soot Layer
  for (let d = 0; d < 14; d++) {
    const dx = 100 + d * 64;
    const dy = matY + 20 + ((d * 37) % (matH - 40));
    sparkle(dx, dy, 5 + (d % 4), PAL.snow);
  }

  // Lower Pleistocene Sediment Bed (Pre-Impact Fauna Horizon)
  const pleistY = matY + matH;
  cut(rect(-20, pleistY, W + 40, 580, 0), '#3d2d1e', {
    key: 'pleistocene_bed', sy: 6, sb: 12,
    pat: pat.grainWood('rgba(0,0,0,0.18)')
  });

  // 3. Anatomical Woolly Mammoth Silhouette (Elevated Cleanly: Y=870)
  const mamX = CX - 30;
  const mamY = 870 + Math.sin(t * TAU * 0.4) * 5;
  const boneCol = PAL.cream;

  // Massive Curved Mammoth Tusks (Distinctive Ice-Age Spiral)
  ink([[mamX - 100, mamY - 45], [mamX - 190, mamY - 20], [mamX - 250, mamY - 120], [mamX - 200, mamY - 190]], {
    w: 18, color: boneCol, key: 'tusk_outer'
  });
  ink([[mamX - 85, mamY - 50], [mamX - 160, mamY - 30], [mamX - 205, mamY - 110]], {
    w: 11, color: PAL.ice, key: 'tusk_inner'
  });

  // Domed Skull, Sloping Back & Shaggy Body
  const mamBodyPts = [
    [mamX - 110, mamY - 110], [mamX - 50, mamY - 160], [mamX + 50, mamY - 130],
    [mamX + 150, mamY - 35],  [mamX + 160, mamY + 100], [mamX + 80, mamY + 140],
    [mamX - 35, mamY + 130],  [mamX - 125, mamY + 100], [mamX - 145, mamY - 25]
  ];
  cut(mamBodyPts, PAL.charcoal, { key: 'mam_body', sy: 10, sb: 16 });

  // Curving Trunk
  ink([[mamX - 120, mamY - 25], [mamX - 165, mamY + 60], [mamX - 135, mamY + 150]], {
    w: 15, color: PAL.charcoal, key: 'mam_trunk'
  });

  // Sturdy Legs Resting Cleanly in Pleistocene Bed (Ends at Y=1070)
  cut(rect(mamX - 105, mamY + 90, 44, 140, 6), PAL.charcoal, { key: 'mam_leg_1' });
  cut(rect(mamX + 85, mamY + 80, 44, 150, 6), PAL.charcoal, { key: 'mam_leg_2' });

  // 4. Clovis Fluted Spearpoint (Flint-knapped Artifact)
  const clovX = CX + 230, clovY = 930;
  const clovisPts = [
    [clovX, clovY - 55], [clovX + 22, clovY + 20],
    [clovX, clovY + 48], [clovX - 22, clovY + 20]
  ];
  cut(clovisPts, PAL.snow, { key: 'clovis_point', sy: 5, sb: 8 });
  ink([[clovX, clovY + 40], [clovX, clovY - 10]], { w: 4, color: '#9bb8cc', key: 'clovis_flute' });

  // Tags & Captions
  yearTag('The Boundary Layer');
  capStrip('Soot, Nanodiamonds & Mammoth Extinction');
}

// ---------------------------------------------------------------------
// SCENE 3: THE MEGAFLOODS (21.6 - 28.8s) — Lake Agassiz Cataclysm
// ---------------------------------------------------------------------
function sceneMegaflood() {
  const t = seg(TT, 21.6, 28.8);

  // 1. Churning Deluge Navy/Teal Background
  cut(rect(-30, -30, W + 60, H + 60, 0), '#0c1e30', {
    key: 'flood_bg', shadow: false, tear: 0,
    pat: pat.stripes('rgba(140,210,230,0.10)', 20, 60, 0.25)
  });

  // 2. Ruptured Glacial Ice Dam (Towering White Cliffs on Right)
  const cliffPts = [
    [W - 270, 260], [W + 40, 220], [W + 40, 720],
    [W - 130, 770], [W - 230, 590]
  ];
  cut(cliffPts, PAL.snow, { key: 'ice_cliff', sy: 12, sb: 18 });

  // Tumbling Icebergs in Torrent
  for (let b = 0; b < 4; b++) {
    const bx = W - 300 + Math.sin(b * 1.7) * 60 - t * 25;
    const by = 440 + b * 85 + t * 45;
    cut(rect(bx, by, 48, 38, 4), PAL.ice, { key: 'iceberg_' + b, rot: b * 0.5 + t });
  }

  // 3. Colossal Tsunami Tidal Wave (Surging Deluge Elevated to Y=880)
  const waveY = 880 + Math.sin(t * TAU * 0.75) * 16;
  const wavePts = [
    [-40, waveY + 200], [170, waveY - 50], [450, waveY - 210],
    [730, waveY - 50],  [W + 40, waveY - 150], [W + 40, 1280], [-40, 1280]
  ];
  cut(wavePts, PAL.teal, {
    key: 'deluge_wave', sy: 14, sb: 24,
    pat: pat.stripes('rgba(255,255,255,0.18)', 14, 38, -0.3)
  });

  // Curling White Foam Wave Crests
  cut(ellipsePts(430, waveY - 195, 140, 52, -0.15, 24), PAL.snow, { key: 'foam_crest_1', shadow: false });
  cut(ellipsePts(190, waveY - 40, 105, 38, -0.1, 20), PAL.snow, { key: 'foam_crest_2', shadow: false });

  // 4. Glacial Erratics (Massive Scoured Boulders)
  cut(ellipsePts(300, waveY + 180, 65, 48, 0.25, 16), PAL.charcoal, { key: 'boulder_1', sy: 7, sb: 10 });
  cut(ellipsePts(660, waveY + 220, 80, 58, -0.2, 18), PAL.charcoal, { key: 'boulder_2', sy: 7, sb: 10 });

  // Tags & Captions
  yearTag('Catastrophic Deluge');
  capStrip('Glacial Lake Breach Shuts Down Ocean Conveyor');
}

// ---------------------------------------------------------------------
// SCENE 4: THE 1,200-YEAR DEEP FREEZE (28.8 - 36.0s) — Glacial Winter
// ---------------------------------------------------------------------
function sceneFreeze() {
  const t = seg(TT, 28.8, 36.0);

  // 1. Permafrost Blue-Grey Atmospheric Sky
  cut(rect(-30, -30, W + 60, H + 60, 0), '#162232', {
    key: 'freeze_bg', shadow: false, tear: 0,
    pat: pat.dots('rgba(255,255,255,0.14)', 2, 22)
  });

  // 2. Looming Jagged Glacial Ice Wall Across Horizon
  const glY = 720;
  const glacierPts = [
    [-30, glY + 40],   [140, glY - 110], [310, glY - 25],
    [520, glY - 170],  [740, glY - 60],  [920, glY - 130],
    [W + 30, glY - 40],[W + 30, 1260],   [-30, 1260]
  ];
  cut(glacierPts, PAL.snow, {
    key: 'advancing_glacier', sy: 14, sb: 24,
    pat: pat.stripes('rgba(150,190,225,0.20)', 10, 32, 0.4)
  });

  // Deep Blue Glacial Crevasses
  ink([[310, glY - 20], [290, glY + 140]], { w: 5, color: '#163554', key: 'crevasse_1' });
  ink([[530, glY - 150], [550, glY + 95]], { w: 5, color: '#163554', key: 'crevasse_2' });

  // 3. Falling Snow & Driven Ice Grains
  for (let sn = 0; sn < 24; sn++) {
    const snX = (sn * 47 + t * 260) % W;
    const snY = (sn * 63 + t * 200) % (H - 450) + 160;
    dot(snX, snY, 2.2 + (sn % 2.2), '#ffffff');
  }

  // 4. Human Hunter Campfire & Mammoth Bone Shelter (Elevated to Y=1040)
  const campX = CX;
  const campY = 1040;

  // Stretched Hide Shelter with Curved Mammoth Rib Frames
  const shelterPts = [
    [campX - 145, campY + 110], [campX, campY - 95],
    [campX + 145, campY + 110]
  ];
  cut(shelterPts, PAL.woodD, { key: 'bone_shelter', sy: 7, sb: 12 });
  ink([[campX, campY - 95], [campX - 145, campY + 110]], { w: 7, color: PAL.cream, key: 'rib_l' });
  ink([[campX, campY - 95], [campX + 145, campY + 110]], { w: 7, color: PAL.cream, key: 'rib_r' });

  // Flickering Warm Fireplace
  const flk = Math.sin(t * 16) * 7;
  cut(ellipsePts(campX, campY + 98, 85 + flk, 38, 0, 20), PAL.orange, { key: 'camp_glow', shadow: false });
  cut(ellipsePts(campX, campY + 90, 22 + flk * 0.4, 32, 0, 14), PAL.yellow, { key: 'camp_flame', shadow: false });

  // Hunter Silhouette in Fur Parka Warming Hands
  cut(ellipsePts(campX - 65, campY + 55, 16, 16, 0, 14), PAL.ink, { key: 'hunter_head' });
  cut(rect(campX - 76, campY + 68, 22, 45, 5), PAL.ink, { key: 'hunter_body' });
  ink([[campX - 60, campY + 80], [campX - 35, campY + 92]], { w: 4, color: PAL.ink, key: 'hunter_arm' });

  // Tags & Captions
  yearTag('1,200-Year Freeze');
  capStrip('Sub-Zero Permafrost Grips the Northern Hemisphere');
}

// ---------------------------------------------------------------------
// SCENE 5: THE THAW & GÖBEKLI TEPE (36.0 - 43.2s) — Rebirth in Stone
// ---------------------------------------------------------------------
function sceneGobekli() {
  const t = seg(TT, 36.0, 43.2);

  // 1. Warm Golden Anatolian Sandstone Sky (+10°C Sudden Snap)
  cut(rect(-30, -30, W + 60, H + 60, 0), '#322214', {
    key: 'anatolian_sky', shadow: false, tear: 0,
    pat: pat.lines('rgba(255,220,130,0.10)', 34)
  });

  // 2. Rolling Anatolian Limestone Ridge
  cut([
    [-20, 1180], [240, 1140], [560, 1160],
    [860, 1130], [W + 20, 1170], [W + 20, 1340], [-20, 1340]
  ], PAL.woodL, { key: 'gobekli_ridge', sy: 8, sb: 14 });

  // Domesticated Wild Einkorn Wheat Sprouting at Base
  for (let w = 0; w < 8; w++) {
    const wx = 150 + w * 110;
    const wy = 1170 + Math.sin(w * 1.4) * 16;
    ink([[wx, wy + 40], [wx + 6, wy - 20], [wx + 3, wy - 55]], {
      w: 3.5, color: PAL.yellow, key: 'wheat_stem_' + w
    });
    cut(ellipsePts(wx + 3, wy - 60, 9, 20, 0.1, 10), PAL.mustard, { key: 'wheat_head_' + w });
  }

  // 3. Colossal Megalithic T-Shaped Pillar (Pillar 43 / Vulture Stone: Elevated to Y=840)
  const pilX = CX;
  const pilY = 840;
  const pilW = 180, pilH = 480;
  const capW = 360, capH = 125;

  // The T-Pillar Cutout
  cut(tPillarPts(pilX, pilY, pilW, pilH, capW, capH), PAL.mustard, {
    key: 'gobekli_tpillar', sy: 14, sb: 24,
    pat: pat.dots('rgba(50,20,5,0.15)', 3, 18)
  });

  // 4. Carved High Reliefs on Pillar 43:
  // A. Three Sacred Handbags / Celestial Arches along Top Lintel
  for (let hb = 0; hb < 3; hb++) {
    const hbx = pilX - 110 + hb * 110;
    const hby = pilY - pilH / 2 + 45;
    cut(rect(hbx - 28, hby, 56, 36, 5), PAL.woodD, { key: 'handbag_' + hb, sy: 3, sb: 5 });
    ink(arcPts(hbx, hby - 4, 17, Math.PI, 0, 8), { w: 3.5, color: PAL.woodD, key: 'hb_handle_' + hb });
  }

  // B. The Celestial Vulture (Balancing the Sun / Comet Orb)
  const vultX = pilX - 15, vultY = pilY - 95;
  cut(ellipsePts(vultX, vultY, 36, 46, 0.25, 18), PAL.woodD, { key: 'vulture_body', sy: 4, sb: 6 });
  cut(ellipsePts(vultX - 34, vultY - 26, 19, 16, -0.3, 12), PAL.woodD, { key: 'vulture_head' });
  ink([[vultX - 15, vultY - 12], [vultX + 44, vultY - 38]], { w: 6, color: PAL.woodD, key: 'vulture_wing' });

  // Celestial Comet Orb Above Wing
  cut(ellipsePts(vultX + 44, vultY - 60, 24, 24, 0, 16), PAL.orange, { key: 'comet_orb', sy: 4, sb: 6 });

  // C. The Underworld Scorpion Relief Below
  const scorpY = pilY + 70;
  cut(ellipsePts(pilX, scorpY, 26, 36, 0, 14), PAL.woodD, { key: 'scorp_body', sy: 3, sb: 5 });
  ink([[pilX, scorpY + 32], [pilX + 20, scorpY + 58], [pilX + 10, scorpY + 82]], {
    w: 4.5, color: PAL.woodD, key: 'scorp_tail'
  });

  // D. Humanoid Hands Meeting at Waist
  ink([[pilX - pilW / 2 + 10, pilY + 130], [pilX, pilY + 160], [pilX + pilW / 2 - 10, pilY + 130]], {
    w: 9, color: PAL.woodD, key: 'pillar_hands'
  });

  // Tags & Captions
  yearTag('9,600 BCE • Göbekli Tepe');
  capStrip('Pillar 43 • The Comet Recorded on Megalithic Stone');
}

// ---------------------------------------------------------------------
// SCENE 6: OUTRO END FRAME (43.2 - 50.0s) — The Dawn of Civilization
// ---------------------------------------------------------------------
function sceneOutro() {
  const t = seg(TT, 43.2, 50.0);

  // 1. Midnight Cosmic Blue Paper with Gold Celestial Stars
  cut(rect(-30, -30, W + 60, H + 60, 0), '#0e1322', {
    key: 'outro_bg', shadow: false, tear: 0,
    pat: pat.dots('rgba(255,235,140,0.10)', 2.2, 28)
  });

  // 2. Concentric Celestial Astrolabe Rings (Elevated to Y=900)
  const cx = CX, cy = 900;
  const pulse = 1.0 + Math.sin(t * TAU * 0.3) * 0.025;

  cut(flameBurstPts(cx, cy, 280 * pulse, 32), PAL.orange, {
    key: 'outro_halo_outer', sy: 10, sb: 18,
    rot: t * TAU * 0.1
  });

  cut(iceCrystalPts(cx, cy, 225 * pulse, 8), PAL.snow, {
    key: 'outro_crystal_mid', sy: 7, sb: 12,
    rot: -t * TAU * 0.08
  });

  // Central Golden Sun Disc (The Holocene Epoch)
  cut(ellipsePts(cx, cy, 145 * pulse, 145 * pulse, 0, 36), PAL.yellow, {
    key: 'outro_sun_disc', sy: 5, sb: 9
  });

  // Sprouting Wheat Sheaf in Core
  cut(ellipsePts(cx - 18, cy, 32, 68, -0.2, 20), PAL.lamp, { key: 'leaf_l', shadow: false });
  cut(ellipsePts(cx + 18, cy, 32, 68, 0.2, 20), PAL.lamp, { key: 'leaf_r', shadow: false });
  cut(ellipsePts(cx, cy - 22, 22, 22, 0, 14), PAL.paper, { key: 'sun_seed', shadow: false });

  // 3. Clean Epilogue Banners (Safe Margins strictly <= 940 width)
  tag('FROM IMPACT TO CIVILIZATION', CX, 500, 40, {
    rot: 0.01, fill: PAL.snow, color: PAL.night, s: popS(E0 + 0.3)
  });

  tag('HOW A COMET SPARKED AGRICULTURE', CX, 590, 30, {
    rot: -0.01, fill: PAL.mustard, color: PAL.ink, s: popS(E0 + 0.6)
  });

  // Tags & Captions
  yearTag('The Holocene Dawn');
  capStrip('From Cataclysm to the Birth of Agriculture');
}
