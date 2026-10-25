'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import UtilityBar from '@/components/UtilityBar';
import TabNav from '@/components/TabNav';
import { useDeriv } from '@/context/DerivProvider';
import { findDerivSymbol, lastDigitFromQuote, formatDerivError } from '@/lib/deriv-market';

const MARKETS = [
  { label: 'Volatility 100 (1s) Index', query: 'Volatility 100 (1s)', fallback: '1HZ100V' },
  { label: 'Volatility 50 (1s) Index', query: 'Volatility 50 (1s)', fallback: '1HZ50V' },
  { label: 'Volatility 10 (1s) Index', query: 'Volatility 10 (1s)', fallback: '1HZ10V' },
];
const panel = { background: '#111827', border: '1px solid #263244', borderRadius: 14, padding: 18 };
const field = { width: '100%', boxSizing: 'border-box', background: '#0b1220', color: '#f8fafc', border: '1px solid #374151', borderRadius: 8, padding: '10px 12px', marginTop: 7 };
const label = { display: 'block', color: '#cbd5e1', fontSize: 13, fontWeight: 600 };

export default function BotBuilderPage() {
  const { status, activeAccount, balance, getActiveSymbols, subscribeTicks, unsubscribeTicks, requestProposal, buyContract, subscribeContract } = useDeriv();
  const [market, setMarket] = useState('1HZ100V');
    const [condition, setCondition] = useState('over');
  const [barrier, setBarrier] = useState('1');
  const [stake, setStake] = useState('0.50');
  const [maxTrades, setMaxTrades] = useState('10');
  const [maxLoss, setMaxLoss] = useState('5');
  const [speed, setSpeed] = useState('normal');
  const [running, setRunning] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [trades, setTrades] = useState(0);
  const [pnl, setPnl] = useState(0);
  const [quote, setQuote] = useState(null);
  const [message, setMessage] = useState('');
  const [symbols, setSymbols] = useState([]);
  const runningRef = useRef(false);
  const contractRef = useRef(false);
  const tickCountRef = useRef(0);
  const tradesRef = useRef(0);
  const pnlRef = useRef(0);
  const configRef = useRef({});
  const onTickRef = useRef(null);

  configRef.current = { market, condition, barrier: Number(barrier), stake: Number(stake), maxTrades: Number(maxTrades), maxLoss: Number(maxLoss), speed, currency: activeAccount?.currency || 'USD' };

  const stop = useCallback((reason) => {
    runningRef.current = false;
    setRunning(false);
    if (reason) setMessage(reason);
  }, []);

  useEffect(() => {
    let cancelled = false;
    getActiveSymbols().then((items) => {
      if (!cancelled) {
        setSymbols(items);
        setMarket(findDerivSymbol(items, 'Volatility 100 (1s)', '1HZ100V'));
      }
    }).catch((err) => {
      if (!cancelled) setMessage(formatDerivError(err));
    });
    return () => { cancelled = true; };
  }, [getActiveSymbols]);

  onTickRef.current = async (tick) => {
    setQuote(Number(tick.quote));
    const cfg = configRef.current;
    if (!runningRef.current || contractRef.current) return;
    if (tradesRef.current >= cfg.maxTrades) {
      stop('Maximum number of trades reached. Bot stopped.');
      return;
    }
    if (pnlRef.current <= -cfg.maxLoss) {
      stop('Maximum session loss reached. Bot stopped opening new trades.');
      return;
    }
    const digit = lastDigitFromQuote(tick.quote);
    if (digit === null) return;
    const qualifies = cfg.condition === 'over' ? digit > cfg.barrier
      : cfg.condition === 'under' ? digit < cfg.barrier : digit === cfg.barrier;
    if (!qualifies) { tickCountRef.current = 0; return; }
    tickCountRef.current += 1;
    if (cfg.speed === 'normal' && tickCountRef.current < 2) return;
    tickCountRef.current = 0;
    contractRef.current = true;
    try {
      const proposal = await requestProposal({
        amount: cfg.stake, basis: 'stake', contract_type: cfg.condition === 'under' ? 'DIGITUNDER' : cfg.condition === 'equals' ? 'DIGITMATCH' : 'DIGITOVER',
        currency: cfg.currency, duration: 1, duration_unit: 't', underlying_symbol: cfg.market,
        barrier: String(cfg.barrier), subscribe: 1,
      });
      const buy = await buyContract(proposal.id, proposal.ask_price || proposal.price);
      tradesRef.current += 1;
      setTrades(tradesRef.current);
      await subscribeContract(buy.contract_id, (contract) => {
        if (!contract?.is_sold) return;
        const profit = Number(contract.profit || 0);
        if (Number.isFinite(profit)) {
          pnlRef.current += profit;
          setPnl(pnlRef.current);
        }
        contractRef.current = false;
        if (pnlRef.current <= -configRef.current.maxLoss) stop('Maximum session loss reached. Bot stopped.');
        else if (tradesRef.current >= configRef.current.maxTrades) stop('Maximum number of trades reached. Bot stopped.');
      });
    } catch (err) {
      contractRef.current = false;
      stop(formatDerivError(err));
    }
  };

  useEffect(() => {
    if (status !== 'connected') return undefined;
    subscribeTicks(market, (tick) => onTickRef.current?.(tick))
      .catch((err) => setMessage(formatDerivError(err)));
    return () => unsubscribeTicks();
  }, [status, market, subscribeTicks, unsubscribeTicks]);

  const availableMarkets = symbols.filter((item) => /volatility/i.test(item.display_name || item.underlying_symbol_name || '') && (item.underlying_symbol || item.symbol));

  function chooseMarket(value) {
    setMarket(value);
  }

  function begin() {
    setMessage('');
    if (status !== 'connected' || !activeAccount) { setMessage('Connect a Deriv account first.'); return; }
    if (!Number.isFinite(Number(stake)) || Number(stake) < 0.35) { setMessage('Stake must be at least 0.35.'); return; }
    if (!Number.isInteger(Number(maxTrades)) || Number(maxTrades) < 1 || Number(maxTrades) > 100) { setMessage('Maximum trades must be a whole number from 1 to 100.'); return; }
    if (!Number.isFinite(Number(maxLoss)) || Number(maxLoss) <= 0) { setMessage('Maximum session loss must be greater than zero.'); return; }
    if (!Number.isInteger(Number(barrier)) || Number(barrier) < 0 || Number(barrier) > 9) { setMessage('Last digit must be a whole number from 0 to 9.'); return; }
    setConfirmOpen(true);
  }

  function confirmStart() {
    setConfirmOpen(false);
    tradesRef.current = 0; pnlRef.current = 0; tickCountRef.current = 0;
    setTrades(0); setPnl(0); setMessage('');
    runningRef.current = true; setRunning(true);
  }

  return (
    <>
      <UtilityBar />
      <TabNav />
      <main style={{ maxWidth: 1180, margin: '0 auto', padding: '26px 18px', color: '#f8fafc' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
          <div><p style={{ color: '#fb923c', fontWeight: 700, margin: '0 0 6px' }}>STARTRADERS · VISUAL STRATEGY WORKSPACE</p><h1 style={{ margin: 0, fontSize: 32 }}>Bot Builder</h1><p style={{ color: '#9ca3af', marginBottom: 0 }}>Build a digit strategy, review the rules, and run it without leaving StarTraders.</p></div>
          <div style={{ ...panel, padding: '10px 14px' }}><div style={{ color: '#9ca3af', fontSize: 12 }}>CONNECTION</div><strong style={{ color: status === 'connected' ? '#4ade80' : '#fbbf24' }}>{status === 'connected' ? 'Connected' : status === 'connecting' ? 'Connecting…' : 'Not connected'}</strong><div style={{ fontSize: 12, color: '#cbd5e1', marginTop: 5 }}>{activeAccount ? activeAccount.account_id + ' · ' + (activeAccount.account_type === 'real' ? 'REAL' : 'DEMO') : 'Sign in to choose an account'}</div></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))', gap: 18 }}>
          <section style={panel}>
            <h2 style={{ marginTop: 0, fontSize: 19 }}>1. Choose your market</h2>
            <label style={label}>Market</label>
            <select style={field} value={market} onChange={(e) => chooseMarket(e.target.value)}>
              {availableMarkets.length > 0
                ? availableMarkets.map((item) => <option key={item.underlying_symbol || item.symbol} value={item.underlying_symbol || item.symbol}>{item.display_name || item.underlying_symbol_name || item.underlying_symbol || item.symbol}</option>)
                : MARKETS.map((item) => <option key={item.fallback} value={item.fallback}>{item.label}</option>)}
            </select>
            <div style={{ color: '#9ca3af', fontSize: 13, marginTop: 8 }}>Live quote: <strong style={{ color: '#f8fafc' }}>{quote === null ? 'Waiting for market tick…' : quote}</strong></div>
            <h2 style={{ fontSize: 19, marginTop: 24 }}>2. Build your rule</h2>
            <label style={label}>When the last digit is…</label>
            <select style={field} value={condition} onChange={(e) => setCondition(e.target.value)}>
              <option value="over">Greater than</option><option value="under">Less than</option><option value="equals">Equal to</option>
            </select>
            <label style={{ ...label, marginTop: 14 }}>Digit (0–9)</label>
            <select style={field} value={barrier} onChange={(e) => setBarrier(e.target.value)}>{Array.from({ length: 10 }, (_, n) => <option key={n} value={n}>{n}</option>)}</select>
            <div style={{ marginTop: 14, borderRadius: 8, background: '#0b1220', padding: 12, color: '#cbd5e1', fontSize: 14 }}>IF last digit is <strong style={{ color: '#fb923c' }}>{condition === 'over' ? 'greater than' : condition === 'under' ? 'less than' : 'equal to'} {barrier}</strong>, THEN place a 1-tick {condition === 'under' ? 'Digit Under' : condition === 'equals' ? 'Digit Match' : 'Digit Over'} contract.</div>
          </section>

          <section style={panel}>
            <h2 style={{ marginTop: 0, fontSize: 19 }}>3. Set risk controls</h2>
            <label style={label}>Stake per trade ({activeAccount?.currency || 'USD'})</label><input style={field} type="number" min="0.35" step="0.1" value={stake} onChange={(e) => setStake(e.target.value)} />
            <label style={{ ...label, marginTop: 14 }}>Maximum trades per run</label><input style={field} type="number" min="1" max="100" step="1" value={maxTrades} onChange={(e) => setMaxTrades(e.target.value)} />
            <label style={{ ...label, marginTop: 14 }}>Stop opening trades at session loss ({activeAccount?.currency || 'USD'})</label><input style={field} type="number" min="0.01" step="0.1" value={maxLoss} onChange={(e) => setMaxLoss(e.target.value)} />
            <label style={{ ...label, marginTop: 14 }}>Entry mode</label>
            <select style={field} value={speed} onChange={(e) => setSpeed(e.target.value)}><option value="normal">Normal — wait for 2 qualifying ticks</option><option value="fast">Fast — enter on first qualifying tick</option></select>
            <div style={{ color: '#9ca3af', fontSize: 12, marginTop: 10 }}>Loss control is client-side and stops new entries after a settled contract reaches the limit. It cannot prevent slippage, connection delays, or losses on an already-open contract.</div>
          </section>
        </div>

        <section style={{ ...panel, marginTop: 18 }}>
          <h2 style={{ marginTop: 0, fontSize: 19 }}>4. Review and run</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 12 }}>
            <div><div style={{ color: '#9ca3af', fontSize: 12 }}>SELECTED ACCOUNT</div><strong>{activeAccount ? (activeAccount.account_type === 'real' ? 'REAL' : 'DEMO') + ' · ' + activeAccount.account_id : 'Not connected'}</strong></div>
            <div><div style={{ color: '#9ca3af', fontSize: 12 }}>TRADES PLACED</div><strong>{trades} / {maxTrades || '—'}</strong></div>
            <div><div style={{ color: '#9ca3af', fontSize: 12 }}>SESSION P/L</div><strong style={{ color: pnl >= 0 ? '#4ade80' : '#f87171' }}>{pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} {activeAccount?.currency || 'USD'}</strong></div>
            <div><div style={{ color: '#9ca3af', fontSize: 12 }}>BOT STATUS</div><strong style={{ color: running ? '#4ade80' : '#fbbf24' }}>{running ? 'RUNNING' : 'STOPPED'}</strong></div>
          </div>
          {message && <div role="alert" style={{ marginTop: 14, padding: 12, borderRadius: 8, background: '#451a1a', color: '#fecaca' }}>{message}</div>}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
            <button onClick={running ? () => stop('Bot stopped. Any already-open contract will continue until settlement.') : begin} style={{ border: 0, borderRadius: 9, padding: '12px 22px', fontWeight: 800, cursor: 'pointer', color: '#111827', background: running ? '#f87171' : '#fb923c' }}>{running ? 'Stop bot' : 'Review & start bot'}</button>
            <span style={{ alignSelf: 'center', color: '#9ca3af', fontSize: 13 }}>{balance ? 'Account balance: ' + balance.balance + ' ' + balance.currency : 'Use a demo account first to test your strategy.'}</span>
          </div>
        </section>

        {confirmOpen && <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, zIndex: 1000, background: '#000b', display: 'grid', placeItems: 'center', padding: 18 }}>
          <div style={{ ...panel, maxWidth: 500, width: '100%', boxSizing: 'border-box' }}>
            <h2 style={{ marginTop: 0 }}>Confirm automated trading</h2>
            <p>You are about to run this strategy on the selected <strong>{activeAccount?.account_type === 'real' ? 'REAL' : 'DEMO'}</strong> account: {activeAccount?.account_id}.</p>
            <p>Stake: {stake} {activeAccount?.currency || 'USD'} · Max trades: {maxTrades} · Session loss stop: {maxLoss} {activeAccount?.currency || 'USD'}.</p>
            <p style={{ color: '#fbbf24' }}>Automated trading can lose money. The loss limit is not a guarantee. Please test on demo first.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}><button onClick={() => setConfirmOpen(false)} style={{ ...field, width: 'auto', marginTop: 0, cursor: 'pointer' }}>Cancel</button><button onClick={confirmStart} style={{ ...field, width: 'auto', marginTop: 0, border: 0, background: '#fb923c', color: '#111827', fontWeight: 800, cursor: 'pointer' }}>Confirm & Start</button></div>
          </div>
        </div>}
        <p style={{ color: '#9ca3af', fontSize: 12, marginTop: 18 }}>This first in-app builder creates a simple digit strategy. It is not yet the full Blockly block library or XML import/export experience of Deriv Bot.</p>
      </main>
    </>
  );
}
