"""
JS patch: wire rz, spinY, spinX, emissiveColor, wireOpacity through
interpolateHermite defaults, applyTimeline, and updateSliderLabels.
"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

content = open('scratch/demo_3d_site/index.html', 'r', encoding='utf-8').read()
changed = 0

# ── 1. Extend interpolateHermite defaults ──────────────────────────────────
old1 = """      if (kf[field] !== undefined) return kf[field];
      if (field === 'opacity') return 0.92;
      if (field === 'metalness') return 0.12;
      if (field === 'roughness') return 0.06;
      if (field === 'emissiveIntensity') return 1.80;
      return 0.0;"""

new1 = """      if (kf[field] !== undefined) return kf[field];
      if (field === 'opacity') return 0.92;
      if (field === 'metalness') return 0.12;
      if (field === 'roughness') return 0.06;
      if (field === 'emissiveIntensity') return 1.80;
      if (field === 'rz') return 0.0;
      if (field === 'spinY') return 0.003;
      if (field === 'spinX') return 0.0008;
      if (field === 'wireOpacity') return 0.22;
      return 0.0;"""

if old1 in content:
    content = content.replace(old1, new1, 1)
    changed += 1
    print('FIX 1 interpolateHermite defaults: OK')
else:
    print('FIX 1 interpolateHermite defaults: NOT FOUND')

# ── 2. Extend applyTimeline interpolation block ────────────────────────────
old2 = """    const opacity = interpolateHermite(progress, keyframes, 'opacity');
    const metalness = interpolateHermite(progress, keyframes, 'metalness');
    const roughness = interpolateHermite(progress, keyframes, 'roughness');
    const emissive = interpolateHermite(progress, keyframes, 'emissiveIntensity');

    // Keep resize target synced"""

new2 = """    const opacity = interpolateHermite(progress, keyframes, 'opacity');
    const metalness = interpolateHermite(progress, keyframes, 'metalness');
    const roughness = interpolateHermite(progress, keyframes, 'roughness');
    const emissive = interpolateHermite(progress, keyframes, 'emissiveIntensity');
    const rz       = interpolateHermite(progress, keyframes, 'rz');
    const spinY    = interpolateHermite(progress, keyframes, 'spinY');
    const spinX    = interpolateHermite(progress, keyframes, 'spinX');
    const wireOpacity = interpolateHermite(progress, keyframes, 'wireOpacity');

    // Interpolate emissive color between nearest keyframes
    let emissiveColorHex = '#8eb4f8';
    if (keyframes.length >= 1) {
      let iLow = 0, iHigh = keyframes.length - 1;
      for (let j = 0; j < keyframes.length - 1; j++) {
        if (progress >= keyframes[j].scroll && progress <= keyframes[j+1].scroll) {
          iLow = j; iHigh = j + 1; break;
        }
      }
      const cA = new THREE.Color(keyframes[iLow].emissiveColor  || '#8eb4f8');
      const cB = new THREE.Color(keyframes[iHigh].emissiveColor || '#8eb4f8');
      const h = keyframes[iHigh].scroll - keyframes[iLow].scroll;
      const t = h > 0 ? Math.max(0, Math.min(1, (progress - keyframes[iLow].scroll) / h)) : 0;
      cA.lerp(cB, t);
      emissiveColorHex = '#' + cA.getHexString();
    }

    // Apply new globals
    rotSpeedY = spinY;
    rotSpeedX = spinX;

    // Keep resize target synced"""

if old2 in content:
    content = content.replace(old2, new2, 1)
    changed += 1
    print('FIX 2 applyTimeline interpolation: OK')
else:
    print('FIX 2 applyTimeline interpolation: NOT FOUND')

# ── 3. Extend applyTimeline slider sync ───────────────────────────────────
old3 = """    document.getElementById('dbg-rot-x-val').value = rx;
    document.getElementById('dbg-rot-y-val').value = ry;
    document.getElementById('dbg-scale').value = scale / debugScale;
    
    document.getElementById('dbg-opacity').value = opacity;
    document.getElementById('dbg-metalness').value = metalness;
    document.getElementById('dbg-roughness').value = roughness;
    document.getElementById('dbg-emissive').value = emissive;

    updateSliderLabels(x, y, z, rx, ry, scale / debugScale, opacity, metalness, roughness, emissive);"""

new3 = """    document.getElementById('dbg-rot-x-val').value = rx;
    document.getElementById('dbg-rot-y-val').value = ry;
    document.getElementById('dbg-rot-z-val').value = rz;
    document.getElementById('dbg-scale').value = scale / debugScale;
    document.getElementById('dbg-spin-y').value = spinY;
    document.getElementById('dbg-spin-x').value = spinX;
    
    document.getElementById('dbg-opacity').value = opacity;
    document.getElementById('dbg-metalness').value = metalness;
    document.getElementById('dbg-roughness').value = roughness;
    document.getElementById('dbg-emissive').value = emissive;
    document.getElementById('dbg-emissive-color').value = emissiveColorHex;
    document.getElementById('val-dbg-emissive-color').value = emissiveColorHex;
    document.getElementById('dbg-wire-opacity').value = wireOpacity;

    updateSliderLabels(x, y, z, rx, ry, rz, scale / debugScale, spinY, spinX, opacity, metalness, roughness, emissive, emissiveColorHex, wireOpacity);"""

