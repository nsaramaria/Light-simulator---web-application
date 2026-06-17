import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import styled from 'styled-components';
import { getSceneSnapshot, restoreFullSnapshot, getDefaultSnapshot, sceneState } from '../scene/sharedScene';
import { colors, shadows } from '../styles/theme';

const Strip = styled.div`
  height: 98px;
  flex-shrink: 0;
  background: ${colors.card};
  border-radius: 20px;
  box-shadow: ${shadows.cardSm};
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 14px;
`;

const AddWrap = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const AddShotBtn = styled.button`
  width: 72px;
  height: 66px;
  flex-shrink: 0;
  border-radius: 18px;
  background: ${colors.ink};
  color: #fff;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
  font-size: 11.5px;
  font-weight: 600;
  box-shadow: ${shadows.btn};
  transition: transform .12s, box-shadow .12s;
  &:active { transform: translateY(4px); box-shadow: ${shadows.btnActive}; }
  span {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: #fff;
    color: ${colors.ink};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    line-height: 1;
  }
`;

const AddMenuDropdown = styled.div`
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  min-width: 200px;
  background: ${colors.card};
  border-radius: 14px;
  overflow: hidden;
  box-shadow: ${shadows.dropdown};
  padding: 6px;
  z-index: 100;
`;

const AddMenuHeader = styled.div`
  padding: 6px 10px;
  font-size: 10px;
  font-weight: 600;
  color: ${colors.mut};
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const AddMenuItem = styled.div`
  padding: 9px 10px;
  font-size: 13px;
  font-weight: 500;
  color: ${colors.ink2};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 9px;
  border-radius: 10px;
  transition: background 0.1s;
  &:hover { background: ${colors.periTint}; color: ${colors.ink}; }
`;

const AddMenuIcon = styled.span`
  font-size: 13px;
  color: ${colors.mut};
  width: 16px;
  text-align: center;
`;

const SubMenu = styled.div`
  max-height: 160px;
  overflow-y: auto;
  margin: 2px 0;
`;

const SubMenuItem = styled.div`
  padding: 7px 10px 7px 34px;
  font-size: 12px;
  color: ${colors.mut};
  cursor: pointer;
  border-radius: 10px;
  transition: background 0.1s;
  &:hover { background: ${colors.periTint}; color: ${colors.ink}; }
`;

const StripDivider = styled.div`
  width: 1px;
  height: 44px;
  background: ${colors.borderLight};
  flex-shrink: 0;
`;

const ShotList = styled.div`
  flex: 1;
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 4px 0;
  &::-webkit-scrollbar { height: 6px; }
  &::-webkit-scrollbar-thumb { background: ${colors.scrollThumb}; border-radius: 999px; }
`;

const ShotCard = styled.div`
  width: 116px;
  height: 68px;
  border-radius: 18px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  padding: 9px 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: ${({ $color }) => $color};
  transition: transform .14s;
  outline: ${({ $active }) => $active ? `3px solid ${colors.ink}` : '3px solid transparent'};
  outline-offset: -3px;
  &:hover { transform: translateY(-3px); }
  &::after {
    content: '';
    position: absolute;
    top: 9px;
    right: 10px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${colors.ink};
    opacity: ${({ $active }) => $active ? 1 : 0};
  }
`;

const ShotBg = styled.div`
  display: none;
`;

const ShotNumber = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(255,255,255,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10.5px;
  font-weight: 700;
  color: ${colors.ink};
  font-variant-numeric: tabular-nums;
  position: relative;
  z-index: 1;
`;

const ShotInfo = styled.div`
  position: absolute;
  bottom: 9px;
  right: 12px;
  font-size: 10px;
  font-weight: 500;
  color: rgba(23,23,28,0.5);
  font-variant-numeric: tabular-nums;
`;

const ShotLabel = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: ${colors.ink};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative;
  z-index: 1;
`;

const LabelInput = styled.input`
  font-weight: 600;
  font-size: 14px;
  color: ${colors.ink};
  background: #fff;
  border: 1.5px solid ${colors.peri};
  border-radius: 8px;
  padding: 2px 6px;
  outline: none;
  width: 100%;
  position: relative;
  z-index: 2;
`;

const ActiveBar = styled.div`
  display: none;
`;

const ShotActions = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.15s;
  z-index: 2;
  ${ShotCard}:hover & { opacity: 1; }
`;

