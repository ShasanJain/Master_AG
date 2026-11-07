// =====================================================================
//  SCENES — Ancient Indian Sculpture (9:16 Vertical, Risograph)
//  Every colour is printed plate tones { teal, pink, yellow }.
//  All scenes use beginSheet(), printed(PITCH.*), and endSheet().
// =====================================================================

function drawHeaderRiso(eraTag, dateTag, titleTag, subTag, keyPrefix) {
  // Top tag box
  fill(hand(boxPts(CX - 220, 160, 440, 56), keyPrefix + '_tagbox', 1.0), { yellow: 0.85, pink: 0.35 });
  type(eraTag + ' • ' + dateTag, CX, 200, 32, MIX.dark, { align: 'center', key: keyPrefix + '_t1', weight: 900 });
  
  // Title & Subtitle
  type(titleTag, CX, 270, 44, MIX.blue, { align: 'center', key: keyPrefix + '_t2', weight: 900 });
  type(subTag, CX, 318, 22, { teal: 0.75, pink: 0.4 }, { align: 'center', key: keyPrefix + '_t3', weight: 700 });
}

// ---------------------------------------------------------------------
// ERA 0: INDUS BRONZE (2500 BCE) — Dancing Girl of Mohenjo-daro
// ---------------------------------------------------------------------
function sceneIndus() {
  beginSheet();
  const t = seg(TT, 0.0, 9.0);

  // 1. Far Field: Mohenjo-daro Terracotta Brick Wall
  printed(PITCH.field, { full: true }, () => {
    const R = RNG('indus_bricks');
    for (let y = 140; y < 1820; y += 52) {
      const shift = (Math.floor(y / 52) % 2) * 55;
      for (let x = -60 + shift; x < W + 60; x += 115) {
        if (R.f() > 0.15) {
          fill(rect(x + 2, y + 2, 110, 48), { pink: 0.16 + R.f() * 0.08, yellow: 0.32 + R.f() * 0.12 });
        }
      }
    }
    // Atmospheric foundry glow behind crucible
    fill(circ(CX, 1060, 420), { yellow: rad(CX, 1060, 180, 420, [[0, 0.65], [1, 0]]) }, { over: true });
  });

  // 2. The World: Figure, Crucible, and Glyphs
  printed(PITCH.world, { shapes: true }, () => {
    // Indus Seal Glyphs in background
    fill(hand(boxPts(CX - 380, 420, 170, 170), 'seal1', 1.2), { teal: 0.18, yellow: 0.28 });
    fill(hand(boxPts(CX + 210, 420, 170, 170), 'seal2', 1.2), { teal: 0.18, yellow: 0.28 });
    type("INDUS", CX - 295, 515, 34, { teal: 0.6, pink: 0.3 }, { align: 'center', key: 'seal1_txt' });
    type("SEAL", CX + 295, 515, 34, { teal: 0.6, pink: 0.3 }, { align: 'center', key: 'seal2_txt' });

    // Crucible Foundry Pedestal
    fill(ell(CX, 1680, 420, 120), { teal: 0.35, pink: 0.65, yellow: 0.85 });
    type("LOST-WAX BRONZE FOUNDRY (CIRE PERDUE)", CX, 1720, 22, MIX.dark, { align: 'center', key: 'indus_sub' });

    // The Dancing Girl Figure
    const figX = CX;
    const figY = 1040 + Math.sin(t * TAU * 0.5) * 8; // Gentle breathing bob
    const bronzeBody = { teal: 0.6, pink: 0.75, yellow: 0.85 }; // Rich lustrous bronze
    const bronzeShadow = MIX.dark;

    // Torso (Tribhanga Contrapposto)
    const torsoPts = [
      [figX - 45, figY - 260], [figX + 55, figY - 250], [figX + 35, figY - 100],
      [figX + 70, figY + 60],  [figX - 25, figY + 70],  [figX - 65, figY + 40],
      [figX - 35, figY - 110]
    ];
    fill(hand(torsoPts, 'indus_torso', 1.1, 8), bronzeBody);

    // Head, Chin & Hair Bun
    fill(circ(figX + 10, figY - 330, 68), bronzeBody);
    fill(ell(figX + 68, figY - 320, 48, 58, 0.2), bronzeShadow); // Heavy hair bun
    fill(ell(figX - 8, figY - 335, 12, 16), { yellow: 0.95, pink: 0.15 }); // Cowrie shell eyes
    line([[figX - 18, figY - 315], [figX + 5, figY - 315]], bronzeShadow, { w: 6, key: 'lips' });

    // Right Leg (Bearing weight)
    const rightLeg = [
      [figX + 45, figY + 65], [figX + 55, figY + 280], [figX + 40, figY + 540],
      [figX + 10, figY + 540], [figX + 25, figY + 280], [figX + 15, figY + 65]
    ];
    fill(hand(rightLeg, 'indus_rleg', 1.05, 8), bronzeBody);

    // Left Leg (Bent gracefully at knee)
    const leftLeg = [
      [figX - 45, figY + 65], [figX - 95, figY + 290], [figX - 40, figY + 530],
      [figX - 70, figY + 530], [figX - 125, figY + 290], [figX - 65, figY + 65]
    ];
    fill(hand(leftLeg, 'indus_lleg', 1.05, 8), bronzeBody);

    // Right Arm resting on right hip
    const rightArm = [
      [figX + 55, figY - 250], [figX + 140, figY - 110], [figX + 75, figY + 55],
      [figX + 60, figY + 45],  [figX + 115, figY - 100], [figX + 40, figY - 240]
    ];
    fill(hand(rightArm, 'indus_rarm', 1.05, 8), bronzeBody);
    for (let b = 0; b < 4; b++) {
      fill(rect(figX + 85 + b * 6, figY + 20 - b * 4, 8, 22), { yellow: 0.95, pink: 0.1 });
    }

    // Left Arm dangling forward, sleeved with 22 bangles
    const leftArm = [
      [figX - 45, figY - 260], [figX - 120, figY - 80], [figX - 85, figY + 140],
      [figX - 65, figY + 130], [figX - 95, figY - 75],  [figX - 30, figY - 250]
    ];
    fill(hand(leftArm, 'indus_larm', 1.05, 8), bronzeBody);
    for (let b = 0; b < 22; b++) {
      const by = (figY - 220) + b * 15;
      const bx = (figX - 55) - b * 1.5;
      fill(ell(bx, by, 34, 14, -0.3), { yellow: 0.95, pink: 0.2 }, { over: true });
      line([[bx - 28, by], [bx + 28, by]], bronzeShadow, { w: 4, key: 'bangle_' + b });
    }

    // Headers
    drawHeaderRiso("ERA I", "c. 2500 BCE", "THE DANCING GIRL", "LOST-WAX BRONZE • MOHENJO-DARO", "indus");
  });
  endSheet();
}

