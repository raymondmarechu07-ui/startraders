'use client';

import { useEffect, useState } from 'react';
import UtilityBar from '@/components/UtilityBar';
import TabNav from '@/components/TabNav';

const DTRADER_URL = 'https://startraders-dtrader.pages.dev';

export default function ManualTraderPage() {
  const [redirecting, setRedirecting] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.location.assign(DTRADER_URL);
    }, 900);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at 20% 10%, rgba(0,245,160,.12), transparent 30%), radial-gradient(circle at 85% 20%, rgba(0,198,255,.10), transparent 30%), #050b10',
        color: '#f5fffc',
      }}
    >
      <UtilityBar />
      <TabNav />

      <main
        style={{
          minHeight: 'calc(100vh - 120px)',
          display: 'grid',
          placeItems: 'center',
          padding: '40px 20px',
        }}
      >
        <section
          style={{
            width: 'min(620px, 100%)',
            textAlign: 'center',
            padding: '46px 32px',
            borderRadius: 24,
            border: '1px solid rgba(0,245,160,.18)',
            background: 'rgba(7,18,24,.78)',
            boxShadow: '0 24px 80px rgba(0,0,0,.38)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div
            style={{
              width: 76,
              height: 76,
              margin: '0 auto 22px',
              display: 'grid',
              placeItems: 'center',
              borderRadius: 22,
              background: 'linear-gradient(135deg,#00f5a0,#00c6ff)',
              color: '#03110d',
              fontSize: 25,
              fontWeight: 900,
              letterSpacing: -1,
              boxShadow: '0 0 34px rgba(0,245,160,.24)',
            }}
          >
            ST
          </div>

          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 2.4,
              textTransform: 'uppercase',
              color: '#00e6a0',
              marginBottom: 10,
            }}
          >
            Star Traders
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(26px, 5vw, 38px)',
              lineHeight: 1.1,
            }}
          >
            Manual Trader
          </h1>

          <p
            style={{
              margin: '16px auto 28px',
              maxWidth: 480,
              color: '#9fb2b9',
              lineHeight: 1.7,
            }}
          >
            Opening the StarTraders live trading workspace with real-time
            Deriv charts, markets, contracts and account trading.
          </p>

          <div
            style={{
              width: 34,
              height: 34,
              margin: '0 auto 18px',
              borderRadius: '50%',
              border: '3px solid rgba(255,255,255,.12)',
              borderTopColor: '#00f5a0',
              borderRightColor: '#00c6ff',
              animation: 'st-spin 900ms linear infinite',
            }}
          />

          <div style={{ color: '#c7d6da', fontSize: 13 }}>
            {redirecting ? 'Opening Manual Trader…' : 'Ready'}
          </div>

          <a
            href={DTRADER_URL}
            style={{
              display: 'inline-block',
              marginTop: 24,
              padding: '11px 18px',
              borderRadius: 12,
              color: '#03110d',
              background: 'linear-gradient(135deg,#00f5a0,#00c6ff)',
              fontWeight: 800,
              textDecoration: 'none',
            }}
          >
            Open Manual Trader
          </a>

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
