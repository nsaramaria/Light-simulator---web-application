import * as THREE from 'three';
import { PRODUCT } from '../sceneConfig';
import { createCornerCycloramaGeometry } from './geometries';

let productCounter = 0;
let cycloramaCounter = 0;

export const resetProductCounter = () => { productCounter = 0; };
export const resetCycloramaCounter = () => { cycloramaCounter = 0; };

export const createProductCube = (scene, elementMeshes, sceneState, notify) => {
  const id = `product-${productCounter++}`;
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(PRODUCT.size, PRODUCT.size, PRODUCT.size),
    new THREE.MeshStandardMaterial({ color: PRODUCT.color })
  );
  mesh.position.set(0, 1, 0);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData.id = id;
  scene.add(mesh);
  elementMeshes[id] = mesh;
  sceneState.elements[id] = { x: 0, y: 1, z: 0, rx: 0, ry: 0, rz: 0, sx: 1, sy: 1, sz: 1, type: 'product-cube' };
  notify();
  return id;
};

export const createCyclorama = (scene, elementMeshes, sceneState, notify) => {
  const id = `cyclorama-${cycloramaCounter++}`;

  const { geo } = createCornerCycloramaGeometry(7, 6, 0.08);
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
    color: 0xf0f0f0,
    roughness: 0.9,
    metalness: 0.0,
    side: THREE.DoubleSide,
  }));
  mesh.receiveShadow = true;
  mesh.userData.id = id;

  const group = new THREE.Group();
  group.userData.id = id;
  group.add(mesh);
  scene.add(group);

  group.position.set(10, 0, -10);

  elementMeshes[id] = group;
  sceneState.elements[id] = {
    x: 10, y: 0, z: -10,
    rx: 0, ry: 0, rz: 0,
    sx: 1, sy: 1, sz: 1,
    type: 'cyclorama'
  };

  notify();
  return id;
};