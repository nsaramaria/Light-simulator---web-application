import * as THREE from 'three';

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
  sceneState.elements[id] = { x: 0, y: 5, z: 0, rx: 0, ry: 0, rz: 0, intensity: 1.5, color: '#ffffff', type: 'point-light' };
  notify();
  return id;
};