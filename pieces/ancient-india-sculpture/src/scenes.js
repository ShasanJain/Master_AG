// =====================================================================
//  SCENES — Ancient Indian Sculpture (9:16 Vertical, Risograph)
//  Every color is plate tones { teal, pink, yellow }.
// =====================================================================

// Helper: Draw centered text with sub-title in riso type
function drawHeader(eraTag, dateTag, titleTag, subTag) {
  const fontMain = 'bold 36px ' + PRINTF;
  const fontDate = 'bold 44px ' + PRINTF;
  const fontSub  = '500 24px ' + SERIF;
  
  // Tag box at top safe margin
  fill(rect(CX - 220, 180, 440, 52), { yellow: 0.8, pink: 0.35 });
  text(eraTag + ' • ' + dateTag, CX, 218, 30, MIX.dark, fontMain, 'center');
  
  text(titleTag, CX, 275, 42, MIX.blue, fontDate, 'center');
  text(subTag, CX, 315, 24, { teal: 0.7, pink: 0.4 }, fontSub, 'center');
}

// ---------------------------------------------------------------------
// ERA 0: INDUS BRONZE (2500 BCE) — Dancing Girl of Mohenjo-daro
// ---------------------------------------------------------------------
function sceneIndus() {
  beginSheet();
  const t = seg(TT, 0.0, 9.0);
  
  // 1. Far Field: Mohenjo-daro Terracotta Brick City Wall
  const R = RNG('indus_bricks');
  for (let y = 140; y < 1820; y += 48) {
    const shift = (Math.floor(y / 48) % 2) * 50;
    for (let x = -60 + shift; x < W + 60; x += 110) {
      if (R.f() > 0.12) {
        fill(rect(x + 2, y + 2, 106, 44), { pink: 0.18 + R.f() * 0.08, yellow: 0.35 + R.f() * 0.12 });
      }
    }
  }

  // 2. Pictographic Indus Seal Glyphs in background
  fill(rect(CX - 380, 420, 180, 180), { teal: 0.15, yellow: 0.25 });
  fill(rect(CX + 200, 420, 180, 180), { teal: 0.15, yellow: 0.25 });
  text("𓃒 𓇯 𓎛", CX - 290, 520, 40, { teal: 0.5, pink: 0.2 }, fontSerif(), 'center');
  text("𓆈 𓌕 𓏛", CX + 290, 520, 40, { teal: 0.5, pink: 0.2 }, fontSerif(), 'center');

  // 3. Central Crucible Foundry Base
  fill(ellipsePts(CX, 1680, 420, 140), { teal: 0.3, pink: 0.6, yellow: 0.9 });
  text("LOST-WAX BRONZE FOUNDRY (CIRE PERDUE)", CX, 1720, 22, MIX.dark, fontMainBold(), 'center');

  // 4. The Dancing Girl Figure (Tribhanga Stance)
  const figX = CX;
  const figY = 1020 + Math.sin(t * TAU * 0.5) * 8; // Gentle breathing bob
  
  // Bronze Cast Body Tone
  const bronzeBody = { teal: 0.6, pink: 0.75, yellow: 0.85 }; // Rich lustrous bronze
  const bronzeShadow = MIX.dark;
  
  // Torso & Hips (Contrapposto / Tribhanga lean)
  const torsoPts = [
    [figX - 45, figY - 260], // Left shoulder
    [figX + 55, figY - 250], // Right shoulder (slight drop)
    [figX + 35, figY - 100], // Right waist
    [figX + 70, figY + 60],  // Right hip jutting out proudly
    [figX - 25, figY + 70],  // Pelvis center
    [figX - 65, figY + 40],  // Left hip
    [figX - 35, figY - 110]  // Left waist
  ];
  fill(hand(torsoPts, 'torso', 1.05, 12), bronzeBody);
  
  // Head & Hair Bun
  // Chin raised high, proud haughty expression
  fill(circleShapePts(figX + 10, figY - 330, 68), bronzeBody);
  fill(ellipsePts(figX + 68, figY - 320, 46, 58, 0.2), bronzeShadow); // Heavy bun coiled to right
  // Eyes & Nose profile
  fill(ellipsePts(figX - 8, figY - 335, 12, 18), { teal: 0.2, pink: 0.8, yellow: 0.9 }); // Cowrie shell eyes
  line([[figX - 20, figY - 315], [figX + 5, figY - 315]], bronzeShadow); // Proud lips

  // Long Slender Legs
  // Right leg bearing weight (straight)
  const rightLeg = [
    [figX + 45, figY + 65], [figX + 55, figY + 280], [figX + 40, figY + 540],
    [figX + 10, figY + 540], [figX + 25, figY + 280], [figX + 15, figY + 65]
  ];
  fill(hand(rightLeg, 'rleg', 1.02, 10), bronzeBody);

  // Left leg bent gracefully at knee
  const leftLeg = [
    [figX - 45, figY + 65], [figX - 95, figY + 290], [figX - 40, figY + 530],
    [figX - 70, figY + 530], [figX - 125, figY + 290], [figX - 65, figY + 65]
  ];
  fill(hand(leftLeg, 'lleg', 1.02, 10), bronzeBody);

  // Right Arm: Resting firmly on right hip
  const rightArm = [
    [figX + 55, figY - 250], [figX + 140, figY - 110], [figX + 75, figY + 55],
    [figX + 60, figY + 45], [figX + 115, figY - 100], [figX + 40, figY - 240]
  ];
  fill(hand(rightArm, 'rarm', 1.02, 8), bronzeBody);
  // Bangles on right wrist (just 4 small amulets)
  for (let b = 0; b < 4; b++) {
    fill(rect(figX + 85 + b * 6, figY + 20 - b * 4, 8, 22), { yellow: 0.95, pink: 0.1 });
  }

  // Left Arm: Hanging forward, heavily loaded with 24-25 stacked bangles
  const leftArm = [
    [figX - 45, figY - 260], [figX - 120, figY - 80], [figX - 85, figY + 140],
    [figX - 65, figY + 130], [figX - 95, figY - 75], [figX - 30, figY - 250]
  ];
  fill(hand(leftArm, 'larm', 1.02, 8), bronzeBody);
  
  // The iconic 24 tubular bone/shell/bronze bangles covering entire left arm
  for (let b = 0; b < 22; b++) {
    const by = (figY - 220) + b * 15;
    const bx = (figX - 55) - b * 1.5;
    fill(ellipsePts(bx, by, 32, 14, -0.3), { yellow: 0.95, pink: 0.2 }, { over: true });
    line([[bx - 28, by], [bx + 28, by]], bronzeShadow);
  }

  // Header & Narrative Tags
  drawHeader("ERA I", "c. 2500 BCE", "THE DANCING GIRL", "LOST-WAX BRONZE • MOHENJO-DARO");
}

