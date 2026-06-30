const fs = require('fs');
const h = fs.readFileSync('scratch/demo_3d_site/index.html', 'utf8');
const m = h.match(/<script>([\s\S]*?initWebGL\(\);[\s\S]*?)<\/script>/);
try { new Function(m[1]); console.log('SYNTAX OK'); } catch(e) { console.error('SYNTAX ERROR:', e.message); process.exit(1); }

const checks = [
  ['bg-spotlight in HTML',   h.includes('id="bg-spotlight"')],
  ['sand-canvas in HTML',    h.includes('id="sand-canvas"')],
  ['bg-spotlight CSS',       h.includes('#bg-spotlight')],
  ['sand-canvas CSS',        h.includes('#sand-canvas')],
  ['bgSpotlightInit IIFE',   h.includes('bgSpotlightInit')],
  ['sandInit IIFE',          h.includes('sandInit')],
  ['newGrain function',      h.includes('function newGrain')],
  ['spawnBudget scaling',    h.includes('spawnBudget')],
  ['gravity 0.055',          h.includes('0.055')],
  ['lerp bg loop 0.07',      h.includes('* 0.07')],
  ['sandy palette rgb',      h.includes('215, 190, 130')],
  ['z-index 994 canvas',     h.includes('z-index: 994')],
  ['z-index 2 spotlight',    h.includes('z-index: 2')],
  ['card-glow purple',       h.includes('147,120,230')],
  ['ripple 40px',            h.includes('width: 40px')],
];

let p=0,f=0;
checks.forEach(([n,v]) => { console.log((v?'PASS':'FAIL'), n); v?p++:f++; });
console.log('\n'+p+'/'+checks.length+' passed'+(f?' — '+f+' FAILED':' — ALL GOOD'));
