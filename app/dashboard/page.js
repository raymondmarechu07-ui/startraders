```javascript
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

import UtilityBar from '@/components/UtilityBar';
import TabNav from '@/components/TabNav';
import AiFab from '@/components/AiFab';
import RiskDisclaimer from '@/components/RiskDisclaimer';
import { useDeriv } from '@/context/DerivProvider';

const QUICK_ACTIONS = [
  {
    title: 'Upload Bot',
    description: 'Import an XML bot from your computer.',
    icon: '📁',
    color: 'orange',
    href: '/bot-builder',
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
    href: '/bot-builder',
  },
];

export default function DashboardPage() {
  const { activeAccount } = useDeriv();

  const [showRisk, setShowRisk] = useState(false);
  const riskRef = useRef(null);

  const accountId =
    activeAccount?.account_id ||
    activeAccount?.loginid ||
    'Trader';

  useEffect(() => {
    if (showRisk && riskRef.current) {
      setTimeout(() => {
        riskRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 50);
    }
  }, [showRisk]);

  return (
    <div className="star-dashboard dashboard-page">

      {/* =========================================================
          TOP UTILITY BAR
          Keep the existing project component.
      ========================================================= */}
      <UtilityBar />

      {/* =========================================================
          MAIN NAVIGATION
      ========================================================= */}
      <TabNav />

      {/* =========================================================
          MAIN DASHBOARD
      ========================================================= */}
      <main className="dashboard-main">

        {/* =======================================================
            DBTRADERS-STYLE WELCOME HERO
            No balance.
            No P/L.
            No win rate.
            No active bots.
            No Deriv connection message.
        ======================================================= */}
        <section className="dbt-welcome">

          <div className="dbt-welcome-pattern"></div>

          <div className="dbt-welcome-content">

            <h1>
              Hello {accountId}
              <span className="dbt-wave">👋</span>
            </h1>

            <p>
              "Discipline beats intelligence in the long run."
            </p>

          </div>

        </section>

        {/* =======================================================
            QUICK ACTIONS
        ======================================================= */}
        <section className="dbt-content-section">

          <div className="dbt-section-title">
            <span className="dbt-line"></span>
            <span>QUICK ACTIONS</span>
            <span className="dbt-line"></span>
          </div>

          <div className="dbt-quick-grid">

            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className={`dbt-action-card ${action.color}`}
              >

                <div className="dbt-action-icon">
                  {action.icon}
                </div>

                <div className="dbt-action-arrow">
                  →
                </div>

                <h3>
                  {action.title}
                </h3>

                <p>
                  {action.description}
                </p>

                <div className="dbt-action-divider"></div>

                <span className="dbt-action-open">
                  Open →
                </span>

              </Link>
            ))}

          </div>

        </section>

        {/* =======================================================
            MASTER PARTNER SHARE
            Matches the DBTraders dashboard section shown in your
            screenshot.
        ======================================================= */}
        <section className="dbt-partner-section">

          <div className="dbt-partner-card">

            <div className="dbt-partner-top">

              <div>
                <div className="dbt-partner-label">
                  PARTNER REFERRAL
                </div>

                <h2>
                  Master Partner share
                </h2>
              </div>

              <span className="dbt-earn-pill">
                Earn monthly
              </span>

            </div>

            <p>
              Earn from partners who join Star Traders through
              your Master Partner referral link.
            </p>

            <div className="dbt-partner-actions">

              <button
                type="button"
                className="dbt-show-more"
                onClick={() =>
                  alert('Partner referral details will appear here.')
                }
              >
                Show more ↓
              </button>

              <button
                type="button"
                className="dbt-refer-button"
                onClick={() =>
                  alert('Partner referral will be available here.')
                }
              >
                Refer a partner →
              </button>

            </div>

          </div>

        </section>

        {/* =======================================================
            RISK DISCLAIMER
            Hidden until the floating Risk Disclaimer button is
            clicked.
        ======================================================= */}
        {showRisk && (
          <div ref={riskRef} className="dashboard-risk-area">
            <RiskDisclaimer />
          </div>
        )}

      </main>

      {/* =========================================================
          FLOATING RISK DISCLAIMER BUTTON
          This stays visible on desktop, tablet and phone.
      ========================================================= */}
      <button
        type="button"
        className={`floating-risk-button ${
          showRisk ? 'floating-risk-button-open' : ''
        }`}
        onClick={() => setShowRisk((value) => !value)}
        aria-expanded={showRisk}
        aria-controls="risk-disclaimer"
      >
        <span className="floating-risk-icon">⚠</span>
        <span>
          {showRisk ? 'Hide Risk Disclaimer' : 'Risk Disclaimer'}
        </span>
      </button>

      {/* =========================================================
          AI BUTTON
          Existing component — unchanged.
      ========================================================= */}
      <AiFab />

    </div>
  );
}
```
