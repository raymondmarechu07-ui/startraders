'use client';

import { useEffect, useMemo, useState } from 'react';
import UtilityBar from '@/components/UtilityBar';
import TabNav from '@/components/TabNav';
import { useDeriv } from '@/context/DerivProvider';

const TIMEFRAMES = [
  '1m',
  '5m',
  '15m',
  '1H',
  '4H',
  '1D',
];

const TRADE_TYPES = [
  {
    label: 'Rise/Fall',
    icon: 'M18 15l-6-6-6 6',
    enabled: true,
  },
  {
    label: 'Higher/Lower',
    icon: 'M12 3v18M6 9l6-6 6 6M6 15l6 6 6-6',
    enabled: false,
  },
  {
    label: 'Touch/No Touch',
    icon: '',
    dual: true,
    enabled: false,
  },
  {
    label: 'Matches/Differs',
    icon: 'M3 3h7v7H3zM14 14h7v7h-7z',
    enabled: false,
  },
  {
    label: 'Even/Odd',
    icon: 'M4 4h16v16H4zM4 12h16',
    enabled: false,
  },
  {
    label: 'Over/Under',
    icon: 'M4 19V9M12 19V5M20 19v-7',
    enabled: false,
  },
  {
    label: 'Accumulators',
    icon: 'M13 2L4 14h7l-1 8 9-12h-7l1-8z',
    enabled: false,
  },
];

const INITIAL_POINTS = [];

function formatMoney(value, currency = 'USD') {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return '—';
  }

  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
}

function formatNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return '—';
  }

  return number.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parseDuration(value) {
  if (value === '5 ticks') {
    return {
      duration: 5,
      duration_unit: 't',
    };
  }

  if (value === '10 ticks') {
    return {
      duration: 10,
      duration_unit: 't',
    };
  }

  if (value === '1 minute') {
    return {
      duration: 1,
      duration_unit: 'm',
    };
  }

  if (value === '5 minutes') {
    return {
      duration: 5,
      duration_unit: 'm',
    };
  }

  return {
    duration: 5,
    duration_unit: 't',
  };
}

function errorMessage(error) {
  if (!error) return 'Unknown Deriv error.';

  if (typeof error === 'string') {
    return error;
  }

  if (error.message) {
    return error.message;
  }

  return 'Deriv rejected the request.';
}

function getContractStatus(contract) {
  if (!contract) {
    return 'Unknown';
  }

  if (contract.is_sold) {
    if (Number(contract.profit) > 0) {
      return 'Won';
    }

    if (Number(contract.profit) < 0) {
      return 'Lost';
    }

    return 'Settled';
  }

  return contract.status || 'Open';
}

function chartPointsFromPrices(prices) {
  if (!prices.length) {
    return INITIAL_POINTS;
  }

  const width = 600;
  const height = 220;
  const padding = 15;

  const min = Math.min(...prices);
  const max = Math.max(...prices);

  const range =
    max - min === 0 ? 1 : max - min;

  return prices.map((price, index) => {
    const x =
      prices.length === 1
        ? width
        : (index / (prices.length - 1)) * width;

    const y =
      height -
      padding -
      ((price - min) / range) *
        (height - padding * 2);

    return [
      Math.round(x),
      Math.round(y),
    ];
  });
}

