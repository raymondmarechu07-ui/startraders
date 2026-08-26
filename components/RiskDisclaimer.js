const RISK_POINTS = [
  'You may lose some or all of the funds you trade.',
  'Past performance, signals, strategies, and historical results do not guarantee future results.',
  'Leverage can increase both potential profits and potential losses.',
  'Never trade with money you cannot afford to lose.',
];

export default function RiskDisclaimer() {
  return (
    <section
      id="risk-disclaimer"
      aria-labelledby="risk-disclaimer-heading"
      className="rd-section"
    >
      <div className="rd-card">
        <div className="rd-head">
          <div className="rd-icon" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <path d="M12 9v4M12 17h.01" />
            </svg>
          </div>

          <h2 id="risk-disclaimer-heading">Risk Disclaimer</h2>
        </div>

        <p className="rd-intro">
          Trading financial products involves significant risk and may not be
          suitable for everyone. Please understand the risks before trading.
        </p>

        <ul className="rd-list">
          {RISK_POINTS.map((point) => (
            <li key={point}>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <path d="M12 9v4M12 17h.01" />
              </svg>

              <span>{point}</span>
            </li>
          ))}
        </ul>

        <div className="rd-divider" />
      </div>
    </section>
  );
}
