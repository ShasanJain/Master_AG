import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

content = open('scratch/demo_3d_site/index.html', 'r', encoding='utf-8').read()
changed = 0

# ── 1. Fix camera scale: 6.5 → 4.0 (closer = correct scale) ──────────────────
old1 = 'camera.position.set(0, 0.5, 6.5);'
new1 = 'camera.position.set(0, 0.5, 4.0);'
if old1 in content:
    content = content.replace(old1, new1, 1)
    changed += 1
    print('FIX 1 camera scale: OK')
else:
    print('FIX 1 camera scale: NOT FOUND')

# ── 2. Replace visualizer section HTML (add keyframe list) ────────────────────
old2 = '''    <!-- Tertiary Section: Visualizer Settings -->
    <div id="section-visualizer" style="display: none;">
      <div style="font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--text); line-height: 1.4; display: flex; flex-direction: column; gap: 8px;">
        <label style="display:flex; align-items:center; gap:6px; cursor:none;">
          <input type="checkbox" id="dbg-toggle-vis" style="cursor:none;"> Enable Spline Visualizer
        </label>
        <div style="border-top:1px solid var(--border); margin:4px 0;"></div>
        <div id="vis-selected-kf-label" style="font-weight:bold; margin-bottom: 2px;">Selected Anchor: None</div>
        <div style="font-size:10px; opacity:0.75; padding-left:4px;">
          * Click 3D spheres in the canvas to select and edit keyframe anchors.
          * Camera Path (lavender) &amp; Crystal Path (yellow) shown in editor.
        </div>
      </div>
    </div>'''

new2 = '''    <!-- Tertiary Section: Visualizer Settings -->
    <div id="section-visualizer" style="display: none;">
      <div style="font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--text); line-height: 1.4; display: flex; flex-direction: column; gap: 8px;">
        <label style="display:flex; align-items:center; gap:6px; cursor:none;">
          <input type="checkbox" id="dbg-toggle-vis" style="cursor:none;"> Enable Spline Visualizer
        </label>
        <div style="border-top:1px solid var(--border); margin:4px 0;"></div>
        <div id="vis-selected-kf-label" style="font-weight:bold; margin-bottom: 2px;">Selected Anchor: None</div>
        <div style="font-size:10px; opacity:0.6; padding-left:4px; margin-bottom:4px;">
          Click a sphere or row below to select &amp; edit. 🟦 cyan = current scroll position.
        </div>
        <!-- Keyframe List -->
        <div id="kf-list-wrap" style="display:none; flex-direction:column; gap:2px; max-height:160px; overflow-y:auto; border:1px solid var(--border); border-radius:6px; padding:4px; background:rgba(0,0,0,0.06);">
          <!-- rows injected by JS -->
        </div>
      </div>
    </div>'''

if old2 in content:
    content = content.replace(old2, new2, 1)
    changed += 1
    print('FIX 2 keyframe list HTML: OK')
else:
    print('FIX 2 keyframe list HTML: NOT FOUND')

# ── 3. Replace export + output textarea + save buttons HTML ───────────────────
old3 = '''    <button class="btn-pill" id="dbg-export-kf" style="font-size:11px; padding:8px; width:100%; cursor:none; justify-content:center; margin-top:8px; background:rgba(26,22,18,0.06); color:var(--text);">Export Configuration</button>
    <button class="btn-pill" id="dbg-save-kf" style="font-size:11px; padding:8px; width:100%; cursor:none; justify-content:center; margin-top:8px; background:rgba(40,167,69,0.15); color:#28a745;">Save to File</button>
    <textarea id="dbg-output" style="width:100%; height:60px; font-family:'JetBrains Mono',monospace; font-size:9px; background:rgba(0,0,0,0.05); color:var(--text); border:1px solid var(--border); border-radius:6px; padding:4px; display:none; resize:none; outline:none;" readonly></textarea>'''

