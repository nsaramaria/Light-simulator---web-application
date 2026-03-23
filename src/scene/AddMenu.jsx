import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  position: relative;
`;

const AddBtn = styled.button`
  background: ${({ $open }) => $open ? 'rgba(212, 165, 116, 0.08)' : 'transparent'};
  border: 1px solid ${({ $open }) => $open ? '#d4a574' : '#3d3530'};
  color: ${({ $open }) => $open ? '#d4a574' : '#e8dfd6'};
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    border-color: #d4a574;
    color: #d4a574;
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
  background: #252019;
  border: 1px solid #3d3530;
  border-radius: 6px;
  overflow: hidden;
`;

const CatItem = styled.div`
  padding: 8px 12px;
  font-size: 13px;
  color: ${({ $active }) => $active ? '#d4a574' : '#e8dfd6'};
  background: ${({ $active }) => $active ? '#3d3530' : 'transparent'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background 0.1s;

  &:hover {
    background: #3d3530;
    color: #d4a574;
  }

  & + & {
    border-top: 1px solid #3d3530;
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
  color: #9b8a7a;
`;

const Flyout = styled.div`
  width: 160px;
  background: #252019;
  border: 1px solid #3d3530;
  border-radius: 6px;
  overflow: hidden;
  align-self: flex-start;
`;

const FlyoutHeader = styled.div`
  padding: 5px 12px;
  font-size: 9px;
  font-weight: 600;
  color: #9b8a7a;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  border-bottom: 1px solid #3d3530;
`;

const FlyoutItem = styled.div`
  padding: 8px 12px;
  font-size: 13px;
  color: #e8dfd6;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.1s;

  &:hover {
    background: #3d3530;
    color: #d4a574;
  }

  & + & {
    border-top: 1px solid #3d3530;
  }
`;

const ItemIcon = styled.div`
  width: 11px;
  height: 11px;
  flex-shrink: 0;
  border-radius: ${({ $round }) => $round ? '50%' : '1px'};
  background: ${({ $color }) => $color};
`;

// Category definitions , add new categories and items here
const CATEGORIES = [
  {
    id: 'lights',
    label: 'Lights',
    iconColor: '#d4a574',
    iconRound: true,
    items: [
      { id: 'point-light', label: 'Point Light', iconColor: '#d4a574', iconRound: true },
    ],
  },
  {
    id: 'props',
    label: 'Props',
    iconColor: '#d4a5a5',
    iconRound: false,
    items: [
      { id: 'product-cube', label: 'Product Cube', iconColor: '#d4a5a5', iconRound: false },
    ],
  },
];

export default function AddMenu({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [activeCat, setActiveCat] = useState('lights');
  const wrapperRef = useRef(null);

  // Close menu when clicking outside
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
          {/* Main category list */}
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

          {/* Flyout for active category */}
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