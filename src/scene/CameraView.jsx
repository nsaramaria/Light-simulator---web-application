// src/scene/CameraView.jsx
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { createSharedScene } from './sharedScene';
import { CAMERA, PRODUCT } from './sceneConfig';

export default function CameraView() {
  const mountRef = useRef(null);

  useEffect(() => {
    const { scene } = createSharedScene();

    // create camera
    const camera = new THREE.PerspectiveCamera(CAMERA.fov, 1, CAMERA.near, CAMERA.far);
    camera.position.set(CAMERA.position.x, CAMERA.position.y, CAMERA.position.z);
    camera.lookAt(0, PRODUCT.position.y, 0);

    // create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    container.appendChild(renderer.domElement);

    // add controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // animation
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // resize
    const handleResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100%', background: '#000' }} />;
}