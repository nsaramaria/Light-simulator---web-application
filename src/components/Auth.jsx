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
  position: relative;
  overflow: hidden;
`;

const AmbientOrb = styled.div`
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(232,168,85,0.06) 0%, transparent 70%);
  top: 20%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
`;

const Card = styled.div`
  background: rgba(255,255,255,0.015);
  border: 1px solid ${colors.border};
  border-radius: 12px;
  padding: 40px;
  width: 380px;
  position: relative;
  z-index: 1;
  backdrop-filter: blur(12px);
`;

const LogoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
`;

const LogoMark = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #E8A855 0%, #C75450 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 900;
  color: #000;
  flex-shrink: 0;
`;

const LogoText = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${colors.text};
`;

const Title = styled.h1`
  color: ${colors.text};
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 6px;
`;

const Subtitle = styled.p`
  color: ${colors.textMuted};
  font-size: 13px;
  margin: 0 0 28px;
  line-height: 1.5;
`;

const Label = styled.label`
  display: block;
  color: ${colors.textMuted};
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 6px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  background: rgba(255,255,255,0.03);
  border: 1px solid ${({ $invalid }) => $invalid ? '#C75450' : colors.border};
  border-radius: 6px;
  color: ${colors.text};
  font-size: 14px;
  margin-bottom: 4px;
  box-sizing: border-box;
  font-family: inherit;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${({ $invalid }) => $invalid ? '#C75450' : colors.accent};
    background: rgba(255,255,255,0.05);
  }

  &::placeholder {
    color: rgba(255,255,255,0.15);
  }
`;

const FieldHint = styled.div`
  font-size: 11px;
  color: ${({ $error }) => $error ? '#C75450' : colors.textMuted};
  margin-bottom: 16px;
  min-height: 16px;
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background: ${colors.accent};
  border: none;
  border-radius: 6px;
  color: #000;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 16px;
  font-family: inherit;

  &:hover {
    background: #D08030;
  }

  &:disabled {
    opacity: 0.5;
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
  background: rgba(199,84,80,0.08);
  border: 1px solid rgba(199,84,80,0.2);
  color: #C75450;
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
      <AmbientOrb />
      <Card>
        <LogoRow>
          <LogoMark>S</LogoMark>
          <LogoText>Studio Simulator</LogoText>
        </LogoRow>

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
