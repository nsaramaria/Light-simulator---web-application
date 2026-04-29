// ─── Base palette ───
// Change these to retheme the entire app.

const palette = {
  accent:       '#6A9FD8',
  accentHover:  '#5889BF',
  danger:       '#C75450',
  black:        '#000000',
  white:        '#FFFFFF',

  // Cool neutrals (dark → light)
  neutral950:   '#0C0E14',
  neutral900:   '#0E1018',
  neutral850:   '#12141C',
  neutral800:   '#1A1D28',
  neutral700:   '#242836',
  neutral600:   '#363A4A',
  neutral500:   '#585E6E',
  neutral400:   '#8890A0',
  neutral300:   '#D0D5DF',

  // Axis colors
  red:          '#E05A4E',
  green:        '#5AAD5A',
  blue:         '#4A90D9',

  // Semantic
  lightIcon:    '#D4B94E',
  productIcon:  '#A5B0D4',
  sky:          '#87ceeb',
};

// ─── Opacity helpers ───

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

// ─── Semantic tokens ───

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

  // Borders
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

  // Selection / focus
  selection:         alpha(palette.accent, 0.3),
  focusRing:         alpha(palette.accent, 0.5),

  // Placeholder
  placeholder:       alpha(palette.white, 0.2),
  placeholderSubtle: alpha(palette.white, 0.15),

  // Axes
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
  logoTo:            palette.lightIcon,

  // Avatar
  avatarFrom:        palette.neutral600,
  avatarTo:          palette.neutral700,
  avatarBorder:      alpha(palette.white, 0.08),

  // Status bar
  statusGood:        palette.green,
  statusWarn:        palette.lightIcon,
  statusBad:         palette.danger,

  // Shot card colors (filmstrip)
  shotColors: ['#101828', '#15102A', '#0E1A18', '#181014', '#0E1520', '#181A10', '#121028'],
};

// ─── Shadows ───

export const shadows = {
  dropdown: `0 16px 64px ${alpha(palette.black, 0.7)}, 0 0 0 1px ${alpha(palette.white, 0.04)}`,
  menu:     `0 8px 32px ${alpha(palette.black, 0.6)}, 0 0 0 1px ${alpha(palette.white, 0.04)}`,
  modal:    `0 20px 25px -5px ${alpha(palette.black, 0.5)}`,
};