'use client';

import { useState } from 'react';
import Logo from '@/components/Logo';
import { useDeriv } from '@/context/DerivProvider';

const SOCIAL_LINKS = [
  { name: 'WhatsApp', href: 'https://wa.me/', color: '#25D366', icon: 'M17 14c-.3-.1-1.7-.8-2-1-.3-.1-.5-.1-.6.1-.2.3-.7 1-.9 1.1-.1.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.5-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.2-.4.1-.2 0-.4 0-.5C9.5 8.4 9 7.1 8.8 6.6c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9 1-.9 2.3 0 1.3 1 2.6 1.1 2.8.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 00-8.6 15L2 22l5.2-1.4A10 10 0 1012 2z' },
  { name: 'Telegram', href: 'https://t.me/', color: '#229ED9', icon: 'M22 4L2.7 11.5c-1 .4-1 1 .2 1.3l4.9 1.5 1.9 5.8c.2.6.4.8.9.8.4 0 .6-.2.8-.4l2.4-2.3 5 3.6c.7.4 1.2.2 1.4-.6L22.6 4.9c.3-1-.2-1.4-.6-.9z' },
  { name: 'TikTok', href: 'https://tiktok.com/', color: '#111', icon: 'M16 3c.4 2 1.7 3.4 4 3.6v3c-1.4 0-2.7-.4-4-1.2v6.4a5.2 5.2 0 11-5.2-5.2c.3 0 .6 0 1 .1v3.1a2.1 2.1 0 102 2.1V3h2.2z' },
  { name: 'YouTube', href: 'https://youtube.com/', color: '#FF0000', icon: 'M22 12s0-3.4-.4-5a2.8 2.8 0 00-2-2C17.9 4.5 12 4.5 12 4.5s-5.9 0-7.6.5a2.8 2.8 0 00-2 2C2 8.6 2 12 2 12s0 3.4.4 5a2.8 2.8 0 002 2c1.7.5 7.6.5 7.6.5s5.9 0 7.6-.5a2.8 2.8 0 002-2c.4-1.6.4-5 .4-5zM10 15.5v-7l6 3.5z' },
  { name: 'Instagram', href: 'https://instagram.com/', color: '#E1306C', icon: 'M12 2c2.7 0 3 0 4 .1 1.1 0 1.8.2 2.4.5.6.2 1.1.6 1.6 1 .4.5.8 1 1 1.6.3.6.4 1.3.5 2.4 0 1 .1 1.3.1 4s0 3-.1 4c0 1.1-.2 1.8-.5 2.4-.2.6-.6 1.1-1 1.6-.5.4-1 .8-1.6 1-.6.3-1.3.4-2.4.5-1 0-1.3.1-4 .1s-3 0-4-.1c-1.1 0-1.8-.2-2.4-.5a4.2 4.2 0 01-1.6-1 4.2 4.2 0 01-1-1.6c-.3-.6-.4-1.3-.5-2.4C2 15 2 14.7 2 12s0-3 .1-4c0-1.1.2-1.8.5-2.4.2-.6.6-1.1 1-1.6.5-.4 1-.8 1.6-1 .6-.3 1.3-.4 2.4-.5C8.9 2.5 9.3 2.5 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm0 8.2a3.2 3.2 0 110-6.4 3.2 3.2 0 010 6.4zm5.2-8.4a1.2 1.2 0 100-2.4 1.2 1.2 0 000 2.4z' },
];

function AccountIcon({ type, currency = 'USD', size = 24 }) {
  if (type === 'demo') {
    return (
      <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true" style={{ display: 'block' }}>
        <circle cx="20" cy="20" r="19" fill="#78a9a4" />
        <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,.25)" />
        <path d="M16.2 14.3 14 9.8M23.8 14.3 26 9.8M20 14.8v14" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        <path d="M20 15.2c8 0 9 3.8 9 6.4 0 4.8-3.7 7.6-9 7.6" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        <path d="M15.5 18.7h7.8M15.5 22.5h9M15.5 26.3h7.8" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  const isUsd = currency === 'USD';
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true" style={{ display: 'block' }}>
      <defs>
        <clipPath id="st-us-flag"><circle cx="20" cy="20" r="19" /></clipPath>
      </defs>
      <circle cx="20" cy="20" r="19" fill="#f7f7f7" />
      {isUsd ? (
        <g clipPath="url(#st-us-flag)">
          <rect width="40" height="40" fill="#fff" />
          {[0, 6, 12, 18, 24, 30, 36].map((y) => <rect key={y} y={y} width="40" height="3" fill="#ef476f" />)}
          <rect width="18" height="18" fill="#2457a6" />
          <g fill="#fff">
            <circle cx="3.5" cy="3.5" r="1" /><circle cx="8.5" cy="3.5" r="1" /><circle cx="13.5" cy="3.5" r="1" />
            <circle cx="6" cy="8.5" r="1" /><circle cx="11" cy="8.5" r="1" /><circle cx="3.5" cy="13.5" r="1" /><circle cx="8.5" cy="13.5" r="1" /><circle cx="13.5" cy="13.5" r="1" />
          </g>
        </g>
      ) : (
        <text x="20" y="25" textAnchor="middle" fontSize="16" fontWeight="800" fill="#123">{currency.slice(0, 2)}</text>
      )}
      <circle cx="20" cy="20" r="19" fill="none" stroke="rgba(255,255,255,.18)" />
    </svg>
  );
}

