import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { createSharedScene, sceneState, onSceneChange, updateElement, updateCamera, removeElement, duplicateElement, undo, redo, beginTransaction, commitTransaction, toggleLock, getSnapshotVersion } from './sharedScene';
import { CAMERA } from './sceneConfig';
import renderLoop from './renderLoop';
import styled from 'styled-components';
import { DEG2RAD, RAD2DEG } from '../utils/math';
import { colors } from '../styles/theme';
import { makeLightProxy, makeSpotProxy, makeAreaProxy, makeHemisphereProxy, makeProductProxy, makeCycloramaProxy, makeCameraProxy, makeImportedProxy } from './objects/proxies';
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
  gap: 1px;
  z-index: 10;
  background: ${colors.surfacePanel};
  backdrop-filter: blur(12px);
  border: 1px solid ${colors.border};
  border-radius: 8px;
  padding: 3px;
`;

const ToolBtn = styled.button`
  height: 30px;
  padding: 0 10px;
  background: ${({ $active }) => $active ? colors.accentSoft : 'transparent'};
  border: none;
  border-radius: 6px;
  color: ${({ $active }) => $active ? colors.accent : colors.textMuted};
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s;

  &:hover {
    background: ${colors.accentSubtle};
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
  xy: 0x4a90d9, xz: 0x5aad5a, yz: 0xe05a4e,
};
const HIGHLIGHT_COLOR = 0xffffff;

