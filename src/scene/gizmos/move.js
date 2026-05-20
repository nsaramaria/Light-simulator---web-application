import * as THREE from 'three';

const AXIS_COLOR = {
  x: 0xe05a4e,
  y: 0x5aad5a,
  z: 0x4a90d9,
};

const PLANE_COLOR = {
  xy: 0x4a90d9, 
  xz: 0x5aad5a, 
  yz: 0xe05a4e, 
};

export const makeMoveGizmo = () => {
  const group = new THREE.Group();
  group.layers.set(1);

  const axes = [
    { axis: 'x', dir: new THREE.Vector3(1, 0, 0) },
    { axis: 'y', dir: new THREE.Vector3(0, 1, 0) },
    { axis: 'z', dir: new THREE.Vector3(0, 0, 1) },
  ];

  // Single-axis handles
  for (const { axis, dir } of axes) {
    const mat = new THREE.MeshBasicMaterial({ color: AXIS_COLOR[axis], depthTest: false });

    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 8), mat);
    shaft.position.copy(dir.clone().multiplyScalar(0.6));
    shaft.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    shaft.userData.gizmoAxis = axis;
    shaft.userData.gizmoType = 'move';
    shaft.layers.set(1);

    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.3, 8), mat);
    tip.position.copy(dir.clone().multiplyScalar(1.35));
    tip.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    tip.userData.gizmoAxis = axis;
    tip.userData.gizmoType = 'move';
    tip.layers.set(1);

    group.add(shaft, tip);
  }

  // Plane handles 
  const PLANE_OFFSET = 0.35;
  const PLANE_SIZE = 0.22;

  const planes = [
    {
      axis: 'xy', 
      
      makeMesh: () => {
        const geom = new THREE.PlaneGeometry(PLANE_SIZE, PLANE_SIZE);
        const mat = new THREE.MeshBasicMaterial({
          color: PLANE_COLOR.xy,
          depthTest: false,
          transparent: true,
          opacity: 0.6,
          side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(PLANE_OFFSET, PLANE_OFFSET, 0);
        return mesh;
      },
    },
    {
      axis: 'xz',
      makeMesh: () => {
        const geom = new THREE.PlaneGeometry(PLANE_SIZE, PLANE_SIZE);
        const mat = new THREE.MeshBasicMaterial({
          color: PLANE_COLOR.xz,
          depthTest: false,
          transparent: true,
          opacity: 0.6,
          side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(PLANE_OFFSET, 0, PLANE_OFFSET);
        mesh.rotation.x = -Math.PI / 2;
        return mesh;
      },
    },
    {
      axis: 'yz',
      makeMesh: () => {
        const geom = new THREE.PlaneGeometry(PLANE_SIZE, PLANE_SIZE);
        const mat = new THREE.MeshBasicMaterial({
          color: PLANE_COLOR.yz,
          depthTest: false,
          transparent: true,
          opacity: 0.6,
          side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(0, PLANE_OFFSET, PLANE_OFFSET);
        mesh.rotation.y = Math.PI / 2;
        return mesh;
      },
    },
  ];

  for (const { axis, makeMesh } of planes) {
    const mesh = makeMesh();
    mesh.userData.gizmoAxis = axis;
    mesh.userData.gizmoType = 'move';
    mesh.userData.isPlaneHandle = true;
    mesh.layers.set(1);
    group.add(mesh);
  }

  return group;
};
