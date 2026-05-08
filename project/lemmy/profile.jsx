// profile.jsx — user profile (own profile, fetched from API)

function ProfileScreen({ theme, onOpenPost, onOpenSettings, onVote, onSave }) {
  const [tab, setTab] = React.useState('posts');
  const [profileData, setProfileData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    API._req('/profile')
      .then(data => setProfileData(data))
      .catch(() => setProfileData(null))
      .finally(() => setLoading(false));
  }, []);

  const me = window.ME || { id: 'me', name: 'Anonymous', instance: 'lemmy.world', avatar: avatar('me_user', { letter: 'A' }) };
  const userInfo = profileData?.user;
  const apiPosts = enrichPosts(profileData?.posts || []);
  const apiComments = profileData?.comments || [];

  const displayName = userInfo?.name || me.name;
  const displayInstance = userInfo?.instance || me.instance;
  const bio = userInfo?.bio || '';
  const postCount = userInfo?.post_count ?? '—';
  const commentCount = userInfo?.comment_count ?? '—';
  const score = userInfo?.score != null ? (userInfo.score >= 1000 ? `${(userInfo.score / 1000).toFixed(1)}k` : String(userInfo.score)) : '—';

  const userAvatar = avatar('me_' + displayName, { letter: (displayName || 'A')[0].toUpperCase() });

  const [postVotes, setPostVotes] = React.useState({});
  const [postSaves, setPostSaves] = React.useState({});

  const handleVote = (id, v) => {
    setPostVotes(prev => ({ ...prev, [id]: v }));
    onVote(id, v);
  };
  const handleSave = (id, post) => {
    const newSaved = !((postSaves[id] ?? post.saved));
    setPostSaves(prev => ({ ...prev, [id]: newSaved }));
    onSave(id, newSaved);
  };

  const list = tab === 'posts' ? apiPosts : [];

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
          background: userAvatar.bg, color: userAvatar.fg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, fontWeight: 800, letterSpacing: -1,
          border: `4px solid ${theme.bg}`,
        }}>{userAvatar.letter}</div>

        {loading ? (
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: 24, height: 24, borderRadius: 999,
              border: `2px solid ${theme.surface2}`, borderTopColor: theme.accent.hex,
              animation: 'spin 0.8s linear infinite',
            }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : !window.ME ? (
          <div style={{ marginTop: 20, padding: '20px 0', textAlign: 'center', color: theme.textDim, fontSize: 13.5 }}>
            Sign in to view your profile.
          </div>
        ) : (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: theme.text, letterSpacing: -0.5 }}>
              {displayName}
            </div>
            <div style={{ fontSize: 12.5, color: theme.textDim, marginTop: 1 }}>
              @{displayInstance}
            </div>
            {bio ? (
              <div style={{ marginTop: 10, fontSize: 14, color: theme.text, lineHeight: 1.45, textWrap: 'pretty' }}>
                {bio}
              </div>
            ) : null}

            {/* stats */}
            <div style={{ marginTop: 14, display: 'flex', gap: 18 }}>
              {[
                { l: 'Posts',    v: postCount },
                { l: 'Comments', v: commentCount },
                { l: 'Score',    v: score },
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
        )}
      </div>

      {!loading && window.ME && (
        <>
          {/* tabs */}
          <div style={{
            position: 'sticky', top: 0, zIndex: 4, background: theme.bg,
            display: 'flex', padding: '0 12px',
            borderBottom: `0.5px solid ${theme.divider}`,
          }}>
            {[
              { id: 'posts',    l: 'Posts',    icon: Icon.text },
              { id: 'comments', l: 'Comments', icon: Icon.comment },
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
              {apiComments.length === 0 && (
                <div style={{ padding: 60, textAlign: 'center', color: theme.textDim, fontSize: 13.5 }}>
                  No comments yet.
                </div>
              )}
              {apiComments.map((c, i) => (
                <div key={c.id || i} style={{ padding: 14, borderBottom: `0.5px solid ${theme.divider}` }}>
                  <div style={{ fontSize: 11.5, color: theme.textDim, marginBottom: 6 }}>
                    <span style={{ color: theme.accent.hex, fontWeight: 700 }}>c/{c.community}</span>
                    <span> · {c.age}</span>
                  </div>
                  <div style={{ fontSize: 13.5, color: theme.text, lineHeight: 1.45, textWrap: 'pretty' }}>
                    {c.body}
                  </div>
                  <div style={{
                    marginTop: 6, fontSize: 11.5, color: theme.textFaint,
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <Icon.arrowUp size={11} color={theme.upvote} />
                    <span style={{ color: theme.text, fontWeight: 600 }}>{c.score}</span>
                    <Dot />
                    <span style={{ color: theme.textDim }}>on "{c.post_title}"</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ paddingTop: theme.cards ? 10 : 0 }}>
              {apiPosts.length === 0 && (
                <div style={{ padding: 60, textAlign: 'center', color: theme.textDim, fontSize: 13.5 }}>
                  No posts yet.
                </div>
              )}
              {apiPosts.map(p => (
                <PostCard key={p.id}
                  post={{ ...p, votes: postVotes[p.id] ?? p.votes, saved: postSaves[p.id] ?? p.saved }}
                  theme={theme}
                  onOpen={() => onOpenPost(p)}
                  onVote={(v) => handleVote(p.id, v)}
                  onSave={() => handleSave(p.id, p)} />
              ))}
            </div>
          )}
        </>
      )}

      <div style={{ height: 100 }} />
    </div>
  );
}

window.ProfileScreen = ProfileScreen;
