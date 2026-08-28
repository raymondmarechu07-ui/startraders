'use client';

import { useEffect, useRef, useState } from 'react';
import { useDeriv } from '@/context/DerivProvider';
import RiskDisclaimer from '@/components/RiskDisclaimer';
import LoadingScreen from '@/components/LoadingScreen';
import Reveal from '@/components/Reveal';

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

// Stats animate from 0 up to these targets once they scroll into view.
const STATS = [
  { target: 50, decimals: 0, prefix: '', suffix: 'K+', label: 'Active Traders' },
  { target: 2.5, decimals: 1, prefix: '$', suffix: 'B+', label: 'Trading Volume' },
  { target: 99.9, decimals: 1, prefix: '', suffix: '%', label: 'Uptime' },
  { target: 150, decimals: 0, prefix: '', suffix: '+', label: 'Trading Pairs' },
];

function useCountUp(active) {
  const [values, setValues] = useState(STATS.map(() => 0));

  useEffect(() => {
    if (!active) return;

    const duration = 1400;
    const start = performance.now();
    let frame;

    function tick(now) {
      const elapsed = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      setValues(STATS.map((s) => s.target * eased));
      if (elapsed < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active]);

  return values;
}

export default function HomePage() {
  const { login } = useDeriv();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [scanMsgIndex, setScanMsgIndex] = useState(0);
  const [headline, setHeadline] = useState('');
  const phraseRef = useRef(0);

  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const statValues = useCountUp(statsVisible);

  useEffect(() => {
    if (loading || !statsRef.current) return;
    const el = statsRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loading]);

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
      <LoadingScreen
        message={SCAN_MESSAGES[scanMsgIndex]}
        progress={progress}
      />
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
        <div className="strip-viewport">
          <div className="strip-track">
            {[...MARKET_TABS, ...MARKET_TABS].map((label, i) => (
              <b key={`${label}-${i}`} className={i % MARKET_TABS.length < 2 ? 'orange' : ''}>
                {label} ---
              </b>
            ))}
          </div>
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
          {[
            {
              initials: 'RP',
              quote:
                'Clean charting tools and reliable data exports. The risk management settings give me real control over drawdown.',
              name: 'Raj Patel',
              role: 'Quantitative Analyst',
            },
            {
              initials: 'EP',
              quote:
                'Copying top-performing strategies gave my portfolio steady growth without needing to watch charts all day.',
              name: 'Elena Petrova',
              role: 'Portfolio Manager',
            },
            {
              initials: 'MG',
              quote:
                'StarTraders transformed my trading. The automated bots handle my strategies flawlessly, and the platform is intuitive and powerful.',
              name: 'Mark Gonzales',
              role: 'Professional Day Trader',
            },
            {
              initials: 'KM',
              quote:
                'Copy trading feature is incredible! I follow top performers and my portfolio has grown steadily. The transparency and control are unmatched.',
              name: 'Kelvin Maxwell',
              role: 'Crypto Investor',
            },
          ].map((t, i) => (
            <Reveal as="div" className="t-card-v2" key={t.name} delay={i * 90}>
              <div className="t-avatar">{t.initials}</div>
              <p className="quote">&quot;{t.quote}&quot;</p>
              <div className="t-name">{t.name}</div>
              <div className="t-role">{t.role}</div>
              <div className="t-stars">★★★★★</div>
            </Reveal>
          ))}
        </div>

        <div className="stats-circles" ref={statsRef}>
          {STATS.map((s, i) => (
            <div className="stat-circle" key={s.label}>
              <div className="ring">
                {s.prefix}
                {statValues[i].toFixed(s.decimals)}
                {s.suffix}
              </div>
              <div className="label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="home-section">
        <Reveal className="section-head">
          <div className="tag">WHY STARTRADERS</div>
          <h2>Why Choose StarTraders?</h2>
          <p>
            Join the platform that&apos;s redefining automated trading with
            practical tools, analysis, and risk management in one workspace.
          </p>
        </Reveal>

        <div className="why-list">
          {[
            'Bank-grade security with encrypted sessions',
            'Lightning-fast execution under 50ms',
            'Virtual account for risk-free testing',
            '24/7 customer support and trading resources',
            'Multi-asset trading across forex, crypto, and indices',
            'Mobile app for trading on the go',
          ].map((text, i) => (
            <Reveal
              as="div"
              className={i === 4 ? 'why-item featured' : 'why-item'}
              key={text}
              delay={i * 70}
            >
              <span>✓</span>
              {text}
            </Reveal>
          ))}
        </div>
      </section>

      <section className="home-section">
        <Reveal className="section-head">
          <div className="tag">FEATURED</div>
          <h2>Powerful features for modern traders</h2>
          <p>
            Manual decisions, automated execution, copy trading, analysis,
            and risk tools — designed to work together.
          </p>
        </Reveal>

        <div className="feature-grid">
          {[
            {
              icon: '▣',
              pink: false,
              title: 'AI-powered trading bots',
              copy: 'Configure, test, and run trading strategies from one streamlined workspace.',
            },
            {
              icon: '▥',
              pink: true,
              title: 'Real-time market analysis',
              copy: 'Track markets, identify setups, and work with professional charting tools.',
            },
            {
              icon: '↻',
              pink: false,
              title: 'Copy trading network',
              copy: 'Follow verified performers while maintaining control of your own trading decisions.',
            },
            {
              icon: '◇',
              pink: true,
              title: 'Risk management tools',
              copy: 'Build discipline with position sizing, limits, and drawdown awareness.',
            },
          ].map((f, i) => (
            <Reveal
              as="div"
              className={f.pink ? 'feature-card pink' : 'feature-card'}
              key={f.title}
              delay={i * 100}
            >
              <div className="icon-box">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.copy}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="cta-banner">
        <div className="cta-globe" aria-hidden="true" />
        <div className="cta-arc" aria-hidden="true" />
        <Reveal as="div">
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
        </Reveal>
      </section>

      <RiskDisclaimer />

      <footer>
        Trading involves risk. Please trade responsibly and only trade with
        funds you can afford to lose.
      </footer>
    </div>
  );
}
