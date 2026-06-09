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

    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    const container = mountRef.current;
    const w = container.clientWidth, h = container.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    container.appendChild(renderer.domElement);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    let needsRender = true;

    const unsub = onSceneChange(() => {
      const { x, y, z, rx, ry, rz } = sceneState.camera;
      camera.position.set(x, y, z);
      if (rx || ry || rz) {
        camera.rotation.set((rx ?? 0) * DEG2RAD, (ry ?? 0) * DEG2RAD, (rz ?? 0) * DEG2RAD);
      } else {
        camera.lookAt(0, PRODUCT.position.y, 0);
      }
      needsRender = true;
    });

    const renderLoopId = renderLoop.register(() => {
      if (!needsRender) return;
      renderer.render(scene, camera);
      needsRender = false;
    }, 1);

    const onRequestRender = () => { needsRender = true; };
    window.addEventListener('studio:request-render', onRequestRender);

    let lastResizeW = 0, lastResizeH = 0;
    const onResize = () => {
      const w = container.clientWidth, h = container.clientHeight;
      if (w === 0 || h === 0) return;
      if (w === lastResizeW && h === lastResizeH) return; // ignore no-op resizes
      lastResizeW = w; lastResizeH = h;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    
      renderer.render(scene, camera);
      needsRender = false;
    };
    window.addEventListener('resize', onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    let initialPaintDisposed = false;
    let initialPaintRaf1 = 0, initialPaintRaf2 = 0;
    const forceInitialPaint = () => {
      if (initialPaintDisposed) return;
      onResize();
      needsRender = true;
      renderLoop.markDirty();
    };
    initialPaintRaf1 = requestAnimationFrame(() => {
      forceInitialPaint();
      initialPaintRaf2 = requestAnimationFrame(forceInitialPaint);
    });

    const onRequestExport = async (e) => {
      const { width, height, filename } = e.detail || {};
      if (!width || !height) {
        window.dispatchEvent(new CustomEvent('studio:export-error'));
        return;
      }

      let offscreenRenderer = null;
      try {
        offscreenRenderer = new THREE.WebGLRenderer({
          antialias: true,
          preserveDrawingBuffer: true,
        });
        offscreenRenderer.shadowMap.enabled = true;
        offscreenRenderer.shadowMap.type = THREE.PCFShadowMap;
        offscreenRenderer.toneMapping = THREE.ACESFilmicToneMapping;
        offscreenRenderer.toneMappingExposure = 1.0;
        offscreenRenderer.outputColorSpace = THREE.SRGBColorSpace;
        offscreenRenderer.setPixelRatio(1);
        offscreenRenderer.setSize(width, height, false);

        const exportCamera = camera.clone();
        exportCamera.aspect = width / height;
        exportCamera.updateProjectionMatrix();

        // Force shadows to refresh at the export resolution
        scene.traverse((obj) => {
          if (obj.isLight && obj.shadow && obj.castShadow) {
            obj.shadow.needsUpdate = true;
          }
        });

        offscreenRenderer.render(scene, exportCamera);

        const blob = await new Promise((resolve, reject) => {
          offscreenRenderer.domElement.toBlob((b) => {
            if (b) resolve(b);
            else reject(new Error('toBlob returned null'));
          }, 'image/png');
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'export.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);

        window.dispatchEvent(new CustomEvent('studio:export-complete'));
      } catch (err) {
        console.error('Export failed:', err);
        window.dispatchEvent(new CustomEvent('studio:export-error'));
      } finally {
        if (offscreenRenderer) offscreenRenderer.dispose();
      }
    };
    window.addEventListener('studio:request-export', onRequestExport);

    return () => {
      initialPaintDisposed = true;
      cancelAnimationFrame(initialPaintRaf1);
      cancelAnimationFrame(initialPaintRaf2);
      renderLoop.unregister(renderLoopId); unsub(); ro.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('studio:request-export', onRequestExport);
      window.removeEventListener('studio:request-render', onRequestRender);
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <Mount ref={mountRef} />;
}
