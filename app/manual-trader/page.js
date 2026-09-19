'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDeriv } from '../../context/DerivProvider';

const DEFAULT_SYMBOL = 'R_75';

const durationOptions = [
  { label: '5 ticks', value: 5, unit: 't' },
  { label: '10 ticks', value: 10, unit: 't' },
  { label: '15 ticks', value: 15, unit: 't' },
  { label: '1 minute', value: 1, unit: 'm' },
  { label: '5 minutes', value: 5, unit: 'm' },
];

function money(value, currency = 'USD') {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return `${n.toFixed(2)} ${currency}`;
}

function number(value, digits = 2) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return n.toFixed(digits);
}

function findVol75(symbols) {
  return (
    symbols.find((x) => x.symbol === 'R_75') ||
    symbols.find((x) => x.symbol === '1HZ75V') ||
    symbols.find((x) => /volatility 75/i.test(x.display_name || '')) ||
    symbols.find((x) => /volatility 75/i.test(x.name || '')) ||
    null
  );
}

export default function ManualTraderPage() {
  const {
    accounts,
    activeAccount,
    activeAccountId,
    balance,
    status,
    error: providerError,
    isLoggedIn,
    connect,
    login,
    getActiveSymbols,
    subscribeTicks,
    unsubscribeTicks,
    requestProposal,
    buyContract,
    subscribeContract,
    unsubscribeContract,
    sellContract,
    getPortfolio,
    getProfitHistory,
    refreshBalance,
  } = useDeriv();

  const [symbol, setSymbol] = useState(DEFAULT_SYMBOL);
  const [marketName, setMarketName] = useState('Volatility 75 Index');
  const [quote, setQuote] = useState(null);
  const [tickHistory, setTickHistory] = useState([]);
  const [marketLoading, setMarketLoading] = useState(true);

  const [stake, setStake] = useState('10');
  const [duration, setDuration] = useState(durationOptions[0]);

  const [proposal, setProposal] = useState(null);
  const [proposalSide, setProposalSide] = useState(null);
  const [proposalLoading, setProposalLoading] = useState(false);
  const [buyLoading, setBuyLoading] = useState(false);
  const [realConfirm, setRealConfirm] = useState(false);

  const [position, setPosition] = useState(null);
  const [openPositions, setOpenPositions] = useState([]);
  const [history, setHistory] = useState([]);

  const [pageError, setPageError] = useState('');
  const [notice, setNotice] = useState('');

  const tickUnsubscribeRef = useRef(null);
  const contractUnsubsRef = useRef(new Map());

  const connected = status === 'connected';
  const connectionLabel =
    status === 'connected'
      ? 'DERIV CONNECTED'
      : status === 'connecting'
      ? 'CONNECTING TO DERIV'
      : status === 'error'
      ? 'CONNECTION ERROR'
      : 'DISCONNECTED';

  const currency = activeAccount?.currency || 'USD';

  const loadMarket = useCallback(async () => {
    if (!connected) return;

    setMarketLoading(true);
    setPageError('');

    try {
      const symbols = await getActiveSymbols('synthetic_index');
      const found = findVol75(symbols);

      if (!found) {
        throw new Error('Volatility 75 was not returned by Deriv for this account.');
      }

      setSymbol(found.symbol);
      setMarketName(found.display_name || found.name || 'Volatility 75 Index');
    } catch (e) {
      setPageError(e.message || 'Could not load Deriv markets');
    } finally {
      setMarketLoading(false);
    }
  }, [connected, getActiveSymbols]);

  const loadHistory = useCallback(async () => {
    if (!connected) return;

    try {
      const result = await getProfitHistory({ limit: 10 });
      setHistory(result?.transactions || []);
    } catch {}
  }, [connected, getProfitHistory]);

  const watchContract = useCallback(
    async (contractId) => {
      if (!contractId) return;

      const id = String(contractId);

      const callback = (contract) => {
        const normalized = {
          ...contract,
          contractId: String(contract.contract_id || id),
          buyPrice: Number(contract.buy_price),
          payout: Number(contract.payout),
          profit: Number(contract.profit),
          bidPrice: Number(contract.bid_price),
          currentSpot: contract.current_spot,
          entrySpot: contract.entry_spot,
          exitSpot: contract.exit_spot,
          isSold: Boolean(contract.is_sold),
          isValidToSell: Boolean(contract.is_valid_to_sell),
          status: contract.status || 'open',
        };

        setPosition((prev) => ({
          ...(prev || {}),
          ...normalized,
        }));

        if (normalized.isSold || normalized.status === 'sold') {
          setNotice(
            `Contract ${id} has closed. Final P/L: ${money(
              normalized.profit,
              currency
            )}`
          );
          refreshBalance().catch(() => {});
          loadHistory().catch(() => {});
        }
      };

      try {
        const current = await subscribeContract(Number(contractId), callback);

        if (current) callback(current);

        contractUnsubsRef.current.set(id, () => {
          unsubscribeContract(Number(contractId)).catch(() => {});
        });
      } catch (e) {
        setPageError(e.message || 'Could not monitor the contract');
      }
    },
    [
      currency,
      loadHistory,
      refreshBalance,
      subscribeContract,
      unsubscribeContract,
    ]
  );

  const loadOpenPositions = useCallback(async () => {
    if (!connected) return;

    try {
      const contracts = await getPortfolio();
      setOpenPositions(contracts || []);

      if (contracts?.length) {
        const first = contracts[0];
        if (first.contract_id) {
          await watchContract(first.contract_id);
        }
      }
    } catch {}
  }, [connected, getPortfolio, watchContract]);

  useEffect(() => {
    if (!connected) return;

    loadMarket();
    loadHistory();
    loadOpenPositions();
  }, [connected, loadHistory, loadMarket, loadOpenPositions]);

  useEffect(() => {
    if (!connected || !symbol) return;

    let cancelled = false;

    const startTicks = async () => {
      try {
        if (tickUnsubscribeRef.current) {
          tickUnsubscribeRef.current();
          tickUnsubscribeRef.current = null;
        }

        const unsubscribe = await subscribeTicks(symbol, (tick) => {
          if (cancelled) return;

          const value = Number(tick.quote);
          if (!Number.isFinite(value)) return;

          setQuote(value);
          setTickHistory((prev) => {
            const next = [...prev, value];
            return next.slice(-80);
          });
        });

        if (!cancelled) {
          tickUnsubscribeRef.current = unsubscribe;
        }
      } catch (e) {
        if (!cancelled) {
          setPageError(e.message || 'Could not subscribe to live ticks');
        }
      }
    };

    startTicks();

    return () => {
      cancelled = true;
      if (tickUnsubscribeRef.current) {
        tickUnsubscribeRef.current();
        tickUnsubscribeRef.current = null;
      }
      unsubscribeTicks(symbol).catch(() => {});
    };
  }, [connected, symbol, subscribeTicks, unsubscribeTicks]);

  useEffect(() => {
    return () => {
      contractUnsubsRef.current.forEach((fn) => fn());
      contractUnsubsRef.current.clear();
    };
  }, []);

  const getProposal = async (side) => {
    setPageError('');
    setNotice('');
    setProposal(null);
    setProposalSide(side);

    const amount = Number(stake);
    if (!Number.isFinite(amount) || amount <= 0) {
      setPageError('Enter a valid stake amount.');
      return;
    }

    if (!connected) {
      setPageError('Deriv is not connected yet.');
      return;
    }

    setProposalLoading(true);

    try {
      const result = await requestProposal({
        symbol,
        contractType: side === 'rise' ? 'CALL' : 'PUT',
        amount,
        currency,
        duration: duration.value,
        durationUnit: duration.unit,
      });

      setProposal(result);
    } catch (e) {
      setPageError(e.message || 'Deriv could not create the proposal');
    } finally {
      setProposalLoading(false);
    }
  };

  const executeBuy = async () => {
    if (!proposal?.id) {
      setPageError('No live Deriv proposal is available.');
      return;
    }

    if (activeAccount?.isDemo !== true && !realConfirm) {
      setPageError(
        'This is a real Deriv account. Confirm the real-money warning before buying.'
      );
      return;
    }

    setBuyLoading(true);
    setPageError('');
    setNotice('');

    try {
      const purchase = await buyContract(
        proposal.id,
        Number(proposal.ask_price)
      );

      if (!purchase?.contract_id) {
        throw new Error('Deriv did not return a contract ID.');
      }

      const newPosition = {
        contractId: String(purchase.contract_id),
        contractType: proposalSide === 'rise' ? 'CALL' : 'PUT',
        direction: proposalSide,
        buyPrice: Number(purchase.buy_price ?? proposal.ask_price),
        payout: Number(purchase.payout ?? proposal.payout),
        profit: 0,
        bidPrice: null,
        status: 'open',
        isSold: false,
        isValidToSell: false,
        currentSpot: quote,
        market: marketName,
      };

      setPosition(newPosition);
      setProposal(null);
      setNotice(
        `Buy confirmed by Deriv. Contract ${purchase.contract_id} is now being monitored live.`
      );

      await watchContract(purchase.contract_id);
      refreshBalance().catch(() => {});
      loadOpenPositions().catch(() => {});
    } catch (e) {
      setPageError(e.message || 'Deriv rejected the purchase');
    } finally {
      setBuyLoading(false);
    }
  };

  const closePosition = async () => {
    if (!position?.contractId) return;

    if (!position.isValidToSell) {
      setPageError('Deriv does not currently allow this contract to be sold.');
      return;
    }

    setBuyLoading(true);
    setPageError('');

    try {
      await sellContract(position.contractId, position.bidPrice);
      setNotice(`Close request sent for contract ${position.contractId}.`);
    } catch (e) {
      setPageError(e.message || 'Deriv could not close the contract');
    } finally {
      setBuyLoading(false);
    }
  };

  const chartPoints = useMemo(() => {
    if (!tickHistory.length) return '';
    const min = Math.min(...tickHistory);
    const max = Math.max(...tickHistory);
    const range = max - min || 1;

    return tickHistory
      .map((v, i) => {
        const x = (i / Math.max(tickHistory.length - 1, 1)) * 100;
        const y = 90 - ((v - min) / range) * 75;
        return `${x},${y}`;
      })
      .join(' ');
  }, [tickHistory]);

  if (!isLoggedIn) {
    return (
      <main style={styles.page}>
        <section style={styles.centerCard}>
          <div style={styles.logo}>★ STAR<span>TRADERS</span></div>
          <h1 style={styles.title}>Manual Trading</h1>
          <p style={styles.muted}>
            Connect your Deriv account to use the live trading terminal.
          </p>
          <button style={styles.primaryButton} onClick={login}>
            LOGIN WITH DERIV
          </button>
        </section>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.wrapper}>
        <div style={styles.topLine}>
          <div>
            <div style={styles.eyebrow}>STARTRADERS · MANUAL TRADING</div>
            <h1 style={styles.marketTitle}>{marketName}</h1>
            <div style={styles.subTitle}>Synthetic · 24/7 · {symbol}</div>
          </div>

          <div
            style={{
              ...styles.connectionBadge,
              borderColor: connected ? '#19e68c' : '#ffb020',
              color: connected ? '#19e68c' : '#ffb020',
            }}
          >
            <span style={styles.dot} />
            {connectionLabel}
          </div>
        </div>

        {(pageError || providerError) && (
          <div style={styles.errorBox}>{pageError || providerError}</div>
        )}

        {notice && <div style={styles.noticeBox}>{notice}</div>}

        <section style={styles.marketCard}>
          <div style={styles.pricePanel}>
            <div style={styles.orangeLabel}>LIVE MARKET PRICE</div>
            <div style={styles.price}>
              {quote === null ? '—' : number(quote, 2)}
            </div>
            <div style={styles.liveText}>
              {connected && quote !== null
                ? '● LIVE TICK STREAM'
                : connected
                ? 'Waiting for live tick...'
                : 'Waiting for Deriv connection...'}
            </div>
          </div>

          <div style={styles.chartPanel}>
            {tickHistory.length > 1 ? (
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={styles.svg}>
                <defs>
                  <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopOpacity="0.30" />
                    <stop offset="100%" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polygon
                  points={`0,100 ${chartPoints} 100,100`}
                  fill="url(#chartFill)"
                />
                <polyline
                  points={chartPoints}
                  fill="none"
                  stroke="#18d7ff"
                  strokeWidth="0.8"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            ) : (
              <div style={styles.chartEmpty}>
                {marketLoading ? 'Loading market...' : 'Waiting for live market data...'}
              </div>
            )}
          </div>
        </section>

        <section style={styles.grid}>
          <div style={styles.card}>
            <div style={styles.cardTitle}>TRADE SETUP</div>

            <label style={styles.label}>Duration</label>
            <select
              value={`${duration.value}-${duration.unit}`}
              onChange={(e) => {
                const found = durationOptions.find(
                  (x) => `${x.value}-${x.unit}` === e.target.value
                );
                if (found) setDuration(found);
              }}
              style={styles.input}
            >
              {durationOptions.map((x) => (
                <option key={`${x.value}-${x.unit}`} value={`${x.value}-${x.unit}`}>
                  {x.label}
                </option>
              ))}
            </select>

            <label style={styles.label}>Stake ({currency})</label>
            <div style={styles.stakeRow}>
              <button
                style={styles.smallButton}
                onClick={() =>
                  setStake((v) => Math.max(0.35, Number(v || 0) - 1).toFixed(2))
                }
              >
                −
              </button>
              <input
                type="number"
                min="0.35"
                step="0.01"
                value={stake}
                onChange={(e) => setStake(e.target.value)}
                style={{ ...styles.input, margin: 0, textAlign: 'center' }}
              />
              <button
                style={styles.smallButton}
                onClick={() => setStake((v) => (Number(v || 0) + 1).toFixed(2))}
              >
                +
              </button>
            </div>

            <div style={styles.risk}>Stake: {money(stake, currency)}</div>

            <div style={styles.directionGrid}>
              <button
                style={{ ...styles.tradeButton, ...styles.rise }}
                disabled={proposalLoading || !connected}
                onClick={() => getProposal('rise')}
              >
                ↑ RISE
                <small>GET DERIV PROPOSAL</small>
              </button>

              <button
                style={{ ...styles.tradeButton, ...styles.fall }}
                disabled={proposalLoading || !connected}
                onClick={() => getProposal('fall')}
              >
                ↓ FALL
                <small>GET DERIV PROPOSAL</small>
              </button>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardTitle}>ACCOUNT</div>
            <div style={styles.accountRow}>
              <div>
                <div style={styles.mutedSmall}>
                  {activeAccount?.isDemo ? 'DEMO ACCOUNT' : 'REAL ACCOUNT'}
                </div>
                <strong>{activeAccountId || '—'}</strong>
              </div>
              <div style={styles.balance}>{money(balance, currency)}</div>
            </div>

            <div style={styles.statusBox}>
              <span style={{ color: connected ? '#19e68c' : '#ffb020' }}>●</span>
              {connected ? ' Connected · Real-time' : ` ${connectionLabel}`}
            </div>

            {!connected && (
              <button
                style={styles.secondaryButton}
                onClick={() => connect(activeAccountId).catch(() => {})}
              >
                RECONNECT DERIV
              </button>
            )}
          </div>
        </section>

        {proposal && (
          <section style={styles.proposalCard}>
            <div style={styles.cardTitle}>LIVE DERIV PROPOSAL</div>
            <div style={styles.proposalGrid}>
              <div>
                <span>Direction</span>
                <strong style={{ color: proposalSide === 'rise' ? '#19e68c' : '#ff5577' }}>
                  {proposalSide === 'rise' ? 'RISE / CALL' : 'FALL / PUT'}
                </strong>
              </div>
              <div>
                <span>Ask price</span>
                <strong>{money(proposal.ask_price, currency)}</strong>
              </div>
              <div>
                <span>Payout</span>
                <strong>{money(proposal.payout, currency)}</strong>
              </div>
              <div>
                <span>Spot</span>
                <strong>{number(proposal.spot, 2)}</strong>
              </div>
            </div>

            {activeAccount?.isDemo !== true && (
              <label style={styles.confirm}>
                <input
                  type="checkbox"
                  checked={realConfirm}
                  onChange={(e) => setRealConfirm(e.target.checked)}
                />
                I understand this purchase uses my REAL Deriv account.
              </label>
            )}

            <div style={styles.proposalActions}>
              <button
                style={styles.primaryButton}
                disabled={buyLoading}
                onClick={executeBuy}
              >
                {buyLoading ? 'BUYING...' : 'CONFIRM BUY'}
              </button>
              <button
                style={styles.secondaryButton}
                onClick={() => setProposal(null)}
              >
                CANCEL
              </button>
            </div>
          </section>
        )}

        {position && (
          <section style={styles.positionCard}>
            <div style={styles.cardTitle}>CURRENT CONTRACT</div>
            <div style={styles.positionHeader}>
              <strong>#{position.contractId}</strong>
              <span
                style={{
                  ...styles.statusPill,
                  color: position.isSold ? '#19e68c' : '#18d7ff',
                }}
              >
                {position.isSold ? 'CLOSED' : 'OPEN'}
              </span>
            </div>

            <div style={styles.positionGrid}>
              <div><span>Direction</span><strong>{position.direction === 'rise' ? 'RISE / CALL' : 'FALL / PUT'}</strong></div>
              <div><span>Stake</span><strong>{money(position.buyPrice, currency)}</strong></div>
              <div><span>Payout</span><strong>{money(position.payout, currency)}</strong></div>
              <div>
                <span>Profit / Loss</span>
                <strong style={{ color: Number(position.profit) >= 0 ? '#19e68c' : '#ff5577' }}>
                  {money(position.profit, currency)}
                </strong>
              </div>
              <div><span>Bid price</span><strong>{money(position.bidPrice, currency)}</strong></div>
              <div><span>Current spot</span><strong>{position.currentSpot ?? '—'}</strong></div>
            </div>

            {!position.isSold && (
              <button
                style={{
                  ...styles.sellButton,
                  opacity: position.isValidToSell && !buyLoading ? 1 : 0.5,
                }}
                disabled={!position.isValidToSell || buyLoading}
                onClick={closePosition}
              >
                SELL / CLOSE
              </button>
            )}
          </section>
        )}

        <section style={styles.card}>
          <div style={styles.historyHeader}>
            <div className={styles.cardTitle}>RECENT DERIV TRADES</div>
            <button style={styles.refresh} onClick={loadHistory}>REFRESH</button>
          </div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Contract</th>
                  <th>Type</th>
                  <th>Buy</th>
                  <th>Profit/Loss</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.length ? (
                  history.map((row, i) => {
                    const profit = Number(row.profit);
                    return (
                      <tr key={`${row.contract_id || 'row'}-${i}`}>
                        <td>{row.contract_id || '—'}</td>
                        <td>{row.contract_type || '—'}</td>
                        <td>{money(row.buy_price, currency)}</td>
                        <td style={{ color: profit >= 0 ? '#19e68c' : '#ff5577' }}>
                          {money(profit, currency)}
                        </td>
                        <td>{row.status || 'closed'}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" style={styles.empty}>
                      No recent trades returned by Deriv.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div style={styles.disclaimer}>
          Trading involves risk. StarTraders sends trading requests to Deriv using your
          authenticated Deriv account. Always verify the account, stake and proposal
          before confirming a purchase.
        </div>
      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#020b17',
    color: '#eef6ff',
    padding: '32px 22px 60px',
    fontFamily: 'Inter, Arial, sans-serif',
  },
  wrapper: { maxWidth: 1420, margin: '0 auto' },
  centerCard: {
    maxWidth: 520,
    margin: '100px auto',
    padding: 42,
    textAlign: 'center',
    background: '#061628',
    border: '1px solid #123b5c',
    borderRadius: 20,
  },
  logo: { fontSize: 22, fontWeight: 900, color: '#ff9b30' },
  title: { fontSize: 42, margin: '18px 0 10px' },
  eyebrow: { color: '#1bdcff', fontSize: 13, fontWeight: 800, letterSpacing: 2 },
  topLine: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 20,
    marginBottom: 24,
  },
  marketTitle: { fontSize: 40, margin: '8px 0 4px' },
  subTitle: { color: '#8fa8bd' },
  connectionBadge: {
    padding: '10px 15px',
    border: '1px solid',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
    whiteSpace: 'nowrap',
  },
  dot: {
    display: 'inline-block',
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'currentColor',
    marginRight: 8,
  },
  marketCard: {
    display: 'grid',
    gridTemplateColumns: '310px 1fr',
    gap: 14,
    background: '#06182b',
    border: '1px solid #124466',
    borderRadius: 18,
    padding: 18,
  },
  pricePanel: { padding: 16 },
  orangeLabel: { color: '#ff9a35', fontSize: 13, fontWeight: 900, letterSpacing: 1 },
  price: { fontSize: 52, fontWeight: 900, margin: '28px 0 18px' },
  liveText: { color: '#19e68c', fontWeight: 800 },
  chartPanel: {
    minHeight: 260,
    borderRadius: 15,
    background: '#03101e',
    border: '1px solid #0d3048',
    overflow: 'hidden',
  },
  chartEmpty: {
    height: '100%',
    minHeight: 260,
    display: 'grid',
    placeItems: 'center',
    color: '#6f899f',
  },
  svg: { width: '100%', height: '100%', minHeight: 260 },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 14,
    marginTop: 14,
  },
  card: {
    background: '#06182b',
    border: '1px solid #124466',
    borderRadius: 18,
    padding: 20,
  },
  cardTitle: { color: '#ff9a35', fontWeight: 900, fontSize: 13, letterSpacing: 1 },
  label: { display: 'block', color: '#93a9bc', fontSize: 12, margin: '17px 0 7px' },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '12px 13px',
    background: '#020d1a',
    color: '#fff',
    border: '1px solid #174b6d',
    borderRadius: 9,
  },
  stakeRow: { display: 'grid', gridTemplateColumns: '44px 1fr 44px', gap: 8 },
  smallButton: {
    border: '1px solid #174b6d',
    background: '#0a2439',
    color: '#fff',
    borderRadius: 9,
    fontSize: 22,
  },
  risk: { marginTop: 9, color: '#19e68c', fontSize: 12 },
  directionGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 20 },
  tradeButton: {
    borderRadius: 12,
    padding: '17px 10px',
    fontWeight: 900,
    fontSize: 17,
    color: '#fff',
    cursor: 'pointer',
    border: '1px solid',
  },
  rise: { background: '#063b35', borderColor: '#19e68c' },
  fall: { background: '#42172a', borderColor: '#ff5577' },
  tradeButtonSmall: {},
  accountRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 15,
    marginTop: 18,
  },
  mutedSmall: { color: '#7f97aa', fontSize: 11, marginBottom: 5 },
  balance: { fontSize: 24, fontWeight: 900, color: '#19e68c' },
  statusBox: {
    marginTop: 22,
    padding: 13,
    background: '#03111f',
    borderRadius: 10,
    color: '#b6c7d5',
  },
  primaryButton: {
    background: '#10c9ef',
    color: '#00111a',
    border: 0,
    borderRadius: 10,
    padding: '13px 20px',
    fontWeight: 900,
    cursor: 'pointer',
  },
  secondaryButton: {
    background: 'transparent',
    color: '#d9e7f2',
    border: '1px solid #32617e',
    borderRadius: 10,
    padding: '12px 18px',
    fontWeight: 800,
    cursor: 'pointer',
    marginTop: 12,
  },
  proposalCard: {
    marginTop: 14,
    background: '#071d30',
    border: '1px solid #18d7ff',
    borderRadius: 18,
    padding: 20,
  },
  proposalGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 12,
    marginTop: 18,
  },
  proposalGridItem: {},
  proposalGridSpan: {},
  proposalActions: { display: 'flex', gap: 10, marginTop: 18 },
  confirm: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 18,
    color: '#ffd27a',
    fontSize: 13,
  },
  positionCard: {
    marginTop: 14,
    background: '#071d30',
    border: '1px solid #19e68c',
    borderRadius: 18,
    padding: 20,
  },
  positionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 15,
    fontSize: 17,
  },
  statusPill: { fontWeight: 900 },
  positionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16,
    marginTop: 20,
  },
  positionGridItem: {},
  sellButton: {
    marginTop: 20,
    width: '100%',
    background: '#0ec7e9',
    color: '#00131c',
    border: 0,
    borderRadius: 10,
    padding: 15,
    fontWeight: 900,
    cursor: 'pointer',
  },
  historyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  refresh: {
    background: 'transparent',
    color: '#18d7ff',
    border: '1px solid #1d5877',
    borderRadius: 7,
    padding: '7px 11px',
    cursor: 'pointer',
  },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  empty: { textAlign: 'center', padding: 25, color: '#70879a' },
  disclaimer: {
    marginTop: 18,
    padding: 15,
    borderRadius: 10,
    background: '#111d29',
    color: '#8fa3b3',
    fontSize: 12,
    lineHeight: 1.5,
  },
  errorBox: {
    marginBottom: 14,
    padding: 13,
    background: '#3a1420',
    border: '1px solid #ff5577',
    color: '#ff9aae',
    borderRadius: 10,
  },
  noticeBox: {
    marginBottom: 14,
    padding: 13,
    background: '#063b35',
    border: '1px solid #19e68c',
    color: '#a9ffd5',
    borderRadius: 10,
  },
  muted: { color: '#8fa8bd', lineHeight: 1.6 },
};

styles.tradeButton['small'] = { display: 'block', fontSize: 9, marginTop: 5, opacity: 0.75 };
styles.proposalGrid = styles.proposalGrid;
