'use client';

import { useState } from 'react';

const OFFICIAL_BOT_URL = 'https://bot.deriv.com/';
const styles = {
  page: { minHeight: '100vh', background: '#020617', color: '#f8fafc', fontFamily: 'Arial, sans-serif' },
  header: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '18px 22px', borderBottom: '1px solid #1e293b' },
  eyebrow: { margin: '0 0 6px', color: '#34d399', fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase' },
  title: { margin: 0, fontSize: 24, fontWeight: 800 },
  subtitle: { margin: '7px 0 0', color: '#cbd5e1', fontSize: 14 },
  link: { display: 'inline-block', borderRadius: 9, padding: '12px 16px', background: '#34d399', color: '#052e2b', fontWeight: 800, textDecoration: 'none' },
  section: { padding: 16 },
  notice: { marginBottom: 12, padding: 12, borderRadius: 8, border: '1px solid #92400e', background: '#451a03', color: '#fde68a', fontSize: 13, lineHeight: 1.5 },
  frame: { display: 'block', width: '100%', height: 'calc(100vh - 190px)', minHeight: 600, border: '1px solid #334155', borderRadius: 12, background: '#fff' },
  fallback: { display: 'flex', minHeight: '50vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24, border: '1px solid #334155', borderRadius: 12, background: '#0f172a', textAlign: 'center' },
};

export default function BotBuilderPage() {
  const [frameFailed, setFrameFailed] = useState(false);

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <p style={styles.eyebrow}>StarTraders</p>
          <h1 style={styles.title}>Official Deriv Bot Builder</h1>
          <p style={styles.subtitle}>The real Deriv visual bot builder — not a simulated strategy editor.</p>
        </div>
        <a href={OFFICIAL_BOT_URL} target="_blank" rel="noopener noreferrer" style={styles.link}>
          Open Deriv Bot directly ↗
        </a>
      </header>
      <section style={styles.section}>
        <div style={styles.notice}>
          This loads Deriv’s official service. Deriv may block it from being embedded here. If the workspace does not appear below, use “Open Deriv Bot directly” to launch the genuine builder.
        </div>
        {!frameFailed ? (
          <iframe
            title="Official Deriv Bot Builder"
            src={OFFICIAL_BOT_URL}
            style={styles.frame}
            allow="clipboard-read; clipboard-write; fullscreen"
            onError={() => setFrameFailed(true)}
          />
        ) : (
          <div style={styles.fallback}>
            <h2 style={{ margin: 0, fontSize: 20 }}>Open the official builder</h2>
            <p style={{ maxWidth: 620, color: '#cbd5e1', lineHeight: 1.6 }}>
              Deriv prevents its app from loading inside another website. Open the official builder directly to use its real Blockly workspace and trading tools.
            </p>
            <a href={OFFICIAL_BOT_URL} target="_blank" rel="noopener noreferrer" style={styles.link}>
              Launch official Deriv Bot ↗
            </a>
          </div>
        )}
      </section>
    </main>
  );
}
