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

const QUICK_ACTIONS = [
  {
    title: 'Upload Bot',
    description: 'Import an XML bot from your computer.',
    icon: '📁',
    color: 'orange',
  },
  {
    title: 'Free Bots',
    description: 'Browse ready-made trading strategies.',
    icon: '🤖',
    color: 'green',
    href: '/free-bots',
  },
  {
    title: 'Bot Builder',
    description: 'Build a custom strategy with the visual editor.',
    icon: '🧩',
    color: 'purple',
    href: '/bot-builder',
  },
  {
    title: 'Quick Strategy',
    description: 'Start fast with a pre-built strategy template.',
    icon: '⚡',
    color: 'yellow',
  },
];

export default function DashboardPage() {
  const {
    isLoggedIn,
    balance,
    activeAccount,
    status,
  } = useDeriv();

  const [markets, setMarkets] = useState(
    MARKETS.map((market) => ({
      ...market,
      price: market.base,
      change: Math.random() * 2 - 1,
    }))
  );

  const [selectedMarket, setSelectedMarket] = useState('Vol 75');
  const [running, setRunning] = useState(false);

  /*
   * Cosmetic market movement for the dashboard ticker.
   * Replace with the real Deriv tick subscription when connected.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setMarkets((current) =>
        current.map((market) => {
          const movement =
            (Math.random() - 0.5) * market.base * 0.0004;

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

    return () => clearInterval(interval);
  }, []);

  /*
   * Deriv account information
   */
  const accountId =
    activeAccount?.account_id ||
    activeAccount?.loginid ||
    'Trader';

  const balanceAmount =
    isLoggedIn && balance
      ? Number(balance.balance).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : '—';

  const currency =
    isLoggedIn && balance?.currency
      ? balance.currency
      : 'USD';

  const connectionText =
    status === 'connecting'
      ? 'Connecting to Deriv'
      : status === 'error'
      ? 'Deriv connection error'
      : isLoggedIn
      ? 'Connected to Deriv'
      : 'Not connected';

  return (
    <div className="star-dashboard">

      {/* =========================================================
          TOP UTILITY BAR
      ========================================================= */}

      <UtilityBar />

      {/* =========================================================
          MAIN NAVIGATION
      ========================================================= */}

      <TabNav />

      {/* =========================================================
          MOVING MARKET TICKER
      ========================================================= */}

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

      {/* =========================================================
          DASHBOARD CONTENT
      ========================================================= */}

      <main className="dashboard-content">

        {/* =======================================================
            WELCOME / TRADING TERMINAL
        ======================================================= */}

        <section className="dashboard-hero">

          <div className="hero-grid"></div>

          <div className="hero-status">
            <span
              className={
                isLoggedIn
                  ? 'status-dot online'
                  : 'status-dot'
              }
            ></span>

            {connectionText}
          </div>

          <div className="hero-content">

            <div className="eyebrow">
              STARTRADERS / TRADING TERMINAL
            </div>

            <h1>
              Hello {accountId}
              <span className="hello-wave">👋</span>
            </h1>

            <p>
              Your trading workspace for Deriv markets,
              automated strategies, analysis and professional
              trading tools.
            </p>

          </div>

        </section>

        {/* =======================================================
            ACCOUNT STATISTICS
        ======================================================= */}

        <section className="dashboard-stats">

          {/* BALANCE */}

          <div className="stat-card balance-card">

            <div className="stat-heading">
              ACCOUNT BALANCE

              <span className="live-pill">
                LIVE
              </span>
            </div>

            <div className="balance-value">
              {balanceAmount} {currency}
            </div>

            <div className="stat-footer">

              <span>
                {activeAccount?.account_type === 'demo'
                  ? 'Demo Account'
                  : 'Real Account'}
              </span>

              <span className="account-id">
                {accountId}
              </span>

            </div>

          </div>

          {/* TODAY'S P/L */}

          <div className="stat-card">

            <div className="stat-heading">
              TODAY'S P/L
            </div>

            <div className="stat-value positive-value">
              +$0.00
            </div>

            <div className="stat-description">
              No completed trades today
            </div>

          </div>

          {/* WIN RATE */}

          <div className="stat-card">

            <div className="stat-heading">
              WIN RATE
            </div>

            <div className="stat-value">
              —
            </div>

            <div className="stat-description">
              Based on recent trades
            </div>

          </div>

          {/* ACTIVE BOTS */}

          <div className="stat-card">

            <div className="stat-heading">
              ACTIVE BOTS
            </div>

            <div className="stat-value">
              0
            </div>

            <div className="stat-description">
              No strategies running
            </div>

          </div>

        </section>

        {/* =======================================================
            QUICK ACTIONS
        ======================================================= */}

        <section className="quick-actions-section">

          <div className="section-header">

            <div>
              <div className="section-eyebrow">
                QUICK ACTIONS
              </div>

              <h2>
                Start Trading
              </h2>
            </div>

          </div>

          <div className="quick-actions-grid">

            {QUICK_ACTIONS.map((action) => {

              const content = (
                <>
                  <div className={`quick-icon ${action.color}`}>
                    {action.icon}
                  </div>

                  <div className="quick-arrow">
                    →
                  </div>

                  <h3>
                    {action.title}
                  </h3>

                  <p>
                    {action.description}
                  </p>

                  <div className="quick-divider"></div>

                  <span className="quick-open">
                    Open →
                  </span>
                </>
              );

              if (action.href) {
                return (
                  <a
                    href={action.href}
                    className={`quick-card ${action.color}`}
                    key={action.title}
                  >
                    {content}
                  </a>
                );
              }

              return (
                <button
                  className={`quick-card ${action.color}`}
                  key={action.title}
                  onClick={() =>
                    alert(
                      `${action.title} will be connected when this feature is built.`
                    )
                  }
                >
                  {content}
                </button>
              );
            })}

          </div>

        </section>

        {/* =======================================================
            MARKET OVERVIEW
        ======================================================= */}

        <section className="market-overview">

          <div className="section-header">

            <div>

              <div className="section-eyebrow">
                MARKET OVERVIEW
              </div>

              <h2>
                Deriv Markets
              </h2>

            </div>

            <div className="market-live">
              <span></span>
              MARKETS LIVE
            </div>

          </div>

          <div className="market-layout">

            {/* MARKET LIST */}

            <div className="market-list">

              {markets.map((market) => (

                <button
                  key={market.name}
                  className={
                    selectedMarket === market.name
                      ? 'market-row selected'
                      : 'market-row'
                  }
                  onClick={() =>
                    setSelectedMarket(market.name)
                  }
                >

                  <div>

                    <strong>
                      {market.name}
                    </strong>

                    <span>
                      Synthetic Index
                    </span>

                  </div>

                  <div className="market-number">

                    <strong>
                      {market.price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </strong>

                    <span
                      className={
                        market.change >= 0
                          ? 'positive'
                          : 'negative'
                      }
                    >
                      {market.change >= 0 ? '+' : ''}
                      {market.change.toFixed(2)}%
                    </span>

                  </div>

                </button>

              ))}

            </div>

            {/* CHART WORKSPACE */}

            <div className="chart-workspace">

              <div className="chart-header">

                <div>

                  <span>
                    LIVE VIEW
                  </span>

                  <h3>
                    {selectedMarket}
                  </h3>

                </div>

                <button
                  className={
                    running
                      ? 'run-control running'
                      : 'run-control'
                  }
                  onClick={() =>
                    setRunning((value) => !value)
                  }
                >

                  <span>
                    {running ? '■' : '▶'}
                  </span>

                  {running ? 'RUNNING' : 'RUN'}

                </button>

              </div>

              <div className="chart-placeholder">

                <div className="chart-grid"></div>

                <div className="candles">

                  <span className="candle up"></span>
                  <span className="candle down"></span>
                  <span className="candle up"></span>
                  <span className="candle up"></span>
                  <span className="candle down"></span>
                  <span className="candle up"></span>
                  <span className="candle down"></span>
                  <span className="candle up"></span>
                  <span className="candle up"></span>
                  <span className="candle down"></span>

                </div>

                <div className="chart-message">
                  {selectedMarket} live trading workspace
                </div>

              </div>

            </div>

          </div>

        </section>

      </main>

      {/* =========================================================
          AI BUTTON
      ========================================================= */}

      <AiFab />

      {/* =========================================================
          BOTTOM TRADING BAR
      ========================================================= */}

      <div className="bottom-trading-bar">

        <button
          className="bottom-run-button"
          onClick={() =>
            setRunning((value) => !value)
          }
        >
          {running ? '■ STOP' : '▶ RUN'}
        </button>

        <span>
          StarTraders trading workspace
        </span>

      </div>

    </div>
  );
}
