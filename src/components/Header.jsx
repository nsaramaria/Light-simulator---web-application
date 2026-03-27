import React from 'react';
import styled from 'styled-components';
import AddMenu from './AddMenu';

const HeaderBar = styled.div`
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

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
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