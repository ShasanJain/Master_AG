const fs = require('fs');
const h = fs.readFileSync('scratch/demo_3d_site/index.html', 'utf8');

const checks = [
    ['Duck removed',             !h.includes('Duck.glb')],
    ['Avocado removed',          !h.includes('Avocado.glb')],
    ['modelsLoaded===1',          h.includes('modelsLoaded === 1')],
    ['PHOENIX_MODES array',       h.includes('PHOENIX_MODES')],
    ['Ember mode',                h.includes('Ember')],
    ['Ice mode',                  h.includes('Ice Mode')],
    ['Solar mode',                h.includes('Solar Mode')],
    ['Void mode',                 h.includes('Void Mode')],
    ['applyPhoenixMode fn',       h.includes('function applyPhoenixMode')],
    ['Spirit btn cycles mode',    h.includes('phoenixModeIndex')],
    ['spawnRipple fn',            h.includes('function spawnRipple')],
    ['Card spotlight follow',     h.includes('radial-gradient(circle 200px')],
    ['Card magnetic tilt',        h.includes('rotateX')],
    ['Nav ripple on click',       h.includes("querySelectorAll('.nav-link, .btn-pill')")],
    ['Phoenix scroll rotation',   h.includes('Math.PI * 0.8')],
    ['Mouse parallax enhanced',   h.includes('nx * 0.18')],
    ['Phoenix burst on mode change', h.includes('elastic.out')],
    ['Grid color per mode',       h.includes('uColorA.value')],
];

let p = 0, f = 0;
checks.forEach(([name, val]) => {
    console.log((val ? 'PASS' : 'FAIL') + '  ' + name);
    val ? p++ : f++;
});
console.log('\n' + p + '/' + checks.length + ' passed, ' + f + ' failed');
