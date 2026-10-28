'use client';

import { useEffect, useState } from 'react';
import UtilityBar from '@/components/UtilityBar';
import TabNav from '@/components/TabNav';
import AiFab from '@/components/AiFab';
import { useDeriv } from '@/context/DerivProvider';

const MARKETS = [
  { name: 'Volatility 10', symbol: 'R_10', price: null },
  { name: 'Volatility 25', symbol: 'R_25', price: null },
  { name: 'Volatility 50', symbol: 'R_50', price: null },
  { name: 'Volatility 75', symbol: 'R_75', price: null },
  { name: 'Volatility 100', symbol: 'R_100', price: null },
];

const QUICK_ACTIONS = [
  { title: 'Manual Trader', description: 'Open the live StarTraders trading workspace.', icon: 'chart', color: 'green', href: '/manual-trader' },
  { title: 'Upload Bot', description: 'Import an XML bot from your computer.', icon: 'folder', color: 'orange', action: 'upload' },
  { title: 'Free Bots', description: 'Browse ready-made trading strategies.', icon: 'bot', color: 'green', href: '/free-bots' },
  { title: 'DBot Engine', description: 'Open the full Deriv DBot visual strategy builder.', icon: 'puzzle', color: 'purple', href: '/bot-builder/engine' },
  { title: 'Quick Strategy', description: 'Start fast with a pre-built strategy template.', icon: 'bolt', color: 'yellow', action: 'strategy' },
];

const TRADING_ADVICE = [
  'The trend is your friend — until it ends.',
  'Discipline beats intelligence in the long run. Protect your capital first.',
  'Risk management is what separates traders from gamblers.',
  'A missed trade costs nothing. A bad trade can cost everything.',
  'Trade the plan you built when you were calm, not the one emotion writes.',
];

function QuickIcon({ type }) {
  const paths = {
    chart: <><path d="M4 19V5"/><path d="M4 19h16"/><path d="M7 15l4-5 3 3 5-7"/></>,
    folder: <><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z"/><path d="M3 9h18"/></>,
    bot: <><rect x="5" y="7" width="14" height="12" rx="3"/><path d="M9 7V5a3 3 0 0 1 6 0v2M9 13h.01M15 13h.01M9 16h6"/></>,
    puzzle: <path d="M9 4a2 2 0 1 1 4 0v2h2a2 2 0 1 1 0 4h-2v3h3a2 2 0 1 1 4 0v3h-3a2 2 0 1 1-4 0v-3H9a2 2 0 1 1 0-4h2V6H9z"/>,
    bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[type]}</svg>;
}

function ArrowIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
}

