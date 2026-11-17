// =====================================================================
//  SCENES — abs-pixel (Auto-Brewery Syndrome)
//  16-bit arcade pixel art at native 270x480 resolution (4x scale to 1080x1920).
// =====================================================================

function sceneAct1() {
  const t = seg(TT, 0.0, 5.57);

  lowres(ERA_RES[0], (w, h) => {
    // Dark arcade background with dithered gradient
    pgrad(0, 0, w, h, [PAL16.night, PAL16.ink, PAL16.night]);

    // Top status HUD
    pixBox(30, 68, 210, 22, { bg: PAL16.ink, edge: PAL16.orange });
    pixText('ALERT: 0.16% BAC DETECTED', 135, 74, PAL16.yellow, { align: 'center' });

    // Bread slice sprite on the left (carbohydrates)
    const bx = 65, by = 180;
    // Bread crust
    prect(bx - 32, by - 36, 64, 72, PAL16.brown);
    // Bread crumb
    prect(bx - 26, by - 30, 52, 60, PAL16.orange);
    // Bread holes / texture
    prect(bx - 12, by - 14, 6, 6, PAL16.brown);
    prect(bx + 8, by + 4, 8, 8, PAL16.brown);
    prect(bx - 16, by + 12, 6, 6, PAL16.brown);
    pixText('CARBS', bx, by + 42, PAL16.white, { align: 'center' });

    // Crossed out drink glyph above bread
    const gx = bx, gy = by - 55;
    prect(gx - 10, gy - 12, 20, 14, PAL16.sky);
    prect(gx - 2, gy + 2, 4, 10, PAL16.white);
    prect(gx - 8, gy + 12, 16, 3, PAL16.white);
    // Red diagonal slash
    pline(gx - 14, gy - 14, gx + 14, gy + 14, PAL16.red);
    pline(gx - 13, gy - 14, gx + 15, gy + 14, PAL16.red);

    // Arrow pointing to breathalyzer
    pline(bx + 40, by, bx + 65, by, PAL16.yellow);
    pline(bx + 60, by - 4, bx + 65, by, PAL16.yellow);
    pline(bx + 60, by + 4, bx + 65, by, PAL16.yellow);

    // Breathalyzer device on the right
    const devX = 180, devY = 180;
    // Main chassis
    pixBox(devX - 35, devY - 50, 70, 100, { bg: PAL16.slate, edge: PAL16.white, shadow: PAL16.ink });
    // Blow nozzle
    prect(devX - 5, devY - 62, 10, 12, PAL16.white);
    // Digital readout panel
    pixBox(devX - 26, devY - 38, 52, 36, { bg: PAL16.ink, edge: PAL16.lime });
    pixText('0.16%', devX, devY - 26, PAL16.lime, { align: 'center', scale: 2 });
    pixText('TEST: FAIL', devX, devY + 6, PAL16.red, { align: 'center' });

    // Status warning below device
    pixText('ZERO ALCOHOL', devX, devY + 56, PAL16.pink, { align: 'center' });

    // Hero critter in astonishment at bottom
    pixHero(135, 305, 24, {
      mood: 'wow',
      look: [0.3, -0.6],
      hop: Math.sin(t * Math.PI * 4) * 3
    });
    pixBubble('?!', 165, 275);
  });

  pixTag('STAGE 1: THE TRAP');
  pixCaption('0.16% BAC WITH ZERO DRINKS', { y: 1380 });
}

