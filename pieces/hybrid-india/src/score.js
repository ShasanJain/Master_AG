// =====================================================================
//  SCORE — Procedural Score & Foley for Hybrid Vehicles in India
// =====================================================================

// 1. Warm Archival Pad Bed
pad(0.0, 45.0, ['D2', 'A2', 'D3'], 0.045, { type: 'sawtooth', cut: 550, att: 1.5, rel: 2.0 });

// 2. Era Transition Chimes
chime(0.5, [nz('D4'), nz('A4')], 0.22, -0.1);
chime(11.0, [nz('F4'), nz('C5')], 0.22, 0.1);
chime(23.0, [nz('A4'), nz('E5')], 0.25, -0.1);
chime(34.0, [nz('D5'), nz('A5'), nz('D6')], 0.28, 0.0);

// 3. Tactile Crosshatch Foley Layer (Pen Scratches, Relays, and Sonar Pings)
// Era 1: The Tax Paradox
foleyPaper(0.3, { type: 'slide', vel: 0.5 });
foleyInk(0.8, { vel: 0.55 });
foleyPaper(5.0, { type: 'thud', vel: 0.7 }); // Gavel weight drop

// Era 2: Powertrain Mechanical Whir
foleyRelay(11.2, { vel: 0.65 });
foleyPing(16.5, { f: 880, vel: 0.45 }); // Mileage lock
foleyPencil(17.0, { dur: 0.35, vel: 0.5 });

// Era 3: 1,000 KM Compass & Highway Click
foleyRelay(23.2, { vel: 0.6 });
foleyPing(28.5, { f: 1174.66, vel: 0.5 }); // 1,000 km threshold
foleyPaper(30.0, { type: 'snip', vel: 0.65 }); // Crossed out charger

// Era 4: Triumph & Resolution
foleyRelay(34.2, { vel: 0.7 });
foleyInk(38.0, { vel: 0.6 });
foleyPaper(40.0, { type: 'thud', vel: 0.75 });
