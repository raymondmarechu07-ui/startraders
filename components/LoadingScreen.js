'use client';

// Deterministic candle pattern (no Math.random) so server- and
// client-rendered markup always match — avoids hydration warnings.
function buildCandles(count, offset) {
  return Array.from({ length: count }).map((_, i) => {
    const seed = (i * 37 + offset * 53) % 97;
    const height = 22 + (seed % 62); // 22 - 84 (%)
    const up = seed % 2 === 0;
    const wick = 6 + (seed % 10);
    return { height, up, wick, key: `${offset}-${i}` };
  });
}

const CANDLES = buildCandles(24, 0);

const TICKER_ITEMS = [
  { name: 'R_75', value: '6,916.67', change: '+0.12%', up: true },
  { name: 'R_100', value: '8,329.80', change: '-0.08%', up: false },
  { name: 'Boom 500', value: '12,511.46', change: '+0.15%', up: true },
  { name: 'Crash 500', value: '9,025.69', change: '-0.13%', up: false },
  { name: 'Vol 25', value: '1,556.98', change: '+0.10%', up: true },
];

export default function LoadingScreen({
  message = 'Setting up your trading session...',
  progress = null,
  indeterminate = false,
}) {
  return (
    <div id="loading-screen">
      <div className="candle-band" aria-hidden="true">
        <div className="candle-track">
          {[...CANDLES, ...CANDLES].map((c, i) => (
            <span
              key={`${c.key}-${i}`}
              className={c.up ? 'bg-candle up' : 'bg-candle down'}
              style={{ '--h': `${c.height}%`, '--w': `${c.wick}%` }}
            />
          ))}
        </div>
        <svg className="candle-wave" viewBox="0 0 1600 400" preserveAspectRatio="none">
          <path
            d="M0,220 C200,120 350,320 550,200 C750,90 900,300 1100,190 C1300,90 1450,260 1600,180"
            fill="none"
          />
        </svg>
      </div>

      <div className="load-background-grid" aria-hidden="true" />

      <div className="load-card">
        <div className="logo-row">
          <svg className="star-icon" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L14.6 9H21.5L15.9 13.2L18.1 20L12 15.9L5.9 20L8.1 13.2L2.5 9H9.4L12 2Z"
              fill="url(#starGradShared)"
            />
            <defs>
              <linearGradient id="starGradShared" x1="0" y1="0" x2="24" y2="24">
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
          <span>{message}</span>
          {progress !== null && (
            <span className="progress-pct">{Math.floor(progress)}%</span>
          )}
        </div>

        <div className="progress-track">
          <div
            className={
              indeterminate ? 'progress-fill indeterminate' : 'progress-fill'
            }
            style={
              indeterminate ? undefined : { width: `${progress ?? 0}%` }
            }
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
