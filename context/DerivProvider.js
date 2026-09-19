'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const DerivContext = createContext(null);

export function DerivProvider({ children }) {
  const [accounts, setAccounts] = useState([]);
  const [activeAccountId, setActiveAccountId] = useState(null);
  const [balance, setBalance] = useState(null);
  const [balances, setBalances] = useState({});
  const [status, setStatus] = useState('disconnected');
  const [error, setError] = useState(null);
  const [ticks, setTicks] = useState({});
  const [portfolio, setPortfolio] = useState([]);

  const wsRef = useRef(null);
  const reqIdRef = useRef(1);
  const pendingRef = useRef(new Map());
  const tickSubscriptionsRef = useRef(new Map());
  const contractSubscriptionsRef = useRef(new Map());
  const mountedRef = useRef(true);
  const connectingRef = useRef(null);

  const nextReqId = useCallback(() => reqIdRef.current++, []);

  const clearPending = useCallback(
    (message = 'Deriv connection closed') => {
      pendingRef.current.forEach(({ reject, timer }) => {
        if (timer) clearTimeout(timer);
        reject(new Error(message));
      });

      pendingRef.current.clear();
    },
    []
  );

  const sendRequest = useCallback(
    (payload, timeout = 15000) => {
      return new Promise((resolve, reject) => {
        const ws = wsRef.current;

        if (!ws || ws.readyState !== WebSocket.OPEN) {
          reject(
            new Error(
              'Deriv WebSocket is not connected'
            )
          );
          return;
        }

        const req_id = nextReqId();

        const timer = setTimeout(() => {
          pendingRef.current.delete(req_id);

          reject(
            new Error(
              `Deriv request timed out: ${
                payload.proposal
                  ? 'proposal'
                  : payload.buy
                    ? 'buy'
                    : payload.sell
                      ? 'sell'
                      : payload.ticks
                        ? 'ticks'
                        : 'request'
              }`
            )
          );
        }, timeout);

        pendingRef.current.set(req_id, {
          resolve,
          reject,
          timer,
        });

        try {
          ws.send(
            JSON.stringify({
              ...payload,
              req_id,
            })
          );
        } catch (err) {
          clearTimeout(timer);
          pendingRef.current.delete(req_id);
          reject(err);
        }
      });
    },
    [nextReqId]
  );

  const loadAccounts = useCallback(async () => {
    try {
      const response = await fetch('/api/accounts', {
        cache: 'no-store',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error?.message ||
            data?.error ||
            'Unable to load Deriv accounts'
        );
      }

      const raw =
        data?.accounts ||
        data?.data ||
        (Array.isArray(data) ? data : []);

      const normalized = raw
        .map((account) => {
          const id =
            account.account_id ||
            account.id ||
            account.loginid ||
            account.login_id;

          const loginid =
            account.loginid ||
            account.login_id ||
            id;

          const inferredType =
            account.account_type ||
            (String(loginid || '').startsWith('VRTC')
              ? 'demo'
              : 'real');

          return {
            ...account,
            id,
            account_id:
              account.account_id || id,
            loginid,
            account_type: inferredType,
            currency:
              account.currency || 'USD',
          };
        })
        .filter(
          (account) =>
            account.id || account.loginid
        );

      if (mountedRef.current) {
        setAccounts(normalized);

        setActiveAccountId((current) => {
          if (
            current &&
            normalized.some(
              (account) =>
                account.id === current
            )
          ) {
            return current;
          }

          return (
            normalized[0]?.id || null
          );
        });
      }

      return normalized;
    } catch (err) {
      if (mountedRef.current) {
        setError(
          err.message ||
            'Unable to load Deriv accounts'
        );
      }

      return [];
    }
  }, []);

  const fetchOtp = useCallback(async (accountId) => {
    const response = await fetch('/api/otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accountId,
      }),
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error?.message ||
          data?.error ||
          'Unable to obtain Deriv WebSocket OTP'
      );
    }

    const wsUrl =
      data?.url ||
      data?.ws_url ||
      data?.websocket_url;

    if (!wsUrl) {
      throw new Error(
        'Deriv did not return an authenticated WebSocket URL'
      );
    }

    return wsUrl;
  }, []);

  const disconnect = useCallback(() => {
    clearPending();

    const ws = wsRef.current;
    wsRef.current = null;

    if (ws) {
      try {
        ws.onopen = null;
        ws.onmessage = null;
        ws.onerror = null;
        ws.onclose = null;
        ws.close();
      } catch {}
    }

    tickSubscriptionsRef.current.clear();
    contractSubscriptionsRef.current.clear();

    if (mountedRef.current) {
      setStatus('disconnected');
    }
  }, [clearPending]);

  const connect = useCallback(
    async (accountId = activeAccountId) => {
      if (!accountId) {
        throw new Error(
          'No Deriv account selected'
        );
      }

      if (
        wsRef.current?.readyState ===
          WebSocket.OPEN &&
        activeAccountId === accountId
      ) {
        return wsRef.current;
      }

      if (
        connectingRef.current?.accountId ===
        accountId
      ) {
        return connectingRef.current.promise;
      }

      disconnect();

      if (mountedRef.current) {
        setStatus('connecting');
        setError(null);
      }

      let resolveConnecting;
      let rejectConnecting;

      const promise = new Promise(
        (resolve, reject) => {
          resolveConnecting = resolve;
          rejectConnecting = reject;
        }
      );

      connectingRef.current = {
        accountId,
        promise,
      };

      try {
        const wsUrl =
          await fetchOtp(accountId);

        const ws = new WebSocket(wsUrl);

        wsRef.current = ws;

        ws.onmessage = (event) => {
          let data;

          try {
            data = JSON.parse(
              event.data
            );
          } catch {
            return;
          }

          const pending = data?.req_id
            ? pendingRef.current.get(
                data.req_id
              )
            : null;

          if (pending) {
            pendingRef.current.delete(
              data.req_id
            );

            if (pending.timer) {
              clearTimeout(
                pending.timer
              );
            }

            if (data.error) {
              pending.reject(
                new Error(
                  data.error.message ||
                    data.error.code ||
                    'Deriv API error'
                )
              );
            } else {
              pending.resolve(data);
            }
          }

          if (
            data.msg_type === 'balance' &&
            data.balance
          ) {
            const next = {
              ...data.balance,
              balance: Number(
                data.balance.balance
              ),
            };

            if (mountedRef.current) {
              setBalance(next);

              setBalances((current) => ({
                ...current,
                [accountId]: next,
              }));
            }
          }

          if (
            data.msg_type === 'tick' &&
            data.tick?.symbol
          ) {
            const tick = data.tick;

            if (mountedRef.current) {
              setTicks((current) => ({
                ...current,
                [tick.symbol]: tick,
              }));
            }

            const entry =
              tickSubscriptionsRef.current.get(
                tick.symbol
              );

            entry?.callbacks.forEach(
              (callback) => {
                try {
                  callback(tick);
                } catch (err) {
                  console.error(
                    'Tick callback error:',
                    err
                  );
                }
              }
            );
          }

          if (
            data.msg_type ===
              'proposal_open_contract' &&
            data.proposal_open_contract
          ) {
            const contract =
              data.proposal_open_contract;

            const id = String(
              contract.contract_id
            );

            contractSubscriptionsRef.current
              .get(id)
              ?.forEach((callback) => {
                try {
                  callback(contract);
                } catch (err) {
                  console.error(
                    'Contract callback error:',
                    err
                  );
                }
              });
          }

          if (
            data.msg_type === 'portfolio'
          ) {
            const contracts =
              data.portfolio?.contracts ||
              [];

            if (mountedRef.current) {
              setPortfolio(contracts);
            }
          }
        };

        await new Promise(
          (resolve, reject) => {
            const timer =
              setTimeout(() => {
                reject(
                  new Error(
                    'Timed out connecting to Deriv WebSocket'
                  )
                );
              }, 15000);

            ws.onopen = () => {
              clearTimeout(timer);
              resolve();
            };

            ws.onerror = () => {
              clearTimeout(timer);
              reject(
                new Error(
                  'Deriv WebSocket connection failed'
                )
              );
            };
          }
        );

        ws.onerror = () => {
          if (mountedRef.current) {
            setStatus('error');
            setError(
              'Deriv WebSocket error'
            );
          }
        };

        ws.onclose = () => {
          if (wsRef.current === ws) {
            wsRef.current = null;
          }

          clearPending();

          if (mountedRef.current) {
            setStatus('disconnected');
          }
        };

        if (mountedRef.current) {
          setActiveAccountId(
            accountId
          );

          setStatus('connected');
          setError(null);
        }

        await sendRequest({
          balance: 1,
          subscribe: 1,
        }).catch((err) => {
          console.warn(
            'Balance subscription failed:',
            err
          );
        });

        const portfolioResponse =
          await sendRequest({
            portfolio: 1,
          }).catch(() => null);

        if (mountedRef.current) {
          setPortfolio(
            portfolioResponse?.portfolio
              ?.contracts || []
          );
        }

        resolveConnecting(ws);

        return ws;
      } catch (err) {
        if (mountedRef.current) {
          setStatus('error');
          setError(
            err.message ||
              'Unable to connect to Deriv'
          );
        }

        disconnect();
        rejectConnecting(err);

        throw err;
      } finally {
        if (
          connectingRef.current
            ?.accountId === accountId
        ) {
          connectingRef.current = null;
        }
      }
    },
    [
      activeAccountId,
      disconnect,
      fetchOtp,
      sendRequest,
    ]
  );

  const subscribeTicks = useCallback(
    async (symbol, callback) => {
      if (!symbol) {
        throw new Error(
          'Symbol is required'
        );
      }

      let entry =
        tickSubscriptionsRef.current.get(
          symbol
        );

      if (!entry) {
        const response =
          await sendRequest({
            ticks: symbol,
            subscribe: 1,
          });

        entry = {
          subscriptionId:
            response?.subscription?.id ||
            null,
          callbacks: new Set(),
        };

        tickSubscriptionsRef.current.set(
          symbol,
          entry
        );

        if (
          response?.tick &&
          mountedRef.current
        ) {
          setTicks((current) => ({
            ...current,
            [symbol]: response.tick,
          }));
        }
      }

      if (callback) {
        entry.callbacks.add(callback);
      }

      return () =>
        unsubscribeTicks(
          symbol,
          callback
        );
    },
    [sendRequest]
  );

  const unsubscribeTicks = useCallback(
    async (symbol, callback) => {
      if (!symbol) return;

      const entry =
        tickSubscriptionsRef.current.get(
          symbol
        );

      if (!entry) return;

      if (callback) {
        entry.callbacks.delete(
          callback
        );
      }

      if (
        !callback ||
        entry.callbacks.size === 0
      ) {
        if (entry.subscriptionId) {
          await sendRequest({
            forget:
              entry.subscriptionId,
          }).catch(() => {});
        }

        tickSubscriptionsRef.current.delete(
          symbol
        );
      }
    },
    [sendRequest]
  );

  const getActiveSymbols = useCallback(
    async (
      market = 'synthetic_index'
    ) => {
      const response =
        await sendRequest({
          active_symbols: 'brief',
          product_type: 'basic',
        });

      const symbols =
        response?.active_symbols ||
        response?.symbols ||
        [];

      if (
        market !==
        'synthetic_index'
      ) {
        return symbols;
      }

      return symbols.filter((item) => {
        const text =
          `${item.market || ''} ` +
          `${item.market_display_name || ''} ` +
          `${item.submarket || ''}`
            .toLowerCase();

        const symbol =
          String(
            item.symbol || ''
          ).toLowerCase();

        return (
          text.includes('synthetic') ||
          symbol.includes('r_') ||
          symbol.includes('1hz')
        );
      });
    },
    [sendRequest]
  );

  const requestProposal = useCallback(
    async (params) => {
      if (
        !params?.amount ||
        Number(params.amount) <= 0
      ) {
        throw new Error(
          'Trade amount is required'
        );
      }

      if (!params.contract_type) {
        throw new Error(
          'Contract type is required'
        );
      }

      const symbol =
        params.underlying_symbol ||
        params.symbol;

      if (!symbol) {
        throw new Error(
          'Trading symbol is required'
        );
      }

      const payload = {
        proposal: 1,
        amount: Number(
          params.amount
        ),
        basis:
          params.basis || 'stake',
        contract_type:
          params.contract_type,
        currency:
          params.currency ||
          balance?.currency ||
          'USD',
        underlying_symbol: symbol,
        subscribe: 1,
      };

      if (params.duration != null) {
        payload.duration =
          Number(params.duration);
      }

      if (params.duration_unit) {
        payload.duration_unit =
          params.duration_unit;
      }

      if (
        params.barrier != null &&
        params.barrier !== ''
      ) {
        payload.barrier =
          String(params.barrier);
      }

      if (
        params.barrier2 != null &&
        params.barrier2 !== ''
      ) {
        payload.barrier2 =
          String(params.barrier2);
      }

      if (params.multiplier != null) {
        payload.multiplier =
          Number(params.multiplier);
      }

      if (params.limit_order) {
        payload.limit_order =
          params.limit_order;
      }

      const response =
        await sendRequest(
          payload,
          15000
        );

      if (!response?.proposal?.id) {
        throw new Error(
          response?.error?.message ||
            'Deriv did not return a valid proposal'
        );
      }

      return response.proposal;
    },
    [
      balance?.currency,
      sendRequest,
    ]
  );

  const buyContract = useCallback(
    async (
      proposalId,
      price
    ) => {
      if (!proposalId) {
        throw new Error(
          'Proposal ID is required to buy'
        );
      }

      const purchasePrice =
        Number(price);

      if (
        !Number.isFinite(
          purchasePrice
        ) ||
        purchasePrice <= 0
      ) {
        throw new Error(
          'A valid proposal price is required'
        );
      }

      const response =
        await sendRequest(
          {
            buy: String(
              proposalId
            ),
            price:
              purchasePrice,
          },
          20000
        );

      if (!response?.buy?.contract_id) {
        throw new Error(
          response?.error?.message ||
            'Deriv did not return a contract ID'
        );
      }

      return response.buy;
    },
    [sendRequest]
  );

  const subscribeContract =
    useCallback(
      async (
        contractId,
        callback
      ) => {
        if (!contractId) {
          throw new Error(
            'Contract ID is required'
          );
        }

        const id =
          String(contractId);

        if (callback) {
          let callbacks =
            contractSubscriptionsRef.current.get(
              id
            );

          if (!callbacks) {
            callbacks = new Set();

            contractSubscriptionsRef.current.set(
              id,
              callbacks
            );
          }

          callbacks.add(callback);
        }

        const response =
          await sendRequest(
            {
              proposal_open_contract: 1,
              contract_id:
                Number(id),
              subscribe: 1,
            },
            15000
          );

        if (
          response?.proposal_open_contract &&
          callback
        ) {
          callback(
            response.proposal_open_contract
          );
        }

        return (
          response?.proposal_open_contract ||
          null
        );
      },
      [sendRequest]
    );

  const unsubscribeContract =
    useCallback(
      async (
        contractId,
        callback
      ) => {
        const id =
          String(
            contractId || ''
          );

        if (!id) return;

        const callbacks =
          contractSubscriptionsRef.current.get(
            id
          );

        if (!callbacks) return;

        if (callback) {
          callbacks.delete(
            callback
          );
        }

        if (
          !callback ||
          callbacks.size === 0
        ) {
          contractSubscriptionsRef.current.delete(
            id
          );
        }
      },
      []
    );

  const sellContract = useCallback(
    async (
      contractId,
      bidPrice = null
    ) => {
      if (!contractId) {
        throw new Error(
          'Contract ID is required to sell'
        );
      }

      let price =
        Number(bidPrice);

      if (
        !Number.isFinite(price) ||
        price < 0
      ) {
        const latest =
          await sendRequest(
            {
              proposal_open_contract: 1,
              contract_id:
                Number(contractId),
            },
            15000
          );

        price =
          Number(
            latest
              ?.proposal_open_contract
              ?.bid_price
          );
      }

      if (
        !Number.isFinite(price) ||
        price < 0
      ) {
        throw new Error(
          'Deriv did not provide a valid sell price'
        );
      }

      const response =
        await sendRequest(
          {
            sell: String(
              contractId
            ),
            price,
          },
          20000
        );

      if (!response?.sell) {
        throw new Error(
          response?.error?.message ||
            'Deriv did not confirm the contract sale'
        );
      }

      return response.sell;
    },
    [sendRequest]
  );

  const getPortfolio = useCallback(
    async () => {
      const response =
        await sendRequest({
          portfolio: 1,
        });

      const contracts =
        response?.portfolio
          ?.contracts || [];

      if (mountedRef.current) {
        setPortfolio(
          contracts
        );
      }

      return contracts;
    },
    [sendRequest]
  );

  const getProfitHistory =
    useCallback(
      async (
        options = {}
      ) => {
        const payload =
          typeof options ===
          'number'
            ? {
                profit_table: 1,
                description: 1,
                limit:
                  Number(
                    options
                  ),
              }
            : {
                profit_table: 1,
                description: 1,
                limit: 50,
                ...options,
              };

        const response =
          await sendRequest(
            payload
          );

        return (
          response?.profit_table || {
            transactions: [],
          }
        );
      },
      [sendRequest]
    );

  const refreshBalance =
    useCallback(
      async () => {
        const response =
          await sendRequest({
            balance: 1,
          });

        if (
          response?.balance &&
          mountedRef.current
        ) {
          const next =
            response.balance;

          setBalance(next);

          if (activeAccountId) {
            setBalances(
              (current) => ({
                ...current,
                [activeAccountId]:
                  next,
              })
            );
          }
        }

        return (
          response?.balance ||
          null
        );
      },
      [
        activeAccountId,
        sendRequest,
      ]
    );

  const switchAccount =
    useCallback(
      async (
        accountId
      ) => {
        if (!accountId) {
          throw new Error(
            'Account ID is required'
          );
        }

        setActiveAccountId(
          accountId
        );

        await connect(
          accountId
        );

        return accountId;
      },
      [connect]
    );

  const login =
    useCallback(() => {
      window.location.href =
        '/api/auth/login';
    }, []);

  const logout =
    useCallback(async () => {
      disconnect();

      try {
        await fetch(
          '/api/auth/logout',
          {
            method: 'POST',
          }
        );
      } catch {}

      if (mountedRef.current) {
        setAccounts([]);
        setActiveAccountId(null);
        setBalance(null);
        setBalances({});
        setPortfolio([]);
        setTicks({});
        setError(null);
        setStatus(
          'disconnected'
        );
      }

      window.location.href =
        '/';
    }, [disconnect]);

  useEffect(() => {
    mountedRef.current = true;

    loadAccounts().catch(
      () => {}
    );

    return () => {
      mountedRef.current = false;
      disconnect();
    };
  }, [
    disconnect,
    loadAccounts,
  ]);

  useEffect(() => {
    if (!activeAccountId) {
      return;
    }

    connect(
      activeAccountId
    ).catch(() => {});
  }, [
    activeAccountId,
    connect,
  ]);

  const activeAccount =
    useMemo(
      () =>
        accounts.find(
          (account) =>
            account.id ===
              activeAccountId ||
            account.account_id ===
              activeAccountId ||
            account.loginid ===
              activeAccountId
        ) || null,
      [
        accounts,
        activeAccountId,
      ]
    );

  const isLoggedIn =
    Boolean(activeAccount);

  const value = {
    accounts,
    activeAccountId,
    activeAccount,
    isLoggedIn,

    balance,
    balances,
    status,
    error,
    ticks,
    portfolio,

    connect,
    disconnect,

    login,
    logout,

    loadAccounts,
    refreshAccounts:
      loadAccounts,

    switchAccount,

    subscribeTicks,
    unsubscribeTicks,

    getActiveSymbols,

    requestProposal,
    buyContract,

    subscribeContract,
    unsubscribeContract,

    sellContract,

    getPortfolio,
    getProfitHistory,
    refreshBalance,

    sendRequest,
  };

  return (
    <DerivContext.Provider
      value={value}
    >
      {children}
    </DerivContext.Provider>
  );
}

export function useDeriv() {
  const context =
    useContext(DerivContext);

  if (!context) {
    throw new Error(
      'useDeriv must be used inside DerivProvider'
    );
  }

  return context;
}

export default DerivContext;
