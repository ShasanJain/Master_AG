  // Procedural score
  pad(0.0, 16.7, ['D2', 'A2', 'D3'], 0.04, { type: 'sawtooth', cut: 600, att: 1.0, rel: 1.5 });
  chime(0.5, [nz('D5')], 0.2, 0.0);
  chime(5.57, [nz('A5')], 0.2, 0.0);
  chime(11.13, [nz('D6')], 0.2, 0.0);

  // Technical Sonar / Metric Foley (math style)
  foleyPing(0.5, { f: 880, vel: 0.5 });
  foleyPing(5.57, { f: 1174.66, vel: 0.55 });
  foleyPing(11.13, { f: 587.33, vel: 0.6 });
