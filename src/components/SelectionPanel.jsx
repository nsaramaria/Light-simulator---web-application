import React, { useEffect, useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { sceneState, updateElement, updateCamera } from '../scene/sharedScene';
import { colors } from '../styles/theme';

const Sidebar = styled.div`
  width: ${({ $collapsed }) => $collapsed ? '24px' : '240px'};
  height: 100%;
  background: ${colors.surfaceDark};
  backdrop-filter: blur(16px);
  border-left: 1px solid ${colors.border};
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
  transition: width 0.25s cubic-bezier(0.16,1,0.3,1);
`;

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid ${colors.border};
  flex-shrink: 0;
  min-height: 42px;
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const SidebarLabel = styled.div`
  font-size: 9px;
  font-weight: 600;
  color: ${colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const SelectedName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${colors.accent};
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CollapseBtn = styled.button`
  background: transparent;
  border: none;
  color: ${colors.textMuted};
  cursor: pointer;
  font-size: 14px;
  padding: 4px;
  line-height: 1;
  flex-shrink: 0;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    color: ${colors.accent};
    background: ${colors.accentSubtle};
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

const PropsScroll = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 6px 0;
`;

const SectionWrap = styled.div`
  border-bottom: 1px solid ${colors.border};
`;

const SectionHeader = styled.div`
  padding: 8px 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: background 0.1s;

  &:hover {
    background: ${colors.surface};
  }
`;

const SectionArrow = styled.span`
  font-size: 8px;
  color: ${colors.textMuted};
  display: inline-block;
  transform: ${({ $open }) => $open ? 'rotate(90deg)' : 'none'};
  transition: transform 0.15s;
`;

const SectionTitle = styled.span`
  font-size: 9px;
  font-weight: 700;
  color: ${colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  flex: 1;
`;

const SectionBadge = styled.span`
  font-size: 8px;
  color: ${colors.textMuted};
  padding: 1px 6px;
  background: ${colors.surfaceActive};
  border-radius: 3px;
`;

const SectionBody = styled.div`
  padding: 4px 14px 10px;
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const ColorRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 0;
`;

const PropLabel = styled.span`
  font-size: 10px;
  color: ${colors.textMuted};
  width: 60px;
  flex-shrink: 0;
`;

const ColorSwatch = styled.input.attrs({ type: 'color' })`
  width: 28px;
  height: 28px;
  border: 2px solid ${colors.borderHover};
  border-radius: 6px;
  background: none;
  cursor: pointer;
  padding: 0;
  transition: border-color 0.15s;

  &:hover {
    border-color: ${colors.placeholder};
  }
`;

const ColorHex = styled.span`
  font-size: 10px;
  color: ${colors.textMuted};
  font-family: 'JetBrains Mono', monospace;
`;

const ScrubFieldWrap = styled.div`
  display: flex;
  align-items: center;
  height: 26px;
  background: ${colors.surfaceHover};
  border: 1px solid ${({ $active }) => $active ? colors.accent : colors.border};
  border-radius: 4px;
  overflow: hidden;
  cursor: ew-resize;
  transition: border-color 0.15s;
  position: relative;

  &:hover {
    border-color: ${colors.borderHover};
    background: ${colors.surfaceActive};
  }
`;

const ScrubLabelText = styled.div`
  font-size: 10px;
  color: ${({ $color }) => $color || colors.textMuted};
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  padding: 0 8px;
  flex-shrink: 0;
  user-select: none;
  pointer-events: none;
  min-width: ${({ $wide }) => $wide ? '60px' : '20px'};
`;

const ScrubValue = styled.div`
  flex: 1;
  font-size: 11px;
  color: ${colors.text};
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
  text-align: right;
  padding-right: 8px;
  user-select: none;
  pointer-events: none;
  white-space: nowrap;
  overflow: hidden;
`;

const ScrubInput = styled.input`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.4);
  border: none;
  outline: none;
  color: ${colors.text};
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  text-align: right;
  padding: 0 8px;
  z-index: 2;
`;

function ScrubField({ label, labelColor, value, step, wideLabel, onChange, onCommit }) {
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState('');
  const [dragging, setDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartVal = useRef(0);
  const hasDragged = useRef(false);
  const inputRef = useRef(null);

  const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;

  const formatDisplay = () => {
    if (step < 0.1) return numValue.toFixed(2);
    if (step < 1) return numValue.toFixed(1);
    return numValue.toFixed(0);
  };

  const handleMouseDown = (e) => {
    if (editing) return;
    e.preventDefault();
    dragStartX.current = e.clientX;
    dragStartVal.current = numValue;
    hasDragged.current = false;
    setDragging(true);

    const onMove = (e) => {
      const dx = e.clientX - dragStartX.current;
      if (Math.abs(dx) > 2) hasDragged.current = true;
      if (!hasDragged.current) return;
      const sensitivity = e.shiftKey ? step * 0.1 : step;
      const delta = dx * sensitivity;
      const newVal = parseFloat((dragStartVal.current + delta).toFixed(4));
      onChange(newVal);
    };

    const onUp = () => {
      setDragging(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';

      if (!hasDragged.current) {
        setEditVal(formatDisplay());
        setEditing(true);
        setTimeout(() => inputRef.current?.select(), 0);
      } else {
        onCommit(numValue);
      }
    };

    document.body.style.cursor = 'ew-resize';
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleEditBlur = () => {
    setEditing(false);
    const num = parseFloat(editVal);
    if (!isNaN(num)) { onChange(num); onCommit(num); }
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') inputRef.current?.blur();
    else if (e.key === 'Escape') setEditing(false);
  };

  return (
    <ScrubFieldWrap $active={editing || dragging} onMouseDown={handleMouseDown}>
      <ScrubLabelText $color={labelColor} $wide={wideLabel}>{label}</ScrubLabelText>
      <ScrubValue>{formatDisplay()}</ScrubValue>
      {editing && (
        <ScrubInput ref={inputRef} value={editVal} onChange={e => setEditVal(e.target.value)} onBlur={handleEditBlur} onKeyDown={handleEditKeyDown} autoFocus />
      )}
    </ScrubFieldWrap>
  );
}

const POS_FIELDS = {
  'point-light':       [{ key: 'x', axis: 'x', step: 0.1 }, { key: 'y', axis: 'y', step: 0.1 }, { key: 'z', axis: 'z', step: 0.1 }],
  'spot-light':        [{ key: 'x', axis: 'x', step: 0.1 }, { key: 'y', axis: 'y', step: 0.1 }, { key: 'z', axis: 'z', step: 0.1 }],
  'directional-light': [{ key: 'x', axis: 'x', step: 0.1 }, { key: 'y', axis: 'y', step: 0.1 }, { key: 'z', axis: 'z', step: 0.1 }],
  'area-light':        [{ key: 'x', axis: 'x', step: 0.1 }, { key: 'y', axis: 'y', step: 0.1 }, { key: 'z', axis: 'z', step: 0.1 }],
  'hemisphere-light':  [{ key: 'x', axis: 'x', step: 0.1 }, { key: 'y', axis: 'y', step: 0.1 }, { key: 'z', axis: 'z', step: 0.1 }],
  'product-cube':      [{ key: 'x', axis: 'x', step: 0.1 }, { key: 'y', axis: 'y', step: 0.1 }, { key: 'z', axis: 'z', step: 0.1 }],
  'cyclorama':         [{ key: 'x', axis: 'x', step: 0.1 }, { key: 'y', axis: 'y', step: 0.1 }, { key: 'z', axis: 'z', step: 0.1 }],
  camera:              [{ key: 'x', axis: 'x', step: 0.1 }, { key: 'y', axis: 'y', step: 0.1 }, { key: 'z', axis: 'z', step: 0.1 }],
};

const LIGHT_FIELDS = {
  'point-light':       [{ key: 'intensity', label: 'Intensity', step: 0.05 }, { key: 'distance', label: 'Distance', step: 1 }],
  'spot-light':        [{ key: 'intensity', label: 'Intensity', step: 0.05 }, { key: 'distance', label: 'Distance', step: 1 }, { key: 'angle', label: 'Angle', step: 1 }, { key: 'penumbra', label: 'Penumbra', step: 0.05 }],
  'directional-light': [{ key: 'intensity', label: 'Intensity', step: 0.05 }],
  'area-light':        [{ key: 'intensity', label: 'Intensity', step: 0.1 }, { key: 'width', label: 'Width', step: 0.1 }, { key: 'height', label: 'Height', step: 0.1 }],
  'hemisphere-light':  [{ key: 'intensity', label: 'Intensity', step: 0.05 }],
};

const ROT_FIELDS = [{ key: 'rx', axis: 'rx', step: 1 }, { key: 'ry', axis: 'ry', step: 1 }, { key: 'rz', axis: 'rz', step: 1 }];
const SCALE_FIELDS = [{ key: 'sx', axis: 'sx', step: 0.1 }, { key: 'sy', axis: 'sy', step: 0.1 }, { key: 'sz', axis: 'sz', step: 0.1 }];

const LABEL_BY_TYPE = { 'point-light': 'Point Light', 'spot-light': 'Focused Light', 'area-light': 'Softbox', 'hemisphere-light': 'Environment Light', 'product-cube': 'Product Cube', 'cyclorama': 'Cyclorama', camera: 'Camera' };
const TYPE_ICON = { 'point-light': '☀', 'spot-light': '◐', 'area-light': '▬', 'hemisphere-light': '◑', 'product-cube': '■', 'cyclorama': '⌐', camera: '◎' };
const AXIS_COLORS = { x: colors.axisX, rx: colors.axisX, sx: colors.axisX, y: colors.axisY, ry: colors.axisY, sy: colors.axisY, z: colors.axisZ, rz: colors.axisZ, sz: colors.axisZ };
const SINGLE_COLOR_TYPES = ['point-light', 'spot-light', 'directional-light', 'area-light'];

const getStateForId = (id) => id === 'camera' ? sceneState.camera : sceneState.elements[id] ?? null;
const THROTTLE_MS = 66;

function AccordionSection({ title, badge, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <SectionWrap>
      <SectionHeader onClick={() => setOpen(!open)}>
        <SectionArrow $open={open}>▶</SectionArrow>
        <SectionTitle>{title}</SectionTitle>
        {badge && <SectionBadge>{badge}</SectionBadge>}
      </SectionHeader>
      {open && <SectionBody>{children}</SectionBody>}
    </SectionWrap>
  );
}

export default function SelectionPanel() {
  const [selected, setSelected] = useState(null);
  const [vals, setVals] = useState({});
  const [collapsed, setCollapsed] = useState(false);
  const throttleRef = useRef(null);
  const pendingUpdateRef = useRef(null);

  const toggleCollapse = (val) => { setCollapsed(val); requestAnimationFrame(() => window.dispatchEvent(new Event('resize'))); };

  useEffect(() => {
    const handler = (e) => { const id = e.detail; setSelected(id); if (id) setVals({ ...getStateForId(id) }); };
    window.addEventListener('studio:select', handler);
    const posHandler = (e) => {
      const { axis, val } = e.detail;
      pendingUpdateRef.current = { ...(pendingUpdateRef.current || {}), [axis]: val };
      if (!throttleRef.current) {
        setVals(v => ({ ...v, ...pendingUpdateRef.current }));
        pendingUpdateRef.current = null;
        throttleRef.current = setTimeout(() => {
          throttleRef.current = null;
          if (pendingUpdateRef.current) { setVals(v => ({ ...v, ...pendingUpdateRef.current })); pendingUpdateRef.current = null; }
        }, THROTTLE_MS);
      }
    };
    window.addEventListener('studio:position-update', posHandler);
    return () => { window.removeEventListener('studio:select', handler); window.removeEventListener('studio:position-update', posHandler); if (throttleRef.current) clearTimeout(throttleRef.current); };
  }, []);

  if (collapsed) return (
    <Sidebar $collapsed>
      <SidebarHeader style={{ justifyContent: 'center', padding: '8px 0' }}>
        <CollapseBtn onClick={() => toggleCollapse(false)} title="Expand">›</CollapseBtn>
      </SidebarHeader>
      <CollapsedLabel onClick={() => toggleCollapse(false)}>
        {selected ? (LABEL_BY_TYPE[sceneState.elements[selected]?.type ?? selected] ?? 'Inspector') : 'Inspector'}
      </CollapsedLabel>
    </Sidebar>
  );

  if (!selected) return (
    <Sidebar $collapsed={false}>
      <SidebarHeader>
        <HeaderLeft><SidebarLabel>Inspector</SidebarLabel></HeaderLeft>
        <CollapseBtn onClick={() => toggleCollapse(true)} title="Collapse">‹</CollapseBtn>
      </SidebarHeader>
      <SidebarHint>Select an element in the Setup View to inspect its properties</SidebarHint>
    </Sidebar>
  );

  const type = selected === 'camera' ? 'camera' : sceneState.elements[selected]?.type;
  const posFields = POS_FIELDS[type] ?? [];
  const lightFields = LIGHT_FIELDS[type] ?? [];
  const label = LABEL_BY_TYPE[type] ?? selected;
  const icon = TYPE_ICON[type] ?? '○';

  const handleScrubChange = (field, newVal) => { setVals(v => ({ ...v, [field.key]: newVal })); if (selected === 'camera') updateCamera(field.key, newVal); else updateElement(selected, field.key, newVal); };
  const handleScrubCommit = () => {};
  const handleColorChange = (key, value) => { updateElement(selected, key, value); setVals(v => ({ ...v, [key]: value })); };

  const renderAxisField = (field) => (
    <ScrubField key={field.key} label={field.axis.replace('r','').replace('s','').toUpperCase()} labelColor={AXIS_COLORS[field.axis]} value={vals[field.key] ?? 0} step={field.step} onChange={(v) => handleScrubChange(field, v)} onCommit={() => handleScrubCommit()} />
  );

  const renderLabeledField = (field) => (
    <ScrubField key={field.key} label={field.label} value={vals[field.key] ?? 0} step={field.step} wideLabel onChange={(v) => handleScrubChange(field, v)} onCommit={() => handleScrubCommit()} />
  );

  return (
    <Sidebar $collapsed={false}>
      <SidebarHeader>
        <HeaderLeft><SidebarLabel>Inspector</SidebarLabel><SelectedName>{icon} {label}</SelectedName></HeaderLeft>
        <CollapseBtn onClick={() => toggleCollapse(true)} title="Collapse">‹</CollapseBtn>
      </SidebarHeader>
      <PropsScroll>
        <AccordionSection title="Position">{posFields.map(renderAxisField)}</AccordionSection>
        <AccordionSection title="Rotation">{ROT_FIELDS.map(renderAxisField)}</AccordionSection>
        {(type === 'product-cube' || type === 'cyclorama') && <AccordionSection title="Scale">{SCALE_FIELDS.map(renderAxisField)}</AccordionSection>}
        {lightFields.length > 0 && (
          <AccordionSection title="Light" badge={LABEL_BY_TYPE[type]?.split(' ')[0]}>
            {lightFields.map(renderLabeledField)}
            {SINGLE_COLOR_TYPES.includes(type) && (
              <ColorRow><PropLabel>Color</PropLabel><ColorSwatch value={vals.color ?? '#ffffff'} onChange={e => handleColorChange('color', e.target.value)} /><ColorHex>{(vals.color ?? '#ffffff').toUpperCase()}</ColorHex></ColorRow>
            )}
          </AccordionSection>
        )}
        {type === 'hemisphere-light' && (
          <AccordionSection title="Colors">
            <ColorRow><PropLabel>Sky</PropLabel><ColorSwatch value={vals.skyColor ?? '#87ceeb'} onChange={e => handleColorChange('skyColor', e.target.value)} /><ColorHex>{(vals.skyColor ?? '#87ceeb').toUpperCase()}</ColorHex></ColorRow>
            <ColorRow><PropLabel>Ground</PropLabel><ColorSwatch value={vals.groundColor ?? '#362a1e'} onChange={e => handleColorChange('groundColor', e.target.value)} /><ColorHex>{(vals.groundColor ?? '#362a1e').toUpperCase()}</ColorHex></ColorRow>
          </AccordionSection>
        )}
      </PropsScroll>
    </Sidebar>
  );
}
