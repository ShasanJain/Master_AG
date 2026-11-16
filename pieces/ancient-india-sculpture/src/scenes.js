// =====================================================================
//  SCENES — Ancient Indian Sculpture (Cut-Paper Collage Animation)
//  Tactile torn-edge paper shapes with soft drop shadows, patterns,
//  and paper tags across 4,000 years of sculptural form.
// =====================================================================

// ---------------------------------------------------------------------
// SCENE 0: INTRO TITLE CARD (0.0 - 7.5s) — The Sacred Awakening
// ---------------------------------------------------------------------
function sceneIntro() {
  const t = seg(TT, 0.0, 7.5);

  // 1. Deep Indigo Parchment Background with Subtle Gold Grid
  cut(rect(-30, -30, W + 60, H + 60, 0), PAL.night, {
    key: 'intro_bg', shadow: false, tear: 0,
    pat: pat.lines('rgba(246,207,85,0.08)', 44)
  });

  // 2. Ornate Cut-Paper Temple Torana (Frame / Border)
  cut(rect(60, 180, W - 120, H - 360, 16), 'rgba(0,0,0,0.001)', {
    key: 'torana_hole', shadow: false, grain: false, shade: false
  });
  // Top Torana Arch Bar
  cut(rect(50, 190, W - 100, 36, 6), PAL.cream, { key: 'arch_top', sy: 6, sb: 10 });
  cut(rect(80, 240, W - 160, 20, 4), PAL.mustard, { key: 'arch_mid', sy: 4, sb: 6 });
  // Side Torana Pillars
  cut(rect(50, 230, 40, H - 460, 6), PAL.cream, { key: 'pillar_l', sy: 6, sb: 10 });
  cut(rect(W - 90, 230, 40, H - 460, 6), PAL.cream, { key: 'pillar_r', sy: 6, sb: 10 });

  // 3. Central Sacred Lotus Mandala (Breathing & Radiating)
  const pulse = 1.0 + Math.sin(t * TAU * 0.4) * 0.04;
  const cx = CX, cy = 960;

  // Outer Decorative Star Halo
  cut(flameRingPts(cx, cy, 330 * pulse, 32), PAL.woodD, {
    key: 'intro_halo_outer', sy: 8, sb: 14,
    pat: pat.stripes('rgba(255,255,255,0.12)', 8, 24)
  });

  // Middle Golden Lotus Petals
  cut(lotusHaloPts(cx, cy, 270 * pulse, 16), PAL.mustard, {
    key: 'intro_lotus_mid', sy: 7, sb: 12
  });

  // Inner Radiant Disc (Matches Bridge 0 Shape)
  cut(ellipsePts(cx, cy, 190 * pulse, 190 * pulse, 0, 36), PAL.yellow, {
    key: 'intro_disc_inner', sy: 5, sb: 8
  });

  // Core Sacred Flame / Emblem
  cut(ellipsePts(cx, cy, 70, 110, 0, 24), PAL.orange, {
    key: 'intro_core_flame', shadow: false
  });
  cut(ellipsePts(cx, cy, 40, 70, 0, 20), PAL.paper, {
    key: 'intro_flame_bright', shadow: false
  });

  // 4. Grand Title Card Banners
  tag('SCULPTURE OF ANCIENT INDIA', CX, 520, 64, {
    rot: -0.015, fill: PAL.paper, color: PAL.ink, s: popS(E0 + 0.3)
  });

  tag('4,000 YEARS OF FORM & SPIRIT', CX, 640, 42, {
    rot: 0.01, fill: PAL.cream, color: PAL.woodD, s: popS(E0 + 0.6)
  });

  // 5. Epigraph / Opening Subtitle Tag
  tag('BRONZE • STONE • LIVING ROCK', CX, 1380, 36, {
    rot: -0.008, fill: PAL.paper, color: PAL.ink, s: popS(E0 + 0.9)
  });

  // Tags & Captions
  yearTag('3000 BCE — 1200 CE');
  capStrip('Prologue • The Awakening of Sacred Form');
}

