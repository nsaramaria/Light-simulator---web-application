import * as THREE from 'three';

export const makeMoveGizmo = () => {
  const group = new THREE.Group();
  group.layers.set(1);

  const axes = [
    { axis: 'x', color: 0xe05a4e, dir: new THREE.Vector3(1, 0, 0) },
    { axis: 'y', color: 0x5aad5a, dir: new THREE.Vector3(0, 1, 0) },
    { axis: 'z', color: 0x4a90d9, dir: new THREE.Vector3(0, 0, 1) },
  ];

  for (const { axis, color, dir } of axes) {
    const mat = new THREE.MeshBasicMaterial({ color, depthTest: false });

    // Shaft
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 8), mat);
    shaft.position.copy(dir.clone().multiplyScalar(0.6));
    shaft.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    shaft.userData.gizmoAxis = axis;
    shaft.userData.gizmoType = 'move';
    shaft.layers.set(1);

    // Tip (cone)
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.3, 8), mat);
    tip.position.copy(dir.clone().multiplyScalar(1.35));
    tip.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    tip.userData.gizmoAxis = axis;
    tip.userData.gizmoType = 'move';
    tip.layers.set(1);

    group.add(shaft, tip);
  }

  return group;
};