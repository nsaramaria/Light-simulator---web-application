import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { colors, shadows } from '../styles/theme';
import { LogoMark } from './brandMarks';

const CLOSE_FRAMES = [
  "M65.25 19.99 L15.56 19.99 L15.32 19.25 L22.45 12.61 L33.27 6.71 L42.62 4.25 L52.46 3.75 L52.95 4.25 L56.40 4.25 L57.13 4.98 L65.50 19.25 L65.25 19.99 Z M83.45 48.52 L62.05 11.87 L58.61 5.48 L58.86 4.74 L63.28 5.72 L69.68 8.18 L77.06 12.61 L84.68 19.74 L89.60 26.63 L92.56 33.03 L83.45 48.52 Z M6.71 64.76 L5.48 62.55 L4.00 55.66 L4.00 44.34 L5.48 36.96 L9.90 26.63 L14.09 20.97 L31.30 20.97 L31.55 21.71 L30.57 23.68 L6.71 64.76 Z M85.42 78.53 L68.20 78.53 L67.96 77.80 L92.80 34.75 L94.03 36.96 L95.51 44.34 L95.02 58.61 L92.06 67.96 L88.13 75.34 L85.42 78.53 Z M41.14 94.77 L33.27 92.80 L27.86 90.34 L22.45 86.90 L14.82 79.76 L9.90 72.88 L6.95 66.48 L16.05 50.98 L41.14 94.77 Z M53.44 95.75 L43.11 95.26 L34.01 79.76 L84.19 79.76 L80.01 84.44 L71.65 90.34 L61.81 94.28 L57.38 95.26 L53.94 95.26 L53.44 95.75 Z",
  "M63.53 22.94 L12.61 22.70 L21.22 13.59 L26.14 10.15 L32.04 7.20 L42.37 4.25 L52.21 3.75 L55.41 7.94 L63.53 22.94 Z M80.26 48.03 L79.03 47.29 L77.55 44.83 L67.22 26.14 L55.90 7.44 L54.67 4.25 L61.56 5.23 L67.47 7.20 L74.84 11.13 L78.78 14.09 L85.42 20.73 L89.85 27.12 L90.83 30.07 L80.26 48.03 Z M7.94 68.20 L6.21 65.01 L4.25 57.13 L3.75 46.31 L5.72 35.98 L10.15 26.14 L11.87 23.93 L31.06 23.93 L31.55 24.42 L33.03 23.93 L33.27 24.66 L31.80 27.61 L7.94 68.20 Z M87.14 75.58 L66.48 75.58 L66.24 74.35 L78.04 54.67 L90.34 32.53 L91.57 31.30 L92.80 33.52 L94.77 40.41 L95.26 46.80 L95.75 47.29 L95.75 52.21 L95.26 52.71 L94.77 59.59 L92.80 65.99 L89.85 72.39 L87.14 75.58 Z M45.33 95.26 L42.37 95.26 L35.98 93.79 L26.14 89.36 L17.78 82.96 L13.10 77.80 L10.15 73.37 L8.67 69.43 L19.25 51.48 L19.99 51.72 L23.93 58.12 L45.33 95.26 Z M53.20 95.75 L47.29 95.75 L46.56 95.02 L37.21 79.27 L36.22 77.30 L36.47 76.57 L86.90 76.81 L78.78 85.42 L72.39 89.85 L63.53 93.79 L53.20 95.75 Z",
  "M62.55 25.16 L11.87 25.16 L11.63 23.93 L19.74 14.82 L26.63 9.90 L36.96 5.48 L43.85 4.00 L50.25 4.00 L56.40 13.59 L62.55 25.16 Z M77.80 48.28 L73.12 41.14 L52.21 4.00 L55.17 4.00 L62.55 5.48 L72.88 9.90 L79.76 14.82 L84.44 19.50 L88.87 25.40 L89.85 27.86 L77.80 48.28 Z M9.41 70.42 L8.67 70.17 L7.20 67.22 L4.74 59.35 L3.75 47.54 L4.25 47.05 L4.25 42.62 L5.72 36.22 L10.15 26.39 L34.50 26.14 L33.76 28.35 L9.41 70.42 Z M89.11 73.37 L64.76 73.12 L89.36 30.32 L90.59 29.09 L92.80 33.27 L94.77 39.67 L95.26 45.57 L95.75 46.06 L95.75 53.44 L93.79 63.28 L91.82 68.70 L89.11 73.37 Z M47.29 95.51 L44.34 95.51 L36.96 94.03 L26.63 89.60 L19.25 84.19 L12.61 77.06 L10.15 73.12 L9.66 72.14 L11.13 69.19 L21.71 51.23 L22.45 51.48 L40.16 82.96 L46.06 92.31 L47.29 95.51 Z M55.66 95.51 L49.26 95.51 L48.03 94.28 L38.68 78.04 L37.21 75.09 L37.45 74.35 L88.37 74.60 L84.93 79.52 L79.27 85.18 L72.88 89.60 L66.97 92.56 L55.66 95.51 Z",
  "M60.39 27.99 L9.19 27.74 L13.65 20.82 L20.82 13.65 L25.76 10.18 L30.22 7.71 L37.14 5.24 L44.06 3.75 L47.03 3.75 L60.14 26.26 L60.39 27.99 Z M74.24 48.27 L73.00 47.03 L48.52 3.75 L58.41 4.25 L69.29 7.71 L78.69 13.65 L87.34 22.80 L87.84 23.78 L87.34 26.26 L74.24 48.27 Z M90.56 70.53 L63.85 70.53 L63.11 69.78 L89.08 25.52 L92.78 32.69 L95.75 44.06 L95.26 58.41 L93.77 64.34 L91.80 69.29 L90.56 70.53 Z M10.43 73.99 L6.72 66.82 L3.75 55.44 L4.25 41.10 L6.72 32.69 L8.20 29.72 L8.95 28.98 L35.66 28.98 L36.40 29.72 L35.90 30.71 L18.59 59.89 L11.67 72.75 L10.43 73.99 Z M50.99 95.75 L41.10 95.26 L30.22 91.80 L20.82 85.86 L12.16 76.71 L11.67 74.24 L25.27 51.24 L31.95 61.87 L48.27 91.05 L50.25 93.53 L50.99 95.75 Z M55.44 95.75 L52.97 95.75 L51.73 94.52 L39.37 73.25 L39.12 71.52 L90.31 71.76 L85.86 78.69 L78.69 85.86 L74.73 88.83 L66.82 92.78 L55.44 95.75 Z",
  "M70.91 48.28 L47.05 7.69 L45.57 4.74 L45.82 4.00 L55.66 4.00 L62.55 5.48 L67.96 7.44 L72.88 9.90 L79.76 14.82 L86.41 21.96 L70.91 48.28 Z M58.61 31.06 L58.12 30.57 L40.41 30.57 L39.91 31.06 L39.42 30.57 L38.93 31.06 L37.95 30.57 L37.45 31.06 L36.47 30.57 L17.78 30.57 L8.92 30.57 L8.43 31.06 L8.18 29.83 L14.58 19.99 L20.24 14.33 L24.17 11.38 L32.53 6.95 L38.93 4.98 L43.85 4.49 L45.08 5.72 L53.44 20.97 L59.35 30.32 L58.61 31.06 Z M92.06 67.47 L61.32 67.22 L87.14 23.19 L90.83 28.84 L92.31 32.29 L95.26 42.62 L95.26 47.05 L95.75 47.54 L95.26 56.89 L93.79 63.28 L92.06 67.47 Z M12.36 76.32 L9.17 71.65 L6.71 66.24 L4.74 59.84 L4.25 53.94 L3.75 53.44 L4.25 42.13 L7.20 32.29 L37.45 32.04 L37.70 32.78 L36.72 34.75 L12.36 76.32 Z M53.69 95.51 L44.34 95.51 L32.53 92.56 L22.20 86.65 L13.10 77.55 L28.11 51.23 L29.83 52.95 L37.70 67.22 L39.67 69.68 L45.08 80.01 L52.95 92.80 L53.94 94.77 L53.69 95.51 Z M58.61 95.02 L54.92 94.77 L40.41 68.94 L61.56 68.94 L62.05 68.45 L63.04 68.94 L63.53 68.45 L67.47 68.45 L67.96 68.94 L91.33 69.19 L87.88 75.58 L79.76 84.68 L72.88 89.60 L67.96 92.06 L58.61 95.02 Z",
  "M67.96 48.03 L67.22 47.79 L64.76 43.85 L59.84 34.50 L44.59 8.92 L42.62 4.98 L42.87 4.25 L53.20 3.75 L65.01 6.21 L73.37 10.15 L78.29 13.59 L83.95 18.76 L84.44 19.74 L82.96 22.70 L67.96 48.03 Z M57.13 33.76 L7.44 33.76 L7.20 32.53 L12.12 23.19 L20.73 14.09 L24.66 11.13 L32.04 7.20 L40.90 4.74 L55.41 29.09 L57.38 33.03 L57.13 33.76 Z M93.05 64.76 L59.84 64.51 L85.18 20.97 L85.91 21.22 L89.36 26.14 L92.80 33.03 L95.26 42.37 L95.75 53.69 L95.26 54.18 L94.77 60.09 L93.05 64.76 Z M14.33 78.53 L9.66 72.39 L7.69 68.45 L4.25 57.13 L3.75 47.29 L4.25 46.80 L4.74 39.91 L6.21 34.99 L39.42 34.75 L39.67 35.49 L14.33 78.53 Z M52.21 95.75 L46.80 95.75 L46.31 95.26 L39.91 94.77 L32.04 92.31 L24.66 88.37 L20.73 85.42 L15.07 79.76 L30.81 52.21 L32.04 50.98 L56.89 94.03 L56.64 95.26 L52.71 95.26 L52.21 95.75 Z M59.59 94.77 L57.87 94.03 L43.11 68.45 L42.13 66.48 L42.37 65.74 L92.80 65.99 L87.39 76.32 L78.29 85.91 L67.47 92.31 L59.59 94.77 Z",
  "M64.76 48.03 L63.53 47.29 L62.05 44.83 L42.37 9.90 L39.91 6.46 L39.42 5.48 L40.16 4.74 L45.57 4.25 L46.06 3.75 L53.44 3.75 L53.94 4.25 L57.38 4.25 L61.81 5.23 L71.65 9.17 L77.06 12.61 L82.22 17.28 L80.75 20.73 L64.76 48.03 Z M55.90 36.22 L6.21 36.22 L5.97 35.49 L9.90 26.63 L12.86 22.20 L19.99 14.58 L27.86 9.17 L38.19 5.23 L55.90 36.22 Z M93.79 61.81 L58.12 61.56 L82.22 19.74 L83.45 18.51 L89.60 26.63 L93.05 34.01 L95.02 40.90 L95.51 55.17 L95.02 55.66 L94.52 60.58 L93.79 61.81 Z M16.05 80.99 L9.90 72.88 L6.46 65.50 L4.49 58.61 L4.00 43.85 L5.48 37.95 L41.14 37.70 L30.07 57.63 L22.20 70.42 L20.73 73.86 L16.05 80.99 Z M52.95 95.75 L42.62 95.26 L33.27 92.80 L25.40 88.87 L17.28 82.22 L17.28 81.24 L35.24 50.98 L60.09 94.03 L59.35 94.77 L53.44 95.26 L52.95 95.75 Z M61.81 94.28 L59.59 91.57 L44.34 65.01 L44.10 62.79 L44.59 63.28 L93.54 63.53 L89.60 72.88 L84.68 79.76 L80.01 84.44 L70.66 90.83 L61.81 94.28 Z",
  "M60.58 48.52 L36.22 6.46 L36.47 5.72 L46.31 3.75 L53.20 3.75 L53.69 4.25 L59.59 4.74 L65.01 6.21 L73.37 10.15 L80.01 15.32 L60.58 48.52 Z M53.69 39.67 L5.48 39.67 L5.23 37.95 L6.71 33.03 L10.15 26.14 L16.55 17.78 L26.14 10.15 L34.99 6.21 L52.95 36.96 L53.94 38.93 L53.69 39.67 Z M94.52 58.86 L56.40 58.61 L80.75 16.55 L85.91 21.22 L88.37 24.66 L91.82 31.06 L94.28 37.95 L95.26 42.37 L95.26 46.80 L95.75 47.29 L95.75 52.21 L95.26 52.71 L95.26 56.64 L94.52 58.86 Z M18.76 82.96 L17.28 82.47 L12.12 76.32 L6.21 65.01 L3.75 53.20 L3.75 46.31 L4.25 45.82 L4.74 40.90 L42.87 40.65 L39.67 47.29 L18.76 82.96 Z M52.71 95.75 L42.37 95.26 L32.04 92.31 L24.66 88.37 L19.50 84.19 L38.44 50.98 L41.64 55.66 L63.28 93.54 L59.59 94.77 L53.20 95.26 L52.71 95.75 Z M64.51 93.29 L47.05 63.53 L45.57 60.09 L94.03 59.84 L94.28 61.56 L91.82 68.45 L85.42 78.78 L76.81 86.90 L72.39 89.85 L64.51 93.29 Z"
];

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
  svg { width: 24px; height: 24px; }
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
  transform-origin: center;
  filter: drop-shadow(0 10px 16px rgba(80,70,150,.16));
  @media (prefers-reduced-motion: no-preference) {
    animation: ${({ $shooting }) => $shooting
      ? 'none'
      : 'camin .6s cubic-bezier(.2,1,.3,1) both, bob 4s ease-in-out 1s infinite'};
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

export default function Landing({ onTryNow, cameraRef, shooting }) {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    if (!shooting) { setFrame(0); return; }
    const N = CLOSE_FRAMES.length;
    const dur = 280;
    const start = performance.now();
    let raf = 0;
    const step = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = t * t;
      setFrame(Math.min(N - 1, Math.floor(eased * (N - 1) + 0.001)));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [shooting]);

  return (
    <Screen>
      <TopMini><Mark><LogoMark /></Mark>Studio</TopMini>

      <Dot $s={16} $c={colors.pink} $pos="top:120px;left:18%;" />
      <Dot $s={11} $c={colors.yellow} $pos="top:30%;right:16%;" />
      <Dot $s={22} $c={colors.mint} $pos="bottom:24%;left:14%;" />
      <Dot $s={9} $c={colors.purple} $pos="bottom:30%;right:22%;" />
      <Spark $c={colors.yellow} $pos="top:26%;left:24%;">✦</Spark>
      <Spark $c={colors.pink} $pos="bottom:28%;right:15%;">✦</Spark>

      <CamStage>
        <CamHalo />
        <Camera ref={cameraRef} $shooting={shooting} width="200" height="200" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-label="camera aperture">
          <path d={CLOSE_FRAMES[frame]} fill="#17171C" fillRule="evenodd" />
        </Camera>
      </CamStage>

      <Title>Your studio. <span>In the browser.</span></Title>
      <TryWrap>
        <TryBtn onClick={onTryNow}>Try now <span>→</span></TryBtn>
      </TryWrap>
    </Screen>
  );
}
