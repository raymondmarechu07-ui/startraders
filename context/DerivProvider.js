'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

const DerivContext = createContext(null);

function getDerivError(message, fallback = 'Deriv API request failed.') {
  if (message?.error?.message) return message.error.message;
  if (message?.errors?.[0]?.message) return message.errors[0].message;
  if (message?.message) return message.message;
  return fallback;
}

export function DerivProvider({ children }) {
  const [accounts, setAccounts] = useState([]);
  const [activeAccountId, setActiveAccountId] = useState(null);
  const [balance, setBalance] = useState(null);

  // Per-account balances so the account switcher can show
  // the correct balance for each account.
  const [balances, setBalances] = useState({});

  const [status, setStatus] = useState('disconnected');
  const [error, setError] = useState(null);

  const wsRef = useRef(null);
  const requestIdRef = useRef(1);

  // req_id -> { resolve, reject, timeout }
  const pendingRequestsRef = useRef(new Map());

  // One active market-tick subscription is enough for the
  // current Manual Trader. The structure can be extended later.
  const tickSubscriptionRef = useRef({
    symbol: null,
    subscriptionId: null,
    onTick: null,
  });

  // contract_id -> {
  //   subscriptionId,
  //   onUpdate
  // }
  const contractSubscriptionsRef = useRef(new Map());

  const rejectPendingRequests = useCallback((message) => {
    const pending = pendingRequestsRef.current;

    pending.forEach(({ reject, timeout }) => {
      clearTimeout(timeout);
      reject(new Error(message));
    });

    pending.clear();
  }, []);

  const sendRequest = useCallback((payload, timeoutMs = 15000) => {
    return new Promise((resolve, reject) => {
      const ws = wsRef.current;

      if (!ws || ws.readyState !== WebSocket.OPEN) {
        reject(new Error('Deriv WebSocket is not connected.'));
        return;
      }

      const reqId = requestIdRef.current++;

      const timeout = setTimeout(() => {
        pendingRequestsRef.current.delete(reqId);
        reject(new Error('Deriv request timed out. Please try again.'));
      }, timeoutMs);

      pendingRequestsRef.current.set(reqId, {
        resolve,
        reject,
        timeout,
      });

      try {
        ws.send(
          JSON.stringify({
            ...payload,
            req_id: reqId,
          })
        );
      } catch (err) {
        clearTimeout(timeout);
        pendingRequestsRef.current.delete(reqId);
        reject(err);
      }
    });
  }, []);

  /*
   * Opens a short-lived WebSocket only to read one account's
   * balance. This preserves the original account-switcher behavior.
   */
  const fetchBalanceFor = useCallback((accountId) => {
    if (!accountId) return;

    fetch('/api/otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accountId }),
    })
      .then(async (response) => {
        const json = await response.json();

        if (!response.ok) {
          throw new Error(getDerivError(json));
        }

        return json;
      })
      .then((json) => {
        const url = json?.data?.url;

        if (!url) {
          throw new Error('Deriv did not return a WebSocket URL.');
        }

        const ws = new WebSocket(url);

        const timeout = setTimeout(() => {
          try {
            ws.close();
          } catch {}
        }, 8000);

        ws.onopen = () => {
          ws.send(
            JSON.stringify({
              balance: 1,
            })
          );
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);

            if (msg.error) {
              clearTimeout(timeout);
              return;
            }

            if (msg.msg_type === 'balance' && msg.balance) {
              setBalances((prev) => ({
                ...prev,
                [accountId]: msg.balance,
              }));

              clearTimeout(timeout);

              try {
                ws.close();
              } catch {}
            }
          } catch {}
        };

        ws.onerror = () => {
          clearTimeout(timeout);
        };

        ws.onclose = () => {
          clearTimeout(timeout);
        };
      })
      .catch(() => {});
  }, []);

  const loadAccounts = useCallback(async () => {
    const response = await fetch('/api/accounts', {
      cache: 'no-store',
    });

    const json = await response.json();

    if (!response.ok) {
      throw new Error(getDerivError(json, 'Unable to load your Deriv accounts.'));
    }

    const list = Array.isArray(json.data) ? json.data : [];

    setAccounts(list);

    setActiveAccountId((current) => {
      if (
        current &&
        list.some((account) => account.account_id === current)
      ) {
        return current;
      }

      return list[0]?.account_id || null;
    });

    // Preserve the existing behavior:
    // fetch each account's balance for the account switcher.
    list.forEach((account) => {
      fetchBalanceFor(account.account_id);
    });

    return list;
  }, [fetchBalanceFor]);

  const connect = useCallback(
    async (accountId) => {
      if (!accountId) return;

      setStatus('connecting');
      setError(null);

      try {
        if (wsRef.current) {
          try {
            wsRef.current.close();
          } catch {}
        }

        rejectPendingRequests('Previous Deriv connection was closed.');

        tickSubscriptionRef.current = {
          symbol: null,
          subscriptionId: null,
          onTick: null,
        };

        contractSubscriptionsRef.current.clear();

        const response = await fetch('/api/otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            accountId,
          }),
        });

        const json = await response.json();

        if (!response.ok || !json?.data?.url) {
          throw new Error(
            getDerivError(
              json,
              'Could not obtain a Deriv WebSocket session.'
            )
          );
        }

        const ws = new WebSocket(json.data.url);

        wsRef.current = ws;

        ws.onopen = () => {
          setStatus('connected');
          setError(null);

          // Preserve existing real balance subscription.
          ws.send(
            JSON.stringify({
              balance: 1,
              subscribe: 1,
            })
          );

          // Preserve existing portfolio functionality.
          ws.send(
            JSON.stringify({
              portfolio: 1,
            })
          );
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);

            /*
             * First handle request-specific responses.
             */
            if (msg.req_id !== undefined && msg.req_id !== null) {
              const pending = pendingRequestsRef.current.get(msg.req_id);

              if (pending) {
                clearTimeout(pending.timeout);
                pendingRequestsRef.current.delete(msg.req_id);

                if (msg.error) {
                  pending.reject(
                    new Error(
                      getDerivError(msg, 'Deriv rejected the request.')
                    )
                  );
                } else {
                  pending.resolve(msg);
                }
              }
            }

            /*
             * Existing balance handling.
             */
            if (msg.msg_type === 'balance' && msg.balance) {
              setBalance(msg.balance);

              setBalances((prev) => ({
                ...prev,
                [accountId]: msg.balance,
              }));
            }

            /*
             * Existing general Deriv error handling.
             */
            if (msg.error) {
              setError(
                msg.error.message || 'Deriv API error'
              );
            }

            /*
             * REAL MARKET TICKS
             */
            if (
              msg.msg_type === 'tick' &&
              msg.tick
            ) {
              const tickSubscription =
                tickSubscriptionRef.current;

              if (
                typeof tickSubscription.onTick === 'function'
              ) {
                tickSubscription.onTick(msg.tick);
              }
            }

            /*
             * REAL OPEN CONTRACT UPDATES
             */
            if (
              msg.msg_type === 'proposal_open_contract' &&
              msg.proposal_open_contract
            ) {
              const contract =
                msg.proposal_open_contract;

              const contractId = String(
                contract.contract_id
              );

              const subscription =
                contractSubscriptionsRef.current.get(
                  contractId
                );

              if (
                subscription &&
                typeof subscription.onUpdate === 'function'
              ) {
                subscription.onUpdate(
                  contract,
                  msg
                );
              }

              /*
               * When Deriv tells us the contract has finished,
               * stop its subscription.
               */
              if (contract.is_sold) {
                if (
                  subscription?.subscriptionId
                ) {
                  try {
                    ws.send(
                      JSON.stringify({
                        forget:
                          subscription.subscriptionId,
                      })
                    );
                  } catch {}
                }

                contractSubscriptionsRef.current.delete(
                  contractId
                );
              }
            }
          } catch {}
        };

        ws.onerror = () => {
          setStatus('error');
          setError(
            'Deriv WebSocket connection failed.'
          );

          rejectPendingRequests(
            'Deriv WebSocket connection failed.'
          );
        };

        ws.onclose = () => {
          if (wsRef.current === ws) {
            wsRef.current = null;
          }

          setStatus('disconnected');

          rejectPendingRequests(
            'Deriv WebSocket connection closed.'
          );

          tickSubscriptionRef.current = {
            symbol: null,
            subscriptionId: null,
            onTick: null,
          };

          contractSubscriptionsRef.current.clear();
        };
      } catch (err) {
        setStatus('error');
        setError(
          err?.message ||
            'Unable to connect to Deriv.'
        );
      }
    },
    [rejectPendingRequests]
  );

  /*
   * Subscribe to real tick data.
   */
  const subscribeTicks = useCallback(
    async (symbol, onTick) => {
      if (!symbol) {
        throw new Error('A Deriv symbol is required.');
      }

      if (typeof onTick !== 'function') {
        throw new Error('A tick callback is required.');
      }

      // Remove the previous tick subscription first.
      const previous =
        tickSubscriptionRef.current;

      if (
        previous.subscriptionId &&
        wsRef.current?.readyState === WebSocket.OPEN
      ) {
        try {
          wsRef.current.send(
            JSON.stringify({
              forget: previous.subscriptionId,
            })
          );
        } catch {}
      }

      tickSubscriptionRef.current = {
        symbol,
        subscriptionId: null,
        onTick,
      };

      const response = await sendRequest({
        ticks: symbol,
        subscribe: 1,
      });

      /*
       * The first tick response contains the subscription ID.
       * The same subscription continues producing tick messages.
       */
      const subscriptionId =
        response?.subscription?.id ||
        response?.tick?.subscription?.id ||
        null;

      tickSubscriptionRef.current = {
        symbol,
        subscriptionId,
        onTick,
      };

      return response;
    },
    [sendRequest]
  );

  const unsubscribeTicks = useCallback(() => {
    const subscription =
      tickSubscriptionRef.current;

    if (
      subscription.subscriptionId &&
      wsRef.current?.readyState === WebSocket.OPEN
    ) {
      try {
        wsRef.current.send(
          JSON.stringify({
            forget: subscription.subscriptionId,
          })
        );
      } catch {}
    }

    tickSubscriptionRef.current = {
      symbol: null,
      subscriptionId: null,
      onTick: null,
    };
  }, []);

  /*
   * Ask Deriv which symbols are currently active.
   * This avoids hardcoding an old Volatility-75 symbol.
   */
  const getActiveSymbols = useCallback(async () => {
    const response = await sendRequest({
      active_symbols: 'brief',
    });

    return Array.isArray(response?.active_symbols)
      ? response.active_symbols
      : [];
  }, [sendRequest]);

  /*
   * Get a REAL price proposal from Deriv.
   */
  const requestProposal = useCallback(
    async (proposalParams) => {
      const response = await sendRequest(
        {
          proposal: 1,
          ...proposalParams,
        },
        15000
      );

      if (!response?.proposal) {
        throw new Error(
          'Deriv did not return a valid trade proposal.'
        );
      }

      return response.proposal;
    },
    [sendRequest]
  );

  /*
   * BUY a contract using the actual proposal ID.
   */
  const buyContract = useCallback(
    async (proposalId, price) => {
      if (!proposalId) {
        throw new Error(
          'A valid Deriv proposal ID is required before buying.'
        );
      }

      if (
        price === undefined ||
        price === null ||
        !Number.isFinite(Number(price))
      ) {
        throw new Error(
          'A valid proposal price is required before buying.'
        );
      }

      const response = await sendRequest(
        {
          buy: String(proposalId),
          price: Number(price),
        },
        15000
      );

      if (!response?.buy?.contract_id) {
        throw new Error(
          'Deriv did not confirm the purchase with a contract ID.'
        );
      }

      return response.buy;
    },
    [sendRequest]
  );

  /*
   * Subscribe to REAL contract status/P&L.
   */
  const subscribeContract = useCallback(
    async (contractId, onUpdate) => {
      if (!contractId) {
        throw new Error(
          'A contract ID is required.'
        );
      }

      if (typeof onUpdate !== 'function') {
        throw new Error(
          'A contract update callback is required.'
        );
      }

      const id = String(contractId);

      // Remove any existing handler for this contract.
      contractSubscriptionsRef.current.delete(id);

      contractSubscriptionsRef.current.set(id, {
        subscriptionId: null,
        onUpdate,
      });

      try {
        const response = await sendRequest({
          proposal_open_contract: 1,
          contract_id: id,
          subscribe: 1,
        });

        const subscriptionId =
          response?.subscription?.id ||
          response?.proposal_open_contract?.subscription?.id ||
          null;

        const existing =
          contractSubscriptionsRef.current.get(id);

        if (existing) {
          contractSubscriptionsRef.current.set(id, {
            ...existing,
            subscriptionId,
          });
        }

        if (response?.proposal_open_contract) {
          onUpdate(
            response.proposal_open_contract,
            response
          );
        }

        return response.proposal_open_contract;
      } catch (err) {
        contractSubscriptionsRef.current.delete(id);
        throw err;
      }
    },
    [sendRequest]
  );

  /*
   * Sell an open contract before expiry.
   * Deriv decides whether the contract is currently sellable.
   */
  const sellContract = useCallback(
    async (contractId) => {
      if (!contractId) {
        throw new Error(
          'A contract ID is required to sell.'
        );
      }

      return sendRequest(
        {
          sell: String(contractId),
          price: 0,
        },
        15000
      );
    },
    [sendRequest]
  );

  /*
   * Fetch actual closed-trade history from Deriv.
   */
  const getProfitHistory = useCallback(
    async ({
      limit = 20,
      offset = 0,
      sort = 'DESC',
    } = {}) => {
      const response = await sendRequest({
        profit_table: 1,
        limit,
        offset,
        sort,
      });

      return response?.profit_table || {
        count: 0,
        transactions: [],
      };
    },
    [sendRequest]
  );

  /*
   * Preserve portfolio functionality and make it available
   * to trading screens as well.
   */
  const getPortfolio = useCallback(async () => {
    const response = await sendRequest({
      portfolio: 1,
    });

    return response?.portfolio || null;
  }, [sendRequest]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const sessionResponse = await fetch(
          '/api/session',
          {
            cache: 'no-store',
          }
        );

        const session =
          await sessionResponse.json();

        if (
          !session.authenticated ||
          cancelled
        ) {
          return;
        }

        await loadAccounts();
      } catch {}
    })();

    return () => {
      cancelled = true;

      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {}
      }

      rejectPendingRequests(
        'Deriv provider was unmounted.'
      );
    };
  }, [loadAccounts, rejectPendingRequests]);

  useEffect(() => {
    if (activeAccountId) {
      connect(activeAccountId);
    }
  }, [activeAccountId, connect]);

  const login = useCallback(() => {
    window.location.assign(
      '/api/auth/login'
    );
  }, []);

  const logout = useCallback(async () => {
    unsubscribeTicks();

    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {}
    }

    await fetch('/api/auth/logout', {
      method: 'POST',
    });

    setAccounts([]);
    setActiveAccountId(null);
    setBalance(null);
    setBalances({});
    setStatus('disconnected');
    setError(null);

    window.location.assign('/');
  }, [unsubscribeTicks]);

  const activeAccount =
    accounts.find(
      (account) =>
        account.account_id === activeAccountId
    ) || null;

  const value = {
    accounts,
    activeAccount,
    activeAccountId,

    // Existing balance functionality.
    balance,
    balances,

    // Existing connection state.
    status,
    error,
    isLoggedIn: accounts.length > 0,

    // Existing auth/account controls.
    login,
    logout,
    switchAccount: setActiveAccountId,
    refreshAccounts: loadAccounts,

    // Existing WebSocket exposure.
    websocket: wsRef.current,

    // New REAL market/trading functionality.
    subscribeTicks,
    unsubscribeTicks,
    getActiveSymbols,
    requestProposal,
    buyContract,
    subscribeContract,
    sellContract,
    getProfitHistory,
    getPortfolio,
  };

  return (
    <DerivContext.Provider value={value}>
      {children}
    </DerivContext.Provider>
  );
}

export function useDeriv() {
  const ctx = useContext(DerivContext);

  if (!ctx) {
    throw new Error(
      'useDeriv must be used inside <DerivProvider>'
    );
  }

  return ctx;
}
  const value = { accounts, activeAccount, balance, balances, status, error, isLoggedIn: accounts.length > 0, login, logout, switchAccount: setActiveAccountId, refreshAccounts: loadAccounts, websocket: wsRef.current };
  return <DerivContext.Provider value={value}>{children}</DerivContext.Provider>;
}
export function useDeriv() { const ctx = useContext(DerivContext); if (!ctx) throw new Error('useDeriv must be used inside <DerivProvider>'); return ctx; }
