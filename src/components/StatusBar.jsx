import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { sceneState, onSceneChange } from '../scene/sharedScene';
import { colors } from '../styles/theme';

const Bar = styled.div`
  height: 24px;
  background: rgba(255,255,255,0.01);
  border-top: 1px solid rgba(255,255,255,0.04);
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 16px;
  font-size: 10px;
  flex-shrink: 0;
  font-family: 'JetBrains Mono', monospace;
`;

const StatusDot = styled.span`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
`;

const StatusItem = styled.span`
  color: ${({ $color }) => $color || 'rgba(255,255,255,0.2)'};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const Spacer = styled.div`
  flex: 1;
`;

export default function StatusBar() {
  const [objectCount, setObjectCount] = useState(0);
  const [lightCount, setLightCount] = useState(0);
  const [fps, setFps] = useState(60);
  const frameTimesRef = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    const updateCounts = () => {
      const elements = Object.values(sceneState.elements);
      setObjectCount(elements.length);
      setLightCount(elements.filter(e =>
        e.type === 'point-light' || e.type === 'spot-light' ||
        e.type === 'area-light' || e.type === 'hemisphere-light' ||
        e.type === 'directional-light'
      ).length);
    };

    updateCounts();
    const unsub = onSceneChange(updateCounts);
    return () => unsub();
  }, []);

  useEffect(() => {
    let lastTime = performance.now();
    const measure = () => {
      const now = performance.now();
      const delta = now - lastTime;
      lastTime = now;
      frameTimesRef.current.push(delta);
      if (frameTimesRef.current.length > 30) frameTimesRef.current.shift();
      const avg = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
      setFps(Math.round(1000 / avg));
      rafRef.current = requestAnimationFrame(measure);
    };
    rafRef.current = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const fpsColor = fps >= 50 ? '#5AAD5A' : fps >= 30 ? '#E8A855' : '#C75450';

  return (
    <Bar>
      <StatusItem>
        <StatusDot $color="#5AAD5A" />
        Ready
      </StatusItem>
      <StatusItem>{objectCount} objects</StatusItem>
      <StatusItem>{lightCount} lights</StatusItem>
      <Spacer />
      <StatusItem $color={fpsColor}>{fps} FPS</StatusItem>
    </Bar>
  );
}
