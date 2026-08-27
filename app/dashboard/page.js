'use client';

import { useState } from 'react';
import Link from 'next/link';
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
    href: null,
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
    href: null,
  },
];

export default function DashboardPage() {
  const { activeAccount, isLoggedIn } = useDeriv();

  const [partnerOpen, setPartnerOpen] = useState(false);

  const accountId =
    activeAccount?.account_id ||
    activeAccount?.loginid ||
    'Trader';

  function handleUnavailable(title) {
    alert(`${title} will be available soon.`);
  }

  return (
    <div className="dbt-dashboard">

      {/* TOP ACCOUNT / UTILITY BAR */}
      <UtilityBar />

      {/* MAIN NAVIGATION */}
      <TabNav />

      {/* MAIN DASHBOARD */}
      <main className="dbt-main">

        {/* GREETING AREA */}
        <section className="dbt-greeting">

          <div className="dbt-greeting-pattern"></div>

          <div className="dbt-greeting-content">

            <h1>
              Hello {isLoggedIn ? accountId : 'Trader'}
              <span className="dbt-wave">👋</span>
            </h1>

            <p>
              "Discipline beats intelligence in the long run."
            </p>

          </div>

        </section>

        {/* QUICK ACTIONS */}
        <section className="dbt-quick-section">

          <div className="dbt-section-title">
            QUICK ACTIONS
          </div>

          <div className="dbt-quick-grid">

            {QUICK_ACTIONS.map((action) => {

              const cardContent = (
                <>
                  <div className={`dbt-quick-icon ${action.color}`}>
                    {action.icon}
                  </div>

                  <div className="dbt-card-arrow">
                    →
                  </div>

                  <h3>
                    {action.title}
                  </h3>

                  <p>
                    {action.description}
                  </p>

                  <div className="dbt-card-divider"></div>

                  <span className={`dbt-open ${action.color}`}>
                    Open →
                  </span>
                </>
              );

              if (action.href) {
                return (
                  <Link
                    key={action.title}
                    href={action.href}
                    className={`dbt-quick-card ${action.color}`}
                  >
                    {cardContent}
                  </Link>
                );
              }

              return (
                <button
                  key={action.title}
                  type="button"
                  className={`dbt-quick-card ${action.color}`}
                  onClick={() => handleUnavailable(action.title)}
                >
                  {cardContent}
                </button>
              );
            })}

          </div>

        </section>

        {/* PARTNER REFERRAL */}
        <section className="dbt-partner-section">

          <div className="dbt-partner-card">

            <div className="dbt-partner-content">

              <div className="dbt-partner-label">
                PARTNER REFERRAL
              </div>

              <h2>
                Master Partner share
              </h2>

              <p>
                Earn from partners who join Deriv through your Master
                Partner referral link.
              </p>

            </div>

            <div className="dbt-partner-badge">
              Earn monthly
            </div>

            <div className="dbt-partner-actions">

              <button
                type="button"
                className="dbt-show-more"
                onClick={() => setPartnerOpen((value) => !value)}
              >
                {partnerOpen ? 'Show less ↑' : 'Show more ↓'}
              </button>

              <button
                type="button"
                className="dbt-refer-button"
                onClick={() => handleUnavailable('Partner referral')}
              >
                Refer a partner →
              </button>

            </div>

            {partnerOpen && (
              <div className="dbt-partner-extra">
                Your referral tools and partner information will appear
                here when the partner system is connected.
              </div>
            )}

          </div>

        </section>

      </main>

      {/* FLOATING AI */}
      <AiFab />

    </div>
  );
}
