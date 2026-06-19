import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { colors, shadows } from '../styles/theme';

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
  width: 580px;
  max-width: 100%;
  max-height: 88vh;
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
  padding: 22px 24px 16px;
  border-bottom: 1px solid ${colors.border};
`;

const Title = styled.h2`
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

const Body = styled.div`
  padding: 20px 24px;
  overflow-y: auto;
  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-thumb { background: ${colors.scrollThumb}; border-radius: 999px; }
`;

const Section = styled.section`
  & + & { margin-top: 22px; }
`;

const SectionTitle = styled.h3`
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 700;
  color: ${colors.ink};
`;

const Tip = styled.p`
  margin: 0;
  font-size: 13.5px;
  line-height: 1.55;
  color: ${colors.ink2};
  & + & { margin-top: 7px; }
`;

const Strong = styled.span`
  font-weight: 600;
  color: ${colors.ink};
`;

const Shortcuts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 9px;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const Keys = styled.div`
  flex-shrink: 0;
  width: 132px;
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
`;

const Kbd = styled.kbd`
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 600;
  color: ${colors.ink2};
  background: ${colors.periTint};
  border: 1px solid ${colors.border};
  border-radius: 7px;
  padding: 3px 8px;
  line-height: 1;
`;

const Sep = styled.span`
  font-size: 12px;
  color: ${colors.textDim};
`;

const Desc = styled.div`
  flex: 1;
  font-size: 13px;
  color: ${colors.ink2};
`;

const Note = styled.p`
  margin: 14px 0 0;
  font-size: 12px;
  color: ${colors.textMuted};
  font-style: italic;
`;

const Footer = styled.div`
  padding: 14px 24px;
  border-top: 1px solid ${colors.border};
  display: flex;
  justify-content: flex-end;
`;

const GotIt = styled.button`
  padding: 11px 22px;
  border: none;
  border-radius: 999px;
  background: ${colors.ink};
  color: #fff;
  font-size: 13.5px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  box-shadow: ${shadows.btnSm};
  transition: transform .12s, box-shadow .12s;
  &:hover { transform: translateY(-1px); box-shadow: 0 5px 0 #050509; }
  &:active { transform: translateY(3px); box-shadow: ${shadows.btnActive}; }
`;

export default function HelpModal({ onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <Overlay onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <Modal>
        <Head>
          <div>
            <Title>How to use the studio</Title>
            <Subtitle>The essentials, plus a few things worth knowing.</Subtitle>
          </div>
          <CloseBtn onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></svg>
          </CloseBtn>
        </Head>

        <Body>
          <Section>
            <SectionTitle>The two views</SectionTitle>
            <Tip><Strong>Setup View</Strong> is your workspace — arrange the product, lights and camera here.</Tip>
            <Tip><Strong>Camera View</Strong> is the actual photo: it updates live as you move things, so light your scene by watching it rather than the workspace.</Tip>
          </Section>

          <Section>
            <SectionTitle>Adding &amp; arranging</SectionTitle>
            <Tip>Add anything from <Strong>+ Add</Strong> in the top bar — hover a category to see its items. You can also upload a 3D model or generate one from a photo here.</Tip>
            <Tip>Click to select. <Strong>Shift-click</Strong> rows in the Outliner to select several at once.</Tip>
            <Tip>Move, rotate or scale with the on-object handles, or type exact values in the Inspector.</Tip>
            <Tip>The grey outer ring on the rotate handle is <Strong>free rotation</Strong> — drag it to spin the object in any direction.</Tip>
          </Section>

          <Section>
            <SectionTitle>The Inspector</SectionTitle>
            <Tip><Strong>Drag left or right on any number field</Strong> to scrub its value; hold <Strong>Shift</Strong> for fine steps, or click a field to type a value.</Tip>
            <Tip>Axes are colour-coded everywhere: <Strong>red = X, green = Y, blue = Z</Strong>.</Tip>
            <Tip>Light power is shown in <Strong>lumens</Strong>, and the light types map to real gear — Point, Focused (spotlight), Softbox (area) and Environment (ambient).</Tip>
          </Section>

          <Section>
            <SectionTitle>Lock, hide &amp; duplicate</SectionTitle>
            <Tip><Strong>Right-click</Strong> anything for quick actions: Duplicate, Lock, Delete.</Tip>
            <Tip><Strong>Lock</Strong> an item to freeze it — it can't be moved, edited or deleted until you unlock it.</Tip>
            <Tip><Strong>Hide</Strong> a selected item to clear it out of the way, and unhide everything in one go.</Tip>
          </Section>

          <Section>
            <SectionTitle>Shots</SectionTitle>
            <Tip>The strip along the bottom saves the whole setup as a <Strong>shot</Strong>, so you can jump between saved versions to compare lighting options. Rename or remove shots from each card.</Tip>
          </Section>

          <Section>
            <SectionTitle>Saving &amp; exporting</SectionTitle>
            <Tip>Your scene <Strong>saves automatically</Strong> — the status shows in the top bar. Use the File menu to start fresh or open a saved scene.</Tip>
            <Tip><Strong>Export</Strong> renders a high-resolution PNG of the Camera View; pick the resolution in the dialog.</Tip>
          </Section>

          <Section>
            <SectionTitle>Keyboard shortcuts</SectionTitle>
            <Shortcuts>
              <Row><Keys><Kbd>W</Kbd><Kbd>E</Kbd><Kbd>R</Kbd></Keys><Desc>Move / Rotate / Scale</Desc></Row>
              <Row><Keys><Kbd>Q</Kbd></Keys><Desc>Switch between World and Local axes</Desc></Row>
              <Row><Keys><Kbd>X</Kbd></Keys><Desc>Show or hide the transform handles</Desc></Row>
              <Row><Keys><Kbd>G</Kbd></Keys><Desc>Show or hide the guides (camera frustum, axes, light lines)</Desc></Row>
              <Row><Keys><Kbd>H</Kbd></Keys><Desc>Hide selected &nbsp;(Alt+H unhides all)</Desc></Row>
              <Row><Keys><Kbd>Ctrl</Kbd><Sep>+</Sep><Kbd>D</Kbd></Keys><Desc>Duplicate selected</Desc></Row>
              <Row><Keys><Kbd>Delete</Kbd></Keys><Desc>Delete selected</Desc></Row>
              <Row><Keys><Kbd>Ctrl</Kbd><Sep>+</Sep><Kbd>Z</Kbd></Keys><Desc>Undo</Desc></Row>
              <Row><Keys><Kbd>Ctrl</Kbd><Sep>+</Sep><Kbd>Y</Kbd></Keys><Desc>Redo (or Ctrl+Shift+Z)</Desc></Row>
            </Shortcuts>
            <Note>Shortcuts pause while you're typing in a field. On Mac, use Cmd instead of Ctrl.</Note>
          </Section>

          <Section>
            <SectionTitle>Navigation</SectionTitle>
            <Tip>Drag to orbit · Scroll to zoom · Right-drag to pan.</Tip>
          </Section>
        </Body>

        <Footer>
          <GotIt onClick={onClose}>Got it</GotIt>
        </Footer>
      </Modal>
    </Overlay>
  );
}
