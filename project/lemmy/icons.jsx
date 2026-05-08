// icons.jsx — line icons, 24x24 viewBox, stroke-current
// All icons take { size=22, color='currentColor', stroke=2 }
function I(d, props) {
  const p = props || {};
  const size   = p.size   != null ? p.size   : 22;
  const color  = p.color  != null ? p.color  : 'currentColor';
  const stroke = p.stroke != null ? p.stroke : 1.8;
  const fill   = p.fill   != null ? p.fill   : 'none';
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={fill}
    stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0, display: 'block' }}>{d}</svg>
  );
}

const Icon = {
  home: (p) => I(<><path d="M3 11l9-8 9 8" /><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" /></>, p),
  search: (p) => I(<><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></>, p),
  plus: (p) => I(<><path d="M12 5v14M5 12h14" /></>, p),
  bell: (p) => I(<><path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" /><path d="M10 19a2 2 0 0 0 4 0" /></>, p),
  user: (p) => I(<><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></>, p),
  cog: (p) => I(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></>, p),
  arrowUp: (p) => I(<><path d="M12 19V5M5 12l7-7 7 7" /></>, p),
  arrowDown: (p) => I(<><path d="M12 5v14M5 12l7 7 7-7" /></>, p),
  comment: (p) => I(<><path d="M21 12a8 8 0 0 1-11.3 7.3L4 21l1.7-5.7A8 8 0 1 1 21 12Z" /></>, p),
  share: (p) => I(<><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" /><path d="M16 6l-4-4-4 4" /><path d="M12 2v14" /></>, p),
  bookmark: (p) => I(<><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></>, p),
  more: (p) => I(<><circle cx="5" cy="12" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="19" cy="12" r="1.4" /></>, { ...p, fill: 'currentColor' }),
  back: (p) => I(<><path d="M15 5l-7 7 7 7" /></>, p),
  close: (p) => I(<><path d="M6 6l12 12M18 6L6 18" /></>, p),
  check: (p) => I(<><path d="M5 12l5 5 9-11" /></>, p),
  flame: (p) => I(<><path d="M12 3s5 4 5 9a5 5 0 0 1-10 0c0-2 1-3 1-3s.5 2 2 2c0-3 2-5 2-8z" /></>, p),
  clock: (p) => I(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>, p),
  star: (p) => I(<><path d="M12 3l2.6 5.6 6.1.6-4.6 4.2 1.3 6L12 16.6 6.6 19.4l1.3-6L3.3 9.2l6.1-.6z" /></>, p),
  filter: (p) => I(<><path d="M3 5h18M6 12h12M10 19h4" /></>, p),
  link: (p) => I(<><path d="M10 14a4 4 0 0 0 5.6 0l3-3a4 4 0 0 0-5.6-5.6l-1 1" /><path d="M14 10a4 4 0 0 0-5.6 0l-3 3a4 4 0 0 0 5.6 5.6l1-1" /></>, p),
  image: (p) => I(<><rect x="3" y="4" width="18" height="16" rx="3" /><circle cx="9" cy="10" r="1.6" /><path d="M21 16l-5-5-9 9" /></>, p),
  text: (p) => I(<><path d="M5 6h14M9 6v14M5 12h8" /></>, p),
  reply: (p) => I(<><path d="M9 14l-5-5 5-5" /><path d="M4 9h11a5 5 0 0 1 5 5v6" /></>, p),
  inbox: (p) => I(<><path d="M3 14h5l1 3h6l1-3h5" /><path d="M5 4h14l2 10v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z" /></>, p),
  at: (p) => I(<><circle cx="12" cy="12" r="4" /><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" /></>, p),
  envelope: (p) => I(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 7 9-7" /></>, p),
  globe: (p) => I(<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>, p),
  lock: (p) => I(<><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>, p),
  eye: (p) => I(<><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>, p),
  pencil: (p) => I(<><path d="M4 20h4l11-11-4-4L4 16z" /><path d="M14 6l4 4" /></>, p),
  trash: (p) => I(<><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></>, p),
  download: (p) => I(<><path d="M12 4v12M6 12l6 6 6-6M4 20h16" /></>, p),
  moon: (p) => I(<><path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z" /></>, p),
  spark: (p) => I(<><path d="M12 3l1.5 5L19 9.5 13.5 11 12 16l-1.5-5L5 9.5 10.5 8z" /></>, p),
  hash: (p) => I(<><path d="M4 9h16M4 15h16M10 3l-2 18M16 3l-2 18" /></>, p)
};

window.Icon = Icon;