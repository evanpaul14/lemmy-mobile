// search.jsx — search with live filtering across communities, posts, users

function SearchScreen({ theme, posts, onOpenPost, onOpenCommunity, onBack }) {
  const [q, setQ] = React.useState('');
  const [tab, setTab] = React.useState('all');
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    inputRef.current && inputRef.current.focus();
  }, []);

  const ql = q.trim().toLowerCase();
  const fc = ql ? COMMUNITIES.filter(c =>
    c.name.toLowerCase().includes(ql) || c.desc.toLowerCase().includes(ql)) : [];
  const fp = ql ? posts.filter(p =>
    p.title.toLowerCase().includes(ql) || (p.body || '').toLowerCase().includes(ql)) : [];
  const fu = ql ? USERS.filter(u => u.name.toLowerCase().includes(ql)) : [];

  const recent = ['rust', 'mech keyboards', 'cozy games', 'self-host backup'];

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
            {q && (
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
              { id: 'all',  l: 'All' },
              { id: 'communities', l: `Communities (${fc.length})` },
              { id: 'posts', l: `Posts (${fp.length})` },
              { id: 'users', l: `Users (${fu.length})` },
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
        <div style={{ padding: '4px 16px 20px' }}>
          {/* recent */}
          <Section theme={theme} title="Recent">
            {recent.map(r => (
              <button key={r} onClick={() => setQ(r)} style={btnReset({
                width: '100%', padding: '10px 0', justifyContent: 'flex-start', gap: 12,
                color: theme.text, fontSize: 14,
                borderBottom: `0.5px solid ${theme.divider}`,
              })}>
                <Icon.clock size={16} color={theme.textDim} />
                <span style={{ flex: 1, textAlign: 'left' }}>{r}</span>
                <Icon.back size={14} color={theme.textFaint} style={{ transform: 'scaleX(-1) rotate(45deg)' }} />
              </button>
            ))}
          </Section>

          {/* trending */}
          <Section theme={theme} title="Trending">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {TRENDING_TAGS.map(t => (
                <button key={t} onClick={() => setQ(t.replace('-', ' '))} style={btnReset({
                  padding: '8px 12px', borderRadius: 999,
                  background: theme.surface, color: theme.text,
                  border: `0.5px solid ${theme.hairline}`,
                  fontSize: 12.5, fontWeight: 600, gap: 4,
                })}>
                  <Icon.hash size={12} color={theme.accent.hex} stroke={2.4} /> {t}
                </button>
              ))}
            </div>
          </Section>

          {/* explore communities */}
          <Section theme={theme} title="Explore communities">
            {COMMUNITIES.slice(0, 4).map(c => (
              <CommunityRow key={c.id} c={c} theme={theme} onOpen={() => onOpenCommunity(c)} />
            ))}
          </Section>
        </div>
      )}

      {ql && (
        <div style={{ padding: '4px 0 80px' }}>
          {(tab === 'all' || tab === 'communities') && fc.length > 0 && (
            <Section theme={theme} title="Communities" inset>
              {fc.map(c => <CommunityRow key={c.id} c={c} theme={theme} onOpen={() => onOpenCommunity(c)} />)}
            </Section>
          )}
          {(tab === 'all' || tab === 'users') && fu.length > 0 && (
            <Section theme={theme} title="Users" inset>
              {fu.map(u => (
                <div key={u.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 16px', borderBottom: `0.5px solid ${theme.divider}`,
                }}>
                  <Avatar a={u.avatar} size={40} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>{u.name}</div>
                    <div style={{ fontSize: 11.5, color: theme.textDim }}>@{u.instance}</div>
                  </div>
                  <button style={btnReset({
                    padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                    background: `${theme.accent.hex}22`, color: theme.accent.hex,
                  })}>Follow</button>
                </div>
              ))}
            </Section>
          )}
          {(tab === 'all' || tab === 'posts') && fp.length > 0 && (
            <Section theme={theme} title="Posts" inset>
              {fp.map(p => (
                <PostCard key={p.id} post={p} theme={theme}
                  onOpen={() => onOpenPost(p)} onVote={() => {}} onSave={() => {}} />
              ))}
            </Section>
          )}
          {fc.length === 0 && fp.length === 0 && fu.length === 0 && (
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
      <Avatar a={c.avatar} size={40} />
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
