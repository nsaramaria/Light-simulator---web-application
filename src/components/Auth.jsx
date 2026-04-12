import React, { useState } from 'react';
import styled from 'styled-components';
import { colors } from '../styles/theme';
import { login, register } from '../api';

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
  background: ${colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Card = styled.div`
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: 12px;
  padding: 40px;
  width: 380px;
`;

const Title = styled.h1`
  color: ${colors.text};
  font-size: 24px;
  margin: 0 0 8px;
`;

const Subtitle = styled.p`
  color: ${colors.textMuted};
  font-size: 14px;
  margin: 0 0 32px;
`;

const Label = styled.label`
  display: block;
  color: ${colors.textMuted};
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  background: ${colors.background};
  border: 1px solid ${colors.border};
  border-radius: 6px;
  color: ${colors.text};
  font-size: 14px;
  margin-bottom: 20px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${colors.accent};
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background: ${colors.accent};
  border: none;
  border-radius: 6px;
  color: #1a1612;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  margin-bottom: 16px;

  &:hover {
    background: #c99564;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SwitchText = styled.p`
  color: ${colors.textMuted};
  font-size: 13px;
  text-align: center;
  margin: 0;
`;

const SwitchLink = styled.span`
  color: ${colors.accent};
  cursor: pointer;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`;

const ErrorMsg = styled.div`
  background: rgba(224, 90, 78, 0.1);
  border: 1px solid rgba(224, 90, 78, 0.3);
  color: #e05a4e;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 13px;
  margin-bottom: 20px;
`;

export default function Auth({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const result = isRegister
        ? await register(email, password)
        : await login(email, password);

      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      onLogin(result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <Wrapper>
      <Card>
        <Title>{isRegister ? 'Create Account' : 'Welcome Back'}</Title>
        <Subtitle>
          {isRegister
            ? 'Sign up to save your studio setups'
            : 'Log in to access your saved setups'}
        </Subtitle>

        {error && <ErrorMsg>{error}</ErrorMsg>}

        <Label>Email</Label>
        <Input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="you@example.com"
        />

        <Label>Password</Label>
        <Input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your password"
        />

        <Button onClick={handleSubmit} disabled={loading || !email || !password}>
          {loading ? 'Loading...' : isRegister ? 'Sign Up' : 'Log In'}
        </Button>

        <SwitchText>
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <SwitchLink onClick={() => { setIsRegister(!isRegister); setError(''); }}>
            {isRegister ? 'Log In' : 'Sign Up'}
          </SwitchLink>
        </SwitchText>
      </Card>
    </Wrapper>
  );
}