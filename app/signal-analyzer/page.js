'use client';

import { useEffect, useState } from 'react';
import UtilityBar from '@/components/UtilityBar';
import TabNav from '@/components/TabNav';

const INITIAL_LOGS = [
  { t: '[INFO] Connecting to market data feed...', c: 'info' },
  { t: '[SUCCESS] Data stream established', c: 'ok' },
  { t: '[INFO] Compiling recent tick history...', c: 'info' },
  { t: '[ERROR] Connection timeout... Retrying...', c: 'err' },
  { t: '[SUCCESS] Reconnected to Volatility feed', c: 'ok' },
  { t: '[INFO] Predicting next digit distribution...', c: 'info' },
  { t: '[INFO] Compiling results...', c: 'info' },
  { t: '[SUCCESS] Analysis window updated', c: 'ok' },
  { t: '[INFO] Awaiting next tick...', c: 'info' },
];

const PREDICTIONS = ['Matches', 'Differs', 'Even', 'Odd', 'Rise', 'Fall'];

export default function SignalAnalyzerPage() {
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [tick, setTick] = useState(561.34);
  const [strategy, setStrategy] = useState('Matches & Differs');
  const [market, setMarket] = useState('Volatility 100 Index');
  const [analysing, setAnalysing] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const logInterval = setInterval(() => {
      setLogs((prev) => [...prev.slice(1), prev[0]]);
    }, 1400);
    const tickInterval = setInterval(() => {
      setTick((t) => t + (Math.random() - 0.5) * 2.2);
    }, 900);
    return () => {
      clearInterval(logInterval);
      clearInterval(tickInterval);
    };
  }, []);

  function runAnalysis() {
    setAnalysing(true);
    setResult(null);
    setTimeout(() => {
      const pred = PREDICTIONS[Math.floor(Math.random() * PREDICTIONS.length)];
      const conf = (Math.random() * 30 + 60).toFixed(1);
      setResult({ strategy, market, pred, conf });
      setAnalysing(false);
    }, 1600);
  }

  return (
    <>
      <UtilityBar />
      <TabNav />

      <main>
        <div className="terminal">
          <div className="terminal-title">SIGNAL ANALYZER</div>
          <div className="log-window">
            {logs.map((l, i) => (
              <div className={`line ${l.c}`} key={i}>
                {l.t}
              </div>
            ))}
          </div>

          <div className="select-row">
            <div className="select-box">
              <label>Select strategy</label>
              <select value={strategy} onChange={(e) => setStrategy(e.target.value)}>
                <option>Matches &amp; Differs</option>
                <option>Even/Odd</option>
                <option>Over/Under</option>
                <option>Rise/Fall</option>
              </select>
            </div>
            <div className="select-box">
              <label>Select market</label>
              <select value={market} onChange={(e) => setMarket(e.target.value)}>
                <option>Volatility 100 Index</option>
                <option>Volatility 75 Index</option>
                <option>Boom 500 Index</option>
                <option>Crash 500 Index</option>
              </select>
            </div>
          </div>

          <div className="tick-display">
            <div className="lbl">LATEST TICK</div>
            <div className="val">{tick.toFixed(2)}</div>
          </div>

          <button className="analyse-btn" onClick={runAnalysis} disabled={analysing}>
            {analysing ? 'Analysing…' : 'Analyse'}
          </button>

          {result && (
            <div className="result-box visible">
              <div className="row">
                <span>Strategy</span>
                <span>{result.strategy}</span>
              </div>
              <div className="row">
                <span>Market</span>
                <span>{result.market}</span>
              </div>
              <div className="row">
                <span>Prediction</span>
                <span>{result.pred}</span>
              </div>
              <div className="row">
                <span>Confidence</span>
                <span>{result.conf}%</span>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
