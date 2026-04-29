import * as THREE from 'three';
import { SCENE, LIGHT, FLOOR } from './sceneConfig';
import { DEG2RAD } from '../utils/math';
import { createPointLight, createSpotLight, createDirectionalLight, createAreaLight, createHemisphereLight, resetLightCounter } from './objects/lights';
import { createProductCube, createCyclorama, resetProductCounter, resetCycloramaCounter } from './objects/products';
import renderLoop from './renderLoop';

let sharedInstance = null;

// HMR reset 
if (import.meta.hot) {
  import.meta.hot.dispose(() => { sharedInstance = null; });
}

const listeners = new Set();
export const onSceneChange = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

let notifyQueued = false;
let notifySuppressed = false;

const notify = () => {
  if (notifySuppressed) return;
  renderLoop.markDirty();
  if (notifyQueued) return;
  notifyQueued = true;
  Promise.resolve().then(() => {
    notifyQueued = false;
    listeners.forEach(fn => fn());
  });
};

const notifySync = () => {
  renderLoop.markDirty();
  notifyQueued = false;
  listeners.forEach(fn => fn());
};

// Incremented on every restoreFullSnapshot call.
let _snapshotVersion = 0;
export const getSnapshotVersion = () => _snapshotVersion;

// Scene state 
export const sceneState = {
  selected: null,
  elements: {},
  camera:   { x: 0, y: 3, z: 8, rx: 0, ry: 0, rz: 0 },
};

const computeLightTarget = (state) => {
  const dir = new THREE.Vector3(0, -1, 0);
  const euler = new THREE.Euler(
    (state.rx ?? 0) * DEG2RAD,
    (state.ry ?? 0) * DEG2RAD,
    (state.rz ?? 0) * DEG2RAD
  );
  dir.applyEuler(euler);
  return new THREE.Vector3(state.x, state.y, state.z).add(dir.multiplyScalar(5));
};

const AREA_LIGHT_BASE = new THREE.Euler(0, Math.PI, 0);

const CREATORS = {
  'point-light':       createPointLight,
  'spot-light':        createSpotLight,
  'directional-light': createDirectionalLight,
  'area-light':        createAreaLight,
  'hemisphere-light':  createHemisphereLight,
  'product-cube':      createProductCube,
  'cyclorama':         createCyclorama,
};

const createElementFromDef = (desiredId, def) => {
  if (!sharedInstance) return null;
  const { scene, elementMeshes } = sharedInstance;

  const creator = CREATORS[def.type];
  if (!creator) return null;

  const createdId = creator(scene, elementMeshes, sceneState, () => {});

  if (createdId !== desiredId) {
    elementMeshes[desiredId] = elementMeshes[createdId];
    delete elementMeshes[createdId];
    sceneState.elements[desiredId] = sceneState.elements[createdId];
    delete sceneState.elements[createdId];
    const obj = elementMeshes[desiredId];
    if (obj) {
      obj.userData.id = desiredId;
      obj.traverse?.(child => {
        if (child.userData.id === createdId) child.userData.id = desiredId;
        if (child.userData.proxyFor === createdId) child.userData.proxyFor = desiredId;
      });
    }
  }

  const obj = elementMeshes[desiredId];
  const state = sceneState.elements[desiredId];
  if (!obj || !state) return desiredId;

  Object.assign(state, def);
  obj.position.set(def.x ?? 0, def.y ?? 0, def.z ?? 0);

  if (obj.target) {
    const target = computeLightTarget(state);
    obj.target.position.copy(target);
  } else if (obj.isRectAreaLight) {
    obj.rotation.set(
      AREA_LIGHT_BASE.x + (def.rx ?? 0) * DEG2RAD,
      AREA_LIGHT_BASE.y + (def.ry ?? 0) * DEG2RAD,
      AREA_LIGHT_BASE.z + (def.rz ?? 0) * DEG2RAD
    );
  } else {
    obj.rotation.set(
      (def.rx ?? 0) * DEG2RAD,
      (def.ry ?? 0) * DEG2RAD,
      (def.rz ?? 0) * DEG2RAD
    );
  }

  if (def.sx !== undefined) obj.scale.set(def.sx ?? 1, def.sy ?? 1, def.sz ?? 1);

  if (obj.isLight) {
    if (def.intensity !== undefined) obj.intensity = def.intensity;
    if (def.distance !== undefined && obj.distance !== undefined) obj.distance = def.distance;
    if (def.color !== undefined && obj.color && !obj.isHemisphereLight) obj.color.set(def.color);
    if (def.angle !== undefined && obj.isSpotLight) obj.angle = (def.angle * Math.PI) / 180;
    if (def.penumbra !== undefined && obj.isSpotLight) obj.penumbra = def.penumbra;
    if (def.width !== undefined && obj.isRectAreaLight) obj.width = def.width;
    if (def.height !== undefined && obj.isRectAreaLight) obj.height = def.height;
    if (def.skyColor !== undefined && obj.isHemisphereLight) obj.color.set(def.skyColor);
    if (def.groundColor !== undefined && obj.isHemisphereLight) obj.groundColor.set(def.groundColor);
  }

  return desiredId;
};

