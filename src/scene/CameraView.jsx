import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createSharedScene, sceneState, onSceneChange } from './sharedScene';
import { CAMERA, PRODUCT } from './sceneConfig';
import styled from 'styled-components';
import { DEG2RAD } from '../utils/math';

const Mount = styled.div`
  width: 100%;
  height: 100%;
  background: #000;
`;

export default function CameraView() {
  const mountRef = useRef(null);

  useEffect(() => {
    const { scene } = createSharedScene();

    const camera = new THREE.PerspectiveCamera(
      CAMERA.fov, 1, CAMERA.near, CAMERA.far
    );
    camera.position.set(
      sceneState.camera.x, sceneState.camera.y, sceneState.camera.z
    );
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
      // Apply rotation if set  otherwise default to looking at the subject
      if (rx || ry || rz) {
        camera.rotation.set(
          (rx ?? 0) * DEG2RAD,
          (ry ?? 0) * DEG2RAD,
          (rz ?? 0) * DEG2RAD
        );
      } else {
        camera.lookAt(0, PRODUCT.position.y, 0);
      }
    });

    let rafId;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const w = container.clientWidth, h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // ResizeObserver catches panel size changes (maximize/restore/drag)
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    return () => {
      cancelAnimationFrame(rafId);
      unsub();
      ro.disconnect();
      window.removeEventListener('resize', onResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <Mount ref={mountRef} />;
}