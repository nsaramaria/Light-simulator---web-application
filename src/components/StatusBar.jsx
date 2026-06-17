import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { sceneState, onSceneChange } from '../scene/sharedScene';
import { colors, shadows } from '../styles/theme';

const Bar = styled.div`
  display: flex;
  align-items: center;
  padding: 0 2px;
  gap: 6px;
  flex-shrink: 0;
`;

const Chip = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  border-radius: 999px;
  padding: 4px 10px;
  box-shadow: ${shadows.cardSm};
  font-size: 10.5px;
  font-weight: 500;
  color: ${({ $color }) => $color || colors.ink2};
  font-variant-numeric: tabular-nums;
`;

const StatusDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
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

  const fpsColor = fps >= 50 ? colors.statusGood : fps >= 30 ? colors.statusWarn : colors.statusBad;

  return (
    <Bar>
      <Chip><StatusDot $color={colors.statusGood} />Ready</Chip>
      <Chip>{objectCount} objects</Chip>
      <Chip>{lightCount} lights</Chip>
      <Spacer />
      <Chip $color={fpsColor}><StatusDot $color={fpsColor} />{fps} FPS</Chip>
    </Bar>
  );
}
