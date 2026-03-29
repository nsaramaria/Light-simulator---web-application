import * as THREE from 'three';

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

export const makeCameraProxy = (position) => {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.3, 0.6),
    new THREE.MeshBasicMaterial({ color: 0xd4a574 })
  );
  mesh.position.copy(position);
  mesh.userData.id = 'camera';
  return mesh;
};