  // =====================================================================
  //  SCORE BODY — The Younger Dryas (50.0s @ 96 BPM)
  //  Inside buildScore(); procedural soundscape via WebAudio synthesizer.
  // =====================================================================
  const T = TIMELINE, cu = T.cues;
  
  // 1. Foundational Deep Earth Drone (A1, E2, A2 across 50.0s)
  to = 'm';
  pad(0.0, 50.0, ['A1', 'E2', 'A2'], 0.05, { type: 'sawtooth', cut: 550, att: 1.5, rel: 2.0 });
  pad(0.0, 50.0, ['A2', 'C3', 'E3'], 0.035, { type: 'triangle', cut: 850, att: 2.0, rel: 2.0, send: 0.5 });

  // -------------------------------------------------------------------
  // SCENE 0 (0.0 - 7.2s): Prologue — Earth on the Brink
  // -------------------------------------------------------------------
  to = 'm';
  // Glacial ice chimes & eerie high fifths
  chime(0.6, [nz('E5')], 0.18, 0.0);
  chime(2.8, [nz('B5')], 0.15, -0.2);
  chime(5.0, [nz('E6')], 0.12, 0.2);
  pad(0.5, 7.2, ['A3', 'C4', 'E4'], 0.035, { type: 'sine', cut: 1200, att: 1.0, rel: 0.8, send: 0.4 });
  
  to = 's';
  // Howling glacial wind sweep
  sweep(0.5, 5.5, 0.015, 300, 1400, -0.1);
  sweep(6.5, 7.25, 0.035, 200, 2600, 0.0);

  // -------------------------------------------------------------------
  // SCENE 1 (7.2 - 14.4s): The Comet Airburst Detonation
  // -------------------------------------------------------------------
  to = 'm';
  // Massive seismic impact sub hit at detonation
  sub(7.3, 0.7);
  pluck(7.35, nz('A1'), 0.45, 0.0, 3.5, 3800, 0.9);
  
  // Screaming atmospheric fireball pads
  pad(7.5, 14.4, ['A2', 'Ds3', 'A3', 'E4'], 0.06, { type: 'sawtooth', cut: 2800, att: 0.3, rel: 1.0, send: 0.6 });

  to = 's';
  // Consecutive shockwave explosions & falling bolides
  const blastHits = [7.4, 8.2, 9.1, 10.5, 12.0];
  blastHits.forEach((bh, i) => {
    noiseHit(bh, 0.18, 'lowpass', 600 + i * 200, 1.5, 0.12, 0.2 * (i % 2 === 0 ? 1 : -1), 0.6);
    sweep(bh, bh + 0.6, 0.04, 3000, 200, -0.3 + i * 0.15);
  });
  // Morph 1 transition sweep
  sweep(13.6, 14.45, 0.04, 150, 3000, 0.0);

  // -------------------------------------------------------------------
  // SCENE 2 (14.4 - 21.6s): The Black Mat & Extinction
  // -------------------------------------------------------------------
  to = 'm';
  // Somber, dark funeral drone in A minor
  sub(14.5, 0.5);
  pad(14.4, 21.6, ['A2', 'C3', 'E3', 'G3'], 0.045, { type: 'triangle', cut: 700, att: 1.2, rel: 1.0, send: 0.7 });
  
  // Plucked bone laments
  const lamentNotes = [['E3', 15.5], ['A3', 17.0], ['C4', 18.2], ['B3', 19.5]];
  lamentNotes.forEach(([n, t]) => {
    pluck(t, nz(n), 0.22, 0.0, 1.2, 1200, 0.5);
  });

  to = 's';
  // Falling soot crackles & nanodiamond sparkles
  for (let k = 0; k < 10; k++) {
    blip(15.0 + k * 0.6, 1800 + (k % 4) * 300, 1200, 0.03, 0.02, 0.2 * (k % 2 === 0 ? 1 : -1));
  }
  // Morph 2 transition sweep
  sweep(20.8, 21.65, 0.035, 250, 2200, 0.0);

  // -------------------------------------------------------------------
  // SCENE 3 (21.6 - 28.8s): The Megafloods & Ocean Shutdown
  // -------------------------------------------------------------------
  to = 'm';
  // Churning ocean undertow sub bass
  sub(22.0, 0.6);
  pad(21.6, 28.8, ['F2', 'C3', 'F3', 'A3'], 0.055, { type: 'sawtooth', cut: 1100, att: 0.8, rel: 1.2, send: 0.6 });

  to = 's';
  // Catastrophic rushing water roar & dam breaks
  sweep(21.8, 26.5, 0.05, 180, 2800, 0.0);
  const surgeTimes = [22.2, 23.8, 25.4, 27.0];
  surgeTimes.forEach((st, idx) => {
    noiseHit(st, 0.16, 'bandpass', 1200 + idx * 250, 4.0, 0.15, -0.2 + idx * 0.1, 0.5);
  });
  // Morph 3 transition sweep
  sweep(28.0, 28.85, 0.04, 300, 2800, 0.0);

  // -------------------------------------------------------------------
  // SCENE 4 (28.8 - 36.0s): The 1,200-Year Deep Freeze
  // -------------------------------------------------------------------
  to = 'm';
  // Freezing sub-zero pad with biting fifths
  pad(28.8, 36.0, ['D2', 'A2', 'D3', 'F3'], 0.048, { type: 'sawtooth', cut: 650, att: 1.0, rel: 1.0, send: 0.6 });
  
  // Frost needle chimes
  const frostTimes = [29.5, 31.0, 32.5, 34.0, 35.2];
  const frostPitches = ['A5', 'D6', 'F6', 'A6', 'D6'];
  frostTimes.forEach((t, i) => {
    chime(t, [nz(frostPitches[i])], 0.16, -0.15 + i * 0.1);
  });

  to = 's';
  // Blizzards howling around campfire
  sweep(29.0, 35.0, 0.02, 400, 1600, 0.1);
  // Campfire snaps
  for (let f = 0; f < 8; f++) {
    blip(32.0 + f * 0.45, 2400 + (f % 3) * 400, 800, 0.03, 0.02, 0.1);
  }
  // Morph 4 transition sweep
  sweep(35.2, 36.05, 0.035, 150, 2600, 0.0);

  // -------------------------------------------------------------------
  // SCENE 5 (36.0 - 43.2s): Göbekli Tepe & Megalithic Stone
  // -------------------------------------------------------------------
  to = 'm';
  // Majestic ascending harmonic progression (A minor -> C major -> D major)
  pluck(36.0, nz('A1'), 0.4, 0.0, 3.0, 3200, 0.8);
  pad(36.0, 43.2, ['A2', 'E3', 'A3', 'C4', 'E4'], 0.05, { type: 'triangle', cut: 1600, att: 0.8, rel: 1.0, send: 0.5 });
  
  // Sacred stone melody
  const stoneNotes = [
    ['C4', 36.8], ['E4', 37.8], ['G4', 38.8], ['A4', 39.8],
    ['G4', 40.8], ['E4', 41.8], ['D4', 42.6]
  ];
  stoneNotes.forEach(([n, t]) => {
    pluck(t, nz(n), 0.22, 0.0, 0.8, 2400, 0.4);
  });

  to = 's';
  // Stone chisels carving T-pillar 43
  const chiselTimes = [37.0, 38.2, 39.5, 40.8, 42.0];
  chiselTimes.forEach((ct, idx) => {
    noiseHit(ct, 0.12, 'highpass', 2800, 3.0, 0.05, -0.1 + idx * 0.05, 0.4);
    pluck(ct + 0.02, nz('C3'), 0.15, 0.0, 0.4, 1800, 0.2); // Megalith ring
  });
  // Morph 5 transition sweep
  sweep(42.4, 43.25, 0.04, 300, 3400, 0.0);

  // -------------------------------------------------------------------
  // SCENE 6 (43.2 - 50.0s): Epilogue — Dawn of Civilization
  // -------------------------------------------------------------------
  to = 'm';
  // Radiant resolution chord in A major (A2, E3, Cs4, E4)
  pluck(43.2, nz('A1'), 0.42, 0.0, 3.5, 3400, 0.9);
  pad(43.2, 50.0, ['A2', 'E3', 'Cs4', 'E4', 'A4'], 0.055, { type: 'sine', cut: 2000, att: 1.0, rel: 2.0, send: 0.6 });
  chime(44.0, [nz('E5'), nz('A5')], 0.2, 0.0);
  chime(47.0, [nz('Cs6')], 0.18, 0.0);

  to = 's';
  sweep(48.0, 49.8, 0.02, 800, 200, 0.0);