export const clearAllElements = () => {
  if (!sharedInstance) return;
  const { scene, elementMeshes } = sharedInstance;

  for (const id of Object.keys(sceneState.elements)) {
    const obj = elementMeshes[id];
    if (obj) {
      if (obj.target) scene.remove(obj.target);
      scene.remove(obj);
      obj.traverse?.((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
          else child.material.dispose();
        }
      });
    }
    delete elementMeshes[id];
  }
  sceneState.elements = {};
  sceneState.selected = null;
};

export const restoreFullSnapshot = (snapshot) => {
  if (!sharedInstance || !snapshot) return;

  notifySuppressed = true;
  try {
    clearAllElements();
    resetLightCounter();
    resetProductCounter();
    resetCycloramaCounter();

    for (const [id, def] of Object.entries(snapshot.elements)) {
      createElementFromDef(id, def);
    }

    sceneState.camera.x  = snapshot.camera.x  ?? 0;
    sceneState.camera.y  = snapshot.camera.y  ?? 3;
    sceneState.camera.z  = snapshot.camera.z  ?? 8;
    sceneState.camera.rx = snapshot.camera.rx ?? 0;
    sceneState.camera.ry = snapshot.camera.ry ?? 0;
    sceneState.camera.rz = snapshot.camera.rz ?? 0;
    sceneState.selected = null;
  } finally {
    notifySuppressed = false;
    notifyQueued = false;
  }

  _snapshotVersion++;
  notifySync();
};

// ─── Updaters ───

export const updateElement = (id, key, val) => {
  if (!sceneState.elements[id]) return;
  sceneState.elements[id][key] = val;
  const obj = sharedInstance?.elementMeshes[id];
  if (!obj) return;

  if (key === 'x' || key === 'y' || key === 'z') {
    obj.position[key] = val;
    if (obj.target) {
      const target = computeLightTarget(sceneState.elements[id]);
      obj.target.position.copy(target);
    }
    notify(); return;
  }

  if (key === 'rx' || key === 'ry' || key === 'rz') {
    if (obj.target) {
      const target = computeLightTarget(sceneState.elements[id]);
      obj.target.position.copy(target);
    } else if (obj.isRectAreaLight) {
      const state = sceneState.elements[id];
      obj.rotation.set(
        AREA_LIGHT_BASE.x + (state.rx ?? 0) * DEG2RAD,
        AREA_LIGHT_BASE.y + (state.ry ?? 0) * DEG2RAD,
        AREA_LIGHT_BASE.z + (state.rz ?? 0) * DEG2RAD
      );
    } else {
      obj.rotation[key === 'rx' ? 'x' : key === 'ry' ? 'y' : 'z'] = val * DEG2RAD;
    }
    notify(); return;
  }

  if (key === 'sx') { obj.scale.x = val; notify(); return; }
  if (key === 'sy') { obj.scale.y = val; notify(); return; }
  if (key === 'sz') { obj.scale.z = val; notify(); return; }

  if (key === 'intensity') obj.intensity = val;
  else if (key === 'color') obj.color.set(val);
  else if (key === 'distance' && obj.distance !== undefined) obj.distance = val;
  else if (key === 'angle' && obj.isSpotLight) obj.angle = (val * Math.PI) / 180;
  else if (key === 'penumbra' && obj.isSpotLight) obj.penumbra = val;
  else if (key === 'width' && obj.isRectAreaLight) obj.width = val;
  else if (key === 'height' && obj.isRectAreaLight) obj.height = val;
  else if (key === 'skyColor' && obj.isHemisphereLight) obj.color.set(val);
  else if (key === 'groundColor' && obj.isHemisphereLight) obj.groundColor.set(val);

  notify();
};

