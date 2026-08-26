'use client';

import { useState } from 'react';
import UtilityBar from '@/components/UtilityBar';
import TabNav from '@/components/TabNav';

const BOTS = [
  {
    name: 'Infinity Algo',
    desc: 'Advanced automated trading strategy: Infinity Algo — professional-grade bot optimized for consistent performance, risk management, and automated trade execution.',
    cat: 'automated',
    icon: 'M13 2L4 14h7l-1 8 9-12h-7l1-8z',
  },
  {
    name: 'Steady Climb',
    desc: 'A low-risk fixed-stake bot that trades Rise/Fall on gentle trend confirmation, built for slow and steady account growth.',
    cat: 'normal',
    icon: 'M4 8h16v12H4zM9 8V5a3 3 0 016 0v3M9 14a1 1 0 100 2 1 1 0 000-2zM15 14a1 1 0 100 2 1 1 0 000-2z',
  },
  {
    name: 'Digit Hunter',
    desc: 'Scans digit distribution on Volatility indices and fires Match/Differ trades when one digit clearly leads the pack.',
    cat: 'automated',
    icon: 'M13 2L4 14h7l-1 8 9-12h-7l1-8z',
  },
  {
    name: 'Even Guard',
    desc: 'Trades against long even/odd streaks with a capped martingale, stopping automatically once the daily loss limit is hit.',
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
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
            👑 All
          </button>
          <button className={filter === 'automated' ? 'active' : ''} onClick={() => setFilter('automated')}>
            ⚡ Automated
          </button>
          <button className={filter === 'normal' ? 'active' : ''} onClick={() => setFilter('normal')}>
            🤖 Normal
          </button>
        </div>

        <div>
          {visible.map((bot) => (
            <div className="bot-card" key={bot.name}>
              {bot.cat === 'automated' && <div className="auto-badge">AUTO</div>}
              <div className="icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d={bot.icon} />
                </svg>
              </div>
              <h3>{bot.name}</h3>
              <p>{bot.desc}</p>
              <button
                className="run-bot-btn"
                onClick={() =>
                  alert(
                    `This is where ${bot.name} actually starts running once live pricing and Deriv API calls are wired in.`
                  )
                }
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
                </svg>
                Run bot
              </button>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
