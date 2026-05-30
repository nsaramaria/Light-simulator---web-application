import * as THREE from 'three';

const AXIS_COLOR = {
  sx: 0xe05a4e,
  sy: 0x5aad5a,
  sz: 0x4a90d9,
};

export const makeScaleGizmo = () => {
  const group = new THREE.Group();
  group.layers.set(1);

  const axes = [
    { axis: 'sx', dir: new THREE.Vector3(1, 0, 0) },
    { axis: 'sy', dir: new THREE.Vector3(0, 1, 0) },
    { axis: 'sz', dir: new THREE.Vector3(0, 0, 1) },
  ];

  for (const { axis, dir } of axes) {
    const mat = new THREE.MeshBasicMaterial({ color: AXIS_COLOR[axis], depthTest: false });

    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 8), mat);
    shaft.position.copy(dir.clone().multiplyScalar(0.6));
    shaft.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    shaft.userData.gizmoAxis = axis;
    shaft.userData.gizmoType = 'scale';
    shaft.layers.set(1);

    // scale handles use cubes at the end of each axis 
    const tip = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.18), mat);
    tip.position.copy(dir.clone().multiplyScalar(1.35));
    tip.userData.gizmoAxis = axis;
    tip.userData.gizmoType = 'scale';
    tip.layers.set(1);

    group.add(shaft, tip);
  }

  // uniform scale center handle
  const centerMat = new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false });
  const center = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.18), centerMat);
  center.userData.gizmoAxis = 'suniform';
  center.userData.gizmoType = 'scale';
  center.layers.set(1);
  group.add(center);

  return group;
};
