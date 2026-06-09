import React, { useEffect, useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import * as THREE from 'three';
import { sceneState, updateElement, updateCamera, beginTransaction, commitTransaction, toggleLock } from '../scene/sharedScene';
import { colors } from '../styles/theme';

const Sidebar = styled.div`
  width: ${({ $collapsed, $embedded }) => $embedded ? '100%' : $collapsed ? '24px' : '240px'};
  height: 100%;
  background: ${({ $embedded }) => $embedded ? 'transparent' : colors.surfaceDark};
  backdrop-filter: ${({ $embedded }) => $embedded ? 'none' : 'blur(16px)'};
  border-left: ${({ $embedded }) => $embedded ? 'none' : `1px solid ${colors.border}`};
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
  transition: ${({ $embedded }) => $embedded ? 'none' : 'width 0.25s cubic-bezier(0.16,1,0.3,1)'};
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

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
`;

const HeaderIconBtn = styled.button`
  background: transparent;
  border: none;
  color: ${({ $active }) => $active ? colors.accent : colors.textMuted};
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    color: ${colors.accent};
    background: ${colors.accentSubtle};
  }
`;

const LockClosedIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const LockOpenIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </svg>
);

const EyeOpenIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeClosedIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <path d="M14.12 14.12A3 3 0 1 1 9.88 9.88" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const LockedBanner = styled.div`
  padding: 8px 14px;
  font-size: 10px;
  color: ${colors.accent};
  background: ${colors.accentSubtle};
  border-bottom: 1px solid ${colors.border};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const HiddenBanner = styled.div`
  padding: 8px 14px;
  font-size: 10px;
  color: ${colors.textMuted};
  background: rgba(255, 255, 255, 0.04);
  border-bottom: 1px solid ${colors.border};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const CheckboxRow = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 11px;
  color: ${colors.text};
  cursor: pointer;
  user-select: none;
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  cursor: pointer;
  accent-color: ${colors.accent};
`;

const AimRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 4px 0;
  font-size: 11px;
  color: ${colors.text};
`;

const AimSelect = styled.select`
  background: ${colors.surfaceHover};
  color: ${colors.text};
  border: 1px solid ${colors.border};
  border-radius: 4px;
  padding: 3px 6px;
  font-size: 11px;
  font-family: inherit;
  cursor: pointer;
  flex: 1;
  min-width: 0;

  &:focus { outline: none; border-color: ${colors.accent}; }
`;

const LumensReadout = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 10px;
  color: ${colors.textMuted};
  font-family: 'JetBrains Mono', monospace;
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

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
`;

const InfoLabel = styled.span`
  font-size: 10px;
  color: ${colors.textDim};
  width: 60px;
  flex-shrink: 0;
`;

const InfoValue = styled.span`
  font-size: 10px;
  color: ${colors.textMuted};
  font-family: 'JetBrains Mono', monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

