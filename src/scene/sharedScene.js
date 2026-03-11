// src/scene/sharedScene.js
import * as THREE from 'three';
import { SCENE, LIGHT, PRODUCT, FLOOR } from './sceneConfig';

export const createSharedScene = () => {
  // CREATE SCENE
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(SCENE.backgroundColor);

  // CREATE FLOOR
  const floorGeometry = new THREE.PlaneGeometry(FLOOR.width, FLOOR.height);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: FLOOR.color,
    roughness: 0.8,
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // CREATE PRODUCT (Cube)
  const productGeometry = new THREE.BoxGeometry(
    PRODUCT.size,
    PRODUCT.size,
    PRODUCT.size
  );
  const productMaterial = new THREE.MeshStandardMaterial({
    color: PRODUCT.color,
  });
  const product = new THREE.Mesh(productGeometry, productMaterial);
  product.position.set(
    PRODUCT.position.x,
    PRODUCT.position.y,
    PRODUCT.position.z
  );
  product.castShadow = true;
  product.receiveShadow = true;
  scene.add(product);

  // CREATE MAIN LIGHT
  const light = new THREE.PointLight(LIGHT.color, LIGHT.intensity, 100);
  light.position.set(
    LIGHT.position.x,
    LIGHT.position.y,
    LIGHT.position.z
  );
  light.castShadow = true;
  scene.add(light);

  // CREATE AMBIENT LIGHT
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  return { scene, product, light };
};