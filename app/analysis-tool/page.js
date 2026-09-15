'use client';

import { useEffect, useState } from 'react';
import UtilityBar from '@/components/UtilityBar';
import TabNav from '@/components/TabNav';

const COLORS = ['#fb923c', '#94a3b8', '#ef4444', '#facc15', '#94a3b8', '#3b82f6', '#94a3b8', '#4ade80', '#94a3b8', '#94a3b8'];

function randomDigits() {
  let vals = Array.from({ length: 10 }, () => Math.random());
  const sum = vals.reduce((a, b) => a + b, 0);
  return vals.map((v) => (v / sum) * 100);
}

export default function AnalysisToolPage() {
  const [digits, setDigits] = useState(randomDigits());
  const [selectedDigit, setSelectedDigit] = useState(5);
  const [matchPct, setMatchPct] = useState(10.4);
  const [price, setPrice] = useState(731.93);

  useEffect(() => {
    const i1 = setInterval(() => setDigits(randomDigits()), 2500);
    const i2 = setInterval(() => setMatchPct(Math.random() * 20 + 5), 3000);
    const i3 = setInterval(() => setPrice((p) => p + (Math.random() - 0.5) * 0.6), 1000);
    return () => {
      clearInterval(i1);
      clearInterval(i2);
      clearInterval(i3);
    };
  }, []);

  const maxIdx = digits.indexOf(Math.max(...digits));
  const differPct = 100 - matchPct;

  return (
    <>
      <UtilityBar />
      <TabNav />

      <main>
        <div className="sub-toggle">
          <button className="active">Circles</button>
          <button
            onClick={() =>
              alert('Scanner view — a saved-strategy scan list — comes next once this tool is wired to real tick data.')
            }
          >
            Scanner
          </button>
        </div>

        <div className="market-row">
          <div className="m-name">Volatility 100 (1s) Index</div>
          <div className="ticks-field">
            TICKS <input type="number" defaultValue={1000} />
          </div>
          <div className="live-price">{price.toFixed(2)}</div>
        </div>

        <div className="section-label">
          Digit distribution <span className="badge">1000 ticks</span>
        </div>
        <div className="digit-grid">
          {digits.map((v, i) => (
            <div
              key={i}
              className={i === maxIdx ? 'digit-circle leader' : 'digit-circle'}
              style={{ '--dc-color': COLORS[i] }}
            >
              <div className="num">{i}</div>
              <div className="pct">{v.toFixed(1)}%</div>
            </div>
          ))}
        </div>

        <div className="section-label">
          Match / Differ <span className="badge">24x Differ</span>
        </div>
        <div className="md-digit-row">
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              className={i === selectedDigit ? 'md-digit selected' : 'md-digit'}
              onClick={() => setSelectedDigit(i)}
            >
              {i}
            </div>
          ))}
        </div>
        <div className="md-bar-row">
          <div className="md-bar-label">
            <span className="match">{matchPct.toFixed(1)}% Match</span>
            <span className="differ">{differPct.toFixed(1)}% Differ</span>
          </div>
          <div className="md-bar-track">
            <div className="match-fill" style={{ width: `${matchPct}%` }}></div>
            <div className="differ-fill" style={{ width: `${differPct}%` }}></div>
          </div>
        </div>
        <div className="pred-row">
          {Array.from({ length: 10 }, (_, i) => (
            <div className="p" key={i}>
              D
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
