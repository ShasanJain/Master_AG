import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

content = open('scratch/demo_3d_site/index.html', 'r', encoding='utf-8').read()

marker = '    // Tab Switching Logic'

asset_js = r"""
    // \u2500\u2500 Scene Registry & Asset Panel \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    const sceneRegistry = [
      {
        id: 'crystal', label: 'Crystal', sublabel: 'Polygon \u00b7 Animated',
        icon: '\ud83d\udc8e', iconBg: 'rgba(142,180,248,0.15)', iconColor: '#8eb4f8',
        tabs: ['Transform', 'Material', 'Visualizer'],
        getObj: () => crystalGroup,
      },
      {
        id: 'particles', label: 'Particles', sublabel: 'Point Cloud',
        icon: '\u2726', iconBg: 'rgba(255,255,180,0.12)', iconColor: '#ffe566',
        tabs: ['Visibility'],
        getObj: () => window._particleMesh || null,
      },
      {
        id: 'grid', label: 'Background Grid', sublabel: 'GLSL Shader',
        icon: '\u2b21', iconBg: 'rgba(100,200,255,0.10)', iconColor: '#64c8ff',
        tabs: ['Visibility'],
        getObj: () => window._gridMesh || null,
      },
    ];

    let currentAssetId = 'crystal';

    function renderAssetList() {
      const list  = document.getElementById('asset-list');
      const count = document.getElementById('asset-count');
      if (!list) return;
      count.textContent = sceneRegistry.length + ' object' + (sceneRegistry.length !== 1 ? 's' : '');
      list.innerHTML = '';

      sceneRegistry.forEach(function(asset) {
        var obj = asset.getObj();
        var isVisible = obj ? obj.visible : true;

        var card = document.createElement('div');
        card.style.cssText = 'display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;border:1px solid var(--border);background:rgba(255,255,255,0.03);cursor:pointer;transition:background 0.15s;';
        card.onmouseenter = function() { card.style.background = 'rgba(255,255,255,0.07)'; };
        card.onmouseleave = function() { card.style.background = 'rgba(255,255,255,0.03)'; };

        var icon = document.createElement('div');
        icon.style.cssText = 'width:32px;height:32px;border-radius:6px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:16px;background:' + asset.iconBg + ';';
        icon.textContent = asset.icon;

        var textDiv = document.createElement('div');
        textDiv.style.cssText = 'flex:1;min-width:0;';
        textDiv.innerHTML = '<div style="font-family:\'JetBrains Mono\',monospace;font-size:11px;font-weight:bold;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + asset.label + '</div>'
          + '<div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:' + asset.iconColor + ';opacity:0.85;margin-top:1px;">' + asset.sublabel + '</div>';

        var vis = document.createElement('button');
        vis.title = isVisible ? 'Hide' : 'Show';
        vis.style.cssText = 'background:none;border:1px solid var(--border);border-radius:4px;color:var(--text);font-size:12px;padding:2px 5px;cursor:pointer;flex-shrink:0;opacity:' + (isVisible ? '1' : '0.3') + ';';
        vis.textContent = '\ud83d\udc41';
        vis.addEventListener('click', function(e) {
          e.stopPropagation();
          var o = asset.getObj();
          if (o) { o.visible = !o.visible; renderAssetList(); }
        });

        var chevron = document.createElement('span');
        chevron.style.cssText = 'font-size:16px;color:var(--text);opacity:0.35;flex-shrink:0;';
        chevron.textContent = '\u203a';

        card.appendChild(icon);
        card.appendChild(textDiv);
        card.appendChild(vis);
        card.appendChild(chevron);
        (function(aid) {
          card.addEventListener('click', function() { openAssetEditor(aid); });
        })(asset.id);
        list.appendChild(card);
      });
    }

    function openAssetEditor(assetId) {
      currentAssetId = assetId;
      var asset = sceneRegistry.filter(function(a) { return a.id === assetId; })[0];
      document.getElementById('panel-assets-view').style.display = 'none';
      document.getElementById('panel-editor-view').style.display = 'block';
      document.getElementById('editing-asset-label').textContent = asset ? (asset.icon + '  ' + asset.label) : assetId;

      var hasTransform   = asset && asset.tabs.indexOf('Transform') !== -1;
      var hasMaterial    = asset && asset.tabs.indexOf('Material') !== -1;
      var hasVisualizer  = asset && asset.tabs.indexOf('Visualizer') !== -1;

      var tT = document.getElementById('tab-transform');
      var tM = document.getElementById('tab-material');
      var tV = document.getElementById('tab-visualizer');
      var sT = document.getElementById('section-transform');
      var sM = document.getElementById('section-material');
      var sV = document.getElementById('section-visualizer');

      tT.style.display = hasTransform  ? '' : 'none';
      tM.style.display = hasMaterial   ? '' : 'none';
      tV.style.display = hasVisualizer ? '' : 'none';
      if (sT) sT.style.display = 'none';
      if (sM) sM.style.display = 'none';
      if (sV) sV.style.display = 'none';

      // Activate first visible tab
      var tabs = [tT, tM, tV];
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].style.display !== 'none') { tabs[i].click(); break; }
      }
    }

    function goBackToAssets() {
      document.getElementById('panel-editor-view').style.display = 'none';
      document.getElementById('panel-assets-view').style.display = 'block';
      renderAssetList();
    }

    document.getElementById('btn-back-assets').addEventListener('click', goBackToAssets);

    // Start on the asset list
    goBackToAssets();

    // Tab Switching Logic"""

if marker in content:
    content = content.replace(marker, asset_js, 1)
    open('scratch/demo_3d_site/index.html', 'w', encoding='utf-8').write(content)
    print('OK')
else:
    print('MARKER NOT FOUND')