// ---------------------------------------------------------------------
// ERA 1: MAURYA POLISH (250 BCE) — Sarnath Lion Capital
// ---------------------------------------------------------------------
function sceneMaurya() {
  beginSheet();
  const t = seg(TT, 9.0, 18.0);

  // 1. Far Field: Brahmi Script Inscription Background
  printed(PITCH.field, { full: true }, () => {
    fill(rect(-40, -40, W + 80, H + 80), {
      yellow: lin(0, 0, 0, H, [[0, 0.45], [1, 0.7]]),
      pink: lin(0, 0, 0, H, [[0, 0.15], [1, 0.3]])
    });
    // Radial glow behind the Chakra wheel
    fill(circ(CX, 480, 420), { yellow: rad(CX, 480, 160, 420, [[0, 0.75], [1, 0]]) }, { over: true });
  });

  // 2. The World: Column Shaft, Inverted Lotus, Abacus & Roaring Lions
  printed(PITCH.world, { shapes: true }, () => {
    // Monolithic Column Shaft with high-gloss reflection streak
    fill(rect(CX - 160, 1260, 320, 600), { yellow: 0.85, pink: 0.35, teal: 0.12 });
    fill(rect(CX - 25, 1260, 50, 600), { yellow: 0.3, pink: 0.05 }); // Specular highlight

    // Inverted Bell Lotus Capital
    const lotusBaseY = 1260;
    for (let p = 0; p < 14; p++) {
      const lx = (CX - 220) + p * 34;
      const petalPts = [
        [lx, lotusBaseY], [lx + 17, lotusBaseY - 110], [lx + 34, lotusBaseY],
        [lx + 17, lotusBaseY + 20]
      ];
      fill(hand(petalPts, 'lotus' + p, 1.05, 6), { yellow: 0.9, pink: 0.45 });
    }

    // Circular Abacus with animal reliefs
    const abacusY = 1120;
    fill(rect(CX - 280, abacusY - 60, 560, 90), { teal: 0.7, pink: 0.3, yellow: 0.4 });
    type("HORSE • WHEEL • BULL • LION", CX, abacusY + 5, 26, { yellow: 0.95, pink: 0.2 }, { align: 'center', key: 'abacus_txt' });

    // Four Addorsed Lions (Majestic Back-to-Back Asiatic Lions)
    const lionY = 720;
    const lionTones = { yellow: 0.92, pink: 0.4, teal: 0.08 };
    const maneTones = MIX.dark;
    
    // Left & Right Lion Bodies
    fill(circ(CX - 120, lionY + 50, 140), lionTones);
    fill(circ(CX + 120, lionY + 50, 140), lionTones);

    // Stylized Curled Flame Manes
    for (let a = 0; a < 26; a++) {
      const ang = (a / 26) * TAU;
      const mx = CX + Math.cos(ang) * 190;
      const my = (lionY + 60) + Math.sin(ang) * 150;
      fill(circ(mx, my, 22), maneTones);
    }

    // Roaring Snouts
    fill(circ(CX - 110, lionY + 110, 48), maneTones);
    fill(circ(CX + 110, lionY + 110, 48), maneTones);

    // 24-Spoke Rotating Ashoka Chakra Wheel
    const rot = t * 0.4;
    const chakraY = 480;
    const cOuter = 190, cInner = 30;
    fill(circ(CX, chakraY, cOuter + 14), { teal: 0.85, pink: 0.35, yellow: 0.2 });
    fill(circ(CX, chakraY, cOuter - 10), {}); // Knockout
    
    // Spokes
    for (let s = 0; s < 24; s++) {
      const sa = (s / 24) * TAU + rot;
      const x1 = CX + Math.cos(sa) * cInner;
      const y1 = chakraY + Math.sin(sa) * cInner;
      const x2 = CX + Math.cos(sa) * cOuter;
      const y2 = chakraY + Math.sin(sa) * cOuter;
      line([[x1, y1], [x2, y2]], { teal: 0.9, pink: 0.3, yellow: 0.2 }, { w: 6, key: 'spoke_' + s });
    }
    fill(circ(CX, chakraY, cInner), { teal: 0.9, pink: 0.4, yellow: 0.2 });

    // Headers
    drawHeaderRiso("ERA II", "c. 250 BCE", "THE ASHOKAN CAPITAL", "POLISHED CHUNAR SANDSTONE • SARNATH", "maurya");
  });
  endSheet();
}