// ---------------------------------------------------------------------
// ERA 1: MAURYA POLISH (250 BCE) — Sarnath Lion Capital
// ---------------------------------------------------------------------
function sceneMaurya() {
  beginSheet();
  const t = seg(TT, 9.0, 18.0);
  
  // 1. Far Field: Brahmi Script Inscription Wall
  const brahmi = "𑀤𑁂𑀯𑀸𑀦𑀁𑀧𑀺𑀬𑁂𑀦 𑀧𑀺𑀬𑀤𑀲𑀺𑀦𑀸 𑀮𑀸𑀚𑀺𑀦𑀸 𑀯𑀻𑀲𑀢𑀺𑀯𑀲𑀸𑀪𑀺𑀲𑀺𑀢𑁂𑀦";
  for (let y = 160; y < 1850; y += 80) {
    text(brahmi, CX, y, 22, { yellow: 0.35, pink: 0.15, teal: 0.1 }, SERIF, 'center');
  }

  // 2. Sarnath Monolithic Column Shaft (Mirror-like Mauryan Polish)
  const shaftTones = { yellow: 0.85, pink: 0.35, teal: 0.12 }; // Sandstone
  fill(rect(CX - 160, 1260, 320, 600), shaftTones);
  // Glassy vertical reflection streak
  fill(rect(CX - 30, 1260, 60, 600), { yellow: 0.3, pink: 0.05 }); // High-gloss highlight streak

  // 3. Inverted Bell Lotus Capital
  const lotusBaseY = 1260;
  for (let p = 0; p < 14; p++) {
    const lx = (CX - 220) + p * 34;
    const petalPts = [
      [lx, lotusBaseY], [lx + 17, lotusBaseY - 110], [lx + 34, lotusBaseY],
      [lx + 17, lotusBaseY + 20]
    ];
    fill(hand(petalPts, 'lotus' + p, 1.05, 6), { yellow: 0.9, pink: 0.45 });
  }

  // 4. Circular Abacus with Animals & Dharma Chakra
  const abacusY = 1120;
  fill(rect(CX - 280, abacusY - 60, 560, 90), { teal: 0.7, pink: 0.3, yellow: 0.4 });
  // Galloping Bull & Lion glyphs on abacus
  text("🐎   ☸   🐂   ☸   🐘   ☸   🦁", CX, abacusY, 32, { yellow: 0.95, pink: 0.2 }, fontMainBold(), 'center');

  // 5. Four Addorsed Lions (Majestic Back-to-Back Asiatic Lions)
  const lionY = 720;
  // Central double lion heads
  const lionTones = { yellow: 0.92, pink: 0.4, teal: 0.08 };
  const maneTones = MIX.dark;
  
  // Left Lion
  fill(circleShapePts(CX - 120, lionY + 50, 140), lionTones);
  // Right Lion
  fill(circleShapePts(CX + 120, lionY + 50, 140), lionTones);
  
  // Stylized Curled Flame Manes
  for (let a = 0; a < 28; a++) {
    const ang = (a / 28) * TAU;
    const mx = CX + Math.cos(ang) * 190;
    const my = (lionY + 60) + Math.sin(ang) * 150;
    fill(circleShapePts(mx, my, 22), maneTones);
  }

  // Roaring Snouts & Teeth
  fill(circleShapePts(CX - 110, lionY + 110, 48), maneTones);
  fill(circleShapePts(CX + 110, lionY + 110, 48), maneTones);
  // White tooth highlights
  fill(rect(CX - 125, lionY + 100, 30, 16), {}); // Knockout paper tooth
  fill(rect(CX + 95, lionY + 100, 30, 16), {});

  // 6. The Crown: 24-Spoke Rotating Ashoka Chakra Wheel
  const rot = t * 0.4;
  const chakraY = 480;
  const cOuter = 190, cInner = 30;
  // Outer rim
  fill(circleShapePts(CX, chakraY, cOuter + 14), { teal: 0.85, pink: 0.35, yellow: 0.2 });
  fill(circleShapePts(CX, chakraY, cOuter - 10), {}); // Knockout
  // 24 Spokes
  for (let s = 0; s < 24; s++) {
    const sa = (s / 24) * TAU + rot;
    const x1 = CX + Math.cos(sa) * cInner;
    const y1 = chakraY + Math.sin(sa) * cInner;
    const x2 = CX + Math.cos(sa) * cOuter;
    const y2 = chakraY + Math.sin(sa) * cOuter;
    line([[x1, y1], [x2, y2]], { teal: 0.9, pink: 0.3, yellow: 0.2 });
  }
  // Hub
  fill(circleShapePts(CX, chakraY, cInner), { teal: 0.9, pink: 0.4, yellow: 0.2 });

  drawHeader("ERA II", "c. 250 BCE", "THE ASHOKAN CAPITAL", "POLISHED CHUNAR SANDSTONE • SARNATH");
}

