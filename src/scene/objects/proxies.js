import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { createSoftboxGeometry } from './geometries';

const loader = new GLTFLoader();
const modelCache = {};

const loadModel = (path) => {
  return new Promise((resolve, reject) => {
    if (modelCache[path]) {
      resolve(modelCache[path].clone());
      return;
    }
    loader.load(
      path,
      (gltf) => { modelCache[path] = gltf.scene; resolve(gltf.scene.clone()); },
      undefined,
      (err) => { console.warn(`Failed to load model ${path}:`, err); reject(err); }
    );
  });
};

const makeModelProxy = (position, id, modelPath, fallbackColor, fallbackGeo, modelScale = 1, modelRotation = null) => {
  const group = new THREE.Group();
  group.position.copy(position);
  group.userData.id = id;
  group.userData.proxyFor = id;

  const fallback = new THREE.Mesh(
    fallbackGeo,
    new THREE.MeshBasicMaterial({ color: fallbackColor, wireframe: true })
  );
  fallback.userData.isFallback = true;
  group.add(fallback);

  loadModel(modelPath).then(model => {
    const fb = group.children.find(c => c.userData.isFallback);
    if (fb) group.remove(fb);

    const pivot = new THREE.Group();
    pivot.userData.isModelPivot = true;
    model.scale.set(modelScale, modelScale, modelScale);
    if (modelRotation) pivot.rotation.copy(modelRotation);
    pivot.add(model);
    group.add(pivot);
    pivot.traverse(child => { child.layers.set(1); });
  }).catch(() => {});

  return group;
};

export const makeLightProxy = (position, id) => {
  return makeModelProxy(position, id, '/models/light_bulb.glb', 0xffffff, new THREE.SphereGeometry(0.25, 16, 16), 1.0);
};

export const makeSpotProxy = (position, id) => {
  return makeModelProxy(position, id, '/models/directional_light.glb', 0xffdd44, new THREE.ConeGeometry(0.4, 0.6, 8, 1, true), 0.8, new THREE.Euler(Math.PI, 0, 0));
};

export const makeAreaProxy = (position, id) => {
  const group = new THREE.Group();
  group.position.copy(position);
  group.userData.id = id;
  group.userData.proxyFor = id;

  const { geo, depth, frontW, frontH } = createSoftboxGeometry();

  const body = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
    color: 0x111111, roughness: 0.8, metalness: 0.1
  }));
  group.add(body);

  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(frontW * 0.92, frontH * 0.92),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, side: THREE.DoubleSide })
  );
  panel.position.z = depth / 2 + 0.01;
  panel.userData.skipHighlight = true;
  group.add(panel);

  group.traverse(child => { child.layers.set(1); });
  return group;
};

export const makeHemisphereProxy = (position, id) => {
  const group = new THREE.Group();
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0x87ceeb, wireframe: true })
  );
  group.add(mesh);
  group.position.copy(position);
  group.userData.id = id;
  group.userData.proxyFor = id;
  return group;
};

export const makeProductProxy = (position, id) => {
  const group = new THREE.Group();
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshBasicMaterial({ color: 0xd4a5a5, wireframe: true })
  );
  group.add(mesh);
  group.position.copy(position);
  group.userData.id = id;
  group.userData.proxyFor = id;
  return group;
};

export const makeCameraProxy = (position) => {
  return makeModelProxy(position, 'camera', '/models/camera.glb', 0xd4a574, new THREE.BoxGeometry(0.4, 0.3, 0.6), 1.0, new THREE.Euler(0, Math.PI, 0));
};