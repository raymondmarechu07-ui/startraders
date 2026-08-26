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

  // Loading screen progress — runs ~5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(100, p + 8);
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 500);
        }
        return next;
      });
    }, 80);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const idx = Math.min(SCAN_MESSAGES.length - 1, Math.floor(progress / 26));
    setScanMsgIndex(idx);
  }, [progress]);

  // Cycling typewriter headline, starts once loading finishes
  useEffect(() => {
    if (loading) return;
    let cancelled = false;

    function typePhrase() {
      const text = HEADLINE_PHRASES[phraseRef.current];
      let i = 0;
      const typer = setInterval(() => {
        if (cancelled) return clearInterval(typer);
        i++;
        setHeadline(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(typer);
          setTimeout(erasePhrase, 1500);
        }
      }, 55);
    }

    function erasePhrase() {
      if (cancelled) return;
      const text = HEADLINE_PHRASES[phraseRef.current];
      let i = text.length;
      const eraser = setInterval(() => {
        if (cancelled) return clearInterval(eraser);
        i--;
        setHeadline(text.slice(0, i));
        if (i <= 0) {
          clearInterval(eraser);
          phraseRef.current = (phraseRef.current + 1) % HEADLINE_PHRASES.length;
          setTimeout(typePhrase, 300);
        }
      }, 30);
    }

    typePhrase();
    return () => {
      cancelled = true;
    };
  }, [loading]);

  const activeDot = Math.min(4, Math.floor(progress / 20));

  if (loading) {
    return (
      <div id="loading-screen">
        <div className="load-card">
          <div className="logo-row">
            <svg className="star-icon" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L14.6 9H21.5L15.9 13.2L18.1 20L12 15.9L5.9 20L8.1 13.2L2.5 9H9.4L12 2Z"
                fill="url(#starGrad)"
                stroke="none"
              />
              <defs>
                <linearGradient id="starGrad" x1="0" y1="0" x2="24" y2="24">
                  <stop offset="0%" stopColor="#5eead4" />
                  <stop offset="100%" stopColor="#fb7185" />
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
              <span className="live-dot"></span>LIVE
            </span>
          </div>

          <div className="divider"></div>

          <div className="welcome-h">Welcome to Star Traders</div>
          <div className="welcome-p">Empowering your financial journey.</div>

          <div className="progress-row">
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="progress-pct">{Math.floor(progress)}%</div>
          </div>

          <div className="scan-row">
            <div className="spinner"></div>
            <span>{SCAN_MESSAGES[scanMsgIndex]}</span>
          </div>

          <div className="dots">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className={i === activeDot ? 'dot active' : 'dot'}></div>
            ))}
          </div>

          <div className="feature-icons">
            <div className="feature-icon">
              <div className="circle">
                <svg viewBox="0 0 24 24" fill="none" stroke="#5eead4" strokeWidth="2">
                  <path d="M4 19V9M12 19V5M20 19v-7" />
                </svg>
              </div>
              Advanced Charts
            </div>
            <div className="feature-icon">
              <div className="circle">
                <svg viewBox="0 0 24 24" fill="none" stroke="#5eead4" strokeWidth="2">
                  <rect x="4" y="8" width="16" height="12" rx="2" />
                  <path d="M9 8V5a3 3 0 016 0v3" />
                  <circle cx="9" cy="14" r="1" />
                  <circle cx="15" cy="14" r="1" />
                </svg>
              </div>
              Trading Bots
            </div>
            <div className="feature-icon">
              <div className="circle">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fb7185" strokeWidth="2">
                  <path d="M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3" />
                </svg>
              </div>
              Copy Trading
            </div>
          </div>

          <div className="prep-text">Preparing a seamless trading experience for you</div>
        </div>
      </div>
    );
  }

  return (
    <div id="homepage" className="visible">
      <nav>
        <div className="nav-logo wordmark">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L14.6 9H21.5L15.9 13.2L18.1 20L12 15.9L5.9 20L8.1 13.2L2.5 9H9.4L12 2Z"
              fill="url(#starGrad2)"
            />
            <defs>
              <linearGradient id="starGrad2" x1="0" y1="0" x2="24" y2="24">
                <stop offset="0%" stopColor="#5eead4" />
                <stop offset="100%" stopColor="#fb7185" />
              </linearGradient>
            </defs>
          </svg>
          <span className="star">STAR</span>
          <span className="traders">TRADERS</span>
        </div>
        <button className="login-btn" onClick={login}>
          Login Now →
        </button>
      </nav>

      <section className="hero">
        <div className="hero-bg"></div>
        <div className="trust-pill-outline">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
          </svg>
          Trusted by 50,000+ traders worldwide
        </div>
        <div className="hero-headline">
          {headline}
          <span className="cursor">&nbsp;</span>
        </div>
        <p
          style={{
            color: 'var(--text-2)',
            fontSize: '14.5px',
            maxWidth: '420px',
            margin: '0 auto 28px',
            lineHeight: 1.6,
          }}
        >
          We don&apos;t just teach trading — we build traders. AI bots, copy trading, and
          real-time signals in one hub.
        </p>

        <button className="btn-cta-lg" onClick={login}>
          Start Trading Now →
        </button>

        <div className="check-row">
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12l3 3 5-6" />
            </svg>
            No credit card required
          </span>
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12l3 3 5-6" />
            </svg>
            $10,000 virtual account
          </span>
        </div>

        <div className="testimonial-grid" style={{ marginTop: '70px' }}>
          <div className="t-card-v2">
            <div className="t-avatar">MG</div>
            <p className="quote">
              &quot;The bot management transformed my trading. The automated bots execute
              strategies flawlessly, and I&apos;ve seen consistent results. The platform is
              intuitive and powerful.&quot;
            </p>
            <div className="t-name">Mark Gonzales</div>
            <div className="t-role">Professional day trader</div>
            <div className="t-stars">★★★★★</div>
          </div>
          <div className="t-card-v2">
            <div className="t-avatar">PR</div>
            <p className="quote">
              &quot;Copy trading features let me follow verified performers and my portfolio is
              finally transparent and consistent.&quot;
            </p>
            <div className="t-name">Priya R.</div>
            <div className="t-role">Swing trader</div>
            <div className="t-stars">★★★★★</div>
          </div>
          <div className="t-card-v2">
            <div className="t-avatar">KO</div>
            <p className="quote">
              &quot;Signals are fast and the risk tools actually stop me from overtrading. Exactly
              what I needed to stay disciplined.&quot;
            </p>
            <div className="t-name">Kwame O.</div>
            <div className="t-role">Day trader</div>
            <div className="t-stars">★★★★★</div>
          </div>
        </div>

        <div className="stats-circles">
          <div className="stat-circle">
            <div className="ring">6K+</div>
            <div className="label">Active traders</div>
          </div>
          <div className="stat-circle">
            <div className="ring">$0.3B+</div>
            <div className="label">Trading volume</div>
          </div>
          <div className="stat-circle">
            <div className="ring">99.9%</div>
            <div className="label">Uptime</div>
          </div>
          <div className="stat-circle">
            <div className="ring">18+</div>
            <div className="label">Trading pairs</div>
          </div>
        </div>

        <div className="risk-box">
          <strong>Risk disclaimer:</strong> Star Traders offers complex derivatives such as
          options and contracts for difference (CFDs). These products may not be suitable for
          all clients, and trading them puts your capital at risk. Please make sure you
          understand the following before trading these products.
        </div>
      </section>

      <section>
        <div className="section-head">
          <div className="tag">FEATURED</div>
          <h2>Powerful features for modern traders</h2>
          <p>
            Whether you prefer manual decisions, automated bot execution, or copy trading, Star
            Traders gives you practical tools for finding setups, managing risk, and keeping your
            workflow simple.
          </p>
        </div>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="icon-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="8" width="16" height="12" rx="2" />
                <path d="M9 8V5a3 3 0 016 0v3" />
                <circle cx="9" cy="14" r="1" />
                <circle cx="15" cy="14" r="1" />
              </svg>
            </div>
            <h3>AI-powered trading bots</h3>
            <p>
              Deploy intelligent trading strategies with our advanced bot system. No coding
              required — just configure, test, and let the bots work for you 24/7.
            </p>
          </div>
          <div className="feature-card pink">
            <div className="icon-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19V9M12 19V5M20 19v-7" />
              </svg>
            </div>
            <h3>Real-time market analysis</h3>
            <p>
              Access professional-grade charts, indicators, and analytics. Track market trends,
              identify opportunities, and execute with confidence.
            </p>
          </div>
          <div className="feature-card">
            <div className="icon-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3" />
              </svg>
            </div>
            <h3>Copy trading network</h3>
            <p>
              Mirror successful traders automatically. Transparent performance metrics, full
              control over your capital, and instant execution.
            </p>
          </div>
          <div className="feature-card pink">
            <div className="icon-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l8 4v6c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-4z" />
              </svg>
            </div>
            <h3>Risk management tools</h3>
            <p>
              Set stop-loss limits, position sizing rules, and drawdown alerts. Trade with
              discipline built into every position you open.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="section-head">
          <div className="tag">WHY STARTRADERS</div>
          <h2>Join the platform that&apos;s redefining automated trading</h2>
        </div>
        <div className="why-list">
          {[
            'Bank-grade security with encrypted sessions',
            'Lightning-fast execution under 50ms',
            'Virtual account for risk-free testing',
            '24/7 customer support and trading resources',
          ].map((text) => (
            <div className="why-item" key={text}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              {text}
            </div>
          ))}
        </div>
      </section>

      <RiskDisclaimer />

     <footer>
  Trading involves risk. Please trade responsibly and only trade with funds you can afford to lose.
</footer>
    </div>
  );
}
