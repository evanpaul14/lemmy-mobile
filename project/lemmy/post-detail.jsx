// post-detail.jsx — full post + threaded comments

function CommentComposer({ theme, postId, parentId, onCancel, onSubmitted }) {
  const [body, setBody] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const textRef = React.useRef(null);

  React.useEffect(() => { textRef.current && textRef.current.focus(); }, []);

  function insertFormat(before, after, placeholder) {
    const el = textRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = body.slice(start, end) || placeholder;
    const next = body.slice(0, start) + before + selected + after + body.slice(end);
    setBody(next);
    setTimeout(() => {
      el.selectionStart = start + before.length;
      el.selectionEnd = start + before.length + selected.length;
      el.focus();
    }, 0);
  }

  async function submit() {
    if (!body.trim() || submitting) return;
    setSubmitting(true);
    try {
      await API.createComment(postId, body.trim(), parentId || null);
      onSubmitted && onSubmitted(body.trim());
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  const fmtBtns = [
    { label: 'B', title: 'Bold', action: () => insertFormat('**', '**', 'bold text'), style: { fontWeight: 800 } },
    { label: 'I', title: 'Italic', action: () => insertFormat('*', '*', 'italic text'), style: { fontStyle: 'italic' } },
    { label: 'S', title: 'Strike', action: () => insertFormat('~~', '~~', 'text'), style: { textDecoration: 'line-through' } },
    { label: '`', title: 'Code', action: () => insertFormat('`', '`', 'code'), style: { fontFamily: 'monospace' } },
    { label: '""', title: 'Quote', action: () => insertFormat('\n> ', '', 'quoted text'), style: {} },
    { label: '—', title: 'Link', action: () => insertFormat('[', '](url)', 'link text'), style: {} },
  ];

  return (
    <div style={{ background: theme.surface, borderRadius: 14, border: `0.5px solid ${theme.hairline}`, overflow: 'hidden' }}>
      <textarea
        ref={textRef}
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder={parentId ? 'Write a reply…' : 'Add a comment…'}
        style={{
          width: '100%', minHeight: 90, padding: '10px 12px',
          border: 'none', background: 'transparent', outline: 'none', resize: 'none',
          color: theme.text, fontSize: 14.5, lineHeight: 1.5,
          fontFamily: 'inherit', boxSizing: 'border-box',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', padding: '6px 8px', borderTop: `0.5px solid ${theme.divider}`, gap: 2 }}>
        {fmtBtns.map(b => (
          <button key={b.label} title={b.title} onClick={b.action} style={btnReset({
            color: theme.textDim, padding: '5px 8px', borderRadius: 6, fontSize: 13,
            background: 'transparent', ...b.style,
          })}>{b.label}</button>
        ))}
        <span style={{ flex: 1 }} />
        <button onClick={onCancel} style={btnReset({
          color: theme.textDim, padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600,
        })}>Cancel</button>
        <button onClick={submit} disabled={!body.trim() || submitting} style={btnReset({
          padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 700,
          background: body.trim() && !submitting ? theme.accent.hex : theme.surface2,
          color: body.trim() && !submitting ? (theme.amoled ? '#000' : '#0a0a0c') : theme.textFaint,
        })}>
          {submitting ? '…' : 'Send'}
        </button>
      </div>
    </div>
  );
}

function CommentNode({ c, theme, depth = 0, onOpenUser, onOpenCommunity, postId, onReplySubmitted }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [vote, setVote] = React.useState(c.votes);
  const [replying, setReplying] = React.useState(false);

  const stripeColors = [
    theme.accent.hex,
    theme.downvote,
    '#3ecf8e',
    '#c084fc',
    '#fb7185',
  ];
  const stripeColor = stripeColors[depth % stripeColors.length];

  const authorName = c.authorRef?.name || c.author || 'unknown';
  const authorInstance = c.authorRef?.instance || '';

  const adj = vote === 'up' ? 1 : vote === 'down' ? -1 : 0;

  function handleVoteComment(v) {
    setVote(v);
    if (window.ME) API.voteComment(c.id, v === 'up' ? 1 : v === 'down' ? -1 : 0).catch(console.error);
  }

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: theme.textDim }}>
          <button onClick={() => onOpenUser && onOpenUser(authorName, authorInstance)} style={btnReset({
            color: theme.text, fontWeight: 600, fontSize: 12,
          })}>
            {authorName}
          </button>
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
            <div style={{ padding: '6px 0 4px' }}>
              <MarkdownText
                text={c.body}
                theme={theme}
                style={{ fontSize: 14, lineHeight: 1.5 }}
                onOpenCommunity={onOpenCommunity}
                onOpenUser={onOpenUser}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2, marginLeft: -6 }}>
              <VoteCluster score={c.score} vote={vote} theme={theme} onVote={handleVoteComment} />
              <button onClick={() => setReplying(r => !r)} style={btnReset({
                color: theme.textDim, padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, gap: 5,
              })}>
                <Icon.reply size={14} /> Reply
              </button>
            </div>

            {replying && (
              <div style={{ marginTop: 8 }}>
                <CommentComposer
                  theme={theme}
                  postId={postId}
                  parentId={c.id}
                  onCancel={() => setReplying(false)}
                  onSubmitted={(text) => { setReplying(false); onReplySubmitted && onReplySubmitted(); }}
                />
              </div>
            )}
          </>
        )}
      </div>

      {!collapsed && c.replies && c.replies.map(r => (
        <CommentNode key={r.id} c={r} theme={theme} depth={depth + 1}
          onOpenUser={onOpenUser} onOpenCommunity={onOpenCommunity}
          postId={postId} onReplySubmitted={onReplySubmitted} />
      ))}
    </div>
  );
}

