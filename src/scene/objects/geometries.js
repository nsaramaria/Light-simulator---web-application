import * as THREE from 'three';

export const createSoftboxGeometry = () => {
  const depth = 0.8;
  const frontW = 1.6, frontH = 1.3;
  const backW = 0.5, backH = 0.4;

  const vertices = new Float32Array([
    -frontW/2, -frontH/2,  depth/2,
     frontW/2, -frontH/2,  depth/2,
     frontW/2,  frontH/2,  depth/2,
    -frontW/2,  frontH/2,  depth/2,
    -backW/2,  -backH/2,  -depth/2,
     backW/2,  -backH/2,  -depth/2,
     backW/2,   backH/2,  -depth/2,
    -backW/2,   backH/2,  -depth/2,
  ]);

  const indices = [
    0,1,2, 0,2,3,
    5,4,7, 5,7,6,
    3,2,6, 3,6,7,
    4,5,1, 4,1,0,
    1,5,6, 1,6,2,
    4,0,3, 4,3,7,
  ];

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();

  return { geo, depth, frontW, frontH };
};