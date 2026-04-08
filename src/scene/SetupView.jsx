import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { createSharedScene, destroySharedScene, sceneState, onSceneChange, updateElement, updateCamera, removeElement } from './sharedScene';
import { CAMERA } from './sceneConfig';
import styled from 'styled-components';
import { DEG2RAD, RAD2DEG } from '../utils/math';
import { colors } from '../styles/theme';
import { makeLightProxy, makeSpotProxy, makeAreaProxy, makeHemisphereProxy, makeProductProxy, makeCycloramaProxy, makeCameraProxy } from './objects/proxies';
import { makeMoveGizmo } from './gizmos/move';
import { makeRotateGizmo } from './gizmos/rotate';

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const Mount = styled.div`
  width: 100%;
  height: 100%;
  background: ${colors.sceneBg};
  cursor: pointer;
`;

const Toolbar = styled.div`
  position: absolute;
  top: 40px;
  left: 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  z-index: 10;
  background: rgba(30, 26, 22, 0.85);
  border: 1px solid ${colors.border};
  border-radius: 4px;
  padding: 3px;
`;

const ToolBtn = styled.button`
  width: 28px;
  height: 28px;
  background: ${({ $active }) => $active ? 'rgba(212,165,116,0.2)' : 'transparent'};
  border: 1px solid ${({ $active }) => $active ? colors.accent : 'transparent'};
  border-radius: 3px;
  color: ${({ $active }) => $active ? colors.accent : colors.textMuted};
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  padding: 0;

  &:hover {
    background: rgba(212,165,116,0.15);
    color: ${colors.accent};
  }
`;

const MoveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <line x1="8" y1="1" x2="8" y2="15" />
    <line x1="1" y1="8" x2="15" y2="8" />
    <polyline points="5,3 8,1 11,3" />
    <polyline points="5,13 8,15 11,13" />
    <polyline points="3,5 1,8 3,11" />
    <polyline points="13,5 15,8 13,11" />
  </svg>
);

const RotateIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M13 8a5 5 0 1 1-1.5-3.5" />
    <polyline points="13,2 13,5.5 9.5,5.5" />
  </svg>
);

const AXIS_COLORS = {
  x:  0xe05a4e, y:  0x5aad5a, z:  0x4a90d9,
  rx: 0xe05a4e, ry: 0x5aad5a, rz: 0x4a90d9,
};
const HIGHLIGHT_COLOR = 0xffffff;

const createProxyForType = (type, pos, id) => {
  switch (type) {
    case 'point-light':       return makeLightProxy(pos, id);
    case 'spot-light':        return makeSpotProxy(pos, id);
    case 'area-light':        return makeAreaProxy(pos, id);
    case 'hemisphere-light':  return makeHemisphereProxy(pos, id);
    case 'product-cube':      return makeProductProxy(pos, id);
    case 'cyclorama':         return makeCycloramaProxy(pos, id);
    default:                  return makeProductProxy(pos, id);
  }
};

