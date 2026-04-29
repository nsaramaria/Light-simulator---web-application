import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { colors, shadows } from '../styles/theme';

const Wrapper = styled.div`
  position: relative;
`;

const AddBtn = styled.button`
  background: ${({ $open }) => $open ? colors.accentSubtle : 'transparent'};
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

const DropdownWrap = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 200;
  display: flex;
  flex-direction: column;
  width: 260px;
  background: ${colors.surfaceOverlay};
  border: 1px solid ${colors.borderStrong};
  border-radius: 10px;
  overflow: hidden;
  box-shadow: ${shadows.dropdown};
`;

const SearchRow = styled.div`
  padding: 8px 10px;
  border-bottom: 1px solid ${colors.border};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SearchIcon = styled.span`
  font-size: 13px;
  color: ${colors.textDim};
`;

const SearchInput = styled.input`
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-size: 12px;
  color: ${colors.text};
  font-family: inherit;

  &::placeholder {
    color: ${colors.placeholder};
  }
`;

const MenuBody = styled.div`
  display: flex;
  max-height: 320px;
`;

const CatList = styled.div`
  width: 100px;
  border-right: 1px solid ${colors.border};
  flex-shrink: 0;
`;

const CatItem = styled.div`
  padding: 8px 10px;
  font-size: 12px;
  color: ${({ $active }) => $active ? colors.accent : colors.text};
  background: ${({ $active }) => $active ? colors.accentFaint : 'transparent'};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.1s;

  &:hover {
    background: ${colors.surfaceHover};
    color: ${colors.accent};
  }

  & + & {
    border-top: 1px solid ${colors.borderSubtle};
  }
`;

const CatIcon = styled.div`
  width: 10px;
  height: 10px;
  flex-shrink: 0;
  border-radius: ${({ $round }) => $round ? '50%' : '2px'};
  background: ${({ $color }) => $color};
`;

const ItemList = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const ItemHeader = styled.div`
  padding: 6px 10px;
  font-size: 9px;
  font-weight: 600;
  color: ${colors.textDim};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 1px solid ${colors.borderLight};
`;

const Item = styled.div`
  padding: 8px 10px;
  font-size: 12px;
  color: ${colors.text};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.1s;

  &:hover {
    background: ${colors.accentFaint};
    color: ${colors.accent};
  }

  & + & {
    border-top: 1px solid ${colors.borderSubtle};
  }
`;

const ItemIcon = styled.div`
  width: 10px;
  height: 10px;
  flex-shrink: 0;
  border-radius: ${({ $round }) => $round ? '50%' : '2px'};
  background: ${({ $color }) => $color};
`;

const ItemLabel = styled.span`
  flex: 1;
  min-width: 0;
`;

const InfoIconWrap = styled.div`
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 9px;
  font-weight: 700;
  color: ${colors.textDim};
  border: 1px solid ${colors.textDim};
  cursor: default;
  transition: all 0.15s;

  &:hover {
    color: ${colors.accent};
    border-color: ${colors.accent};
  }
`;

const InfoIcon = ({ text }) => (
  <InfoIconWrap title={text} onClick={(e) => e.stopPropagation()}>
    i
  </InfoIconWrap>
);

const SearchResults = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
`;

const SearchResultItem = styled.div`
  padding: 8px 12px;
  font-size: 12px;
  color: ${colors.text};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: background 0.1s;

  &:hover {
    background: ${colors.accentFaint};
    color: ${colors.accent};
  }

  & + & {
    border-top: 1px solid ${colors.borderSubtle};
  }
`;

const SearchResultCat = styled.span`
  font-size: 9px;
  color: ${colors.textDim};
  margin-left: auto;
`;

const NoResults = styled.div`
  padding: 20px;
  text-align: center;
  font-size: 11px;
  color: ${colors.textDim};
`;

const DESCRIPTIONS = {
  'point-light':      'Emits light in all directions, like a bare studio strobe without modifiers',
  'spot-light':       'Projects a concentrated cone beam, ideal for highlighting specific areas',
  'area-light':       'Rectangular diffused light source, produces soft even illumination',
  'hemisphere-light': 'Simulates ambient room lighting with separate sky and ground tones',
  'flag':             'Black panel that blocks light, used to create shadows and control spill',
  'reflector':        'Bounces light back onto the subject to fill shadows',
  'diffuser':         'Translucent panel that softens light passing through it',
  'v-flat':           'Large foldable board, black side absorbs light, white side bounces it',
  'backdrop':         'Seamless background paper or fabric behind the subject',
  'table':            'Surface for placing and photographing products',
  'pedestal':         'Raised platform to elevate the product',
  'cyclorama':        'Seamless corner wall with curved floor transition for clean backgrounds',
  'product-cube':     'Simple cube to represent the product being photographed',
};

