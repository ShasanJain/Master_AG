"""
Patch script for debug panel refactor:
1. Replace Transform section HTML (grouped + rz + spinY/spinX)
2. Replace Material section HTML (emissiveColor + wireOpacity added)
"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

content = open('scratch/demo_3d_site/index.html', 'r', encoding='utf-8').read()
changed = 0

# ── HELPER: single slider row ──────────────────────────────────────────────
def slider_row(label, id_, min_, max_, step_, val_, btn_step):
    return f'''      <div class="debug-row">
        <label>{label}</label>
        <div class="debug-control-group">
          <input type="range" id="{id_}" min="{min_}" max="{max_}" step="{step_}" value="{val_}">
          <div class="debug-num-control">
            <button class="btn-dec" data-id="{id_}" data-step="{btn_step}">−</button>
            <input type="text" id="val-{id_}" class="num-input" value="{val_}">
            <button class="btn-inc" data-id="{id_}" data-step="{-float(btn_step)}">+</button>
          </div>
        </div>
      </div>'''

def grp_header(label, target_id):
    return f'''      <div onclick="(function(){{var b=document.getElementById('{target_id}');b.style.display=b.style.display==='none'?'block':'none';this.querySelector('.grp-arrow').textContent=b.style.display==='none'?'▶':'▼';}}).call(this)" style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:4px 2px;margin:4px 0 2px;border-bottom:1px solid var(--border);font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:bold;color:var(--text);opacity:0.7;user-select:none;">
        <span class="grp-arrow">▼</span>{label}
      </div>
      <div id="{target_id}">'''

def grp_close():
    return '      </div>'

# ── 1. Replace Transform section HTML ──────────────────────────────────────
old_transform = '''    <!-- Primary Section: Transform Settings -->
    <div id="section-transform">
      <div class="debug-row">
        <label>Position X</label>
        <div class="debug-control-group">
          <input type="range" id="dbg-pos-x" min="-2.0" max="2.0" step="0.02" value="0.55">
          <div class="debug-num-control">
            <button class="btn-dec" data-id="dbg-pos-x" data-step="-0.02">−</button>
            <input type="text" id="val-dbg-pos-x" class="num-input" value="0.55">
            <button class="btn-inc" data-id="dbg-pos-x" data-step="0.02">+</button>
          </div>
        </div>
      </div>
      <div class="debug-row">
        <label>Position Y</label>
        <div class="debug-control-group">
          <input type="range" id="dbg-pos-y" min="-1.5" max="1.5" step="0.02" value="0.0">
          <div class="debug-num-control">
            <button class="btn-dec" data-id="dbg-pos-y" data-step="-0.02">−</button>
            <input type="text" id="val-dbg-pos-y" class="num-input" value="0.00">
            <button class="btn-inc" data-id="dbg-pos-y" data-step="0.02">+</button>
          </div>
        </div>
      </div>
      <div class="debug-row">
        <label>Position Z</label>
        <div class="debug-control-group">
          <input type="range" id="dbg-pos-z" min="0.0" max="2.0" step="0.02" value="0.5">
          <div class="debug-num-control">
            <button class="btn-dec" data-id="dbg-pos-z" data-step="-0.02">−</button>
            <input type="text" id="val-dbg-pos-z" class="num-input" value="0.50">
            <button class="btn-inc" data-id="dbg-pos-z" data-step="0.02">+</button>
          </div>
        </div>
      </div>
      <div class="debug-row">
        <label>Rotation X</label>
        <div class="debug-control-group">
          <input type="range" id="dbg-rot-x-val" min="-3.14" max="3.14" step="0.02" value="0.0">
          <div class="debug-num-control">
            <button class="btn-dec" data-id="dbg-rot-x-val" data-step="-0.02">−</button>
            <input type="text" id="val-dbg-rot-x-val" class="num-input" value="0.00">
            <button class="btn-inc" data-id="dbg-rot-x-val" data-step="0.02">+</button>
          </div>
        </div>
      </div>
      <div class="debug-row">
        <label>Rotation Y</label>
        <div class="debug-control-group">
          <input type="range" id="dbg-rot-y-val" min="-3.14" max="3.14" step="0.02" value="0.0">
          <div class="debug-num-control">
            <button class="btn-dec" data-id="dbg-rot-y-val" data-step="-0.02">−</button>
            <input type="text" id="val-dbg-rot-y-val" class="num-input" value="0.00">
            <button class="btn-inc" data-id="dbg-rot-y-val" data-step="0.02">+</button>
          </div>
        </div>
      </div>
      <div class="debug-row">
        <label>Scale</label>
        <div class="debug-control-group">
          <input type="range" id="dbg-scale" min="0.2" max="2.0" step="0.02" value="1.0">
          <div class="debug-num-control">
            <button class="btn-dec" data-id="dbg-scale" data-step="-0.02">−</button>
            <input type="text" id="val-dbg-scale" class="num-input" value="1.00">
            <button class="btn-inc" data-id="dbg-scale" data-step="0.02">+</button>
          </div>
        </div>
      </div>
      <div class="debug-row">
        <label>Spotlight Radius</label>
        <div class="debug-control-group">
          <input type="range" id="dbg-spotlight-rad" min="200" max="800" step="10" value="520">
          <div class="debug-num-control">
            <button class="btn-dec" data-id="dbg-spotlight-rad" data-step="-10">−</button>
            <input type="text" id="val-dbg-spotlight-rad" class="num-input" value="520">
            <button class="btn-inc" data-id="dbg-spotlight-rad" data-step="10">+</button>
          </div>
        </div>
      </div>
    </div>'''

new_transform = '''    <!-- Primary Section: Transform Settings -->
    <div id="section-transform">

      <!-- GROUP: Position -->
      <div onclick="(function(){var b=document.getElementById('grp-position');b.style.display=b.style.display==='none'?'block':'none';this.querySelector('.grp-arrow').textContent=b.style.display==='none'?'&#9658;':'&#9660;';}).call(this)" style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:4px 2px;margin:4px 0 2px;border-bottom:1px solid var(--border);font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:bold;color:var(--text);opacity:0.7;user-select:none;">
        <span class="grp-arrow">&#9660;</span>Position
      </div>
      <div id="grp-position">
        <div class="debug-row">
          <label>X</label>
          <div class="debug-control-group">
            <input type="range" id="dbg-pos-x" min="-2.0" max="2.0" step="0.02" value="0.55">
            <div class="debug-num-control">
              <button class="btn-dec" data-id="dbg-pos-x" data-step="-0.02">−</button>
              <input type="text" id="val-dbg-pos-x" class="num-input" value="0.55">
              <button class="btn-inc" data-id="dbg-pos-x" data-step="0.02">+</button>
            </div>
          </div>
        </div>
        <div class="debug-row">
          <label>Y</label>
          <div class="debug-control-group">
            <input type="range" id="dbg-pos-y" min="-1.5" max="1.5" step="0.02" value="0.0">
            <div class="debug-num-control">
              <button class="btn-dec" data-id="dbg-pos-y" data-step="-0.02">−</button>
              <input type="text" id="val-dbg-pos-y" class="num-input" value="0.00">
              <button class="btn-inc" data-id="dbg-pos-y" data-step="0.02">+</button>
            </div>
          </div>
        </div>
        <div class="debug-row">
          <label>Z</label>
          <div class="debug-control-group">
            <input type="range" id="dbg-pos-z" min="0.0" max="2.0" step="0.02" value="0.5">
            <div class="debug-num-control">
              <button class="btn-dec" data-id="dbg-pos-z" data-step="-0.02">−</button>
              <input type="text" id="val-dbg-pos-z" class="num-input" value="0.50">
              <button class="btn-inc" data-id="dbg-pos-z" data-step="0.02">+</button>
            </div>
          </div>
        </div>
      </div>

      <!-- GROUP: Rotation -->
      <div onclick="(function(){var b=document.getElementById('grp-rotation');b.style.display=b.style.display==='none'?'block':'none';this.querySelector('.grp-arrow').textContent=b.style.display==='none'?'&#9658;':'&#9660;';}).call(this)" style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:4px 2px;margin:4px 0 2px;border-bottom:1px solid var(--border);font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:bold;color:var(--text);opacity:0.7;user-select:none;">
        <span class="grp-arrow">&#9660;</span>Rotation
      </div>
      <div id="grp-rotation">
        <div class="debug-row">
          <label>X</label>
          <div class="debug-control-group">
            <input type="range" id="dbg-rot-x-val" min="-3.14" max="3.14" step="0.02" value="0.0">
            <div class="debug-num-control">
              <button class="btn-dec" data-id="dbg-rot-x-val" data-step="-0.02">−</button>
              <input type="text" id="val-dbg-rot-x-val" class="num-input" value="0.00">
              <button class="btn-inc" data-id="dbg-rot-x-val" data-step="0.02">+</button>
            </div>
          </div>
        </div>
        <div class="debug-row">
          <label>Y</label>
          <div class="debug-control-group">
            <input type="range" id="dbg-rot-y-val" min="-3.14" max="3.14" step="0.02" value="0.0">
            <div class="debug-num-control">
              <button class="btn-dec" data-id="dbg-rot-y-val" data-step="-0.02">−</button>
              <input type="text" id="val-dbg-rot-y-val" class="num-input" value="0.00">
              <button class="btn-inc" data-id="dbg-rot-y-val" data-step="0.02">+</button>
            </div>
          </div>
        </div>
        <div class="debug-row">
          <label>Z</label>
          <div class="debug-control-group">
            <input type="range" id="dbg-rot-z-val" min="-3.14" max="3.14" step="0.02" value="0.0">
            <div class="debug-num-control">
              <button class="btn-dec" data-id="dbg-rot-z-val" data-step="-0.02">−</button>
              <input type="text" id="val-dbg-rot-z-val" class="num-input" value="0.00">
              <button class="btn-inc" data-id="dbg-rot-z-val" data-step="0.02">+</button>
            </div>
          </div>
        </div>
      </div>

      <!-- GROUP: Scale -->
      <div onclick="(function(){var b=document.getElementById('grp-scale');b.style.display=b.style.display==='none'?'block':'none';this.querySelector('.grp-arrow').textContent=b.style.display==='none'?'&#9658;':'&#9660;';}).call(this)" style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:4px 2px;margin:4px 0 2px;border-bottom:1px solid var(--border);font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:bold;color:var(--text);opacity:0.7;user-select:none;">
        <span class="grp-arrow">&#9660;</span>Scale
      </div>
      <div id="grp-scale">
        <div class="debug-row">
          <label>Scale</label>
          <div class="debug-control-group">
            <input type="range" id="dbg-scale" min="0.2" max="2.0" step="0.02" value="1.0">
            <div class="debug-num-control">
              <button class="btn-dec" data-id="dbg-scale" data-step="-0.02">−</button>
              <input type="text" id="val-dbg-scale" class="num-input" value="1.00">
              <button class="btn-inc" data-id="dbg-scale" data-step="0.02">+</button>
            </div>
          </div>
        </div>
      </div>

      <!-- GROUP: Idle Spin -->
      <div onclick="(function(){var b=document.getElementById('grp-spin');b.style.display=b.style.display==='none'?'block':'none';this.querySelector('.grp-arrow').textContent=b.style.display==='none'?'&#9658;':'&#9660;';}).call(this)" style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:4px 2px;margin:4px 0 2px;border-bottom:1px solid var(--border);font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:bold;color:var(--text);opacity:0.7;user-select:none;">
        <span class="grp-arrow">&#9660;</span>Idle Spin
      </div>
      <div id="grp-spin">
        <div class="debug-row">
          <label>Spin Y</label>
          <div class="debug-control-group">
            <input type="range" id="dbg-spin-y" min="0.0" max="0.02" step="0.0002" value="0.003">
            <div class="debug-num-control">
              <button class="btn-dec" data-id="dbg-spin-y" data-step="-0.0002">−</button>
              <input type="text" id="val-dbg-spin-y" class="num-input" value="0.003">
              <button class="btn-inc" data-id="dbg-spin-y" data-step="0.0002">+</button>
            </div>
          </div>
        </div>
        <div class="debug-row">
          <label>Spin X</label>
          <div class="debug-control-group">
            <input type="range" id="dbg-spin-x" min="0.0" max="0.01" step="0.0001" value="0.0008">
            <div class="debug-num-control">
              <button class="btn-dec" data-id="dbg-spin-x" data-step="-0.0001">−</button>
              <input type="text" id="val-dbg-spin-x" class="num-input" value="0.0008">
              <button class="btn-inc" data-id="dbg-spin-x" data-step="0.0001">+</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Spotlight Radius (global, not per-keyframe) -->
      <div onclick="(function(){var b=document.getElementById('grp-ui');b.style.display=b.style.display==='none'?'block':'none';this.querySelector('.grp-arrow').textContent=b.style.display==='none'?'&#9658;':'&#9660;';}).call(this)" style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:4px 2px;margin:4px 0 2px;border-bottom:1px solid var(--border);font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:bold;color:var(--text);opacity:0.7;user-select:none;">
        <span class="grp-arrow">&#9660;</span>UI / Lighting
      </div>
      <div id="grp-ui">
        <div class="debug-row">
          <label>Spotlight R</label>
          <div class="debug-control-group">
            <input type="range" id="dbg-spotlight-rad" min="200" max="800" step="10" value="520">
            <div class="debug-num-control">
              <button class="btn-dec" data-id="dbg-spotlight-rad" data-step="-10">−</button>
              <input type="text" id="val-dbg-spotlight-rad" class="num-input" value="520">
              <button class="btn-inc" data-id="dbg-spotlight-rad" data-step="10">+</button>
            </div>
          </div>
        </div>
      </div>

    </div>'''

if old_transform in content:
    content = content.replace(old_transform, new_transform, 1)
    changed += 1
    print('FIX 1 Transform HTML: OK')
else:
    print('FIX 1 Transform HTML: NOT FOUND')

# ── 2. Replace Material section HTML ──────────────────────────────────────
old_material = '''    <!-- Secondary Section: Material Settings -->
    <div id="section-material" style="display: none;">
      <div class="debug-row">
        <label>Opacity</label>
        <div class="debug-control-group">
          <input type="range" id="dbg-opacity" min="0.0" max="1.0" step="0.02" value="0.92">
          <div class="debug-num-control">
            <button class="btn-dec" data-id="dbg-opacity" data-step="-0.02">−</button>
            <input type="text" id="val-dbg-opacity" class="num-input" value="0.92">
            <button class="btn-inc" data-id="dbg-opacity" data-step="0.02">+</button>
          </div>
        </div>
      </div>
      <div class="debug-row">
        <label>Metalness</label>
        <div class="debug-control-group">
          <input type="range" id="dbg-metalness" min="0.0" max="1.0" step="0.02" value="0.12">
          <div class="debug-num-control">
            <button class="btn-dec" data-id="dbg-metalness" data-step="-0.02">−</button>
            <input type="text" id="val-dbg-metalness" class="num-input" value="0.12">
            <button class="btn-inc" data-id="dbg-metalness" data-step="0.02">+</button>
          </div>
        </div>
      </div>
      <div class="debug-row">
        <label>Roughness</label>
        <div class="debug-control-group">
          <input type="range" id="dbg-roughness" min="0.0" max="1.0" step="0.02" value="0.06">
          <div class="debug-num-control">
            <button class="btn-dec" data-id="dbg-roughness" data-step="-0.02">−</button>
            <input type="text" id="val-dbg-roughness" class="num-input" value="0.06">
            <button class="btn-inc" data-id="dbg-roughness" data-step="0.02">+</button>
          </div>
        </div>
      </div>
      <div class="debug-row">
        <label>Emissive Intensity</label>
        <div class="debug-control-group">
          <input type="range" id="dbg-emissive" min="0.0" max="5.0" step="0.05" value="1.80">
          <div class="debug-num-control">
            <button class="btn-dec" data-id="dbg-emissive" data-step="-0.05">−</button>
            <input type="text" id="val-dbg-emissive" class="num-input" value="1.80">
            <button class="btn-inc" data-id="dbg-emissive" data-step="0.05">+</button>
          </div>
        </div>
      </div>
    </div>'''

new_material = '''    <!-- Secondary Section: Material Settings -->
    <div id="section-material" style="display: none;">
      <div class="debug-row">
        <label>Opacity</label>
        <div class="debug-control-group">
          <input type="range" id="dbg-opacity" min="0.0" max="1.0" step="0.02" value="0.92">
          <div class="debug-num-control">
            <button class="btn-dec" data-id="dbg-opacity" data-step="-0.02">−</button>
            <input type="text" id="val-dbg-opacity" class="num-input" value="0.92">
            <button class="btn-inc" data-id="dbg-opacity" data-step="0.02">+</button>
          </div>
        </div>
      </div>
      <div class="debug-row">
        <label>Metalness</label>
        <div class="debug-control-group">
          <input type="range" id="dbg-metalness" min="0.0" max="1.0" step="0.02" value="0.12">
          <div class="debug-num-control">
            <button class="btn-dec" data-id="dbg-metalness" data-step="-0.02">−</button>
            <input type="text" id="val-dbg-metalness" class="num-input" value="0.12">
            <button class="btn-inc" data-id="dbg-metalness" data-step="0.02">+</button>
          </div>
        </div>
      </div>
      <div class="debug-row">
        <label>Roughness</label>
        <div class="debug-control-group">
          <input type="range" id="dbg-roughness" min="0.0" max="1.0" step="0.02" value="0.06">
          <div class="debug-num-control">
            <button class="btn-dec" data-id="dbg-roughness" data-step="-0.02">−</button>
            <input type="text" id="val-dbg-roughness" class="num-input" value="0.06">
            <button class="btn-inc" data-id="dbg-roughness" data-step="0.02">+</button>
          </div>
        </div>
      </div>
      <div class="debug-row">
        <label>Emissive Intensity</label>
        <div class="debug-control-group">
          <input type="range" id="dbg-emissive" min="0.0" max="5.0" step="0.05" value="1.80">
          <div class="debug-num-control">
            <button class="btn-dec" data-id="dbg-emissive" data-step="-0.05">−</button>
            <input type="text" id="val-dbg-emissive" class="num-input" value="1.80">
            <button class="btn-inc" data-id="dbg-emissive" data-step="0.05">+</button>
          </div>
        </div>
      </div>
      <div class="debug-row">
        <label>Emissive Color</label>
        <div class="debug-control-group" style="align-items:center; gap:8px;">
          <input type="color" id="dbg-emissive-color" value="#8eb4f8" style="width:40px; height:28px; border:1px solid var(--border); border-radius:4px; cursor:pointer; background:none; padding:1px;">
          <input type="text" id="val-dbg-emissive-color" class="num-input" value="#8eb4f8" style="width:62px;">
        </div>
      </div>
      <div class="debug-row">
        <label>Wire Opacity</label>
        <div class="debug-control-group">
          <input type="range" id="dbg-wire-opacity" min="0.0" max="1.0" step="0.02" value="0.22">
          <div class="debug-num-control">
            <button class="btn-dec" data-id="dbg-wire-opacity" data-step="-0.02">−</button>
            <input type="text" id="val-dbg-wire-opacity" class="num-input" value="0.22">
            <button class="btn-inc" data-id="dbg-wire-opacity" data-step="0.02">+</button>
          </div>
        </div>
      </div>
    </div>'''

if old_material in content:
    content = content.replace(old_material, new_material, 1)
    changed += 1
    print('FIX 2 Material HTML: OK')
else:
    print('FIX 2 Material HTML: NOT FOUND')

open('scratch/demo_3d_site/index.html', 'w', encoding='utf-8').write(content)
print('Done. %d/2 changes applied.' % changed)