const createProxyForType = (type, pos, id, elementState) => {
  switch (type) {
    case 'point-light':       return makeLightProxy(pos, id);
    case 'spot-light':        return makeSpotProxy(pos, id);
    case 'area-light':        return makeAreaProxy(pos, id);
    case 'hemisphere-light':  return makeHemisphereProxy(pos, id);
    case 'product-cube':      return makeProductProxy(pos, id);
    case 'cyclorama':         return makeCycloramaProxy(pos, id);
    case 'imported-model':    return makeImportedProxy(pos, id, elementState?.boundingSize);
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
    renderer.setPixelRatio(1);
    const container = mountRef.current;
    let w = container.clientWidth, h = container.clientHeight;
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
    controls.dampingFactor = 0.2;
    controls.target.set(0, 0, 0);
    controls.update();

    let orbitActive = false;
    controls.addEventListener('start', () => {
      if (!orbitActive) { orbitActive = true; renderLoop.enterContinuous(); }
    });
    controls.addEventListener('end', () => {
      setTimeout(() => {
        if (orbitActive) { orbitActive = false; renderLoop.exitContinuous(); }
      }, 200);
    });

    const photographerCamera = new THREE.PerspectiveCamera(
      CAMERA.fov, 16 / 9, CAMERA.near, CAMERA.far
    );
    photographerCamera.position.set(
      sceneState.camera.x, sceneState.camera.y, sceneState.camera.z
    );
    photographerCamera.lookAt(0, 1, 0);
    photographerCamera.updateMatrixWorld(true);

    const cameraHelper = new THREE.CameraHelper(photographerCamera);
    scene.add(cameraHelper);
    scene.add(photographerCamera);

    const proxies = {};
    const lightHelpers = {};

    const makeLightHelper = (id) => {
      const obj = elementMeshes[id];
      if (!obj || !obj.isLight) return null;

      let helper = null;
      if (obj.isSpotLight) {
        helper = new THREE.SpotLightHelper(obj, 0xffaa00);
      } else if (obj.isDirectionalLight) {
        helper = new THREE.DirectionalLightHelper(obj, 1.5, 0xffaa00);
      } else if (obj.isPointLight) {
        helper = new THREE.PointLightHelper(obj, 0.4, 0xffaa00);
      } else if (obj.isHemisphereLight) {
        helper = new THREE.HemisphereLightHelper(obj, 1, 0xffaa00);
      }
     
      if (!helper) return null;
      helper.traverse(child => { child.layers.set(1); });
      scene.add(helper);
      return helper;
    };

    const addLightHelper = (id) => {
      if (lightHelpers[id]) return;
      const helper = makeLightHelper(id);
      if (helper) lightHelpers[id] = helper;
    };

    const removeLightHelper = (id) => {
      const helper = lightHelpers[id];
      if (!helper) return;
      scene.remove(helper);
      if (helper.dispose) helper.dispose();
      delete lightHelpers[id];
    };

    const updateLightHelpers = () => {
      for (const helper of Object.values(lightHelpers)) {
        if (helper.update) helper.update();
      }
    };

    const cameraProxy = makeCameraProxy(photographerCamera.position);
    cameraProxy.traverse(child => { child.layers.set(1); });
    scene.add(cameraProxy);
    proxies['camera'] = cameraProxy;

    const disposeProxy = (id) => {
      const proxy = proxies[id];
      if (!proxy) return;
      scene.remove(proxy);
      proxy.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
          else child.material.dispose();
        }
      });
      delete proxies[id];
      removeLightHelper(id);
    };

    const clearElementProxies = () => {
      for (const id of Object.keys(proxies)) {
        if (id === 'camera') continue;
        disposeProxy(id);
      }
    };

    const addProxy = (id, state) => {
      if (proxies[id]) disposeProxy(id);
      const pos = new THREE.Vector3(state.x, state.y, state.z);
      const proxy = createProxyForType(state.type, pos, id, state);
      proxy.traverse(child => { child.layers.set(1); });
      scene.add(proxy);
      proxies[id] = proxy;
      addLightHelper(id);
    };

    const updateProxyTransforms = () => {
      for (const [id, state] of Object.entries(sceneState.elements)) {
        const proxy = proxies[id];
        const mesh = elementMeshes[id];
        if (!proxy || !mesh) continue;
        proxy.position.copy(mesh.position);
        proxy.rotation.set(
          (state.rx ?? 0) * DEG2RAD,
          (state.ry ?? 0) * DEG2RAD,
          (state.rz ?? 0) * DEG2RAD
        );
        if (mesh.scale) proxy.scale.copy(mesh.scale);
      }
      updateLightHelpers();
    };

    const updateOneProxyTransform = (id) => {
      const proxy = proxies[id];
      const mesh = elementMeshes[id];
      const state = sceneState.elements[id];
      if (!proxy || !mesh || !state) return;
      proxy.position.copy(mesh.position);
      proxy.rotation.set(
        (state.rx ?? 0) * DEG2RAD,
        (state.ry ?? 0) * DEG2RAD,
        (state.rz ?? 0) * DEG2RAD
      );
      if (mesh.scale) proxy.scale.copy(mesh.scale);
      const helper = lightHelpers[id];
      if (helper && helper.update) helper.update();
    };

    const rebuildAllProxies = () => {
      clearElementProxies();
      for (const [id, state] of Object.entries(sceneState.elements)) {
        addProxy(id, state);
      }
      updateProxyTransforms();
    };

    let lastElementCount = 0;
    const incrementalSync = () => {
      const ids = Object.keys(sceneState.elements);
      const proxyIds = Object.keys(proxies).filter(id => id !== 'camera');

      const structuralChange =
        ids.length !== lastElementCount ||
        ids.length !== proxyIds.length ||
        ids.some(id => !proxies[id]) ||
        proxyIds.some(id => !sceneState.elements[id]);

      if (structuralChange) {
        for (const id of proxyIds) {
          if (!sceneState.elements[id]) disposeProxy(id);
        }
        for (const [id, state] of Object.entries(sceneState.elements)) {
          if (!proxies[id]) addProxy(id, state);
        }
        updateProxyTransforms();
        lastElementCount = ids.length;
        return;
      }

      // only the selected element can be moving during interaction
      if (sceneState.selected && sceneState.selected !== 'camera') {
        updateOneProxyTransform(sceneState.selected);
      }
    };

    rebuildAllProxies();
    lastElementCount = Object.keys(sceneState.elements).length;

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

    let gizmosHidden = false;

    const syncGizmos = (id) => {
      moveGizmo.visible = false;
      rotateGizmo.visible = false;
      if (gizmosHidden) return;
      const pos = getSelectedPosition(id);
      if (!pos || !id) return;
      const active = getActiveGizmo();
      active.position.copy(pos);
      active.visible = true;
    };

    const toggleGizmoVisibility = () => {
      gizmosHidden = !gizmosHidden;
      syncGizmos(sceneState.selected);
      renderLoop.markDirty();
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
        if (child.userData.isHighlightOverlay) return;

        if (child.material.emissive) {
          child.material.emissive.setHex(color);
          child.material.emissiveIntensity = 0.3;
        } else if (child.material.wireframe) {
  
          if (!child.userData.highlightOverlay) {
            const overlay = new THREE.Mesh(
              child.geometry,
              new THREE.MeshBasicMaterial({
                color,
                transparent: true,
                opacity: 0.25,
                depthWrite: false,
              })
            );
            overlay.userData.isHighlightOverlay = true;
            overlay.layers.mask = child.layers.mask;
            child.add(overlay);
            child.userData.highlightOverlay = overlay;
          } else {
            child.userData.highlightOverlay.material.color.setHex(color);
            child.userData.highlightOverlay.visible = true;
          }
        } else if (child.material.color) {
         
          if (child.userData.originalColor === undefined) {
            child.userData.originalColor = child.material.color.getHex();
          }
          child.material.color.setHex(color);
        }
      });
    };

    const resetProxyColor = (proxy) => {
      proxy.traverse(child => {
        if (!child.isMesh || !child.material || child.userData.skipHighlight) return;
        if (child.userData.isHighlightOverlay) return;

        if (child.material.emissive) {
          child.material.emissive.setHex(0x000000);
          child.material.emissiveIntensity = 0;
        }
        if (child.userData.highlightOverlay) {
          child.userData.highlightOverlay.visible = false;
        }
        if (child.userData.originalColor !== undefined && child.material.color) {
          child.material.color.setHex(child.userData.originalColor);
        }
      });
    };

    let hoveredId = null;

    const highlightObject = (id) => {
      for (const [pid, proxy] of Object.entries(proxies)) {
        resetProxyColor(proxy);
      }
      if (id && proxies[id]) setProxyColor(proxies[id], 0x4a90d9);
   
      if (hoveredId && hoveredId !== id && proxies[hoveredId]) {
        setProxyColor(proxies[hoveredId], 0x6699cc);
      }
      syncGizmos(id);
    };

    const setHoverHighlight = (id) => {
      if (id === hoveredId) return;
      // Restore previous hover 
      if (hoveredId && hoveredId !== sceneState.selected && proxies[hoveredId]) {
        resetProxyColor(proxies[hoveredId]);
      }
      hoveredId = id;
      // Apply new hover 
      if (hoveredId && hoveredId !== sceneState.selected && proxies[hoveredId]) {
        setProxyColor(proxies[hoveredId], 0x6699cc);
      }
      container.style.cursor = hoveredId ? 'pointer' : '';
      renderLoop.markDirty();
    };

    const setMode = (mode) => {
      gizmoMode = mode;
      setActiveMode(mode);
      syncGizmos(sceneState.selected);
      renderLoop.markDirty();
    };

    const onExternalSelect = (e) => {
      sceneState.selected = e.detail;
      highlightObject(e.detail);
      renderLoop.markDirty();
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
      photographerCamera.updateProjectionMatrix();
      photographerCamera.updateMatrixWorld(true);

      cameraProxy.position.copy(photographerCamera.position);
      cameraProxy.rotation.copy(photographerCamera.rotation);
    };

    let cameraHelperDirty = true;
    let lastSnapshotVersion = getSnapshotVersion();

    const unsub = onSceneChange(() => {
      syncPhotographerCamera();
      cameraHelperDirty = true;

      const ver = getSnapshotVersion();
      if (ver !== lastSnapshotVersion) {
        lastSnapshotVersion = ver;
        rebuildAllProxies();
      } else {
        incrementalSync();
      }

      if (sceneState.selected) {
        syncGizmos(sceneState.selected);
      } else {
        moveGizmo.visible = false;
        rotateGizmo.visible = false;
      }
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
    let isPlaneDrag = false;
    const dragPlane = new THREE.Plane();
    const dragPlaneStartHit = new THREE.Vector3();
    const dragPlaneCurrentHit = new THREE.Vector3();
    const dragPlaneDelta = new THREE.Vector3();
    const planeNormalByAxis = {
      xy: new THREE.Vector3(0, 0, 1),
      xz: new THREE.Vector3(0, 1, 0),
      yz: new THREE.Vector3(1, 0, 0),
    };
    const planeAxisPair = {
      xy: ['x', 'y'],
      xz: ['x', 'z'],
      yz: ['y', 'z'],
    };

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
          const selId = sceneState.selected;
          const selState = selId && selId !== 'camera' ? sceneState.elements[selId] : null;
          if (selState?.locked) return;

          dragAxis = hits[0].object.userData.gizmoAxis;
          isPlaneDrag = !!hits[0].object.userData.isPlaneHandle;
          isDraggingGizmo = true;
          controls.enabled = false;
          highlightGizmoAxis(dragAxis);
          renderLoop.enterContinuous();
          beginTransaction();
          if (gizmoMode === 'move') {
            dragStartPos.copy(getSelectedPosition(sceneState.selected));
            if (isPlaneDrag) {
              const normal = planeNormalByAxis[dragAxis];
              dragPlane.setFromNormalAndCoplanarPoint(normal, dragStartPos);
              raycaster.ray.intersectPlane(dragPlane, dragPlaneStartHit);
            }
          } else {
            const id = sceneState.selected;
            const state = id === 'camera' ? sceneState.camera : sceneState.elements[id];
            dragStartRot = { rx: state?.rx ?? 0, ry: state?.ry ?? 0, rz: state?.rz ?? 0 };
          }
          return;
        }
      }
    };

    const moveAxisDir = new THREE.Vector3();
    const moveStartScreen = new THREE.Vector3();
    const moveEndScreen = new THREE.Vector3();
    const moveScreenDelta = new THREE.Vector2();
    const mousePx = new THREE.Vector2();
    const rotateGizmoPos = new THREE.Vector3();
    const rotateRefPoint = new THREE.Vector3();
    const rotateScreenDir = new THREE.Vector2();

    const onPointerMove = (e) => {
      if (!isDraggingGizmo || !dragAxis) {
       
        const rect = container.getBoundingClientRect();
        mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
        mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, helperCamera);

        const clickables = [];
        Object.entries(proxies).forEach(([pid, proxy]) => {
          proxy.traverse(child => { if (child.isMesh) clickables.push(child); });
        });
        const hits = raycaster.intersectObjects(clickables);
        let newHoverId = null;
        if (hits.length > 0) {
          let obj = hits[0].object;
          while (obj && !obj.userData.id) obj = obj.parent;
          newHoverId = obj?.userData.id ?? null;
        }
        setHoverHighlight(newHoverId);
        return;
      }
      const dx = e.clientX - dragStartMouse.x;
      const dy = e.clientY - dragStartMouse.y;
      const id = sceneState.selected;

      if (gizmoMode === 'move') {
        if (isPlaneDrag) {
          const rect = container.getBoundingClientRect();
          mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
          mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
          raycaster.setFromCamera(mouse, helperCamera);
          if (!raycaster.ray.intersectPlane(dragPlane, dragPlaneCurrentHit)) return;

          dragPlaneDelta.subVectors(dragPlaneCurrentHit, dragPlaneStartHit);
          const [a, b] = planeAxisPair[dragAxis];
          const newA = dragStartPos[a] + dragPlaneDelta[a];
          const newB = dragStartPos[b] + dragPlaneDelta[b];

          if (id === 'camera') {
            updateCamera(a, newA);
            updateCamera(b, newB);
          } else {
            updateElement(id, a, newA);
            updateElement(id, b, newB);
          }

          if (id && id !== 'camera') updateOneProxyTransform(id);
          const activeGizmo = getActiveGizmo();
          if (activeGizmo.visible) {
            const pos = getSelectedPosition(id);
            if (pos) activeGizmo.position.copy(pos);
          }

          window.dispatchEvent(new CustomEvent('studio:position-update', {
            detail: { id, axis: a, val: newA }
          }));
          window.dispatchEvent(new CustomEvent('studio:position-update', {
            detail: { id, axis: b, val: newB }
          }));
          return;
        }

        if (dragAxis === 'x') moveAxisDir.set(1, 0, 0);
        else if (dragAxis === 'y') moveAxisDir.set(0, 1, 0);
        else moveAxisDir.set(0, 0, 1);

        moveStartScreen.copy(dragStartPos).project(helperCamera);
        moveEndScreen.copy(dragStartPos).add(moveAxisDir).project(helperCamera);
        moveScreenDelta.set(
          (moveEndScreen.x - moveStartScreen.x) * container.clientWidth / 2,
          (moveEndScreen.y - moveStartScreen.y) * container.clientHeight / 2
        );
        const pixelsPerUnit = moveScreenDelta.length();
        if (pixelsPerUnit < 0.001) return;

        moveScreenDelta.normalize();
        mousePx.set(dx, -dy);
        const projectedPixels = mousePx.dot(moveScreenDelta);
        const units = projectedPixels / pixelsPerUnit;
        const newVal = dragStartPos[dragAxis] + units;

        if (id === 'camera') updateCamera(dragAxis, newVal);
        else updateElement(id, dragAxis, newVal);

        if (id && id !== 'camera') updateOneProxyTransform(id);
        const activeGizmo = getActiveGizmo();
        if (activeGizmo.visible) {
          const pos = getSelectedPosition(id);
          if (pos) activeGizmo.position.copy(pos);
        }

        window.dispatchEvent(new CustomEvent('studio:position-update', {
          detail: { id, axis: dragAxis, val: newVal }
        }));
      } else {
        rotateGizmoPos.copy(rotateGizmo.position);
        rotateRefPoint.copy(rotateGizmoPos);
        if (dragAxis === 'rx') rotateRefPoint.y += 1;
        if (dragAxis === 'ry') rotateRefPoint.x += 1;
        if (dragAxis === 'rz') rotateRefPoint.x += 1;

        rotateGizmoPos.project(helperCamera);
        rotateRefPoint.project(helperCamera);
        rotateScreenDir.set(
          (rotateRefPoint.x - rotateGizmoPos.x) * container.clientWidth / 2,
          (rotateRefPoint.y - rotateGizmoPos.y) * container.clientHeight / 2
        );
        const pixelsDist = rotateScreenDir.length();
        if (pixelsDist < 0.001) return;

        rotateScreenDir.normalize();
        mousePx.set(dx, -dy);
        const projectedPixels = mousePx.dot(rotateScreenDir);
        const deltaDeg = (projectedPixels / pixelsDist) * 180;
        const newVal = (dragStartRot[dragAxis] + deltaDeg) % 360;

        if (id === 'camera') updateCamera(dragAxis, newVal);
        else updateElement(id, dragAxis, newVal);

        if (id && id !== 'camera') updateOneProxyTransform(id);
        const activeGizmo = getActiveGizmo();
        if (activeGizmo.visible) {
          const pos = getSelectedPosition(id);
          if (pos) activeGizmo.position.copy(pos);
        }

        window.dispatchEvent(new CustomEvent('studio:position-update', {
          detail: { id, axis: dragAxis, val: newVal }
        }));
      }
    };

    const onPointerUp = (e) => {
      if (isDraggingGizmo) {
        isDraggingGizmo = false;
        isPlaneDrag = false;
        dragAxis = null;
        controls.enabled = true;
        resetGizmoColors();
        renderLoop.exitContinuous();
        renderLoop.markDirty();
        commitTransaction();
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
        proxy.traverse(child => { if (child.isMesh) clickables.push(child); });
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
      const inputFocused = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
      if (inputFocused) return;

      if (e.key === 'w' || e.key === 'W') { setMode('move'); return; }
      if (e.key === 'e' || e.key === 'E') { setMode('rotate'); return; }
      if (e.key === 'x' || e.key === 'X') { toggleGizmoVisibility(); return; }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        const id = sceneState.selected;
        if (id && id !== 'camera') {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('studio:delete-element', { detail: id }));
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
        const id = sceneState.selected;
        if (id && id !== 'camera') {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('studio:duplicate-element', { detail: id }));
        }
        return;
      }

      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('studio:undo'));
        return;
      }
      if ((e.key === 'y' && (e.ctrlKey || e.metaKey)) ||
          (e.key === 'Z' && (e.ctrlKey || e.metaKey) && e.shiftKey)) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('studio:redo'));
        return;
      }
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
      const state = sceneState.elements[id];
      if (state?.locked) return;
      disposeProxy(id);
      removeElement(id);
      highlightObject(null);
      window.dispatchEvent(new CustomEvent('studio:select', { detail: null }));
      window.dispatchEvent(new CustomEvent('studio:element-deleted', { detail: id }));
    };

    const onDuplicateElement = (e) => {
      const id = e.detail;
      if (!id || id === 'camera') return;
      const newId = duplicateElement(id);
      if (!newId) return;
     
      window.dispatchEvent(new CustomEvent('studio:select', { detail: newId }));
    };

    const onUndo = () => { undo(); };
    const onRedo = () => { redo(); };
    const onToggleLock = (e) => {
      const id = e.detail;
      if (!id || id === 'camera') return;
      toggleLock(id);
    };

    const onPointerLeave = () => { setHoverHighlight(null); };

    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointerleave', onPointerLeave);
    container.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('studio:delete-element', onDeleteElement);
    window.addEventListener('studio:duplicate-element', onDuplicateElement);
    window.addEventListener('studio:toggle-lock', onToggleLock);
    window.addEventListener('studio:undo', onUndo);
    window.addEventListener('studio:redo', onRedo);
    window.addEventListener('keydown', onKeyDown);

    const renderLoopId = renderLoop.register(() => {
      controls.update();

      if (cameraHelperDirty) {
        photographerCamera.updateMatrixWorld(true);
        cameraHelper.update();
        cameraHelperDirty = false;
      }

      const activeGizmo = getActiveGizmo();
      if (activeGizmo.visible) {
        const dist = helperCamera.position.distanceTo(activeGizmo.position);
        const s = dist * 0.12;
        activeGizmo.scale.set(s, s, s);
      }

      renderer.render(scene, helperCamera);
    }, 0);

    const onResize = () => {
      const w = container.clientWidth, h = container.clientHeight;
      if (w === 0 || h === 0) return;
      helperCamera.aspect = w / h;
      helperCamera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderLoop.markDirty();
    };
    window.addEventListener('resize', onResize);

    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    return () => {
      renderLoop.unregister(renderLoopId);
      unsub();
      ro.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('studio:set-gizmo-mode', onToolbarMode);
      window.removeEventListener('studio:select', onExternalSelect);
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('pointerleave', onPointerLeave);
      container.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('studio:delete-element', onDeleteElement);
      window.removeEventListener('studio:duplicate-element', onDuplicateElement);
      window.removeEventListener('studio:toggle-lock', onToggleLock);
      window.removeEventListener('studio:undo', onUndo);
      window.removeEventListener('studio:redo', onRedo);

      for (const id of Object.keys(proxies)) {
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
        }
        delete proxies[id];
      }

      [cameraHelper, photographerCamera, grid, axesHelper, moveGizmo, rotateGizmo].forEach(obj => {
        scene.remove(obj);
        if (obj.dispose) obj.dispose();
        obj.traverse?.(child => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
            else child.material.dispose();
          }
        });
      });

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const handleToolClick = (mode) => {
    window.dispatchEvent(new CustomEvent('studio:set-gizmo-mode', { detail: mode }));
  };

  return (
    <Wrapper>
      <Toolbar>
        <ToolBtn $active={activeMode === 'move'} onClick={() => handleToolClick('move')} title="Move (W)">
          <MoveIcon />
        </ToolBtn>
        <ToolBtn $active={activeMode === 'rotate'} onClick={() => handleToolClick('rotate')} title="Rotate (E)">
          <RotateIcon />
        </ToolBtn>
      </Toolbar>
      <Mount ref={mountRef} />
    </Wrapper>
  );
}