const CATEGORIES = [
  {
    id: 'lights',
    label: 'Lights',
    iconColor: colors.lightIcon,
    iconRound: true,
    items: [
      { id: 'point-light',       label: 'Point Light',       iconColor: colors.white,       iconRound: true },
      { id: 'spot-light',        label: 'Focused Light',     iconColor: '#ffdd44',          iconRound: true },
      { id: 'area-light',        label: 'Softbox',           iconColor: '#44aaff',          iconRound: false },
      { id: 'hemisphere-light',  label: 'Environment Light', iconColor: '#87ceeb',          iconRound: true },
    ],
  },
  {
    id: 'grip',
    label: 'Grip',
    iconColor: colors.textMuted,
    iconRound: false,
    items: [
      { id: 'flag',      label: 'Flag',      iconColor: '#1a1a1a', iconRound: false },
      { id: 'reflector',  label: 'Reflector',  iconColor: '#e0e0e0', iconRound: false },
      { id: 'diffuser',   label: 'Diffuser',   iconColor: '#f5f0e8', iconRound: false },
      { id: 'v-flat',     label: 'V-Flat',     iconColor: '#555555', iconRound: false },
    ],
  },
  {
    id: 'set',
    label: 'Set',
    iconColor: '#8b7d6b',
    iconRound: false,
    items: [
      { id: 'backdrop',   label: 'Backdrop',   iconColor: '#8b7d6b', iconRound: false },
      { id: 'cyclorama',  label: 'Cyclorama',  iconColor: '#f0f0f0', iconRound: false },
      { id: 'table',      label: 'Table',      iconColor: '#6b5d4b', iconRound: false },
      { id: 'pedestal',   label: 'Pedestal',   iconColor: '#7b6d5b', iconRound: false },
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

const ALL_ITEMS = CATEGORIES.flatMap(cat =>
  cat.items.map(item => ({ ...item, catLabel: cat.label }))
);

export default function AddMenu({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [activeCat, setActiveCat] = useState('lights');
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
    else setSearch('');
  }, [open]);

  const handleAdd = (itemId) => { onAdd(itemId); setOpen(false); setSearch(''); };

  const currentCat = CATEGORIES.find(c => c.id === activeCat);
  const isSearching = search.trim().length > 0;

  const searchResults = isSearching
    ? ALL_ITEMS.filter(item =>
        item.label.toLowerCase().includes(search.toLowerCase()) ||
        item.catLabel.toLowerCase().includes(search.toLowerCase()) ||
        (DESCRIPTIONS[item.id] || '').toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <Wrapper ref={wrapperRef}>
      <AddBtn $open={open} onClick={() => setOpen(v => !v)}>+ Add</AddBtn>

      {open && (
        <DropdownWrap>
          <SearchRow>
            <SearchIcon>⌕</SearchIcon>
            <SearchInput ref={searchRef} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search objects..." />
          </SearchRow>

          {isSearching ? (
            <SearchResults>
              {searchResults.length === 0 && <NoResults>No objects matching "{search}"</NoResults>}
              {searchResults.map(item => (
                <SearchResultItem key={item.id} onClick={() => handleAdd(item.id)}>
                  <ItemIcon $color={item.iconColor} $round={item.iconRound} />
                  <ItemLabel>{item.label}</ItemLabel>
                  <SearchResultCat>{item.catLabel}</SearchResultCat>
                </SearchResultItem>
              ))}
            </SearchResults>
          ) : (
            <MenuBody>
              <CatList>
                {CATEGORIES.map(cat => (
                  <CatItem key={cat.id} $active={activeCat === cat.id} onMouseEnter={() => setActiveCat(cat.id)}>
                    <CatIcon $color={cat.iconColor} $round={cat.iconRound} />
                    {cat.label}
                  </CatItem>
                ))}
              </CatList>
              <ItemList>
                {currentCat && (
                  <>
                    <ItemHeader>{currentCat.label}</ItemHeader>
                    {currentCat.items.map(item => (
                      <Item key={item.id} onClick={() => handleAdd(item.id)}>
                        <ItemIcon $color={item.iconColor} $round={item.iconRound} />
                        <ItemLabel>{item.label}</ItemLabel>
                        {DESCRIPTIONS[item.id] && <InfoIcon text={DESCRIPTIONS[item.id]} />}
                      </Item>
                    ))}
                  </>
                )}
              </ItemList>
            </MenuBody>
          )}
        </DropdownWrap>
      )}
    </Wrapper>
  );
}
