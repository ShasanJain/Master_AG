/**
 * SCROLL ANIMATION ENGINE — DOM Element Keyframe Driver
 * Applies scroll-driven position/opacity/scale/rotate to [data-editable] elements
 * that have recorded keyframes. Works in both editor ON and OFF modes.
 *
 * Storage: localStorage['master_ag_scroll_kfs'] — { elementId: [keyframe, ...] }
 * Each keyframe: { scroll, left, top, opacity, scale, rotate }
 *   scroll  — 0–1 page progress
 *   left    — viewport-relative px position (stored as fraction of innerWidth)
 *   top     — viewport-relative px position (stored as fraction of innerHeight)
 *   opacity — 0–1
 *   scale   — float (1 = normal)
 *   rotate  — degrees
 */
(function initScrollAnim() {
  'use strict';

  const LS_KEY = 'master_ag_scroll_kfs';
  let animData  = {}; // { elementId: [keyframe, ...] }
  let previewRaf = null;

  // ── Persistence ────────────────────────────────────────────────
  function load() {
    try { animData = JSON.parse(localStorage.getItem(LS_KEY) || '{}'); }
    catch(e) { animData = {}; }
    // Sync to element attributes so the layer panel can read them
    document.querySelectorAll('[data-editable]').forEach(el => {
      const id = el.dataset.editableId;
      if (id && animData[id] && animData[id].length > 0) {
        el.dataset.scrollKfs = JSON.stringify(animData[id]);
        // Elements with keyframes become fixed so the driver can position them
        if (el.style.position !== 'fixed') {
          const rect = el.getBoundingClientRect();
          el._preEditPosition = el._preEditPosition || {
            position: el.style.position,
            left: el.style.left,
            top: el.style.top,
            parent: el.parentElement,
            nextSibling: el.nextSibling
          };
          document.body.appendChild(el);
          el.style.position = 'fixed';
          el.style.margin = '0';
        }
      }
    });
  }

  function save() {
    localStorage.setItem(LS_KEY, JSON.stringify(animData));
  }

  // ── Interpolation (smooth step between keyframes) ───────────────
  function smoothStep(t) { return t * t * (3 - 2 * t); }

  function interpolate(kfs, scrollProg, field) {
    if (!kfs || kfs.length === 0) return null;
    if (kfs.length === 1) return kfs[0][field] ?? null;

    // Clamp to range
    if (scrollProg <= kfs[0].scroll) return kfs[0][field] ?? null;
    if (scrollProg >= kfs[kfs.length - 1].scroll) return kfs[kfs.length - 1][field] ?? null;

    // Find surrounding keyframes
    let lo = kfs[0], hi = kfs[1];
    for (let i = 0; i < kfs.length - 1; i++) {
      if (scrollProg >= kfs[i].scroll && scrollProg <= kfs[i + 1].scroll) {
        lo = kfs[i]; hi = kfs[i + 1]; break;
      }
    }

    const loVal = lo[field] ?? null;
    const hiVal = hi[field] ?? null;
    if (loVal === null || hiVal === null) return loVal ?? hiVal;

    const range = hi.scroll - lo.scroll;
    const t = range > 0 ? (scrollProg - lo.scroll) / range : 0;
    const ts = smoothStep(Math.max(0, Math.min(1, t)));
    return loVal + (hiVal - loVal) * ts;
  }

  // ── Apply animation to all keyed elements ───────────────────────
  function applyAll(scrollOverride) {
    const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
    const scrollProg = scrollOverride !== undefined
      ? scrollOverride
      : window.scrollY / maxScroll;

    document.querySelectorAll('[data-editable]').forEach(el => {
      const id = el.dataset.editableId;
      if (!id || !animData[id] || animData[id].length < 1) return;

      const kfs = animData[id];
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const leftFrac = interpolate(kfs, scrollProg, 'leftFrac');
      const topFrac  = interpolate(kfs, scrollProg, 'topFrac');
      const baseOpacity = interpolate(kfs, scrollProg, 'opacity');
      const scale    = interpolate(kfs, scrollProg, 'scale');
      const rotate   = interpolate(kfs, scrollProg, 'rotate');

      // Visibility bounds: elements fade out smoothly outside their active keyframe boundaries
      const firstScroll = kfs[0].scroll;
      const lastScroll  = kfs[kfs.length - 1].scroll;
      let opacityMult = 1.0;
      let ptrEvents = '';

      if (scrollProg < firstScroll) {
        const dist = firstScroll - scrollProg;
        if (dist < 0.04) {
          opacityMult = 1.0 - (dist / 0.04);
        } else {
          opacityMult = 0;
          ptrEvents = 'none';
        }
      } else if (scrollProg > lastScroll) {
        const dist = scrollProg - lastScroll;
        if (dist < 0.04) {
          opacityMult = 1.0 - (dist / 0.04);
        } else {
          opacityMult = 0;
          ptrEvents = 'none';
        }
      }

      if (leftFrac !== null) el.style.left = (leftFrac * vw).toFixed(1) + 'px';
      if (topFrac !== null)  el.style.top  = (topFrac  * vh).toFixed(1) + 'px';
      
      const targetOpacity = baseOpacity !== null ? baseOpacity : 1.0;
      el.style.opacity = (targetOpacity * opacityMult).toFixed(3);
      el.style.pointerEvents = ptrEvents;

      const s = scale  !== null ? scale  : 1;
      const r = rotate !== null ? rotate : 0;
      el.style.transform = `scale(${s.toFixed(4)}) rotate(${r.toFixed(2)}deg)`;
    });
  }

  // ── rAF loop ────────────────────────────────────────────────────
  function tick() {
    applyAll();
    requestAnimationFrame(tick);
  }

  // ── Record a keyframe for an element at current scroll position ─
  function recordKeyframe(el) {
    const id = el.dataset.editableId;
    if (!id) { console.warn('[ScrollAnim] Element has no editableId'); return null; }

    const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
    const scrollProg = parseFloat((window.scrollY / maxScroll).toFixed(4));
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cs = window.getComputedStyle(el);

    const kf = {
      scroll:   scrollProg,
      leftFrac: parseFloat((rect.left / vw).toFixed(5)),
      topFrac:  parseFloat((rect.top  / vh).toFixed(5)),
      opacity:  parseFloat(parseFloat(cs.opacity || 1).toFixed(3)),
      scale:    parseFloat(parseFloat(el.dataset.kfScale || 1).toFixed(3)),
      rotate:   parseFloat(parseFloat(el.dataset.kfRotate || 0).toFixed(2))
    };

    if (!animData[id]) animData[id] = [];

    // Replace existing frame at same scroll % (within 1%)
    const existingIdx = animData[id].findIndex(k => Math.abs(k.scroll - scrollProg) < 0.011);
    if (existingIdx >= 0) {
      animData[id][existingIdx] = kf;
    } else {
      animData[id].push(kf);
      animData[id].sort((a, b) => a.scroll - b.scroll);
    }

    el.dataset.scrollKfs = JSON.stringify(animData[id]);

    // Ensure element is fixed so driver can position it
    if (el.style.position !== 'fixed') {
      document.body.appendChild(el);
      el.style.position = 'fixed';
      el.style.margin = '0';
    }

    save();
    return animData[id];
  }

  // ── Clear all keyframes for an element ──────────────────────────
  function clearKeyframes(el) {
    const id = el.dataset.editableId;
    if (!id) return;
    delete animData[id];
    delete el.dataset.scrollKfs;
    delete el.dataset.kfScale;
    delete el.dataset.kfRotate;
    // Clear driven styles
    el.style.left = '';
    el.style.top  = '';
    el.style.opacity = '';
    el.style.transform = '';
    save();
  }

  // ── Get keyframes for an element ────────────────────────────────
  function getKeyframes(el) {
    const id = el.dataset.editableId;
    return (id && animData[id]) ? [...animData[id]] : [];
  }

  // ── Preview animation by scrubbing scroll programmatically ──────
  function previewElement(el, duration) {
    if (previewRaf) cancelAnimationFrame(previewRaf);
    const dur = duration || 3000;
    const start = performance.now();

    function step(now) {
      const t = Math.min(1, (now - start) / dur);
      applyAll(t);
      if (t < 1) { previewRaf = requestAnimationFrame(step); }
      else { previewRaf = null; }
    }
    previewRaf = requestAnimationFrame(step);
  }

  // ── Public API ──────────────────────────────────────────────────
  window.scrollAnim = {
    load,
    save,
    recordKeyframe,
    clearKeyframes,
    getKeyframes,
    applyAll,
    previewElement
  };

  // Boot after DOM is ready
  setTimeout(() => {
    load();
    tick();
  }, 400);

})();
