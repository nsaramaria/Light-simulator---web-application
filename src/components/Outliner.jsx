import React, { useEffect, useReducer, useState } from 'react';
import styled from 'styled-components';
import { sceneState, onSceneChange, updateElement } from '../scene/sharedScene';
import { colors } from '../styles/theme';

const LABEL_BY_TYPE = { 'point-light': 'Point Light', 'spot-light': 'Focused Light', 'directional-light': 'Directional Light', 'area-light': 'Softbox', 'hemisphere-light': 'Environment Light', 'product-cube': 'Product Cube', 'cyclorama': 'Cyclorama', 'imported-model': 'Imported Model' };
const LIGHT_TYPES = new Set(['point-light', 'spot-light', 'directional-light', 'area-light', 'hemisphere-light']);
const PRODUCT_TYPES = new Set(['product-cube', 'cyclorama', 'imported-model']);
const FILTERS = [{ key: 'all', label: 'All' }, { key: 'lights', label: 'Lights' }, { key: 'products', label: 'Set' }];

const EyeOpenIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeClosedIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><path d="M14.12 14.12A3 3 0 1 1 9.88 9.88" /><line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const I = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', viewBox: '0 0 24 24' };
const IconVideo = () => (<svg {...I}><path d="m23 7-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>);
const IconSun = () => (<svg {...I}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>);
const IconBulb = () => (<svg {...I}><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V18h6v-1.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z" /></svg>);
const IconRect = () => (<svg {...I}><rect x="7" y="3" width="10" height="18" rx="2" /></svg>);
const IconBox = () => (<svg {...I}><path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><path d="m3.3 7 8.7 5 8.7-5M12 22V12" /></svg>);
const IconFrame = () => (<svg {...I}><line x1="22" y1="6" x2="2" y2="6" /><line x1="22" y1="18" x2="2" y2="18" /><line x1="6" y1="2" x2="6" y2="22" /><line x1="18" y1="2" x2="18" y2="22" /></svg>);
const IconGlobe = () => (<svg {...I}><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" /></svg>);

const TYPE_SVG = {
  'point-light': IconBulb,
  'spot-light': IconSun,
  'directional-light': IconSun,
  'area-light': IconRect,
  'hemisphere-light': IconGlobe,
  'product-cube': IconBox,
  'cyclorama': IconFrame,
  'imported-model': IconBox,
};
const iconFor = (type) => { const C = TYPE_SVG[type] || IconBox; return <C />; };


const Sidebar = styled.div`
  width: ${({ $collapsed, $embedded }) => $embedded ? '100%' : $collapsed ? '24px' : '220px'};
  flex-shrink: 0;
  height: 100%;
  background: ${({ $embedded }) => $embedded ? 'transparent' : colors.surfaceDark};
  border-right: ${({ $embedded }) => $embedded ? 'none' : `1px solid ${colors.border}`};
  display: flex;
  flex-direction: column;
  overflow: ${({ $embedded }) => $embedded ? 'visible' : 'hidden'};
`;

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 10px;
`;

const Title = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${colors.ink};
`;

const CollapseBtn = styled.button`
  background: transparent;
  border: none;
  color: ${colors.mut};
  font-size: 16px;
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 8px;
  &:hover { background: ${colors.periTint}; color: ${colors.peri}; }
`;

const CollapsedLabel = styled.div`
  writing-mode: vertical-rl;
  text-orientation: mixed;
  font-size: 12px;
  letter-spacing: 0.08em;
  color: ${colors.mut};
  padding: 10px 0;
  cursor: pointer;
  text-align: center;
`;

const Filters = styled.div`
  display: flex;
  gap: 7px;
  padding: 0 16px 12px;
`;

const PinnedZone = styled.div`
  padding: 0 10px 4px;
`;

const Chip = styled.button`
  flex: 1;
  font-size: 12px;
  font-weight: 600;
  padding: 8px;
  border-radius: 999px;
  cursor: pointer;
  border: none;
  transition: .14s;
  background: ${({ $active, $tone }) => !$active ? '#F1F3FC' : $tone === 'lights' ? colors.yellow : $tone === 'products' ? colors.purple : colors.peri};
  color: ${({ $active, $tone }) => !$active ? colors.mut : $tone === 'lights' ? '#5a4408' : $tone === 'products' ? '#46285e' : '#fff'};
  &:hover { background: ${({ $active, $tone }) => $active ? ($tone === 'lights' ? colors.yellow : $tone === 'products' ? colors.purple : colors.peri) : '#E8EBFA'}; }
`;

const List = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 10px 10px;
  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-thumb { background: ${colors.scrollThumb}; border-radius: 999px; }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 14px;
  cursor: pointer;
  user-select: none;
  transition: .12s;
  background: ${({ $primary, $sel }) => ($primary || $sel) ? colors.periTint : 'transparent'};
  opacity: ${({ $hidden }) => $hidden ? 0.45 : 1};
  &:hover { background: ${({ $primary, $sel }) => ($primary || $sel) ? colors.periTint : '#F4F6FD'}; }
`;

const RowIcon = styled.span`
  width: 30px;
  height: 30px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${({ $light, $sel }) => $sel ? ($light ? colors.yellow : colors.peri) : ($light ? colors.yellowSoft : '#F1F3FC')};
  color: ${({ $light, $sel }) => $sel ? ($light ? '#5a4408' : '#fff') : ($light ? '#b58a14' : colors.ink2)};
  svg { width: 15px; height: 15px; }
`;

const RowName = styled.span`
  flex: 1;
  font-size: 13.5px;
  font-weight: 500;
  color: ${colors.ink};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RowBtn = styled.button`
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: transparent;
  border: none;
  color: ${({ $active }) => $active ? colors.peri : '#9aa0bc'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: .12s;
  &:hover { color: ${colors.ink2}; background: #E8EBFA; }
  svg { width: 14px; height: 14px; }
`;

const Empty = styled.div`
  font-size: 12.5px;
  color: ${colors.mut};
  padding: 14px 16px;
  line-height: 1.5;
`;

const selectExternal = (id) => window.dispatchEvent(new CustomEvent('studio:select', { detail: id }));
const selectSet = (ids) => window.dispatchEvent(new CustomEvent('studio:select-set', { detail: { ids } }));

export default function Outliner({ embedded = false }) {
  const [, force] = useReducer(x => x + 1, 0);
  const [filter, setFilter] = useState('all');
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const off = onSceneChange(force);
    const onSel = () => force();
    window.addEventListener('studio:selection-changed', onSel);
    return () => { off(); window.removeEventListener('studio:selection-changed', onSel); };
  }, []);

  const toggleCollapse = (val) => { setCollapsed(val); requestAnimationFrame(() => window.dispatchEvent(new Event('resize'))); };

  const onRowClick = (e, id) => {
    if (e.shiftKey) {
      const cur = (sceneState.selectedIds || []).filter(x => x !== 'camera');
      selectSet(cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id]);
    } else {
      selectExternal(id);
    }
  };

  if (collapsed && !embedded) return (
    <Sidebar $collapsed>
      <Head style={{ justifyContent: 'center', padding: '8px 0' }}>
        <CollapseBtn onClick={() => toggleCollapse(false)} title="Expand">›</CollapseBtn>
      </Head>
      <CollapsedLabel onClick={() => toggleCollapse(false)}>Outliner</CollapsedLabel>
    </Sidebar>
  );

  const entries = Object.entries(sceneState.elements);
  const items = entries.map(([id, st]) => ({
    id,
    type: st.type,
    base: st.type === 'imported-model' ? (st.fileName || 'Imported Model') : (LABEL_BY_TYPE[st.type] || st.type),
    hidden: !!st.hidden,
    locked: !!st.locked,
  }));
  const totals = {};
  items.forEach(it => { totals[it.base] = (totals[it.base] || 0) + 1; });
  const running = {};
  items.forEach(it => { running[it.base] = (running[it.base] || 0) + 1; it.name = totals[it.base] > 1 ? `${it.base} ${running[it.base]}` : it.base; });

  const visible = items.filter(it =>
    filter === 'all' ? true : filter === 'lights' ? LIGHT_TYPES.has(it.type) : PRODUCT_TYPES.has(it.type)
  );

  const selIds = sceneState.selectedIds || [];
  const primary = sceneState.selected;

  return (
    <Sidebar $collapsed={false} $embedded={embedded}>
      <Head>
        <Title>Outliner</Title>
        {!embedded && <CollapseBtn onClick={() => toggleCollapse(true)} title="Collapse">‹</CollapseBtn>}
      </Head>
      <PinnedZone>
        <Row $primary={primary === 'camera'} $sel={false} onClick={() => selectExternal('camera')}>
          <RowIcon $sel={primary === 'camera'}><IconVideo /></RowIcon>
          <RowName>Camera</RowName>
        </Row>
      </PinnedZone>
      <Filters>
        {FILTERS.map(f => (
          <Chip key={f.key} $active={filter === f.key} $tone={f.key} onClick={() => setFilter(f.key)}>{f.label}</Chip>
        ))}
      </Filters>
      <List>
        {visible.length === 0 && <Empty>No {filter === 'all' ? 'elements' : filter} in the scene.</Empty>}
        {visible.map(it => (
          <Row
            key={it.id}
            $primary={primary === it.id}
            $sel={selIds.includes(it.id)}
            $hidden={it.hidden}
            onClick={(e) => onRowClick(e, it.id)}
          >
            <RowIcon $light={LIGHT_TYPES.has(it.type)} $sel={primary === it.id || selIds.includes(it.id)}>{iconFor(it.type)}</RowIcon>
            <RowName>{it.name}</RowName>
            <RowBtn
              $active={it.hidden}
              title={it.hidden ? 'Show' : 'Hide'}
              onClick={(e) => { e.stopPropagation(); updateElement(it.id, 'hidden', !it.hidden); }}
            >
              {it.hidden ? <EyeClosedIcon /> : <EyeOpenIcon />}
            </RowBtn>
          </Row>
        ))}
      </List>
    </Sidebar>
  );
}
