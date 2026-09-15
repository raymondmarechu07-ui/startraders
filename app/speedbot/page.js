'use client';

import { useEffect, useRef, useState } from 'react';
import UtilityBar from '@/components/UtilityBar';
import TabNav from '@/components/TabNav';

const STRATEGIES = [
  { color: '#fb923c', name: 'Over 1', cond: 'If the last digit is ≤ 1', setup: 'Over 1' },
  { color: '#4ade80', name: 'Over 1 Pro', cond: 'If the last 2 digits are ≤ 1', setup: 'Over 1' },
  { color: '#a855f7', name: 'Under 8', cond: 'If the last digit is ≥ 8', setup: 'Under 8' },
];

export default function SpeedbotPage() {
  const [mode, setMode] = useState('ai');
  const [soloCombo, setSoloCombo] = useState('solo');
  const [view, setView] = useState('list'); // list | execute
  const [activeStrategy, setActiveStrategy] = useState(null);
  const [speed, setSpeed] = useState('normal');
  const [running, setRunning] = useState(false);
  const [runs, setRuns] = useState(0);
  const [pnl, setPnl] = useState(0);
  const [execPrice, setExecPrice] = useState(731.95);
  const intervalRef = useRef(null);

  useEffect(() => {
    const priceInterval = setInterval(() => {
      setExecPrice((p) => p + (Math.random() - 0.5) * 0.5);
    }, 1000);
    return () => clearInterval(priceInterval);
  }, []);

  function openExecute(strategy) {
    setActiveStrategy(strategy);
    setView('execute');
  }

  function backToList() {
    setView('list');
    stopRun();
  }

  function toggleStart() {
    setRunning((r) => {
      const next = !r;
      if (next) {
        intervalRef.current = setInterval(() => {
          setRuns((n) => n + 1);
          setPnl((p) => p + (Math.random() - 0.45) * 1.2);
        }, 1000);
      } else {
        clearInterval(intervalRef.current);
      }
      return next;
    });
  }

  function stopRun() {
    setRunning(false);
    clearInterval(intervalRef.current);
  }

  if (view === 'execute' && activeStrategy) {
    return (
      <>
        <UtilityBar />
        <TabNav />
        <main>
          <div className="back-link" onClick={backToList}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back to Speedbot
          </div>
          <div className="execute-title">Execute trade on every tick</div>

          <div className="start-row">
            <button className={running ? 'start-btn running' : 'start-btn'} onClick={toggleStart}>
              {running ? 'Stop' : 'Start'}
            </button>
            <div className="speed-toggle-row">
              <button className={speed === 'fast' ? 'active' : ''} onClick={() => setSpeed('fast')}>
                ⚡ Fast
              </button>
              <button className={speed === 'normal' ? 'active' : ''} onClick={() => setSpeed('normal')}>
                ▶▶ Normal
              </button>
            </div>
          </div>

          <div className="exec-market">
            <div className="m-name">Volatility 100 (1s) Index</div>
            <div className="m-price">{execPrice.toFixed(2)}</div>
          </div>
          <div className="exec-condition">{activeStrategy.setup}</div>

          <div className="field-grid">
            <div className="field-box">
              <label>Ticks</label>
              <input type="number" defaultValue={1} />
            </div>
            <div className="field-box">
              <label>Stake</label>
              <input type="number" defaultValue={0.5} step="0.1" />
            </div>
            <div className="field-box">
              <label>Take profit</label>
              <input type="number" defaultValue={10} />
            </div>
            <div className="field-box">
              <label>Stop loss</label>
              <input type="number" defaultValue={50} />
            </div>
          </div>

          {running && (
            <div className="live-stats visible">
              <div className="stat">
                <div className="v">{runs}</div>
                <div className="l">Runs</div>
              </div>
              <div className="stat">
                <div className="v" style={{ color: pnl >= 0 ? '#4ade80' : '#fb7185' }}>
                  {pnl >= 0 ? '+$' : '-$'}
                  {Math.abs(pnl).toFixed(2)}
                </div>
                <div className="l">Profit/loss</div>
              </div>
            </div>
          )}
        </main>
      </>
    );
  }

  return (
    <>
      <UtilityBar />
      <TabNav />
      <main>
        <div className="toggle-row">
          <button className={mode === 'ai' ? 'active orange' : ''} onClick={() => setMode('ai')}>
            AI Robots
          </button>
          <button className={mode === 'dual' ? 'active orange' : ''} onClick={() => setMode('dual')}>
            Dual Edge
          </button>
        </div>
        <div className="toggle-row small">
          <button className={soloCombo === 'solo' ? 'active blue' : ''} onClick={() => setSoloCombo('solo')}>
            Solo
          </button>
          <button className={soloCombo === 'combo' ? 'active blue' : ''} onClick={() => setSoloCombo('combo')}>
            Combo
          </button>
        </div>

        {STRATEGIES.map((s) => (
          <div className="strategy-card" style={{ '--sc-color': s.color }} key={s.name}>
            <h3>{s.name}</h3>
            <div className="cond">{s.cond}</div>
            <div className="setup-box">
              <span>Trade setup</span>
              <span>{s.setup}</span>
            </div>
            <button className="open-bot-btn" style={{ '--sc-color': s.color }} onClick={() => openExecute(s)}>
              Open bot
            </button>
            <div style={{ clear: 'both' }}></div>
          </div>
        ))}
      </main>
    </>
  );
}
