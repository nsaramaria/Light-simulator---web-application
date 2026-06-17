import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { colors, shadows } from '../styles/theme';

const HeaderBar = styled.div`
  height: 60px;
  flex-shrink: 0;
  background: ${colors.card};
  border-radius: 20px;
  box-shadow: ${shadows.cardSm};
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 20;
`;

const Logo = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: ${colors.periSoft};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${colors.ink};
  svg { width: 25px; height: 25px; }
`;

const LogoMark = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16.2 7.4 C15.4 5.3 12.3 4.6 9.9 5.9 C7.3 7.2 7.6 10 10.5 11.1 C12.4 11.9 14.4 12.4 15.6 13.6 C17.2 15.1 16.7 17.9 13.8 18.9 C11 19.9 8.1 18.8 7.6 16.6" />
  </svg>
);

const FileWrap = styled.div`
  position: relative;
`;

const FileBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 14px;
  font-size: 13.5px;
  font-weight: 600;
  border-radius: 999px;
  cursor: pointer;
  background: ${({ $open }) => $open ? '#E0E5FD' : colors.periTint};
  border: none;
  color: ${colors.ink2};
  transition: .14s;
  &:hover { background: #E0E5FD; }
`;

const FileDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 200;
  min-width: 200px;
  padding: 6px;
  background: ${colors.card};
  border-radius: 14px;
  box-shadow: ${shadows.dropdown};
  display: flex;
  flex-direction: column;
`;

const FileRow = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 500;
  text-align: left;
  background: transparent;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  color: ${colors.ink2};
  transition: .1s;
  &:hover { background: ${colors.periTint}; color: ${colors.ink}; }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
`;

const FileHint = styled.span`
  font-size: 11px;
  color: ${colors.textDim};
`;

const FileDivider = styled.div`
  height: 1px;
  background: ${colors.border};
  margin: 5px 6px;
`;

const Spacer = styled.div`
  flex: 1;
`;

const SceneInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`;

const SceneNameInput = styled.input`
  background: none;
  border: none;
  outline: none;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -.01em;
  color: ${colors.ink};
  font-family: inherit;
  padding: 2px 0;
  text-align: center;
  width: ${({ $charWidth }) => Math.max(8, $charWidth)}ch;
  min-width: 8ch;
  max-width: 260px;
  border-bottom: 1.5px solid transparent;
  transition: border-color 0.18s;
  &:hover { border-bottom-color: ${colors.borderHover}; }
  &:focus { border-bottom-color: ${colors.peri}; }
  &::placeholder { color: ${colors.placeholder}; }
`;

const SaveChip = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 600;
  flex-shrink: 0;
  padding: 5px 11px;
  border-radius: 999px;
  background: ${({ $status }) =>
    $status === 'saved' ? colors.mintSoft :
    $status === 'error' ? colors.pinkSoft :
    $status === 'saving' ? colors.yellowSoft :
    colors.periTint};
  color: ${({ $status }) =>
    $status === 'saved' ? colors.mintInk :
    $status === 'error' ? '#bb4f70' :
    $status === 'saving' ? colors.yellowInk :
    colors.peri};

  span {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: currentColor;
    animation: ${({ $status }) => ($status === 'unsaved' || $status === 'new' || $status === 'saving') ? 'pulse 2s ease-in-out infinite' : 'none'};
  }
`;

const Export = styled.button`
  font-weight: 600;
  font-size: 13.5px;
  color: #fff;
  background: ${colors.ink};
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 11px 18px;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: ${shadows.btnSm};
  transition: transform .12s, box-shadow .12s;
  &:hover { transform: translateY(-1px); box-shadow: 0 5px 0 #050509; }
  &:active { transform: translateY(3px); box-shadow: ${shadows.btnActive}; }
  span {
    width: 21px;
    height: 21px;
    border-radius: 50%;
    background: #fff;
    color: ${colors.ink};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
  }
`;

const IconBtn = styled.button`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  background: ${colors.periTint};
  color: ${colors.ink2};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: .14s;
  flex-shrink: 0;
  &:hover { background: #E0E5FD; }
  svg { width: 18px; height: 18px; }
`;

const Avatar = styled.button`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: ${colors.pinkSoft};
  border: none;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.ink};
  cursor: pointer;
  transition: transform .14s;
  svg { width: 24px; height: 24px; }
  &:hover { transform: translateY(-1px); }
`;

