// Audit all getElementById calls in setupScroll and find any IDs that don't exist in the HTML
const fs = require('fs');
const html = fs.readFileSync('scratch/demo_3d_site/index.html', 'utf8');

// Extract IDs defined in HTML
const htmlIds = new Set();
const idRe = /\bid="([^"]+)"/g;
let m;
while ((m = idRe.exec(html)) !== null) htmlIds.add(m[1]);

// Extract script block
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const scriptLines = script.split('\n');

// Find all getElementById calls and check if ID exists in HTML
const getElRe = /getElementById\(['"]([^'"]+)['"]\)/g;
const missing = [];
const found = [];
let sm;
scriptLines.forEach((line, i) => {
  const lineNo = i + 1;
  while ((sm = getElRe.exec(line)) !== null) {
    const id = sm[1];
    if (!htmlIds.has(id)) {
      missing.push({ id, lineNo, line: line.trim().substring(0, 100) });
    }
  }
  getElRe.lastIndex = 0;
});

console.log(`HTML IDs defined: ${htmlIds.size}`);
console.log(`\nMISSING IDs (in JS but not in HTML):`);
missing.forEach(({ id, lineNo, line }) => {
  console.log(`  [Line ${lineNo}] #${id}`);
  console.log(`    ${line}`);
});
console.log(`\nTotal missing: ${missing.length}`);
