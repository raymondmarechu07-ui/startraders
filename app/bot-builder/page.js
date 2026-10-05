'use client';

import { useEffect, useRef, useState } from 'react';
import UtilityBar from '@/components/UtilityBar';
import TabNav from '@/components/TabNav';
import { useDeriv } from '@/context/DerivProvider';
import { formatDerivError } from '@/lib/deriv-market';

const TOOLBOX = [
  { color: '#5eead4', name: 'Trade parameters', icon: 'M4 19V9M12 19V5M20 19v-7' },
  { color: '#facc15', name: 'Purchase', icon: 'M1 1h4l2.7 13.4a2 2 0 002 1.6h9.7a2 2 0 002-1.6L23 6H6' },
  { color: '#4ade80', name: 'Sell', icon: 'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6' },
  { color: '#fb7185', name: 'Restart trading', icon: 'M23 4v6h-6M1 20v-6h6M3.5 9a9 9 0 0114.7-3.4L23 10M1 14l4.8 4.4A9 9 0 0020.5 15' },
  { color: '#a855f7', name: 'Analysis tools', icon: 'M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-4.35-4.35' },
  { color: '#38bdf8', name: 'Other blocks', icon: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z' },
];

const STRATEGIES = [
  ['Martingale', ['Trade parameters', 'Purchase', 'Restart trading']],
  ["D'Alembert", ['Trade parameters', 'Purchase', 'Restart trading']],
  ['Even/Odd streak', ['Trade parameters', 'Analysis tools', 'Purchase', 'Restart trading']],
  ['Fixed stake', ['Trade parameters', 'Purchase']],
];

const DEFAULT_BLOCKS = ['Trade parameters', 'Purchase', 'Restart trading'];

export default function BotBuilderPage() {
  const { status, activeAccount, subscribeTicks, unsubscribeTicks, requestProposal, buyContract, subscribeContract } = useDeriv();
  const [blocks, setBlocks] = useState(DEFAULT_BLOCKS);
  const [running, setRunning] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [strategyOpen, setStrategyOpen] = useState(false);
  const [stats, setStats] = useState({ runs: 0, won: 0, lost: 0, pnl: 0 });
  const [stake, setStake] = useState(1);
  const [maxRuns, setMaxRuns] = useState(10);
  const [livePrice, setLivePrice] = useState(null);
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const runningRef = useRef(false);
  const activeContractRef = useRef(false);
  const previousQuoteRef = useRef(null);
  const statsRef = useRef(stats);
  const stakeRef = useRef(stake);
  const maxRunsRef = useRef(maxRuns);

  useEffect(() => { runningRef.current = running; }, [running]);
  useEffect(() => { statsRef.current = stats; }, [stats]);
  useEffect(() => { stakeRef.current = stake; }, [stake]);
  useEffect(() => { maxRunsRef.current = maxRuns; }, [maxRuns]);

  useEffect(() => {
    if (status !== 'connected') return undefined;

    const onTick = async (tick) => {
      const quote = Number(tick.quote);
      setLivePrice(quote);

      const previous = previousQuoteRef.current;
      previousQuoteRef.current = quote;

      if (!runningRef.current || activeContractRef.current || previous === null) return;

      if (statsRef.current.runs >= maxRunsRef.current) {
        stopBot();
        return;
      }

      activeContractRef.current = true;
      try {
        const direction = quote >= previous ? 'CALL' : 'PUT';
        const proposal = await requestProposal({
          amount: Number(stakeRef.current),
          basis: 'stake',
          contract_type: direction,
          currency: activeAccount?.currency || 'USD',
          duration: 1,
          duration_unit: 't',
          underlying_symbol: '1HZ100V',
          subscribe: 1,
        });

        const bought = await buyContract(proposal.id, proposal.ask_price || proposal.price);
        setStats((current) => ({ ...current, runs: current.runs + 1 }));

        await subscribeContract(bought.contract_id, (contract) => {
          if (!contract?.is_sold) return;
          const profit = Number(contract.profit || 0);
          setStats((current) => ({
            ...current,
            won: current.won + (profit > 0 ? 1 : 0),
            lost: current.lost + (profit <= 0 ? 1 : 0),
            pnl: current.pnl + (Number.isFinite(profit) ? profit : 0),
          }));
          activeContractRef.current = false;
        });
      } catch (err) {
        activeContractRef.current = false;
        setError(formatDerivError(err));
        stopBot();
      }
    };

    subscribeTicks('1HZ100V', onTick).catch((err) => setError(formatDerivError(err)));
    return () => unsubscribeTicks();
  }, [status, activeAccount, subscribeTicks, unsubscribeTicks, requestProposal, buyContract, subscribeContract]);

  function startBot() {
    if (status !== 'connected') {
      setError('Connect a Deriv account before running the bot.');
      return;
    }
    setConfirmOpen(true);
  }

  function confirmStart() {
    setConfirmOpen(false);
    setError('');
    activeContractRef.current = false;
    setRunning(true);
    runningRef.current = true;
  }

  function stopBot() {
    setRunning(false);
    runningRef.current = false;
    activeContractRef.current = false;
  }

  function dropBlock(event) {
    event.preventDefault();
    const name = event.dataTransfer.getData('text/plain');
    if (!name) return;
    setBlocks((current) => [...current, name]);
  }

  function loadStrategy(name) {
    const strategy = STRATEGIES.find(([label]) => label === name);
    if (!strategy) return;
    setBlocks(strategy[1]);
    setStrategyOpen(false);
  }

  function saveBot() {
    localStorage.setItem('startraders_bot_builder', JSON.stringify({ blocks, stake, maxRuns }));
    setError('Bot saved locally on this device.');
  }

  function exportBot() {
    const blob = new Blob([JSON.stringify({ blocks, stake, maxRuns }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'startraders-bot.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function importBot(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (Array.isArray(parsed.blocks)) setBlocks(parsed.blocks);
        if (Number(parsed.stake) > 0) setStake(Number(parsed.stake));
        if (Number(parsed.maxRuns) > 0) setMaxRuns(Number(parsed.maxRuns));
        setError('Bot imported.');
      } catch {
        setError('That bot file is not valid StarTraders JSON.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  return (
    <>
      <UtilityBar />
      <TabNav />

      <div className="builder-toolbar">
        <label className="tb-btn">
          Import
          <input type="file" accept="application/json,.json" onChange={importBot} hidden />
        </label>
        <button className="tb-btn" onClick={exportBot}>Export</button>
        <button className="tb-btn" onClick={saveBot}>Save</button>
        <div className="tb-spacer"></div>
        <button className="tb-strategy" onClick={() => setStrategyOpen(true)}>Quick strategy</button>
        <button className={running ? 'tb-run running' : 'tb-run'} onClick={running ? stopBot : startBot}>
          {running ? 'Stop bot' : 'Run bot'}
        </button>
      </div>

      <div className="workspace">
        <div className="toolbox">
          <div className="toolbox-title">Blocks</div>
          {TOOLBOX.map((t) => (
            <div key={t.name} className="toolbox-cat" style={{ '--cat-color': t.color }} draggable onDragStart={(e) => e.dataTransfer.setData('text/plain', t.name)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={t.icon} /></svg>
              {t.name}
            </div>
          ))}
        </div>

        <div className="canvas" style={{ fontSize: zoom / 100 + 'em' }} onDragOver={(e) => e.preventDefault()} onDrop={dropBlock}>
          {blocks.map((name, index) => {
            const tool = TOOLBOX.find((item) => item.name === name) || TOOLBOX[0];
            return (
              <div key={index}>
                <div className={'block ' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}>
                  <div className="block-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#04140f" strokeWidth="2"><path d={tool.icon} /></svg>
                    {name}
                  </div>
                  {name === 'Trade parameters' && (
                    <>
                      <div className="block-row"><span>Market</span><span>Volatility 100 (1s)</span></div>
                      <div className="block-row"><span>Trade type</span><span>Rise/Fall · 1 tick</span></div>
                      <div className="block-row"><span>Stake</span><input className="block-inline-input" type="number" min="0.35" step="0.1" value={stake} onChange={(e) => setStake(e.target.value)} /></div>
                      <div className="block-row"><span>Max runs</span><input className="block-inline-input" type="number" min="1" max="100" value={maxRuns} onChange={(e) => setMaxRuns(Math.max(1, Number(e.target.value) || 1))} /></div>
                    </>
                  )}
                  {name === 'Purchase' && <div className="block-row"><span>Execution</span><span>REAL Deriv proposal → buy</span></div>}
                  {name === 'Analysis tools' && <div className="block-row"><span>Signal</span><span>Latest tick direction</span></div>}
                  {name === 'Restart trading' && <div className="block-row"><span>Safety</span><span>Stops after max runs</span></div>}
                  {name === 'Sell' && <div className="block-row"><span>Execution</span><span>Manual sell integration next</span></div>}
                  {name === 'Other blocks' && <div className="block-row"><span>Status</span><span>Available for builder composition</span></div>}
                </div>
                {index < blocks.length - 1 && <div className="block-connector"></div>}
              </div>
            );
          })}

          <div className="canvas-hint">Drag blocks here to compose your strategy.</div>

          <div className="zoom-controls">
            <button onClick={() => setZoom((z) => Math.min(150, z + 10))}>+</button>
            <div className="zoom-pct">{zoom}%</div>
            <button onClick={() => setZoom((z) => Math.max(50, z - 10))}>−</button>
          </div>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="stats-panel visible">
        <div className="stats-grid">
          <div className="stat-box"><div className={'val ' + (stats.pnl >= 0 ? 'pos' : 'neg')}>{stats.pnl >= 0 ? '+$' : '-$'}{Math.abs(stats.pnl).toFixed(2)}</div><div className="lbl">Real profit/loss</div></div>
          <div className="stat-box"><div className="val">{stats.runs}</div><div className="lbl">Real contracts</div></div>
          <div className="stat-box"><div className="val pos">{stats.won}</div><div className="lbl">Contracts won</div></div>
          <div className="stat-box"><div className="val neg">{stats.lost}</div><div className="lbl">Contracts lost</div></div>
          <div className="stat-box"><div className="val">{livePrice === null ? '—' : livePrice.toFixed(3)}</div><div className="lbl">Live price</div></div>
        </div>
      </div>

      {strategyOpen && (
        <div className="strategy-backdrop visible" onClick={(e) => { if (e.target.classList.contains('strategy-backdrop')) setStrategyOpen(false); }}>
          <div className="strategy-panel">
            <h3>Quick strategy</h3>
            <div className="sub">These templates now create real builder blocks. Running them can place real Deriv contracts after confirmation.</div>
            <div className="strategy-grid">
              {STRATEGIES.map(([name]) => (
                <button key={name} className="qs-card" onClick={() => loadStrategy(name)}>
                  <h4>{name}</h4>
                  <p>Load {name} block chain</p>
                </button>
              ))}
            </div>
            <button className="strategy-close" onClick={() => setStrategyOpen(false)}>Close</button>
          </div>
        </div>
      )}

      {confirmOpen && (
        <div className="strategy-backdrop visible">
          <div className="strategy-panel">
            <h3>Confirm live bot trading</h3>
            <div className="sub">
              Run bot will place real 1-tick Rise/Fall contracts on the current {activeAccount?.account_type === 'real' ? 'REAL' : 'DEMO'} Deriv account.
              Maximum runs: {maxRuns}. Stake: {stake} {activeAccount?.currency || 'USD'}.
            </div>
            <button className="tb-run running" onClick={confirmStart}>Confirm & Start</button>
            <button className="strategy-close" onClick={() => setConfirmOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
}
