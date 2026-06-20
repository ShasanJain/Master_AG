---
name: 3d-websites-settings
description: Use when executing creative keyframes and material configurations within the production/visuals sector.
---

# 3D Websites Settings & Creative Configuration: Execution Protocol

## ⚙️ Overview
Agent skill for managing, exporting, importing, and syncing the creative keyframes, materials, background shaders, and cursor physics settings of 3D websites. This operational profile separates layout and visual logic from the engine, enabling O(1) replica deployments for enterprise clients via config injection.

## 🛠️ Implementation SOP
- **Step 1: Baseline Context** — Verify active deployment environment (Node local server vs Production CDN) and detect existing keyframe structures.
- **Step 2: Apply the Pattern** — Parse or inject the JSON configuration file containing timeline keyframes, scene variables, and cursor payload.
- **Step 3: Enforce Constraints** — Validate JSON schema arrays to ensure keyframes cover scrolling from index 0.0 to 1.0 continuously.
- **Step 4: Execute Test Suite** — Scrub timeline in DevTools to verify spline interpolation matches the parsed configuration bounds.
- **Step 5: Document and Commit** — Use Creative Panel `/save` POST to permanently patch the root index.html or remote database.

## 📚 Reference Material

### Configuration Schema

#### 1. Timeline Keyframes (`keyframes` Array)
Keyframes define the 3D target coordinates, rotations, scale, and material details indexed by scroll progress `[0.0 - 1.0]`. Easing and Spline interpolations are calculated on the fly between these frames.

```json
[
  {
    "scroll": 0,
    "x": 0.94,
    "y": 0,
    "z": 0.24,
    "rx": 0.64,
    "ry": -0.58,
    "scale": 1.42,
    "opacity": 0.52,
    "metalness": 0.74,
    "roughness": 0.5,
    "emissiveIntensity": 0.85
  },
  {
    "scroll": 1.0,
    "x": 0,
    "y": -0.2,
    "z": 2.0,
    "rx": 1.94,
    "ry": 3.14,
    "scale": 2.0,
    "opacity": 0.14,
    "metalness": 1.0,
    "roughness": 0,
    "emissiveIntensity": 5.0
  }
]
```

#### 2. Scene Variables & Styles
- **Background Shader Grid**: Controlled by density, sharpness, opacity, wave amplitude, wave speed, rotX, rotY, and colors.
- **Cursor System**: Customizable toggle status (Dot, Ring, Crosshair, Noomo Physics), particle trail styles (water, glitter, sand, sparks, snow, smoke), and trail parameters (speed, density, life, color-mode).

---

### Syncing & Saving Workflows

#### 1. Developer Panel Controls
The floating glassmorphic **Creative Control Panel** includes:
- **Timeline Scrub**: Lets the team inspect coordinates at any scroll percentage.
- **📋 Copy**: Copies the current `keyframes` JSON directly to the clipboard.
- **⬇ Export**: Downloads the configuration as a `.json` file.
- **⬆ Import**: Restores keyframes from a saved `.json` configuration.
- **💾 Patch index.html**: Sends a POST request to the local Node server to write changes back to the production file.

#### 2. Automated Server Sync (Node.js)
When the user clicks "Patch index.html", the frontend sends the active settings to the `/save` endpoint of `server.js`. The server parses the payload and applies a regex to overwrite the hardcoded script block in the static template:

```javascript
// Overwrite keyframes within index.html
const regex = /(let keyframes\s*=\s*)\[[\s\S]*?\];/;
indexHtml = indexHtml.replace(regex, `$1${JSON.stringify(newKeyframes, null, 2)};`);
fs.writeFileSync(indexPath, indexHtml, 'utf8');
```

---

### Replication Checklist for Client Projects
To set up a new 3D storytelling site for a client:
1. **Copy Boilerplate**: Duplicate `vanilla_storytelling_template.html` to the target directory.
2. **Replace GLTF Model**: Swap the 3D model reference URL inside the Three.js loader block.
3. **Load Custom Configuration**: Import a previously exported settings `.json` file to instantly set up the camera timeline, particle effects, and colors.
4. **Export Final State**: Use the Creative Panel in development to fine-tune scene positions, and then click **Patch index.html** to freeze settings for production.