// ---------------------------------------------------------------------
// ERA 2: GUPTA SERENITY (500 CE) — Sarnath Preaching Buddha
// ---------------------------------------------------------------------
function sceneGupta() {
  beginSheet();
  const t = seg(TT, 18.0, 27.0);

  // 1. Far Field: Concentric Mandala Resonance
  printed(PITCH.field, { full: true }, () => {
    fill(rect(-40, -40, W + 80, H + 80), {
      yellow: lin(0, 0, 0, H, [[0, 0.3], [1, 0.55]]),
      pink: lin(0, 0, 0, H, [[0, 0.1], [1, 0.25]]),
      teal: lin(0, 0, 0, H, [[0, 0.08], [1, 0.18]])
    });
    fill(circ(CX, 780, 480), { yellow: rad(CX, 780, 200, 480, [[0, 0.7], [1, 0]]) }, { over: true });
  });

  // 2. The World: Lotus Halo, Buddha in Padmasana & Deer Throne
  printed(PITCH.world, { shapes: true }, () => {
    // The Great Prabhamandala (Elaborate Lotus Halo)
    const haloY = 780;
    fill(curvy(lotusHaloPts(CX, haloY, 320, 24)), { yellow: 0.85, pink: 0.45, teal: 0.1 });
    fill(circ(CX, haloY, 260), {}); // Paper knockout
    fill(curvy(lotusHaloPts(CX, haloY, 240, 16)), { yellow: 0.7, pink: 0.3, teal: 0.15 });
    fill(circ(CX, haloY, 190), {});

    // Buddha Head & Ushnisha
    const budTones = { yellow: 0.9, pink: 0.35, teal: 0.15 }; // Ivory Sandstone
    fill(circ(CX, haloY, 95), budTones);
    fill(circ(CX, haloY - 95, 38), MIX.dark); // Snail-curl Ushnisha topknot
    // Contemplative Lotus Eyes & Smile
    fill(ell(CX - 28, haloY + 8, 18, 8, 0.1), MIX.dark);
    fill(ell(CX + 28, haloY + 8, 18, 8, -0.1), MIX.dark);
    line([[CX - 18, haloY + 42], [CX + 18, haloY + 42]], MIX.dark, { w: 5, key: 'bud_lips' });
    line([[CX - 90, haloY - 20], [CX - 95, haloY + 60]], MIX.dark, { w: 5, key: 'ear_l' });
    line([[CX + 90, haloY - 20], [CX + 95, haloY + 60]], MIX.dark, { w: 5, key: 'ear_r' });

    // Torso with Clinging Transparent Robe (Wet-look drapery)
    const budY = 980;
    const budTorso = [
      [CX - 160, budY - 60], [CX + 160, budY - 60],
      [CX + 110, budY + 220], [CX - 110, budY + 220]
    ];
    fill(hand(budTorso, 'bud_torso', 1.05, 8), budTones);
    line([[CX - 150, budY - 50], [CX, budY + 180], [CX + 150, budY - 50]], { yellow: 0.5, pink: 0.2 }, { w: 6, key: 'robe_fold' });

    // Dharmachakra Pravartana Mudra (Turning Wheel of Law)
    fill(circ(CX, budY + 70, 52), { yellow: 0.95, pink: 0.5 });
    line([[CX - 35, budY + 70], [CX + 35, budY + 70]], MIX.dark, { w: 6, key: 'mudra_h' });
    line([[CX, budY + 35], [CX, budY + 105]], MIX.dark, { w: 6, key: 'mudra_v' });

    // Crossed Legs (Padmasana Base)
    const legsPts = [
      [CX - 280, budY + 310], [CX + 280, budY + 310],
      [CX + 220, budY + 420], [CX - 220, budY + 420]
    ];
    fill(hand(legsPts, 'bud_legs', 1.05, 8), budTones);
    fill(ell(CX - 130, budY + 340, 38, 22), { pink: 0.7, yellow: 0.5 });
    fill(ell(CX + 130, budY + 340, 38, 22), { pink: 0.7, yellow: 0.5 });

    // Throne Base with Sarnath Deer & Wheel
    const throneY = 1520;
    fill(rect(CX - 320, throneY, 640, 160), { teal: 0.6, pink: 0.4, yellow: 0.5 });
    type("DEER PARK • FIRST SERMON", CX, throneY + 75, 34, { yellow: 0.95, pink: 0.25 }, { align: 'center', key: 'throne_txt' });

    // Headers
    drawHeaderRiso("ERA III", "c. 500 CE", "PREACHING BUDDHA", "CLASSICAL GUPTA STONE • SARNATH", "gupta");
  });
  endSheet();
}

