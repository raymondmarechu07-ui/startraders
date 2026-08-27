"use client";

import React from "react";

/*
===========================================================
 STARTRADERS DASHBOARD
===========================================================

IMPORTANT:
This page is ONLY responsible for the dashboard content.

DO NOT add:
- Account Balance statistic card
- Today's P/L statistic card
- Win Rate statistic card
- Active Bots statistic card
- "Connected to Deriv" message
- Duplicate AI button
- Duplicate Risk Disclaimer button

The account balance, AI button, Risk Disclaimer and other
global application elements should remain controlled by the
existing application layout/components.

===========================================================
*/

const quickActions = [
  {
    title: "Upload Bot",
    description: "Import an XML bot from your computer.",
    icon: "📁",
    accent: "orange",
    href: "/upload-bot",
  },
  {
    title: "Free Bots",
    description: "Browse ready-made trading strategies.",
    icon: "🤖",
    accent: "green",
    href: "/free-bots",
  },
  {
    title: "Bot Editor",
    description: "Build a custom bot with the visual editor.",
    icon: "🧩",
    accent: "purple",
    href: "/bot-builder",
  },
  {
    title: "Quick Strategy",
    description: "Start fast with a pre-built strategy template.",
    icon: "⚡",
    accent: "yellow",
    href: "/strategy",
  },
];

function QuickActionCard({ action }) {
  return (
    <a
      href={action.href}
      className={`quick-action-card ${action.accent}`}
    >
      <div className="quick-action-header">
        <div className="quick-action-icon">
          {action.icon}
        </div>

        <div className="quick-action-arrow">
          →
        </div>
      </div>

      <h3>{action.title}</h3>

      <p>{action.description}</p>

      <div className="quick-action-line" />

      <span className="quick-action-open">
        Open →
      </span>
    </a>
  );
}

