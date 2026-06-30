const fs = require('fs');
const html = fs.readFileSync('scratch/demo_3d_site/index.html', 'utf8');

// Extract the main script block
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) { console.log('No script block found!'); process.exit(1); }

const script = scriptMatch[1];
console.log('Script length:', script.length, 'chars');

// Check for key patterns
const checks = [
  ['gsap.registerPlugin', script.includes('gsap.registerPlugin')],
  ['new THREE.Vector3 at top level', script.includes('let targetPos = new THREE.Vector3')],
  ['RingGeometry defined in buildCrystal', script.includes('RingGeometry')],
  ['halo name guard exists', script.includes("name === 'halo'")],
  ['initWebGL defined', script.includes('function initWebGL')],
  ['initWebGL called at boot', script.includes('initWebGL();')],
  ['buildCrystal defined', script.includes('function buildCrystal')],
  ['renderLoop defined', script.includes('function renderLoop')],
  ['preloader dismiss', script.includes("classList.add('done')")],
  ['debug-toggle.on added', script.includes("classList.add('on')")],
  ['applyTimeline defined', script.includes('function applyTimeline')],
  ['sand canvas tick', script.includes('function tick()')],
];

checks.forEach(([name, result]) => {
  console.log((result ? '[OK]' : '[!!] MISSING:') + ' ' + name);
});

// Count keyframes
const kfMatch = html.match(/let keyframes\s*=\s*(\[[\s\S]*?\]);/);
if (kfMatch) {
  try {
    const kf = JSON.parse(kfMatch[1]);
    console.log('[OK] Keyframes: ' + kf.length + ' frames (scroll 0 to ' + kf[kf.length-1].scroll + ')');
  } catch(e) {
    console.log('[!!] Keyframes JSON parse error:', e.message);
  }
} else {
  console.log('[!!] Keyframes array NOT FOUND');
}

// Check for RingGeometry crash pattern (emissive access without guard)
const traverseBlocks = script.split('crystalGroup.traverse');
console.log('\nTraverse blocks found:', traverseBlocks.length - 1);
traverseBlocks.slice(1).forEach((block, i) => {
  const snippet = block.substring(0, 400);
  const hasHaloGuard = snippet.includes("name === 'halo'");
  const hasEmissiveCopy = snippet.includes('.emissive.copy(');
  console.log('  Traverse #' + (i+1) + ': halo-guard=' + hasHaloGuard + ' emissive.copy=' + hasEmissiveCopy);
  if (!hasHaloGuard && hasEmissiveCopy) {
    console.log('  !! CRASH RISK: emissive.copy without halo guard in traverse #' + (i+1));
  }
});

console.log('\nDone.');
