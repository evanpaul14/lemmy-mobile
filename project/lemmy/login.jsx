// login.jsx — onboarding + login flow
// Steps: welcome → instance picker → sign in / sign up → done

function LoginScreen({ theme, onComplete }) {
  const [step, setStep] = React.useState(0);
  const [instance, setInstance] = React.useState('lemmy.world');
  const [mode, setMode] = React.useState('signin');
  const [user, setUser] = React.useState('');
  const [pass, setPass] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const instances = [
    { id: 'lemmy.world',  users: '142k', desc: 'Largest general-purpose instance', flag: '🌐' },
    { id: 'lemmy.ml',     users: '38k',  desc: 'The original Lemmy server',  flag: '⚙️' },
    { id: 'beehaw.org',   users: '12k',  desc: 'Curated, friendly, slow-moderated', flag: '🐝' },
    { id: 'lemmy.ca',     users: '21k',  desc: 'Canadian-hosted, all are welcome', flag: '🍁' },
    { id: 'fed.fyi',      users: '4.2k', desc: 'Indie web & federation',     flag: '🛰️' },
  ];

  async function submit() {
    setError('');
    setLoading(true);
    try {
      const data = await API.login(instance, user, pass);
      onComplete(data.user);
    } catch (err) {
      setError(err.message || 'Login failed');
      setLoading(false);
    }
  }

  async function browseAnon() {
    setLoading(true);
    try {
      await API.loginAnonymous(instance);
      onComplete(null);
    } catch (err) {
      setError(err.message || 'Failed to connect');
      setLoading(false);
    }
  }

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: theme.bg, position: 'relative', overflow: 'hidden',
    }}>
      {/* ambient gradient backdrop */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse at 30% 0%, ${theme.accent.hex}22, transparent 60%),
                     radial-gradient(ellipse at 80% 90%, ${theme.accent.hex}11, transparent 70%)`,
      }} />

      {step === 0 && (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          padding: '60px 28px 32px', position: 'relative',
        }}>
          {/* logo */}
          <div style={{
            width: 76, height: 76, borderRadius: 22,
            background: `linear-gradient(135deg, ${theme.accent.hex}, ${theme.accent.hex}80)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 12px 40px ${theme.accent.hex}55`,
          }}>
            <Icon.flame size={40} color={theme.amoled ? '#000' : '#0a0a0c'} stroke={2.2} />
          </div>

          <div style={{ marginTop: 32 }}>
            <div style={{
              fontSize: 38, fontWeight: 800, color: theme.text,
              letterSpacing: -1.2, lineHeight: 1.05, textWrap: 'balance',
            }}>
              The fediverse, in your pocket.
            </div>
            <div style={{
              marginTop: 16, fontSize: 15.5, color: theme.textDim,
              lineHeight: 1.5, textWrap: 'pretty',
            }}>
              Communities, not algorithms. Pick your instance and start reading.
            </div>
          </div>

          <div style={{ flex: 1 }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={() => setStep(1)} style={btnReset({
              width: '100%', padding: 16, borderRadius: 999,
              background: theme.accent.hex, color: theme.amoled ? '#000' : '#0a0a0c',
              fontSize: 15, fontWeight: 700,
            })}>Get started</button>
            <button onClick={() => setStep(2)} style={btnReset({
              width: '100%', padding: 16, borderRadius: 999,
              background: 'transparent', color: theme.text,
              fontSize: 14.5, fontWeight: 600,
              border: `1px solid ${theme.hairline}`,
            })}>I already have an account</button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          padding: '50px 20px 28px', position: 'relative', overflow: 'hidden',
        }}>
          <button onClick={() => setStep(0)} style={btnReset({
            color: theme.text, padding: 6, marginLeft: -6, alignSelf: 'flex-start',
          })}>
            <Icon.back size={22} />
          </button>
          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: theme.text, letterSpacing: -0.7, lineHeight: 1.1 }}>
              Choose an instance
            </div>
            <div style={{ marginTop: 8, fontSize: 13.5, color: theme.textDim, lineHeight: 1.4 }}>
              Lemmy is federated. Pick a server — you can talk to people on any other one.
            </div>
          </div>

          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 8, flex: 1, overflowY: 'auto' }}>
            {instances.map(i => {
              const active = instance === i.id;
              return (
                <button key={i.id} onClick={() => setInstance(i.id)} style={btnReset({
                  padding: '14px 16px', borderRadius: 16,
                  background: active ? `${theme.accent.hex}18` : theme.surface,
                  border: active ? `1px solid ${theme.accent.hex}` : `0.5px solid ${theme.hairline}`,
                  gap: 14, justifyContent: 'flex-start', alignItems: 'center',
                  textAlign: 'left',
                })}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: theme.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22,
                  }}>{i.flag}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: theme.text }}>{i.id}</div>
                    <div style={{ fontSize: 11.5, color: theme.textDim, marginTop: 1 }}>
                      {i.users} users · {i.desc}
                    </div>
                  </div>
                  {active && (
                    <div style={{
                      width: 22, height: 22, borderRadius: 999,
                      background: theme.accent.hex,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon.check size={14} color={theme.amoled ? '#000' : '#0a0a0c'} stroke={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <button onClick={() => setStep(2)} style={btnReset({
            width: '100%', padding: 16, borderRadius: 999, marginTop: 12,
            background: theme.accent.hex, color: theme.amoled ? '#000' : '#0a0a0c',
            fontSize: 15, fontWeight: 700,
          })}>Continue</button>
        </div>
      )}

      {step === 2 && (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          padding: '50px 24px 28px', position: 'relative',
        }}>
          <button onClick={() => setStep(1)} style={btnReset({
            color: theme.text, padding: 6, marginLeft: -6, alignSelf: 'flex-start',
          })}>
            <Icon.back size={22} />
          </button>

          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: theme.text, letterSpacing: -0.7, lineHeight: 1.1 }}>
              {mode === 'signin' ? 'Welcome back' : 'Create an account'}
            </div>
            <div style={{ marginTop: 8, fontSize: 13.5, color: theme.textDim }}>
              on <span style={{ color: theme.accent.hex, fontWeight: 700 }}>{instance}</span>
            </div>
          </div>

          {/* segmented */}
          <div style={{
            marginTop: 22, display: 'flex', padding: 3, borderRadius: 12,
            background: theme.surface, border: `0.5px solid ${theme.hairline}`,
          }}>
            {['signin', 'signup'].map(m => (
              <button key={m} onClick={() => setMode(m)} style={btnReset({
                flex: 1, padding: '9px', borderRadius: 9,
                fontSize: 13, fontWeight: 700,
                background: mode === m ? theme.surface2 : 'transparent',
                color: mode === m ? theme.text : theme.textDim,
              })}>{m === 'signin' ? 'Sign in' : 'Sign up'}</button>
            ))}
          </div>

          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Field theme={theme} icon={Icon.user} placeholder="Username" value={user} onChange={setUser} />
            <Field theme={theme} icon={Icon.lock} placeholder="Password" value={pass} onChange={setPass} type="password" />
            {mode === 'signup' && (
              <Field theme={theme} icon={Icon.envelope} placeholder="Email" type="email" />
            )}
          </div>

          {mode === 'signin' && (
            <button style={btnReset({
              alignSelf: 'flex-end', marginTop: 8, padding: 4,
              color: theme.textDim, fontSize: 12.5, fontWeight: 600,
            })}>Forgot password?</button>
          )}

          <div style={{ flex: 1 }} />

          <button onClick={submit} disabled={loading} style={btnReset({
            width: '100%', padding: 16, borderRadius: 999,
            background: theme.accent.hex, color: theme.amoled ? '#000' : '#0a0a0c',
            fontSize: 15, fontWeight: 700, opacity: loading ? 0.6 : 1,
          })}>
            {loading ? 'Connecting…' : (mode === 'signin' ? 'Sign in' : 'Create account')}
          </button>
          {error && (
            <div style={{ color: '#ff5d6c', fontSize: 12.5, textAlign: 'center', marginTop: 4 }}>{error}</div>
          )}
          <button onClick={browseAnon} style={btnReset({
            width: '100%', padding: '12px 16px', marginTop: 6,
            color: theme.textDim, fontSize: 13, fontWeight: 600,
          })}>Browse without an account</button>
        </div>
      )}
    </div>
  );
}

function Field({ theme, icon: I, placeholder, value, onChange, type = 'text' }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      height: 48, padding: '0 14px', borderRadius: 12,
      background: theme.surface, border: `0.5px solid ${theme.hairline}`,
    }}>
      {I && <I size={16} color={theme.textDim} />}
      <input type={type} value={value} onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          flex: 1, border: 'none', background: 'transparent', outline: 'none',
          color: theme.text, fontSize: 14.5, fontFamily: 'inherit',
        }} />
    </div>
  );
}

window.LoginScreen = LoginScreen;
