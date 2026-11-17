// =====================================================================
//  SCENES — abs-sketchbook (Auto-Brewery Syndrome)
//  Graphite sketches, ink lines, watercolor/highlighter washes on paper.
// =====================================================================

function sceneAct1() {
  const t = seg(TT, 0.0, 5.57);

  sketchPage({ grid: 'dots' });

  // Tape strip at corner (aesthetic anchor)
  tapeStrip(180, 260, 160, -0.08, 'tape_corner');

  // Sketched bread slice (carbohydrates) on the left
  const bx = CX - 220, by = 900;
  const breadPts = [
    [bx - 130, by - 140], [bx - 50, by - 200], [bx + 50, by - 200], [bx + 130, by - 140],
    [bx + 140, by - 40], [bx + 130, by + 140], [bx - 130, by + 140], [bx - 140, by - 40]
  ];
  gfill(breadPts, SK.wood, { a: 0.4, off: [6, 6], key: 'toast_fill' });
  gpencil(breadPts, { w: 3, closed: true, key: 'toast_pencil', passes: 2 });
  gline(breadPts, { w: 5, closed: true, key: 'toast_ink' });
  ghatch(bx - 110, by - 120, bx + 110, by + 120, { gap: 14, col: SK.graph, a: 0.45, key: 'toast_hatch' });

  // Label under toast
  handLetter('CARBS / SUGAR', bx, by + 185, 28, { face: 'marker', col: SK.ink, key: 'carbs_label' });

  // Crossed-out drink sketch above bread
  const dx = bx, dy = by - 80;
  gline([[dx - 45, dy - 50], [dx + 45, dy - 50], [dx + 25, dy + 25], [dx - 25, dy + 25]], { w: 3.5, closed: true, key: 'cup_ink' });
  gline([[dx, dy + 25], [dx, dy + 70]], { w: 4, key: 'cup_stem' });
  gline([[dx - 35, dy + 70], [dx + 35, dy + 70]], { w: 4, key: 'cup_base' });
  // Bold red X over alcohol
  gline([[dx - 55, dy - 60], [dx + 55, dy + 80]], { w: 8, col: SK.red, key: 'no_alcohol_1', second: false });
  gline([[dx - 55, dy + 80], [dx + 55, dy - 60]], { w: 8, col: SK.red, key: 'no_alcohol_2', second: false });
  handLetter('0 DRINKS', dx, dy + 115, 26, { face: 'marker', col: SK.red, key: 'zero_drinks' });

  // Arrow connecting bread to breathalyzer
  arrowPencil([[bx + 150, by], [CX - 40, by], [CX + 40, by]], 1, { col: SK.ink, w: 4, key: 'conv_arrow' });

  // Sketched Breathalyzer device on the right
  const devX = CX + 200, devY = 900;
  const devBox = sketchBox(devX - 130, devY - 200, 260, 400, 20);
  gfill(devBox, SK.sheet, { a: 0.9, off: [8, 8], key: 'dev_fill' });
  gline(devBox, { w: 5, key: 'dev_ink' });
  litHatch(devBox, { col: SK.graphL, gap: 12, a: 0.5, key: 'dev_shade' });

  // Blow nozzle
  gline([[devX, devY - 200], [devX, devY - 260], [devX + 45, devY - 260]], { w: 9, key: 'nozzle' });

  // LCD screen with red highlight
  const scrBox = sketchBox(devX - 100, devY - 130, 200, 150, 10);
  gfill(scrBox, SK.cream, { a: 0.8, off: [0, 0], key: 'scr_fill' });
  gline(scrBox, { w: 4, key: 'scr_ink' });

  // Highlight behind readout
  highlight(devX - 90, devX + 90, devY - 45, 65, 1, { col: SK.hilite, a: 0.65, key: 'bac_hl' });
  handLetter('0.16%', devX, devY - 30, 64, { face: 'marker', weight: 900, col: SK.red, key: 'bac_val' });
  handLetter('BLOOD ALCOHOL', devX, devY + 50, 22, { face: 'marker', col: SK.ink, key: 'bac_sub' });

  // Little doodle hero reacting at bottom
  doodleHero(CX, 1220, 95, {
    key: 'act1_hero',
    mood: 'wow',
    look: [0.4, -0.6],
    arms: [1.8, 1.8]
  });

  pageTag('THE TRAP');
  pageCaption(['0.16% BLOOD ALCOHOL', 'WITHOUT A SINGLE DRINK'], [[0, '0.16%']], { size: 52, y: 1360 });
}