export const removeElement = (id) => {
  if (!sharedInstance || !sceneState.elements[id]) return;
  const obj = sharedInstance.elementMeshes[id];
  if (obj) {
    if (obj.target) sharedInstance.scene.remove(obj.target);
    sharedInstance.scene.remove(obj);
    obj.traverse?.((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
        else child.material.dispose();
      }
    });
  }
  delete sharedInstance.elementMeshes[id];
  delete sceneState.elements[id];
  if (sceneState.selected === id) sceneState.selected = null;
  notify();
};

export const updateCamera = (key, val) => { sceneState.camera[key] = val; notify(); };

export const setCameraAll = (cam) => {
  Object.assign(sceneState.camera, cam);
  notify();
};

export const getSceneSnapshot = () => {
  const elementsCopy = {};
  for (const [id, el] of Object.entries(sceneState.elements)) {
    elementsCopy[id] = { ...el };
  }
  return { camera: { ...sceneState.camera }, elements: elementsCopy };
};

export const restoreSceneSnapshot = (snapshot) => restoreFullSnapshot(snapshot);

export const getDefaultSnapshot = () => ({
  camera: { x: 0, y: 3, z: 8, rx: 0, ry: 0, rz: 0 },
  elements: {
    'product-0': {
      x: 0, y: 1, z: 0, rx: 0, ry: 0, rz: 0,
      sx: 1, sy: 1, sz: 1, type: 'product-cube'
    },
    'light-0': {
      x: 3, y: 5, z: 3, rx: 0, ry: 0, rz: 0,
      intensity: 1.5, color: '#ffffff', distance: 100,
      type: 'point-light'
    },
  },
});

// ─── Add-element wrappers ───
export const addPointLight = () => createPointLight(sharedInstance.scene, sharedInstance.elementMeshes, sceneState, notify);
export const addSpotLight = () => createSpotLight(sharedInstance.scene, sharedInstance.elementMeshes, sceneState, notify);
export const addDirectionalLight = () => createDirectionalLight(sharedInstance.scene, sharedInstance.elementMeshes, sceneState, notify);
export const addAreaLight = () => createAreaLight(sharedInstance.scene, sharedInstance.elementMeshes, sceneState, notify);
export const addHemisphereLight = () => createHemisphereLight(sharedInstance.scene, sharedInstance.elementMeshes, sceneState, notify);
export const addProductCube = () => createProductCube(sharedInstance.scene, sharedInstance.elementMeshes, sceneState, notify);
export const addCyclorama = () => createCyclorama(sharedInstance.scene, sharedInstance.elementMeshes, sceneState, notify);

// ─── Scene creation / teardown ───

export const createSharedScene = () => {
  if (sharedInstance) return sharedInstance;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(SCENE.backgroundColor);
  const elementMeshes = {};

  const texLoader = new THREE.TextureLoader();
  const floorRepeat = 4;

  const colorMap = texLoader.load('/textures/floor/Tiles013_4K-PNG_Color.png');
  colorMap.wrapS = colorMap.wrapT = THREE.RepeatWrapping;
  colorMap.repeat.set(floorRepeat, floorRepeat);

  const normalMap = texLoader.load('/textures/floor/Tiles013_4K-PNG_NormalGL.png');
  normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.set(floorRepeat, floorRepeat);

  const roughnessMap = texLoader.load('/textures/floor/Tiles013_4K-PNG_Roughness.png');
  roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(floorRepeat, floorRepeat);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(FLOOR.width, FLOOR.height),
    new THREE.MeshStandardMaterial({ map: colorMap, normalMap, roughnessMap, roughness: 1 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  scene.add(new THREE.AmbientLight(0xffffff, 0.3));

  sharedInstance = { scene, elementMeshes };

  addProductCube();
  addPointLight();

  const firstLight = Object.values(elementMeshes).find(o => o.isLight);
  if (firstLight) {
    firstLight.position.set(LIGHT.position.x, LIGHT.position.y, LIGHT.position.z);
    const id = firstLight.userData.id;
    sceneState.elements[id].x = LIGHT.position.x;
    sceneState.elements[id].y = LIGHT.position.y;
    sceneState.elements[id].z = LIGHT.position.z;
  }

  return sharedInstance;
};

export const destroySharedScene = () => {
  if (sharedInstance) {
    sharedInstance.scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    });
    sharedInstance = null;
  }
  resetLightCounter();
  resetProductCounter();
  resetCycloramaCounter();
  sceneState.elements = {};
  sceneState.selected = null;
  listeners.clear();
  notifyQueued = false;
};