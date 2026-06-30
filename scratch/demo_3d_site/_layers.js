/**
 * LAYER PANEL — Photoshop-style floating layer compositor
 * Shows all [data-editable] elements grouped by their closest section ancestor.
 * Features: visibility toggle, lock, z-index reorder (↑↓ per section stack), select on click.
 * Refreshed by _editor.js whenever elements are created, deleted, or selected.
 */
(function initLayerPanel() {
  'use strict';

  let panelEl   = null;
  let bodyEl    = null;
  let visible   = false;
  const PANEL_POS_KEY = 'master_ag_layer_panel_pos';

  // ── Build HTML ─────────────────────────────────────────────────
  function buildPanel() {
    if (panelEl) return;

    panelEl = document.createElement('div');
    panelEl.id = 'layer-panel';
    panelEl.innerHTML = `
      <div id="layer-panel-drag" title="Drag to move"></div>
      <div id="layer-panel-header">
        <span id="layer-panel-title">⬛ Layers</span>
        <div style="display:flex;gap:4px;align-items:center;">
          <button id="layer-panel-refresh" class="lp-hdr-btn" title="Refresh">↺</button>
          <button id="layer-panel-min" class="lp-hdr-btn" title="Minimize">−</button>
        </div>
      </div>
      <div id="layer-panel-body"></div>
    `;
    document.body.appendChild(panelEl);
    bodyEl = panelEl.querySelector('#layer-panel-body');

    // Restore saved position
    try {
      const saved = JSON.parse(localStorage.getItem(PANEL_POS_KEY) || 'null');
      if (saved) {
        if (saved.left) panelEl.style.left   = saved.left;
        if (saved.top)  panelEl.style.top    = saved.top;
        if (saved.minimized) panelEl.classList.add('lp-minimized');
      }
    } catch(e) {}

    initDrag();

    panelEl.querySelector('#layer-panel-min').addEventListener('click', () => {
      const isMin = panelEl.classList.toggle('lp-minimized');
      panelEl.querySelector('#layer-panel-min').textContent = isMin ? '＋' : '−';
      savePanelPos();
    });
    panelEl.querySelector('#layer-panel-refresh').addEventListener('click', render);
  }

  function savePanelPos() {
    if (!panelEl) return;
    localStorage.setItem(PANEL_POS_KEY, JSON.stringify({
      left: panelEl.style.left,
      top:  panelEl.style.top,
      minimized: panelEl.classList.contains('lp-minimized')
    }));
  }

  // ── Drag ────────────────────────────────────────────────────────
  function initDrag() {
    const drag = panelEl.querySelector('#layer-panel-drag');
    drag.addEventListener('mousedown', e => {
      e.preventDefault();
      const rect = panelEl.getBoundingClientRect();
      const offX = e.clientX - rect.left;
      const offY = e.clientY - rect.top;

      function onMove(ev) {
        panelEl.style.left   = (ev.clientX - offX) + 'px';
        panelEl.style.top    = (ev.clientY - offY) + 'px';
        panelEl.style.right  = 'auto';
        panelEl.style.bottom = 'auto';
      }
      function onUp() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup',   onUp);
        savePanelPos();
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup',   onUp);
    });
  }

  // ── Section detection ───────────────────────────────────────────
  function getSection(el) {
    const ancestor = el.closest('header, section, footer, main') ||
                     el.closest('[id]') ||
                     document.body;
    const tag   = ancestor.tagName.toLowerCase();
    const id    = ancestor.id;
    const label = id
      ? (tag === 'section' ? ('Section ' + (id || '')) : id)
      : (tag === 'header' ? 'Header' : tag === 'footer' ? 'Footer' : 'Main');
    return { key: id || tag + '_' + tag, label, el: ancestor };
  }

  // ── Row label ───────────────────────────────────────────────────
  function getLabel(el) {
    const tag = el.tagName.toLowerCase();
    // Try: first text content (truncated), then class, then tag
    const text = (el.textContent || '').trim().replace(/\s+/g,' ').slice(0, 22);
    if (text) return text || tag;
    const cls = (el.className || '').replace(/el-selected|el-dragging|reveal|on/g,'').trim().split(' ').find(c => c.length > 1);
    return cls || tag + (el.id ? '#'+el.id : '');
  }

  // ── Render ──────────────────────────────────────────────────────
  function render() {
    if (!bodyEl) return;

    const allEls  = Array.from(document.querySelectorAll('[data-editable]'));
    const secMap  = new Map(); // key → { label, secEl, items: [] }

    allEls.forEach(el => {
      const sec = getSection(el);
      if (!secMap.has(sec.key)) {
        secMap.set(sec.key, { label: sec.label, secEl: sec.el, items: [] });
      }
      secMap.get(sec.key).items.push(el);
    });

    bodyEl.innerHTML = '';

    if (secMap.size === 0) {
      bodyEl.innerHTML = `<div class="lp-empty">No editable elements.<br>Enable ✏️ Editor Mode first.</div>`;
      return;
    }

    // Section ordering: document order
    const orderedSecs = [...secMap.entries()].sort((a, b) => {
      const aEl = a[1].secEl;
      const bEl = b[1].secEl;
      if (!aEl || !bEl) return 0;
      const pos = aEl.compareDocumentPosition(bEl);
      return (pos & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1;
    });

    orderedSecs.forEach(([secKey, group]) => {
      const grp = document.createElement('div');
      grp.className = 'lp-group';

      // ── Section header ──
      const hdr = document.createElement('div');
      hdr.className = 'lp-group-header';
      hdr.innerHTML = `<span class="lp-arrow">▾</span><span class="lp-sec-name">${group.label}</span><span class="lp-sec-count">${group.items.length}</span>`;

      let collapsed = false;
      const rowsWrap = document.createElement('div');
      rowsWrap.className = 'lp-rows';

      hdr.addEventListener('click', () => {
        collapsed = !collapsed;
        rowsWrap.style.display = collapsed ? 'none' : '';
        hdr.querySelector('.lp-arrow').textContent = collapsed ? '▸' : '▾';
      });

      // Sort by layerZ descending (higher z = top of list, like Photoshop)
      const sorted = [...group.items].sort((a, b) =>
        (parseInt(b.dataset.layerZ) || 0) - (parseInt(a.dataset.layerZ) || 0)
      );

      sorted.forEach(el => {
        const row = buildRow(el, secKey);
        rowsWrap.appendChild(row);
      });

      grp.appendChild(hdr);
      grp.appendChild(rowsWrap);
      bodyEl.appendChild(grp);
    });
  }

  function buildRow(el) {
    const row = document.createElement('div');
    row.className = 'lp-row';
    if (el.classList.contains('el-selected')) row.classList.add('lp-selected');

    const isHidden  = el.dataset.layerHidden === 'true';
    const isLocked  = el.dataset.edLocked === 'true';
    const hasAnim   = el.dataset.scrollKfs && JSON.parse(el.dataset.scrollKfs || '[]').length > 0;
    const layerZ    = parseInt(el.dataset.layerZ) || 0;
    const label     = getLabel(el);

    row.innerHTML = `
      <button class="lp-btn lp-eye" title="${isHidden ? 'Show' : 'Hide'}">${isHidden ? '🙈' : '👁'}</button>
      <button class="lp-btn lp-lock" title="${isLocked ? 'Unlock' : 'Lock'}">${isLocked ? '🔒' : '🔓'}</button>
      <span class="lp-label${hasAnim ? ' lp-has-anim' : ''}" title="${label}">${label}</span>
      <div class="lp-z-ctrl">
        <button class="lp-btn lp-up" title="Move forward (higher z)">↑</button>
        <span class="lp-z-num">${layerZ}</span>
        <button class="lp-btn lp-dn" title="Move backward (lower z)">↓</button>
      </div>
    `;

    // Eye — visibility
    row.querySelector('.lp-eye').addEventListener('click', e => {
      e.stopPropagation();
      const hide = el.dataset.layerHidden !== 'true';
      el.dataset.layerHidden = hide ? 'true' : 'false';
      el.style.visibility = hide ? 'hidden' : '';
      render();
    });

    // Lock — delegate to editor
    row.querySelector('.lp-lock').addEventListener('click', e => {
      e.stopPropagation();
      const locked = el.dataset.edLocked === 'true';
      el.dataset.edLocked = locked ? 'false' : 'true';
      // Ripple feedback
      if (window.spawnRipple) {
        const r = el.getBoundingClientRect();
        window.spawnRipple(r.left + r.width/2, r.top + r.height/2, locked ? '#cebdf8' : '#ffaa00', 3, false);
      }
      render();
    });

    // Label click — select element
    row.querySelector('.lp-label').addEventListener('click', () => {
      if (window.pageEditor && window.pageEditor.selectElement) {
        window.pageEditor.selectElement(el);
      }
    });

    // Move forward (↑)
    row.querySelector('.lp-up').addEventListener('click', e => {
      e.stopPropagation();
      const z = (parseInt(el.dataset.layerZ) || 0) + 1;
      setLayerZ(el, z);
    });

    // Move backward (↓)
    row.querySelector('.lp-dn').addEventListener('click', e => {
      e.stopPropagation();
      const z = (parseInt(el.dataset.layerZ) || 0) - 1;
      setLayerZ(el, z);
    });

    return row;
  }

  function setLayerZ(el, z) {
    el.dataset.layerZ = z;
    // Base z-index: 1000 + layerZ, so layerZ 0 = z 1000, layerZ 5 = z 1005, etc.
    el.style.zIndex = Math.max(1, 1000 + z);
    render();
    // Notify editor to save
    if (window.pageEditor && window.pageEditor.saveEdits) {
      window.pageEditor.saveEdits();
    }
  }

  // ── Show / Hide ─────────────────────────────────────────────────
  function show() {
    if (!panelEl) buildPanel();
    panelEl.style.display = 'flex';
    visible = true;
    render();
    // Update toggle button icon
    const btn = document.getElementById('layer-toggle-btn');
    if (btn) btn.classList.add('active');
  }

  function hide() {
    if (panelEl) panelEl.style.display = 'none';
    visible = false;
    const btn = document.getElementById('layer-toggle-btn');
    if (btn) btn.classList.remove('active');
  }

  function toggle() {
    visible ? hide() : show();
  }

  // ── Public API ──────────────────────────────────────────────────
  window.layerPanel = { show, hide, toggle, render };

  // ── Init ────────────────────────────────────────────────────────
  function init() {
    buildPanel();
    // Start hidden
    if (panelEl) panelEl.style.display = 'none';

    // Wire toggle button
    const toggleBtn = document.getElementById('layer-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', toggle);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 150);
  }

})();
