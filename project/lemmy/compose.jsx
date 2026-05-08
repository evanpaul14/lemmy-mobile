// compose.jsx — new post composer

function ComposeScreen({ theme, onClose, onSubmit }) {
  const [kind, setKind] = React.useState('text'); // text / link / image
  const [community, setCommunity] = React.useState(COMMUNITIES[0]);
  const [title, setTitle] = React.useState('');
  const [body, setBody] = React.useState('');
  const [url, setUrl] = React.useState('');
  const [tag, setTag] = React.useState('');
  const [pickerOpen, setPickerOpen] = React.useState(false);

  const valid = title.trim().length >= 4 && (kind === 'text' || kind === 'image' || (kind === 'link' && url.trim()));

  const types = [
    { id: 'text',  l: 'Text',  icon: Icon.text },
    { id: 'link',  l: 'Link',  icon: Icon.link },
    { id: 'image', l: 'Image', icon: Icon.image },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: theme.bg }}>
      {/* header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 12px', borderBottom: `0.5px solid ${theme.divider}`,
      }}>
        <button onClick={onClose} style={btnReset({
          color: theme.text, fontSize: 14, fontWeight: 500, padding: '6px 4px',
        })}>Cancel</button>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 15, fontWeight: 700, color: theme.text }}>
          New post
        </div>
        <button disabled={!valid} onClick={() => valid && onSubmit({ community, title, body, url, kind, tag })} style={btnReset({
          padding: '8px 14px', borderRadius: 999, fontWeight: 700, fontSize: 13,
          background: valid ? theme.accent.hex : 'rgba(255,255,255,0.06)',
          color: valid ? (theme.amoled ? '#000' : '#0a0a0c') : theme.textFaint,
        })}>Post</button>
      </div>

      {/* community picker */}
      <button onClick={() => setPickerOpen(p => !p)} style={btnReset({
        padding: '12px 16px', gap: 10, justifyContent: 'flex-start',
        borderBottom: `0.5px solid ${theme.divider}`,
      })}>
        <Avatar a={community.avatar} size={32} />
        <div style={{ textAlign: 'left', flex: 1 }}>
          <div style={{ fontSize: 11, color: theme.textDim, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>
            Posting to
          </div>
          <div style={{ fontSize: 14, color: theme.text, fontWeight: 700, marginTop: 1 }}>
            c/{community.name}
            <span style={{ color: theme.textFaint, fontWeight: 400, marginLeft: 6 }}>@{community.instance}</span>
          </div>
        </div>
        <Icon.back size={14} color={theme.textFaint}
          style={{ transform: pickerOpen ? 'rotate(90deg)' : 'rotate(-90deg)', transition: 'transform .15s' }} />
      </button>

      {pickerOpen && (
        <div style={{
          maxHeight: 220, overflowY: 'auto',
          background: theme.surface, borderBottom: `0.5px solid ${theme.divider}`,
        }}>
          {COMMUNITIES.map(c => (
            <button key={c.id} onClick={() => { setCommunity(c); setPickerOpen(false); }} style={btnReset({
              width: '100%', padding: '10px 16px', gap: 12, justifyContent: 'flex-start',
            })}>
              <Avatar a={c.avatar} size={28} />
              <div style={{ textAlign: 'left', flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>c/{c.name}</div>
                <div style={{ fontSize: 11, color: theme.textDim }}>{c.members} members</div>
              </div>
              {community.id === c.id && <Icon.check size={16} color={theme.accent.hex} stroke={3} />}
            </button>
          ))}
        </div>
      )}

      {/* type segmented */}
      <div style={{ padding: '12px 12px 0', display: 'flex', gap: 6 }}>
        {types.map(t => {
          const active = kind === t.id;
          return (
            <button key={t.id} onClick={() => setKind(t.id)} style={btnReset({
              flex: 1, padding: '10px', borderRadius: 12, gap: 6,
              fontSize: 12.5, fontWeight: 700,
              background: active ? `${theme.accent.hex}22` : theme.surface,
              color: active ? theme.accent.hex : theme.textDim,
              border: active ? `1px solid ${theme.accent.hex}55` : `0.5px solid ${theme.hairline}`,
            })}>
              <t.icon size={14} stroke={2.4} />
              {t.l}
            </button>
          );
        })}
      </div>

      {/* form */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="An interesting title…"
          style={{
            width: '100%', border: 'none', background: 'transparent', outline: 'none',
            color: theme.text, fontSize: 22, fontWeight: 700, lineHeight: 1.25,
            letterSpacing: -0.4, fontFamily: 'inherit', padding: '4px 0',
            boxSizing: 'border-box',
          }} />

        {kind === 'link' && (
          <div style={{
            marginTop: 12, padding: '10px 14px', borderRadius: 12,
            background: theme.surface, border: `0.5px solid ${theme.hairline}`,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Icon.link size={15} color={theme.textDim} />
            <input value={url} onChange={(e) => setUrl(e.target.value)}
              placeholder="https://"
              style={{
                flex: 1, border: 'none', background: 'transparent', outline: 'none',
                color: theme.text, fontSize: 14, fontFamily: 'inherit',
              }} />
          </div>
        )}

        {kind === 'image' && (
          <button style={btnReset({
            width: '100%', marginTop: 12, padding: 28,
            borderRadius: 14, background: theme.surface,
            border: `1.5px dashed ${theme.hairline}`,
            flexDirection: 'column', gap: 8, color: theme.textDim,
          })}>
            <Icon.image size={28} color={theme.accent.hex} stroke={1.6} />
            <span style={{ fontSize: 13, color: theme.text, fontWeight: 600 }}>Add a photo</span>
            <span style={{ fontSize: 11.5 }}>JPG / PNG / WebP, up to 16MB</span>
          </button>
        )}

        <textarea value={body} onChange={(e) => setBody(e.target.value)}
          placeholder={kind === 'text' ? 'Share your thoughts…' : 'Add some context (optional)…'}
          style={{
            width: '100%', marginTop: 16, minHeight: 140,
            border: 'none', background: 'transparent', outline: 'none', resize: 'none',
            color: theme.text, fontSize: 15, lineHeight: 1.55, letterSpacing: -0.1,
            fontFamily: theme.fontSerif, padding: 0, boxSizing: 'border-box',
          }} />

        {/* tag chooser */}
        <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['Discussion', 'Show /c', 'Help', 'OC', 'NSFW'].map(t => {
            const active = tag === t;
            return (
              <button key={t} onClick={() => setTag(active ? '' : t)} style={btnReset({
                padding: '6px 12px', borderRadius: 999,
                background: active ? `${theme.accent.hex}22` : theme.surface,
                color: active ? theme.accent.hex : theme.textDim,
                border: active ? `1px solid ${theme.accent.hex}55` : `0.5px solid ${theme.hairline}`,
                fontSize: 11.5, fontWeight: 700,
              })}>{t}</button>
            );
          })}
        </div>
      </div>

      {/* toolbar above keyboard */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 18,
        padding: '10px 16px', borderTop: `0.5px solid ${theme.divider}`,
        color: theme.textDim,
      }}>
        <button style={btnReset({ color: 'inherit' })}><b style={{ fontSize: 15 }}>B</b></button>
        <button style={btnReset({ color: 'inherit' })}><i style={{ fontSize: 15 }}>i</i></button>
        <button style={btnReset({ color: 'inherit', fontSize: 14, fontFamily: theme.fontMono })}>{`</>`}</button>
        <button style={btnReset({ color: 'inherit' })}><Icon.link size={16} /></button>
        <button style={btnReset({ color: 'inherit' })}><Icon.image size={16} /></button>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: theme.textFaint }}>{title.length}/300</span>
      </div>
    </div>
  );
}

window.ComposeScreen = ComposeScreen;
