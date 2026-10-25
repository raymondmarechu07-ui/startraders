'use client';

import { useState } from 'react';
import UtilityBar from '@/components/UtilityBar';
import TabNav from '@/components/TabNav';

const BOTS = [
  {
    name: 'Infinity Algo',
    desc: 'Strategy idea: define entry rules, stake limits, and a stop condition in Deriv Bot before running it. This card is not a prebuilt or performance-tested bot.',
    cat: 'automated',
    icon: 'M13 2L4 14h7l-1 8 9-12h-7l1-8z',
  },
  {
    name: 'Steady Climb',
    desc: 'Strategy idea: a fixed-stake Rise/Fall approach. It is not guaranteed to be low-risk or profitable; configure and test the rules yourself first.',
    cat: 'normal',
    icon: 'M4 8h16v12H4zM9 8V5a3 3 0 016 0v3M9 14a1 1 0 100 2 1 1 0 000-2zM15 14a1 1 0 100 2 1 1 0 000-2z',
  },
  {
    name: 'Digit Hunter',
    desc: 'Strategy idea: inspect last-digit outcomes before deciding whether to use a digit contract. Recent digit patterns do not guarantee future results.',
    cat: 'automated',
    icon: 'M13 2L4 14h7l-1 8 9-12h-7l1-8z',
  },
  {
    name: 'Even Guard',
    desc: 'Strategy idea: even/odd digit contracts with an explicit maximum-loss rule. No martingale or loss-limit automation is implemented in this card.',
    cat: 'normal',
    icon: 'M4 8h16v12H4zM9 8V5a3 3 0 016 0v3M9 14a1 1 0 100 2 1 1 0 000-2zM15 14a1 1 0 100 2 1 1 0 000-2z',
  },
];

export default function FreeBotsPage() {
  const [filter, setFilter] = useState('all');
  const visible = filter === 'all' ? BOTS : BOTS.filter((b) => b.cat === filter);

  return (
    <>
      <UtilityBar />
      <TabNav />
      <main>
        <div className="filter-row">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>👑 All</button>
          <button className={filter === 'automated' ? 'active' : ''} onClick={() => setFilter('automated')}>⚡ Automated</button>
          <button className={filter === 'normal' ? 'active' : ''} onClick={() => setFilter('normal')}>🤖 Normal</button>
        </div>
        <p style={{ margin: '12px 0 20px' }}>
          These are strategy ideas, not prebuilt runnable bots. Use the official Deriv Bot editor to create a strategy, test it on a demo account, and verify the selected account before trading.
        </p>
        <div>
          {visible.map((bot) => (
            <div className="bot-card" key={bot.name}>
              {bot.cat === 'automated' && <div className="auto-badge">IDEA</div>}
              <div className="icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d={bot.icon} />
                </svg>
              </div>
              <h3>{bot.name}</h3>
              <p>{bot.desc}</p>
              <a className="run-bot-btn" href="https://bot.deriv.com/" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
                </svg>
                Open Deriv Bot
              </a>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
