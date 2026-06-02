import React, { useState, useRef, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import CameraView from './scene/CameraView';
import SetupView from './scene/SetupView';
import SelectionPanel from './components/SelectionPanel';
import Header from './components/Header';
import HelpModal from './components/Help';
import ContextMenu from './components/ContextMenu';
import Auth from './components/Auth';
import StatusBar from './components/StatusBar';
import Filmstrip from './components/Filmstrip';
import SaveLoadManager from './components/SaveLoadManager';
import ExportDialog from './components/ExportDialog';
import Outliner from './components/Outliner';
import {
  addPointLight, addSpotLight, addDirectionalLight, addAreaLight,
  addHemisphereLight, addProductCube, addCyclorama, addImportedModel,
  getSceneSnapshot, restoreFullSnapshot, getDefaultSnapshot, onSceneChange,
} from './scene/sharedScene';
import { saveScene, updateScene, getScene } from './api';
import { colors } from './styles/theme';

const AppWrapper = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const ViewsContainer = styled.div`
  flex: 1;
  display: flex;
  min-height: 0;
  overflow: hidden;
  user-select: ${({ $dragging }) => $dragging ? 'none' : 'auto'};
`;

const ViewsArea = styled.div`
  flex: 1;
  min-width: 0;
  height: 100%;
  display: flex;
  overflow: hidden;
  position: relative;
`;

const ViewPanel = styled.div`
  position: relative;
  width: ${({ $width }) => $width}%;
  min-width: 0;
  height: 100%;
  overflow: hidden;
  display: ${({ $width }) => $width === 0 ? 'none' : 'block'};
`;

const Divider = styled.div`
  width: 3px;
  height: 100%;
  background: ${colors.borderSubtle};
  cursor: col-resize;
  flex-shrink: 0;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  &:hover, &:active { background: ${colors.accent}; }
  &::after {
    content: '';
    position: absolute;
    width: 11px;
    height: 100%;
    left: -4px;
    cursor: col-resize;
  }
`;

const RightColumn = styled.div`
  width: 252px;
  flex-shrink: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: ${colors.surfaceDark};
  border-left: 1px solid ${colors.border};
`;

const OutlinerPane = styled.div`
  flex-shrink: 0;
  min-height: 90px;
  display: flex;
`;

const InspectorPane = styled.div`
  flex: 1;
  min-height: 90px;
  overflow: hidden;
  display: flex;
`;

const HDivider = styled.div`
  height: 4px;
  flex-shrink: 0;
  background: ${colors.border};
  cursor: row-resize;
  transition: background 0.2s;
  position: relative;
  &:hover, &:active { background: ${colors.accent}; }
  &::after {
    content: '';
    position: absolute;
    height: 11px;
    width: 100%;
    top: -4px;
    cursor: row-resize;
  }
`;

const ViewLabel = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background: ${colors.surfacePanel};
  backdrop-filter: blur(8px);
  color: ${colors.placeholder};
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: 1px solid ${colors.borderLight};
  z-index: 10;
  font-family: 'JetBrains Mono', monospace;
`;

const MaximizeBtn = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  background: ${colors.surfacePanel};
  backdrop-filter: blur(8px);
  border: 1px solid ${colors.borderLight};
  color: ${colors.placeholder};
  width: 26px;
  height: 26px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  &:hover {
    border-color: ${colors.accentBorder};
    color: ${colors.accent};
    background: ${colors.surfaceDark};
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const ADD_HANDLERS = {
  'point-light':       addPointLight,
  'spot-light':        addSpotLight,
  'directional-light': addDirectionalLight,
  'area-light':        addAreaLight,
  'hemisphere-light':  addHemisphereLight,
  'product-cube':      addProductCube,
  'cyclorama':         addCyclorama,
};

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [showHelp, setShowHelp] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [splitPct, setSplitPct] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [maximized, setMaximized] = useState(null);
  const [outlinerPct, setOutlinerPct] = useState(42);
  const containerRef = useRef(null);
  const rightColRef = useRef(null);
  const fileInputRef = useRef(null);
  const filmstripRef = useRef(null);

  // ─── Scene persistence state ───
  const [sceneName, setSceneName] = useState('Untitled Scene');
  const [activeSceneId, setActiveSceneId] = useState(null);
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState('new'); // new | unsaved| saving | saved| error

  // Mark as unsaved when scene name changes
  const handleSceneNameChange = (name) => {
    setSceneName(name);
    if (saveStatus === 'saved') setSaveStatus('unsaved');
  };

  // Mark as unsaved on any scene mutation
  const markUnsaved = useCallback(() => {
    setSaveStatus(prev => prev === 'saved' ? 'unsaved' : prev);
  }, []);

  const [hasUserChanges, setHasUserChanges] = useState(false);

  const sceneNameRef = useRef(sceneName);
  const activeSceneIdRef = useRef(activeSceneId);
  const userRef = useRef(user);
  const saveStatusRef = useRef(saveStatus);
  const syncedUpdatedAtRef = useRef(null);
  const suppressDirtyRef = useRef(false);
  const dirtyRef = useRef(false);
  const autosaveTimerRef = useRef(null);
  const performSaveRef = useRef(() => {});
  useEffect(() => { sceneNameRef.current = sceneName; }, [sceneName]);
  useEffect(() => { activeSceneIdRef.current = activeSceneId; }, [activeSceneId]);
  useEffect(() => { userRef.current = user; }, [user]);
  useEffect(() => { saveStatusRef.current = saveStatus; }, [saveStatus]);

  // Quietly swap the live scene without flagging it dirty or triggering autosave.
  const loadSnapshotQuietly = useCallback((snapshot) => {
    suppressDirtyRef.current = true;
    restoreFullSnapshot(snapshot);
    suppressDirtyRef.current = false;
  }, []);

  const cancelAutosave = () => {
    if (autosaveTimerRef.current) { clearTimeout(autosaveTimerRef.current); autosaveTimerRef.current = null; }
  };

  useEffect(() => {
    return onSceneChange(() => {
      if (suppressDirtyRef.current) return;
      markUnsaved();
      setHasUserChanges(true);
      dirtyRef.current = true;
      if (!autosaveTimerRef.current && userRef.current) {
        autosaveTimerRef.current = setTimeout(() => {
          autosaveTimerRef.current = null;
          if (dirtyRef.current && userRef.current) performSaveRef.current();
        }, 120000);
      }
    });
  }, [markUnsaved]);

  useEffect(() => {
    const onFocus = async () => {
      const id = activeSceneIdRef.current;
      if (!id || !userRef.current || saveStatusRef.current !== 'saved') return;
      try {
        const rec = await getScene(id);
        if (!rec?.updated_at || rec.updated_at === syncedUpdatedAtRef.current) return;
        syncedUpdatedAtRef.current = rec.updated_at;
        if (rec.scene_data?.snapshot) loadSnapshotQuietly(rec.scene_data.snapshot);
        if (rec.scene_data?.shots && filmstripRef.current?.restoreShots) filmstripRef.current.restoreShots(rec.scene_data.shots);
        setSceneName(rec.name);
        setSaveStatus('saved');
        setHasUserChanges(false);
        window.dispatchEvent(new CustomEvent('studio:select', { detail: null }));
      } catch { /* offline or removed ,keep local copy */ }
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [loadSnapshotQuietly]);

  // Warn before closing/reloading the tab if there are unsaved changes
  useEffect(() => {
    if (!hasUserChanges || saveStatus === 'saved') return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUserChanges, saveStatus]);

  // ─── Save handler ───
  const handleSave = useCallback(async () => {
    const name = sceneName.trim();
    if (!name) return;

    setSaving(true);
    setSaveStatus('saving');

    try {
      const sceneData = {
        snapshot: getSceneSnapshot(),
        shots: filmstripRef.current?.getShots?.() || [],
      };

      let res;
      if (activeSceneId) {
        res = await updateScene(activeSceneId, name, sceneData);
      } else {
        res = await saveScene(name, sceneData);
        setActiveSceneId(res.id);
      }
      if (res?.updated_at) syncedUpdatedAtRef.current = res.updated_at;

      dirtyRef.current = false;
      cancelAutosave();
      setSaveStatus('saved');
      setHasUserChanges(false);
    } catch (err) {
      console.error('Save failed:', err);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  }, [sceneName, activeSceneId]);
  useEffect(() => { performSaveRef.current = handleSave; }, [handleSave]);

  // ─── Load handler ───
  const handleLoad = useCallback((sceneRecord) => {
    dirtyRef.current = false;
    cancelAutosave();
    setActiveSceneId(sceneRecord.id);
    setSceneName(sceneRecord.name);
    syncedUpdatedAtRef.current = sceneRecord.updated_at ?? null;

    const sceneData = sceneRecord.scene_data;

    if (sceneData.snapshot) {
      loadSnapshotQuietly(sceneData.snapshot);
    }

    if (sceneData.shots && filmstripRef.current?.restoreShots) {
      filmstripRef.current.restoreShots(sceneData.shots);
    }

    setSaveStatus('saved');
    setHasUserChanges(false);
    window.dispatchEvent(new CustomEvent('studio:select', { detail: null }));
  }, [loadSnapshotQuietly]);

  // ─── New Scene handler ───
  const handleNewScene = useCallback(() => {
    dirtyRef.current = false;
    cancelAutosave();
    setActiveSceneId(null);
    setSceneName('Untitled Scene');
    setSaveStatus('new');
    syncedUpdatedAtRef.current = null;
    const defaultSnap = getDefaultSnapshot();
    loadSnapshotQuietly(defaultSnap);
    if (filmstripRef.current?.restoreShots) {
      filmstripRef.current.restoreShots([
        { id: 'shot-1', label: 'Shot 1', snapshot: defaultSnap },
      ]);
    }
    setHasUserChanges(false);
    window.dispatchEvent(new CustomEvent('studio:select', { detail: null }));
  }, [loadSnapshotQuietly]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setActiveSceneId(null);
    setSaveStatus('new');
    setSceneName('Untitled Scene');
  };

  const onDividerMouseDown = useCallback((e) => {
    e.preventDefault();
    setDragging(true);
    const onMouseMove = (e) => {
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
    
      setSplitPct(Math.min(Math.max(pct, 15), 85));
    };
    const onMouseUp = () => {
      setDragging(false);
      window.dispatchEvent(new Event('resize'));
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, []);

  const toggleMaximize = (panel) => {
    setMaximized(prev => prev === panel ? null : panel);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
    });
  };

  const onRightDividerMouseDown = useCallback((e) => {
    e.preventDefault();
    setDragging(true);
    const onMouseMove = (e) => {
      const rect = rightColRef.current.getBoundingClientRect();
      const pct = ((e.clientY - rect.top) / rect.height) * 100;
      setOutlinerPct(Math.min(Math.max(pct, 20), 78));
    };
    const onMouseUp = () => {
      setDragging(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, []);

  const handleFileUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    try {
      const newId = await addImportedModel(file);
      if (newId) {
        window.dispatchEvent(new CustomEvent('studio:element-added', { detail: newId }));
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('studio:select', { detail: newId }));
        }, 0);
      }
      markUnsaved();
    } catch (err) {
      console.error('Failed to import model:', err);
    }
  }, [markUnsaved]);

  const handleAdd = (itemId) => {
    if (itemId === 'import-upload') {
      fileInputRef.current?.click();
      return;
    }

    if (itemId === 'import-generate' || itemId === 'import-scan') {
      return;
    }

    const factory = ADD_HANDLERS[itemId];
    if (!factory) return;
    const newId = factory();
    if (newId) {
      window.dispatchEvent(new CustomEvent('studio:element-added', { detail: newId }));
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('studio:select', { detail: newId }));
      }, 0);
    }
    markUnsaved();
  };

  if (!user) return <Auth onLogin={setUser} />;

  const cameraWidth = maximized === 'camera' ? 100 : maximized === 'setup' ? 0 : splitPct;
  const setupWidth  = maximized === 'setup'  ? 100 : maximized === 'camera' ? 0 : 100 - splitPct;
  const showDividerEl = maximized === null;

  return (
    <AppWrapper>
      <Header
        onShowHelp={() => setShowHelp(true)}
        user={user}
        onLogout={handleLogout}
        sceneName={sceneName}
        onSceneNameChange={handleSceneNameChange}
        onSave={handleSave}
        onShowLoad={() => setShowLoadModal(true)}
        onNewScene={handleNewScene}
        onExport={() => setShowExportModal(true)}
        saving={saving}
        saveStatus={saveStatus}
      />
      <HiddenFileInput
        ref={fileInputRef}
        type="file"
        accept=".glb,.gltf"
        onChange={handleFileUpload}
      />
      <ViewsContainer $dragging={dragging}>
        <ViewsArea ref={containerRef}>
          <ViewPanel $width={cameraWidth}>
            <ViewLabel>CAM</ViewLabel>
            <MaximizeBtn onClick={() => toggleMaximize('camera')}>
              {maximized === 'camera' ? '⤡' : '⤢'}
            </MaximizeBtn>
            <CameraView />
          </ViewPanel>
          {showDividerEl && <Divider onMouseDown={onDividerMouseDown} />}
          <ViewPanel $width={setupWidth}>
            <ViewLabel>3D</ViewLabel>
            <MaximizeBtn onClick={() => toggleMaximize('setup')}>
              {maximized === 'setup' ? '⤡' : '⤢'}
            </MaximizeBtn>
            <SetupView />
          </ViewPanel>
        </ViewsArea>
        <RightColumn ref={rightColRef}>
          <OutlinerPane style={{ height: `${outlinerPct}%` }}>
            <Outliner embedded onAdd={handleAdd} />
          </OutlinerPane>
          <HDivider onMouseDown={onRightDividerMouseDown} />
          <InspectorPane>
            <SelectionPanel embedded />
          </InspectorPane>
        </RightColumn>
      </ViewsContainer>
      <Filmstrip ref={filmstripRef} onShotsChange={markUnsaved} />
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {showLoadModal && (
        <SaveLoadManager
          onClose={() => setShowLoadModal(false)}
          onLoad={handleLoad}
        />
      )}
      <ExportDialog
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        sceneName={sceneName}
      />
      <ContextMenu />
      <StatusBar />
    </AppWrapper>
  );
}
