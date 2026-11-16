#!/usr/bin/env node
// Scaffold a brand-new animation piece with clean boilerplate across all 6 files.
//   usage: node tools/new.mjs pieces/<name> [--style cut-paper] [--duration 45] [--title "Piece Title"]
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
if (!argv[0] || argv[0].startsWith('--')) {
  console.error('usage: node tools/new.mjs pieces/<name> [--style cut-paper] [--duration 45] [--title "Piece Title"]');
  process.exit(2);
}

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(argv[0]);
const NAME = path.basename(ROOT);
const STYLE = opt('--style', 'cut-paper');
const DURATION = parseFloat(opt('--duration', '45.0'));
const TITLE = opt('--title', NAME.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()));
const FPS = 24, BPM = 96, NFRAMES = Math.round(DURATION * FPS);

if (fs.existsSync(ROOT)) {
  console.error(`Error: directory "${ROOT}" already exists.`);
  process.exit(1);
}

const STYLES_DIR = path.resolve(HERE, '..', 'styles');
if (!fs.existsSync(path.join(STYLES_DIR, STYLE))) {
  console.error(`Warning: style "${STYLE}" not found in styles/. Defaulting to cut-paper.`);
}

fs.mkdirSync(path.join(ROOT, 'src'), { recursive: true });

// 1. piece.json
const pieceJson = {
  name: NAME,
  title: TITLE,
  format: { width: 1080, height: 1920, fps: FPS, bpm: BPM, duration: DURATION, frames: NFRAMES },
  storyFormat: "morph chain (3 acts)",
  style: STYLE,
  review: { safe: { top: 240, bottom: 420, right: 140 }, refs: {} }
};
fs.writeFileSync(path.join(ROOT, 'piece.json'), JSON.stringify(pieceJson, null, 2) + '\n');

// 2. brief.md
const briefMd = `# ${TITLE}\n\n## Overview\nA ${DURATION}s 9:16 vertical procedural animation in the ${STYLE} style.\n`;
fs.writeFileSync(path.join(ROOT, 'brief.md'), briefMd);

// 3. LOG.md
const logMd = `# Development Log: ${TITLE}\n\n- ${new Date().toISOString().slice(0, 10)}: Scaffolded piece with tools/new.mjs.\n`;
fs.writeFileSync(path.join(ROOT, 'LOG.md'), logMd);

