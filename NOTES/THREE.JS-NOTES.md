# Three.js Personal Notes

My learning notes for Three.js concepts used in the Light Simulator project.

## Table of Contents

1. [What is Three.js?](#what-is-threejs)
2. [Core Concepts (Scene, Camera, Renderer)](#core-concepts)
3. [The Render Loop (requestAnimationFrame)](#the-render-loop)
4. [Cameras (PerspectiveCamera)](#cameras)
5. [Lights](#lights)
   - [PointLight](#pointlight)
   - [SpotLight](#spotlight)
   - [RectAreaLight (Softbox)](#rectarealight)
   - [HemisphereLight](#hemispherelight)
   - [AmbientLight](#ambientlight)
6. [Geometries and Materials](#geometries-and-materials)
7. [Custom Geometry (BufferGeometry)](#custom-geometry)
8. [Groups](#groups)
9. [Loading 3D Models (GLTFLoader)](#loading-3d-models)
10. [Textures (TextureLoader)](#textures)
11. [OrbitControls](#orbitcontrols)
12. [Raycasting (Click Detection)](#raycasting)
13. [Layers](#layers)
14. [renderOrder and depthTest](#renderorder-and-depthtest)
15. [CameraHelper](#camerahelper)
16. [Shadows](#shadows)
17. [userData](#userdata)
18. [Disposing Resources (Memory Management)](#disposing-resources)
19. [ResizeObserver vs window resize](#resizeobserver-vs-window-resize)

---

## What is Three.js?

Three.js is a JavaScript library that makes WebGL easier to use. WebGL is the browser's API for rendering 3D graphics on the GPU. Without Three.js, you'd write raw shader code and manage buffers manually.

Source: https://threejs.org/docs/  
Source: https://threejs.org/manual/  
Source: https://discoverthreejs.com/

---

## Core Concepts

Every Three.js app needs three things:

```javascript
// 1. SCENE - The container for all 3D objects
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);

// 2. CAMERA - What you're looking through
const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
camera.position.set(0, 3, 8);

// 3. RENDERER - Draws the scene to a canvas element
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
container.appendChild(renderer.domElement);  // Add canvas to the page

// Draw one frame
renderer.render(scene, camera);
```

In my project:
- **CameraView** has its own renderer + camera (the photographer's perspective)
- **SetupView** has its own renderer + camera (the overhead editing view)
- Both share the **same scene** through the singleton pattern in sharedScene.js

---

## The Render Loop

Three.js doesn't auto-update. You need a loop that redraws every frame:

```javascript
const animate = () => {
  requestAnimationFrame(animate);  // Schedule next frame
  controls.update();               // Update orbit controls (damping)
  renderer.render(scene, camera);  // Draw the frame
};
animate();  // Start the loop
```

`requestAnimationFrame` is a browser API that calls your function before the next screen repaint (~60fps). Unlike `setInterval`, it pauses when the tab is hidden (saves CPU/GPU).

> Must cancel on cleanup: `cancelAnimationFrame(rafId)` or it keeps running after the component unmounts.

---

## Cameras

### PerspectiveCamera

Mimics how human eyes see (things get smaller with distance):

```javascript
const camera = new THREE.PerspectiveCamera(
  50,     // FOV (field of view in degrees) - how wide the lens is
  16/9,   // Aspect ratio (width / height)
  0.1,    // Near clipping plane - closest things it can see
  1000    // Far clipping plane - farthest things it can see
);
```

Must update aspect ratio when the container resizes:
```javascript
camera.aspect = container.clientWidth / container.clientHeight;
camera.updateProjectionMatrix();  // Must call this after changing fov/aspect/near/far
```

In my project I have two cameras:
- **helperCamera** — the SetupView camera you orbit around with OrbitControls
- **photographerCamera** — the camera that represents the actual photographer's viewpoint, shown in CameraView

---

## Lights

Each light type in Three.js behaves differently. None of this was obvious from the class names alone — I had to read the docs and experiment with each one.

### PointLight
Emits light in all directions from a single point. Like a bare light bulb.

```javascript
const light = new THREE.PointLight(0xffffff, 1.5, 100);
// color, intensity, distance (how far the light reaches)
light.position.set(5, 5, 5);
light.castShadow = true;
scene.add(light);
```

### SpotLight
Projects a cone of light. Needs a **target** (where it points).

```javascript
const light = new THREE.SpotLight(0xffffff, 2, 100, Math.PI / 6, 0.3);
// color, intensity, distance, angle (cone angle), penumbra (edge softness)
light.position.set(0, 5, 0);
light.target.position.set(0, 0, 0);
scene.add(light);
scene.add(light.target);  // MUST add target to scene!
```

> I use rotation to compute the target direction instead of setting target position directly. The `computeLightTarget` function in sharedScene.js takes rx/ry/rz and calculates where the light should aim.

### RectAreaLight

Rectangular diffused light source, like a softbox. **Requires special initialization!**

```javascript
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib';

// MUST call this before creating any RectAreaLight
RectAreaLightUniformsLib.init();

const light = new THREE.RectAreaLight(0xffffff, 5, 2, 2);
// color, intensity, width, height
```

**Struggle:** The area light silently fails to emit any light unless you call `RectAreaLightUniformsLib.init()` first. It doesn't even give you an error. I had to find this by reading the Three.js examples because the docs don't make it obvious.

### HemisphereLight

Simulates ambient room lighting with **two colors**: sky (from above) and ground (from below).

```javascript
const light = new THREE.HemisphereLight(0x87ceeb, 0x362a1e, 0.5);
// skyColor, groundColor, intensity
```

Not controlled by position in the same way — it's more of a global ambient effect.

### AmbientLight

Lights everything equally from all directions. No shadows, no position.

```javascript
scene.add(new THREE.AmbientLight(0xffffff, 0.3));
```

I use this as a base so the dark side of objects isn't completely black.

---

## Geometries and Materials

**Geometry** = the shape (vertices + faces)  
**Material** = the surface appearance (color, roughness, etc.)  
**Mesh** = geometry + material combined into a visible object

```javascript
const mesh = new THREE.Mesh(
  new THREE.BoxGeometry(2, 2, 2),                    // Shape
  new THREE.MeshStandardMaterial({ color: 0xd4a5a5 }) // Surface
);
mesh.position.set(0, 1, 0);
scene.add(mesh);
```

### Material types I use:
- `MeshBasicMaterial` — Not affected by lights, good for wireframes and gizmos
- `MeshStandardMaterial` — Physically-based, responds to lights (roughness, metalness)

---

## Custom Geometry

For the softbox and cyclorama I needed custom shapes that don't exist as built-in geometries.

### BufferGeometry (manual vertices):
```javascript
const vertices = new Float32Array([
  -frontW/2, -frontH/2,  depth/2,   // vertex 0
   frontW/2, -frontH/2,  depth/2,   // vertex 1
   // ... etc
]);

const indices = [0,1,2, 0,2,3, ...];  // Which vertices form triangles

const geo = new THREE.BufferGeometry();
geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
geo.setIndex(indices);
geo.computeVertexNormals();  // Calculate normals for lighting
```

### Merging geometries:
For the cyclorama (corner wall + floor), I merged three BoxGeometries into one by combining their position/normal/index buffers manually. Three.js doesn't have a built-in merge function for BufferGeometry, so I wrote `mergeBufferGeometries()`.

---

## Groups

A `THREE.Group` is a container that holds multiple objects. Moving/rotating the group affects all children.

```javascript
const group = new THREE.Group();
group.add(bodyMesh);
group.add(panelMesh);
group.position.set(0, 5, 0);  // Both children move together
scene.add(group);
```

Used for: light proxies (model + fallback wireframe), cyclorama (corner wall geometry), camera proxy.

---

## Loading 3D Models

### GLTFLoader

Loads `.glb`/`.gltf` 3D model files. The loading is **asynchronous** — the model isn't available immediately.

```javascript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const loader = new GLTFLoader();
loader.load('/models/light_bulb.glb', (gltf) => {
  scene.add(gltf.scene);  // gltf.scene is the root Group of the model
});
```

### My approach: wireframe fallback + model cache

I show a wireframe placeholder immediately, then swap it for the real model when it loads:

```javascript
// 1. Create wireframe fallback
const fallback = new THREE.Mesh(
  new THREE.SphereGeometry(0.25, 16, 16),
  new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
);
group.add(fallback);

// 2. Load model async, swap when ready
loadModel('/models/light_bulb.glb').then(model => {
  group.remove(fallback);
  group.add(model);
});
```

### Model cache:
```javascript
const modelCache = {};

const loadModel = (path) => {
  return new Promise((resolve) => {
    if (modelCache[path]) {
      resolve(modelCache[path].clone());  // Clone from cache
      return;
    }
    loader.load(path, (gltf) => {
      modelCache[path] = gltf.scene;       // Store original
      resolve(gltf.scene.clone());          // Return a clone
    });
  });
};
```

> Without the cache, adding two of the same light type would load the .glb file twice. With the cache, the file loads once and gets `.clone()`d after that.

---

## Textures

### TextureLoader

Loads image files to use as surface textures:

```javascript
const texLoader = new THREE.TextureLoader();

const colorMap = texLoader.load('/textures/floor/Tiles013_4K-PNG_Color.png');
colorMap.wrapS = colorMap.wrapT = THREE.RepeatWrapping;
colorMap.repeat.set(4, 4);  // Tile the texture 4x4

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({
    map: colorMap,           // Base color texture
    normalMap: normalMap,     // Adds surface detail/bumps
    roughnessMap: roughMap,   // Controls shininess per-pixel
  })
);
```

The floor uses three texture maps for a realistic tile look: color, normal, and roughness.

---

## OrbitControls

Lets the user rotate, zoom, and pan the camera with the mouse:

```javascript
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;   // Smooth deceleration when you stop dragging
controls.target.set(0, 0, 0);   // Point the camera orbits around
controls.update();               // Must call in render loop for damping
```

> I disable controls during gizmo drag (`controls.enabled = false`) so orbiting doesn't interfere with moving objects.

---

## Raycasting

How you detect what the user clicked on in 3D space. You cast an invisible ray from the camera through the mouse position and check what it hits.

```javascript
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Convert pixel coordinates to normalized device coordinates (-1 to 1)
const rect = container.getBoundingClientRect();
mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;

// Cast ray
raycaster.setFromCamera(mouse, camera);
const hits = raycaster.intersectObjects(clickableObjects);

if (hits.length > 0) {
  let obj = hits[0].object;
  // Walk up to find the parent with an ID
  while (obj && !obj.userData.id) obj = obj.parent;
  const clickedId = obj?.userData.id;
}
```

### Distinguishing clicks from orbit drags:

Without checking, every orbit drag would register as a click. I track `pointerdown` position and compare it to `pointerup`:

```javascript
const onPointerDown = (e) => { pointerDownPos = { x: e.clientX, y: e.clientY }; };

const onPointerUp = (e) => {
  const dx = e.clientX - pointerDownPos.x;
  const dy = e.clientY - pointerDownPos.y;
  if (Math.sqrt(dx * dx + dy * dy) > 4) return;  // Was a drag, not a click
  // ... do click logic
};
```

---

## Layers

Layers control what each camera can see. Each object and camera has a layer bitmask.

```javascript
// Put helpers on layer 1
grid.layers.set(1);
axesHelper.layers.set(1);
cameraHelper.layers.set(1);

// Setup camera can see layer 0 and 1
helperCamera.layers.enable(1);

// Photographer camera only sees layer 0 (default)
// So it doesn't see the grid, axes, or camera helper
```

I use layers to keep the editing helpers (grid, axes, camera frustum lines, proxy objects) visible only in the Setup View but not in the Camera View.

---

## renderOrder and depthTest

**Struggle:** After linking the Add menu to actually create elements in the scene, the gizmo arrows started rendering behind newly added cubes. They looked like they were on a different layer.

**Problem:** Three.js draws objects in the order they're added to the scene. The depth buffer determines what's in front. Elements added later naturally cover earlier ones in the depth buffer.

**Solution:** Two properties that solve this:

```javascript
gizmo.renderOrder = 999;  // Forces this to draw LAST
gizmo.traverse(child => {
  if (child.isMesh && child.material) {
    child.material.depthTest = false;   // Ignores depth buffer entirely
    child.material.depthWrite = false;  // Doesn't write to depth buffer
    child.renderOrder = 999;
  }
});
```

- `renderOrder` — Higher numbers draw later in the pipeline
- `depthTest: false` — Object ignores the depth buffer, so nothing can occlude it
- `depthWrite: false` — Object doesn't write to depth buffer, so it doesn't occlude others

---

## CameraHelper

Draws the frustum (viewing cone) of a camera as visible lines:

```javascript
const cameraHelper = new THREE.CameraHelper(photographerCamera);
scene.add(cameraHelper);

// Must update in render loop if camera changes
cameraHelper.update();
```

This shows orange lines in the Setup View representing what the photographer's camera can see.

---

## Shadows

```javascript
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;  // Softer shadow edges

light.castShadow = true;     // This light creates shadows
mesh.castShadow = true;      // This object blocks light
floor.receiveShadow = true;  // This surface shows shadows
```

> Only enabled in CameraView renderer (the final output). SetupView has shadows disabled for performance.

---

## userData

Every Three.js object has a `userData` property where you can store custom data:

```javascript
mesh.userData.id = 'light-0';
mesh.userData.proxyFor = 'light-0';
mesh.userData.isFallback = true;
mesh.userData.gizmoAxis = 'x';
mesh.userData.gizmoType = 'move';
mesh.userData.skipHighlight = true;
```

I use it to identify objects during raycasting (walk up parent chain to find `userData.id`) and to mark gizmo parts with their axis for drag handling.

---

## Disposing Resources

Three.js objects use GPU memory. Unlike regular JS objects, they don't get garbage collected automatically. Must manually dispose:

```javascript
// Dispose a single mesh
if (mesh.geometry) mesh.geometry.dispose();
if (mesh.material) {
  if (Array.isArray(mesh.material)) mesh.material.forEach(m => m.dispose());
  else mesh.material.dispose();
}

// Dispose entire scene (from destroySharedScene)
scene.traverse((obj) => {
  if (obj.geometry) obj.geometry.dispose();
  if (obj.material) {
    if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
    else obj.material.dispose();
  }
});
```

Also dispose the renderer: `renderer.dispose()`

---

## ResizeObserver vs window resize

**Struggle:** I was using `window.addEventListener('resize', onResize)` but it didn't catch when the panels changed size from dragging the divider. The window wasn't resizing — just the internal panels.

**Solution:** `ResizeObserver` watches the actual container element and fires whenever its size changes, regardless of the reason:

```javascript
const ro = new ResizeObserver(() => {
  const w = container.clientWidth, h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});
ro.observe(container);

// Cleanup
ro.disconnect();
```

I still keep the window resize listener too (for browser window resizing), but ResizeObserver is what actually catches panel drag and maximize/restore.