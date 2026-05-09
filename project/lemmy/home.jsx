// home.jsx — home feed screen
function HomeScreen({ theme, onOpenPost, onVote, onSave, onOpenCommunity, onOpenSearch }) {
  const [sort, setSort] = React.useState('Hot');
  const [feed, setFeed] = React.useState('all');
  const [feedPosts, setFeedPosts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [pullDist, setPullDist] = React.useState(0);
  const startY = React.useRef(null);
  const scrollerRef = React.useRef(null);

  const FEED_TYPE = { subscribed: 'Subscribed', local: 'Local', all: 'All' };

  function fetchFeed(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    API.getPosts(FEED_TYPE[feed] || 'All', sort, 1)
      .then(data => setFeedPosts(enrichPosts(data.posts || [])))
      .catch(err => setError(err.message || 'Failed to load posts'))
      .finally(() => { setLoading(false); setRefreshing(false); setPullDist(0); });
  }

  React.useEffect(() => { fetchFeed(); }, [feed, sort]);

  function onTouchStart(e) {
    if (scrollerRef.current && scrollerRef.current.scrollTop <= 0) {
      startY.current = e.touches[0].clientY;
    } else { startY.current = null; }
  }
  function onTouchMove(e) {
    if (startY.current == null) return;
    const d = e.touches[0].clientY - startY.current;
    if (d > 0) setPullDist(Math.min(d * 0.45, 80));
  }
  function onTouchEnd() {
    if (pullDist > 50 && !refreshing) {
      fetchFeed(true);
    } else {
      setPullDist(0);
    }
    startY.current = null;
  }

  const handleVote = (id, v) => {
    setFeedPosts(prev => prev.map(p => p.id === id ? { ...p, votes: v } : p));
    onVote(id, v);
  };

  const handleSave = (id) => {
    setFeedPosts(prev => prev.map(p => {
      if (p.id !== id) return p;
      const newSaved = !p.saved;
      onSave(id, newSaved);
      return { ...p, saved: newSaved };
    }));
  };

  const sortOpts = [
    { id: 'Hot',       label: 'Hot',      icon: Icon.flame },
    { id: 'Active',    label: 'Active',   icon: Icon.clock },
    { id: 'New',       label: 'New',      icon: Icon.clock },
    { id: 'TopDay',    label: 'Today',    icon: Icon.star  },
    { id: 'TopWeek',   label: 'Week',     icon: Icon.star  },
    { id: 'TopMonth',  label: 'Month',    icon: Icon.star  },
    { id: 'TopYear',   label: 'Year',     icon: Icon.star  },
    { id: 'TopAll',    label: 'All time', icon: Icon.star  },
    { id: 'MostComments', label: 'Comments', icon: Icon.comment },
  ];
  const feedOpts = [
    { id: 'subscribed', label: 'Subscribed' },
    { id: 'local',      label: 'Local' },
    { id: 'all',        label: 'All' },
  ];

  return (
    <div ref={scrollerRef}
      onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
      style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden', position: 'relative', background: theme.bg }}>

      {/* pull-to-refresh indicator */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: pullDist / 60 + (refreshing ? 1 : 0),
        transform: `translateY(${refreshing ? 60 : pullDist - 30}px)`,
        transition: refreshing ? 'transform .25s' : 'none',
        pointerEvents: 'none', zIndex: 1,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 999,
          border: `2.5px solid ${theme.accent.hex}`,
          borderTopColor: 'transparent',
          animation: refreshing ? 'spin 0.8s linear infinite' : 'none',
          transform: refreshing ? 'none' : `rotate(${pullDist * 6}deg)`,
        }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>

      <div style={{
        transform: `translateY(${refreshing ? 60 : pullDist}px)`,
        transition: refreshing || pullDist === 0 ? 'transform .25s cubic-bezier(.3,.7,.4,1)' : 'none',
      }}>
        {/* large header */}
        <div style={{ padding: '14px 16px 6px', display: 'flex', alignItems: 'flex-end', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, color: theme.accent.hex, textTransform: 'uppercase' }}>
              {feedOpts.find(f => f.id === feed).label}
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, color: theme.text, letterSpacing: -0.8, lineHeight: 1.05 }}>
              Home
            </div>
          </div>
          <button onClick={onOpenSearch} style={btnReset({ color: theme.text, padding: 8 })}>
            <Icon.search size={22} />
          </button>
        </div>

        {/* feed scope segmented */}
        <div style={{ padding: '6px 12px 8px', display: 'flex', gap: 6 }}>
          {feedOpts.map(f => (
            <button key={f.id} onClick={() => setFeed(f.id)} style={btnReset({
              flex: 1, padding: '8px 10px', borderRadius: 10,
              background: feed === f.id ? theme.surface2 : 'transparent',
              color: feed === f.id ? theme.text : theme.textDim,
              fontSize: 13, fontWeight: 600,
              border: feed === f.id ? `0.5px solid ${theme.hairline}` : '0.5px solid transparent',
            })}>{f.label}</button>
          ))}
        </div>

        {/* sort row — horizontally scrollable */}
        <div style={{
          padding: '4px 0 12px',
          borderBottom: `0.5px solid ${theme.divider}`,
          marginBottom: theme.cards ? 10 : 0,
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '0 16px', minWidth: 'max-content' }}>
            {sortOpts.map(s => {
              const active = sort === s.id;
              return (
                <button key={s.id} onClick={() => setSort(s.id)} style={btnReset({
                  gap: 4, color: active ? theme.accent.hex : theme.textDim,
                  fontSize: 12.5, fontWeight: 700,
                  padding: '6px 10px',
                  paddingBottom: 8, marginBottom: -8,
                  borderBottom: active ? `2px solid ${theme.accent.hex}` : '2px solid transparent',
                  whiteSpace: 'nowrap',
                })}>
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
        <style>{`.sort-row::-webkit-scrollbar{display:none}`}</style>

        {loading && (
          <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: 24, height: 24, borderRadius: 999,
              border: `2px solid ${theme.surface2}`, borderTopColor: theme.accent.hex,
              animation: 'spin 0.8s linear infinite',
            }} />
          </div>
        )}

        {!loading && error && (
          <div style={{ padding: '32px 20px', textAlign: 'center' }}>
            <div style={{ color: theme.textDim, fontSize: 13, marginBottom: 12 }}>{error}</div>
            <button onClick={() => fetchFeed()} style={btnReset({
              padding: '8px 18px', borderRadius: 999, fontSize: 13, fontWeight: 600,
              background: theme.surface2, color: theme.text, border: `0.5px solid ${theme.hairline}`,
            })}>Try again</button>
          </div>
        )}

        {!loading && !error && feedPosts.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: theme.textDim, fontSize: 13 }}>
            {feed === 'subscribed'
              ? 'Sign in and subscribe to communities to see posts here.'
              : 'No posts found.'}
          </div>
        )}

        {!loading && feedPosts.map((p, i) => (
          <PostCard key={p.id} post={p} theme={theme}
            last={i === feedPosts.length - 1}
            onOpen={() => onOpenPost(p)}
            onVote={(v) => handleVote(p.id, v)}
            onSave={() => handleSave(p.id)}
            onOpenCommunity={onOpenCommunity} />
        ))}

        <div style={{ height: 90 }} />
      </div>
    </div>
  );
}

window.HomeScreen = HomeScreen;