export default function DashboardPage() {
  return (
    <>
      <style jsx global>{`

        /* =====================================================
           BASE
        ===================================================== */

        *,
        *::before,
        *::after {
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
          color: #ffffff;
        }

        a {
          color: inherit;
          text-decoration: none;
        }


        /* =====================================================
           DASHBOARD ROOT

           FULL WIDTH.

           This is the important correction from the previous
           version. There is NO narrow phone-sized wrapper.
        ===================================================== */

        .star-dashboard {
          width: 100%;
          min-height: calc(100vh - 110px);
          background: #06101f;
          overflow-x: hidden;
        }


        /* =====================================================
           MAIN CONTENT

           Wide enough for desktop and TV.

           It remains centered only to keep very large screens
           comfortable. It does NOT create the narrow squeezed
           appearance from the previous version.
        ===================================================== */

        .star-dashboard-inner {
          width: 100%;
          max-width: 1480px;
          margin: 0 auto;
          padding: 0 42px 80px;
        }


        /* =====================================================
           HERO

           DBT-style wide hero.

           NO "Connected to Deriv" message.
        ===================================================== */

        .star-dashboard-hero {
          position: relative;
          width: 100%;
          min-height: 250px;
          margin: 0 0 32px;

          display: flex;
          align-items: center;
          justify-content: center;

          overflow: hidden;

          border-left: 1px solid rgba(59, 117, 174, 0.16);
          border-right: 1px solid rgba(59, 117, 174, 0.16);
          border-bottom: 1px solid rgba(59, 117, 174, 0.18);

          background:
            radial-gradient(
              ellipse at center,
              rgba(19, 74, 130, 0.45) 0%,
              rgba(10, 42, 76, 0.55) 42%,
              rgba(6, 25, 46, 0.95) 100%
            );
        }


        /* Subtle dotted background like the reference */

        .star-dashboard-hero::before {
          content: "";
          position: absolute;
          inset: 0;

          background-image:
            radial-gradient(
              rgba(78, 137, 193, 0.34) 1px,
              transparent 1px
            );

          background-size: 24px 24px;

          opacity: 0.45;

          pointer-events: none;
        }


        /* Soft center lighting */

        .star-dashboard-hero::after {
          content: "";
          position: absolute;
          width: 65%;
          height: 100%;
          left: 17.5%;
          top: 0;

          background:
            radial-gradient(
              ellipse at center,
              rgba(35, 100, 166, 0.18),
              transparent 70%
            );

          pointer-events: none;
        }


        .hero-content {
          position: relative;
          z-index: 2;

          width: 100%;
          padding: 55px 25px;

          text-align: center;
        }


        .hero-title {
          margin: 0;

          color: #ffffff;

          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;

          font-size: clamp(34px, 4vw, 58px);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -1.8px;
        }


        .hero-subtitle {
          margin: 18px 0 0;

          color: #a9bcd0;

          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            sans-serif;

          font-size: clamp(13px, 1.2vw, 16px);
          font-style: italic;
          line-height: 1.5;
        }


        /* =====================================================
           QUICK ACTIONS SECTION
        ===================================================== */

        .quick-actions-section {
          width: 100%;
          margin-top: 0;
        }


        .quick-actions-heading {
          width: 100%;

          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;

          margin: 0 0 15px;

          color: #8fa9c3;

          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
        }


        .quick-actions-heading::before,
        .quick-actions-heading::after {
          content: "";

          flex: 1;

          height: 1px;

          background: rgba(77, 124, 164, 0.25);
        }


        /* =====================================================
           QUICK ACTION GRID

           DESKTOP = FOUR ACROSS
        ===================================================== */

        .quick-actions-grid {
          width: 100%;

          display: grid;

          grid-template-columns:
            repeat(4, minmax(0, 1fr));

          gap: 18px;
        }


        /* =====================================================
           QUICK ACTION CARD
        ===================================================== */

        .quick-action-card {
          position: relative;

          width: 100%;
          min-height: 215px;

          display: flex;
          flex-direction: column;

          padding: 18px 17px 15px;

          border:
            1px solid
            rgba(69, 119, 166, 0.42);

          border-top-width: 3px;

          border-radius: 13px;

          background:
            linear-gradient(
              145deg,
              #102642 0%,
              #0c1e35 100%
            );

          transition:
            transform 0.18s ease,
            background 0.18s ease,
            border-color 0.18s ease;

          overflow: hidden;
        }


        .quick-action-card:hover {
          transform: translateY(-3px);

          background:
            linear-gradient(
              145deg,
              #142d4c 0%,
              #102641 100%
            );
        }


        /* Accent borders */

        .quick-action-card.orange {
          border-top-color: #ff7043;
        }

        .quick-action-card.green {
          border-top-color: #00d084;
        }

        .quick-action-card.purple {
          border-top-color: #a66cff;
        }

        .quick-action-card.yellow {
          border-top-color: #ffd21c;
        }


        /* =====================================================
           CARD HEADER
        ===================================================== */

        .quick-action-header {
          width: 100%;

          display: flex;
          align-items: flex-start;
          justify-content: space-between;

          margin-bottom: 17px;
        }


        .quick-action-icon {
          width: 43px;
          height: 43px;

          display: flex;
          align-items: center;
          justify-content: center;

          border:
            1px solid
            rgba(62, 126, 181, 0.42);

          border-radius: 11px;

          background:
            rgba(27, 65, 99, 0.82);

          font-size: 21px;
        }


        .quick-action-arrow {
          width: 23px;
          height: 23px;

          display: flex;
          align-items: center;
          justify-content: center;

          border:
            1px solid
            rgba(69, 124, 173, 0.48);

          border-radius: 6px;

          background:
            rgba(21, 56, 89, 0.82);

          color: #8cb2d5;

          font-size: 13px;
          font-weight: 700;
        }


        /* =====================================================
           CARD TEXT
        ===================================================== */

        .quick-action-card h3 {
          margin: 0;

          color: #ffffff;

          font-size: 16px;
          font-weight: 800;
          line-height: 1.25;
        }


        .quick-action-card p {
          margin: 8px 0 0;

          max-width: 260px;

          color: #91aac1;

          font-size: 12px;
          line-height: 1.48;
        }


        /* =====================================================
           CARD FOOTER
        ===================================================== */

        .quick-action-line {
          width: 100%;
          height: 1px;

          margin-top: auto;
          margin-bottom: 11px;

          background:
            rgba(73, 120, 161, 0.25);
        }


        .quick-action-open {
          font-size: 11px;
          font-weight: 800;
        }


        .quick-action-card.orange
        .quick-action-open {
          color: #ff7043;
        }


        .quick-action-card.green
        .quick-action-open {
          color: #00d084;
        }


        .quick-action-card.purple
        .quick-action-open {
          color: #ac7bff;
        }


        .quick-action-card.yellow
        .quick-action-open {
          color: #ffd21c;
        }


        /* =====================================================
           PARTNER REFERRAL
        ===================================================== */

        .partner-referral {
          width: 100%;

          margin-top: 20px;

          padding: 23px 25px;

          display: grid;

          grid-template-columns:
            minmax(0, 1fr)
            auto;

          align-items: center;

          gap: 30px;

          border:
            1px solid
            rgba(67, 116, 163, 0.42);

          border-radius: 16px;

          background:
            linear-gradient(
              145deg,
              #102642 0%,
              #0d2038 100%
            );
        }


        .partner-label {
          margin: 0 0 5px;

          color: #ff5f83;

          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.7px;
        }


        .partner-title {
          margin: 0;

          color: #ffffff;

          font-size: 20px;
          font-weight: 700;
        }


        .partner-description {
          margin: 7px 0 0;

          color: #9db3c8;

          font-size: 13px;
          line-height: 1.5;
        }


        .partner-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }


        .partner-button {
          min-height: 39px;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          padding: 0 17px;

          border:
            1px solid
            rgba(73, 128, 177, 0.46);

          border-radius: 8px;

          background:
            rgba(12, 39, 65, 0.82);

          color: #d9e8f5;

          font-size: 11px;
          font-weight: 800;

          transition: 0.16s ease;
        }


        .partner-button:hover {
          background:
            rgba(24, 61, 94, 0.95);
        }


        .partner-button.primary {
          border-color: #ff5f83;

          background: #ff5f83;

          color: #ffffff;
        }


        .partner-button.primary:hover {
          background: #ff496f;
        }


        /* =====================================================
           LARGE DESKTOP / TV
        ===================================================== */

        @media (min-width: 1700px) {

          .star-dashboard-inner {
            max-width: 1650px;

            padding-left: 55px;
            padding-right: 55px;
          }


          .star-dashboard-hero {
            min-height: 285px;
          }


          .hero-content {
            padding-top: 70px;
            padding-bottom: 70px;
          }


          .quick-actions-grid {
            gap: 22px;
          }


          .quick-action-card {
            min-height: 235px;
            padding: 21px 20px 17px;
          }


          .quick-action-card h3 {
            font-size: 17px;
          }


          .quick-action-card p {
            font-size: 13px;
          }
        }


        /* =====================================================
           TABLET
           
           TWO CARDS PER ROW.
        ===================================================== */

        @media (max-width: 1000px) {

          .star-dashboard-inner {
            padding-left: 25px;
            padding-right: 25px;
          }


          .quick-actions-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }


          .partner-referral {
            grid-template-columns: 1fr;
            gap: 18px;
          }


          .partner-actions {
            justify-content: flex-start;
          }
        }


        /* =====================================================
           PHONE
           
           ONE CARD PER ROW.
        ===================================================== */

        @media (max-width: 650px) {

          .star-dashboard-inner {
            padding-left: 13px;
            padding-right: 13px;
            padding-bottom: 55px;
          }


          .star-dashboard-hero {
            min-height: 205px;
            margin-bottom: 25px;
          }


          .hero-content {
            padding:
              50px
              14px
              40px;
          }


          .hero-title {
            font-size: clamp(
              28px,
              9vw,
              40px
            );

            letter-spacing: -1px;
          }


          .hero-subtitle {
            margin-top: 13px;
            font-size: 12px;
          }


          .quick-actions-heading {
            font-size: 10px;
            letter-spacing: 1.5px;
          }


          .quick-actions-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }


          .quick-action-card {
            min-height: 180px;
          }


          .partner-referral {
            padding: 19px;
          }


          .partner-title {
            font-size: 18px;
          }


          .partner-description {
            font-size: 12px;
          }


          .partner-actions {
            width: 100%;

            flex-direction: column;
            align-items: stretch;
          }


          .partner-button {
            width: 100%;
          }
        }


        /* =====================================================
           SMALL PHONE
        ===================================================== */

        @media (max-width: 380px) {

          .star-dashboard-inner {
            padding-left: 9px;
            padding-right: 9px;
          }


          .star-dashboard-hero {
            min-height: 185px;
          }


          .hero-title {
            font-size: 27px;
          }


          .hero-subtitle {
            font-size: 11px;
          }


          .quick-action-card {
            min-height: 170px;
          }
        }

      `}</style>


      {/* =====================================================
          DASHBOARD
      ===================================================== */}

      <main className="star-dashboard">

        <div className="star-dashboard-inner">


          {/* =================================================
              HERO
          ================================================= */}

          <section className="star-dashboard-hero">

            <div className="hero-content">

              <h1 className="hero-title">
                Hello DOT94329668 👋
              </h1>

              <p className="hero-subtitle">
                "Discipline beats intelligence in the long run."
              </p>

            </div>

          </section>


          {/* =================================================
              QUICK ACTIONS
          ================================================= */}

          <section className="quick-actions-section">

            <div className="quick-actions-heading">
              <span>Quick Actions</span>
            </div>


            <div className="quick-actions-grid">

              {quickActions.map((action) => (
                <QuickActionCard
                  key={action.title}
                  action={action}
                />
              ))}

            </div>

          </section>


          {/* =================================================
              PARTNER REFERRAL
          ================================================= */}

          <section className="partner-referral">

            <div className="partner-content">

              <div className="partner-label">
                PARTNER REFERRAL
              </div>

              <h2 className="partner-title">
                Master Partner share
              </h2>

              <p className="partner-description">
                Earn from partners who join Deriv through your
                Master Partner referral link.
              </p>

            </div>


            <div className="partner-actions">

              <a
                href="/partner"
                className="partner-button"
              >
                Show more ↓
              </a>

              <a
                href="/partner"
                className="partner-button primary"
              >
                Refer a partner →
              </a>

            </div>

          </section>

        </div>

      </main>
    </>
  );
}
