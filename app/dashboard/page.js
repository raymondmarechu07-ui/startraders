```javascript
'use client';

import { useState } from 'react';
import UtilityBar from '@/components/UtilityBar';
import TabNav from '@/components/TabNav';
import AiFab from '@/components/AiFab';

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

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M5 12h13" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

function WarningIcon() {
  return (
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
  );
}

function QuickActionCard({ action }) {
  const content = (
    <>
      <div className={`quick-action-icon ${action.color}`}>
        <span aria-hidden="true">{action.icon}</span>
      </div>

      <div className="quick-action-arrow" aria-hidden="true">
        <ArrowIcon />
      </div>

      <h3>{action.title}</h3>

      <p>{action.description}</p>

      <div className="quick-action-divider" />

      <span className="quick-action-open">
        Open <span aria-hidden="true">→</span>
      </span>
    </>
  );

  if (action.href) {
    return (
      <a href={action.href} className={`quick-action-card ${action.color}`}>
        {content}
      </a>
    );
  }

  if (action.action === 'upload') {
    return (
      <button
        type="button"
        className={`quick-action-card ${action.color}`}
        onClick={() => {
          window.alert(
            'Upload Bot will be connected to the bot upload workflow.'
          );
        }}
      >
        {content}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`quick-action-card ${action.color}`}
      onClick={() => {
        window.alert(
          'Quick Strategy will be connected to the strategy workflow.'
        );
      }}
    >
      {content}
    </button>
  );
}

function RiskDisclaimer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={`risk-floating-button ${open ? 'open' : ''}`}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="star-risk-panel"
      >
        <span className="risk-floating-icon">
          <WarningIcon />
        </span>

        <span>Risk Disclaimer</span>
      </button>

      {open && (
        <div
          id="star-risk-panel"
          className="risk-floating-panel"
          role="dialog"
          aria-labelledby="risk-panel-title"
        >
          <div className="risk-panel-header">
            <div className="risk-panel-icon">
              <WarningIcon />
            </div>

            <div>
              <div className="risk-panel-label">IMPORTANT</div>
              <h2 id="risk-panel-title">Risk Disclaimer</h2>
            </div>

            <button
              type="button"
              className="risk-panel-close"
              onClick={() => setOpen(false)}
              aria-label="Close risk disclaimer"
            >
              ×
            </button>
          </div>

          <p className="risk-panel-intro">
            Trading financial products involves significant risk and may not be
            suitable for everyone. Please understand the risks before trading.
          </p>

          <ul className="risk-panel-list">
            {RISK_POINTS.map((point) => (
              <li key={point}>
                <span className="risk-point-icon">
                  <WarningIcon />
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>

          <div className="risk-panel-divider" />

          <p className="risk-panel-note">
            <strong>Important:</strong> Star Traders does not guarantee
            profits. Trading decisions remain the responsibility of the user.
          </p>
        </div>
      )}
    </>
  );
}

export default function DashboardPage() {
  return (
    <div className="star-dashboard dbt-style-dashboard">
      {/* Existing Star Traders utility bar */}
      <UtilityBar />

      {/* Existing Star Traders navigation */}
      <TabNav />

      {/* ============================================================
          FULL-WIDTH DBT-STYLE WELCOME HERO
         ============================================================ */}
      <section className="dbt-welcome-hero">
        <div className="dbt-hero-pattern" />

        <div className="dbt-welcome-content">
          <h1>
            Hello <span className="dbt-account-name">DOT94329668</span>{' '}
            <span className="dbt-wave" aria-hidden="true">
              👋
            </span>
          </h1>

          <p>&quot;Discipline beats intelligence in the long run.&quot;</p>
        </div>
      </section>

      {/* ============================================================
          DASHBOARD CONTENT
         ============================================================ */}
      <main className="dbt-dashboard-main">
        {/* QUICK ACTIONS */}
        <section className="dbt-quick-section">
          <div className="dbt-section-title">
            <span />
            <h2>QUICK ACTIONS</h2>
            <span />
          </div>

          <div className="dbt-quick-grid">
            {QUICK_ACTIONS.map((action) => (
              <QuickActionCard key={action.title} action={action} />
            ))}
          </div>
        </section>

        {/* ==========================================================
            PARTNER REFERRAL
           ========================================================== */}
        <section className="dbt-partner-card">
          <div className="partner-top">
            <div>
              <div className="partner-eyebrow">PARTNER REFERRAL</div>

              <h2>Master Partner share</h2>

              <p>
                Earn from partners who join Deriv through your Master Partner
                referral link.
              </p>
            </div>

            <span className="partner-badge">Earn monthly</span>
          </div>

          <div className="partner-bottom">
            <button type="button" className="partner-more-button">
              Show more <span aria-hidden="true">↓</span>
            </button>

            <button type="button" className="partner-refer-button">
              Refer a partner <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>
      </main>

      {/* Existing floating AI assistant */}
      <AiFab />

      {/* Floating risk disclaimer */}
      <RiskDisclaimer />
    </div>
  );
}
```
