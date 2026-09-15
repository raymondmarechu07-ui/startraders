'use client';

import { useState } from 'react';
import UtilityBar from '@/components/UtilityBar';
import TabNav from '@/components/TabNav';

const TOOLBOX = [
  { color: '#5eead4', name: 'Trade parameters', icon: 'M4 19V9M12 19V5M20 19v-7' },
  { color: '#facc15', name: 'Purchase', icon: 'M1 1h4l2.7 13.4a2 2 0 002 1.6h9.7a2 2 0 002-1.6L23 6H6' },
  { color: '#4ade80', name: 'Sell', icon: 'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6' },
  {
    color: '#fb7185',
    name: 'Restart trading',
    icon: 'M23 4v6h-6M1 20v-6h6M3.5 9a9 9 0 0114.7-3.4L23 10M1 14l4.8 4.4A9 9 0 0020.5 15',
  },
  { color: '#a855f7', name: 'Analysis tools', icon: 'M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-4.35-4.35' },
  { color: '#38bdf8', name: 'Other blocks', icon: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z' },
];

const STRATEGIES = [
  { color: '#5eead4', name: 'Martingale', desc: 'Doubles stake after a loss to recover on the next win.', icon: 'M4 19V9M12 19V5M20 19v-7' },
  { color: '#facc15', name: "D'Alembert", desc: 'Small, steady stake increases and decreases after each trade.', icon: 'M22 12h-4l-3 9L9 3l-3 9H2' },
  { color: '#a855f7', name: 'Even/Odd streak', desc: 'Trades against a run of consecutive even or odd digits.', icon: 'M3 3h7v7H3zM14 14h7v7h-7z' },
  { color: '#fb7185', name: 'Fixed stake', desc: 'Same stake every trade, no progression — lowest risk starting point.', icon: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2' },
];

export default function BotBuilderPage() {
  const [running, setRunning] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [strategyOpen, setStrategyOpen] = useState(false);
  const [stats, setStats] = useState({ runs: 0, won: 0, lost: 0, pnl: 0 });

  function toggleRun() {
    setRunning((r) => {
      const next = !r;
      if (next) {
        window._botInterval = setInterval(() => {
          setStats((s) => {
            const win = Math.random() > 0.45;
            const amount = Math.random() * 8 + 2;
            return {
              runs: s.runs + 1,
              won: s.won + (win ? 1 : 0),
              lost: s.lost + (win ? 0 : 1),
              pnl: s.pnl + (win ? amount : -amount),
            };
          });
        }, 1400);
      } else {
        clearInterval(window._botInterval);
      }
      return next;
    });
  }

  function dropBlock(e) {
    e.preventDefault();
    const name = e.dataTransfer.getData('text/plain');
    alert(
      `"${name}" block added — full drag-and-drop wiring (snapping blocks together, editing fields) comes once the real bot builder canvas is built.`
    );
  }

  return (
    <>
      <UtilityBar />
      <TabNav />

      <div className="builder-toolbar">
        <button
          className="tb-btn"
          onClick={() => alert('This is where a saved .xml bot file loads onto the canvas once bot import is built.')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
          </svg>
          Import
        </button>
        <button
          className="tb-btn"
          onClick={() => alert('This is where your current bot downloads as an .xml file once export is built.')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          Export
        </button>
        <button
          className="tb-btn"
          onClick={() => alert('This is where your bot saves to your account once bot storage is built.')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
            <path d="M17 21v-8H7v8M7 3v5h8" />
          </svg>
          Save
        </button>
        <div className="tb-spacer"></div>
        <button className="tb-strategy" onClick={() => setStrategyOpen(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
          </svg>
          Quick strategy
        </button>
        <button className={running ? 'tb-run running' : 'tb-run'} onClick={toggleRun}>
          <svg viewBox="0 0 24 24">
            {running ? (
              <>
                <rect x="6" y="5" width="4" height="14" />
                <rect x="14" y="5" width="4" height="14" />
              </>
            ) : (
              <path d="M8 5v14l11-7z" />
            )}
          </svg>
          <span>{running ? 'Stop bot' : 'Run bot'}</span>
        </button>
      </div>

      <div className="workspace">
        <div className="toolbox">
          <div className="toolbox-title">Blocks</div>
          {TOOLBOX.map((t) => (
            <div
              key={t.name}
              className="toolbox-cat"
              style={{ '--cat-color': t.color }}
              draggable="true"
              onDragStart={(e) => e.dataTransfer.setData('text/plain', t.name)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d={t.icon} />
              </svg>
              {t.name}
            </div>
          ))}
        </div>

        <div
          className="canvas"
          style={{ fontSize: `${zoom / 100}em` }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={dropBlock}
        >
          <div className="canvas-hint">Drag a block from the left onto the canvas</div>

          <div className="block trade-params">
            <div className="block-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="#04140f" strokeWidth="2">
                <path d="M4 19V9M12 19V5M20 19v-7" />
              </svg>
              Trade parameters
            </div>
            <div className="block-row"><span>Market</span><span>Volatility 75 Index</span></div>
            <div className="block-row"><span>Trade type</span><span>Rise/Fall</span></div>
            <div className="block-row"><span>Stake</span><span>$10.00</span></div>
          </div>
          <div className="block-connector"></div>
          <div className="block purchase">
            <div className="block-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="#04140f" strokeWidth="2">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.7 13.4a2 2 0 002 1.6h9.7a2 2 0 002-1.6L23 6H6" />
              </svg>
              Purchase
            </div>
            <div className="block-row"><span>Condition</span><span>Rise</span></div>
          </div>
          <div className="block-connector"></div>
          <div className="block restart">
            <div className="block-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="#04140f" strokeWidth="2">
                <path d="M23 4v6h-6M1 20v-6h6M3.5 9a9 9 0 0114.7-3.4L23 10M1 14l4.8 4.4A9 9 0 0020.5 15" />
              </svg>
              Restart trading
            </div>
            <div className="block-row"><span>On loss</span><span>Restart</span></div>
            <div className="block-row"><span>On win</span><span>Stop</span></div>
          </div>

          <div className="zoom-controls">
            <button onClick={() => setZoom((z) => Math.min(150, z + 10))}>+</button>
            <div className="zoom-pct">{zoom}%</div>
            <button onClick={() => setZoom((z) => Math.max(50, z - 10))}>−</button>
          </div>
        </div>
      </div>

      {strategyOpen && (
        <div
          className="strategy-backdrop visible"
          onClick={(e) => {
            if (e.target.classList.contains('strategy-backdrop')) setStrategyOpen(false);
          }}
        >
          <div className="strategy-panel">
            <h3>Quick strategy</h3>
            <div className="sub">Load a ready-made strategy onto the canvas to start from.</div>
            <div className="strategy-grid">
              {STRATEGIES.map((s) => (
                <div
                  key={s.name}
                  className="qs-card"
                  style={{ '--qs-color': s.color }}
                  onClick={() => {
                    alert(`"${s.name}" would load its full block chain onto the canvas once strategy templates are built.`);
                    setStrategyOpen(false);
                  }}
                >
                  <div className="icon-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d={s.icon} />
                    </svg>
                  </div>
                  <h4>{s.name}</h4>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>
            <button className="strategy-close" onClick={() => setStrategyOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {running && (
        <div className="stats-panel visible">
          <div className="stats-grid">
            <div className="stat-box">
              <div className={`val ${stats.pnl >= 0 ? 'pos' : 'neg'}`}>
                {stats.pnl >= 0 ? '+$' : '-$'}
                {Math.abs(stats.pnl).toFixed(2)}
              </div>
              <div className="lbl">Total profit/loss</div>
            </div>
            <div className="stat-box">
              <div className="val">{stats.runs}</div>
              <div className="lbl">Total runs</div>
            </div>
            <div className="stat-box">
              <div className="val pos">{stats.won}</div>
              <div className="lbl">Contracts won</div>
            </div>
            <div className="stat-box">
              <div className="val neg">{stats.lost}</div>
              <div className="lbl">Contracts lost</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
