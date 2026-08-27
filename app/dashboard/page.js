'use client';

import { useEffect, useState } from 'react';
import UtilityBar from '@/components/UtilityBar';
import TabNav from '@/components/TabNav';
import AiFab from '@/components/AiFab';
import { useDeriv } from '@/context/DerivProvider';

const MARKETS = [
  { name: 'Volatility 75', short: 'Vol 75', price: '6914.82', change: '+1.24%', up: true },
  { name: 'Volatility 100', short: 'Vol 100', price: '8342.18', change: '+0.82%', up: true },
  { name: 'Boom 500', short: 'Boom 500', price: '12480.41', change: '+2.14%', up: true },
  { name: 'Crash 500', short: 'Crash 500', price: '9021.73', change: '-0.61%', up: false },
  { name: 'Volatility 25', short: 'Vol 25', price: '1553.29', change: '+0.46%', up: true },
];

const TOOLS = [
  {
    title: 'Signals',
    description: 'Live market signals and trading opportunities.',
    icon: '↗',
    accent: 'cyan',
  },
  {
    title: 'Copy trader',
    description: 'Follow and copy selected trading strategies.',
    icon: '⟳',
    accent: 'blue',
  },
  {
    title: 'Risk calculator',
    description: 'Calculate stake, risk and potential exposure.',
    icon: '⌁',
    accent: 'orange',
  },
  {
    title: 'Trade academy',
    description: 'Learn strategies, markets and trading concepts.',
    icon: '◆',
    accent: 'cyan',
  },
  {
    title: 'Manual trader',
    description: 'Trade directly using the Deriv trading interface.',
    icon: '▣',
    accent: 'blue',
  },
  {
    title: 'Bulk trader',
    description: 'Prepare and execute multiple trades efficiently.',
    icon: '▦',
    accent: 'orange',
  },
  {
    title: 'Bot builder',
    description: 'Create automated strategies with the visual builder.',
    icon: '⌘',
    accent: 'purple',
  },
  {
    title: 'Free bots',
    description: 'Explore ready-made strategies and bots.',
    icon: '★',
    accent: 'cyan',
  },
];