// ---------------------------------------------------------------------
// ERA 3: ELEPHANTA TRIMURTI (750 CE) — Colossal Basalt Rock-Cut
// ---------------------------------------------------------------------
function sceneElephanta() {
  beginSheet();
  const t = seg(TT, 27.0, 36.0);

  // 1. Far Field: Dark Basalt Rock Cavern Shadows
  printed(PITCH.field, { full: true }, () => {
    fill(rect(-40, -40, W + 80, H + 80), { teal: 0.55, pink: 0.45, yellow: 0.25 });
    // Flickering torchlight glow
    const torchPulse = 0.85 + 0.15 * Math.sin(t * TAU * 1.5);
    fill(circ(CX, 920, 460 * torchPulse), { yellow: rad(CX, 920, 160, 460, [[0, 0.7], [1, 0]]) }, { over: true });
  });

  // 2. The World: Fluted Cavern Pillars & Three Heads of Shiva
  printed(PITCH.world, { shapes: true }, () => {
    // Massive Cave Pillars flanking the sanctuary
    fill(rect(40, 220, 120, 1500), MIX.dark);
    fill(rect(W - 160, 220, 120, 1500), MIX.dark);
    fill(ell(100, 420, 85, 35), { teal: 0.8, pink: 0.6 });
    fill(ell(W - 100, 420, 85, 35), { teal: 0.8, pink: 0.6 });

    // Broad Massive Basalt Shoulder Base
    const colY = 980;
    const basaltStone = { teal: 0.75, pink: 0.55, yellow: 0.3 };
    const basaltShadow = MIX.dark;
    fill(rect(CX - 380, colY + 120, 760, 480), basaltStone);

    // Center Head: TATPURUSHA / MAHADEVA (Serene Creator)
    fill(circ(CX, colY - 60, 175), basaltStone);
    fill(rect(CX - 110, colY - 380, 220, 220), basaltShadow); // Jatamukuta crown
    type("OM", CX, colY - 260, 56, { yellow: 0.95, pink: 0.4 }, { align: 'center', key: 'om_txt' });
    fill(ell(CX - 42, colY - 50, 26, 12), basaltShadow);
    fill(ell(CX + 42, colY - 50, 26, 12), basaltShadow);
    line([[CX - 35, colY + 25], [CX + 35, colY + 25]], basaltShadow, { w: 6, key: 'shiva_lips' });
    fill(ell(CX, colY + 140, 160, 42), { yellow: 0.85, pink: 0.45 }); // Beaded necklace

    // Right Head: AGHORA / BHAIRAVA (Wrathful Destroyer)
    fill(circ(CX - 220, colY - 20, 125), { teal: 0.85, pink: 0.6, yellow: 0.25 });
    type("AGHORA", CX - 220, colY - 180, 26, { yellow: 0.9, pink: 0.5 }, { align: 'center', key: 'aghora_txt' });
    line([[CX - 260, colY + 15], [CX - 190, colY + 25]], basaltShadow, { w: 6, key: 'mustache' });

    // Left Head: VAMADEVA / UMA (Gentle Feminine Preserver)
    fill(circ(CX + 220, colY - 20, 125), { yellow: 0.75, pink: 0.5, teal: 0.2 });
    type("UMA", CX + 220, colY - 180, 26, { pink: 0.85, yellow: 0.9 }, { align: 'center', key: 'uma_txt' });
    fill(circ(CX + 290, colY + 180, 45), { yellow: 0.85, pink: 0.5 }); // Lotus bud hand

    // Headers
    drawHeaderRiso("ERA IV", "c. 750 CE", "ELEPHANTA TRIMURTI", "MONOLITHIC BASALT ROCK-CUT • GHARAPURI", "elephanta");
  });
  endSheet();
}

