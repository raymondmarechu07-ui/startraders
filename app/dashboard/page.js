"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
  const [showRisk, setShowRisk] = useState(false);

  const quickActions = [
    {
      title: "Upload Bot",
      description: "Import an XML bot from your computer.",
      icon: "📁",
      href: "/upload",
      className: styles.orange,
    },
    {
      title: "Free Bots",
      description: "Browse ready-made trading strategies.",
      icon: "🤖",
      href: "/free-bots",
      className: styles.green,
    },
    {
      title: "Bot Editor",
      description: "Build a custom bot with the visual editor.",
      icon: "🧩",
      href: "/bot-builder",
      className: styles.purple,
    },
    {
      title: "Quick Strategy",
      description: "Start fast with a pre-built strategy template.",
      icon: "⚡",
      href: "/strategy",
      className: styles.yellow,
    },
  ];

  return (
    <main className={styles.dashboard}>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroPattern}></div>

        <div className={styles.heroContent}>
          <h1 className={styles.greeting}>
            Hello <span>DOT94329668</span> <span className={styles.wave}>👋</span>
          </h1>

          <p className={styles.quote}>
            "Discipline beats intelligence in the long run."
          </p>
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section className={styles.quickActionsSection}>
        <div className={styles.sectionHeading}>
          <span></span>
          <h2>QUICK ACTIONS</h2>
          <span></span>
        </div>

        <div className={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className={`${styles.actionCard} ${action.className}`}
            >
              <div className={styles.actionTop}>
                <div className={styles.actionIcon}>{action.icon}</div>
                <div className={styles.arrowButton}>→</div>
              </div>

              <h3>{action.title}</h3>

              <p>{action.description}</p>

              <div className={styles.actionBottom}>
                <span>Open →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* PARTNER REFERRAL */}
      <section className={styles.partnerCard}>
        <div className={styles.partnerTop}>
          <div>
            <div className={styles.partnerLabel}>PARTNER REFERRAL</div>

            <h2>Master Partner share</h2>

            <p>
              Earn from partners who join Deriv through your Master Partner
              referral link.
            </p>
          </div>

          <span className={styles.earnBadge}>Earn monthly</span>
        </div>

        <div className={styles.partnerActions}>
          <button className={styles.showMoreButton}>
            Show more ↓
          </button>

          <Link href="/partner" className={styles.referButton}>
            Refer a partner →
          </Link>
        </div>
      </section>

      {/* RISK DISCLAIMER */}
      <div className={styles.riskWrapper}>
        {showRisk && (
          <div className={styles.riskPanel}>
            <div className={styles.riskPanelHeader}>
              <strong>Risk Disclaimer</strong>

              <button
                onClick={() => setShowRisk(false)}
                className={styles.closeRisk}
                aria-label="Close risk disclaimer"
              >
                ×
              </button>
            </div>

            <p>
              Trading involves substantial risk and may result in the loss of
              your invested capital. Past performance does not guarantee
              future results.
            </p>

            <p>
              Star Traders provides trading tools, strategies and educational
              information. These tools do not constitute financial advice or a
              guarantee of profit.
            </p>

            <p>
              Always understand the risks before trading and only trade with
              money you can afford to lose.
            </p>
          </div>
        )}

        <button
          className={styles.riskButton}
          onClick={() => setShowRisk((current) => !current)}
        >
          ⚠ Risk Disclaimer
        </button>
      </div>
    </main>
  );
}
