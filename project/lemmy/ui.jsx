// ui.jsx — shared primitives: Avatar, Pill, Score, PostCard, etc.

function Avatar({ a, size = 32, radius }) {
  // Avatars hidden by user preference
  return null;
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

// ── Markdown renderer ─────────────────────────────────────────────────────────

function MarkdownText({ text, theme, style, onOpenCommunity, onOpenUser }) {
  if (!text) return null;

  function renderInline(str) {
    if (!str) return null;
    const parts = [];
    let key = 0;
    const re = /\*\*([^*\n]+?)\*\*|\*([^*\n]+?)\*|`([^`\n]+?)`|~~([^~\n]+?)~~|\[([^\]]+)\]\(([^)]+)\)|!([a-zA-Z0-9_.-]+)@([a-zA-Z0-9._-]+)|@([a-zA-Z0-9_.-]+)@([a-zA-Z0-9._-]+)/g;
    let last = 0;
    let m;
    while ((m = re.exec(str)) !== null) {
      if (m.index > last) parts.push(<React.Fragment key={key++}>{str.slice(last, m.index)}</React.Fragment>);
      if (m[1] !== undefined)
        parts.push(<strong key={key++} style={{ fontWeight: 700 }}>{m[1]}</strong>);
      else if (m[2] !== undefined)
        parts.push(<em key={key++}>{m[2]}</em>);
      else if (m[3] !== undefined)
        parts.push(<code key={key++} style={{ fontFamily: theme.fontMono, fontSize: '0.87em', background: 'rgba(255,255,255,0.09)', padding: '1px 5px', borderRadius: 4, color: theme.accent.hex }}>{m[3]}</code>);
      else if (m[4] !== undefined)
        parts.push(<span key={key++} style={{ textDecoration: 'line-through', opacity: 0.65 }}>{m[4]}</span>);
      else if (m[5] !== undefined)
        parts.push(<a key={key++} href={m[6]} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ color: theme.accent.hex, textDecoration: 'underline' }}>{m[5]}</a>);
      else if (m[7] !== undefined) {
        const cn = m[7], ci = m[8];
        parts.push(<button key={key++} onClick={e => { e.stopPropagation(); onOpenCommunity?.({ name: cn, instance: ci }); }} style={{ display: 'inline', border: 'none', background: 'none', color: theme.accent.hex, cursor: 'pointer', padding: 0, fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 600 }}>!{cn}@{ci}</button>);
      } else if (m[9] !== undefined) {
        const un = m[9], ui = m[10];
        parts.push(<button key={key++} onClick={e => { e.stopPropagation(); onOpenUser?.(un, ui); }} style={{ display: 'inline', border: 'none', background: 'none', color: theme.accent.hex, cursor: 'pointer', padding: 0, fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 600 }}>@{un}@{ui}</button>);
      }
      last = m.index + m[0].length;
    }
    if (last < str.length) parts.push(<React.Fragment key={key++}>{str.slice(last)}</React.Fragment>);
    return parts.length ? parts : str;
  }

  const elements = [];
  const lines = text.split('\n');
  let i = 0, k = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Fenced code block
    if (trimmed.startsWith('```')) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) { codeLines.push(lines[i]); i++; }
      elements.push(
        <pre key={k++} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '10px 12px', overflowX: 'auto', margin: '8px 0', fontFamily: theme.fontMono, fontSize: 13, color: theme.text, lineHeight: 1.6, border: '0.5px solid rgba(255,255,255,0.08)', whiteSpace: 'pre' }}>
          {codeLines.join('\n')}
        </pre>
      );
      i++;
      continue;
    }

    // Heading
    const hm = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (hm) {
      const lvl = hm[1].length;
      const sz = [20, 17, 15][lvl - 1];
      elements.push(<div key={k++} style={{ fontSize: sz, fontWeight: 700, color: theme.text, marginTop: 10, marginBottom: 3, letterSpacing: -0.3 }}>{renderInline(hm[2])}</div>);
      i++; continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      elements.push(<hr key={k++} style={{ border: 'none', borderTop: `0.5px solid ${theme.divider}`, margin: '10px 0' }} />);
      i++; continue;
    }

    // Blockquote
    if (line.startsWith('> ') || line === '>') {
      const qLines = [];
      while (i < lines.length && (lines[i].startsWith('> ') || lines[i] === '>')) {
        qLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      elements.push(
        <div key={k++} style={{ borderLeft: `3px solid ${theme.accent.hex}66`, paddingLeft: 10, margin: '6px 0', color: theme.textDim }}>
          {qLines.map((ql, qi) => <div key={qi} style={{ fontStyle: 'italic' }}>{renderInline(ql) || ' '}</div>)}
        </div>
      );
      continue;
    }

    // Unordered list
    if (/^[*\-+] /.test(line)) {
      const items = [];
      while (i < lines.length && /^[*\-+] /.test(lines[i])) {
        items.push(lines[i].replace(/^[*\-+] /, ''));
        i++;
      }
      elements.push(
        <ul key={k++} style={{ margin: '6px 0', paddingLeft: 18, color: theme.text }}>
          {items.map((it, ii) => <li key={ii} style={{ marginBottom: 3, lineHeight: 1.5 }}>{renderInline(it)}</li>)}
        </ul>
      );
      continue;
    }

    // Ordered list
    if (/^\d+\. /.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, ''));
        i++;
      }
      elements.push(
        <ol key={k++} style={{ margin: '6px 0', paddingLeft: 18, color: theme.text }}>
          {items.map((it, ii) => <li key={ii} style={{ marginBottom: 3, lineHeight: 1.5 }}>{renderInline(it)}</li>)}
        </ol>
      );
      continue;
    }

    // Empty line
    if (trimmed === '') { i++; continue; }

    // Paragraph: collect until a block-level element or blank line
    const paraLines = [];
    while (i < lines.length) {
      const l = lines[i], t = l.trim();
      if (t === '' || /^#{1,3} /.test(t) || l.startsWith('> ') || t.startsWith('```') ||
          /^[*\-+] /.test(l) || /^\d+\. /.test(l) || /^(-{3,}|\*{3,}|_{3,})$/.test(t)) break;
      paraLines.push(l);
      i++;
    }
    if (paraLines.length > 0) {
      const lineEls = paraLines.flatMap((l, li) => {
        const r = renderInline(l);
        return li < paraLines.length - 1 ? [...(Array.isArray(r) ? r : [r]), <br key={`br${li}`} />] : (Array.isArray(r) ? r : [r]);
      });
      elements.push(<p key={k++} style={{ margin: '0 0 8px 0', lineHeight: 1.55, color: theme.text }}>{lineEls}</p>);
    }
  }

  return <div style={{ fontSize: 14.5, letterSpacing: -0.1, ...style }}>{elements}</div>;
}