// ---------------------------------------------------------------------
// ERA 4: CHOLA BRONZE (1100 CE) — Shiva Nataraja Cosmic Dance
// ---------------------------------------------------------------------
function sceneChola() {
  beginSheet();
  const t = seg(TT, 36.0, 45.0);

  // 1. Far Field: Cosmic Radiant Rays
  printed(PITCH.field, { full: true }, () => {
    fill(rect(-40, -40, W + 80, H + 80), {
      pink: lin(0, 0, 0, H, [[0, 0.4], [1, 0.75]]),
      yellow: lin(0, 0, 0, H, [[0, 0.6], [1, 0.95]]),
      teal: lin(0, 0, 0, H, [[0, 0.1], [1, 0.25]])
    });
    const radAngle = t * TAU * 0.1;
    for (let b = 0; b < 16; b++) {
      const a = (b / 16) * TAU + radAngle;
      const bx = CX + Math.cos(a) * 750;
      const by = 960 + Math.sin(a) * 750;
      line([[CX, 960], [bx, by]], { pink: 0.35, yellow: 0.55 }, { w: 5, key: 'ray_' + b });
    }
  });

  // 2. The World: Cosmic Ring of Fire (Tiruvasi) & Dancing Nataraja
  printed(PITCH.world, { shapes: true }, () => {
    const ringR = 430;
    // Outer flame ring
    fill(circ(CX, 960, ringR + 25), { pink: 0.85, yellow: 0.95 });
    fill(circ(CX, 960, ringR - 25), {}); // Knockout
    for (let f = 0; f < 32; f++) {
      const fa = (f / 32) * TAU;
      const fx = CX + Math.cos(fa) * ringR;
      const fy = 960 + Math.sin(fa) * ringR;
      fill(circ(fx, fy, 22), { pink: 0.95, yellow: 0.85 }, { over: true });
    }

    // Lotus Pedestal Base
    fill(rect(CX - 240, 1600, 480, 80), { teal: 0.6, pink: 0.5, yellow: 0.8 });
    fill(ell(CX, 1600, 240, 45), { yellow: 0.9, pink: 0.4 });

    // Apasmara (Demon of Ignorance)
    fill(ell(CX - 15, 1560, 110, 38), MIX.dark);
    type("APASMARA (IGNORANCE)", CX, 1645, 20, MIX.dark, { align: 'center', key: 'apasmara_txt' });

    // Shiva Nataraja Body (Panchaloha Bronze)
    const natX = CX;
    const natY = 960;
    const cholaBronze = { teal: 0.35, pink: 0.85, yellow: 0.9 };
    const bronzeLine = MIX.dark;

    // Streaming Matted Hair (Jata)
    for (let j = 0; j < 6; j++) {
      const jy = (natY - 240) + j * 16;
      line([[natX - 340, jy + Math.sin(t * 8 + j) * 12], [natX + 340, jy - Math.sin(t * 8 + j) * 12]], { pink: 0.7, yellow: 0.85 }, { w: 6, key: 'jata_' + j });
    }

    // Slender Dancing Torso
    const torsoPts = [
      [natX - 55, natY - 220], [natX + 55, natY - 220],
      [natX + 45, natY + 40],  [natX - 35, natY + 50]
    ];
    fill(hand(torsoPts, 'nat_torso', 1.05, 8), cholaBronze);

    // Crown & Face
    fill(circ(natX, natY - 240, 58), cholaBronze);
    fill(rect(natX - 25, natY - 330, 50, 75), bronzeLine);

    // Four Divine Arms
    // 1. Upper Right: Damaru Drum
    line([[natX + 45, natY - 180], [natX + 260, natY - 200]], bronzeLine, { w: 8, key: 'arm_damaru' });
    fill(circ(natX + 270, natY - 205, 30), { yellow: 0.95, pink: 0.5 });
    type("DRUM", natX + 270, natY - 195, 20, MIX.coral, { align: 'center', key: 'drum_txt' });

    // 2. Upper Left: Agni Flame
    line([[natX - 45, natY - 180], [natX - 260, natY - 200]], bronzeLine, { w: 8, key: 'arm_agni' });
    fill(circ(natX - 270, natY - 205, 30), { yellow: 0.95, pink: 0.6 });
    type("FIRE", natX - 270, natY - 195, 20, MIX.coral, { align: 'center', key: 'fire_txt' });

    // 3. Lower Right: Abhaya Mudra
    line([[natX + 40, natY - 120], [natX + 170, natY - 60]], bronzeLine, { w: 8, key: 'arm_abhaya' });
    fill(circ(natX + 175, natY - 55, 30), cholaBronze);

    // 4. Lower Left: Gaja-hasta (Crossed arm pointing to raised foot)
    line([[natX - 40, natY - 120], [natX + 40, natY + 20], [natX - 110, natY + 110]], bronzeLine, { w: 8, key: 'arm_gaja' });

    // Right Leg planted on Apasmara
    line([[natX + 20, natY + 45], [natX + 15, natY + 360], [natX - 5, natY + 540]], bronzeLine, { w: 10, key: 'leg_r' });
    fill(ell(natX - 5, natY + 540, 24, 14), cholaBronze);

    // Left Leg lifted dynamically across knee
    line([[natX - 20, natY + 45], [natX - 140, natY + 180], [natX + 90, natY + 280]], bronzeLine, { w: 10, key: 'leg_l' });
    fill(ell(natX + 90, natY + 280, 26, 15, 0.4), cholaBronze);

    // Headers
    drawHeaderRiso("ERA V", "c. 1100 CE", "SHIVA NATARAJA", "LOST-WAX CHOLA BRONZE • TAMIL NADU", "chola");
  });
  endSheet();
}
