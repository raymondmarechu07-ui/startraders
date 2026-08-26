const RISK_POINTS = [
  'You may lose some or all of the money you trade.',
  'Past performance, historical results, signals, strategies, or examples do not guarantee future results.',
  'Trading decisions are made at your own risk. Star Traders does not guarantee profits or specific trading outcomes.',
  'Never trade with money you cannot afford to lose, and never trade with borrowed money you cannot afford to repay.',
  'If your trading involves leverage, understand that leverage can magnify both profits and losses.',
  'Market conditions, execution prices, liquidity, volatility, technology, and internet connectivity can all affect trading results.',
  'You are responsible for understanding the products you trade and determining whether they are suitable for you.',
];

export default function RiskDisclaimer() {
  return (
    <section id="risk-disclaimer" aria-labelledby="risk-disclaimer-heading" className="rd-section">
      <div className="rd-card">
        <div className="rd-head">
          <div className="rd-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <path d="M12 9v4M12 17h.01" />
            </svg>
          </div>
          <h2 id="risk-disclaimer-heading">Risk disclaimer</h2>
        </div>

        <p className="rd-intro">
          Star Traders provides trading-related tools, information, market analysis, and other
          platform features for informational and educational purposes only. Nothing on this
          website should be considered financial, investment, legal, or tax advice.
        </p>
        <p className="rd-intro">
          Trading financial products involves significant risk and may result in the loss of
          some or all of your trading capital. Market prices can move rapidly and
          unpredictably, and leverage can increase both potential gains and potential losses.
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

        <div className="rd-divider"></div>

        </p>
      </div>
    </section>
  );
}
