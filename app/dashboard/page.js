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
    action: 'upload',
  },
  {
    title: 'Free Bots',
    description: 'Browse ready-made trading strategies.',
    icon: '🤖',
    color: 'green',
    href: '/free-bots',
  },
  {
    title: 'Bot Editor',
    description: 'Build a custom bot with the visual editor.',
    icon: '🧩',
    color: 'purple',
    href: '/bot-builder',
  },
  {
    title: 'Quick Strategy',
    description: 'Start fast with a pre-built strategy template.',
    icon: '⚡',
    color: 'yellow',
    action: 'strategy',
  },
];

const RISK_POINTS = [
  'You may lose some or all of the funds you trade.',
  'Past performance, signals, strategies, and historical results do not guarantee future results.',
  'Leverage can increase both potential profits and potential losses.',
  'Never trade with money you cannot afford to lose.',
];

const TRADING_ADVICE = [
  'Discipline beats intelligence in the long run. Protect your capital first, and the profits follow. Small, consistent wins compound over time. Never let one trade define your whole strategy.',
  'The market rewards patience over impulse. Wait for your setup instead of chasing every move. A missed trade costs nothing — a bad one can cost everything. Let the plan lead, not emotion.',
  'Risk management is what separates traders from gamblers. Always know your exit before you enter. Cutting losses early keeps you in the game longer. Survival is the real edge.',
  'Every professional trader was once a beginner who kept showing up. Review your trades, learn from the losses, and repeat what works. Growth happens one session at a time. Stay consistent, stay curious.',
  'Volatility is opportunity for those who are prepared. Trade the plan you built when you were calm, not the one your emotions write in the moment. Confidence comes from preparation, not luck.',
];

