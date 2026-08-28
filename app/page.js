'use client';

import { useEffect, useRef, useState } from 'react';
import { useDeriv } from '@/context/DerivProvider';
import RiskDisclaimer from '@/components/RiskDisclaimer';

const SCAN_MESSAGES = [
  'Setting up your trading session...',
  'Connecting to markets...',
  'Loading your dashboard...',
  'Almost ready...',
];

const HEADLINE_PHRASES = [
  'Simplify your market',
  'AI bots that trade while you sleep',
  'Copy top traders in real time',
  'Your ultimate partner in trading success',
];

const TICKER_ITEMS = [
  { name: 'R_75', value: '6,916.67', change: '+0.12%', up: true },
  { name: 'R_100', value: '8,329.80', change: '-0.08%', up: false },
  { name: 'Boom 500', value: '12,511.46', change: '+0.15%', up: true },
  { name: 'Crash 500', value: '9,025.69', change: '-0.13%', up: false },
  { name: 'Vol 25', value: '1,556.98', change: '+0.10%', up: true },
];

const MARKET_TABS = [
  'BULL MARKET',
  'BEAR MARKET',
  'VOL 10',
  'VOL 25',
  'VOL 50',
  'VOL 75',
  'VOL 10 (1S)',
  'VOL 100 (1S)',
];