// ---------------------------------------------------------------------
// SCENE 1: INDUS BRONZE (2500 BCE) — Dancing Girl of Mohenjo-daro
// ---------------------------------------------------------------------
function sceneIndus() {
  const t = seg(TT, 7.5, 15.0);

  // 1. Full-Bleed Terracotta Brick Wall (Torn Paper with pattern)
  cut(rect(-30, -30, W + 60, H + 60, 0), PAL.wood, {
    key: 'indus_wall', shadow: false, tear: 0,
    pat: pat.stripes('rgba(255,240,210,0.12)', 20, 60, 0)
  });

  // 2. Indus Valley Stone Base / Table
  cut(rect(-30, 1580, W + 60, 400, 0), PAL.woodD, {
    key: 'indus_floor', sy: -8, sb: 12,
    pat: pat.grainWood('rgba(60,30,10,0.25)')
  });

  // 3. Ancient Pictographic Seals on the Wall
  cut(rect(100, 420, 180, 180, 8), PAL.cream, { key: 'seal_l', sy: 6, sb: 8 });
  ink([[130, 490], [250, 490]], { w: 6, color: PAL.ink, key: 's1_a' });
  ink([[190, 450], [190, 570]], { w: 6, color: PAL.ink, key: 's1_b' });
  ink([[140, 550], [240, 520]], { w: 4, color: PAL.ink, key: 's1_c' });

  cut(rect(W - 280, 420, 180, 180, 8), PAL.cream, { key: 'seal_r', sy: 6, sb: 8 });
  cut(ellipsePts(W - 190, 510, 50, 50, 0, 24), PAL.mustard, { key: 'seal_r_disc', shadow: false });
  ink([[W - 230, 510], [W - 150, 510]], { w: 6, color: PAL.ink, key: 's2_a' });

  // 4. The Dancing Girl (Cut-Paper Bronze Silhouette)
  const figX = CX;
  const figY = 1040 + Math.sin(t * TAU * 0.5) * 8; // Gentle breathing bob
  const bronze = PAL.woodD;
  const bronzeL = PAL.mustard;

  // Crucible Foundry Fire glow behind figure
  cut(ellipsePts(figX, 1620, 360, 100, 0, 36), PAL.orange, {
    key: 'foundry_glow', shadow: false, crayon: '#f6cf55'
  });

  // Torso (Contrapposto / Tribhanga posture)
  const torsoPts = [
    [figX - 45, figY - 260], [figX + 55, figY - 250], [figX + 35, figY - 100],
    [figX + 75, figY + 60],  [figX - 25, figY + 70],  [figX - 65, figY + 40],
    [figX - 35, figY - 110]
  ];
  cut(torsoPts, bronze, { key: 'dg_torso', sy: 8, sb: 12 });

  // Head with High Bun (Chignon) tilted back proudly
  cut(ellipsePts(figX + 15, figY - 330, 55, 65, 0.2, 24), bronze, { key: 'dg_head', sy: 6, sb: 8 });
  cut(ellipsePts(figX + 75, figY - 340, 45, 45, 0, 18), bronze, { key: 'dg_bun', sy: 6, sb: 8 });

  // Right Arm (Resting boldly on Right Hip)
  ink([[figX + 45, figY - 240], [figX + 160, figY - 110], [figX + 65, figY + 60]], {
    w: 12, color: bronze, amt: 0.4, key: 'dg_arm_r'
  });
  // Right Arm Amulet
  cut(rect(figX + 115, figY - 170, 30, 38, 4), bronzeL, { key: 'arm_amulet', sy: 2, sb: 4 });

  // Left Arm (Long and slender, resting on Left Thigh, loaded with 22 bangles)
  ink([[figX - 40, figY - 240], [figX - 110, figY - 30], [figX - 55, figY + 180]], {
    w: 10, color: bronze, amt: 0.4, key: 'dg_arm_l'
  });

  // The 22 Famous Bangles stacking down left arm
  for (let b = 0; b < 18; b++) {
    const by = (figY - 220) + b * 18;
    const bx = figX - 50 - Math.sin((b / 18) * Math.PI) * 55;
    cut(ellipsePts(bx, by, 22, 11, -0.3, 14), (b % 3 === 0 ? PAL.yellow : bronzeL), {
      key: 'bangle_' + b, sb: 3, sy: 2
    });
  }

  // Legs in dynamic forward stance
  // Left leg straight
  ink([[figX - 25, figY + 70], [figX - 35, figY + 360], [figX - 30, figY + 540]], {
    w: 12, color: bronze, amt: 0.3, key: 'dg_leg_l'
  });
  // Right leg bent forward at knee
  ink([[figX + 45, figY + 70], [figX + 70, figY + 320], [figX + 50, figY + 540]], {
    w: 12, color: bronze, amt: 0.3, key: 'dg_leg_r'
  });

  // 5. Paper Tags & Metadata
  yearTag('2500 BCE • Indus Valley');
  capStrip('Dancing Girl of Mohenjo-daro • Lost-Wax Bronze');
}

