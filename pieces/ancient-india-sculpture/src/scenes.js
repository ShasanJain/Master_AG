// =====================================================================
//  SCENES — Ancient Indian Sculpture (Cut-Paper Collage Animation)
//  Tactile torn-edge paper shapes with soft drop shadows, patterns,
//  and paper tags across 4,000 years of sculptural form.
// =====================================================================

// ---------------------------------------------------------------------
// ERA 0: INDUS BRONZE (2500 BCE) — Dancing Girl of Mohenjo-daro
// ---------------------------------------------------------------------
function sceneIndus() {
  const t = seg(TT, 0.0, 9.0);

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
  cut(torsoPts, bronze, { key: 'indus_torso', tear: 1.2, sy: 8, sb: 12 });
  // Bronze chest highlight
  cut(ellipsePts(figX + 5, figY - 170, 35, 45, 0.1, 20), bronzeL, { key: 'indus_chest_hl', shadow: false });

  // Head, Chin & Hair Bun
  cut(ellipsePts(figX + 10, figY - 330, 68, 68, 0, 32), bronze, { key: 'indus_head', sy: 6, sb: 8 });
  cut(ellipsePts(figX + 70, figY - 320, 52, 60, 0.2, 28), PAL.ink, { key: 'indus_bun', sy: 4, sb: 6 });
  // Cowrie shell eye
  cut(ellipsePts(figX - 8, figY - 335, 14, 18, 0, 16), PAL.paper, { key: 'indus_eye', shadow: false });
  ink([[figX - 18, figY - 315], [figX + 6, figY - 315]], { w: 6, color: PAL.ink, key: 'indus_lips' });

  // Right Leg (Bearing weight)
  const rLegPts = [
    [figX + 45, figY + 65], [figX + 55, figY + 280], [figX + 40, figY + 540],
    [figX + 10, figY + 540], [figX + 25, figY + 280], [figX + 15, figY + 65]
  ];
  cut(rLegPts, bronze, { key: 'indus_rleg', sy: 6, sb: 8 });

  // Left Leg (Bent gracefully at knee)
  const lLegPts = [
    [figX - 45, figY + 65], [figX - 95, figY + 290], [figX - 40, figY + 530],
    [figX - 70, figY + 530], [figX - 125, figY + 290], [figX - 65, figY + 65]
  ];
  cut(lLegPts, bronze, { key: 'indus_lleg', sy: 6, sb: 8 });

  // Right Arm: Resting firmly on right hip
  const rArmPts = [
    [figX + 55, figY - 250], [figX + 140, figY - 110], [figX + 75, figY + 55],
    [figX + 60, figY + 45],  [figX + 115, figY - 100], [figX + 40, figY - 240]
  ];
  cut(rArmPts, bronze, { key: 'indus_rarm', sy: 6, sb: 8 });
  for (let b = 0; b < 4; b++) {
    cut(rect(figX + 85 + b * 6, figY + 20 - b * 4, 8, 22, 2), PAL.yellow, { key: 'r_amulet_' + b, shadow: false });
  }

  // Left Arm: Sleeved with 22 bangles from wrist to shoulder
  const lArmPts = [
    [figX - 45, figY - 260], [figX - 120, figY - 80], [figX - 85, figY + 140],
    [figX - 65, figY + 130], [figX - 95, figY - 75],  [figX - 30, figY - 250]
  ];
  cut(lArmPts, bronze, { key: 'indus_larm', sy: 6, sb: 8 });
  for (let b = 0; b < 22; b++) {
    const by = (figY - 220) + b * 15;
    const bx = (figX - 55) - b * 1.5;
    cut(ellipsePts(bx, by, 32, 12, -0.3, 20), PAL.cream, { key: 'bangle_' + b, sy: 2, sb: 4 });
  }

  // Tags & Captions
  yearTag('2500 BCE • Indus Valley');
  capStrip('Mohenjo-daro Dancing Girl in Lost-Wax Bronze');
}

