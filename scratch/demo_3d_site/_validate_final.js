const fs = require('fs');
const h = fs.readFileSync('scratch/demo_3d_site/index.html', 'utf8');

const checks = [
  // CDN
  ['Three.js r128',              h.includes('three.js/r128/three.min.js')],
  ['GLTFLoader 0.128',           h.includes('three@0.128.0/examples/js/loaders/GLTFLoader.js')],
  ['GSAP 3.12.2',                h.includes('gsap/3.12.2/gsap.min.js')],
  ['ScrollTrigger 3.12.2',       h.includes('ScrollTrigger.min.js')],
  // Structure
  ['Preloader',                  h.includes('id="preloader"')],
  ['Canvas div',                 h.includes('id="canvas"')],
  ['Progress bar',               h.includes('id="progress-bar"')],
  ['Hero H1',                    h.includes('hero-h1')],
  ['Sections s2/s3/s4',          h.includes('id="s2"') && h.includes('id="s3"') && h.includes('id="s4"')],
  ['Footer',                     h.includes('id="footer"')],
  ['Mode button',                h.includes('id="mode-btn"')],
  ['Audio button',               h.includes('id="audio-btn"')],
  // CSS
  ['Dark mode vars',             h.includes('body.dark')],
  ['Glass card ::before spot',   h.includes('--cx') && h.includes('--cy')],
  ['Glass card ::after border',  h.includes('glass-card::after')],
  ['Mode btn ::before border',   h.includes('mode-btn::before')],
  ['Mode btn ::after hover',     h.includes('mode-btn::after')],
  ['Global ripple class',        h.includes('.g-ripple')],
  ['Reveal animation',           h.includes('.reveal.on')],
  // JS functions
  ['initWebGL',                  h.includes('function initWebGL')],
  ['buildCrystal',               h.includes('function buildCrystal')],
  ['applyCrystalMode',           h.includes('function applyCrystalMode')],
  ['buildParticles',             h.includes('function buildParticles')],
  ['buildGrid',                  h.includes('function buildGrid')],
  ['setupScroll',                h.includes('function setupScroll')],
  ['renderLoop',                 h.includes('function renderLoop')],
  ['spawnRipple',                h.includes('function spawnRipple')],
  // Correctness
  ['Camera via self.progress',   h.includes('self.progress') && !h.includes('_gsap')],
  ['No _gsap hack',              !h.includes('_gsap')],
  ['No clock.getDelta double',   (h.match(/clock\.getDelta/g)||[]).length === 0],
  ['4 crystal modes',            h.includes("'Crystal Mode'") && h.includes("'Ember Mode'") && h.includes("'Solar Mode'") && h.includes("'Void Mode'")],
  ['Elastic burst on mode',      h.includes('elastic.out')],
  ['Dark toggle in setupScroll', h.includes('classList.add') && h.includes('isDark')],
  ['No overflow on mode-btn',    !h.includes('#mode-btn {\n    overflow')],
  ['No wrapper div for border',  !h.includes('mode-btn-wrap')],
  ['CSS custom props spotlight', h.includes("style.setProperty('--cx'")],
  ['Magnetic tilt via GSAP',     h.includes('rotateX') && h.includes('rotateY')],
  ['Ripple: viewport-fixed',     h.includes("position: fixed") && h.includes('g-ripple')],
  ['No duck/avocado',            !h.includes('Duck.glb') && !h.includes('Avocado.glb')],
  ['IcosahedronGeometry',        h.includes('IcosahedronGeometry')],
  ['CatmullRomCurve3',           h.includes('CatmullRomCurve3')],
  ['AdditiveBlending particles', h.includes('AdditiveBlending')],
  ['Grid GLSL shader',           h.includes('uColorA') && h.includes('uColorB')],
];

let pass = 0, fail = 0;
checks.forEach(([name, val]) => {
  console.log((val ? '✓' : '✗') + '  ' + name);
  val ? pass++ : fail++;
});
console.log('\n' + pass + '/' + checks.length + ' passed' + (fail ? ' — ' + fail + ' FAILED' : ' — ALL GOOD'));
