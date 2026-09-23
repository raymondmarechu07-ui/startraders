'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import UtilityBar from '@/components/UtilityBar';
import TabNav from '@/components/TabNav';

export default function ManualTraderPage() {
  const [assets, setAssets] = useState(null);
  const [error, setError] = useState('');
  const loadedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    fetch('/manual-trader-manifest.json', { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error(`DTrader assets are unavailable (${response.status}).`);
        return response.json();
      })
      .then((manifest) => {
        if (!cancelled) setAssets(manifest);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Manual Trader could not load.');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!assets || loadedRef.current) return;
    loadedRef.current = true;

    document.querySelectorAll('link[data-startraders-dtrader]').forEach((node) => node.remove());

    (assets.styles || []).forEach((href) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.dataset.startradersDtrader = '1';
      document.head.appendChild(link);
    });
  }, [assets]);

  const scripts = assets?.scripts || [];

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
          <style>{`
            #derivatives_trader {
              width: 100%;
              height: 100%;
              min-height: 620px;
            }
            #derivatives_trader .sidebar {
              display: none !important;
            }
            #derivatives_trader .app-shell {
              width: 100%;
              height: 100%;
              min-height: 620px;
            }
            #derivatives_trader .app-shell__main-content {
              width: 100%;
              min-width: 0;
              min-height: 0;
              margin: 0 !important;
            }
          `}</style>

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
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Manual Trader is loading</div>
                <div style={{ color: '#9aa8b2', fontSize: 13 }}>{error}</div>
              </div>
            </div>
          ) : (
            <div id="derivatives_trader" />
          )}
        </section>
      </main>

      {scripts.map((src, index) => (
        <Script
          key={src}
          src={src}
          strategy='afterInteractive'
        />
      ))}
    </div>
  );
}
