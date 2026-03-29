import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { sceneState, updateElement, updateCamera } from '../scene/sharedScene';
import { colors } from '../styles/theme';

const Sidebar = styled.div`
  width: ${({ $collapsed }) => $collapsed ? '24px' : '220px'};
  height: 100%;
  background: ${colors.background};
  border-left: 1px solid ${colors.border};
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
`;

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-bottom: 1px solid ${colors.border};
  flex-shrink: 0;
  min-height: 32px;
`;

const SidebarTitle = styled.div`
  font-size: 10px;
  font-weight: 600;
  color: ${colors.accent};
  text-transform: uppercase;
  letter-spacing: 0.6px;
  white-space: nowrap;
  overflow: hidden;
`;

const CollapseBtn = styled.button`
  background: transparent;
  border: none;
  color: ${colors.textMuted};
  cursor: pointer;
  font-size: 14px;
  padding: 0;
  line-height: 1;
  flex-shrink: 0;
  transition: color 0.2s;

  &:hover {
    color: ${colors.accent};
  }
`;

const CollapsedLabel = styled.div`
  writing-mode: vertical-rl;
  font-size: 9px;
  font-weight: 600;
  color: ${colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding-top: 10px;
  text-align: center;
  cursor: pointer;
  flex: 1;

  &:hover {
    color: ${colors.accent};
  }
`;

const SidebarHint = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: ${colors.textMuted};
  padding: 24px;
  text-align: center;
  line-height: 1.6;
`;

const PropsGroup = styled.div`
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  flex: 1;
`;

const FieldRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const AxisLabel = styled.span`
  font-size: 10px;
  font-weight: 600;
  color: ${({ $axis }) =>
    $axis === 'x' || $axis === 'rx' || $axis === 'sx' ? colors.axisX :
    $axis === 'y' || $axis === 'ry' || $axis === 'sy' ? colors.axisY :
    $axis === 'z' || $axis === 'rz' || $axis === 'sz' ? colors.axisZ : colors.accent};
  width: 14px;
  text-transform: uppercase;
  flex-shrink: 0;
  text-align: center;
`;

const FieldInput = styled.input.attrs({ type: 'number' })`
  flex: 1;
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  color: ${colors.text};
  font-size: 11px;
  padding: 5px 8px;
  border-radius: 3px;
  text-align: left;
  font-variant-numeric: tabular-nums;
  min-width: 0;

  &:focus {
    outline: none;
    border-color: ${colors.accent};
  }

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
  background: ${colors.border};
  margin: 2px 0;
`;

const SectionLabel = styled.div`
  font-size: 9px;
  font-weight: 600;
  color: ${colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 4px 0 2px;
`;

const POS_FIELDS = {
  'point-light': [
    { key: 'x', axis: 'x', step: 0.1 },
    { key: 'y', axis: 'y', step: 0.1 },
    { key: 'z', axis: 'z', step: 0.1 },
    { key: 'intensity', axis: 'i', step: 0.05 },
  ],
  'product-cube': [
    { key: 'x', axis: 'x', step: 0.1 },
    { key: 'y', axis: 'y', step: 0.1 },
    { key: 'z', axis: 'z', step: 0.1 },
  ],
  camera: [
    { key: 'x', axis: 'x', step: 0.1 },
    { key: 'y', axis: 'y', step: 0.1 },
    { key: 'z', axis: 'z', step: 0.1 },
  ],
};

const ROT_FIELDS = [
  { key: 'rx', axis: 'rx', step: 1 },
  { key: 'ry', axis: 'ry', step: 1 },
  { key: 'rz', axis: 'rz', step: 1 },
];

const SCALE_FIELDS = [
  { key: 'sx', axis: 'sx', step: 0.1 },
  { key: 'sy', axis: 'sy', step: 0.1 },
  { key: 'sz', axis: 'sz', step: 0.1 },
];

const LABEL_BY_TYPE = {
  'point-light':  'Point Light',
  'product-cube': 'Product Cube',
  camera:         'Camera',
};

const getStateForId = (id) => {
  if (id === 'camera') return sceneState.camera;
  return sceneState.elements[id] ?? null;
};

export default function SelectionPanel() {
  const [selected, setSelected] = useState(null);
  const [vals, setVals] = useState({});
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapse = (val) => {
    setCollapsed(val);
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'));
    });
  };

  useEffect(() => {
    const handler = (e) => {
      const id = e.detail;
      setSelected(id);
      if (id) setVals({ ...getStateForId(id) });
    };
    window.addEventListener('studio:select', handler);

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
        <CollapseBtn onClick={() => toggleCollapse(false)} title="Expand">›</CollapseBtn>
      </SidebarHeader>
      <CollapsedLabel onClick={() => toggleCollapse(false)}>
        {selected ? (LABEL_BY_TYPE[sceneState.elements[selected]?.type ?? selected] ?? 'Details') : 'Details'}
      </CollapsedLabel>
    </Sidebar>
  );

  if (!selected) return (
    <Sidebar $collapsed={false}>
      <SidebarHeader>
        <SidebarTitle>Details</SidebarTitle>
        <CollapseBtn onClick={() => toggleCollapse(true)} title="Collapse">‹</CollapseBtn>
      </SidebarHeader>
      <SidebarHint>Click an element in the Setup View to select and move it</SidebarHint>
    </Sidebar>
  );

  const type = selected === 'camera' ? 'camera' : sceneState.elements[selected]?.type;
  const posFields = POS_FIELDS[type] ?? [];
  const label = LABEL_BY_TYPE[type] ?? selected;

  const handleFieldInput = (field, raw) => {
    setVals(v => ({ ...v, [field.key]: raw }));
  };

  const handleFieldBlur = (field, raw) => {
    const num = parseFloat(raw);
    if (isNaN(num)) {
      setVals(v => ({ ...v, [field.key]: getStateForId(selected)?.[field.key] ?? 0 }));
      return;
    }
    if (selected === 'camera') updateCamera(field.key, num);
    else updateElement(selected, field.key, num);
    setVals(v => ({ ...v, [field.key]: num }));
  };

  const handleFieldKeyDown = (field, e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  const renderField = (field) => (
    <FieldRow key={field.key}>
      <AxisLabel $axis={field.axis}>
        {field.key === 'intensity' ? 'I' : field.axis.replace('r', '').replace('s', '')}
      </AxisLabel>
      <FieldInput
        value={vals[field.key] !== undefined ? (typeof vals[field.key] === 'number' ? vals[field.key].toFixed(field.step < 1 ? 1 : 0) : vals[field.key]) : '0'}
        onChange={e => handleFieldInput(field, e.target.value)}
        onBlur={e => handleFieldBlur(field, e.target.value)}
        onKeyDown={e => handleFieldKeyDown(field, e)}
        step={field.step}
      />
    </FieldRow>
  );

  return (
    <Sidebar $collapsed={false}>
      <SidebarHeader>
        <SidebarTitle>{label}</SidebarTitle>
        <CollapseBtn onClick={() => toggleCollapse(true)} title="Collapse">‹</CollapseBtn>
      </SidebarHeader>

      <PropsGroup>
        <SectionLabel>Position</SectionLabel>
        {posFields.map(renderField)}

        {type === 'point-light' && (
          <>
            <Divider />
            <ColorRow>
              <AxisLabel $axis="c">C</AxisLabel>
              <ColorInput
                value={vals.color ?? '#ffffff'}
                onChange={e => {
                  updateElement(selected, 'color', e.target.value);
                  setVals(v => ({ ...v, color: e.target.value }));
                }}
              />
              <span style={{ fontSize: '10px', color: colors.textMuted }}>Light color</span>
            </ColorRow>
          </>
        )}

        <Divider />
        <SectionLabel>Rotation (°)</SectionLabel>
        {ROT_FIELDS.map(renderField)}

        {type === 'product-cube' && (
          <>
            <Divider />
            <SectionLabel>Scale</SectionLabel>
            {SCALE_FIELDS.map(renderField)}
          </>
        )}
      </PropsGroup>
    </Sidebar>
  );
}