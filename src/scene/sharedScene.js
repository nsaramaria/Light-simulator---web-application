// src/scene/sharedScene.js
import * as THREE from 'three';
import { SCENE, LIGHT, FLOOR } from './sceneConfig';
import { DEG2RAD } from '../utils/math';
import { createPointLight, resetLightCounter } from './objects/lights';
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

// Updaters 
export const updateElement = (id, key, val) => {
  if (!sceneState.elements[id]) return;
  sceneState.elements[id][key] = val;
  const obj = sharedInstance.elementMeshes[id];
  if (!obj) return;
  if (obj.isLight) {
    if (key === 'intensity') obj.intensity = val;
    else if (key === 'color') obj.color.set(val);
    else if (key === 'rx') obj.rotation.x = val * DEG2RAD;
    else if (key === 'ry') obj.rotation.y = val * DEG2RAD;
    else if (key === 'rz') obj.rotation.z = val * DEG2RAD;
    else obj.position[key] = val;
  } else {
    if (key === 'rx') obj.rotation.x = val * DEG2RAD;
    else if (key === 'ry') obj.rotation.y = val * DEG2RAD;
    else if (key === 'rz') obj.rotation.z = val * DEG2RAD;
    else obj.position[key] = val;
  }
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