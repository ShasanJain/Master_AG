import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

content = open('scratch/demo_3d_site/index.html', 'r', encoding='utf-8').read()

marker = '    // Increment / Decrement Buttons Listener'

color_listener = '''    // Emissive color picker \u2014 live apply + bidirectional sync with text box
    document.getElementById('dbg-emissive-color').addEventListener('input', function(e) {
      var emissiveColor = e.target.value;
      document.getElementById('val-dbg-emissive-color').value = emissiveColor;
      if (crystalGroup) {
        var _ec = new THREE.Color(emissiveColor);
        crystalGroup.traverse(function(child) {
          if (child.isMesh && child.material && !child.material.wireframe) {
            child.material.emissive.copy(_ec);
          }
        });
      }
      if (selectedAnchorIdx !== -1 && keyframes[selectedAnchorIdx]) {
        keyframes[selectedAnchorIdx].emissiveColor = emissiveColor;
      }
      isEditing = true;
      clearTimeout(editingTimeout);
      editingTimeout = setTimeout(function() { isEditing = false; }, 2000);
    });
    document.getElementById('val-dbg-emissive-color').addEventListener('change', function(e) {
      var val = e.target.value.trim();
      if (/^#[0-9a-fA-F]{6}$/.test(val)) {
        document.getElementById('dbg-emissive-color').value = val;
        document.getElementById('dbg-emissive-color').dispatchEvent(new Event('input'));
      }
    });

    // Increment / Decrement Buttons Listener'''

if marker in content:
    content = content.replace(marker, color_listener, 1)
    open('scratch/demo_3d_site/index.html', 'w', encoding='utf-8').write(content)
    print('OK')
else:
    print('MARKER NOT FOUND')
