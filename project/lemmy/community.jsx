// community.jsx — community detail page

function CommunityScreen({ theme, community, posts, onBack, onOpenPost, onVote, onSave }) {
  const [tab, setTab] = React.useState('posts');
  const [joined, setJoined] = React.useState(true);

  const banner = community.cover || 'abstract';
  const bannerSrc = thumb(banner);

  const cPosts = posts.filter(p => p.community === community.id);

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: theme.bg }}>
      {/* banner */}
      <div style={{
        height: 130, position: 'relative',
        backgroundImage: `url("${bannerSrc}")`,
        backgroundSize: 'cover', backgroundPosition: 'center',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(180deg, rgba(0,0,0,0.2) 0%, ${theme.bg} 100%)`,
        }} />
        <div style={{ position: 'absolute', top: 8, left: 8, right: 8, display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <button onClick={onBack} style={btnReset({
            color: '#fff', padding: 8, borderRadius: 999,
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
          })}>
            <Icon.back size={20} />
          </button>
          <div style={{ display: 'flex', gap: 6 }}>
            <button style={btnReset({
              color: '#fff', padding: 8, borderRadius: 999,
              background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
            })}>
              <Icon.share size={20} />
            </button>
            <button style={btnReset({
              color: '#fff', padding: 8, borderRadius: 999,
              background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
            })}>
              <Icon.more size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* header */}
      <div style={{ padding: '0 16px 12px', marginTop: -28, position: 'relative' }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: community.avatar.bg,
          color: community.avatar.fg, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 30, fontWeight: 800,
          border: `3px solid ${theme.bg}`,
        }}>{community.avatar.letter}</div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginTop: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: theme.text, letterSpacing: -0.5 }}>
              c/{community.name}
            </div>
            <div style={{ fontSize: 12.5, color: theme.textDim, marginTop: 2 }}>
              @{community.instance} · {community.members} members
            </div>
          </div>
          <button onClick={() => setJoined(j => !j)} style={btnReset({
            padding: '8px 14px', borderRadius: 999,
            background: joined ? 'transparent' : theme.accent.hex,
            color: joined ? theme.text : (theme.amoled ? '#000' : '#0a0a0c'),
            border: joined ? `1px solid ${theme.hairline}` : 'none',
            fontSize: 13, fontWeight: 700,
          })}>
            {joined ? 'Joined' : '+ Join'}
          </button>
        </div>

        <div style={{
          marginTop: 12, fontSize: 13.5, color: theme.textDim,
          lineHeight: 1.45, textWrap: 'pretty',
        }}>{community.desc}</div>

        {/* stats row */}
        <div style={{
          marginTop: 14, display: 'flex', gap: 8,
        }}>
          {[
            { l: 'Members',  v: community.members },
            { l: 'Online',   v: '2.1k' },
            { l: 'Posts/day', v: '46' },
          ].map(s => (
            <div key={s.l} style={{
              flex: 1, padding: '8px 10px', borderRadius: 12,
              background: theme.surface, border: `0.5px solid ${theme.hairline}`,
            }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: theme.text, letterSpacing: -0.3 }}>{s.v}</div>
              <div style={{ fontSize: 10.5, color: theme.textDim, marginTop: 1, textTransform: 'uppercase', letterSpacing: 0.4, fontWeight: 600 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* tabs */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 4, background: theme.bg,
        display: 'flex', gap: 0, padding: '0 12px',
        borderBottom: `0.5px solid ${theme.divider}`,
      }}>
        {[
          { id: 'posts',   l: 'Posts' },
          { id: 'about',   l: 'About' },
          { id: 'modlog',  l: 'Moderators' },
        ].map(t => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={btnReset({
              padding: '12px 14px', fontSize: 13, fontWeight: 700,
              color: active ? theme.text : theme.textDim,
              borderBottom: active ? `2px solid ${theme.accent.hex}` : '2px solid transparent',
              marginBottom: -0.5,
            })}>{t.l}</button>
          );
        })}
      </div>

      {tab === 'posts' && (
        <div style={{ paddingTop: theme.cards ? 10 : 0 }}>
          {cPosts.map(p => (
            <PostCard key={p.id} post={p} theme={theme}
              onOpen={() => onOpenPost(p)}
              onVote={(v) => onVote(p.id, v)}
              onSave={() => onSave(p.id)} />
          ))}
          {cPosts.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: theme.textDim, fontSize: 13 }}>
              No posts yet. Be the first.
            </div>
          )}
        </div>
      )}

      {tab === 'about' && (
        <div style={{ padding: 16 }}>
          <div style={{
            padding: 14, borderRadius: 14, background: theme.surface,
            border: `0.5px solid ${theme.hairline}`,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: theme.textDim, letterSpacing: 0.6, textTransform: 'uppercase' }}>Rules</div>
            {[
              'Be civil. Disagreements happen; personal attacks do not.',
              'No spam, low-effort posts, or reposts within 30 days.',
              'Cite your sources for technical claims.',
              'English-language posts, please.',
            ].map((r, i) => (
              <div key={i} style={{
                marginTop: 10, display: 'flex', gap: 10,
                fontSize: 13.5, color: theme.text, lineHeight: 1.4,
              }}>
                <span style={{ color: theme.accent.hex, fontWeight: 700, minWidth: 16 }}>{i + 1}.</span>
                <span style={{ flex: 1, textWrap: 'pretty' }}>{r}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'modlog' && (
        <div style={{ padding: 16 }}>
          {USERS.slice(0, 4).map(u => (
            <div key={u.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 0', borderBottom: `0.5px solid ${theme.divider}`,
            }}>
              <Avatar a={u.avatar} size={40} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>{u.name}</div>
                <div style={{ fontSize: 11.5, color: theme.textDim }}>@{u.instance} · moderator</div>
              </div>
              <button style={btnReset({
                padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                background: theme.surface, color: theme.text, border: `0.5px solid ${theme.hairline}`,
              })}>Message</button>
            </div>
          ))}
        </div>
      )}

      <div style={{ height: 100 }} />
    </div>
  );
}

window.CommunityScreen = CommunityScreen;
