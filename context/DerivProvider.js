'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
const DerivContext = createContext(null);

export function DerivProvider({ children }) {
  const [accounts, setAccounts] = useState([]);
  const [activeAccountId, setActiveAccountId] = useState(null);
  const [balance, setBalance] = useState(null);
  const [status, setStatus] = useState('disconnected');
  const [error, setError] = useState(null);
  const wsRef = useRef(null);

  const loadAccounts = useCallback(async () => {
    const r = await fetch('/api/accounts', { cache: 'no-store' });
    if (!r.ok) throw new Error('Unable to load your Deriv accounts.');
    const json = await r.json();
    const list = Array.isArray(json.data) ? json.data : [];
    setAccounts(list);
    setActiveAccountId((current) => current && list.some(a => a.account_id === current) ? current : list[0]?.account_id || null);
    return list;
  }, []);

  const connect = useCallback(async (accountId) => {
    if (!accountId) return;
    setStatus('connecting'); setError(null);
    try {
      if (wsRef.current) wsRef.current.close();
      const r = await fetch('/api/otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accountId }) });
      const json = await r.json();
      if (!r.ok || !json?.data?.url) throw new Error(json?.errors?.[0]?.message || 'Could not obtain a Deriv WebSocket session.');
      const ws = new WebSocket(json.data.url);
      wsRef.current = ws;
      ws.onopen = () => {
        setStatus('connected');
        ws.send(JSON.stringify({ balance: 1, subscribe: 1 }));
        ws.send(JSON.stringify({ portfolio: 1 }));
      };
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.msg_type === 'balance' && msg.balance) setBalance(msg.balance);
          if (msg.error) setError(msg.error.message || 'Deriv API error');
        } catch {}
      };
      ws.onerror = () => { setStatus('error'); setError('Deriv WebSocket connection failed.'); };
      ws.onclose = () => { setStatus('disconnected'); };
    } catch (e) { setStatus('error'); setError(e.message); }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const session = await fetch('/api/session', { cache: 'no-store' }).then(r => r.json());
        if (!session.authenticated || cancelled) return;
        await loadAccounts();
      } catch {}
    })();
    return () => { cancelled = true; if (wsRef.current) wsRef.current.close(); };
  }, [loadAccounts, connect]);

  useEffect(() => {
    if (activeAccountId) connect(activeAccountId);
  }, [activeAccountId, connect]);

  const login = useCallback(() => { window.location.assign('/api/auth/login'); }, []);
  const logout = useCallback(async () => { if (wsRef.current) wsRef.current.close(); await fetch('/api/auth/logout', { method: 'POST' }); setAccounts([]); setActiveAccountId(null); setBalance(null); setStatus('disconnected'); window.location.assign('/'); }, []);

  const activeAccount = accounts.find(a => a.account_id === activeAccountId) || null;
  const value = { accounts, activeAccount, balance, status, error, isLoggedIn: accounts.length > 0, login, logout, switchAccount: setActiveAccountId, refreshAccounts: loadAccounts, websocket: wsRef.current };
  return <DerivContext.Provider value={value}>{children}</DerivContext.Provider>;
}
export function useDeriv() { const ctx = useContext(DerivContext); if (!ctx) throw new Error('useDeriv must be used inside <DerivProvider>'); return ctx; }
