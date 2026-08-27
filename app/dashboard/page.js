```jsx
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
    title: 'Bot Builder',
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

export default function DashboardPage() {
  const { activeAccount } = useDeriv();

  const [markets, setMarkets] = useState(
    MARKETS.map((market) => ({
      ...market,
      price: market.base,
      change: 0,
    }))
  );

  const [selectedMarket, setSelectedMarket] = useState('Vol 75');
  const [running, setRunning] = useState(false);
  const [riskOpen, setRiskOpen] = useState(false);

  /*
   * Keep the existing market-preview functionality.
   * This is cosmetic until an actual tick subscription is connected
   * to these market symbols.
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

  const accountId =
    activeAccount?.account_id ||
    activeAccount?.loginid ||
    'Trader';

  const handleQuickAction = (action) => {
    if (action === 'upload') {
      alert('Upload Bot will be connected to the XML bot uploader.');
      return;
    }

    if (action === 'strategy') {
      alert(
        'Quick Strategy will open the pre-built strategy selector.'
      );
    }
  };

  return (
    <div className="star-dashboard">
      {/* =========================================================
          EXISTING STARTRADERS HEADER
          ========================================================= */}
      <UtilityBar />
      <TabNav />

      {/* =========================================================
          DASHBOARD MAIN AREA
          ========================================================= */}
      <main className="dashboard-content">

        {/* =======================================================
            DBTRADERS-STYLE WELCOME HERO
            No connection status.
            No balance.
            No P/L.
            No win rate.
            No active bots.
            ======================================================= */}
        <section className="dashboard-hero">
          <div className="hero-grid" aria-hidden="true"></div>

          <div className="hero-content">
            <h1>
              Hello {accountId}
              <span className="hello-wave" aria-hidden="true">
                👋
              </span>
            </h1>

            <p className="hero-quote">
              "Discipline beats intelligence in the long run."
            </p>
          </div>
        </section>

        {/* =======================================================
            QUICK ACTIONS
            Matches the DBTraders reference:
            four comfortable cards in one row on desktop.
            ======================================================= */}
        <section className="quick-actions-section">
          <div className="quick-actions-heading">
            <span></span>
            <h2>QUICK ACTIONS</h2>
            <span></span>
          </div>

          <div className="quick-actions-grid">
            {QUICK_ACTIONS.map((action) => {
              const content = (
                <>
                  <div className={`quick-icon ${action.color}`}>
                    <span aria-hidden="true">{action.icon}</span>
                  </div>

                  <div
                    className="quick-arrow"
                    aria-hidden="true"
                  >
                    →
                  </div>

                  <h3>{action.title}</h3>

                  <p>{action.description}</p>

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
                  onClick={() => handleQuickAction(action.action)}
                >
                  {content}
                </button>
              );
            })}
          </div>
        </section>

        {/* =======================================================
            PARTNER REFERRAL
            Matches the DBTraders reference section.
            ======================================================= */}
        <section className="partner-section">
          <div className="partner-card">
            <div className="partner-copy">
              <div className="partner-eyebrow">
                PARTNER REFERRAL
              </div>

              <h2>Master Partner share</h2>

              <p>
                Earn from partners who join Deriv through your
                Master Partner referral link.
              </p>
            </div>

            <div className="partner-badge">
              Earn monthly
            </div>

            <div className="partner-actions">
              <button type="button" className="partner-show">
                Show more ↓
              </button>

              <button type="button" className="partner-refer">
                Refer a partner →
              </button>
            </div>
          </div>
        </section>

        {/* =======================================================
            MARKET WORKSPACE
            Preserved from the previous dashboard so existing
            dashboard functionality is not simply thrown away.
            It sits below the DBTraders-style top layout.
            ======================================================= */}
        <section className="market-overview">
          <div className="market-section-heading">
            <div>
              <div className="section-eyebrow">
                MARKET OVERVIEW
              </div>

              <h2>Deriv Markets</h2>
            </div>

            <div className="market-live">
              <span></span>
              MARKETS LIVE
            </div>
          </div>

          <div className="market-layout">
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
                  <div>
                    <strong>{market.name}</strong>
                    <span>Synthetic Index</span>
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

            <div className="chart-workspace">
              <div className="chart-header">
                <div>
                  <span>LIVE VIEW</span>
                  <h3>{selectedMarket}</h3>
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

                <div className="candles" aria-hidden="true">
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
          FLOATING RISK DISCLAIMER
          ========================================================= */}
      <div className="floating-risk">
        <button
          type="button"
          className="risk-disclaimer-button"
          aria-expanded={riskOpen}
          aria-controls="dashboard-risk-panel"
          onClick={() => setRiskOpen((value) => !value)}
        >
          <span className="risk-warning-icon" aria-hidden="true">
            !
          </span>
          Risk Disclaimer
        </button>

        {riskOpen && (
          <section
            id="dashboard-risk-panel"
            className="dashboard-risk-panel"
            aria-labelledby="dashboard-risk-heading"
          >
            <div className="dashboard-risk-header">
              <div className="dashboard-risk-icon">
                !
              </div>

              <h2 id="dashboard-risk-heading">
                Risk Disclaimer
              </h2>

              <button
                type="button"
                className="risk-close"
                aria-label="Close risk disclaimer"
                onClick={() => setRiskOpen(false)}
              >
                ×
              </button>
            </div>

            <p className="dashboard-risk-intro">
              Trading financial products involves significant
              risk and may not be suitable for everyone. Please
              understand the risks before trading.
            </p>

            <ul className="dashboard-risk-list">
              {RISK_POINTS.map((point) => (
                <li key={point}>
                  <span aria-hidden="true">!</span>
                  <p>{point}</p>
                </li>
              ))}
            </ul>

            <div className="dashboard-risk-note">
              Star Traders does not provide financial advice.
              Make sure you understand the product, the risks
              involved, and the amount you are prepared to lose
              before trading.
            </div>
          </section>
        )}
      </div>

      {/* =========================================================
          EXISTING AI BUTTON
          ========================================================= */}
      <AiFab />

      {/* =========================================================
          EXISTING BOTTOM TRADING BAR
          ========================================================= */}
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

        <span>
          StarTraders trading workspace
        </span>
      </div>
    </div>
  );
}
```
