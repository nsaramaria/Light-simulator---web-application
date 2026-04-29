
const palette = {
  accent:       '#E8A855',
  accentHover:  '#D08030',
  danger:       '#C75450',
  black:        '#000000',
  white:        '#FFFFFF',

  // Warm neutrals (dark → light)
  neutral950:   '#08080A',
  neutral900:   '#0A0908',
  neutral850:   '#0C0B09',
  neutral800:   '#1a1612',
  neutral700:   '#2a2018',
  neutral600:   '#3a2a1a',
  neutral500:   '#555048',
  neutral400:   '#888078',
  neutral300:   '#EDE6DD',

  // Axis colors
  red:          '#E05A4E',
  green:        '#5AAD5A',
  blue:         '#4A90D9',

  // Semantic
  lightIcon:    '#FFE4AA',
  productIcon:  '#D4A5A5',
  sky:          '#87ceeb',
};

// Opacity helpers

const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
};

export const alpha = (hex, opacity) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${opacity})`;
};

// Semantic tokens
// These map palette colors to UI purposes. Components use ONLY these

export const colors = {
  // Text
  text:              palette.neutral300,
  textMuted:         palette.neutral400,
  textDim:           palette.neutral500,
  textOnAccent:      palette.black,

  // Accent
  accent:            palette.accent,
  accentHover:       palette.accentHover,
  accentSoft:        alpha(palette.accent, 0.12),
  accentSubtle:      alpha(palette.accent, 0.08),
  accentFaint:       alpha(palette.accent, 0.06),
  accentGhost:       alpha(palette.accent, 0.04),
  accentBorder:      alpha(palette.accent, 0.3),
  accentBorderHover: alpha(palette.accent, 0.5),

  // Danger
  danger:            palette.danger,
  dangerSoft:        alpha(palette.danger, 0.08),
  dangerBorder:      alpha(palette.danger, 0.2),

  // Backgrounds
  background:        palette.neutral950,
  sceneBg:           palette.neutral900,
  surface:           alpha(palette.white, 0.015),
  surfaceHover:      alpha(palette.white, 0.03),
  surfaceActive:     alpha(palette.white, 0.04),
  surfaceStrong:     alpha(palette.white, 0.05),
  surfaceDark:       alpha(palette.neutral850, 0.95),
  surfaceOverlay:    alpha(palette.neutral850, 0.97),
  surfacePanel:      alpha(palette.neutral850, 0.85),
  surfaceModal:      alpha(palette.neutral800, 0.85),

  //Borders
  border:            alpha(palette.white, 0.06),
  borderLight:       alpha(palette.white, 0.04),
  borderSubtle:      alpha(palette.white, 0.03),
  borderHover:       alpha(palette.white, 0.12),
  borderStrong:      alpha(palette.white, 0.08),

  // Shadows
  shadowHeavy:       alpha(palette.black, 0.7),
  shadowMedium:      alpha(palette.black, 0.6),
  shadowLight:       alpha(palette.black, 0.5),

  // Scrollbar
  scrollThumb:       alpha(palette.white, 0.08),
  scrollThumbHover:  alpha(palette.white, 0.15),
  scrollTrack:       'transparent',

  // Selection /focus
  selection:         alpha(palette.accent, 0.3),
  focusRing:         alpha(palette.accent, 0.5),

  // Placeholder
  placeholder:       alpha(palette.white, 0.2),
  placeholderSubtle: alpha(palette.white, 0.15),

  // Axes (for 3D gizmos + inspector)
  axisX:             palette.red,
  axisY:             palette.green,
  axisZ:             palette.blue,

  // Domain-specific
  lightIcon:         palette.lightIcon,
  productIcon:       palette.productIcon,

  // Misc
  black:             palette.black,
  white:             palette.white,

  // Logo gradient
  logoFrom:          palette.accent,
  logoTo:            palette.danger,

  // Avatar
  avatarFrom:        palette.neutral600,
  avatarTo:          palette.neutral700,
  avatarBorder:      alpha(palette.white, 0.08),

  // Status bar
  statusGood:        palette.green,
  statusWarn:        palette.accent,
  statusBad:         palette.danger,

  // Shot card colors (filmstrip)
  shotColors: ['#2a1a10', '#1a1520', '#101a15', '#1a1010', '#10151a', '#1a1a10', '#151020'],
};

//Shadows (composite)

export const shadows = {
  dropdown: `0 16px 64px ${colors.shadowHeavy}, 0 0 0 1px ${colors.borderLight}`,
  menu:     `0 8px 32px ${colors.shadowMedium}, 0 0 0 1px ${colors.borderLight}`,
  modal:    `0 20px 25px -5px ${colors.shadowLight}`,
};