function ScrubField({ label, labelColor, value, step, wideLabel, min, max, onChange, onStart, onCommit }) {
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState('');
  const [dragging, setDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartVal = useRef(0);
  const hasDragged = useRef(false);
  const startNotified = useRef(false);
  const inputRef = useRef(null);

  const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;

  const clamp = (v) => {
    let r = v;
    if (typeof min === 'number') r = Math.max(min, r);
    if (typeof max === 'number') r = Math.min(max, r);
    return r;
  };

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
    startNotified.current = false;
    setDragging(true);

    const onMove = (e) => {
      const dx = e.clientX - dragStartX.current;
      if (Math.abs(dx) > 2) hasDragged.current = true;
      if (!hasDragged.current) return;
      if (!startNotified.current) {
        startNotified.current = true;
        onStart?.();
      }
      const sensitivity = e.shiftKey ? step * 0.1 : step;
      const delta = dx * sensitivity;
      const newVal = clamp(parseFloat((dragStartVal.current + delta).toFixed(4)));
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
    if (!isNaN(num)) { const c = clamp(num); onStart?.(); onChange(c); onCommit(c); }
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
  'imported-model':    [{ key: 'x', axis: 'x', step: 0.1 }, { key: 'y', axis: 'y', step: 0.1 }, { key: 'z', axis: 'z', step: 0.1 }],
  camera:              [{ key: 'x', axis: 'x', step: 0.1 }, { key: 'y', axis: 'y', step: 0.1 }, { key: 'z', axis: 'z', step: 0.1 }],
};

const LIGHT_FIELDS = {
  'point-light':       [{ key: 'intensity', label: 'Intensity', step: 0.05, min: 0 }],
  'spot-light':        [{ key: 'intensity', label: 'Intensity', step: 0.05, min: 0 }, { key: 'angle', label: 'Angle', step: 1, min: 1, max: 89 }, { key: 'penumbra', label: 'Penumbra', step: 0.05, min: 0, max: 1 }],
  'directional-light': [{ key: 'intensity', label: 'Intensity', step: 0.05, min: 0 }],
  'area-light':        [{ key: 'intensity', label: 'Intensity', step: 0.1, min: 0 }, { key: 'width', label: 'Width', step: 0.1, min: 0.1 }, { key: 'height', label: 'Height', step: 0.1, min: 0.1 }],
  'hemisphere-light':  [{ key: 'intensity', label: 'Intensity', step: 0.05, min: 0 }],
};

const ROT_FIELDS = [{ key: 'rx', axis: 'rx', step: 1 }, { key: 'ry', axis: 'ry', step: 1 }, { key: 'rz', axis: 'rz', step: 1 }];
const SCALE_FIELDS = [{ key: 'sx', axis: 'sx', step: 0.1 }, { key: 'sy', axis: 'sy', step: 0.1 }, { key: 'sz', axis: 'sz', step: 0.1 }];

const LABEL_BY_TYPE = { 'point-light': 'Point Light', 'spot-light': 'Focused Light', 'area-light': 'Softbox', 'hemisphere-light': 'Environment Light', 'product-cube': 'Product Cube', 'cyclorama': 'Cyclorama', 'imported-model': 'Imported Model', camera: 'Camera' };
const TYPE_ICON = { 'point-light': '☀', 'spot-light': '◐', 'area-light': '▬', 'hemisphere-light': '◑', 'product-cube': '■', 'cyclorama': '⌐', 'imported-model': '⬡', camera: '◎' };
const AXIS_COLORS = { x: colors.axisX, rx: colors.axisX, sx: colors.axisX, y: colors.axisY, ry: colors.axisY, sy: colors.axisY, z: colors.axisZ, rz: colors.axisZ, sz: colors.axisZ };
const SINGLE_COLOR_TYPES = ['point-light', 'spot-light', 'directional-light', 'area-light'];
const SHADOW_CASTING_TYPES = ['point-light', 'spot-light', 'directional-light'];
const SCALABLE_TYPES = ['product-cube', 'cyclorama', 'imported-model'];
const AIMABLE_TYPES = ['spot-light', 'directional-light', 'area-light'];

const computeAimRotation = (sourcePos, targetPos, lightType) => {
  const dir = new THREE.Vector3().subVectors(targetPos, sourcePos);
  if (dir.lengthSq() < 1e-8) return null;
  dir.normalize();

  const forward = lightType === 'area-light'
    ? new THREE.Vector3(0, 0, 1)
    : new THREE.Vector3(0, -1, 0);

  const q = new THREE.Quaternion().setFromUnitVectors(forward, dir);
  const e = new THREE.Euler().setFromQuaternion(q, 'XYZ');

  const RAD2DEG = 180 / Math.PI;
  return {
    rx: e.x * RAD2DEG,
    ry: e.y * RAD2DEG,
    rz: e.z * RAD2DEG,
  };
};

const kelvinToHex = (kelvin) => {
  const t = Math.max(1000, Math.min(40000, kelvin)) / 100;
  let r, g, b;

  if (t <= 66) {
    r = 255;
    g = 99.4708025861 * Math.log(t) - 161.1195681661;
    b = t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  } else {
    r = 329.698727446 * Math.pow(t - 60, -0.1332047592);
    g = 288.1221695283 * Math.pow(t - 60, -0.0755148492);
    b = 255;
  }

  const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)));
  const hex = (n) => clamp(n).toString(16).padStart(2, '0');
  return `#${hex(r)}${hex(g)}${hex(b)}`;
};

