import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { createSharedScene, destroySharedScene, sceneState, onSceneChange, updateElement, updateCamera } from './sharedScene';
import { CAMERA } from './sceneConfig';
import styled from 'styled-components';

const Mount = styled.div`
  width: 100%;
  height: 100%;
  background: #1a1a1a;
  cursor: pointer;
`;

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

// Proxy sphere for lights
const makeLightProxy = (position, id) => {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  mesh.position.copy(position);
  mesh.userData.id = id;
  mesh.userData.proxyFor = id;
  return mesh;
};

// Proxy box for product cubes
const makeProductProxy = (position, id) => {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshBasicMaterial({ color: 0xd4a5a5, wireframe: true })
  );
  mesh.position.copy(position);
  mesh.userData.id = id;
  mesh.userData.proxyFor = id;
  return mesh;
};

const makeCameraProxy = (position) => {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.3, 0.6),
    new THREE.MeshBasicMaterial({ color: 0xd4a574 })
  );
  mesh.position.copy(position);
  mesh.userData.id = 'camera';
  return mesh;
};

// Build a simple arrow gizmo
const makeMoveGizmo = () => {
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

// rotation ring gizmo 
const makeRotateGizmo = () => {
  const group = new THREE.Group();
  group.layers.set(1);

  const rings = [
    { axis: 'rx', color: 0xe05a4e, rot: new THREE.Euler(0, Math.PI / 2, 0) }, // X — red ring in YZ plane
    { axis: 'ry', color: 0x5aad5a, rot: new THREE.Euler(Math.PI / 2, 0, 0) }, // Y — green ring in XZ plane
    { axis: 'rz', color: 0x4a90d9, rot: new THREE.Euler(0, 0, 0) },            // Z — blue ring in XY plane
  ];

  for (const { axis, color, rot } of rings) {
    const mat = new THREE.MeshBasicMaterial({ color, depthTest: false, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.04, 8, 48), mat);
    ring.rotation.copy(rot);
    ring.userData.gizmoAxis = axis;
    ring.userData.gizmoType = 'rotate';
    ring.layers.set(1);
    group.add(ring);
  }

  return group;
};

export default function SetupView() {
  const mountRef = useRef(null);

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

    // Remeasure after DOM append so aspect ratio is correct
    const actualW = container.clientWidth, actualH = container.clientHeight;
    renderer.setSize(actualW, actualH);
    helperCamera.aspect = actualW / actualH;
    helperCamera.updateProjectionMatrix();

    const controls = new OrbitControls(helperCamera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 0, 0);
    controls.update();

    // Photographer camera helper
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

    // Camera proxy
    const cameraProxy = makeCameraProxy(photographerCamera.position);
    scene.add(cameraProxy);
    proxies['camera'] = cameraProxy;

    // Build proxies for all existing elements
    const buildProxies = () => {
      Object.entries(sceneState.elements).forEach(([id, state]) => {
        if (proxies[id]) return; // already exists
        const pos = new THREE.Vector3(state.x, state.y, state.z);
        const proxy = state.type === 'point-light'
          ? makeLightProxy(pos, id)
          : makeProductProxy(pos, id);
        proxy.layers.set(1);
        scene.add(proxy);
        proxies[id] = proxy;
      });
    };
    buildProxies();

    // Helpers
    const grid = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    scene.add(grid);
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // These objects are setup view only, hide from camera view
    [cameraProxy, grid, axesHelper].forEach(o => o.layers.set(1));

    const moveGizmo = makeMoveGizmo();
    moveGizmo.visible = false;
    scene.add(moveGizmo);

    const rotateGizmo = makeRotateGizmo();
    rotateGizmo.visible = false;
    scene.add(rotateGizmo);

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

    const highlightObject = (id) => {
      // Reset all proxy highlights
      Object.entries(proxies).forEach(([pid, proxy]) => {
        if (pid === 'camera') { proxy.material.color.set(0xd4a574); return; }
        const state = sceneState.elements[pid];
        if (!state) return;
        proxy.material.color.set(state.type === 'point-light' ? 0xffffff : 0xd4a5a5);
        if (proxy.material.emissive) proxy.material.emissive.set(0x000000);
      });
     
      if (id && proxies[id]) proxies[id].material.color.set(0x4a90d9);
      syncGizmos(id);
    };

    const setMode = (mode) => {
      gizmoMode = mode;
      syncGizmos(sceneState.selected);
      window.dispatchEvent(new CustomEvent('studio:gizmo-mode', { detail: mode }));
    };

    // external selection
    const onExternalSelect = (e) => {
      const id = e.detail;
      sceneState.selected = id;
      highlightObject(id);
    };
    window.addEventListener('studio:select', onExternalSelect);

    // Sync photographer camera rotation from scene state so the camera Helper updates
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

    // React to scene state changes
    const unsub = onSceneChange(() => {
      syncPhotographerCamera();
      cameraProxy.position.copy(photographerCamera.position);

      // Sync proxy positions and rotations, build new ones if elements were added
      buildProxies();
      Object.entries(proxies).forEach(([id, proxy]) => {
        if (id === 'camera') return;
        const mesh = elementMeshes[id];
        if (!mesh) return;
        proxy.position.copy(mesh.position);
        proxy.rotation.copy(mesh.rotation); 
      });

      if (sceneState.selected) syncGizmos(sceneState.selected);
    });

    // Raycaster for click selection
    const raycaster = new THREE.Raycaster();
    raycaster.layers.enable(1);
    const mouse = new THREE.Vector2();

    let dragAxis = null;
    let dragStartMouse = new THREE.Vector2();
    let dragStartPos = new THREE.Vector3();
    let dragStartRot = { rx: 0, ry: 0, rz: 0 };
    let isDraggingGizmo = false;

    // Project mouse delta onto axis screen direction 
    const getAxisScreenDir = (axis) => {
      const origin = moveGizmo.position.clone().project(helperCamera);
      const tip = moveGizmo.position.clone();
      if (axis === 'x') tip.x += 1;
      if (axis === 'y') tip.y += 1;
      if (axis === 'z') tip.z += 1;
      tip.project(helperCamera);
      return new THREE.Vector2(tip.x - origin.x, tip.y - origin.y).normalize();
    };

    // Get screen tangent direction for a rotation ring axis (for rotate)
    const getRotScreenDir = (axis) => {
      const origin = rotateGizmo.position.clone().project(helperCamera);
      const ref = rotateGizmo.position.clone();

      if (axis === 'rx') ref.y += 1;
      if (axis === 'ry') ref.x += 1;
      if (axis === 'rz') ref.x += 1;
      ref.project(helperCamera);
      return new THREE.Vector2(ref.x - origin.x, ref.y - origin.y).normalize();
    };

    let pointerDownPos = { x: 0, y: 0 };

    const onPointerDown = (e) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
      const rect = container.getBoundingClientRect();
      mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
      dragStartMouse.set(e.clientX, e.clientY);

      const activeGizmo = getActiveGizmo();

      // Check active gizmo first
      if (activeGizmo.visible) {
        raycaster.setFromCamera(mouse, helperCamera);
        const hits = raycaster.intersectObjects(activeGizmo.children);
        if (hits.length > 0) {
          dragAxis = hits[0].object.userData.gizmoAxis;
          isDraggingGizmo = true;
          controls.enabled = false;
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
        const screenDir = getAxisScreenDir(dragAxis);
        const mouseDelta = new THREE.Vector2(
          dx / container.clientWidth  * 2,
         -dy / container.clientHeight * 2
        );
        const movement = mouseDelta.dot(screenDir);

        const dist = helperCamera.position.distanceTo(moveGizmo.position);
        const newVal = dragStartPos[dragAxis] + movement * dist * 1.2;

        if (id === 'camera') updateCamera(dragAxis, newVal);
        else updateElement(id, dragAxis, newVal);

        // sidebar to sync
        window.dispatchEvent(new CustomEvent('studio:position-update', {
          detail: { id, axis: dragAxis, val: newVal }
        }));
      } else {
        // Rotation  
        const screenDir = getRotScreenDir(dragAxis);
        const mouseDelta = new THREE.Vector2(
          dx / container.clientWidth  * 2,
         -dy / container.clientHeight * 2
        );
        const movement = mouseDelta.dot(screenDir);

        // 180 degrees per full screen width
        const deltaDeg = movement * 180;
        const newVal = (dragStartRot[dragAxis] + deltaDeg) % 360;

        if (id === 'camera') updateCamera(dragAxis, newVal);
        else updateElement(id, dragAxis, newVal);

        // Notify sidebar to sync rotation
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
        return;
      }

      // Was a drag, not a click
      const dx = e.clientX - pointerDownPos.x;
      const dy = e.clientY - pointerDownPos.y;
      if (Math.sqrt(dx * dx + dy * dy) > 4) return;

      const rect = container.getBoundingClientRect();
      mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, helperCamera);

      // Collect all clickable proxies dynamically
      const clickables = Object.values(proxies);
      const hits = raycaster.intersectObjects(clickables);
      if (hits.length > 0) {
        sceneState.selected = hits[0].object.userData.id;
      } else {
        sceneState.selected = null;
      }
      highlightObject(sceneState.selected);
      window.dispatchEvent(new CustomEvent('studio:select', { detail: sceneState.selected }));
    };

    const onKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return; // don't steal from inputs
      if (e.key === 'w' || e.key === 'W') setMode('move');
      if (e.key === 'e' || e.key === 'E') setMode('rotate');
    };

    // Listen for mode change from sidebar buttons
    const onModeChange = (e) => setMode(e.detail);

    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('studio:set-gizmo-mode', onModeChange);

    // Animation loop
    let rafId;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      controls.update();
      cameraHelper.update();

      // Keep gizmos constant size regardless of zoom
      const activeGizmo = getActiveGizmo();
      if (activeGizmo.visible) {
        const dist = helperCamera.position.distanceTo(activeGizmo.position);
        const s = dist * 0.12;
        activeGizmo.scale.set(s, s, s);
      }

      renderer.render(scene, helperCamera);
    };
    animate();

    // Handle resize
    const onResize = () => {
      const w = container.clientWidth, h = container.clientHeight;
      helperCamera.aspect = w / h;
      helperCamera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // ResizeObserver catches panel size changes (maximize/restore/drag)
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    // Cleanup
    return () => {
      cancelAnimationFrame(rafId);
      unsub();
      ro.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('studio:set-gizmo-mode', onModeChange);
      window.removeEventListener('studio:select', onExternalSelect);
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerUp);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      destroySharedScene();
    };
  }, []);

  return <Mount ref={mountRef} />;
}