import * as THREE from 'three';
import { SCENE, LIGHT, FLOOR } from './sceneConfig';
import { DEG2RAD } from '../utils/math';
import { createPointLight, createSpotLight, createDirectionalLight, createAreaLight, createHemisphereLight, resetLightCounter } from './objects/lights';
import { createProductCube, resetProductCounter } from './objects/products';

let sharedInstance = null;

// HMR reset 
if (import.meta.hot) {
  import.meta.hot.dispose(() => { sharedInstance = null; });
}

const listeners = new Set();
export const onSceneChange = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
const notify = () => listeners.forEach(fn => fn());

// Scene state 
export const sceneState = {
  selected: null,
  elements: {},  // keyed by id
  camera:   { x: 0, y: 3, z: 8, rx: 0, ry: 0, rz: 0 },
};

// Compute a target position from light position + rotation
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

// Updaters 
export const updateElement = (id, key, val) => {
  if (!sceneState.elements[id]) return;
  sceneState.elements[id][key] = val;
  const obj = sharedInstance.elementMeshes[id];
  if (!obj) return;

  // Position
  if (key === 'x' || key === 'y' || key === 'z') {
    obj.position[key] = val;
    if (obj.target) {
      const target = computeLightTarget(sceneState.elements[id]);
      obj.target.position.copy(target);
    }
    notify();
    return;
  }

  // Rotation
  if (key === 'rx' || key === 'ry' || key === 'rz') {
    if (obj.target) {
      const target = computeLightTarget(sceneState.elements[id]);
      obj.target.position.copy(target);
    } else if (obj.isRectAreaLight) {
      // user rotation on top of the base orientation
      const state = sceneState.elements[id];
      obj.rotation.set(
        AREA_LIGHT_BASE.x + (state.rx ?? 0) * DEG2RAD,
        AREA_LIGHT_BASE.y + (state.ry ?? 0) * DEG2RAD,
        AREA_LIGHT_BASE.z + (state.rz ?? 0) * DEG2RAD
      );
    } else {
      obj.rotation[key === 'rx' ? 'x' : key === 'ry' ? 'y' : 'z'] = val * DEG2RAD;
    }
    notify();
    return;
  }

  // Scale (products only)
  if (key === 'sx') { obj.scale.x = val; notify(); return; }
  if (key === 'sy') { obj.scale.y = val; notify(); return; }
  if (key === 'sz') { obj.scale.z = val; notify(); return; }


  if (key === 'intensity') { obj.intensity = val; }
  else if (key === 'color') { obj.color.set(val); }
  else if (key === 'distance' && obj.distance !== undefined) { obj.distance = val; }
  // Spot light
  else if (key === 'angle' && obj.isSpotLight) { obj.angle = (val * Math.PI) / 180; }
  else if (key === 'penumbra' && obj.isSpotLight) { obj.penumbra = val; }
  // Area light
  else if (key === 'width' && obj.isRectAreaLight) { obj.width = val; }
  else if (key === 'height' && obj.isRectAreaLight) { obj.height = val; }
  // Hemisphere light
  else if (key === 'skyColor' && obj.isHemisphereLight) { obj.color.set(val); }
  else if (key === 'groundColor' && obj.isHemisphereLight) { obj.groundColor.set(val); }

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

export const updateCamera = (key, val) => {
  sceneState.camera[key] = val;
  notify();
};

// Wrappers that pass the singleton context
export const addPointLight = () => {
  return createPointLight(sharedInstance.scene, sharedInstance.elementMeshes, sceneState, notify);
};

export const addSpotLight = () => {
  return createSpotLight(sharedInstance.scene, sharedInstance.elementMeshes, sceneState, notify);
};

export const addDirectionalLight = () => {
  return createDirectionalLight(sharedInstance.scene, sharedInstance.elementMeshes, sceneState, notify);
};

export const addAreaLight = () => {
  return createAreaLight(sharedInstance.scene, sharedInstance.elementMeshes, sceneState, notify);
};

export const addHemisphereLight = () => {
  return createHemisphereLight(sharedInstance.scene, sharedInstance.elementMeshes, sceneState, notify);
};

export const addProductCube = () => {
  return createProductCube(sharedInstance.scene, sharedInstance.elementMeshes, sceneState, notify);
};

export const createSharedScene = () => {
  if (sharedInstance) return sharedInstance;

  // CREATE SCENE
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(SCENE.backgroundColor);

  const elementMeshes = {};

  // CREATE FLOOR
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(FLOOR.width, FLOOR.height),
    new THREE.MeshStandardMaterial({ color: FLOOR.color, roughness: 0.8 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // CREATE AMBIENT LIGHT
  scene.add(new THREE.AmbientLight(0xffffff, 0.3));

  sharedInstance = { scene, elementMeshes };

  addProductCube();
  addPointLight();

  // Reposition default light to match original config
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

// Dispose all scene objects and reset singleton 
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
  sceneState.elements = {};
  sceneState.selected = null;
  listeners.clear();
};