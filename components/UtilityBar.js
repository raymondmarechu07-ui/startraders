'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDeriv } from '@/context/DerivProvider';

function AccountBadge({ account, active }) {
  const isDemo = account?.account_type === 'demo';
  const currency = account?.currency || 'USD';

  return (
    <div className={`account-option ${active ? 'active' : ''}`}>
      <span className={`account-currency ${isDemo ? 'demo' : ''}`}>
        {isDemo ? 'D' : currency.slice(0, 1)}
      </span>

      <span className="account-option-main">
        <strong>{isDemo ? 'Demo' : currency}</strong>
        <small>{account?.loginid || account?.account_id || 'Account'}</small>
      </span>
    </div>
  );
}

export default function UtilityBar() {
  const {
    isLoggedIn,
    activeAccount,
    balance,
    status,
    error,
    login,
    logout,
    accounts,
    switchAccount,
  } = useDeriv();

  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const onPointerDown = (event) => {
      if (wrapperRef.current && wrapperRef.current.contains(event.target)) return;
      if (event.target.closest?.('.st-account-portal')) return;
      setMenuOpen(false);
    };

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  function formatBalance() {
    if (!isLoggedIn) return null;
    if (status === 'connecting') return 'Connecting…';
    if (status === 'error') return 'Connection error';
    if (!balance) return '—.—';

    return `${Number(balance.balance).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${balance.currency || 'USD'}`;
  }

  const isDemo = activeAccount?.account_type === 'demo';
  const displayCurrency = activeAccount?.currency || balance?.currency || 'USD';

  function selectAccount(loginid) {
    switchAccount(loginid);
    setMenuOpen(false);
  }

  const accountMenu = menuOpen && mounted
    ? createPortal(
        <div className="st-account-portal" role="dialog" aria-label="Account selector">
          <div
            className="st-account-backdrop"
            aria-hidden="true"
            onClick={() => setMenuOpen(false)}
          />

          <div className="st-account-panel">
            <div className="st-account-tabs" role="tablist" aria-label="Account type">
              <button
                type="button"
                className={!isDemo ? 'selected' : ''}
                onClick={() => {
                  const real = accounts.find((a) => a.account_type !== 'demo');
                  if (real) selectAccount(real.loginid);
                }}
              >
                Real
              </button>

              <button
                type="button"
                className={isDemo ? 'selected demo-tab' : ''}
                onClick={() => {
                  const demo = accounts.find((a) => a.account_type === 'demo');
                  if (demo) selectAccount(demo.loginid);
                }}
              >
                Demo
              </button>
            </div>

            <div className="st-account-body">
              <div className="st-account-heading">
                {accounts.some((a) => a.account_type === 'demo') ? 'Deriv accounts' : 'Deriv account'}
              </div>

              <div className="st-account-list">
                {accounts.length ? (
                  accounts.map((acc) => {
                    const active =
                      acc.account_id === activeAccount?.account_id ||
                      acc.loginid === activeAccount?.loginid;

                    return (
                      <button
                        type="button"
                        className={`st-account-item ${active ? 'active' : ''}`}
                        key={acc.loginid || acc.account_id}
                        onClick={() => selectAccount(acc.loginid)}
                      >
                        <AccountBadge account={acc} active={active} />

                        <span className="account-item-balance">
                          {active && balance
                            ? `${Number(balance.balance).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })} ${balance.currency || displayCurrency}`
                            : '—'}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <div className="st-account-empty">No Deriv accounts found.</div>
                )}
              </div>

              <button type="button" className="st-cfd-link">
                Looking for CFD accounts? Go to Trader&apos;s Hub
              </button>
            </div>

            <button type="button" className="st-logout" onClick={logout}>
              <span>Logout</span>
              <span aria-hidden="true">↪</span>
            </button>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <div className="utility-bar">
        <div className="utility-left">
          <button type="button" className="utility-icon-button" aria-label="Open navigation">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>

          <button type="button" className="utility-icon-button call-button" aria-label="Contact StarTraders">
            <svg className="call-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16.5c0 .6-.4 1-1 1-8.3 0-15-6.7-15-15 0-.6.4-1 1-1h3.5c.5 0 .9.4 1 .9.1 1.2.4 2.4.8 3.5.2.4.1.9-.3 1.2l-1.6 1.3c1.4 2.9 3.8 5.3 6.7 6.7l1.3-1.6c.3-.4.8-.5 1.2-.3 1.1.4 2.3.7 3.5.8.5.1.9.5.9 1v3.5z" />
            </svg>
          </button>

          <button
            type="button"
            className="utility-icon-button refresh-button"
            aria-label="Refresh account"
            onClick={() => window.location.reload()}
          >
            <svg className="refresh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6M1 20v-6h6M3.5 9a9 9 0 0114.7-3.4L23 10M1 14l4.8 4.4A9 9 0 0020.5 15" />
            </svg>
          </button>
        </div>

        {isLoggedIn ? (
          <div className="utility-account-wrap" ref={wrapperRef}>
            <button
              type="button"
              className={`utility-right ${menuOpen ? 'open' : ''}`}
              onClick={() => setMenuOpen((value) => !value)}
              aria-expanded={menuOpen}
              aria-haspopup="dialog"
            >
              <span className={`utility-account-logo ${isDemo ? 'demo' : ''}`}>
                {isDemo ? 'D' : displayCurrency.slice(0, 1)}
              </span>

              <span className="utility-account-copy">
                <strong>{formatBalance()}</strong>
                <small>{isDemo ? 'DEMO' : 'REAL'}</small>
              </span>

              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d={menuOpen ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'} />
              </svg>
            </button>
          </div>
        ) : (
          <button className="utility-login" onClick={login}>
            Login with Deriv
          </button>
        )}
      </div>

      {accountMenu}
    </>
  );
}
