// =====================================================================
//  ERAS, RESOLUTIONS, BRIDGES — abs-pixel
//  Native 270x480 resolution (4x nearest-neighbor integer scaling to 1080x1920)
// =====================================================================
const ERA_BG = [PAL16.night, PAL16.ink, PAL16.night];
const ERA_RES = [[270, 480], [270, 480], [270, 480]];
const ERA_POST = [
  { pal: PAL16, scan: 0.15 },
  { pal: PAL16, scan: 0.15 },
  { pal: PAL16, scan: 0.18, vignette: 0.3 }
];

function pieceCam() { return null; }

const BRIDGES = [
  {
    tc: 5.57,
    A: () => ({ P: ellipsePts(540, 920, 180, 180, 0, 48), c: PAL16.yellow }),
    B: () => ({ P: ellipsePts(540, 920, 190, 190, 0, 48), c: PAL16.lime })
  },
  {
    tc: 11.13,
    A: () => ({ P: ellipsePts(540, 920, 190, 190, 0, 48), c: PAL16.lime }),
    B: () => ({ P: ellipsePts(540, 920, 180, 180, 0, 48), c: PAL16.red })
  }
];