const ShotActionBtn = styled.button`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.75);
  color: ${({ $danger }) => $danger ? colors.danger : colors.ink2};
  font-size: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: .12s;
  &:hover {
    background: #fff;
    color: ${({ $danger }) => $danger ? colors.danger : colors.ink};
  }
`;

const cloneSnapshot = (snap) => JSON.parse(JSON.stringify(snap));

const Filmstrip = forwardRef(function Filmstrip({ onShotsChange }, ref) {
  const [shots, setShots] = useState(() => {
    const snap = getSceneSnapshot();
    return [{ id: 'shot-1', label: 'Shot 1', snapshot: snap }];
  });
  const [activeId, setActiveId] = useState('shot-1');
  const [menuOpen, setMenuOpen] = useState(false);
  const [dupSubmenu, setDupSubmenu] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draftLabel, setDraftLabel] = useState('');
  const nextIdRef = useRef(2);
  const menuRef = useRef(null);
  const shotsRef = useRef(shots);
  const activeIdRef = useRef(activeId);
  shotsRef.current = shots;
  activeIdRef.current = activeId;

  // Expose getShots/restoreShots to parent via ref
  useImperativeHandle(ref, () => ({
    getShots: () => {
      // Save current active shot before returning
      const currentSnap = getSceneSnapshot();
      return shotsRef.current.map(s =>
        s.id === activeIdRef.current ? { ...s, snapshot: currentSnap } : s
      );
    },
    restoreShots: (savedShots) => {
      if (!savedShots || savedShots.length === 0) return;
      setShots(savedShots);
      shotsRef.current = savedShots;
      const firstId = savedShots[0].id;
      setActiveId(firstId);
      activeIdRef.current = firstId;
      // Find the highest shot-N id to set the counter
      let maxNum = 0;
      for (const s of savedShots) {
        const match = s.id.match(/^shot-(\d+)$/);
        if (match) maxNum = Math.max(maxNum, parseInt(match[1]));
      }
      nextIdRef.current = maxNum + 1;
      // Restore the first shot's scene
      restoreFullSnapshot(savedShots[0].snapshot);
    },
  }), []);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
        setDupSubmenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const saveActiveShot = useCallback(() => {
    const snap = getSceneSnapshot();
    setShots(prev => prev.map(s => s.id === activeIdRef.current ? { ...s, snapshot: snap } : s));
    return snap;
  }, []);

  useEffect(() => {
    let saveTimer = null;
    const debouncedSave = () => {
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        const snap = getSceneSnapshot();
        setShots(prev => prev.map(s => s.id === activeIdRef.current ? { ...s, snapshot: snap } : s));
        onShotsChange?.();
      }, 100);
    };
    window.addEventListener('studio:element-added', debouncedSave);
    window.addEventListener('studio:element-deleted', debouncedSave);
    window.addEventListener('studio:position-update', debouncedSave);
    window.addEventListener('studio:property-update', debouncedSave);
    return () => {
      if (saveTimer) clearTimeout(saveTimer);
      window.removeEventListener('studio:element-added', debouncedSave);
      window.removeEventListener('studio:element-deleted', debouncedSave);
      window.removeEventListener('studio:position-update', debouncedSave);
      window.removeEventListener('studio:property-update', debouncedSave);
    };
  }, [onShotsChange]);

  const addFromDefault = () => {
    setMenuOpen(false); setDupSubmenu(false); saveActiveShot();
    const id = `shot-${nextIdRef.current++}`;
    const label = `Shot ${shotsRef.current.length + 1}`;
    const defaultSnap = getDefaultSnapshot();
    setShots(prev => [...prev, { id, label, snapshot: defaultSnap }]);
    setActiveId(id); activeIdRef.current = id;
    restoreFullSnapshot(defaultSnap);
    window.dispatchEvent(new CustomEvent('studio:select', { detail: null }));
    onShotsChange?.();
  };

  const addFromShot = (sourceId) => {
    setMenuOpen(false); setDupSubmenu(false); saveActiveShot();
    const source = shotsRef.current.find(s => s.id === sourceId);
    if (!source) return;
    const id = `shot-${nextIdRef.current++}`;
    const label = `Shot ${shotsRef.current.length + 1}`;
    const dupSnap = cloneSnapshot(source.snapshot);
    setShots(prev => [...prev, { id, label, snapshot: dupSnap }]);
    setActiveId(id); activeIdRef.current = id;
    restoreFullSnapshot(dupSnap);
    window.dispatchEvent(new CustomEvent('studio:select', { detail: null }));
    onShotsChange?.();
  };

  const addFromCurrent = () => addFromShot(activeIdRef.current);

  const selectShot = (shot) => {
    if (shot.id === activeIdRef.current) return;
    saveActiveShot();
    setActiveId(shot.id); activeIdRef.current = shot.id;
    restoreFullSnapshot(shot.snapshot);
    window.dispatchEvent(new CustomEvent('studio:select', { detail: null }));
  };

  const deleteShot = (e, id) => {
    e.stopPropagation();
    if (shotsRef.current.length <= 1) return;
    const remaining = shotsRef.current.filter(s => s.id !== id);
    setShots(remaining);
    if (activeIdRef.current === id) {
      const fallback = remaining[0];
      setActiveId(fallback.id); activeIdRef.current = fallback.id;
      restoreFullSnapshot(fallback.snapshot);
      window.dispatchEvent(new CustomEvent('studio:select', { detail: null }));
    }
    onShotsChange?.();
  };

  const getElementCount = (shot) => Object.keys(shot.snapshot.elements).length;

  const startRename = (e, shot) => {
    e.stopPropagation();
    if (e.preventDefault) e.preventDefault();
    setEditingId(shot.id);
    setDraftLabel(shot.label);
  };

  const commitRename = () => {
    const name = draftLabel.trim();
    setShots(prev => prev.map(s => s.id === editingId ? { ...s, label: name || s.label } : s));
    setEditingId(null);
    onShotsChange?.();
  };

  return (
    <Strip>
      <AddWrap ref={menuRef}>
        <AddShotBtn onClick={() => { setMenuOpen(v => !v); setDupSubmenu(false); }} title="Add new shot"><span>+</span>Add shot</AddShotBtn>
        {menuOpen && (
          <AddMenuDropdown>
            <AddMenuHeader>New Shot</AddMenuHeader>
            <AddMenuItem onClick={addFromCurrent}><AddMenuIcon>⧉</AddMenuIcon>Duplicate Current</AddMenuItem>
            <AddMenuItem onClick={() => setDupSubmenu(v => !v)}><AddMenuIcon>❐</AddMenuIcon>Duplicate From…</AddMenuItem>
            {dupSubmenu && (
              <SubMenu>
                {shots.map((shot, i) => (
                  <SubMenuItem key={shot.id} onClick={() => addFromShot(shot.id)}>
                    {String(i + 1).padStart(2, '0')} — {shot.label}{shot.id === activeId ? ' (current)' : ''}
                  </SubMenuItem>
                ))}
              </SubMenu>
            )}
            <AddMenuItem onClick={addFromDefault}><AddMenuIcon>✦</AddMenuIcon>New Default</AddMenuItem>
          </AddMenuDropdown>
        )}
      </AddWrap>
      <StripDivider />
      <ShotList>
        {shots.map((shot, i) => {
          const isActive = shot.id === activeId;
          const colorIdx = i % colors.shotColors.length;
          return (
            <ShotCard key={shot.id} $active={isActive} $color={colors.shotColors[colorIdx]} onClick={() => selectShot(shot)}>
              <ShotBg $color={colors.shotColors[colorIdx]} />
              <ShotNumber $active={isActive}>{String(i + 1).padStart(2, '0')}</ShotNumber>
              <ShotInfo>{getElementCount(shot)} obj</ShotInfo>
              {shots.length > 1 && (
                <ShotActions>
                  <ShotActionBtn $danger onClick={(e) => deleteShot(e, shot.id)} title="Delete shot">✕</ShotActionBtn>
                </ShotActions>
              )}
              {editingId === shot.id ? (
                <LabelInput
                  autoFocus
                  value={draftLabel}
                  onChange={e => setDraftLabel(e.target.value)}
                  onClick={e => e.stopPropagation()}
                  onFocus={e => e.target.select()}
                  onBlur={commitRename}
                  onKeyDown={e => {
                    if (e.key === 'Enter') { e.preventDefault(); commitRename(); }
                    else if (e.key === 'Escape') { e.preventDefault(); setEditingId(null); }
                  }}
                />
              ) : (
                <ShotLabel
                  $active={isActive}
                  title="Double-click to rename"
                  onDoubleClick={e => startRename(e, shot)}
                  onContextMenu={e => startRename(e, shot)}
                >{shot.label}</ShotLabel>
              )}
              {isActive && <ActiveBar />}
            </ShotCard>
          );
        })}
      </ShotList>
    </Strip>
  );
});

export default Filmstrip;
