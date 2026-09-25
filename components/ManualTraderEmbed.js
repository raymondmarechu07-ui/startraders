'use client';

import { useState } from 'react';
import { useDeriv } from '@/context/DerivProvider';

export default function ManualTraderEmbed() {
  const { activeAccountId, isLoggedIn } = useDeriv();
  const [loaded, setLoaded] = useState(false);

  const accountKey = activeAccountId || 'not-connected';

  return (
    <section className="manual-trader-page" aria-label="StarTraders Manual Trader">
      <div className="manual-trader-toolbar">
        <div>
          <span className="manual-trader-eyebrow">STARTRADERS</span>
          <h1>Manual Trader</h1>
          <p>Live Deriv trading workspace — connected to your selected {isLoggedIn ? 'account' : 'account after login'}.</p>
        </div>
        <div className={isLoggedIn ? 'manual-trader-connection live' : 'manual-trader-connection'}>
          <span />
          {isLoggedIn ? 'DERIV CONNECTED' : 'LOGIN REQUIRED'}
        </div>
      </div>

      <div className="manual-trader-frame-wrap">
        {!loaded && (
          <div className="manual-trader-loading">
            <div className="manual-trader-spinner" />
            <strong>Opening Manual Trader…</strong>
            <span>Connecting the trading workspace to your StarTraders session.</span>
          </div>
        )}

        <iframe
          key={accountKey}
          title="StarTraders Manual Trader"
          src="/dtrader-engine/index.html?theme=dark&st_embed=1"
          className={loaded ? 'manual-trader-frame ready' : 'manual-trader-frame'}
          onLoad={() => setLoaded(true)}
          allow="fullscreen"
        />
      </div>
    </section>
  );
}
