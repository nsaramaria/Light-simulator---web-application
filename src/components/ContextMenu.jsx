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
  min-width: 140px;
  background: ${colors.surfaceDark};
  border: 1px solid ${colors.border};
  border-radius: 6px;
  overflow: hidden;
  z-index: 501;
`;

const MenuHeader = styled.div`
  padding: 5px 12px;
  font-size: 9px;
  font-weight: 600;
  color: ${colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.6px;
  border-bottom: 1px solid ${colors.border};
`;

const MenuItem = styled.div`
  padding: 8px 12px;
  font-size: 13px;
  color: ${({ $danger }) => $danger ? '#e05a4e' : colors.text};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.1s;

  &:hover {
    background: ${colors.border};
    color: ${({ $danger }) => $danger ? '#ff6b5e' : colors.accent};
  }

  & + & {
    border-top: 1px solid ${colors.border};
  }
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
  const isCamera = state.id === 'camera';

  const handleDelete = () => {
    window.dispatchEvent(new CustomEvent('studio:delete-element', { detail: state.id }));
    setState(null);
  };

  return (
    <>
      <Overlay onClick={() => setState(null)} onContextMenu={(e) => { e.preventDefault(); setState(null); }} />
      <Menu ref={menuRef} $x={state.x} $y={state.y}>
        <MenuHeader>{label}</MenuHeader>
        {!isCamera && (
          <MenuItem $danger onClick={handleDelete}>Delete</MenuItem>
        )}
        {isCamera && (
          <MenuItem style={{ color: colors.textMuted, cursor: 'default' }}>No actions</MenuItem>
        )}
      </Menu>
    </>
  );
}