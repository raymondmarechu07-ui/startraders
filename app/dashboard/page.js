'use client';

import { useState } from 'react';
import { useDeriv } from '@/context/DerivProvider';

const QUICK_ACTIONS = [
  {
    title: 'Upload Bot',
    description: 'Import an XML bot from your computer.',
    icon: '📁',
    color: 'orange',
    href: '#',
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
    href: '#',
  },
];

const NAV_ITEMS = [
  { label: 'Dashboard', icon: '⌂', href: '/dashboard' },
  { label: 'Signals', icon: '⌁', href: '/signals' },
  { label: 'Copy trader', icon: '⇄', href: '/copy-trader' },
  { label: 'Risk calculator', icon: '◉', href: '/risk-calculator' },
  { label: 'Trade academy', icon: '◇', href: '/trade-academy' },
  { label: 'Manual trader', icon: '▣', href: '/manual-trader' },
  { label: 'Bulk trader', icon: '▤', href: '/bulk-trader' },
  { label: 'Bot builder', icon: '⚙', href: '/bot-builder' },
  { label: 'Free bots', icon: '♟', href: '/free-bots' },
  { label: 'Charts', icon: '▥', href: '/charts' },
  { label: 'Auto trader', icon: '◌', href: '/auto-trader' },
  { label: 'Analysis tool', icon: '⌕', href: '/analysis-tool' },
  { label: 'Manual chart', icon: '▦', href: '/manual-chart' },
  { label: 'Speedbot', icon: 'ϟ', href: '/speedbot' },
];

function RiskDisclaimer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="risk-floating-button"
        onClick={() => setOpen(true)}
        aria-label="Open risk disclaimer"
      >
        <span className="risk-floating-icon">!</span>
        <span>Risk Disclaimer</span>
      </button>

      {open && (
        <div
          className="risk-overlay"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            className="risk-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="risk-title"
          >
            <div className="risk-modal-header">
              <div className="risk-modal-icon">!</div>

              <div>
                <div className="risk-modal-label">IMPORTANT</div>
                <h2 id="risk-title">Risk Disclaimer</h2>
              </div>

              <button
                type="button"
                className="risk-close"
                onClick={() => setOpen(false)}
                aria-label="Close risk disclaimer"
              >
                ×
              </button>
            </div>

            <p className="risk-intro">
              Star Traders offers complex derivatives such as options and
              contracts for difference (CFDs). These products may not be
              suitable for all clients, and trading them puts your capital at
              risk.
            </p>

            <div className="risk-warning">
              <strong>Before trading:</strong>
              <span>
                Please make sure you understand the products you are trading
                and the risks involved.
              </span>
            </div>

            <div className="risk-points">
              <div className="risk-point">
                <span>01</span>
                <p>
                  Trading derivatives can result in losses and your capital is
                  at risk.
                </p>
              </div>

              <div className="risk-point">
                <span>02</span>
                <p>
                  Complex trading products may not be suitable for every
                  client.
                </p>
              </div>

              <div className="risk-point">
                <span>03</span>
                <p>
                  Understand the product and its risks before placing a trade.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="risk-understand"
              onClick={() => setOpen(false)}
            >
              I Understand
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function AiButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="ai-floating-button"
        onClick={() => setOpen(true)}
        aria-label="Open AI assistant"
      >
        <span className="ai-online"></span>
        <span>AI</span>
      </button>

      {open && (
        <div
          className="ai-overlay"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            className="ai-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="ai-logo">AI</div>
            <h3>Star Traders AI</h3>
            <p>
              Your AI trading assistant will be available here for market
              analysis, strategy support and trading tools.
            </p>

            <button
              type="button"
              className="ai-close"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function DashboardPage() {
  const { activeAccount } = useDeriv();

  const accountId =
    activeAccount?.account_id ||
    activeAccount?.loginid ||
    'Trader';

  return (
    <div className="st-dashboard">

      {/* TOP BAR */}
      <header className="st-topbar">
        <div className="st-top-left">
          <button
            type="button"
            className="st-menu-button"
            aria-label="Open menu"
          >
            ☰
          </button>

          <span className="st-phone-icon">☎</span>

          <button
            type="button"
            className="st-refresh-button"
            aria-label="Refresh"
            onClick={() => window.location.reload()}
          >
            ↻
          </button>
        </div>

        <div className="st-top-right">
          <span className="st-user-dot"></span>
          <span className="st-top-account">{accountId}</span>
          <span className="st-chevron">⌄</span>
        </div>
      </header>

      {/* MAIN NAVIGATION */}
      <nav className="st-navigation">
        <div className="st-nav-scroll">
          {NAV_ITEMS.map((item, index) => (
            <a
              key={item.label}
              href={item.href}
              className={
                index === 0
                  ? 'st-nav-item st-nav-active'
                  : 'st-nav-item'
              }
            >
              <span className="st-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </div>
      </nav>

      {/* PAGE */}
      <main className="st-main">

        {/* WELCOME HERO */}
        <section className="st-welcome">

          <div className="st-welcome-pattern"></div>

          <div className="st-welcome-content">
            <h1>
              Hello {accountId}
              <span className="st-wave">👋</span>
            </h1>

            <p>
              &quot;Discipline beats intelligence in the long run.&quot;
            </p>
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="st-quick-section">

          <div className="st-section-title">
            <span></span>
            <h2>QUICK ACTIONS</h2>
            <span></span>
          </div>

          <div className="st-quick-grid">
            {QUICK_ACTIONS.map((action) => (
              <a
                key={action.title}
                href={action.href}
                className={`st-action-card st-${action.color}`}
              >
                <div className="st-action-icon">
                  {action.icon}
                </div>

                <div className="st-action-arrow">
                  →
                </div>

                <h3>{action.title}</h3>

                <p>{action.description}</p>

                <div className="st-action-divider"></div>

                <span className="st-action-open">
                  Open →
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* PARTNER REFERRAL */}
        <section className="st-partner-card">

          <div className="st-partner-main">

            <div className="st-partner-label">
              PARTNER REFERRAL
            </div>

            <h2>
              Master Partner share
            </h2>

            <p>
              Earn from partners who join Deriv through your Master Partner
              referral link.
            </p>

            <button
              type="button"
              className="st-show-more"
              onClick={() => {
                window.alert(
                  'Partner referral details will be available here.'
                );
              }}
            >
              Show more ↓
            </button>

          </div>

          <div className="st-partner-side">
            <span className="st-earn-pill">
              Earn monthly
            </span>

            <button
              type="button"
              className="st-refer-button"
              onClick={() => {
                window.alert(
                  'Partner referral will be connected here.'
                );
              }}
            >
              Refer a partner →
            </button>
          </div>

        </section>

      </main>

      {/* FLOATING CONTROLS */}
      <RiskDisclaimer />
      <AiButton />

    </div>
  );
}