// ── Post menu (three-dots sheet) ──────────────────────────────────────────────

function PostMenu({ post, theme, onClose, onSave, onShare }) {
  const options = [
    {
      label: 'Share',
      icon: Icon.share,
      action: onShare,
    },
    {
      label: post.saved ? 'Unsave' : 'Save',
      icon: Icon.bookmark,
      action: onSave,
    },
    {
      label: 'Copy link',
      icon: Icon.link,
      action: () => {
        if (post.url) navigator.clipboard?.writeText(post.url);
        else navigator.clipboard?.writeText(window.location.href);
      },
    },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.5)' }}
         onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: theme.surface, borderRadius: '20px 20px 0 0', paddingBottom: 32 }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: theme.textFaint, margin: '10px auto 8px' }} />
        <div style={{ padding: '6px 16px 8px', fontSize: 13, fontWeight: 600, color: theme.textDim, letterSpacing: -0.1 }}
             numberOfLines={1}>{post.title}</div>
        <div style={{ height: '0.5px', background: theme.divider, margin: '0 0 4px' }} />
        {options.map(opt => (
          <button key={opt.label} onClick={() => { opt.action(); onClose(); }} style={btnReset({
            width: '100%', padding: '14px 20px', gap: 14, justifyContent: 'flex-start',
            color: theme.text, fontSize: 15,
          })}>
            <opt.icon size={20} color={theme.accent.hex} />
            {opt.label}
          </button>
        ))}
        <button onClick={onClose} style={btnReset({
          width: '100%', padding: '14px 20px', gap: 14, justifyContent: 'flex-start',
          color: theme.textDim, fontSize: 15,
        })}>
          <Icon.close size={20} color={theme.textDim} />
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── PostCard ──────────────────────────────────────────────────────────────────