export default function HomePage() {
  const { login } = useDeriv();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [scanMsgIndex, setScanMsgIndex] = useState(0);
  const [headline, setHeadline] = useState('');
  const phraseRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(100, p + 2);
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 500);
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const idx = Math.min(
      SCAN_MESSAGES.length - 1,
      Math.floor(progress / 26)
    );
    setScanMsgIndex(idx);
  }, [progress]);

  useEffect(() => {
    if (loading) return;

    let cancelled = false;
    let typeTimer;
    let eraseTimer;
    let nextTimer;

    function typePhrase() {
      if (cancelled) return;

      const text = HEADLINE_PHRASES[phraseRef.current];
      let i = 0;

      typeTimer = setInterval(() => {
        if (cancelled) {
          clearInterval(typeTimer);
          return;
        }

        i += 1;
        setHeadline(text.slice(0, i));

        if (i >= text.length) {
          clearInterval(typeTimer);
          nextTimer = setTimeout(erasePhrase, 1800);
        }
      }, 55);
    }

    function erasePhrase() {
      if (cancelled) return;

      const text = HEADLINE_PHRASES[phraseRef.current];
      let i = text.length;

      eraseTimer = setInterval(() => {
        if (cancelled) {
          clearInterval(eraseTimer);
          return;
        }

        i -= 1;
        setHeadline(text.slice(0, i));

        if (i <= 0) {
          clearInterval(eraseTimer);
          phraseRef.current =
            (phraseRef.current + 1) % HEADLINE_PHRASES.length;
          nextTimer = setTimeout(typePhrase, 300);
        }
      }, 30);
    }

    typePhrase();

    return () => {
      cancelled = true;
      clearInterval(typeTimer);
      clearInterval(eraseTimer);
      clearTimeout(nextTimer);
    };
  }, [loading]);

  if (loading) {
    return (
      <div id="loading-screen">
        <div className="load-candles-bg" aria-hidden="true" />
        <div className="load-background-grid" aria-hidden="true" />

        <div className="load-card">
          <div className="logo-row">
            <svg className="star-icon" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L14.6 9H21.5L15.9 13.2L18.1 20L12 15.9L5.9 20L8.1 13.2L2.5 9H9.4L12 2Z"
                fill="url(#starGrad)"
              />
              <defs>
                <linearGradient id="starGrad" x1="0" y1="0" x2="24" y2="24">
                  <stop offset="0%" stopColor="#18d9ff" />
                  <stop offset="100%" stopColor="#ff6b4a" />
                </linearGradient>
              </defs>
            </svg>

            <div className="wordmark wordmark-big">
              <span className="star">STAR</span>
              <span className="traders">TRADERS</span>
            </div>
          </div>

          <div className="subline">
            TRADING HUB
            <span className="live-pill">
              <span className="live-dot" />
              LIVE
            </span>
          </div>

          <div className="divider" />

          <div className="scan-row">
            <div className="spinner" />
            <span>{SCAN_MESSAGES[scanMsgIndex]}</span>
            <span className="progress-pct">{Math.floor(progress)}%</span>
          </div>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="feature-icons">
            <div className="feature-icon">
              <div className="circle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l8 4v6c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-4z" />
                </svg>
              </div>
              Secure Connection
            </div>
            <div className="feature-icon">
              <div className="circle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
                </svg>
              </div>
              Lightning Fast Access
            </div>
            <div className="feature-icon">
              <div className="circle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              Built for Traders
            </div>
          </div>
        </div>

        <div className="load-ticker">
          <div className="load-ticker-live">
            <span className="live-dot" />
            LIVE MARKETS
          </div>
          {TICKER_ITEMS.map((item) => (
            <div className="load-ticker-item" key={item.name}>
              <b>{item.name}</b>
              <span>{item.value}</span>
              <em className={item.up ? 'up' : 'down'}>
                {item.up ? '▲' : '▼'} {item.change}
              </em>
            </div>
          ))}
          <div className="load-ticker-tag">
            TRADE TODAY, <b>GREATER POSSIBILITIES</b> —
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="homepage" className="visible">
      <nav className="home-nav">
        <div className="nav-logo wordmark">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 2L14.6 9H21.5L15.9 13.2L18.1 20L12 15.9L5.9 20L8.1 13.2L2.5 9H9.4L12 2Z"
              fill="url(#starGrad2)"
            />
            <defs>
              <linearGradient id="starGrad2" x1="0" y1="0" x2="24" y2="24">
                <stop offset="0%" stopColor="#18d9ff" />
                <stop offset="100%" stopColor="#ff6b4a" />
              </linearGradient>
            </defs>
          </svg>
          <span className="star">STAR</span>
          <span className="traders">TRADERS</span>
        </div>

        <div className="nav-actions">
          <span>◉ EN</span>
          <span>◉ Support</span>
          <button className="login-btn" onClick={login}>
            Login Now →
          </button>
        </div>
      </nav>

      <div className="market-strip">
        <span className="strip-arrow">‹</span>
        <div className="strip-track">
          {MARKET_TABS.map((label, i) => (
            <b key={label} className={i < 2 ? 'orange' : ''}>
              {label} ---
            </b>
          ))}
        </div>
        <span className="strip-arrow">›</span>
      </div>

      <section className="hero">
        <div className="hero-bg" aria-hidden="true" />

        <div className="trust-pill-outline">
          ⚡ Trusted by 50,000+ Traders Worldwide ⭐
        </div>

        <div className="hero-headline">
          {headline}
          <span className="cursor">|</span>
        </div>

        <div className="hero-sub">
          Automated Trading. <span>Greater Possibilities.</span>
        </div>

        <p className="hero-copy">
          We don&apos;t just teach trading — we build traders. AI bots, copy
          trading, and real-time signals in one hub.
        </p>

        <div className="hero-cta-row">
          <button className="btn-cta-lg" onClick={login}>
            Start Trading Now →
          </button>
          <button className="btn-cta-text" onClick={login}>
            Don&apos;t have an account? <span>Create now</span>
          </button>
        </div>

        <div className="check-row">
          <span>✓ No Credit Card Required</span>
          <span>✓ $10,000 Virtual Account</span>
        </div>

        <div className="testimonial-grid">
          <div className="t-card-v2">
            <div className="t-avatar">RP</div>
            <p className="quote">
              &quot;Clean charting tools and reliable data exports. The risk
              management settings give me real control over drawdown.&quot;
            </p>
            <div className="t-name">Raj Patel</div>
            <div className="t-role">Quantitative Analyst</div>
            <div className="t-stars">★★★★★</div>
          </div>

          <div className="t-card-v2">
            <div className="t-avatar">EP</div>
            <p className="quote">
              &quot;Copying top-performing strategies gave my portfolio
              steady growth without needing to watch charts all day.&quot;
            </p>
            <div className="t-name">Elena Petrova</div>
            <div className="t-role">Portfolio Manager</div>
            <div className="t-stars">★★★★★</div>
          </div>

          <div className="t-card-v2">
            <div className="t-avatar">MG</div>
            <p className="quote">
              &quot;StarTraders transformed my trading. The automated bots
              handle my strategies flawlessly, and the platform is
              intuitive and powerful.&quot;
            </p>
            <div className="t-name">Mark Gonzales</div>
            <div className="t-role">Professional Day Trader</div>
            <div className="t-stars">★★★★★</div>
          </div>

          <div className="t-card-v2">
            <div className="t-avatar">KM</div>
            <p className="quote">
              &quot;Copy trading feature is incredible! I follow top
              performers and my portfolio has grown steadily. The
              transparency and control are unmatched.&quot;
            </p>
            <div className="t-name">Kelvin Maxwell</div>
            <div className="t-role">Crypto Investor</div>
            <div className="t-stars">★★★★★</div>
          </div>
        </div>

        <div className="stats-circles">
          <div className="stat-circle">
            <div className="ring">50K+</div>
            <div className="label">Active Traders</div>
          </div>
          <div className="stat-circle">
            <div className="ring">$2.5B+</div>
            <div className="label">Trading Volume</div>
          </div>
          <div className="stat-circle">
            <div className="ring">99.9%</div>
            <div className="label">Uptime</div>
          </div>
          <div className="stat-circle">
            <div className="ring">150+</div>
            <div className="label">Trading Pairs</div>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="section-head">
          <div className="tag">WHY STARTRADERS</div>
          <h2>Why Choose StarTraders?</h2>
          <p>
            Join the platform that&apos;s redefining automated trading with
            practical tools, analysis, and risk management in one workspace.
          </p>
        </div>

        <div className="why-list">
          {[
            'Bank-grade security with encrypted sessions',
            'Lightning-fast execution under 50ms',
            'Virtual account for risk-free testing',
            '24/7 customer support and trading resources',
            'Multi-asset trading across forex, crypto, and indices',
            'Mobile app for trading on the go',
          ].map((text, i) => (
            <div
              className={i === 4 ? 'why-item featured' : 'why-item'}
              key={text}
            >
              <span>✓</span>
              {text}
            </div>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="section-head">
          <div className="tag">FEATURED</div>
          <h2>Powerful features for modern traders</h2>
          <p>
            Manual decisions, automated execution, copy trading, analysis,
            and risk tools — designed to work together.
          </p>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <div className="icon-box">▣</div>
            <h3>AI-powered trading bots</h3>
            <p>
              Configure, test, and run trading strategies from one
              streamlined workspace.
            </p>
          </div>

          <div className="feature-card pink">
            <div className="icon-box">▥</div>
            <h3>Real-time market analysis</h3>
            <p>
              Track markets, identify setups, and work with professional
              charting tools.
            </p>
          </div>

          <div className="feature-card">
            <div className="icon-box">↻</div>
            <h3>Copy trading network</h3>
            <p>
              Follow verified performers while maintaining control of your
              own trading decisions.
            </p>
          </div>

          <div className="feature-card pink">
            <div className="icon-box">◇</div>
            <h3>Risk management tools</h3>
            <p>
              Build discipline with position sizing, limits, and drawdown
              awareness.
            </p>
          </div>
        </div>
      </section>

      <section className="cta-banner">
        <div className="cta-globe" aria-hidden="true" />
        <div className="cta-arc" aria-hidden="true" />
        <div className="tag">GET STARTED</div>
        <h2>Ready to Transform Your Trading?</h2>
        <p>
          Join 50,000+ traders who are already profiting with StarTraders.
          Start with a free virtual account today.
        </p>
        <button className="btn-cta-lg" onClick={login}>
          Start Free Trial →
        </button>
        <div className="check-row">
          <span>✓ No Credit Card</span>
          <span>✓ $10K Virtual Money</span>
          <span>✓ Full Platform Access</span>
        </div>
      </section>

      <RiskDisclaimer />

      <footer>
        Trading involves risk. Please trade responsibly and only trade with
        funds you can afford to lose.
      </footer>
    </div>
  );
}