// ---------------------------------------------------------------------
// SCENE 2: MAURYAN LION CAPITAL (250 BCE) — Sarnath Sandstone
// ---------------------------------------------------------------------
function sceneMaurya() {
  const t = seg(TT, 15.0, 22.5);

  // 1. Ochre / Gold Chunar Sandstone Textured Paper
  cut(rect(-30, -30, W + 60, H + 60, 0), PAL.mustard, {
    key: 'maurya_wall', shadow: false, tear: 0,
    pat: pat.dots('rgba(255,255,255,0.18)', 3, 28)
  });

  // 2. Monolithic Ashokan Sandstone Pillar Base
  const colW = 340;
  cut(rect(CX - colW / 2, 1160, colW, 800, 0), PAL.woodL, {
    key: 'ashoka_shaft', sy: 12, sb: 20,
    pat: pat.stripes('rgba(255,245,220,0.20)', 14, 45, 0)
  });

  // Bell-shaped Inverted Lotus Capital
  const bellPts = [
    [CX - 220, 1160], [CX + 220, 1160],
    [CX + 180, 1020], [CX - 180, 1020]
  ];
  cut(bellPts, PAL.cream, { key: 'inverted_lotus', sy: 8, sb: 12 });
  // Carved Lotus Petals on Capital
  for (let p = 0; p < 7; p++) {
    const px = CX - 160 + p * 53;
    cut(ellipsePts(px, 1090, 24, 60, 0, 16), PAL.mustard, { key: 'lotus_p_' + p, sy: 3, sb: 4 });
  }

  // Circular Abacus with Frize
  cut(rect(CX - 260, 960, 520, 70, 8), PAL.woodD, { key: 'abacus_drum', sy: 8, sb: 14 });

  // 3. The 24-Spoke Ashoka Dharma Chakra on Abacus
  const chakraX = CX;
  const chakraY = 995;
  const rotA = t * TAU * 0.25; // Continuous noble spin
  cut(ellipsePts(chakraX, chakraY, 38, 38, 0, 24), PAL.blue, { key: 'abacus_chakra', sy: 4, sb: 6 });
  ink([[chakraX - 35, chakraY], [chakraX + 35, chakraY]], { w: 3, color: PAL.cream, key: 'spk_1' });
  ink([[chakraX, chakraY - 35], [chakraX, chakraY + 35]], { w: 3, color: PAL.cream, key: 'spk_2' });

  // 4. Four Lions Standing Back-to-Back (Majestic Silhouette)
  const lionBaseY = 960;
  const lionGold = PAL.paper;

  // Central Forward Lion Body & Chest
  cut(rect(CX - 130, lionBaseY - 340, 260, 340, 20), lionGold, { key: 'lion_chest', sy: 10, sb: 16 });

  // Elaborate Stylized Ruffled Mane (Cut-Paper Triangular Teeth)
  for (let m = 0; m < 5; m++) {
    const my = lionBaseY - 300 + m * 55;
    cut([
      [CX - 190, my], [CX - 130, my - 25], [CX - 130, my + 25]
    ], PAL.mustard, { key: 'mane_l_' + m, sy: 4, sb: 6 });
    cut([
      [CX + 190, my], [CX + 130, my - 25], [CX + 130, my + 25]
    ], PAL.mustard, { key: 'mane_r_' + m, sy: 4, sb: 6 });
  }

  // Regal Lion Muzzle, Snout, Jaws
  cut(ellipsePts(CX, lionBaseY - 360, 110, 80, 0, 24), lionGold, { key: 'lion_head', sy: 6, sb: 10 });
  cut(rect(CX - 50, lionBaseY - 350, 100, 60, 10), PAL.cream, { key: 'lion_muzzle', sy: 4, sb: 6 });
  // Whiskers and Fierce Open Mouth
  cut(ellipsePts(CX, lionBaseY - 310, 40, 20, 0, 16), PAL.ink, { key: 'lion_mouth', shadow: false });
  dot(CX - 40, lionBaseY - 380, 10, PAL.ink);
  dot(CX + 40, lionBaseY - 380, 10, PAL.ink);

  // Left & Right Flanking Lions (Profiles)
  cut(rect(CX - 280, lionBaseY - 300, 160, 280, 14), PAL.cream, { key: 'lion_side_l', sy: 8, sb: 12 });
  cut(rect(CX + 120, lionBaseY - 300, 160, 280, 14), PAL.cream, { key: 'lion_side_r', sy: 8, sb: 12 });

  // 5. Giant Floating Golden Dharma Chakra overhead
  const topChakraY = 460;
  const wheelR = 210;
  cut(chakraSpokePts(CX, topChakraY, wheelR, wheelR - 30, 24), PAL.blue, {
    key: 'giant_chakra', sy: 8, sb: 14,
    rot: rotA
  });
  cut(ellipsePts(CX, topChakraY, 45, 45, 0, 24), PAL.yellow, { key: 'hub_disc', sy: 4, sb: 6 });

  // Tags & Captions
  yearTag('250 BCE • Imperial Maurya');
  capStrip('Ashokan Lion Capital • Polished Sandstone');
}