// ---------------------------------------------------------------------
// ERA 1: MAURYA POLISH (250 BCE) — Sarnath Lion Capital
// ---------------------------------------------------------------------
function sceneMaurya() {
  const t = seg(TT, 9.0, 18.0);

  // 1. Imperial Sandstone Wall with subtle vertical grain
  cut(rect(-30, -30, W + 60, H + 60, 0), PAL.mustard, {
    key: 'maurya_wall', shadow: false, tear: 0,
    pat: pat.stripes('rgba(255,255,255,0.14)', 14, 50, 0.4)
  });

  // 2. Monolithic Column Shaft (Mirror-like Mauryan Polish)
  cut(rect(CX - 150, 1260, 300, 600, 4), PAL.cream, {
    key: 'maurya_shaft', sy: 8, sb: 14, crayon: '#d9a441'
  });
  // Specular high-gloss sheen streak
  cut(rect(CX - 25, 1260, 50, 600, 0), '#ffffff', {
    key: 'maurya_sheen', shadow: false, tear: 0
  });

  // 3. Inverted Bell Lotus Capital
  const lotusBaseY = 1260;
  for (let p = 0; p < 12; p++) {
    const lx = (CX - 200) + p * 36;
    const petalPts = [
      [lx, lotusBaseY], [lx + 18, lotusBaseY - 110], [lx + 36, lotusBaseY],
      [lx + 18, lotusBaseY + 20]
    ];
    cut(petalPts, PAL.yellow, { key: 'lotus_petal_' + p, sy: 6, sb: 8 });
  }

  // 4. Circular Drum Abacus with Animal Relieves
  const abacusY = 1120;
  cut(rect(CX - 270, abacusY - 60, 540, 85, 8), PAL.teal, {
    key: 'abacus_drum', sy: 8, sb: 12
  });
  tag('HORSE • CHAKRA • BULL • LION', CX, abacusY + 40, 32, {
    rot: 0, s: 1, key: 'abacus_tag'
  });

  // 5. Four Addorsed Asiatic Lions (Back-to-Back)
  const lionY = 720;
  // Left Lion Body
  cut(ellipsePts(CX - 120, lionY + 50, 140, 140, 0, 32), PAL.cream, {
    key: 'lion_body_l', sy: 8, sb: 12
  });
  // Right Lion Body
  cut(ellipsePts(CX + 120, lionY + 50, 140, 140, 0, 32), PAL.cream, {
    key: 'lion_body_r', sy: 8, sb: 12
  });

  // Stylized Curled Flame Manes
  for (let a = 0; a < 26; a++) {
    const ang = (a / 26) * TAU;
    const mx = CX + Math.cos(ang) * 190;
    const my = (lionY + 60) + Math.sin(ang) * 150;
    cut(ellipsePts(mx, my, 22, 22, 0, 16), PAL.woodD, {
      key: 'mane_curl_' + a, sy: 3, sb: 5
    });
  }

  // Roaring Snouts
  cut(ellipsePts(CX - 110, lionY + 110, 48, 48, 0, 20), PAL.woodD, { key: 'snout_l', sy: 4, sb: 6 });
  cut(ellipsePts(CX + 110, lionY + 110, 48, 48, 0, 20), PAL.woodD, { key: 'snout_r', sy: 4, sb: 6 });
  cut(rect(CX - 125, lionY + 100, 30, 16, 2), '#ffffff', { key: 'tooth_l', shadow: false });
  cut(rect(CX + 95, lionY + 100, 30, 16, 2), '#ffffff', { key: 'tooth_r', shadow: false });

  // 6. The Crown: 24-Spoke Rotating Ashoka Chakra Wheel
  const rot = t * 0.4;
  const chakraY = 480;
  const cOuter = 190, cInner = 30;
  // Outer Rim
  cut(ellipsePts(CX, chakraY, cOuter + 14, cOuter + 14, 0, 40), PAL.blue, {
    key: 'chakra_rim', sy: 8, sb: 14
  });
  cut(ellipsePts(CX, chakraY, cOuter - 10, cOuter - 10, 0, 36), PAL.mustard, {
    key: 'chakra_inner_cut', shadow: false
  });
  // Spokes
  for (let s = 0; s < 24; s++) {
    const sa = (s / 24) * TAU + rot;
    const x1 = CX + Math.cos(sa) * cInner;
    const y1 = chakraY + Math.sin(sa) * cInner;
    const x2 = CX + Math.cos(sa) * cOuter;
    const y2 = chakraY + Math.sin(sa) * cOuter;
    ink([[x1, y1], [x2, y2]], { w: 6, color: PAL.blue, key: 'spoke_' + s });
  }
  // Central Hub
  cut(ellipsePts(CX, chakraY, cInner + 6, cInner + 6, 0, 20), PAL.blue, { key: 'chakra_hub', sy: 4, sb: 6 });

  // Tags & Captions
  yearTag('250 BCE • Maurya Empire');
  capStrip('Sarnath Lion Capital & 24-Spoke Dharma Chakra');
}

