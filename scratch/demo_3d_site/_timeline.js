/**
 * TIMELINE CONTROL PANEL — Scroll-driven keyframe visualizer and editor
 * Renders keyframe nodes for selected elements along a horizontal scroll-progress track.
 * Supports scrubbing the window scroll state via drag scrubber, adjusting individual keyframe
 * percentages by dragging, and deleting keyframes.
 */
(function initTimeline() {
  'use strict';

  let timelineEl    = null;
  let trackEl       = null;
  let handleEl      = null;
  let containerEl   = null;
  let activeElement = null;
  let activeKfs     = [];
  let isScrubbing   = false;
  let isDraggingKf  = false;
  let draggedKfIdx  = -1;

  const PANEL_POS_KEY = 'master_ag_timeline_pos';

  // ── Build HTML ──
  function buildTimeline() {
    if (timelineEl) return;

    timelineEl = document.createElement('div');
    timelineEl.id = 'timeline-panel';
    timelineEl.className = 'timeline-container minimized';
    timelineEl.innerHTML = `
      <div id="timeline-drag-handle" title="Drag to move panel"></div>
      <div id="timeline-header">
        <span class="timeline-title">🎬 Scroll Animation Timeline</span>
        <div style="display:flex; gap:6px; align-items:center;">
          <span id="timeline-target-name" style="font-size:10px; opacity:0.65; max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">No element selected</span>
          <button id="timeline-min-btn" class="tl-hdr-btn" title="Toggle Size">＋</button>
        </div>
      </div>
      <div id="timeline-body">
        <div id="timeline-controls">
          <button id="tl-record-btn" class="tl-btn" title="Record frame at current scroll">● Record</button>
          <button id="tl-preview-btn" class="tl-btn" title="Preview animation">▶ Play</button>
          <button id="tl-clear-btn" class="tl-btn" title="Clear all frames">🗑 Clear</button>
        </div>
        <div id="timeline-scrubber-wrapper">
          <div id="timeline-axis-labels">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
          <div id="timeline-track">
            <div id="timeline-active-span" style="position: absolute; top: 0; bottom: 0; background: rgba(0, 229, 255, 0.08); border-left: 1px dashed rgba(0, 229, 255, 0.4); border-right: 1px dashed rgba(0, 229, 255, 0.4); pointer-events: none; display: none;"></div>
            <div id="timeline-progress-fill"></div>
            <div id="timeline-scrub-handle" title="Drag to scrub scroll position"></div>
            <div id="timeline-kfs-container"></div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(timelineEl);
    trackEl = timelineEl.querySelector('#timeline-track');
    handleEl = timelineEl.querySelector('#timeline-scrub-handle');
    containerEl = timelineEl.querySelector('#timeline-kfs-container');

    // Restore state
    try {
      const saved = JSON.parse(localStorage.getItem(PANEL_POS_KEY) || 'null');
      if (saved) {
        if (saved.left) timelineEl.style.left = saved.left;
        if (saved.top) {
          timelineEl.style.top = saved.top;
          timelineEl.style.bottom = 'auto';
        }
        if (!saved.minimized) {
          timelineEl.classList.remove('minimized');
          timelineEl.querySelector('#timeline-min-btn').textContent = '−';
        }
      }
    } catch (e) {}

    initEvents();
  }

  // ── Drag & Resize ──
  function initEvents() {
    const drag = timelineEl.querySelector('#timeline-drag-handle');
    drag.addEventListener('mousedown', e => {
      e.preventDefault();
      const rect = timelineEl.getBoundingClientRect();
      const offX = e.clientX - rect.left;
      const offY = e.clientY - rect.top;

      function onMove(ev) {
        timelineEl.style.left = (ev.clientX - offX) + 'px';
        timelineEl.style.top  = (ev.clientY - offY) + 'px';
        timelineEl.style.bottom = 'auto';
        timelineEl.style.right  = 'auto';
      }
      function onUp() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        savePanelState();
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });

    timelineEl.querySelector('#timeline-min-btn').addEventListener('click', () => {
      const isMin = timelineEl.classList.toggle('minimized');
      timelineEl.querySelector('#timeline-min-btn').textContent = isMin ? '＋' : '−';
      savePanelState();
    });

    // Scrub Handle Dragging
    handleEl.addEventListener('mousedown', e => {
      e.preventDefault();
      e.stopPropagation();
      isScrubbing = true;
      document.body.classList.add('scrubbing-active');

      function onMove(ev) {
        if (!isScrubbing) return;
        const rect = trackEl.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
        scrubTo(ratio);
      }
      function onUp() {
        isScrubbing = false;
        document.body.classList.remove('scrubbing-active');
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });

    // Track click to scrub
    trackEl.addEventListener('click', e => {
      if (isDraggingKf || e.target.classList.contains('tl-kf-node')) return;
      const rect = trackEl.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      scrubTo(ratio);
    });

    // Track scroll events on window to sync scrubber position
    window.addEventListener('scroll', () => {
      if (isScrubbing) return;
      updateScrubUI();
    });

    // Timeline actions
    timelineEl.querySelector('#tl-record-btn').addEventListener('click', () => {
      if (!activeElement || !window.scrollAnim) return;
      window.scrollAnim.recordKeyframe(activeElement);
      refresh();
      if (window.layerPanel) window.layerPanel.render();
    });

    timelineEl.querySelector('#tl-preview-btn').addEventListener('click', () => {
      if (!activeElement || !window.scrollAnim) return;
      window.scrollAnim.previewElement(activeElement, 3000);
      
      // Simulate play scrubbing animation on scrubber
      const start = performance.now();
      const dur = 3000;
      function animateTimeline(now) {
        const t = Math.min(1, (now - start) / dur);
        updateTimelineScrubberProgress(t);
        if (t < 1) requestAnimationFrame(animateTimeline);
        else updateScrubUI();
      }
      requestAnimationFrame(animateTimeline);
    });

    timelineEl.querySelector('#tl-clear-btn').addEventListener('click', () => {
      if (!activeElement || !window.scrollAnim) return;
      if (confirm('Clear all scroll keyframes for this element?')) {
        window.scrollAnim.clearKeyframes(activeElement);
        refresh();
        if (window.layerPanel) window.layerPanel.render();
      }
    });

    // Global Key Listener for Delete Keyframes
    document.addEventListener('keydown', e => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const node = document.querySelector('.tl-kf-node.selected');
        if (node && activeElement && window.scrollAnim) {
          const idx = parseInt(node.dataset.idx);
          if (!isNaN(idx) && activeKfs[idx]) {
            e.preventDefault();
            activeKfs.splice(idx, 1);
            if (activeKfs.length === 0) {
              window.scrollAnim.clearKeyframes(activeElement);
            } else {
              activeElement.dataset.scrollKfs = JSON.stringify(activeKfs);
              const data = JSON.parse(localStorage.getItem('master_ag_scroll_kfs') || '{}');
              data[activeElement.dataset.editableId] = activeKfs;
              localStorage.setItem('master_ag_scroll_kfs', JSON.stringify(data));
            }
            refresh();
            if (window.layerPanel) window.layerPanel.render();
          }
        }
      }
    });
  }

  function scrubTo(ratio) {
    const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
    window.scrollTo(window.scrollX, ratio * maxScroll);
    updateTimelineScrubberProgress(ratio);
  }

  function updateTimelineScrubberProgress(ratio) {
    if (!handleEl || !timelineEl) return;
    const percent = (ratio * 100).toFixed(1) + '%';
    handleEl.style.left = percent;
    timelineEl.querySelector('#timeline-progress-fill').style.width = percent;
    const dbgScroll = document.getElementById('dbg-scroll-val');
    if (dbgScroll) dbgScroll.textContent = (ratio * 100).toFixed(0) + '%';
  }

  function updateScrubUI() {
    const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
    const ratio = window.scrollY / maxScroll;
    updateTimelineScrubberProgress(ratio);
  }

  function savePanelState() {
    if (!timelineEl) return;
    localStorage.setItem(PANEL_POS_KEY, JSON.stringify({
      left: timelineEl.style.left,
      top:  timelineEl.style.top,
      minimized: timelineEl.classList.contains('minimized')
    }));
  }

  // ── Render Keyframes Nodes ──
  function refresh() {
    if (!containerEl) return;
    containerEl.innerHTML = '';

    if (!activeElement) {
      timelineEl.querySelector('#timeline-target-name').textContent = 'No element selected';
      timelineEl.querySelector('#tl-record-btn').disabled = true;
      timelineEl.querySelector('#tl-preview-btn').disabled = true;
      timelineEl.querySelector('#tl-clear-btn').disabled = true;
      return;
    }

    timelineEl.querySelector('#tl-record-btn').disabled = false;
    timelineEl.querySelector('#tl-preview-btn').disabled = false;
    timelineEl.querySelector('#tl-clear-btn').disabled = false;

    // Get element label
    let label = activeElement.tagName.toLowerCase();
    const text = (activeElement.textContent || '').trim().replace(/\s+/g,' ').slice(0, 18);
    if (text) label = `"${text}"`;
    timelineEl.querySelector('#timeline-target-name').textContent = label;

    try {
      activeKfs = JSON.parse(activeElement.dataset.scrollKfs || '[]');
    } catch (e) {
      activeKfs = [];
    }

    const activeSpan = timelineEl.querySelector('#timeline-active-span');
    if (activeSpan) {
      if (activeKfs.length >= 1) {
        const startPct = activeKfs[0].scroll * 100;
        const endPct = activeKfs[activeKfs.length - 1].scroll * 100;
        activeSpan.style.left = startPct + '%';
        activeSpan.style.width = (endPct - startPct) + '%';
        activeSpan.style.display = 'block';
      } else {
        activeSpan.style.display = 'none';
      }
    }

    activeKfs.forEach((kf, idx) => {
      const node = document.createElement('div');
      node.className = 'tl-kf-node';
      node.dataset.idx = idx;
      node.style.left = (kf.scroll * 100) + '%';
      node.title = `Frame at ${(kf.scroll * 100).toFixed(0)}%`;

      node.addEventListener('mousedown', e => {
        e.preventDefault();
        e.stopPropagation();
        
        // Select node
        document.querySelectorAll('.tl-kf-node').forEach(n => n.classList.remove('selected'));
        node.classList.add('selected');

        isDraggingKf = true;
        draggedKfIdx = idx;

        function onMove(ev) {
          if (!isDraggingKf) return;
          const rect = trackEl.getBoundingClientRect();
          const ratio = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
          
          node.style.left = (ratio * 100) + '%';
          node.title = `Frame at ${(ratio * 100).toFixed(0)}%`;
          kf.scroll = parseFloat(ratio.toFixed(4));
        }

        function onUp() {
          isDraggingKf = false;
          // Sort keyframes in order of scroll percentage
          activeKfs.sort((a, b) => a.scroll - b.scroll);
          activeElement.dataset.scrollKfs = JSON.stringify(activeKfs);

          const data = JSON.parse(localStorage.getItem('master_ag_scroll_kfs') || '{}');
          data[activeElement.dataset.editableId] = activeKfs;
          localStorage.setItem('master_ag_scroll_kfs', JSON.stringify(data));

          refresh();
          if (window.layerPanel) window.layerPanel.render();

          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
        }

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });

      containerEl.appendChild(node);
    });

    updateScrubUI();
  }

  // ── Public API ──
  window.timelinePanel = {
    show: () => {
      buildTimeline();
      timelineEl.style.display = 'flex';
      refresh();
    },
    hide: () => {
      if (timelineEl) timelineEl.style.display = 'none';
    },
    refreshTarget: (el) => {
      activeElement = el;
      if (timelineEl && timelineEl.style.display !== 'none') {
        refresh();
      }
    }
  };

  // Wire into window global page init trigger
  setTimeout(() => {
    buildTimeline();
    // Default hidden until editor is active
    timelineEl.style.display = 'none';
  }, 500);

})();
