// post-detail.jsx — full post + threaded comments

function CommentNode({ c, theme, depth = 0 }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [vote, setVote] = React.useState(c.votes);

  // Stripe colors that cycle by depth
  const stripeColors = [
    theme.accent.hex,
    theme.downvote,
    '#3ecf8e',
    '#c084fc',
    '#fb7185',
  ];
  const stripeColor = stripeColors[depth % stripeColors.length];

  const userRef = USERS.find(u => u.id === c.author);

  const adj = vote === 'up' ? 1 : vote === 'down' ? -1 : 0;

  return (
    <div style={{
      paddingLeft: depth === 0 ? 0 : 14,
      borderLeft: depth === 0 ? 'none' : `1.5px solid ${stripeColor}33`,
      marginLeft: depth === 0 ? 0 : 6,
    }}>
      <div style={{
        padding: '10px 0 4px',
        borderBottom: depth === 0 ? `0.5px solid ${theme.divider}` : 'none',
      }}>
        {/* header row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 12, color: theme.textDim,
        }}>
          <Avatar a={userRef.avatar} size={20} />
          <span style={{ color: theme.text, fontWeight: 600 }}>{userRef.name}</span>
          {c.op && <Pill color={theme.accent.hex} bg={`${theme.accent.hex}22`}>OP</Pill>}
          <Dot />
          <span>{c.age}</span>
          <span style={{ flex: 1 }} />
          <button onClick={() => setCollapsed(x => !x)} style={btnReset({
            color: theme.textFaint, fontSize: 12, fontWeight: 700,
            padding: '2px 6px', borderRadius: 6, background: collapsed ? `${theme.accent.hex}22` : 'transparent',
          })}>
            {collapsed ? `[${1 + countReplies(c)}]` : '−'}
          </button>
        </div>

        {!collapsed && (
          <>
            <div style={{
              padding: '6px 0 4px', fontSize: 14.5, color: theme.text,
              lineHeight: 1.45, textWrap: 'pretty', letterSpacing: -0.1,
            }}>{c.body}</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2, marginLeft: -6 }}>
              <VoteCluster score={c.score} vote={vote} theme={theme}
                onVote={(v) => setVote(v)} />
              <button style={btnReset({
                color: theme.textDim, padding: '6px 10px', borderRadius: 8,
                fontSize: 12, fontWeight: 600, gap: 5,
              })}>
                <Icon.reply size={14} /> Reply
              </button>
              <button style={btnReset({
                color: theme.textFaint, padding: '6px 8px', borderRadius: 8,
              })}>
                <Icon.more size={16} />
              </button>
            </div>
          </>
        )}
      </div>

      {!collapsed && c.replies && c.replies.map(r => (
        <CommentNode key={r.id} c={r} theme={theme} depth={depth + 1} />
      ))}
    </div>
  );
}

function countReplies(c) {
  if (!c.replies) return 0;
  return c.replies.length + c.replies.reduce((acc, r) => acc + countReplies(r), 0);
}

function PostDetailScreen({ theme, post, onBack, onVote, onSave, onOpenCommunity }) {
  const [sort, setSort] = React.useState('top');

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: theme.bg }}>
      <ScreenHeader theme={theme} title={`c/${post.communityRef.name}`}
        subtitle={`${post.communityRef.members} members`}
        onBack={onBack}
        right={
          <div style={{ display: 'flex', gap: 4 }}>
            <button style={btnReset({ color: theme.text, padding: 8 })}>
              <Icon.share size={20} />
            </button>
            <button style={btnReset({ color: theme.text, padding: 8 })}>
              <Icon.more size={20} />
            </button>
          </div>
        } />

      {/* post body */}
      <div style={{ padding: '4px 16px 16px', borderBottom: `6px solid ${theme.surface2}` }}>
        {/* title */}
        <div style={{
          fontSize: 22, fontWeight: 700, color: theme.text,
          letterSpacing: -0.5, lineHeight: 1.22, textWrap: 'balance',
        }}>{post.title}</div>

        {/* author row */}
        <div style={{
          marginTop: 12, display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 12.5, color: theme.textDim,
        }}>
          <Avatar a={post.authorRef.avatar} size={28} />
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{ color: theme.text, fontWeight: 600, fontSize: 13 }}>{post.authorRef.name}</span>
            <span style={{ fontSize: 11.5 }}>@{post.authorRef.instance} · {post.age} ago</span>
          </div>
          <span style={{ flex: 1 }} />
          <button style={btnReset({
            padding: '6px 12px', borderRadius: 999,
            background: `${theme.accent.hex}22`, color: theme.accent.hex,
            fontSize: 12.5, fontWeight: 700,
          })}>+ Follow</button>
        </div>

        {/* link card */}
        {post.url && (
          <a style={{
            display: 'block', marginTop: 14, padding: 12, borderRadius: 14,
            background: theme.surface, border: `0.5px solid ${theme.hairline}`,
            color: theme.text, textDecoration: 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {post.thumb && (
                <div style={{
                  width: 56, height: 56, borderRadius: 10, flexShrink: 0,
                  backgroundImage: `url("${post.thumb}")`, backgroundSize: 'cover', backgroundPosition: 'center',
                }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: theme.textFaint, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>
                  External link
                </div>
                <div style={{ fontSize: 13.5, color: theme.text, fontWeight: 600, marginTop: 2 }}>{post.url}</div>
              </div>
              <Icon.link size={16} color={theme.textDim} />
            </div>
          </a>
        )}

        {/* image */}
        {post.kind === 'image' && post.thumb && (
          <div style={{
            marginTop: 14, borderRadius: 14, overflow: 'hidden',
            aspectRatio: '5 / 3', background: theme.surface2,
            backgroundImage: `url("${post.thumb}")`, backgroundSize: 'cover', backgroundPosition: 'center',
          }} />
        )}

        {/* body text */}
        {post.body && (
          <div style={{
            marginTop: 14, fontSize: 15, color: theme.text,
            lineHeight: 1.55, textWrap: 'pretty', letterSpacing: -0.1,
            fontFamily: theme.fontSerif,
          }}>{post.body}</div>
        )}

        {/* action bar */}
        <div style={{
          marginTop: 16, padding: '6px 0', display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <VoteCluster score={post.score} vote={post.votes} theme={theme}
            onVote={(v) => onVote(post.id, v)} />
          <span style={{ flex: 1 }} />
          <ActionBtn theme={theme} icon={<Icon.comment size={16} />} label={String(post.comments)} />
          <ActionBtn theme={theme} icon={<Icon.bookmark size={16} fill={post.saved ? theme.accent.hex : 'none'} color={post.saved ? theme.accent.hex : theme.textDim} />} onClick={() => onSave(post.id)} />
          <ActionBtn theme={theme} icon={<Icon.share size={16} />} />
        </div>
      </div>

      {/* comments header */}
      <div style={{
        padding: '14px 16px 8px', display: 'flex', alignItems: 'center', gap: 14,
        fontSize: 12.5, fontWeight: 700,
      }}>
        <span style={{ color: theme.text, fontSize: 14 }}>{post.comments} comments</span>
        <span style={{ flex: 1 }} />
        {[
          { id: 'top', l: 'Top' },
          { id: 'new', l: 'New' },
          { id: 'old', l: 'Old' },
        ].map(s => (
          <button key={s.id} onClick={() => setSort(s.id)} style={btnReset({
            color: sort === s.id ? theme.accent.hex : theme.textDim,
            fontSize: 12.5, fontWeight: 700,
          })}>{s.l}</button>
        ))}
      </div>

      {/* comment composer */}
      <div style={{ padding: '4px 16px 12px' }}>
        <button style={btnReset({
          width: '100%', height: 40, borderRadius: 999,
          background: theme.surface, color: theme.textDim,
          padding: '0 16px', justifyContent: 'flex-start',
          fontSize: 13.5, border: `0.5px solid ${theme.hairline}`, gap: 8,
        })}>
          <Icon.reply size={15} color={theme.accent.hex} />
          Add a comment
        </button>
      </div>

      <div style={{ padding: '0 16px' }}>
        {COMMENTS.map(c => <CommentNode key={c.id} c={c} theme={theme} />)}
      </div>

      <div style={{ height: 80 }} />
    </div>
  );
}

window.PostDetailScreen = PostDetailScreen;