new3 = '''    <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:8px;">
      <button class="btn-pill" id="dbg-export-kf" style="font-size:11px; padding:8px; cursor:none; justify-content:center; background:rgba(26,22,18,0.06); color:var(--text);">📋 Copy JSON</button>
      <button class="btn-pill" id="dbg-download-kf" style="font-size:11px; padding:8px; cursor:none; justify-content:center; background:rgba(40,167,69,0.15); color:#28a745;">⬇ Download .json</button>
    </div>
    <button class="btn-pill" id="dbg-save-kf" style="font-size:11px; padding:8px; width:100%; cursor:none; justify-content:center; margin-top:6px; background:rgba(0,123,255,0.12); color:#5ba3ff;">💾 Patch index.html</button>
    <!-- Output panel: collapsible -->
    <div id="dbg-output-wrap" style="display:none; margin-top:6px; border:1px solid var(--border); border-radius:6px; overflow:hidden;">
      <div style="display:flex; align-items:center; justify-content:space-between; padding:4px 8px; background:rgba(0,0,0,0.08); font-size:10px; font-family:'JetBrains Mono',monospace; cursor:pointer;" id="dbg-output-header">
        <span>Exported JSON</span>
        <button id="dbg-output-collapse" style="background:none; border:none; color:var(--text); font-size:12px; cursor:pointer; padding:0 2px; line-height:1;">▲</button>
      </div>
      <textarea id="dbg-output" style="width:100%; height:120px; font-family:'JetBrains Mono',monospace; font-size:9px; background:rgba(0,0,0,0.05); color:var(--text); border:none; border-top:1px solid var(--border); padding:6px; resize:vertical; outline:none; box-sizing:border-box; display:block; overflow:auto;" readonly></textarea>
    </div>'''

if old3 in content:
    content = content.replace(old3, new3, 1)
    changed += 1
    print('FIX 3 export buttons HTML: OK')
else:
    print('FIX 3 export buttons HTML: NOT FOUND')

# ── 4. Update Export JS handler ───────────────────────────────────────────────
old4 = '''    // Export Configuration
    document.getElementById('dbg-export-kf').addEventListener('click', () => {
      const area = document.getElementById('dbg-output');
      area.style.display = 'block';
      area.value = JSON.stringify(keyframes, null, 2);
      area.select();
      
      navigator.clipboard.writeText(area.value).then(() => {
        const btn = document.getElementById('dbg-export-kf');
        btn.textContent = 'Copied to Clipboard!';
        setTimeout(() => { btn.textContent = 'Export Configuration'; }, 1500);
      }).catch(() => {});
    });'''

new4 = '''    // ── Export: Copy JSON to clipboard ──────────────────────────────────────
    function showOutputPanel(json) {
      const wrap = document.getElementById('dbg-output-wrap');
      const area = document.getElementById('dbg-output');
      wrap.style.display = 'block';
      area.value = json;
      // Auto-scroll debug panel to show output
      const panel = document.getElementById('debug-panel');
      if (panel) setTimeout(() => { panel.scrollTop = panel.scrollHeight; }, 50);
    }

    document.getElementById('dbg-export-kf').addEventListener('click', () => {
      const json = JSON.stringify(keyframes, null, 2);
      showOutputPanel(json);
      navigator.clipboard.writeText(json).then(() => {
        const btn = document.getElementById('dbg-export-kf');
        btn.textContent = '✓ Copied!';
        setTimeout(() => { btn.textContent = '📋 Copy JSON'; }, 1800);
      }).catch(() => {});
    });

    // ── Export: Download as .json file ───────────────────────────────────────
    document.getElementById('dbg-download-kf').addEventListener('click', () => {
      const json = JSON.stringify(keyframes, null, 2);
      showOutputPanel(json);
      const blob = new Blob([json], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = 'keyframes.json';
      a.click();
      URL.revokeObjectURL(url);
      const btn = document.getElementById('dbg-download-kf');
      btn.textContent = '✓ Downloaded!';
      setTimeout(() => { btn.textContent = '⬇ Download .json'; }, 1800);
    });

    // ── Output panel collapse/expand ─────────────────────────────────────────
    document.getElementById('dbg-output-header').addEventListener('click', () => {
      const area  = document.getElementById('dbg-output');
      const arrow = document.getElementById('dbg-output-collapse');
      const collapsed = area.style.display === 'none';
      area.style.display   = collapsed ? 'block' : 'none';
      arrow.textContent    = collapsed ? '▲' : '▼';
    });'''

if old4 in content:
    content = content.replace(old4, new4, 1)
    changed += 1
    print('FIX 4 export JS: OK')
else:
    print('FIX 4 export JS: NOT FOUND')

# ── 5. Save to file: keep the Patch index.html handler unchanged ────
# (it already exists and works, no change needed)

# ── Write ────────────────────────────────────────────────────────────────────
open('scratch/demo_3d_site/index.html', 'w', encoding='utf-8').write(content)
print('Done. %d/%d changes applied.' % (changed, 4))
