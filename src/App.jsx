import React, { useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import CameraView from './scene/CameraView';
import SetupView from './scene/SetupView';
import SelectionPanel from './components/SelectionPanel';
import Header from './components/Header';
import HelpModal from './components/Help';
import ContextMenu from './components/ContextMenu';
import { addPointLight, addSpotLight, addDirectionalLight, addAreaLight, addHemisphereLight, addProductCube } from './scene/sharedScene';
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
  width: 5px;
  height: 100%;
  background: ${colors.border};
  cursor: col-resize;
  flex-shrink: 0;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover, &:active {
    background: ${colors.accent};
  }

  &::after {
    content: '⋮';
    color: ${colors.textMuted};
    font-size: 14px;
    pointer-events: none;
  }
`;

const ViewLabel = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(45, 40, 34, 0.85);
  color: ${colors.text};
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  border: 1px solid ${colors.border};
  z-index: 10;
`;

const MaximizeBtn = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  background: rgba(45, 40, 34, 0.85);
  border: 1px solid ${colors.border};
  color: ${colors.textMuted};
  width: 28px;
  height: 28px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    border-color: ${colors.accent};
    color: ${colors.accent};
  }
`;

const ADD_HANDLERS = {
  'point-light':       addPointLight,
  'spot-light':        addSpotLight,
  'directional-light': addDirectionalLight,
  'area-light':        addAreaLight,
  'hemisphere-light':  addHemisphereLight,
  'product-cube':      addProductCube,
};

export default function App() {
  const [showHelp, setShowHelp] = useState(false);
  const [splitPct, setSplitPct] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [maximized, setMaximized] = useState(null);
  const containerRef = useRef(null);

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

  const cameraWidth = maximized === 'camera' ? 100 : maximized === 'setup' ? 0 : splitPct;
  const setupWidth  = maximized === 'setup'  ? 100 : maximized === 'camera' ? 0 : 100 - splitPct;
  const showDivider = maximized === null;

  return (
    <AppWrapper>
      <Header onAdd={handleAdd} onShowHelp={() => setShowHelp(true)} />

      <ViewsContainer ref={containerRef} $dragging={dragging}>
        <ViewPanel $width={cameraWidth}>
          <ViewLabel>Camera View</ViewLabel>
          <MaximizeBtn onClick={() => toggleMaximize('camera')}>
            {maximized === 'camera' ? '⤡' : '⤢'}
          </MaximizeBtn>
          <CameraView />
        </ViewPanel>

        {showDivider && <Divider onMouseDown={onDividerMouseDown} />}

        <ViewPanel $width={setupWidth}>
          <ViewLabel>Setup View</ViewLabel>
          <MaximizeBtn onClick={() => toggleMaximize('setup')}>
            {maximized === 'setup' ? '⤡' : '⤢'}
          </MaximizeBtn>
          <SetupView />
        </ViewPanel>

        <SelectionPanel />
      </ViewsContainer>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
        <ContextMenu />
    </AppWrapper>
  );
}