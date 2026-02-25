// src/scene/SceneSetup.jsx
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CAMERA, SCENE, LIGHT, PRODUCT, FLOOR } from './sceneConfig';

export default function SceneSetup() {
  const mountRef = useRef(null);

  useEffect(() => {

    // 1. CREATE SCENE
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(SCENE.backgroundColor);

    console.log(' Scene created');

    // 2. CREATE CAMERA
    const camera = new THREE.PerspectiveCamera(
      CAMERA.fov,
      window.innerWidth / window.innerHeight,
      CAMERA.near,
      CAMERA.far
    );
    
    // Position camera
    camera.position.set(
      CAMERA.position.x,
      CAMERA.position.y,
      CAMERA.position.z
    );
    
    // Point camera at center
    camera.lookAt(0, 0, 0);

    console.log(' Camera created at:', camera.position);

    // 3. CREATE RENDERER
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true  // Smooth edges
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Add renderer to page
    mountRef.current.appendChild(renderer.domElement);

    console.log(' Renderer created');

    // 4. ADD CAMERA CONTROLS (Mouse)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;  // Smooth movement
    controls.dampingFactor = 0.05;

    console.log(' Controls added');

    // 5. CREATE FLOOR
    const floorGeometry = new THREE.PlaneGeometry(
      FLOOR.width,
      FLOOR.height
    );
    
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: FLOOR.color,
      roughness: 0.8
    });
    
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    
    // Rotate floor to be horizontal
    floor.rotation.x = -Math.PI / 2;  // 90 degrees
    
    // Add to scene
    scene.add(floor);

    console.log(' Floor added');

    // 6. CREATE PRODUCT (Simple Cube)
    const productGeometry = new THREE.BoxGeometry(
      PRODUCT.size,
      PRODUCT.size,
      PRODUCT.size
    );
    
    const productMaterial = new THREE.MeshStandardMaterial({
      color: PRODUCT.color
    });
    
    const product = new THREE.Mesh(productGeometry, productMaterial);
    
    // Position product
    product.position.set(
      PRODUCT.position.x,
      PRODUCT.position.y,
      PRODUCT.position.z
    );
    
    scene.add(product);

    console.log(' Product (cube) added');

    // 7. CREATE LIGHT
    const light = new THREE.PointLight(
      LIGHT.color,
      LIGHT.intensity,
      100  // Distance light reaches
    );
    
    // Position light
    light.position.set(
      LIGHT.position.x,
      LIGHT.position.y,
      LIGHT.position.z
    );
    
    scene.add(light);

    console.log(' Light added at:', light.position);

    // Add ambient light (soft overall light)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    console.log(' Ambient light added');

    // 8. (ANIMATION) LOOP
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Update controls
      controls.update();
      
      // Render scene from camera's perspective
      renderer.render(scene, camera);
    };

    // Start animation
    animate();

    console.log(' Animation started');

    // 9. HANDLE WINDOW RESIZE
    const handleResize = () => {
      // Update camera aspect ratio
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      
      // Update renderer size
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // 10. CLEANUP
    return () => {
      window.removeEventListener('resize', handleResize);
      
      // Remove renderer
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose of resources
      renderer.dispose();
      
      console.log(' Cleanup done');
    };
  }, []);

  // Render empty div (Three.js will fill it)
  return (
    <div 
      ref={mountRef} 
      style={{ 
        width: '100vw', 
        height: '100vh' 
      }} 
    />
  );
}