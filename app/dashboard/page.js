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

function QuickActionCard({ item }) {
  const content = (
    <>
      <div className={`quick-icon ${item.color}`}>
        {item.icon}
      </div>

      <div className="quick-arrow">→</div>

      <h3>{item.title}</h3>

      <p>{item.description}</p>

      <div className="quick-divider" />

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
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={`quick-card ${item.color}`}
      onClick={() => {
        if (item.action === 'upload') {
          alert('Bot upload will be connected here.');
        }

        if (item.action === 'strategy') {
          alert('Quick Strategy will be connected here.');
        }
      }}
    >
      {content}
    </button>
  );
}

function RiskDisclaimerButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className={`risk-floating ${open ? 'open' : ''}`}>
      <button
        type="button"
        className="risk-floating-button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="risk-floating-panel"
      >
        <span className="risk-warning-icon">!</span>
        <span>Risk Disclaimer</span>
      </button>

      {open && (
        <div
          id="risk-floating-panel"
          className="risk-floating-panel"
        >
          <div className="risk-panel-title">
            Risk disclaimer
          </div>

          <p>
            Star Traders offers complex derivatives such as
            options and contracts for difference (CFDs). These
            products may not be suitable for all clients, and
            trading them puts your capital at risk.
          </p>

          <p>
            Please make sure you understand the products,
            associated risks, and possible losses before trading.
          </p>

          <p>
            Trading decisions should be made carefully and
            according to your own financial circumstances and
            risk tolerance.
          </p>

          <div className="risk-panel-note">
            Trading involves risk and you may lose your capital.
            Star Traders does not provide financial advice.
          </div>
        </div>
      )}
    </div>
  );
}

function PartnerReferral() {
  return (
    <section className="partner-section">
      <div className="partner-card">
        <div className="partner-copy">
          <div className="partner-eyebrow">
            PARTNER REFERRAL
          </div>

          <h2>Master Partner share</h2>

          <p>
            Earn from partners who join Star Traders through
            your Master Partner referral link.
          </p>
        </div>

        <div className="partner-badge">
          Earn monthly
        </div>

        <button
          type="button"
          className="partner-more"
          onClick={() =>
            alert('Partner referral information will open here.')
          }
        >
          Show more ↓
        </button>

        <button
          type="button"
          className="partner-refer"
          onClick={() =>
            alert('Your partner referral flow will open here.')
          }
        >
          Refer a partner →
        </button>
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const { activeAccount } = useDeriv();

  const accountId =
    activeAccount?.account_id ||
    activeAccount?.loginid ||
    'Trader';

  return (
    <div className="star-dashboard">
      {/* =====================================================
          TOP BAR
      ===================================================== */}
      <UtilityBar />

      {/* =====================================================
          MAIN NAVIGATION
      ===================================================== */}
      <TabNav />

      {/* =====================================================
          DASHBOARD
      ===================================================== */}
      <main className="dashboard-page">

        {/* ===================================================
            WELCOME HERO
            IMPORTANT:
            No balance card.
            No P/L card.
            No win-rate card.
            No active-bots card.
            No "Connected to Deriv" message.
        =================================================== */}
        <section className="dashboard-hero">

          <div className="hero-grid" />

          <div className="hero-content">

            <h1>
              Hello {accountId}
              <span className="hello-wave">👋</span>
            </h1>

            <p className="hero-quote">
              "Discipline beats intelligence in the long run."
            </p>

          </div>
        </section>

        {/* ===================================================
            QUICK ACTIONS
        =================================================== */}
        <section className="quick-actions-section">

          <div className="quick-section-heading">
            <span />
            <div>QUICK ACTIONS</div>
            <span />
          </div>

          <div className="quick-actions-grid">
            {QUICK_ACTIONS.map((item) => (
              <QuickActionCard
                key={item.title}
                item={item}
              />
            ))}
          </div>

        </section>

        {/* ===================================================
            PARTNER REFERRAL
        =================================================== */}
        <PartnerReferral />

      </main>

      {/* =====================================================
          AI FLOATING BUTTON
      ===================================================== */}
      <AiFab />

      {/* =====================================================
          RISK DISCLAIMER
          FLOATS AT BOTTOM LEFT
      ===================================================== */}
      <RiskDisclaimerButton />

    </div>
  );
}
