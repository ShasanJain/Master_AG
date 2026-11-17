  // Procedural score
  pad(0.0, 15.0, ['D2', 'A2', 'D3'], 0.04, { type: 'sawtooth', cut: 600, att: 1.0, rel: 1.5 });
  chime(0.5, [nz('D5')], 0.2, 0.0);
  chime(5.00, [nz('A5')], 0.2, 0.0);
  chime(10.00, [nz('D6')], 0.2, 0.0);

  // Tactile Foley layer (cut-paper style)
  foleyPaper(0.2, { type: 'slide', vel: 0.5 });
  foleyPaper(0.5, { type: 'thud', vel: 0.6 });
  foleyPaper(5.0, { type: 'snip', vel: 0.7 });
  foleyPaper(10.0, { type: 'thud', vel: 0.75 });