export default function DashboardPage() {
  const { activeAccount } = useDeriv();

  const [markets, setMarkets] = useState(
    MARKETS.map((market) => ({
      ...market,
      price: market.base,
      change: Math.random() * 2 - 1,
    }))
  );

  const [selectedMarket, setSelectedMarket] = useState('Vol 75');
  const [running, setRunning] = useState(false);
  const [riskOpen, setRiskOpen] = useState(false);
  const [adviceIndex, setAdviceIndex] = useState(0);
  const [execSpeed, setExecSpeed] = useState('normal');
  const [clock, setClock] = useState('');

  useEffect(() => {
    function tick() {
      const now = new Date();
      const gmt = now.toISOString().slice(0, 19).replace('T', ' ');
      setClock(`${gmt} GMT`);
    }
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const accountId =
    activeAccount?.account_id ||
    activeAccount?.loginid ||
    'Trader';

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

  useEffect(() => {
    const interval = setInterval(() => {
      setAdviceIndex((i) => (i + 1) % TRADING_ADVICE.length);
    }, 9000);

    return () => clearInterval(interval);
  }, []);

  const handleQuickAction = (action) => {
    if (action === 'upload') {
      alert(
        'Upload Bot will be connected to the bot upload system when that feature is enabled.'
      );
      return;
    }

    if (action === 'strategy') {
      alert(
        'Quick Strategy will be connected to the strategy templates when that feature is enabled.'
      );
    }
  };

  return (
    <div className="star-dashboard">

      {/* TOP UTILITY BAR */}
      <UtilityBar />

      {/* MAIN NAVIGATION */}
      <TabNav />

      {/* MARKET TICKER */}
      <div className="market-ticker">
        <div className="market-ticker-track">
          {Array.from({ length: 6 }).flatMap(() => markets).map((market, index) => (
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

      {/* MAIN DASHBOARD */}
      <main className="dashboard-content">

        {/* WELCOME HERO */}
        <section className="dashboard-hero">

          <div
            className="hero-grid"
            aria-hidden="true"
          ></div>

          <div className="hero-content">

            <div className="eyebrow orange-accent">
              STARTRADERS
            </div>

            <h1>
              Hello {accountId}
              <span className="hello-wave">👋</span>
            </h1>

            <p className="hero-quote" key={adviceIndex}>
              "{TRADING_ADVICE[adviceIndex]}"
            </p>

          </div>

        </section>

        {/* QUICK ACTIONS */}
        <section className="quick-actions-section">

          <div className="quick-section-heading">
            <span></span>

            <div className="orange-accent">
              QUICK ACTIONS
            </div>

            <span></span>
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

                  <h3 className="orange-accent">
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
                  type="button"
                  className={`quick-card ${action.color}`}
                  key={action.title}
                  onClick={() =>
                    handleQuickAction(action.action)
                  }
                >
                  {content}
                </button>
              );
            })}

          </div>

        </section>

        {/* MARKET OVERVIEW */}
        <section className="market-overview">

          <div className="section-heading-row">

            <div>

              <div className="section-eyebrow orange-accent">
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
                  type="button"
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

                  <div className="market-row-name">

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

                  <span className="orange-accent">
                    LIVE VIEW
                  </span>

                  <h3>
                    {selectedMarket}
                  </h3>

                </div>

                <button
                  type="button"
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

                <div
                  className="chart-grid"
                  aria-hidden="true"
                ></div>

                <div
                  className="candles"
                  aria-hidden="true"
                >
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
                  {selectedMarket} trading workspace
                </div>

              </div>

            </div>

          </div>

        </section>

        {/* RISK DISCLAIMER */}
        {riskOpen && (
          <section
            id="risk-disclaimer"
            className="risk-disclaimer-section"
            aria-labelledby="risk-disclaimer-heading"
          >

            <div className="risk-disclaimer-card">

              <div className="risk-disclaimer-header">

                <div className="risk-disclaimer-icon">

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    <path d="M12 9v4M12 17h.01" />
                  </svg>

                </div>

                <div>

                  <div className="risk-label orange-accent">
                    IMPORTANT
                  </div>

                  <h2 id="risk-disclaimer-heading">
                    Risk Disclaimer
                  </h2>

                </div>

                <button
                  type="button"
                  className="risk-close"
                  onClick={() => setRiskOpen(false)}
                  aria-label="Close risk disclaimer"
                >
                  ×
                </button>

              </div>

              <p className="risk-intro">
                Trading financial products involves significant
                risk and may not be suitable for everyone.
                Please understand the risks before trading.
              </p>

              <ul className="risk-list">

                {RISK_POINTS.map((point) => (
                  <li key={point}>

                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                      <path d="M12 9v4M12 17h.01" />
                    </svg>

                    <span>
                      {point}
                    </span>

                  </li>
                ))}

              </ul>

              <div className="risk-divider"></div>

              <p className="risk-note">
                <strong>Important:</strong> StarTraders provides
                trading tools, analysis and strategy functionality.
                Trading decisions remain the responsibility of the user.
              </p>

              <div className="risk-ack">
                Trading involves risk. Only trade with funds you
                can afford to lose.
              </div>

            </div>

          </section>
        )}

      </main>

      {/* FLOATING AI */}
      <AiFab />

      {/* FLOATING RISK DISCLAIMER BUTTON */}
      <button
        type="button"
        className={
          riskOpen
            ? 'floating-risk-button open'
            : 'floating-risk-button'
        }
        onClick={() => {
          setRiskOpen((value) => !value);

          if (!riskOpen) {
            setTimeout(() => {
              document
                .getElementById('risk-disclaimer')
                ?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center',
                });
            }, 50);
          }
        }}
        aria-expanded={riskOpen}
        aria-controls="risk-disclaimer"
      >

        <span className="floating-risk-symbol">
          !
        </span>

        <span>
          Risk Disclaimer
        </span>

      </button>

      {/* BOTTOM TRADING BAR */}
      <div className="bottom-trading-bar">

        <button
          type="button"
          className="bottom-run-button"
          onClick={() =>
            setRunning((value) => !value)
          }
        >
          {running ? '■ STOP' : '▶ RUN'}
        </button>

        <div className="exec-speed">
          <span>Execution Speed</span>
          <select
            value={execSpeed}
            onChange={(e) => setExecSpeed(e.target.value)}
          >
            <option value="normal">NORMAL SPEED</option>
            <option value="fast">FAST</option>
            <option value="turbo">TURBO</option>
          </select>
        </div>

        <span className="workspace-label">
          StarTraders trading workspace
        </span>

        <span className="live-clock">
          {clock}
        </span>

      </div>

    </div>
  );
}
