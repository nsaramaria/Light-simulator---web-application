import React, { useState, useRef, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import CameraView from './scene/CameraView';
import SetupView from './scene/SetupView';
import SelectionPanel from './components/SelectionPanel';
import Header from './components/Header';
import HelpModal from './components/Help';
import ContextMenu from './components/ContextMenu';
import Entry from './components/Entry';
import StatusBar from './components/StatusBar';
import Filmstrip from './components/Filmstrip';
import SaveLoadManager from './components/SaveLoadManager';
import ExportDialog from './components/ExportDialog';
import Feedback from './components/Feedback';
import Outliner from './components/Outliner';
import GenerateDialog from './components/GenerateDialog';
import {
  addPointLight, addSpotLight, addDirectionalLight, addAreaLight,
  addHemisphereLight, addProductCube, addCyclorama, addImportedModel,
  getSceneSnapshot, restoreFullSnapshot, getDefaultSnapshot, onSceneChange,
} from './scene/sharedScene';
import { saveScene, updateScene, getScene } from './api';
import { colors, shadows } from './styles/theme';

const AppWrapper = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  background: ${colors.bg};
  animation: appin .22s ease both;
`;

const ViewsContainer = styled.div`
  flex: 1;
  display: flex;
  gap: 12px;
  min-height: 0;
  user-select: ${({ $dragging }) => $dragging ? 'none' : 'auto'};
`;

const ViewsArea = styled.div`
  flex: 1;
  min-width: 0;
  height: 100%;
  display: flex;
  gap: 12px;
  position: relative;
`;

const ViewPanel = styled.div`
  position: relative;
  width: ${({ $width }) => $width}%;
  min-width: 0;
  height: 100%;
  overflow: hidden;
  border-radius: ${'20px'};
  background: radial-gradient(75% 65% at 35% 26%, #ffffff, #eef0fb 72%);
  box-shadow: ${shadows.cardSm};
  display: ${({ $width }) => $width === 0 ? 'none' : 'block'};
`;

const Divider = styled.div`
  width: 6px;
  height: 100%;
  background: transparent;
  cursor: col-resize;
  flex-shrink: 0;
  border-radius: 999px;
  transition: background 0.15s;
  position: relative;
  &:hover, &:active { background: ${colors.periSoft}; }
  &::after {
    content: '';
    position: absolute;
    width: 14px;
    height: 100%;
    left: -4px;
    cursor: col-resize;
  }
`;

const RightColumn = styled.div`
  width: 280px;
  flex-shrink: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 7px;
`;

const OutlinerPane = styled.div`
  flex-shrink: 0;
  min-height: 90px;
  display: flex;
  background: ${colors.card};
  border-radius: ${'20px'};
  box-shadow: ${shadows.cardSm};
  overflow: hidden;
`;

const InspectorPane = styled.div`
  flex: 1;
  min-height: 90px;
  overflow: hidden;
  display: flex;
  background: ${colors.card};
  border-radius: ${'20px'};
  box-shadow: ${shadows.cardSm};
`;

const HDivider = styled.div`
  height: 6px;
  flex-shrink: 0;
  background: transparent;
  cursor: row-resize;
  border-radius: 999px;
  transition: background 0.15s;
  position: relative;
  &:hover, &:active { background: ${colors.periSoft}; }
  &::after {
    content: '';
    position: absolute;
    height: 14px;
    width: 100%;
    top: -4px;
    cursor: row-resize;
  }
`;

const ViewLabel = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  background: #fff;
  color: ${colors.ink2};
  padding: 5px 11px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  box-shadow: ${shadows.cardSm};
  z-index: 10;
`;

const MaximizeBtn = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  background: #fff;
  border: none;
  color: ${colors.ink2};
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${shadows.cardSm};
  transition: all 0.15s;
  svg { width: 15px; height: 15px; }
  &:hover { color: ${colors.peri}; transform: translateY(-1px); }
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
  const [showGenerate, setShowGenerate] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
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
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('new'); // new | unsaved | saving | saved | error

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

  // Refs mirror state for use inside one-time listeners (autosave / focus sync)
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

  // Quietly swap the live scene without flagging it dirty or triggering autosave
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
      } catch { /* offline or removed , keep local copy */ }
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [loadSnapshotQuietly]);

  // Warn before closing/reloading the tab if there are unsaved changes.
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
        snapshot: getSceneSnapshot({ embedModels: true }),
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

    if (itemId === 'import-generate') {
      setShowGenerate(true);
      return;
    }

    if (itemId === 'import-scan') {
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

  if (!user) return <Entry onLogin={setUser} />;

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
        onAdd={handleAdd}
        onShowFeedback={() => setShowFeedback(true)}
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
            <ViewLabel>Camera</ViewLabel>
            <MaximizeBtn onClick={() => toggleMaximize('camera')} title={maximized === 'camera' ? 'Restore' : 'Maximize'}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" /></svg>
            </MaximizeBtn>
            <CameraView />
          </ViewPanel>
          {showDividerEl && <Divider onMouseDown={onDividerMouseDown} />}
          <ViewPanel $width={setupWidth}>
            <ViewLabel>3D Setup</ViewLabel>
            <MaximizeBtn onClick={() => toggleMaximize('setup')} title={maximized === 'setup' ? 'Restore' : 'Maximize'}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" /></svg>
            </MaximizeBtn>
            <SetupView />
          </ViewPanel>
        </ViewsArea>
        <RightColumn ref={rightColRef}>
          <OutlinerPane style={{ height: `${outlinerPct}%` }}>
            <Outliner embedded />
          </OutlinerPane>
          <HDivider onMouseDown={onRightDividerMouseDown} />
          <InspectorPane>
            <SelectionPanel embedded />
          </InspectorPane>
        </RightColumn>
      </ViewsContainer>
      <Filmstrip ref={filmstripRef} onShotsChange={markUnsaved} />
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {showFeedback && <Feedback onClose={() => setShowFeedback(false)} />}
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
      <GenerateDialog open={showGenerate} onClose={() => setShowGenerate(false)} />
      <ContextMenu />
      <StatusBar />
    </AppWrapper>
  );
}
