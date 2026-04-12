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
  border: 1px solid ${({ $invalid }) => $invalid ? '#e05a4e' : colors.border};
  border-radius: 6px;
  color: ${colors.text};
  font-size: 14px;
  margin-bottom: 4px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${({ $invalid }) => $invalid ? '#e05a4e' : colors.accent};
  }
`;

const FieldHint = styled.div`
  font-size: 11px;
  color: ${({ $error }) => $error ? '#e05a4e' : colors.textMuted};
  margin-bottom: 16px;
  min-height: 16px;
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

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function Auth({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  const emailError = touched.email && email && !isValidEmail(email)
    ? 'Enter a valid email address'
    : '';

  const passwordError = touched.password && password && isRegister && password.length < 6
    ? 'Password must be at least 6 characters'
    : '';

  const canSubmit = email && password && isValidEmail(email) && (!isRegister || password.length >= 6);

  const handleSubmit = async () => {
    // Mark both as touched so errors show
    setTouched({ email: true, password: true });

    if (!canSubmit) return;

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

  const switchMode = () => {
    setIsRegister(!isRegister);
    setError('');
    setTouched({ email: false, password: false });
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
          $invalid={!!emailError}
          onChange={e => setEmail(e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, email: true }))}
          onKeyDown={handleKeyDown}
          placeholder="you@example.com"
        />
        <FieldHint $error={!!emailError}>{emailError}</FieldHint>

        <Label>Password</Label>
        <Input
          type="password"
          value={password}
          $invalid={!!passwordError}
          onChange={e => setPassword(e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, password: true }))}
          onKeyDown={handleKeyDown}
          placeholder="Enter your password"
        />
        <FieldHint $error={!!passwordError}>
          {passwordError || (isRegister && !touched.password ? 'At least 6 characters' : '')}
        </FieldHint>

        <Button onClick={handleSubmit} disabled={loading || !canSubmit}>
          {loading ? 'Loading...' : isRegister ? 'Sign Up' : 'Log In'}
        </Button>

        <SwitchText>
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <SwitchLink onClick={switchMode}>
            {isRegister ? 'Log In' : 'Sign Up'}
          </SwitchLink>
        </SwitchText>
      </Card>
    </Wrapper>
  );
}