// ---------------------------------------------------------------------
// SCENE 3: GUPTA SERENITY (500 CE) — Sarnath Preaching Buddha
// ---------------------------------------------------------------------
function sceneGupta() {
  const t = seg(TT, 22.5, 30.0);

  // 1. Serene Mint-Sage Backdrop with Subtle Lotus Lattice
  cut(rect(-30, -30, W + 60, H + 60, 0), PAL.mint, {
    key: 'gupta_wall', shadow: false, tear: 0,
    pat: pat.gingham('rgba(255,255,255,0.15)', 36)
  });

  // 2. Ornate Prabhamandala (Elaborate Lotus Halo)
  const haloX = CX;
  const haloY = 740;
  const haloR = 290;

  // Outer Radiating Halo Layer
  cut(lotusHaloPts(haloX, haloY, haloR, 16), PAL.mustard, {
    key: 'halo_outer', sy: 10, sb: 16,
    pat: pat.stripes('rgba(255,255,255,0.22)', 10, 30)
  });

  // Middle Cream Floral Halo Ring
  cut(ellipsePts(haloX, haloY, haloR - 50, haloR - 50, 0, 48), PAL.cream, {
    key: 'halo_mid', sy: 6, sb: 10
  });

  // Inner Golden Glow Disc
  cut(ellipsePts(haloX, haloY, haloR - 110, haloR - 110, 0, 36), PAL.yellow, {
    key: 'halo_inner', shadow: false
  });

  // 3. Meditating Buddha Figure (Padmasana)
  const budX = CX;
  const budY = 1100 + Math.sin(t * TAU * 0.3) * 6;
  const stone = PAL.paper;

  // Translucent Gossamer Sanghati Robe (Smooth clinging lines)
  cut(rect(budX - 160, budY - 240, 320, 380, 24), stone, { key: 'bud_torso', sy: 12, sb: 18 });

  // Head with Ushnisha & Elongated Earlobes
  cut(ellipsePts(budX, budY - 360, 85, 105, 0, 32), stone, { key: 'bud_head', sy: 8, sb: 12 });
  // Curly Hair Knots & Ushnisha Crown
  cut(ellipsePts(budX, budY - 460, 42, 34, 0, 18), PAL.charcoal, { key: 'bud_ushnisha', sy: 4, sb: 6 });
  for (let h = 0; h < 9; h++) {
    const ha = (h / 8) * Math.PI;
    const hx = budX + Math.cos(ha) * 75;
    const hy = budY - 410 - Math.sin(ha) * 35;
    cut(ellipsePts(hx, hy, 16, 16, 0, 10), PAL.charcoal, { key: 'hair_' + h, shadow: false });
  }

  // Serene Downcast Eyes & Trance Smile (Gupta Transcendence)
  ink([[budX - 45, budY - 365], [budX - 15, budY - 360]], { w: 4, color: PAL.charcoal, amt: 0.2, key: 'eye_l' });
  ink([[budX + 45, budY - 365], [budX + 15, budY - 360]], { w: 4, color: PAL.charcoal, amt: 0.2, key: 'eye_r' });
  ink([[budX - 20, budY - 315], [budX, budY - 310], [budX + 20, budY - 315]], { w: 4, color: PAL.charcoal, key: 'lip' });

  // Long Earlobes
  cut(rect(budX - 100, budY - 360, 14, 75, 7), stone, { key: 'ear_l', shadow: false });
  cut(rect(budX + 86, budY - 360, 14, 75, 7), stone, { key: 'ear_r', shadow: false });

  // Dharmachakra Mudra (Turning the Wheel of Law with hands at chest)
  cut(ellipsePts(budX - 25, budY - 140, 32, 32, 0, 16), stone, { key: 'hand_l', sy: 4, sb: 6 });
  cut(ellipsePts(budX + 25, budY - 140, 32, 32, 0, 16), stone, { key: 'hand_r', sy: 4, sb: 6 });
  ink([[budX - 25, budY - 140], [budX + 25, budY - 140]], { w: 8, color: PAL.mustard, key: 'mudra_touch' });

  // Crossed Legs (Padmasana / Full Lotus)
  const lotusLapPts = [
    [budX - 320, budY + 220], [budX + 320, budY + 220],
    [budX + 260, budY + 110], [budX - 260, budY + 110]
  ];
  cut(lotusLapPts, stone, { key: 'lotus_lap', sy: 12, sb: 18 });

  // 4. Throne Pedestal with Two Deers & Dharma Chakra
  cut(rect(CX - 360, 1420, 720, 180, 10), PAL.cream, {
    key: 'throne_base', sy: 10, sb: 16,
    pat: pat.lines('rgba(150,110,60,0.18)', 16)
  });
  // Central Wheel on throne
  cut(chakraSpokePts(CX, 1510, 50, 40, 12), PAL.blue, { key: 'throne_chakra', sy: 4, sb: 6 });
  // Two recumbent deer flanking the wheel
  tag('DEER', CX - 200, 1510, 24, { fill: PAL.mustard, color: PAL.ink, key: 'deer_l' });
  tag('DEER', CX + 200, 1510, 24, { fill: PAL.mustard, color: PAL.ink, key: 'deer_r' });

  // Tags & Captions
  yearTag('500 CE • Golden Age Gupta');
  capStrip('Sarnath Buddha • Dharmachakra Mudra');
}

