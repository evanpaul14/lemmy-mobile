// home.jsx — home feed screen
function HomeScreen({ theme, posts, onOpenPost, onVote, onSave, onOpenCommunity, onOpenSearch }) {
  const [sort, setSort] = React.useState('hot');
  const [feed, setFeed] = React.useState('subscribed');
  const [refreshing, setRefreshing] = React.useState(false);
  const [pullDist, setPullDist] = React.useState(0);
  const startY = React.useRef(null);
  const scrollerRef = React.useRef(null);

  function onTouchStart(e) {
    if (scrollerRef.current && scrollerRef.current.scrollTop <= 0) {
      startY.current = e.touches[0].clientY;
    } else { startY.current = null; }
  }
  function onTouchMove(e) {
    if (startY.current == null) return;
    const d = e.touches[0].clientY - startY.current;
    if (d > 0) {
      setPullDist(Math.min(d * 0.45, 80));
    }
  }
  function onTouchEnd() {
    if (pullDist > 50 && !refreshing) {
      setRefreshing(true);
      setTimeout(() => { setRefreshing(false); setPullDist(0); }, 900);
    } else {
      setPullDist(0);
    }
    startY.current = null;
  }

  const sortOpts = [
    { id: 'hot',  label: 'Hot',  icon: Icon.flame },
    { id: 'new',  label: 'New',  icon: Icon.clock },
    { id: 'top',  label: 'Top',  icon: Icon.star },
  ];
  const feedOpts = [
    { id: 'subscribed', label: 'Subscribed' },
    { id: 'local',      label: 'Local' },
    { id: 'all',        label: 'All' },
  ];

  // Filter posts by feed (just demo: 'all' shows everything, others trim)
  const visible = feed === 'subscribed' ? posts
    : feed === 'local' ? posts.filter(p => p.communityRef.instance === 'lemmy.world')
    : posts;

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

        {/* sort row */}
        <div style={{
          padding: '4px 16px 12px', display: 'flex', alignItems: 'center', gap: 14,
          fontSize: 12.5, fontWeight: 600, color: theme.textDim,
          borderBottom: `0.5px solid ${theme.divider}`, marginBottom: theme.cards ? 10 : 0,
        }}>
          {sortOpts.map(s => {
            const active = sort === s.id;
            return (
              <button key={s.id} onClick={() => setSort(s.id)} style={btnReset({
                gap: 5, color: active ? theme.accent.hex : theme.textDim,
                fontSize: 12.5, fontWeight: 700,
                paddingBottom: 8, marginBottom: -8,
                borderBottom: active ? `2px solid ${theme.accent.hex}` : '2px solid transparent',
              })}>
                <s.icon size={13} stroke={2.4} />
                {s.label}
              </button>
            );
          })}
          <span style={{ flex: 1 }} />
          <button style={btnReset({ color: theme.textDim, gap: 5, fontSize: 12.5, fontWeight: 600 })}>
            <Icon.filter size={13} stroke={2.4} /> Filter
          </button>
        </div>

        {visible.map((p, i) => (
          <PostCard key={p.id} post={p} theme={theme}
            last={i === visible.length - 1}
            onOpen={() => onOpenPost(p)}
            onVote={(v) => onVote(p.id, v)}
            onSave={() => onSave(p.id)} />
        ))}

        <div style={{ height: 90 }} />
      </div>
    </div>
  );
}

window.HomeScreen = HomeScreen;
