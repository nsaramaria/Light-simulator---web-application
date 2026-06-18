import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { colors, shadows } from '../styles/theme';

const FEEDBACK_ENDPOINT = '';
const CONTACT_EMAIL = 'hello@yourstudio.app';
const COMMUNITY_LINKS = [
  { id: 'discord',     label: 'Discord',       sub: 'Chat, share setups, get help', url: '', color: '#5865F2' },
  { id: 'github',      label: 'GitHub',        sub: 'Star the repo and report issues', url: '', color: '#17171C' },
];

const TYPES = [
  { id: 'idea',   label: 'Idea' },
  { id: 'bug',    label: 'Bug' },
  { id: 'praise', label: 'Praise' },
  { id: 'other',  label: 'Other' },
];

const fade = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const pop = keyframes`from { opacity: 0; transform: translateY(10px) scale(.98); } to { opacity: 1; transform: none; }`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(26, 22, 48, 0.42);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9000;
  padding: 20px;
  animation: ${fade} .16s ease;
`;

const Modal = styled.div`
  width: 460px;
  max-width: 100%;
  max-height: 90vh;
  overflow: hidden;
  background: ${colors.card};
  border-radius: 22px;
  box-shadow: ${shadows.modal};
  display: flex;
  flex-direction: column;
  animation: ${pop} .2s cubic-bezier(.2,1,.3,1);
`;

const Head = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 22px 22px 0;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: ${colors.ink};
`;

const Subtitle = styled.p`
  margin: 4px 0 0;
  font-size: 13px;
  color: ${colors.textMuted};
`;

const CloseBtn = styled.button`
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: ${colors.periTint};
  color: ${colors.ink2};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: .14s;
  &:hover { background: #E0E5FD; }
  svg { width: 15px; height: 15px; }
`;

const Tabs = styled.div`
  display: flex;
  gap: 4px;
  margin: 18px 22px 0;
  padding: 4px;
  background: ${colors.periTint};
  border-radius: 12px;
`;

const Tab = styled.button`
  flex: 1;
  padding: 9px;
  border: none;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  color: ${({ $active }) => $active ? colors.ink : colors.textMuted};
  background: ${({ $active }) => $active ? '#fff' : 'transparent'};
  box-shadow: ${({ $active }) => $active ? shadows.cardSm : 'none'};
  transition: .12s;
`;

const Body = styled.div`
  padding: 18px 22px 22px;
  overflow-y: auto;
`;

const FieldLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${colors.ink2};
  margin-bottom: 8px;
`;

const TypeRow = styled.div`
  display: flex;
  gap: 7px;
  margin-bottom: 16px;
`;

const TypePill = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 6px;
  border-radius: 10px;
  font-size: 12.5px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  border: 1.5px solid ${({ $active }) => $active ? colors.accent : colors.border};
  background: ${({ $active }) => $active ? colors.accentFaint : 'transparent'};
  color: ${({ $active }) => $active ? colors.accent : colors.text};
  transition: .12s;
  svg { width: 14px; height: 14px; }
  &:hover { border-color: ${colors.accent}; }
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 112px;
  resize: vertical;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1.5px solid ${colors.border};
  background: ${colors.accentFaint};
  font-family: inherit;
  font-size: 13.5px;
  color: ${colors.ink};
  outline: none;
  transition: .14s;
  &::placeholder { color: ${colors.placeholder}; }
  &:focus { background: #fff; border-color: ${colors.accent}; box-shadow: 0 0 0 4px ${colors.accentFaint}; }
`;

const Input = styled.input`
  width: 100%;
  padding: 11px 14px;
  margin-top: 12px;
  border-radius: 12px;
  border: 1.5px solid ${colors.border};
  background: ${colors.accentFaint};
  font-family: inherit;
  font-size: 13.5px;
  color: ${colors.ink};
  outline: none;
  transition: .14s;
  &::placeholder { color: ${colors.placeholder}; }
  &:focus { background: #fff; border-color: ${colors.accent}; box-shadow: 0 0 0 4px ${colors.accentFaint}; }
`;