// Post card with horizontal swipe-to-vote gesture
function PostCard({ post, theme, onOpen, onVote, onSave, onOpenCommunity, last }) {
  const [dx, setDx] = React.useState(0);
  const [snap, setSnap] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
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

  function handleShare() {
    if (navigator.share && post.url) {
      navigator.share({ title: post.title, url: post.url }).catch(() => {});
    } else if (post.url) {
      navigator.clipboard?.writeText(post.url);
    }
  }

  const swipeProgress = Math.min(Math.abs(dx) / THRESHOLD, 1);
  const swipeDir = dx > 0 ? 'up' : dx < 0 ? 'down' : null;
  const swipeColor = swipeDir === 'up' ? theme.upvote : swipeDir === 'down' ? theme.downvote : 'transparent';

  const tagBg = post.tag ? `${theme.accent.hex}22` : 'transparent';
  const tagColor = theme.accent.hex;

  const titleSize = theme.density.title;
  const padding = theme.density.pad;
  const showThumb = theme.thumbs && post.thumb && post.kind !== 'image';

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
          <button onClick={(e) => { e.stopPropagation(); onOpenCommunity && onOpenCommunity(post.communityRef); }}
            style={btnReset({ color: theme.text, fontWeight: 600, fontSize: theme.density.meta })}>
            c/{post.communityRef.name}
          </button>
          <span style={{ color: theme.textFaint }}>@{post.communityRef.instance}</span>
          <Dot />
          <span>{post.age}</span>
          {post.tag && <>
            <Dot />
            <Pill color={tagColor} bg={tagBg}>{post.tag}</Pill>
          </>}
          <span style={{ flex: 1 }} />
          <button onClick={(e) => { e.stopPropagation(); setMenuOpen(true); }} style={btnReset({ color: theme.textFaint, padding: 4 })}>
            <Icon.more size={18} />
          </button>
        </div>

        {/* title + optional thumb */}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: titleSize, fontWeight: 600, color: theme.text,
              lineHeight: theme.density.line, letterSpacing: -0.2,
              textWrap: 'pretty',
            }}>{post.title}</div>
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
            }}>
              <img src={post.thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
        </div>

        {/* image post — full width, not cropped */}
        {post.kind === 'image' && post.thumb && (
          <div style={{ marginTop: 10, borderRadius: 12, overflow: 'hidden', background: theme.surface2 }}>
            <img src={post.thumb} alt={post.title} style={{ width: '100%', height: 'auto', display: 'block', maxHeight: 360, objectFit: 'contain' }} />
          </div>
        )}

        {/* action row */}
        <div style={{
          marginTop: theme.density.gap, display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <VoteCluster score={post.score} vote={post.votes} theme={theme} onVote={onVote} />
          <span style={{ flex: 1 }} />
          <ActionBtn theme={theme} icon={<Icon.comment size={15} />} label={formatScore(post.comments)} />
          <ActionBtn theme={theme}
            icon={<Icon.bookmark size={15} fill={post.saved ? theme.accent.hex : 'none'} color={post.saved ? theme.accent.hex : theme.textDim} />}
            onClick={(e) => { e.stopPropagation(); onSave(); }} />
          <ActionBtn theme={theme} icon={<Icon.share size={15} />} onClick={(e) => { e.stopPropagation(); handleShare(); }} />
        </div>
      </div>

      {menuOpen && (
        <PostMenu
          post={post}
          theme={theme}
          onClose={() => setMenuOpen(false)}
          onSave={() => { onSave(); setMenuOpen(false); }}
          onShare={handleShare}
        />
      )}
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
function ScreenHeader({ theme, title, onBack, right, subtitle, large = false, sticky = true, onTitleClick }) {
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
            <div onClick={onTitleClick} style={{
              fontSize: 16, fontWeight: 700, color: theme.text,
              letterSpacing: -0.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              cursor: onTitleClick ? 'pointer' : 'default',
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
  Avatar, Pill, Dot, VoteCluster, formatScore, btnReset,
  MarkdownText, PostMenu, PostCard, ActionBtn, ScreenHeader,
});
