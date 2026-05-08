// profile.jsx — user profile (own profile)

function ProfileScreen({ theme, posts, onOpenPost, onOpenSettings, onVote, onSave }) {
  const [tab, setTab] = React.useState('posts');
  const me = ME || { id: 'me', name: 'you', instance: 'lemmy.world', avatar: avatar('me_user', { letter: 'Y' }) };

  const myPosts = posts.filter(p => p.author === 'me' || p.id === 3); // demo: post #3 is "mine"
  const savedPosts = posts.filter(p => p.saved);
  const upvoted = posts.filter(p => p.votes === 'up');

  const list = tab === 'posts' ? myPosts
    : tab === 'saved' ? savedPosts
    : tab === 'upvoted' ? upvoted
    : [];

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: theme.bg }}>
      {/* gradient banner */}
      <div style={{
        height: 110,
        background: `linear-gradient(135deg, ${theme.accent.hex}66, ${theme.accent.hex}11 60%, transparent)`,
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `radial-gradient(circle at 20% 50%, ${theme.accent.hex}33, transparent 60%)`,
        }} />
        <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 6 }}>
          <button onClick={onOpenSettings} style={btnReset({
            color: '#fff', padding: 8, borderRadius: 999,
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
          })}>
            <Icon.cog size={20} />
          </button>
          <button style={btnReset({
            color: '#fff', padding: 8, borderRadius: 999,
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
          })}>
            <Icon.share size={20} />
          </button>
        </div>
      </div>

      {/* avatar + identity */}
      <div style={{ padding: '0 16px 12px', marginTop: -36 }}>
        <div style={{
          width: 80, height: 80, borderRadius: 999,
          background: me.avatar.bg, color: me.avatar.fg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, fontWeight: 800, letterSpacing: -1,
          border: `4px solid ${theme.bg}`,
        }}>{me.avatar.letter}</div>

        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: theme.text, letterSpacing: -0.5 }}>
            {me.name}
          </div>
          <div style={{ fontSize: 12.5, color: theme.textDim, marginTop: 1 }}>
            @{me.instance} · joined Mar 2024
          </div>
          <div style={{
            marginTop: 10, fontSize: 14, color: theme.text, lineHeight: 1.45,
            textWrap: 'pretty',
          }}>
            Self-hoster, weekend photographer, occasional Zig poster. Federated and proud.
          </div>
        </div>

        {/* stats */}
        <div style={{ marginTop: 14, display: 'flex', gap: 18 }}>
          {[
            { l: 'Posts', v: '47' },
            { l: 'Comments', v: '1.4k' },
            { l: 'Score', v: '12.8k' },
          ].map(s => (
            <div key={s.l}>
              <div style={{ fontSize: 17, fontWeight: 800, color: theme.text, letterSpacing: -0.3 }}>{s.v}</div>
              <div style={{ fontSize: 11.5, color: theme.textDim, marginTop: 1 }}>{s.l}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
          <button style={btnReset({
            flex: 1, padding: '10px', borderRadius: 999, fontSize: 13, fontWeight: 700,
            background: theme.surface, color: theme.text, border: `0.5px solid ${theme.hairline}`,
            gap: 6,
          })}>
            <Icon.pencil size={14} /> Edit profile
          </button>
          <button style={btnReset({
            padding: '10px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700,
            background: theme.surface, color: theme.text, border: `0.5px solid ${theme.hairline}`,
          })}>
            <Icon.share size={16} />
          </button>
        </div>
      </div>

      {/* tabs */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 4, background: theme.bg,
        display: 'flex', padding: '0 12px',
        borderBottom: `0.5px solid ${theme.divider}`,
      }}>
        {[
          { id: 'posts',     l: 'Posts',     icon: Icon.text },
          { id: 'comments',  l: 'Comments',  icon: Icon.comment },
          { id: 'saved',     l: 'Saved',     icon: Icon.bookmark },
          { id: 'upvoted',   l: 'Upvoted',   icon: Icon.arrowUp },
        ].map(t => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={btnReset({
              flex: 1, padding: '12px 6px', gap: 5,
              fontSize: 12, fontWeight: 700,
              color: active ? theme.text : theme.textDim,
              borderBottom: active ? `2px solid ${theme.accent.hex}` : '2px solid transparent',
              marginBottom: -0.5,
            })}>
              <t.icon size={14} color={active ? theme.accent.hex : theme.textDim} stroke={2.2} />
              {t.l}
            </button>
          );
        })}
      </div>

      {tab === 'comments' ? (
        <div>
          {[
            { c: 'selfhosted', body: 'Yeah and the upgrade story is just `docker compose pull && docker compose up -d`. I have a Sunday-morning cron that runs it on quiet services.', score: 88, age: '4h', context: 'After 3 years self-hosting, here is the boring stack…' },
            { c: 'programming', body: 'Hot take but increasingly mainstream: a thin query module beats the magic. 18 months in production, here is what broke and what didn\'t.', score: 410, age: '1d', context: 'Why I stopped using ORMs' },
            { c: 'photography', body: 'Pentax K1 has the best in-body stabilization for a full-frame body in this price tier. Easily 2-3 stops of usable handheld.', score: 47, age: '2d', context: 'Foggy morning over the Coast Range' },
          ].map((c, i) => (
            <div key={i} style={{
              padding: 14, borderBottom: `0.5px solid ${theme.divider}`,
            }}>
              <div style={{
                fontSize: 11.5, color: theme.textDim, marginBottom: 6,
              }}>
                <span style={{ color: theme.accent.hex, fontWeight: 700 }}>c/{c.c}</span>
                <span> · {c.age}</span>
              </div>
              <div style={{
                fontSize: 13.5, color: theme.text, lineHeight: 1.45,
                textWrap: 'pretty',
              }}>{c.body}</div>
              <div style={{
                marginTop: 6, fontSize: 11.5, color: theme.textFaint,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <Icon.arrowUp size={11} color={theme.upvote} />
                <span style={{ color: theme.text, fontWeight: 600 }}>{c.score}</span>
                <Dot />
                <span>on "{c.context}"</span>
              </div>
            </div>
          ))}
        </div>
      ) : list.length > 0 ? (
        <div style={{ paddingTop: theme.cards ? 10 : 0 }}>
          {list.map(p => (
            <PostCard key={p.id} post={p} theme={theme}
              onOpen={() => onOpenPost(p)}
              onVote={(v) => onVote(p.id, v)}
              onSave={() => onSave(p.id)} />
          ))}
        </div>
      ) : (
        <div style={{ padding: 60, textAlign: 'center', color: theme.textDim, fontSize: 13.5 }}>
          Nothing in {tab} yet.
        </div>
      )}

      <div style={{ height: 100 }} />
    </div>
  );
}

window.ProfileScreen = ProfileScreen;
