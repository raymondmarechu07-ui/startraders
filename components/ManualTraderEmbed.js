'use client';

import { useEffect, useRef, useState } from 'react';

let engineAssetsPromise = null;

function loadEngineAssets() {
  if (engineAssetsPromise) return engineAssetsPromise;

  engineAssetsPromise = fetch('/manual-trader-engine/index.html', { cache: 'no-store' })
    .then((response) => {
      if (!response.ok) throw new Error(`DTrader engine manifest failed: ${response.status}`);
      return response.text();
    })
    .then((html) => {
      const doc = new DOMParser().parseFromString(html, 'text/html');

      doc.querySelectorAll('link[rel="stylesheet"][href]').forEach((link) => {
        const href = link.getAttribute('href');
        if (!href) return;
        const absolute = new URL(href, window.location.origin).href;
        if (!document.querySelector(`link[data-startraders-dtrader-css="${absolute}"]`)) {
          const style = document.createElement('link');
          style.rel = 'stylesheet';
          style.href = absolute;
          style.dataset.startradersDtraderCss = absolute;
          document.head.appendChild(style);
        }
      });

      const scripts = Array.from(doc.querySelectorAll('script[src]'));
      return scripts.reduce(
        (chain, script) =>
          chain.then(
            () =>
              new Promise((resolve, reject) => {
                const src = new URL(script.getAttribute('src'), window.location.origin).href;
                const existing = document.querySelector(`script[data-startraders-dtrader-src="${src}"]`);

                if (existing) {
                  resolve();
                  return;
                }

                const el = document.createElement('script');
                el.src = src;
                el.async = false;
                el.dataset.startradersDtraderSrc = src;
                el.onload = resolve;
                el.onerror = () => reject(new Error(`DTrader asset failed: ${src}`));
                document.body.appendChild(el);
              })
          ),
        Promise.resolve()
      );
    });

  return engineAssetsPromise;
}

export default function ManualTraderEmbed() {
  const mountRef = useRef(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    window.__STARTRADERS_EMBEDDED__ = true;

    const start = async () => {
      try {
        await loadEngineAssets();

        if (cancelled) return;

        const mount = window.__STARTRADERS_DTRADER_MOUNT__;
        if (typeof mount !== 'function') {
          throw new Error('DTrader embedded mount hook is unavailable.');
        }

        mount();
        setStatus('ready');
      } catch (err) {
        if (!cancelled) {
          console.error('[StarTraders] Manual Trader failed to load:', err);
          setError(err instanceof Error ? err.message : 'Unknown DTrader loading error');
          setStatus('error');
        }
      }
    };

    start();

    return () => {
      cancelled = true;
      if (mountRef.current) mountRef.current.innerHTML = '';
    };
  }, []);

  return (
    <section className="manual-trader-page" aria-label="StarTraders Manual Trader">
      {status === 'loading' && (
        <div className="manual-trader-loading">
          <div className="manual-trader-spinner" />
          <strong>Opening Manual Trader…</strong>
          <span>Loading the live Deriv trading workspace inside StarTraders.</span>
        </div>
      )}

      {status === 'error' && (
        <div className="manual-trader-loading">
          <strong>Manual Trader could not load</strong>
          <span>{error}</span>
          <button type="button" onClick={() => window.location.reload()}>
            Reload Manual Trader
          </button>
        </div>
      )}

      <div
        ref={mountRef}
        id="derivatives_trader"
        className={`manual-trader-workspace ${status === 'ready' ? 'ready' : ''}`}
      />
    </section>
  );
}
