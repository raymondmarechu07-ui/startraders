```jsx
'use client';

import { useEffect, useState } from 'react';
import UtilityBar from '@/components/UtilityBar';
import TabNav from '@/components/TabNav';
import AiFab from '@/components/AiFab';
import RiskDisclaimer from '@/components/RiskDisclaimer';
import { useDeriv } from '@/context/DerivProvider';

const MARKETS = [
  { name: 'Vol 75', base: 6914.82 },
  { name: 'Vol 100', base: 8342.61 },
  { name: 'Vol 25', base: 1553.29 },
  { name: 'Boom 500', base: 12480.41 },
  { name: 'Crash 500', base: 9021.73 },
];

const QUICK_ACTIONS = [
  {
    title: 'Upload Bot',
    description: 'Import an XML bot from your computer.',
    icon: 'M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z',
    accent: 'orange',
  },
  {
    title: 'Free Bots',
    description: 'Browse ready-made trading strategies.',
    icon: 'M5 9h14v11H5zM9 9V6a3 3 0 016 0v3',
    accent: 'green',
    href: '/free-bots',
  },
  {
    title: 'Bot Editor',
    description: 'Build a custom bot with the visual editor.',
    icon: 'M4 4h16v16H4zM8 8h8M8 12h8M8 16h5',
    accent: 'purple',
    href: '/bot-builder',
  },
  {
    title: 'Quick Strategy',
    description: 'Start fast with a pre-built strategy template.',
    icon: 'M13 2L4 14h7l-1 8 9-12h-7l1-8z',
    accent: 'yellow',
  },
];

export default function DashboardPage() {
  const {
    isLoggedIn,
    balance,
    activeAccount,
  } = useDeriv();

  const [markets, setMarkets] = useState(
    MARKETS.map((market) => ({
      ...market,
      price: market.base,
      change: Math.random() * 2 - 1,
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setMarkets((current) =>
        current.map((market) => {
          const movement =
            (Math.random() - 0.5) * market.base * 0.0003;

          return {
            ...market,
            price: market.price + movement,
            change:
              movement >= 0
                ? Math.random() * 1.5
                : -Math.random() * 1.5,
          };
        })
      );
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  const accountId =
    activeAccount?.account_id ||
    activeAccount?.loginid ||
    'Trader';

  const balanceDisplay =
    isLoggedIn && balance
      ? `${Number(balance.balance).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} ${balance.currency}`
      : '—';

  return (
    <div className="star-dashboard">
      <UtilityBar />

      <TabNav />

      {/* Moving DBT-style market strip */}
      <div className="market-ticker">
        <div className="market-ticker-track">
          {[...markets, ...markets].map((market, index) => (
            <div
              className="market-ticker-item"
              key={`${market.name}-${index}`}
            >
              <span className="ticker-name">
                {market.name}
              </span>

              <strong className="ticker-price">
                {market.price.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </strong>

              <span
                className={
                  market.change >= 0
                    ? 'ticker-change positive'
                    : 'ticker-change negative'
                }
              >
                {market.change >= 0 ? '+' : ''}
                {market.change.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <main className="dashboard-content">

        {/* DBT-style welcome section */}
        <section className="dashboard-welcome">
          <div className="welcome-background" />

          <div className="welcome-content">
            <h1>
              Hello {accountId}
              <span className="hello-wave">👋</span>
            </h1>

            <p>
              “The market rewards patience and punishes impatience.”
            </p>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="quick-actions-section">
          <div className="dashboard-section-heading">
            <h2>Quick Actions</h2>
          </div>

          <div className="quick-actions-grid">
            {QUICK_ACTIONS.map((action) => {
              const card = (
                <>
                  <div className={`quick-icon ${action.accent}`}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d={action.icon} />
                    </svg>
                  </div>

                  <div className="quick-arrow">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </div>

                  <h3>{action.title}</h3>

                  <p>{action.description}</p>

                  <div className="quick-divider" />

                  <span className="quick-open">
                    Open →
                  </span>
                </>
              );

              if (action.href) {
                return (
                  <a
                    href={action.href}
                    className={`quick-card ${action.accent}`}
                    key={action.title}
                  >
                    {card}
                  </a>
                );
              }

              return (
                <button
                  type="button"
                  className={`quick-card ${action.accent}`}
                  key={action.title}
                  onClick={() => {
                    alert(
                      `${action.title} will be connected when this feature is ready.`
                    );
                  }}
                >
                  {card}
                </button>
              );
            })}
          </div>
        </section>

        {/* Partner referral section */}
        <section className="partner-share-card">
          <div className="partner-share-content">
            <div className="partner-label">
              PARTNER REFERRAL
            </div>

            <h2>Master Partner share</h2>

            <p>
              Invite traders to StarTraders and earn from your
              partner activity.
            </p>
          </div>

          <div className="partner-share-side">
            <span className="partner-badge">
              Earn monthly
            </span>

            <button type="button" className="partner-more">
              Show more
            </button>

            <button type="button" className="partner-refer">
              Refer a partner →
            </button>
          </div>
        </section>

      </main>

      <RiskDisclaimer />

      <AiFab />

      <div className="dashboard-bottom-status">
        <span className="status-indicator" />
        <span>
          {isLoggedIn
            ? `Connected · ${activeAccount?.account_type === 'demo' ? 'Demo' : 'Real'} account`
            : 'Not connected to Deriv'}
        </span>

        <span className="bottom-balance">
          {balanceDisplay}
        </span>
      </div>
    </div>
  );
}
```
