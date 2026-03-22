import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { sceneState, updateProduct, updateLight, updateCamera } from './sharedScene';

const Sidebar = styled.div`
  width: ${({ $collapsed }) => $collapsed ? '24px' : '220px'};
  height: 100%;
  background: #1e1a16;
  border-left: 1px solid #3d3530;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
  transition: width 0.2s ease;
`;

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-bottom: 1px solid #3d3530;
  flex-shrink: 0;
  min-height: 32px;
`;

const SidebarTitle = styled.div`
  font-size: 10px;
  font-weight: 600;
  color: #d4a574;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  white-space: nowrap;
  overflow: hidden;
`;

const CollapseBtn = styled.button`
  background: transparent;
  border: none;
  color: #9b8a7a;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
  line-height: 1;
  flex-shrink: 0;
  transition: color 0.2s;

  &:hover {
    color: #d4a574;
  }
`;

// Vertical label shown when collapsed
const CollapsedLabel = styled.div`
  writing-mode: vertical-rl;
  font-size: 9px;
  font-weight: 600;
  color: #9b8a7a;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding-top: 10px;
  text-align: center;
  cursor: pointer;
  flex: 1;

  &:hover {
    color: #d4a574;
  }
`;

const SidebarHint = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #9b8a7a;
  padding: 24px;
  text-align: center;
  line-height: 1.6;
`;

const SectionHeader = styled.div`
  padding: 10px 12px 6px;
  font-size: 10px;
  font-weight: 600;
  color: #d4a574;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  border-bottom: 1px solid #3d3530;
`;

const SliderGroup = styled.div`
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  flex: 1;
`;

const SliderRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SliderTop = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const AxisLabel = styled.span`
  font-size: 10px;
  font-weight: 600;
  color: ${({ $axis }) =>
    $axis === 'x' ? '#e05a4e' : $axis === 'y' ? '#5aad5a' : $axis === 'z' ? '#4a90d9' : '#d4a574'};
  width: 10px;
  text-transform: uppercase;
  flex-shrink: 0;
`;

const Slider = styled.input.attrs({ type: 'range' })`
  flex: 1;
  height: 3px;
  accent-color: #d4a574;
  cursor: pointer;
  min-width: 0;
`;

const NumInput = styled.input.attrs({ type: 'number' })`
  width: 52px;
  background: #2d2822;
  border: 1px solid #3d3530;
  color: #e8dfd6;
  font-size: 11px;
  padding: 3px 5px;
  border-radius: 3px;
  text-align: right;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;

  &:focus {
    outline: none;
    border-color: #d4a574;
  }

  /* hide spin arrows */
  -moz-appearance: textfield;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
`;

const ColorRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
`;

const ColorInput = styled.input.attrs({ type: 'color' })`
  width: 32px;
  height: 22px;
  border: none;
  background: none;
  cursor: pointer;
  padding: 0;
`;

const Divider = styled.div`
  height: 1px;
  background: #3d3530;
  margin: 2px 0;
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
  const [collapsed, setCollapsed] = useState(false);

  // Listen for selection from SetupView
  useEffect(() => {
    const handler = (e) => {
      const id = e.detail;
      setSelected(id);
      if (id) setVals({ ...sceneState[CONFIGS[id].stateKey] });
    };
    window.addEventListener('studio:select', handler);

    // Sync sidebar when gizmo moves an object
    const posHandler = (e) => {
      const { axis, val } = e.detail;
      setVals(v => ({ ...v, [axis]: val }));
    };
    window.addEventListener('studio:position-update', posHandler);

    return () => {
      window.removeEventListener('studio:select', handler);
      window.removeEventListener('studio:position-update', posHandler);
    };
  }, []);

  if (collapsed) return (
    <Sidebar $collapsed>
      <SidebarHeader style={{ justifyContent: 'center', padding: '8px 0' }}>
        <CollapseBtn onClick={() => setCollapsed(false)} title="Expand">›</CollapseBtn>
      </SidebarHeader>
      <CollapsedLabel onClick={() => setCollapsed(false)}>
        {selected ? CONFIGS[selected].label : 'Details'}
      </CollapsedLabel>
    </Sidebar>
  );

  if (!selected) return (
    <Sidebar $collapsed={false}>
      <SidebarHeader>
        <SidebarTitle>Details</SidebarTitle>
        <CollapseBtn onClick={() => setCollapsed(true)} title="Collapse">‹</CollapseBtn>
      </SidebarHeader>
      <SidebarHint>Click an element in the Setup View to select and move it</SidebarHint>
    </Sidebar>
  );

  const cfg = CONFIGS[selected];

  const handleChange = (slider, raw) => {
    const num = parseFloat(raw);
    if (isNaN(num)) return;
    const clamped = Math.min(Math.max(num, slider.min), slider.max);
    slider.update(slider.key, clamped);
    setVals(v => ({ ...v, [slider.key]: clamped }));
  };

  const handleNumInput = (slider, raw) => {
    // Allow free typing, only clamp and apply on blur
    setVals(v => ({ ...v, [slider.key]: raw }));
  };

  const handleNumBlur = (slider, raw) => {
    const num = parseFloat(raw);
    if (isNaN(num)) {
      setVals(v => ({ ...v, [slider.key]: sceneState[cfg.stateKey][slider.key] }));
      return;
    }
    const clamped = Math.min(Math.max(num, slider.min), slider.max);
    slider.update(slider.key, clamped);
    setVals(v => ({ ...v, [slider.key]: clamped }));
  };

  return (
    <Sidebar $collapsed={false}>
      <SidebarHeader>
        <SidebarTitle>{cfg.label}</SidebarTitle>
        <CollapseBtn onClick={() => setCollapsed(true)} title="Collapse">‹</CollapseBtn>
      </SidebarHeader>
      <SliderGroup>
        {cfg.sliders.map((sl, i) => (
          <React.Fragment key={sl.key}>
            {i > 0 && sl.axis !== cfg.sliders[i - 1].axis && <Divider />}
            <SliderRow>
              <SliderTop>
                <AxisLabel $axis={sl.axis}>{sl.axis}</AxisLabel>
                <Slider
                  min={sl.min}
                  max={sl.max}
                  step={sl.step}
                  value={parseFloat(vals[sl.key]) || 0}
                  onChange={e => handleChange(sl, e.target.value)}
                />
                <NumInput
                  value={vals[sl.key] !== undefined ? (typeof vals[sl.key] === 'number' ? vals[sl.key].toFixed(2) : vals[sl.key]) : '0.00'}
                  onChange={e => handleNumInput(sl, e.target.value)}
                  onBlur={e => handleNumBlur(sl, e.target.value)}
                  step={sl.step}
                  min={sl.min}
                  max={sl.max}
                />
              </SliderTop>
            </SliderRow>
          </React.Fragment>
        ))}

        {selected === 'light' && (
          <>
            <Divider />
            <ColorRow>
              <AxisLabel $axis="c">C</AxisLabel>
              <ColorInput
                value={vals.color ?? '#ffffff'}
                onChange={e => {
                  updateLight('color', e.target.value);
                  setVals(v => ({ ...v, color: e.target.value }));
                }}
              />
              <span style={{ fontSize: '10px', color: '#9b8a7a' }}>Light color</span>
            </ColorRow>
          </>
        )}
      </SliderGroup>
    </Sidebar>
  );
}