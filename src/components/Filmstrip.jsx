import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { getSceneSnapshot, restoreFullSnapshot, getDefaultSnapshot, sceneState } from '../scene/sharedScene';
import { colors } from '../styles/theme';

const Strip = styled.div`
  height: 80px;
  background: rgba(255,255,255,0.015);
  border-top: 1px solid rgba(255,255,255,0.06);
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 10px;
  flex-shrink: 0;
`;

const AddWrap = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const AddShotBtn = styled.button`
  width: 40px;
  height: 54px;
  border-radius: 8px;
  border: 1px dashed rgba(232,168,85,0.3);
  background: rgba(232,168,85,0.04);
  color: ${colors.accent};
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  &:hover {
    background: rgba(232,168,85,0.08);
    border-color: rgba(232,168,85,0.5);
  }
`;

const AddMenu = styled.div`
  position: absolute;
  bottom: calc(100% + 6px);
  left: 0;
  min-width: 180px;
  background: rgba(12,11,9,0.97);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.6);
  z-index: 100;
`;

const AddMenuHeader = styled.div`
  padding: 6px 12px;
  font-size: 9px;
  font-weight: 600;
  color: ${colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  border-bottom: 1px solid rgba(255,255,255,0.06);
`;

const AddMenuItem = styled.div`
  padding: 8px 12px;
  font-size: 12px;
  color: ${colors.text};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.1s;
  &:hover {
    background: rgba(232,168,85,0.06);
    color: ${colors.accent};
  }
  & + & {
    border-top: 1px solid rgba(255,255,255,0.04);
  }
`;

const AddMenuIcon = styled.span`
  font-size: 12px;
  color: ${colors.textMuted};
  width: 16px;
  text-align: center;
`;

const SubMenu = styled.div`
  border-top: 1px solid rgba(255,255,255,0.06);
  max-height: 160px;
  overflow-y: auto;
`;

const SubMenuItem = styled.div`
  padding: 6px 12px 6px 36px;
  font-size: 11px;
  color: ${colors.textMuted};
  cursor: pointer;
  transition: background 0.1s;
  &:hover {
    background: rgba(232,168,85,0.06);
    color: ${colors.accent};
  }
`;

const StripDivider = styled.div`
  width: 1px;
  height: 44px;
  background: rgba(255,255,255,0.06);
  flex-shrink: 0;
`;

const ShotList = styled.div`
  flex: 1;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 0;
  &::-webkit-scrollbar { height: 4px; }
  &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
`;

const ShotCard = styled.div`
  width: 90px;
  height: 56px;
  border-radius: 8px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  border: ${({ $active }) => $active ? '2px solid #E8A855' : '1px solid rgba(255,255,255,0.06)'};
  transition: all 0.2s;
  transform: ${({ $active }) => $active ? 'scale(1.04)' : 'scale(1)'};
  background: #000;
  &:hover {
    border-color: ${({ $active }) => $active ? '#E8A855' : 'rgba(255,255,255,0.12)'};
  }
`;