function formatBalanceValue(bal) {
  if (!bal) return null;
  return `${Number(bal.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${bal.currency}`;
}

export default function UtilityBar() {
  const { isLoggedIn, activeAccount, balance, balances, status, error, login, logout, accounts, switchAccount } = useDeriv();
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [accountTab, setAccountTab] = useState('demo');

  function formatBalance() {
    if (!isLoggedIn) return null;
    if (status === 'connecting') return 'Connecting…';
    if (status === 'error') return 'Connection error';
    if (!balance) return '—.—';
    return formatBalanceValue(balance);
  }

  const activeType = activeAccount?.account_type === 'real' ? 'real' : 'demo';
  const activeCurrency = balance?.currency || activeAccount?.currency || 'USD';

  return (
    <>
      <div className="utility-bar">
        <div className="utility-left">
          <button className="utility-menu-button" aria-label="Open menu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
          </button>
          <Logo />
          <button className="utility-icon-button" onClick={() => setContactOpen(true)} aria-label="Contact StarTraders">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16.5c0 .6-.4 1-1 1-8.3 0-15-6.7-15-15 0-.6.4-1 1-1h3.5c.5 0 .9.4 1 .9.1 1.2.4 2.4.8 3.5.2.4.1.9-.3 1.2l-1.6 1.3c1.4 2.9 3.8 5.3 6.7 6.7l1.3-1.6c.3-.4.8-.5 1.2-.3 1.1.4 2.3.7 3.5.8.5.1.9.5.9 1v3.5z" /></svg>
          </button>
          <button className="reports-link" type="button" onClick={() => alert('Reports will be connected to your trading history.') }>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h6M9 17h6M9 9h2"/></svg>
            <span>Reports</span>
          </button>
        </div>

        {isLoggedIn ? (
          <div className="account-area">
            <button
              type="button"
              className="utility-right"
              onClick={() => { setAccountTab(activeType); setMenuOpen((v) => !v); }}
              aria-expanded={menuOpen}
              aria-label="Open account selector"
            >
              <AccountIcon type={activeType} currency={activeCurrency} size={30} />
              <span className="utility-balance-wrap">
                <strong className="bal" title={error || ''}>{formatBalance()}</strong>
                <small>{activeType === 'real' ? 'REAL' : 'DEMO'}</small>
              </span>
              <svg className="account-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6" /></svg>
            </button>

            {menuOpen && (
              <div className="account-menu">
                <div className="account-menu-tabs">
                  <button type="button" className={accountTab === 'real' ? 'account-tab active-real' : 'account-tab'} onClick={() => setAccountTab('real')}>Real</button>
                  <button type="button" className={accountTab === 'demo' ? 'account-tab active-demo' : 'account-tab'} onClick={() => setAccountTab('demo')}>Demo</button>
                </div>

                <div className="account-menu-body">
                  <p className="account-menu-label">Deriv account</p>
                  {accounts.filter((acc) => acc.account_type === accountTab).map((acc) => {
                    const isActive = acc.account_id === activeAccount?.account_id;
                    const rowBalance = isActive ? balance : balances[acc.account_id];
                    const currency = rowBalance?.currency || acc.currency || 'USD';
                    return (
                      <button type="button" key={acc.account_id} className={isActive ? 'account-row active' : 'account-row'} onClick={() => { switchAccount(acc.account_id); setMenuOpen(false); }}>
                        <span className="account-row-avatar"><AccountIcon type={acc.account_type} currency={currency} size={30} /></span>
                        <span className="account-row-info"><strong>{acc.account_type === 'demo' ? 'Demo' : currency}</strong><small>{acc.account_id}</small></span>
                        <span className="account-row-balance">{rowBalance ? formatBalanceValue(rowBalance) : 'Loading…'}</span>
                      </button>
                    );
                  })}
                  {accounts.filter((acc) => acc.account_type === accountTab).length === 0 && <p className="account-menu-empty">No {accountTab} account on this login.</p>}
                  <a href="https://hub.deriv.com" target="_blank" rel="noopener noreferrer" className="account-menu-cfd-link">Looking for CFD accounts? Go to Trader&apos;s Hub</a>
                </div>
                <button type="button" className="account-menu-logout" onClick={logout}>Logout <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg></button>
              </div>
            )}
          </div>
        ) : (
          <button className="login-button" onClick={login}>Login with Deriv</button>
        )}
      </div>

      {contactOpen && (
        <div className="contact-modal-backdrop" onClick={() => setContactOpen(false)}>
          <div className="contact-modal" onClick={(e) => e.stopPropagation()}>
            <button className="contact-modal-close" onClick={() => setContactOpen(false)}>×</button>
            <p className="contact-modal-title">Connect with us on social media</p>
            {SOCIAL_LINKS.map((s) => (
              <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" className="contact-modal-btn" style={{ background: s.color }}>
                <svg viewBox="0 0 24 24" fill="currentColor"><path d={s.icon} /></svg>{s.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
