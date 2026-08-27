"use client";

import React from "react";

/*
 * STARTRADERS DASHBOARD
 *
 * IMPORTANT:
 * This file is intentionally focused on the dashboard UI.
 *
 * DO NOT remove or modify:
 * - Deriv authentication
 * - Deriv WebSocket connection
 * - AI assistant
 * - Risk Disclaimer
 * - Existing global navigation
 * - Existing balance/account connection
 *
 * The existing layout/header should continue to provide:
 * - Top navigation
 * - Account balance
 * - Risk Disclaimer button
 * - Floating AI button
 */

const quickActions = [
  {
    title: "Upload Bot",
    description: "Import an XML bot from your computer.",
    icon: "📁",
    color: "orange",
    href: "/upload-bot",
  },
  {
    title: "Free Bots",
    description: "Browse ready-made trading strategies.",
    icon: "🤖",
    color: "green",
    href: "/free-bots",
  },
  {
    title: "Bot Editor",
    description: "Build a custom bot with the visual editor.",
    icon: "🧩",
    color: "purple",
    href: "/bot-builder",
  },
  {
    title: "Quick Strategy",
    description: "Start fast with a pre-built strategy template.",
    icon: "⚡",
    color: "yellow",
    href: "/strategy",
  },
];

function QuickActionCard({ action }) {
  return (
    <a
      href={action.href}
      className={`quick-card quick-card-${action.color}`}
    >
      <div className="quick-card-top">
        <div className="quick-icon">{action.icon}</div>

        <div className="quick-arrow">→</div>
      </div>

      <div className="quick-title">{action.title}</div>

      <div className="quick-description">
        {action.description}
      </div>

      <div className="quick-divider" />

      <div className="quick-open">
        Open <span>→</span>
      </div>
    </a>
  );
}

