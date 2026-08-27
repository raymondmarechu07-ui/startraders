'use client';

import { useEffect, useState } from 'react';
import UtilityBar from '@/components/UtilityBar';
import TabNav from '@/components/TabNav';
import AiFab from '@/components/AiFab';
import { useDeriv } from '@/context/DerivProvider';

const MARKETS = [
  { name: 'Crash 500', base: 9021.73 },
  { name: 'Vol 25', base: 1553.29 },
  { name: 'Vol 75', base: 6914.82 },
  { name: 'Vol 100', base: 8342.61 },
  { name: 'Boom 500', base: 12480.41 },
];

export default function DashboardPage() {
  const {
    isLoggedIn,
    activeAccount,
    balance,
    status,
  } = useDeriv();

  const [markets, setMarkets] = useState(
    MARKETS.map((market) => ({
      ...market,
      price: market.base,
      change: Math.random() * 2 - 1,
    }))
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setMarkets((current) =>
        current.map((market) => {
          const movement =
            (Math.random() - 0.5) * market.base * 0.0002;

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
    }, 1500);

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
    <div>
      <UtilityBar />

      <TabNav />

      {/* MARKET TICKER */}
      <div className="ticker-strip">
        <div className="ticker-track">
          {[...markets, ...markets].map((market, index) => {
            const positive = market.change >= 0;

            return (
              <div
                className="ticker-item"
                key={`${market.name}-${index}`}
              >
                <span className="t-name">
                  {market.name}
                </span>

                <span
                  className={
                    positive
                      ? 't-price up'
                      : 't-price down'
                  }
                >
                  {market.price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>

                <span
                  className={
                    positive
                      ? 't-arrow up'
                      : 't-arrow down'
                  }
                >
                  {positive ? '▲' : '▼'}
                </span>

                <span
                  className={
                    positive
                      ? 't-price up'
                      : 't-price down'
                  }
                >
                  {positive ? '+' : ''}
                  {market.change.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <main>

        {/* GREETING */}
        <section className="greeting">

          <div className="greeting-bg"></div>

          <div className="section-label">
            STARTRADERS / TRADING TERMINAL
          </div>

          <h1>
            Hello {accountId}{' '}
            <span className="wave">👋</span>
          </h1>

          <p className="quote">
            "Discipline beats intelligence in the long run."
          </p>

        </section>

        {/* ACCOUNT STATS */}
        <section className="stats-row">

          <div className="stat-card">

            <div className="stat-label">
              ACCOUNT BALANCE
            </div>

            <div className="stat-value">
              {balanceText}
            </div>

            <div className="stat-sub">
              {activeAccount?.account_type === 'demo'
                ? 'Demo Account'
                : 'Real Account'}
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-label">
              TODAY'S P/L
            </div>

            <div className="stat-value pos">
              +$0.00
            </div>

            <div className="stat-sub">
              No completed trades today
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-label">
              WIN RATE
            </div>

            <div className="stat-value">
              —
            </div>

            <div className="stat-sub">
              Based on recent trades
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-label">
              ACTIVE BOTS
            </div>

            <div className="stat-value">
              0
            </div>

            <div className="stat-sub">
              No strategies running
            </div>

          </div>

        </section>

        {/* QUICK ACTIONS */}
        <section>

          <div className="section-label">
            QUICK ACTIONS
          </div>

          <div className="quick-grid">

            <button
              className="qa-card"
              style={{ '--qa-color': '#fb7185' }}
              onClick={() =>
                alert('Bot upload will be connected next.')
              }
            >
              <div className="icon-box">
                📁
              </div>

              <div className="arrow-btn">
                →
              </div>

              <h3>
                Upload Bot
              </h3>

              <p>
                Import an XML bot from your computer.
              </p>

              <div className="divider-line"></div>

              <span className="open-link">
                Open →
              </span>
            </button>

            <a
              href="/free-bots"
              className="qa-card"
              style={{ '--qa-color': '#4ade80' }}
            >
              <div className="icon-box">
                🤖
              </div>

              <div className="arrow-btn">
                →
              </div>

              <h3>
                Free Bots
              </h3>

              <p>
                Browse ready-made trading strategies.
              </p>

              <div className="divider-line"></div>

              <span className="open-link">
                Open →
              </span>
            </a>

            <a
              href="/bot-builder"
              className="qa-card"
              style={{ '--qa-color': '#a855f7' }}
            >
              <div className="icon-box">
                🧩
              </div>

              <div className="arrow-btn">
                →
              </div>

              <h3>
                Bot Editor
              </h3>

              <p>
                Build a custom bot with the visual editor.
              </p>

              <div className="divider-line"></div>

              <span className="open-link">
                Open →
              </span>
            </a>

            <button
              className="qa-card"
              style={{ '--qa-color': '#facc15' }}
              onClick={() =>
                alert('Quick Strategy will be connected next.')
              }
            >
              <div className="icon-box">
                ⚡
              </div>

              <div className="arrow-btn">
                →
              </div>

              <h3>
                Quick Strategy
              </h3>

              <p>
                Start fast with a pre-built strategy template.
              </p>

              <div className="divider-line"></div>

              <span className="open-link">
                Open →
              </span>
            </button>

          </div>

        </section>

        {/* PARTNER REFERRAL */}
        <section className="strip-grid">

          <div className="strip-card">

            <h3>
              🤝 Partner Referral
            </h3>

            <p className="empty-note">
              Earn from partners who join Deriv
              through your StarTraders referral link.
            </p>

          </div>

          <div className="strip-card">

            <h3>
              ⚡ Trading Status
            </h3>

            <p className="empty-note">
              {status === 'connected'
                ? 'Connected to Deriv and ready to trade.'
                : status === 'connecting'
                ? 'Connecting to Deriv...'
                : 'Deriv account connection is not active.'}
            </p>

          </div>

        </section>

        {/* MARKET OVERVIEW */}
        <section>

          <div className="section-label">
            <span>
              MARKET OVERVIEW
            </span>

            <span>
              Deriv markets
            </span>
          </div>

          <div className="strip-grid">

            {markets.slice(0, 4).map((market) => {

              const positive = market.change >= 0;

              return (
                <div
                  className="strip-card"
                  key={market.name}
                >

                  <h3>
                    {market.name}
                  </h3>

                  <div className="signal-row">

                    <span className="pair">
                      Price
                    </span>

                    <span>
                      {market.price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>

                  </div>

                  <div className="signal-row">

                    <span className="pair">
                      Movement
                    </span>

                    <span
                      className={
                        positive
                          ? 'tag-buy'
                          : 'tag-sell'
                      }
                    >
                      {positive ? '+' : ''}
                      {market.change.toFixed(2)}%
                    </span>

                  </div>

                </div>
              );
            })}

          </div>

        </section>

      </main>

      <AiFab />

    </div>
  );
}