// ---------------------------------------------------------------------
// SCENE 4: ELEPHANTA TRIMURTI (750 CE) — Rock-Cut Basalt Colossus
// ---------------------------------------------------------------------
function sceneElephanta() {
  const t = seg(TT, 30.0, 37.5);

  // 1. Deep Subterranean Basalt Rock Paper
  cut(rect(-30, -30, W + 60, H + 60, 0), PAL.night, {
    key: 'cave_rock', shadow: false, tear: 0,
    pat: pat.stripes('rgba(255,255,255,0.06)', 40, 120, 0.4)
  });

  // 2. Colossal Rock-Cut Pillars Framing the Recess
  cut(rect(0, 0, 180, H, 0), PAL.charcoal, {
    key: 'pil_l', sy: 14, sb: 24,
    pat: pat.grainWood('rgba(255,255,255,0.08)')
  });
  cut(rect(W - 180, 0, 180, H, 0), PAL.charcoal, {
    key: 'pil_r', sy: -14, sb: 24,
    pat: pat.grainWood('rgba(255,255,255,0.08)')
  });

  // Flickering Cave Fire Torches on Pillars
  const flk = Math.sin(t * 18) * 8;
  cut(ellipsePts(90, 780, 40 + flk, 70, 0, 18), PAL.orange, { key: 'torch_l', shadow: false });
  cut(ellipsePts(W - 90, 780, 40 - flk, 70, 0, 18), PAL.orange, { key: 'torch_r', shadow: false });
  cut(ellipsePts(90, 780, 20, 35, 0, 14), PAL.yellow, { key: 'torch_in_l', shadow: false });
  cut(ellipsePts(W - 90, 780, 20, 35, 0, 14), PAL.yellow, { key: 'torch_in_r', shadow: false });

  // 3. The Three Colossal Faces of Shiva (Sadashiva / Mahesamurti)
  const baseY = 1040;
  const rockGrey = PAL.tweed;
  const rockD = PAL.charcoal;

  // Massive Shoulders & Basalt Wall Foundation
  cut(rect(180, baseY, W - 360, 600, 20), rockD, { key: 'trimurti_base', sy: 16, sb: 26 });

  // FACE 1: Central Face — TATPURUSHA (Serene, Transcendent Preserver)
  const cenX = CX;
  const cenY = baseY - 240;
  cut(rect(cenX - 140, cenY - 260, 280, 460, 32), rockGrey, { key: 'face_cen_head', sy: 14, sb: 22 });
  // Colossal Ornate Crown (Jatamukuta with Jewels)
  cut(rect(cenX - 110, cenY - 480, 220, 230, 16), PAL.woodD, {
    key: 'crown_cen', sy: 10, sb: 16,
    pat: pat.stripes('rgba(255,240,200,0.18)', 8, 22)
  });
  // Serene Meditative Eyes & Full Lips
  ink([[cenX - 85, cenY - 140], [cenX - 25, cenY - 130]], { w: 6, color: PAL.ink, key: 'c_eye_l' });
  ink([[cenX + 85, cenY - 140], [cenX + 25, cenY - 130]], { w: 6, color: PAL.ink, key: 'c_eye_r' });
  cut(rect(cenX - 50, cenY - 30, 100, 36, 12), PAL.brick, { key: 'c_lips', sy: 4, sb: 6 });

  // FACE 2: Left Face (Viewer's Left) — AGHORA / BHAIRAVA (Fierce Destroyer)
  const leftX = cenX - 240;
  const leftY = cenY + 30;
  cut(rect(leftX - 80, leftY - 200, 180, 380, 24), PAL.brick, { key: 'face_left_fierce', sy: 12, sb: 18 });
  // Skull & Serpent in Muffled Coiled Hair
  cut(ellipsePts(leftX - 20, leftY - 340, 70, 90, -0.2, 16), rockD, { key: 'hair_left', sy: 8, sb: 12 });
  cut(ellipsePts(leftX - 20, leftY - 380, 30, 30, 0, 12), PAL.cream, { key: 'skull_emblem', shadow: false });
  // Hooked Fierce Brow & Serpent Hand
  ink([[leftX - 50, leftY - 110], [leftX + 20, leftY - 70]], { w: 7, color: PAL.ink, key: 'fierce_brow' });
  tag('SKULL', leftX - 10, leftY - 340, 22, { fill: PAL.night, color: PAL.cream, key: 'skull_tag' });

  // FACE 3: Right Face (Viewer's Right) — VAMADEVA / UMA (Feminine, Creator, Lotus)
  const rightX = cenX + 240;
  const rightY = cenY + 30;
  cut(rect(rightX - 100, rightY - 200, 180, 380, 24), PAL.cream, { key: 'face_right_soft', sy: 12, sb: 18 });
  // Pearl-braided Hair with Lotus Flower
  cut(ellipsePts(rightX + 20, rightY - 340, 70, 90, 0.2, 16), PAL.mustard, { key: 'hair_right', sy: 8, sb: 12 });
  cut(lotusHaloPts(rightX + 50, rightY - 360, 40, 8), PAL.pink, { key: 'hair_lotus', shadow: false });
  // Tender Slanted Eye Holding Lotus Blossom
  ink([[rightX - 20, rightY - 100], [rightX + 50, rightY - 120]], { w: 5, color: PAL.ink, key: 'soft_brow' });
  tag('LOTUS', rightX + 20, rightY - 180, 22, { fill: PAL.mint, color: PAL.ink, key: 'lotus_tag' });

  // Tags & Captions
  yearTag('750 CE • Rock-Cut Basalt');
  capStrip('Elephanta Trimurti • Three Faces of Shiva');
}