// ---------------------------------------------------------------------
// ERA 2: GUPTA SERENITY (500 CE) — Sarnath Preaching Buddha
// ---------------------------------------------------------------------
function sceneGupta() {
  beginSheet();
  const t = seg(TT, 18.0, 27.0);

  // 1. Far Field: Concentric Sacred Mandala Pattern
  for (let r = 200; r < 900; r += 120) {
    fill(circleShapePts(CX, 780, r), { yellow: 0.15, pink: 0.08, teal: 0.05 });
  }

  // 2. The Great Prabhamandala (Elaborate Carved Lotus Halo)
  const haloY = 780;
  fill(lotusHaloPts(CX, haloY, 320, 24), { yellow: 0.85, pink: 0.45, teal: 0.1 });
  fill(circleShapePts(CX, haloY, 260), {}); // Paper knockout
  fill(lotusHaloPts(CX, haloY, 240, 16), { yellow: 0.7, pink: 0.3, teal: 0.15 });
  fill(circleShapePts(CX, haloY, 190), {});

  // 3. Floating Celestial Flying Gandharvas
  fill(ellipsePts(CX - 310, haloY - 240, 75, 38, -0.4), MIX.coral);
  fill(ellipsePts(CX + 310, haloY - 240, 75, 38,  0.4), MIX.coral);
  text("✦  DHAMMA  ✦", CX, haloY - 320, 26, MIX.blue, fontMainBold(), 'center');

  // 4. Buddha Seated in Padmasana (Full Lotus Posture)
  const budY = 980;
  const budTones = { yellow: 0.9, pink: 0.35, teal: 0.15 }; // Ivory Stone
  
  // Head & Ushnisha
  fill(circleShapePts(CX, haloY, 95), budTones);
  fill(circleShapePts(CX, haloY - 95, 38), MIX.dark); // Snail-curl Ushnisha topknot
  // Meditative Downcast Lotus Eyes & Tilak
  fill(ellipsePts(CX - 28, haloY + 8, 18, 8, 0.1), MIX.dark);
  fill(ellipsePts(CX + 28, haloY + 8, 18, 8, -0.1), MIX.dark);
  line([[CX - 15, haloY + 42], [CX + 15, haloY + 42]], MIX.dark); // Serene gentle smile
  // Long elongated earlobes
  line([[CX - 90, haloY - 20], [CX - 95, haloY + 60]], MIX.dark);
  line([[CX + 90, haloY - 20], [CX + 95, haloY + 60]], MIX.dark);

  // Torso with Clinging Transparent Robe (Wet-drapery Gupta style)
  const budTorso = [
    [CX - 160, budY - 60], [CX + 160, budY - 60],
    [CX + 110, budY + 220], [CX - 110, budY + 220]
  ];
  fill(hand(budTorso, 'bud_torso', 1.02, 10), budTones);
  // Delicate hem ripple lines
  line([[CX - 150, budY - 50], [CX, budY + 180], [CX + 150, budY - 50]], { yellow: 0.5, pink: 0.2 });

  // Hands in Dharmachakra Pravartana Mudra (Turning the Wheel of Law)
  fill(circleShapePts(CX, budY + 70, 52), { yellow: 0.95, pink: 0.5 });
  // Fingers forming the two wheels
  line([[CX - 35, budY + 70], [CX + 35, budY + 70]], MIX.dark);
  line([[CX, budY + 35], [CX, budY + 105]], MIX.dark);

  // Crossed Legs (Padmasana Base)
  const legsPts = [
    [CX - 280, budY + 310], [CX + 280, budY + 310],
    [CX + 220, budY + 420], [CX - 220, budY + 420]
  ];
  fill(hand(legsPts, 'legs', 1.05, 12), budTones);
  // Soles turned upward with auspicious marks
  fill(ellipsePts(CX - 130, budY + 340, 38, 22), { pink: 0.7, yellow: 0.5 });
  fill(ellipsePts(CX + 130, budY + 340, 38, 22), { pink: 0.7, yellow: 0.5 });

  // 5. Throne Base: Two Deer flanking the Dharma Wheel
  const throneY = 1520;
  fill(rect(CX - 320, throneY, 640, 160), { teal: 0.6, pink: 0.4, yellow: 0.5 });
  text("🦌   ☸   🦌", CX, throneY + 95, 64, { yellow: 0.95, pink: 0.3 }, fontMainBold(), 'center');
  text("FIRST SERMON AT DEER PARK (SARNATH)", CX, throneY + 140, 20, MIX.dark, fontSerif(), 'center');

  drawHeader("ERA III", "c. 500 CE", "PREACHING BUDDHA", "CLASSICAL GUPTA STONE • SARNATH");
}