export default function DashboardPage() {
  const { activeAccount, balance, status, getProfitHistory, getPortfolio, getCandles, subscribeTicks, unsubscribeTicks, getActiveSymbols } = useDeriv();
  const [markets, setMarkets] = useState(MARKETS);
  const [selectedMarket, setSelectedMarket] = useState('Volatility 75');
  const [marketFeedStatus, setMarketFeedStatus] = useState('Waiting for Deriv connection');
  const [candles, setCandles] = useState([]);
  const [candleStatus, setCandleStatus] = useState('Waiting for Deriv connection');
  const [riskOpen, setRiskOpen] = useState(false);
  const [adviceIndex, setAdviceIndex] = useState(0);
  const [execSpeed, setExecSpeed] = useState('normal');
  const [clock, setClock] = useState('');
  const [tradeStats, setTradeStats] = useState({ closed: 0, open: 0 });

  const accountId = activeAccount?.account_id || activeAccount?.loginid || 'Trader';
  const accountType = activeAccount?.account_type === 'real' ? 'Real' : 'Demo';

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(`${now.toISOString().slice(0, 19).replace('T', ' ')} GMT`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (status !== 'connected') {
      setMarketFeedStatus('Waiting for Deriv connection');
      return undefined;
    }

    let cancelled = false;
    const market = MARKETS.find((item) => item.name === selectedMarket) || MARKETS[3];
    setMarketFeedStatus(`Connecting to ${market.symbol}`);

    (async () => {
      try {
        const activeSymbols = await getActiveSymbols();
        if (cancelled) return;
        if (!activeSymbols.some((item) => item.symbol === market.symbol)) {
          setMarketFeedStatus(`${market.symbol} is not currently available from Deriv`);
          return;
        }
        await subscribeTicks(market.symbol, (tick) => {
          if (cancelled || !Number.isFinite(Number(tick?.quote))) return;
          setMarkets((current) => current.map((item) => item.symbol === market.symbol
            ? { ...item, price: Number(tick.quote), epoch: tick.epoch }
            : item));
          setMarketFeedStatus(`Live feed · ${market.symbol}`);
        });
        if (!cancelled) setMarketFeedStatus(`Live feed · ${market.symbol}`);
      } catch (error) {
        if (!cancelled) setMarketFeedStatus(error?.message || 'Deriv market feed unavailable');
      }
    })();

    return () => {
      cancelled = true;
      unsubscribeTicks();
    };
  }, [status, selectedMarket, getActiveSymbols, subscribeTicks, unsubscribeTicks]);

  useEffect(() => {
    if (status !== 'connected') {
      setCandles([]);
      setCandleStatus('Connect Deriv to load real candle history');
      return undefined;
    }
    let cancelled = false;
    const market = MARKETS.find((item) => item.name === selectedMarket) || MARKETS[3];
    setCandleStatus('Loading historical candles…');
    setCandles([]);
    getCandles({ symbol: market.symbol, granularity: 60, count: 60 })
      .then((history) => {
        if (cancelled) return;
        setCandles(history);
        setCandleStatus(history.length ? 'Historical candles · Deriv' : 'No candle history returned by Deriv');
      })
      .catch((error) => {
        if (!cancelled) setCandleStatus(error?.message || 'Unable to load candle history');
      });
    return () => { cancelled = true; };
  }, [status, selectedMarket, getCandles]);

  useEffect(() => {
    const interval = setInterval(() => setAdviceIndex((i) => (i + 1) % TRADING_ADVICE.length), 9000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (status !== 'connected') return undefined;

    let cancelled = false;

    const refreshTradeStats = async () => {
      try {
        const [history, portfolio] = await Promise.all([
          getProfitHistory({ limit: 1, offset: 0, sort: 'DESC' }),
          getPortfolio(),
        ]);

        if (cancelled) return;

        const closed = Number(history?.count ?? history?.transactions?.length ?? 0);
        const open = Array.isArray(portfolio?.contracts) ? portfolio.contracts.length : 0;
        setTradeStats({ closed: Number.isFinite(closed) ? closed : 0, open });
      } catch {
        if (!cancelled) setTradeStats({ closed: 0, open: 0 });
      }
    };

    refreshTradeStats();
    const interval = setInterval(refreshTradeStats, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [status, getProfitHistory, getPortfolio]);

  const openDbotEngine = () => {
    // The main StarTraders OAuth session and the DBot build use the same
    // registered Deriv client ID. Require an authenticated session before
    // opening the full strategy engine; never fake a running state here.
    if (status !== 'connected' || !activeAccount) {
      window.location.assign('/api/auth/login');
      return;
    }
    window.location.assign('/bot-builder/engine');
  };

  const handleQuickAction = (action) => {
    if (action === 'upload') {
      window.location.assign('/bot-builder/engine');
    }
    if (action === 'strategy') {
      window.location.assign('/bot-builder/engine');
    }
  };

  return (
    <div className="star-dashboard">
      <div className="dashboard-atmosphere" aria-hidden="true"><span className="glow-orb orb-one"/><span className="glow-orb orb-two"/><span className="market-wave wave-one"/><span className="market-wave wave-two"/><span className="market-grid"/></div>

      <UtilityBar />
      <TabNav />

      <div className="market-ticker">
        <div className="market-ticker-track">
          {Array.from({ length: 5 }).flatMap(() => markets).map((market, index) => (
            <div className="market-ticker-item" key={`${market.name}-${index}`}>
              <span className="ticker-live-dot" />
              <span className="ticker-name">{market.name}</span>
              <strong className="ticker-price">{typeof market.price !== 'number' ? '—' : market.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</strong>
              <span className="ticker-change">{typeof market.price !== 'number' ? 'Awaiting tick' : 'Deriv tick'}</span>
            </div>
          ))}
        </div>
      </div>

      <main className="dashboard-content">
        <section className="dashboard-hero">
          <div className="hero-chart-art" aria-hidden="true">
            <div className="hero-candle hero-candle-1"/><div className="hero-candle hero-candle-2"/><div className="hero-candle hero-candle-3"/><div className="hero-candle hero-candle-4"/><div className="hero-candle hero-candle-5"/><div className="hero-candle hero-candle-6"/><div className="hero-candle hero-candle-7"/>
          </div>
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-content">
            <div className="eyebrow orange-accent">STARTRADERS • {accountType.toUpperCase()} ACCOUNT</div>
            <h1><span className="hello-accent">Hello,</span> {accountId}<span className="hello-wave">👋</span></h1>
            <p className="hero-quote" key={adviceIndex}>“{TRADING_ADVICE[adviceIndex]}”</p>
            <div className="hero-status"><span className="status-dot"/> {status === 'connected' ? 'Deriv connected' : 'Deriv not connected'} <span className="status-separator"/> {marketFeedStatus}</div>
          </div>
        </section>

        <section className="live-account-section">
          <div className="live-account-heading">
            <div>
              <div className="section-eyebrow orange-accent">LIVE ACCOUNT</div>
              <h2>Account Overview</h2>
              <p className="section-subtitle">Your StarTraders dashboard stays synced with the connected Deriv account.</p>
            </div>
            <div className="account-sync-pill"><span className="account-sync-dot" /> {status === 'connected' ? 'LIVE SYNC' : status.toUpperCase()}</div>
          </div>
          <div className="live-account-grid">
            <div className="live-account-card balance-card">
              <span className="live-card-label">CURRENT BALANCE</span>
              <strong>{balance ? Number(balance.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—.—'}</strong>
              <small>{balance?.currency || activeAccount?.currency || 'USD'}</small>
            </div>
            <div className="live-account-card">
              <span className="live-card-label">ACCOUNT</span>
              <strong>{accountType}</strong>
              <small>{activeAccount?.account_id || 'Not connected'}</small>
            </div>
            <div className="live-account-card">
              <span className="live-card-label">CLOSED TRADES</span>
              <strong>{tradeStats.closed.toLocaleString()}</strong>
              <small>Recorded in Deriv history</small>
            </div>
            <div className="live-account-card">
              <span className="live-card-label">OPEN TRADES</span>
              <strong>{tradeStats.open.toLocaleString()}</strong>
              <small>Currently active</small>
            </div>
          </div>
        </section>

        <section className="quick-actions-section">
          <div className="quick-section-heading"><span/><div className="orange-accent">QUICK ACTIONS</div><span/></div>
          <div className="quick-actions-grid">
            {QUICK_ACTIONS.map((action) => {
              const content = <><div className={`quick-icon ${action.color}`}><QuickIcon type={action.icon}/></div><div className="quick-arrow"><ArrowIcon/></div><h3>{action.title}</h3><p>{action.description}</p><div className="quick-divider"/><span className="quick-open">Open <ArrowIcon/></span></>;
              if (action.href) return <a href={action.href} className={`quick-card ${action.color}`} key={action.title}>{content}</a>;
              return <button type="button" className={`quick-card ${action.color}`} key={action.title} onClick={() => handleQuickAction(action.action)}>{content}</button>;
            })}
          </div>
        </section>

        <section className="market-overview">
          <div className="section-heading-row">
            <div><div className="section-eyebrow orange-accent">MARKET OVERVIEW</div><h2>Deriv Markets</h2><p className="section-subtitle">Prices are shown only after a real Deriv tick arrives.</p></div>
            <div className="market-live"><span/> {status === 'connected' ? 'DERIV CONNECTED' : 'NOT CONNECTED'}</div>
          </div>
          <div className="market-layout">
            <div className="market-list">
              {markets.map((market) => <button type="button" key={market.name} className={selectedMarket === market.name ? 'market-row selected' : 'market-row'} onClick={() => setSelectedMarket(market.name)}><div className="market-row-name"><strong>{market.name}</strong><span>{market.symbol} · Synthetic Index</span></div><div className="market-number"><strong>{typeof market.price !== 'number' ? '—' : market.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</strong><span>{typeof market.price !== 'number' ? 'No tick yet' : 'Live tick'}</span></div></button>)}
            </div>
            <div className="chart-workspace">
              <div className="chart-header"><div><span className="orange-accent">DERIV MARKET FEED</span><h3>{selectedMarket}</h3></div><span className="market-feed-label">{marketFeedStatus}</span></div>
              <div className="chart-placeholder"><div className="chart-grid" aria-hidden="true"/>{candles.length > 1 ? <svg className="real-candle-chart" viewBox="0 0 720 280" role="img" aria-label={`Real Deriv one-minute candlestick chart for ${selectedMarket}`} preserveAspectRatio="none">{(() => { const lows = candles.map((c) => Number(c.low)); const highs = candles.map((c) => Number(c.high)); const min = Math.min(...lows); const max = Math.max(...highs); const range = max - min || 1; const step = 720 / candles.length; const y = (price) => 260 - ((Number(price) - min) / range) * 240; return candles.map((c, i) => { const openY = y(c.open); const closeY = y(c.close); const highY = y(c.high); const lowY = y(c.low); const up = Number(c.close) >= Number(c.open); const x = i * step + step / 2; return <g key={c.epoch || i} className={up ? 'candle-up' : 'candle-down'}><line x1={x} x2={x} y1={highY} y2={lowY} stroke="currentColor" strokeWidth="1.2"/><rect x={x - Math.max(1.5, step * .28)} y={Math.min(openY, closeY)} width={Math.max(3, step * .56)} height={Math.max(1.5, Math.abs(closeY - openY))} fill="currentColor" rx=".5"/></g>; }); })()}</svg> : <div className="chart-message">{candleStatus}</div>}<p className="chart-feed-note">{candles.length ? `Showing ${candles.length} real one-minute candles received from Deriv · latest quote updates above` : candleStatus}</p></div>
            </div>
          </div>
        </section>

        {riskOpen && <section id="risk-disclaimer" className="risk-disclaimer-section"><div className="risk-disclaimer-card"><div className="risk-disclaimer-header"><div className="risk-disclaimer-icon"><span>!</span></div><div><div className="risk-label orange-accent">IMPORTANT</div><h2>Risk Disclaimer</h2></div><button type="button" className="risk-close" onClick={() => setRiskOpen(false)}>×</button></div><p className="risk-intro">Trading involves significant risk. Please understand the risks before trading and only use funds you can afford to lose.</p><ul className="risk-list"><li>Trading can result in partial or total loss of funds.</li><li>Past performance does not guarantee future results.</li><li>Leverage can increase both potential gains and losses.</li><li>Trading decisions remain your responsibility.</li></ul></div></section>}
      </main>

      <AiFab />
      <button type="button" className={riskOpen ? 'floating-risk-button open' : 'floating-risk-button'} onClick={() => { setRiskOpen((v) => !v); if (!riskOpen) setTimeout(() => document.getElementById('risk-disclaimer')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50); }} aria-expanded={riskOpen}><span className="floating-risk-symbol">!</span><span>Risk Disclaimer</span></button>

      <div className="bottom-trading-bar">
        <button type="button" className="bottom-run-button" onClick={openDbotEngine} title="Open the full DBot strategy engine"><span>▶</span><strong>OPEN DBOT</strong></button>
        <div className="exec-speed"><span>Execution Speed</span><div className="speed-control"><select value={execSpeed} onChange={(e) => setExecSpeed(e.target.value)}><option value="normal">NORMAL SPEED</option><option value="fast">FAST</option><option value="turbo">TURBO</option></select><span className="speed-dot"/></div></div>
        <span className="workspace-label">{status === 'connected' && activeAccount ? `Deriv ${accountType} · ${accountId} · DBot ready` : 'Connect Deriv to launch DBot'}</span>
        <span className="live-clock">{clock}</span>
      </div>
    </div>
  );
}
