// ui.jsx — shared primitives: Avatar, Pill, Score, PostCard, etc.

function Avatar({ a, size = 32, radius }) {
  const r = radius != null ? radius : size * 0.32;
  return (
    <div style={{
      width: size, height: size, borderRadius: r,
      background: a.bg, color: a.fg, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.46, fontWeight: 700, letterSpacing: -0.4,
      fontFamily: 'Inter, system-ui',
    }}>{a.letter}</div>
  );
}

function Pill({ children, color, bg, border, ...rest }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 999,
      fontSize: 11, fontWeight: 600, letterSpacing: 0.1,
      color: color || 'rgba(236,237,242,0.8)',
      background: bg || 'rgba(255,255,255,0.06)',
      border: border || 'none',
      lineHeight: 1.4, whiteSpace: 'nowrap',
    }} {...rest}>{children}</span>
  );
}

function Dot({ color = 'currentColor', size = 3 }) {
  return <span style={{ width: size, height: size, borderRadius: 999, background: color, opacity: 0.6, display: 'inline-block', flexShrink: 0 }} />;
}

// Vote arrow + score, pressable
function VoteCluster({ score, vote, theme, onVote, vertical = false }) {
  const up = vote === 'up';
  const down = vote === 'down';
  const idleIcon = '#b8b9c2';
  const upColor = up ? theme.upvote : idleIcon;
  const downColor = down ? theme.downvote : idleIcon;
  const scoreColor = up ? theme.upvote : down ? theme.downvote : '#d4d5dc';
  const adj = up ? 1 : down ? -1 : 0;
  const display = score + adj;
  return (
    <div style={{
      display: 'flex', flexDirection: vertical ? 'column' : 'row',
      alignItems: 'center', gap: vertical ? 2 : 6,
    }}>
      <button onClick={(e) => { e.stopPropagation(); onVote(up ? null : 'up'); }}
        style={btnReset({ color: upColor, padding: 4 })}>
        <Icon.arrowUp size={vertical ? 18 : 16} stroke={2.4} color={upColor} />
      </button>
      <span style={{
        fontSize: vertical ? 12 : 12.5, fontWeight: 700,
        color: scoreColor, fontVariantNumeric: 'tabular-nums',
        minWidth: vertical ? 0 : 28, textAlign: 'center',
      }}>{formatScore(display)}</span>
      <button onClick={(e) => { e.stopPropagation(); onVote(down ? null : 'down'); }}
        style={btnReset({ color: downColor, padding: 4 })}>
        <Icon.arrowDown size={vertical ? 18 : 16} stroke={2.4} color={downColor} />
      </button>
    </div>
  );
}

function formatScore(n) {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'k';
  return String(n);
}

function btnReset(extra = {}) {
  return {
    appearance: 'none', border: 'none', background: 'transparent',
    cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: 0, fontFamily: 'inherit',
    ...extra,
  };
}