function sceneAct2() {
  const t = seg(TT, 5.57, 11.13);

  sketchPage({ grid: 'ruled' });

  // Medical journal note card pinned at top right
  noteCard(CX + 280, 480, 0.06, 0.95, 1, 'notes', SK.terra);

  // Anatomical intestine / gut loop sketched in center
  const gx = CX, gy = 910;
  const tractPts = [
    [gx - 260, gy - 190], [gx + 260, gy - 190],
    [gx + 300, gy], [gx + 250, gy + 210],
    [gx, gy + 250], [gx - 250, gy + 210], [gx - 300, gy]
  ];
  gfill(tractPts, SK.pink, { a: 0.25, off: [6, 6], key: 'tract_fill' });
  gpencil(tractPts, { w: 3, closed: true, key: 'tract_p', passes: 2 });
  gline(tractPts, { w: 5.5, closed: true, key: 'tract_ink' });

  // Title notation above gut
  handLetter('GUT MICROBIOME: FERMENTATION', gx, gy - 230, 30, { face: 'marker', col: SK.ink, key: 'gut_title' });

  // Fungal Yeast Colony (Saccharomyces cerevisiae)
  const yeastCells = [
    [gx - 110, gy - 50, 65],
    [gx + 120, gy - 40, 60],
    [gx - 20, gy + 70, 72],
    [gx + 130, gy + 90, 46],
    [gx - 130, gy + 100, 48]
  ];

  yeastCells.forEach(([yx, yy, yr], i) => {
    const cellLoop = loopPts(yx, yy, yr, yr * 0.9, 0.08, 0, 32);
    gfill(cellLoop, SK.yellow, { a: 0.5, off: [4, 4], key: 'yfill_' + i });
    gpencil(cellLoop, { w: 2.5, closed: true, key: 'ypencil_' + i });
    gline(cellLoop, { w: 4, closed: true, key: 'yink_' + i });
    litHatch(cellLoop, { col: SK.wood, gap: 10, a: 0.6, key: 'yhatch_' + i });

    // Budding sprout
    const bAngle = i * 1.4;
    const bx = yx + Math.cos(bAngle) * yr * 1.05;
    const by = yy + Math.sin(bAngle) * yr * 0.95;
    const br = yr * 0.4;
    const budLoop = loopPts(bx, by, br, br * 0.8, 0.1, bAngle, 20);
    gfill(budLoop, SK.terra, { a: 0.6, off: [2, 2], key: 'bfill_' + i });
    gline(budLoop, { w: 3.5, closed: true, key: 'bink_' + i });
  });

  // Yeast species scientific annotation
  arrowPencil([[gx - 110, gy - 120], [gx - 180, gy - 160], [gx - 250, gy - 160]], 1, { col: SK.graph, w: 2.5, key: 'annot_arrow' });
  handLetter('S. cerevisiae (Yeast)', gx - 250, gy - 175, 24, { align: 'right', face: 'hand', col: SK.graph, key: 'species_name' });

  // Rising ethanol bubbles
  for (let i = 0; i < 8; i++) {
    const phase = (TT * 1.6 + i * 0.35) % 1.0;
    const bubX = gx - 150 + ((i * 53) % 300);
    const bubY = gy + 170 - phase * 300;
    const bubR = 10 + ((i * 7) % 16);
    const bPts = loopPts(bubX, bubY, bubR, bubR, 0.05, 0, 16);
    gfill(bPts, SK.glass, { a: 0.5, key: 'bubf_' + i });
    gline(bPts, { w: 2.8, key: 'bubl_' + i, second: false });
  }

  // Chemical equation formula written at bottom of gut
  highlight(gx - 230, gx + 230, gy + 215, 42, 1, { col: SK.hilite, a: 0.5, key: 'chem_hl' });
  handLetter('CARBS  ➜  ETHANOL + CO₂', gx, gy + 225, 34, { face: 'marker', col: SK.ink, key: 'chem_eq' });

  pageTag('GUT BREWERY');
  pageCaption(['FUNGAL YEAST IN THE GUT', 'BREWS CARBS INTO ETHANOL'], [[1, 'ETHANOL']], { size: 50, y: 1360 });
}

