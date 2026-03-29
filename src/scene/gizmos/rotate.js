import * as THREE from 'three';

export const makeRotateGizmo = () => {
  const group = new THREE.Group();
  group.layers.set(1);

  const rings = [
    { axis: 'rx', color: 0xe05a4e, rot: new THREE.Euler(0, Math.PI / 2, 0) },
    { axis: 'ry', color: 0x5aad5a, rot: new THREE.Euler(Math.PI / 2, 0, 0) },
    { axis: 'rz', color: 0x4a90d9, rot: new THREE.Euler(0, 0, 0) },
  ];

  for (const { axis, color, rot } of rings) {
    const mat = new THREE.MeshBasicMaterial({ color, depthTest: false, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.04, 8, 48), mat);
    ring.rotation.copy(rot);
    ring.userData.gizmoAxis = axis;
    ring.userData.gizmoType = 'rotate';
    ring.layers.set(1);
    group.add(ring);
  }

  return group;
};