export default function SetupView() {
  const mountRef = useRef(null);
  const [activeMode, setActiveMode] = useState('move');

  useEffect(() => {
    const { scene, elementMeshes } = createSharedScene();

    const helperCamera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    helperCamera.position.set(4, 18, 12);
    helperCamera.lookAt(0, 0, 0);
    helperCamera.layers.enable(1);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = false;
    const container = mountRef.current;
    const w = container.clientWidth, h = container.clientHeight;
    renderer.setSize(w, h);
    helperCamera.aspect = w / h;
    helperCamera.updateProjectionMatrix();
    container.appendChild(renderer.domElement);

    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    const actualW = container.clientWidth, actualH = container.clientHeight;
    renderer.setSize(actualW, actualH);
    helperCamera.aspect = actualW / actualH;
    helperCamera.updateProjectionMatrix();

    const controls = new OrbitControls(helperCamera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 0, 0);
    controls.update();

    const photographerCamera = new THREE.PerspectiveCamera(
      CAMERA.fov, 16 / 9, CAMERA.near, CAMERA.far
    );
    photographerCamera.position.set(
      sceneState.camera.x, sceneState.camera.y, sceneState.camera.z
    );
    photographerCamera.lookAt(0, 1, 0);
    const cameraHelper = new THREE.CameraHelper(photographerCamera);
    scene.add(cameraHelper);
    scene.add(photographerCamera);

    const proxies = {};

    const cameraProxy = makeCameraProxy(photographerCamera.position);
    cameraProxy.traverse(child => { child.layers.set(1); });
    scene.add(cameraProxy);
    proxies['camera'] = cameraProxy;

    const buildProxies = () => {
      Object.entries(sceneState.elements).forEach(([id, state]) => {
        if (proxies[id]) return;
        const pos = new THREE.Vector3(state.x, state.y, state.z);
        const proxy = createProxyForType(state.type, pos, id);
        proxy.traverse(child => { child.layers.set(1); });
        scene.add(proxy);
        proxies[id] = proxy;
      });
    };
    buildProxies();

    const grid = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    scene.add(grid);
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    [cameraProxy, grid, axesHelper].forEach(o => o.layers.set(1));

    const moveGizmo = makeMoveGizmo();
    moveGizmo.visible = false;
    scene.add(moveGizmo);

    const rotateGizmo = makeRotateGizmo();
    rotateGizmo.visible = false;
    scene.add(rotateGizmo);

    [moveGizmo, rotateGizmo].forEach(gizmo => {
      gizmo.renderOrder = 999;
      gizmo.traverse(child => {
        if (child.isMesh && child.material) {
          child.material.depthTest = false;
          child.material.depthWrite = false;
          child.renderOrder = 999;
        }
      });
    });

    let gizmoMode = 'move';

    const getActiveGizmo = () => gizmoMode === 'move' ? moveGizmo : rotateGizmo;

    const getSelectedPosition = (id) => {
      if (id === 'camera') return photographerCamera.position;
      return elementMeshes[id]?.position ?? null;
    };

    const syncGizmos = (id) => {
      const pos = getSelectedPosition(id);
      moveGizmo.visible = false;
      rotateGizmo.visible = false;
      if (!pos || !id) return;
      const active = getActiveGizmo();
      active.position.copy(pos);
      active.visible = true;
    };

    const highlightGizmoAxis = (axis) => {
      const gizmo = getActiveGizmo();
      gizmo.children.forEach(child => {
        const a = child.userData.gizmoAxis;
        if (a === axis) {
          child.material.color.setHex(HIGHLIGHT_COLOR);
        } else {
          child.material.color.setHex(AXIS_COLORS[a] ?? 0x888888);
          child.material.opacity = 0.3;
          child.material.transparent = true;
        }
      });
    };

    const resetGizmoColors = () => {
      [moveGizmo, rotateGizmo].forEach(gizmo => {
        gizmo.children.forEach(child => {
          const a = child.userData.gizmoAxis;
          child.material.color.setHex(AXIS_COLORS[a] ?? 0x888888);
          child.material.opacity = 1;
          child.material.transparent = false;
        });
      });
    };

    const setProxyColor = (proxy, color) => {
      proxy.traverse(child => {
        if (!child.isMesh || !child.material || child.userData.skipHighlight) return;
        if (child.material.emissive) {
          child.material.emissive.setHex(color);
          child.material.emissiveIntensity = 0.3;
        } else if (child.material.color) {
          child.material.color.setHex(color);
        }
      });
    };

    const resetProxyColor = (proxy) => {
      proxy.traverse(child => {
        if (!child.isMesh || !child.material || child.userData.skipHighlight) return;
        if (child.material.emissive) {
          child.material.emissive.setHex(0x000000);
          child.material.emissiveIntensity = 0;
        }
      });
    };

    const highlightObject = (id) => {
      Object.entries(proxies).forEach(([pid, proxy]) => {
        resetProxyColor(proxy);
      });
      if (id && proxies[id]) setProxyColor(proxies[id], 0x4a90d9);
      syncGizmos(id);
    };

    const setMode = (mode) => {
      gizmoMode = mode;
      setActiveMode(mode);
      syncGizmos(sceneState.selected);
    };

    const onExternalSelect = (e) => {
      const id = e.detail;
      sceneState.selected = id;
      highlightObject(id);
    };
    window.addEventListener('studio:select', onExternalSelect);

    const onToolbarMode = (e) => setMode(e.detail);
    window.addEventListener('studio:set-gizmo-mode', onToolbarMode);

    const syncPhotographerCamera = () => {
      const { x, y, z, rx, ry, rz } = sceneState.camera;
      photographerCamera.position.set(x, y, z);
      if (rx || ry || rz) {
        photographerCamera.rotation.set(
          (rx ?? 0) * DEG2RAD,
          (ry ?? 0) * DEG2RAD,
          (rz ?? 0) * DEG2RAD
        );
      } else {
        photographerCamera.lookAt(0, 1, 0);
      }
    };

    const unsub = onSceneChange(() => {
      syncPhotographerCamera();
      cameraProxy.position.copy(photographerCamera.position);
      cameraProxy.rotation.copy(photographerCamera.rotation);

      buildProxies();
      Object.entries(proxies).forEach(([id, proxy]) => {
        if (id === 'camera') return;
        const state = sceneState.elements[id];
        const mesh = elementMeshes[id];
        if (!mesh || !state) return;
        proxy.position.copy(mesh.position);
        proxy.rotation.set(
          (state.rx ?? 0) * DEG2RAD,
          (state.ry ?? 0) * DEG2RAD,
          (state.rz ?? 0) * DEG2RAD
        );
        if (mesh.scale) proxy.scale.copy(mesh.scale);
      });

      if (sceneState.selected) syncGizmos(sceneState.selected);
    });

    const raycaster = new THREE.Raycaster();
    raycaster.layers.enable(1);
    const mouse = new THREE.Vector2();

    let dragAxis = null;
    let dragStartMouse = new THREE.Vector2();
    let dragStartPos = new THREE.Vector3();
    let dragStartRot = { rx: 0, ry: 0, rz: 0 };
    let isDraggingGizmo = false;

  

    let pointerDownPos = { x: 0, y: 0 };

    const onPointerDown = (e) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
      const rect = container.getBoundingClientRect();
      mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
      dragStartMouse.set(e.clientX, e.clientY);

      const activeGizmo = getActiveGizmo();

      if (activeGizmo.visible) {
        raycaster.setFromCamera(mouse, helperCamera);
        const hits = raycaster.intersectObjects(activeGizmo.children);
        if (hits.length > 0) {
          dragAxis = hits[0].object.userData.gizmoAxis;
          isDraggingGizmo = true;
          controls.enabled = false;
          highlightGizmoAxis(dragAxis);
          if (gizmoMode === 'move') {
            dragStartPos.copy(getSelectedPosition(sceneState.selected));
          } else {
            const id = sceneState.selected;
            const state = id === 'camera' ? sceneState.camera : sceneState.elements[id];
            dragStartRot = { rx: state?.rx ?? 0, ry: state?.ry ?? 0, rz: state?.rz ?? 0 };
          }
          return;
        }
      }
    };

    const onPointerMove = (e) => {
      if (!isDraggingGizmo || !dragAxis) return;

      const dx = e.clientX - dragStartMouse.x;
      const dy = e.clientY - dragStartMouse.y;
      const id = sceneState.selected;

      if (gizmoMode === 'move') {
       
        const axisDir = new THREE.Vector3();
        if (dragAxis === 'x') axisDir.set(1, 0, 0);
        if (dragAxis === 'y') axisDir.set(0, 1, 0);
        if (dragAxis === 'z') axisDir.set(0, 0, 1);

        const startScreen = dragStartPos.clone().project(helperCamera);
        const endScreen = dragStartPos.clone().add(axisDir).project(helperCamera);

        const axisScreenDelta = new THREE.Vector2(
          (endScreen.x - startScreen.x) * container.clientWidth / 2,
          (endScreen.y - startScreen.y) * container.clientHeight / 2
        );
        const pixelsPerUnit = axisScreenDelta.length();

        if (pixelsPerUnit < 0.001) return;

        const axisScreenDir = axisScreenDelta.normalize();
        const mousePx = new THREE.Vector2(dx, -dy);
        const projectedPixels = mousePx.dot(axisScreenDir);

        const units = projectedPixels / pixelsPerUnit;
        const newVal = dragStartPos[dragAxis] + units;

        if (id === 'camera') updateCamera(dragAxis, newVal);
        else updateElement(id, dragAxis, newVal);

        window.dispatchEvent(new CustomEvent('studio:position-update', {
          detail: { id, axis: dragAxis, val: newVal }
        }));
      } else {
       
        const gizmoPos = rotateGizmo.position.clone();

        const ref = gizmoPos.clone();
        if (dragAxis === 'rx') ref.y += 1;
        if (dragAxis === 'ry') ref.x += 1;
        if (dragAxis === 'rz') ref.x += 1;

        const originScreen = gizmoPos.project(helperCamera);
        const refScreen = ref.project(helperCamera);

        const screenDir = new THREE.Vector2(
          (refScreen.x - originScreen.x) * container.clientWidth / 2,
          (refScreen.y - originScreen.y) * container.clientHeight / 2
        );
        const pixelsDist = screenDir.length();

        if (pixelsDist < 0.001) return;

        const screenDirNorm = screenDir.normalize();
        const mousePx = new THREE.Vector2(dx, -dy);
        const projectedPixels = mousePx.dot(screenDirNorm);

        const deltaDeg = (projectedPixels / pixelsDist) * 180;
        const newVal = (dragStartRot[dragAxis] + deltaDeg) % 360;

        if (id === 'camera') updateCamera(dragAxis, newVal);
        else updateElement(id, dragAxis, newVal);

        window.dispatchEvent(new CustomEvent('studio:position-update', {
          detail: { id, axis: dragAxis, val: newVal }
        }));
      }
    };

    const onPointerUp = (e) => {
      if (isDraggingGizmo) {
        isDraggingGizmo = false;
        dragAxis = null;
        controls.enabled = true;
        resetGizmoColors();
        return;
      }

      const dx = e.clientX - pointerDownPos.x;
      const dy = e.clientY - pointerDownPos.y;
      if (Math.sqrt(dx * dx + dy * dy) > 4) return;

      const rect = container.getBoundingClientRect();
      mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, helperCamera);

      const clickables = [];
      Object.values(proxies).forEach(proxy => {
        proxy.traverse(child => {
          if (child.isMesh) clickables.push(child);
        });
      });

      const hits = raycaster.intersectObjects(clickables);
      if (hits.length > 0) {
        let obj = hits[0].object;
        while (obj && !obj.userData.id) obj = obj.parent;
        sceneState.selected = obj?.userData.id ?? null;
      } else {
        sceneState.selected = null;
      }
      highlightObject(sceneState.selected);
      window.dispatchEvent(new CustomEvent('studio:select', { detail: sceneState.selected }));
    };

    const onKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'w' || e.key === 'W') setMode('move');
      if (e.key === 'e' || e.key === 'E') setMode('rotate');
    };

   const onContextMenu = (e) => {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, helperCamera);

      const clickables = [];
      Object.values(proxies).forEach(proxy => {
        proxy.traverse(child => { if (child.isMesh) clickables.push(child); });
      });

      const hits = raycaster.intersectObjects(clickables);
      if (hits.length > 0) {
        let obj = hits[0].object;
        while (obj && !obj.userData.id) obj = obj.parent;
        const id = obj?.userData.id;
        if (id) {
          const type = id === 'camera' ? 'camera' : sceneState.elements[id]?.type;
          window.dispatchEvent(new CustomEvent('studio:context-menu', {
            detail: { id, type, x: e.clientX, y: e.clientY }
          }));
        }
      }
    };

    const onDeleteElement = (e) => {
      const id = e.detail;
      if (!id || id === 'camera') return;
      const proxy = proxies[id];
      if (proxy) {
        scene.remove(proxy);
        proxy.traverse(child => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
            else child.material.dispose();
          }
        });
        delete proxies[id];
      }
      removeElement(id);
      highlightObject(null);
      window.dispatchEvent(new CustomEvent('studio:select', { detail: null }));
    };

    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('studio:delete-element', onDeleteElement);
    window.addEventListener('keydown', onKeyDown);

    let rafId;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      controls.update();
      cameraHelper.update();

      const activeGizmo = getActiveGizmo();
      if (activeGizmo.visible) {
        const dist = helperCamera.position.distanceTo(activeGizmo.position);
        const s = dist * 0.12;
        activeGizmo.scale.set(s, s, s);
      }

      renderer.render(scene, helperCamera);
    };
    animate();

    const onResize = () => {
      const w = container.clientWidth, h = container.clientHeight;
      helperCamera.aspect = w / h;
      helperCamera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    return () => {
      cancelAnimationFrame(rafId);
      unsub();
      ro.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('studio:set-gizmo-mode', onToolbarMode);
      window.removeEventListener('studio:select', onExternalSelect);
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('studio:delete-element', onDeleteElement);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      destroySharedScene();
    };
  }, []);

  const handleToolClick = (mode) => {
    window.dispatchEvent(new CustomEvent('studio:set-gizmo-mode', { detail: mode }));
  };

  return (
    <Wrapper>
      <Toolbar>
        <ToolBtn
          $active={activeMode === 'move'}
          onClick={() => handleToolClick('move')}
          title="Move (W)"
        >
          <MoveIcon />
        </ToolBtn>
        <ToolBtn
          $active={activeMode === 'rotate'}
          onClick={() => handleToolClick('rotate')}
          title="Rotate (E)"
        >
          <RotateIcon />
        </ToolBtn>
      </Toolbar>
      <Mount ref={mountRef} />
    </Wrapper>
  );
}