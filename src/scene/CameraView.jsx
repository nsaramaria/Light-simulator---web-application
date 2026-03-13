// src/scene/CameraView.jsx
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { createSharedScene } from './sharedScene';
import { CAMERA, PRODUCT } from './sceneConfig';
import styled from 'styled-components';

const Mount = styled.div`
  width: 100%;
  height: 100%;
  background: #000;
  position: relative;
`;

const ControlPanel = styled.div`
  position: absolute;
  top: 15px;
  left: 10px;
  z-index: 20;
  background: rgba(45, 40, 34, 0.75);
  border-radius: 8px;
  padding: 10px 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  border: 1px solid #3d3530;
`;

const PanelLabel = styled.div`
  color: #d1d5db;
  font-size: 11px;
  margin-bottom: 8px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SwitchRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LockIcon = styled.span`
  font-size: 13px;
  color: ${({ $active }) => ($active ? '#d4a574' : '#9b8a7a')};
  font-weight: ${({ $active }) => ($active ? '600' : 'normal')};
  transition: all 0.2s;
`;

const ToggleTrack = styled.div`
  width: 44px;
  height: 22px;
  background: ${({ $locked }) => ($locked ? '#d4a574' : '#9b8a7a')};
  border-radius: 11px;
  cursor: pointer;
  position: relative;
  transition: background 0.3s;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const ToggleThumb = styled.div`
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: ${({ $locked }) => ($locked ? '2px' : '24px')};
  transition: left 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const Description = styled.div`
  margin-top: 8px;
  font-size: 10px;
  color: #9ca3af;
  line-height: 1.3;
`;

export default function CameraView() {
  const mountRef = useRef(null);
  const [isLocked, setIsLocked] = useState(true);
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
        controlsRef.current.enabled = true;
      }
    }
  }, [isLocked]);

  return (
    <Mount ref={mountRef}>
      <ControlPanel>
        <PanelLabel>Camera Control</PanelLabel>
        <SwitchRow>
          <LockIcon $active={isLocked}>🔒</LockIcon>
          <ToggleTrack $locked={isLocked} onClick={() => setIsLocked(!isLocked)}>
            <ToggleThumb $locked={isLocked} />
          </ToggleTrack>
          <LockIcon $active={!isLocked}>🔓</LockIcon>
        </SwitchRow>
        <Description>
          {isLocked
            ? 'Fixed at photographer position'
            : 'Drag to rotate • Scroll to zoom'}
        </Description>
      </ControlPanel>
    </Mount>
  );
}