// ---------------------------------------------------------------------
// ERA 2: GUPTA SERENITY (500 CE) — Sarnath Preaching Buddha
// ---------------------------------------------------------------------
function sceneGupta() {
  const t = seg(TT, 18.0, 27.0);

  // 1. Serene Temple Sanctuary Wall (Soft Mint Paper with Dots)
  cut(rect(-30, -30, W + 60, H + 60, 0), PAL.mint, {
    key: 'gupta_wall', shadow: false, tear: 0,
    pat: pat.dots('rgba(255,255,255,0.22)', 6, 80)
  });

  // 2. The Great Prabhamandala (Carved Lotus Halo)
  const haloY = 780;
  cut(lotusHaloPts(CX, haloY, 320, 24), PAL.yellow, {
    key: 'halo_outer', sy: 12, sb: 18, crayon: '#ec7a4f'
  });
  cut(ellipsePts(CX, haloY, 260, 260, 0, 36), PAL.cream, {
    key: 'halo_inner_cream', shadow: false
  });
  cut(lotusHaloPts(CX, haloY, 240, 16), PAL.teal, {
    key: 'halo_inner_lotus', sy: 6, sb: 10
  });
  cut(ellipsePts(CX, haloY, 190, 190, 0, 32), PAL.cream, {
    key: 'halo_center_cream', shadow: false
  });

  // 3. Buddha Head & Ushnisha
  const budY = 980;
  const stone = PAL.cream;
  cut(ellipsePts(CX, haloY, 95, 95, 0, 32), stone, { key: 'bud_head', sy: 6, sb: 10 });
  cut(ellipsePts(CX, haloY - 95, 38, 38, 0, 24), PAL.ink, { key: 'bud_ushnisha', sy: 4, sb: 6 });
  
  // Meditative downcast lotus eyes & tranquil smile
  cut(ellipsePts(CX - 28, haloY + 8, 18, 8, 0.1, 16), PAL.ink, { key: 'bud_eye_l', shadow: false });
  cut(ellipsePts(CX + 28, haloY + 8, 18, 8, -0.1, 16), PAL.ink, { key: 'bud_eye_r', shadow: false });
  ink([[CX - 18, haloY + 42], [CX + 18, haloY + 42]], { w: 5, color: PAL.ink, key: 'bud_mouth' });
  ink([[CX - 90, haloY - 20], [CX - 95, haloY + 60]], { w: 5, color: PAL.ink, key: 'ear_l' });
  ink([[CX + 90, haloY - 20], [CX + 95, haloY + 60]], { w: 5, color: PAL.ink, key: 'ear_r' });

  // 4. Torso with Clinging Transparent Robe
  const budTorso = [
    [CX - 160, budY - 60], [CX + 160, budY - 60],
    [CX + 110, budY + 220], [CX - 110, budY + 220]
  ];
  cut(budTorso, stone, { key: 'bud_torso', sy: 8, sb: 12 });
  ink([[CX - 150, budY - 50], [CX, budY + 180], [CX + 150, budY - 50]], {
    w: 5, color: PAL.mustard, key: 'robe_ripple'
  });

  // 5. Hands in Dharmachakra Pravartana Mudra
  cut(ellipsePts(CX, budY + 70, 52, 52, 0, 24), PAL.yellow, { key: 'mudra_circle', sy: 4, sb: 6 });
  ink([[CX - 35, budY + 70], [CX + 35, budY + 70]], { w: 6, color: PAL.ink, key: 'mudra_h' });
  ink([[CX, budY + 35], [CX, budY + 105]], { w: 6, color: PAL.ink, key: 'mudra_v' });

  // 6. Crossed Legs (Padmasana Base)
  const legsPts = [
    [CX - 280, budY + 310], [CX + 280, budY + 310],
    [CX + 220, budY + 420], [CX - 220, budY + 420]
  ];
  cut(legsPts, stone, { key: 'bud_legs', sy: 8, sb: 12 });
  cut(ellipsePts(CX - 130, budY + 340, 38, 22, 0, 16), PAL.pink, { key: 'sole_l', shadow: false });
  cut(ellipsePts(CX + 130, budY + 340, 38, 22, 0, 16), PAL.pink, { key: 'sole_r', shadow: false });

  // 7. Throne Base: Deer Park & Dharma Wheel
  const throneY = 1520;
  cut(rect(CX - 320, throneY, 640, 160, 6), PAL.teal, { key: 'throne_box', sy: 10, sb: 14 });
  tag('DEER PARK • FIRST SERMON', CX, throneY + 110, 36, { rot: 0, s: 1, key: 'throne_tag' });

  // Tags & Captions
  yearTag('500 CE • Classical Gupta');
  capStrip('Sarnath Preaching Buddha • Sacred Law');
}