// ---------------------------------------------------------------------
// ERA 3: ELEPHANTA TRIMURTI (750 CE) — Colossal Basalt Rock-Cut
// ---------------------------------------------------------------------
function sceneElephanta() {
  beginSheet();
  const t = seg(TT, 27.0, 36.0);

  // 1. Far Field: Dark Basalt Rock Cavern Shadows
  fill(rect(0, 0, W, H), { teal: 0.4, pink: 0.3, yellow: 0.15 }); // Shadowed cave
  
  // Massive Cave Pillars flanking the sanctuary
  fill(rect(40, 220, 120, 1500), MIX.dark);
  fill(rect(W - 160, 220, 120, 1500), MIX.dark);
  // Cushion capitals on pillars
  fill(ellipsePts(100, 420, 85, 35), { teal: 0.8, pink: 0.6 });
  fill(ellipsePts(W - 100, 420, 85, 35), { teal: 0.8, pink: 0.6 });

  // Flickering cave torchlight glow
  const torchPulse = 0.85 + 0.15 * Math.sin(t * TAU * 1.5);
  fill(circleShapePts(CX, 920, 420 * torchPulse), { yellow: 0.45, pink: 0.25 }, { over: true });

  // 2. The Colossal 6-Meter Trimurti (Sadashiva)
  const colY = 980;
  const basaltStone = { teal: 0.75, pink: 0.55, yellow: 0.3 };
  const basaltShadow = MIX.dark;

  // Broad Massive Shoulder Base
  fill(rect(CX - 380, colY + 120, 760, 480), basaltStone);

  // --- Center Head: TATPURUSHA / MAHADEVA (Serene Creator) ---
  fill(circleShapePts(CX, colY - 60, 175), basaltStone);
  // High matted crown (Jatamukuta) with jewel bands
  fill(rect(CX - 110, colY - 380, 220, 220), basaltShadow);
  text("ॐ", CX, colY - 260, 72, { yellow: 0.95, pink: 0.4 }, fontMainBold(), 'center');
  // Serene majestic features
  fill(ellipsePts(CX - 42, colY - 50, 26, 12), basaltShadow);
  fill(ellipsePts(CX + 42, colY - 50, 26, 12), basaltShadow);
  line([[CX - 35, colY + 25], [CX + 35, colY + 25]], basaltShadow); // Sublime tranquil mouth
  // Heavy necklace
  fill(ellipsePts(CX, colY + 140, 160, 42), { yellow: 0.85, pink: 0.45 });

  // --- Right Head: AGHORA / BHAIRAVA (Fierce Destroyer, Left Viewer) ---
  fill(circleShapePts(CX - 220, colY - 20, 125), { teal: 0.85, pink: 0.6, yellow: 0.25 });
  // Skull and cobra in hair
  text("☠ 🐍", CX - 220, colY - 180, 36, { yellow: 0.9, pink: 0.5 }, fontMainBold(), 'center');
  // Wrathful mustache & hook nose
  line([[CX - 260, colY + 15], [CX - 190, colY + 25]], basaltShadow);

  // --- Left Head: VAMADEVA / UMA (Gentle Feminine Preserver, Right Viewer) ---
  fill(circleShapePts(CX + 220, colY - 20, 125), { yellow: 0.75, pink: 0.5, teal: 0.2 });
  // Pearl diadems and delicate curl
  text("🌸", CX + 220, colY - 180, 42, { pink: 0.8, yellow: 0.9 }, fontMainBold(), 'center');
  // Delicate hand holding lotus blossom
  fill(circleShapePts(CX + 290, colY + 180, 45), { yellow: 0.85, pink: 0.5 });
  text("🪷", CX + 290, colY + 185, 38, { pink: 0.9, yellow: 0.6 }, fontMainBold(), 'center');

  // Chisel hatchings on cave wall
  for (let ch = 0; ch < 18; ch++) {
    const rx = 180 + (ch * 42) % 720;
    const ry = 1450 + (ch * 17) % 240;
    line([[rx, ry], [rx + 35, ry + 12]], { teal: 0.4, pink: 0.2 });
  }

  drawHeader("ERA IV", "c. 750 CE", "ELEPHANTA TRIMURTI", "MONOLITHIC BASALT ROCK-CUT • GHARAPURI");
}

