'use client';

import { useEffect, useRef, useState } from 'react';
import UtilityBar from '@/components/UtilityBar';
import TabNav from '@/components/TabNav';
import { useDeriv } from '@/context/DerivProvider';
import { findDerivSymbol, lastDigitFromQuote, formatDerivError } from '@/lib/deriv-market';

const STRATEGIES = [
  { color: '#fb923c', name: 'Over 1', cond: 'Trades DIGITOVER when the last digit is greater than 1', setup: 'Over 1', contract_type: 'DIGITOVER', barrier: '1' },
  { color: '#4ade80', name: 'Over 1 Pro', cond: 'Live tick-driven Over 1 strategy with one active contract at a time', setup: 'Over 1', contract_type: 'DIGITOVER', barrier: '1' },
  { color: '#a855f7', name: 'Under 8', cond: 'Trades DIGITUNDER when the last digit is less than 8', setup: 'Under 8', contract_type: 'DIGITUNDER', barrier: '8' },
];

export default function SpeedbotPage() {
  const { status, activeAccount, getActiveSymbols, subscribeTicks, unsubscribeTicks, requestProposal, buyContract, subscribeContract } = useDeriv();
  const [mode, setMode] = useState('ai');
  const [soloCombo, setSoloCombo] = useState('solo');
  const [view, setView] = useState('list');
  const [activeStrategy, setActiveStrategy] = useState(null);
  const [speed, setSpeed] = useState('normal');
  const [running, setRunning] = useState(false);
  const [runs, setRuns] = useState(0);
  const [pnl, setPnl] = useState(0);
  const [execPrice, setExecPrice] = useState(null);
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [stake, setStake] = useState(0.5);
  const [maxRuns, setMaxRuns] = useState(10);

  const runningRef = useRef(false);
  const activeContractRef = useRef(false);
  const symbolRef = useRef('1HZ100V');

  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const symbols = await getActiveSymbols();
        if (!cancelled) symbolRef.current = findDerivSymbol(symbols, 'Volatility 100 (1s)', '1HZ100V');
      } catch (err) {
        if (!cancelled) setError(formatDerivError(err));
      }
    })();
    return () => { cancelled = true; };
  }, [getActiveSymbols]);

  useEffect(() => {
    if (status !== 'connected') return undefined;

    const onTick = async (tick) => {
      setExecPrice(Number(tick.quote));

      if (!runningRef.current || activeContractRef.current || !activeStrategy) return;
      if (runs >= maxRuns) {
        stopRun();
        return;
      }

      const digit = lastDigitFromQuote(tick.quote);
      if (digit === null) return;

      const shouldTrade = activeStrategy.contract_type === 'DIGITOVER'
        ? digit > Number(activeStrategy.barrier)
        : digit < Number(activeStrategy.barrier);

      if (!shouldTrade) return;

      activeContractRef.current = true;
      try {
        const currency = activeAccount?.currency || 'USD';
        const proposal = await requestProposal({
          amount: Number(stake),
          basis: 'stake',
          contract_type: activeStrategy.contract_type,
          currency,
          duration: 1,
          duration_unit: 't',
          underlying_symbol: symbolRef.current,
          barrier: activeStrategy.barrier,
          subscribe: 1,
        });

        const buy = await buyContract(proposal.id, proposal.ask_price || proposal.price);
        setRuns((value) => value + 1);

        await subscribeContract(buy.contract_id, (contract) => {
          if (!contract?.is_sold) return;
          const profit = Number(contract.profit || 0);
          setPnl((value) => value + (Number.isFinite(profit) ? profit : 0));
          activeContractRef.current = false;
        });
      } catch (err) {
        activeContractRef.current = false;
        setError(formatDerivError(err));
        stopRun();
      }
    };

    subscribeTicks(symbolRef.current, onTick).catch((err) => setError(formatDerivError(err)));
    return () => unsubscribeTicks();
  }, [
    status,
    activeAccount,
    activeStrategy,
    runs,
    maxRuns,
    stake,
    getActiveSymbols,
    subscribeTicks,
    unsubscribeTicks,
    requestProposal,
    buyContract,
    subscribeContract,
  ]);

  function openExecute(strategy) {
    setActiveStrategy(strategy);
    setView('execute');
    setRuns(0);
    setPnl(0);
    setError('');
  }

  function backToList() {
    stopRun();
    setView('list');
  }

  function startRun() {
    if (!activeStrategy || status !== 'connected') {
      setError('Connect a Deriv account before starting the bot.');
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

  function stopRun() {
    setRunning(false);
    runningRef.current = false;
    activeContractRef.current = false;
  }

  return (
    <>
      <UtilityBar />
      <TabNav />

      {view === 'execute' && activeStrategy ? (
        <main>
          <div className="back-link" onClick={backToList}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
            Back to Speedbot
          </div>
          <div className="execute-title">Live Deriv execution · {activeStrategy.name}</div>

          <div className="start-row">
            <button className={running ? 'start-btn running' : 'start-btn'} onClick={running ? stopRun : startRun}>
              {running ? 'Stop bot' : 'Start bot'}
            </button>
            <div className="speed-toggle-row">
              <button className={speed === 'fast' ? 'active' : ''} onClick={() => setSpeed('fast')}>⚡ Fast</button>
              <button className={speed === 'normal' ? 'active' : ''} onClick={() => setSpeed('normal')}>▶▶ Normal</button>
            </div>
          </div>

          <div className="exec-market">
            <div className="m-name">Volatility 100 (1s) Index</div>
            <div className="m-price">{execPrice === null ? 'Waiting for tick…' : execPrice.toFixed(3)}</div>
          </div>
          <div className="exec-condition">{activeStrategy.cond}</div>

          <div className="field-grid">
            <div className="field-box"><label>Ticks</label><input type="number" value="1" readOnly /></div>
            <div className="field-box"><label>Stake</label><input type="number" min="0.35" step="0.1" value={stake} onChange={(e) => setStake(e.target.value)} /></div>
            <div className="field-box"><label>Max runs</label><input type="number" min="1" max="100" value={maxRuns} onChange={(e) => setMaxRuns(Math.max(1, Number(e.target.value) || 1))} /></div>
            <div className="field-box"><label>Account</label><input value={activeAccount?.account_id || 'Not connected'} readOnly /></div>
          </div>

          {error && <div className="error-banner">{error}</div>}

          <div className="live-stats visible">
            <div className="stat"><div className="v">{runs}</div><div className="l">Real contracts</div></div>
            <div className="stat"><div className="v">{pnl >= 0 ? '+$' : '-$'}{Math.abs(pnl).toFixed(2)}</div><div className="l">Real profit/loss</div></div>
            <div className="stat"><div className="v">{running ? 'RUNNING' : 'STOPPED'}</div><div className="l">Bot state</div></div>
          </div>

          {confirmOpen && (
            <div className="strategy-backdrop visible">
              <div className="strategy-panel">
                <h3>Confirm live trading</h3>
                <div className="sub">
                  Start bot will place real Deriv contracts on the currently selected {activeAccount?.account_type === 'real' ? 'REAL' : 'DEMO'} account.
                  Maximum runs: {maxRuns}. Stake per contract: {stake} {activeAccount?.currency || 'USD'}.
                </div>
                <div className="strategy-modal-actions">
                  <button className="strategy-close" onClick={() => setConfirmOpen(false)}>Cancel</button>
                  <button className="tb-run running" onClick={confirmStart}>Confirm & Start</button>
                </div>
              </div>
            </div>
          )}
        </main>
      ) : (
        <main>
          <div className="toggle-row">
            <button className={mode === 'ai' ? 'active orange' : ''} onClick={() => setMode('ai')}>AI Robots</button>
            <button className={mode === 'dual' ? 'active orange' : ''} onClick={() => setMode('dual')}>Dual Edge</button>
          </div>
          <div className="toggle-row small">
            <button className={soloCombo === 'solo' ? 'active blue' : ''} onClick={() => setSoloCombo('solo')}>Solo</button>
            <button className={soloCombo === 'combo' ? 'active blue' : ''} onClick={() => setSoloCombo('combo')}>Combo</button>
          </div>

          {STRATEGIES.map((s) => (
            <div className="strategy-card" style={{ '--sc-color': s.color }} key={s.name}>
              <h3>{s.name}</h3>
              <div className="cond">{s.cond}</div>
              <div className="setup-box"><span>Trade setup</span><span>{s.setup}</span></div>
              <button className="open-bot-btn" style={{ '--sc-color': s.color }} onClick={() => openExecute(s)}>Open bot</button>
              <div style={{ clear: 'both' }}></div>
            </div>
          ))}
        </main>
      )}
    </>
  );
}
