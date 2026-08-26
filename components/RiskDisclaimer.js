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

        <p className="rd-note">
          <strong>About third-party services:</strong> Star Traders is an independent
          third-party platform and is not Deriv. Deriv is a separate trading service. Where
          applicable, users may be redirected to or connected with third-party services subject
          to those providers&apos; own terms, conditions, and risk disclosures. Star Traders is
          not owned, operated, regulated, or endorsed by Deriv.
        </p>

        <p className="rd-note">
          Trading involves risk, and you are solely responsible for your trading decisions and
          their consequences. Before trading, make sure you understand the risks involved and
          consider whether trading is appropriate for your financial circumstances. If you are
          uncertain, seek independent professional advice. This disclaimer is not a substitute
          for professional legal advice.
        </p>

        <p className="rd-ack">
          By using Star Traders and its trading-related features, you acknowledge that you
          understand and accept the risks associated with trading.
        </p>
      </div>
    </section>
  );
}