export default function DashboardPage() {
  /*
   * Keep any existing Deriv/account logic that your project already has.
   *
   * DO NOT replace your authentication or connection code here.
   *
   * The dashboard layout below does not need to know the account balance
   * because the balance is already displayed in the global navigation.
   */

  return (
    <main className="dashboard-page">
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          width: 100%;
          min-height: 100%;
        }

        body {
          background: #06101f;
        }

        a {
          text-decoration: none;
        }

        .dashboard-page {
          width: 100%;
          min-height: calc(100vh - 110px);
          background: #06101f;
          color: #ffffff;
          padding: 0 24px 70px;
          overflow-x: hidden;
        }

        /*
         * MAIN DASHBOARD WIDTH
         *
         * Unlike the previous version, this does NOT use a narrow
         * fixed-width column. It expands naturally across the screen.
         */
        .dashboard-container {
          width: min(1180px, 100%);
          margin: 0 auto;
        }

        /*
         * HERO
         */
        .dashboard-hero {
          width: 100%;
          min-height: 205px;
          margin: 24px auto 34px;
          border: 1px solid rgba(65, 125, 185, 0.20);
          border-radius: 0;
          position: relative;
          overflow: hidden;

          display: flex;
          align-items: center;
          justify-content: center;

          background:
            radial-gradient(
              circle at 50% 40%,
              rgba(20, 87, 153, 0.22),
              transparent 52%
            ),
            linear-gradient(
              135deg,
              #0a2440 0%,
              #09223d 45%,
              #07182c 100%
            );
        }

        /*
         * Subtle DBT-style dotted background.
         */
        .dashboard-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          opacity: 0.42;

          background-image: radial-gradient(
            rgba(75, 143, 205, 0.34) 1px,
            transparent 1px
          );

          background-size: 24px 24px;
          pointer-events: none;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          width: 100%;
          text-align: center;
          padding: 38px 24px;
        }

        .connection-status {
          position: absolute;
          top: 16px;
          right: 20px;

          display: inline-flex;
          align-items: center;
          gap: 7px;

          font-size: 11px;
          color: #8da4bb;
          white-space: nowrap;
        }

        .connection-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #25d9c4;
          box-shadow: 0 0 10px rgba(37, 217, 196, 0.7);
        }

        .hero-title {
          margin: 0;
          font-size: clamp(32px, 4vw, 50px);
          line-height: 1.1;
          font-weight: 800;
          letter-spacing: -1.5px;
        }

        .hero-title span {
          color: #ffffff;
        }

        .hero-subtitle {
          margin: 17px 0 0;
          color: #aebed0;
          font-size: 15px;
          font-style: italic;
          letter-spacing: 0.1px;
        }

        /*
         * QUICK ACTIONS
         */
        .quick-section {
          width: 100%;
          margin-top: 10px;
        }

        .section-label {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;

          margin: 0 0 13px;

          color: #86a9c9;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .section-label::before,
        .section-label::after {
          content: "";
          height: 1px;
          flex: 1;
          max-width: 210px;
          background: rgba(78, 126, 169, 0.20);
        }

        /*
         * FOUR CARDS ACROSS THE DESKTOP
         */
        .quick-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          width: 100%;
        }

        .quick-card {
          min-height: 205px;
          position: relative;

          display: flex;
          flex-direction: column;

          padding: 17px 15px 14px;

          border: 1px solid rgba(73, 120, 165, 0.38);
          border-top-width: 3px;
          border-radius: 14px;

          background: linear-gradient(
            145deg,
            #102542 0%,
            #0d2038 100%
          );

          transition:
            transform 160ms ease,
            border-color 160ms ease,
            background 160ms ease;
        }

        .quick-card:hover {
          transform: translateY(-3px);
          background: linear-gradient(
            145deg,
            #132d4d 0%,
            #102641 100%
          );
        }

        .quick-card-orange {
          border-top-color: #ff7043;
        }

        .quick-card-green {
          border-top-color: #00d084;
        }

        .quick-card-purple {
          border-top-color: #a56cff;
        }

        .quick-card-yellow {
          border-top-color: #ffd21c;
        }

        .quick-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 17px;
        }

        .quick-icon {
          width: 42px;
          height: 42px;

          display: flex;
          align-items: center;
          justify-content: center;

          border: 1px solid rgba(78, 145, 198, 0.35);
          border-radius: 11px;

          background: rgba(25, 65, 98, 0.75);

          font-size: 21px;
        }

        .quick-arrow {
          width: 22px;
          height: 22px;

          display: flex;
          align-items: center;
          justify-content: center;

          border: 1px solid rgba(83, 137, 184, 0.42);
          border-radius: 6px;

          color: #90b7d9;
          background: rgba(23, 60, 94, 0.75);

          font-size: 13px;
        }

        .quick-title {
          color: #ffffff;
          font-size: 15px;
          line-height: 1.25;
          font-weight: 800;
        }

        .quick-description {
          margin-top: 8px;
          min-height: 42px;

          color: #8da9c1;
          font-size: 12px;
          line-height: 1.45;
        }

        .quick-divider {
          width: 100%;
          height: 1px;
          margin-top: auto;
          margin-bottom: 11px;

          background: rgba(82, 126, 163, 0.23);
        }

        .quick-open {
          font-size: 11px;
          font-weight: 800;
        }

        .quick-card-orange .quick-open {
          color: #ff7043;
        }

        .quick-card-green .quick-open {
          color: #00d084;
        }

        .quick-card-purple .quick-open {
          color: #ad79ff;
        }

        .quick-card-yellow .quick-open {
          color: #ffd21c;
        }

        .quick-open span {
          margin-left: 2px;
        }

        /*
         * PARTNER REFERRAL
         */
        .referral-card {
          width: 100%;
          margin-top: 18px;
          padding: 22px 23px;

          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          gap: 20px;

          border: 1px solid rgba(71, 119, 165, 0.38);
          border-radius: 16px;

          background:
            radial-gradient(
              circle at 90% 30%,
              rgba(102, 50, 145, 0.10),
              transparent 40%
            ),
            linear-gradient(
              145deg,
              #102542 0%,
              #0d2038 100%
            );
        }

        .referral-label {
          margin-bottom: 5px;

          color: #ff5f83;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.6px;
        }

        .referral-title {
          margin: 0;
          color: #ffffff;
          font-size: 20px;
          font-weight: 700;
        }

        .referral-description {
          margin: 7px 0 0;
          color: #9bb1c7;
          font-size: 13px;
          line-height: 1.5;
        }

        .referral-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .referral-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          min-height: 39px;
          padding: 0 18px;

          border: 1px solid rgba(81, 135, 181, 0.42);
          border-radius: 8px;

          color: #dceaf7;
          background: rgba(14, 41, 67, 0.8);

          font-size: 11px;
          font-weight: 800;

          transition: 160ms ease;
        }

        .referral-button:hover {
          background: rgba(25, 63, 95, 0.9);
        }

        .referral-button-primary {
          border-color: #ff5f83;
          background: #ff5f83;
          color: #ffffff;
        }

        .referral-button-primary:hover {
          background: #ff496f;
        }

        /*
         * DESKTOP LARGE SCREENS
         *
         * The dashboard expands instead of sitting in the middle
         * as a narrow phone-sized column.
         */
        @media (min-width: 1500px) {
          .dashboard-page {
            padding-left: 40px;
            padding-right: 40px;
          }

          .dashboard-container {
            width: min(1320px, 100%);
          }

          .dashboard-hero {
            min-height: 225px;
          }

          .quick-card {
            min-height: 215px;
          }
        }

        /*
         * TABLETS
         */
        @media (max-width: 900px) {
          .dashboard-page {
            padding-left: 18px;
            padding-right: 18px;
          }

          .quick-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .referral-card {
            grid-template-columns: 1fr;
          }

          .referral-actions {
            justify-content: flex-start;
          }
        }

        /*
         * SMALL TABLETS / LARGE PHONES
         */
        @media (max-width: 600px) {
          .dashboard-page {
            padding-left: 12px;
            padding-right: 12px;
            padding-bottom: 50px;
          }

          .dashboard-hero {
            margin-top: 14px;
            margin-bottom: 25px;
            min-height: 180px;
          }

          .connection-status {
            top: 11px;
            right: 12px;
            font-size: 9px;
          }

          .hero-content {
            padding: 40px 14px 30px;
          }

          .hero-title {
            font-size: clamp(27px, 8vw, 38px);
            letter-spacing: -1px;
          }

          .hero-subtitle {
            font-size: 12px;
            margin-top: 13px;
          }

          .section-label::before,
          .section-label::after {
            max-width: 45px;
          }

          .quick-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .quick-card {
            min-height: 175px;
          }

          .referral-card {
            padding: 18px;
          }

          .referral-title {
            font-size: 18px;
          }

          .referral-actions {
            width: 100%;
            flex-direction: column;
            align-items: stretch;
          }

          .referral-button {
            width: 100%;
          }
        }

        /*
         * VERY SMALL PHONES
         */
        @media (max-width: 380px) {
          .hero-title {
            font-size: 26px;
          }

          .dashboard-hero {
            min-height: 165px;
          }

          .quick-card {
            padding: 15px;
          }
        }

        /*
         * TV / VERY LARGE DISPLAY
         */
        @media (min-width: 1800px) {
          .dashboard-container {
            width: min(1450px, 100%);
          }

          .dashboard-hero {
            min-height: 245px;
          }

          .quick-grid {
            gap: 18px;
          }

          .quick-card {
            min-height: 225px;
            padding: 20px 18px 16px;
          }

          .quick-title {
            font-size: 16px;
          }

          .quick-description {
            font-size: 13px;
          }
        }
      `}</style>

      <div className="dashboard-container">

        {/* HERO */}
        <section className="dashboard-hero">
          <div className="connection-status">
            <span className="connection-dot" />
            Connected to Deriv
          </div>

          <div className="hero-content">
            <h1 className="hero-title">
              Hello DOT94329668 👋
            </h1>

            <p className="hero-subtitle">
              "Discipline beats intelligence in the long run."
            </p>
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="quick-section">
          <div className="section-label">
            Quick Actions
          </div>

          <div className="quick-grid">
            {quickActions.map((action) => (
              <QuickActionCard
                key={action.title}
                action={action}
              />
            ))}
          </div>
        </section>

        {/* PARTNER REFERRAL */}
        <section className="referral-card">
          <div>
            <div className="referral-label">
              PARTNER REFERRAL
            </div>

            <h2 className="referral-title">
              Master Partner share
            </h2>

            <p className="referral-description">
              Earn from partners who join Deriv through your
              Master Partner referral link.
            </p>
          </div>

          <div className="referral-actions">
            <a
              href="/partner"
              className="referral-button"
            >
              Show more ↓
            </a>

            <a
              href="/partner"
              className="referral-button referral-button-primary"
            >
              Refer a partner →
            </a>
          </div>
        </section>

      </div>
    </main>
  );
}
