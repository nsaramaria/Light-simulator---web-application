import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { colors } from '../styles/theme';
import Landing from './Landing';
import Auth from './Auth';

const Frame = styled.div`
  position: fixed;
  inset: 0;
  background: ${colors.bg};
  overflow: hidden;
`;

const Flash = styled.div`
  position: absolute;
  inset: 0;
  background: #fff;
  opacity: 0;
  pointer-events: none;
  z-index: 90;
`;

const Layer = styled.div`
  position: absolute;
  inset: 0;
  opacity: ${({ $active }) => ($active ? 1 : 0)};
  visibility: ${({ $active }) => ($active ? 'visible' : 'hidden')};
  transition: opacity .5s ease, transform .5s cubic-bezier(.2,1,.3,1);
`;

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Entry({ onLogin }) {
  const [screen, setScreen] = useState('landing');
  const frameRef = useRef(null);
  const cameraRef = useRef(null);
  const landingRef = useRef(null);
  const loginRef = useRef(null);
  const flashRef = useRef(null);
  const animating = useRef(false);

  const takeShot = () => {
    if (animating.current) return;
    if (prefersReduced()) { setScreen('login'); return; }
    const frame = frameRef.current, cam = cameraRef.current;
    const landing = landingRef.current, loginEl = loginRef.current, flash = flashRef.current;
    if (!frame || !cam || !landing || !loginEl) { setScreen('login'); return; }

    animating.current = true;
    const fr = frame.getBoundingClientRect();
    const cr = cam.getBoundingClientRect();
    const lx = (cr.left - fr.left) + cr.width * (116 / 232);
    const ly = (cr.top - fr.top) + cr.height * (116 / 190);
    const R = Math.hypot(fr.width, fr.height) * 1.1;

    loginEl.style.transition = 'none';
    loginEl.style.opacity = '1';
    loginEl.style.visibility = 'visible';
    loginEl.style.clipPath = `circle(0px at ${lx}px ${ly}px)`;
    loginEl.style.webkitClipPath = `circle(0px at ${lx}px ${ly}px)`;
    loginEl.style.zIndex = '80';
    void loginEl.offsetWidth;

    landing.style.transformOrigin = `${lx}px ${ly}px`;
    landing.style.transition = 'transform .9s cubic-bezier(.66,0,.34,1), opacity .9s ease';
    landing.style.transform = 'scale(11)';
    landing.style.opacity = '0';

    if (flash) {
      flash.style.transition = 'opacity .12s';
      flash.style.opacity = '.5';
      setTimeout(() => { flash.style.transition = 'opacity .5s'; flash.style.opacity = '0'; }, 150);
    }

    loginEl.style.transition = 'clip-path .85s cubic-bezier(.5,0,.3,1), -webkit-clip-path .85s cubic-bezier(.5,0,.3,1)';
    loginEl.style.clipPath = `circle(${R}px at ${lx}px ${ly}px)`;
    loginEl.style.webkitClipPath = `circle(${R}px at ${lx}px ${ly}px)`;

    setTimeout(() => {
      setScreen('login');
      landing.style.cssText = '';
      loginEl.style.cssText = '';
      animating.current = false;
    }, 950);
  };

  return (
    <Frame ref={frameRef}>
      <Flash ref={flashRef} />
      <Layer ref={landingRef} $active={screen === 'landing'}>
        <Landing onTryNow={takeShot} cameraRef={cameraRef} />
      </Layer>
      <Layer ref={loginRef} $active={screen === 'login'}>
        <Auth onLogin={onLogin} onBack={() => setScreen('landing')} />
      </Layer>
    </Frame>
  );
}
