#!/usr/bin/env node
// =====================================================================
//  skills/animate/tools/produce.mjs
//  Unified End-to-End Autonomous Video Production Orchestrator
//
//  Executes the full production chain in deterministic order:
//    1. Preflight check (ffmpeg, playwright, piece.json)
//    2. Voice & word alignment (voice/script.json -> voice.json via Whisper)
//    3. Single-file build & AST check (build.mjs)
//    4. Strict Text & Layout Verification Gate (textcheck.mjs) [ABORTS ON FAIL]
//    5. Hardware GPU Frame Render & Audio Mux (export.mjs --gpu)
//    6. Automated Key Stills Extraction (hook, mech, reality)
//    7. Dashboard Asset Synchronization (dashboard/public/pieces/<name>/)
//
//  Usage:
//    node tools/produce.mjs pieces/<name> [--gpu] [--skip-voice] [--skip-frames] [--dashboard]
// =====================================================================

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync, execSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const TOOLS_DIR = path.dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = path.resolve(TOOLS_DIR, '..');
const ROOT_DIR = process.cwd();

const argv = process.argv.slice(2);
if (!argv[0] || argv[0].startsWith('--')) {
  console.error('Usage: node skills/animate/tools/produce.mjs pieces/<name> [--gpu] [--skip-voice] [--skip-frames] [--dashboard]');
  process.exit(2);
}

const piecePath = path.resolve(argv[0]);
const pieceName = path.basename(piecePath);
const flag = (name) => argv.includes('--' + name);

console.log(`\n=====================================================================`);
console.log(`  PRODUCE PIPELINE: ${pieceName}`);
console.log(`=====================================================================`);

// 1. Preflight check
if (!fs.existsSync(piecePath)) {
  console.error(`[Error] Piece directory not found: ${piecePath}`);
  process.exit(1);
}

const pieceJsonPath = path.join(piecePath, 'piece.json');
if (!fs.existsSync(pieceJsonPath)) {
  console.error(`[Error] piece.json missing in ${piecePath}`);
  process.exit(1);
}

const pieceMeta = JSON.parse(fs.readFileSync(pieceJsonPath, 'utf8'));
const tStart = Date.now();

// 2. Voice & Whisper Timings
const scriptJsonPath = path.join(piecePath, 'voice', 'script.json');
const voiceJsonPath = path.join(piecePath, 'voice.json');

if (!flag('skip-voice') && fs.existsSync(scriptJsonPath)) {
  console.log(`\n[Stage 1/6] Voice Generation & Word Alignment...`);
  const voiceTool = path.join(TOOLS_DIR, 'voice.mjs');
  const res = spawnSync(process.execPath, [voiceTool, piecePath], { stdio: 'inherit' });
  if (res.status !== 0) {
    console.error('[Error] Voice generation failed.');
    process.exit(res.status || 1);
  }
} else {
  console.log(`\n[Stage 1/6] Voice check: skipping (${fs.existsSync(voiceJsonPath) ? 'voice.json present' : 'no script.json'}).`);
}

// 3. Bundle Compilation (build.mjs)
console.log(`\n[Stage 2/6] Compiling single-file index.html...`);
const buildTool = path.join(TOOLS_DIR, 'build.mjs');
const buildRes = spawnSync(process.execPath, [buildTool, piecePath], { stdio: 'inherit' });
if (buildRes.status !== 0) {
  console.error('[Error] Build failed.');
  process.exit(buildRes.status || 1);
}

// 4. Strict Quality Gate (textcheck.mjs)
console.log(`\n[Stage 3/6] Running Strict Quality Gate (textcheck)...`);
const { chromium } = await (async () => {
  try {
    const { createRequire } = await import('node:module');
    const req = createRequire(import.meta.url);
    return req('playwright');
  } catch {
    const root = execSync('npm root -g').toString().trim();
    const { createRequire } = await import('node:module');
    const req = createRequire(import.meta.url);
    return req(path.join(root, 'playwright'));
  }
})();

const { textCheck, printTextCheck } = await import('./textcheck.mjs');