// ---------------------------------------------------------------------
// SCENE 5: CHOLA BRONZE NATARAJA (1100 CE) — Cosmic Ring of Fire
// ---------------------------------------------------------------------
function sceneChola() {
  const t = seg(TT, 37.5, 45.0);

  // 1. Midnight Blue Silk & Deep Ash Wall
  cut(rect(-30, -30, W + 60, H + 60, 0), PAL.night, {
    key: 'chola_wall', shadow: false, tear: 0,
    pat: pat.dots('rgba(255,200,100,0.12)', 4, 32)
  });

  // 2. Double Lotus Pedestal Base
  cut(rect(CX - 240, 1540, 480, 90, 12), PAL.woodD, { key: 'pedestal_1', sy: 8, sb: 14 });
  cut(rect(CX - 190, 1470, 380, 75, 10), PAL.mustard, { key: 'pedestal_2', sy: 6, sb: 10 });

  // Apasmara (The Dwarf of Ignorance crushed under right foot)
  cut(rect(CX - 110, 1420, 220, 55, 14), PAL.tweed, { key: 'apasmara', sy: 4, sb: 8 });
  tag('IGNORANCE', CX, 1445, 22, { fill: PAL.paper, color: PAL.ink, tape: false, key: 'apas_tag' });

  // 3. Tiruvasi — The Great Cosmic Ring of Fire (Prabhamandala)
  const ringX = CX;
  const ringY = 960;
  const ringR = 390;
  const rotFire = t * TAU * 0.15;

  // Outer Flaming Circle
  cut(flameRingPts(ringX, ringY, ringR, 28), PAL.orange, {
    key: 'fire_ring_outer', sy: 12, sb: 22,
    rot: rotFire,
    pat: pat.stripes('rgba(255,255,255,0.25)', 8, 20)
  });

  // Inner Hollow Ring (Reveals midnight background)
  cut(ellipsePts(ringX, ringY, ringR - 60, ringR - 60, 0, 48), PAL.night, {
    key: 'fire_ring_inner', shadow: false, grain: 0.5
  });

  // 4. Shiva Nataraja (Cast-Bronze Figure in Anandatandava)
  const natX = CX;
  const natY = 950 + Math.sin(t * TAU * 0.6) * 10;
  const bronze = PAL.mustard;

  // Streaming Matted Hair (Jata)
  for (let j = 0; j < 6; j++) {
    const jy = (natY - 240) + j * 16;
    ink([[natX - 340, jy + Math.sin(t * 8 + j) * 12], [natX + 340, jy - Math.sin(t * 8 + j) * 12]], {
      w: 6, color: PAL.orange, key: 'chola_hair_' + j
    });
  }

  // Dancing Torso
  const torsoPts = [
    [natX - 55, natY - 220], [natX + 55, natY - 220],
    [natX + 45, natY + 40],  [natX - 35, natY + 50]
  ];
  cut(torsoPts, bronze, { key: 'nat_torso', sy: 8, sb: 12 });

  // Head, Crown & Face
  cut(ellipsePts(natX, natY - 240, 58, 58, 0, 24), bronze, { key: 'nat_head', sy: 6, sb: 8 });
  cut(rect(natX - 25, natY - 330, 50, 75, 4), PAL.woodD, { key: 'nat_crown', sy: 4, sb: 6 });
  cut(ellipsePts(natX, natY - 245, 6, 12, 0, 12), PAL.orange, { key: 'third_eye', shadow: false });

  // Four Divine Arms
  // 1. Upper Right: Damaru Drum (Creation)
  ink([[natX + 45, natY - 180], [natX + 260, natY - 200]], { w: 8, color: PAL.woodD, key: 'arm_damaru' });
  cut(ellipsePts(natX + 270, natY - 205, 30, 30, 0, 16), PAL.yellow, { key: 'damaru_drum', sy: 4, sb: 6 });
  tag('DRUM', natX + 270, natY - 195, 20, { rot: 0, s: 1, key: 'drum_tag' });

  // 2. Upper Left: Agni Flame (Destruction)
  ink([[natX - 45, natY - 180], [natX - 260, natY - 200]], { w: 8, color: PAL.woodD, key: 'arm_agni' });
  cut(ellipsePts(natX - 270, natY - 205, 30, 30, 0, 16), PAL.orange, { key: 'agni_flame', sy: 4, sb: 6 });
  tag('FIRE', natX - 270, natY - 195, 20, { rot: 0, s: 1, key: 'fire_tag' });

  // 3. Lower Right: Abhaya Mudra (Protection)
  ink([[natX + 40, natY - 120], [natX + 170, natY - 60]], { w: 8, color: PAL.woodD, key: 'arm_abhaya' });
  cut(ellipsePts(natX + 175, natY - 55, 30, 30, 0, 16), bronze, { key: 'abhaya_hand', sy: 4, sb: 6 });

  // 4. Lower Left: Gaja-hasta (Grace & Refuge pointing to lifted foot)
  ink([[natX - 40, natY - 120], [natX + 40, natY + 20], [natX - 110, natY + 110]], {
    w: 8, color: PAL.woodD, key: 'arm_gaja'
  });

  // Right Leg (Planted firmly on Apasmara)
  ink([[natX + 20, natY + 45], [natX + 15, natY + 360], [natX - 5, natY + 540]], {
    w: 10, color: PAL.woodD, key: 'leg_r'
  });
  cut(ellipsePts(natX - 5, natY + 540, 24, 14, 0, 16), bronze, { key: 'foot_r', shadow: false });

  // Left Leg (Lifted diagonally in Ananda Tandava)
  ink([[natX - 20, natY + 45], [natX - 140, natY + 180], [natX + 90, natY + 280]], {
    w: 10, color: PAL.woodD, key: 'leg_l'
  });
  cut(ellipsePts(natX + 90, natY + 280, 26, 15, 0.4, 16), bronze, { key: 'foot_l', shadow: false });

  // Tags & Captions
  yearTag('1100 CE • Imperial Chola');
  capStrip('Shiva Nataraja • The Cosmic Dance of Bliss');
}

