const palette = {
  bg:         '#D9E0FC',
  bgDeep:     '#C7D2FB',
  card:       '#FFFFFF',
  ink:        '#17171C',
  ink2:       '#41424C',
  mut:        '#7E8295',

  peri:       '#8C9BF2',
  periHover:  '#7585EC',
  periSoft:   '#B9C3FB',
  periTint:   '#EBEEFE',
  periTint2:  '#F1F3FC',

  pink:       '#F18FD0',
  pinkSoft:   '#FBD3EE',
  yellow:     '#F4C84F',
  yellowSoft: '#FCEFC5',
  yellowInk:  '#9a7414',
  purple:     '#C49BEA',
  purpleSoft: '#EEE0FB',
  mint:       '#8FE3C0',
  mintSoft:   '#D8F6EA',
  mintInk:    '#2a9e6a',
  blue:       '#A9B8FB',

  danger:     '#E5556E',
  white:      '#FFFFFF',
  black:      '#17171C',

  fieldBg:    '#F4F6FD',
  fieldBorder:'#E4E7F4',

  axisRed:    '#ED6A5A',
  axisGreen:  '#33A76A',
};

const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  return { r: parseInt(h.substring(0, 2), 16), g: parseInt(h.substring(2, 4), 16), b: parseInt(h.substring(4, 6), 16) };
};

export const alpha = (hex, opacity) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${opacity})`;
};

export const radii = { xl: '26px', lg: '20px', md: '14px', sm: '10px' };

export const colors = {
  // raw pastel palette
  bg: palette.bg,
  bgDeep: palette.bgDeep,
  card: palette.card,
  ink: palette.ink,
  ink2: palette.ink2,
  mut: palette.mut,
  peri: palette.peri,
  periHover: palette.periHover,
  periSoft: palette.periSoft,
  periTint: palette.periTint,
  pink: palette.pink,
  pinkSoft: palette.pinkSoft,
  yellow: palette.yellow,
  yellowSoft: palette.yellowSoft,
  yellowInk: palette.yellowInk,
  purple: palette.purple,
  purpleSoft: palette.purpleSoft,
  mint: palette.mint,
  mintSoft: palette.mintSoft,
  mintInk: palette.mintInk,
  blue: palette.blue,
  fieldBg: palette.fieldBg,
  fieldBorder: palette.fieldBorder,

  // text
  text:              palette.ink,
  textMuted:         palette.mut,
  textDim:           '#9aa0bc',
  textOnAccent:      palette.white,

  // accent (periwinkle)
  accent:            palette.peri,
  accentHover:       palette.periHover,
  accentSoft:        palette.periTint,
  accentSubtle:      palette.periTint2,
  accentFaint:       '#F4F6FD',
  accentGhost:       '#F7F8FE',
  accentBorder:      alpha(palette.peri, 0.45),
  accentBorderHover: alpha(palette.peri, 0.75),

  // danger
  danger:            palette.danger,
  dangerSoft:        '#FBE3EA',
  dangerBorder:      alpha(palette.danger, 0.3),

  // backgrounds
  background:        palette.bg,
  sceneBg:           '#EEF0FB',
  surface:           palette.card,
  surfaceHover:      '#F4F6FD',
  surfaceActive:     '#EDF0FB',
  surfaceStrong:     palette.card,
  surfaceDark:       palette.card,
  surfaceOverlay:    palette.card,
  surfacePanel:      palette.card,
  surfaceModal:      palette.card,

  // borders
  border:            palette.fieldBorder,
  borderLight:       '#ECEEF8',
  borderSubtle:      '#F1F3FC',
  borderHover:       '#C7CEF6',
  borderStrong:      '#D6DBF3',

  // shadows (soft lavender)
  shadowHeavy:       alpha('#7887E6', 0.28),
  shadowMedium:      alpha('#7887E6', 0.18),
  shadowLight:       alpha('#7887E6', 0.14),

  // scrollbar
  scrollThumb:       '#D4DAF2',
  scrollThumbHover:  '#C2CAEC',
  scrollTrack:       'transparent',

  // selection / focus
  selection:         alpha(palette.peri, 0.3),
  focusRing:         alpha(palette.peri, 0.5),

  // placeholder
  placeholder:       '#aab0c6',
  placeholderSubtle: '#c3c8da',

  // axes (inspector: X red, Y green, Z peri)
  axisX:             palette.axisRed,
  axisY:             palette.axisGreen,
  axisZ:             palette.peri,

  // domain-specific
  lightIcon:         palette.yellow,
  productIcon:       '#8E94AE',

  // misc
  black:             palette.ink,
  white:             palette.white,

  // logo gradient (peri → purple)
  logoFrom:          palette.peri,
  logoTo:            palette.purple,

  // avatar (pink → yellow)
  avatarFrom:        palette.pink,
  avatarTo:          palette.yellow,
  avatarBorder:      palette.fieldBorder,

  // status bar
  statusGood:        '#2fb277',
  statusWarn:        palette.yellow,
  statusBad:         palette.danger,

  // shot cards (filmstrip): blue, pink, yellow, purple
  shotColors: ['#A9B8FB', '#F18FD0', '#F4C84F', '#C49BEA', '#A9B8FB', '#F18FD0', '#F4C84F'],
};

export const shadows = {
  card:      '0 12px 30px rgba(120,135,230,.16)',
  cardSm:    '0 4px 14px rgba(120,135,230,.14)',
  btn:       '0 5px 0 #050509',
  btnSm:     '0 4px 0 #050509',
  btnActive: '0 1px 0 #050509',
  dropdown:  '0 16px 48px rgba(120,135,230,.28), 0 0 0 1px #E4E7F4',
  menu:      '0 8px 28px rgba(120,135,230,.2), 0 0 0 1px #E4E7F4',
  modal:     '0 24px 60px rgba(120,135,230,.3)',
};
