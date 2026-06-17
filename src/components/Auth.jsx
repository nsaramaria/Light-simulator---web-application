import React, { useState } from 'react';
import styled from 'styled-components';
import { colors, shadows } from '../styles/theme';
import { LogoMark } from './brandMarks';
import { login, register } from '../api';

const Wrapper = styled.div`
  position: absolute;
  inset: 0;
  background: radial-gradient(110% 70% at 50% 0%, #EAEEFE, ${colors.bg} 62%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px;
  overflow: hidden;
`;

const Back = styled.button`
  position: absolute;
  top: 26px;
  left: 30px;
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13.5px;
  font-weight: 500;
  color: ${colors.ink2};
  cursor: pointer;
  background: #fff;
  border: none;
  padding: 8px 14px;
  border-radius: 999px;
  box-shadow: ${shadows.cardSm};
  transition: transform .12s;
  &:hover { transform: translateX(-2px); }
  svg { width: 15px; height: 15px; }
`;

const Card = styled.div`
  width: 380px;
  background: ${colors.card};
  border-radius: ${'26px'};
  box-shadow: ${shadows.card};
  padding: 34px 32px;
  position: relative;
  z-index: 1;
`;

const Mark = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: ${colors.periTint};
  color: ${colors.ink};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
  svg { width: 40px; height: 40px; }
`;

const Title = styled.h1`
  font-weight: 700;
  font-size: 27px;
  letter-spacing: -.01em;
  margin: 0 0 5px;
  color: ${colors.ink};
`;

const Lead = styled.p`
  font-size: 14px;
  color: ${colors.mut};
  margin: 0 0 24px;
`;

const Field = styled.div`
  margin-bottom: 14px;
`;

const Label = styled.label`
  display: block;
  font-size: 12.5px;
  font-weight: 600;
  color: ${colors.ink2};
  margin-bottom: 7px;
`;

const Input = styled.input`
  width: 100%;
  height: 48px;
  border-radius: ${'14px'};
  border: 1.5px solid ${({ $invalid }) => $invalid ? colors.danger : '#E4E7F4'};
  background: ${({ $invalid }) => $invalid ? '#FDF3F5' : '#F7F8FE'};
  padding: 0 16px;
  font-size: 14.5px;
  color: ${colors.ink};
  outline: none;
  transition: .16s;

  &::placeholder { color: #aab0c6; }
  &:focus {
    border-color: ${({ $invalid }) => $invalid ? colors.danger : colors.peri};
    background: #fff;
    box-shadow: 0 0 0 4px ${({ $invalid }) => $invalid ? '#F8DCE3' : colors.periTint};
  }
`;

const Hint = styled.div`
  font-size: 11.5px;
  color: ${({ $error }) => $error ? colors.danger : colors.mut};
  margin: 6px 2px 0;
  min-height: 14px;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 8px 0 20px;
  font-size: 12.5px;
`;

const ForgotLink = styled.a`
  color: ${colors.peri};
  font-weight: 600;
  cursor: pointer;
`;

const Submit = styled.button`
  width: 100%;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 15px;
  border-radius: 999px;
  background: ${colors.ink};
  color: #fff;
  box-shadow: ${shadows.btn};
  transition: transform .12s, box-shadow .12s;

  &:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 0 #050509; }
  &:active:not(:disabled) { transform: translateY(4px); box-shadow: ${shadows.btnActive}; }
  &:disabled { opacity: .55; cursor: not-allowed; }

  span {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #fff;
    color: ${colors.ink};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
  }
`;

const Alt = styled.p`
  text-align: center;
  font-size: 13px;
  color: ${colors.mut};
  margin-top: 18px;
`;

const AltLink = styled.span`
  color: ${colors.ink};
  font-weight: 600;
  cursor: pointer;
  &:hover { text-decoration: underline; }
`;

const ErrorMsg = styled.div`
  background: #FBE3EA;
  border: 1px solid ${colors.dangerBorder};
  color: ${colors.danger};
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 13px;
  margin-bottom: 18px;
`;

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function Auth({ onLogin, onBack }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  const emailError = touched.email && email && !isValidEmail(email) ? 'Enter a valid email address' : '';
  const passwordError = touched.password && password && isRegister && password.length < 6 ? 'Password must be at least 6 characters' : '';
  const canSubmit = email && password && isValidEmail(email) && (!isRegister || password.length >= 6);

  const handleSubmit = async () => {
    setTouched({ email: true, password: true });
    if (!canSubmit) return;
    setError(''); setLoading(true);
    try {
      const result = isRegister ? await register(email, password) : await login(email, password);
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      onLogin(result.user);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSubmit(); };
  const switchMode = () => { setIsRegister(!isRegister); setError(''); setTouched({ email: false, password: false }); };

  return (
    <Wrapper>
      {onBack && (
        <Back onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
          Back
        </Back>
      )}
      <Card>
        <Mark>
          <LogoMark />
        </Mark>
        <Title>{isRegister ? 'Create an account' : 'Welcome back'}</Title>
        <Lead>{isRegister ? 'Sign up to save your studio.' : 'Log in to your studio.'}</Lead>
        {error && <ErrorMsg>{error}</ErrorMsg>}
        <Field>
          <Label>Email</Label>
          <Input type="email" value={email} $invalid={!!emailError} onChange={e => setEmail(e.target.value)} onBlur={() => setTouched(t => ({ ...t, email: true }))} onKeyDown={handleKeyDown} placeholder="you@studio.com" />
          {emailError && <Hint $error>{emailError}</Hint>}
        </Field>
        <Field>
          <Label>Password</Label>
          <Input type="password" value={password} $invalid={!!passwordError} onChange={e => setPassword(e.target.value)} onBlur={() => setTouched(t => ({ ...t, password: true }))} onKeyDown={handleKeyDown} placeholder="••••••••" />
          {(passwordError || (isRegister && !touched.password)) && <Hint $error={!!passwordError}>{passwordError || 'At least 6 characters'}</Hint>}
        </Field>
        <Row><span /><ForgotLink>Forgot password?</ForgotLink></Row>
        <Submit onClick={handleSubmit} disabled={loading || !canSubmit}>{loading ? 'Loading…' : isRegister ? 'Sign up' : 'Log in'} <span>→</span></Submit>
        <Alt>{isRegister ? 'Already have an account? ' : 'New here? '}<AltLink onClick={switchMode}>{isRegister ? 'Log in' : 'Create an account'}</AltLink></Alt>
      </Card>
    </Wrapper>
  );
}
