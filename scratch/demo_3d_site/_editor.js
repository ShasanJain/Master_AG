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
  let isResizing   = false;
  let dragOffX     = 0, dragOffY = 0;
  let unsavedChanges = false;

  const LS_KEY = 'master_ag_page_edits';
  const PANEL_POS_KEY = 'master_ag_panel_position';

  // Undo & Redo Stacks
  let undoStack = [];
  let redoStack = [];

  // Available fonts (added Syne and Outfit)
  const FONTS = [
    { label: 'Inter',          value: "'Inter', sans-serif" },
    { label: 'Playfair',       value: "'Playfair Display', serif" },
    { label: 'JetBrains Mono', value: "'JetBrains Mono', monospace" },
    { label: 'Outfit',         value: "'Outfit', sans-serif" },
    { label: 'Syne',           value: "'Syne', sans-serif" },
    { label: 'Georgia',        value: "Georgia, serif" },
    { label: 'System',         value: "system-ui, sans-serif" },
  ];

  // ─── DOM refs (populated in init) ──────────────────────────────
  let toolbar, fontSelect, fontSizeInput, colorPicker, boldBtn,
      italicBtn, alignBtns, resetBtn, editorModeBtn, statusBar,
      editorSaveBtn, selectBox, debugPanel, dragHandle, minBtn,
      undoBtn, redoBtn;

  // ─── Init ──────────────────────────────────────────────────────
  function init() {
    buildToolbarDOM();
    initDebugPanelControls(); // Make debug panel draggable & minimizable
    loadEdits();             // Apply any saved edits from localStorage
    bindPanelButton();       // Wire up the ✏️ Editor Mode toggle in settings
    bindEditorSaveBtn();     // Wire up the 💾 Save button
    initResizeHandles();     // Set up resizing handlers
  }

  // ─── Debug Panel Controls (Drag & Minimize) ────────────────────
  function initDebugPanelControls() {
    debugPanel = document.getElementById('debug-panel');
    dragHandle = document.getElementById('debug-panel-drag');
    minBtn     = document.getElementById('debug-min-btn');

    if (!debugPanel) return;

    // Load saved position
    const savedPos = localStorage.getItem(PANEL_POS_KEY);
    if (savedPos) {
      try {
        const { left, top, bottom, minimized } = JSON.parse(savedPos);
        if (left !== undefined) debugPanel.style.left = left;
        if (top !== undefined) {
          debugPanel.style.top = top;
          debugPanel.style.bottom = 'auto';
        } else if (bottom !== undefined) {
          debugPanel.style.bottom = bottom;
        }
        if (minimized) {
          debugPanel.classList.add('minimized');
          if (minBtn) minBtn.textContent = '＋';
        }
      } catch (e) {}
    }

    // Drag Logic
    if (dragHandle) {
      dragHandle.addEventListener('mousedown', e => {
        e.preventDefault();
        const rect = debugPanel.getBoundingClientRect();
        const offX = e.clientX - rect.left;
        const offY = e.clientY - rect.top;

        function onMove(ev) {
          debugPanel.style.left = (ev.clientX - offX) + 'px';
          debugPanel.style.top = (ev.clientY - offY) + 'px';
          debugPanel.style.bottom = 'auto';
        }

        function onUp() {
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
          savePanelState();
        }

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });
    }

    // Minimize Logic
    if (minBtn) {
      minBtn.addEventListener('click', () => {
        const isMin = debugPanel.classList.toggle('minimized');
        minBtn.textContent = isMin ? '＋' : '－';
        savePanelState();
      });
    }
  }

  function savePanelState() {
    if (!debugPanel) return;
    const state = {
      left: debugPanel.style.left,
      top: debugPanel.style.top,
      bottom: debugPanel.style.bottom,
      minimized: debugPanel.classList.contains('minimized')
    };
    localStorage.setItem(PANEL_POS_KEY, JSON.stringify(state));
  }

  // ─── Toolbar DOM builder ───────────────────────────────────────
  function buildToolbarDOM() {
    toolbar = document.getElementById('editor-toolbar');
    selectBox = document.getElementById('editor-select-box');
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
    undoBtn       = document.getElementById('ed-undo');
    redoBtn       = document.getElementById('ed-redo');

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

    // Undo & Redo Event listeners
    if (undoBtn) {
      undoBtn.addEventListener('click', () => {
        if (undoStack.length > 1) {
          const current = undoStack.pop();
          redoStack.push(current);
          const previous = undoStack[undoStack.length - 1];
          applyEditsSnapshot(previous);
          autoSaveSilent();
        }
      });
    }

    if (redoBtn) {
      redoBtn.addEventListener('click', () => {
        if (redoStack.length > 0) {
          const next = redoStack.pop();
          undoStack.push(next);
          applyEditsSnapshot(next);
          autoSaveSilent();
        }
      });
    }

    // Close toolbar on outside click
    document.addEventListener('mousedown', e => {
      if (isDragging || isResizing) return;
      if (toolbar && toolbar.contains(e.target)) return;
      if (selectBox && selectBox.contains(e.target)) return;
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

    // Sync select box position on scroll/resize
    window.addEventListener('scroll', updateSelectBoxPos, { passive: true });
    window.addEventListener('resize', updateSelectBoxPos, { passive: true });
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
        ? 'Click any text to select • Drag to move • Pull handles to resize'
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
      if (el._editorBound) return;
      el._editorBound = true;

      // Single click → select
      el.addEventListener('mousedown', e => {
        if (!editorMode) return;
        if (el.isContentEditable) return;
        if (e.target.closest('#editor-toolbar') || e.target.closest('#editor-select-box')) return;
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
        
        const range = document.caretRangeFromPoint(e.clientX, e.clientY);
        if (range) {
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        }

        el.addEventListener('blur', () => {
          el.contentEditable = 'false';
          el.style.cursor = '';
          markUnsaved();
          autoSave();
          updateSelectBoxPos();
        }, { once: true });
      });

      if (el.tagName === 'A') {
        el.addEventListener('click', e => { if (editorMode) e.preventDefault(); });
      }
    });
  }

  // ─── Select / Deselect ─────────────────────────────────────────
  function select(el) {
    if (selectedEl === el) return;
    if (selectedEl) selectedEl.classList.remove('el-selected');

    selectedEl = el;
    el.classList.add('el-selected');

    const tag = el.tagName.toLowerCase();
    const cls = el.className.replace(/el-selected|el-dragging/g, '').trim().split(' ')[0];
    el.setAttribute('data-ed-label', cls || tag);

    syncToolbarToElement(el);
    showToolbar(el);
    updateSelectBoxPos();

    if (statusBar) {
      statusBar.textContent = `Selected: ${el.getAttribute('data-ed-label')} • Drag to move • Double-click to edit text`;
    }
  }

  function deselect() {
    if (selectedEl) {
      selectedEl.classList.remove('el-selected', 'el-dragging');
      selectedEl = null;
    }
    if (selectBox) selectBox.style.display = 'none';
    hideToolbar();
    if (statusBar) {
      statusBar.textContent = editorMode ? 'Click any text to select • Drag to move • Pull handles to resize' : '';
    }
  }

  // ─── Selection Box Position Sync ───────────────────────────────
  function updateSelectBoxPos() {
    if (!selectedEl || !selectBox || !editorMode) return;
    const rect = selectedEl.getBoundingClientRect();
    selectBox.style.left   = rect.left + 'px';
    selectBox.style.top    = rect.top + 'px';
    selectBox.style.width  = rect.width + 'px';
    selectBox.style.height = rect.height + 'px';
    selectBox.style.display = 'block';
  }

  // ─── Resize Handles Logic ──────────────────────────────────────
  function initResizeHandles() {
    selectBox = selectBox || document.getElementById('editor-select-box');
    if (!selectBox) return;

    selectBox.querySelectorAll('.ed-resize-handle').forEach(handle => {
      handle.addEventListener('mousedown', e => {
        if (!selectedEl) return;
        e.preventDefault();
        e.stopPropagation();

        isResizing = true;
        const type = handle.dataset.handle;
        const rect = selectedEl.getBoundingClientRect();
        
        const startX = e.clientX;
        const startY = e.clientY;
        const startW = rect.width;
        const startH = rect.height;
        const startLeft = rect.left;
        const startTop = rect.top;

        // Determine starting font size
        const cs = window.getComputedStyle(selectedEl);
        const startFS = parseFloat(cs.fontSize) || 16;

        function onMove(ev) {
          let dx = ev.clientX - startX;
          let dy = ev.clientY - startY;

          let newWidth  = startW;
          let newHeight = startH;
          let newLeft   = startLeft;
          let newTop    = startTop;

          // Horizontal resize
          if (type.includes('r')) {
            newWidth = Math.max(20, startW + dx);
          } else if (type.includes('l')) {
            const possibleW = startW - dx;
            if (possibleW > 20) {
              newWidth = possibleW;
              newLeft = startLeft + dx;
            }
          }

          // Vertical resize
          if (type.includes('b')) {
            newHeight = Math.max(20, startH + dy);
          } else if (type.includes('t')) {
            const possibleH = startH - dy;
            if (possibleH > 20) {
              newHeight = possibleH;
              newTop = startTop + dy;
            }
          }

          // Proportional Font Resizing for text elements
          if (type.length === 2) { // Corner handles: tl, tr, bl, br
            const scale = newWidth / startW;
            const newFS = Math.max(8, startFS * scale);
            selectedEl.style.fontSize = newFS + 'px';
            if (fontSizeInput) fontSizeInput.value = Math.round(newFS);
          }

          // Apply dimensions
          selectedEl.style.position = 'fixed';
          selectedEl.style.zIndex   = '8999';
          selectedEl.style.margin   = '0';
          selectedEl.setAttribute('data-ed-dragged', 'true');

          selectedEl.style.width  = newWidth + 'px';
          selectedEl.style.height = newHeight + 'px';
          selectedEl.style.left   = newLeft + 'px';
          selectedEl.style.top    = newTop + 'px';

          updateSelectBoxPos();
        }

        function onUp() {
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
          isResizing = false;
          showToolbar(selectedEl);
          markUnsaved();
          autoSave();
        }

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
        hideToolbar();
      });
    });
  }

  // ─── Font Normalization & Comparison ───────────────────────────
  function matchFont(family) {
    if (!family) return FONTS[0].value;
    const clean = family.replace(/['"\s]/g, '').toLowerCase();
    for (const f of FONTS) {
      const cleanVal = f.value.replace(/['"\s]/g, '').toLowerCase();
      if (clean.includes(cleanVal) || cleanVal.includes(clean)) {
        return f.value;
      }
    }
    return FONTS[0].value; // default to first
  }

  // ─── Toolbar sync ──────────────────────────────────────────────
  function syncToolbarToElement(el) {
    const cs = window.getComputedStyle(el);
    if (fontSelect) {
      const currentFont = el.style.fontFamily || cs.fontFamily;
      fontSelect.value = matchFont(currentFont);
    }
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
    updateSelectBoxPos();
  }

  function toggleProp(prop, onVal, offVal, btn) {
    if (!selectedEl) return;
    const current = selectedEl.style[prop] || window.getComputedStyle(selectedEl)[prop];
    const isOn = current === onVal || (prop === 'fontWeight' && parseInt(current) >= 700);
    selectedEl.style[prop] = isOn ? offVal : onVal;
    btn.classList.toggle('active', !isOn);
    markUnsaved();
    autoSave();
    updateSelectBoxPos();
  }

  // ─── Reset element to original styles ─────────────────────────
  function resetElement() {
    if (!selectedEl) return;
    const id = selectedEl.dataset.editableId;
    const editorProps = ['fontFamily','fontSize','color','fontWeight','fontStyle','textAlign','left','top','width','height'];
    editorProps.forEach(p => selectedEl.style.removeProperty(
      p.replace(/([A-Z])/g, '-$1').toLowerCase()
    ));
    selectedEl.removeAttribute('data-ed-dragged');
    selectedEl.contentEditable = 'false';

    if (id) {
      const saves = loadSavedEdits();
      delete saves[id];
      localStorage.setItem(LS_KEY, JSON.stringify(saves));
    }
    syncToolbarToElement(selectedEl);
    updateSelectBoxPos();
    markUnsaved();
    autoSave();
  }

  // ─── Drag ──────────────────────────────────────────────────────
  function startDrag(e, el) {
    if (!editorMode) return;
    if (el.isContentEditable) return;

    const rect = el.getBoundingClientRect();
    dragOffX = e.clientX - rect.left;
    dragOffY = e.clientY - rect.top;

    let moved = false;

    function onMove(ev) {
      if (!moved) {
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
      updateSelectBoxPos();
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

  function getEditsSnapshot() {
    const snapshot = {};
    document.querySelectorAll('[data-editable]').forEach(el => {
      const id = getEditableId(el);
      const data = {};
      const editorProps = ['fontFamily','fontSize','color','fontWeight','fontStyle','textAlign','left','top','width','height'];
      editorProps.forEach(p => { if (el.style[p]) data[p] = el.style[p]; });
      if (el.getAttribute('data-ed-dragged')) data._dragged = true;
      if (el.innerHTML !== el._originalHTML) data._html = el.innerHTML;
      if (Object.keys(data).length) snapshot[id] = data;
    });
    return JSON.stringify(snapshot);
  }

  function applyEditsSnapshot(snapJSON) {
    const saves = JSON.parse(snapJSON || '{}');
    document.querySelectorAll('[data-editable]').forEach(el => {
      const id = getEditableId(el);
      const data = saves[id];

      // Reset
      const editorProps = ['fontFamily','fontSize','color','fontWeight','fontStyle','textAlign','left','top','width','height'];
      editorProps.forEach(p => el.style.removeProperty(p.replace(/([A-Z])/g, '-$1').toLowerCase()));
      el.removeAttribute('data-ed-dragged');
      el.style.position = '';
      el.style.zIndex   = '';
      el.style.margin   = '';
      el.innerHTML = el._originalHTML;

      if (!data) return;

      Object.entries(data).forEach(([k, v]) => {
        if (k === '_html') { el.innerHTML = v; return; }
        if (k === '_dragged') { el.setAttribute('data-ed-dragged', 'true'); return; }
        el.style[k] = v;
      });

      if (data._dragged) {
        el.style.position = 'fixed';
        el.style.zIndex   = '8999';
        el.style.margin   = '0';
      }
    });

    if (selectedEl) {
      syncToolbarToElement(selectedEl);
      updateSelectBoxPos();
    }
  }

  function initUndoRedo() {
    undoStack = [getEditsSnapshot()];
    redoStack = [];
  }

  function recordChange() {
    const snap = getEditsSnapshot();
    if (undoStack.length > 0 && undoStack[undoStack.length - 1] === snap) return;
    undoStack.push(snap);
    redoStack = []; // clear redo
  }

  function autoSave() {
    const snap = getEditsSnapshot();
    localStorage.setItem(LS_KEY, snap);
    recordChange();
    unsavedChanges = false;
    if (editorSaveBtn) editorSaveBtn.textContent = '💾 Saved ✓';
    setTimeout(() => {
      if (editorSaveBtn) editorSaveBtn.textContent = '💾 Save Changes';
    }, 1500);
  }

  function autoSaveSilent() {
    const snap = getEditsSnapshot();
    localStorage.setItem(LS_KEY, snap);
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
    document.querySelectorAll('[data-editable]').forEach(el => {
      el._originalHTML = el.innerHTML;
    });

    const saves = loadSavedEdits();
    if (!Object.keys(saves).length) {
      initUndoRedo();
      return;
    }

    applyEditsSnapshot(JSON.stringify(saves));
    initUndoRedo();
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
    setTimeout(init, 100);
  }
})();