// 4. src/head.html
const d3 = (DURATION / 3).toFixed(2);
const d23 = (DURATION * 2 / 3).toFixed(2);
const headHtml = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${TITLE}</title>
<style>
  html, body { margin: 0; height: 100%; background: #111; overflow: hidden; }
  body { display: flex; align-items: center; justify-content: center; }
  canvas { height: min(100vh, calc(100vw * 16 / 9)); width: auto; aspect-ratio: 9 / 16; display: block; cursor: pointer; }
</style>
</head>
<body>
<canvas id="c" width="1080" height="1920"></canvas>
<script>
"use strict";
const FPS = ${FPS}, W = 1080, H = 1920;
const BPM = ${BPM}, BEAT = 60 / BPM, E8 = BEAT / 2, E16 = BEAT / 4;
const DURATION = ${DURATION.toFixed(1)};
const NFRAMES = Math.round(DURATION * FPS);
const LOOP_T = NFRAMES / FPS;
const SAFE = { top: 240, bottom: 420, right: 140 };
const CX = 540, CY = 960;
const HAND = '"Ink Free", "Segoe Print", "Bradley Hand", cursive';

const ERA_LIST = [
  [0.0, ${d3}, () => sceneAct1()],
  [${d3}, ${d23}, () => sceneAct2()],
  [${d23}, ${DURATION.toFixed(1)}, () => sceneAct3()]
];

const SHOTS = [
  ['act1', 0, 0.0, ${d3}, 'Act 1: Genesis'],
  ['act2', 1, ${d3}, ${d23}, 'Act 2: Metamorphosis'],
  ['act3', 2, ${d23}, ${DURATION.toFixed(1)}, 'Act 3: Resolution']
];

const TIMELINE = {
  width: W, height: H, fps: FPS, bpm: BPM, duration: DURATION, frames: NFRAMES, loop: LOOP_T, safe: SAFE,
  format: 'morph-chain',
  shots: SHOTS.map(([key, era, t0, t1, title], i) => ({ id: i + 1, key, era, t0, t1, title })),
  cuts: [],
  morphs: [${d3}, ${d23}],
  cues: {},
  acts: [
    { name: 'Act 1', role: 'intro', t0: 0.0, t1: ${d3} },
    { name: 'Act 2', role: 'core', t0: ${d3}, t1: ${d23} },
    { name: 'Act 3', role: 'coda', t0: ${d23}, t1: ${DURATION.toFixed(1)} }
  ],
  narration: []
};
window.TIMELINE = TIMELINE;
`;
fs.writeFileSync(path.join(ROOT, 'src', 'head.html'), headHtml);

// 5. src/bridges.js
const bridgesJs = `// Bridges and camera definitions
const ERA_BG = ['#1a2035', '#2a1820', '#182520'];

function pieceCam(era, t) {
  return push(t, 0.5, DURATION - 0.5, { z: 1.05, p: [540, 960], to: [540, 940] });
}

const BRIDGES = [
  {
    tc: ${d3},
    A: () => ({ P: ellipsePts(540, 960, 200, 200, 0, 32), c: PAL.yellow || '#f6cf55' }),
    B: () => ({ P: ellipsePts(540, 960, 220, 220, 0, 32), c: PAL.orange || '#ec7a4f' })
  },
  {
    tc: ${d23},
    A: () => ({ P: ellipsePts(540, 960, 220, 220, 0, 32), c: PAL.orange || '#ec7a4f' }),
    B: () => ({ P: ellipsePts(540, 960, 200, 200, 0, 32), c: PAL.teal || '#3f9f9a' })
  }
];
`;
fs.writeFileSync(path.join(ROOT, 'src', 'bridges.js'), bridgesJs);

// 6. src/scenes.js
const scenesJs = `// Scene implementations
function sceneAct1() {
  const t = seg(TT, 0.0, ${d3});
  cut(rect(-30, -30, W + 60, H + 60, 0), PAL.navy || '#26315f', { key: 'bg1', shadow: false });
  cut(ellipsePts(CX, CY, 180, 180, 0, 32), PAL.yellow || '#f6cf55', { key: 'core1' });
  yearTag('Act 1: Genesis');
  capStrip('The Beginning of Form');
}

function sceneAct2() {
  const t = seg(TT, ${d3}, ${d23});
  cut(rect(-30, -30, W + 60, H + 60, 0), PAL.wood || '#c08048', { key: 'bg2', shadow: false });
  cut(ellipsePts(CX, CY, 200, 200, 0, 32), PAL.orange || '#ec7a4f', { key: 'core2' });
  yearTag('Act 2: Evolution');
  capStrip('Transformation across Time');
}

function sceneAct3() {
  const t = seg(TT, ${d23}, ${DURATION.toFixed(1)});
  cut(rect(-30, -30, W + 60, H + 60, 0), PAL.lamp || '#2f7a5c', { key: 'bg3', shadow: false });
  cut(ellipsePts(CX, CY, 180, 180, 0, 32), PAL.teal || '#3f9f9a', { key: 'core3' });
  yearTag('Act 3: Epilogue');
  capStrip('Harmony and Resolution');
}
`;
fs.writeFileSync(path.join(ROOT, 'src', 'scenes.js'), scenesJs);

// 7. src/score.js
const scoreJs = `  // Procedural score
  pad(0.0, ${DURATION.toFixed(1)}, ['D2', 'A2', 'D3'], 0.04, { type: 'sawtooth', cut: 600, att: 1.0, rel: 1.5 });
  chime(0.5, [nz('D5')], 0.2, 0.0);
  chime(${d3}, [nz('A5')], 0.2, 0.0);
  chime(${d23}, [nz('D6')], 0.2, 0.0);
`;
fs.writeFileSync(path.join(ROOT, 'src', 'score.js'), scoreJs);

console.log(`Scaffolded piece "${NAME}" at ${ROOT}`);

// Verify with build.mjs
const buildTool = path.join(HERE, 'build.mjs');
const res = spawnSync('node', [buildTool, argv[0]], { stdio: 'inherit' });
if (res.status === 0) {
  console.log(`Verification: "${NAME}" compiled cleanly!`);
} else {
  console.error(`Build verification failed.`);
  process.exit(1);
}
