import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { colors, shadows, alpha } from '../styles/theme';
import { getScenes, getScene, deleteScene as apiDeleteScene } from '../api';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: ${alpha('#000000', 0.6)};
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 600;
  animation: ${fadeIn} 0.15s ease;
`;

const Panel = styled.div`
  width: 480px;
  max-height: 70vh;
  background: ${colors.surfaceOverlay};
  border: 1px solid ${colors.borderStrong};
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: ${shadows.modal};
  animation: ${slideUp} 0.2s ease;
`;

const Header = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid ${colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
`;

const Title = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: ${colors.text};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TitleIcon = styled.span`
  font-size: 14px;
  color: ${colors.accent};
`;

const SceneCount = styled.span`
  font-size: 10px;
  color: ${colors.textDim};
  background: ${colors.surfaceActive};
  padding: 2px 7px;
  border-radius: 10px;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: ${colors.textMuted};
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.15s;

  &:hover {
    color: ${colors.text};
    background: ${colors.surfaceHover};
  }
`;

const Body = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
`;

const EmptyState = styled.div`
  padding: 48px 20px;
  text-align: center;
  color: ${colors.textDim};
  font-size: 13px;
  line-height: 1.7;
`;

const EmptyIcon = styled.div`
  font-size: 32px;
  margin-bottom: 12px;
  opacity: 0.3;
`;

const SceneRow = styled.div`
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: background 0.1s;

  &:hover {
    background: ${colors.accentFaint};
  }

  & + & {
    border-top: 1px solid ${colors.borderSubtle};
  }
`;

const SceneIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: ${colors.surfaceActive};
  border: 1px solid ${colors.borderLight};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: ${colors.textDim};
  flex-shrink: 0;
`;

const SceneInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const SceneName = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SceneMeta = styled.div`
  font-size: 10px;
  color: ${colors.textDim};
  margin-top: 2px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DeleteBtn = styled.button`
  background: none;
  border: none;
  color: ${colors.textDim};
  font-size: 11px;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 4px;
  transition: all 0.15s;
  flex-shrink: 0;
  opacity: 0;

  ${SceneRow}:hover & {
    opacity: 1;
  }

  &:hover {
    color: ${colors.danger};
    background: ${colors.dangerSoft};
  }
`;

const LoadingState = styled.div`
  padding: 48px 20px;
  text-align: center;
  color: ${colors.textDim};
  font-size: 12px;
`;

const ErrorState = styled.div`
  padding: 12px 20px;
  margin: 8px 12px;
  color: ${colors.danger};
  font-size: 12px;
  text-align: center;
  background: ${colors.dangerSoft};
  border: 1px solid ${colors.dangerBorder};
  border-radius: 6px;
`;

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

export default function SaveLoadManager({ onClose, onLoad }) {
  const [scenes, setScenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadingId, setLoadingId] = useState(null);

  const fetchScenes = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getScenes();
      setScenes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScenes();
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleLoad = async (scene) => {
    setLoadingId(scene.id);
    try {
      const full = await getScene(scene.id);
      onLoad(full);
      onClose();
    } catch (err) {
      setError(err.message);
      setLoadingId(null);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await apiDeleteScene(id);
      setScenes(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Panel onClick={e => e.stopPropagation()}>
        <Header>
          <Title>
            <TitleIcon>◫</TitleIcon>
            My Scenes
            {!loading && scenes.length > 0 && <SceneCount>{scenes.length}</SceneCount>}
          </Title>
          <CloseBtn onClick={onClose}>×</CloseBtn>
        </Header>
        <Body>
          {error && <ErrorState>{error}</ErrorState>}

          {loading && <LoadingState>Loading your scenes…</LoadingState>}

          {!loading && scenes.length === 0 && !error && (
            <EmptyState>
              <EmptyIcon>◫</EmptyIcon>
              No saved scenes yet.<br />
              Use the Save button to save your current setup.
            </EmptyState>
          )}

          {!loading && scenes.map(scene => (
            <SceneRow key={scene.id} onClick={() => handleLoad(scene)}>
              <SceneIcon>◫</SceneIcon>
              <SceneInfo>
                <SceneName>
                  {loadingId === scene.id ? 'Loading…' : scene.name}
                </SceneName>
                <SceneMeta>
                  <span>{formatDate(scene.updated_at || scene.created_at)}</span>
                </SceneMeta>
              </SceneInfo>
              <DeleteBtn
                onClick={(e) => handleDelete(e, scene.id)}
                title="Delete scene"
              >
                ✕
              </DeleteBtn>
            </SceneRow>
          ))}
        </Body>
      </Panel>
    </Overlay>
  );
}
