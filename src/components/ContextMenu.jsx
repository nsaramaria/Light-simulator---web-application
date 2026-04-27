import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { colors } from '../styles/theme';

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
  min-width: 160px;
  background: rgba(12,11,9,0.97);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  overflow: hidden;
  z-index: 501;
  backdrop-filter: blur(16px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04);
`;

const MenuHeader = styled.div`
  padding: 8px 12px;
  font-size: 9px;
  font-weight: 600;
  color: ${colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  display: flex;
  align-items: center;
  gap: 6px;
`;

const HeaderIcon = styled.span`
  font-size: 12px;
  color: ${colors.accent};
`;

const MenuItem = styled.div`
  padding: 8px 12px;
  font-size: 12px;
  color: ${({ $danger }) => $danger ? '#C75450' : colors.text};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: background 0.1s;

  &:hover {
    background: ${({ $danger }) => $danger ? 'rgba(199,84,80,0.08)' : 'rgba(232,168,85,0.06)'};
    color: ${({ $danger }) => $danger ? '#C75450' : colors.accent};
  }

  & + & {
    border-top: 1px solid rgba(255,255,255,0.04);
  }
`;

const MenuItemIcon = styled.span`
  font-size: 13px;
  width: 18px;
  text-align: center;
  flex-shrink: 0;
`;

const MenuItemLabel = styled.span`
  flex: 1;
`;

const MenuItemShortcut = styled.span`
  font-size: 9px;
  color: rgba(255,255,255,0.15);
  font-family: 'JetBrains Mono', monospace;
`;

const DisabledItem = styled.div`
  padding: 8px 12px;
  font-size: 12px;
  color: rgba(255,255,255,0.15);
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LABEL_BY_TYPE = {
  'point-light':      'Point Light',
  'spot-light':       'Focused Light',
  'area-light':       'Softbox',
  'hemisphere-light': 'Environment Light',
  'product-cube':     'Product Cube',
  'cyclorama':        'Cyclorama',
  camera:             'Camera',
};

const ICON_BY_TYPE = {
  'point-light':      '☀',
  'spot-light':       '◐',
  'area-light':       '▬',
  'hemisphere-light': '◑',
  'product-cube':     '■',
  'cyclorama':        '⌐',
  camera:             '◎',
};

export default function ContextMenu() {
  const [state, setState] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const onOpen = (e) => {
      const { id, type, x, y } = e.detail;
      setState({ id, type, x, y });
    };
    const onClose = () => setState(null);

    window.addEventListener('studio:context-menu', onOpen);
    window.addEventListener('studio:context-menu-close', onClose);
    return () => {
      window.removeEventListener('studio:context-menu', onOpen);
      window.removeEventListener('studio:context-menu-close', onClose);
    };
  }, []);

  useEffect(() => {
    if (!state) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setState(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state]);

  if (!state) return null;

  const label = LABEL_BY_TYPE[state.type] ?? state.id;
  const icon = ICON_BY_TYPE[state.type] ?? '○';
  const isCamera = state.id === 'camera';

  const handleDelete = () => {
    window.dispatchEvent(new CustomEvent('studio:delete-element', { detail: state.id }));
    setState(null);
  };

  const handleSelect = () => {
    window.dispatchEvent(new CustomEvent('studio:select', { detail: state.id }));
    setState(null);
  };

  return (
    <>
      <Overlay onClick={() => setState(null)} onContextMenu={(e) => { e.preventDefault(); setState(null); }} />
      <Menu ref={menuRef} $x={state.x} $y={state.y}>
        <MenuHeader>
          <HeaderIcon>{icon}</HeaderIcon>
          {label}
        </MenuHeader>
        <MenuItem onClick={handleSelect}>
          <MenuItemIcon>◎</MenuItemIcon>
          <MenuItemLabel>Select</MenuItemLabel>
        </MenuItem>
        {!isCamera && (
          <MenuItem $danger onClick={handleDelete}>
            <MenuItemIcon>✕</MenuItemIcon>
            <MenuItemLabel>Delete</MenuItemLabel>
            <MenuItemShortcut>Del</MenuItemShortcut>
          </MenuItem>
        )}
        {isCamera && (
          <DisabledItem>
            <MenuItemIcon>—</MenuItemIcon>
            <MenuItemLabel>No actions</MenuItemLabel>
          </DisabledItem>
        )}
      </Menu>
    </>
  );
}
