// =====================================================================
//  BRIDGES — Era-to-Era Shape Morphs for Hybrid Vehicles in India
// =====================================================================

const ERA_BG = ['#f4ecd9', '#1d1916', '#f4ecd9', '#f4ecd9'];

const BRIDGES = [
  {
    tc: 9.7,
    d: 0.5,
    m: 0.18,
    A: () => ({ P: rrectPts(CX - 85, 880 - 140, 170, 125, 16), c: C.roseD }),
    B: () => ({ P: ellipsePts(CX, 800, 180, 180, 0, 48), c: '#2a221b' })
  },
  {
    tc: 21.5,
    d: 0.5,
    m: 0.18,
    A: () => ({ P: ellipsePts(CX, 800, 180, 180, 0, 48), c: '#2a221b' }),
    B: () => ({ P: ellipsePts(CX, 790, 260, 260, 0, 64), c: '#241a12' })
  },
  {
    tc: 33.3,
    d: 0.5,
    m: 0.18,
    A: () => ({ P: ellipsePts(CX, 790, 260, 260, 0, 64), c: '#241a12' }),
    B: () => ({ P: rrectPts(CX - 240, 620, 480, 500, 32), c: '#221812' })
  }
];

function pieceCam(era, t) {
  // Gentle handheld camera float
  return null;
}
