// app.jsx — root: routing, tab bar, tweaks, frame

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "amber",
  "density": "regular",
  "cards": true,
  "thumbs": true,
  "amoled": false
}/*EDITMODE-END*/;

function TabBar({ theme, current, onTab, unread }) {
  const tabs = [
    { id: 'home',    icon: Icon.home,   label: 'Home' },
    { id: 'search',  icon: Icon.search, label: 'Search' },
    { id: 'inbox',   icon: Icon.inbox,  label: 'Inbox' },
    { id: 'profile', icon: Icon.user,   label: 'Profile' },
  ];
  return (
    <div style={{
      position: 'absolute', left: 8, right: 8, bottom: 12, zIndex: 50,
      borderRadius: 999, height: 60,
      background: theme.amoled ? 'rgba(20,20,22,0.85)' : 'rgba(28,30,36,0.78)',
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      border: `0.5px solid ${theme.hairline}`,
      boxShadow: '0 14px 40px rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      padding: '0 8px',
    }}>
      {tabs.map(t => {
        const active = current === t.id;
        return (
          <button key={t.id} onClick={() => onTab(t.id)} style={btnReset({
            flex: 1, height: 56, gap: 2, flexDirection: 'column',
            color: active ? theme.accent.hex : 'rgba(236,237,242,0.92)',
            position: 'relative',
          })}>
            <div style={{ position: 'relative' }}>
              <t.icon size={22} stroke={active ? 2.4 : 2.1} color={active ? theme.accent.hex : '#d8d8de'} />
              {t.id === 'inbox' && unread > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -8,
                  minWidth: 16, height: 16, borderRadius: 999,
                  background: theme.accent.hex, color: theme.amoled ? '#000' : '#0a0a0c',
                  fontSize: 9.5, fontWeight: 800, padding: '0 4px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1.5px solid ${theme.amoled ? '#141416' : '#1c1e24'}`,
                }}>{unread}</span>
              )}
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.1 }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function StatusBar({ dark = true }) {
  return (
    <div style={{
      height: 54, position: 'relative', zIndex: 30,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 28px 0', flexShrink: 0,
    }}>
      <div style={{
        fontFamily: '-apple-system, system-ui', fontWeight: 600,
        fontSize: 15, color: '#fff',
      }}>9:41</div>
      <div style={{ width: 90 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#fff' }}>
        <svg width="17" height="11" viewBox="0 0 17 11"><rect x="0" y="7" width="3" height="4" rx="0.7" fill="#fff"/><rect x="4.4" y="4.5" width="3" height="6.5" rx="0.7" fill="#fff"/><rect x="8.8" y="2" width="3" height="9" rx="0.7" fill="#fff"/><rect x="13.2" y="0" width="3" height="11" rx="0.7" fill="#fff"/></svg>
        <svg width="24" height="11" viewBox="0 0 24 11"><rect x="0.5" y="0.5" width="20" height="10" rx="2.5" fill="none" stroke="#fff" strokeOpacity="0.4"/><rect x="2" y="2" width="17" height="7" rx="1.5" fill="#fff"/><rect x="21.5" y="3.5" width="1.5" height="4" rx="0.5" fill="#fff" fillOpacity="0.4"/></svg>
      </div>
    </div>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const theme = buildTheme(t);

  const [authed, setAuthed] = React.useState(false);
  const [tab, setTab] = React.useState('home');
  const [stack, setStack] = React.useState([]);  // [{ kind, payload }]
  const [overlay, setOverlay] = React.useState(null); // 'compose' | 'settings' | 'search' | null
  const [posts, setPosts] = React.useState(POSTS);

  // mutate state
  const onVote = (id, v) => setPosts(prev => prev.map(p => p.id === id ? { ...p, votes: v } : p));
  const onSave = (id) => setPosts(prev => prev.map(p => p.id === id ? { ...p, saved: !p.saved } : p));

  const top = stack[stack.length - 1];
  const push = (item) => setStack(prev => [...prev, item]);
  const pop = () => setStack(prev => prev.slice(0, -1));

  function openPost(post) { push({ kind: 'post', payload: post }); }
  function openCommunity(c) { push({ kind: 'community', payload: c }); }

  // when user changes tabs, reset stack
  function selectTab(id) {
    setStack([]);
    setOverlay(null);
    setTab(id);
  }

  const unread =
    NOTIFICATIONS.replies.filter(n => n.unread).length +
    NOTIFICATIONS.mentions.filter(n => n.unread).length +
    NOTIFICATIONS.messages.filter(n => n.unread).length;

  // current screen content (without tab bar / overlays)
  let screen;
  if (top) {
    if (top.kind === 'post') {
      const fresh = posts.find(p => p.id === top.payload.id) || top.payload;
      screen = <PostDetailScreen theme={theme} post={fresh} onBack={pop}
        onVote={onVote} onSave={onSave} onOpenCommunity={openCommunity} />;
    } else if (top.kind === 'community') {
      screen = <CommunityScreen theme={theme} community={top.payload} posts={posts}
        onBack={pop} onOpenPost={openPost} onVote={onVote} onSave={onSave} />;
    }
  } else if (tab === 'home') {
    screen = <HomeScreen theme={theme} posts={posts}
      onOpenPost={openPost} onVote={onVote} onSave={onSave}
      onOpenCommunity={openCommunity}
      onOpenCompose={() => setOverlay('compose')}
      onOpenSearch={() => setOverlay('search')} />;
  } else if (tab === 'search') {
    screen = <SearchScreen theme={theme} posts={posts}
      onOpenPost={openPost} onOpenCommunity={openCommunity}
      onBack={() => selectTab('home')} />;
  } else if (tab === 'inbox') {
    screen = <InboxScreen theme={theme} onOpenPost={openPost} />;
  } else if (tab === 'profile') {
    screen = <ProfileScreen theme={theme} posts={posts}
      onOpenPost={openPost}
      onOpenSettings={() => setOverlay('settings')}
      onVote={onVote} onSave={onSave} />;
  }

  // Hide tab bar when on a stacked detail screen (more app-like)
  const showTabBar = !top && overlay !== 'compose' && overlay !== 'settings' && overlay !== 'search';

  if (!authed) {
    return (
      <Frame theme={theme}>
        <LoginScreen theme={theme} onComplete={() => setAuthed(true)} />
        <Tweaks theme={theme} t={t} setTweak={setTweak} />
      </Frame>
    );
  }

  return (
    <Frame theme={theme}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
        <StatusBar />
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {screen}
          {/* Detail screen overlays slide on top */}
        </div>
      </div>

      {showTabBar && <TabBar theme={theme} current={tab} onTab={selectTab} unread={unread} />}

      {/* overlay screens (modal sheets) */}
      {overlay === 'compose' && (
        <Sheet theme={theme}>
          <ComposeScreen theme={theme}
            onClose={() => setOverlay(null)}
            onSubmit={(data) => {
              const newPost = {
                id: Date.now(), community: data.community.id, author: 'me', age: 'now',
                title: data.title, body: data.body, kind: data.kind, url: data.url,
                thumb: data.kind === 'image' ? thumb('photo') : data.kind === 'link' ? thumb('news') : null,
                score: 1, votes: 'up', comments: 0, saved: false, tag: data.tag || null,
              };
              newPost.communityRef = data.community;
              newPost.authorRef = ME;
              setPosts(prev => [newPost, ...prev]);
              setOverlay(null);
            }} />
        </Sheet>
      )}
      {overlay === 'settings' && (
        <Sheet theme={theme}>
          <SettingsScreen theme={theme} onBack={() => setOverlay(null)} tweaks={t} setTweak={setTweak} />
        </Sheet>
      )}
      {overlay === 'search' && (
        <Sheet theme={theme}>
          <SearchScreen theme={theme} posts={posts}
            onOpenPost={(p) => { setOverlay(null); openPost(p); }}
            onOpenCommunity={(c) => { setOverlay(null); openCommunity(c); }}
            onBack={() => setOverlay(null)} />
        </Sheet>
      )}

      <Tweaks theme={theme} t={t} setTweak={setTweak} />
    </Frame>
  );
}

// Scaling phone frame: the iOS frame is 402×874. Scale to fit viewport.
function Frame({ theme, children }) {
  const W = 402, H = 874;
  const [scale, setScale] = React.useState(1);
  React.useEffect(() => {
    function fit() {
      const sw = window.innerWidth - 24;
      const sh = window.innerHeight - 24;
      const s = Math.min(sw / W, sh / H, 1);
      setScale(s);
    }
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  return (
    <div style={{
      width: W * scale, height: H * scale,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: W, height: H, transform: `scale(${scale})`, transformOrigin: 'center center',
        position: 'relative', flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 54, overflow: 'hidden',
          background: theme.bg,
          boxShadow: '0 40px 120px rgba(0,0,0,0.6), 0 0 0 8px #1a1a1d, 0 0 0 9px #2a2a2e',
        }}>
          {/* dynamic island */}
          <div style={{
            position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
            width: 122, height: 34, borderRadius: 22, background: '#000', zIndex: 100,
          }} />
          {children}
          {/* home indicator */}
          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: 0, height: 24,
            display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
            paddingBottom: 6, pointerEvents: 'none', zIndex: 200,
          }}>
            <div style={{ width: 134, height: 5, borderRadius: 999, background: 'rgba(255,255,255,0.5)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Sheet({ theme, children }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: theme.bg, animation: 'sheet-in .25s cubic-bezier(.3,.7,.4,1)',
    }}>
      <style>{`@keyframes sheet-in { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
      {children}
    </div>
  );
}

function Tweaks({ theme, t, setTweak }) {
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Theme" />
      <TweakColor label="Accent"
        value={t.accent === 'amber' ? '#ff9f43'
          : t.accent === 'violet' ? '#8b7cff'
          : t.accent === 'green' ? '#3ecf8e'
          : t.accent === 'blue' ? '#5fa8ff'
          : '#ff6b8a'}
        options={['#ff9f43', '#8b7cff', '#3ecf8e', '#5fa8ff', '#ff6b8a']}
        onChange={(hex) => {
          const map = { '#ff9f43': 'amber', '#8b7cff': 'violet', '#3ecf8e': 'green', '#5fa8ff': 'blue', '#ff6b8a': 'rose' };
          setTweak('accent', map[hex] || 'amber');
        }} />
      <TweakToggle label="AMOLED pure-black" value={t.amoled} onChange={(v) => setTweak('amoled', v)} />
      <TweakSection label="Layout" />
      <TweakRadio  label="Density" value={t.density}
        options={['compact', 'regular', 'spacious']}
        onChange={(v) => setTweak('density', v)} />
      <TweakToggle label="Card-style posts" value={t.cards} onChange={(v) => setTweak('cards', v)} />
      <TweakToggle label="Show thumbnails" value={t.thumbs} onChange={(v) => setTweak('thumbs', v)} />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
