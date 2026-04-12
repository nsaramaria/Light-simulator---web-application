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

const UserEmail = styled.span`
  font-size: 12px;
  color: ${colors.textMuted};
`;

const HeaderButton = styled.button`
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

const LogoutBtn = styled.button`
  background: transparent;
  border: 1px solid ${colors.border};
  color: ${colors.textMuted};
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #e05a4e;
    color: #e05a4e;
  }
`;

export default function Header({ onAdd, onShowHelp, user, onLogout }) {
  return (
    <HeaderBar>
      <Title>Studio Simulator</Title>
      <HeaderRight>
        <AddMenu onAdd={onAdd} />
        <HeaderButton onClick={onShowHelp}>How to use</HeaderButton>
        {user && <UserEmail>{user.email}</UserEmail>}
        {user && <LogoutBtn onClick={onLogout}>Log out</LogoutBtn>}
      </HeaderRight>
    </HeaderBar>
  );
}