const KELVIN_PRESETS = [
  { k: 1900, label: 'Candle' },
  { k: 2700, label: 'Warm bulb' },
  { k: 3200, label: 'Tungsten' },
  { k: 4000, label: 'Cool fluor.' },
  { k: 5600, label: 'Daylight' },
  { k: 6500, label: 'Overcast' },
  { k: 9000, label: 'Shade' },
];

const KelvinSliderWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 4px 0;
`;

const KelvinSlider = styled.input.attrs({ type: 'range', min: 1500, max: 12000, step: 50 })`
  width: 100%;
  height: 12px;
  appearance: none;
  -webkit-appearance: none;
  background: linear-gradient(to right,
    #ff8c1a 0%, #ffb46b 12%, #ffd4a1 24%, #ffe9c9 36%,
    #fff5e0 48%, #ffffff 56%, #e6efff 68%, #c2d7ff 80%,
    #9bbcff 92%, #7aa6ff 100%);
  border-radius: 6px;
  outline: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    appearance: none;
    -webkit-appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: ${colors.text};
    border: 2px solid ${colors.accent};
    cursor: pointer;
  }
  &::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: ${colors.text};
    border: 2px solid ${colors.accent};
    cursor: pointer;
  }
`;

const KelvinRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const KelvinValue = styled.span`
  font-size: 11px;
  color: ${colors.text};
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
`;

const KelvinLabel = styled.span`
  font-size: 10px;
  color: ${colors.textMuted};
`;

const KelvinSwatch = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 4px;
  border: 1px solid ${colors.border};
  background: ${({ $color }) => $color};
  flex-shrink: 0;
`;

const PresetsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const PresetBtn = styled.button`
  font-size: 9px;
  padding: 3px 6px;
  background: ${colors.surfaceHover};
  border: 1px solid ${colors.border};
  border-radius: 4px;
  color: ${colors.textMuted};
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    color: ${colors.accent};
    border-color: ${colors.accent};
  }
`;

function KelvinPicker({ value, onStart, onChange, onCommit }) {
  const kelvin = value ?? 5600;
  const hex = kelvinToHex(kelvin);
  const nearestPresetLabel = (() => {
    let best = KELVIN_PRESETS[0];
    let bestDiff = Math.abs(kelvin - best.k);
    for (const p of KELVIN_PRESETS) {
      const d = Math.abs(kelvin - p.k);
      if (d < bestDiff) { best = p; bestDiff = d; }
    }
    return best.label;
  })();

  const draggingRef = useRef(false);

  const handleMouseDown = () => {
    draggingRef.current = true;
    onStart?.();
  };

  const handleChange = (e) => {
    const k = parseInt(e.target.value, 10);
    onChange(k, kelvinToHex(k));
  };

  const handleMouseUp = () => {
    if (draggingRef.current) {
      draggingRef.current = false;
      onCommit?.();
    }
  };

  return (
    <KelvinSliderWrap>
      <KelvinRow>
        <KelvinSwatch $color={hex} />
        <KelvinValue>{kelvin}K</KelvinValue>
        <KelvinLabel>{nearestPresetLabel}</KelvinLabel>
      </KelvinRow>
      <KelvinSlider
        value={kelvin}
        onMouseDown={handleMouseDown}
        onChange={handleChange}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
      />
      <PresetsRow>
        {KELVIN_PRESETS.map(p => (
          <PresetBtn key={p.k} onClick={() => { onStart?.(); onChange(p.k, kelvinToHex(p.k)); onCommit?.(); }}>
            {p.k}K
          </PresetBtn>
        ))}
      </PresetsRow>
    </KelvinSliderWrap>
  );
}

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

