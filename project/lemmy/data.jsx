// data.jsx — sample content for the Lemmy prototype
// Mixed: tech, photography, news, hobbies, mech keyboards, indie web, etc.

// Generate a deterministic colorful gradient + initial for community/user avatars
function avatar(seed, opts = {}) {
  // simple hash
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

// 6 thumbnail "images" — drawn as SVG strings, served via data URL.
// Avoids real image deps and gives every post a visual.
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

const COMMUNITIES = [
  { id: 'programming',  name: 'programming',     instance: 'lemmy.ml',     members: '128k', desc: 'All things programming. Languages, paradigms, war stories.', cover: 'code' },
  { id: 'selfhosted',   name: 'selfhosted',      instance: 'lemmy.world',  members: '94.2k', desc: 'Self-hosting your own services. Docker, k8s, bare metal.', cover: 'gear' },
  { id: 'photography',  name: 'photography',     instance: 'lemmy.ca',     members: '52.8k', desc: 'Sharing photos and craft. All formats welcome.', cover: 'photo' },
  { id: 'mechkeyboards',name: 'mechanicalkeyboards', instance: 'lemmy.world',members:'71.4k', desc: 'Click clack. Builds, group buys, switch reviews.', cover: 'gear' },
  { id: 'worldnews',    name: 'worldnews',       instance: 'lemmy.ml',     members: '210k',  desc: 'News from around the globe. Sources required.', cover: 'news' },
  { id: 'cozy',         name: 'cozygames',       instance: 'beehaw.org',   members: '38.1k', desc: 'Soft, slow, gentle games. Coffee included.', cover: 'art' },
  { id: 'indieweb',     name: 'indieweb',        instance: 'fed.fyi',      members: '12.6k', desc: 'POSSE, RSS, personal sites, owning your stuff.', cover: 'abstract' },
  { id: 'cooking',      name: 'cooking',         instance: 'lemmy.world',  members: '46.0k', desc: 'Recipes, techniques, and dinner photos.', cover: 'food' },
];
COMMUNITIES.forEach(c => { c.avatar = avatar(c.id, { letter: c.name[0] }); });

const USERS = [
  { id: 'mira',     name: 'mira_writes',     instance: 'lemmy.ml' },
  { id: 'jules',    name: 'jules.dev',       instance: 'fed.fyi' },
  { id: 'orion',    name: 'orion42',         instance: 'lemmy.world' },
  { id: 'fenwick',  name: 'fenwick',         instance: 'beehaw.org' },
  { id: 'rkfox',    name: 'rk_fox',          instance: 'lemmy.ca' },
  { id: 'amelia',   name: 'amelia',          instance: 'lemmy.world' },
  { id: 'noor',     name: 'noor.codes',      instance: 'lemmy.ml' },
  { id: 'kestrel',  name: 'kestrel',         instance: 'beehaw.org' },
];
USERS.forEach(u => { u.avatar = avatar(u.id); });

const ME = { id: 'me', name: 'you', instance: 'lemmy.world', avatar: avatar('me_user', { letter: 'Y' }) };

const POSTS = [
  { id: 1, community: 'programming', author: 'jules', age: '2h',
    title: 'I rewrote my static-site generator in 200 lines of Zig and it builds my whole blog in 14ms',
    body: 'Coming from a Node-based pipeline that took ~3s, this feels like a different planet. The full source plus a writeup on why I dropped the markdown library and wrote my own tiny parser.',
    url: 'jules.dev/zig-ssg', kind: 'link', thumb: thumb('code'),
    score: 1284, votes: 'up', comments: 187, saved: false, tag: 'Show /c' },
  { id: 2, community: 'photography', author: 'rkfox', age: '4h',
    title: 'Foggy morning over the Coast Range — Pentax K1, 77mm Limited',
    body: '', kind: 'image', thumb: thumb('photo'),
    score: 942, votes: null, comments: 64, saved: true, tag: 'OC' },
  { id: 3, community: 'selfhosted', author: 'orion', age: '6h',
    title: 'After 3 years self-hosting, here is the boring stack I stopped fighting',
    body: 'Proxmox at the bottom, a single Debian VM with Docker Compose, Caddy in front, restic to a Hetzner box for backups. No k8s. No fancy GitOps. Uptime is 99.98% and I sleep through the night.',
    kind: 'text', thumb: null,
    score: 2107, votes: 'up', comments: 312, saved: false },
  { id: 4, community: 'mechkeyboards', author: 'kestrel', age: '8h',
    title: 'Finished the milk-tea build. Topre-modded with silenced sliders, GMK Olivia dye-sub clones',
    body: '', kind: 'image', thumb: thumb('gear'),
    score: 612, votes: null, comments: 41, saved: false, tag: 'Build' },
  { id: 5, community: 'worldnews', author: 'amelia', age: '11h',
    title: 'EU regulators outline draft framework for cross-border data residency in federated services',
    body: '', kind: 'link', thumb: thumb('news'),
    url: 'eu-regulator.eu', kind: 'link',
    score: 433, votes: null, comments: 156, saved: false },
  { id: 6, community: 'cozy', author: 'fenwick', age: '14h',
    title: 'A Short Hike clones I have been playing this week, ranked',
    body: 'Spoiler: nothing beats the original, but Lil Gator Game and Mineko\'s Night Market come close. Looking for more recs in this exact vibe.',
    kind: 'text', thumb: null,
    score: 388, votes: 'down', comments: 92, saved: false },
  { id: 7, community: 'indieweb', author: 'mira', age: '1d',
    title: 'Owning your archive: a tiny script that turns Mastodon exports into a searchable JSON feed',
    body: '', kind: 'link', thumb: thumb('abstract'),
    url: 'mira.fyi/archive', score: 256, votes: null, comments: 34, saved: true },
  { id: 8, community: 'cooking', author: 'noor', age: '1d',
    title: 'Weeknight harissa chickpeas, 20 minutes flat — recipe in comments',
    body: '', kind: 'image', thumb: thumb('food'),
    score: 871, votes: 'up', comments: 78, saved: false, tag: 'Recipe' },
  { id: 9, community: 'programming', author: 'noor', age: '1d',
    title: 'Why I stopped using ORMs, and the boring SQL functions I write instead',
    body: 'Hot take but increasingly mainstream: a thin query module beats the magic. 18 months in production, here is what broke and what didn\'t.',
    kind: 'text', score: 1422, votes: null, comments: 401, saved: false, tag: 'Discussion' },
  { id: 10, community: 'photography', author: 'kestrel', age: '2d',
    title: 'How I edit black-and-white film scans, a 5-step Lightroom recipe',
    body: '', kind: 'link', thumb: thumb('art'),
    score: 318, votes: null, comments: 22, saved: false },
];
POSTS.forEach(p => {
  p.communityRef = COMMUNITIES.find(c => c.id === p.community);
  p.authorRef = USERS.find(u => u.id === p.author);
});

// Comments for post 3 (the boring stack one)
const COMMENTS = [
  { id: 1, author: 'mira', age: '5h', score: 142, votes: 'up', depth: 0,
    body: 'Genuinely refreshing to read. The k8s-or-bust vibe in self-hosted communities online has gotten exhausting. A single VM with Compose really does cover 95% of cases.',
    replies: [
      { id: 2, author: 'orion', age: '4h', score: 88, votes: null, depth: 1, op: true,
        body: 'Yeah and the upgrade story is just `docker compose pull && docker compose up -d`. I have a Sunday-morning cron that runs it on quiet services.',
        replies: [
          { id: 3, author: 'jules', age: '4h', score: 24, votes: null, depth: 2,
            body: 'Auto-pulling on a cron is brave. I let Watchtower do it and pin majors.', replies: [] },
        ]},
      { id: 4, author: 'fenwick', age: '3h', score: 31, votes: null, depth: 1,
        body: 'I spent two weekends on Talos Linux and ended up exactly here. Stop, you would have saved me the time.', replies: [] },
    ]},
  { id: 5, author: 'amelia', age: '4h', score: 64, votes: null, depth: 0,
    body: 'Restic to Hetzner is a great combo. Pair it with a healthchecks.io ping and you have a backup story most companies would envy.', replies: [] },
  { id: 6, author: 'kestrel', age: '3h', score: 18, votes: 'down', depth: 0,
    body: 'Counterpoint: at 12+ services Compose YAML becomes a mess. Worth at least looking at Docker Swarm before going k8s.',
    replies: [
      { id: 7, author: 'noor', age: '2h', score: 9, votes: null, depth: 1,
        body: 'Or just split into multiple compose files behind a single Caddy. The "one giant compose" anti-pattern is real.', replies: [] },
    ]},
  { id: 8, author: 'rkfox', age: '2h', score: 7, votes: null, depth: 0,
    body: 'Saved. About to do a clean reinstall this weekend, this is the push I needed.', replies: [] },
];

const NOTIFICATIONS = {
  replies: [
    { id: 'n1', kind: 'reply', from: 'mira', age: '12m', unread: true,
      title: 'replied to your post', context: 'After 3 years self-hosting, here is the boring stack…',
      body: 'Genuinely refreshing to read. The k8s-or-bust vibe in self-hosted communities online has gotten exhausting.' },
    { id: 'n2', kind: 'reply', from: 'fenwick', age: '1h', unread: true,
      title: 'replied to your comment', context: 'in c/selfhosted',
      body: 'I spent two weekends on Talos Linux and ended up exactly here. Stop.' },
    { id: 'n3', kind: 'reply', from: 'amelia', age: '4h', unread: false,
      title: 'replied to your post', context: 'After 3 years self-hosting…',
      body: 'Restic to Hetzner is a great combo. Pair it with healthchecks.io.' },
    { id: 'n4', kind: 'reply', from: 'jules', age: '1d', unread: false,
      title: 'replied to your comment', context: 'in c/programming',
      body: 'Watchtower is fine but pinning majors is the real move.' },
  ],
  mentions: [
    { id: 'n5', kind: 'mention', from: 'noor', age: '2h', unread: true,
      title: 'mentioned you', context: 'in c/programming',
      body: '@you wrote a great breakdown of this last month — linking it here for context.' },
    { id: 'n6', kind: 'mention', from: 'orion', age: '2d', unread: false,
      title: 'mentioned you', context: 'in c/selfhosted',
      body: 'cc @you, this is the proxmox box you helped me set up.' },
  ],
  messages: [
    { id: 'n7', kind: 'message', from: 'mira', age: '8m', unread: true,
      title: 'sent you a message', context: '',
      body: 'Hey — would you be down to cross-post that self-hosting writeup to c/sysadmin? I can do the pinning.' },
    { id: 'n8', kind: 'message', from: 'kestrel', age: '3d', unread: false,
      title: 'sent you a message', context: '',
      body: 'Found those silenced sliders in the BST thread, going to mail them tomorrow. What\'s your address?' },
  ],
};

const TRENDING_TAGS = ['selfhosted', 'rust', 'foss', 'film-photography', 'cozy-games', 'mech-keys', 'fediverse', 'rss-revival'];

Object.assign(window, { COMMUNITIES, USERS, POSTS, COMMENTS, NOTIFICATIONS, TRENDING_TAGS, ME, avatar, thumb });
