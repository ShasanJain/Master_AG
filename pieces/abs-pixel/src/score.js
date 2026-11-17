  // Procedural score
  pad(0.0, 16.7, ['D2', 'A2', 'D3'], 0.04, { type: 'sawtooth', cut: 600, att: 1.0, rel: 1.5 });
  chime(0.5, [nz('D5')], 0.2, 0.0);
  chime(5.57, [nz('A5')], 0.2, 0.0);
  chime(11.13, [nz('D6')], 0.2, 0.0);

  // 8-bit Retro Foley (pixel style)
  foleyBit(0.3, { type: 'coin', vel: 0.65 });
  foleyBit(5.57, { type: 'laser', vel: 0.6 });
  foleyBit(11.13, { type: 'hit', vel: 0.75 });