export default function ManualTraderPage() {
  const {
    activeAccount,
    balance,
    status,
    error: providerError,
    subscribeTicks,
    unsubscribeTicks,
    getActiveSymbols,
    requestProposal,
    buyContract,
    subscribeContract,
    sellContract,
    getProfitHistory,
  } = useDeriv();

  const [price, setPrice] = useState(null);
  const [previousPrice, setPreviousPrice] =
    useState(null);
  const [priceUp, setPriceUp] =
    useState(true);
  const [points, setPoints] =
    useState(INITIAL_POINTS);
  const [rawPrices, setRawPrices] =
    useState([]);

  const [symbol, setSymbol] = useState(null);
  const [marketName, setMarketName] =
    useState('Volatility 75 Index');

  const [timeframe, setTimeframe] =
    useState('1m');

  const [tradeType, setTradeType] =
    useState('Rise/Fall');

  const [duration, setDuration] =
    useState('5 ticks');

  const [stake, setStake] =
    useState(10);

  const [positions, setPositions] =
    useState([]);

  const [history, setHistory] =
    useState([]);

  const [proposal, setProposal] =
    useState(null);

  const [proposalDirection, setProposalDirection] =
    useState(null);

  const [proposalLoading, setProposalLoading] =
    useState(false);

  const [buyLoading, setBuyLoading] =
    useState(false);

  const [sellLoading, setSellLoading] =
    useState({});

  const [tradeError, setTradeError] =
    useState('');

  const [marketLoading, setMarketLoading] =
    useState(true);

  const [historyLoading, setHistoryLoading] =
    useState(true);

  const [realAccountConfirmed, setRealAccountConfirmed] =
    useState(false);

  const [statusMessage, setStatusMessage] =
    useState('');

  const accountBalance = Number(
    balance?.balance ??
      balance?.amount ??
      0
  );

  const currency =
    balance?.currency ||
    activeAccount?.currency ||
    'USD';

  const isConnected =
    status === 'connected';

  const isRealAccount =
    activeAccount?.account_type === 'real';

  /*
   * Find the real currently-active Volatility 75 symbol
   * instead of inventing or simulating a symbol.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadMarket() {
      if (!isConnected) {
        return;
      }

      setMarketLoading(true);
      setTradeError('');

      try {
        const symbols =
          await getActiveSymbols();

        if (cancelled) return;

        const volatility75 =
          symbols.find((item) => {
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
          });

        if (!volatility75?.symbol) {
          throw new Error(
            'Deriv did not return an active Volatility 75 market.'
          );
        }

        setSymbol(
          volatility75.symbol
        );

        setMarketName(
          volatility75.display_name ||
            'Volatility 75 Index'
        );
      } catch (err) {
        if (!cancelled) {
          setTradeError(
            errorMessage(err)
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
  }, [isConnected, getActiveSymbols]);

  /*
   * Subscribe to the REAL tick stream.
   */
  useEffect(() => {
    if (!isConnected || !symbol) {
      return undefined;
    }

    let cancelled = false;

    setPrice(null);
    setPreviousPrice(null);
    setRawPrices([]);
    setPoints(INITIAL_POINTS);

    async function connectTicks() {
      try {
        await subscribeTicks(
          symbol,
          (tick) => {
            if (cancelled) return;

            const quote = Number(
              tick?.quote
            );

            if (!Number.isFinite(quote)) {
              return;
            }

            setPrice((current) => {
              if (
                current !== null &&
                Number.isFinite(current)
              ) {
                setPreviousPrice(
                  current
                );

                setPriceUp(
                  quote >= current
                );
              }

              return quote;
            });

            setRawPrices((current) => {
              const next = [
                ...current,
                quote,
              ].slice(-40);

              setPoints(
                chartPointsFromPrices(
                  next
                )
              );

              return next;
            });
          }
        );
      } catch (err) {
        if (!cancelled) {
          setTradeError(
            errorMessage(err)
          );
        }
      }
    }

    connectTicks();

    return () => {
      cancelled = true;
      unsubscribeTicks();
    };
  }, [
    isConnected,
    symbol,
    subscribeTicks,
    unsubscribeTicks,
  ]);

  /*
   * Load actual closed-trade history.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      if (!isConnected) {
        return;
      }

      setHistoryLoading(true);

      try {
        const result =
          await getProfitHistory({
            limit: 20,
            offset: 0,
            sort: 'DESC',
          });

        if (!cancelled) {
          setHistory(
            Array.isArray(
              result?.transactions
            )
              ? result.transactions
              : []
          );
        }
      } catch {
        if (!cancelled) {
          setHistory([]);
        }
      } finally {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [
    isConnected,
    getProfitHistory,
  ]);

  /*
   * Keep proposal fresh enough for the user to explicitly
   * confirm the actual Deriv terms before buying.
   */
  async function createProposal(
    direction
  ) {
    if (!isConnected) {
      setTradeError(
        'Deriv is not connected yet. Please wait for the account connection.'
      );
      return;
    }

    if (!symbol) {
      setTradeError(
        'The Volatility 75 market is not available from Deriv yet.'
      );
      return;
    }

    const numericStake =
      Number(stake);

    if (
      !Number.isFinite(
        numericStake
      ) ||
      numericStake <= 0
    ) {
      setTradeError(
        'Enter a valid stake greater than zero.'
      );
      return;
    }

    if (
      accountBalance > 0 &&
      numericStake > accountBalance
    ) {
      setTradeError(
        `The stake of ${formatMoney(
          numericStake,
          currency
        )} is greater than your current Deriv balance.`
      );
      return;
    }

    setTradeError('');
    setStatusMessage('');
    setProposal(null);
    setProposalDirection(direction);
    setProposalLoading(true);
    setRealAccountConfirmed(false);

    try {
      const durationInfo =
        parseDuration(
          duration
        );

      /*
       * Rise/Fall uses CALL/PUT.
       * The proposal is requested from Deriv and its returned
       * ask price/payout/spot are displayed to the user.
       */
      const result =
        await requestProposal({
          amount: numericStake,
          basis: 'stake',
          contract_type:
            direction === 'rise'
              ? 'CALL'
              : 'PUT',
          currency,
          duration:
            durationInfo.duration,
          duration_unit:
            durationInfo.duration_unit,
          underlying_symbol:
            symbol,
        });

      setProposal(result);
      setStatusMessage(
        'Deriv returned a live proposal. Review the terms before buying.'
      );
    } catch (err) {
      setProposal(null);
      setProposalDirection(null);
      setTradeError(
        errorMessage(err)
      );
    } finally {
      setProposalLoading(false);
    }
  }

  /*
   * Only after the user confirms the actual proposal do we
   * send the BUY request.
   */
  async function confirmBuy() {
    if (!proposal?.id) {
      setTradeError(
        'There is no valid Deriv proposal to buy.'
      );
      return;
    }

    if (
      isRealAccount &&
      !realAccountConfirmed
    ) {
      setTradeError(
        'This is a REAL Deriv account. Confirm the real-money warning before buying.'
      );
      return;
    }

    const askPrice =
      Number(
        proposal.ask_price ??
          proposal.display_value
      );

    if (
      !Number.isFinite(
        askPrice
      )
    ) {
      setTradeError(
        'Deriv did not provide a valid purchase price.'
      );
      return;
    }

    setBuyLoading(true);
    setTradeError('');
    setStatusMessage(
      'Sending the purchase request to Deriv...'
    );

    try {
      const purchase =
        await buyContract(
          proposal.id,
          askPrice
        );

      /*
       * This is the critical safety point:
       * a position is created ONLY after Deriv returns
       * a real contract ID.
       */
      const contractId =
        purchase.contract_id;

      if (!contractId) {
        throw new Error(
          'Deriv did not confirm the purchase with a contract ID.'
        );
      }

      const positionId =
        String(contractId);

      const newPosition = {
        id: positionId,
        contractId:
          positionId,
        direction:
          proposalDirection,
        market:
          marketName,
        symbol,
        stake: Number(
          purchase.buy_price ??
            proposal.ask_price ??
            stake
        ),
        payout: Number(
          purchase.payout ??
            proposal.payout ??
            0
        ),
        profit: 0,
        status: 'Open',
        isSold: false,
        isValidToSell: false,
        currentSpot:
          purchase.current_spot ??
          proposal.spot ??
          null,
      };

      setPositions(
        (current) => [
          newPosition,
          ...current.filter(
            (position) =>
              position.id !==
              positionId
          ),
        ]
      );

      setProposal(null);
      setProposalDirection(null);
      setRealAccountConfirmed(false);

      setStatusMessage(
        `Purchase confirmed by Deriv. Contract ID: ${positionId}`
      );

      /*
       * Subscribe to the REAL open-contract stream.
       */
      await subscribeContract(
        positionId,
        (contract) => {
          setPositions(
            (current) =>
              current.map(
                (position) => {
                  if (
                    position.id !==
                    positionId
                  ) {
                    return position;
                  }

                  const profit =
                    Number(
                      contract.profit
                    );

                  const nextStatus =
                    getContractStatus(
                      contract
                    );

                  return {
                    ...position,
                    stake:
                      Number(
                        contract.buy_price ??
                          position.stake
                      ),
                    payout:
                      Number(
                        contract.payout ??
                          position.payout
                      ),
                    profit:
                      Number.isFinite(
                        profit
                      )
                        ? profit
                        : position.profit,
                    status:
                      nextStatus,
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
                      contract.current_spot_display_value ??
                      position.currentSpot,
                    exitSpot:
                      contract.exit_spot ??
                      null,
                    expiryTime:
                      contract.date_expiry ??
                      null,
                  };
                }
              )
          );

          if (contract.is_sold) {
            setStatusMessage(
              `Contract ${positionId} has settled. Final P/L: ${formatMoney(
                contract.profit,
                currency
              )}`
            );

            /*
             * Refresh actual Deriv history after settlement.
             */
            getProfitHistory({
              limit: 20,
              offset: 0,
              sort: 'DESC',
            })
              .then((result) => {
                setHistory(
                  Array.isArray(
                    result?.transactions
                  )
                    ? result.transactions
                    : []
                );
              })
              .catch(() => {});
          }
        }
      );
    } catch (err) {
      /*
       * Absolutely no fake position is created here.
       */
      setTradeError(
        errorMessage(err)
      );

      setStatusMessage('');
    } finally {
      setBuyLoading(false);
    }
  }

  async function handleSell(position) {
    if (!position?.contractId) {
      return;
    }

    if (!position.isValidToSell) {
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
    setStatusMessage(
      `Sending the close request for contract ${position.contractId}...`
    );

    try {
      await sellContract(
        position.contractId
      );

      /*
       * We do NOT mark it sold here.
       * The contract subscription must tell us that Deriv
       * actually closed it.
       */
      setStatusMessage(
        `Deriv accepted the close request for ${position.contractId}. Waiting for contract confirmation...`
      );
    } catch (err) {
      setTradeError(
        errorMessage(err)
      );
      setStatusMessage('');
    } finally {
      setSellLoading(
        (current) => ({
          ...current,
          [position.id]: false,
        })
      );
    }
  }

  function adjustStake(delta) {
    setStake(
      (current) =>
        Math.max(
          1,
          Number(current) + delta
        )
    );
  }

  const linePoints = points
    .map((point) =>
      point.join(',')
    )
    .join(' ');

  const areaPoints =
    linePoints
      ? `${linePoints} 600,220 0,220`
      : '';

  const lastPoint =
    points[points.length - 1] ||
    [600, 110];

  const changePct = useMemo(() => {
    if (
      previousPrice === null ||
      previousPrice === 0 ||
      price === null
    ) {
      return 0;
    }

    return Math.abs(
      ((price -
        previousPrice) /
        previousPrice) *
        100
    );
  }, [
    price,
    previousPrice,
  ]);

  const riskPercentage =
    accountBalance > 0
      ? (Number(stake) /
          accountBalance) *
        100
      : null;

  return (
    <>
      <UtilityBar />
      <TabNav />

      <div className="market-bar">
        <div
          className="market-picker"
          style={{
            cursor: 'default',
          }}
        >
          <div className="m-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 19V9M12 19V5M20 19v-7" />
            </svg>
          </div>

          <div>
            <div className="m-name">
              {marketName}
            </div>

            <div className="m-sub">
              Synthetic · 24/7
              {symbol
                ? ` · ${symbol}`
                : ''}
            </div>
          </div>

          <span
            style={{
              marginLeft: 'auto',
              fontSize: 11,
              fontWeight: 700,
              color: isConnected
                ? '#4ade80'
                : '#fb7185',
            }}
          >
            {isConnected
              ? 'DERIV CONNECTED'
              : 'CONNECTING'}
          </span>
        </div>

        <div className="live-price">
          <div
            className="price"
            style={{
              color:
                price === null
                  ? '#94a3b8'
                  : priceUp
                  ? '#4ade80'
                  : '#fb7185',
            }}
          >
            {price === null
              ? marketLoading
                ? 'Connecting…'
                : '—'
              : formatNumber(
                  price
                )}
          </div>

          <div
            className={
              priceUp
                ? 'chg up'
                : 'chg down'
            }
          >
            {price === null
              ? 'LIVE TICK'
              : `${priceUp ? '▲' : '▼'} ${changePct.toFixed(
                  2
                )}%`}
          </div>
        </div>
      </div>

      <main>
        <div className="trade-layout">
          <div>
            <div className="chart-card">
              <div className="timeframe-row">
                {TIMEFRAMES.map(
                  (tf) => (
                    <button
                      key={tf}
                      className={
                        tf === timeframe
                          ? 'tf-btn active'
                          : 'tf-btn'
                      }
                      onClick={() =>
                        setTimeframe(
                          tf
                        )
                      }
                    >
                      {tf}
                    </button>
                  )
                )}
              </div>

              <div className="chart-area">
                {points.length > 0 ? (
                  <svg
                    viewBox="0 0 600 220"
                    preserveAspectRatio="none"
                  >
                    <line
                      x1="0"
                      y1="55"
                      x2="600"
                      y2="55"
                      stroke="rgba(255,255,255,0.05)"
                    />

                    <line
                      x1="0"
                      y1="110"
                      x2="600"
                      y2="110"
                      stroke="rgba(255,255,255,0.05)"
                    />

                    <line
                      x1="0"
                      y1="165"
                      x2="600"
                      y2="165"
                      stroke="rgba(255,255,255,0.05)"
                    />

                    <polyline
                      points={
                        linePoints
                      }
                      fill="none"
                      stroke="#5eead4"
                      strokeWidth="2.5"
                    />

                    <polyline
                      points={
                        areaPoints
                      }
                      fill="url(#lineFade)"
                      stroke="none"
                      opacity="0.45"
                    />

                    <circle
                      cx={
                        lastPoint[0]
                      }
                      cy={
                        lastPoint[1]
                      }
                      r="4"
                      fill="#5eead4"
                    />

                    <defs>
                      <linearGradient
                        id="lineFade"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#2dd4bf"
                          stopOpacity="0.4"
                        />

                        <stop
                          offset="100%"
                          stopColor="#2dd4bf"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>
                  </svg>
                ) : (
                  <div
                    style={{
                      height: '100%',
                      display: 'flex',
                      alignItems:
                        'center',
                      justifyContent:
                        'center',
                      color:
                        '#64748b',
                      fontSize: 13,
                    }}
                  >
                    {isConnected
                      ? 'Waiting for live Deriv ticks…'
                      : 'Waiting for authenticated Deriv connection…'}
                  </div>
                )}

                {price !== null && (
                  <div
                    className="price-line-tag"
                    style={{
                      top: `${lastPoint[1]}px`,
                    }}
                  >
                    {formatNumber(
                      price
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="trade-type-row">
              {TRADE_TYPES.map(
                (tt) => (
                  <button
                    key={tt.label}
                    className={
                      tt.label ===
                      tradeType
                        ? 'tt-btn active'
                        : 'tt-btn'
                    }
                    disabled={
                      !tt.enabled
                    }
                    title={
                      tt.enabled
                        ? 'Live Deriv trading'
                        : 'Real Deriv integration for this contract type is not enabled yet'
                    }
                    onClick={() => {
                      if (
                        tt.enabled
                      ) {
                        setTradeType(
                          tt.label
                        );
                      }
                    }}
                    style={
                      !tt.enabled
                        ? {
                            opacity:
                              0.45,
                            cursor:
                              'not-allowed',
                          }
                        : undefined
                    }
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      {tt.dual ? (
                        <>
                          <circle
                            cx="12"
                            cy="12"
                            r="9"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r="3"
                          />
                        </>
                      ) : (
                        <path
                          d={
                            tt.icon
                          }
                        />
                      )}
                    </svg>

                    {tt.label}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="trade-panel">
            <div className="tp-row">
              <div className="field">
                <label>
                  Duration
                </label>

                <select
                  value={duration}
                  onChange={(event) =>
                    setDuration(
                      event.target
                        .value
                    )
                  }
                >
                  <option>
                    5 ticks
                  </option>

                  <option>
                    10 ticks
                  </option>

                  <option>
                    1 minute
                  </option>

                  <option>
                    5 minutes
                  </option>
                </select>
              </div>

              <div className="field">
                <label>
                  Stake (USD)
                </label>

                <div className="stake-adjust">
                  <button
                    onClick={() =>
                      adjustStake(
                        -5
                      )
                    }
                  >
                    −
                  </button>

                  <input
                    type="number"
                    value={stake}
                    min="1"
                    step="0.01"
                    onChange={(event) =>
                      setStake(
                        Math.max(
                          1,
                          Number(
                            event
                              .target
                              .value
                          )
                        )
                      )
                    }
                  />

                  <button
                    onClick={() =>
                      adjustStake(
                        5
                      )
                    }
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="risk-calc">
              <div className="risk-calc-title">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>

                Risk calculator
              </div>

              <div className="risk-calc-row">
                <span>
                  Current Deriv balance
                </span>

                <strong>
                  {balance
                    ? formatMoney(
                        accountBalance,
                        currency
                      )
                    : '—'}
                </strong>
              </div>

              <div className="risk-calc-row">
                <span>
                  If this loses
                </span>

                <strong className="neg">
                  {formatMoney(
                    stake,
                    currency
                  )}
                </strong>
              </div>

              <div className="risk-calc-row">
                <span>
                  % of your balance
                </span>

                <strong
                  className={
                    riskPercentage !==
                      null &&
                    riskPercentage >
                      5
                      ? 'neg'
                      : ''
                  }
                >
                  {riskPercentage ===
                  null
                    ? '—'
                    : `${riskPercentage.toFixed(
                        1
                      )}%`}
                </strong>
              </div>

              {riskPercentage !==
                null &&
                riskPercentage >
                  5 && (
                  <div className="risk-calc-warn">
                    This stake is over 5%
                    of your current
                    Deriv balance.
                  </div>
                )}
            </div>

            {tradeType ===
              'Rise/Fall' && (
              <div className="buy-row">
                <button
                  className="buy-btn rise"
                  disabled={
                    proposalLoading ||
                    buyLoading ||
                    !isConnected ||
                    !symbol
                  }
                  onClick={() =>
                    createProposal(
                      'rise'
                    )
                  }
                >
                  <div className="bb-label">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M18 15l-6-6-6 6" />
                    </svg>

                    Rise
                  </div>

                  <div className="bb-payout">
                    {proposalDirection ===
                      'rise' &&
                    proposal
                      ? `Live payout ${formatMoney(
                          proposal.payout,
                          currency
                        )}`
                      : proposalLoading &&
                        proposalDirection ===
                          'rise'
                      ? 'Getting Deriv proposal…'
                      : 'Get live Deriv proposal'}
                  </div>
                </button>

                <button
                  className="buy-btn fall"
                  disabled={
                    proposalLoading ||
                    buyLoading ||
                    !isConnected ||
                    !symbol
                  }
                  onClick={() =>
                    createProposal(
                      'fall'
                    )
                  }
                >
                  <div className="bb-label">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>

                    Fall
                  </div>

                  <div className="bb-payout">
                    {proposalDirection ===
                      'fall' &&
                    proposal
                      ? `Live payout ${formatMoney(
                          proposal.payout,
                          currency
                        )}`
                      : proposalLoading &&
                        proposalDirection ===
                          'fall'
                      ? 'Getting Deriv proposal…'
                      : 'Get live Deriv proposal'}
                  </div>
                </button>
              </div>
            )}

            {proposal && (
              <div
                style={{
                  marginTop:
                    16,
                  padding: 16,
                  border:
                    '1px solid rgba(94,234,212,0.3)',
                  borderRadius: 14,
                  background:
                    'rgba(15,23,42,0.75)',
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color:
                      '#5eead4',
                    letterSpacing:
                      '0.08em',
                    marginBottom:
                      10,
                  }}
                >
                  LIVE DERIV PROPOSAL
                </div>

                <div
                  style={{
                    display:
                      'grid',
                    gridTemplateColumns:
                      '1fr 1fr',
                    gap: 10,
                    fontSize: 13,
                  }}
                >
                  <div>
                    Contract
                    <strong
                      style={{
                        display:
                          'block',
                        marginTop:
                          3,
                      }}
                    >
                      {proposalDirection ===
                      'rise'
                        ? 'Rise'
                        : 'Fall'}
                    </strong>
                  </div>

                  <div>
                    Stake
                    <strong
                      style={{
                        display:
                          'block',
                        marginTop:
                          3,
                      }}
                    >
                      {formatMoney(
                        proposal.ask_price,
                        currency
                      )}
                    </strong>
                  </div>

                  <div>
                    Potential payout
                    <strong
                      style={{
                        display:
                          'block',
                        marginTop:
                          3,
                      }}
                    >
                      {formatMoney(
                        proposal.payout,
                        currency
                      )}
                    </strong>
                  </div>

                  <div>
                    Spot
                    <strong
                      style={{
                        display:
                          'block',
                        marginTop:
                          3,
                      }}
                    >
                      {formatNumber(
                        proposal.spot
                      )}
                    </strong>
                  </div>
                </div>

                {proposal.longcode && (
                  <div
                    style={{
                      marginTop:
                        12,
                      fontSize: 12,
                      lineHeight:
                        1.5,
                      color:
                        '#94a3b8',
                    }}
                  >
                    {proposal.longcode}
                  </div>
                )}

                {isRealAccount && (
                  <label
                    style={{
                      display:
                        'flex',
                      gap: 8,
                      alignItems:
                        'flex-start',
                      marginTop:
                        14,
                      fontSize: 12,
                      lineHeight:
                        1.45,
                      color:
                        '#fbbf24',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={
                        realAccountConfirmed
                      }
                      onChange={(event) =>
                        setRealAccountConfirmed(
                          event
                            .target
                            .checked
                        )
                      }
                    />

                    <span>
                      This is a REAL
                      Deriv account.
                      I understand
                      that confirming
                      the purchase
                      can use real
                      funds.
                    </span>
                  </label>
                )}

                <div
                  style={{
                    display:
                      'flex',
                    gap: 8,
                    marginTop:
                      14,
                  }}
                >
                  <button
                    type="button"
                    onClick={
                      confirmBuy
                    }
                    disabled={
                      buyLoading ||
                      (isRealAccount &&
                        !realAccountConfirmed)
                    }
                    style={{
                      flex: 1,
                      border: 0,
                      borderRadius:
                        10,
                      padding:
                        '11px 14px',
                      background:
                        '#14b8a6',
                      color:
                        '#042f2e',
                      fontWeight:
                        800,
                      cursor:
                        buyLoading ||
                        (isRealAccount &&
                          !realAccountConfirmed)
                          ? 'not-allowed'
                          : 'pointer',
                      opacity:
                        buyLoading ||
                        (isRealAccount &&
                          !realAccountConfirmed)
                          ? 0.55
                          : 1,
                    }}
                  >
                    {buyLoading
                      ? 'CONFIRMING WITH DERIV…'
                      : 'CONFIRM BUY'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProposal(
                        null
                      );
                      setProposalDirection(
                        null
                      );
                      setRealAccountConfirmed(
                        false
                      );
                      setStatusMessage(
                        ''
                      );
                    }}
                    disabled={
                      buyLoading
                    }
                    style={{
                      border:
                        '1px solid rgba(148,163,184,0.25)',
                      borderRadius:
                        10,
                      padding:
                        '11px 14px',
                      background:
                        'transparent',
                      color:
                        '#cbd5e1',
                      fontWeight:
                        700,
                      cursor:
                        buyLoading
                          ? 'not-allowed'
                          : 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {providerError && (
              <div
                style={{
                  marginTop:
                    12,
                  padding: 12,
                  borderRadius:
                    10,
                  background:
                    'rgba(244,63,94,0.1)',
                  border:
                    '1px solid rgba(244,63,94,0.25)',
                  color:
                    '#fda4af',
                  fontSize: 12,
                }}
              >
                {providerError}
              </div>
            )}

            {tradeError && (
              <div
                style={{
                  marginTop:
                    12,
                  padding: 12,
                  borderRadius:
                    10,
                  background:
                    'rgba(244,63,94,0.1)',
                  border:
                    '1px solid rgba(244,63,94,0.25)',
                  color:
                    '#fda4af',
                  fontSize: 12,
                }}
              >
                {tradeError}
              </div>
            )}

            {statusMessage && (
              <div
                style={{
                  marginTop:
                    12,
                  padding: 12,
                  borderRadius:
                    10,
                  background:
                    'rgba(20,184,166,0.08)',
                  border:
                    '1px solid rgba(20,184,166,0.2)',
                  color:
                    '#99f6e4',
                  fontSize: 12,
                }}
              >
                {statusMessage}
              </div>
            )}
          </div>
        </div>

        <div className="section-label">
          Open positions
        </div>

        <div>
          {positions.length ===
            0 && (
            <div className="empty-note">
              {isConnected
                ? 'No Deriv contracts are currently open from this Manual Trader.'
                : 'Connect your Deriv account to view real positions.'}
            </div>
          )}

          {positions.map(
            (position) => {
              const positive =
                Number(
                  position.profit
                ) >= 0;

              return (
                <div
                  className="position-card"
                  key={
                    position.id
                  }
                >
                  <div className="p-left">
                    <div
                      className={`p-dir ${
                        position.direction ===
                        'rise'
                          ? 'rise'
                          : 'fall'
                      }`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path
                          d={
                            position.direction ===
                            'rise'
                              ? 'M18 15l-6-6-6 6'
                              : 'M6 9l6 6 6-6'
                          }
                        />
                      </svg>
                    </div>

                    <div>
                      <div className="p-market">
                        {position.market}{' '}
                        ·{' '}
                        {formatMoney(
                          position.stake,
                          currency
                        )}
                      </div>

                      <div className="p-sub">
                        {position.direction ===
                        'rise'
                          ? 'Rise'
                          : 'Fall'}{' '}
                        ·{' '}
                        {duration}{' '}
                        · Contract #
                        {
                          position.contractId
                        }
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      textAlign:
                        'right',
                    }}
                  >
                    <div
                      className={`p-pnl ${
                        positive
                          ? 'pos'
                          : 'neg'
                      }`}
                    >
                      {positive
                        ? '+'
                        : ''}
                      {formatMoney(
                        position.profit,
                        currency
                      )}
                    </div>

                    <div className="p-timer">
                      {position.isSold
                        ? position.profit >
                          0
                          ? 'Won'
                          : position.profit <
                            0
                          ? 'Lost'
                          : 'Settled'
                        : position.status}
                    </div>

                    {!position.isSold &&
                      position.isValidToSell && (
                        <button
                          type="button"
                          onClick={() =>
                            handleSell(
                              position
                            )
                          }
                          disabled={
                            Boolean(
                              sellLoading[
                                position
                                  .id
                              ]
                            )
                          }
                          style={{
                            marginTop:
                              7,
                            border:
                              '1px solid rgba(251,113,133,0.3)',
                            borderRadius:
                              8,
                            padding:
                              '5px 9px',
                            background:
                              'rgba(244,63,94,0.08)',
                            color:
                              '#fda4af',
                            fontSize:
                              11,
                            fontWeight:
                              800,
                            cursor:
                              'pointer',
                          }}
                        >
                          {sellLoading[
                            position
                              .id
                          ]
                            ? 'CLOSING…'
                            : 'SELL / CLOSE'}
                        </button>
                      )}
                  </div>
                </div>
              );
            }
          )}
        </div>

        <div
          className="section-label"
          style={{
            marginTop: 28,
          }}
        >
          Recent trade history
        </div>

        <div>
          {historyLoading ? (
            <div className="empty-note">
              Loading actual Deriv trade history…
            </div>
          ) : history.length ===
            0 ? (
            <div className="empty-note">
              No closed Deriv trades found for this account.
            </div>
          ) : (
            history
              .slice(0, 10)
              .map(
                (trade) => {
                  const profit =
                    Number(
                      trade.profit ??
                        (Number(
                          trade.sell_price
                        ) -
                          Number(
                            trade.buy_price
                          ))
                    );

                  return (
                    <div
                      className="position-card"
                      key={
                        trade.transaction_id ||
                        `${trade.purchase_time}-${trade.buy_price}`
                      }
                    >
                      <div className="p-left">
                        <div
                          className={`p-dir ${
                            profit >= 0
                              ? 'rise'
                              : 'fall'
                          }`}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <path
                              d={
                                profit >=
                                0
                                  ? 'M18 15l-6-6-6 6'
                                  : 'M6 9l6 6 6-6'
                              }
                            />
                          </svg>
                        </div>

                        <div>
                          <div className="p-market">
                            {trade.contract_type ||
                              'Deriv contract'}
                          </div>

                          <div className="p-sub">
                            Contract #
                            {trade.transaction_id ||
                              '—'}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          textAlign:
                            'right',
                        }}
                      >
                        <div
                          className={`p-pnl ${
                            profit >=
                            0
                              ? 'pos'
                              : 'neg'
                          }`}
                        >
                          {profit >=
                          0
                            ? '+'
                            : ''}
                          {formatMoney(
                            profit,
                            currency
                          )}
                        </div>

                        <div className="p-timer">
                          Buy{' '}
                          {formatMoney(
                            trade.buy_price,
                            currency
                          )}{' '}
                          · Sell{' '}
                          {formatMoney(
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
        </div>
      </main>
    </>
  );
}
