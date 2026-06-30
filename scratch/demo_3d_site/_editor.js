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
      undoBtn, redoBtn, sidebarAssetEditor, sidebarElementCreator,
      lineHeightInput, lineHeightValInput, letterSpacingInput, letterSpacingValInput;

  let btnCopy, btnPaste, btnDelete, btnLock, btnAddText, btnAddCard, btnAddButton, btnAddParticles;
  let textPropertiesGroup, floatingPanel, floatingPanelDrag, moveHandle, presetsGroup;
  let particlesRow, partDensityInput, partDensityValInput, partNoiseInput, partNoiseValInput, partBehaviorSelect;

  // ─── Init ──────────────────────────────────────────────────────
  function init() {
    buildSidebarDOM();
    initDebugPanelControls();
    loadEdits();             // Restores created elements, parents, and properties
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
    btnLock           = document.getElementById('btn-lock-asset');

    btnAddText        = document.getElementById('add-text-btn');
    btnAddCard        = document.getElementById('add-card-btn');
    btnAddButton      = document.getElementById('add-button-btn');

    editorModeBtn     = document.getElementById('editor-mode-btn');
    btnAddParticles   = document.getElementById('add-particles-btn');
    particlesRow      = document.getElementById('sb-particles-row');
    textPropertiesGroup = document.getElementById('sb-text-properties-group');
    floatingPanel = document.getElementById('floating-asset-settings');
    floatingPanelDrag = document.getElementById('floating-asset-settings-drag');
    initFloatingPanelDrag();
    moveHandle = selectBox ? selectBox.querySelector('.ed-move-handle') : null;
    if (moveHandle) {
      moveHandle.addEventListener('mousedown', e => {
        if (!editorMode || !selectedEl) return;
        e.stopPropagation();
        e.preventDefault();
        startDrag(e, selectedEl);
      });
    }
    lineHeightInput   = document.getElementById('sb-line-height');
    lineHeightValInput = document.getElementById('val-sb-line-height');
    letterSpacingInput = document.getElementById('sb-letter-spacing');
    letterSpacingValInput = document.getElementById('val-sb-letter-spacing');
    presetsGroup      = document.getElementById('sb-presets-group');
    partDensityInput  = document.getElementById('sb-part-density');
    partDensityValInput = document.getElementById('val-sb-part-density');
    partNoiseInput    = document.getElementById('sb-part-noise');
    partNoiseValInput = document.getElementById('val-sb-part-noise');
    partBehaviorSelect = document.getElementById('sb-part-behavior');
    statusBar         = document.getElementById('editor-status-bar');
    editorSaveBtn     = document.getElementById('editor-save-btn');

    if (editorModeBtn) {
      editorModeBtn.addEventListener('click', toggleEditorMode);
    }

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
      let val = Math.max(8, Math.min(300, parseInt(fontSizeValInput.value) || 16));
      fontSizeInput.value = val;
      fontSizeValInput.value = val;
      applyProp('fontSize', val + 'px');
    });

    if (lineHeightInput) {
      lineHeightInput.addEventListener('input', () => {
        if (lineHeightValInput) lineHeightValInput.value = lineHeightInput.value;
        applyProp('lineHeight', lineHeightInput.value);
      });
    }
    if (lineHeightValInput) {
      lineHeightValInput.addEventListener('change', () => {
        let val = Math.max(0.5, Math.min(4.0, parseFloat(lineHeightValInput.value) || 1.2));
        if (lineHeightInput) lineHeightInput.value = val;
        lineHeightValInput.value = val;
        applyProp('lineHeight', val);
      });
    }

    if (letterSpacingInput) {
      letterSpacingInput.addEventListener('input', () => {
        if (letterSpacingValInput) letterSpacingValInput.value = letterSpacingInput.value;
        applyProp('letterSpacing', letterSpacingInput.value + 'px');
      });
    }
    if (letterSpacingValInput) {
      letterSpacingValInput.addEventListener('change', () => {
        let val = parseFloat(letterSpacingValInput.value) || 0;
        val = Math.max(-5, Math.min(30, val));
        if (letterSpacingInput) letterSpacingInput.value = val;
        letterSpacingValInput.value = val;
        applyProp('letterSpacing', val + 'px');
      });
    }

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

    if (resetBtn) {
      resetBtn.addEventListener('click', resetElement);
    }

    const sbBackBtn = document.getElementById('sb-back-btn');
    if (sbBackBtn) {
      sbBackBtn.addEventListener('click', deselect);
    }

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

    let btnAddImage    = document.getElementById('add-image-btn');
    let btnAddMesh     = document.getElementById('add-mesh-btn');
    let imageUrlRow    = document.getElementById('sb-image-url-row');
    let imageUrlInput  = document.getElementById('sb-image-url');
    let spotlightPicker = document.getElementById('sb-bg-spotlight');

    if (imageUrlInput) {
      imageUrlInput.addEventListener('input', () => {
        if (selectedEl && selectedEl.tagName === 'IMG') {
          selectedEl.src = imageUrlInput.value;
          markUnsaved();
          autoSave();
        }
      });
    }

    if (spotlightPicker) {
      spotlightPicker.addEventListener('input', () => {
        const spot = document.getElementById('bg-spotlight');
        if (spot) {
          spot.style.background = `radial-gradient(circle 500px at 50% 50%, ${spotlightPicker.value}2b 0%, ${spotlightPicker.value}14 40%, transparent 80%)`;
          markUnsaved();
          autoSave();
        }
      });
    }

    if (btnCopy)   btnCopy.addEventListener('click', copySelectedAsset);
    if (btnPaste)  btnPaste.addEventListener('click', pasteCopiedAsset);
    if (btnDelete) btnDelete.addEventListener('click', deleteSelectedAsset);
    if (btnLock)   btnLock.addEventListener('click', toggleLockSelectedAsset);

    // Scroll animation buttons
    const sbRecordKf   = document.getElementById('sb-record-kf');
    const sbPreviewAnim = document.getElementById('sb-preview-anim');
    const sbClearKf    = document.getElementById('sb-clear-kf');
    if (sbRecordKf)    sbRecordKf.addEventListener('click', () => { if (selectedEl && window.scrollAnim) { const kfs = window.scrollAnim.recordKeyframe(selectedEl); refreshAnimUI(selectedEl, kfs); if (window.layerPanel) window.layerPanel.render(); } });
    if (sbPreviewAnim) sbPreviewAnim.addEventListener('click', () => { if (selectedEl && window.scrollAnim) window.scrollAnim.previewElement(selectedEl, 3000); });
    if (sbClearKf)     sbClearKf.addEventListener('click', () => { if (selectedEl && window.scrollAnim) { window.scrollAnim.clearKeyframes(selectedEl); refreshAnimUI(selectedEl, []); if (window.layerPanel) window.layerPanel.render(); } });

    if (btnAddText)   btnAddText.addEventListener('click', () => createNewElement('p'));
    if (btnAddCard)   btnAddCard.addEventListener('click', () => createNewElement('card'));
    if (btnAddButton) btnAddButton.addEventListener('click', () => createNewElement('btn'));
    if (btnAddImage)  btnAddImage.addEventListener('click', () => createNewElement('img'));
    if (btnAddMesh)   btnAddMesh.addEventListener('click', () => createNewElement('mesh'));
    if (btnAddParticles) btnAddParticles.addEventListener('click', () => createNewElement('particles'));

    if (partDensityInput) {
      partDensityInput.addEventListener('input', () => {
        partDensityValInput.value = partDensityInput.value;
        updateSelectedParticles();
      });
    }
    if (partDensityValInput) {
      partDensityValInput.addEventListener('change', () => {
        partDensityInput.value = partDensityValInput.value;
        updateSelectedParticles();
      });
    }
    if (partNoiseInput) {
      partNoiseInput.addEventListener('input', () => {
        partNoiseValInput.value = partNoiseInput.value;
        updateSelectedParticles();
      });
    }
    if (partNoiseValInput) {
      partNoiseValInput.addEventListener('change', () => {
        partNoiseInput.value = partNoiseValInput.value;
        updateSelectedParticles();
      });
    }
    if (partBehaviorSelect) {
      partBehaviorSelect.addEventListener('change', () => {
        updateSelectedParticles();
      });
    }
    
    const presetBtns = document.querySelectorAll('.preset-btn');
    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (selectedEl) {
          applyPresetStyle(selectedEl, btn.dataset.preset);
        }
      });
    });

    document.addEventListener('mousedown', e => {
      if (isDragging || isResizing) return;
      if (e.target === document.body || e.target === document.documentElement) return;
      if (debugPanel && debugPanel.contains(e.target)) return;
      if (selectBox && selectBox.contains(e.target)) return;
      if (floatingPanel && floatingPanel.contains(e.target)) return;
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
      restoreFromFixed();
      if (window.timelinePanel) window.timelinePanel.hide();
    } else {
      liftAllToFixed();
      attachEditableListeners();
      if (window.timelinePanel) window.timelinePanel.show();
    }

    // Refresh layer panel on mode change
    if (window.layerPanel) setTimeout(() => window.layerPanel.render(), 80);
  }

  // ─── Lift ALL editable elements to fixed during editor mode ────
  function liftAllToFixed() {
    const VH = window.innerHeight;
    const VW = window.innerWidth;
    document.querySelectorAll('[data-editable]').forEach(el => {
      // Skip already-fixed elements
      if (el.style.position === 'fixed') return;
      const rect = el.getBoundingClientRect();
      // Skip zero-size or fully off-screen elements
      if (!rect.width && !rect.height) return;
      if (rect.bottom < -100 || rect.top > VH + 100) return; // off screen — lift later
      if (rect.right < -100  || rect.left > VW + 100) return;
      // Store restore point (only if not already stored)
      if (!el._preEditPosition) {
        el._preEditPosition = {
          position:    el.style.position,
          left:        el.style.left,
          top:         el.style.top,
          margin:      el.style.margin,
          zIndex:      el.style.zIndex,
          parent:      el.parentElement,
          nextSibling: el.nextSibling
        };
      }
      document.body.appendChild(el);
      el.style.position = 'fixed';
      el.style.left     = rect.left + 'px';
      el.style.top      = rect.top  + 'px';
      el.style.margin   = '0';
      el.style.zIndex   = Math.max(1, 1000 + (parseInt(el.dataset.layerZ) || 0));
    });
    // Second pass: handle off-screen elements by scrolling into view virtually
    // (just give them a safe off-screen fixed position so they can be dragged into view)
    document.querySelectorAll('[data-editable]').forEach(el => {
      if (el.style.position === 'fixed') return;
      if (!el._preEditPosition) {
        el._preEditPosition = {
          position:    el.style.position,
          left:        el.style.left,
          top:         el.style.top,
          margin:      el.style.margin,
          zIndex:      el.style.zIndex,
          parent:      el.parentElement,
          nextSibling: el.nextSibling
        };
      }
      const rect = el.getBoundingClientRect();
      document.body.appendChild(el);
      el.style.position = 'fixed';
      el.style.left     = rect.left + 'px';
      el.style.top      = rect.top  + 'px';
      el.style.margin   = '0';
      el.style.zIndex   = Math.max(1, 1000 + (parseInt(el.dataset.layerZ) || 0));
    });
  }

  // ─── Restore non-keyed elements to their original flow position ─
  function restoreFromFixed() {
    document.querySelectorAll('[data-editable]').forEach(el => {
      const id = el.dataset.editableId || '';
      const hasKfs   = el.dataset.scrollKfs && JSON.parse(el.dataset.scrollKfs || '[]').length > 0;
      // Only created_* elements that the user explicitly dragged stay fixed on restore
      // Static page elements ALWAYS return to flow (their dragged state is just visual, not intent)
      const isCreated = id.startsWith('created_');
      const isDragged  = isCreated && el.dataset.edDragged === 'true';
      if (hasKfs || isDragged) return;
      const prev = el._preEditPosition;
      if (!prev) return;
      try {
        if (prev.parent && prev.parent.isConnected) {
          prev.parent.insertBefore(el, prev.nextSibling);
        } else {
          document.body.appendChild(el);
        }
      } catch(e) { document.body.appendChild(el); }
      el.style.position = prev.position || '';
      el.style.left     = prev.left     || '';
      el.style.top      = prev.top      || '';
      el.style.margin   = prev.margin   || '';
      el.style.zIndex   = prev.zIndex   || '';
      el._preEditPosition = null;
    });
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
        
        // Contextual cursor: Text I-beam
        const cDot = document.getElementById('cursor-dot');
        if (cDot) cDot.classList.add('cross-text');
        
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
          if (cDot) cDot.classList.remove('cross-text');
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
    if (floatingPanel) {
      delete floatingPanel.dataset.manualMoved;
    }

    const tag = el.tagName.toLowerCase();
    const cls = el.className.replace(/el-selected|el-dragging/g, '').trim().split(' ')[0];
    el.setAttribute('data-ed-label', cls || tag);

    syncToolbarToElement(el);
    if (sidebarAssetEditor) sidebarAssetEditor.style.display = 'flex';
    updateSelectBoxPos();
    syncLockButton(el);

    // Ripple at element center
    if (window.spawnRipple) {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const isLocked = el.dataset.edLocked === 'true';
      window.spawnRipple(cx, cy, isLocked ? '#ffaa00' : '#cebdf8', 2);
    }

    // Sync scroll animation UI
    const kfs = window.scrollAnim ? window.scrollAnim.getKeyframes(el) : [];
    refreshAnimUI(el, kfs);

    // Sync timeline panel target
    if (window.timelinePanel) window.timelinePanel.refreshTarget(el);
    
    // Position floating panel contextual settings
    setTimeout(updateFloatingSettingsPos, 10);

    // Refresh layer panel highlight
    if (window.layerPanel) window.layerPanel.render();

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
    if (floatingPanel) {
      floatingPanel.style.display = 'none';
      delete floatingPanel.dataset.manualMoved;
    }
    if (btnLock) { btnLock.textContent = '\uD83D\uDD13 Lock'; btnLock.style.color = '#ffaa00'; }
    if (window.timelinePanel) window.timelinePanel.refreshTarget(null);
    if (statusBar) {
      statusBar.textContent = editorMode ? 'Click any text to select • Drag to move • Pull handles to resize' : '';
    }
  }

  // ─ Lock sync helper ──────────────────────────────────────
  function syncLockButton(el) {
    if (!btnLock) return;
    const locked = el && el.dataset.edLocked === 'true';
    btnLock.textContent = locked ? '\uD83D\uDD12 Locked' : '\uD83D\uDD13 Lock';
    btnLock.style.color = locked ? '#ff4444' : '#ffaa00';
    btnLock.style.background = locked ? 'rgba(255,68,68,0.15)' : 'rgba(255,170,0,0.12)';
    btnLock.style.borderColor = locked ? 'rgba(255,68,68,0.3)' : 'rgba(255,170,0,0.25)';
  }

  // ─ Lock toggle ─────────────────────────────────────────
  function toggleLockSelectedAsset() {
    if (!selectedEl) return;
    const wasLocked = selectedEl.dataset.edLocked === 'true';
    selectedEl.dataset.edLocked = wasLocked ? 'false' : 'true';
    syncLockButton(selectedEl);
    if (statusBar) {
      statusBar.textContent = wasLocked ? 'Asset unlocked — drag / resize enabled' : '\uD83D\uDD12 Asset locked — drag / resize disabled';
    }
    // Ripple feedback at element center
    if (window.spawnRipple) {
      const r = selectedEl.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      window.spawnRipple(cx, cy, wasLocked ? '#cebdf8' : '#ffaa00', 4, true);
    }
    markUnsaved();
    autoSave();
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
    
    // Update live dimension badge
    const dimBadge = selectBox.querySelector('.ed-dimension-badge');
    if (dimBadge) {
      dimBadge.textContent = `${Math.round(rect.width)} × ${Math.round(rect.height)}`;
      dimBadge.style.display = (isResizing || isDragging) ? 'block' : 'none';
    }
    
    updateFloatingSettingsPos();
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
        // Created elements float freely on body at fixed position
        document.body.appendChild(el);
        el.style.position = 'fixed';
        el.style.left = rect.left + 'px';
        el.style.top  = rect.top + 'px';
      } else {
        // Static page elements return to their original DOM parent in normal flow
        // They keep their inline left/top so they visually stay where dropped
        // but are absolute within their original section, not fixed globally
        if (el._originalParent && el.parentElement !== el._originalParent) {
          el._originalParent.insertBefore(el, el._originalNextSibling);
        }
        // Use absolute positioning relative to original parent
        const parentRect = el._originalParent
          ? el._originalParent.getBoundingClientRect()
          : { left: 0, top: 0 };
        el.style.position = 'absolute';
        el.style.left = (rect.left - parentRect.left) + 'px';
        el.style.top  = (rect.top - parentRect.top + window.scrollY) + 'px';
        el.style.margin = '0';
      }
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
        // Respect lock state — locked assets cannot be resized
        if (selectedEl.dataset.edLocked === 'true') {
          if (window.spawnRipple) {
            const r = selectedEl.getBoundingClientRect();
            window.spawnRipple(r.left + r.width/2, r.top + r.height/2, '#ffaa00', 2, false);
          }
          return;
        }
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

        // Hide custom cursor elements during resize to let default browser cursors shine
        const cDot = document.getElementById('cursor-dot');
        const cRing = document.getElementById('cursor-ring');
        if (cDot) cDot.classList.add('cross-resize-hidden');
        if (cRing) cRing.classList.add('cross-resize-hidden');
        document.body.classList.add('is-resizing');

        // Set body cursor to handle drag direction styling (ns-resize, ew-resize, nwse-resize, etc.)
        let cursorStyle = 'default';
        if (type === 't' || type === 'b') cursorStyle = 'ns-resize';
        else if (type === 'l' || type === 'r') cursorStyle = 'ew-resize';
        else if (type === 'tl' || type === 'br') cursorStyle = 'nwse-resize';
        else if (type === 'tr' || type === 'bl') cursorStyle = 'nesw-resize';
        document.body.style.cursor = cursorStyle;

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
          
          if (cDot) cDot.classList.remove('cross-resize-hidden');
          if (cRing) cRing.classList.remove('cross-resize-hidden');
          document.body.classList.remove('is-resizing');
          document.body.style.cursor = 'none'; // Revert back to custom pointer hide mode

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
    if (lineHeightInput) {
      const currentLH = el.style.lineHeight || cs.lineHeight || '1.2';
      let numericLH = parseFloat(currentLH) || 1.2;
      if (currentLH.includes('px')) {
        const fSize = parseFloat(el.style.fontSize || cs.fontSize) || 16;
        numericLH = Math.round((parseFloat(currentLH) / fSize) * 10) / 10;
      }
      numericLH = Math.max(0.8, Math.min(3.5, numericLH));
      lineHeightInput.value = numericLH;
      if (lineHeightValInput) lineHeightValInput.value = numericLH;
    }
    if (letterSpacingInput) {
      const currentLS = el.style.letterSpacing || cs.letterSpacing || 'normal';
      let numericLS = parseFloat(currentLS) || 0;
      numericLS = Math.max(-2, Math.min(15, numericLS));
      letterSpacingInput.value = numericLS;
      if (letterSpacingValInput) letterSpacingValInput.value = numericLS;
    }

    const imgRow = document.getElementById('sb-image-url-row');
    const imgInput = document.getElementById('sb-image-url');
    
    const isImg = el.tagName === 'IMG';
    const isParticles = el.dataset.editableId && el.dataset.editableId.startsWith('created_particles_');
    const isText = !isImg && !isParticles;

    // Toggle contextual groups visibility
    if (textPropertiesGroup) {
      textPropertiesGroup.style.display = isText ? 'flex' : 'none';
    }
    
    if (imgRow && imgInput) {
      imgRow.style.display = isImg ? 'flex' : 'none';
      if (isImg) imgInput.value = el.src || '';
    }

    if (particlesRow) {
      particlesRow.style.display = isParticles ? 'flex' : 'none';
      if (isParticles && el._threeMesh && el._threeMesh.userData) {
        const ud = el._threeMesh.userData;
        if (partDensityInput) {
          partDensityInput.value = ud.density || 500;
          partDensityValInput.value = ud.density || 500;
        }
        if (partNoiseInput) {
          partNoiseInput.value = ud.noiseSpeed || 1.0;
          partNoiseValInput.value = ud.noiseSpeed || 1.0;
        }
        if (partBehaviorSelect) {
          partBehaviorSelect.value = ud.behavior || 'drift';
        }
      }
    }
    if (presetsGroup) {
      presetsGroup.style.display = (isImg || isParticles) ? 'none' : 'flex';
      const activePreset = ['glass', 'cyber', 'luxury', 'brutalist'].find(p => el.classList.contains('preset-' + p));
      const presetBtns = document.querySelectorAll('.preset-btn');
      presetBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.preset === activePreset);
      });
    }
  }

  // ─── Apply a CSS property ──────────────────────────────────────
  function applyProp(prop, value) {
    if (!selectedEl) return;
    selectedEl.style[prop] = value;
    
    // Wire color updates to particle meshes material directly
    if (prop === 'color' && selectedEl.dataset.editableId && selectedEl.dataset.editableId.startsWith('created_particles_') && selectedEl._threeMesh) {
      if (selectedEl._threeMesh.material) {
        selectedEl._threeMesh.material.color.set(value);
        if (selectedEl._threeMesh.userData) selectedEl._threeMesh.userData.color = value;
      }
    }
    
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

  function applyPresetStyle(el, preset) {
    if (!el) return;
    const presets = ['preset-glass', 'preset-cyber', 'preset-luxury', 'preset-brutalist'];
    presets.forEach(p => el.classList.remove(p));
    if (preset && preset !== 'none') {
      el.classList.add('preset-' + preset);
    }
    const conflictStyles = ['fontFamily', 'fontSize', 'color', 'fontWeight', 'fontStyle', 'backgroundColor', 'border', 'boxShadow', 'lineHeight', 'letterSpacing'];
    conflictStyles.forEach(s => el.style.removeProperty(s.replace(/([A-Z])/g, '-$1').toLowerCase()));
    
    syncToolbarToElement(el);
    updateSelectBoxPos();
    markUnsaved();
    autoSave();
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

    const editorProps = ['fontFamily','fontSize','color','fontWeight','fontStyle','textAlign','left','top','width','height','display','lineHeight','letterSpacing'];
    editorProps.forEach(p => selectedEl.style.removeProperty(
      p.replace(/([A-Z])/g, '-$1').toLowerCase()
    ));
    const presets = ['preset-glass', 'preset-cyber', 'preset-luxury', 'preset-brutalist'];
    presets.forEach(p => selectedEl.classList.remove(p));
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
    // Respect lock state — locked assets cannot be dragged
    if (el.dataset.edLocked === 'true') {
      if (window.spawnRipple) {
        const r = el.getBoundingClientRect();
        window.spawnRipple(r.left + r.width/2, r.top + r.height/2, '#ffaa00', 2, false);
      }
      if (statusBar) statusBar.textContent = '\uD83D\uDD12 Asset is locked — click \uD83D\uDD13 Lock to unlock';
      return;
    }

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

    const cDot = document.getElementById('cursor-dot');
    const cRing = document.getElementById('cursor-ring');

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
        
        if (cDot) cDot.classList.add('cross-grabbing');
      }
      el.style.left = (ev.clientX - dragOffX) + 'px';
      el.style.top  = (ev.clientY - dragOffY) + 'px';
      updateSelectBoxPos();
    }

    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      if (cDot) cDot.classList.remove('cross-grabbing');
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
    
    const editorProps = ['fontFamily','fontSize','color','fontWeight','fontStyle','textAlign','width','height','lineHeight','letterSpacing'];
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

    // Ripple feedback for paste
    if (window.spawnRipple) {
      const cx = (window.innerWidth / 2 - 100 + Math.random() * 40) + 100;
      const cy = (window.innerHeight / 2 - 100 + Math.random() * 40) + 80;
      window.spawnRipple(cx, cy, '#00e5ff', 3, false);
    }
    
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
    } else if (type === 'img') {
      newEl = document.createElement('img');
      newEl.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop';
      newEl.style.width = '240px';
      newEl.style.height = '180px';
      newEl.style.borderRadius = '12px';
      newEl.style.objectFit = 'cover';
      newEl.className = 'editor-created-img';
    } else if (type === 'mesh') {
      newEl = document.createElement('div');
      newEl.className = 'glass-card 3d-primitive-indicator';
      newEl.innerHTML = '<div class="card-eye">3D Mesh Group</div><h3 class="card-title" style="font-size: 20px;">Torus Knot Primitive</h3><p class="card-body" style="font-size: 11px;">Active in WebGL Scene Context</p>';
      newEl.style.width = '220px';
      newEl.style.height = '120px';
      newEl.style.padding = '14px';
      
      // Attempt to register dynamic 3D object in global Three.js scope if window.scene exists
      if (window.THREE && window._webglScene) {
        try {
          const geo = new THREE.TorusKnotGeometry(0.3, 0.1, 64, 8);
          const mat = new THREE.MeshStandardMaterial({
            color: 0xcebdf8,
            metalness: 0.2,
            roughness: 0.1,
            emissive: new THREE.Color(0x8eb4f8),
            emissiveIntensity: 0.5
          });
          const mesh = new THREE.Mesh(geo, mat);
          mesh.name = newId;
          mesh.position.set(0, 0.5, 0);
          window._webglScene.add(mesh);
          newEl._threeMesh = mesh;
        } catch (err) {}
      }
    } else if (type === 'particles') {
      newEl = document.createElement('div');
      newEl.className = 'glass-card 3d-primitive-indicator';
      newEl.innerHTML = '<div class="card-eye">3D Particles Group</div><h3 class="card-title" style="font-size: 20px;">Interactive Field</h3><p class="card-body" style="font-size: 11px;">Active in WebGL Scene Context</p>';
      newEl.style.width = '220px';
      newEl.style.height = '120px';
      newEl.style.padding = '14px';
      
      const pts = buildDynamicParticleSystem(newId, 500, 1.0, 'drift', '#cebdf8');
      if (pts) newEl._threeMesh = pts;
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
      innerHTML: newEl.innerHTML,
      src: newEl.src || ''
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

    if (type === 'img') {
      newEl.addEventListener('dblclick', e => {
        if (!editorMode) return;
        e.stopPropagation();
        const newSrc = prompt('Enter Image URL:', newEl.src);
        if (newSrc) {
          newEl.src = newSrc;
          const input = document.getElementById('sb-image-url');
          if (input) input.value = newSrc;
          markUnsaved();
          autoSave();
        }
      });
    }

    handleDropReparenting(newEl);
    select(newEl);

    // Ripple at spawn position (big burst)
    if (window.spawnRipple) {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      window.spawnRipple(cx, cy, '#cebdf8', 5, true);
    }

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
      const editorProps = ['fontFamily','fontSize','color','fontWeight','fontStyle','textAlign','left','top','width','height','display','lineHeight','letterSpacing'];
      const isCreated = id.startsWith('created_');
      const isDragged = el.getAttribute('data-ed-dragged') === 'true';
      editorProps.forEach(p => {
        // Skip temporary position/dimension rules for un-dragged static elements
        if (!isCreated && !isDragged && ['left','top','width','height','position'].includes(p)) {
          return;
        }
        if (el.style[p]) data[p] = el.style[p];
      });
      if (isDragged) data._dragged = true;
      if (el.getAttribute('data-ed-parent')) data._parentId = el.getAttribute('data-ed-parent');
      if (el.innerHTML !== el._originalHTML) data._html = el.innerHTML;
      if (el.tagName === 'IMG' && el.src) data._src = el.src;
      const activePreset = ['glass', 'cyber', 'luxury', 'brutalist'].find(p => el.classList.contains('preset-' + p));
      if (activePreset) data._preset = activePreset;
      if (id.startsWith('created_particles_') && el._threeMesh && el._threeMesh.userData) {
        const ud = el._threeMesh.userData;
        data._density = ud.density;
        data._noiseSpeed = ud.noiseSpeed;
        data._behavior = ud.behavior;
      }
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
        if (el._threeMesh && window._webglScene) {
          try {
            window._webglScene.remove(el._threeMesh);
            el._threeMesh.geometry.dispose();
            el._threeMesh.material.dispose();
          } catch(e) {}
        }
        if (selectedEl === el) {
          deselect();
        }
        el.remove();
      }
    });

    // Recreate
    createdElements.forEach(item => {
      if (saves[item.id] && !document.querySelector(`[data-editable-id="${item.id}"]`)) {
        const newEl = document.createElement(item.tagName);
        newEl.className = item.className;
        newEl.innerHTML = item.innerHTML;
        if (item.src) newEl.src = item.src;
        newEl.setAttribute('data-editable', 'true');
        newEl.dataset.editableId = item.id;
        document.body.appendChild(newEl);

        // Restore 3D mesh dynamic references
        if (item.id.includes('_mesh') && window.THREE && window._webglScene) {
          try {
            const geo = new THREE.TorusKnotGeometry(0.3, 0.1, 64, 8);
            const mat = new THREE.MeshStandardMaterial({
              color: 0xcebdf8,
              metalness: 0.2,
              roughness: 0.1,
              emissive: new THREE.Color(0x8eb4f8),
              emissiveIntensity: 0.5
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.name = item.id;
            mesh.position.set(0, 0.5, 0);
            window._webglScene.add(mesh);
            newEl._threeMesh = mesh;
          } catch(e) {}
        } else if (item.id.includes('_particles') && window.THREE && window._webglScene) {
          // Rebuild particles with saved parameters if any
          const saves = loadSavedEdits();
          const savedData = saves[item.id] || {};
          const density = savedData._density || 500;
          const noiseSpeed = savedData._noiseSpeed || 1.0;
          const behavior = savedData._behavior || 'drift';
          const color = savedData.color || '#cebdf8';
          
          const pts = buildDynamicParticleSystem(item.id, density, noiseSpeed, behavior, color);
          if (pts) newEl._threeMesh = pts;
        }
      }
    });
    attachEditableListeners();

    // Reset styles
    document.querySelectorAll('[data-editable]').forEach(el => {
      const id = getEditableId(el);
      const data = saves[id];
      const isCreated = id.startsWith('created_');

      if (!isCreated) {
        // Restore original stylesheet inline styling and properties
        el.style.cssText = el._originalStyleCssText || '';
        el.removeAttribute('data-ed-dragged');
        el.removeAttribute('data-ed-parent');
        el.innerHTML = el._originalHTML || el.innerHTML;
        const presets = ['preset-glass', 'preset-cyber', 'preset-luxury', 'preset-brutalist'];
        presets.forEach(p => el.classList.remove(p));

        // Always restore original parent positioning
        if (el._originalParent && el.parentElement !== el._originalParent) {
          el._originalParent.insertBefore(el, el._originalNextSibling);
        }
      } else {
        // Created elements start fresh and are reset
        const editorProps = ['fontFamily','fontSize','color','fontWeight','fontStyle','textAlign','left','top','width','height','display','lineHeight','letterSpacing'];
        editorProps.forEach(p => el.style.removeProperty(p.replace(/([A-Z])/g, '-$1').toLowerCase()));
        const presets = ['preset-glass', 'preset-cyber', 'preset-luxury', 'preset-brutalist'];
        presets.forEach(p => el.classList.remove(p));
        el.removeAttribute('data-ed-dragged');
        el.removeAttribute('data-ed-parent');
        el.style.position = 'fixed';
        el.style.zIndex   = '8999';
        el.style.margin   = '0';
        if (!data || !data._parentId) {
          document.body.appendChild(el);
        }
      }

      if (!data) return;

      Object.entries(data).forEach(([k, v]) => {
        if (k === '_preset') {
          const presets = ['preset-glass', 'preset-cyber', 'preset-luxury', 'preset-brutalist'];
          presets.forEach(p => el.classList.remove(p));
          el.classList.add('preset-' + v);
          return;
        }
        if (k === '_html') { el.innerHTML = v; return; }
        if (k === '_dragged') {
          // Only mark as dragged for created elements; static elements always return to flow
          if (id.startsWith('created_')) el.setAttribute('data-ed-dragged', 'true');
          return;
        }
        if (k === '_parentId') { el.setAttribute('data-ed-parent', v); return; }
        el.style[k] = v;
      });

      // Only keep created elements in fixed position on load; static page elements flow normally
      if (id.startsWith('created_') && data._dragged && !data._parentId) {
        el.style.position = 'fixed';
        el.style.zIndex   = '8999';
        el.style.margin   = '0';
      } else if (!id.startsWith('created_')) {
        // Ensure static elements are NOT fixed on load regardless of saved state
        if (el.style.position === 'fixed') el.style.position = '';
        el.removeAttribute('data-ed-dragged');
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

    if (selectedEl && selectedEl.isConnected) {
      syncToolbarToElement(selectedEl);
      updateSelectBoxPos();
    } else if (selectedEl) {
      deselect();
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
        if (item.src) newEl.src = item.src;
        newEl.setAttribute('data-editable', 'true');
        newEl.dataset.editableId = item.id;
        document.body.appendChild(newEl);
      });
    } catch(e) {}

    // Store original parent pointers and styles for static DOM elements
    document.querySelectorAll('[data-editable]').forEach(el => {
      el._originalHTML = el.innerHTML;
      el._originalParent = el.parentElement;
      el._originalNextSibling = el.nextSibling;
      el._originalStyleCssText = el.style.cssText; // Save original inline styling
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

  // ─── Floating Panel Positioning Helpers ────────────────────────
  function initFloatingPanelDrag() {
    if (!floatingPanelDrag || !floatingPanel) return;
    floatingPanelDrag.addEventListener('mousedown', e => {
      if (e.target.closest('button')) return;
      e.preventDefault();
      const rect = floatingPanel.getBoundingClientRect();
      const offX = e.clientX - rect.left;
      const offY = e.clientY - rect.top;
      
      floatingPanel.dataset.manualMoved = 'true';

      function onMove(ev) {
        floatingPanel.style.left = (ev.clientX - offX) + 'px';
        floatingPanel.style.top  = (ev.clientY - offY) + 'px';
      }

      function onUp() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      }

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  }

  function updateFloatingSettingsPos() {
    if (!floatingPanel || !selectedEl || !editorMode) return;
    
    // If user dragged the panel manually, don't force auto-aligning it
    if (floatingPanel.dataset.manualMoved === 'true') {
      floatingPanel.style.display = 'flex';
      return;
    }

    const rect = selectedEl.getBoundingClientRect();
    const popupHeight = floatingPanel.offsetHeight || 120;
    const popupWidth = floatingPanel.offsetWidth || 240;

    let left = rect.left + (rect.width - popupWidth) / 2;
    let top = rect.top - popupHeight - 12;

    // Boundary constraints
    left = Math.max(16, Math.min(window.innerWidth - popupWidth - 16, left));
    top = Math.max(16, top);

    floatingPanel.style.left = left + 'px';
    floatingPanel.style.top = top + 'px';
    floatingPanel.style.display = 'flex';
  }

  // ─── Particle Builder & Updates Helpers ────────────────────────
  function buildDynamicParticleSystem(meshName, density, noiseSpeed, behavior, customColor) {
    if (!window.THREE || !window._webglScene) return null;
    try {
      const count = parseInt(density) || 500;
      const geo = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      
      const radius = 0.8;
      for (let i = 0; i < count; i++) {
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = radius * (0.3 + 0.7 * Math.random());
        
        positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
      }
      
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      
      const colorVal = customColor || '#cebdf8';
      const mat = new THREE.PointsMaterial({
        color: new THREE.Color(colorVal),
        size: 0.04,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      
      const pts = new THREE.Points(geo, mat);
      pts.name = meshName;
      pts.position.set(0, 0.5, 0);
      pts.userData = {
        density: count,
        noiseSpeed: parseFloat(noiseSpeed || 1.0),
        behavior: behavior || 'drift',
        color: colorVal
      };
      
      window._webglScene.add(pts);
      return pts;
    } catch (e) {
      console.error('buildDynamicParticleSystem error:', e);
      return null;
    }
  }

  function updateSelectedParticles() {
    if (!selectedEl || !selectedEl.dataset.editableId.startsWith('created_particles_')) return;
    if (!window.THREE || !window._webglScene) return;

    const density = parseInt(partDensityInput.value) || 500;
    const noiseSpeed = parseFloat(partNoiseInput.value) || 1.0;
    const behavior = partBehaviorSelect.value || 'drift';
    const customColor = colorPicker.value || '#cebdf8';

    // Remove old particle system
    if (selectedEl._threeMesh) {
      window._webglScene.remove(selectedEl._threeMesh);
      selectedEl._threeMesh.geometry.dispose();
      selectedEl._threeMesh.material.dispose();
    }

    // Rebuild particle system with new settings
    const newPts = buildDynamicParticleSystem(selectedEl.dataset.editableId, density, noiseSpeed, behavior, customColor);
    if (newPts) {
      selectedEl._threeMesh = newPts;
    }

    markUnsaved();
    autoSave();
  }

  // ─── Utility: RGB to Hex ───────────────────────────────────────
  function rgbToHex(rgb) {
    if (!rgb || rgb === 'transparent') return '#000000';
    if (rgb.startsWith('#')) return rgb;
    const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!m) return '#000000';
    return '#' + [m[1], m[2], m[3]].map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
  }

  // ─── Refresh scroll animation UI pills ────────────────────────
  function refreshAnimUI(el, kfs) {
    const pillContainer = document.getElementById('sb-kf-pills');
    const kfCount = document.getElementById('sb-anim-kf-count');
    if (!pillContainer) return;
    if (!kfs || kfs.length === 0) {
      pillContainer.innerHTML = '<span class="sb-kf-pill-empty">No keyframes recorded</span>';
      if (kfCount) kfCount.textContent = '0 frames';
      return;
    }
    if (kfCount) kfCount.textContent = kfs.length + ' frame' + (kfs.length !== 1 ? 's' : '');
    pillContainer.innerHTML = kfs.map(kf =>
      `<span class="sb-kf-pill" title="scroll ${(kf.scroll*100).toFixed(0)}%">${(kf.scroll*100).toFixed(0)}%</span>`
    ).join('');
  }

  // ─── Expose globally ───────────────────────────────────────────
  window.pageEditor = {
    init, toggleEditorMode, saveEdits, loadEdits,
    selectElement: (el) => { if (editorMode) select(el); }
  };

  // Auto-init after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 100);
  }
})();