const ShotBg = styled.div`
  position: absolute;
  inset: 0;
  background: ${({ $color }) => `radial-gradient(circle at 50% 60%, ${$color}, #050404)`};
`;

const ShotNumber = styled.div`
  position: absolute;
  top: 4px;
  left: 6px;
  font-size: 8px;
  font-weight: 700;
  color: ${({ $active }) => $active ? '#E8A855' : 'rgba(255,255,255,0.2)'};
  font-family: 'JetBrains Mono', monospace;
`;

const ShotInfo = styled.div`
  position: absolute;
  top: 4px;
  right: 6px;
  font-size: 7px;
  color: rgba(255,255,255,0.15);
  font-family: 'JetBrains Mono', monospace;
`;

const ShotLabel = styled.div`
  position: absolute;
  bottom: 4px;
  left: 6px;
  right: 6px;
  font-size: 8px;
  font-weight: 600;
  color: ${({ $active }) => $active ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ActiveBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #E8A855;
`;

const ShotActions = styled.div`
  position: absolute;
  top: 3px;
  right: 3px;
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s;
  ${ShotCard}:hover & { opacity: 1; }
`;

const ShotActionBtn = styled.button`
  width: 16px;
  height: 16px;
  border-radius: 3px;
  border: none;
  background: rgba(0,0,0,0.6);
  color: ${({ $danger }) => $danger ? '#C75450' : 'rgba(255,255,255,0.4)'};
  font-size: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    color: ${({ $danger }) => $danger ? '#C75450' : '#fff'};
    background: rgba(0,0,0,0.8);
  }
`;

const SHOT_COLORS = ['#2a1a10', '#1a1520', '#101a15', '#1a1010', '#10151a', '#1a1a10', '#151020'];

const cloneSnapshot = (snap) => JSON.parse(JSON.stringify(snap));

export default function Filmstrip() {
  const [shots, setShots] = useState(() => {
    const snap = getSceneSnapshot();
    return [{ id: 'shot-1', label: 'Shot 1', snapshot: snap }];
  });
  const [activeId, setActiveId] = useState('shot-1');
  const [menuOpen, setMenuOpen] = useState(false);
  const [dupSubmenu, setDupSubmenu] = useState(false);
  const nextIdRef = useRef(2);
  const menuRef = useRef(null);

  const shotsRef = useRef(shots);
  const activeIdRef = useRef(activeId);
  shotsRef.current = shots;
  activeIdRef.current = activeId;

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
    setShots(prev => prev.map(s =>
      s.id === activeIdRef.current ? { ...s, snapshot: snap } : s
    ));
    return snap;
  }, []);

  useEffect(() => {
    let saveTimer = null;
    const debouncedSave = () => {
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        const snap = getSceneSnapshot();
        setShots(prev => prev.map(s =>
          s.id === activeIdRef.current ? { ...s, snapshot: snap } : s
        ));
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
  }, []);

  const addFromDefault = () => {
    setMenuOpen(false);
    setDupSubmenu(false);
    saveActiveShot();
    const id = `shot-${nextIdRef.current++}`;
    const label = `Shot ${shotsRef.current.length + 1}`;
    const defaultSnap = getDefaultSnapshot();
    setShots(prev => [...prev, { id, label, snapshot: defaultSnap }]);
    setActiveId(id);
    activeIdRef.current = id;
    restoreFullSnapshot(defaultSnap);
    window.dispatchEvent(new CustomEvent('studio:select', { detail: null }));
  };

  const addFromShot = (sourceId) => {
    setMenuOpen(false);
    setDupSubmenu(false);
    saveActiveShot();
    const source = shotsRef.current.find(s => s.id === sourceId);
    if (!source) return;
    const id = `shot-${nextIdRef.current++}`;
    const label = `Shot ${shotsRef.current.length + 1}`;
    const dupSnap = cloneSnapshot(source.snapshot);
    setShots(prev => [...prev, { id, label, snapshot: dupSnap }]);
    setActiveId(id);
    activeIdRef.current = id;
    restoreFullSnapshot(dupSnap);
    window.dispatchEvent(new CustomEvent('studio:select', { detail: null }));
  };

  const addFromCurrent = () => addFromShot(activeIdRef.current);

  const selectShot = (shot) => {
    if (shot.id === activeIdRef.current) return;
    saveActiveShot();
    setActiveId(shot.id);
    activeIdRef.current = shot.id;
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
      setActiveId(fallback.id);
      activeIdRef.current = fallback.id;
      restoreFullSnapshot(fallback.snapshot);
      window.dispatchEvent(new CustomEvent('studio:select', { detail: null }));
    }
  };

  const getElementCount = (shot) => Object.keys(shot.snapshot.elements).length;

  return (
    <Strip>
      <AddWrap ref={menuRef}>
        <AddShotBtn onClick={() => { setMenuOpen(v => !v); setDupSubmenu(false); }} title="Add new shot">+</AddShotBtn>
        {menuOpen && (
          <AddMenu>
            <AddMenuHeader>New Shot</AddMenuHeader>
            <AddMenuItem onClick={addFromCurrent}>
              <AddMenuIcon>⧉</AddMenuIcon>Duplicate Current
            </AddMenuItem>
            <AddMenuItem onClick={() => setDupSubmenu(v => !v)}>
              <AddMenuIcon>❐</AddMenuIcon>Duplicate From…
            </AddMenuItem>
            {dupSubmenu && (
              <SubMenu>
                {shots.map((shot, i) => (
                  <SubMenuItem key={shot.id} onClick={() => addFromShot(shot.id)}>
                    {String(i + 1).padStart(2, '0')} — {shot.label}
                    {shot.id === activeId ? ' (current)' : ''}
                  </SubMenuItem>
                ))}
              </SubMenu>
            )}
            <AddMenuItem onClick={addFromDefault}>
              <AddMenuIcon>✦</AddMenuIcon>New Default
            </AddMenuItem>
          </AddMenu>
        )}
      </AddWrap>
      <StripDivider />
      <ShotList>
        {shots.map((shot, i) => {
          const isActive = shot.id === activeId;
          const colorIdx = i % SHOT_COLORS.length;
          return (
            <ShotCard key={shot.id} $active={isActive} onClick={() => selectShot(shot)}>
              <ShotBg $color={SHOT_COLORS[colorIdx]} />
              <ShotNumber $active={isActive}>{String(i + 1).padStart(2, '0')}</ShotNumber>
              <ShotInfo>{getElementCount(shot)} obj</ShotInfo>
              {shots.length > 1 && (
                <ShotActions>
                  <ShotActionBtn $danger onClick={(e) => deleteShot(e, shot.id)} title="Delete shot">✕</ShotActionBtn>
                </ShotActions>
              )}
              <ShotLabel $active={isActive}>{shot.label}</ShotLabel>
              {isActive && <ActiveBar />}
            </ShotCard>
          );
        })}
      </ShotList>
    </Strip>
  );
}
