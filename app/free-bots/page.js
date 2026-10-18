'use client';

import { useEffect, useRef, useState } from 'react';
import UtilityBar from '@/components/UtilityBar';
import TabNav from '@/components/TabNav';
import { useDeriv } from '@/context/DerivProvider';
import { formatDerivError, lastDigitFromQuote } from '@/lib/deriv-market';

const BOTS = [
  {
    name: 'Infinity Algo',
    desc: 'Momentum-based Rise/Fall bot. It waits for two consecutive price moves in the same direction before considering a trade.',
    cat: 'automated',
    icon: 'M13 2L4 14h7l-1 8 9-12h-7l1-8z',
    kind: 'momentum',
  },
  {
    name: 'Steady Climb',
    desc: 'Fixed-stake Rise/Fall bot that follows the most recent price direction. Fixed stake does not mean low risk or guaranteed growth.',
    cat: 'normal',
    icon: 'M4 8h16v12H4zM9 8V5a3 3 0 016 0v3M9 14a1 1 0 100 2 1 1 0 000-2zM15 14a1 1 0 100 2 1 1 0 000-2z',
    kind: 'trend',
  },
  {
    name: 'Digit Hunter',
    desc: 'Digit Over strategy on the last digit of the live Volatility 100 (1s) quote. It only enters when the digit is above the configured barrier.',
    cat: 'automated',
    icon: 'M13 2L4 14h7l-1 8 9-12h-7l1-8z',
    kind: 'digit-over',
  },
  {
    name: 'Even Guard',
    desc: 'Digit Even strategy. It waits for an even last digit before considering a one-tick contract. This does not guarantee a win or cap account-level losses.',
    cat: 'normal',
    icon: 'M4 8h16v12H4zM9 8V5a3 3 0 016 0v3M9 14a1 1 0 100 2 1 1 0 000-2zM15 14a1 1 0 100 2 1 1 0 000-2z',
    kind: 'even',
  },
];

