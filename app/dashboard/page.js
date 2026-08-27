'use client';

import { useEffect, useState } from 'react';
import UtilityBar from '@/components/UtilityBar';
import TabNav from '@/components/TabNav';
import AiFab from '@/components/AiFab';
import { useDeriv } from '@/context/DerivProvider';

const MARKETS = [
  { name: 'Volatility 75', short: 'Vol 75', value: '6,914.28', change: '+0.42%', positive: true },
  { name: 'Volatility 100', short: 'Vol 100', value: '8,342.61', change: '+0.18%', positive: true },
  { name: 'Boom 500', short: 'Boom 500', value: '12,480.90', change: '-0.31%', positive: false },
  { name: 'Crash 500', short: 'Crash 500', value: '9,021.44', change: '+0.27%', positive: true },
];

const TOOLS = [
  {
    title: 'Bot Builder',
    description: 'Create and customize automated trading strategies.',
    href: '/bot-builder',
    icon: '⚙',
  },
  {
    title: 'Free Bots',
    description: 'Explore ready-made strategies and trading bots.',
    href: '/free-bots',
    icon: '✦',
  },
  {
    title: 'Trade Academy',
    description: 'Learn trading concepts, strategies and risk management.',
    href: '/trade-academy',
    icon: '▣',
  },
  {
    title: 'Manual Trader',
    description: 'Trade directly using the StarTraders trading workspace.',
    href: '/manual-trader',
    icon: '⌁',
  },
  {
    title: 'Analysis Tool',
    description: 'Study market conditions before making a decision.',
    href: '/analysis-tool',
    icon: '⌕',
  },
  {
    title: 'Speedbot',
    description: 'Access fast strategy automation tools.',
    href: '/speedbot',
    icon: 'ϟ',
  },
];

const ACTIVITY = [
  {
    title: 'Markets',
    text: 'Explore live market opportunities',
    icon: '◉',
  },
  {
    title: 'Automation',
    text: 'Build and manage trading strategies',
    icon: '◇',
  },
  {
    title: 'Analysis',
    text: 'Understand market behaviour',
    icon: '⌁',
  },
];

