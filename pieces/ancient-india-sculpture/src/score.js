  // =====================================================================
  //  SCORE BODY — Ancient Indian Sculpture (52.5s @ 96 BPM)
  //  Inside buildScore(); generated via WebAudio synthesizer.
  // =====================================================================
  const T = TIMELINE, cu = T.cues;
  
  // 1. Foundational Tanpura Drone (Sa-Pa Tuning: D2, A2, D3, A3 across 52.5s)
  to = 'm';
  pad(0.0, 52.5, ['D2', 'A2', 'D3'], 0.045, { type: 'sawtooth', cut: 650, att: 1.5, rel: 2.0 });
  pad(0.0, 52.5, ['D3', 'Fs3', 'A3'], 0.035, { type: 'triangle', cut: 900, att: 2.0, rel: 2.0, send: 0.5 });

  // -------------------------------------------------------------------
  // SCENE 0 (0.0 - 7.5s): Intro Prologue & Sacred Awakening
  // -------------------------------------------------------------------
  to = 'm';
  // Singing bowl initial strike & temple bell chime
  chime(0.5, [nz('D5')], 0.22, 0.0);
  chime(2.5, [nz('A5')], 0.18, 0.1);
  pad(0.5, 7.5, ['D3', 'A3', 'Fs4'], 0.038, { type: 'sine', cut: 1200, att: 1.0, rel: 0.8, send: 0.5 });
  
  to = 's';
  sweep(6.8, 7.55, 0.03, 200, 1800, 0.0);

  // -------------------------------------------------------------------
  // SCENE 1 (7.5 - 15.0s): Indus Terracotta & Lost-Wax Bronze
  // -------------------------------------------------------------------
  to = 'm';
  // Sparse earthen ceramic plucks (Raag Bhupali: D - E - Fs - A - B)
  const indusNotes = [['D3', 8.0], ['Fs3', 9.2], ['A3', 10.5], ['B3', 11.8], ['A3', 13.0], ['Fs3', 14.0]];
  indusNotes.forEach(([n, t]) => {
    pluck(t, nz(n), 0.22, -0.15, 0.8, 1800, 0.4);
  });
  to = 's';
  // Clay crucible clicks & bronze cooling hisses
  for (let i = 0; i < 8; i++) {
    blip(8.5 + i * 0.75, 1200 + (i % 3) * 200, 800, 0.04, 0.025, 0.1 * (i % 2 === 0 ? 1 : -1));
  }
  // Morph 1 Transition (14.2 -> 15.05s)
  sweep(14.2, 15.05, 0.025, 200, 1600, 0.0);

  // -------------------------------------------------------------------
  // SCENE 2 (15.0 - 22.5s): Mauryan Polished Sandstone & Royal Bells
  // -------------------------------------------------------------------
  to = 'm';
  // Royal bronze gong on era entrance
  pluck(15.0, nz('D2'), 0.35, 0.0, 2.5, 3200, 0.8);
  pad(15.0, 22.5, ['D3', 'A3', 'D4', 'Fs4'], 0.04, { type: 'sine', cut: 1400, att: 0.8, rel: 0.5, send: 0.4 });
  
  // High temple bell chimes as the 24-spoke Chakra turns
  const bellTimes = [15.5, 17.0, 18.5, 19.8, 21.0];
  const bellPitches = ['A4', 'D5', 'Fs5', 'A5', 'D5'];
  bellTimes.forEach((t, i) => {
    chime(t, [nz(bellPitches[i])], 0.18, 0.0);
  });
  to = 's';
  // Rotating wheel whoosh
  sweep(17.5, 19.5, 0.015, 600, 2200, 0.2);
  // Morph 2 Transition (21.7 -> 22.55s)
  sweep(21.7, 22.55, 0.03, 300, 2400, 0.0);

  // -------------------------------------------------------------------
  // SCENE 3 (22.5 - 30.0s): Classical Gupta Sublime Serenity
  // -------------------------------------------------------------------
  to = 'm';
  // Singing bowl deep meditation resonance
  pad(22.5, 30.0, ['D3', 'Fs3', 'A3', 'C4', 'E4'], 0.042, { type: 'triangle', cut: 1100, att: 1.2, rel: 0.8, send: 0.6 });
  
  // Gentle meditative melody on Flute/Sitar harmonics
  const guptaMelody = [
    ['Fs4', 23.2], ['A4', 24.4], ['B4', 25.6], ['D5', 26.8],
    ['B4', 27.8], ['A4', 28.8], ['Fs4', 29.5]
  ];
  guptaMelody.forEach(([n, t]) => {
    pluck(t, nz(n), 0.2, 0.1, 1.0, 2800, 0.5);
  });
  to = 's';
  // Serene breathing drone swell
  sub(25.0, 0.4);
  // Morph 3 Transition (29.2 -> 30.05s)
  sweep(29.2, 30.05, 0.035, 250, 1800, 0.0);

  // -------------------------------------------------------------------
  // SCENE 4 (30.0 - 37.5s): Elephanta Trimurti Basalt Colossus
  // -------------------------------------------------------------------
  to = 'm';
  // Deep monolithic cavern bass
  sub(30.0, 0.5); // Low rumble
  pad(30.0, 37.5, ['D2', 'F2', 'A2', 'D3'], 0.05, { type: 'sawtooth', cut: 500, att: 1.0, rel: 1.0, send: 0.7 }); // Somber minor resonance

  to = 's';
  // Chisel striking rock transients
  const chiselTimes = [30.8, 32.2, 33.6, 35.0, 36.2];
  chiselTimes.forEach((ct, idx) => {
    noiseHit(ct, 0.14, 'bandpass', 1600 + idx * 200, 8.0, 0.08, -0.2 + idx * 0.1, 0.4);
    pluck(ct + 0.02, nz('D2'), 0.12, 0.0, 0.6, 800, 0.2); // Stone mass ring
  });
  // Morph 4 Transition (36.7 -> 37.55s)
  sweep(36.7, 37.55, 0.045, 150, 3200, 0.0);

  // -------------------------------------------------------------------
  // SCENE 5 (37.5 - 45.0s): Chola Shiva Nataraja Cosmic Crescendo
  // -------------------------------------------------------------------
  to = 'm';
  // Triumphant full harmonic pad
  pad(37.5, 45.0, ['D3', 'Fs3', 'A3', 'D4', 'Fs4', 'A4'], 0.055, { type: 'sawtooth', cut: 2400, att: 0.5, rel: 1.5, send: 0.5 });
  
  // Rapid Cosmic Tandava Dance Arpeggio
  const danceRhythm = [
    ['D4', 38.0], ['Fs4', 38.5], ['A4', 39.0], ['D5', 39.5],
    ['Fs5', 40.0], ['E5', 40.5], ['D5', 41.0], ['B4', 41.5],
    ['A4', 42.0], ['Fs4', 42.5], ['A4', 43.0], ['D5', 43.5],
    ['Fs5', 44.0], ['A5', 44.4]
  ];
  danceRhythm.forEach(([n, t]) => {
    pluck(t, nz(n), 0.24, 0.15 * Math.sin(t * 4), 0.5, 4800, 0.3);
  });

  to = 's';
  // Damaru Rattle (Rapid double pulses of hourglass drum)
  for (let d = 0; d < 14; d++) {
    const dt = 38.0 + d * 0.45;
    noiseHit(dt, 0.09, 'highpass', 2400, 2.0, 0.04, -0.2);
    noiseHit(dt + 0.08, 0.07, 'highpass', 2800, 2.0, 0.03, 0.2);
  }
  // Morph 5 Transition (44.2 -> 45.05s)
  sweep(44.2, 45.05, 0.04, 800, 4800, 0.0);

  // -------------------------------------------------------------------
  // SCENE 6 (45.0 - 52.5s): Outro Epilogue & Sacred Resolution
  // -------------------------------------------------------------------
  to = 'm';
  // Deep resonance gong and warm resolution pad
  pluck(45.0, nz('D2'), 0.38, 0.0, 3.5, 3200, 0.9);
  pad(45.0, 52.5, ['D3', 'Fs3', 'A3', 'D4'], 0.045, { type: 'sine', cut: 1400, att: 1.0, rel: 2.0, send: 0.6 });
  chime(46.0, [nz('D5'), nz('A5')], 0.2, 0.0);
  chime(49.0, [nz('Fs5')], 0.16, 0.0);

  to = 's';
  sweep(50.5, 52.2, 0.02, 600, 150, 0.0);
