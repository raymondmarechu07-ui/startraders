'use client';

import { useEffect, useState } from 'react';
import UtilityBar from '@/components/UtilityBar';
import TabNav from '@/components/TabNav';
import AiFab from '@/components/AiFab';
import { useDeriv } from '@/context/DerivProvider';

const TICKER_MARKETS = [
  { name: 'Vol 75', base: 6914 },
  { name: 'Vol 100', base: 8342 },
  { name: 'Boom 500', base: 12480 },
  { name: 'Crash 500', base: 9021 },
  { name: 'Vol 25', base: 1553 },
];

const QUICK_ACTIONS = [
  {
    color: '#fb7185',
    title: 'Upload bot',
    desc: 'Import an XML bot from your computer.',
    icon: 'M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z',
    msg: 'Upload a bot file (.xml) — wired up once bot import is built.',
  },
  {
    color: '#4ade80',
    title: 'Free bots',
    desc: 'Browse ready-made trading strategies.',
    href: '/free-bots',
    icon: 'M5 9h14v11H5zM9 9V6a3 3 0 016 0v3',
  },
  {
    color: '#a855f7',
    title: 'Bot editor',
    desc: 'Build a custom bot with the visual editor.',
    href: '/bot-builder',
    icon: 'M10 3h4v2.5a1.5 1.5 0 003 0V3h1a2 2 0 012 2v1h-2.5a1.5 1.5 0 000 3H20v4h-2.5a1.5 1.5 0 000 3H20v1a2 2 0 01-2 2h-1v-2.5a1.5 1.5 0 00-3 0V21h-4v-2.5a1.5 1.5 0 00-3 0V21H6a2 2 0 01-2-2v-1h2.5a1.5 1.5 0 000-3H4v-4h2.5a1.5 1.5 0 000-3H4V6a2 2 0 012-2h1v2.5a1.5 1.5 0 003 0V4z',
  },
  {
    color: '#facc15',
    title: 'Quick strategy',
    desc: 'Start fast with a pre-built strategy template.',
    icon: 'M13 2L4 14h7l-1 8 9-12h-7l1-8z',
    msg: 'Start fast with a pre-built strategy template — wired up once templates are built.',
  },
];

export default function DashboardPage() {
  const { isLoggedIn, balance, activeAccount } = useDeriv();
  const [quickActionsOpen, setQuickActionsOpen] = useState(true);
  const [running, setRunning] = useState(false);
  const [fastSpeed, setFastSpeed] = useState(false);
  const [ticker, setTicker] = useState(
    TICKER_MARKETS.map((m) => ({ ...m, price: m.base, up: true }))
  );

  // Placeholder tick animation for the market strip — cosmetic only until
  // Phase 1 wires this to real Deriv price streams.
  useEffect(() => {
    const interval = setInterval(() => {
      setTicker((prev) =>
        prev.map((m) => {
          const delta = (Math.random() - 0.5) * (m.base * 0.002);
          return { ...m, price: m.price + delta, up: delta >= 0 };
        })
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const balanceDisplay = isLoggedIn && balance
    ? `${Number(balance.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${balance.currency}`
    : '—';

  return (
    <>
      <UtilityBar />
      <TabNav />

      <div className="ticker-strip">
        <div className="ticker-track">
          {[...ticker, ...ticker].map((m, i) => (
            <div className="ticker-item" key={m.name + i}>
              <span className="t-name">{m.name}</span>
              <span className={m.up ? 't-price up' : 't-price down'}>
                {m.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={m.up ? 't-arrow up' : 't-arrow down'}>{m.up ? '▲' : '▼'}</span>
            </div>
          ))}
        </div>
      </div>

      <main>
        <div className="greeting">
          <div className="greeting-bg"></div>
          <h1>
            Hello ROT90106530 <span className="wave">👋</span>
          </h1>
          <div className="quote">&quot;The market rewards patience and punishes impatience.&quot;</div>
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Balance</div>
            <div className="stat-value">{balanceDisplay}</div>
            <div className="stat-sub">{activeAccount?.account_type === 'demo' ? 'Demo account' : isLoggedIn ? 'Real account' : 'Not connected'}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Today&apos;s P/L</div>
            <div className="stat-value pos">+$0.00</div>
            <div className="stat-sub">No trades yet today</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Win rate</div>
            <div className="stat-value">—</div>
            <div className="stat-sub">Based on last 20 trades</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active bots</div>
            <div className="stat-value">0</div>
            <div className="stat-sub">Nothing running</div>
          </div>
        </div>

        <div className="section-label">Quick actions</div>
        {quickActionsOpen && (
          <div className="quick-grid">
            {QUICK_ACTIONS.map((qa) => (
              <div
                key={qa.title}
                className="qa-card"
                style={{ '--qa-color': qa.color }}
                onClick={() => {
                  if (qa.href) window.location.href = qa.href;
                  else alert(qa.msg);
                }}
              >
                <div className="arrow-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </div>
                <div className="icon-box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d={qa.icon} />
                  </svg>
                </div>
                <h3>{qa.title}</h3>
                <p>{qa.desc}</p>
                <div className="divider-line"></div>
                <div className="open-link">Open →</div>
              </div>
            ))}
          </div>
        )}

        <div className="collapse-arrow" onClick={() => setQuickActionsOpen((v) => !v)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d={quickActionsOpen ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'} />
          </svg>
        </div>
      </main>

      <AiFab />

      <div className="run-bar">
        <button
          className="run-btn"
          onClick={() => {
            setRunning((r) => !r);
            alert(
              'This is where the bot actually starts running once live pricing and Deriv API calls are wired in.'
            );
          }}
        >
          <svg viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          Run
        </button>
        <div className="speed-bar">
          <span>{fastSpeed ? 'Fast speed' : 'Normal speed'}</span>
          <div
            className={fastSpeed ? 'toggle on' : 'toggle'}
            onClick={() => setFastSpeed((v) => !v)}
          >
            <div className="knob"></div>
          </div>
        </div>
      </div>
    </>
  );
}