function sceneAct2() {
  const t = seg(TT, 5.57, 11.13);

  lowres(ERA_RES[1], (w, h) => {
    // Gut interior dark backdrop
    pgrad(0, 0, w, h, [PAL16.purple, PAL16.ink, PAL16.purple]);

    // Top biological status banner
    pixBox(30, 68, 210, 22, { bg: PAL16.ink, edge: PAL16.lime });
    pixText('GUT BIOME: YEAST FERMENTATION', 135, 74, PAL16.lime, { align: 'center' });

    // Digestive tract tube loop
    const cx = 135, cy = 185;
    pcircle(cx, cy, 75, PAL16.night, { ring: 12 });
    pcircle(cx, cy, 78, PAL16.slate, { ring: 3 });

    // Inflow text
    pixText('CARBOHYDRATES IN', cx, cy - 88, PAL16.yellow, { align: 'center' });

    // Yeast cell sprites (Saccharomyces cerevisiae)
    const yeastData = [
      [cx - 30, cy - 20, 18, PAL16.lime],
      [cx + 32, cy - 15, 16, PAL16.green],
      [cx - 5, cy + 25, 20, PAL16.lime],
      [cx + 35, cy + 30, 13, PAL16.green],
      [cx - 36, cy + 28, 14, PAL16.lime]
    ];

    yeastData.forEach(([yx, yy, yr, col], i) => {
      // Main yeast body
      pcircle(yx, yy, yr, col);
      pcircle(yx, yy, yr, PAL16.ink, { ring: 2 });
      // Nucleus dot
      prect(yx - 2, yy - 2, 4, 4, PAL16.white);

      // Budding daughter sprout
      const bAngle = i * 1.5;
      const bx = yx + Math.round(Math.cos(bAngle) * yr * 1.05);
      const by = yy + Math.round(Math.sin(bAngle) * yr * 0.95);
      pcircle(bx, by, Math.round(yr * 0.42), PAL16.yellow);
      pcircle(bx, by, Math.round(yr * 0.42), PAL16.ink, { ring: 1 });
    });

    // Rising ethanol bubbles with animation
    for (let i = 0; i < 9; i++) {
      const phase = (TT * 1.8 + i * 0.35) % 1.0;
      const bubX = cx - 45 + ((i * 19) % 90);
      const bubY = cy + 50 - Math.round(phase * 80);
      const bubR = 3 + (i % 4);
      pcircle(bubX, bubY, bubR, PAL16.ice);
      prect(bubX - 1, bubY - 1, 1, 1, PAL16.white);
    }

    // Reaction formula readout box at bottom of tract
    pixBox(35, 275, 200, 30, { bg: PAL16.ink, edge: PAL16.yellow });
    pixText('SUGAR  ➜  ETHANOL + CO2', 135, 281, PAL16.yellow, { align: 'center' });
    pixText('ENDOGENOUS SYNTHESIS', 135, 292, PAL16.sky, { align: 'center' });
  });

  pixTag('STAGE 2: FERMENTATION');
  pixCaption('YEAST BREWS CARBS TO ETHANOL', { y: 1380 });
}

function sceneAct3() {
  const t = seg(TT, 11.13, 16.7);

  lowres(ERA_RES[2], (w, h) => {
    // Alarm siren backdrop with flashing blue/red police bars
    pgrad(0, 0, w, h, [PAL16.night, PAL16.ink, PAL16.night]);

    // Flashing emergency siren bars across top
    const flashPhase = Math.floor(TT * 6) % 2;
    prect(25, 68, 110, 10, flashPhase ? PAL16.red : PAL16.night);
    prect(135, 68, 110, 10, flashPhase ? PAL16.night : PAL16.blue);

    // DUI Arrest Notice Banner
    pixBox(35, 86, 200, 26, { bg: PAL16.ink, edge: PAL16.red });
    pixText('CRITICAL: DUI ARREST', 135, 93, PAL16.red, { align: 'center' });

    // Liver organ sprite on left with damage cross
    const lx = 75, ly = 180;
    // Liver silhouette
    prect(lx - 35, ly - 20, 70, 45, PAL16.red);
    prect(lx - 25, ly - 30, 45, 15, PAL16.red);
    prect(lx + 10, ly + 20, 20, 10, PAL16.red);
    // Border
    pcircle(lx, ly, 32, PAL16.ink, { ring: 3 });
    // Toxicity cross on liver
    prect(lx - 12, ly - 3, 24, 6, PAL16.yellow);
    prect(lx - 3, ly - 12, 6, 24, PAL16.yellow);
    pixText('LIVER TOXICITY', lx, ly + 40, PAL16.yellow, { align: 'center' });

    // Symptom checklist box on right
    const rx = 185, ry = 180;
    pixBox(rx - 45, ry - 42, 90, 76, { bg: PAL16.ink, edge: PAL16.purple });
    pixText('SYMPTOMS:', rx, ry - 34, PAL16.white, { align: 'center' });
    pixText('• HANGOVERS', rx - 38, ry - 18, PAL16.pink);
    pixText('• BRAIN FOG', rx - 38, ry - 4, PAL16.pink);
    pixText('• HIGH BAC', rx - 38, ry + 10, PAL16.red);
    pixText('• DUI RECORD', rx - 38, ry + 22, PAL16.red);

    // Stumbling dizzy hero at bottom
    const sway = Math.round(Math.sin(TT * 8) * 5);
    pixHero(135 + sway, 310, 24, {
      mood: 'wow',
      hop: Math.abs(Math.sin(TT * 6)) * 4
    });

    // Dizziness spiral stars above hero
    for (let s = 0; s < 3; s++) {
      const sa = TT * 6 + s * (TAU / 3);
      const starX = 135 + sway + Math.round(Math.cos(sa) * 25);
      const starY = 265 + Math.round(Math.sin(sa) * 8);
      prect(starX - 1, starY - 1, 3, 3, PAL16.yellow);
    }
  });

  pixTag('STAGE 3: THE REALITY');
  pixCaption('HANGOVERS, LIVER DAMAGE, ARRESTS', { y: 1380 });
}
