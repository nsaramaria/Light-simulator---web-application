import * as THREE from 'three';
import { PRODUCT } from '../sceneConfig';

let productCounter = 0;

export const resetProductCounter = () => { productCounter = 0; };

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