export default function DashboardPage() {
  const { isLoggedIn, balance, activeAccount } = useDeriv();

  const [time, setTime] = useState('');
  const [activeMarket, setActiveMarket] = useState(0);

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

    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const balanceDisplay =
    isLoggedIn && balance
      ? `${Number(balance.balance).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} ${balance.currency}`
      : '—';

  const accountLabel =
    activeAccount?.account_type === 'demo'
      ? 'Demo account'
      : isLoggedIn
      ? 'Real account'
      : 'Not connected';

  return (
    <>
      <style jsx global>{`
        body {
          background: #050b16;
        }

        .st-dashboard {
          min-height: calc(100vh - 110px);
          background:
            radial-gradient(circle at 50% 0%, rgba(24, 95, 120, 0.12), transparent 34%),
            linear-gradient(180deg, #07111f 0%, #050b16 55%, #040914 100%);
          color: #e8f7ff;
          padding-bottom: 95px;
        }

        .st-container {
          width: min(1500px, calc(100% - 34px));
          margin: 0 auto;
        }

        .st-market-strip {
          overflow: hidden;
          border-top: 1px solid rgba(77, 221, 226, 0.12);
          border-bottom: 1px solid rgba(77, 221, 226, 0.12);
          background: rgba(4, 13, 25, 0.88);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
        }

        .st-market-track {
          display: flex;
          width: max-content;
          animation: stTicker 32s linear infinite;
        }

        .st-market-item {
          min-width: 225px;
          padding: 11px 22px;
          border-right: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          align-items: center;
          gap: 9px;
          white-space: nowrap;
        }

        .st-market-name {
          color: #94aabd;
          font-size: 11px;
          font-weight: 700;
        }

        .st-market-price {
          color: #eafcff;
          font-size: 12px;
          font-weight: 800;
        }

        .st-up {
          color: #3ee0c0;
        }

        .st-down {
          color: #ff718c;
        }

        .st-orange {
          color: #ff9b45;
        }

        @keyframes stTicker {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        .st-hero {
          position: relative;
          margin-top: 24px;
          min-height: 190px;
          overflow: hidden;
          border: 1px solid rgba(86, 210, 230, 0.13);
          border-radius: 18px;
          background:
            radial-gradient(circle at 82% 30%, rgba(38, 181, 196, 0.16), transparent 27%),
            radial-gradient(circle at 92% 80%, rgba(255, 120, 48, 0.055), transparent 23%),
            linear-gradient(135deg, rgba(11, 29, 49, 0.97), rgba(5, 13, 26, 0.97));
          box-shadow:
            inset 0 1px rgba(255, 255, 255, 0.025),
            0 20px 50px rgba(0, 0, 0, 0.2);
        }

        .st-hero-grid {
          position: absolute;
          inset: 0;
          opacity: 0.22;
          background-image:
            linear-gradient(rgba(80, 202, 220, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(80, 202, 220, 0.08) 1px, transparent 1px);
          background-size: 45px 45px;
          mask-image: linear-gradient(to right, black, transparent 85%);
        }

        .st-hero-content {
          position: relative;
          z-index: 1;
          padding: 34px 38px;
        }

        .st-eyebrow {
          color: #51d7dc;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .st-title {
          margin: 0;
          font-size: clamp(25px, 3vw, 39px);
          line-height: 1.05;
          letter-spacing: -0.035em;
          color: #f4fbff;
        }

        .st-title span {
          color: #5de0df;
        }

        .st-subtitle {
          margin-top: 12px;
          color: #8299ad;
          font-size: 13px;
          max-width: 610px;
        }

        .st-live {
          position: absolute;
          right: 30px;
          top: 30px;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #8fa9ba;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .st-live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #42e1bd;
          box-shadow: 0 0 12px rgba(66, 225, 189, 0.75);
          animation: stPulse 1.7s infinite;
        }

        @keyframes stPulse {
          50% {
            opacity: 0.35;
            transform: scale(0.7);
          }
        }

        .st-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-top: 14px;
        }

        .st-stat {
          min-height: 108px;
          padding: 18px;
          border: 1px solid rgba(102, 190, 210, 0.11);
          border-radius: 14px;
          background: rgba(8, 20, 35, 0.83);
          box-shadow: inset 0 1px rgba(255, 255, 255, 0.025);
        }

        .st-stat-label {
          color: #6f879a;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .st-stat-value {
          margin-top: 11px;
          color: #eefaff;
          font-size: 22px;
          font-weight: 850;
        }

        .st-stat-sub {
          margin-top: 5px;
          color: #647d91;
          font-size: 10px;
        }

        .st-section-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 27px 3px 12px;
        }

        .st-section-title {
          font-size: 14px;
          font-weight: 850;
          color: #e8f8ff;
        }

        .st-section-title::before {
          content: '';
          display: inline-block;
          width: 3px;
          height: 15px;
          margin-right: 8px;
          vertical-align: -2px;
          border-radius: 4px;
          background: #42d7d9;
          box-shadow: 0 0 10px rgba(66, 215, 217, 0.5);
        }

        .st-section-note {
          color: #5e7589;
          font-size: 10px;
        }

        .st-market-panel {
          display: grid;
          grid-template-columns: 1.65fr 0.75fr;
          gap: 12px;
        }

        .st-chart {
          min-height: 270px;
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(100, 190, 210, 0.11);
          border-radius: 14px;
          background: #071321;
        }

        .st-chart-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(92, 160, 180, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(92, 160, 180, 0.06) 1px, transparent 1px);
          background-size: 54px 45px;
        }

        .st-chart-label {
          position: absolute;
          top: 15px;
          left: 17px;
          z-index: 2;
          color: #8ea5b7;
          font-size: 10px;
          font-weight: 800;
        }

        .st-candles {
          position: absolute;
          inset: 45px 18px 18px;
          display: flex;
          align-items: center;
          justify-content: space-around;
        }

        .st-candle {
          position: relative;
          width: 5px;
          height: var(--h);
          background: var(--c);
          opacity: 0.9;
          border-radius: 2px;
        }

        .st-candle::before,
        .st-candle::after {
          content: '';
          position: absolute;
          left: 2px;
          width: 1px;
          background: var(--c);
        }

        .st-candle::before {
          top: -15px;
          height: 14px;
        }

        .st-candle::after {
          bottom: -13px;
          height: 12px;
        }

        .st-market-list {
          padding: 13px;
          border: 1px solid rgba(100, 190, 210, 0.11);
          border-radius: 14px;
          background: rgba(7, 19, 33, 0.9);
        }

        .st-list-head {
          display: flex;
          justify-content: space-between;
          padding: 4px 7px 12px;
          color: #60798d;
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .st-list-row {
          display: grid;
          grid-template-columns: 1fr auto auto;
          gap: 10px;
          align-items: center;
          padding: 12px 8px;
          border-top: 1px solid rgba(255, 255, 255, 0.045);
          cursor: pointer;
          transition: background 0.18s ease;
        }

        .st-list-row:hover,
        .st-list-row.selected {
          background: rgba(67, 205, 214, 0.055);
        }

        .st-list-name {
          color: #b5cad7;
          font-size: 10px;
          font-weight: 750;
        }

        .st-list-price {
          color: #e9f8ff;
          font-size: 10px;
          font-weight: 800;
        }

        .st-tools {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .st-tool {
          min-height: 150px;
          padding: 17px;
          position: relative;
          border: 1px solid rgba(100, 190, 210, 0.105);
          border-radius: 14px;
          background: linear-gradient(145deg, rgba(10, 26, 43, 0.94), rgba(6, 16, 28, 0.96));
          cursor: pointer;
          transition:
            transform 0.2s ease,
            border-color 0.2s ease,
            background 0.2s ease;
        }

        .st-tool:hover {
          transform: translateY(-2px);
          border-color: rgba(78, 211, 219, 0.27);
          background: linear-gradient(145deg, rgba(12, 32, 51, 0.97), rgba(6, 17, 29, 0.98));
        }

        .st-tool-icon {
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: rgba(63, 204, 213, 0.08);
          color: #50d9dd;
          font-size: 16px;
          font-weight: 900;
          margin-bottom: 19px;
        }

        .st-tool-icon.orange {
          color: #ff9b45;
          background: rgba(255, 143, 65, 0.075);
        }

        .st-tool-icon.blue {
          color: #6faaff;
          background: rgba(85, 139, 255, 0.075);
        }

        .st-tool-icon.purple {
          color: #b68cff;
          background: rgba(163, 105, 255, 0.075);
        }

        .st-tool-title {
          color: #e8f7ff;
          font-size: 12px;
          font-weight: 850;
        }

        .st-tool-desc {
          margin-top: 6px;
          color: #637d91;
          font-size: 10px;
          line-height: 1.5;
        }

        .st-tool-arrow {
          position: absolute;
          top: 17px;
          right: 17px;
          color: #536f83;
          font-size: 15px;
        }

        .st-bottom-bar {
          position: fixed;
          left: 50%;
          bottom: 15px;
          transform: translateX(-50%);
          z-index: 40;
          width: min(620px, calc(100% - 30px));
          height: 54px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 7px;
          border: 1px solid rgba(96, 210, 220, 0.15);
          border-radius: 15px;
          background: rgba(5, 16, 29, 0.93);
          backdrop-filter: blur(18px);
          box-shadow: 0 15px 45px rgba(0, 0, 0, 0.38);
        }

        .st-run {
          height: 40px;
          padding: 0 22px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(90deg, #24c8bd, #32d9cf);
          color: #03221f;
          font-size: 11px;
          font-weight: 900;
          cursor: pointer;
        }

        .st-bottom-info {
          padding: 0 15px;
          color: #70889a;
          font-size: 10px;
        }

        .st-clock {
          color: #9ab2c2;
          font-size: 10px;
          font-weight: 750;
          padding-right: 12px;
        }

        @media (max-width: 1050px) {
          .st-tools {
            grid-template-columns: repeat(2, 1fr);
          }

          .st-market-panel {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 760px) {
          .st-container {
            width: min(100% - 20px, 1500px);
          }

          .st-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .st-hero-content {
            padding: 27px 23px;
          }

          .st-live {
            display: none;
          }

          .st-tools {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 480px) {
          .st-stats {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          .st-stat {
            padding: 14px;
          }

          .st-stat-value {
            font-size: 17px;
          }

          .st-tools {
            grid-template-columns: 1fr;
          }

          .st-tool {
            min-height: 125px;
          }

          .st-subtitle {
            font-size: 11px;
          }
        }
      `}</style>

      <UtilityBar />
      <TabNav />

      <div className="st-dashboard">
        {/* Continuous market ticker */}
        <div className="st-market-strip">
          <div className="st-market-track">
            {[...MARKETS, ...MARKETS].map((market, index) => (
              <div className="st-market-item" key={`${market.name}-${index}`}>
                <span className="st-market-name">{market.short}</span>
                <span className="st-market-price">{market.price}</span>
                <span className={market.up ? 'st-up' : 'st-down'}>
                  {market.change}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="st-container">
          {/* Main dashboard hero */}
          <section className="st-hero">
            <div className="st-hero-grid" />

            <div className="st-live">
              <span className="st-live-dot" />
              Markets live
            </div>

            <div className="st-hero-content">
              <div className="st-eyebrow">StarTraders / Trading terminal</div>

              <h1 className="st-title">
                Welcome to <span>StarTraders</span>
              </h1>

              <p className="st-subtitle">
                Your trading workspace for Deriv markets, automated strategies,
                analysis and professional trading tools.
              </p>
            </div>
          </section>

          {/* Account statistics */}
          <section className="st-stats">
            <div className="st-stat">
              <div className="st-stat-label">Balance</div>
              <div className="st-stat-value">{balanceDisplay}</div>
              <div className="st-stat-sub">{accountLabel}</div>
            </div>

            <div className="st-stat">
              <div className="st-stat-label">Today's P/L</div>
              <div className="st-stat-value st-up">+$0.00</div>
              <div className="st-stat-sub">No trades recorded today</div>
            </div>

            <div className="st-stat">
              <div className="st-stat-label">Win rate</div>
              <div className="st-stat-value">—</div>
              <div className="st-stat-sub">Based on recent trades</div>
            </div>

            <div className="st-stat">
              <div className="st-stat-label">Active bots</div>
              <div className="st-stat-value">0</div>
              <div className="st-stat-sub">No strategies running</div>
            </div>
          </section>

          {/* Market overview */}
          <div className="st-section-head">
            <div className="st-section-title">Market overview</div>
            <div className="st-section-note">Deriv markets</div>
          </div>

          <section className="st-market-panel">
            <div className="st-chart">
              <div className="st-chart-grid" />

              <div className="st-chart-label">
                {MARKETS[activeMarket].name} · LIVE VIEW
              </div>

              <div className="st-candles">
                {[42, 65, 48, 76, 58, 84, 53, 70, 92, 61, 77, 48, 68, 88, 57, 74, 94, 66, 82, 51].map(
                  (height, index) => (
                    <div
                      key={index}
                      className="st-candle"
                      style={{
                        '--h': `${height}px`,
                        '--c': index % 4 === 0 ? '#ff9b45' : '#43d5d1',
                      }}
                    />
                  )
                )}
              </div>
            </div>

            <div className="st-market-list">
              <div className="st-list-head">
                <span>Market</span>
                <span>Price</span>
                <span>Move</span>
              </div>

              {MARKETS.map((market, index) => (
                <div
                  key={market.name}
                  className={
                    index === activeMarket
                      ? 'st-list-row selected'
                      : 'st-list-row'
                  }
                  onClick={() => setActiveMarket(index)}
                >
                  <span className="st-list-name">{market.short}</span>
                  <span className="st-list-price">{market.price}</span>
                  <span className={market.up ? 'st-up' : 'st-down'}>
                    {market.change}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Trading tools */}
          <div className="st-section-head">
            <div className="st-section-title">Trading tools</div>
            <div className="st-section-note">StarTraders workspace</div>
          </div>

          <section className="st-tools">
            {TOOLS.map((tool) => (
              <div
                key={tool.title}
                className="st-tool"
                onClick={() =>
                  alert(`${tool.title} — this module will be connected next.`)
                }
              >
                <div className={`st-tool-icon ${tool.accent}`}>
                  {tool.icon}
                </div>

                <div className="st-tool-arrow">↗</div>

                <div className="st-tool-title">{tool.title}</div>

                <div className="st-tool-desc">{tool.description}</div>
              </div>
            ))}
          </section>
        </div>
      </div>

      <AiFab />

      {/* Bottom trading control */}
      <div className="st-bottom-bar">
        <button
          className="st-run"
          onClick={() =>
            alert(
              'Run will be connected to the live Deriv trading engine when the trading module is wired.'
            )
          }
        >
          ▶ RUN
        </button>

        <div className="st-bottom-info">
          StarTraders trading workspace
        </div>

        <div className="st-clock">{time}</div>
      </div>
    </>
  );
}
