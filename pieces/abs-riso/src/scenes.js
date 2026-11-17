// =====================================================================
//  SCENES — abs-riso (Auto-Brewery Syndrome)
//  3-spot riso print: teal, fluorescent pink, yellow.
// =====================================================================

function sceneAct1() {
  const t = seg(TT, 0.0, 5.57);

  beginSheet();

  // Far-field print: warm cream paper with soft dusk gradient
  printed(PITCH.field, { full: true }, () => {
    fill(rect(-40, -40, W + 80, H + 80), {
      yellow: lin(0, 0, 0, H, [[0, 0.45], [0.6, 0.15], [1, 0.05]]),
      pink: lin(0, 0, 0, H, [[0, 0.05], [0.5, 0.20], [1, 0.35]])
    });
  });

  // World layer: The Trap
  printed(PITCH.world, { shapes: true }, () => {
    // Bread slice (carbs) on the left
    const bx = CX - 190, by = 920;
    const breadPts = [
      [bx - 140, by - 160], [bx - 60, by - 220], [bx + 60, by - 220], [bx + 140, by - 160],
      [bx + 160, by - 50], [bx + 150, by + 160], [bx - 150, by + 160], [bx - 160, by - 50]
    ];
    fill(hand(breadPts, 'toast_crust', 1.8), MIX.rust);
    const crumbPts = [
      [bx - 110, by - 130], [bx - 45, by - 180], [bx + 45, by - 180], [bx + 110, by - 130],
      [bx + 125, by - 30], [bx + 115, by + 130], [bx - 115, by + 130], [bx - 125, by - 30]
    ];
    fill(hand(crumbPts, 'toast_crumb', 1.4), { yellow: 0.85, pink: 0.15 });

    // Toast texture dots
    for (let i = 0; i < 7; i++) {
      const dx = ((i * 47) % 160) - 80;
      const dy = (((i * 73) % 200) - 100);
      fill(circ(bx + dx, by + dy, 7), MIX.coral);
    }

    // Crossed out cocktail / beer glass on top
    const gx = bx, gy = by - 10;
    line([[gx - 55, gy - 60], [gx + 55, gy - 60], [gx + 30, gy + 30], [gx - 30, gy + 30]], MIX.dark, { closed: true, w: 4, amt: 0.8, key: 'cup' });
    line([[gx, gy + 30], [gx, gy + 90]], MIX.dark, { w: 6, amt: 0.8, key: 'stem' });
    line([[gx - 45, gy + 90], [gx + 45, gy + 90]], MIX.dark, { w: 6, amt: 0.8, key: 'base' });
    // Knockout red slash across cup
    line([[gx - 75, gy - 75], [gx + 75, gy + 95]], { pink: 1.0, yellow: 0.2 }, { w: 12, amt: 1.0, key: 'noslash' });

    // Breathalyzer device on the right
    const devX = CX + 190, devY = 920;
    fill(hand(boxPts(devX - 140, devY - 210, 280, 420), 'b_body', 1.5), MIX.blue);
    specks(devX - 130, devY - 200, devX + 130, devY + 200, 40, 'b_specks');
    rimLine(boxPts(devX - 140, devY - 210, 280, 420), 'b_rim', { w: 7, amt: 1.2 });

    // Breathalyzer blow tube
    line([[devX, devY - 210], [devX, devY - 270], [devX + 50, devY - 270]], MIX.dark, { w: 12, amt: 0.8, key: 'tube' });

    // Digital readout screen
    fill(hand(boxPts(devX - 110, devY - 140, 220, 160), 'screen', 1.0), { yellow: 0.9, teal: 0.1 });
    type('0.16%', devX, devY - 45, 68, MIX.dark, { align: 'center', key: 'bac_num' });
    type('BAC DETECTED', devX, devY + 5, 20, MIX.coral, { align: 'center', key: 'bac_sub' });

    // Flashing status alert below screen
    fill(hand(boxPts(devX - 90, devY + 50, 180, 50), 'stat_box', 1.2), { pink: 0.9, yellow: 0.2 });
    type('FAIL: HIGH', devX, devY + 83, 24, MIX.dark, { align: 'center', key: 'fail_text' });

    // Hero reaction at bottom center
    risoHero(CX, 1260, 95, {
      key: 'act1_hero',
      mood: 'wow',
      look: [0.3, -0.6],
      hop: Math.sin(t * Math.PI * 4) * 8
    });
  });

  endSheet();

  risoTag('AUTO-BREWERY');
  risoCaption('0.16% BAC WITH ZERO DRINKS');
}

