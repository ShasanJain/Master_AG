/**
 * PAGE EDITOR ENGINE — Wix-like visual editor
 * Handles: element selection, drag, resize, text editing,
 * sidebar asset properties panel, dynamic creation, duplicate, delete,
 * parent-child container hierarchy grouping.
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
  let copiedAsset  = null; // Holds copy payload

  const LS_KEY = 'master_ag_page_edits';
  const PANEL_POS_KEY = 'master_ag_panel_position';
  const CREATED_KEY = 'master_ag_created_elements';

  // List of dynamically created elements
  let createdElements = [];

  // Undo & Redo Stacks
  let undoStack = [];
  let redoStack = [];

  // Available fonts
  const FONTS = [
    { label: 'Inter',          value: "'Inter', sans-serif" },
    { label: 'Playfair',       value: "'Playfair Display', serif" },
    { label: 'JetBrains Mono', value: "'JetBrains Mono', monospace" },
    { label: 'Outfit',         value: "'Outfit', sans-serif" },
    { label: 'Syne',           value: "'Syne', sans-serif" },
    { label: 'Georgia',        value: "Georgia, serif" },
    { label: 'System',         value: "system-ui, sans-serif" },
  ];

  // ─── DOM refs ──────────────────────────────────────────────────
  let fontSelect, fontSizeInput, fontSizeValInput, colorPicker, boldBtn,
      italicBtn, alignBtns, resetBtn, editorModeBtn, statusBar,
      editorSaveBtn, selectBox, debugPanel, dragHandle, minBtn,
      undoBtn, redoBtn, sidebarAssetEditor, sidebarElementCreator;

  let btnCopy, btnPaste, btnDelete, btnAddText, btnAddCard, btnAddButton;

  // ─── Init ──────────────────────────────────────────────────────
  function init() {
    buildSidebarDOM();
    initDebugPanelControls();
    loadEdits();             // Restores created elements, parents, and properties
    bindPanelButton();
    bindEditorSaveBtn();
    initResizeHandles();
    initKeyboardShortcuts();
  }

  // ─── Debug Panel Controls (Drag & Minimize) ────────────────────
  function initDebugPanelControls() {
    debugPanel = document.getElementById('debug-panel');
    dragHandle = document.getElementById('debug-panel-drag');
    minBtn     = document.getElementById('debug-min-btn');

    if (!debugPanel) return;

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

  // ─── Keyboard Shortcuts (Copy, Paste, Del) ─────────────────────
  function initKeyboardShortcuts() {
    document.addEventListener('keydown', e => {
      if (!editorMode) return;
      if (document.activeElement && document.activeElement.contentEditable === 'true') return;
      if (document.activeElement && document.activeElement.tagName === 'INPUT') return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        if (selectedEl) {
          e.preventDefault();
          copySelectedAsset();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        pasteCopiedAsset();
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedEl) {
          e.preventDefault();
          deleteSelectedAsset();
        }
      }
    });
  }

  // ─── Sidebar DOM builder & Wiring ──────────────────────────────
  function buildSidebarDOM() {
    selectBox = document.getElementById('editor-select-box');
    sidebarAssetEditor   = document.getElementById('sidebar-asset-editor');
    sidebarElementCreator = document.getElementById('sidebar-element-creator');

    fontSelect        = document.getElementById('sb-font');
    fontSizeInput     = document.getElementById('sb-font-size');
    fontSizeValInput  = document.getElementById('val-sb-font-size');
    colorPicker       = document.getElementById('sb-color');
    boldBtn           = document.getElementById('sb-bold');
    italicBtn         = document.getElementById('sb-italic');
    alignBtns         = document.querySelectorAll('[data-sb-align]');
    resetBtn          = document.getElementById('sb-reset');
    undoBtn           = document.getElementById('sb-undo');
    redoBtn           = document.getElementById('sb-redo');

    btnCopy           = document.getElementById('btn-copy-asset');
    btnPaste          = document.getElementById('btn-paste-asset');
    btnDelete         = document.getElementById('btn-delete-asset');

    btnAddText        = document.getElementById('add-text-btn');
    btnAddCard        = document.getElementById('add-card-btn');
    btnAddButton      = document.getElementById('add-button-btn');

    editorModeBtn     = document.getElementById('editor-mode-btn');
    statusBar         = document.getElementById('editor-status-bar');
    editorSaveBtn     = document.getElementById('editor-save-btn');

    if (!fontSelect) return;

    FONTS.forEach(f => {
      const opt = document.createElement('option');
      opt.value = f.value;
      opt.textContent = f.label;
      fontSelect.appendChild(opt);
    });

    fontSelect.addEventListener('change', () => applyProp('fontFamily', fontSelect.value));
    fontSizeInput.addEventListener('input', () => {
      fontSizeValInput.value = fontSizeInput.value;
      applyProp('fontSize', fontSizeInput.value + 'px');
    });
    fontSizeValInput.addEventListener('change', () => {
      let val = Math.max(8, Math.min(120, parseInt(fontSizeValInput.value) || 16));
      fontSizeInput.value = val;
      fontSizeValInput.value = val;
      applyProp('fontSize', val + 'px');
    });

    colorPicker.addEventListener('input', () => applyProp('color', colorPicker.value));
    boldBtn.addEventListener('click', () => toggleProp('fontWeight', 'bold', '400', boldBtn));
    italicBtn.addEventListener('click', () => toggleProp('fontStyle', 'italic', 'normal', italicBtn));

    alignBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        alignBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyProp('textAlign', btn.dataset.sbAlign);
      });
    });

    resetBtn.addEventListener('click', resetElement);

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

    if (btnCopy)   btnCopy.addEventListener('click', copySelectedAsset);
    if (btnPaste)  btnPaste.addEventListener('click', pasteCopiedAsset);
    if (btnDelete) btnDelete.addEventListener('click', deleteSelectedAsset);

    if (btnAddText)   btnAddText.addEventListener('click', () => createNewElement('p'));
    if (btnAddCard)   btnAddCard.addEventListener('click', () => createNewElement('card'));
    if (btnAddButton) btnAddButton.addEventListener('click', () => createNewElement('btn'));

    document.addEventListener('mousedown', e => {
      if (isDragging || isResizing) return;
      if (debugPanel && debugPanel.contains(e.target)) return;
      if (selectBox && selectBox.contains(e.target)) return;
      if (selectedEl && selectedEl.contains(e.target)) return;
      if (e.target.hasAttribute('data-editable')) return;
      deselect();
    });

    window.addEventListener('scroll', updateSelectBoxPos, { passive: true });
    window.addEventListener('resize', updateSelectBoxPos, { passive: true });
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
    if (sidebarElementCreator) {
      sidebarElementCreator.style.display = editorMode ? 'flex' : 'none';
    }

    if (!editorMode) {
      deselect();
    } else {
      attachEditableListeners();
    }
  }

  // ─── Attach listeners to all [data-editable] elements ─────────
  function attachEditableListeners() {
    document.querySelectorAll('[data-editable]').forEach(el => {
      if (el._editorBound) return;
      el._editorBound = true;

      el.addEventListener('mousedown', e => {
        if (!editorMode) return;
        if (el.isContentEditable) return;
        if (e.target.closest('#debug-panel') || e.target.closest('#editor-select-box')) return;
        e.stopPropagation();
        select(el);
        startDrag(e, el);
      });

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
    if (sidebarAssetEditor) sidebarAssetEditor.style.display = 'flex';
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
    if (sidebarAssetEditor) sidebarAssetEditor.style.display = 'none';
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

  // ─── Parent Container Search ───────────────────────────────────
  function findParentContainer(el, centerX, centerY) {
    const containers = Array.from(document.querySelectorAll('.glass-card, section, header'));
    let bestContainer = null;
    let bestArea = Infinity;

    containers.forEach(container => {
      if (container === el || el.contains(container)) return;
      const rect = container.getBoundingClientRect();
      if (centerX >= rect.left && centerX <= rect.right && centerY >= rect.top && centerY <= rect.bottom) {
        const area = rect.width * rect.height;
        if (area < bestArea) {
          bestArea = area;
          bestContainer = container;
        }
      }
    });
    return bestContainer;
  }

  // ─── Reparenting handler ───
  function handleDropReparenting(el) {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const parent = findParentContainer(el, cx, cy);
    const id = getEditableId(el);

    if (parent) {
      const parentId = getEditableId(parent);
      el.setAttribute('data-ed-parent', parentId);
      
      parent.appendChild(el);
      
      const parentRect = parent.getBoundingClientRect();
      el.style.position = 'absolute';
      el.style.left = (rect.left - parentRect.left) + 'px';
      el.style.top  = (rect.top - parentRect.top) + 'px';
    } else {
      el.removeAttribute('data-ed-parent');
      
      if (id.startsWith('created_')) {
        document.body.appendChild(el);
      } else {
        // Return static element to original DOM structure position
        if (el._originalParent && el.parentElement !== el._originalParent) {
          el._originalParent.insertBefore(el, el._originalNextSibling);
        }
      }
      
      el.style.position = 'fixed';
      el.style.left = rect.left + 'px';
      el.style.top  = rect.top + 'px';
    }
    updateSelectBoxPos();
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

        const cs = window.getComputedStyle(selectedEl);
        const startFS = parseFloat(cs.fontSize) || 16;

        // Temporarily append to body during resize calculation to avoid container overflow clip
        const isNested = selectedEl.hasAttribute('data-ed-parent');
        if (isNested) {
          document.body.appendChild(selectedEl);
          selectedEl.style.position = 'fixed';
          selectedEl.style.left = rect.left + 'px';
          selectedEl.style.top  = rect.top + 'px';
        }

        function onMove(ev) {
          let dx = ev.clientX - startX;
          let dy = ev.clientY - startY;

          let newWidth  = startW;
          let newHeight = startH;
          let newLeft   = startLeft;
          let newTop    = startTop;

          if (type.includes('r')) {
            newWidth = Math.max(20, startW + dx);
          } else if (type.includes('l')) {
            const possibleW = startW - dx;
            if (possibleW > 20) {
              newWidth = possibleW;
              newLeft = startLeft + dx;
            }
          }

          if (type.includes('b')) {
            newHeight = Math.max(20, startH + dy);
          } else if (type.includes('t')) {
            const possibleH = startH - dy;
            if (possibleH > 20) {
              newHeight = possibleH;
              newTop = startTop + dy;
            }
          }

          if (type.length === 2) { // Corner handles
            const scale = newWidth / startW;
            const newFS = Math.max(8, startFS * scale);
            selectedEl.style.fontSize = newFS + 'px';
            if (fontSizeInput) fontSizeInput.value = Math.round(newFS);
            if (fontSizeValInput) fontSizeValInput.value = Math.round(newFS);
          }

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
          handleDropReparenting(selectedEl);
          markUnsaved();
          autoSave();
        }

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
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
    return FONTS[0].value;
  }

  // ─── Toolbar sync ──────────────────────────────────────────────
  function syncToolbarToElement(el) {
    const cs = window.getComputedStyle(el);
    if (fontSelect) {
      const currentFont = el.style.fontFamily || cs.fontFamily;
      fontSelect.value = matchFont(currentFont);
    }
    if (fontSizeInput) {
      const fSize = parseInt(el.style.fontSize || cs.fontSize) || 16;
      fontSizeInput.value = fSize;
      if (fontSizeValInput) fontSizeValInput.value = fSize;
    }
    if (colorPicker) colorPicker.value = rgbToHex(el.style.color || cs.color);
    if (boldBtn) boldBtn.classList.toggle('active', (el.style.fontWeight || cs.fontWeight) === 'bold' || parseInt(cs.fontWeight) >= 700);
    if (italicBtn) italicBtn.classList.toggle('active', (el.style.fontStyle || cs.fontStyle) === 'italic');
    if (alignBtns) {
      const align = el.style.textAlign || cs.textAlign || 'left';
      alignBtns.forEach(b => b.classList.toggle('active', b.dataset.sbAlign === align));
    }
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
    
    // Reparent back to original place
    selectedEl.removeAttribute('data-ed-parent');
    if (id.startsWith('created_')) {
      document.body.appendChild(selectedEl);
    } else {
      if (selectedEl._originalParent) {
        selectedEl._originalParent.insertBefore(selectedEl, selectedEl._originalNextSibling);
      }
    }

    const editorProps = ['fontFamily','fontSize','color','fontWeight','fontStyle','textAlign','left','top','width','height','display'];
    editorProps.forEach(p => selectedEl.style.removeProperty(
      p.replace(/([A-Z])/g, '-$1').toLowerCase()
    ));
    selectedEl.removeAttribute('data-ed-dragged');
    selectedEl.contentEditable = 'false';
    selectedEl.style.position = '';

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

    // Temporarily reparent to body while dragging so it moves across elements cleanly
    const isNested = el.hasAttribute('data-ed-parent');
    if (isNested) {
      document.body.appendChild(el);
      el.style.position = 'fixed';
      el.style.left = rect.left + 'px';
      el.style.top  = rect.top + 'px';
    }

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
        handleDropReparenting(el); // check for parent drop target
        markUnsaved();
        autoSave();
      }
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  // ─── Copy & Paste & Delete Actions ─────────────────────────────
  function copySelectedAsset() {
    if (!selectedEl) return;
    copiedAsset = {
      tagName: selectedEl.tagName.toLowerCase(),
      className: selectedEl.className.replace(/el-selected|el-dragging/g, '').trim(),
      innerHTML: selectedEl.innerHTML,
      styles: {}
    };
    
    const editorProps = ['fontFamily','fontSize','color','fontWeight','fontStyle','textAlign','width','height'];
    editorProps.forEach(p => {
      const val = selectedEl.style[p] || window.getComputedStyle(selectedEl)[p];
      if (val) copiedAsset.styles[p] = val;
    });

    if (statusBar) statusBar.textContent = "📋 Asset copied!";
    setTimeout(() => {
      if (selectedEl && statusBar) statusBar.textContent = `Selected: ${selectedEl.getAttribute('data-ed-label')} • Drag to move`;
    }, 1500);
  }

  function pasteCopiedAsset() {
    if (!copiedAsset) return;

    let newEl;
    if (copiedAsset.className.includes('glass-card')) {
      newEl = document.createElement('div');
      newEl.className = 'glass-card';
      newEl.style.padding = '20px';
    } else {
      newEl = document.createElement(copiedAsset.tagName);
      newEl.className = copiedAsset.className;
    }

    newEl.innerHTML = copiedAsset.innerHTML;
    newEl.setAttribute('data-editable', 'true');
    newEl.setAttribute('data-ed-dragged', 'true');
    newEl.style.position = 'fixed';
    newEl.style.zIndex   = '8999';
    newEl.style.margin   = '0';

    Object.entries(copiedAsset.styles).forEach(([k, v]) => {
      newEl.style[k] = v;
    });

    newEl.style.left = (window.innerWidth / 2 - 100 + Math.random() * 40) + 'px';
    newEl.style.top  = (window.innerHeight / 2 - 100 + Math.random() * 40) + 'px';

    const newId = `created_${copiedAsset.tagName}_${Date.now()}`;
    newEl.dataset.editableId = newId;

    createdElements.push({
      id: newId,
      tagName: copiedAsset.tagName,
      className: copiedAsset.className,
      innerHTML: copiedAsset.innerHTML
    });

    document.body.appendChild(newEl);
    attachEditableListeners();
    
    handleDropReparenting(newEl);
    select(newEl);
    
    markUnsaved();
    autoSave();
  }

  function deleteSelectedAsset() {
    if (!selectedEl) return;
    const el = selectedEl;
    const id = el.dataset.editableId;

    deselect();
    el.remove();

    createdElements = createdElements.filter(x => x.id !== id);

    if (id && !id.startsWith('created_')) {
      const saves = loadSavedEdits();
      saves[id] = { display: 'none' };
      localStorage.setItem(LS_KEY, JSON.stringify(saves));
    }

    localStorage.setItem(CREATED_KEY, JSON.stringify(createdElements));
    markUnsaved();
    autoSave();
  }

  // ─── Dynamic Creation ──────────────────────────────────────────
  function createNewElement(type) {
    if (!editorMode) return;

    let newEl;
    const newId = `created_${type}_${Date.now()}`;

    if (type === 'p') {
      newEl = document.createElement('p');
      newEl.className = 'hero-sub';
      newEl.innerHTML = 'Double-click to edit text';
      newEl.style.width = '300px';
      newEl.style.color = 'var(--text)';
    } else if (type === 'btn') {
      newEl = document.createElement('a');
      newEl.className = 'btn-pill';
      newEl.innerHTML = 'Click Action';
      newEl.style.width = '160px';
      newEl.style.height = '38px';
      newEl.style.display = 'inline-flex';
      newEl.style.alignItems = 'center';
      newEl.style.justifyContent = 'center';
      newEl.style.textDecoration = 'none';
    } else if (type === 'card') {
      newEl = document.createElement('div');
      newEl.className = 'glass-card';
      newEl.innerHTML = '<div class="card-eye">Subhead</div><h3 class="card-title">New Card</h3><p class="card-body">Description text</p>';
      newEl.style.width = '320px';
      newEl.style.height = '180px';
      newEl.style.padding = '20px';
    }

    newEl.setAttribute('data-editable', 'true');
    newEl.setAttribute('data-ed-dragged', 'true');
    newEl.style.position = 'fixed';
    newEl.style.zIndex   = '8999';
    newEl.style.margin   = '0';
    newEl.dataset.editableId = newId;

    newEl.style.left = (window.innerWidth / 2 - 100) + 'px';
    newEl.style.top  = (window.innerHeight / 2 - 80) + 'px';

    createdElements.push({
      id: newId,
      tagName: newEl.tagName.toLowerCase(),
      className: newEl.className,
      innerHTML: newEl.innerHTML
    });

    document.body.appendChild(newEl);
    attachEditableListeners();
    
    if (type === 'card') {
      newEl.querySelectorAll('.card-eye, .card-title, .card-body').forEach((child, idx) => {
        child.setAttribute('data-editable', 'true');
        child.dataset.editableId = `${newId}_child_${idx}`;
      });
      attachEditableListeners();
    }

    handleDropReparenting(newEl);
    select(newEl);
    
    localStorage.setItem(CREATED_KEY, JSON.stringify(createdElements));
    markUnsaved();
    autoSave();
  }

  // ─── Persistence & History ─────────────────────────────────────
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
      const editorProps = ['fontFamily','fontSize','color','fontWeight','fontStyle','textAlign','left','top','width','height','display'];
      editorProps.forEach(p => { if (el.style[p]) data[p] = el.style[p]; });
      if (el.getAttribute('data-ed-dragged')) data._dragged = true;
      if (el.getAttribute('data-ed-parent')) data._parentId = el.getAttribute('data-ed-parent');
      if (el.innerHTML !== el._originalHTML) data._html = el.innerHTML;
      if (Object.keys(data).length) snapshot[id] = data;
    });
    return JSON.stringify(snapshot);
  }

  function applyEditsSnapshot(snapJSON) {
    const saves = JSON.parse(snapJSON || '{}');
    
    // Remove deleted created elements
    document.querySelectorAll('[data-editable]').forEach(el => {
      const id = el.dataset.editableId;
      if (id && id.startsWith('created_') && !saves[id]) {
        el.remove();
      }
    });

    // Recreate
    createdElements.forEach(item => {
      if (saves[item.id] && !document.querySelector(`[data-editable-id="${item.id}"]`)) {
        const newEl = document.createElement(item.tagName);
        newEl.className = item.className;
        newEl.innerHTML = item.innerHTML;
        newEl.setAttribute('data-editable', 'true');
        newEl.dataset.editableId = item.id;
        document.body.appendChild(newEl);
      }
    });
    attachEditableListeners();

    // Reset styles
    document.querySelectorAll('[data-editable]').forEach(el => {
      const id = getEditableId(el);
      const data = saves[id];

      const editorProps = ['fontFamily','fontSize','color','fontWeight','fontStyle','textAlign','left','top','width','height','display'];
      editorProps.forEach(p => el.style.removeProperty(p.replace(/([A-Z])/g, '-$1').toLowerCase()));
      el.removeAttribute('data-ed-dragged');
      el.removeAttribute('data-ed-parent');
      el.style.position = '';
      el.style.zIndex   = '';
      el.style.margin   = '';
      el.innerHTML = el._originalHTML || el.innerHTML;

      // Only append created ones to body, keep static elements in original hierarchy positions
      if (id.startsWith('created_') && (!data || !data._parentId)) {
        document.body.appendChild(el);
      } else if (!id.startsWith('created_') && (!data || !data._parentId)) {
        if (el._originalParent && el.parentElement !== el._originalParent) {
          el._originalParent.insertBefore(el, el._originalNextSibling);
        }
      }

      if (!data) return;

      Object.entries(data).forEach(([k, v]) => {
        if (k === '_html') { el.innerHTML = v; return; }
        if (k === '_dragged') { el.setAttribute('data-ed-dragged', 'true'); return; }
        if (k === '_parentId') { el.setAttribute('data-ed-parent', v); return; }
        el.style[k] = v;
      });

      if (data._dragged && !data._parentId) {
        el.style.position = 'fixed';
        el.style.zIndex   = '8999';
        el.style.margin   = '0';
      }
    });

    // Run secondary pass to nest elements
    document.querySelectorAll('[data-editable]').forEach(el => {
      const parentId = el.getAttribute('data-ed-parent');
      if (parentId) {
        const parent = document.querySelector(`[data-editable-id="${parentId}"]`) || document.getElementById(parentId);
        if (parent) {
          parent.appendChild(el);
          el.style.position = 'absolute';
        }
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
    redoStack = []; 
  }

  function autoSave() {
    const snap = getEditsSnapshot();
    localStorage.setItem(LS_KEY, snap);
    localStorage.setItem(CREATED_KEY, JSON.stringify(createdElements));
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
    localStorage.setItem(CREATED_KEY, JSON.stringify(createdElements));
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
    // 1. Restore created elements DOM
    try {
      createdElements = JSON.parse(localStorage.getItem(CREATED_KEY) || '[]');
      createdElements.forEach(item => {
        const newEl = document.createElement(item.tagName);
        newEl.className = item.className;
        newEl.innerHTML = item.innerHTML;
        newEl.setAttribute('data-editable', 'true');
        newEl.dataset.editableId = item.id;
        document.body.appendChild(newEl);
      });
    } catch(e) {}

    // Store original parent pointers for static DOM elements
    document.querySelectorAll('[data-editable]').forEach(el => {
      el._originalHTML = el.innerHTML;
      el._originalParent = el.parentElement;
      el._originalNextSibling = el.nextSibling;
    });

    const saves = loadSavedEdits();
    if (!Object.keys(saves).length && !createdElements.length) {
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
