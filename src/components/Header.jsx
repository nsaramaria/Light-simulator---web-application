import React, { useState } from 'react';
import styled from 'styled-components';
import AddMenu from './AddMenu';
import { colors } from '../styles/theme';

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

const SceneInfo = styled.div`
  display: flex;
  flex-direction: column;
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
  width: ${({ $charWidth }) => Math.max(8, $charWidth)}ch;
  min-width: 8ch;
  max-width: 240px;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s;

  &:hover {
    border-bottom-color: ${colors.borderHover};
  }

  &:focus {
    border-bottom-color: ${colors.accent};
  }

  &::placeholder {
    color: ${colors.placeholder};
  }
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

const HeaderBtn = styled.button`
  padding: 6px 14px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s;
  font-family: inherit;
`;

const SaveBtn = styled(HeaderBtn)`
  background: ${colors.accent};
  border: 1px solid ${colors.accent};
  color: ${colors.textOnAccent};

  &:hover {
    background: ${colors.accentHover};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadBtn = styled(HeaderBtn)`
  background: transparent;
  border: 1px solid ${colors.border};
  color: ${colors.textMuted};

  &:hover {
    border-color: ${colors.accent};
    color: ${colors.accent};
  }
`;

const ModeTabs = styled.div`
  display: flex;
  gap: 1px;
  background: ${colors.surfaceHover};
  border-radius: 8px;
  padding: 3px;
  border: 1px solid ${colors.border};
`;

const ModeTab = styled.button`
  padding: 6px 16px;
  font-size: 11px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: ${({ $active }) => $active ? colors.accentSoft : 'transparent'};
  color: ${({ $active }) => $active ? colors.accent : colors.textMuted};
  transition: all 0.2s;

  &:hover {
    color: ${({ $active }) => $active ? colors.accent : colors.text};
    background: ${({ $active }) => $active ? colors.accentSoft : colors.surfaceHover};
  }
`;

const ModeIcon = styled.span`
  font-size: 12px;
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

  &:hover {
    border-color: ${colors.accent};
    color: ${colors.accent};
  }
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

  &:hover {
    border-color: ${colors.accent};
  }
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

  &:hover {
    color: ${colors.danger};
  }
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

export default function Header({
  onAdd,
  onShowHelp,
  user,
  onLogout,
  sceneName,
  onSceneNameChange,
  onSave,
  onShowLoad,
  onNewScene,
  saving,
  saveStatus,
}) {
  const [activeMode, setActiveMode] = useState('scene');

  const initial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';
  const effectiveStatus = saving ? 'saving' : saveStatus;

  return (
    <HeaderBar>
      <Logo>S</Logo>

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

      <ModeTabs>
        {[
          { id: 'scene', label: 'Scene', icon: '◫' },
        ].map(tab => (
          <ModeTab
            key={tab.id}
            $active={activeMode === tab.id}
            onClick={() => setActiveMode(tab.id)}
          >
            <ModeIcon>{tab.icon}</ModeIcon>
            {tab.label}
          </ModeTab>
        ))}
      </ModeTabs>

      <Spacer />

      <LoadBtn onClick={onNewScene}>New</LoadBtn>
      <LoadBtn onClick={onShowLoad}>Load</LoadBtn>
      <SaveBtn onClick={onSave} disabled={saving || !sceneName.trim()}>
        {saving ? 'Saving…' : 'Save'}
      </SaveBtn>

      <Divider />

      <AddMenu onAdd={onAdd} />

      <HelpBtn onClick={onShowHelp} title="How to use">
        ?
      </HelpBtn>

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
