import React, { useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import CameraView from './scene/CameraView';
import SetupView from './scene/SetupView';
import SelectionPanel from './components/SelectionPanel';
import Header from './components/Header';
import HelpModal from './components/Help';
import ContextMenu from './components/ContextMenu';
import Auth from './components/Auth';
import StatusBar from './components/StatusBar';
import { addPointLight, addSpotLight, addDirectionalLight, addAreaLight, addHemisphereLight, addProductCube, addCyclorama } from './scene/sharedScene';
import { colors } from './styles/theme';

const AppWrapper = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const ViewsContainer = styled.div`
  flex: 1;
  display: flex;
  min-height: 0;
  overflow: hidden;
  user-select: ${({ $dragging }) => $dragging ? 'none' : 'auto'};
`;

const ViewPanel = styled.div`
  position: relative;
  width: ${({ $width }) => $width}%;
  min-width: 0;
  height: 100%;
  overflow: hidden;
  display: ${({ $width }) => $width === 0 ? 'none' : 'block'};
`;

const Divider = styled.div`
  width: 3px;
  height: 100%;
  background: rgba(255,255,255,0.03);
  cursor: col-resize;
  flex-shrink: 0;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  &:hover, &:active {
    background: ${colors.accent};
  }

  &::after {
    content: '';
    position: absolute;
    width: 11px;
    height: 100%;
    left: -4px;
    cursor: col-resize;
  }
`;

const ViewLabel = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(12,11,9,0.7);
  backdrop-filter: blur(8px);
  color: rgba(255,255,255,0.35);
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: 1px solid rgba(255,255,255,0.04);
  z-index: 10;
  font-family: 'JetBrains Mono', monospace;
`;

const MaximizeBtn = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  background: rgba(12,11,9,0.7);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.04);
  color: rgba(255,255,255,0.25);
  width: 26px;
  height: 26px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    border-color: rgba(232,168,85,0.3);
    color: ${colors.accent};
    background: rgba(12,11,9,0.85);
  }
`;

const ADD_HANDLERS = {
  'point-light':       addPointLight,
  'spot-light':        addSpotLight,
  'directional-light': addDirectionalLight,
  'area-light':        addAreaLight,
  'hemisphere-light':  addHemisphereLight,
  'product-cube':      addProductCube,
  'cyclorama':         addCyclorama,
};

export default function App() {
  // Check if user is already logged in
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [showHelp, setShowHelp] = useState(false);
  const [splitPct, setSplitPct] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [maximized, setMaximized] = useState(null);
  const containerRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const onDividerMouseDown = useCallback((e) => {
    e.preventDefault();
    setDragging(true);

    const onMouseMove = (e) => {
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPct(Math.min(Math.max(pct, 15), 85));
      window.dispatchEvent(new Event('resize'));
    };

    const onMouseUp = () => {
      setDragging(false);
      window.dispatchEvent(new Event('resize'));
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, []);

  const toggleMaximize = (panel) => {
    setMaximized(prev => prev === panel ? null : panel);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event('resize'));
      });
    });
  };

  const handleAdd = (itemId) => {
    const factory = ADD_HANDLERS[itemId];
    if (!factory) return;
    const newId = factory();
    if (newId) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('studio:select', { detail: newId }));
      }, 0);
    }
  };

  // Show login screen if not logged in
  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  const cameraWidth = maximized === 'camera' ? 100 : maximized === 'setup' ? 0 : splitPct;
  const setupWidth  = maximized === 'setup'  ? 100 : maximized === 'camera' ? 0 : 100 - splitPct;
  const showDivider = maximized === null;

  return (
    <AppWrapper>
      <Header onAdd={handleAdd} onShowHelp={() => setShowHelp(true)} user={user} onLogout={handleLogout} />

      <ViewsContainer ref={containerRef} $dragging={dragging}>
        <ViewPanel $width={cameraWidth}>
          <ViewLabel>CAM</ViewLabel>
          <MaximizeBtn onClick={() => toggleMaximize('camera')}>
            {maximized === 'camera' ? '⤡' : '⤢'}
          </MaximizeBtn>
          <CameraView />
        </ViewPanel>

        {showDivider && <Divider onMouseDown={onDividerMouseDown} />}

        <ViewPanel $width={setupWidth}>
          <ViewLabel>3D</ViewLabel>
          <MaximizeBtn onClick={() => toggleMaximize('setup')}>
            {maximized === 'setup' ? '⤡' : '⤢'}
          </MaximizeBtn>
          <SetupView />
        </ViewPanel>

        <SelectionPanel />
      </ViewsContainer>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      <ContextMenu />
      <StatusBar />
    </AppWrapper>
  );
}
