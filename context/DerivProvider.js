'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
  const subscriptionsRef = useRef(new Map());
  const contractSubscriptionsRef = useRef(new Map());
  const reconnectTimerRef = useRef(null);
  const mountedRef = useRef(true);

  const nextReqId = useCallback(() => {
    const id = reqIdRef.current;
    reqIdRef.current += 1;
    return id;
  }, []);

  const clearPending = useCallback(() => {
    pendingRef.current.forEach(({ reject, timer }) => {
      if (timer) clearTimeout(timer);
      reject(new Error('Deriv connection closed'));
    });

    pendingRef.current.clear();
  }, []);

  const sendRequest = useCallback(
    (payload, timeout = 15000) => {
      return new Promise((resolve, reject) => {
        const ws = wsRef.current;

        if (!ws || ws.readyState !== WebSocket.OPEN) {
          reject(new Error('Deriv WebSocket is not connected'));
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
                      : payload.proposal_open_contract
                        ? 'proposal_open_contract'
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
          ws.send(JSON.stringify({ ...payload, req_id }));
        } catch (err) {
          clearTimeout(timer);
          pendingRef.current.delete(req_id);
          reject(err);
        }
      });
    },
    [nextReqId]
  );

  const fetchBalanceFor = useCallback(async (accountId) => {
    if (!accountId) return null;

    try {
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

      return data;
    } catch (err) {
      console.error('fetchBalanceFor error:', err);
      throw err;
    }
  }, []);

  const loadAccounts = useCallback(async () => {
    try {
      const response = await fetch('/api/accounts', {
        method: 'GET',
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

      const rawAccounts =
        data?.accounts ||
        data?.data ||
        (Array.isArray(data) ? data : []);

      const normalized = rawAccounts
        .map((account) => ({
          ...account,
          id:
            account.id ||
            account.account_id ||
            account.loginid ||
            account.login_id,
          loginid:
            account.loginid ||
            account.login_id ||
            account.id ||
            account.account_id,
          currency: account.currency || 'USD',
        }))
        .filter((account) => account.id || account.loginid);

      if (mountedRef.current) {
        setAccounts(normalized);

        setActiveAccountId((current) => {
          if (current && normalized.some((a) => a.id === current)) {
            return current;
          }

          return normalized[0]?.id || normalized[0]?.loginid || null;
        });
      }

      return normalized;
    } catch (err) {
      console.error('loadAccounts error:', err);

      if (mountedRef.current) {
        setError(err.message || 'Unable to load accounts');
      }

      return [];
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    clearPending();

    const ws = wsRef.current;

    if (ws) {
      try {
        ws.onopen = null;
        ws.onmessage = null;
        ws.onerror = null;
        ws.onclose = null;
        ws.close();
      } catch {
        // Ignore close errors.
      }
    }

    wsRef.current = null;

    subscriptionsRef.current.clear();
    contractSubscriptionsRef.current.clear();

    if (mountedRef.current) {
      setStatus('disconnected');
    }
  }, [clearPending]);

  const connect = useCallback(
    async (accountId = activeAccountId) => {
      if (!accountId) {
        throw new Error('No Deriv account selected');
      }

      if (
        wsRef.current &&
        wsRef.current.readyState === WebSocket.OPEN &&
        activeAccountId === accountId
      ) {
        return wsRef.current;
      }

      disconnect();

      if (mountedRef.current) {
        setStatus('connecting');
        setError(null);
      }

      try {
        const otpData = await fetchBalanceFor(accountId);

        const wsUrl =
          otpData?.url ||
          otpData?.ws_url ||
          otpData?.websocket_url;

        if (!wsUrl) {
          throw new Error(
            'Deriv did not return an authenticated WebSocket URL'
          );
        }

        const ws = new WebSocket(wsUrl);

        wsRef.current = ws;

        await new Promise((resolve, reject) => {
          let settled = false;

          const timeout = setTimeout(() => {
            if (!settled) {
              settled = true;
              reject(
                new Error('Timed out connecting to Deriv WebSocket')
              );
            }
          }, 15000);

          ws.onopen = () => {
            if (settled) return;

            settled = true;
            clearTimeout(timeout);
            resolve();
          };

          ws.onerror = () => {
            if (settled) return;

            settled = true;
            clearTimeout(timeout);
            reject(
              new Error('Deriv WebSocket connection failed')
            );
          };
        });

        ws.onmessage = (event) => {
          let data;

          try {
            data = JSON.parse(event.data);
          } catch {
            return;
          }

          const reqId = data?.req_id;

          if (reqId && pendingRef.current.has(reqId)) {
            const pending = pendingRef.current.get(reqId);

            pendingRef.current.delete(reqId);

            if (pending.timer) {
              clearTimeout(pending.timer);
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

          if (data.msg_type === 'balance') {
            const balanceData = data.balance;

            if (balanceData) {
              const numericBalance = Number(
                balanceData.balance
              );

              const currency =
                balanceData.currency || 'USD';

              if (mountedRef.current) {
                setBalance({
                  ...balanceData,
                  balance: numericBalance,
                });

                setBalances((current) => ({
                  ...current,
                  [accountId]: {
                    ...balanceData,
                    balance: numericBalance,
                  },
                }));
              }
            }
          }

          if (data.msg_type === 'tick') {
            const tick = data.tick;

            if (tick?.symbol) {
              if (mountedRef.current) {
                setTicks((current) => ({
                  ...current,
                  [tick.symbol]: tick,
                }));
              }
            }
          }

          if (data.msg_type === 'proposal') {
            const proposal = data.proposal;

            if (proposal?.id) {
              const symbol =
                proposal.underlying_symbol ||
                proposal.symbol ||
                proposal.echo_req?.underlying_symbol;

              if (symbol && mountedRef.current) {
                setTicks((current) => ({
                  ...current,
                  [`proposal:${symbol}`]: {
                    ...proposal,
                    msg_type: 'proposal',
                  },
                }));
              }
            }
          }

          if (
            data.msg_type === 'proposal_open_contract'
          ) {
            const contract =
              data.proposal_open_contract;

            if (!contract) return;

            const contractId = String(
              contract.contract_id
            );

            const subscription =
              contractSubscriptionsRef.current.get(
                contractId
              );

            if (subscription) {
              subscription.forEach((callback) => {
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
          }

          if (data.msg_type === 'portfolio') {
            const contracts =
              data?.portfolio?.contracts || [];

            if (mountedRef.current) {
              setPortfolio(contracts);
            }
          }
        };

        ws.onerror = (event) => {
          console.error(
            'Deriv WebSocket error:',
            event
          );

          if (mountedRef.current) {
            setStatus('error');
            setError('Deriv WebSocket error');
          }
        };

        ws.onclose = () => {
          clearPending();

          if (wsRef.current === ws) {
            wsRef.current = null;
          }

          if (mountedRef.current) {
            setStatus('disconnected');
          }
        };

        if (mountedRef.current) {
          setStatus('connected');
          setActiveAccountId(accountId);
          setError(null);
        }

        // Balance stream.
        try {
          await sendRequest({
            balance: 1,
            subscribe: 1,
          });
        } catch (err) {
          console.warn(
            'Balance subscription failed:',
            err
          );
        }

        // Existing open contracts.
        try {
          const portfolioResponse =
            await sendRequest({
              portfolio: 1,
            });

          const contracts =
            portfolioResponse?.portfolio?.contracts ||
            [];

          if (mountedRef.current) {
            setPortfolio(contracts);
          }
        } catch (err) {
          console.warn(
            'Portfolio request failed:',
            err
          );
        }

        return ws;
      } catch (err) {
        console.error('Deriv connect error:', err);

        if (mountedRef.current) {
          setStatus('error');
          setError(
            err.message ||
              'Unable to connect to Deriv'
          );
        }

        disconnect();

        throw err;
      }
    },
    [
      activeAccountId,
      disconnect,
      fetchBalanceFor,
      sendRequest,
    ]
  );

  const subscribeTicks = useCallback(
    async (symbol) => {
      if (!symbol) {
        throw new Error('Symbol is required');
      }

      const response = await sendRequest({
        ticks: symbol,
        subscribe: 1,
      });

      subscriptionsRef.current.set(
        symbol,
        response?.subscription?.id || true
      );

      if (response?.tick && mountedRef.current) {
        setTicks((current) => ({
          ...current,
          [symbol]: response.tick,
        }));
      }

      return response;
    },
    [sendRequest]
  );

  const unsubscribeTicks = useCallback(
    async (subscriptionId) => {
      if (!subscriptionId) return;

      return sendRequest({
        forget: subscriptionId,
      });
    },
    [sendRequest]
  );

  const getActiveSymbols = useCallback(
    async (market = 'synthetic_index') => {
      return sendRequest({
        active_symbols: 'brief',
        product_type: 'basic',
      });
    },
    [sendRequest]
  );

  const requestProposal = useCallback(
    async (params) => {
      if (!params) {
        throw new Error(
          'Proposal parameters are required'
        );
      }

      const {
        amount,
        basis = 'stake',
        contract_type,
        currency,
        duration,
        duration_unit,
        symbol,
        underlying_symbol,
        barrier,
        barrier2,
        multiplier,
        limit_order,
        passthrough,
      } = params;

      if (!amount) {
        throw new Error(
          'Trade amount is required'
        );
      }

      if (!contract_type) {
        throw new Error(
          'Contract type is required'
        );
      }

      const actualSymbol =
        underlying_symbol || symbol;

      if (!actualSymbol) {
        throw new Error(
          'Trading symbol is required'
        );
      }

      const payload = {
        proposal: 1,
        amount: Number(amount),
        basis,
        contract_type,
        currency: currency || balance?.currency || 'USD',
        underlying_symbol: actualSymbol,
        subscribe: 1,
      };

      if (
        duration !== undefined &&
        duration !== null
      ) {
        payload.duration = Number(duration);
      }

      if (duration_unit) {
        payload.duration_unit = duration_unit;
      }

      if (
        barrier !== undefined &&
        barrier !== null &&
        barrier !== ''
      ) {
        payload.barrier = String(barrier);
      }

      if (
        barrier2 !== undefined &&
        barrier2 !== null &&
        barrier2 !== ''
      ) {
        payload.barrier2 = String(barrier2);
      }

      if (
        multiplier !== undefined &&
        multiplier !== null
      ) {
        payload.multiplier = Number(multiplier);
      }

      if (limit_order) {
        payload.limit_order = limit_order;
      }

      if (passthrough) {
        payload.passthrough = passthrough;
      }

      const response = await sendRequest(
        payload,
        15000
      );

      if (response?.proposal?.id) {
        return response;
      }

      throw new Error(
        response?.error?.message ||
          'Deriv did not return a valid proposal'
      );
    },
    [balance?.currency, sendRequest]
  );

  const buyContract = useCallback(
    async (proposalId, price) => {
      if (!proposalId) {
        throw new Error(
          'Proposal ID is required to buy'
        );
      }

      if (
        price === undefined ||
        price === null ||
        Number(price) <= 0
      ) {
        throw new Error(
          'A valid proposal price is required'
        );
      }

      const response = await sendRequest(
        {
          buy: String(proposalId),
          price: Number(price),
        },
        20000
      );

      if (!response?.buy?.contract_id) {
        throw new Error(
          response?.error?.message ||
            'Deriv did not return a contract ID'
        );
      }

      const contractId = String(
        response.buy.contract_id
      );

      // Immediately subscribe to the real contract.
      await subscribeContract(contractId);

      return response;
    },
    [sendRequest]
  );

  const subscribeContract = useCallback(
    async (contractId, callback) => {
      if (!contractId) {
        throw new Error(
          'Contract ID is required'
        );
      }

      const id = String(contractId);

      if (callback) {
        if (
          !contractSubscriptionsRef.current.has(id)
        ) {
          contractSubscriptionsRef.current.set(
            id,
            new Set()
          );
        }

        contractSubscriptionsRef.current
          .get(id)
          .add(callback);
      }

      const response = await sendRequest({
        proposal_open_contract: 1,
        contract_id: Number(id),
        subscribe: 1,
      });

      if (
        response?.proposal_open_contract &&
        callback
      ) {
        callback(
          response.proposal_open_contract
        );
      }

      return response;
    },
    [sendRequest]
  );

  const unsubscribeContract = useCallback(
    async (contractId, callback) => {
      if (!contractId) return;

      const id = String(contractId);
      const callbacks =
        contractSubscriptionsRef.current.get(id);

      if (callbacks && callback) {
        callbacks.delete(callback);
      }

      if (
        callbacks &&
        callbacks.size === 0
      ) {
        contractSubscriptionsRef.current.delete(id);
      }

      return true;
    },
    []
  );

  const sellContract = useCallback(
    async (contractId, bidPrice = null) => {
      if (!contractId) {
        throw new Error(
          'Contract ID is required to sell'
        );
      }

      let price = Number(bidPrice);

      // If the UI did not supply bid_price, ask Deriv
      // for the latest open-contract state first.
      if (!Number.isFinite(price) || price < 0) {
        const latest =
          await sendRequest({
            proposal_open_contract: 1,
            contract_id: Number(contractId),
          });

        price = Number(
          latest?.proposal_open_contract?.bid_price
        );
      }

      if (!Number.isFinite(price) || price < 0) {
        throw new Error(
          'Deriv did not provide a valid sell price'
        );
      }

      const response = await sendRequest(
        {
          sell: String(contractId),
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

      return response;
    },
    [sendRequest]
  );

  const getPortfolio = useCallback(async () => {
    const response = await sendRequest({
      portfolio: 1,
    });

    const contracts =
      response?.portfolio?.contracts || [];

    if (mountedRef.current) {
      setPortfolio(contracts);
    }

    return response;
  }, [sendRequest]);

  const getProfitHistory = useCallback(
    async (limit = 50) => {
      return sendRequest({
        profit_table: 1,
        description: 1,
        limit: Number(limit),
      });
    },
    [sendRequest]
  );

  const refreshBalance = useCallback(async () => {
    const response = await sendRequest({
      balance: 1,
    });

    if (response?.balance && mountedRef.current) {
      const balanceData = response.balance;

      setBalance(balanceData);

      if (activeAccountId) {
        setBalances((current) => ({
          ...current,
          [activeAccountId]: balanceData,
        }));
      }
    }

    return response;
  }, [activeAccountId, sendRequest]);

  const switchAccount = useCallback(
    async (accountId) => {
      if (!accountId) {
        throw new Error(
          'Account ID is required'
        );
      }

      setActiveAccountId(accountId);

      await connect(accountId);

      return accountId;
    },
    [connect]
  );

  const refreshAccounts = useCallback(async () => {
    return loadAccounts();
  }, [loadAccounts]);

  const login = useCallback(async () => {
    window.location.href = '/api/auth/login';
  }, []);

  const logout = useCallback(async () => {
    disconnect();

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch (err) {
      console.warn(
        'Logout request failed:',
        err
      );
    }

    if (mountedRef.current) {
      setAccounts([]);
      setActiveAccountId(null);
      setBalance(null);
      setBalances({});
      setPortfolio([]);
      setTicks({});
      setError(null);
      setStatus('disconnected');
    }

    window.location.href = '/';
  }, [disconnect]);

  useEffect(() => {
    mountedRef.current = true;

    loadAccounts().catch(() => {});

    return () => {
      mountedRef.current = false;
      disconnect();
    };
  }, [disconnect, loadAccounts]);

  const value = {
    accounts,
    activeAccountId,
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
    refreshAccounts,

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
    <DerivContext.Provider value={value}>
      {children}
    </DerivContext.Provider>
  );
}

export function useDeriv() {
  const context = useContext(DerivContext);

  if (!context) {
    throw new Error(
      'useDeriv must be used inside DerivProvider'
    );
  }

  return context;
}

export default DerivContext;
