'use client';

import { useEffect, useState } from 'react';
import UtilityBar from '@/components/UtilityBar';
import TabNav from '@/components/TabNav';

const DTRADER_URL = 'https://startraders-dtrader.pages.dev';

export default function ManualTraderPage() {
  const [traderUrl, setTraderUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const prepareTrader = async () => {
      try {
        const response = await fetch('/api/auth/handoff', {
          method: 'POST',
          cache: 'no-store',
        });

        const data = await response.json();

        if (!response.ok || !data?.code) {
          throw new Error(data?.error || 'Your StarTraders session is not connected.');
        }

        if (cancelled) return;

        const target = new URL(DTRADER_URL);
        target.searchParams.set('st_sso', data.code);
        target.searchParams.set('chart_type', 'area');
        target.searchParams.set('interval', '1t');
        target.searchParams.set('symbol', '1HZ100V');
        target.searchParams.set('trade_type', 'accumulator');

        setTraderUrl(target.toString());
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || 'Could not connect the Manual Trader.');
        }
      }
    };

    prepareTrader();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#050b10',
        color: '#f5fffc',
      }}
    >
      <UtilityBar />
      <TabNav />

      <main
        style={{
          padding: '12px 14px 16px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <section
          style={{
            width: '100%',
            height: 'calc(100vh - 156px)',
            minHeight: 680,
            borderRadius: 10,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,.09)',
            background: '#071015',
            boxShadow: '0 20px 60px rgba(0,0,0,.30)',
            position: 'relative',
          }}
        >
          {traderUrl ? (
            <iframe
              title="Star Traders Manual Trader"
              src={traderUrl}
              allow="clipboard-read; clipboard-write; fullscreen; autoplay"
              style={{
                width: '100%',
                height: '100%',
                border: 0,
                display: 'block',
                background: '#071015',
              }}
            />
          ) : (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'grid',
                placeItems: 'center',
                background:
                  'radial-gradient(circle at 50% 35%, rgba(0,245,160,.09), transparent 32%), #071015',
              }}
            >
              <div style={{ textAlign: 'center', padding: 30 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    margin: '0 auto 18px',
                    borderRadius: '50%',
                    border: '3px solid rgba(255,255,255,.12)',
                    borderTopColor: '#00f5a0',
                    borderRightColor: '#00c6ff',
                    animation: 'st-spin 900ms linear infinite',
                  }}
                />
                <div style={{ fontWeight: 700 }}>
                  {error || 'Connecting your StarTraders account…'}
                </div>
                {!error && (
                  <div style={{ color: '#7f9299', fontSize: 12, marginTop: 7 }}>
                    Preparing the live trading workspace
                  </div>
                )}
              </div>
            </div>
          )}

          <style jsx>{`
            @keyframes st-spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </section>
      </main>
    </div>
  );
}
