import React, { useEffect, useReducer, useState } from 'react';
import styled from 'styled-components';
import { sceneState, onSceneChange, toggleLock, updateElement } from '../scene/sharedScene';
import { colors } from '../styles/theme';
import AddMenu from './AddMenu';

const LABEL_BY_TYPE = { 'point-light': 'Point Light', 'spot-light': 'Focused Light', 'directional-light': 'Directional Light', 'area-light': 'Softbox', 'hemisphere-light': 'Environment Light', 'product-cube': 'Product Cube', 'cyclorama': 'Cyclorama', 'imported-model': 'Imported Model' };
const TYPE_ICON = { 'point-light': '☀', 'spot-light': '◐', 'directional-light': '↘', 'area-light': '▬', 'hemisphere-light': '◑', 'product-cube': '■', 'cyclorama': '⌐', 'imported-model': '⬡' };
const LIGHT_TYPES = new Set(['point-light', 'spot-light', 'directional-light', 'area-light', 'hemisphere-light']);
const PRODUCT_TYPES = new Set(['product-cube', 'cyclorama', 'imported-model']);
const FILTERS = [{ key: 'all', label: 'All' }, { key: 'lights', label: 'Lights' }, { key: 'products', label: 'Products' }];

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
const LockClosedIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const LockOpenIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </svg>
);

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
  padding: 10px 12px;
  border-bottom: 1px solid ${colors.border};
`;

const Title = styled.div`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${colors.textMuted};
`;

const CollapseBtn = styled.button`
  background: transparent;
  border: none;
  color: ${colors.textMuted};
  font-size: 14px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  &:hover { background: ${colors.accentSubtle}; color: ${colors.accent}; }
`;

const CollapsedLabel = styled.div`
  writing-mode: vertical-rl;
  text-orientation: mixed;
  font-size: 11px;
  letter-spacing: 0.1em;
  color: ${colors.textMuted};
  padding: 10px 0;
  cursor: pointer;
  text-align: center;
`;

const Filters = styled.div`
  display: flex;
  gap: 4px;
  padding: 8px;
  border-bottom: 1px solid ${colors.border};
`;

const PinnedZone = styled.div`
  padding: 4px;
  border-bottom: 1px solid ${colors.border};
`;

const Chip = styled.button`
  flex: 1;
  font-size: 10px;
  font-weight: 600;
  padding: 5px 6px;
  border-radius: 5px;
  cursor: pointer;
  border: 1px solid ${({ $active }) => $active ? colors.accentBorder : 'transparent'};
  background: ${({ $active }) => $active ? colors.accentSoft : 'transparent'};
  color: ${({ $active }) => $active ? colors.accent : colors.textMuted};
  &:hover { color: ${colors.accent}; background: ${colors.accentSubtle}; }
`;

const List = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 4px;
  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-thumb { background: ${colors.scrollThumb}; border-radius: 4px; }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 6px 8px;
  border-radius: 5px;
  cursor: pointer;
  user-select: none;
  color: ${({ $primary, $sel }) => $primary ? colors.accent : $sel ? colors.text : colors.textMuted};
  background: ${({ $primary, $sel }) => $primary ? colors.accentSoft : $sel ? colors.accentSubtle : 'transparent'};
  opacity: ${({ $hidden }) => $hidden ? 0.45 : 1};
  &:hover { background: ${colors.surfaceHover}; }
`;

const RowIcon = styled.span`
  font-size: 12px;
  width: 14px;
  text-align: center;
  flex-shrink: 0;
`;

const RowName = styled.span`
  flex: 1;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RowBtn = styled.button`
  background: transparent;
  border: none;
  color: ${({ $active }) => $active ? colors.accent : colors.textDim};
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  border-radius: 3px;
  &:hover { color: ${colors.accent}; background: ${colors.accentSubtle}; }
`;

const Empty = styled.div`
  font-size: 11px;
  color: ${colors.textDim};
  padding: 14px 12px;
  line-height: 1.5;
`;

const selectExternal = (id) => window.dispatchEvent(new CustomEvent('studio:select', { detail: id }));
const selectSet = (ids) => window.dispatchEvent(new CustomEvent('studio:select-set', { detail: { ids } }));

export default function Outliner({ embedded = false, onAdd }) {
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
        {onAdd ? <AddMenu onAdd={onAdd} /> : (!embedded && <CollapseBtn onClick={() => toggleCollapse(true)} title="Collapse">‹</CollapseBtn>)}
      </Head>
      <PinnedZone>
        <Row $primary={primary === 'camera'} $sel={false} onClick={() => selectExternal('camera')}>
          <RowIcon>◎</RowIcon>
          <RowName>Camera</RowName>
        </Row>
      </PinnedZone>
      <Filters>
        {FILTERS.map(f => (
          <Chip key={f.key} $active={filter === f.key} onClick={() => setFilter(f.key)}>{f.label}</Chip>
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
            <RowIcon>{TYPE_ICON[it.type] || '○'}</RowIcon>
            <RowName>{it.name}</RowName>
            <RowBtn
              $active={it.hidden}
              title={it.hidden ? 'Show' : 'Hide'}
              onClick={(e) => { e.stopPropagation(); updateElement(it.id, 'hidden', !it.hidden); }}
            >
              {it.hidden ? <EyeClosedIcon /> : <EyeOpenIcon />}
            </RowBtn>
            <RowBtn
              $active={it.locked}
              title={it.locked ? 'Unlock' : 'Lock'}
              onClick={(e) => { e.stopPropagation(); toggleLock(it.id); }}
            >
              {it.locked ? <LockClosedIcon /> : <LockOpenIcon />}
            </RowBtn>
          </Row>
        ))}
      </List>
    </Sidebar>
  );
}