function sceneAct3() {
  const t = seg(TT, 11.13, 16.7);

  sketchPage({ grid: 'plain' });

  // Red rubber stamp on right: DUI CITATION
  inkStamp('DUI CITATION', CX + 40, 780, 0.78, -0.08, 0.95, 'dui_stamp');

  // Sketched liver organ with crosshatched distress on left
  const lx = CX - 190, ly = 880;
  const liverPts = [
    [lx - 150, ly - 60], [lx - 30, ly - 140], [lx + 140, ly - 100],
    [lx + 210, ly + 20], [lx + 170, ly + 130], [lx + 30, ly + 150],
    [lx - 110, ly + 100], [lx - 170, ly + 20]
  ];
  gfill(liverPts, SK.terra, { a: 0.4, off: [6, 6], key: 'liver_fill' });
  gpencil(liverPts, { w: 3, closed: true, key: 'liver_p', passes: 2 });
  gline(liverPts, { w: 5, closed: true, key: 'liver_ink' });
  ghatch(lx - 130, ly - 100, lx + 150, ly + 120, { gap: 11, col: SK.red, a: 0.55, key: 'liver_distress' });
  handLetter('LIVER DAMAGE', lx, ly + 195, 26, { face: 'marker', col: SK.red, key: 'liver_label' });

  // Pinned checklist of consequences
  const cardX = CX + 140, cardY = 1000;
  noteCard(cardX, cardY, 0.04, 1.10, 1, 'reality_card', SK.red);
  handLetter('• SEVERE HANGOVERS', cardX, cardY - 20, 22, { face: 'marker', col: SK.ink, key: 'symp_1' });
  handLetter('• CHRONIC BRAIN FOG', cardX, cardY + 15, 22, { face: 'marker', col: SK.ink, key: 'symp_2' });
  handLetter('• CRIMINAL CHARGES', cardX, cardY + 50, 22, { face: 'marker', col: SK.red, key: 'symp_3' });

  // Staggered dizzy hero with sweat drop and spinning star
  const hx = CX, hy = 1220;
  const stagger = Math.sin(TT * 6) * 14;
  doodleHero(hx + stagger, hy, 100, {
    key: 'act3_hero',
    mood: 'puzzled',
    legs: true,
    step: Math.sin(TT * 5) * 0.8,
    arms: [1.2 + Math.sin(TT * 4) * 0.4, 1.2 - Math.sin(TT * 4) * 0.4]
  });

  // Sweat drop
  sweat(hx + stagger + 55, hy - 40, (TT * 2) % 1, 'hero_sweat');

  // Dizzy stars overhead
  doodleStar(hx + stagger - 60, hy - 110, 18, 'star_1', { col: SK.terra });
  doodleStar(hx + stagger + 60, hy - 115, 16, 'star_2', { col: SK.terra });

  pageTag('THE REALITY');
  pageCaption(['BRUTAL RANDOM HANGOVERS', 'LIVER DAMAGE AND ARRESTS'], [[0, 'HANGOVERS'], [1, 'ARRESTS']], { size: 50, y: 1360 });
}