// ---------------------------------------------------------------------
// SCENE 6: OUTRO END FRAME (45.0 - 52.5s) — The Sacred Geometry
// ---------------------------------------------------------------------
function sceneOutro() {
  const t = seg(TT, 45.0, 52.5);

  // 1. Rich Imperial Midnight Violet Textured Paper
  cut(rect(-30, -30, W + 60, H + 60, 0), '#1d172e', {
    key: 'outro_wall', shadow: false, tear: 0,
    pat: pat.dots('rgba(255,220,130,0.12)', 3, 30)
  });

  // 2. Ornate Lotus Torana Archway (Coda Border)
  cut(rect(50, 200, W - 100, 32, 6), PAL.mustard, { key: 'outro_arch_top', sy: 6, sb: 10 });
  cut(rect(60, 240, 36, H - 480, 6), PAL.cream, { key: 'outro_col_l', sy: 6, sb: 10 });
  cut(rect(W - 96, 240, 36, H - 480, 6), PAL.cream, { key: 'outro_col_r', sy: 6, sb: 10 });

  // 3. Central Radiant Sun-Lotus Medallion (Enduring Harmony)
  const cx = CX, cy = 960;
  const pulse = 1.0 + Math.sin(t * TAU * 0.3) * 0.03;

  // Outer Golden Radiance
  cut(lotusHaloPts(cx, cy, 320 * pulse, 20), PAL.orangeD, {
    key: 'outro_halo_outer', sy: 10, sb: 18,
    pat: pat.stripes('rgba(255,255,255,0.18)', 8, 24)
  });

  // Middle Golden Petals
  cut(lotusHaloPts(cx, cy, 260 * pulse, 16), PAL.mustard, {
    key: 'outro_lotus_mid', sy: 8, sb: 14
  });

  // Inner Sacred Wheel (24-spoke Dharma Chakra inside Sun Lotus)
  cut(chakraSpokePts(cx, cy, 180 * pulse, 150 * pulse, 24), PAL.blue, {
    key: 'outro_wheel_inner', sy: 6, sb: 10,
    rot: t * TAU * 0.1
  });

  // Core Golden Seed of Light
  cut(ellipsePts(cx, cy, 65, 65, 0, 24), PAL.yellow, {
    key: 'outro_core_disc', shadow: false
  });
  cut(ellipsePts(cx, cy, 35, 35, 0, 16), PAL.paper, {
    key: 'outro_seed_dot', shadow: false
  });

  // 4. Sacred Oil Lamps (Diyas) on Left & Right
  const lampL = 200, lampR = W - 200, lampY = 1380;
  cut(rect(lampL - 40, lampY, 80, 40, 8), PAL.woodD, { key: 'diya_base_l', sy: 4, sb: 6 });
  cut(rect(lampR - 40, lampY, 80, 40, 8), PAL.woodD, { key: 'diya_base_r', sy: 4, sb: 6 });
  cut(ellipsePts(lampL, lampY - 20, 25, 45, 0, 14), PAL.orange, { key: 'flame_l', shadow: false });
  cut(ellipsePts(lampR, lampY - 20, 25, 45, 0, 14), PAL.orange, { key: 'flame_r', shadow: false });

  // 5. Grand Epilogue Tags
  tag('THE SACRED GEOMETRY', CX, 520, 60, {
    rot: 0.01, fill: PAL.paper, color: PAL.ink, s: popS(E0 + 0.3)
  });

  tag('FOUR THOUSAND YEARS OF DEVOTION', CX, 640, 38, {
    rot: -0.01, fill: PAL.cream, color: PAL.woodD, s: popS(E0 + 0.6)
  });

  // Bottom Summary Pill Tags (The 5 Eras Journey)
  tag('INDUS • MAURYA • GUPTA • ELEPHANTA • CHOLA', CX, 1540, 32, {
    rot: 0.005, fill: PAL.paper, color: PAL.night, s: popS(E0 + 0.8)
  });

  // Tags & Captions
  yearTag('Enduring Heritage');
  capStrip('From Clay to Cosmic Dance • The Spirit Lives in Form');
}
