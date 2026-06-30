const fs = require('fs');
const html = fs.readFileSync('scratch/demo_3d_site/index.html', 'utf8');

const checks = [
  { name: 'Three.js r128 CDN', pass: html.includes('three.js/r128/three.min.js') },
  { name: 'GLTFLoader 0.128 CDN', pass: html.includes('three@0.128.0/examples/js/loaders/GLTFLoader.js') },
  { name: 'GSAP CDN', pass: html.includes('gsap/3.12.2/gsap.min.js') },
  { name: 'ScrollTrigger CDN', pass: html.includes('ScrollTrigger.min.js') },
  { name: 'Preloader element', pass: html.includes('id="preloader"') },
  { name: 'Canvas container', pass: html.includes('id="canvas-container"') },
  { name: 'Hero H1', pass: html.includes('hero-h1') },
  { name: 'Section 2', pass: html.includes('id="section-2"') },
  { name: 'Section 3 dark trigger', pass: html.includes('id="section-3"') },
  { name: 'Section 4 CTA', pass: html.includes('id="section-4"') },
  { name: 'Footer', pass: html.includes('id="footer"') },
  { name: 'Spirit button', pass: html.includes('id="spirit-btn"') },
  { name: 'Audio toggle', pass: html.includes('id="audio-toggle"') },
  { name: 'Dark mode CSS (body.dark)', pass: html.includes('body.dark') },
  { name: 'Theme progress bar', pass: html.includes('theme-indicator') },
  { name: 'Glass card CSS', pass: html.includes('.glass-card') },
  { name: 'initWebGL function', pass: html.includes('function initWebGL') },
  { name: 'buildParticles function', pass: html.includes('function buildParticles') },
  { name: 'buildPhoenix function', pass: html.includes('function buildPhoenix') },
  { name: 'setupScroll function', pass: html.includes('function setupScroll') },
  { name: 'setupDarkTransition function', pass: html.includes('function setupDarkTransition') },
  { name: 'renderLoop function', pass: html.includes('function renderLoop') },
  { name: 'startScene function', pass: html.includes('function startScene') },
  { name: '7s timeout safety net', pass: html.includes('7000') },
  { name: 'CapsuleGeometry removed (r128 compat)', pass: !html.includes('CapsuleGeometry') },
  { name: 'CylinderGeometry used', pass: html.includes('CylinderGeometry') },
  { name: 'Avocado GLB URL', pass: html.includes('Avocado.glb') },
  { name: 'Duck GLB URL', pass: html.includes('Duck.glb') },
  { name: 'Phoenix procedural fallback', pass: html.includes('buildPhoenix') },
  { name: 'CatmullRom camera spline', pass: html.includes('CatmullRomCurve3') },
  { name: 'Scroll dark at section-3', pass: html.includes("trigger: '#section-3'") },
  { name: 'Dark class add', pass: html.includes("classList.add('dark')") },
  { name: 'Grid color tween on dark', pass: html.includes('uColorA.value') },
];

let pass = 0, fail = 0;
checks.forEach(c => {
  const icon = c.pass ? '✓' : '✗';
  console.log(icon + ' ' + c.name);
  if (c.pass) pass++; else fail++;
});
console.log('\n' + pass + '/' + checks.length + ' checks passed, ' + fail + ' failed');
