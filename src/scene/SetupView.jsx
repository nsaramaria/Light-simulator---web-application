// src/scene/SetupView.jsx
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { createSharedScene } from './sharedScene';
import { CAMERA, LIGHT } from './sceneConfig';

export default function SetupView() {
  const mountRef = useRef(null);

  useEffect(() => {
    // Get shared scene
    const { scene, product, light } = createSharedScene();

    // create helper camera (overhead view)
    const helperCamera = new THREE.PerspectiveCamera(
      50,
      1,
      0.1,
      1000
    );
    // Position camera above and to the side to see everything
    helperCamera.position.set(10, 15, 10);
    helperCamera.lookAt(0, 0, 0);

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    renderer.setSize(width, height);
    helperCamera.aspect = width / height;
    helperCamera.updateProjectionMatrix();
    
    container.appendChild(renderer.domElement);

    // Add controls for helper camera
    const controls = new OrbitControls(helperCamera, renderer.domElement);
    controls.enableDamping = true;

    // ADD VISUAL HELPERS
    
    // 1. Add camera helper (shows photographer's camera)
    const photographerCamera = new THREE.PerspectiveCamera(
      CAMERA.fov,
      16/9,
      CAMERA.near,
      CAMERA.far
    );
    photographerCamera.position.set(
      CAMERA.position.x,
      CAMERA.position.y,
      CAMERA.position.z
    );
    photographerCamera.lookAt(0, 1, 0);
    
    const cameraHelper = new THREE.CameraHelper(photographerCamera);
    scene.add(cameraHelper);
    scene.add(photographerCamera);

    // 2. Add light
    const lightHelper = new THREE.PointLightHelper(light, 0.5);
    scene.add(lightHelper);

    // 3. Add grid 
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    scene.add(gridHelper);

    // 4. Add axes
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      cameraHelper.update();
      lightHelper.update();
      renderer.render(scene, helperCamera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      helperCamera.aspect = width / height;
      helperCamera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: '100%',
        background: '#1a1a1a',
      }}
    />
  );
}