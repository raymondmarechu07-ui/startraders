'use client';

import { useEffect, useRef, useState } from 'react';
import { useDeriv } from '@/context/DerivProvider';
import RiskDisclaimer from '@/components/RiskDisclaimer';

const SCAN_MESSAGES = [
  'Scanning trade signals...',
  'Connecting to markets...',
  'Loading your dashboard...',
  'Almost ready...',
];

const HEADLINE_PHRASES = [
  'Welcome to Star Traders',
  'AI bots that trade while you sleep',
  'Copy top traders in real time',
  'Your ultimate partner in trading success',
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
          nextTimer = setTimeout(erasePhrase, 1500);
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

  const activeDot = Math.min(4, Math.floor(progress / 20));

  if (loading) {
    return (
      <div id="loading-screen">
        <div className="load-background-grid" aria-hidden="true" />

        <div className="load-side load-side-left">
          <div className="side-badge">🔒 SECURE CONNECTION</div>
          <span>YOUR DATA IS ENCRYPTED</span>
        </div>

        <div className="load-side load-side-right">
          <div className="side-badge">⚡ REAL OPPORTUNITIES</div>
          <span>POWERED BY TRADERS</span>
        </div>

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

          <div className="welcome-h">Welcome to Star Traders</div>
          <div className="welcome-p">
            We&apos;re preparing your trading workspace.
          </div>

          <div className="load-steps">
            <div className="load-step done">
              <span>✓</span>
              <b>Verifying your account</b>
              <em>Complete</em>
            </div>
            <div className="load-step done">
              <span>✓</span>
              <b>Connecting your trading session</b>
              <em>Complete</em>
            </div>
            <div className="load-step active">
              <span className="step-spinner" />
              <b>Securing your session</b>
              <em>In progress</em>
            </div>
            <div className="load-step">
              <span>○</span>
              <b>Preparing your dashboard</b>
              <em>Pending</em>
            </div>
          </div>

          <div className="progress-row">
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="progress-pct">{Math.floor(progress)}%</div>
          </div>

          <div className="scan-row">
            <div className="spinner" />
            <span>{SCAN_MESSAGES[scanMsgIndex]}</span>
          </div>

          <div className="dots">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={i === activeDot ? 'dot active' : 'dot'}
              />
            ))}
          </div>

          <div className="feature-icons">
            <div className="feature-icon">
              <div className="circle">▥</div>
              Advanced Charts
            </div>
            <div className="feature-icon">
              <div className="circle">▣</div>
              Trading Bots
            </div>
            <div className="feature-icon">
              <div className="circle">↻</div>
              Copy Trading
            </div>
          </div>

          <div className="prep-text">
            Great trades start with great preparation.
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
        <span>‹</span>
        <b>BULL MARKET ---</b>
        <b>BEAR MARKET ---</b>
        <b>VOL 10 ---</b>
        <b>VOL 25 ---</b>
        <b>VOL 50 ---</b>
        <b>VOL 75 ---</b>
        <b>VOL 100 ---</b>
        <b>VOL 100 (15) ---</b>
        <span>›</span>
      </div>

      <section className="hero">
        <div className="hero-bg" aria-hidden="true" />

        <div className="trust-pill-outline">
          ⚡ Trusted by 50,000+ traders worldwide ⭐
        </div>

        <div className="hero-headline">
          {headline}
          <span className="cursor">|</span>
        </div>

        <p className="hero-copy">
          We don&apos;t just teach trading — we build traders. AI bots, copy
          trading, and real-time signals in one hub.
        </p>

        <button className="btn-cta-lg" onClick={login}>
          Start Trading Now →
        </button>

        <div className="check-row">
          <span>✓ No credit card required</span>
          <span>✓ $10,000 virtual account</span>
        </div>

        <div className="testimonial-grid">
          <div className="t-card-v2">
            <div className="t-avatar">MG</div>
            <p className="quote">
              &quot;The automated bots execute strategies smoothly and the
              platform is intuitive and powerful.&quot;
            </p>
            <div className="t-name">Mark Gonzales</div>
            <div className="t-role">Professional day trader</div>
            <div className="t-stars">★★★★★</div>
          </div>

          <div className="t-card-v2">
            <div className="t-avatar">PR</div>
            <p className="quote">
              &quot;Copy trading lets me follow verified performers while
              keeping control of my capital.&quot;
            </p>
            <div className="t-name">Priya R.</div>
            <div className="t-role">Swing trader</div>
            <div className="t-stars">★★★★★</div>
          </div>

          <div className="t-card-v2">
            <div className="t-avatar">KO</div>
            <p className="quote">
              &quot;Signals are fast and the risk tools help me stay
              disciplined.&quot;
            </p>
            <div className="t-name">Kwame O.</div>
            <div className="t-role">Day trader</div>
            <div className="t-stars">★★★★★</div>
          </div>

          <div className="t-card-v2">
            <div className="t-avatar">KM</div>
            <p className="quote">
              &quot;The transparency and control make the trading workflow
              much easier.&quot;
            </p>
            <div className="t-name">Kelvin M.</div>
            <div className="t-role">Crypto investor</div>
            <div className="t-stars">★★★★★</div>
          </div>
        </div>

        <div className="stats-circles">
          <div className="stat-circle">
            <div className="ring">50K+</div>
            <div className="label">Active traders</div>
          </div>
          <div className="stat-circle">
            <div className="ring">$2.5B+</div>
            <div className="label">Trading volume</div>
          </div>
          <div className="stat-circle">
            <div className="ring">99.9%</div>
            <div className="label">Uptime</div>
          </div>
          <div className="stat-circle">
            <div className="ring">150+</div>
            <div className="label">Trading pairs</div>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="section-head">
          <div className="tag">WHY STARTRADERS</div>
          <h2>Why Choose StarTraders?</h2>
          <p>
            Join the platform that brings practical trading tools,
            automation, analysis, and risk management into one workspace.
          </p>
        </div>

        <div className="why-list">
          {[
            'Bank-grade security with encrypted sessions',
            'Lightning-fast execution under 50ms',
            'Virtual account for risk-free testing',
            '24/7 customer support and trading resources',
            'Multi-asset trading across forex, crypto, and indices',
            'Mobile-ready trading workspace',
          ].map((text) => (
            <div className="why-item" key={text}>
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

      <RiskDisclaimer />

      <footer>
        Trading involves risk. Please trade responsibly and only trade with
        funds you can afford to lose.
      </footer>
    </div>
  );
}
