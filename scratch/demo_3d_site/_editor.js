/**
 * PAGE EDITOR ENGINE — Wix-like visual editor
 * Handles: element selection, drag, resize, text editing,
 * font/color toolbar, localStorage persistence.
 */
(function initPageEditor() {
  'use strict';

  // ─── State ─────────────────────────────────────────────────────
  let editorMode   = false;
  let selectedEl   = null;
  let isDragging   = false;
  let dragOffX     = 0, dragOffY = 0;
  let unsavedChanges = false;

  const LS_KEY = 'master_ag_page_edits';

  // Available fonts
  const FONTS = [
    { label: 'Inter',          value: "'Inter', sans-serif" },
    { label: 'Playfair',       value: "'Playfair Display', serif" },
    { label: 'JetBrains Mono', value: "'JetBrains Mono', monospace" },
    { label: 'Outfit',         value: "'Outfit', sans-serif" },
    { label: 'Georgia',        value: "Georgia, serif" },
    { label: 'System',         value: "system-ui, sans-serif" },
  ];

  // ─── DOM refs (populated in init) ──────────────────────────────
  let toolbar, fontSelect, fontSizeInput, colorPicker, boldBtn,
      italicBtn, alignBtns, resetBtn, editorModeBtn, statusBar,
      editorSaveBtn;

  // ─── Init ──────────────────────────────────────────────────────
  function init() {
    buildToolbarDOM();
    loadEdits();           // Apply any saved edits from localStorage
    bindPanelButton();     // Wire up the ✏️ Editor Mode toggle in settings
    bindEditorSaveBtn();   // Wire up the 💾 Save button
  }

  // ─── Toolbar DOM builder ───────────────────────────────────────
  function buildToolbarDOM() {
    toolbar = document.getElementById('editor-toolbar');
    if (!toolbar) return; // Panel HTML not injected yet

    fontSelect    = document.getElementById('ed-font');
    fontSizeInput = document.getElementById('ed-font-size');
    colorPicker   = document.getElementById('ed-color');
    boldBtn       = document.getElementById('ed-bold');
    italicBtn     = document.getElementById('ed-italic');
    alignBtns     = document.querySelectorAll('[data-align]');
    resetBtn      = document.getElementById('ed-reset');
    editorModeBtn = document.getElementById('editor-mode-btn');
    statusBar     = document.getElementById('editor-status-bar');
    editorSaveBtn = document.getElementById('editor-save-btn');

    // Populate font dropdown
    FONTS.forEach(f => {
      const opt = document.createElement('option');
      opt.value = f.value;
      opt.textContent = f.label;
      fontSelect.appendChild(opt);
    });

    // Toolbar event listeners
    fontSelect.addEventListener('change', () => applyProp('fontFamily', fontSelect.value));
    fontSizeInput.addEventListener('input', () => applyProp('fontSize', fontSizeInput.value + 'px'));
    colorPicker.addEventListener('input', () => applyProp('color', colorPicker.value));
    boldBtn.addEventListener('click', () => toggleProp('fontWeight', 'bold', '400', boldBtn));
    italicBtn.addEventListener('click', () => toggleProp('fontStyle', 'italic', 'normal', italicBtn));
    alignBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        alignBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyProp('textAlign', btn.dataset.align);
      });
    });
    resetBtn.addEventListener('click', resetElement);

    // Close toolbar on outside click
    document.addEventListener('mousedown', e => {
      if (toolbar && toolbar.contains(e.target)) return;
      if (selectedEl && selectedEl.contains(e.target)) return;
      if (e.target.hasAttribute('data-editable')) return;
      deselect();
    });

    // ESC to deselect
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && editorMode) {
        if (selectedEl && selectedEl.isContentEditable) {
          selectedEl.contentEditable = 'false';
          selectedEl.style.cursor = '';
        }
        deselect();
      }
    });
  }

  // ─── Panel button wiring ───────────────────────────────────────
  function bindPanelButton() {
    editorModeBtn = editorModeBtn || document.getElementById('editor-mode-btn');
    if (!editorModeBtn) return;
    editorModeBtn.addEventListener('click', toggleEditorMode);
  }

  function bindEditorSaveBtn() {
    editorSaveBtn = editorSaveBtn || document.getElementById('editor-save-btn');
    if (!editorSaveBtn) return;
    editorSaveBtn.addEventListener('click', saveEdits);
  }

  // ─── Toggle editor mode ────────────────────────────────────────
  function toggleEditorMode() {
    editorMode = !editorMode;
    document.body.classList.toggle('editor-active', editorMode);

    if (editorModeBtn) {
      editorModeBtn.classList.toggle('editor-on', editorMode);
      editorModeBtn.innerHTML = editorMode
        ? '✏️ Editor Mode: ON'
        : '✏️ Editor Mode: OFF';
    }
    if (statusBar) {
      statusBar.textContent = editorMode
        ? 'Click any text to select • Double-click to edit'
        : '';
    }
    if (editorSaveBtn) {
      editorSaveBtn.classList.toggle('visible', editorMode);
    }

    if (!editorMode) {
      deselect();
      hideToolbar();
    } else {
      attachEditableListeners();
    }
  }

  // ─── Attach listeners to all [data-editable] elements ─────────
  function attachEditableListeners() {
    document.querySelectorAll('[data-editable]').forEach(el => {
      // Avoid double-binding
      if (el._editorBound) return;
      el._editorBound = true;

      // Single click → select
      el.addEventListener('mousedown', e => {
        if (!editorMode) return;
        if (el.isContentEditable) return; // Don't interrupt inline editing
        e.stopPropagation();
        select(el);
        startDrag(e, el);
      });

      // Double click → inline text edit
      el.addEventListener('dblclick', e => {
        if (!editorMode) return;
        e.stopPropagation();
        el.contentEditable = 'true';
        el.style.cursor = 'text';
        el.focus();
        // place cursor at click position
        const range = document.caretRangeFromPoint(e.clientX, e.clientY);
        if (range) {
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        }
        // Commit on blur
        el.addEventListener('blur', () => {
          el.contentEditable = 'false';
          el.style.cursor = '';
          markUnsaved();
          autoSave();
        }, { once: true });
      });

      // Prevent link navigation in editor mode
      if (el.tagName === 'A') {
        el.addEventListener('click', e => { if (editorMode) e.preventDefault(); });
      }
    });
  }

  // ─── Select an element ─────────────────────────────────────────
  function select(el) {
    if (selectedEl === el) return;
    if (selectedEl) selectedEl.classList.remove('el-selected');

    selectedEl = el;
    el.classList.add('el-selected');

    // Set label badge
    const tag = el.tagName.toLowerCase();
    const cls = el.className.replace(/el-selected|el-dragging/g, '').trim().split(' ')[0];
    el.setAttribute('data-ed-label', cls || tag);

    syncToolbarToElement(el);
    showToolbar(el);

    if (statusBar) {
      statusBar.textContent = `Selected: ${el.getAttribute('data-ed-label')} • Dbl-click to edit text`;
    }
  }

  function deselect() {
    if (selectedEl) {
      selectedEl.classList.remove('el-selected', 'el-dragging');
      selectedEl = null;
    }
    hideToolbar();
    if (statusBar) {
      statusBar.textContent = editorMode ? 'Click any text to select • Double-click to edit' : '';
    }
  }

  // ─── Toolbar sync ──────────────────────────────────────────────
  function syncToolbarToElement(el) {
    const cs = window.getComputedStyle(el);
    if (fontSelect) fontSelect.value = el.style.fontFamily || cs.fontFamily;
    if (fontSizeInput) fontSizeInput.value = parseInt(el.style.fontSize || cs.fontSize) || 16;
    if (colorPicker) colorPicker.value = rgbToHex(el.style.color || cs.color);
    if (boldBtn) boldBtn.classList.toggle('active', (el.style.fontWeight || cs.fontWeight) === 'bold' || parseInt(cs.fontWeight) >= 700);
    if (italicBtn) italicBtn.classList.toggle('active', (el.style.fontStyle || cs.fontStyle) === 'italic');
    if (alignBtns) {
      const align = el.style.textAlign || cs.textAlign || 'left';
      alignBtns.forEach(b => b.classList.toggle('active', b.dataset.align === align));
    }
  }

  // ─── Show/Hide toolbar ─────────────────────────────────────────
  function showToolbar(el) {
    if (!toolbar) return;
    const rect = el.getBoundingClientRect();
    let top = rect.top - 150;
    let left = rect.left;
    if (top < 8) top = rect.bottom + 8;
    if (left + 280 > window.innerWidth) left = window.innerWidth - 288;
    toolbar.style.top  = top + 'px';
    toolbar.style.left = left + 'px';
    toolbar.classList.add('visible');
  }

  function hideToolbar() {
    if (toolbar) toolbar.classList.remove('visible');
  }

  // ─── Apply a CSS property ──────────────────────────────────────
  function applyProp(prop, value) {
    if (!selectedEl) return;
    selectedEl.style[prop] = value;
    markUnsaved();
    autoSave();
  }

  function toggleProp(prop, onVal, offVal, btn) {
    if (!selectedEl) return;
    const current = selectedEl.style[prop] || window.getComputedStyle(selectedEl)[prop];
    const isOn = current === onVal || (prop === 'fontWeight' && parseInt(current) >= 700);
    selectedEl.style[prop] = isOn ? offVal : onVal;
    btn.classList.toggle('active', !isOn);
    markUnsaved();
    autoSave();
  }

  // ─── Reset element to original styles ─────────────────────────
  function resetElement() {
    if (!selectedEl) return;
    const id = selectedEl.dataset.editableId;
    // Remove all inline styles applied by editor
    const editorProps = ['fontFamily','fontSize','color','fontWeight','fontStyle','textAlign','left','top','width'];
    editorProps.forEach(p => selectedEl.style.removeProperty(
      p.replace(/([A-Z])/g, '-$1').toLowerCase()
    ));
    selectedEl.removeAttribute('data-ed-dragged');
    selectedEl.contentEditable = 'false';

    // Remove from saved state
    if (id) {
      const saves = loadSavedEdits();
      delete saves[id];
      localStorage.setItem(LS_KEY, JSON.stringify(saves));
    }
    syncToolbarToElement(selectedEl);
    markUnsaved();
  }

  // ─── Drag ──────────────────────────────────────────────────────
  function startDrag(e, el) {
    if (!editorMode) return;
    // Don't start drag if in inline text edit mode
    if (el.isContentEditable) return;

    const rect = el.getBoundingClientRect();
    dragOffX = e.clientX - rect.left;
    dragOffY = e.clientY - rect.top;

    let moved = false;

    function onMove(ev) {
      if (!moved) {
        // Only initiate drag if moved > 4px (avoid accidental drags on click)
        const dx = ev.clientX - e.clientX;
        const dy = ev.clientY - e.clientY;
        if (Math.sqrt(dx*dx + dy*dy) < 4) return;
        moved = true;
        isDragging = true;
        el.classList.add('el-dragging');
        el.setAttribute('data-ed-dragged', 'true');
        el.style.position = 'fixed';
        el.style.zIndex   = '8999';
        el.style.margin   = '0';
        hideToolbar();
      }
      el.style.left = (ev.clientX - dragOffX) + 'px';
      el.style.top  = (ev.clientY - dragOffY) + 'px';
    }

    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      if (moved) {
        isDragging = false;
        el.classList.remove('el-dragging');
        showToolbar(el);
        markUnsaved();
        autoSave();
      }
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  // ─── Persistence ──────────────────────────────────────────────
  function getEditableId(el) {
    // Assign a stable ID for persistence
    if (!el.dataset.editableId) {
      const tag = el.tagName.toLowerCase();
      const cls = el.className.replace(/el-selected|el-dragging/g, '').trim().replace(/\s+/g, '_');
      const idx = Array.from(document.querySelectorAll('[data-editable]')).indexOf(el);
      el.dataset.editableId = `${tag}_${cls}_${idx}`;
    }
    return el.dataset.editableId;
  }

  function loadSavedEdits() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); }
    catch(e) { return {}; }
  }

  function autoSave() {
    const saves = loadSavedEdits();
    document.querySelectorAll('[data-editable]').forEach(el => {
      const id = getEditableId(el);
      const data = {};
      // Capture inline styles set by editor
      const editorProps = ['fontFamily','fontSize','color','fontWeight','fontStyle','textAlign','left','top'];
      editorProps.forEach(p => { if (el.style[p]) data[p] = el.style[p]; });
      if (el.getAttribute('data-ed-dragged')) data._dragged = true;
      if (el.innerHTML !== el._originalHTML) data._html = el.innerHTML;
      if (Object.keys(data).length) saves[id] = data;
    });
    localStorage.setItem(LS_KEY, JSON.stringify(saves));
    unsavedChanges = false;
    if (editorSaveBtn) editorSaveBtn.textContent = '💾 Saved ✓';
    setTimeout(() => {
      if (editorSaveBtn) editorSaveBtn.textContent = '💾 Save Changes';
    }, 1500);
  }

  function saveEdits() {
    autoSave();
  }

  function loadEdits() {
    // Store originals before applying
    document.querySelectorAll('[data-editable]').forEach(el => {
      el._originalHTML = el.innerHTML;
    });

    const saves = loadSavedEdits();
    if (!Object.keys(saves).length) return;

    document.querySelectorAll('[data-editable]').forEach(el => {
      const id = getEditableId(el);
      const data = saves[id];
      if (!data) return;
      Object.entries(data).forEach(([k, v]) => {
        if (k === '_html') { el.innerHTML = v; return; }
        if (k === '_dragged') { el.setAttribute('data-ed-dragged', 'true'); return; }
        el.style[k] = v;
      });
      // Restore fixed position for dragged elements
      if (data._dragged) {
        el.style.position = 'fixed';
        el.style.zIndex   = '8999';
        el.style.margin   = '0';
      }
    });
  }

  function markUnsaved() {
    unsavedChanges = true;
    if (editorSaveBtn) editorSaveBtn.textContent = '💾 Save Changes ●';
  }

  // ─── Utility: RGB to Hex ───────────────────────────────────────
  function rgbToHex(rgb) {
    if (!rgb || rgb === 'transparent') return '#000000';
    if (rgb.startsWith('#')) return rgb;
    const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!m) return '#000000';
    return '#' + [m[1], m[2], m[3]].map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
  }

  // ─── Expose globally ───────────────────────────────────────────
  window.pageEditor = { init, toggleEditorMode, saveEdits, loadEdits };

  // Auto-init after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Call after a tick so panel HTML is already rendered
    setTimeout(init, 100);
  }
})();
