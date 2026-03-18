import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { sceneState, updateProduct, updateLight, updateCamera } from './sharedScene';

const Panel = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(35, 30, 26, 0.97);
  border-top: 1px solid #3d3530;
  padding: 14px 24px 18px;
  z-index: 100;
  backdrop-filter: blur(8px);
  display: flex;
  gap: 32px;
  align-items: center;
  flex-wrap: wrap;
`;

const PanelTitle = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #d4a574;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  white-space: nowrap;
  min-width: 72px;
`;

const SliderGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 200px;
`;

const SliderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const AxisLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: ${({ $axis }) =>
    $axis === 'x' ? '#e05a4e' : $axis === 'y' ? '#5aad5a' : $axis === 'z' ? '#4a90d9' : '#d4a574'};
  width: 14px;
  text-transform: uppercase;
`;

const Slider = styled.input.attrs({ type: 'range' })`
  flex: 1;
  height: 3px;
  accent-color: #d4a574;
  cursor: pointer;
`;

const ValLabel = styled.span`
  font-size: 11px;
  color: #9b8a7a;
  width: 34px;
  text-align: right;
  font-variant-numeric: tabular-nums;
`;

const Hint = styled.div`
  font-size: 11px;
  color: #9b8a7a;
  text-align: center;
  padding: 6px 0;
`;

// Slider config per element
const CONFIGS = {
  product: {
    label: 'Product',
    sliders: [
      { key: 'x', axis: 'x', min: -8,  max: 8,  step: 0.1, update: updateProduct },
      { key: 'y', axis: 'y', min: 0,   max: 6,  step: 0.1, update: updateProduct },
      { key: 'z', axis: 'z', min: -8,  max: 8,  step: 0.1, update: updateProduct },
    ],
    stateKey: 'product',
  },
  light: {
    label: 'Light',
    sliders: [
      { key: 'x',         axis: 'x', min: -10, max: 10, step: 0.1,  update: updateLight },
      { key: 'y',         axis: 'y', min: 0,   max: 12, step: 0.1,  update: updateLight },
      { key: 'z',         axis: 'z', min: -10, max: 10, step: 0.1,  update: updateLight },
      { key: 'intensity', axis: 'i', min: 0,   max: 5,  step: 0.05, update: updateLight },
    ],
    stateKey: 'light',
  },
  camera: {
    label: 'Camera',
    sliders: [
      { key: 'x', axis: 'x', min: -12, max: 12, step: 0.1, update: updateCamera },
      { key: 'y', axis: 'y', min: 1,   max: 14, step: 0.1, update: updateCamera },
      { key: 'z', axis: 'z', min: -12, max: 14, step: 0.1, update: updateCamera },
    ],
    stateKey: 'camera',
  },
};

// Component
export default function SelectionPanel() {
  const [selected, setSelected] = useState(null);
  const [vals, setVals] = useState({});

  // Listen for selection from SetupView
  useEffect(() => {
    const handler = (e) => {
      const id = e.detail;
      setSelected(id);
      if (id) setVals({ ...sceneState[CONFIGS[id].stateKey] });
    };
    window.addEventListener('studio:select', handler);
    return () => window.removeEventListener('studio:select', handler);
  }, []);

  if (!selected) return (
    <Hint>Click an element in the Setup View to select and move it</Hint>
  );

  const cfg = CONFIGS[selected];

  const handleChange = (slider, raw) => {
    const val = parseFloat(raw);
    slider.update(slider.key, val);
    setVals(v => ({ ...v, [slider.key]: val }));
  };

  return (
    <Panel>
      <PanelTitle>{cfg.label}</PanelTitle>
      <SliderGroup>
        {cfg.sliders.map(sl => (
          <SliderRow key={sl.key}>
            <AxisLabel $axis={sl.axis}>{sl.axis}</AxisLabel>
            <Slider
              min={sl.min}
              max={sl.max}
              step={sl.step}
              value={vals[sl.key] ?? 0}
              onChange={e => handleChange(sl, e.target.value)}
            />
            <ValLabel>{(vals[sl.key] ?? 0).toFixed(1)}</ValLabel>
          </SliderRow>
        ))}
      </SliderGroup>
    </Panel>
  );
}