// Post card with horizontal swipe-to-vote gesture
function PostCard({ post, theme, onOpen, onVote, onSave, last }) {
  const [dx, setDx] = React.useState(0);
  const [snap, setSnap] = React.useState(false);
  const startX = React.useRef(null);
  const startY = React.useRef(null);
  const locked = React.useRef(false);
  const moved = React.useRef(false);

  const THRESHOLD = 56;

  function onStart(e) {
    const t = e.touches ? e.touches[0] : e;
    startX.current = t.clientX; startY.current = t.clientY;
    locked.current = false; moved.current = false;
    setSnap(false);
  }
  function onMove(e) {
    if (startX.current == null) return;
    const t = e.touches ? e.touches[0] : e;
    const dX = t.clientX - startX.current;
    const dY = t.clientY - startY.current;
    if (!locked.current) {
      if (Math.abs(dX) > 8 && Math.abs(dX) > Math.abs(dY) * 1.4) {
        locked.current = true;
      } else if (Math.abs(dY) > 8) {
        startX.current = null; return;
      }
    }
    if (locked.current) {
      moved.current = true;
      e.preventDefault && e.preventDefault();
      // resistance past threshold
      const cap = 110;
      const v = Math.sign(dX) * Math.min(Math.abs(dX), cap);
      setDx(v);
    }
  }
  function onEnd() {
    if (startX.current == null) return;
    if (locked.current && Math.abs(dx) > THRESHOLD) {
      onVote(dx > 0 ? 'up' : 'down');
    }
    setSnap(true);
    setDx(0);
    startX.current = null;
  }
  function handleClick(e) {
    if (moved.current) { e.preventDefault(); return; }
    onOpen();
  }

  const swipeProgress = Math.min(Math.abs(dx) / THRESHOLD, 1);
  const swipeDir = dx > 0 ? 'up' : dx < 0 ? 'down' : null;
  const swipeColor = swipeDir === 'up' ? theme.upvote : swipeDir === 'down' ? theme.downvote : 'transparent';

  // Tag color
  const tagBg = post.tag ? `${theme.accent.hex}22` : 'transparent';
  const tagColor = theme.accent.hex;

  const titleSize = theme.density.title;
  const padding = theme.density.pad;
  const showThumb = theme.thumbs && post.thumb;

  // Card chrome on/off
  const cardWrap = theme.cards
    ? { background: theme.surface, borderRadius: 18, margin: '0 12px 10px', overflow: 'hidden',
        boxShadow: '0 1px 0 rgba(255,255,255,0.03) inset' }
    : { borderBottom: `0.5px solid ${theme.divider}` };

  return (
    <div style={{ position: 'relative', ...cardWrap }}>
      {/* swipe revealer */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
        justifyContent: dx > 0 ? 'flex-start' : 'flex-end',
        padding: '0 22px', pointerEvents: 'none',
        background: swipeColor, opacity: swipeProgress * 0.18,
      }} />
      <div style={{
        position: 'absolute', top: 0, bottom: 0,
        left: dx > 0 ? 22 : 'auto', right: dx < 0 ? 22 : 'auto',
        display: 'flex', alignItems: 'center', pointerEvents: 'none',
        opacity: swipeProgress, transform: `scale(${0.7 + swipeProgress * 0.6})`,
        transition: snap ? 'opacity .2s' : 'none',
      }}>
        {swipeDir === 'up'
          ? <Icon.arrowUp size={28} color={theme.upvote} stroke={2.6} />
          : swipeDir === 'down'
          ? <Icon.arrowDown size={28} color={theme.downvote} stroke={2.6} />
          : null}
      </div>

      <div
        onClick={handleClick}
        onTouchStart={onStart} onTouchMove={onMove} onTouchEnd={onEnd}
        onMouseDown={onStart} onMouseMove={(e) => { if (e.buttons) onMove(e); }}
        onMouseUp={onEnd} onMouseLeave={onEnd}
        style={{
          position: 'relative',
          padding: `${padding}px 16px`,
          background: theme.cards ? theme.surface : theme.bg,
          transform: `translateX(${dx}px)`,
          transition: snap ? 'transform .25s cubic-bezier(.3,.7,.4,1)' : 'none',
          touchAction: 'pan-y',
          cursor: 'pointer',
        }}>
        {/* meta row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: theme.density.meta, color: theme.textDim,
          marginBottom: 6,
        }}>
          <Avatar a={post.communityRef.avatar} size={18} />
          <span style={{ color: theme.text, fontWeight: 600 }}>c/{post.communityRef.name}</span>
          <span style={{ color: theme.textFaint }}>@{post.communityRef.instance}</span>
          <Dot />
          <span>{post.age}</span>
          {post.tag && <>
            <Dot />
            <Pill color={tagColor} bg={tagBg}>{post.tag}</Pill>
          </>}
          <span style={{ flex: 1 }} />
          <button onClick={(e) => { e.stopPropagation(); }} style={btnReset({ color: theme.textFaint, padding: 4 })}>
            <Icon.more size={18} />
          </button>
        </div>

        {/* title + body */}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: titleSize, fontWeight: 600, color: theme.text,
              lineHeight: theme.density.line, letterSpacing: -0.2,
              textWrap: 'pretty',
            }}>{post.title}</div>
            {post.url && (
              <div style={{
                marginTop: 4, fontSize: 11.5, color: theme.textFaint,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <Icon.link size={11} /> {post.url}
              </div>
            )}
            {post.body && !post.thumb && theme.density !== DENSITIES.compact && (
              <div style={{
                marginTop: 6, fontSize: theme.density.font - 1, color: theme.textDim,
                lineHeight: theme.density.line,
                display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                overflow: 'hidden', textWrap: 'pretty',
              }}>{post.body}</div>
            )}
          </div>
          {showThumb && (
            <div style={{
              width: theme.density.thumb, height: theme.density.thumb,
              borderRadius: 12, overflow: 'hidden', flexShrink: 0,
              background: theme.surface2,
              backgroundImage: `url("${post.thumb}")`,
              backgroundSize: 'cover', backgroundPosition: 'center',
            }} />
          )}
        </div>

        {/* image post — full width */}
        {post.kind === 'image' && !showThumb && post.thumb && (
          <div style={{
            marginTop: 10, borderRadius: 12, overflow: 'hidden',
            aspectRatio: '5 / 3', background: theme.surface2,
            backgroundImage: `url("${post.thumb}")`,
            backgroundSize: 'cover', backgroundPosition: 'center',
          }} />
        )}

        {/* action row */}
        <div style={{
          marginTop: theme.density.gap, display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <VoteCluster score={post.score} vote={post.votes} theme={theme} onVote={onVote} />
          <span style={{ flex: 1 }} />
          <ActionBtn theme={theme} icon={<Icon.comment size={15} />} label={formatScore(post.comments)} />
          <ActionBtn theme={theme} icon={<Icon.bookmark size={15} fill={post.saved ? theme.accent.hex : 'none'} color={post.saved ? theme.accent.hex : theme.textDim} />}
            onClick={(e) => { e.stopPropagation(); onSave(); }} />
          <ActionBtn theme={theme} icon={<Icon.share size={15} />} />
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ icon, label, theme, onClick }) {
  return (
    <button onClick={onClick} style={btnReset({
      color: theme.textDim, padding: '6px 10px', borderRadius: 8,
      fontSize: 12, fontWeight: 600, gap: 5,
    })}>
      {icon}{label && <span>{label}</span>}
    </button>
  );
}

// Generic header bar with back button + title + optional actions
function ScreenHeader({ theme, title, onBack, right, subtitle, large = false, sticky = true }) {
  return (
    <div style={{
      position: sticky ? 'sticky' : 'relative', top: 0, zIndex: 5,
      background: `linear-gradient(${theme.bg} 70%, ${theme.bg}00)`,
      paddingTop: 4,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 12px 8px',
      }}>
        {onBack && (
          <button onClick={onBack} style={btnReset({
            color: theme.text, padding: 6, marginLeft: -4, borderRadius: 999,
          })}>
            <Icon.back size={22} />
          </button>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          {!large && (
            <div style={{
              fontSize: 16, fontWeight: 700, color: theme.text,
              letterSpacing: -0.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{title}</div>
          )}
          {!large && subtitle && (
            <div style={{ fontSize: 11.5, color: theme.textDim, marginTop: 1 }}>{subtitle}</div>
          )}
        </div>
        {right}
      </div>
      {large && (
        <div style={{ padding: '4px 16px 12px' }}>
          <div style={{
            fontSize: 30, fontWeight: 800, color: theme.text,
            letterSpacing: -0.8, lineHeight: 1.05,
          }}>{title}</div>
          {subtitle && <div style={{ fontSize: 13, color: theme.textDim, marginTop: 4 }}>{subtitle}</div>}
        </div>
      )}
    </div>
  );
}

Object.assign(window, {
  Avatar, Pill, Dot, VoteCluster, formatScore, btnReset, PostCard, ActionBtn, ScreenHeader,
});
