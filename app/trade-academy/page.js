'use client';

import { useState } from 'react';
import UtilityBar from '@/components/UtilityBar';
import TabNav from '@/components/TabNav';

const LESSONS = [
  {
    title: '1. Trading is a game of losses, not just wins',
    icon: 'M12 2l8 4v6c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-4z',
    body: [
      "Every trader loses trades — even profitable ones. What separates a profitable trader from one who blows their account isn't a magic strategy that always wins. It's making sure that when you're right, you make more than you lose when you're wrong, over a large enough number of trades.",
      "A single win or loss tells you almost nothing. Judge a strategy over at least 30–50 trades, not 3 or 4. If you find yourself changing strategy after every loss, you'll never find out if any strategy actually works.",
    ],
  },
  {
    title: '2. Never risk more than you can afford to lose — per trade AND overall',
    icon: 'M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
    body: [
      'A common rule many experienced traders follow: risk no more than 1–2% of your account balance on a single trade. On a $500 account, that\'s a $5–$10 stake, not $100.',
      "This isn't about being overly cautious — it's math. If you risk 20% per trade, just 5 losses in a row wipes out most of your account, and losing streaks happen to everyone, including good strategies. If you risk 1–2%, the same losing streak barely dents you, and you're still in the game to catch the wins.",
      "This is exactly what the risk calculator on the Manual trader page shows you before you click Buy — use it every time, not just when you remember to.",
    ],
  },
  {
    title: '3. Only trade with money you can genuinely afford to lose',
    icon: 'M3 6h18M3 12h18M3 18h18',
    body: [
      "This applies to CFDs and synthetic indices specifically: they carry real risk of losing your full stake, and past performance never guarantees future results. Never trade with rent money, money set aside for bills, or money borrowed to trade.",
      'If losing the amount in your account would cause you real financial stress, the position size is too big — full stop, regardless of how good the setup looks.',
    ],
  },
  {
    title: '4. Have a plan before you click Buy, not after',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    body: [
      "Before entering a trade, decide: what's my stake, what's my exit if I'm wrong, and what condition made me want to enter in the first place? If you can't answer those three things, you're gambling, not trading.",
      "Emotional decisions — chasing a loss with a bigger stake, doubling down out of frustration — are the single biggest account killer. If you notice yourself increasing stake size specifically because you just lost, that's the moment to stop for the day, not push harder.",
    ],
  },
  {
    title: '5. Start on a demo account, not real funds',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    body: [
      'Deriv gives every account a free virtual/demo balance. Test any strategy there first — including anything you build in the Bot editor — until you\'ve genuinely seen it hold up over dozens of trades, not just a handful.',
      "A strategy that looks good on 5 demo trades can still fail badly on trade 6. Patience during testing is what real risk management looks like in practice, not just in theory.",
    ],
  },
];

export default function TradeAcademyPage() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <>
      <UtilityBar />
      <TabNav />

      <main>
        <div className="section-label">Trade academy</div>
        <p style={{ color: 'var(--text-2)', fontSize: '13.5px', maxWidth: '560px', marginBottom: '22px' }}>
          A short, honest guide to trading well — not a promise of guaranteed profits, because no
          one can honestly promise that. These are the habits that separate traders who last from
          those who don't.
        </p>

        <div>
          {LESSONS.map((lesson, i) => {
            const open = openIndex === i;
            return (
              <div
                key={lesson.title}
                className="academy-card"
                style={{ marginBottom: '12px' }}
              >
                <div
                  className="academy-head"
                  onClick={() => setOpenIndex(open ? -1 : i)}
                >
                  <div className="icon-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d={lesson.icon} />
                    </svg>
                  </div>
                  <h3 style={{ flex: 1 }}>{lesson.title}</h3>
                  <svg
                    className="chev"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    style={{ transform: open ? 'rotate(180deg)' : 'none' }}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
                {open && (
                  <div className="academy-body">
                    {lesson.body.map((p, j) => (
                      <p key={j}>{p}</p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="academy-footer-note">
          Star Traders provides educational content and connects you to your own Deriv account —
          we don't manage your funds or guarantee results. Trading always carries risk of loss.
        </div>
      </main>
    </>
  );
}
