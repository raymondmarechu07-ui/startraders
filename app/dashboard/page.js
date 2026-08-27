'use client';

import { useState } from 'react';
import UtilityBar from '@/components/UtilityBar';
import TabNav from '@/components/TabNav';
import AiFab from '@/components/AiFab';
import { useDeriv } from '@/context/DerivProvider';

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

export default function DashboardPage() {
  const {
    isLoggedIn,
    balance,
    activeAccount,
    status,
  } = useDeriv();

  const [riskOpen, setRiskOpen] = useState(false);

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

  const accountType =
    activeAccount?.account_type === 'demo'
      ? 'Demo Account'
      : 'Real Account';

  function handleAction(action) {
    if (action === 'upload') {
      alert('Bot upload will be connected to the bot system.');
    }

    if (action === 'strategy') {
      alert('Quick Strategy will be connected to the strategy system.');
    }
  }

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
          DASHBOARD
      ========================================================= */}
      <main className="dbt-dashboard">

        {/* =======================================================
            CONNECTION STATUS
        ======================================================= */}
        <div className="connection-status">
          <span
            className={
              isLoggedIn
                ? 'connection-dot online'
                : 'connection-dot'
            }
          />

          <span>{connectionText}</span>
        </div>

        {/* =======================================================
            CENTERED WELCOME
        ======================================================= */}
        <section className="dbt-welcome">

          <h1>
            Hello {accountId}
            <span className="wave">👋</span>
          </h1>

          <p>
            &quot;Discipline beats intelligence in the long run.&quot;
          </p>

        </section>

        {/* =======================================================
            ACCOUNT STATISTICS
        ======================================================= */}
        <section className="account-stats">

          {/* ACCOUNT BALANCE */}
          <div className="account-card">

            <div className="card-title">
              ACCOUNT BALANCE
            </div>

            <div className="balance-number">
              {balanceAmount}
            </div>

            <div className="balance-currency">
              {currency}
            </div>

            <div className="card-subtitle">
              {accountType}
            </div>

          </div>

          {/* TODAY'S P/L */}
          <div className="account-card">

            <div className="card-title">
              TODAY&apos;S P/L
            </div>

            <div className="card-value positive">
              +$0.00
            </div>

            <div className="card-subtitle">
              No completed
              <br />
              trades today
            </div>

          </div>

          {/* WIN RATE */}
          <div className="account-card">

            <div className="card-title">
              WIN RATE
            </div>

            <div className="card-value">
              —
            </div>

            <div className="card-subtitle">
              Based on recent
              <br />
              trades
            </div>

          </div>

          {/* ACTIVE BOTS */}
          <div className="account-card">

            <div className="card-title">
              ACTIVE BOTS
            </div>

            <div className="card-value">
              0
            </div>

            <div className="card-subtitle">
              No strategies
              <br />
              running
            </div>

          </div>

        </section>

        {/* =======================================================
            QUICK ACTIONS
        ======================================================= */}
        <section className="quick-section">

          <div className="quick-heading">
            QUICK ACTIONS
          </div>

          <div className="quick-actions">

            {QUICK_ACTIONS.map((item) => {

              const content = (
                <>
                  <div className={`quick-icon ${item.color}`}>
                    {item.icon}
                  </div>

                  <div className="quick-arrow">
                    →
                  </div>

                  <h3>
                    {item.title}
                  </h3>

                  <p>
                    {item.description}
                  </p>

                  <div className="quick-line" />

                  <span className="quick-open">
                    Open →
                  </span>
                </>
              );

              if (item.href) {
                return (
                  <a
                    href={item.href}
                    className={`quick-card ${item.color}`}
                    key={item.title}
                  >
                    {content}
                  </a>
                );
              }

              return (
                <button
                  type="button"
                  className={`quick-card ${item.color}`}
                  key={item.title}
                  onClick={() => handleAction(item.action)}
                >
                  {content}
                </button>
              );
            })}

          </div>

        </section>

        {/* =======================================================
            MASTER PARTNER SHARE
        ======================================================= */}
        <section className="partner-section">

          <div className="partner-content">

            <div className="partner-label">
              PARTNER REFERRAL
            </div>

            <h2>
              Master Partner share
            </h2>

            <p>
              Earn from partners who join Deriv through
              your Master Partner referral link.
            </p>

          </div>

          <div className="partner-actions">

            <span className="earn-badge">
              Earn monthly
            </span>

            <div className="partner-buttons">

              <button
                type="button"
                className="show-more"
                onClick={() =>
                  alert('Partner referral information will be displayed here.')
                }
              >
                Show more ↓
              </button>

              <button
                type="button"
                className="refer-button"
                onClick={() =>
                  alert('Partner referral will be connected here.')
                }
              >
                Refer a partner →
              </button>

            </div>

          </div>

        </section>

      </main>

      {/* =========================================================
          FLOATING RISK DISCLAIMER
      ========================================================= */}
      <div className="risk-disclaimer-container">

        {riskOpen && (
          <div className="risk-popup">

            <div className="risk-popup-header">

              <div className="risk-warning-icon">
                !
              </div>

              <div>
                <h2>
                  Risk Disclaimer
                </h2>

                <p>
                  Please understand the risks before trading.
                </p>
              </div>

            </div>

            <div className="risk-intro">
              Trading financial products involves significant
              risk and may not be suitable for everyone.
              Please understand the risks before trading.
            </div>

            <div className="risk-list">

              {RISK_POINTS.map((point) => (
                <div
                  className="risk-item"
                  key={point}
                >
                  <span className="risk-item-icon">
                    !
                  </span>

                  <span>
                    {point}
                  </span>
                </div>
              ))}

            </div>

            <button
              type="button"
              className="risk-close"
              onClick={() => setRiskOpen(false)}
            >
              Close
            </button>

          </div>
        )}

        <button
          type="button"
          className="risk-floating-button"
          onClick={() => setRiskOpen((value) => !value)}
          aria-label="Open risk disclaimer"
        >
          <span className="risk-small-icon">
            !
          </span>

          <span>
            Risk Disclaimer
          </span>
        </button>

      </div>

      {/* =========================================================
          AI BUTTON
      ========================================================= */}
      <AiFab />

      {/* =========================================================
          PAGE STYLES
      ========================================================= */}
      <style jsx>{`

        /* =======================================================
           MAIN PAGE
        ======================================================= */

        .dbt-dashboard {
          width: 100%;
          min-height: calc(100vh - 120px);
          background: #061020;
          padding: 0 20px 100px;
          box-sizing: border-box;
        }

        /* =======================================================
           CONNECTION STATUS
        ======================================================= */

        .connection-status {
          max-width: 780px;
          margin: 0 auto;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 7px;
          color: #75859e;
          font-size: 10px;
          letter-spacing: 0.4px;
        }

        .connection-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #64748b;
          display: inline-block;
        }

        .connection-dot.online {
          background: #2dd4bf;
          box-shadow: 0 0 8px rgba(45, 212, 191, 0.6);
        }

        /* =======================================================
           WELCOME AREA
        ======================================================= */

        .dbt-welcome {
          width: 100%;
          max-width: 780px;
          min-height: 150px;
          margin: 0 auto;
          padding: 22px 20px 28px;
          box-sizing: border-box;
          text-align: center;

          background:
            radial-gradient(
              circle at 50% 35%,
              rgba(38, 83, 143, 0.32),
              rgba(13, 37, 70, 0.72) 55%,
              rgba(9, 27, 51, 0.98)
            );

          border-top: 1px solid rgba(45, 212, 191, 0.04);
          border-bottom: 1px solid rgba(255,255,255,0.04);

          position: relative;
          overflow: hidden;
        }

        .dbt-welcome::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;

          background-image:
            radial-gradient(
              rgba(52, 114, 190, 0.35) 1px,
              transparent 1px
            );

          background-size: 28px 28px;
          opacity: 0.25;
        }

        .dbt-welcome h1 {
          position: relative;
          z-index: 1;

          margin: 4px 0 12px;

          font-family:
            'Segoe UI',
            Roboto,
            Arial,
            sans-serif;

          font-size: 34px;
          line-height: 1.15;
          font-weight: 800;

          color: #f4f7fb;

          letter-spacing: -0.8px;
        }

        .wave {
          margin-left: 12px;
          font-size: 29px;
        }

        .dbt-welcome p {
          position: relative;
          z-index: 1;

          margin: 0;

          color: #b6c1d2;

          font-size: 13px;
          font-style: italic;
          line-height: 1.5;
        }

        /* =======================================================
           ACCOUNT CARDS
        ======================================================= */

        .account-stats {
          width: 100%;
          max-width: 780px;

          margin: 34px auto 0;

          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));

          gap: 12px;
        }

        .account-card {
          min-height: 108px;

          box-sizing: border-box;

          padding: 15px 14px 13px;

          background:
            linear-gradient(
              145deg,
              #13233c,
              #0d1b30
            );

          border: 1px solid rgba(92, 126, 169, 0.24);

          border-radius: 13px;

          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.02);

          overflow: hidden;
        }

        .card-title {
          min-height: 27px;

          color: #9ba9bc;

          font-size: 10px;
          line-height: 1.05;

          font-weight: 700;

          letter-spacing: 0.7px;
        }

        .balance-number {
          margin-top: 2px;

          color: #f2f5fa;

          font-size: 19px;
          line-height: 1.1;

          font-weight: 800;

          white-space: nowrap;
        }

        .balance-currency {
          margin-top: 1px;

          color: #f2f5fa;

          font-size: 19px;
          line-height: 1.1;

          font-weight: 800;
        }

        .card-value {
          margin-top: 1px;

          color: #f2f5fa;

          font-size: 22px;
          line-height: 1.1;

          font-weight: 800;
        }

        .card-value.positive {
          color: #36e49b;
        }

        .card-subtitle {
          margin-top: 8px;

          color: #8492a6;

          font-size: 10px;
          line-height: 1.35;
        }

        /* =======================================================
           QUICK ACTIONS
        ======================================================= */

        .quick-section {
          width: 100%;
          max-width: 780px;

          margin: 34px auto 0;
        }

        .quick-heading {
          text-align: center;

          color: #88a0be;

          font-size: 9px;
          font-weight: 800;

          letter-spacing: 1.8px;

          margin-bottom: 8px;
        }

        .quick-actions {
          display: grid;

          grid-template-columns:
            repeat(4, minmax(0, 1fr));

          gap: 10px;
        }

        .quick-card {
          position: relative;

          min-height: 153px;

          box-sizing: border-box;

          padding: 15px 13px 12px;

          border: 1px solid rgba(82, 123, 174, 0.25);

          border-radius: 12px;

          background: #10223b;

          color: #f1f5f9;

          text-align: left;

          text-decoration: none;

          cursor: pointer;

          transition:
            transform 0.15s ease,
            border-color 0.15s ease,
            background 0.15s ease;
        }

        .quick-card:hover {
          transform: translateY(-2px);

          background: #132844;

          border-color: rgba(125, 164, 211, 0.42);
        }

        .quick-card.orange {
          border-top: 2px solid #ff694d;
        }

        .quick-card.green {
          border-top: 2px solid #00e28b;
        }

        .quick-card.purple {
          border-top: 2px solid #b45cff;
        }

        .quick-card.yellow {
          border-top: 2px solid #ffd21f;
        }

        .quick-icon {
          width: 35px;
          height: 35px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 10px;

          font-size: 18px;

          margin-bottom: 12px;

          border: 1px solid rgba(255,255,255,0.08);
        }

        .quick-icon.orange {
          background: rgba(255, 105, 77, 0.12);
        }

        .quick-icon.green {
          background: rgba(0, 226, 139, 0.12);
        }

        .quick-icon.purple {
          background: rgba(180, 92, 255, 0.12);
        }

        .quick-icon.yellow {
          background: rgba(255, 210, 31, 0.12);
        }

        .quick-arrow {
          position: absolute;

          right: 10px;
          top: 10px;

          width: 20px;
          height: 20px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 6px;

          background: rgba(44, 88, 137, 0.45);

          color: #9eb3cc;

          font-size: 13px;
        }

        .quick-card h3 {
          margin: 0 0 5px;

          color: #f3f6fb;

          font-size: 12px;
          font-weight: 800;
        }

        .quick-card p {
          margin: 0;

          min-height: 31px;

          color: #8fa1b8;

          font-size: 9px;
          line-height: 1.45;
        }

        .quick-line {
          width: 100%;
          height: 1px;

          margin: 10px 0 8px;

          background: rgba(255,255,255,0.07);
        }

        .quick-open {
          font-size: 9px;
          font-weight: 800;
        }

        .quick-card.orange .quick-open {
          color: #ff694d;
        }

        .quick-card.green .quick-open {
          color: #00e28b;
        }

        .quick-card.purple .quick-open {
          color: #b45cff;
        }

        .quick-card.yellow .quick-open {
          color: #ffd21f;
        }

        /* =======================================================
           MASTER PARTNER SECTION
        ======================================================= */

        .partner-section {
          width: 100%;
          max-width: 780px;

          min-height: 120px;

          margin: 18px auto 0;

          padding: 17px 19px;

          box-sizing: border-box;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 20px;

          background:
            linear-gradient(
              145deg,
              #122946,
              #10223c
            );

          border:
            1px solid rgba(82, 123, 174, 0.25);

          border-radius: 15px;
        }

        .partner-content {
          min-width: 0;
        }

        .partner-label {
          color: #ff5f7c;

          font-size: 9px;
          font-weight: 800;

          letter-spacing: 1.4px;

          margin-bottom: 6px;
        }

        .partner-content h2 {
          margin: 0 0 8px;

          color: #f3f6fb;

          font-size: 18px;
          line-height: 1.1;

          font-weight: 500;
        }

        .partner-content p {
          margin: 0;

          color: #a4b2c5;

          font-size: 10px;
          line-height: 1.5;
        }

        .partner-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-end;

          gap: 22px;

          flex-shrink: 0;
        }

        .earn-badge {
          padding: 7px 12px;

          border-radius: 20px;

          background: rgba(244, 63, 94, 0.12);

          color: #ff7891;

          font-size: 8px;
          font-weight: 700;
        }

        .partner-buttons {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .show-more,
        .refer-button {
          height: 35px;

          border-radius: 8px;

          padding: 0 13px;

          font-size: 9px;
          font-weight: 800;

          cursor: pointer;
        }

        .show-more {
          background: transparent;

          border: 1px solid rgba(89, 131, 180, 0.35);

          color: #e2e8f0;
        }

        .refer-button {
          border: none;

          background: #ff5d7c;

          color: white;

          padding-left: 15px;
          padding-right: 15px;
        }

        /* =======================================================
           RISK DISCLAIMER
        ======================================================= */

        .risk-disclaimer-container {
          position: fixed;

          left: 4px;
          bottom: 10px;

          z-index: 80;
        }

        .risk-floating-button {
          display: flex;
          align-items: center;
          gap: 7px;

          min-height: 30px;

          padding: 0 10px;

          border: none;
          border-radius: 4px;

          background: #facc15;

          color: #111827;

          font-size: 8px;
          font-weight: 800;

          cursor: pointer;

          box-shadow:
            0 3px 12px rgba(0,0,0,0.28);
        }

        .risk-small-icon {
          width: 13px;
          height: 13px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background: #111827;

          color: #facc15;

          font-size: 9px;
          font-weight: 900;
        }

        .risk-popup {
          width: 360px;
          max-width: calc(100vw - 30px);

          margin-bottom: 9px;

          padding: 17px;

          box-sizing: border-box;

          background: #0d1b30;

          border:
            1px solid rgba(250, 204, 21, 0.3);

          border-radius: 13px;

          box-shadow:
            0 15px 45px rgba(0,0,0,0.5);
        }

        .risk-popup-header {
          display: flex;
          align-items: center;

          gap: 10px;

          margin-bottom: 12px;
        }

        .risk-warning-icon {
          width: 34px;
          height: 34px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 9px;

          background: rgba(250,204,21,0.12);

          border:
            1px solid rgba(250,204,21,0.3);

          color: #facc15;

          font-size: 18px;
          font-weight: 900;
        }

        .risk-popup-header h2 {
          margin: 0 0 3px;

          color: #f2f5fa;

          font-size: 16px;
        }

        .risk-popup-header p {
          margin: 0;

          color: #8492a6;

          font-size: 9px;
        }

        .risk-intro {
          color: #9caabd;

          font-size: 10px;
          line-height: 1.55;

          margin-bottom: 10px;
        }

        .risk-list {
          border-top:
            1px solid rgba(255,255,255,0.06);
        }

        .risk-item {
          display: flex;
          align-items: flex-start;

          gap: 8px;

          padding: 9px 0;

          color: #dce3ec;

          font-size: 9px;
          line-height: 1.5;

          border-bottom:
            1px solid rgba(255,255,255,0.05);
        }

        .risk-item-icon {
          width: 15px;
          height: 15px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background: rgba(250,204,21,0.12);

          color: #facc15;

          font-size: 9px;
          font-weight: 900;
        }

        .risk-close {
          width: 100%;

          margin-top: 12px;

          height: 30px;

          border-radius: 7px;

          border:
            1px solid rgba(255,255,255,0.1);

          background: transparent;

          color: #aab6c7;

          font-size: 9px;
          font-weight: 700;

          cursor: pointer;
        }

        /* =======================================================
           DESKTOP SIZING
        ======================================================= */

        @media (min-width: 1400px) {

          .dbt-welcome {
            max-width: 780px;
          }

          .account-stats,
          .quick-section,
          .partner-section {
            max-width: 780px;
          }

        }

        /* =======================================================
           TABLET
        ======================================================= */

        @media (max-width: 850px) {

          .account-stats {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .quick-actions {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .partner-section {
            flex-direction: column;
            align-items: flex-start;
          }

          .partner-actions {
            width: 100%;
            align-items: flex-start;
          }

        }

        /* =======================================================
           MOBILE
        ======================================================= */

        @media (max-width: 560px) {

          .dbt-dashboard {
            padding-left: 12px;
            padding-right: 12px;
          }

          .dbt-welcome h1 {
            font-size: 26px;
          }

          .account-stats {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          .account-card {
            min-height: 105px;
            padding: 13px 11px;
          }

          .quick-actions {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          .quick-card {
            min-height: 145px;
          }

          .partner-buttons {
            width: 100%;
            flex-direction: column;
            align-items: stretch;
          }

          .show-more,
          .refer-button {
            width: 100%;
          }

          .risk-popup {
            width: calc(100vw - 25px);
          }

        }

      `}</style>

    </div>
  );
}
