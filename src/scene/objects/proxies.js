import * as THREE from 'three';

// Point light — white sphere
export const makeLightProxy = (position, id) => {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  mesh.position.copy(position);
  mesh.userData.id = id;
  mesh.userData.proxyFor = id;
  return mesh;
};

// Spot light — cone wireframe
export const makeSpotProxy = (position, id) => {
  const mesh = new THREE.Mesh(
    new THREE.ConeGeometry(0.4, 0.6, 8, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xffdd44, wireframe: true })
  );
  mesh.position.copy(position);
  mesh.rotation.x = Math.PI; // cone points downward
  mesh.userData.id = id;
  mesh.userData.proxyFor = id;
  return mesh;
};

// Directional light — arrow pointing down
export const makeDirectionalProxy = (position, id) => {
  const group = new THREE.Group();
  // Sun circle
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.3, 0.4, 16),
    new THREE.MeshBasicMaterial({ color: 0xffaa00, side: THREE.DoubleSide })
  );
  group.add(ring);
  // Direction line
  const line = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.8, 6),
    new THREE.MeshBasicMaterial({ color: 0xffaa00 })
  );
  line.position.y = -0.5;
  group.add(line);
  group.position.copy(position);
  group.userData.id = id;
  group.userData.proxyFor = id;
  return group;
};

// Area light — flat rectangle wireframe
export const makeAreaProxy = (position, id) => {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.MeshBasicMaterial({ color: 0x44aaff, wireframe: true, side: THREE.DoubleSide })
  );
  mesh.position.copy(position);
  mesh.userData.id = id;
  mesh.userData.proxyFor = id;
  return mesh;
};

// Hemisphere light — half sphere
export const makeHemisphereProxy = (position, id) => {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0x87ceeb, wireframe: true })
  );
  mesh.position.copy(position);
  mesh.userData.id = id;
  mesh.userData.proxyFor = id;
  return mesh;
};

// Product cube — pink wireframe box
export const makeProductProxy = (position, id) => {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshBasicMaterial({ color: 0xd4a5a5, wireframe: true })
  );
  mesh.position.copy(position);
  mesh.userData.id = id;
  mesh.userData.proxyFor = id;
  return mesh;
};

// Camera — small orange box
export const makeCameraProxy = (position) => {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.3, 0.6),
    new THREE.MeshBasicMaterial({ color: 0xd4a574 })
  );
  mesh.position.copy(position);
  mesh.userData.id = 'camera';
  return mesh;
};