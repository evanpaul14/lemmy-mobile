// search.jsx — search backed by the real Lemmy API

function SearchScreen({ theme, onOpenPost, onOpenCommunity, onOpenUser, onBack }) {
  const [q, setQ] = React.useState('');
  const [tab, setTab] = React.useState('all');
  const [apiResults, setApiResults] = React.useState(null);
  const [searching, setSearching] = React.useState(false);
  const inputRef = React.useRef(null);
  const debounceRef = React.useRef(null);

  React.useEffect(() => {
    inputRef.current && inputRef.current.focus();
  }, []);

  React.useEffect(() => {
    const ql = q.trim();
    if (!ql) { setApiResults(null); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearching(true);
      API.search(ql)
        .then(data => {
          setApiResults({
            communities: enrichCommunities(data.communities || []),
            posts: enrichPosts(data.posts || []),
            users: data.users || [],
          });
        })
        .catch(() => setApiResults({ communities: [], posts: [], users: [] }))
        .finally(() => setSearching(false));
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [q]);

  const ql = q.trim().toLowerCase();
  const fc = apiResults ? apiResults.communities : [];
  const fp = apiResults ? apiResults.posts : [];
  const fu = apiResults ? apiResults.users : [];

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: theme.bg }}>
      <div style={{
        position: 'sticky', top: 0, zIndex: 5, background: theme.bg,
        padding: '8px 12px 6px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 8,
            height: 40, borderRadius: 999, padding: '0 14px',
            background: theme.surface, border: `0.5px solid ${theme.hairline}`,
          }}>
            <Icon.search size={17} color={theme.textDim} />
            <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search Lemmy"
              style={{
                flex: 1, border: 'none', background: 'transparent', outline: 'none',
                color: theme.text, fontSize: 15, fontFamily: 'inherit',
                letterSpacing: -0.1,
              }} />
            {searching && (
              <div style={{ width: 16, height: 16, borderRadius: 999, border: `2px solid ${theme.surface2}`, borderTopColor: theme.accent.hex, animation: 'spin 0.7s linear infinite' }} />
            )}
            {q && !searching && (
              <button onClick={() => setQ('')} style={btnReset({ color: theme.textDim, padding: 2 })}>
                <Icon.close size={16} />
              </button>
            )}
          </div>
          <button onClick={onBack} style={btnReset({
            color: theme.text, fontSize: 14, fontWeight: 600, padding: '0 4px',
          })}>Cancel</button>
        </div>

        {ql && (
          <div style={{ display: 'flex', gap: 0, marginTop: 8, paddingLeft: 4 }}>
            {[
              { id: 'all',         l: 'All' },
              { id: 'communities', l: `Communities (${fc.length})` },
              { id: 'posts',       l: `Posts (${fp.length})` },
              { id: 'users',       l: `Users (${fu.length})` },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={btnReset({
                padding: '8px 12px', fontSize: 12.5, fontWeight: 700,
                color: tab === t.id ? theme.accent.hex : theme.textDim,
                borderBottom: tab === t.id ? `2px solid ${theme.accent.hex}` : '2px solid transparent',
              })}>{t.l}</button>
            ))}
          </div>
        )}
      </div>

      {!ql && (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: theme.textDim, fontSize: 14 }}>
          <Icon.search size={32} color={theme.textFaint} />
          <div style={{ marginTop: 12, fontSize: 15, fontWeight: 600, color: theme.textDim }}>Search Lemmy</div>
          <div style={{ marginTop: 6, fontSize: 13, color: theme.textFaint }}>Find communities, posts, and users</div>
        </div>
      )}

      {ql && (
        <div style={{ padding: '4px 0 80px' }}>
          {searching && fc.length === 0 && fp.length === 0 && fu.length === 0 && (
            <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: 22, height: 22, borderRadius: 999, border: `2px solid ${theme.surface2}`, borderTopColor: theme.accent.hex, animation: 'spin 0.8s linear infinite' }} />
            </div>
          )}

          {(tab === 'all' || tab === 'communities') && fc.length > 0 && (
            <Section theme={theme} title="Communities" inset>
              {fc.map(c => <CommunityRow key={c.id} c={c} theme={theme} onOpen={() => onOpenCommunity(c)} />)}
            </Section>
          )}
          {(tab === 'all' || tab === 'users') && fu.length > 0 && (
            <Section theme={theme} title="Users" inset>
              {fu.map(u => (
                <button key={u.id || u.name} onClick={() => onOpenUser && onOpenUser(u.name, u.instance)} style={btnReset({
                  width: '100%', padding: '10px 16px', gap: 12, justifyContent: 'flex-start',
                  borderBottom: `0.5px solid ${theme.divider}`,
                })}>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>{u.name}</div>
                    <div style={{ fontSize: 11.5, color: theme.textDim }}>@{u.instance}</div>
                  </div>
                  <Icon.back size={14} color={theme.textFaint} style={{ transform: 'scaleX(-1)' }} />
                </button>
              ))}
            </Section>
          )}
          {(tab === 'all' || tab === 'posts') && fp.length > 0 && (
            <Section theme={theme} title="Posts" inset>
              {fp.map(p => (
                <PostCard key={p.id} post={p} theme={theme}
                  onOpen={() => onOpenPost(p)}
                  onVote={() => {}} onSave={() => {}}
                  onOpenCommunity={onOpenCommunity} />
              ))}
            </Section>
          )}
          {!searching && fc.length === 0 && fp.length === 0 && fu.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: theme.textDim, fontSize: 13.5 }}>
              No results for "{q}".
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ theme, title, children, inset }) {
  return (
    <div style={{ marginTop: 18 }}>
      <div style={{
        padding: inset ? '0 16px 6px' : '0 0 6px',
        fontSize: 11, fontWeight: 700, color: theme.textDim,
        textTransform: 'uppercase', letterSpacing: 0.6,
      }}>{title}</div>
      {children}
    </div>
  );
}

function CommunityRow({ c, theme, onOpen }) {
  return (
    <button onClick={onOpen} style={btnReset({
      width: '100%', padding: '10px 16px', gap: 12, justifyContent: 'flex-start',
      borderBottom: `0.5px solid ${theme.divider}`,
    })}>
      <div style={{ flex: 1, textAlign: 'left' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>c/{c.name}</div>
        <div style={{ fontSize: 11.5, color: theme.textDim, marginTop: 1 }}>
          @{c.instance} · {c.members} members
        </div>
      </div>
      <Icon.back size={14} color={theme.textFaint} style={{ transform: 'scaleX(-1)' }} />
    </button>
  );
}

window.SearchScreen = SearchScreen;
