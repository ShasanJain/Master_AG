---
name: 3d-websites
description: Agent skill for constructing immersive 3D digital storytelling interfaces with scroll-driven interactions, GLSL grids, skeletal wings animation loops, spatial audio coordinates, and React cleanups.
---

# 3D Websites Digital Storytelling Skill

## ⚙️ 1. Concept & WebGL Context Setup
Digital storytelling websites capture and guide the visitor's attention using continuous volumetric depth, interactive particle fields, and smooth camera path panning.

### WebGL Baseline Requirements:
- **Renderer**: High-performance pixel ratios capped at `Math.min(window.devicePixelRatio, 2)` to protect system performance.
- **Lighting**: At least one global AmbientLight (intensity `0.5` - `0.8`) and a directional KeyLight + fill pair to create depth.
- **Shaders**: Use wireframed or animated custom vertex/fragment GLSL grid layers to represent futuristic wireframe environments.

---

## 🧭 2. Camera Splines & GSAP Scroll Control
Avoid simple linear offsets. Map camera coordinates to a 3D Bezier/CatmullRom spline path using `THREE.CatmullRomCurve3`.

```javascript
// Define the camera travel spline path
const camPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 4.5),
    new THREE.Vector3(1.2, 0.6, 3.2),
    new THREE.Vector3(-1.5, -0.2, 2.5),
    new THREE.Vector3(0, 0, 1.8)
]);

// Build a GSAP ScrollTrigger timeline to scrub along the spline
gsap.timeline({
    scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1.2
    }
}).to(camera.position, {
    // Map progress along path on update if using a precise mathematical curve
    onUpdate: function() {
        const progress = this.progress();
        const point = camPath.getPointAt(progress);
        camera.position.copy(point);
        camera.lookAt(0, 0, 0);
    }
});
```

---

## 🎨 3. Interaction Architecture
1. **Raycaster Target Click**: Bind pointer intersections. Check parent names recursively to target grouping assets and execute transformations or color shifts.
2. **Skeletal Animation Loops**: Run skeleton rigs (like flap loops) inside a standard `requestAnimationFrame` loop using `THREE.Clock` updates. Do not scrub skeletal frame loops to the scroll position to prevent stuttering.
3. **Glass HUD Overlay Panels**: Float dashboard metrics and content cards over the canvas using glassmorphism. Add 1px translucent borders (`border-white/10` in dark mode) and `backdrop-blur-xl`.

---

## 🔊 4. Immersive Audio Integrations
Connect visual depth directly to auditory perception. Initialize ambient tracks or positional spatial audio nodes.

```javascript
// Ambient Audio Setup
const listener = new THREE.AudioListener();
camera.add(listener);

const sound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();
audioLoader.load('path/to/ambient.ogg', function(buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(0.5);
});

// Trigger play on user interaction to comply with browser privacy policies
window.addEventListener('click', () => {
    if (!sound.isPlaying) sound.play();
});
```

---

## 🧹 5. React & Next.js Memory Management Rules
In a Next.js framework, Three.js contexts can remain active in memory on route changes. **You must dispose of everything** in your cleanup hook:

- Dispose of all **Geometries**.
- Traverse materials: if an array, loop and dispose of each; otherwise, dispose of the material directly.
- Call `renderer.dispose()` and remove the canvas DOM element.
- Stop and remove audio listeners.

For ready-to-run files, inspect the templates:
- [Vanilla Single-file HTML Template](file:///C:/Users/swaya/OneDrive/Desktop/Master_AG/skills/3d-websites/examples/vanilla_storytelling_template.html)
- [Next.js React Canvas Component](file:///C:/Users/swaya/OneDrive/Desktop/Master_AG/skills/3d-websites/examples/nextjs_component_template.tsx)
