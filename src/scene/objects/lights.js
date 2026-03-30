import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib';

let rectAreaInited = false;
const ensureRectAreaInit = () => {
  if (!rectAreaInited) {
    RectAreaLightUniformsLib.init();
    rectAreaInited = true;
  }
};

let lightCounter = 0;

export const resetLightCounter = () => { lightCounter = 0; };

export const createPointLight = (scene, elementMeshes, sceneState, notify) => {
  const id = `light-${lightCounter++}`;
  const light = new THREE.PointLight(0xffffff, 1.5, 100);
  light.position.set(0, 5, 0);
  light.castShadow = true;
  light.userData.id = id;
  scene.add(light);
  elementMeshes[id] = light;
  sceneState.elements[id] = {
    x: 0, y: 5, z: 0, rx: 0, ry: 0, rz: 0,
    intensity: 1.5, color: '#ffffff', distance: 100,
    type: 'point-light'
  };
  notify();
  return id;
};

export const createSpotLight = (scene, elementMeshes, sceneState, notify) => {
  const id = `light-${lightCounter++}`;
  const light = new THREE.SpotLight(0xffffff, 2, 100, Math.PI / 6, 0.3);
  light.position.set(0, 5, 0);
  light.target.position.set(0, 0, 0);
  light.castShadow = true;
  light.userData.id = id;
  scene.add(light);
  scene.add(light.target);
  elementMeshes[id] = light;
  sceneState.elements[id] = {
    x: 0, y: 5, z: 0, rx: 0, ry: 0, rz: 0,
    intensity: 2, color: '#ffffff', distance: 100,
    angle: 30, penumbra: 0.3,
    type: 'spot-light'
  };
  notify();
  return id;
};

export const createDirectionalLight = (scene, elementMeshes, sceneState, notify) => {
  const id = `light-${lightCounter++}`;
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 5);
  light.target.position.set(0, 0, 0);
  light.castShadow = true;
  light.userData.id = id;
  scene.add(light);
  scene.add(light.target);
  elementMeshes[id] = light;
  sceneState.elements[id] = {
    x: 5, y: 10, z: 5, rx: 0, ry: 0, rz: 0,
    intensity: 1, color: '#ffffff',
    type: 'directional-light'
  };
  notify();
  return id;
};

export const createAreaLight = (scene, elementMeshes, sceneState, notify) => {
  ensureRectAreaInit();
  const id = `light-${lightCounter++}`;
  const light = new THREE.RectAreaLight(0xffffff, 5, 2, 2);
  light.position.set(0, 5, 0);
  light.lookAt(0, 0, 0);
  light.userData.id = id;
  scene.add(light);
  elementMeshes[id] = light;
  sceneState.elements[id] = {
    x: 0, y: 5, z: 0, rx: 0, ry: 0, rz: 0,
    intensity: 5, color: '#ffffff',
    width: 2, height: 2,
    type: 'area-light'
  };
  notify();
  return id;
};

export const createHemisphereLight = (scene, elementMeshes, sceneState, notify) => {
  const id = `light-${lightCounter++}`;
  const light = new THREE.HemisphereLight(0x87ceeb, 0x362a1e, 0.5);
  light.position.set(0, 10, 0);
  light.userData.id = id;
  scene.add(light);
  elementMeshes[id] = light;
  sceneState.elements[id] = {
    x: 0, y: 10, z: 0, rx: 0, ry: 0, rz: 0,
    intensity: 0.5, skyColor: '#87ceeb', groundColor: '#362a1e',
    type: 'hemisphere-light'
  };
  notify();
  return id;
};