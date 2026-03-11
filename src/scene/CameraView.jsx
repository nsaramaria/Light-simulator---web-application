// src/scene/CameraView.jsx
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { createSharedScene } from './sharedScene';
import { CAMERA, PRODUCT } from './sceneConfig';

export default function CameraView() {
  const mountRef = useRef(null);
  const [isLocked, setIsLocked] = useState(true);  // Start locked
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    // get shared scene
    const { scene } = createSharedScene();

    // create photo camera
    const camera = new THREE.PerspectiveCamera(
      CAMERA.fov,
      1,
      CAMERA.near,
      CAMERA.far
    );
    camera.position.set(
      CAMERA.position.x,
      CAMERA.position.y,
      CAMERA.position.z
    );
    camera.lookAt(0, PRODUCT.position.y, 0);
    
    cameraRef.current = camera;

    // create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
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
    controls.dampingFactor = 0.05;
    controls.enabled = !isLocked;
    
    controlsRef.current = controls;

    // animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
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

  // Update controls when lock state changes
  useEffect(() => {
    if (controlsRef.current && cameraRef.current) {
      if (isLocked) {
        // locked
        controlsRef.current.enabled = false;
        
        cameraRef.current.position.set(
          CAMERA.position.x,
          CAMERA.position.y,
          CAMERA.position.z
        );
        cameraRef.current.lookAt(0, PRODUCT.position.y, 0);
        controlsRef.current.target.set(0, PRODUCT.position.y, 0);
        controlsRef.current.update();
      } else {
        // free
        controlsRef.current.enabled = true;
      }
    }
  }, [isLocked]);

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: '100%',
        background: '#000',
        position: 'relative',
      }}
    >
      {/* Lock/Unlock Switch */}
      <div
        style={{
          position: 'absolute',
          top: '15px',
          left: '10px',
          zIndex: 20,
          background: 'rgba(45, 40, 34, 0.75)',
          borderRadius: '8px',
          padding: '10px 14px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
          border: '1px solid #3d3530',
        }}
      >
        {/* Label */}
        <div style={{ 
          color: '#d1d5db', 
          fontSize: '11px', 
          marginBottom: '8px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          Camera Control
        </div>
        
        {/* Switch Container */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Locked Label */}
          <span style={{ 
            fontSize: '13px', 
            color: isLocked ? '#d4a574' : '#9b8a7a',
            fontWeight: isLocked ? '600' : 'normal',
            transition: 'all 0.2s'
          }}>
            🔒
          </span>
          
          {/* Toggle Switch */}
          <div
            onClick={() => setIsLocked(!isLocked)}
            style={{
              width: '44px',
              height: '22px',
              background: isLocked ? '#d4a574' : '#9b8a7a',
              borderRadius: '11px',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background 0.3s',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            {/* Switch Circle */}
            <div
              style={{
                width: '18px',
                height: '18px',
                background: 'white',
                borderRadius: '50%',
                position: 'absolute',
                top: '2px',
                left: isLocked ? '2px' : '24px',
                transition: 'left 0.3s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}
            />
          </div>
          
          {/* Free Label */}
          <span style={{ 
            fontSize: '13px', 
            color: !isLocked ? '#d4a574' : '#9b8a7a',
            fontWeight: !isLocked ? '600' : 'normal',
            transition: 'all 0.2s'
          }}>
            🔓
          </span>
        </div>
        
        {/* Description */}
        <div style={{
          marginTop: '8px',
          fontSize: '10px',
          color: '#9ca3af',
          lineHeight: '1.3',
        }}>
          {isLocked 
            ? 'Fixed at photographer position' 
            : 'Drag to rotate • Scroll to zoom'}
        </div>
      </div>
    </div>
  );
}