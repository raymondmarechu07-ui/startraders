'use client';

const OFFICIAL_BOT_URL = 'https://bot.deriv.com/';

const styles = {
  page: { minHeight: '100vh', background: '#020617', color: '#f8fafc', fontFamily: 'Arial, sans-serif', display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '18px 22px', borderBottom: '1px solid #1e293b' },
  eyebrow: { margin: '0 0 6px', color: '#34d399', fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase' },
  title: { margin: 0, fontSize: 24, fontWeight: 800 },
  subtitle: { margin: '7px 0 0', color: '#cbd5e1', fontSize: 14 },
  main: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
  panel: { width: '100%', maxWidth: 760, padding: 32, border: '1px solid #334155', borderRadius: 16, background: '#0f172a', textAlign: 'center', boxSizing: 'border-box' },
  icon: { width: 64, height: 64, margin: '0 auto 20px', display: 'grid', placeItems: 'center', borderRadius: 16, background: '#064e3b', color: '#6ee7b7', fontSize: 32, fontWeight: 800 },
  button: { display: 'inline-block', marginTop: 12, borderRadius: 10, padding: '14px 20px', background: '#34d399', color: '#052e2b', fontWeight: 800, textDecoration: 'none' },
  note: { margin: '22px auto 0', maxWidth: 600, color: '#94a3b8', fontSize: 13, lineHeight: 1.6 },
};

export default function BotBuilderPage() {
  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <p style={styles.eyebrow}>StarTraders</p>
          <h1 style={styles.title}>Deriv Bot Builder</h1>
          <p style={styles.subtitle}>Launch the genuine Blockly-based strategy builder.</p>
        </div>
      </header>
      <section style={styles.main}>
        <div style={styles.panel}>
          <div style={styles.icon} aria-hidden="true">⌘</div>
          <h2 style={{ margin: '0 0 12px', fontSize: 26 }}>Build your trading bot</h2>
          <p style={{ margin: '0 auto', maxWidth: 600, color: '#cbd5e1', lineHeight: 1.7 }}>
            Open Deriv’s official Bot Builder to use its real drag-and-drop blocks, strategy controls, and bot execution tools. The official site cannot reliably run inside an embedded frame, so this launches the real workspace directly instead of showing a broken blank panel.
          </p>
          <a href={OFFICIAL_BOT_URL} style={styles.button}>Launch official Deriv Bot ↗</a>
          <p style={styles.note}>
            You will leave StarTraders and open Deriv Bot. Sign in with your Deriv account there if prompted. StarTraders does not store your Deriv password or claim to execute trades from this page.
          </p>
        </div>
      </section>
    </main>
  );
}