const AvatarFigure = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="8" fill="#fff" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7.4 6.2 C9 4.8 11.6 4 13.6 4.4 C16.4 5 18.6 7.2 19.2 10 C18 9.2 16.6 8.9 15.2 9.2 C15.6 7.6 14 6.6 12 6.8 C10.4 7 8.8 7.6 7.8 8.6 C7 7.8 6.8 6.9 7.4 6.2 Z" fill="currentColor" stroke="none" />
    <path d="M15.2 9.2 C17.4 9.8 19 11.6 19.2 14 C18.2 13.2 17 13.2 16 13.8" fill="none" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="10" cy="12.4" r="0.85" fill="currentColor" stroke="none" />
    <path d="M8.7 10.9 C9.3 10.4 10.5 10.4 11.1 10.9" fill="none" stroke="currentColor" strokeWidth="1.1" />
    <path d="M4.3 12.6 C3.7 13.2 3.7 14.1 4.5 14.4" fill="none" stroke="currentColor" strokeWidth="1.3" />
  </svg>
);

const AccountWrap = styled.div`
  position: relative;
`;

const AccountDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 200;
  min-width: 232px;
  padding: 6px;
  background: ${colors.card};
  border-radius: 14px;
  box-shadow: ${shadows.dropdown};
  display: flex;
  flex-direction: column;
`;

const AccountHead = styled.div`
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 9px 10px 10px;
`;

const AccountAvatarMini = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: ${colors.pinkSoft};
  color: ${colors.ink};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  svg { width: 24px; height: 24px; }
`;

const AccountLabel = styled.div`
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: ${colors.mut};
`;

const AccountEmail = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${colors.ink};
  margin-top: 2px;
  max-width: 168px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LogoutRow = styled.button`
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 500;
  text-align: left;
  background: transparent;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  color: ${colors.ink2};
  transition: .1s;
  svg { width: 16px; height: 16px; }
  &:hover { background: ${colors.dangerSoft}; color: ${colors.danger}; }
`;

function AccountMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <AccountWrap ref={ref}>
      <Avatar onClick={() => setOpen(v => !v)} title="Account" aria-label="Account"><AvatarFigure /></Avatar>
      {open && (
        <AccountDropdown>
          <AccountHead>
            <AccountAvatarMini><AvatarFigure /></AccountAvatarMini>
            <div>
              <AccountLabel>Signed in</AccountLabel>
              <AccountEmail title={user?.email}>{user?.email || 'Account'}</AccountEmail>
            </div>
          </AccountHead>
          <FileDivider />
          <LogoutRow onClick={() => { setOpen(false); onLogout?.(); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Log out
          </LogoutRow>
        </AccountDropdown>
      )}
    </AccountWrap>
  );
}

const SAVE_STATUS_TEXT = {
  new:      'Not saved',
  unsaved:  'Unsaved',
  saving:   'Saving…',
  saved:    'Saved',
  error:    'Save failed',
};

function FileMenu({ onNewScene, onShowLoad, onSave, onExport, canSave }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const run = (fn) => { fn?.(); setOpen(false); };

  return (
    <FileWrap ref={ref}>
      <FileBtn $open={open} onClick={() => setOpen(v => !v)}>
        File <span style={{ fontSize: 10 }}>▾</span>
      </FileBtn>
      {open && (
        <FileDropdown>
          <FileRow onClick={() => run(onNewScene)}>New <FileHint>blank scene</FileHint></FileRow>
          <FileRow onClick={() => run(onShowLoad)}>Open… <FileHint>saved scenes</FileHint></FileRow>
          <FileDivider />
          <FileRow disabled={!canSave} onClick={() => canSave && run(onSave)}>Save</FileRow>
          <FileRow onClick={() => run(onExport)}>Export… <FileHint>PNG</FileHint></FileRow>
        </FileDropdown>
      )}
    </FileWrap>
  );
}

export default function Header({
  onShowHelp,
  user,
  onLogout,
  sceneName,
  onSceneNameChange,
  onSave,
  onShowLoad,
  onNewScene,
  onExport,
  saving,
  saveStatus,
}) {
  const effectiveStatus = saving ? 'saving' : saveStatus;

  return (
    <HeaderBar>
      <Logo aria-label="Studio"><LogoMark /></Logo>
      <FileMenu
        onNewScene={onNewScene}
        onShowLoad={onShowLoad}
        onSave={onSave}
        onExport={onExport}
        canSave={!saving && !!sceneName.trim()}
      />

      <Spacer />

      <SceneInfo>
        <SceneNameInput
          value={sceneName}
          $charWidth={sceneName.length || 14}
          onChange={e => onSceneNameChange(e.target.value)}
          placeholder="Untitled Scene"
          spellCheck={false}
        />
        <SaveChip $status={effectiveStatus} title={SAVE_STATUS_TEXT[effectiveStatus] || 'Not saved'}>
          <span />{SAVE_STATUS_TEXT[effectiveStatus] || 'Not saved'}
        </SaveChip>
      </SceneInfo>

      <Spacer />

      <Export onClick={onExport}>Export <span>↓</span></Export>
      <IconBtn onClick={onShowHelp} title="How to use" aria-label="Help">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
      </IconBtn>
      {user && <AccountMenu user={user} onLogout={onLogout} />}
    </HeaderBar>
  );
}