export default function FreeBotsPage() {
  const { status, activeAccount, subscribeTicks, unsubscribeTicks, requestProposal, buyContract, subscribeContract } = useDeriv();
  const [filter, setFilter] = useState('all');
  const [selectedBot, setSelectedBot] = useState(null);
  const [stake, setStake] = useState('0.50');
  const [maxRuns, setMaxRuns] = useState(10);
  const [running, setRunning] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [runs, setRuns] = useState(0);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [pnl, setPnl] = useState(0);
  const [price, setPrice] = useState(null);
  const [error, setError] = useState('');

  const visible = filter === 'all' ? BOTS : BOTS.filter((b) => b.cat === filter);
  const runningRef = useRef(false);
  const activeContractRef = useRef(false);
  const previousQuoteRef = useRef(null);
  const runsRef = useRef(0);
  const maxRunsRef = useRef(maxRuns);
  const stakeRef = useRef(stake);
  const botRef = useRef(selectedBot);
  const accountRef = useRef(activeAccount);
  const accountIdentityRef = useRef(null);

  useEffect(() => { runningRef.current = running; }, [running]);
  useEffect(() => { maxRunsRef.current = maxRuns; }, [maxRuns]);
  useEffect(() => { stakeRef.current = stake; }, [stake]);
  useEffect(() => { botRef.current = selectedBot; }, [selectedBot]);
  useEffect(() => { accountRef.current = activeAccount; }, [activeAccount]);
  useEffect(() => {
    const nextIdentity = activeAccount
      ? `${activeAccount.account_id || activeAccount.loginid || ''}:${activeAccount.account_type || ''}`
      : null;
    const previousIdentity = accountIdentityRef.current;
    if (previousIdentity && nextIdentity && previousIdentity !== nextIdentity) {
      runningRef.current = false;
      setRunning(false);
      setConfirmOpen(false);
      setError('Your selected Deriv account changed. The bot has been stopped. Confirm the new account before restarting.');
      previousQuoteRef.current = null;
    }
    if (nextIdentity) accountIdentityRef.current = nextIdentity;
    if (!activeAccount && previousIdentity) {
      runningRef.current = false;
      setRunning(false);
      setConfirmOpen(false);
      setError('Deriv account disconnected. The bot has been stopped.');
      previousQuoteRef.current = null;
      accountIdentityRef.current = null;
    }
  }, [activeAccount?.account_id, activeAccount?.loginid, activeAccount?.account_type]);

  useEffect(() => {
    if (status !== 'connected' || !selectedBot) return undefined;
    let disposed = false;

    const onTick = async (tick) => {
      const quote = Number(tick?.quote);
      if (!Number.isFinite(quote)) return;
      setPrice(quote);

      const previous = previousQuoteRef.current;
      previousQuoteRef.current = quote;
      if (!runningRef.current || activeContractRef.current || previous === null) return;

      if (runsRef.current >= maxRunsRef.current) {
        runningRef.current = false;
        setRunning(false);
        return;
      }

      const bot = botRef.current;
      let contractType = null;
      let barrier;

      if (bot?.kind === 'momentum') {
        const beforePrevious = onTick.beforePreviousQuote;
        onTick.beforePreviousQuote = previous;
        if (beforePrevious === null || beforePrevious === undefined) return;
        const firstDirection = previous - beforePrevious;
        const secondDirection = quote - previous;
        if (firstDirection === 0 || secondDirection === 0 || Math.sign(firstDirection) !== Math.sign(secondDirection)) return;
        contractType = secondDirection > 0 ? 'CALL' : 'PUT';
      } else if (bot?.kind === 'trend') {
        if (quote === previous) return;
        contractType = quote > previous ? 'CALL' : 'PUT';
      } else if (bot?.kind === 'digit-over') {
        const digit = lastDigitFromQuote(tick.quote);
        if (digit === null || digit <= 4) return;
        contractType = 'DIGITOVER';
        barrier = '4';
      } else if (bot?.kind === 'even') {
        const digit = lastDigitFromQuote(tick.quote);
        if (digit === null || digit % 2 !== 0) return;
        contractType = 'DIGITEVEN';
      }

      if (!contractType) return;

      const currentStake = Number(stakeRef.current);
      if (!Number.isFinite(currentStake) || currentStake < 0.35) {
        setError('Stake must be at least 0.35. Bot stopped before placing another trade.');
        runningRef.current = false;
        setRunning(false);
        return;
      }

      activeContractRef.current = true;
      try {
        const account = accountRef.current;
        const proposalParams = {
          amount: currentStake,
          basis: 'stake',
          contract_type: contractType,
          currency: account?.currency || 'USD',
          duration: 1,
          duration_unit: 't',
          underlying_symbol: '1HZ100V',
          subscribe: 1,
        };
        if (barrier !== undefined) proposalParams.barrier = barrier;
        const proposal = await requestProposal(proposalParams);
        // If Stop was pressed while waiting for the proposal, do not buy it.
        if (!runningRef.current) {
          activeContractRef.current = false;
          return;
        }
        const bought = await buyContract(proposal.id, proposal.ask_price || proposal.price);
        runsRef.current += 1;
        setRuns(runsRef.current);

        await subscribeContract(bought.contract_id, (contract) => {
          if (!contract?.is_sold) return;
          const profit = Number(contract.profit || 0);
          const safeProfit = Number.isFinite(profit) ? profit : 0;
          setPnl((value) => value + safeProfit);
          if (safeProfit > 0) setWins((value) => value + 1);
          else setLosses((value) => value + 1);
          activeContractRef.current = false;
          if (runsRef.current >= maxRunsRef.current) {
            runningRef.current = false;
            setRunning(false);
          }
        });
      } catch (err) {
        activeContractRef.current = false;
        runningRef.current = false;
        setRunning(false);
        setError(formatDerivError(err));
      }
    };

    onTick.beforePreviousQuote = null;
    subscribeTicks('1HZ100V', onTick).catch((err) => {
      if (!disposed) setError(formatDerivError(err));
    });

    return () => {
      disposed = true;
      unsubscribeTicks();
    };
  }, [status, selectedBot, activeAccount, subscribeTicks, unsubscribeTicks, requestProposal, buyContract, subscribeContract]);

  function openBot(bot) {
    stopBot();
    setSelectedBot(bot);
    setRuns(0);
    runsRef.current = 0;
    setWins(0);
    setLosses(0);
    setPnl(0);
    setPrice(null);
    setError('');
    previousQuoteRef.current = null;
  }

  function startBot() {
    if (!selectedBot) return;
    if (status !== 'connected' || !activeAccount) {
      setError('Connect to Deriv and select an account before running a bot.');
      return;
    }
    const amount = Number(stake);
    if (!Number.isFinite(amount) || amount < 0.35) {
      setError('Enter a valid stake of at least 0.35 in your account currency.');
      return;
    }
    if (!Number.isInteger(Number(maxRuns)) || Number(maxRuns) < 1 || Number(maxRuns) > 100) {
      setError('Maximum trades must be a whole number from 1 to 100.');
      return;
    }
    setConfirmOpen(true);
  }

  function confirmStart() {
    setConfirmOpen(false);
    setError('');
    previousQuoteRef.current = null;
    runningRef.current = true;
    setRunning(true);
  }

  function stopBot() {
    runningRef.current = false;
    setRunning(false);
    setConfirmOpen(false);
  }

  return (
    <>
      <UtilityBar />
      <TabNav />
      <main>
        {selectedBot ? (
          <section className="freebot-runner">
            <button className="back-link" type="button" onClick={() => { stopBot(); setSelectedBot(null); }}>← Back to Free Bots</button>
            <h2>{selectedBot.name}</h2>
            <p>{selectedBot.desc}</p>
            <div className="exec-market">
              <div className="m-name">Volatility 100 (1s) · {activeAccount?.account_type === 'real' ? 'REAL' : 'DEMO'} account</div>
              <div className="m-price">{price === null ? 'Waiting for live tick…' : price.toFixed(3)}</div>
              <div className="m-name">Account: {activeAccount?.account_id || 'Not connected'} · {activeAccount?.currency || 'USD'}</div>
            </div>
            <div className="field-grid">
              <div className="field-box"><label>Stake ({activeAccount?.currency || 'USD'})</label><input type="number" min="0.35" step="0.05" value={stake} disabled={running} onChange={(e) => setStake(e.target.value)} /></div>
              <div className="field-box"><label>Maximum trades (1–100)</label><input type="number" min="1" max="100" step="1" value={maxRuns} disabled={running} onChange={(e) => setMaxRuns(Number(e.target.value))} /></div>
            </div>
            <div className="start-row">
              <button className={running ? 'start-btn running' : 'start-btn'} type="button" onClick={running ? stopBot : startBot}>{running ? 'Stop bot' : 'Start bot'}</button>
              <span>{running ? 'Running · will stop after the configured trade count' : 'Stopped'}</span>
            </div>
            <div className="live-stats visible">
              <div className="stat"><div className="v">{runs}</div><div className="l">Contracts bought</div></div>
              <div className="stat"><div className="v">{wins}</div><div className="l">Won</div></div>
              <div className="stat"><div className="v">{losses}</div><div className="l">Lost</div></div>
              <div className="stat"><div className="v" style={{ color: pnl >= 0 ? '#4ade80' : '#fb7185' }}>{pnl >= 0 ? '+' : '-'}{Math.abs(pnl).toFixed(2)} {activeAccount?.currency || 'USD'}</div><div className="l">Realized P/L</div></div>
            </div>
            {error && <div className="error-banner" role="alert">{error}</div>}
            <p className="risk-note">Automated contracts can lose money, including the full stake. Stopping the bot prevents new entries; a contract already purchased can still settle. No strategy guarantees profit.</p>
            {confirmOpen && <div className="strategy-backdrop visible"><div className="strategy-panel"><h3>Confirm {selectedBot.name}</h3><p className="sub">This will place real Deriv contracts on your selected {activeAccount?.account_type === 'real' ? 'REAL' : 'DEMO'} account. Stake: {stake} {activeAccount?.currency || 'USD'} per contract. Maximum: {maxRuns} contracts. Confirm only if you understand the risk.</p><div className="strategy-modal-actions"><button className="strategy-close" type="button" onClick={() => setConfirmOpen(false)}>Cancel</button><button className="tb-run running" type="button" onClick={confirmStart}>Confirm & Start</button></div></div></div>}
          </section>
        ) : (
          <>
            <div className="filter-row">
              <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>👑 All</button>
              <button className={filter === 'automated' ? 'active' : ''} onClick={() => setFilter('automated')}>⚡ Automated</button>
              <button className={filter === 'normal' ? 'active' : ''} onClick={() => setFilter('normal')}>🤖 Normal</button>
            </div>
            <div>
              {visible.map((bot) => (
                <div className="bot-card" key={bot.name}>
                  {bot.cat === 'automated' && <div className="auto-badge">AUTO</div>}
                  <div className="icon-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={bot.icon} /></svg></div>
                  <h3>{bot.name}</h3>
                  <p>{bot.desc}</p>
                  <button className="run-bot-btn" type="button" onClick={() => openBot(bot)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" /></svg>
                    Configure & Run
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}