function sceneAct2() {
  const t = seg(TT, 5.57, 11.13);

  beginSheet();

  // Far-field: gut microscopic teal/yellow wash
  printed(PITCH.field, { full: true }, () => {
    fill(rect(-40, -40, W + 80, H + 80), {
      teal: lin(0, 0, 0, H, [[0, 0.40], [0.5, 0.25], [1, 0.15]]),
      yellow: lin(0, 0, 0, H, [[0, 0.10], [0.5, 0.35], [1, 0.50]])
    });
  });

  // World layer: The Yeast Brewery Mechanism
  printed(PITCH.world, { shapes: true }, () => {
    // Stylized digestive loop container
    const gx = CX, gy = 910;
    const tractPts = [
      [gx - 280, gy - 200], [gx + 280, gy - 200],
      [gx + 320, gy], [gx + 260, gy + 220],
      [gx, gy + 260], [gx - 260, gy + 220], [gx - 320, gy]
    ];
    fill(curvy(tractPts), { pink: 0.35, yellow: 0.25 });
    rimLine(resample(tractPts, true, 20), 'tract_rim', { tones: MIX.coral, w: 9, amt: 1.5 });

    // Inflow: Carbs label
    type('STARCH & SUGAR', gx, gy - 225, 32, MIX.blue, { align: 'center', key: 'label_in' });

    // Budding Yeast Microbe Colony (Saccharomyces cerevisiae)
    const yeastCenters = [
      [gx - 110, gy - 40, 68],
      [gx + 120, gy - 30, 62],
      [gx - 20, gy + 80, 76],
      [gx + 140, gy + 100, 48],
      [gx - 140, gy + 110, 50]
    ];

    yeastCenters.forEach(([yx, yy, yr], idx) => {
      // Main yeast cell
      fill(hand(ellipsePts(yx, yy, yr, yr * 0.85, 0.3, 24), 'ycell_' + idx, 1.2), MIX.green);
      rim(yx, yy, yr * 0.85, 'yrim_' + idx, { tones: MIX.dark, w: 5 });

      // Budding daughter cell
      const budA = idx * 1.3;
      const bx = yx + Math.cos(budA) * yr * 1.05;
      const by = yy + Math.sin(budA) * yr * 0.95;
      const br = yr * 0.42;
      fill(hand(ellipsePts(bx, by, br, br * 0.8, budA, 16), 'ybud_' + idx, 1.0), { yellow: 1.0, pink: 0.25 });
      rim(bx, by, br, 'ybud_rim_' + idx, { tones: MIX.dark, w: 4 });

      // Nucleus glint
      fill(circ(yx - yr * 0.2, yy - yr * 0.15, yr * 0.2), { yellow: 0.9 });
    });

    // Fermenting Ethanol Bubbles (rising up)
    for (let i = 0; i < 9; i++) {
      const phase = (TT * 1.8 + i * 0.38) % 1.0;
      const bubX = gx - 160 + ((i * 51) % 320);
      const bubY = gy + 180 - phase * 320;
      const bubR = 12 + ((i * 7) % 18);
      fill(circ(bubX, bubY, bubR), { teal: 0.85, pink: 0.15 });
      line(arcPts(bubX, bubY, bubR * 0.7, Math.PI * 1.1, Math.PI * 1.6, 6), {}, { w: 3, amt: 0.5, key: 'bubhl_' + i, knock: true });
    }

    // Reaction arrow and Formula
    type('C₆H₁₂O₆  ➜  2 C₂H₅OH + 2 CO₂', gx, gy + 220, 34, MIX.dark, { align: 'center', key: 'chem_form' });
    type('INTERNAL BREWERY', gx, gy + 265, 26, MIX.blue, { align: 'center', key: 'brew_tag' });
  });

  endSheet();

  risoTag('GUT FERMENTATION');
  risoCaption('YEAST TURNS CARBS TO ETHANOL');
}