const ErrorMsg = styled.div`
  margin-top: 10px;
  font-size: 12px;
  color: ${colors.danger};
`;

const Submit = styled.button`
  width: 100%;
  margin-top: 16px;
  padding: 13px;
  border: none;
  border-radius: 999px;
  background: ${colors.ink};
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  box-shadow: ${shadows.btnSm};
  transition: transform .12s, box-shadow .12s, opacity .12s;
  &:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 5px 0 #050509; }
  &:active:not(:disabled) { transform: translateY(3px); box-shadow: ${shadows.btnActive}; }
  &:disabled { opacity: .6; cursor: default; }
`;

const Success = styled.div`
  text-align: center;
  padding: 18px 6px 8px;
`;

const Check = styled.div`
  width: 56px;
  height: 56px;
  margin: 0 auto 14px;
  border-radius: 50%;
  background: ${colors.accentFaint};
  color: ${colors.accent};
  display: flex;
  align-items: center;
  justify-content: center;
  svg { width: 28px; height: 28px; }
`;

const SuccessTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${colors.ink};
`;

const SuccessSub = styled.div`
  font-size: 13px;
  color: ${colors.textMuted};
  margin-top: 5px;
  line-height: 1.5;
`;

const TextBtn = styled.button`
  margin-top: 16px;
  background: none;
  border: none;
  color: ${colors.accent};
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
`;

const Blurb = styled.p`
  margin: 0 0 16px;
  font-size: 13.5px;
  line-height: 1.5;
  color: ${colors.ink2};
`;

const LinkCard = styled.a`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid ${colors.border};
  text-decoration: none;
  margin-bottom: 9px;
  transition: .14s;
  &:hover { border-color: ${colors.accent}; background: ${colors.accentFaint}; transform: translateY(-1px); }
`;

const LinkTile = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 11px;
  flex-shrink: 0;
  background: ${({ $color }) => $color};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  svg { width: 19px; height: 19px; }
`;

const LinkTextWrap = styled.div`
  flex: 1;
  min-width: 0;
`;

const LinkLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${colors.ink};
`;

const LinkSub = styled.div`
  font-size: 12px;
  color: ${colors.textMuted};
`;

const Arrow = styled.span`
  color: ${colors.textDim};
  display: inline-flex;
  svg { width: 16px; height: 16px; }
`;

const Placeholder = styled.div`
  text-align: center;
  padding: 24px;
  font-size: 13px;
  color: ${colors.textMuted};