// ---------------------------------------------------------------------
// ERA 4: CHOLA BRONZE (1100 CE) — Shiva Nataraja Cosmic Dance
// ---------------------------------------------------------------------
function sceneChola() {
  beginSheet();
  const t = seg(TT, 36.0, 45.0);

  // 1. Far Field: Expanding Cosmic Halftone Radiance
  const radAngle = t * TAU * 0.1;
  for (let b = 0; b < 16; b++) {
    const a = (b / 16) * TAU + radAngle;
    const bx = CX + Math.cos(a) * 750;
    const by = 960 + Math.sin(a) * 750;
    line([[CX, 960], [bx, by]], { pink: 0.25, yellow: 0.45 });
  }

  // 2. The Great Prabhamandala (Cosmic Ring of Fire / Tiruvasi)
  const ringR = 430;
  fill(circleShapePts(CX, 960, ringR + 25), { pink: 0.8, yellow: 0.95 }); // Outer fire halo
  fill(circleShapePts(CX, 960, ringR - 25), {}); // Knockout
  
  // 32 Radiating Fire Tongues around circle
  for (let f = 0; f < 32; f++) {
    const fa = (f / 32) * TAU;
    const fx = CX + Math.cos(fa) * ringR;
    const fy = 960 + Math.sin(fa) * ringR;
    fill(circleShapePts(fx, fy, 22), { pink: 0.95, yellow: 0.85 }, { over: true });
    // Little flame flicker
    text("🔥", fx, fy + 8, 22, MIX.coral, fontMainBold(), 'center');
  }

  // 3. Lotus Pedestal Base (Pitham)
  fill(rect(CX - 240, 1600, 480, 80), { teal: 0.6, pink: 0.5, yellow: 0.8 });
  fill(ellipsePts(CX, 1600, 240, 45), { yellow: 0.9, pink: 0.4 });

  // 4. Apasmara (The Dwarf of Ignorance Trampled Underfoot)
  fill(ellipsePts(CX - 15, 1560, 110, 38), MIX.dark);
  text("APASMARA (IGNORANCE)", CX, 1645, 18, MIX.dark, fontMainBold(), 'center');

  // 5. Shiva Nataraja (Lord of the Dance) — Four Arms & Flying Hair
  const natX = CX;
  const natY = 960;
  const cholaBronze = { teal: 0.35, pink: 0.85, yellow: 0.9 }; // Glorious panchaloha bronze
  const bronzeLine = MIX.dark;

  // Flying Matted Locks (Jata) Streaming Horizontally
  for (let j = 0; j < 6; j++) {
    const jy = (natY - 240) + j * 16;
    line([[natX - 340, jy + Math.sin(t * 8 + j) * 12], [natX + 340, jy - Math.sin(t * 8 + j) * 12]], { pink: 0.7, yellow: 0.85 });
  }
  // Crescent moon and Ganga in locks
  text("🌙", natX + 160, natY - 260, 32, { yellow: 0.95, pink: 0.2 }, fontMainBold(), 'center');
  text("🌊", natX - 160, natY - 260, 32, { teal: 0.8, pink: 0.2 }, fontMainBold(), 'center');

  // Slender Dancing Torso
  const torsoPts = [
    [natX - 55, natY - 220], [natX + 55, natY - 220],
    [natX + 45, natY + 40], [natX - 35, natY + 50]
  ];
  fill(hand(torsoPts, 'nat_torso', 1.05, 10), cholaBronze);

  // Crown (Jatamakuta) & Face (Serene Cosmic Smile)
  fill(circleShapePts(natX, natY - 240, 58), cholaBronze);
  fill(rect(natX - 25, natY - 330, 50, 75), bronzeLine);
  // Third eye on forehead
  fill(ellipsePts(natX, natY - 245, 6, 12), { pink: 0.9, yellow: 0.6 });

  // Four Divine Arms:
  // 1. Upper Right: Holding the Damaru (Hourglass drum of creation)
  line([[natX + 45, natY - 180], [natX + 260, natY - 200]], bronzeLine);
  fill(circleShapePts(natX + 270, natY - 205, 28), { yellow: 0.95, pink: 0.5 });
  text("🥁", natX + 270, natY - 195, 34, MIX.coral, fontMainBold(), 'center');

  // 2. Upper Left: Holding Agni (Flame of destruction/transformation)
  line([[natX - 45, natY - 180], [natX - 260, natY - 200]], bronzeLine);
  fill(circleShapePts(natX - 270, natY - 205, 28), { yellow: 0.95, pink: 0.6 });
  text("🔥", natX - 270, natY - 195, 34, MIX.coral, fontMainBold(), 'center');

  // 3. Lower Right: Abhaya Mudra (Gesture of protection / fearlessness)
  line([[natX + 40, natY - 120], [natX + 170, natY - 60]], bronzeLine);
  fill(circleShapePts(natX + 175, natY - 55, 30), cholaBronze);
  text("✋", natX + 175, natY - 48, 30, bronzeLine, fontMainBold(), 'center');

  // 4. Lower Left: Gaja-hasta (Crossed arm pointing to raised left foot)
  line([[natX - 40, natY - 120], [natX + 40, natY + 20], [natX - 110, natY + 110]], bronzeLine);
  text("👇", natX - 115, natY + 115, 32, bronzeLine, fontMainBold(), 'center');

  // Right Leg (Planted on Apasmara)
  line([[natX + 20, natY + 45], [natX + 15, natY + 360], [natX - 5, natY + 540]], bronzeLine);
  fill(ellipsePts(natX - 5, natY + 540, 24, 14), cholaBronze);

  // Left Leg (Lifted dynamically in Ananda Tandava across right knee)
  line([[natX - 20, natY + 45], [natX - 140, natY + 180], [natX + 90, natY + 280]], bronzeLine);
  fill(ellipsePts(natX + 90, natY + 280, 26, 15, 0.4), cholaBronze);

  drawHeader("ERA V", "c. 1100 CE", "SHIVA NATARAJA", "LOST-WAX CHOLA BRONZE • TAMIL NADU");
}

function fontMainBold() { return 'bold 28px ' + PRINTF; }
function fontSerif() { return '500 24px ' + SERIF; }
