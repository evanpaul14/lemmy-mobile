// settings.jsx — settings screen

function SettingsScreen({ theme, onBack, tweaks, setTweak }) {
  return (
    <div style={{ height: '100%', overflowY: 'auto', background: theme.bg }}>
      <ScreenHeader theme={theme} title="Settings" large onBack={onBack} />

      <SGroup theme={theme} title="Account">
        <SRow theme={theme} icon={Icon.user} label="Account" detail={`@${ME.name}`} />
        <SRow theme={theme} icon={Icon.lock} label="Privacy & security" />
        <SRow theme={theme} icon={Icon.globe} label="Federated instances" detail="142 connected" />
      </SGroup>

      <SGroup theme={theme} title="Appearance">
        <SRowToggle theme={theme} icon={Icon.moon} label="Dark mode" value={true} disabled />
        <SRowToggle theme={theme} icon={Icon.spark} label="AMOLED black"
          value={tweaks.amoled} onChange={(v) => setTweak('amoled', v)} />
        <SRowToggle theme={theme} icon={Icon.image} label="Show thumbnails"
          value={tweaks.thumbs} onChange={(v) => setTweak('thumbs', v)} />
        <SRowToggle theme={theme} icon={Icon.text} label="Card-style posts"
          value={tweaks.cards} onChange={(v) => setTweak('cards', v)} />
        <SRowSegmented theme={theme} icon={Icon.filter} label="Density"
          value={tweaks.density} options={['compact', 'regular', 'spacious']}
          onChange={(v) => setTweak('density', v)} />
      </SGroup>

      <SGroup theme={theme} title="Accent">
        <div style={{
          padding: '14px 16px', display: 'flex', gap: 10, alignItems: 'center',
        }}>
          {Object.entries(ACCENTS).map(([id, a]) => {
            const active = tweaks.accent === id;
            return (
              <button key={id} onClick={() => setTweak('accent', id)} style={btnReset({
                width: 36, height: 36, borderRadius: 999, background: a.hex,
                border: active ? `2px solid ${theme.text}` : '2px solid transparent',
                boxShadow: active ? `0 0 0 2px ${theme.bg}` : 'none',
              })}>
                {active && <Icon.check size={18} color={theme.bg.startsWith('#0') ? '#000' : '#fff'} stroke={3} />}
              </button>
            );
          })}
        </div>
      </SGroup>

      <SGroup theme={theme} title="Content">
        <SRow theme={theme} icon={Icon.eye} label="Blocked communities" detail="3" />
        <SRow theme={theme} icon={Icon.trash} label="Blocked users" detail="—" />
        <SRow theme={theme} icon={Icon.download} label="Default sort" detail="Hot" />
        <SRowToggle theme={theme} icon={Icon.image} label="NSFW content" value={false} onChange={() => {}} />
      </SGroup>

      <SGroup theme={theme} title="Notifications">
        <SRowToggle theme={theme} icon={Icon.reply} label="Replies to my posts" value={true} onChange={() => {}} />
        <SRowToggle theme={theme} icon={Icon.at} label="Mentions" value={true} onChange={() => {}} />
        <SRowToggle theme={theme} icon={Icon.envelope} label="Direct messages" value={true} onChange={() => {}} />
      </SGroup>

      <SGroup theme={theme} title="About">
        <SRow theme={theme} label="Version" detail="0.19.4 — “federated daydream”" chevron={false} />
        <SRow theme={theme} label="Acknowledgements" />
        <SRow theme={theme} label="Privacy policy" />
        <SRow theme={theme} label="Sign out" danger />
      </SGroup>

      <div style={{ padding: '20px 16px 100px', textAlign: 'center', color: theme.textFaint, fontSize: 11 }}>
        Made for the fediverse.
      </div>
    </div>
  );
}

function SGroup({ theme, title, children }) {
  return (
    <div style={{ marginTop: 18 }}>
      <div style={{
        padding: '0 20px 6px', fontSize: 11, fontWeight: 700,
        color: theme.textDim, textTransform: 'uppercase', letterSpacing: 0.6,
      }}>{title}</div>
      <div style={{
        margin: '0 12px', borderRadius: 16, overflow: 'hidden',
        background: theme.surface, border: `0.5px solid ${theme.hairline}`,
      }}>{children}</div>
    </div>
  );
}

function SRow({ theme, icon: I, label, detail, chevron = true, danger }) {
  return (
    <button style={btnReset({
      width: '100%', padding: '13px 14px', gap: 12,
      justifyContent: 'flex-start',
      borderTop: `0.5px solid ${theme.divider}`,
    })}>
      {I && <I size={18} color={danger ? theme.danger : theme.accent.hex} stroke={2} />}
      <span style={{
        flex: 1, fontSize: 14.5, color: danger ? theme.danger : theme.text,
        fontWeight: 500, textAlign: 'left',
      }}>{label}</span>
      {detail && <span style={{ fontSize: 13, color: theme.textDim }}>{detail}</span>}
      {chevron && <Icon.back size={14} color={theme.textFaint} style={{ transform: 'scaleX(-1)' }} />}
    </button>
  );
}

function SRowToggle({ theme, icon: I, label, value, onChange, disabled }) {
  return (
    <div style={{
      width: '100%', padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 12,
      borderTop: `0.5px solid ${theme.divider}`,
    }}>
      {I && <I size={18} color={theme.accent.hex} stroke={2} />}
      <span style={{ flex: 1, fontSize: 14.5, color: theme.text, fontWeight: 500 }}>{label}</span>
      <button onClick={() => !disabled && onChange(!value)} style={btnReset({
        width: 44, height: 26, borderRadius: 999,
        background: value ? theme.accent.hex : 'rgba(255,255,255,0.12)',
        opacity: disabled ? 0.5 : 1,
        position: 'relative', transition: 'background 0.15s',
      })}>
        <span style={{
          position: 'absolute', top: 2, left: value ? 20 : 2,
          width: 22, height: 22, borderRadius: 999, background: '#fff',
          transition: 'left 0.15s',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        }} />
      </button>
    </div>
  );
}

function SRowSegmented({ theme, icon: I, label, value, options, onChange }) {
  return (
    <div style={{
      padding: '12px 14px',
      borderTop: `0.5px solid ${theme.divider}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        {I && <I size={18} color={theme.accent.hex} stroke={2} />}
        <span style={{ fontSize: 14.5, color: theme.text, fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{
        display: 'flex', padding: 2, borderRadius: 10,
        background: 'rgba(255,255,255,0.06)',
      }}>
        {options.map(o => {
          const active = value === o;
          return (
            <button key={o} onClick={() => onChange(o)} style={btnReset({
              flex: 1, padding: '7px 8px', borderRadius: 8,
              fontSize: 12.5, fontWeight: 600,
              background: active ? theme.surface2 : 'transparent',
              color: active ? theme.text : theme.textDim,
              textTransform: 'capitalize',
              boxShadow: active ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
            })}>{o}</button>
          );
        })}
      </div>
    </div>
  );
}

window.SettingsScreen = SettingsScreen;
