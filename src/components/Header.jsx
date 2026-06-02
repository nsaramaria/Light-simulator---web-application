import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { colors, shadows } from '../styles/theme';

const HeaderBar = styled.div`
  height: 48px;
  background: ${colors.surface};
  padding: 0 16px;
  color: ${colors.text};
  display: flex;
  align-items: center;
  border-bottom: 1px solid ${colors.border};
  gap: 12px;
  flex-shrink: 0;
  backdrop-filter: blur(12px);
  z-index: 20;
`;

const Logo = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(135deg, ${colors.logoFrom} 0%, ${colors.logoTo} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 900;
  color: ${colors.textOnAccent};
  flex-shrink: 0;
`;

const FileWrap = styled.div`
  position: relative;
`;

const FileBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  border-radius: 6px;
  cursor: pointer;
  background: ${({ $open }) => $open ? colors.accentSubtle : 'transparent'};
  border: 1px solid ${({ $open }) => $open ? colors.accent : colors.border};
  color: ${({ $open }) => $open ? colors.accent : colors.text};
  transition: all 0.15s;

  &:hover {
    border-color: ${colors.accent};
    color: ${colors.accent};
  }
`;

const FileDropdown = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 200;
  min-width: 190px;
  padding: 4px;
  background: ${colors.surfaceOverlay};
  border: 1px solid ${colors.borderStrong};
  border-radius: 10px;
  box-shadow: ${shadows.dropdown};
  display: flex;
  flex-direction: column;
`;

const FileRow = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 10px;
  font-size: 12px;
  font-family: inherit;
  text-align: left;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: ${colors.text};
  transition: all 0.1s;

  &:hover {
    background: ${colors.accentFaint};
    color: ${colors.accent};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const FileHint = styled.span`
  font-size: 10px;
  color: ${colors.textDim};
`;

const FileDivider = styled.div`
  height: 1px;
  background: ${colors.border};
  margin: 4px 0;
`;

const SceneInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
`;

const SceneNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const SceneNameInput = styled.input`
  background: none;
  border: none;
  outline: none;
  font-size: 13px;
  font-weight: 600;
  color: ${colors.text};
  font-family: inherit;
  padding: 0;
  text-align: center;
  width: ${({ $charWidth }) => Math.max(8, $charWidth)}ch;
  min-width: 8ch;
  max-width: 260px;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s;

  &:hover { border-bottom-color: ${colors.borderHover}; }
  &:focus { border-bottom-color: ${colors.accent}; }
  &::placeholder { color: ${colors.placeholder}; }
`;

const SaveDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${({ $status }) =>
    $status === 'saved' ? colors.statusGood :
    $status === 'error' ? colors.statusBad :
    $status === 'saving' ? colors.statusWarn :
    colors.accent};
  animation: ${({ $status }) => ($status === 'unsaved' || $status === 'new') ? 'pulse 2s ease-in-out infinite' : 'none'};
`;

const SaveStatus = styled.span`
  font-size: 9px;
  color: ${colors.textDim};
`;

const Spacer = styled.div`
  flex: 1;
`;

const HelpBtn = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid ${colors.border};
  background: ${colors.surface};
  color: ${colors.textDim};
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover { border-color: ${colors.accent}; color: ${colors.accent}; }
`;

const Avatar = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${colors.avatarFrom}, ${colors.avatarTo});
  border: 1px solid ${colors.avatarBorder};
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: ${colors.textMuted};
  font-weight: 700;
  cursor: pointer;
  transition: border-color 0.2s;

  &:hover { border-color: ${colors.accent}; }
`;

const LogoutBtn = styled.button`
  background: transparent;
  border: none;
  color: ${colors.textDim};
  font-size: 10px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover { color: ${colors.danger}; }
`;

const Divider = styled.div`
  width: 1px;
  height: 20px;
  background: ${colors.border};
  flex-shrink: 0;
`;

const SAVE_STATUS_TEXT = {
  new:      'Not saved yet',
  unsaved:  'Unsaved changes',
  saving:   'Saving…',
  saved:    'All changes saved',
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
        File <span style={{ fontSize: 9 }}>▾</span>
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
  const initial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';
  const effectiveStatus = saving ? 'saving' : saveStatus;

  return (
    <HeaderBar>
      <Logo>S</Logo>
      <FileMenu
        onNewScene={onNewScene}
        onShowLoad={onShowLoad}
        onSave={onSave}
        onExport={onExport}
        canSave={!saving && !!sceneName.trim()}
      />

      <Spacer />

      <SceneInfo>
        <SceneNameRow>
          <SceneNameInput
            value={sceneName}
            $charWidth={sceneName.length || 14}
            onChange={e => onSceneNameChange(e.target.value)}
            placeholder="Untitled Scene"
            spellCheck={false}
          />
          <SaveDot $status={effectiveStatus} />
        </SceneNameRow>
        <SaveStatus>{SAVE_STATUS_TEXT[effectiveStatus] || 'Not saved yet'}</SaveStatus>
      </SceneInfo>

      <Spacer />

      <HelpBtn onClick={onShowHelp} title="How to use">?</HelpBtn>
      <Divider />
      {user && (
        <>
          <Avatar title={user.email}>{initial}</Avatar>
          <LogoutBtn onClick={onLogout}>Log out</LogoutBtn>
        </>
      )}
    </HeaderBar>
  );
}
