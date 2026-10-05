'use client';

import { useEffect, useMemo, useState } from 'react';
import UtilityBar from '@/components/UtilityBar';
import TabNav from '@/components/TabNav';
import { useDeriv } from '@/context/DerivProvider';
import { lastDigitFromQuote, formatDerivError } from '@/lib/deriv-market';

const COLORS = ['#fb923c', '#94a3b8', '#ef4444', '#facc15', '#94a3b8', '#3b82f6', '#94a3b8', '#4ade80', '#94a3b8', '#94a3b8'];

export default function AnalysisToolPage() {
  const { status, subscribeTicks, unsubscribeTicks } = useDeriv();
  const [ticks, setTicks] = useState([]);
  const [selectedDigit, setSelectedDigit] = useState(5);
  const [error, setError] = useState('');

  useEffect(() => {
    setTicks([]);
    if (status !== 'connected') return undefined;

    subscribeTicks('1HZ100V', (tick) => {
      setTicks((prev) => [...prev.slice(-999), tick]);
    }).catch((err) => setError(formatDerivError(err)));

    return () => unsubscribeTicks();
  }, [status, subscribeTicks, unsubscribeTicks]);

  const digits = useMemo(() => {
    const counts = Array(10).fill(0);
    ticks.forEach((tick) => {
      const digit = lastDigitFromQuote(tick.quote);
      if (digit !== null) counts[digit] += 1;
    });
    const total = counts.reduce((sum, value) => sum + value, 0);
    return counts.map((value) => total ? (value / total) * 100 : 0);
  }, [ticks]);

  const selectedMatch = digits[selectedDigit] || 0;
  const differPct = Math.max(0, 100 - selectedMatch);
  const maxIdx = digits.indexOf(Math.max(...digits));
  const latest = ticks[ticks.length - 1];

  return (
    <>
      <UtilityBar />
      <TabNav />
      <main>
        <div className="sub-toggle">
          <button className="active">Circles</button>
          <button type="button" onClick={() => setSelectedDigit((d) => (d + 1) % 10)}>
            Scanner
          </button>
        </div>

        <div className="market-row">
          <div className="m-name">Volatility 100 (1s) Index</div>
          <div className="ticks-field">
            TICKS <input type="number" value={Math.max(ticks.length, 1)} readOnly />
          </div>
          <div className="live-price">{latest ? Number(latest.quote).toFixed(3) : '—'}</div>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <div className="section-label">
          Live digit distribution <span className="badge">{ticks.length} ticks</span>
        </div>
        <div className="digit-grid">
          {digits.map((value, i) => (
            <div key={i} className={i === maxIdx && ticks.length ? 'digit-circle leader' : 'digit-circle'} style={{ '--dc-color': COLORS[i] }}>
              <div className="num">{i}</div>
              <div className="pct">{value.toFixed(1)}%</div>
            </div>
          ))}
        </div>

        <div className="section-label">
          Match / Differ <span className="badge">Digit {selectedDigit}</span>
        </div>
        <div className="md-digit-row">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className={i === selectedDigit ? 'md-digit selected' : 'md-digit'} onClick={() => setSelectedDigit(i)}>
              {i}
            </div>
          ))}
        </div>
        <div className="md-bar-row">
          <div className="md-bar-label">
            <span className="match">{selectedMatch.toFixed(1)}% Match</span>
            <span className="differ">{differPct.toFixed(1)}% Differ</span>
          </div>
          <div className="md-bar-track">
            <div className="match-fill" style={{ width: selectedMatch + '%' }}></div>
            <div className="differ-fill" style={{ width: differPct + '%' }}></div>
          </div>
        </div>
        <div className="pred-row">
          {digits.map((_, i) => <div className="p" key={i}>{i}</div>)}
        </div>
      </main>
    </>
  );
}
