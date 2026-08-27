```jsx
'use client';

import { useEffect, useState } from 'react';
import UtilityBar from '@/components/UtilityBar';
import TabNav from '@/components/TabNav';
import AiFab from '@/components/AiFab';
import { useDeriv } from '@/context/DerivProvider';

const MARKETS = [
  { name: 'Vol 75', price: 6914.82 },
  { name: 'Vol 100', price: 8342.61 },
  { name: 'Vol 25', price: 1553.29 },
  { name: 'Boom 500', price: 12480.41 },
  { name: 'Crash 500', price: 9021.73 },
];

const QUICK_ACTIONS = [
  {
    title: 'Upload Bot',
    description: 'Import an XML bot from your computer.',
    color: 'orange',
    href: null,
  },
  {
    title: 'Free Bots',
    description: 'Browse ready-made trading strategies.',
    color: 'green',
    href: '/free-bots',
  },
  {
    title: 'Bot Editor',
    description: 'Build a custom bot with the visual editor.',
    color: 'purple',
    href: '/bot-builder',
  },
  {
    title: 'Quick Strategy',
    description: 'Start fast with a pre-built strategy template.',
    color: 'yellow',
    href: null,
  },
];

export default function DashboardPage() {
  const { isLoggedIn, balance, activeAccount } = useDeriv();

  const [markets, setMarkets] = useState(MARKETS);

  useEffect(() => {
    const timer = setInterval(() => {
      setMarkets((current) =>
        current.map((market) => {
          const movement = (Math.random() - 0.5) * 2;

          return {
            ...market,
            price: market.price + movement,
          };
        })
      );
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  const accountId =
    activeAccount?.account_id ||
    activeAccount?.loginid ||
    'Trader';

  const balanceText =
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

      <div className="market-ticker">
        <div className="market-ticker-track">
          {[...markets, ...markets].map((market, index) => (
            <div
              className="market-ticker-item"
              key={`${market.name}-${index}`}
            >
              <span className="ticker-name">{market.name}</span>

              <span className="ticker-price">
                {market.price.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>

              <span className="ticker-positive">
                +0.00%
              </span>
            </div>
          ))}
        </div>
      </div>

      <main className="dashboard-content">

        <section className="dashboard-welcome">
          <div className="welcome-content">
            <h1>
              Hello {accountId} <span>👋</span>
            </h1>

            <p>
              “The market rewards patience and punishes impatience.”
            </p>
          </div>
        </section>

        <section className="quick-actions-section">
          <div className="dashboard-section-heading">
            <h2>Quick Actions</h2>
          </div>

          <div className="quick-actions-grid">
            {QUICK_ACTIONS.map((action) => {
              if (action.href) {
                return (
                  <a
                    href={action.href}
                    className={`quick-card ${action.color}`}
                    key={action.title}
                  >
                    <div className="quick-card-arrow">→</div>

                    <div className="quick-card-icon">
                      ✦
                    </div>

                    <h3>{action.title}</h3>

                    <p>{action.description}</p>

                    <div className="quick-card-line" />

                    <span>Open →</span>
                  </a>
                );
              }

              return (
                <button
                  type="button"
                  className={`quick-card ${action.color}`}
                  key={action.title}
                  onClick={() => {
                    alert(
                      `${action.title} is coming soon.`
                    );
                  }}
                >
                  <div className="quick-card-arrow">→</div>

                  <div className="quick-card-icon">
                    ✦
                  </div>

                  <h3>{action.title}</h3>

                  <p>{action.description}</p>

                  <div className="quick-card-line" />

                  <span>Open →</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="partner-card">
          <div>
            <small>PARTNER REFERRAL</small>

            <h2>Master Partner share</h2>

            <p>
              Earn monthly by referring traders to StarTraders.
            </p>
          </div>

          <div className="partner-actions">
            <span>Earn monthly</span>

            <button type="button">
              Show more
            </button>

            <button type="button">
              Refer a partner →
            </button>
          </div>
        </section>

        <section className="account-summary">
          <div>
            <small>ACCOUNT</small>
            <strong>{accountId}</strong>
          </div>

          <div>
            <small>BALANCE</small>
            <strong>{balanceText}</strong>
          </div>
        </section>

      </main>

      <AiFab />

      <div className="dashboard-status">
        <span>
          {isLoggedIn
            ? '● Connected to Deriv'
            : '○ Not connected'}
        </span>
      </div>
    </div>
  );
}
```
