import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { colors } from '../styles/theme';

const Wrapper = styled.div`
  position: relative;
`;

const AddBtn = styled.button`
  background: ${({ $open }) => $open ? 'rgba(212, 165, 116, 0.08)' : 'transparent'};
  border: 1px solid ${({ $open }) => $open ? colors.accent : colors.border};
  color: ${({ $open }) => $open ? colors.accent : colors.text};
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    border-color: ${colors.accent};
    color: ${colors.accent};
  }
`;

const MenuWrap = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  display: flex;
  gap: 4px;
  z-index: 200;
`;

const Dropdown = styled.div`
  width: 160px;
  background: ${colors.surfaceDark};
  border: 1px solid ${colors.border};
  border-radius: 6px;
  overflow: hidden;
`;

const CatItem = styled.div`
  padding: 8px 12px;
  font-size: 13px;
  color: ${({ $active }) => $active ? colors.accent : colors.text};
  background: ${({ $active }) => $active ? colors.border : 'transparent'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background 0.1s;

  &:hover {
    background: ${colors.border};
    color: ${colors.accent};
  }

  & + & {
    border-top: 1px solid ${colors.border};
  }
`;

const CatIcon = styled.div`
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  margin-right: 8px;
  border-radius: ${({ $round }) => $round ? '50%' : '1px'};
  background: ${({ $color }) => $color};
`;

const CatArrow = styled.span`
  font-size: 10px;
  color: ${colors.textMuted};
`;

const Flyout = styled.div`
  width: 180px;
  background: ${colors.surfaceDark};
  border: 1px solid ${colors.border};
  border-radius: 6px;
  overflow: hidden;
  align-self: flex-start;
`;

const FlyoutHeader = styled.div`
  padding: 5px 12px;
  font-size: 9px;
  font-weight: 600;
  color: ${colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.6px;
  border-bottom: 1px solid ${colors.border};
`;

const FlyoutItem = styled.div`
  padding: 8px 12px;
  font-size: 13px;
  color: ${colors.text};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.1s;

  &:hover {
    background: ${colors.border};
    color: ${colors.accent};
  }

  & + & {
    border-top: 1px solid ${colors.border};
  }
`;

const ItemIcon = styled.div`
  width: 11px;
  height: 11px;
  flex-shrink: 0;
  border-radius: ${({ $round }) => $round ? '50%' : '1px'};
  background: ${({ $color }) => $color};
`;

// Category definitions
const CATEGORIES = [
  {
    id: 'lights',
    label: 'Lights',
    iconColor: colors.lightIcon,
    iconRound: true,
    items: [
      { id: 'point-light',       label: 'Point Light',       iconColor: '#ffffff',  iconRound: true },
      { id: 'spot-light',        label: 'Spot Light',        iconColor: '#ffdd44',  iconRound: true },
      { id: 'directional-light', label: 'Directional Light', iconColor: '#ffaa00',  iconRound: true },
      { id: 'area-light',        label: 'Area Light',        iconColor: '#44aaff',  iconRound: false },
      { id: 'hemisphere-light',  label: 'Hemisphere Light',  iconColor: '#87ceeb',  iconRound: true },
    ],
  },
  {
    id: 'props',
    label: 'Props',
    iconColor: colors.productIcon,
    iconRound: false,
    items: [
      { id: 'product-cube', label: 'Product Cube', iconColor: colors.productIcon, iconRound: false },
    ],
  },
];

export default function AddMenu({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [activeCat, setActiveCat] = useState('lights');
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleAdd = (itemId) => {
    onAdd(itemId);
    setOpen(false);
  };

  const currentCat = CATEGORIES.find(c => c.id === activeCat);

  return (
    <Wrapper ref={wrapperRef}>
      <AddBtn $open={open} onClick={() => setOpen(v => !v)}>+ Add</AddBtn>

      {open && (
        <MenuWrap>
          <Dropdown>
            {CATEGORIES.map(cat => (
              <CatItem
                key={cat.id}
                $active={activeCat === cat.id}
                onMouseEnter={() => setActiveCat(cat.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <CatIcon $color={cat.iconColor} $round={cat.iconRound} />
                  {cat.label}
                </div>
                <CatArrow>›</CatArrow>
              </CatItem>
            ))}
          </Dropdown>

          {currentCat && (
            <Flyout>
              <FlyoutHeader>{currentCat.label}</FlyoutHeader>
              {currentCat.items.map(item => (
                <FlyoutItem key={item.id} onClick={() => handleAdd(item.id)}>
                  <ItemIcon $color={item.iconColor} $round={item.iconRound} />
                  {item.label}
                </FlyoutItem>
              ))}
            </Flyout>
          )}
        </MenuWrap>
      )}
    </Wrapper>
  );
}