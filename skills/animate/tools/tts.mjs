#!/usr/bin/env node
// Native neural TTS synthesis for animate pieces.
//   usage: node tools/tts.mjs pieces/<name> [--voice en-US-ChristopherNeural] [--rate +6%] [--pitch -1Hz]
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
if (!argv[0] || argv[0].startsWith('--')) {
  console.error('usage: node tools/tts.mjs pieces/<name> [--voice en-US-ChristopherNeural] [--rate +6%] [--pitch -1Hz]');
  process.exit(2);
}

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(argv[0]);
const VDIR = path.join(ROOT, 'voice');
const SCRIPT_PATH = path.join(VDIR, 'script.json');

if (!fs.existsSync(SCRIPT_PATH)) {
  console.error(`Error: "${SCRIPT_PATH}" not found. Create script.json first.`);
  process.exit(1);
}

const S = JSON.parse(fs.readFileSync(SCRIPT_PATH, 'utf8'));
const VOICE = opt('--voice', 'en-US-ChristopherNeural');
const RATE = opt('--rate', '+6%');
const PITCH = opt('--pitch', '-1Hz');

console.log(`Generating neural TTS takes for ${path.basename(ROOT)} (voice: ${VOICE}, rate: ${RATE}, pitch: ${PITCH})...`);

const pyScript = `
import asyncio
import os
import json
import sys
import edge_tts

script_path = sys.argv[1]
vdir = os.path.dirname(script_path)
voice = sys.argv[2]
rate = sys.argv[3]
pitch = sys.argv[4]

with open(script_path, 'r', encoding='utf-8') as f:
    S = json.load(f)

async def main():
    for i, line in enumerate(S.get('lines', [])):
        lid = line.get('id', f'l{i+1}')
        fname = line.get('file', f'{lid}.mp3')
        fpath = os.path.join(vdir, fname)
        text = line.get('text', '')
        if not text:
            continue
        print(f"  generating {fname}...")
        comm = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
        await comm.save(fpath)

asyncio.run(main())
`;

const res = spawnSync(process.platform === 'win32' ? 'python' : 'python3', ['-c', pyScript, SCRIPT_PATH, VOICE, RATE, PITCH], { stdio: 'inherit' });
if (res.status !== 0) {
  console.error('TTS synthesis failed.');
  process.exit(1);
}

console.log('Synthesized all takes. Now running tools/voice.mjs to align timeline...');
const voiceRes = spawnSync('node', [path.join(HERE, 'voice.mjs'), argv[0]], { stdio: 'inherit' });
if (voiceRes.status !== 0) {
  console.error('voice.mjs alignment failed.');
  process.exit(1);
}

console.log(`TTS generation and timeline alignment complete for ${path.basename(ROOT)}!`);