`;

const TypeIcon = ({ id }) => {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (id === 'idea') return <svg viewBox="0 0 24 24" {...p}><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.5.5 1 1.2 1 2h6c0-.8.5-1.5 1-2A6 6 0 0 0 12 3Z" /></svg>;
  if (id === 'bug') return <svg viewBox="0 0 24 24" {...p}><rect x="8" y="6" width="8" height="12" rx="4" /><path d="M8 10H4M20 10h-4M8 14H4M20 14h-4M9 6 8 4M15 6l1-2" /></svg>;
  if (id === 'praise') return <svg viewBox="0 0 24 24" {...p}><path d="M12 20s-7-4.3-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.7-7 9-7 9Z" /></svg>;
  return <svg viewBox="0 0 24 24" {...p}><path d="M21 11.5a8.5 8.5 0 0 1-12.5 7.5L3 20l1-5A8.5 8.5 0 1 1 21 11.5Z" /></svg>;
};

const CommunityIcon = ({ id }) => {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (id === 'discord') return <svg viewBox="0 0 24 24" {...p}><path d="M8 7.5c1-.5 2-.8 3-.8M16 7.5c-1-.5-2-.8-3-.8M7 17c-1.6-3-1.6-6.5 0-9.5M17 17c1.6-3 1.6-6.5 0-9.5M7 17c1.4 1 3 1.4 5 1.4s3.6-.4 5-1.4" /><circle cx="9.5" cy="12" r="1.1" fill="currentColor" stroke="none" /><circle cx="14.5" cy="12" r="1.1" fill="currentColor" stroke="none" /></svg>;
  return <svg viewBox="0 0 24 24" {...p}><path d="M9 19c-4 1.2-4-2-6-2.5M15 21v-3.5c0-1 .1-1.4-.5-2 2.8-.3 4.5-1.4 4.5-5 0-1.2-.4-2.1-1-2.9.1-.3.4-1.4-.1-2.9 0 0-1-.3-3.4 1.2a11.5 11.5 0 0 0-6 0C5.6 2.2 4.6 2.5 4.6 2.5c-.5 1.5-.2 2.6-.1 2.9-.6.8-1 1.7-1 2.9 0 3.6 1.7 4.7 4.5 5-.4.4-.5.9-.5 1.6V21" /></svg>;
};

export default function Feedback({ onClose }) {
  const [tab, setTab] = useState('feedback');
  const [type, setType] = useState('idea');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const links = COMMUNITY_LINKS.filter(l => l.url);

  const send = async () => {
    if (!message.trim()) { setError('Please add a quick note first.'); return; }
    setError('');
    setStatus('sending');
    try {
      if (FEEDBACK_ENDPOINT) {
        const res = await fetch(FEEDBACK_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ type, message, email, source: 'LightSimulator' }),
        });
        if (!res.ok) throw new Error('send failed');
      } else {
        const subject = encodeURIComponent(`[Studio feedback] ${type}`);
        const lines = email ? `${message}\n\nReply to: ${email}` : message;
        window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${encodeURIComponent(lines)}`;
      }
      setStatus('done');
    } catch (e) {
      setStatus('idle');
      setError('Something went wrong. Please try again, or email us directly.');
    }
  };

  const reset = () => { setStatus('idle'); setMessage(''); setEmail(''); setType('idea'); setError(''); };

  return (
    <Overlay onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <Modal>
        <Head>
          <div>
            <Title>Help shape the studio</Title>
            <Subtitle>Tell us what you think, or join the community.</Subtitle>
          </div>
          <CloseBtn onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></svg>
          </CloseBtn>
        </Head>

        <Tabs>
          <Tab $active={tab === 'feedback'} onClick={() => setTab('feedback')}>Feedback</Tab>
          <Tab $active={tab === 'community'} onClick={() => setTab('community')}>Community</Tab>
        </Tabs>

        <Body>
          {tab === 'feedback' ? (
            status === 'done' ? (
              <Success>
                <Check>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </Check>
                <SuccessTitle>Thanks for the feedback!</SuccessTitle>
                <SuccessSub>We read every note, and it genuinely helps shape what comes next.</SuccessSub>
                <TextBtn onClick={reset}>Send another</TextBtn>
              </Success>
            ) : (
              <>
                <FieldLabel>What kind of feedback?</FieldLabel>
                <TypeRow>
                  {TYPES.map(t => (
                    <TypePill key={t.id} $active={type === t.id} onClick={() => setType(t.id)}>
                      <TypeIcon id={t.id} />{t.label}
                    </TypePill>
                  ))}
                </TypeRow>
                <FieldLabel>Your message</FieldLabel>
                <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="What do you love, what's missing, or what broke?" />
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email (optional, if you'd like a reply)" />
                {error && <ErrorMsg>{error}</ErrorMsg>}
                <Submit onClick={send} disabled={status === 'sending'}>
                  {status === 'sending' ? 'Sending…' : 'Send feedback'}
                </Submit>
              </>
            )
          ) : (
            <>
              <Blurb>Join other photographers and builders to share lighting setups, get help, and help steer where the studio goes next.</Blurb>
              {links.length > 0 ? links.map(l => (
                <LinkCard key={l.id} href={l.url} target="_blank" rel="noopener noreferrer">
                  <LinkTile $color={l.color}><CommunityIcon id={l.id} /></LinkTile>
                  <LinkTextWrap>
                    <LinkLabel>{l.label}</LinkLabel>
                    <LinkSub>{l.sub}</LinkSub>
                  </LinkTextWrap>
                  <Arrow>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M9 7h8v8" /></svg>
                  </Arrow>
                </LinkCard>
              )) : (
                <Placeholder>Community links are coming soon.</Placeholder>
              )}
            </>
          )}
        </Body>
      </Modal>
    </Overlay>
  );
}