function countReplies(c) {
  if (!c.replies) return 0;
  return c.replies.length + c.replies.reduce((acc, r) => acc + countReplies(r), 0);
}

function PostDetailScreen({ theme, post, onBack, onVote, onSave, onOpenCommunity, onOpenUser }) {
  const [sort, setSort] = React.useState('Hot');
  const [comments, setComments] = React.useState([]);
  const [commentsLoading, setCommentsLoading] = React.useState(true);
  const [composing, setComposing] = React.useState(false);
  const [savedState, setSavedState] = React.useState(post.saved);
  const [voteState, setVoteState] = React.useState(post.votes);

  function loadComments(s) {
    setCommentsLoading(true);
    API.getComments(post.id, s)
      .then(data => setComments(enrichComments(data.comments || [])))
      .catch(console.error)
      .finally(() => setCommentsLoading(false));
  }

  React.useEffect(() => { loadComments(sort); }, [post.id, sort]);

  function handleSave() {
    const newSaved = !savedState;
    setSavedState(newSaved);
    onSave(post.id, newSaved);
  }

  function handleVote(v) {
    setVoteState(v);
    onVote(post.id, v);
  }

  function handleShare() {
    if (navigator.share && post.url) {
      navigator.share({ title: post.title, url: post.url }).catch(() => {});
    } else if (post.url) {
      navigator.clipboard?.writeText(post.url);
    }
  }

  const isImagePost = post.kind === 'image';

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: theme.bg }}>
      <ScreenHeader theme={theme}
        title={`c/${post.communityRef.name}`}
        subtitle={`${post.communityRef.members} members`}
        onBack={onBack}
        onTitleClick={() => onOpenCommunity && onOpenCommunity(post.communityRef)}
        right={
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={handleShare} style={btnReset({ color: theme.text, padding: 8 })}>
              <Icon.share size={20} />
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
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: theme.textDim }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <button onClick={() => onOpenUser && onOpenUser(post.authorRef.name, post.authorRef.instance)}
              style={btnReset({ color: theme.text, fontWeight: 600, fontSize: 13 })}>
              {post.authorRef.name}
            </button>
            <span style={{ fontSize: 11.5, color: theme.textDim }}> · @{post.authorRef.instance} · {post.age} ago</span>
          </div>
          <button style={btnReset({
            padding: '6px 12px', borderRadius: 999,
            background: `${theme.accent.hex}22`, color: theme.accent.hex,
            fontSize: 12.5, fontWeight: 700,
          })}>+ Follow</button>
        </div>

        {/* image — full width, not cropped */}
        {isImagePost && post.thumb && (
          <div style={{ marginTop: 14, borderRadius: 14, overflow: 'hidden', background: theme.surface2 }}>
            <img src={post.thumb} alt={post.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
        )}

        {/* link card — only for non-image link posts */}
        {post.url && !isImagePost && (
          <a href={post.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{
            display: 'block', marginTop: 14, padding: 12, borderRadius: 14,
            background: theme.surface, border: `0.5px solid ${theme.hairline}`,
            color: theme.text, textDecoration: 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {post.thumb && (
                <div style={{ width: 56, height: 56, borderRadius: 10, flexShrink: 0, overflow: 'hidden' }}>
                  <img src={post.thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: theme.textFaint, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>
                  {(() => { try { return new URL(post.url).hostname; } catch { return post.url; } })()}
                </div>
                <div style={{ fontSize: 13, color: theme.text, fontWeight: 500, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {post.url}
                </div>
              </div>
              <Icon.link size={16} color={theme.textDim} />
            </div>
          </a>
        )}

        {/* body text — rendered as markdown */}
        {post.body && (
          <div style={{ marginTop: 14 }}>
            <MarkdownText
              text={post.body}
              theme={theme}
              style={{ fontSize: 15, lineHeight: 1.6 }}
              onOpenCommunity={onOpenCommunity}
              onOpenUser={onOpenUser}
            />
          </div>
        )}

        {/* action bar */}
        <div style={{ marginTop: 16, padding: '6px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
          <VoteCluster score={post.score} vote={voteState} theme={theme} onVote={handleVote} />
          <span style={{ flex: 1 }} />
          <ActionBtn theme={theme} icon={<Icon.comment size={16} />} label={String(post.comments)} onClick={() => setComposing(true)} />
          <ActionBtn theme={theme}
            icon={<Icon.bookmark size={16} fill={savedState ? theme.accent.hex : 'none'} color={savedState ? theme.accent.hex : theme.textDim} />}
            onClick={handleSave} />
          <ActionBtn theme={theme} icon={<Icon.share size={16} />} onClick={handleShare} />
        </div>
      </div>

      {/* comments header */}
      <div style={{ padding: '14px 16px 8px', display: 'flex', alignItems: 'center', gap: 14, fontSize: 12.5, fontWeight: 700 }}>
        <span style={{ color: theme.text, fontSize: 14 }}>{post.comments} comments</span>
        <span style={{ flex: 1 }} />
        {[
          { id: 'Hot', l: 'Hot' },
          { id: 'Top', l: 'Top' },
          { id: 'New', l: 'New' },
          { id: 'Old', l: 'Old' },
        ].map(s => (
          <button key={s.id} onClick={() => setSort(s.id)} style={btnReset({
            color: sort === s.id ? theme.accent.hex : theme.textDim,
            fontSize: 12.5, fontWeight: 700,
            paddingBottom: 4, marginBottom: -4,
            borderBottom: sort === s.id ? `2px solid ${theme.accent.hex}` : '2px solid transparent',
          })}>{s.l}</button>
        ))}
      </div>

      {/* comment composer */}
      <div style={{ padding: '4px 16px 12px' }}>
        {composing ? (
          <CommentComposer
            theme={theme}
            postId={post.id}
            onCancel={() => setComposing(false)}
            onSubmitted={() => { setComposing(false); loadComments(sort); }}
          />
        ) : (
          <button onClick={() => window.ME ? setComposing(true) : null} style={btnReset({
            width: '100%', height: 40, borderRadius: 999,
            background: theme.surface, color: theme.textDim,
            padding: '0 16px', justifyContent: 'flex-start',
            fontSize: 13.5, border: `0.5px solid ${theme.hairline}`, gap: 8,
          })}>
            <Icon.reply size={15} color={theme.accent.hex} />
            {window.ME ? 'Add a comment' : 'Sign in to comment'}
          </button>
        )}
      </div>

      <div style={{ padding: '0 16px' }}>
        {commentsLoading && (
          <div style={{ padding: '20px 0', display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: 20, height: 20, borderRadius: 999,
              border: `2px solid ${theme.surface2}`, borderTopColor: theme.accent.hex,
              animation: 'spin 0.8s linear infinite',
            }} />
          </div>
        )}
        {!commentsLoading && comments.length === 0 && (
          <div style={{ padding: '20px 0', textAlign: 'center', color: theme.textDim, fontSize: 13 }}>
            No comments yet.
          </div>
        )}
        {!commentsLoading && comments.map(c => (
          <CommentNode key={c.id} c={c} theme={theme}
            postId={post.id}
            onOpenUser={onOpenUser}
            onOpenCommunity={onOpenCommunity}
            onReplySubmitted={() => loadComments(sort)} />
        ))}
      </div>

      <div style={{ height: 80 }} />
    </div>
  );
}

window.PostDetailScreen = PostDetailScreen;
