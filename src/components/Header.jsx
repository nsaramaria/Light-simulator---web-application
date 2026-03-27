import React from 'react';
import styled from 'styled-components';
import AddMenu from './AddMenu';
import { colors } from '../styles/theme';

const HeaderBar = styled.div`
  background: ${colors.surface};
  padding: 16px 24px;
  color: ${colors.text};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${colors.border};
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: 600;
  margin: 0;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const HelpButton = styled.button`
  background: transparent;
  border: 1px solid ${colors.border};
  color: ${colors.text};
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: ${colors.border};
    border-color: ${colors.accent};
    color: ${colors.accent};
  }
`;

export default function Header({ onAdd, onShowHelp }) {
  return (
    <HeaderBar>
      <Title>Studio Simulator</Title>
      <HeaderRight>
        <AddMenu onAdd={onAdd} />
        <HelpButton onClick={onShowHelp}>How to use</HelpButton>
      </HeaderRight>
    </HeaderBar>
  );
}