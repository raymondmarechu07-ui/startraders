'use client';

import { useEffect, useRef, useState } from 'react';

let engineAssetsPromise = null;

function loadEngineAssets() {
  if (engineAssetsPromise) return engineAssetsPromise;

  engineAssetsPromise = fetch('/manual-trader-engine/index.html', {
    cache: 'force-cache',
  })
    .then((response) => {
      if (!response.ok) throw new Error('DTrader engine manifest failed: ' + response.status);
      return response.text();
    })
    .then((html) => {
      const doc = new DOMParser().parseFromString(html, 'text/html');

      const stylesheets = Array.from(
        doc.querySelectorAll('link[rel="stylesheet"][href]')
      );

      stylesheets.forEach((link) => {
        const href = link.getAttribute('href');
        if (!href) return;

        const absolute = new URL(href, window.location.origin).href;
        if (document.querySelector('link[data-startraders-dtrader-css="' + absolute + '"]')) return;

        const style = document.createElement('link');
        style.rel = 'stylesheet';
        style.href = absolute;
        style.dataset.startradersDtraderCss = absolute;
        document.head.appendChild(style);
      });

      const scripts = Array.from(doc.querySelectorAll('script[src]'));

      // Module bundles do not depend on classic-script execution order.
      // Load those in parallel; retain document order for classic scripts.
      const moduleScripts = scripts.filter((script) => script.type === 'module');
      const classicScripts = scripts.filter((script) => script.type !== 'module');

      const loadScript = (script) =>
        new Promise((resolve, reject) => {
          const src = new URL(script.getAttribute('src'), window.location.origin).href;
          const existing = document.querySelector(
            'script[data-startraders-dtrader-src="' + src + '"]'
          );

          if (existing) {
            resolve();
            return;
          }

          const el = document.createElement('script');
          el.src = src;
          el.type = script.type || '';
          el.async = script.type === 'module';
          el.dataset.startradersDtraderSrc = src;
          el.onload = resolve;
          el.onerror = () => reject(new Error('DTrader asset failed: ' + src));
          document.body.appendChild(el);
        });

      return Promise.all(moduleScripts.map(loadScript)).then(() =>
        classicScripts.reduce(
          (chain, script) => chain.then(() => loadScript(script)),
          Promise.resolve()
        )
      );
    });

  return engineAssetsPromise;
}

export function preloadManualTraderEngine() {
  if (typeof window === 'undefined') return;
  loadEngineAssets().catch(() => {});
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

        // The DTrader bootstrap is async: do not remove the StarTraders
        // loading layer until the real DTrader React tree has mounted.
        await Promise.race([
          mount(),
          new Promise((_, reject) =>
            window.setTimeout(
              () => reject(new Error('DTrader workspace timed out while initializing.')),
              45000
            )
          ),
        ]);

        if (cancelled) return;

        const workspace = document.getElementById('derivatives_trader');
        if (!workspace) throw new Error('DTrader workspace container disappeared.');

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
          <strong>STARTRADERS · MANUAL TRADER</strong>
          <span>Connecting to your live Deriv trading workspace…</span>
          <small>Your StarTraders account session is being handed to the trader securely.</small>
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
        className={'manual-trader-workspace ' + (status === 'ready' ? 'ready' : '')}
      />
    </section>
  );
}
