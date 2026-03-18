import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { createSharedScene, destroySharedScene, sceneState, onSceneChange } from './sharedScene';
import { CAMERA } from './sceneConfig';
import styled from 'styled-components';

const Mount = styled.div`
  width: 100%;
  height: 100%;
  background: #1a1a1a;
  cursor: pointer;
`;

const makeLightProxy = (position) => {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  mesh.position.copy(position);
  mesh.userData.id = 'light';
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

export default function SetupView() {
  const mountRef = useRef(null);

  useEffect(() => {
    const { scene, product, light } = createSharedScene();
    console.log('SetupView mount — product position:', product.position);
    console.log('SetupView mount — product in scene:', scene.children.includes(product));
    console.log('SetupView mount — scene children count:', scene.children.length);

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

    // Remeasure after DOM append so aspect ratio is correct
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

    const lightProxy = makeLightProxy(light.position);
    const cameraProxy = makeCameraProxy(photographerCamera.position);
    scene.add(lightProxy);
    scene.add(cameraProxy);

    const lightHelper = new THREE.PointLightHelper(light, 0.5);
    scene.add(lightHelper);
    const grid = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    scene.add(grid);
    const axes = new THREE.AxesHelper(5);
    scene.add(axes);

    // These objects are setup view only ,hide from camera view
    const setupOnlyObjects = [lightProxy, cameraProxy, lightHelper, cameraHelper, grid, axes];
    setupOnlyObjects.forEach(o => { o.layers.set(1); });

    const highlightObject = (id) => {
      product.material.emissive.set(0x000000);
      lightProxy.material.color.set(0xffffff);
      cameraProxy.material.color.set(0xd4a574);
      if (id === 'product') product.material.emissive.set(0x4a90d9);
      if (id === 'light')   lightProxy.material.color.set(0x4a90d9);
      if (id === 'camera')  cameraProxy.material.color.set(0x4a90d9);
    };

    const raycaster = new THREE.Raycaster();
    raycaster.layers.enable(1); 
    const mouse = new THREE.Vector2();
    const clickables = [product, lightProxy, cameraProxy];

    const onPointerDown = () => { onPointerDown._moved = false; };
    const onPointerMove = () => { onPointerDown._moved = true; };
    const onClick = (e) => {
      if (onPointerDown._moved) return;
      const rect = container.getBoundingClientRect();
      mouse.x =  ((e.clientX - rect.left)  / rect.width)  * 2 - 1;
      mouse.y = -((e.clientY - rect.top)   / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, helperCamera);
      const hits = raycaster.intersectObjects(clickables);
      if (hits.length > 0) {
        const id = hits[0].object.userData.id;
        sceneState.selected = sceneState.selected === id ? null : id;
      } else {
        sceneState.selected = null;
      }
      highlightObject(sceneState.selected);
      window.dispatchEvent(new CustomEvent('studio:select', { detail: sceneState.selected }));
    };

    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('click', onClick);

    const unsub = onSceneChange(() => {
      photographerCamera.position.set(
        sceneState.camera.x, sceneState.camera.y, sceneState.camera.z
      );
      photographerCamera.lookAt(0, 1, 0);
      cameraProxy.position.copy(photographerCamera.position);
      lightProxy.position.copy(light.position);
    });

    let rafId;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      controls.update();
      cameraHelper.update();
      lightHelper.update();
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

    return () => {
      cancelAnimationFrame(rafId);
      unsub();
      window.removeEventListener('resize', onResize);
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('click', onClick);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      destroySharedScene();
    };
  }, []);

  return <Mount ref={mountRef} />;
}