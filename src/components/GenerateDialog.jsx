import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { colors, shadows } from '../styles/theme';
import { addImportedModel } from '../scene/sharedScene';
import {
  startImageTo3D,
  getImageTo3D,
  fetchGeneratedModel,
  getGenerationUsage,
  purchaseCredits,
} from '../api';

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
  width: 420px;
  max-width: calc(100vw - 32px);
  box-shadow: ${shadows.elevated || '0 12px 32px rgba(0,0,0,0.4)'};
`;

const TitleRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
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
  line-height: 1.5;
`;

const CloseBtn = styled.button`
  background: transparent;
  border: none;
  color: ${colors.textDim};
  font-size: 16px;
  cursor: pointer;
  line-height: 1;
  padding: 0 2px;
  &:hover { color: ${colors.text}; }
`;

const Drop = styled.button`
  width: 100%;
  border: 1px dashed ${colors.borderHover};
  background: ${colors.surfaceHover};
  border-radius: 8px;
  color: ${colors.textMuted};
  font-family: inherit;
  font-size: 12px;
  padding: 22px 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  transition: all 0.15s;
  &:hover { border-color: ${colors.accent}; color: ${colors.accent}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const Preview = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid ${colors.border};
  img { display: block; width: 100%; max-height: 220px; object-fit: contain; background: ${colors.sceneBg}; }
`;

