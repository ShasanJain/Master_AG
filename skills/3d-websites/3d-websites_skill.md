---
name: 3d-websites
description: >-
  Agent skill for constructing immersive 3D digital storytelling interfaces with scroll-driven interactions, GLSL grids, skeletal wings animation loops, spatial audio coordinates, and React cleanups.
---

# 3D Websites Digital Storytelling

## Overview
This skill provides templates, guidelines, and reference code for creating interactive, scroll-linked WebGL websites with dynamic camera movements, GLSL shader layers, skeletal animations, and immersive spatial audio elements.

## Dependencies
- **ui-master**: Applied for visual styling guidelines, layout grids, spacing rules, and responsive design layouts.
- **seo**: Used to validate metadata tags and check core web vitals on generated landing pages.

## Implemented Design Systems & Visual FX

### 1. HTML5 Sand Particle Canvas (Mouse Velocity Scaling)
Sits at `z-index: 994` above the background WebGL canvas to overlay real-time particle feedback without introducing expensive GPU draw calls to Three.js.
- **Physics**: Individual grains apply gravity (`0.055`), drag (`0.975` horizontal damping), and decay dynamically.
- **Velocity Scatter**: Spawn angle is biased by the velocity direction (`Math.atan2(dy, dx)`) for realistic physical scattering.
- **Budgeting**: Keep a fractional carry-over `spawnBudget += Math.min(3 + speed * 0.18, 12)` so rapid swipes don't drop particle counts due to integer rounding.

```javascript
// Spawn sand particles dynamically on mouse move
window.addEventListener('mousemove', e => {
  const dx = e.clientX - prevX;
  const dy = e.clientY - prevY;
  const speed = Math.sqrt(dx * dx + dy * dy);
  
  spawnBudget += Math.min(3 + speed * 0.18, 12);
  const toSpawn = Math.floor(spawnBudget);
  spawnBudget -= toSpawn;

  for (let i = 0; i < toSpawn; i++) {
    pool.push({
      x: e.clientX + (Math.random() - 0.5) * 22,
      y: e.clientY + (Math.random() - 0.5) * 22,
      vx: Math.cos(angle) * (0.8 + Math.random() * 1.8),
      vy: Math.sin(angle) * (0.8 + Math.random() * 1.8),
      life: 1.0,
      decay: 0.012 + Math.random() * 0.016,
      size: 0.7 + Math.random() * 2.0
    });
  }
});
```

### 2. Glassmorphic Cards: Magnetic Tilt & Spotlight Glow
Traditional CSS hover filters (`backdrop-filter`) clip when 3D rotated or layered under pseudo-elements (`::before` / `::after`).
- **Spotlight Layer**: Insert a separate DOM element (`.card-glow`) inside the card container.
- **Cursor Glow**: Track mouse client position relative to the container bounding rect (`e.clientX - rect.left`) and update the `radial-gradient` background.
- **GSAP Magnetic Tilt**: Translate cursor offset into a tilt angle (`rotateX` / `rotateY`) and apply a smooth GSAP tween.

```javascript
card.addEventListener('mousemove', e => {
  const rect = card.getBoundingClientRect();
  const cx = e.clientX - rect.left;
  const cy = e.clientY - rect.top;
  const nx = (cx / rect.width  - 0.5) * 2;
  const ny = (cy / rect.height - 0.5) * 2;

  glow.style.background = `radial-gradient(circle 280px at ${cx}px ${cy}px, rgba(147,120,230,.50) 0%, rgba(100,149,237,.22) 45%, transparent 72%)`;

  gsap.to(card, {
    rotateX: -ny * 7,
    rotateY:  nx * 9,
    duration: 0.3,
    ease: 'power1.out',
    transformPerspective: 900
  });
});
```

### 3. Global GSAP Ripples
Prevent boundary clipping inside relative containers by appending ripple templates directly to `document.body` with `fixed` positioning.
- **GSAP Tweens**: Transition from `scale: 0.1, opacity: 1` to `scale: 20, opacity: 0`.
- **Garbage Collection**: Automatically invoke `.remove()` on completion to keep the DOM clean.

```javascript
function spawnRipple(x, y, color) {
  const r = document.createElement('div');
  r.className = 'g-ripple';
  r.style.left = x + 'px';
  r.style.top = y + 'px';
  r.style.borderColor = color || 'rgba(26,22,18,.6)';
  document.body.appendChild(r);
  gsap.fromTo(r,
    { scale: 0.1, opacity: 1 },
    { scale: 20, opacity: 0, duration: 0.75, ease: 'power2.out', onComplete: () => r.remove() }
  );
}
```

### 4. Framewise Keyframe Timeline scrubbing
Instead of hardcoding discrete section entries, map layout attributes (position, rotation, scale) to keyframes indexed by scroll progress `[0.0 - 1.0]`. On scroll update, interpolate values between the two closest frames using cubic easing for natural motion curves.
- **Scroll Hook**: Trigger keyframe recalculation inside ScrollTrigger's `onUpdate(self)` callback.
- **Easing Interpolation**: Map localized scroll range progress through a cubic ease-in-out curve to smooth visual velocity.

```javascript
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Interpolate properties framewise based on scroll progress
const range = upper.scroll - lower.scroll;
const local = range === 0 ? 0 : (progress - lower.scroll) / range;
const eased = easeInOutCubic(local);

const x = lower.x + (upper.x - lower.x) * eased;
const y = lower.y + (upper.y - lower.y) * eased;
const scale = (lower.scale + (upper.scale - lower.scale) * eased) * debugScale;
```

### 5. Responsive Aspect Math & Dynamic Positioning
To prevent 3D objects from overlapping glass HUD overlay panels or text containers on different screen widths and window sizes:
- **Aspect Scaling**: Calculate screen aspect ratio (`window.innerWidth / window.innerHeight`) dynamically on resize.
- **Dynamic Offsets**: Conditionally scale down object sizes and scale positions when aspect ratio falls below standard desktops (e.g. `< 1.25`).
- **X Shift Adjustment**: Incorporate interactive shifts so creative teams can fine-tune positions without modifying source files.

```javascript
function getResponsiveX(x) {
  if (Math.abs(x) < 0.01) return 0; // Centered
  const sign = Math.sign(x);
  const aspect = window.innerWidth / window.innerHeight;
  const shift = sign * debugShiftX;

  if (Math.abs(x) < 0.6) {
    return sign * Math.min(0.55, 0.38 * aspect) + shift;
  }
  if (aspect < 1.25) {
    return sign * Math.min(Math.abs(x), 0.68 * aspect) + shift;
  }
  return x + shift;
}
```

### 6. Creative Control Debugger UI
Provide a custom glassmorphic toggle dashboard to let users edit scales, rotational speed parameters, spotlight radius values, and layout positions dynamically.
- **Real-Time Sliders**: Use sliders to update scene coordinates and render loop multipliers on input.
- **GSAP Tweens**: Apply target changes immediately to active elements with smooth GSAP damping curves.

---

## Validation Checklist
Before concluding that a storytelling deployment is fully operational, verify:
- [ ] **Canvas Resizing**: Canvas fills the viewport on all device breakpoints without introducing page overflows.
- [ ] **Interaction Test**: Hovering cards shows smooth magnetic tilts and spotlights without clipping borders.
- [ ] **Sand Particles**: Canvas particle spawning operates with mouse drag/velocity variables and terminates smoothly when mouse stops.
- [ ] **Disposal**: No GPU memory overhead or context leaks exist when navigating or reloading.
