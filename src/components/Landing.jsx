import React from 'react';
import styled from 'styled-components';
import { colors, shadows } from '../styles/theme';

const Screen = styled.div`
  position: absolute;
  inset: 0;
  background: radial-gradient(120% 80% at 50% -10%, #E7ECFE, ${colors.bg} 60%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 30px;
  overflow: hidden;
`;

const TopMini = styled.div`
  position: absolute;
  top: 26px;
  left: 30px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 17px;
  color: ${colors.ink};
`;

const Mark = styled.span`
  width: 30px;
  height: 30px;
  border-radius: 9px;
  background: ${colors.ink};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  svg { width: 20px; height: 20px; }
`;

const MarkS = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16.2 7.4 C15.4 5.3 12.3 4.6 9.9 5.9 C7.3 7.2 7.6 10 10.5 11.1 C12.4 11.9 14.4 12.4 15.6 13.6 C17.2 15.1 16.7 17.9 13.8 18.9 C11 19.9 8.1 18.8 7.6 16.6" />
  </svg>
);

const Badge = styled.span`
  margin-left: 4px;
  font-weight: 600;
  font-size: 11px;
  color: ${colors.peri};
  background: ${colors.periTint};
  padding: 4px 9px;
  border-radius: 999px;
`;

const Dot = styled.span`
  position: absolute;
  border-radius: 50%;
  opacity: .9;
  width: ${({ $s }) => $s}px;
  height: ${({ $s }) => $s}px;
  background: ${({ $c }) => $c};
  ${({ $pos }) => $pos}
`;

const Spark = styled.span`
  position: absolute;
  font-size: 22px;
  color: ${({ $c }) => $c};
  ${({ $pos }) => $pos}
`;

const CamStage = styled.div`
  position: relative;
  margin-bottom: 6px;
`;

const CamHalo = styled.div`
  position: absolute;
  inset: -26px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(140,155,242,.35), transparent 68%);
  z-index: 0;
`;

const Camera = styled.svg`
  position: relative;
  z-index: 1;
  display: block;
  filter: drop-shadow(0 10px 16px rgba(80,70,150,.16));
  @media (prefers-reduced-motion: no-preference) {
    animation: camin .6s cubic-bezier(.2,1,.3,1) both, bob 4s ease-in-out 1s infinite;
  }
`;

const Title = styled.h1`
  font-weight: 700;
  font-size: 46px;
  line-height: 1.02;
  letter-spacing: -.015em;
  max-width: 640px;
  margin-top: 30px;
  color: ${colors.ink};
  @media (prefers-reduced-motion: no-preference) { animation: rise .5s ease .25s both; }

  span {
    background: ${colors.yellow};
    border-radius: 10px;
    padding: 0 8px;
    -webkit-box-decoration-break: clone;
    box-decoration-break: clone;
  }
`;

const TryWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 32px;
  @media (prefers-reduced-motion: no-preference) { animation: rise .5s ease .45s both; }
`;

const TryBtn = styled.button`
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 13px 22px;
  border-radius: 999px;
  background: ${colors.ink};
  color: #fff;
  box-shadow: ${shadows.btn};
  transition: transform .12s, box-shadow .12s;

  &:hover { transform: translateY(-1px); box-shadow: 0 6px 0 #050509; }
  &:active { transform: translateY(4px); box-shadow: ${shadows.btnActive}; }

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

export default function Landing({ onTryNow, cameraRef }) {
  return (
    <Screen>
      <TopMini><Mark><MarkS /></Mark>Studio<Badge>beta</Badge></TopMini>

      <Dot $s={16} $c={colors.pink} $pos="top:120px;left:18%;" />
      <Dot $s={11} $c={colors.yellow} $pos="top:30%;right:16%;" />
      <Dot $s={22} $c={colors.mint} $pos="bottom:24%;left:14%;" />
      <Dot $s={9} $c={colors.purple} $pos="bottom:30%;right:22%;" />
      <Spark $c={colors.yellow} $pos="top:26%;left:24%;">✦</Spark>
      <Spark $c={colors.pink} $pos="bottom:28%;right:15%;">✦</Spark>

      <CamStage>
        <CamHalo />
        <Camera ref={cameraRef} width="232" height="190" viewBox="0 0 120 98" xmlns="http://www.w3.org/2000/svg" aria-label="camera">
          <g fill="none" stroke="#17171c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 30 h28 l7 -12 h22 l7 12 h28 a12 12 0 0 1 12 12 v40 a12 12 0 0 1 -12 12 h-92 a12 12 0 0 1 -12 -12 v-40 a12 12 0 0 1 12 -12 Z" />
            <circle cx="60" cy="62" r="22" />
            <circle cx="60" cy="62" r="11" />
            <circle cx="96" cy="40" r="3.2" />
            <path d="M24 42 h12" />
          </g>
        </Camera>
      </CamStage>

      <Title>Your studio. <span>In the browser.</span></Title>
      <TryWrap>
        <TryBtn onClick={onTryNow}>Try now <span>→</span></TryBtn>
      </TryWrap>
    </Screen>
  );
}
