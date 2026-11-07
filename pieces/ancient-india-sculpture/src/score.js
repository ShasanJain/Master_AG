  // =====================================================================
  //  SCORE BODY — Ancient Indian Sculpture (45.0s @ 96 BPM)
  //  Inside buildScore(); generated via WebAudio synthesizer.
  // =====================================================================
  const T = TIMELINE, cu = T.cues;
  
  // 1. Foundational Tanpura Drone (Sa-Pa Tuning: D2, A2, D3, A3)
  to = 'm';
  pad(0.0, 45.0, ['D2', 'A2', 'D3'], 0.045, { type: 'sawtooth', cut: 650, att: 1.5, rel: 2.0 });
  pad(0.0, 45.0, ['D3', 'Fs3', 'A3'], 0.035, { type: 'triangle', cut: 900, att: 2.0, rel: 2.0, send: 0.5 });

  // -------------------------------------------------------------------
  // ERA 0 (0.0 - 9.0s): Indus Terracotta & Lost-Wax Bronze
  // -------------------------------------------------------------------
  to = 'm';
  // Sparse earthen ceramic plucks (Raag Bhupali: D - E - Fs - A - B)
  const indusNotes = [['D3', 0.5], ['Fs3', 1.8], ['A3', 3.0], ['B3', 4.5], ['A3', 6.0], ['Fs3', 7.2]];
  indusNotes.forEach(([n, t]) => {
    pluck(t, nz(n), 0.22, -0.15, 0.8, 1800, 0.4);
  });
  to = 's';
  // Clay crucible clicks & bronze cooling hisses
  for (let i = 0; i < 8; i++) {
    blip(1.0 + i * 0.9, 1200 + (i % 3) * 200, 800, 0.04, 0.025, 0.1 * (i % 2 === 0 ? 1 : -1));
  }
  // Morph 0 Transition (8.0 -> 9.0s)
  sweep(8.0, 9.05, 0.025, 200, 1600, 0.0);

  // -------------------------------------------------------------------
  // ERA 1 (9.0 - 18.0s): Mauryan Polished Sandstone & Royal Bells
  // -------------------------------------------------------------------
  to = 'm';
  // Royal bronze gong on era entrance
  pluck(9.0, nz('D2'), 0.35, 0.0, 2.5, 3200, 0.8);
  pad(9.0, 18.0, ['D3', 'A3', 'D4', 'Fs4'], 0.04, { type: 'sine', cut: 1400, att: 0.8, rel: 0.5, send: 0.4 });
  
  // High temple bell chimes as the 24-spoke Chakra turns
  const bellTimes = [9.5, 11.0, 12.5, 14.0, 15.5, 17.0];
  const bellPitches = ['A4', 'D5', 'Fs5', 'A5', 'Fs5', 'D5'];
  bellTimes.forEach((t, i) => {
    chime(t, nz(bellPitches[i]), 0.18, 1.2);
  });
  to = 's';
  // Rotating wheel whoosh
  sweep(12.0, 14.5, 0.015, 600, 2200, 0.2);
  // Morph 1 Transition (17.0 -> 18.0s)
  sweep(17.0, 18.05, 0.03, 300, 2400, 0.0);

  // -------------------------------------------------------------------
  // ERA 2 (18.0 - 27.0s): Classical Gupta Sublime Serenity
  // -------------------------------------------------------------------
  to = 'm';
  // Singing bowl deep meditation resonance
  pad(18.0, 27.0, ['D3', 'Fs3', 'A3', 'C4', 'E4'], 0.042, { type: 'triangle', cut: 1100, att: 1.2, rel: 0.8, send: 0.6 });
  
  // Gentle meditative melody on Flute/Sitar harmonics
  const guptaMelody = [
    ['Fs4', 19.0], ['A4', 20.2], ['B4', 21.5], ['D5', 22.8],
    ['B4', 24.0], ['A4', 25.2], ['Fs4', 26.2]
  ];
  guptaMelody.forEach(([n, t]) => {
    pluck(t, nz(n), 0.2, 0.1, 1.0, 2800, 0.5);
  });
  to = 's';
  // Serene breathing drone swell
  sub(21.0, 24.0, 73.42, 0.035, { att: 0.8, rel: 0.8 });
  // Morph 2 Transition (26.0 -> 27.0s)
  sweep(26.0, 27.05, 0.035, 250, 1800, 0.0);

  // -------------------------------------------------------------------
  // ERA 3 (27.0 - 36.0s): Elephanta Trimurti Basalt Colossus
  // -------------------------------------------------------------------
  to = 'm';
  // Deep monolithic cavern bass
  sub(27.0, 36.0, 55.0, 0.055, { att: 1.0, rel: 1.0 }); // Low A1 rumble
  pad(27.0, 36.0, ['D2', 'F2', 'A2', 'D3'], 0.05, { type: 'sawtooth', cut: 500, att: 1.0, rel: 1.0, send: 0.7 }); // Somber minor resonance

  to = 's';
  // Chisel striking rock transients
  const chiselTimes = [28.0, 29.5, 31.0, 32.5, 34.0];
  chiselTimes.forEach((ct, idx) => {
    noiseHit(ct, 0.14, 'bandpass', 1600 + idx * 200, 8.0, 0.08, -0.2 + idx * 0.1, 0.4);
    pluck(ct + 0.02, nz('D2'), 0.12, 0.0, 0.6, 800, 0.2); // Stone mass ring
  });
  // Morph 3 Transition (35.0 -> 36.0s)
  sweep(35.0, 36.05, 0.045, 150, 3200, 0.0);

  // -------------------------------------------------------------------
  // ERA 4 (36.0 - 45.0s): Chola Shiva Nataraja Cosmic Crescendo
  // -------------------------------------------------------------------
  to = 'm';
  // Triumphant full harmonic pad
  pad(36.0, 45.0, ['D3', 'Fs3', 'A3', 'D4', 'Fs4', 'A4'], 0.055, { type: 'sawtooth', cut: 2400, att: 0.5, rel: 1.5, send: 0.5 });
  
  // Rapid Cosmic Tandava Dance Arpeggio
  const danceRhythm = [
    ['D4', 36.5], ['Fs4', 37.0], ['A4', 37.5], ['D5', 38.0],
    ['Fs5', 38.5], ['E5', 39.0], ['D5', 39.5], ['B4', 40.0],
    ['A4', 40.5], ['Fs4', 41.0], ['A4', 41.5], ['D5', 42.0],
    ['Fs5', 42.5], ['A5', 43.0], ['D6', 43.5]
  ];
  danceRhythm.forEach(([n, t]) => {
    pluck(t, nz(n), 0.24, 0.15 * Math.sin(t * 4), 0.5, 4800, 0.3);
  });

  to = 's';
  // Damaru Rattle (Rapid double pulses of hourglass drum)
  for (let d = 0; d < 16; d++) {
    const dt = 36.5 + d * 0.45;
    noiseHit(dt, 0.09, 'highpass', 2400, 2.0, 0.04, -0.2);
    noiseHit(dt + 0.08, 0.07, 'highpass', 2800, 2.0, 0.03, 0.2);
  }
  // Ring of fire cymbal shimmer & final gong
  sweep(43.0, 44.8, 0.04, 800, 5000, 0.0);
  pluck(44.0, nz('D2'), 0.4, 0.0, 3.5, 3800, 0.9);
