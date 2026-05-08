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
      position: 'absolute', left: 12, right: 12, bottom: 16, zIndex: 50,
      borderRadius: 999, height: 60,
      background: theme.amoled ? 'rgba(20,20,22,0.92)' : 'rgba(28,30,36,0.88)',
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

function LoadingScreen({ theme }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', background: theme.bg, gap: 16,
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 16,
        background: `linear-gradient(135deg, ${theme.accent.hex}, ${theme.accent.hex}80)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 8px 28px ${theme.accent.hex}44`,
      }}>
        <Icon.flame size={28} color={theme.amoled ? '#000' : '#0a0a0c'} stroke={2.2} />
      </div>
      <div style={{
        width: 32, height: 32, borderRadius: 999,
        border: `2.5px solid ${theme.surface2}`,
        borderTopColor: theme.accent.hex,
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const theme = buildTheme(t);

  const [loading, setLoading] = React.useState(true);
  const [authed, setAuthed] = React.useState(false);
  const [tab, setTab] = React.useState('home');
  const [stack, setStack] = React.useState([]);
  const [overlay, setOverlay] = React.useState(null);
  const [posts, setPosts] = React.useState([]);
  const [notifications, setNotifications] = React.useState({ replies: [], mentions: [], messages: [] });

  // ── Initial auth check ──────────────────────────────────────────────────
  React.useEffect(() => {
    API.me()
      .then(data => {
        if (data.authenticated) {
          if (data.user) {
            window.ME = {
              id: 'me',
              name: data.user.name,
              instance: data.user.instance,
              avatar: avatar('me_' + data.user.name, { letter: (data.user.name || 'Y')[0].toUpperCase() }),
            };
          }
          return loadInitialData();
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, []);

  async function loadInitialData() {
    try {
      const [postsData, communitiesData] = await Promise.all([
        API.getPosts('All', 'Hot', 1),
        API.getCommunities('All'),
      ]);

      const enrichedPosts = enrichPosts(postsData.posts || []);
      window.COMMUNITIES = enrichCommunities(communitiesData.communities || []);
      setPosts(enrichedPosts);

      if (window.ME) {
        Promise.all([API.getReplies(), API.getMentions(), API.getMessages()])
          .then(([r, m, msg]) => {
            const notifs = {
              replies: r.replies || [],
              mentions: m.mentions || [],
              messages: msg.messages || [],
            };
            window.NOTIFICATIONS = notifs;
            setNotifications(notifs);
          })
          .catch(() => {});
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setAuthed(true);
      setLoading(false);
    }
  }

  // ── Post mutations ──────────────────────────────────────────────────────
  const onVote = (id, v) => {
    const score = v === 'up' ? 1 : v === 'down' ? -1 : 0;
    setPosts(prev => prev.map(p => p.id === id ? { ...p, votes: v } : p));
    if (window.ME) API.votePost(id, score).catch(console.error);
  };

  const onSave = (id) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== id) return p;
      const newSaved = !p.saved;
      if (window.ME) API.savePost(id, newSaved).catch(console.error);
      return { ...p, saved: newSaved };
    }));
  };

  // ── Navigation ──────────────────────────────────────────────────────────
  const top = stack[stack.length - 1];
  const push = (item) => setStack(prev => [...prev, item]);
  const pop = () => setStack(prev => prev.slice(0, -1));

  function openPost(post) {
    const item = { kind: 'post', payload: post, comments: [] };
    push(item);
    API.getComments(post.id)
      .then(data => {
        setStack(prev => prev.map(s =>
          s.kind === 'post' && s.payload.id === post.id
            ? { ...s, comments: enrichComments(data.comments || []) }
            : s
        ));
      })
      .catch(console.error);
  }

  function openCommunity(c) { push({ kind: 'community', payload: c }); }

  function selectTab(id) {
    setStack([]);
    setOverlay(null);
    setTab(id);
  }

  const unread =
    (notifications.replies || []).filter(n => n.unread).length +
    (notifications.mentions || []).filter(n => n.unread).length +
    (notifications.messages || []).filter(n => n.unread).length;

  const loggedIn = !!window.ME;

  // ── Screens ─────────────────────────────────────────────────────────────
  let screen;
  if (top) {
    if (top.kind === 'post') {
      const fresh = posts.find(p => p.id === top.payload.id) || top.payload;
      screen = <PostDetailScreen theme={theme} post={fresh} comments={top.comments || []}
        onBack={pop} onVote={onVote} onSave={onSave} onOpenCommunity={openCommunity} />;
    } else if (top.kind === 'community') {
      screen = <CommunityScreen theme={theme} community={top.payload} posts={posts}
        onBack={pop} onOpenPost={openPost} onVote={onVote} onSave={onSave}
        loggedIn={loggedIn}
        onOpenCompose={() => setOverlay('compose')} />;
    }
  } else if (tab === 'home') {
    screen = <HomeScreen theme={theme} posts={posts}
      onOpenPost={openPost} onVote={onVote} onSave={onSave}
      onOpenCommunity={openCommunity}
      onOpenSearch={() => setOverlay('search')} />;
  } else if (tab === 'search') {
    screen = <SearchScreen theme={theme} posts={posts}
      onOpenPost={openPost} onOpenCommunity={openCommunity}
      onBack={() => selectTab('home')} />;
  } else if (tab === 'inbox') {
    screen = <InboxScreen theme={theme} notifications={notifications}
      onNotificationsChange={setNotifications} onOpenPost={openPost} />;
  } else if (tab === 'profile') {
    screen = <ProfileScreen theme={theme} posts={posts}
      onOpenPost={openPost}
      onOpenSettings={() => setOverlay('settings')}
      onVote={onVote} onSave={onSave} />;
  }

  const showTabBar = !top && overlay !== 'compose' && overlay !== 'settings' && overlay !== 'search';

  // ── Auth gate ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Frame theme={theme}>
        <LoadingScreen theme={theme} />
        <Tweaks theme={theme} t={t} setTweak={setTweak} />
      </Frame>
    );
  }

  if (!authed) {
    return (
      <Frame theme={theme}>
        <LoginScreen theme={theme} onComplete={(userData) => {
          if (userData) {
            window.ME = {
              id: 'me',
              name: userData.name,
              instance: userData.instance,
              avatar: avatar('me_' + userData.name, { letter: (userData.name || 'Y')[0].toUpperCase() }),
            };
          }
          setLoading(true);
          loadInitialData();
        }} />
        <Tweaks theme={theme} t={t} setTweak={setTweak} />
      </Frame>
    );
  }

  return (
    <Frame theme={theme}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {screen}
        </div>
      </div>

      {showTabBar && <TabBar theme={theme} current={tab} onTab={selectTab} unread={unread} />}

      {overlay === 'compose' && (
        <Sheet theme={theme}>
          <ComposeScreen theme={theme}
            onClose={() => setOverlay(null)}
            onSubmit={async (data) => {
              const newPost = {
                id: Date.now(), community: data.community.id, author: 'me', age: 'now',
                title: data.title, body: data.body, kind: data.kind, url: data.url,
                thumb: data.kind === 'image' ? thumb('photo') : data.kind === 'link' ? thumb('news') : null,
                score: 1, votes: 'up', comments: 0, saved: false, tag: data.tag || null,
              };
              newPost.communityRef = {
                ...data.community,
                avatar: data.community.avatar || avatar(data.community.name || 'c', { letter: (data.community.name || 'c')[0] }),
              };
              newPost.authorRef = window.ME || { id: 'me', name: 'you', instance: 'lemmy.world', avatar: avatar('me') };
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

function Frame({ theme, children }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      position: 'relative',
      background: theme.bg,
      overflow: 'hidden',
      fontFamily: '-apple-system, system-ui, sans-serif',
      WebkitFontSmoothing: 'antialiased',
    }}>
      {children}
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
