// theme.jsx — dark-mode tokens, accent palette, density scales
// Exposed on window: useTheme, ACCENTS, DENSITIES

const ACCENTS = {
  amber:    { name: 'Amber',    hex: '#ff9f43', soft: 'rgba(255,159,67,0.14)'  },
  violet:   { name: 'Violet',   hex: '#8b7cff', soft: 'rgba(139,124,255,0.16)' },
  green:    { name: 'Green',    hex: '#3ecf8e', soft: 'rgba(62,207,142,0.14)'  },
  blue:     { name: 'Blue',     hex: '#5fa8ff', soft: 'rgba(95,168,255,0.16)'  },
  rose:     { name: 'Rose',     hex: '#ff6b8a', soft: 'rgba(255,107,138,0.16)' },
};

const DENSITIES = {
  compact:  { row: 76,  pad: 10, gap: 6,  thumb: 56, font: 14, title: 14.5, meta: 11.5, line: 1.32 },
  regular:  { row: 100, pad: 14, gap: 9,  thumb: 72, font: 15, title: 16,   meta: 12,   line: 1.36 },
  spacious: { row: 132, pad: 18, gap: 12, thumb: 92, font: 16, title: 17,   meta: 12.5, line: 1.42 },
};

// Build the theme object the whole app reads from.
function buildTheme(t) {
  const amoled = !!t.amoled;
  const accent = ACCENTS[t.accent] || ACCENTS.amber;
  const density = DENSITIES[t.density] || DENSITIES.regular;

  // Surfaces
  const bg       = amoled ? '#000000' : '#0e0f12';
  const surface  = amoled ? '#0a0a0c' : '#16181d';
  const surface2 = amoled ? '#121214' : '#1d2026';
  const elev     = amoled ? '#15161a' : '#22252c';
  const hairline = amoled ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.07)';
  const divider  = amoled ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.05)';

  // Text
  const text     = '#ecedf2';
  const textDim  = 'rgba(236,237,242,0.62)';
  const textFaint= 'rgba(236,237,242,0.38)';

  // Action colors
  const upvote   = accent.hex;
  const downvote = '#7aa6ff';
  const danger   = '#ff5d6c';

  return {
    amoled, accent, density,
    cards: !!t.cards,
    thumbs: !!t.thumbs,
    bg, surface, surface2, elev, hairline, divider,
    text, textDim, textFaint,
    upvote, downvote, danger,
    radius: t.cards ? 18 : 0,
    fontSans: 'Inter, -apple-system, "SF Pro Text", system-ui, sans-serif',
    fontSerif: '"Source Serif 4", Georgia, serif',
    fontMono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  };
}

Object.assign(window, { ACCENTS, DENSITIES, buildTheme });
