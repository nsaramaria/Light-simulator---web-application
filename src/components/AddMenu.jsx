import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { colors, shadows, alpha } from '../styles/theme';

const Wrapper = styled.div`
  position: relative;
`;

const AddBtn = styled.button`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: ${colors.ink};
  color: #fff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  line-height: 1;
  cursor: pointer;
  flex-shrink: 0;
  box-shadow: 0 3px 0 #050509;
  transition: transform .1s, box-shadow .1s;
  &:active { transform: translateY(3px); box-shadow: 0 0 0 #050509; }
`;

const DropdownWrap = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 200;
  display: flex;
  flex-direction: column;
  width: 280px;
  background: ${colors.surfaceOverlay};
  border-radius: 16px;
  overflow: hidden;
  box-shadow: ${shadows.dropdown};
`;

const SearchRow = styled.div`
  padding: 10px 12px;
  border-bottom: 1px solid ${colors.border};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SearchIcon = styled.span`
  color: ${colors.textDim};
  display: inline-flex;
  svg { width: 15px; height: 15px; }
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

const MenuList = styled.div`
  overflow-y: auto;
  max-height: 340px;
  padding: 4px 0 8px;
  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-thumb { background: ${colors.scrollThumb}; border-radius: 999px; }
`;

const ItemHeader = styled.div`
  padding: 10px 12px 4px;
  font-size: 10px;
  font-weight: 600;
  color: ${colors.textDim};
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const Item = styled.div`
  padding: 9px 11px;
  margin: 0 6px;
  border-radius: 10px;
  font-size: 12.5px;
  font-weight: 500;
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
`;

const ItemIcon = styled.div`
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  border-radius: ${({ $round }) => $round ? '50%' : '5px'};
  background: ${({ $color }) => $color};
  box-shadow: inset 0 0 0 1px rgba(0,0,0,.06);
`;

const ItemSvgIcon = styled.div`
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $color }) => $color || colors.textMuted};
`;

const ItemLabel = styled.span`
  flex: 1;
  min-width: 0;
`;

const ItemBadge = styled.span`
  font-size: 8px;
  font-weight: 600;
  color: ${colors.accent};
  background: ${colors.accentSubtle};
  padding: 1px 5px;
  border-radius: 3px;
  letter-spacing: 0.03em;
  flex-shrink: 0;
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
  padding: 9px 11px;
  margin: 0 6px;
  border-radius: 10px;
  font-size: 12.5px;
  font-weight: 500;
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

const ImportIcon = ({ type }) => {
  if (type === 'upload') return (
    <ItemSvgIcon $color={colors.accent}>
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 10v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-3" />
        <polyline points="5 5 8 2 11 5" />
        <line x1="8" y1="2" x2="8" y2="10" />
      </svg>
    </ItemSvgIcon>
  );
  if (type === 'generate') return (
    <ItemSvgIcon $color="#B48EDB">
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="8 1 10 6 15 6 11 9.5 12.5 15 8 11.5 3.5 15 5 9.5 1 6 6 6" />
      </svg>
    </ItemSvgIcon>
  );
  if (type === 'scan') return (
    <ItemSvgIcon $color="#5AAD5A">
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 4V2a1 1 0 0 1 1-1h3" />
        <path d="M11 1h3a1 1 0 0 1 1 1v2" />
        <path d="M15 12v2a1 1 0 0 1-1 1h-3" />
        <path d="M5 15H2a1 1 0 0 1-1-1v-2" />
        <circle cx="8" cy="8" r="3" />
      </svg>
    </ItemSvgIcon>
  );
  return null;
};

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
  'import-upload':    'Upload a .glb, .gltf, .obj, or .fbx file from your device',
  'import-generate':  'Take or upload a photo and AI generates a 3D model from it',
  'import-scan':      'Scan a real object with your phone using multiple photos',
};

const CATEGORIES = [
  {
    id: 'import',
    label: 'Import',
    iconColor: colors.accent,
    iconRound: false,
    isImport: true,
    items: [
      { id: 'import-upload',   label: 'Upload 3D Model',    importType: 'upload' },
      { id: 'import-generate', label: 'Generate from Photo', importType: 'generate', badge: 'AI' },
      { id: 'import-scan',     label: 'Scan Object',         importType: 'scan' },
    ],
  },
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
  cat.items.map(item => ({ ...item, catId: cat.id, catLabel: cat.label }))
);

export default function AddMenu({ onAdd }) {
  const [open, setOpen] = useState(false);
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

  const isSearching = search.trim().length > 0;

  const searchResults = isSearching
    ? ALL_ITEMS.filter(item =>
        item.label.toLowerCase().includes(search.toLowerCase()) ||
        item.catLabel.toLowerCase().includes(search.toLowerCase()) ||
        (DESCRIPTIONS[item.id] || '').toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const renderItem = (item) => {
    if (item.importType) {
      return (
        <Item key={item.id} onClick={() => handleAdd(item.id)}>
          <ImportIcon type={item.importType} />
          <ItemLabel>{item.label}</ItemLabel>
          {item.badge && <ItemBadge>{item.badge}</ItemBadge>}
          {DESCRIPTIONS[item.id] && <InfoIcon text={DESCRIPTIONS[item.id]} />}
        </Item>
      );
    }
    return (
      <Item key={item.id} onClick={() => handleAdd(item.id)}>
        <ItemIcon $color={item.iconColor} $round={item.iconRound} />
        <ItemLabel>{item.label}</ItemLabel>
        {DESCRIPTIONS[item.id] && <InfoIcon text={DESCRIPTIONS[item.id]} />}
      </Item>
    );
  };

  const renderSearchItem = (item) => {
    if (item.importType) {
      return (
        <SearchResultItem key={item.id} onClick={() => handleAdd(item.id)}>
          <ImportIcon type={item.importType} />
          <ItemLabel>{item.label}</ItemLabel>
          {item.badge && <ItemBadge>{item.badge}</ItemBadge>}
          <SearchResultCat>{item.catLabel}</SearchResultCat>
        </SearchResultItem>
      );
    }
    return (
      <SearchResultItem key={item.id} onClick={() => handleAdd(item.id)}>
        <ItemIcon $color={item.iconColor} $round={item.iconRound} />
        <ItemLabel>{item.label}</ItemLabel>
        <SearchResultCat>{item.catLabel}</SearchResultCat>
      </SearchResultItem>
    );
  };

  return (
    <Wrapper ref={wrapperRef}>
      <AddBtn $open={open} onClick={() => setOpen(v => !v)} title="Add element">+</AddBtn>

      {open && (
        <DropdownWrap>
          <SearchRow>
            <SearchIcon><svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg></SearchIcon>
            <SearchInput ref={searchRef} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search objects..." />
          </SearchRow>

          {isSearching ? (
            <SearchResults>
              {searchResults.length === 0 && <NoResults>No objects matching "{search}"</NoResults>}
              {searchResults.map(renderSearchItem)}
            </SearchResults>
          ) : (
            <MenuList>
              {CATEGORIES.map(cat => (
                <div key={cat.id}>
                  <ItemHeader>{cat.label}</ItemHeader>
                  {cat.items.map(renderItem)}
                </div>
              ))}
            </MenuList>
          )}
        </DropdownWrap>
      )}
    </Wrapper>
  );
}