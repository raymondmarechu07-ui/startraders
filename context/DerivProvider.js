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

function normalizeAccount(account) {
  if (!account) return null;
  const id =
    account.account_id ||
    account.accountId ||
    account.loginid ||
    account.login_id ||
    account.id ||
    '';
  return {
    ...account,
    accountId: String(id),
    loginid: String(account.loginid || account.login_id || id),
    currency: account.currency || 'USD',
    account_type: account.account_type || account.type || 'demo',
    isDemo:
      account.isDemo ??
      String(account.account_type || account.type || 'demo').toLowerCase() === 'demo',
  };
}

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
  const reqIdRef = useRef(1000);
  const pendingRef = useRef(new Map());
  const tickCallbacksRef = useRef(new Map());
  const contractCallbacksRef = useRef(new Map());
  const reconnectTimerRef = useRef(null);
  const connectingRef = useRef(false);
  const activeAccountIdRef = useRef(null);

  const nextReqId = useCallback(() => {
    reqIdRef.current += 1;
    return reqIdRef.current;
  }, []);

  const clearPending = useCallback((message) => {
    for (const [id, pending] of pendingRef.current.entries()) {
      clearTimeout(pending.timeout);
      pending.reject(new Error(message));
      pendingRef.current.delete(id);
    }
  }, []);

  const handleMessage = useCallback((raw) => {
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return;
    }

    if (data.error) {
      const reqId = data.req_id;
      if (reqId && pendingRef.current.has(reqId)) {
        const pending = pendingRef.current.get(reqId);
        clearTimeout(pending.timeout);
        pendingRef.current.delete(reqId);
        pending.reject(new Error(data.error.message || 'Deriv request failed'));
      }
      setError(data.error.message || 'Deriv request failed');
      return;
    }

    const reqId = data.req_id;
    if (reqId && pendingRef.current.has(reqId)) {
      const pending = pendingRef.current.get(reqId);
      clearTimeout(pending.timeout);
      pendingRef.current.delete(reqId);
      pending.resolve(data);
    }

    if (data.msg_type === 'balance' && data.balance) {
      const value = Number(data.balance.balance);
      if (Number.isFinite(value)) {
        setBalance(value);
        const id = activeAccountIdRef.current;
        if (id) {
          setBalances((prev) => ({ ...prev, [id]: value }));
        }
      }
    }

    if (data.msg_type === 'tick' && data.tick) {
      const symbol = data.tick.symbol;
      const quote = Number(data.tick.quote);
      const item = {
        ...data.tick,
        quote,
        epoch: Number(data.tick.epoch || Date.now() / 1000),
      };

      setTicks((prev) => ({ ...prev, [symbol]: item }));

      const callbacks = tickCallbacksRef.current.get(symbol);
      if (callbacks) {
        callbacks.forEach((cb) => {
          try {
            cb(item);
          } catch (e) {
            console.error('Tick callback error:', e);
          }
        });
      }
    }

    if (data.msg_type === 'proposal_open_contract' && data.proposal_open_contract) {
      const contract = data.proposal_open_contract;
      const id = String(contract.contract_id);
      const callbacks = contractCallbacksRef.current.get(id);
      if (callbacks) {
        callbacks.forEach((cb) => {
          try {
            cb(contract);
          } catch (e) {
            console.error('Contract callback error:', e);
          }
        });
      }
    }

    if (data.msg_type === 'portfolio' && data.portfolio) {
      const contracts = data.portfolio.contracts || [];
      setPortfolio(contracts);
    }
  }, []);

  const disconnect = useCallback((silent = false) => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    connectingRef.current = false;

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

    clearPending('Deriv connection closed');

    if (!silent) {
      setStatus('disconnected');
    }
  }, [clearPending]);

  const sendRequest = useCallback(
    (payload, timeoutMs = 15000) => {
      return new Promise((resolve, reject) => {
        const ws = wsRef.current;

        if (!ws || ws.readyState !== WebSocket.OPEN) {
          reject(new Error('Deriv trading connection is not ready'));
          return;
        }

        const req_id = nextReqId();
        const timeout = setTimeout(() => {
          pendingRef.current.delete(req_id);
          reject(new Error('Deriv request timed out'));
        }, timeoutMs);

        pendingRef.current.set(req_id, { resolve, reject, timeout });

        try {
          ws.send(JSON.stringify({ ...payload, req_id }));
        } catch (e) {
          clearTimeout(timeout);
          pendingRef.current.delete(req_id);
          reject(e);
        }
      });
    },
    [nextReqId]
  );

  const fetchOtp = useCallback(async (accountId) => {
    const response = await fetch('/api/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId }),
      cache: 'no-store',
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Could not get Deriv WebSocket URL');
    }

    const url =
      data?.data?.url ||
      data?.url ||
      data?.data?.ws_url ||
      data?.ws_url ||
      data?.data?.websocket_url ||
      data?.websocket_url;

    if (!url) {
      throw new Error('Deriv OTP response did not contain a WebSocket URL');
    }

    return url;
  }, []);

  const connect = useCallback(
    async (accountId = activeAccountIdRef.current) => {
      if (!accountId) throw new Error('No Deriv account selected');

      if (
        wsRef.current &&
        wsRef.current.readyState === WebSocket.OPEN &&
        activeAccountIdRef.current === accountId
      ) {
        return wsRef.current;
      }

      if (connectingRef.current) return wsRef.current;
      connectingRef.current = true;
      setError(null);
      setStatus('connecting');

      try {
        if (wsRef.current) disconnect(true);

        activeAccountIdRef.current = String(accountId);
        const wsUrl = await fetchOtp(accountId);
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        await new Promise((resolve, reject) => {
          let settled = false;

          const fail = (err) => {
            if (settled) return;
            settled = true;
            reject(err instanceof Error ? err : new Error('WebSocket connection failed'));
          };

          ws.onopen = () => {
            if (settled) return;
            settled = true;
            setStatus('connected');
            setError(null);
            resolve();
          };

          ws.onerror = () => fail(new Error('Unable to connect to Deriv trading WebSocket'));

          ws.onclose = () => {
            if (!settled) fail(new Error('Deriv WebSocket closed before connecting'));
          };
        });

        ws.onmessage = (event) => handleMessage(event.data);

        ws.onerror = () => {
          setStatus('error');
          setError('Deriv trading connection error');
        };

        ws.onclose = () => {
          wsRef.current = null;
          connectingRef.current = false;
          setStatus('disconnected');
          clearPending('Deriv trading connection closed');

          if (activeAccountIdRef.current) {
            reconnectTimerRef.current = setTimeout(() => {
              connect(activeAccountIdRef.current).catch(() => {});
            }, 2500);
          }
        };

        connectingRef.current = false;

        // Start the same account streams that a trading terminal needs.
        await sendRequest({ balance: 1, subscribe: 1 });
        await sendRequest({ portfolio: 1 });

        return ws;
      } catch (e) {
        connectingRef.current = false;
        setStatus('error');
        setError(e.message || 'Failed to connect to Deriv');
        throw e;
      }
    },
    [clearPending, disconnect, fetchOtp, handleMessage, sendRequest]
  );

  const loadAccounts = useCallback(async () => {
    setError(null);

    const response = await fetch('/api/accounts', {
      method: 'GET',
      cache: 'no-store',
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401) {
        setAccounts([]);
        setActiveAccountId(null);
        return [];
      }
      throw new Error(data.error || data.message || 'Could not load Deriv accounts');
    }

    const rawAccounts =
      data?.data?.accounts ||
      data?.accounts ||
      data?.data ||
      [];

    const normalized = Array.isArray(rawAccounts)
      ? rawAccounts.map(normalizeAccount).filter((a) => a.accountId)
      : [];

    setAccounts(normalized);

    if (normalized.length) {
      const preferred =
        normalized.find((a) => a.accountId === activeAccountIdRef.current) ||
        normalized.find((a) => a.isDemo) ||
        normalized[0];

      setActiveAccountId(preferred.accountId);
      activeAccountIdRef.current = preferred.accountId;
    } else {
      setActiveAccountId(null);
      activeAccountIdRef.current = null;
    }

    return normalized;
  }, []);

  const refreshAccounts = loadAccounts;

  const switchAccount = useCallback(
    async (accountId) => {
      const id = String(accountId);
      const account = accounts.find((a) => a.accountId === id);
      if (!account) throw new Error('Deriv account not found');

      disconnect(true);
      setActiveAccountId(id);
      activeAccountIdRef.current = id;
      setBalance(
        Number.isFinite(Number(balances[id])) ? Number(balances[id]) : null
      );

      await connect(id);
    },
    [accounts, balances, connect, disconnect]
  );

  const subscribeTicks = useCallback(
    async (symbol, callback) => {
      if (!symbol) throw new Error('Missing market symbol');

      if (callback) {
        if (!tickCallbacksRef.current.has(symbol)) {
          tickCallbacksRef.current.set(symbol, new Set());
        }
        tickCallbacksRef.current.get(symbol).add(callback);
      }

      await sendRequest({
        ticks: symbol,
        subscribe: 1,
      });

      return () => {
        const callbacks = tickCallbacksRef.current.get(symbol);
        if (callbacks && callback) {
          callbacks.delete(callback);
          if (!callbacks.size) tickCallbacksRef.current.delete(symbol);
        }
      };
    },
    [sendRequest]
  );

  const unsubscribeTicks = useCallback(
    async (symbol) => {
      const callbacks = tickCallbacksRef.current.get(symbol);
      if (callbacks) tickCallbacksRef.current.delete(symbol);

      try {
        await sendRequest({ forget: 'ticks', symbol });
      } catch {}
    },
    [sendRequest]
  );

  const getActiveSymbols = useCallback(
    async (market = 'synthetic_index') => {
      const response = await sendRequest({
        active_symbols: 'brief',
      });

      const list = response?.active_symbols || response?.symbols || [];
      if (!Array.isArray(list)) return [];

      if (!market) return list;

      return list.filter((item) => {
        const marketName = String(
          item.market || item.market_display_name || item.submarket || ''
        ).toLowerCase();

        return marketName.includes(market.toLowerCase());
      });
    },
    [sendRequest]
  );

  const requestProposal = useCallback(
    async ({
      symbol,
      contractType,
      amount,
      currency = 'USD',
      duration,
      durationUnit,
      barrier,
      multiplier,
    }) => {
      const payload = {
        proposal: 1,
        amount: Number(amount),
        basis: 'stake',
        contract_type: contractType,
        currency,
        underlying_symbol: symbol,
        duration: Number(duration),
        duration_unit: durationUnit,
        subscribe: 1,
      };

      if (barrier !== undefined && barrier !== null && barrier !== '') {
        payload.barrier = String(barrier);
      }

      if (multiplier !== undefined && multiplier !== null) {
        payload.multiplier = Number(multiplier);
      }

      const response = await sendRequest(payload);
      if (!response?.proposal) {
        throw new Error('Deriv did not return a trade proposal');
      }

      return response.proposal;
    },
    [sendRequest]
  );

  const buyContract = useCallback(
    async (proposalId, price) => {
      if (!proposalId) throw new Error('Missing proposal ID');

      const response = await sendRequest({
        buy: String(proposalId),
        price: Number(price),
      });

      if (!response?.buy) {
        throw new Error('Deriv did not confirm the purchase');
      }

      return response.buy;
    },
    [sendRequest]
  );

  const subscribeContract = useCallback(
    async (contractId, callback) => {
      const id = String(contractId);

      if (callback) {
        if (!contractCallbacksRef.current.has(id)) {
          contractCallbacksRef.current.set(id, new Set());
        }
        contractCallbacksRef.current.get(id).add(callback);
      }

      const response = await sendRequest({
        proposal_open_contract: 1,
        contract_id: Number(contractId),
        subscribe: 1,
      });

      if (response?.proposal_open_contract && callback) {
        callback(response.proposal_open_contract);
      }

      return response?.proposal_open_contract || null;
    },
    [sendRequest]
  );

  const unsubscribeContract = useCallback(
    async (contractId) => {
      const id = String(contractId);
      contractCallbacksRef.current.delete(id);

      try {
        await sendRequest({
          forget_all: 'proposal_open_contract',
        });
      } catch {}
    },
    [sendRequest]
  );

  const sellContract = useCallback(
    async (contractId, bidPrice) => {
      if (!contractId) throw new Error('Missing contract ID');

      let price = Number(bidPrice);

      if (!Number.isFinite(price) || price < 0) {
        const current = await sendRequest({
          proposal_open_contract: 1,
          contract_id: Number(contractId),
        });
        price = Number(current?.proposal_open_contract?.bid_price);
      }

      if (!Number.isFinite(price) || price < 0) {
        throw new Error('No valid current bid price was returned by Deriv');
      }

      const response = await sendRequest({
        sell: String(contractId),
        price,
      });

      if (!response?.sell) {
        throw new Error('Deriv did not confirm the contract sale');
      }

      return response.sell;
    },
    [sendRequest]
  );

  const getPortfolio = useCallback(async () => {
    const response = await sendRequest({ portfolio: 1 });
    const contracts = response?.portfolio?.contracts || [];
    setPortfolio(contracts);
    return contracts;
  }, [sendRequest]);

  const getProfitHistory = useCallback(
    async (options = {}) => {
      const payload = {
        profit_table: 1,
        description: 1,
        limit: Number(options.limit || 20),
      };

      if (options.dateFrom) payload.date_from = options.dateFrom;
      if (options.dateTo) payload.date_to = options.dateTo;

      const response = await sendRequest(payload);
      return response?.profit_table || { transactions: [] };
    },
    [sendRequest]
  );

  const refreshBalance = useCallback(async () => {
    const response = await sendRequest({ balance: 1 });
    const value = Number(response?.balance?.balance);

    if (Number.isFinite(value)) {
      setBalance(value);
      if (activeAccountIdRef.current) {
        setBalances((prev) => ({
          ...prev,
          [activeAccountIdRef.current]: value,
        }));
      }
    }

    return value;
  }, [sendRequest]);

  const login = useCallback(() => {
    window.location.href = '/api/auth/login';
  }, []);

  const logout = useCallback(async () => {
    disconnect(true);

    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}

    setAccounts([]);
    setActiveAccountId(null);
    setBalance(null);
    setBalances({});
    setTicks({});
    setPortfolio([]);
    activeAccountIdRef.current = null;
    window.location.href = '/';
  }, [disconnect]);

  useEffect(() => {
    loadAccounts().catch((e) => {
      setError(e.message || 'Unable to load Deriv account');
    });

    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      disconnect(true);
    };
  }, [disconnect, loadAccounts]);

  useEffect(() => {
    if (!activeAccountId) return;

    connect(activeAccountId).catch(() => {});
  }, [activeAccountId, connect]);

  const activeAccount = useMemo(
    () => accounts.find((a) => a.accountId === activeAccountId) || null,
    [accounts, activeAccountId]
  );

  const value = useMemo(
    () => ({
      accounts,
      activeAccountId,
      activeAccount,
      isLoggedIn: accounts.length > 0,
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
    }),
    [
      accounts,
      activeAccountId,
      activeAccount,
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
    ]
  );

  return <DerivContext.Provider value={value}>{children}</DerivContext.Provider>;
}

export function useDeriv() {
  const context = useContext(DerivContext);
  if (!context) {
    throw new Error('useDeriv must be used inside DerivProvider');
  }
  return context;
}

export default DerivProvider;
