import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

content = open('scratch/demo_3d_site/index.html', 'r', encoding='utf-8').read()

start_marker = '// Update label in DOM'
end_marker   = '  // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n  // SCROLL'

idx     = content.find(start_marker)
end_idx = content.find(end_marker, idx)

old_block = content[idx : end_idx]

new_block = '''// Find nearest keyframe to current scroll for active-sphere highlighting
    let nearestIdx = 0, nearestDist = Infinity;
    keyframes.forEach(function(kf, i) {
      var d = Math.abs(kf.scroll - currentScroll);
      if (d < nearestDist) { nearestDist = d; nearestIdx = i; }
    });

    // Colour each sphere: red=selected, cyan=active scroll, gold=idle
    anchorSpheres.forEach(function(sphere, idx) {
      var isSel    = idx === selectedAnchorIdx;
      var isActive = idx === nearestIdx && !isSel;
      sphere.material.color.setHex(isSel ? 0xff3300 : isActive ? 0x00ffe0 : 0xffe566);
      sphere.material.opacity = isSel ? 1.0 : isActive ? 0.9 : 0.6;
      sphere.scale.setScalar(isSel ? 1.8 : isActive ? 1.4 : 1.0);
    });

    var lbl = document.getElementById('vis-selected-kf-label');
    if (selectedAnchorIdx !== -1 && keyframes[selectedAnchorIdx]) {
      lbl.textContent = 'Editing #' + selectedAnchorIdx + ' | Active: #' + nearestIdx + ' (' + (keyframes[nearestIdx].scroll * 100).toFixed(0) + '%)';
    } else {
      lbl.textContent = 'Active Keyframe: #' + nearestIdx + ' (' + (keyframes[nearestIdx].scroll * 100).toFixed(0) + '%)';
    }
  }

  // Lightweight per-scroll highlight refresh (no geo rebuild).
  function updateAnchorHighlights() {
    if (!anchorSpheres.length) return;
    var nearestIdx = 0, nearestDist = Infinity;
    keyframes.forEach(function(kf, i) {
      var d = Math.abs(kf.scroll - currentScroll);
      if (d < nearestDist) { nearestDist = d; nearestIdx = i; }
    });
    anchorSpheres.forEach(function(sphere, idx) {
      var isSel    = idx === selectedAnchorIdx;
      var isActive = idx === nearestIdx && !isSel;
      sphere.material.color.setHex(isSel ? 0xff3300 : isActive ? 0x00ffe0 : 0xffe566);
      sphere.material.opacity = isSel ? 1.0 : isActive ? 0.9 : 0.6;
      sphere.scale.setScalar(isSel ? 1.8 : isActive ? 1.4 : 1.0);
    });
    var lbl = document.getElementById('vis-selected-kf-label');
    if (selectedAnchorIdx !== -1 && keyframes[selectedAnchorIdx]) {
      lbl.textContent = 'Editing #' + selectedAnchorIdx + ' | Active: #' + nearestIdx + ' (' + (keyframes[nearestIdx].scroll * 100).toFixed(0) + '%)';
    } else {
      lbl.textContent = 'Active Keyframe: #' + nearestIdx + ' (' + (keyframes[nearestIdx].scroll * 100).toFixed(0) + '%)';
    }
  }

'''

content = content.replace(old_block, new_block, 1)
open('scratch/demo_3d_site/index.html', 'w', encoding='utf-8').write(content)
print('PATCHED OK')
