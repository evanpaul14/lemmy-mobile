// data.jsx — API client + visual utilities for the Lemmy app

// ── Visual helpers (unchanged — used everywhere for avatars and placeholders) ─

function avatar(seed, opts = {}) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const a = Math.abs(h) % 360;
  const b = (a + 35) % 360;
  return {
    bg: `linear-gradient(135deg, hsl(${a} 65% 55%), hsl(${b} 70% 42%))`,
    fg: '#fff',
    letter: (opts.letter || seed[0] || '?').toUpperCase(),
  };
}

function thumb(kind) {
  const palettes = {
    code:    ['#1a1d24', '#3ecf8e', '#5fa8ff'],
    photo:   ['#2c1810', '#ff9f43', '#7a3a1f'],
    news:    ['#0f1729', '#5fa8ff', '#9aa3b2'],
    art:     ['#2a103e', '#c084fc', '#fb7185'],
    nature:  ['#0d2818', '#3ecf8e', '#86efac'],
    gear:    ['#1c1c20', '#e5e7eb', '#a3a3a3'],
    sky:     ['#0c1a3a', '#5fa8ff', '#fde68a'],
    food:    ['#2a1108', '#fb923c', '#fbbf24'],
    abstract:['#101820', '#8b7cff', '#3ecf8e'],
  };
  const p = palettes[kind] || palettes.abstract;
  const id = 'g' + Math.floor(Math.random() * 1e6);
  let body = '';
  if (kind === 'photo' || kind === 'sky') {
    body = `<rect width='400' height='240' fill='url(#${id})'/>
      <circle cx='${kind==='sky'?320:80}' cy='70' r='${kind==='sky'?40:32}' fill='${p[2]}' opacity='0.85'/>
      <path d='M0 180 Q100 140 200 170 T400 160 L400 240 L0 240Z' fill='${p[2]}' opacity='0.5'/>`;
  } else if (kind === 'code') {
    body = `<rect width='400' height='240' fill='${p[0]}'/>
      <g font-family='monospace' font-size='14' fill='${p[1]}' opacity='0.85'>
        <text x='20' y='40'>const</text><text x='65' y='40' fill='${p[2]}'>render</text><text x='130' y='40'>= () =&gt; (</text>
        <text x='40' y='66' fill='${p[2]}'>&lt;Card/&gt;</text>
        <text x='20' y='92'>);</text>
        <text x='20' y='130' opacity='0.55'>// rendered in 0.4ms</text>
      </g>`;
  } else if (kind === 'gear') {
    body = `<rect width='400' height='240' fill='${p[0]}'/>
      <g fill='${p[1]}'><rect x='40' y='90' width='320' height='80' rx='10' opacity='0.9'/>
      ${Array.from({length:14}).map((_,i)=>`<rect x='${52+i*22}' y='100' width='18' height='28' rx='3' fill='${p[2]}'/>`).join('')}</g>`;
  } else if (kind === 'food') {
    body = `<rect width='400' height='240' fill='${p[0]}'/>
      <circle cx='200' cy='130' r='80' fill='${p[1]}'/>
      <circle cx='200' cy='130' r='55' fill='${p[2]}' opacity='0.7'/>`;
  } else if (kind === 'nature') {
    body = `<rect width='400' height='240' fill='${p[0]}'/>
      <path d='M0 200 L80 100 L140 170 L220 80 L300 160 L400 110 L400 240 L0 240Z' fill='${p[1]}'/>
      <path d='M0 220 L120 170 L240 210 L400 180 L400 240 L0 240Z' fill='${p[2]}' opacity='0.7'/>`;
  } else if (kind === 'art') {
    body = `<rect width='400' height='240' fill='url(#${id})'/>
      <circle cx='140' cy='110' r='60' fill='${p[2]}' opacity='0.7'/>
      <circle cx='240' cy='150' r='80' fill='${p[1]}' opacity='0.6'/>`;
  } else if (kind === 'news') {
    body = `<rect width='400' height='240' fill='${p[0]}'/>
      <rect x='30' y='40' width='340' height='14' rx='3' fill='${p[1]}' opacity='0.9'/>
      <rect x='30' y='66' width='280' height='8' rx='3' fill='${p[2]}' opacity='0.6'/>
      <rect x='30' y='82' width='240' height='8' rx='3' fill='${p[2]}' opacity='0.5'/>
      <rect x='30' y='130' width='160' height='80' rx='4' fill='${p[1]}' opacity='0.3'/>`;
  } else {
    body = `<rect width='400' height='240' fill='url(#${id})'/>
      <circle cx='100' cy='90' r='50' fill='${p[2]}' opacity='0.6'/>
      <rect x='180' y='60' width='180' height='120' rx='10' fill='${p[1]}' opacity='0.55'/>`;
  }
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 240' width='400' height='240'>
    <defs><linearGradient id='${id}' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0' stop-color='${p[0]}'/><stop offset='1' stop-color='${p[1]}'/>
    </linearGradient></defs>${body}</svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

// ── API client ────────────────────────────────────────────────────────────────

const API = {
  async _req(path, opts = {}) {
    const res = await fetch('/api' + path, {
      ...opts,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'Request failed');
    }
    return res.json();
  },

  // Auth
  login: (instance, username, password) =>
    API._req('/auth/login', { method: 'POST', body: JSON.stringify({ instance, username, password }) }),
  loginAnonymous: (instance) =>
    API._req('/auth/login', { method: 'POST', body: JSON.stringify({ instance, anonymous: true }) }),
  logout: () => API._req('/auth/logout', { method: 'POST' }),
  me: () => API._req('/auth/me'),

  // Posts
  getPosts: (type = 'All', sort = 'Hot', page = 1) =>
    API._req(`/posts?type=${type}&sort=${sort}&page=${page}`),
  getPost: (id) => API._req(`/posts/${id}`),
  getComments: (postId, sort = 'Hot') =>
    API._req(`/posts/${postId}/comments?sort=${encodeURIComponent(sort)}`),
  getUserProfile: (username) =>
    API._req(`/profile/${encodeURIComponent(username)}`),
  votePost: (id, score) =>
    API._req(`/posts/${id}/vote`, { method: 'POST', body: JSON.stringify({ score }) }),
  savePost: (id, save) =>
    API._req(`/posts/${id}/save`, { method: 'POST', body: JSON.stringify({ save }) }),
  createPost: (data) =>
    API._req('/posts', { method: 'POST', body: JSON.stringify(data) }),

  // Comments
  voteComment: (id, score) =>
    API._req(`/comments/${id}/vote`, { method: 'POST', body: JSON.stringify({ score }) }),
  createComment: (postId, content, parentId = null) =>
    API._req('/comments', { method: 'POST', body: JSON.stringify({ post_id: postId, content, parent_id: parentId }) }),

  // Communities
  getCommunities: (type = 'All') => API._req(`/communities?type=${type}`),
  getCommunity: (name) => API._req(`/communities/${name}`),
  getCommunityPosts: (name, sort = 'Hot', page = 1) =>
    API._req(`/communities/${name}/posts?sort=${sort}&page=${page}`),

  // Search
  search: (q, type = 'All') =>
    API._req(`/search?q=${encodeURIComponent(q)}&type=${type}`),

  // Inbox
  getReplies: () => API._req('/inbox/replies'),
  getMentions: () => API._req('/inbox/mentions'),
  getMessages: () => API._req('/inbox/messages'),
  markReplyRead: (id) => API._req(`/inbox/replies/${id}/read`, { method: 'POST' }),
  markMentionRead: (id) => API._req(`/inbox/mentions/${id}/read`, { method: 'POST' }),

  // Profile
  getProfile: () => API._req('/profile'),
};

// ── Data enrichment (add generated avatars to API responses) ─────────────────

function enrichPosts(posts) {
  return (posts || []).map(p => ({
    ...p,
    communityRef: p.communityRef ? {
      ...p.communityRef,
      avatar: avatar(p.communityRef.name || p.communityRef.id || 'c', { letter: (p.communityRef.name || 'c')[0] }),
    } : null,
    authorRef: p.authorRef ? {
      ...p.authorRef,
      avatar: avatar(p.authorRef.name || p.authorRef.id || 'u'),
    } : null,
  }));
}

function enrichCommunities(communities) {
  return (communities || []).map(c => ({
    ...c,
    avatar: avatar(c.name || c.id || 'c', { letter: (c.name || 'c')[0] }),
  }));
}

function enrichComments(comments) {
  return (comments || []).map(c => ({
    ...c,
    authorRef: c.authorRef ? {
      ...c.authorRef,
      avatar: avatar(c.authorRef.name || c.author || 'u'),
    } : null,
    replies: enrichComments(c.replies || []),
  }));
}

// ── Live globals (populated by app.jsx after data fetch) ─────────────────────

window.COMMUNITIES = [];
window.USERS = [];
window.POSTS = [];
window.COMMENTS = [];
window.NOTIFICATIONS = { replies: [], mentions: [], messages: [] };
window.TRENDING_TAGS = ['selfhosted', 'rust', 'foss', 'film-photography', 'cozy-games', 'mech-keys', 'fediverse', 'rss-revival'];
window.ME = null;

Object.assign(window, { avatar, thumb, API, enrichPosts, enrichCommunities, enrichComments });
