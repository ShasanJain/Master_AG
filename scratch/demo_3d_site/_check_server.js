const http = require('http');
const req = http.get('http://localhost:8080/', { headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Served size:', data.length, 'bytes');
    console.log('Cache-Control header:', res.headers['cache-control']);
    console.log('Has RingGeometry:', data.includes('RingGeometry'));
    console.log('Has halo name guard:', data.includes("name === 'halo'"));
    console.log('Has applyTimeline:', data.includes('function applyTimeline'));
    console.log('Has initWebGL:', data.includes('function initWebGL'));
    
    // Count crystalGroup.traverse occurrences
    let count = 0;
    let idx = 0;
    while ((idx = data.indexOf('crystalGroup.traverse', idx + 1)) > -1) count++;
    console.log('crystalGroup.traverse occurrences:', count);
    
    // Find any unguarded emissive.copy
    let emCopyIdx = 0;
    let emCopyCount = 0;
    while ((emCopyIdx = data.indexOf('.emissive.copy(', emCopyIdx + 1)) > -1) {
      emCopyCount++;
      const context = data.substring(emCopyIdx - 300, emCopyIdx + 50);
      const hasGuard = context.includes("'halo'") || context.includes('if (child.material.emissive)');
      console.log('emissive.copy #' + emCopyCount + ': guarded=' + hasGuard);
    }
  });
});
req.on('error', e => console.error('HTTP Error:', e.message));