function sceneAct3() {
  const t = seg(TT, 11.13, 16.7);

  beginSheet();

  // Far-field: high contrast emergency alarm tint
  printed(PITCH.field, { full: true }, () => {
    fill(rect(-40, -40, W + 80, H + 80), {
      pink: lin(0, 0, 0, H, [[0, 0.45], [0.6, 0.25], [1, 0.15]]),
      teal: lin(0, 0, 0, H, [[0, 0.10], [0.5, 0.25], [1, 0.45]])
    });
  });

  // World layer: The Grim Reality
  printed(PITCH.world, { shapes: true }, () => {
    // Slanted police emergency hazard beams
    const beamAngle = 0.24;
    const sx = CX, sy = 910;

    for (let b = -2; b <= 2; b++) {
      const bx = sx + b * 200;
      const beamPts = [
        [bx - 50, 480], [bx + 50, 480],
        [bx + 110, 1340], [bx + 10, 1340]
      ];
      fill(poly(beamPts), b % 2 === 0 ? { pink: 0.35 } : { teal: 0.30 });
    }

    // Liver organ silhouette in center
    const lx = CX - 130, ly = 890;
    const liverPts = [
      [lx - 160, ly - 70], [lx - 30, ly - 150], [lx + 150, ly - 110],
      [lx + 230, ly + 20], [lx + 190, ly + 140], [lx + 40, ly + 160],
      [lx - 120, ly + 110], [lx - 180, ly + 30]
    ];
    fill(hand(liverPts, 'liver_body', 1.8), MIX.rust);
    rimLine(resample(liverPts, true, 24), 'liver_rim', { tones: MIX.dark, w: 8, amt: 1.4 });

    // Liver toxicity distress marks
    for (let d = 0; d < 4; d++) {
      const dx = lx + ((d * 67) % 140) - 40;
      const dy = ly + ((d * 53) % 120) - 40;
      line([[dx - 22, dy - 18], [dx + 22, dy + 18]], MIX.dark, { w: 5, amt: 0.8, key: 'tox1_' + d });
      line([[dx - 22, dy + 18], [dx + 22, dy - 18]], MIX.dark, { w: 5, amt: 0.8, key: 'tox2_' + d });
    }

    // Handcuffs / DUI Citation Badge on right
    const cx = CX + 180, cy = 890;
    // Handcuff rings
    rim(cx - 50, cy, 55, 'cuff_l', { tones: MIX.blue, w: 9 });
    rim(cx + 50, cy, 55, 'cuff_r', { tones: MIX.blue, w: 9 });
    line([[cx - 5, cy], [cx + 5, cy]], MIX.dark, { w: 8, amt: 0.5, key: 'cuff_chain' });

    // Official Police / Court Citation Card
    fill(hand(boxPts(cx - 100, cy + 90, 200, 110), 'badge', 1.2), { yellow: 0.95, pink: 0.1 });
    rimLine(boxPts(cx - 100, cy + 90, 200, 110), 'badge_rim', { tones: MIX.dark, w: 5 });
    type('DUI CITATION', cx, cy + 135, 24, MIX.coral, { align: 'center', key: 'dui_text' });
    type('COURT DATE REQ.', cx, cy + 172, 17, MIX.dark, { align: 'center', key: 'court_text' });

    // Dizzy staggered hero with spinning stars overhead
    const hx = CX, hy = 1240;
    const sway = Math.sin(TT * 6) * 16;
    risoHero(hx + sway, hy, 105, {
      key: 'act3_hero',
      mood: 'wow',
      look: [Math.sin(TT * 5) * 0.7, -0.4],
      arms: [1.2 + Math.sin(TT * 4) * 0.4, 1.2 - Math.sin(TT * 4) * 0.4]
    });

    // Dizziness spiral stars
    for (let s = 0; s < 3; s++) {
      const sa = TT * 5 + s * (TAU / 3);
      const starX = hx + sway + Math.cos(sa) * 120;
      const starY = hy - 130 + Math.sin(sa) * 35;
      fill(circ(starX, starY, 10), { yellow: 1.0, pink: 0.3 });
    }
  });

  endSheet();

  risoTag('THE REALITY');
  risoCaption('HANGOVERS, LIVER DAMAGE, ARRESTS');
}
