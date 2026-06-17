import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { colors, shadows } from '../styles/theme';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9000;
`;

const Modal = styled.div`
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: 10px;
  padding: 24px;
  min-width: 360px;
  max-width: 420px;
  box-shadow: ${shadows.elevated || '0 12px 32px rgba(0,0,0,0.4)'};
`;

const Title = styled.h3`
  margin: 0 0 4px 0;
  font-size: 14px;
  color: ${colors.text};
`;

const Subtitle = styled.p`
  margin: 0 0 16px 0;
  font-size: 11px;
  color: ${colors.textMuted};
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
`;

const Label = styled.label`
  font-size: 11px;
  color: ${colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const PresetRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
`;

const PresetBtn = styled.button`
  padding: 10px 8px;
  background: ${({ $active }) => $active ? colors.accentSubtle : 'transparent'};
  border: 1px solid ${({ $active }) => $active ? colors.accent : colors.border};
  border-radius: 6px;
  color: ${({ $active }) => $active ? colors.accent : colors.text};
  cursor: pointer;
  font-size: 12px;
  transition: all 0.15s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;

  &:hover {
    border-color: ${colors.accent};
  }
`;

const PresetLabel = styled.span`
  font-weight: 600;
`;

const PresetDim = styled.span`
  font-size: 10px;
  color: ${colors.textMuted};
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
`;

const Btn = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  border: 1px solid ${colors.border};
  background: transparent;
  color: ${colors.text};
  transition: all 0.15s;

  &:hover { border-color: ${colors.accent}; color: ${colors.accent}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const PrimaryBtn = styled(Btn)`
  background: ${colors.accent};
  color: white;
  border-color: ${colors.accent};

  &:hover { filter: brightness(1.1); border-color: ${colors.accent}; color: white; }
  &:disabled { background: ${colors.accent}; opacity: 0.5; }
`;

const RESOLUTIONS = [
  { key: '720p',  label: 'HD',   w: 1280, h: 720 },
  { key: '1080p', label: 'Full HD', w: 1920, h: 1080 },
  { key: '4k',    label: '4K',   w: 3840, h: 2160 },
];

export default function ExportDialog({ open, onClose, sceneName }) {
  const [resKey, setResKey] = useState('1080p');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!open) setExporting(false);
  }, [open]);

  if (!open) return null;

  const resolution = RESOLUTIONS.find(r => r.key === resKey) || RESOLUTIONS[1];

  const handleExport = () => {
    setExporting(true);
    const safeName = (sceneName || 'scene').trim().replace(/[^\w\-]+/g, '-').replace(/^-+|-+$/g, '') || 'scene';
    const filename = `${safeName}_${resolution.w}x${resolution.h}.png`;

    const cleanup = () => {
      window.removeEventListener('studio:export-complete', onDone);
      window.removeEventListener('studio:export-error', onError);
    };
    const onDone = () => { cleanup(); setExporting(false); onClose(); };
    const onError = () => { cleanup(); setExporting(false); };

    window.addEventListener('studio:export-complete', onDone);
    window.addEventListener('studio:export-error', onError);

    window.dispatchEvent(new CustomEvent('studio:request-export', {
      detail: { width: resolution.w, height: resolution.h, filename }
    }));
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Title>Export camera view</Title>
        <Subtitle>Render the current shot as a PNG image.</Subtitle>

        <Field>
          <Label>Resolution</Label>
          <PresetRow>
            {RESOLUTIONS.map(r => (
              <PresetBtn key={r.key} $active={resKey === r.key} onClick={() => setResKey(r.key)}>
                <PresetLabel>{r.label}</PresetLabel>
                <PresetDim>{r.w} × {r.h}</PresetDim>
              </PresetBtn>
            ))}
          </PresetRow>
        </Field>

        <Actions>
          <Btn onClick={onClose} disabled={exporting}>Cancel</Btn>
          <PrimaryBtn onClick={handleExport} disabled={exporting}>
            {exporting ? 'Rendering…' : 'Export PNG'}
          </PrimaryBtn>
        </Actions>
      </Modal>
    </Overlay>
  );
}
