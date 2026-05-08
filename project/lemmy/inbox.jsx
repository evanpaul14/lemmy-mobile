// inbox.jsx — notifications inbox with replies / mentions / messages tabs

function InboxScreen({ theme, notifications, onNotificationsChange, onOpenPost }) {
  const [tab, setTab] = React.useState('replies');
  const [items, setItems] = React.useState(notifications || NOTIFICATIONS);

  const tabs = [
    { id: 'replies',  l: 'Replies',  icon: Icon.reply },
    { id: 'mentions', l: 'Mentions', icon: Icon.at },
    { id: 'messages', l: 'Messages', icon: Icon.envelope },
  ];

  function unreadCount(key) {
    return items[key].filter(n => n.unread).length;
  }
  function markAllRead() {
    setItems(prev => ({
      ...prev,
      [tab]: prev[tab].map(n => ({ ...n, unread: false })),
    }));
  }
  function markRead(id) {
    setItems(prev => ({
      ...prev,
      [tab]: prev[tab].map(n => n.id === id ? { ...n, unread: false } : n),
    }));
  }

  const list = items[tab];

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: theme.bg }}>
      <ScreenHeader theme={theme} title="Inbox" large
        subtitle={`${unreadCount('replies') + unreadCount('mentions') + unreadCount('messages')} unread`}
        right={<button onClick={markAllRead} style={btnReset({
          color: theme.accent.hex, fontSize: 13, fontWeight: 600, padding: '6px 8px',
        })}>Mark all read</button>} />

      {/* tab bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 4, background: theme.bg,
        display: 'flex', padding: '0 12px',
        borderBottom: `0.5px solid ${theme.divider}`,
      }}>
        {tabs.map(t => {
          const active = tab === t.id;
          const u = unreadCount(t.id);
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={btnReset({
              flex: 1, padding: '12px 6px', gap: 6,
              fontSize: 13, fontWeight: 700,
              color: active ? theme.text : theme.textDim,
              borderBottom: active ? `2px solid ${theme.accent.hex}` : '2px solid transparent',
              marginBottom: -0.5,
            })}>
              <t.icon size={15} color={active ? theme.accent.hex : theme.textDim} stroke={2.2} />
              {t.l}
              {u > 0 && (
                <span style={{
                  minWidth: 18, height: 18, borderRadius: 999,
                  background: theme.accent.hex, color: theme.amoled ? '#000' : '#0a0a0c',
                  fontSize: 10.5, fontWeight: 800, padding: '0 5px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{u}</span>
              )}
            </button>
          );
        })}
      </div>

      <div>
        {list.map(n => {
          const userRef = n.fromRef
            ? { ...n.fromRef, avatar: n.fromRef.avatar || avatar(n.fromRef.name || n.from || 'u') }
            : (USERS.find(u => u.id === n.from) || { name: n.from, avatar: avatar(n.from || 'u') });
          return (
            <button key={n.id} onClick={() => markRead(n.id)} style={btnReset({
              width: '100%', padding: '14px 16px',
              gap: 12, justifyContent: 'flex-start', alignItems: 'flex-start',
              borderBottom: `0.5px solid ${theme.divider}`,
              background: n.unread ? `${theme.accent.hex}0c` : 'transparent',
              position: 'relative',
            })}>
              {n.unread && (
                <div style={{
                  position: 'absolute', left: 5, top: 22,
                  width: 6, height: 6, borderRadius: 999, background: theme.accent.hex,
                }} />
              )}
              <Avatar a={userRef.avatar} size={40} />
              <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                <div style={{
                  display: 'flex', alignItems: 'baseline', gap: 6,
                  fontSize: 13.5, color: theme.text,
                }}>
                  <span style={{ fontWeight: 700 }}>{userRef.name}</span>
                  <span style={{ color: theme.textDim, fontWeight: 400 }}>{n.title}</span>
                  <span style={{ flex: 1 }} />
                  <span style={{ color: theme.textFaint, fontSize: 11.5 }}>{n.age}</span>
                </div>
                {n.context && (
                  <div style={{
                    fontSize: 12, color: theme.textDim, marginTop: 2,
                    display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    <span style={{ color: theme.accent.hex, fontWeight: 600 }}>›</span> {n.context}
                  </div>
                )}
                <div style={{
                  marginTop: 6, padding: '8px 10px', borderRadius: 10,
                  background: theme.surface, border: `0.5px solid ${theme.hairline}`,
                  fontSize: 13, color: theme.text, lineHeight: 1.4,
                  textWrap: 'pretty',
                  display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>{n.body}</div>

                {/* quick action */}
                <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                  <button onClick={(e) => e.stopPropagation()} style={btnReset({
                    padding: '6px 12px', borderRadius: 999,
                    background: theme.accent.hex, color: theme.amoled ? '#000' : '#0a0a0c',
                    fontSize: 12, fontWeight: 800, gap: 4,
                  })}>
                    <Icon.reply size={12} stroke={2.6} color={theme.amoled ? '#000' : '#0a0a0c'} /> Reply
                  </button>
                  {n.kind !== 'message' && (
                    <button onClick={(e) => { e.stopPropagation(); }} style={btnReset({
                      padding: '6px 12px', borderRadius: 999,
                      color: theme.textDim, fontSize: 12, fontWeight: 600,
                    })}>View thread</button>
                  )}
                </div>
              </div>
            </button>
          );
        })}

        {list.length === 0 && (
          <div style={{ padding: 60, textAlign: 'center', color: theme.textDim, fontSize: 13.5 }}>
            Nothing here.
          </div>
        )}
      </div>

      <div style={{ height: 100 }} />
    </div>
  );
}

window.InboxScreen = InboxScreen;