if old3 in content:
    content = content.replace(old3, new3, 1)
    changed += 1
    print('FIX 3 applyTimeline slider sync: OK')
else:
    print('FIX 3 applyTimeline slider sync: NOT FOUND')

# ── 4. Extend applyTimeline 3D application ─────────────────────────────────
old4 = """      targetPos.set(rxX, y, z);
      targetRot.set(rx, ry, targetRot.z);
      targetScale = scale;
      
      crystalGroup.traverse(child => {
        if (child.isMesh && child.material) {
          child.material.opacity = opacity;
          child.material.metalness = metalness;
          child.material.roughness = roughness;
          child.material.emissiveIntensity = child.material.wireframe ? emissive * 0.4 : emissive;
        }
      });"""

new4 = """      targetPos.set(rxX, y, z);
      targetRot.set(rx, ry, rz);
      targetScale = scale;
      
      const _emColor = new THREE.Color(emissiveColorHex);
      crystalGroup.traverse(child => {
        if (child.isMesh && child.material) {
          if (child.material.wireframe) {
            child.material.opacity = wireOpacity;
            child.material.emissiveIntensity = emissive * 0.4;
          } else {
            child.material.opacity = opacity;
            child.material.emissiveIntensity = emissive;
            child.material.emissive.copy(_emColor);
          }
          child.material.metalness = metalness;
          child.material.roughness = roughness;
        }
      });"""

if old4 in content:
    content = content.replace(old4, new4, 1)
    changed += 1
    print('FIX 4 applyTimeline 3D application: OK')
else:
    print('FIX 4 applyTimeline 3D application: NOT FOUND')

# ── 5. Extend updateSliderLabels signature + body ─────────────────────────
old5 = """  function updateSliderLabels(x, y, z, rx, ry, scale, opacity = 0.92, metalness = 0.12, roughness = 0.06, emissive = 1.80) {
    document.getElementById('val-dbg-pos-x').value = parseFloat(x).toFixed(2);
    document.getElementById('val-dbg-pos-y').value = parseFloat(y).toFixed(2);
    document.getElementById('val-dbg-pos-z').value = parseFloat(z).toFixed(2);
    document.getElementById('val-dbg-rot-x-val').value = parseFloat(rx).toFixed(2);
    document.getElementById('val-dbg-rot-y-val').value = parseFloat(ry).toFixed(2);
    document.getElementById('val-dbg-scale').value = parseFloat(scale).toFixed(2);
    
    document.getElementById('val-dbg-opacity').value = parseFloat(opacity).toFixed(2);
    document.getElementById('val-dbg-metalness').value = parseFloat(metalness).toFixed(2);
    document.getElementById('val-dbg-roughness').value = parseFloat(roughness).toFixed(2);
    document.getElementById('val-dbg-emissive').value = parseFloat(emissive).toFixed(2);
  }"""

new5 = """  function updateSliderLabels(x, y, z, rx, ry, rz = 0, scale = 1, spinY = 0.003, spinX = 0.0008, opacity = 0.92, metalness = 0.12, roughness = 0.06, emissive = 1.80, emissiveColor = '#8eb4f8', wireOpacity = 0.22) {
    document.getElementById('val-dbg-pos-x').value = parseFloat(x).toFixed(2);
    document.getElementById('val-dbg-pos-y').value = parseFloat(y).toFixed(2);
    document.getElementById('val-dbg-pos-z').value = parseFloat(z).toFixed(2);
    document.getElementById('val-dbg-rot-x-val').value = parseFloat(rx).toFixed(2);
    document.getElementById('val-dbg-rot-y-val').value = parseFloat(ry).toFixed(2);
    document.getElementById('val-dbg-rot-z-val').value = parseFloat(rz).toFixed(2);
    document.getElementById('val-dbg-scale').value = parseFloat(scale).toFixed(2);
    document.getElementById('val-dbg-spin-y').value = parseFloat(spinY).toFixed(4);
    document.getElementById('val-dbg-spin-x').value = parseFloat(spinX).toFixed(4);
    
    document.getElementById('val-dbg-opacity').value = parseFloat(opacity).toFixed(2);
    document.getElementById('val-dbg-metalness').value = parseFloat(metalness).toFixed(2);
    document.getElementById('val-dbg-roughness').value = parseFloat(roughness).toFixed(2);
    document.getElementById('val-dbg-emissive').value = parseFloat(emissive).toFixed(2);
    document.getElementById('val-dbg-wire-opacity').value = parseFloat(wireOpacity).toFixed(2);
    const ecEl = document.getElementById('val-dbg-emissive-color');
    if (ecEl) ecEl.value = emissiveColor;
  }"""

if old5 in content:
    content = content.replace(old5, new5, 1)
    changed += 1
    print('FIX 5 updateSliderLabels: OK')
else:
    print('FIX 5 updateSliderLabels: NOT FOUND')

open('scratch/demo_3d_site/index.html', 'w', encoding='utf-8').write(content)
print('Done. %d/5 changes applied.' % changed)
