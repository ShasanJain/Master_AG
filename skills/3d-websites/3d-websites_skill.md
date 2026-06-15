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

## Quick Start
To build a basic vanilla 3D storytelling experience, copy the template in [vanilla_storytelling_template.html](file:///C:/Users/swaya/OneDrive/Desktop/Master_AG/skills/3d-websites/examples/vanilla_storytelling_template.html) and open it in a browser, or run a local dev server. For React/Next.js applications, use the component in [nextjs_component_template.tsx](file:///C:/Users/swaya/OneDrive/Desktop/Master_AG/skills/3d-websites/examples/nextjs_component_template.tsx).

## Workflow

### 1. WebGL Scene Configuration
- Initialize the Three.js `WebGLRenderer` (capping `pixelRatio` to 2 for performance), `PerspectiveCamera`, and `Scene`.
- Set up global lighting using `AmbientLight` for base visibility, plus a `DirectionalLight` pair (Key + Fill) to define 3D volume.
- Load 3D assets (`.glb` / `.gltf` format) using `GLTFLoader`. Incorporate fallback loading logic in case of asset failures.

### 2. Scroll-Linked Animation Splines
- Plot a path for the camera using `THREE.CatmullRomCurve3`.
- Create a GSAP timeline with `ScrollTrigger` bound to the viewport scroll (`trigger: "body"`, `scrub: true`).
- Scrub the camera along the path using `onUpdate` to compute camera positions smoothly.

### 3. Morphing Shader Grids
- Render custom GLSL grids to represent abstract landscape meshes.
- Use a vertex shader to apply sine/cosine displacement animations using a time uniform (`uTime`).
- Use a fragment shader to animate colors or fade edges dynamically based on elevation coordinates.

### 4. User Interaction & Spatial Soundscapes
- Implement pointer picking via `THREE.Raycaster` to detect clicks on interactive meshes and trigger GSAP scaling animations.
- Separate skeletal rig loops (e.g. wing flapping) from scroll scrub timelines by updating the `THREE.AnimationMixer` with clock deltas on every frame.
- Initialize `THREE.AudioListener` and `THREE.Audio` nodes to play ambient soundtracks upon first click.

### 5. Memory Management (Next.js/React)
- Explicitly release GPU resources inside React cleanups or route-exit handlers.
- Recursively traverse the scene: dispose of every mesh's geometry, traverse and dispose of all materials (handling arrays), and call `renderer.dispose()`.

## Rate Limiting
Not applicable. All assets and scripts are loaded locally or via public CDNs.

## Common Mistakes
- **Scrubbing Skeletal Animations**: Do not scrub skeletal keyframes (like flapping wings) directly via scroll progress. Keep them running continuously in the animation frame loop.
- **Memory Leaks in React**: Forgetting to dispose of geometries and materials on unmount, which crashes the user's browser during navigation.
- **Linear Camera Movement**: Using simple linear position changes on scroll rather than mathematical curve paths, which results in flat, uninspired camera movement.