const browser = await chromium.launch();
const page = await browser.newPage();
const indexUrl = pathToFileURL(path.join(piecePath, 'index.html')).href + '?export=1';
await page.goto(indexUrl);
await page.waitForFunction(() => typeof window.renderFrame === 'function' && window.TIMELINE);

const safe = await page.evaluate(() => (window.TIMELINE.height > window.TIMELINE.width ? window.TIMELINE.safe || { top: 240, bottom: 420, right: 140 } : null));
const ignore = pieceMeta.review?.textIgnore || [];
const tcData = await textCheck(page, { safe });
await browser.close();

const passed = printTextCheck(tcData, ignore);

if (!passed) {
  console.error(`\n[STRICT QUALITY GATE REJECTED] Found layout collisions/overflows. Aborting render.`);
  process.exit(1);
}
console.log(`[STRICT QUALITY GATE PASSED] 0 critical layout errors.`);

// 5. Hardware GPU Render & Export
console.log(`\n[Stage 4/6] GPU Frame Rasterization & Audio Mux...`);
const exportTool = path.join(TOOLS_DIR, 'export.mjs');
const exportArgs = [exportTool, piecePath, '--gpu'];
if (flag('skip-frames')) exportArgs.push('--skip-frames');

const exportRes = spawnSync(process.execPath, exportArgs, { stdio: 'inherit' });
if (exportRes.status !== 0) {
  console.error('[Error] Export failed.');
  process.exit(exportRes.status || 1);
}

// 6. Automated Key Stills Extraction
console.log(`\n[Stage 5/6] Extracting Key Stills...`);
const stillTool = path.join(TOOLS_DIR, 'still.mjs');
const rendersDir = path.join(piecePath, 'renders');
fs.mkdirSync(rendersDir, { recursive: true });

// Check duration from voice.json or default 15s
let dur = 15.0;
if (fs.existsSync(voiceJsonPath)) {
  const vj = JSON.parse(fs.readFileSync(voiceJsonPath, 'utf8'));
  dur = vj.total || 15.0;
}

const tHook = (dur * 0.16).toFixed(2);
const tMech = (dur * 0.50).toFixed(2);
const tReality = (dur * 0.85).toFixed(2);

spawnSync(process.execPath, [stillTool, piecePath, tHook, path.join(rendersDir, 'still_01_hook.png')], { stdio: 'inherit' });
spawnSync(process.execPath, [stillTool, piecePath, tMech, path.join(rendersDir, 'still_02_mech.png')], { stdio: 'inherit' });
spawnSync(process.execPath, [stillTool, piecePath, tReality, path.join(rendersDir, 'still_03_reality.png')], { stdio: 'inherit' });

// 7. Dashboard Asset Synchronization (Opt-in or default when --dashboard set)
if (flag('dashboard') || true) {
  console.log(`\n[Stage 6/6] Syncing assets to Jack Dashboard...`);
  const dstLocal = path.join(ROOT_DIR, 'dashboard', 'public', 'pieces', pieceName);
  const dstCore = path.join(ROOT_DIR, '..', 'Master_AG_Core', 'dashboard', 'public', 'pieces', pieceName);

  fs.mkdirSync(dstLocal, { recursive: true });
  try { fs.mkdirSync(dstCore, { recursive: true }); } catch {}

  const filesToCopy = ['final-captions.mp4', 'still_01_hook.png', 'still_02_mech.png', 'still_03_reality.png'];
  for (const f of filesToCopy) {
    const s = path.join(rendersDir, f);
    if (fs.existsSync(s)) {
      fs.copyFileSync(s, path.join(dstLocal, f));
      try { fs.copyFileSync(s, path.join(dstCore, f)); } catch {}
    }
  }
  console.log(`Assets synced to http://localhost:3000/pieces/${pieceName}/`);
}

const elapsedSec = ((Date.now() - tStart) / 1000).toFixed(1);
console.log(`\n=====================================================================`);
console.log(`  PRODUCTION COMPLETE: ${pieceName} in ${elapsedSec}s`);
console.log(`  Output: ${path.join(rendersDir, 'final-captions.mp4')}`);
console.log(`=====================================================================\n`);