export default function SelectionPanel({ embedded = false }) {
  const [selected, setSelected] = useState(null);
  const [vals, setVals] = useState({});
  const [collapsed, setCollapsed] = useState(false);
  const throttleRef = useRef(null);
  const pendingUpdateRef = useRef(null);

  const toggleCollapse = (val) => { setCollapsed(val); requestAnimationFrame(() => window.dispatchEvent(new Event('resize'))); };

  useEffect(() => {
    const handler = (e) => { const id = e.detail?.primary ?? null; setSelected(id); if (id) setVals({ ...getStateForId(id) }); };
    window.addEventListener('studio:selection-changed', handler);
    const posHandler = (e) => {
      const { axis, val } = e.detail;
      pendingUpdateRef.current = { ...(pendingUpdateRef.current || {}), [axis]: val };
      if (!throttleRef.current) {
        const snapshot = pendingUpdateRef.current;
        pendingUpdateRef.current = null;
        setVals(v => ({ ...v, ...snapshot }));
        throttleRef.current = setTimeout(() => {
          throttleRef.current = null;
          if (pendingUpdateRef.current) {
            const trailing = pendingUpdateRef.current;
            pendingUpdateRef.current = null;
            setVals(v => ({ ...v, ...trailing }));
          }
        }, THROTTLE_MS);
      }
    };
    window.addEventListener('studio:position-update', posHandler);
    return () => { window.removeEventListener('studio:selection-changed', handler); window.removeEventListener('studio:position-update', posHandler); if (throttleRef.current) clearTimeout(throttleRef.current); };
  }, []);

  if (collapsed && !embedded) return (
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
    <Sidebar $collapsed={false} $embedded={embedded}>
      <SidebarHeader>
        <HeaderLeft><SidebarLabel>Inspector</SidebarLabel></HeaderLeft>
        {!embedded && <CollapseBtn onClick={() => toggleCollapse(true)} title="Collapse">‹</CollapseBtn>}
      </SidebarHeader>
      <SidebarHint>Select an element in the Setup View to inspect its properties</SidebarHint>
    </Sidebar>
  );

  const type = selected === 'camera' ? 'camera' : sceneState.elements[selected]?.type;
  const posFields = POS_FIELDS[type] ?? [];
  const lightFields = LIGHT_FIELDS[type] ?? [];
  const label = type === 'imported-model' ? (vals.fileName || 'Imported Model') : (LABEL_BY_TYPE[type] ?? selected);
  const icon = TYPE_ICON[type] ?? '○';

  const handleScrubStart = () => { beginTransaction(); };
  const handleScrubChange = (field, newVal) => { setVals(v => ({ ...v, [field.key]: newVal })); if (selected === 'camera') updateCamera(field.key, newVal); else updateElement(selected, field.key, newVal); };
  const handleScrubCommit = () => { commitTransaction(); };
  const handleColorChange = (key, value) => { updateElement(selected, key, value); setVals(v => ({ ...v, [key]: value })); };

  const renderAxisField = (field) => (
    <ScrubField key={field.key} label={field.axis.replace('r','').replace('s','').toUpperCase()} labelColor={AXIS_COLORS[field.axis]} value={vals[field.key] ?? 0} step={field.step} onChange={(v) => handleScrubChange(field, v)} onStart={handleScrubStart} onCommit={() => handleScrubCommit()} />
  );

  const renderLabeledField = (field) => (
    <ScrubField key={field.key} label={field.label} value={vals[field.key] ?? 0} step={field.step} min={field.min} max={field.max} wideLabel onChange={(v) => handleScrubChange(field, v)} onStart={handleScrubStart} onCommit={() => handleScrubCommit()} />
  );

  return (
    <Sidebar $collapsed={false} $embedded={embedded}>
      <SidebarHeader>
        <HeaderLeft><SidebarLabel>Inspector</SidebarLabel><SelectedName>{icon} {label}</SelectedName></HeaderLeft>
        <HeaderActions>
          {selected && selected !== 'camera' && (
            <>
              <HeaderIconBtn
                $active={!!vals.hidden}
                onClick={() => { updateElement(selected, 'hidden', !vals.hidden); setVals(v => ({ ...v, hidden: !v.hidden })); }}
                title={vals.hidden ? 'Show' : 'Hide (H)'}
              >
                {vals.hidden ? <EyeClosedIcon /> : <EyeOpenIcon />}
              </HeaderIconBtn>
              <HeaderIconBtn
                $active={!!vals.locked}
                onClick={() => { toggleLock(selected); setVals(v => ({ ...v, locked: !v.locked })); }}
                title={vals.locked ? 'Unlock' : 'Lock (prevents accidental edits)'}
              >
                {vals.locked ? <LockClosedIcon /> : <LockOpenIcon />}
              </HeaderIconBtn>
            </>
          )}
          {!embedded && <CollapseBtn onClick={() => toggleCollapse(true)} title="Collapse">‹</CollapseBtn>}
        </HeaderActions>
      </SidebarHeader>
      {vals.locked && (
        <LockedBanner><LockClosedIcon /> Locked — unlock to edit</LockedBanner>
      )}
      {vals.hidden && (
        <HiddenBanner><EyeClosedIcon /> Hidden — won't appear in the camera view</HiddenBanner>
      )}
      <PropsScroll>
        {type === 'imported-model' && vals.fileName && (
          <AccordionSection title="File" defaultOpen={false}>
            <InfoRow>
              <InfoLabel>Name</InfoLabel>
              <InfoValue>{vals.fileName}</InfoValue>
            </InfoRow>
          </AccordionSection>
        )}
        <AccordionSection title="Position">{posFields.map(renderAxisField)}</AccordionSection>
        <AccordionSection title="Rotation">{ROT_FIELDS.map(renderAxisField)}</AccordionSection>
        {SCALABLE_TYPES.includes(type) && <AccordionSection title="Scale">{SCALE_FIELDS.map(renderAxisField)}</AccordionSection>}
        {lightFields.length > 0 && (
          <AccordionSection title="Light" badge={LABEL_BY_TYPE[type]?.split(' ')[0]}>
            {lightFields.map(renderLabeledField)}
            {SINGLE_COLOR_TYPES.includes(type) && (
              <KelvinPicker
                value={vals.colorKelvin ?? 5600}
                onStart={handleScrubStart}
                onChange={(k, hex) => {
                  setVals(v => ({ ...v, colorKelvin: k, color: hex }));
                  updateElement(selected, 'colorKelvin', k);
                  updateElement(selected, 'color', hex);
                }}
                onCommit={handleScrubCommit}
              />
            )}
            {SINGLE_COLOR_TYPES.includes(type) && (
              <ColorRow>
                <PropLabel>Color</PropLabel>
                <ColorSwatch
                  value={vals.color ?? '#ffffff'}
                  onChange={e => handleColorChange('color', e.target.value)}
                />
                <ColorHex>{(vals.color ?? '#ffffff').toUpperCase()}</ColorHex>
              </ColorRow>
            )}
            {SINGLE_COLOR_TYPES.includes(type) && (
              <LumensReadout>
                <span>Approx. lumens</span>
                <span>{Math.round((vals.intensity ?? 1) * 683)} lm</span>
              </LumensReadout>
            )}
            {AIMABLE_TYPES.includes(type) && (
              <AimRow>
                <span style={{ flexShrink: 0 }}>Aim at</span>
                <AimSelect
                  value=""
                  onChange={(e) => {
                    const targetId = e.target.value;
                    if (!targetId) return;
                    const targetState = targetId === 'camera'
                      ? sceneState.camera
                      : sceneState.elements[targetId];
                    if (!targetState) return;

                    const sourcePos = new THREE.Vector3(vals.x ?? 0, vals.y ?? 0, vals.z ?? 0);
                    const targetPos = new THREE.Vector3(
                      targetState.x ?? 0,
                      targetState.y ?? 0,
                      targetState.z ?? 0
                    );
                    const rot = computeAimRotation(sourcePos, targetPos, type);
                    if (!rot) return;

                    beginTransaction();
                    updateElement(selected, 'rx', rot.rx);
                    updateElement(selected, 'ry', rot.ry);
                    updateElement(selected, 'rz', rot.rz);
                    commitTransaction();
                    setVals(v => ({ ...v, rx: rot.rx, ry: rot.ry, rz: rot.rz }));

                    // Reset the dropdown back to placeholder
                    e.target.value = '';
                  }}
                >
                  <option value="" disabled>Pick target…</option>
                  <option value="camera">Camera</option>
                  {Object.entries(sceneState.elements)
                    .filter(([id, st]) => id !== selected && !st.locked)
                    .map(([id, st]) => (
                      <option key={id} value={id}>
                        {LABEL_BY_TYPE[st.type] ?? id}
                      </option>
                    ))}
                </AimSelect>
              </AimRow>
            )}
            {SHADOW_CASTING_TYPES.includes(type) && (
              <CheckboxRow>
                Cast shadow
                <Checkbox
                  checked={vals.castShadow !== false}
                  onChange={(e) => {
                    const v = e.target.checked;
                    updateElement(selected, 'castShadow', v);
                    setVals(prev => ({ ...prev, castShadow: v }));
                  }}
                />
              </CheckboxRow>
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