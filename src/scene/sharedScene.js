// src/scene/sharedScene.js
import * as THREE from 'three';
import { SCENE, LIGHT, PRODUCT, FLOOR } from './sceneConfig';

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
  product:  { x: PRODUCT.position.x, y: PRODUCT.position.y, z: PRODUCT.position.z },
  light:    { x: LIGHT.position.x, y: LIGHT.position.y, z: LIGHT.position.z, intensity: LIGHT.intensity, color: '#ffffff' },
  camera:   { x: 0, y: 3, z: 8 },
};

// Updaters 
export const updateProduct = (axis, val) => {
  sceneState.product[axis] = val;
  sharedInstance.product.position[axis] = val;
  notify();
};

export const updateLight = (key, val) => {
  sceneState.light[key] = val;
  const { light } = sharedInstance;
  if (key === 'intensity') light.intensity = val;
  else if (key === 'color') light.color.set(val);
  else light.position[key] = val;
  notify();
};

export const updateCamera = (axis, val) => {
  sceneState.camera[axis] = val;
  notify();
};

export const createSharedScene = () => {
  if (sharedInstance) return sharedInstance;

  // CREATE SCENE
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(SCENE.backgroundColor);

  // CREATE FLOOR
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(FLOOR.width, FLOOR.height),
    new THREE.MeshStandardMaterial({ color: FLOOR.color, roughness: 0.8 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // CREATE PRODUCT 
  const product = new THREE.Mesh(
    new THREE.BoxGeometry(PRODUCT.size, PRODUCT.size, PRODUCT.size),
    new THREE.MeshStandardMaterial({ color: PRODUCT.color })
  );
  product.position.set(PRODUCT.position.x, PRODUCT.position.y, PRODUCT.position.z);
  product.castShadow = true;
  product.receiveShadow = true;
  product.userData.id = 'product';
  scene.add(product);

  // CREATE MAIN LIGHT
  const light = new THREE.PointLight(LIGHT.color, LIGHT.intensity, 100);
  light.position.set(LIGHT.position.x, LIGHT.position.y, LIGHT.position.z);
  light.castShadow = true;
  scene.add(light);

  // CREATE AMBIENT LIGHT
  scene.add(new THREE.AmbientLight(0xffffff, 0.3));

  sharedInstance = { scene, product, light };
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
  listeners.clear();
};