// ---------------------------------------------------------------------
// ERA 3: ELEPHANTA TRIMURTI (750 CE) — Colossal Basalt Rock-Cut
// ---------------------------------------------------------------------
function sceneElephanta() {
  const t = seg(TT, 27.0, 36.0);

  // 1. Dark Basalt Rock Cavern (Deep Navy Paper with shadows)
  cut(rect(-30, -30, W + 60, H + 60, 0), PAL.night, {
    key: 'cave_wall', shadow: false, tear: 0
  });

  // 2. Fluted Rock Cavern Pillars flanking the sanctuary
  cut(rect(40, 220, 120, 1500, 4), PAL.navy, { key: 'pillar_l', sy: 12, sb: 18 });
  cut(rect(W - 160, 220, 120, 1500, 4), PAL.navy, { key: 'pillar_r', sy: 12, sb: 18 });
  cut(ellipsePts(100, 420, 85, 35, 0, 20), PAL.charcoal, { key: 'cap_l', shadow: false });
  cut(ellipsePts(W - 100, 420, 85, 35, 0, 20), PAL.charcoal, { key: 'cap_r', shadow: false });

  // Flickering cave torchlight glow
  const torchPulse = 0.85 + 0.15 * Math.sin(t * TAU * 1.5);
  cut(ellipsePts(CX, 920, 460 * torchPulse, 460 * torchPulse, 0, 36), PAL.orange, {
    key: 'torch_glow', shadow: false, crayon: '#f6cf55'
  });

  // 3. The Colossal Three-Headed Shiva (Sadashiva)
  const colY = 980;
  const basalt = PAL.charcoal;
  const basaltShadow = PAL.night;

  // Massive Shoulder Block
  cut(rect(CX - 380, colY + 120, 760, 480, 8), basalt, { key: 'trimurti_chest', sy: 12, sb: 16 });

  // Center Head: TATPURUSHA / MAHADEVA (Serene Creator)
  cut(ellipsePts(CX, colY - 60, 175, 175, 0, 36), basalt, { key: 'tatpurusha_face', sy: 8, sb: 12 });
  cut(rect(CX - 110, colY - 380, 220, 220, 4), basaltShadow, { key: 'tatpurusha_crown', sy: 6, sb: 10 });
  tag('OM', CX, colY - 230, 48, { rot: 0, s: 1, key: 'om_tag' });
  
  // Sublime facial features
  cut(ellipsePts(CX - 42, colY - 50, 26, 12, 0, 16), basaltShadow, { key: 'shiva_eye_l', shadow: false });
  cut(ellipsePts(CX + 42, colY - 50, 26, 12, 0, 16), basaltShadow, { key: 'shiva_eye_r', shadow: false });
  ink([[CX - 35, colY + 25], [CX + 35, colY + 25]], { w: 6, color: PAL.cream, key: 'shiva_mouth' });
  cut(ellipsePts(CX, colY + 140, 160, 42, 0, 24), PAL.mustard, { key: 'shiva_necklace', sy: 4, sb: 6 });

  // Right Head: AGHORA / BHAIRAVA (Wrathful Destroyer)
  cut(ellipsePts(CX - 220, colY - 20, 125, 125, 0, 28), PAL.navy, { key: 'aghora_face', sy: 8, sb: 12 });
  tag('AGHORA', CX - 220, colY - 180, 26, { rot: -0.06, s: 1, key: 'aghora_tag' });
  ink([[CX - 260, colY + 15], [CX - 190, colY + 25]], { w: 6, color: PAL.cream, key: 'aghora_mustache' });

  // Left Head: VAMADEVA / UMA (Gentle Feminine Preserver)
  cut(ellipsePts(CX + 220, colY - 20, 125, 125, 0, 28), PAL.wood, { key: 'uma_face', sy: 8, sb: 12 });
  tag('UMA', CX + 220, colY - 180, 26, { rot: 0.06, s: 1, key: 'uma_tag' });
  // Pink paper lotus blossom in hand
  cut(ellipsePts(CX + 290, colY + 180, 45, 45, 0, 20), PAL.pink, { key: 'uma_lotus', sy: 4, sb: 6 });

  // Tags & Captions
  yearTag('750 CE • Post-Gupta');
  capStrip('Elephanta Trimurti Sadashiva in Basalt');
}

