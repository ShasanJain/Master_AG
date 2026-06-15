const fs = require('fs');
const html = fs.readFileSync('scratch/demo_3d_site/index.html', 'utf8');
const inject = fs.readFileSync('scratch/demo_3d_site/_inject.js', 'utf8');

// Find the INIT comment block and insert before it
const marker = '    initWebGL();\n    // Dark transition runs after WebGL + scroll setup are done\n    // Slight delay to let ScrollTrigger register all triggers first\n    setTimeout(setupDarkTransition, 400);';
const replacement = '    ' + inject.split('\n').join('\n    ') + '\n\n    initWebGL();\n    setTimeout(setupDarkTransition, 400);';

if (!html.includes(marker)) {
    console.error('MARKER NOT FOUND — check the exact text');
    process.exit(1);
}

const result = html.replace(marker, replacement);
fs.writeFileSync('scratch/demo_3d_site/index.html', result, 'utf8');
console.log('Injected successfully. New size:', result.length, 'bytes');
