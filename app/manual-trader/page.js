'use client';

import { useEffect, useRef, useState } from 'react';
import UtilityBar from '@/components/UtilityBar';
import TabNav from '@/components/TabNav';

const TIMEFRAMES = ['1m', '5m', '15m', '1H', '4H', '1D'];
const TRADE_TYPES = [
  { label: 'Rise/Fall', icon: 'M18 15l-6-6-6 6' },
  { label: 'Higher/Lower', icon: 'M12 3v18M6 9l6-6 6 6M6 15l6 6 6-6' },
  { label: 'Touch/No Touch', icon: '', dual: true },
  { label: 'Matches/Differs', icon: 'M3 3h7v7H3zM14 14h7v7h-7z' },
  { label: 'Even/Odd', icon: 'M4 4h16v16H4zM4 12h16' },
  { label: 'Over/Under', icon: 'M4 19V9M12 19V5M20 19v-7' },
  { label: 'Accumulators', icon: 'M13 2L4 14h7l-1 8 9-12h-7l1-8z' },
];

const INITIAL_POINTS = [
  [0, 140], [30, 132], [60, 148], [90, 120], [120, 128], [150, 100], [180, 112],
  [210, 85], [240, 95], [270, 70], [300, 82], [330, 58], [360, 68], [390, 45],
  [420, 55], [450, 35], [480, 48], [510, 28], [540, 40], [570, 20], [600, 32],
];