// ---------------------------------------------------------------------
// ERA 4: CHOLA BRONZE (1100 CE) — Shiva Nataraja Cosmic Dance
// ---------------------------------------------------------------------
function sceneChola() {
  const t = seg(TT, 36.0, 45.0);

  // 1. Deep Cosmic Navy Paper Wall with Radiant Paper Rays
  cut(rect(-30, -30, W + 60, H + 60, 0), PAL.navy, {
    key: 'chola_wall', shadow: false, tear: 0,
    pat: pat.dots('rgba(255,230,180,0.14)', 4, 70)
  });

  const radAngle = t * TAU * 0.1;
  for (let b = 0; b < 16; b++) {
    const a = (b / 16) * TAU + radAngle;
    const bx = CX + Math.cos(a) * 750;
    const by = 960 + Math.sin(a) * 750;
    ink([[CX, 960], [bx, by]], { w: 5, color: 'rgba(246,207,85,0.25)', key: 'cosmic_ray_' + b });
  }

  // 2. The Great Prabhamandala (Cosmic Ring of Fire / Tiruvasi)
  const ringR = 430;
  cut(ellipsePts(CX, 960, ringR + 25, ringR + 25, 0, 44), PAL.orange, {
    key: 'fire_ring_outer', sy: 12, sb: 18, crayon: '#f6cf55'
  });
  cut(ellipsePts(CX, 960, ringR - 25, ringR - 25, 0, 40), PAL.navy, {
    key: 'fire_ring_inner', shadow: false
  });

  // 32 Radiating Flame Tongues
  for (let f = 0; f < 32; f++) {
    const fa = (f / 32) * TAU;
    const fx = CX + Math.cos(fa) * ringR;
    const fy = 960 + Math.sin(fa) * ringR;
    cut(ellipsePts(fx, fy, 22, 22, 0, 16), PAL.yellow, { key: 'flame_tongue_' + f, sy: 3, sb: 5 });
  }

  // 3. Lotus Pedestal Base (Pitham)
  cut(rect(CX - 240, 1600, 480, 80, 6), PAL.wood, { key: 'pitham_box', sy: 8, sb: 12 });
  cut(ellipsePts(CX, 1600, 240, 45, 0, 24), PAL.mustard, { key: 'pitham_top', shadow: false });

  // 4. Apasmara (The Dwarf Demon of Ignorance)
  cut(ellipsePts(CX - 15, 1560, 110, 38, 0, 20), PAL.charcoal, { key: 'apasmara_body', sy: 4, sb: 6 });
  tag('APASMARA (IGNORANCE)', CX, 1650, 22, { rot: 0, s: 1, key: 'apasmara_tag' });

  // 5. Shiva Nataraja (Panchaloha Bronze Cutout)
  const natX = CX;
  const natY = 960;
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
  // 1. Upper Right: Damaru Drum
  ink([[natX + 45, natY - 180], [natX + 260, natY - 200]], { w: 8, color: PAL.woodD, key: 'arm_damaru' });
  cut(ellipsePts(natX + 270, natY - 205, 30, 30, 0, 16), PAL.yellow, { key: 'damaru_drum', sy: 4, sb: 6 });
  tag('DRUM', natX + 270, natY - 195, 20, { rot: 0, s: 1, key: 'drum_tag' });

  // 2. Upper Left: Agni Flame
  ink([[natX - 45, natY - 180], [natX - 260, natY - 200]], { w: 8, color: PAL.woodD, key: 'arm_agni' });
  cut(ellipsePts(natX - 270, natY - 205, 30, 30, 0, 16), PAL.orange, { key: 'agni_flame', sy: 4, sb: 6 });
  tag('FIRE', natX - 270, natY - 195, 20, { rot: 0, s: 1, key: 'fire_tag' });

  // 3. Lower Right: Abhaya Mudra
  ink([[natX + 40, natY - 120], [natX + 170, natY - 60]], { w: 8, color: PAL.woodD, key: 'arm_abhaya' });
  cut(ellipsePts(natX + 175, natY - 55, 30, 30, 0, 16), bronze, { key: 'abhaya_hand', sy: 4, sb: 6 });

  // 4. Lower Left: Gaja-hasta (Crossed arm pointing to raised foot)
  ink([[natX - 40, natY - 120], [natX + 40, natY + 20], [natX - 110, natY + 110]], {
    w: 8, color: PAL.woodD, key: 'arm_gaja'
  });

  // Right Leg (Planted on Apasmara)
  ink([[natX + 20, natY + 45], [natX + 15, natY + 360], [natX - 5, natY + 540]], {
    w: 10, color: PAL.woodD, key: 'leg_r'
  });
  cut(ellipsePts(natX - 5, natY + 540, 24, 14, 0, 16), bronze, { key: 'foot_r', shadow: false });

  // Left Leg (Lifted dynamically in Ananda Tandava)
  ink([[natX - 20, natY + 45], [natX - 140, natY + 180], [natX + 90, natY + 280]], {
    w: 10, color: PAL.woodD, key: 'leg_l'
  });
  cut(ellipsePts(natX + 90, natY + 280, 26, 15, 0.4, 16), bronze, { key: 'foot_l', shadow: false });

  // Tags & Captions
  yearTag('1100 CE • Imperial Chola');
  capStrip('Shiva Nataraja • The Cosmic Dance of Bliss');
}
