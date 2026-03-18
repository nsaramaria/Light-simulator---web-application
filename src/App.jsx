// src/App.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import CameraView from './scene/CameraView';
import SetupView from './scene/SetupView';
import SelectionPanel from './scene/SelectionPanel';

const AppWrapper = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  background: #2d2822;
  padding: 16px 24px;
  color: #e8dfd6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #3d3530;
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: 600;
  margin: 0;
`;

const HelpButton = styled.button`
  background: transparent;
  border: 1px solid #3d3530;
  color: #e8dfd6;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: #3d3530;
    border-color: #d4a574;
    color: #d4a574;
  }
`;

const ViewsContainer = styled.div`
  flex: 1;
  display: flex;
`;

const ViewPanel = styled.div`
  flex: 1;
  position: relative;
  ${({ $left }) => $left && `border-right: 2px solid #3d3530;`}
`;

const ViewLabel = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(45, 40, 34, 0.85);
  color: #e8dfd6;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  border: 1px solid #3d3530;
  z-index: 10;
`;

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
  background: #2d2822;
  border-radius: 12px;
  padding: 0;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
  border: 1px solid #3d3530;
`;

const ModalHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #3d3530;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  color: #e8dfd6;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #9b8a7a;
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
    background: #3d3530;
    color: #e8dfd6;
  }
`;

const ModalContent = styled.div`
  padding: 24px;
  color: #e8dfd6;
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  color: #e8dfd6;
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
  border-top: 1px solid #3d3530;
  display: flex;
  justify-content: flex-end;
`;

const GotItButton = styled.button`
  background: #d4a574;
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

export default function App() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <AppWrapper>
      <Header>
        <Title>Studio Simulator</Title>
        <HelpButton onClick={() => setShowHelp(true)}>How to use</HelpButton>
      </Header>

      <ViewsContainer>
        <ViewPanel $left>
          <ViewLabel>Camera View</ViewLabel>
          <CameraView />
        </ViewPanel>

        <ViewPanel>
          <ViewLabel>Setup View</ViewLabel>
          <SetupView />
        </ViewPanel>
      </ViewsContainer>

      {showHelp && (
        <ModalOverlay onClick={() => setShowHelp(false)}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>How to Use Studio Simulator</ModalTitle>
              <CloseButton onClick={() => setShowHelp(false)}>×</CloseButton>
            </ModalHeader>

            <ModalContent>
              <Section>
                <SectionTitle>About</SectionTitle>
                <p style={{ margin: 0, lineHeight: '1.7', color: '#9b8a7a', fontSize: '14px' }}>
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
              <GotItButton onClick={() => setShowHelp(false)}>Got it</GotItButton>
            </ModalFooter>
          </ModalBox>
        </ModalOverlay>
      )}
      <SelectionPanel />
    </AppWrapper>
  );
}