export default function DashboardPage() {
  const { isLoggedIn, balance, activeAccount, status } = useDeriv();

  const [selectedMarket, setSelectedMarket] = useState(MARKETS[0]);
  const [time, setTime] = useState('--:--:--');

  useEffect(() => {
    const updateClock = () => {
      setTime(
        new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };

    updateClock();

    const interval = setInterval(updateClock, 1000);

    return () => clearInterval(interval);
  }, []);

  const balanceDisplay =
    isLoggedIn && balance
      ? `${Number(balance.balance).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} ${balance.currency}`
      : '—';

  const accountType =
    activeAccount?.account_type === 'demo'
      ? 'Demo Account'
      : isLoggedIn
        ? 'Real Account'
        : 'Not Connected';

  return (
    <>
      <UtilityBar />
      <TabNav />

      <div className="st-dashboard">

        {/* MARKET TICKER */}
        <div className="st-market-strip">
          <div className="st-market-track">
            {[...MARKETS, ...MARKETS].map((market, index) => (
              <button
                key={`${market.name}-${index}`}
                className="st-market-ticker"
                onClick={() => setSelectedMarket(market)}
              >
                <span className="st-market-name">{market.short}</span>

                <span className="st-market-price">
                  {market.value}
                </span>

                <span
                  className={
                    market.positive
                      ? 'st-market-change positive'
                      : 'st-market-change negative'
                  }
                >
                  {market.change}
                </span>
              </button>
            ))}
          </div>
        </div>

        <main className="st-dashboard-main">

          {/* HEADER */}
          <section className="st-dashboard-heading">
            <div>
              <div className="st-eyebrow">
                STARTRADERS / DASHBOARD
              </div>

              <h1>
                Welcome back
                <span className="st-heading-dot">.</span>
              </h1>

              <p>
                Your trading workspace is ready. Explore markets,
                analyze opportunities and manage your strategies.
              </p>
            </div>

            <div className="st-session-status">
              <div className="st-status-dot"></div>

              <div>
                <span className="st-status-title">
                  {status === 'connecting'
                    ? 'Connecting'
                    : isLoggedIn
                      ? 'Connected to Deriv'
                      : 'Not connected'}
                </span>

                <span className="st-status-time">
                  {time}
                </span>
              </div>
            </div>
          </section>

          {/* ACCOUNT OVERVIEW */}
          <section className="st-overview-grid">

            <div className="st-account-card st-feature-card">
              <div className="st-card-top">
                <span className="st-card-label">
                  ACCOUNT BALANCE
                </span>

                <span className="st-live-badge">
                  LIVE
                </span>
              </div>

              <div className="st-balance">
                {balanceDisplay}
              </div>

              <div className="st-account-row">
                <span>{accountType}</span>

                <span className="st-account-id">
                  {activeAccount?.account_id || '—'}
                </span>
              </div>

              <div className="st-card-glow"></div>
            </div>

            <div className="st-small-card">
              <span className="st-card-label">
                TODAY'S P/L
              </span>

              <strong className="st-positive-value">
                +$0.00
              </strong>

              <span className="st-muted">
                No completed trades
              </span>
            </div>

            <div className="st-small-card">
              <span className="st-card-label">
                WIN RATE
              </span>

              <strong>
                —
              </strong>

              <span className="st-muted">
                Based on trading history
              </span>
            </div>

            <div className="st-small-card">
              <span className="st-card-label">
                ACTIVE BOTS
              </span>

              <strong>
                0
              </strong>

              <span className="st-muted">
                No bots running
              </span>
            </div>

          </section>

          {/* MARKET WORKSPACE */}
          <section className="st-workspace">

            <div className="st-workspace-header">
              <div>
                <span className="st-section-kicker">
                  MARKET OVERVIEW
                </span>

                <h2>
                  {selectedMarket.name}
                </h2>
              </div>

              <div className="st-market-selector">
                {MARKETS.map((market) => (
                  <button
                    key={market.name}
                    className={
                      selectedMarket.name === market.name
                        ? 'selected'
                        : ''
                    }
                    onClick={() => setSelectedMarket(market)}
                  >
                    {market.short}
                  </button>
                ))}
              </div>
            </div>

            <div className="st-chart-placeholder">

              <div className="st-chart-grid"></div>

              <svg
                className="st-chart-line"
                viewBox="0 0 1000 300"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient
                    id="starChartGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop offset="0%" stopColor="#2dd4bf" />
                    <stop offset="80%" stopColor="#5eead4" />
                    <stop offset="100%" stopColor="#fb923c" />
                  </linearGradient>
                </defs>

                <path
                  d="M0 230
                     C70 220 85 180 145 195
                     S220 230 270 170
                     S350 135 395 165
                     S470 230 525 145
                     S600 120 650 145
                     S730 185 775 110
                     S850 125 900 85
                     S960 100 1000 55"
                  fill="none"
                  stroke="url(#starChartGradient)"
                  strokeWidth="3"
                  vectorEffect="non-scaling-stroke"
                />

                <path
                  d="M0 230
                     C70 220 85 180 145 195
                     S220 230 270 170
                     S350 135 395 165
                     S470 230 525 145
                     S600 120 650 145
                     S730 185 775 110
                     S850 125 900 85
                     S960 100 1000 55
                     L1000 300
                     L0 300 Z"
                  fill="rgba(45,212,191,0.06)"
                />
              </svg>

              <div className="st-chart-price">
                <strong>{selectedMarket.value}</strong>

                <span
                  className={
                    selectedMarket.positive
                      ? 'positive'
                      : 'negative'
                  }
                >
                  {selectedMarket.change}
                </span>
              </div>

              <div className="st-chart-note">
                Live chart integration
              </div>

            </div>

            <div className="st-timeframes">
              {['1m', '5m', '15m', '30m', '1H', '4H', '1D'].map(
                (frame, index) => (
                  <button
                    key={frame}
                    className={index === 2 ? 'active' : ''}
                  >
                    {frame}
                  </button>
                )
              )}
            </div>

          </section>

          {/* QUICK TOOLS */}
          <section className="st-section">

            <div className="st-section-heading">
              <div>
                <span className="st-section-kicker">
                  TRADING TOOLS
                </span>

                <h2>
                  Your workspace
                </h2>
              </div>

              <span className="st-section-count">
                {TOOLS.length} tools
              </span>
            </div>

            <div className="st-tools-grid">

              {TOOLS.map((tool) => (
                <button
                  key={tool.title}
                  className="st-tool-card"
                  onClick={() => {
                    if (tool.href) {
                      window.location.href = tool.href;
                    }
                  }}
                >
                  <span className="st-tool-icon">
                    {tool.icon}
                  </span>

                  <span className="st-tool-content">
                    <strong>{tool.title}</strong>

                    <span>
                      {tool.description}
                    </span>
                  </span>

                  <span className="st-tool-arrow">
                    →
                  </span>
                </button>
              ))}

            </div>

          </section>

          {/* LOWER DASHBOARD */}
          <section className="st-lower-grid">

            <div className="st-panel">

              <div className="st-panel-heading">
                <div>
                  <span className="st-section-kicker">
                    GET STARTED
                  </span>

                  <h3>
                    Build your trading setup
                  </h3>
                </div>
              </div>

              <div className="st-activity-list">

                {ACTIVITY.map((item) => (
                  <div
                    className="st-activity-item"
                    key={item.title}
                  >
                    <span className="st-activity-icon">
                      {item.icon}
                    </span>

                    <div>
                      <strong>{item.title}</strong>
                      <span>{item.text}</span>
                    </div>

                    <span className="st-activity-arrow">
                      →
                    </span>
                  </div>
                ))}

              </div>

            </div>

            <div className="st-panel st-security-panel">

              <span className="st-section-kicker">
                ACCOUNT STATUS
              </span>

              <div className="st-security-icon">
                ✓
              </div>

              <h3>
                Deriv connection
              </h3>

              <p>
                {isLoggedIn
                  ? 'Your StarTraders session is connected to your Deriv account.'
                  : 'Connect your Deriv account to access your trading workspace.'}
              </p>

              <div
                className={
                  isLoggedIn
                    ? 'st-connection connected'
                    : 'st-connection'
                }
              >
                <span></span>

                {isLoggedIn
                  ? 'Account connected'
                  : 'Awaiting connection'}
              </div>

            </div>

          </section>

          {/* FOOTER */}
          <footer className="st-dashboard-footer">
            <span>
              STARTRADERS
            </span>

            <span>
              Trading involves risk. Trade responsibly.
            </span>
          </footer>

        </main>
      </div>

      <AiFab />

      <style jsx global>{`

        .st-dashboard {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 50% -20%,
              rgba(45, 212, 191, 0.07),
              transparent 38%
            ),
            #060c18;
          color: #e8edf5;
        }

        .st-market-strip {
          width: 100%;
          overflow: hidden;
          background: #08111f;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          border-top: 1px solid rgba(255,255,255,0.04);
        }

        .st-market-track {
          display: flex;
          width: max-content;
          animation: stTicker 28s linear infinite;
        }

        .st-market-ticker {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 28px;
          border: 0;
          background: transparent;
          color: inherit;
          cursor: pointer;
          white-space: nowrap;
          font-size: 12px;
        }

        .st-market-name {
          color: #8b97ab;
          font-weight: 700;
        }

        .st-market-price {
          color: #e8edf5;
          font-weight: 800;
        }

        .st-market-change {
          font-weight: 800;
        }

        .st-market-change.positive,
        .positive {
          color: #4ade80;
        }

        .st-market-change.negative,
        .negative {
          color: #fb7185;
        }

        @keyframes stTicker {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        .st-dashboard-main {
          width: min(1180px, calc(100% - 36px));
          margin: 0 auto;
          padding: 34px 0 70px;
        }

        .st-dashboard-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
          margin-bottom: 26px;
        }

        .st-eyebrow,
        .st-section-kicker {
          display: block;
          color: #5eead4;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.8px;
          margin-bottom: 8px;
        }

        .st-dashboard-heading h1 {
          margin: 0;
          font-size: clamp(28px, 4vw, 42px);
          line-height: 1.05;
          letter-spacing: -1.5px;
        }

        .st-heading-dot {
          color: #fb923c;
        }

        .st-dashboard-heading p {
          max-width: 610px;
          margin: 12px 0 0;
          color: #8b97ab;
          line-height: 1.6;
          font-size: 14px;
        }

        .st-session-status {
          min-width: 205px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 14px;
          background: rgba(16,29,51,0.75);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
        }

        .st-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 12px rgba(74,222,128,0.8);
        }

        .st-status-title,
        .st-status-time {
          display: block;
        }

        .st-status-title {
          font-size: 12px;
          font-weight: 800;
        }

        .st-status-time {
          color: #8b97ab;
          font-size: 10px;
          margin-top: 3px;
        }

        .st-overview-grid {
          display: grid;
          grid-template-columns: 2fr repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 18px;
        }

        .st-account-card,
        .st-small-card,
        .st-workspace,
        .st-panel {
          background:
            linear-gradient(
              145deg,
              rgba(16,29,51,0.98),
              rgba(9,19,34,0.98)
            );
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
        }

        .st-account-card {
          position: relative;
          overflow: hidden;
          padding: 20px;
        }

        .st-card-glow {
          position: absolute;
          width: 160px;
          height: 160px;
          right: -60px;
          bottom: -90px;
          border-radius: 50%;
          background: rgba(45,212,191,0.12);
          filter: blur(35px);
        }

        .st-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .st-card-label {
          color: #8b97ab;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.4px;
        }

        .st-live-badge {
          color: #4ade80;
          background: rgba(74,222,128,0.08);
          border: 1px solid rgba(74,222,128,0.2);
          border-radius: 20px;
          padding: 4px 8px;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .st-balance {
          position: relative;
          z-index: 1;
          margin: 16px 0 12px;
          font-size: 27px;
          font-weight: 900;
          letter-spacing: -0.5px;
        }

        .st-account-row {
          position: relative;
          z-index: 1;
          display: flex;
          justify-content: space-between;
          gap: 10px;
          color: #8b97ab;
          font-size: 11px;
        }

        .st-account-id {
          color: #5eead4;
        }

        .st-small-card {
          padding: 18px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 126px;
        }

        .st-small-card strong {
          font-size: 22px;
          margin-top: 14px;
        }

        .st-positive-value {
          color: #4ade80;
        }

        .st-muted {
          color: #68758a;
          font-size: 10px;
          margin-top: 7px;
        }

        .st-workspace {
          overflow: hidden;
          margin-bottom: 32px;
        }

        .st-workspace-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          padding: 20px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .st-workspace-header h2 {
          margin: 0;
          font-size: 20px;
        }

        .st-market-selector {
          display: flex;
          gap: 5px;
          overflow-x: auto;
        }

        .st-market-selector button,
        .st-timeframes button {
          border: 1px solid transparent;
          background: #152441;
          color: #8b97ab;
          border-radius: 8px;
          padding: 7px 10px;
          cursor: pointer;
          font-size: 10px;
          font-weight: 800;
          white-space: nowrap;
        }

        .st-market-selector button.selected {
          color: #5eead4;
          background: rgba(45,212,191,0.1);
          border-color: rgba(45,212,191,0.25);
        }

        .st-chart-placeholder {
          position: relative;
          height: 310px;
          overflow: hidden;
          background: #07101d;
        }

        .st-chart-grid {
          position: absolute;
          inset: 0;
          opacity: 0.32;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 80px 60px;
        }

        .st-chart-line {
          position: absolute;
          inset: 30px 0 10px;
          width: 100%;
          height: calc(100% - 40px);
        }

        .st-chart-price {
          position: absolute;
          top: 18px;
          right: 20px;
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .st-chart-price strong {
          font-size: 18px;
        }

        .st-chart-price span {
          padding: 4px 8px;
          border-radius: 6px;
          background: rgba(74,222,128,0.08);
          font-size: 10px;
          font-weight: 800;
        }

        .st-chart-note {
          position: absolute;
          bottom: 16px;
          left: 18px;
          color: #526078;
          font-size: 9px;
          letter-spacing: 0.5px;
        }

        .st-timeframes {
          display: flex;
          gap: 5px;
          padding: 10px 14px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .st-timeframes button.active {
          color: #5eead4;
          background: rgba(45,212,191,0.1);
        }

        .st-section {
          margin-bottom: 34px;
        }

        .st-section-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 14px;
        }

        .st-section-heading h2 {
          margin: 0;
          font-size: 21px;
        }

        .st-section-count {
          color: #68758a;
          font-size: 10px;
        }

        .st-tools-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 11px;
        }

        .st-tool-card {
          position: relative;
          display: flex;
          align-items: center;
          gap: 13px;
          min-height: 92px;
          padding: 16px;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          background: #101d33;
          color: #e8edf5;
          text-align: left;
          cursor: pointer;
          transition:
            transform 0.2s ease,
            border-color 0.2s ease,
            background 0.2s ease;
        }

        .st-tool-card:hover {
          transform: translateY(-2px);
          border-color: rgba(45,212,191,0.28);
          background: #12223c;
        }

        .st-tool-icon {
          flex: 0 0 40px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          color: #5eead4;
          background: rgba(45,212,191,0.09);
          border: 1px solid rgba(45,212,191,0.12);
          font-size: 19px;
        }

        .st-tool-content {
          display: flex;
          flex-direction: column;
          gap: 5px;
          min-width: 0;
        }

        .st-tool-content strong {
          font-size: 13px;
        }

        .st-tool-content span {
          color: #7e8ba0;
          font-size: 10px;
          line-height: 1.45;
        }

        .st-tool-arrow {
          margin-left: auto;
          color: #5b6a80;
          font-size: 17px;
        }

        .st-lower-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 12px;
        }

        .st-panel {
          padding: 20px;
        }

        .st-panel h3 {
          margin: 0;
          font-size: 17px;
        }

        .st-activity-list {
          margin-top: 17px;
        }

        .st-activity-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .st-activity-item:last-child {
          border-bottom: 0;
        }

        .st-activity-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          color: #fb923c;
          background: rgba(251,146,60,0.08);
        }

        .st-activity-item div {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .st-activity-item strong {
          font-size: 12px;
        }

        .st-activity-item span {
          color: #718096;
          font-size: 9px;
        }

        .st-activity-arrow {
          margin-left: auto;
          color: #59677c;
        }

        .st-security-panel {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .st-security-icon {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 13px 0;
          border-radius: 50%;
          color: #4ade80;
          background: rgba(74,222,128,0.08);
          border: 1px solid rgba(74,222,128,0.16);
          font-weight: 900;
        }

        .st-security-panel p {
          color: #7c889b;
          font-size: 11px;
          line-height: 1.6;
          margin: 9px 0 14px;
        }

        .st-connection {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #8b97ab;
          font-size: 10px;
        }

        .st-connection span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #fb923c;
        }

        .st-connection.connected {
          color: #4ade80;
        }

        .st-connection.connected span {
          background: #4ade80;
        }

        .st-dashboard-footer {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          padding-top: 26px;
          color: #526078;
          font-size: 9px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .st-dashboard-footer span:first-child {
          color: #65738a;
          font-weight: 900;
          letter-spacing: 1px;
        }

        @media (max-width: 900px) {
          .st-overview-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .st-account-card {
            grid-column: span 2;
          }

          .st-tools-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .st-lower-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .st-dashboard-main {
            width: calc(100% - 24px);
            padding-top: 23px;
          }

          .st-dashboard-heading {
            align-items: flex-start;
            flex-direction: column;
            gap: 16px;
          }

          .st-session-status {
            width: 100%;
            min-width: 0;
          }

          .st-overview-grid {
            grid-template-columns: 1fr 1fr;
          }

          .st-account-card {
            grid-column: span 2;
          }

          .st-small-card {
            min-height: 112px;
            padding: 14px;
          }

          .st-workspace-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .st-market-selector {
            width: 100%;
          }

          .st-chart-placeholder {
            height: 240px;
          }

          .st-tools-grid {
            grid-template-columns: 1fr;
          }

          .st-dashboard-footer {
            flex-direction: column;
          }
        }

      `}</style>
    </>
  );
}
