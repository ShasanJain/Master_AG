import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

content = open('scratch/demo_3d_site/index.html', 'r', encoding='utf-8').read()
changed = 0

# ── 1. HTML: Insert asset-view + wrap editor-view ──────────────────────────
# Target: the gap between the scroll-val line and the Tab Buttons comment
old1 = '''    <!-- Tab Buttons -->
    <div style="display: flex; gap: 12px; margin-bottom: 12px; border-bottom: 1px solid var(--border); padding-bottom: 6px;">
      <button id="tab-transform" style="background: transparent; border: none; font-family: 'JetBrains Mono', monospace; font-size: 11px; cursor: none; color: var(--text); border-bottom: 2px solid var(--text); font-weight: bold; padding-bottom: 2px;">Transform</button>
      <button id="tab-material" style="background: transparent; border: none; font-family: 'JetBrains Mono', monospace; font-size: 11px; cursor: none; color: var(--text); opacity: 0.5; padding-bottom: 2px;">Material</button>
      <button id="tab-visualizer" style="background: transparent; border: none; font-family: 'JetBrains Mono', monospace; font-size: 11px; cursor: none; color: var(--text); opacity: 0.5; padding-bottom: 2px;">Visualizer</button>
    </div>'''

new1 = '''    <!-- Asset List View (default) -->
    <div id="panel-assets-view">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <span style="font-family:'JetBrains Mono',monospace; font-size:10px; color:var(--text); opacity:0.6;">Scene Assets</span>
        <span style="font-family:'JetBrains Mono',monospace; font-size:9px; color:var(--text); opacity:0.4;" id="asset-count">3 objects</span>
      </div>
      <div id="asset-list" style="display:flex; flex-direction:column; gap:6px;"></div>
    </div>

    <!-- Editor View (drill-down per asset) -->
    <div id="panel-editor-view" style="display:none;">
      <!-- Back nav -->
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
        <button id="btn-back-assets" style="background:rgba(255,255,255,0.06); border:1px solid var(--border); border-radius:6px; color:var(--text); font-family:'JetBrains Mono',monospace; font-size:10px; padding:3px 8px; cursor:pointer;">&#8592; Assets</button>
        <span id="editing-asset-label" style="font-family:'JetBrains Mono',monospace; font-size:11px; font-weight:bold; color:var(--text); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:1;"></span>
      </div>

      <!-- Tab Buttons -->
      <div id="editor-tabs" style="display: flex; gap: 12px; margin-bottom: 12px; border-bottom: 1px solid var(--border); padding-bottom: 6px;">
        <button id="tab-transform" style="background: transparent; border: none; font-family: 'JetBrains Mono', monospace; font-size: 11px; cursor: none; color: var(--text); border-bottom: 2px solid var(--text); font-weight: bold; padding-bottom: 2px;">Transform</button>
        <button id="tab-material" style="background: transparent; border: none; font-family: 'JetBrains Mono', monospace; font-size: 11px; cursor: none; color: var(--text); opacity: 0.5; padding-bottom: 2px;">Material</button>
        <button id="tab-visualizer" style="background: transparent; border: none; font-family: 'JetBrains Mono', monospace; font-size: 11px; cursor: none; color: var(--text); opacity: 0.5; padding-bottom: 2px;">Visualizer</button>
      </div>'''

if old1 in content:
    content = content.replace(old1, new1, 1)
    changed += 1
    print('FIX 1 asset-view HTML: OK')
else:
    print('FIX 1 asset-view HTML: NOT FOUND')

# ── 2. HTML: Close the editor-view div after the output panel ─────────────
# The output panel is the last thing in the panel; close editor-view after it
# Find the closing </div> of #debug-panel by looking for the textarea wrap close
old2 = '''    </div>

  <!-- Header -->'''

new2 = '''    </div><!-- /panel-editor-view -->

  <!-- Header -->'''

if old2 in content:
    content = content.replace(old2, new2, 1)
    changed += 1
    print('FIX 2 close editor-view: OK')
else:
    # try alternate spacing
    old2b = '    </div>\n\n  <!-- Header -->'
    if old2b in content:
        content = content.replace(old2b, '    </div><!-- /panel-editor-view -->\n\n  <!-- Header -->', 1)
        changed += 1
        print('FIX 2 close editor-view (alt): OK')
    else:
        print('FIX 2 close editor-view: NOT FOUND')

open('scratch/demo_3d_site/index.html', 'w', encoding='utf-8').write(content)
print('HTML pass done. %d/2 applied.' % changed)
