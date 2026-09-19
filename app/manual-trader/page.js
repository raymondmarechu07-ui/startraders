'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import UtilityBar from '@/components/UtilityBar';
import TabNav from '@/components/TabNav';
import { useDeriv } from '@/context/DerivProvider';

const DURATIONS = [
  { label: '5 ticks', duration: 5, duration_unit: 't' },
  { label: '10 ticks', duration: 10, duration_unit: 't' },
  { label: '1 minute', duration: 1, duration_unit: 'm' },
  { label: '5 minutes', duration: 5, duration_unit: 'm' },
];

function money(value, currency = 'USD') {
  const n = Number(value);

  if (!Number.isFinite(n)) {
    return '—';
  }

  return new Intl.NumberFormat(
    undefined,
    {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  ).format(n);
}

function number(value) {
  const n = Number(value);

  if (!Number.isFinite(n)) {
    return '—';
  }

  return n.toLocaleString(
    undefined,
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );
}

function errorText(error) {
  return (
    error?.message ||
    (typeof error === 'string'
      ? error
      : 'Deriv rejected the request.')
  );
}

function contractStatus(contract) {
  if (!contract) {
    return 'Unknown';
  }

  if (contract.is_sold) {
    const profit =
      Number(contract.profit);

    if (profit > 0) return 'Won';
    if (profit < 0) return 'Lost';

    return 'Settled';
  }

  return (
    contract.status || 'Open'
  );
}

function findVol75(symbols) {
  return symbols.find(
    (item) => {
      const display =
        String(
          item.display_name || ''
        ).toLowerCase();

      const symbol =
        String(
          item.symbol || ''
        ).toLowerCase();

      return (
        display.includes(
          'volatility 75'
        ) ||
        display.includes(
          'volatility 75 index'
        ) ||
        symbol === 'r_75' ||
        symbol === '1hz75v'
      );
    }
  );
}

export default function ManualTraderPage() {
  const {
    activeAccount,
    isLoggedIn,
    balance,
    status,
    error: providerError,

    getActiveSymbols,
    subscribeTicks,
    unsubscribeTicks,

    requestProposal,
    buyContract,

    subscribeContract,

    sellContract,

    getPortfolio,
    getProfitHistory,
  } = useDeriv();

  const [symbol, setSymbol] =
    useState('');

  const [marketName, setMarketName] =
    useState(
      'Volatility 75 Index'
    );

  const [price, setPrice] =
    useState(null);

  const [previousPrice, setPreviousPrice] =
    useState(null);

  const [priceHistory, setPriceHistory] =
    useState([]);

  const [marketLoading, setMarketLoading] =
    useState(true);

  const [duration, setDuration] =
    useState('5 ticks');

  const [stake, setStake] =
    useState(10);

  const [proposal, setProposal] =
    useState(null);

  const [direction, setDirection] =
    useState(null);

  const [proposalLoading, setProposalLoading] =
    useState(false);

  const [buyLoading, setBuyLoading] =
    useState(false);

  const [realConfirmed, setRealConfirmed] =
    useState(false);

  const [positions, setPositions] =
    useState([]);

  const [history, setHistory] =
    useState([]);

  const [historyLoading, setHistoryLoading] =
    useState(false);

  const [sellLoading, setSellLoading] =
    useState({});

  const [message, setMessage] =
    useState('');

  const [tradeError, setTradeError] =
    useState('');

  const currency =
    balance?.currency ||
    activeAccount?.currency ||
    'USD';

  const accountBalance =
    Number(
      balance?.balance ?? 0
    );

  const connected =
    status === 'connected';

  const realAccount =
    activeAccount?.account_type ===
    'real';

  const chart =
    useMemo(() => {
      if (
        priceHistory.length < 2
      ) {
        return '';
      }

      const width = 700;
      const height = 220;
      const padding = 12;

      const min =
        Math.min(
          ...priceHistory
        );

      const max =
        Math.max(
          ...priceHistory
        );

      const range =
        max - min || 1;

      return priceHistory
        .map(
          (value, index) => {
            const x =
              (index /
                (priceHistory.length -
                  1)) *
              width;

            const y =
              height -
              padding -
              ((value - min) /
                range) *
                (height -
                  padding * 2);

            return `${x.toFixed(
              1
            )},${y.toFixed(1)}`;
          }
        )
        .join(' ');
    }, [priceHistory]);

  useEffect(() => {
    let cancelled = false;

    async function loadMarket() {
      if (!connected) {
        setMarketLoading(false);
        return;
      }

      setMarketLoading(true);
      setTradeError('');

      try {
        const symbols =
          await getActiveSymbols(
            'synthetic_index'
          );

        const market =
          findVol75(symbols);

        if (!market?.symbol) {
          throw new Error(
            'Volatility 75 is not currently available from Deriv.'
          );
        }

        if (!cancelled) {
          setSymbol(
            market.symbol
          );

          setMarketName(
            market.display_name ||
              'Volatility 75 Index'
          );
        }
      } catch (error) {
        if (!cancelled) {
          setTradeError(
            errorText(error)
          );
        }
      } finally {
        if (!cancelled) {
          setMarketLoading(false);
        }
      }
    }

    loadMarket();

    return () => {
      cancelled = true;
    };
  }, [
    connected,
    getActiveSymbols,
  ]);

  useEffect(() => {
    if (
      !connected ||
      !symbol
    ) {
      return undefined;
    }

    let cancelled = false;
    let cleanup = null;

    async function startTicks() {
      try {
        cleanup =
          await subscribeTicks(
            symbol,
            (tick) => {
              if (cancelled) {
                return;
              }

              const quote =
                Number(
                  tick?.quote
                );

              if (
                !Number.isFinite(
                  quote
                )
              ) {
                return;
              }

              setPrice(
                (current) => {
                  if (
                    current !==
                    null
                  ) {
                    setPreviousPrice(
                      current
                    );
                  }

                  return quote;
                }
              );

              setPriceHistory(
                (current) =>
                  [
                    ...current,
                    quote,
                  ].slice(-60)
              );
            }
          );
      } catch (error) {
        if (!cancelled) {
          setTradeError(
            errorText(error)
          );
        }
      }
    }

    startTicks();

    return () => {
      cancelled = true;

      if (
        typeof cleanup ===
        'function'
      ) {
        cleanup();
      } else {
        unsubscribeTicks(
          symbol
        ).catch(() => {});
      }
    };
  }, [
    connected,
    symbol,
    subscribeTicks,
    unsubscribeTicks,
  ]);

  const refreshHistory =
    useCallback(
      async () => {
        if (!connected) {
          return;
        }

        setHistoryLoading(
          true
        );

        try {
          const result =
            await getProfitHistory({
              limit: 30,
              offset: 0,
              sort: 'DESC',
            });

          setHistory(
            Array.isArray(
              result?.transactions
            )
              ? result.transactions
              : []
          );
        } catch (error) {
          setTradeError(
            errorText(error)
          );
        } finally {
          setHistoryLoading(
            false
          );
        }
      },
      [
        connected,
        getProfitHistory,
      ]
    );

  const watchContract =
    useCallback(
      async (contract) => {
        if (
          !contract?.contract_id
        ) {
          return;
        }

        const id =
          String(
            contract.contract_id
          );

        setPositions(
          (current) => {
            const next = {
              id,
              contractId: id,

              market:
                contract.underlying_symbol ||
                marketName,

              symbol:
                contract.underlying_symbol ||
                symbol,

              direction:
                contract.contract_type ===
                'PUT'
                  ? 'fall'
                  : 'rise',

              stake: Number(
                contract.buy_price ??
                  0
              ),

              payout: Number(
                contract.payout ??
                  0
              ),

              profit: Number(
                contract.profit ??
                  0
              ),

              bidPrice: Number(
                contract.bid_price ??
                  0
              ),

              status:
                contractStatus(
                  contract
                ),

              isSold:
                Boolean(
                  contract.is_sold
                ),

              isValidToSell:
                Boolean(
                  contract.is_valid_to_sell
                ),

              currentSpot:
                contract.current_spot ??
                null,

              exitSpot:
                contract.exit_spot ??
                null,

              expiry:
                contract.date_expiry ??
                null,
            };

            const exists =
              current.some(
                (item) =>
                  item.id === id
              );

            return exists
              ? current.map(
                  (item) =>
                    item.id === id
                      ? {
                          ...item,
                          ...next,
                        }
                      : item
                )
              : [
                  next,
                  ...current,
                ];
          }
        );

        await subscribeContract(
          id,
          (update) => {
            setPositions(
              (current) =>
                current.map(
                  (item) => {
                    if (
                      item.id !==
                      id
                    ) {
                      return item;
                    }

                    return {
                      ...item,

                      stake: Number(
                        update.buy_price ??
                          item.stake
                      ),

                      payout: Number(
                        update.payout ??
                          item.payout
                      ),

                      profit: Number(
                        update.profit ??
                          item.profit
                      ),

                      bidPrice: Number(
                        update.bid_price ??
                          item.bidPrice
                      ),

                      status:
                        contractStatus(
                          update
                        ),

                      isSold:
                        Boolean(
                          update.is_sold
                        ),

                      isValidToSell:
                        Boolean(
                          update.is_valid_to_sell
                        ),

                      currentSpot:
                        update.current_spot ??
                        item.currentSpot,

                      exitSpot:
                        update.exit_spot ??
                        item.exitSpot,

                      expiry:
                        update.date_expiry ??
                        item.expiry,
                    };
                  }
                )
            );

            if (
              update.is_sold
            ) {
              setMessage(
                `Contract ${id} settled. Final P/L: ${money(
                  update.profit,
                  currency
                )}`
              );

              refreshHistory();
            }
          }
        );
      },
      [
        currency,
        marketName,
        refreshHistory,
        subscribeContract,
        symbol,
      ]
    );

  useEffect(() => {
    if (!connected) {
      return undefined;
    }

    let cancelled = false;

    async function loadOpenPositions() {
      try {
        const contracts =
          await getPortfolio();

        if (cancelled) {
          return;
        }

        for (
          const contract of
            contracts || []
        ) {
          await watchContract(
            contract
          );

          if (cancelled) {
            break;
          }
        }
      } catch (error) {
        if (!cancelled) {
          setTradeError(
            errorText(error)
          );
        }
      }
    }

    loadOpenPositions();
    refreshHistory();

    return () => {
      cancelled = true;
    };
  }, [
    connected,
    getPortfolio,
    refreshHistory,
    watchContract,
  ]);

  const getProposal =
    async (nextDirection) => {
      if (!connected) {
        setTradeError(
          'Connect your Deriv account first.'
        );
        return;
      }

      if (!symbol) {
        setTradeError(
          'The trading market is still loading.'
        );
        return;
      }

      const amount =
        Number(stake);

      if (
        !Number.isFinite(
          amount
        ) ||
        amount <= 0
      ) {
        setTradeError(
          'Enter a valid stake greater than zero.'
        );
        return;
      }

      if (
        accountBalance > 0 &&
        amount >
          accountBalance
      ) {
        setTradeError(
          `Your stake cannot exceed the current ${currency} balance.`
        );
        return;
      }

      const selected =
        DURATIONS.find(
          (item) =>
            item.label ===
            duration
        ) ||
        DURATIONS[0];

      setProposalLoading(
        true
      );

      setProposal(null);
      setDirection(
        nextDirection
      );
      setTradeError('');
      setMessage('');

      try {
        const liveProposal =
          await requestProposal({
            amount,
            basis: 'stake',

            contract_type:
              nextDirection ===
              'rise'
                ? 'CALL'
                : 'PUT',

            currency,

            duration:
              selected.duration,

            duration_unit:
              selected.duration_unit,

            underlying_symbol:
              symbol,
          });

        setProposal(
          liveProposal
        );

        setMessage(
          'Live Deriv proposal received. Review the exact price and payout before buying.'
        );
      } catch (error) {
        setDirection(null);

        setTradeError(
          errorText(error)
        );
      } finally {
        setProposalLoading(
          false
        );
      }
    };

  const confirmBuy =
    async () => {
      if (!proposal?.id) {
        setTradeError(
          'No live Deriv proposal is available.'
        );
        return;
      }

      if (
        realAccount &&
        !realConfirmed
      ) {
        setTradeError(
          'This is a REAL account. Confirm the real-money warning before buying.'
        );
        return;
      }

      const askPrice =
        Number(
          proposal.ask_price
        );

      if (
        !Number.isFinite(
          askPrice
        ) ||
        askPrice <= 0
      ) {
        setTradeError(
          'Deriv did not provide a valid proposal price.'
        );
        return;
      }

      setBuyLoading(true);
      setTradeError('');

      setMessage(
        'Sending the buy request to Deriv...'
      );

      try {
        const purchase =
          await buyContract(
            proposal.id,
            askPrice
          );

        if (
          !purchase?.contract_id
        ) {
          throw new Error(
            'Deriv did not return a contract ID. No position was created.'
          );
        }

        await watchContract({
          contract_id:
            purchase.contract_id,

          contract_type:
            direction === 'rise'
              ? 'CALL'
              : 'PUT',

          underlying_symbol:
            symbol,

          buy_price:
            purchase.buy_price ??
            askPrice,

          payout:
            purchase.payout ??
            proposal.payout,

          profit:
            purchase.profit ??
            0,

          bid_price:
            purchase.bid_price ??
            0,

          is_sold: false,

          is_valid_to_sell:
            false,

          current_spot:
            purchase.current_spot ??
            proposal.spot,
        });

        setProposal(null);
        setDirection(null);
        setRealConfirmed(false);

        setMessage(
          `Buy confirmed by Deriv. Contract #${purchase.contract_id} is now being monitored live.`
        );
      } catch (error) {
        setTradeError(
          errorText(error)
        );

        setMessage('');
      } finally {
        setBuyLoading(false);
      }
    };

  const closePosition =
    async (position) => {
      if (
        !position?.contractId
      ) {
        return;
      }

      if (
        !position.isValidToSell
      ) {
        setTradeError(
          'Deriv does not currently allow this contract to be sold early.'
        );
        return;
      }

      setSellLoading(
        (current) => ({
          ...current,
          [position.id]: true,
        })
      );

      setTradeError('');

      setMessage(
        `Sending close request for contract ${position.contractId}...`
      );

      try {
        await sellContract(
          position.contractId,
          position.bidPrice
        );

        setMessage(
          `Deriv accepted the close request for #${position.contractId}. Waiting for final contract confirmation.`
        );
      } catch (error) {
        setTradeError(
          errorText(error)
        );

        setMessage('');
      } finally {
        setSellLoading(
          (current) => ({
            ...current,
            [position.id]: false,
          })
        );
      }
    };

  const change =
    price != null &&
    previousPrice != null
      ? price -
        previousPrice
      : 0;

  const risk =
    accountBalance > 0
      ? (Number(stake) /
          accountBalance) *
        100
      : 0;

  if (!isLoggedIn) {
    return (
      <>
        <UtilityBar />
        <TabNav />

        <main style={styles.page}>
          <section
            style={
              styles.centerCard
            }
          >
            <h1
              style={
                styles.title
              }
            >
              Manual Trader
            </h1>

            <p
              style={
                styles.muted
              }
            >
              Connect your Deriv account to load live prices, proposals and trading controls.
            </p>

            <button
              type="button"
              onClick={() => {
                window.location.href =
                  '/api/auth/login';
              }}
              style={
                styles.primary
              }
            >
              LOGIN WITH DERIV
            </button>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <UtilityBar />
      <TabNav />

      <main style={styles.page}>
        <div
          style={styles.topRow}
        >
          <div>
            <div
              style={
                styles.eyebrow
              }
            >
              STARTRADERS · MANUAL TRADING
            </div>

            <h1
              style={
                styles.title
              }
            >
              {marketName}
            </h1>

            <div
              style={
                styles.muted
              }
            >
              Synthetic · 24/7{' '}
              {symbol
                ? `· ${symbol}`
                : ''}
            </div>
          </div>

          <div
            style={
              styles.connection
            }
          >
            <span
              style={{
                ...styles.dot,
                background:
                  connected
                    ? '#22c55e'
                    : '#f59e0b',
              }}
            />

            {connected
              ? 'DERIV CONNECTED'
              : status.toUpperCase()}
          </div>
        </div>

        <section
          style={
            styles.priceCard
          }
        >
          <div>
            <div
              style={
                styles.label
              }
            >
              LIVE MARKET PRICE
            </div>

            <div
              style={
                styles.price
              }
            >
              {price == null
                ? '—'
                : number(price)}
            </div>

            <div
              style={{
                color:
                  change >= 0
                    ? '#4ade80'
                    : '#fb7185',
                fontWeight: 700,
              }}
            >
              {price == null
                ? 'Waiting for live tick…'
                : `${
                    change >=
                    0
                      ? '+'
                      : ''
                  }${number(
                    change
                  )}`}
            </div>
          </div>

          <svg
            viewBox="0 0 700 220"
            style={
              styles.chart
            }
          >
            <polyline
              points={chart}
              fill="none"
              stroke="#22d3ee"
              strokeWidth="3"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </section>

        <section
          style={styles.card}
        >
          <div
            style={
              styles.sectionHeader
            }
          >
            <div>
              <div
                style={
                  styles.label
                }
              >
                TRADE SETUP
              </div>

              <h2
                style={
                  styles.h2
                }
              >
                Rise / Fall
              </h2>
            </div>

            <div
              style={
                styles.balance
              }
            >
              Balance:{' '}
              <strong>
                {money(
                  accountBalance,
                  currency
                )}
              </strong>
            </div>
          </div>

          <div
            style={
              styles.controls
            }
          >
            <label
              style={
                styles.field
              }
            >
              <span>
                Duration
              </span>

              <select
                value={
                  duration
                }
                onChange={(
                  event
                ) =>
                  setDuration(
                    event.target
                      .value
                  )
                }
                style={
                  styles.input
                }
              >
                {DURATIONS.map(
                  (item) => (
                    <option
                      key={
                        item.label
                      }
                    >
                      {
                        item.label
                      }
                    </option>
                  )
                )}
              </select>
            </label>

            <label
              style={
                styles.field
              }
            >
              <span>
                Stake ({currency})
              </span>

              <input
                type="number"
                min="0.35"
                step="0.01"
                value={stake}
                onChange={(
                  event
                ) =>
                  setStake(
                    event.target
                      .value
                  )
                }
                style={
                  styles.input
                }
              />
            </label>

            <div
              style={
                styles.riskBox
              }
            >
              <span>
                Risk
              </span>

              <strong>
                {risk
                  ? `${risk.toFixed(
                      1
                    )}%`
                  : '—'}
              </strong>
            </div>
          </div>

          <div
            style={
              styles.tradeButtons
            }
          >
            <button
              type="button"
              disabled={
                !connected ||
                marketLoading ||
                proposalLoading
              }
              onClick={() =>
                getProposal(
                  'rise'
                )
              }
              style={{
                ...styles.tradeButton,
                ...styles.rise,
              }}
            >
              <strong>
                ↑ RISE
              </strong>

              <span>
                {proposalLoading &&
                direction ===
                  'rise'
                  ? 'Getting live proposal…'
                  : 'Get Deriv proposal'}
              </span>
            </button>

            <button
              type="button"
              disabled={
                !connected ||
                marketLoading ||
                proposalLoading
              }
              onClick={() =>
                getProposal(
                  'fall'
                )
              }
              style={{
                ...styles.tradeButton,
                ...styles.fall,
              }}
            >
              <strong>
                ↓ FALL
              </strong>

              <span>
                {proposalLoading &&
                direction ===
                  'fall'
                  ? 'Getting live proposal…'
                  : 'Get Deriv proposal'}
              </span>
            </button>
          </div>

          {proposal && (
            <div
              style={
                styles.proposal
              }
            >
              <div
                style={
                  styles.label
                }
              >
                LIVE DERIV PROPOSAL
              </div>

              <div
                style={
                  styles.proposalGrid
                }
              >
                <div>
                  <span>
                    Direction
                  </span>

                  <strong>
                    {direction ===
                    'rise'
                      ? 'RISE / CALL'
                      : 'FALL / PUT'}
                  </strong>
                </div>

                <div>
                  <span>
                    Ask price
                  </span>

                  <strong>
                    {money(
                      proposal.ask_price,
                      currency
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Payout
                  </span>

                  <strong>
                    {money(
                      proposal.payout,
                      currency
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Spot
                  </span>

                  <strong>
                    {number(
                      proposal.spot
                    )}
                  </strong>
                </div>
              </div>

              {proposal.longcode && (
                <p
                  style={
                    styles.muted
                  }
                >
                  {
                    proposal.longcode
                  }
                </p>
              )}

              {realAccount && (
                <label
                  style={
                    styles.warning
                  }
                >
                  <input
                    type="checkbox"
                    checked={
                      realConfirmed
                    }
                    onChange={(
                      event
                    ) =>
                      setRealConfirmed(
                        event.target
                          .checked
                      )
                    }
                  />

                  <span>
                    This is a REAL Deriv account. I understand that confirming the purchase can use real funds.
                  </span>
                </label>
              )}

              <div
                style={
                  styles.actions
                }
              >
                <button
                  type="button"
                  disabled={
                    buyLoading ||
                    (realAccount &&
                      !realConfirmed)
                  }
                  onClick={
                    confirmBuy
                  }
                  style={
                    styles.primary
                  }
                >
                  {buyLoading
                    ? 'BUYING WITH DERIV…'
                    : 'CONFIRM BUY'}
                </button>

                <button
                  type="button"
                  disabled={
                    buyLoading
                  }
                  onClick={() => {
                    setProposal(
                      null
                    );
                    setDirection(
                      null
                    );
                    setRealConfirmed(
                      false
                    );
                  }}
                  style={
                    styles.secondary
                  }
                >
                  CANCEL
                </button>
              </div>
            </div>
          )}

          {providerError && (
            <div
              style={
                styles.error
              }
            >
              {providerError}
            </div>
          )}

          {tradeError && (
            <div
              style={
                styles.error
              }
            >
              {tradeError}
            </div>
          )}

          {message && (
            <div
              style={
                styles.success
              }
            >
              {message}
            </div>
          )}
        </section>

        <section
          style={styles.card}
        >
          <div
            style={
              styles.sectionHeader
            }
          >
            <div>
              <div
                style={
                  styles.label
                }
              >
                LIVE CONTRACTS
              </div>

              <h2
                style={
                  styles.h2
                }
              >
                Open Positions
              </h2>
            </div>

            <span
              style={
                styles.muted
              }
            >
              {
                positions.length
              }{' '}
              position(s)
            </span>
          </div>

          {positions.length ===
          0 ? (
            <div
              style={
                styles.empty
              }
            >
              No open contracts on this Manual Trader.
            </div>
          ) : (
            positions.map(
              (position) => (
                <div
                  key={
                    position.id
                  }
                  style={
                    styles.position
                  }
                >
                  <div>
                    <strong>
                      {position.direction ===
                      'rise'
                        ? '↑ RISE'
                        : '↓ FALL'}{' '}
                      ·{' '}
                      {
                        position.market
                      }
                    </strong>

                    <div
                      style={
                        styles.muted
                      }
                    >
                      Contract #
                      {
                        position.contractId
                      }
                    </div>

                    <div
                      style={
                        styles.muted
                      }
                    >
                      Spot:{' '}
                      {number(
                        position.currentSpot
                      )}{' '}
                      · Bid:{' '}
                      {number(
                        position.bidPrice
                      )}
                    </div>
                  </div>

                  <div
                    style={
                      styles.positionRight
                    }
                  >
                    <strong
                      style={{
                        color:
                          Number(
                            position.profit
                          ) >=
                          0
                            ? '#4ade80'
                            : '#fb7185',
                      }}
                    >
                      {Number(
                        position.profit
                      ) >=
                      0
                        ? '+'
                        : ''}
                      {money(
                        position.profit,
                        currency
                      )}
                    </strong>

                    <span
                      style={
                        styles.muted
                      }
                    >
                      {position.isSold
                        ? contractStatus(
                            position
                          )
                        : position.status}
                    </span>

                    {!position.isSold &&
                      position.isValidToSell && (
                        <button
                          type="button"
                          disabled={
                            sellLoading[
                              position.id
                            ]
                          }
                          onClick={() =>
                            closePosition(
                              position
                            )
                          }
                          style={
                            styles.close
                          }
                        >
                          {sellLoading[
                            position.id
                          ]
                            ? 'CLOSING…'
                            : 'SELL / CLOSE'}
                        </button>
                      )}
                  </div>
                </div>
              )
            )
          )}
        </section>

        <section
          style={styles.card}
        >
          <div
            style={
              styles.sectionHeader
            }
          >
            <div>
              <div
                style={
                  styles.label
                }
              >
                ACCOUNT HISTORY
              </div>

              <h2
                style={
                  styles.h2
                }
              >
                Recent Deriv Trades
              </h2>
            </div>

            <button
              type="button"
              onClick={
                refreshHistory
              }
              style={
                styles.secondary
              }
            >
              {historyLoading
                ? 'LOADING…'
                : 'REFRESH'}
            </button>
          </div>

          {history.length ===
          0 ? (
            <div
              style={
                styles.empty
              }
            >
              {historyLoading
                ? 'Loading actual Deriv history…'
                : 'No closed Deriv trades found.'}
            </div>
          ) : (
            history
              .slice(0, 15)
              .map(
                (
                  trade,
                  index
                ) => {
                  const profit =
                    Number(
                      trade.profit ??
                        0
                    );

                  return (
                    <div
                      key={
                        trade.transaction_id ||
                        `${trade.purchase_time}-${index}`
                      }
                      style={
                        styles.historyRow
                      }
                    >
                      <div>
                        <strong>
                          {trade.contract_type ||
                            'Deriv contract'}
                        </strong>

                        <div
                          style={
                            styles.muted
                          }
                        >
                          Transaction #
                          {trade.transaction_id ||
                            '—'}
                        </div>
                      </div>

                      <div
                        style={{
                          textAlign:
                            'right',
                        }}
                      >
                        <strong
                          style={{
                            color:
                              profit >=
                              0
                                ? '#4ade80'
                                : '#fb7185',
                          }}
                        >
                          {profit >=
                          0
                            ? '+'
                            : ''}
                          {money(
                            profit,
                            currency
                          )}
                        </strong>

                        <div
                          style={
                            styles.muted
                          }
                        >
                          Buy{' '}
                          {money(
                            trade.buy_price,
                            currency
                          )}{' '}
                          · Sell{' '}
                          {money(
                            trade.sell_price,
                            currency
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
              )
          )}
        </section>
      </main>
    </>
  );
}

const styles = {
  page: {
    minHeight:
      'calc(100vh - 150px)',
    background: '#020914',
    color: '#e5edf8',
    padding:
      '28px clamp(16px, 4vw, 52px) 80px',
  },

  topRow: {
    maxWidth: 1180,
    margin: '0 auto 18px',
    display: 'flex',
    justifyContent:
      'space-between',
    alignItems:
      'flex-end',
    gap: 20,
  },

  eyebrow: {
    color: '#22d3ee',
    fontSize: 12,
    fontWeight: 900,
    letterSpacing:
      '0.16em',
  },

  title: {
    margin:
      '7px 0 3px',
    fontSize:
      'clamp(28px, 4vw, 44px)',
    fontWeight: 900,
  },

  h2: {
    margin:
      '5px 0 0',
    fontSize: 22,
  },

  muted: {
    color: '#8ea3bd',
    fontSize: 13,
    lineHeight: 1.5,
  },

  label: {
    color: '#fb923c',
    fontSize: 11,
    fontWeight: 900,
    letterSpacing:
      '0.14em',
  },

  connection: {
    border:
      '1px solid rgba(34,211,238,.25)',
    borderRadius: 999,
    padding:
      '9px 13px',
    fontSize: 11,
    fontWeight: 900,
  },

  dot: {
    display:
      'inline-block',
    width: 8,
    height: 8,
    borderRadius:
      '50%',
    marginRight: 7,
  },

  priceCard: {
    maxWidth: 1180,
    margin:
      '0 auto 18px',
    padding: 22,
    borderRadius: 18,
    border:
      '1px solid rgba(34,211,238,.2)',
    background:
      'linear-gradient(135deg, rgba(8,30,52,.98), rgba(4,14,28,.98))',
    display: 'grid',
    gridTemplateColumns:
      'minmax(180px, .35fr) 1fr',
    gap: 18,
    overflow: 'hidden',
  },

  price: {
    fontSize:
      'clamp(34px, 6vw, 62px)',
    fontWeight: 900,
    margin:
      '8px 0',
  },

  chart: {
    width: '100%',
    minHeight: 190,
    background:
      'rgba(2,9,20,.5)',
    borderRadius: 12,
  },

  card: {
    maxWidth: 1180,
    margin:
      '0 auto 18px',
    padding: 22,
    borderRadius: 18,
    border:
      '1px solid rgba(100,150,200,.16)',
    background:
      'rgba(6,19,35,.96)',
  },

  sectionHeader: {
    display: 'flex',
    justifyContent:
      'space-between',
    alignItems:
      'center',
    gap: 15,
    marginBottom: 18,
  },

  balance: {
    color: '#8ea3bd',
    fontSize: 13,
  },

  controls: {
    display: 'grid',
    gridTemplateColumns:
      '1fr 1fr 160px',
    gap: 12,
    marginBottom: 14,
  },

  field: {
    display: 'grid',
    gap: 6,
    color: '#9fb1c7',
    fontSize: 12,
    fontWeight: 800,
  },

  input: {
    width: '100%',
    boxSizing:
      'border-box',
    padding:
      '12px 13px',
    borderRadius: 10,
    border:
      '1px solid rgba(148,163,184,.22)',
    background:
      '#071425',
    color: '#eef6ff',
    fontSize: 14,
  },

  riskBox: {
    borderRadius: 10,
    border:
      '1px solid rgba(148,163,184,.16)',
    background:
      '#071425',
    padding:
      '10px 13px',
    display: 'flex',
    flexDirection:
      'column',
    justifyContent:
      'center',
    color: '#8ea3bd',
    fontSize: 12,
  },

  tradeButtons: {
    display: 'grid',
    gridTemplateColumns:
      '1fr 1fr',
    gap: 12,
  },

  tradeButton: {
    border: 0,
    borderRadius: 13,
    padding:
      '17px 15px',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    flexDirection:
      'column',
    gap: 5,
    textAlign: 'left',
  },

  rise: {
    background:
      'linear-gradient(135deg, #047857, #059669)',
  },

  fall: {
    background:
      'linear-gradient(135deg, #9f1239, #e11d48)',
  },

  proposal: {
    marginTop: 16,
    padding: 17,
    borderRadius: 14,
    border:
      '1px solid rgba(45,212,191,.3)',
    background:
      'rgba(7,30,37,.8)',
  },

  proposalGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(4, 1fr)',
    gap: 12,
    marginTop: 12,
  },

  actions: {
    display: 'flex',
    gap: 9,
    marginTop: 15,
  },

  primary: {
    border: 0,
    borderRadius: 10,
    padding:
      '11px 16px',
    background:
      '#22d3ee',
    color: '#042f3a',
    fontWeight: 900,
    cursor: 'pointer',
  },

  secondary: {
    border:
      '1px solid rgba(148,163,184,.25)',
    borderRadius: 10,
    padding:
      '10px 14px',
    background:
      'transparent',
    color: '#cbd5e1',
    fontWeight: 800,
    cursor: 'pointer',
  },

  warning: {
    display: 'flex',
    gap: 9,
    marginTop: 14,
    padding: 12,
    borderRadius: 10,
    background:
      'rgba(245,158,11,.08)',
    color: '#fbbf24',
    fontSize: 12,
    lineHeight: 1.5,
  },

  error: {
    marginTop: 12,
    padding: 11,
    borderRadius: 10,
    background:
      'rgba(244,63,94,.09)',
    border:
      '1px solid rgba(244,63,94,.22)',
    color: '#fda4af',
    fontSize: 12,
  },

  success: {
    marginTop: 12,
    padding: 11,
    borderRadius: 10,
    background:
      'rgba(34,197,94,.07)',
    border:
      '1px solid rgba(34,197,94,.2)',
    color: '#86efac',
    fontSize: 12,
  },

  position: {
    display: 'flex',
    justifyContent:
      'space-between',
    gap: 18,
    padding:
      '15px 0',
    borderTop:
      '1px solid rgba(148,163,184,.1)',
  },

  positionRight: {
    display: 'flex',
    alignItems:
      'flex-end',
    flexDirection:
      'column',
    gap: 4,
  },

  close: {
    marginTop: 5,
    border:
      '1px solid rgba(251,113,133,.3)',
    borderRadius: 8,
    padding:
      '6px 9px',
    background:
      'rgba(244,63,94,.08)',
    color: '#fda4af',
    fontSize: 11,
    fontWeight: 900,
    cursor: 'pointer',
  },

  historyRow: {
    display: 'flex',
    justifyContent:
      'space-between',
    gap: 18,
    padding:
      '13px 0',
    borderTop:
      '1px solid rgba(148,163,184,.1)',
  },

  empty: {
    padding: 18,
    borderRadius: 10,
    background:
      'rgba(148,163,184,.05)',
    color: '#8ea3bd',
    fontSize: 13,
  },

  centerCard: {
    maxWidth: 620,
    margin:
      '80px auto',
    padding: 30,
    borderRadius: 18,
    border:
      '1px solid rgba(34,211,238,.2)',
    background:
      '#061323',
    textAlign:
      'center',
  },
};
