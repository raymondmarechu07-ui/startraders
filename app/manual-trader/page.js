'use client';

import { useEffect, useState } from 'react';
import UtilityBar from '@/components/UtilityBar';
import TabNav from '@/components/TabNav';

export default function ManualTraderPage() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/status', {
          cache: 'no-store',
          credentials: 'same-origin',
        });

        if (!response.ok) {
          throw new Error('Your StarTraders session could not be verified.');
        }

        const data = await response.json();
        if (!data?.authenticated) {
          window.location.replace('/api/auth/login');
          return;
        }

        if (!cancelled) setReady(true);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Manual Trader could not connect to your Deriv account.');
        }
      }
    };

    checkSession();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#071015' }}>
      <UtilityBar />
      <TabNav />

      <main style={{ padding: '8px 12px 12px', width: '100%', boxSizing: 'border-box' }}>
        <section
          style={{
            width: '100%',
            height: 'calc(100vh - 132px)',
            minHeight: 620,
            overflow: 'hidden',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,.08)',
            background: '#0b1117',
            position: 'relative',
          }}
        >
          {error ? (
            <div
              style={{
                height: '100%',
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
                padding: 30,
                textAlign: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Manual Trader could not start</div>
                <div style={{ color: '#9aa8b2', fontSize: 13 }}>{error}</div>
              </div>
            </div>
          ) : ready ? (
            <iframe
              title="Star Traders Manual Trader"
              src="/manual-trader-engine/?chart_type=area&interval=1t&symbol=1HZ100V&trade_type=accumulator"
              allow="clipboard-read; clipboard-write; fullscreen; autoplay"
              style={{
                width: '100%',
                height: '100%',
                border: 0,
                display: 'block',
                background: '#0b1117',
              }}
            />
          ) : (
            <div
              style={{
                height: '100%',
                display: 'grid',
                placeItems: 'center',
                color: '#9aa8b2',
                fontSize: 14,
              }}
            >
              Connecting Star Traders to your Deriv account…
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