const ChangeBtn = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: ${colors.surfaceOverlay};
  border: 1px solid ${colors.border};
  color: ${colors.text};
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  &:hover { border-color: ${colors.accent}; color: ${colors.accent}; }
`;

const Label = styled.label`
  font-size: 11px;
  color: ${colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: block;
  margin: 16px 0 6px;
`;

const TextInput = styled.input`
  width: 100%;
  background: ${colors.surfaceHover};
  border: 1px solid ${colors.border};
  border-radius: 6px;
  color: ${colors.text};
  font-family: inherit;
  font-size: 12px;
  padding: 9px 10px;
  outline: none;
  &:focus { border-color: ${colors.accent}; }
  &::placeholder { color: ${colors.placeholder}; }
  &:disabled { opacity: 0.5; }
`;

const Note = styled.p`
  font-size: 10px;
  color: ${colors.textDim};
  line-height: 1.5;
  margin: 10px 0 0;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
`;

const Btn = styled.button`
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  background: ${({ $primary }) => ($primary ? colors.accent : 'transparent')};
  border: 1px solid ${({ $primary }) => ($primary ? colors.accent : colors.border)};
  color: ${({ $primary }) => ($primary ? colors.textOnAccent : colors.textMuted)};
  &:hover { ${({ $primary }) => ($primary ? `background:${colors.accentHover};` : `border-color:${colors.accent};color:${colors.accent};`)} }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const Progress = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 18px 0 6px;
`;

const Bar = styled.div`
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: ${colors.surfaceStrong};
  overflow: hidden;
`;

const Fill = styled.div`
  height: 100%;
  background: ${colors.accent};
  width: ${({ $pct }) => $pct}%;
  transition: width 0.4s ease;
`;

const StatusText = styled.div`
  font-size: 12px;
  color: ${colors.text};
`;

const ErrorText = styled.div`
  font-size: 12px;
  color: ${colors.danger};
  line-height: 1.5;
  padding: 8px 0 0;
`;

const SuccessText = styled.div`
  font-size: 12px;
  color: ${colors.success || '#4caf50'};
  padding: 6px 0 0;
`;

const UsageRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 14px;
  font-size: 11px;
  color: ${colors.textDim};
`;

const BuyLink = styled.span`
  color: ${colors.accent};
  cursor: pointer;
  font-weight: 600;
  &:hover { text-decoration: underline; }
`;

const ToggleRow = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  font-size: 11px;
  color: ${colors.textMuted};
  cursor: pointer;
  input { accent-color: ${colors.accent}; cursor: pointer; }
`;

const OutOfCredits = styled.div`
  margin-top: 14px;
  padding: 12px 14px;
  border: 1px solid ${colors.border};
  border-radius: 8px;
  background: ${colors.surfaceHover};
  font-size: 12px;
  color: ${colors.textMuted};
  line-height: 1.5;
`;

const Pack = styled.button`
  width: 100%;
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: inherit;
  margin-top: 10px;
  padding: 12px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  background: ${({ $sel }) => ($sel ? colors.accentSubtle : colors.surfaceHover)};
  border: 1px solid ${({ $sel }) => ($sel ? colors.accent : colors.border)};
  &:hover { border-color: ${colors.accent}; }
`;

const PackMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const PackName = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${colors.text};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PackSub = styled.span`
  font-size: 11px;
  color: ${colors.textDim};
`;

const PackPrice = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: ${colors.text};
`;

const Badge = styled.span`
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: ${colors.textOnAccent};
  background: ${colors.accent};
  padding: 2px 6px;
  border-radius: 4px;
`;

const POLL_MS = 4000;
const TIMEOUT_MS = 600000;

const fileToDataUri = (file, maxDim = 1024) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onerror = reject;
  reader.onload = () => {
    const img = new Image();
    img.onerror = reject;
    img.onload = () => {
      let { width, height } = img;
      if (Math.max(width, height) > maxDim) {
        const s = maxDim / Math.max(width, height);
        width = Math.round(width * s);
        height = Math.round(height * s);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

const tinyImage = () => {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#888888';
  ctx.fillRect(0, 0, 64, 64);
  return c.toDataURL('image/jpeg', 0.8);
};

export default function GenerateDialog({ open, onClose }) {
  const [phase, setPhase] = useState('idle');
  const [imageDataUri, setImageDataUri] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [testMode, setTestMode] = useState(false);
  const [usage, setUsage] = useState(null);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [buying, setBuying] = useState(false);
  const [selectedPack, setSelectedPack] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [buyError, setBuyError] = useState('');
  const [purchasedMsg, setPurchasedMsg] = useState('');

  const fileRef = useRef(null);
  const activeRef = useRef(false);
  const timerRef = useRef(null);
  const testRef = useRef(false);

  const stopPolling = () => {
    activeRef.current = false;
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  };

  useEffect(() => () => stopPolling(), []);

  useEffect(() => {
    if (!open) { stopPolling(); return; }
    setPhase('idle');
    setImageDataUri(null);
    setPrompt('');
    setTestMode(false);
    setProgress(0);
    setStatusText('');
    setErrorMsg('');
    setBuying(false);
    setSelectedPack(null);
    setBuyError('');
    setPurchasedMsg('');
    setUsage(null);
    getGenerationUsage().then(setUsage).catch(() => setUsage(null));
  }, [open]);

  if (!open) return null;

  const handleClose = () => { stopPolling(); onClose(); };

  const handlePick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      setImageDataUri(await fileToDataUri(file));
    } catch {
      setErrorMsg('Could not read that image.');
      setPhase('error');
    }
  };

  const fail = (msg) => {
    stopPolling();
    setErrorMsg(msg);
    setPhase('error');
  };

  const openBuy = () => { setBuying(true); setSelectedPack(null); setBuyError(''); };

  const handleBuy = async () => {
    if (!selectedPack) return;
    setPurchasing(true);
    setBuyError('');
    try {
      const r = await purchaseCredits(selectedPack);
      setUsage((prev) => (prev ? { ...prev, used: r.used, limit: r.limit, remaining: r.remaining } : prev));
      setBuying(false);
      setSelectedPack(null);
      setPurchasedMsg(`Added ${r.added} credits.`);
      setTimeout(() => setPurchasedMsg(''), 4000);
    } catch (err) {
      setBuyError(err.message || 'Purchase failed.');
    } finally {
      setPurchasing(false);
    }
  };

  const poll = async (taskId, elapsed) => {
    if (!activeRef.current) return;
    try {
      const s = await getImageTo3D(taskId, testRef.current);
      if (!activeRef.current) return;
      setProgress(s.progress || 0);

      if (s.status === 'SUCCEEDED') {
        setStatusText('Downloading model…');
        const blob = await fetchGeneratedModel(taskId, testRef.current);
        if (!activeRef.current) return;
        const file = new File([blob], 'Generated Model.glb', { type: 'model/gltf-binary' });
        const newId = await addImportedModel(file);
        window.dispatchEvent(new CustomEvent('studio:element-added', { detail: newId }));
        setTimeout(() => window.dispatchEvent(new CustomEvent('studio:select', { detail: newId })), 0);
        stopPolling();
        onClose();
        return;
      }
      if (s.status === 'FAILED' || s.status === 'CANCELED') {
        fail(s.error || 'Generation failed. Try a clearer photo of a single object.');
        return;
      }
      if (elapsed > TIMEOUT_MS) {
        fail('This is taking longer than expected. Try again.');
        return;
      }
      setStatusText(s.status === 'PENDING' ? 'Queued…' : 'Generating 3D model…');
      timerRef.current = setTimeout(() => poll(taskId, elapsed + POLL_MS), POLL_MS);
    } catch (err) {
      fail(err.message || 'Something went wrong.');
    }
  };

  const handleGenerate = async () => {
    const useTest = testMode && usage?.testAvailable;
    const image = imageDataUri || (useTest ? tinyImage() : null);
    if (!image) return;

    testRef.current = useTest;
    setPhase('generating');
    setProgress(0);
    setStatusText('Starting…');
    activeRef.current = true;
    try {
      const { taskId } = await startImageTo3D(image, prompt, useTest);
      if (!taskId) { fail('Could not start the generation.'); return; }
      poll(taskId, 0);
    } catch (err) {
      if (err?.data?.limitReached) {
        setPhase('idle');
        setUsage((prev) => (prev ? { ...prev, remaining: 0 } : prev));
        openBuy();
        return;
      }
      fail(err.message || 'Could not start the generation.');
    }
  };

  const isTest = testMode && usage?.testAvailable;
  const outOfCredits = usage && !isTest && usage.remaining <= 0;
  const canGenerate = (!!imageDataUri || isTest) && !outOfCredits;

  let title = 'Generate 3D from Photo';
  let subtitle = 'Upload a clear photo of a single object and we build a 3D model from it.';
  if (buying) {
    title = 'Buy credits';
    subtitle = 'Each credit is one generation. Credits never expire.';
  }

  return (
    <Overlay onMouseDown={(e) => { if (e.target === e.currentTarget && phase !== 'generating' && !purchasing) handleClose(); }}>
      <Modal>
        <TitleRow>
          <div>
            <Title>{title}</Title>
            <Subtitle>{subtitle}</Subtitle>
          </div>
          {phase !== 'generating' && <CloseBtn onClick={handleClose} title="Close">×</CloseBtn>}
        </TitleRow>

        {buying ? (
          <>
            {(usage?.packs || []).map((p) => (
              <Pack key={p.id} $sel={selectedPack === p.id} onClick={() => setSelectedPack(p.id)}>
                <PackMain>
                  <PackName>{p.label} {p.best && <Badge>Best value</Badge>}</PackName>
                  <PackSub>{p.credits} generations</PackSub>
                </PackMain>
                <PackPrice>{p.price}</PackPrice>
              </Pack>
            ))}
            {buyError && <ErrorText>{buyError}</ErrorText>}
            <Note>Simulated checkout for now — real card payment plugs in here later.</Note>
            <Actions>
              <Btn onClick={() => { setBuying(false); setBuyError(''); }}>Back</Btn>
              <Btn $primary disabled={!selectedPack || purchasing} onClick={handleBuy}>
                {purchasing ? 'Processing…' : 'Buy credits'}
              </Btn>
            </Actions>
          </>
        ) : phase === 'generating' ? (
          <Progress>
            <Bar><Fill $pct={progress} /></Bar>
            <StatusText>{statusText} {progress > 0 && progress < 100 ? `${progress}%` : ''}</StatusText>
            <Note>{testRef.current ? 'Test mode — returns a sample model, no credits used.' : 'This usually takes 1–3 minutes. You can keep this open.'}</Note>
          </Progress>
        ) : phase === 'error' ? (
          <>
            <ErrorText>{errorMsg}</ErrorText>
            <Actions>
              <Btn onClick={handleClose}>Close</Btn>
              <Btn $primary onClick={() => { setErrorMsg(''); setPhase('idle'); }}>Back</Btn>
            </Actions>
          </>
        ) : (
          <>
            {imageDataUri ? (
              <Preview>
                <img src={imageDataUri} alt="Selected" />
                <ChangeBtn onClick={() => fileRef.current?.click()}>Change</ChangeBtn>
              </Preview>
            ) : (
              <Drop onClick={() => fileRef.current?.click()}>
                <span style={{ fontSize: 22 }}>⬡</span>
                {isTest ? 'Optional in test mode — choose a photo or just Generate' : 'Choose a photo (JPG or PNG)'}
              </Drop>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png"
              style={{ display: 'none' }}
              onChange={handlePick}
            />

            <Label>Texture hint (optional)</Label>
            <TextInput
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. matte black ceramic mug"
              disabled={isTest}
            />

            {usage?.testAvailable && (
              <ToggleRow>
                <input type="checkbox" checked={testMode} onChange={(e) => setTestMode(e.target.checked)} />
                Test mode — free, always returns a sample model (no credits used)
              </ToggleRow>
            )}

            {purchasedMsg && <SuccessText>✓ {purchasedMsg}</SuccessText>}

            {outOfCredits ? (
              <OutOfCredits>
                You're out of credits. {usage?.canBuy ? <BuyLink onClick={openBuy}>Buy more</BuyLink> : 'Add a paid plan to continue.'}
                {usage?.testAvailable ? ' Or switch on Test mode to keep building for free.' : ''}
              </OutOfCredits>
            ) : (
              usage && (
                <UsageRow>
                  <span>
                    {isTest ? 'Test mode active — unlimited' : `${usage.remaining} of ${usage.limit} credits left`}
                  </span>
                  {usage.canBuy && <BuyLink onClick={openBuy}>Buy credits</BuyLink>}
                </UsageRow>
              )
            )}

            <Actions>
              <Btn onClick={handleClose}>Cancel</Btn>
              <Btn $primary disabled={!canGenerate} onClick={handleGenerate}>Generate</Btn>
            </Actions>
          </>
        )}
      </Modal>
    </Overlay>
  );
}
