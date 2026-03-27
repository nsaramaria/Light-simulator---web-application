import React from 'react';
import styled from 'styled-components';
import { colors } from '../styles/theme';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(26, 22, 18, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ModalBox = styled.div`
  background: ${colors.surface};
  border-radius: 12px;
  padding: 0;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
  border: 1px solid ${colors.border};
`;

const ModalHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid ${colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  color: ${colors.text};
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${colors.textMuted};
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: ${colors.border};
    color: ${colors.text};
  }
`;

const ModalContent = styled.div`
  padding: 24px;
  color: ${colors.text};
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  color: ${colors.text};
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  margin-top: 0;
`;

const SectionList = styled.ul`
  margin: 0;
  padding-left: 20px;
  line-height: 1.8;
`;

const ModalFooter = styled.div`
  padding: 16px 24px;
  border-top: 1px solid ${colors.border};
  display: flex;
  justify-content: flex-end;
`;

const GotItButton = styled.button`
  background: ${colors.accent};
  border: none;
  color: #1a1612;
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #c99564;
  }
`;

export default function HelpModal({ onClose }) {
  return (
    <ModalOverlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>How to Use Studio Simulator</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        <ModalContent>
          <Section>
            <SectionTitle>About</SectionTitle>
            <p style={{ margin: 0, lineHeight: '1.7', color: colors.textMuted, fontSize: '14px' }}>
              Plan and visualise your studio photo setup in real time. Arrange the product, light and camera in the Setup View and instantly see the result through the lens in the Camera View.
            </p>
          </Section>

          <Section>
            <SectionTitle>Navigation</SectionTitle>
            <SectionList>
              <li><strong>Left click + drag:</strong> Rotate view</li>
              <li><strong>Scroll wheel:</strong> Zoom in/out</li>
              <li><strong>Right click + drag:</strong> Pan</li>
            </SectionList>
          </Section>

          <Section>
            <SectionTitle>Visual Guide</SectionTitle>
            <SectionList>
              <li><strong>Orange lines:</strong> Camera viewing frustum</li>
              <li><strong>White sphere:</strong> Light position</li>
              <li><strong>Orange box:</strong> Camera position</li>
              <li><strong>Pink cube:</strong> Product being photographed</li>
              <li><strong>Colored axes:</strong> Red (X), Green (Y), Blue (Z)</li>
            </SectionList>
          </Section>
        </ModalContent>

        <ModalFooter>
          <GotItButton onClick={onClose}>Got it</GotItButton>
        </ModalFooter>
      </ModalBox>
    </ModalOverlay>
  );
}