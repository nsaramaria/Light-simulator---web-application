import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createSharedScene, sceneState, onSceneChange } from './sharedScene';
import { CAMERA, PRODUCT } from './sceneConfig';
import renderLoop from './renderLoop';
import styled from 'styled-components';
import { DEG2RAD } from '../utils/math';
import { colors } from '../styles/theme';

const Mount = styled.div`
  width: 100%;
  height: 100%;
  background: ${colors.black};
`;

export default function CameraView() {
  const mountRef = useRef(null);

  useEffect(() => {
    const { scene } = createSharedScene();
    const camera = new THREE.PerspectiveCamera(CAMERA.fov, 1, CAMERA.near, CAMERA.far);
    camera.position.set(sceneState.camera.x, sceneState.camera.y, sceneState.camera.z);
    camera.lookAt(0, PRODUCT.position.y, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const container = mountRef.current;
    const w = container.clientWidth, h = container.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    container.appendChild(renderer.domElement);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    const unsub = onSceneChange(() => {
      const { x, y, z, rx, ry, rz } = sceneState.camera;
      camera.position.set(x, y, z);
      if (rx || ry || rz) {
        camera.rotation.set((rx ?? 0) * DEG2RAD, (ry ?? 0) * DEG2RAD, (rz ?? 0) * DEG2RAD);
      } else {
        camera.lookAt(0, PRODUCT.position.y, 0);
      }
    });

    const renderLoopId = renderLoop.register(() => { renderer.render(scene, camera); }, 1);

    const onResize = () => {
      const w = container.clientWidth, h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderLoop.markDirty();
    };
    window.addEventListener('resize', onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    return () => {
      renderLoop.unregister(renderLoopId); unsub(); ro.disconnect();
      window.removeEventListener('resize', onResize);
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <Mount ref={mountRef} />;
}
