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

export const createCornerCycloramaGeometry = (w = 7, h = 6, depth = 0.08) => {
 
  const backWall = new THREE.BoxGeometry(w, h, depth);
  backWall.translate(-w / 2, h / 2, 0);

  const rightWall = new THREE.BoxGeometry(depth, h, w);
  rightWall.translate(0, h / 2, w / 2);

  // Floor
  const floor = new THREE.BoxGeometry(w, depth, w);
  floor.translate(-w / 2, 0, w / 2);

  const geo = mergeBufferGeometries([backWall, rightWall, floor]);
  return { geo, width: w, height: h };
};

function mergeBufferGeometries(geometries) {
  const positions = [];
  const normals = [];
  const indices = [];
  let vertexOffset = 0;

  for (const g of geometries) {
    const pos = g.getAttribute('position');
    const norm = g.getAttribute('normal');
    const idx = g.getIndex();

    for (let i = 0; i < pos.count; i++) {
      positions.push(pos.getX(i), pos.getY(i), pos.getZ(i));
      normals.push(norm.getX(i), norm.getY(i), norm.getZ(i));
    }

    if (idx) {
      for (let i = 0; i < idx.count; i++) {
        indices.push(idx.getX(i) + vertexOffset);
      }
    }

    vertexOffset += pos.count;
    g.dispose();
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  merged.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  merged.setIndex(indices);

  return merged;
}