export default function ManualTraderPage() {
  const [price, setPrice] = useState(6914.32);
  const [priceUp, setPriceUp] = useState(true);
  const [changePct, setChangePct] = useState(0.14);
  const [points, setPoints] = useState(INITIAL_POINTS);
  const [timeframe, setTimeframe] = useState('1m');
  const [tradeType, setTradeType] = useState('Rise/Fall');
  const [duration, setDuration] = useState('5 ticks');
  const [stake, setStake] = useState(10);
  const [digit, setDigit] = useState(5); // for Matches/Differs
  const [balance, setBalance] = useState(500); // demo balance shown in the risk calculator until wired to the real one
  const [positions, setPositions] = useState([]);
  const posIdRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const delta = (Math.random() - 0.5) * 4;
      setPrice((p) => Math.max(6800, p + delta));
      setPriceUp(delta >= 0);
      setChangePct(Math.abs(delta));

      setPoints((prev) => {
        const shifted = prev.slice(1);
        const lastY = shifted[shifted.length - 1][1];
        const newY = Math.max(15, Math.min(200, lastY - delta * 3));
        shifted.push([shifted[shifted.length - 1][0] + 30, newY]);
        return shifted.map(([, y], i) => [i * 30, y]);
      });
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  function adjustStake(delta) {
    setStake((s) => Math.max(1, s + delta));
  }

  function openPosition(direction, extra = {}) {
    const id = posIdRef.current++;
    const newPos = { id, direction, stake, duration, elapsed: 0, pnl: 0, status: 'live', ...extra };
    setPositions((prev) => [newPos, ...prev]);

    const interval = setInterval(() => {
      setPositions((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          if (p.status !== 'live') return p;
          const elapsed = p.elapsed + 1;
          const pnl = (Math.random() - 0.42) * p.stake * 0.3 * elapsed;
          if (elapsed >= 6) {
            clearInterval(interval);
            return { ...p, elapsed, pnl, status: pnl >= 0 ? 'won' : 'lost' };
          }
          return { ...p, elapsed, pnl };
        })
      );
    }, 1000);
  }

  const linePoints = points.map((p) => p.join(',')).join(' ');
  const areaPoints = linePoints + ` 600,220 0,220`;
  const lastPoint = points[points.length - 1];

  return (
    <>
      <UtilityBar />
      <TabNav />

      <div className="market-bar">
        <div
          className="market-picker"
          onClick={() =>
            alert('This is where the full market list (Volatility, Boom, Crash, Forex) opens once market switching is built.')
          }
        >
          <div className="m-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19V9M12 19V5M20 19v-7" />
            </svg>
          </div>
          <div>
            <div className="m-name">Volatility 75 Index</div>
            <div className="m-sub">Synthetic · 24/7</div>
          </div>
          <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
        <div className="live-price">
          <div className="price" style={{ color: priceUp ? '#4ade80' : '#fb7185' }}>
            {price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={priceUp ? 'chg up' : 'chg down'}>
            {priceUp ? '▲' : '▼'} {Math.abs((changePct / price) * 100).toFixed(2)}%
          </div>
        </div>
      </div>

      <main>
        <div className="trade-layout">
          <div>
            <div className="chart-card">
              <div className="timeframe-row">
                {TIMEFRAMES.map((tf) => (
                  <button
                    key={tf}
                    className={tf === timeframe ? 'tf-btn active' : 'tf-btn'}
                    onClick={() => setTimeframe(tf)}
                  >
                    {tf}
                  </button>
                ))}
              </div>
              <div className="chart-area">
                <svg viewBox="0 0 600 220" preserveAspectRatio="none">
                  <line x1="0" y1="55" x2="600" y2="55" stroke="rgba(255,255,255,0.05)" />
                  <line x1="0" y1="110" x2="600" y2="110" stroke="rgba(255,255,255,0.05)" />
                  <line x1="0" y1="165" x2="600" y2="165" stroke="rgba(255,255,255,0.05)" />
                  <polyline points={linePoints} fill="none" stroke="#5eead4" strokeWidth="2.5" />
                  <polyline points={areaPoints} fill="url(#lineFade)" stroke="none" opacity="0.45" />
                  <circle cx={lastPoint[0]} cy={lastPoint[1]} r="4" fill="#5eead4" />
                  <defs>
                    <linearGradient id="lineFade" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="price-line-tag" style={{ top: `${lastPoint[1]}px` }}>
                  {price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <div className="trade-type-row">
              {TRADE_TYPES.map((tt) => (
                <button
                  key={tt.label}
                  className={tt.label === tradeType ? 'tt-btn active' : 'tt-btn'}
                  onClick={() => setTradeType(tt.label)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {tt.dual ? (
                      <>
                        <circle cx="12" cy="12" r="9" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    ) : (
                      <path d={tt.icon} />
                    )}
                  </svg>
                  {tt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="trade-panel">
            <div className="tp-row">
              <div className="field">
                <label>Duration</label>
                <select value={duration} onChange={(e) => setDuration(e.target.value)}>
                  <option>5 ticks</option>
                  <option>10 ticks</option>
                  <option>1 minute</option>
                  <option>5 minutes</option>
                </select>
              </div>
              <div className="field">
                <label>Stake (USD)</label>
                <div className="stake-adjust">
                  <button onClick={() => adjustStake(-5)}>−</button>
                  <input
                    type="number"
                    value={stake}
                    min="1"
                    onChange={(e) => setStake(Math.max(1, Number(e.target.value)))}
                  />
                  <button onClick={() => adjustStake(5)}>+</button>
                </div>
              </div>
            </div>

            {tradeType === 'Matches/Differs' && (
              <div className="tp-row">
                <div className="field" style={{ width: '100%' }}>
                  <label>Predicted last digit</label>
                  <div className="digit-row">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                      <button
                        key={d}
                        className={d === digit ? 'digit-btn active' : 'digit-btn'}
                        onClick={() => setDigit(d)}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="risk-calc">
              <div className="risk-calc-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                Risk calculator
              </div>
              <div className="risk-calc-row">
                <span>If this loses</span>
                <strong className="neg">-${stake.toFixed(2)}</strong>
              </div>
              <div className="risk-calc-row">
                <span>% of your balance</span>
                <strong className={stake / balance > 0.05 ? 'neg' : ''}>
                  {((stake / balance) * 100).toFixed(1)}%
                </strong>
              </div>
              {stake / balance > 0.05 && (
                <div className="risk-calc-warn">
                  This stake is over 5% of your balance — many experienced traders keep single
                  trades smaller than that to avoid a few losses wiping out the account.
                </div>
              )}
            </div>

            <div className="buy-row">
              {tradeType === 'Matches/Differs' ? (
                <>
                  <button className="buy-btn rise" onClick={() => openPosition('matches', { digit })}>
                    <div className="bb-label">Matches {digit}</div>
                    <div className="bb-payout">Payout ~9x on a 1-in-10 chance</div>
                  </button>
                  <button className="buy-btn fall" onClick={() => openPosition('differs', { digit })}>
                    <div className="bb-label">Differs {digit}</div>
                    <div className="bb-payout">Payout ~11%</div>
                  </button>
                </>
              ) : (
                <>
                  <button className="buy-btn rise" onClick={() => openPosition('rise')}>
                    <div className="bb-label">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 15l-6-6-6 6" />
                      </svg>
                      Rise
                    </div>
                    <div className="bb-payout">Payout 95.2%</div>
                  </button>
                  <button className="buy-btn fall" onClick={() => openPosition('fall')}>
                    <div className="bb-label">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                      Fall
                    </div>
                    <div className="bb-payout">Payout 94.8%</div>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="section-label">Open positions</div>
        <div>
          {positions.length === 0 && (
            <div className="empty-note">No open positions — place a trade above to see it appear here.</div>
          )}
          {positions.map((p) => (
            <div className="position-card" key={p.id}>
              <div className="p-left">
                <div className={`p-dir ${p.direction === 'rise' || p.direction === 'matches' ? 'rise' : 'fall'}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d={p.direction === 'rise' || p.direction === 'matches' ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'} />
                  </svg>
                </div>
                <div>
                  <div className="p-market">Volatility 75 Index · ${p.stake}</div>
                  <div className="p-sub">
                    {p.direction === 'rise' && 'Rise'}
                    {p.direction === 'fall' && 'Fall'}
                    {p.direction === 'matches' && `Matches ${p.digit}`}
                    {p.direction === 'differs' && `Differs ${p.digit}`}
                    {' · '}{p.duration}
                  </div>
                </div>
              </div>
              <div>
                <div className={`p-pnl ${p.pnl >= 0 ? 'pos' : 'neg'}`}>
                  {p.pnl >= 0 ? '+$' : '-$'}
                  {Math.abs(p.pnl).toFixed(2)}
                </div>
                <div className="p-timer">
                  {p.status === 'live' ? 'Live' : p.status === 'won' ? 'Won' : 'Lost'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
