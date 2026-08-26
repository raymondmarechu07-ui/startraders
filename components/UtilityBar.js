'use client';

import { useState } from 'react';
import { useDeriv } from '@/context/DerivProvider';

export default function UtilityBar() {
  const { isLoggedIn, activeAccount, balance, status, error, login, logout, accounts, switchAccount } =
    useDeriv();
  const [menuOpen, setMenuOpen] = useState(false);

  function formatBalance() {
    if (!isLoggedIn) return null;
    if (status === 'connecting') return 'Connecting…';
    if (status === 'error') return 'Connection error';
    if (!balance) return '—.—';
    return `${Number(balance.balance).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${balance.currency}`;
  }

  return (
    <div className="utility-bar">
      <div className="utility-left">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
        <svg className="call-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16.5c0 .6-.4 1-1 1-8.3 0-15-6.7-15-15 0-.6.4-1 1-1h3.5c.5 0 .9.4 1 .9.1 1.2.4 2.4.8 3.5.2.4.1.9-.3 1.2l-1.6 1.3c1.4 2.9 3.8 5.3 6.7 6.7l1.3-1.6c.3-.4.8-.5 1.2-.3 1.1.4 2.3.7 3.5.8.5.1.9.5.9 1v3.5z" />
        </svg>
        <svg className="refresh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M23 4v6h-6M1 20v-6h6M3.5 9a9 9 0 0114.7-3.4L23 10M1 14l4.8 4.4A9 9 0 0020.5 15" />
        </svg>
      </div>

      {isLoggedIn ? (
        <div style={{ position: 'relative' }}>
          <div className="utility-right" onClick={() => setMenuOpen((v) => !v)}>
            <span className="flag">{activeAccount?.account_type === 'demo' ? '🕹️' : '🇺🇸'}</span>
            <span className="bal" title={error || ''}>
              {formatBalance()}
            </span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
          {menuOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '42px',
                background: 'var(--navy-800)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '6px',
                minWidth: '200px',
                zIndex: 50,
              }}
            >
              {accounts.map((acc) => (
                <div
                  key={acc.loginid}
                  onClick={() => {
                    switchAccount(acc.loginid);
                    setMenuOpen(false);
                  }}
                  style={{
                    padding: '9px 10px',
                    borderRadius: '7px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    color: acc.account_id === activeAccount?.account_id ? 'var(--teal-bright)' : 'var(--text-1)',
                  }}
                >
                  {acc.account_type === 'demo' ? '🕹️ Demo' : '🇺🇸 Real'} — {acc.account_id}
                </div>
              ))}
              <div
                onClick={logout}
                style={{
                  padding: '9px 10px',
                  borderRadius: '7px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: 'var(--pink-bright)',
                  borderTop: '1px solid var(--border)',
                  marginTop: '4px',
                }}
              >
                Log out
              </div>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={login}
          style={{
            background: 'linear-gradient(90deg,#2dd4bf,#14b8a6)',
            color: '#02231d',
            fontWeight: 800,
            fontSize: '13px',
            border: 'none',
            borderRadius: '20px',
            padding: '8px 18px',
            cursor: 'pointer',
          }}
        >
          Login with Deriv
        </button>
      )}
    </div>
  );
}
