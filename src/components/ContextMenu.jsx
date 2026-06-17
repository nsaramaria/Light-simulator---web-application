import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { colors, shadows } from '../styles/theme';
import { sceneState } from '../scene/sharedScene';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 500;
`;

const Menu = styled.div`
  position: fixed;
  top: ${({ $y }) => $y}px;
  left: ${({ $x }) => $x}px;
  min-width: 178px;
  background: ${colors.surfaceOverlay};
  border-radius: 14px;
  overflow: hidden;
  z-index: 501;
  padding: 5px;
  box-shadow: ${shadows.menu};
`;

const MenuHeader = styled.div`
  padding: 8px 12px 9px;
  font-size: 10px;
  font-weight: 600;
  color: ${colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const HeaderIcon = styled.span`
  color: ${colors.accent};
  display: inline-flex;
  svg { width: 13px; height: 13px; }
`;

const MenuItem = styled.div`
  padding: 9px 11px;
  font-size: 12.5px;
  font-weight: 500;
  border-radius: 10px;
  color: ${({ $danger }) => $danger ? colors.danger : colors.text};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: background 0.1s;

  &:hover {
    background: ${({ $danger }) => $danger ? colors.dangerSoft : colors.accentFaint};
    color: ${({ $danger }) => $danger ? colors.danger : colors.accent};
  }
`;

const MenuItemIcon = styled.span`
  width: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${colors.textMuted};
  svg { width: 15px; height: 15px; }
  ${MenuItem}:hover & { color: inherit; }
`;

const MenuItemLabel = styled.span`
  flex: 1;
`;

const MenuItemShortcut = styled.span`
  font-size: 10px;
  color: ${colors.placeholderSubtle};
  font-variant-numeric: tabular-nums;
`;

const DisabledItem = styled.div`
  padding: 9px 11px;
  font-size: 12.5px;
  font-weight: 500;
  color: ${colors.placeholderSubtle};
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LABEL_BY_TYPE = { 'point-light': 'Point Light', 'spot-light': 'Focused Light', 'area-light': 'Softbox', 'hemisphere-light': 'Environment Light', 'product-cube': 'Product Cube', 'cyclorama': 'Cyclorama', 'imported-model': 'Imported Model', camera: 'Camera' };

const SI = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', viewBox: '0 0 24 24' };
const IconVideo = () => (<svg {...SI}><path d="m23 7-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>);
const IconSun = () => (<svg {...SI}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>);
const IconBulb = () => (<svg {...SI}><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V18h6v-1.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z" /></svg>);
const IconRect = () => (<svg {...SI}><rect x="7" y="3" width="10" height="18" rx="2" /></svg>);
const IconBox = () => (<svg {...SI}><path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><path d="m3.3 7 8.7 5 8.7-5M12 22V12" /></svg>);
const IconFrame = () => (<svg {...SI}><line x1="22" y1="6" x2="2" y2="6" /><line x1="22" y1="18" x2="2" y2="18" /><line x1="6" y1="2" x2="6" y2="22" /><line x1="18" y1="2" x2="18" y2="22" /></svg>);
const IconGlobe = () => (<svg {...SI}><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" /></svg>);
const IconPointer = () => (<svg {...SI}><path d="m3 3 7.07 17 2.51-7.39L20 10.07z" /></svg>);
const IconCopy = () => (<svg {...SI}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>);
const IconLockClosed = () => (<svg {...SI}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>);
const IconLockOpen = () => (<svg {...SI}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></svg>);
const IconTrash = () => (<svg {...SI}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>);
const IconBan = () => (<svg {...SI}><circle cx="12" cy="12" r="10" /><line x1="4.9" y1="4.9" x2="19.1" y2="19.1" /></svg>);

const TYPE_SVG = { 'point-light': IconBulb, 'spot-light': IconSun, 'directional-light': IconSun, 'area-light': IconRect, 'hemisphere-light': IconGlobe, 'product-cube': IconBox, 'cyclorama': IconFrame, 'imported-model': IconBox, camera: IconVideo };
const iconFor = (type) => { const C = TYPE_SVG[type] || IconBox; return <C />; };

export default function ContextMenu() {
  const [state, setState] = useState(null);

  useEffect(() => {
    const onOpen = (e) => { const { id, type, x, y } = e.detail; setState({ id, type, x, y }); };
    const onClose = () => setState(null);
    window.addEventListener('studio:context-menu', onOpen);
    window.addEventListener('studio:context-menu-close', onClose);
    return () => { window.removeEventListener('studio:context-menu', onOpen); window.removeEventListener('studio:context-menu-close', onClose); };
  }, []);

  useEffect(() => {
    if (!state) return;
    const onKey = (e) => { if (e.key === 'Escape') setState(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state]);

  if (!state) return null;

  const label = LABEL_BY_TYPE[state.type] ?? state.id;
  const isCamera = state.id === 'camera';
  const isLocked = !isCamera && !!sceneState.elements[state.id]?.locked;

  return (
    <>
      <Overlay onClick={() => setState(null)} onContextMenu={(e) => { e.preventDefault(); setState(null); }} />
      <Menu $x={state.x} $y={state.y}>
        <MenuHeader><HeaderIcon>{iconFor(state.type)}</HeaderIcon>{label}</MenuHeader>
        <MenuItem onClick={() => { window.dispatchEvent(new CustomEvent('studio:select', { detail: state.id })); setState(null); }}>
          <MenuItemIcon><IconPointer /></MenuItemIcon><MenuItemLabel>Select</MenuItemLabel>
        </MenuItem>
        {!isCamera && (
          <MenuItem onClick={() => { window.dispatchEvent(new CustomEvent('studio:duplicate-element', { detail: state.id })); setState(null); }}>
            <MenuItemIcon><IconCopy /></MenuItemIcon><MenuItemLabel>Duplicate</MenuItemLabel><MenuItemShortcut>Ctrl+D</MenuItemShortcut>
          </MenuItem>
        )}
        {!isCamera && (
          <MenuItem onClick={() => { window.dispatchEvent(new CustomEvent('studio:toggle-lock', { detail: state.id })); setState(null); }}>
            <MenuItemIcon>{isLocked ? <IconLockOpen /> : <IconLockClosed />}</MenuItemIcon><MenuItemLabel>{isLocked ? 'Unlock' : 'Lock'}</MenuItemLabel>
          </MenuItem>
        )}
        {!isCamera && !isLocked && (
          <MenuItem $danger onClick={() => { window.dispatchEvent(new CustomEvent('studio:delete-element', { detail: state.id })); setState(null); }}>
            <MenuItemIcon><IconTrash /></MenuItemIcon><MenuItemLabel>Delete</MenuItemLabel><MenuItemShortcut>Del</MenuItemShortcut>
          </MenuItem>
        )}
        {isCamera && <DisabledItem><MenuItemIcon><IconBan /></MenuItemIcon><MenuItemLabel>No actions</MenuItemLabel></DisabledItem>}
      </Menu>
    </>
  );
}