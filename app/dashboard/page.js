'use client';

import { useEffect, useState } from 'react';
import UtilityBar from '@/components/UtilityBar';
import TabNav from '@/components/TabNav';
import AiFab from '@/components/AiFab';
import { useDeriv } from '@/context/DerivProvider';

const MARKETS = [
  { name: 'Crash 500', base: 9021.73 },
  { name: 'Vol 25', base: 1553.29 },
  { name: 'Vol 75', base: 6914.82 },
  { name: 'Vol 100', base: 8342.61 },
  { name: 'Boom 500', base: 12480.41 },
];

const QUICK_ACTIONS = [
  { title: 'Upload Bot', description: 'Import an XML bot from your computer.', icon: 'folder', color: 'orange', action: 'upload' },
  { title: 'Free Bots', description: 'Browse ready-made trading strategies.', icon: 'bot', color: 'green', href: '/free-bots' },
  { title: 'Bot Editor', description: 'Build a custom bot with the visual editor.', icon: 'puzzle', color: 'purple', href: '/bot-builder' },
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
  const { activeAccount } = useDeriv();
  const [markets, setMarkets] = useState(MARKETS.map((m) => ({ ...m, price: m.base, change: Math.random() * 2 - 1 })));
  const [selectedMarket, setSelectedMarket] = useState('Vol 75');
  const [running, setRunning] = useState(false);
  const [riskOpen, setRiskOpen] = useState(false);
  const [adviceIndex, setAdviceIndex] = useState(0);
  const [execSpeed, setExecSpeed] = useState('normal');
  const [clock, setClock] = useState('');

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
    const interval = setInterval(() => {
      setMarkets((current) => current.map((market) => {
        const movement = (Math.random() - 0.5) * market.base * 0.0004;
        return { ...market, price: market.price + movement, change: movement >= 0 ? Math.random() * 1.5 : -Math.random() * 1.5 };
      }));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setAdviceIndex((i) => (i + 1) % TRADING_ADVICE.length), 9000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickAction = (action) => {
    if (action === 'upload') alert('Upload Bot will be connected to the bot upload system when that feature is enabled.');
    if (action === 'strategy') alert('Quick Strategy will be connected to the strategy templates when that feature is enabled.');
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
              <strong className="ticker-price">{market.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              <span className={market.change >= 0 ? 'ticker-change positive' : 'ticker-change negative'}>{market.change >= 0 ? '+' : ''}{market.change.toFixed(2)}%</span>
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
            <div className="hero-status"><span className="status-dot"/> Markets live <span className="status-separator"/> Trading workspace ready</div>
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
            <div><div className="section-eyebrow orange-accent">MARKET OVERVIEW</div><h2>Deriv Markets</h2><p className="section-subtitle">Live synthetic market watchlist</p></div>
            <div className="market-live"><span/> MARKETS LIVE</div>
          </div>
          <div className="market-layout">
            <div className="market-list">
              {markets.map((market) => <button type="button" key={market.name} className={selectedMarket === market.name ? 'market-row selected' : 'market-row'} onClick={() => setSelectedMarket(market.name)}><div className="market-row-name"><strong>{market.name}</strong><span>Synthetic Index</span></div><div className="market-number"><strong>{market.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong><span className={market.change >= 0 ? 'positive' : 'negative'}>{market.change >= 0 ? '+' : ''}{market.change.toFixed(2)}%</span></div></button>)}
            </div>
            <div className="chart-workspace">
              <div className="chart-header"><div><span className="orange-accent">LIVE VIEW</span><h3>{selectedMarket}</h3></div><button type="button" className={running ? 'run-control running' : 'run-control'} onClick={() => setRunning((v) => !v)}><span>{running ? '■' : '▶'}</span>{running ? 'RUNNING' : 'RUN'}</button></div>
              <div className="chart-placeholder"><div className="chart-grid" aria-hidden="true"/><div className="chart-glow-line" aria-hidden="true"/><div className="candles" aria-hidden="true"><span className="candle up"/><span className="candle down"/><span className="candle up"/><span className="candle up"/><span className="candle down"/><span className="candle up"/><span className="candle down"/><span className="candle up"/><span className="candle up"/><span className="candle down"/></div><div className="chart-message">{selectedMarket} trading workspace</div></div>
            </div>
          </div>
        </section>

        {riskOpen && <section id="risk-disclaimer" className="risk-disclaimer-section"><div className="risk-disclaimer-card"><div className="risk-disclaimer-header"><div className="risk-disclaimer-icon"><span>!</span></div><div><div className="risk-label orange-accent">IMPORTANT</div><h2>Risk Disclaimer</h2></div><button type="button" className="risk-close" onClick={() => setRiskOpen(false)}>×</button></div><p className="risk-intro">Trading involves significant risk. Please understand the risks before trading and only use funds you can afford to lose.</p><ul className="risk-list"><li>Trading can result in partial or total loss of funds.</li><li>Past performance does not guarantee future results.</li><li>Leverage can increase both potential gains and losses.</li><li>Trading decisions remain your responsibility.</li></ul></div></section>}
      </main>

      <AiFab />
      <button type="button" className={riskOpen ? 'floating-risk-button open' : 'floating-risk-button'} onClick={() => { setRiskOpen((v) => !v); if (!riskOpen) setTimeout(() => document.getElementById('risk-disclaimer')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50); }} aria-expanded={riskOpen}><span className="floating-risk-symbol">!</span><span>Risk Disclaimer</span></button>

      <div className="bottom-trading-bar">
        <button type="button" className="bottom-run-button" onClick={() => setRunning((v) => !v)}><span>{running ? '■' : '▶'}</span><strong>{running ? 'STOP' : 'RUN'}</strong></button>
        <div className="exec-speed"><span>Execution Speed</span><div className="speed-control"><select value={execSpeed} onChange={(e) => setExecSpeed(e.target.value)}><option value="normal">NORMAL SPEED</option><option value="fast">FAST</option><option value="turbo">TURBO</option></select><span className="speed-dot"/></div></div>
        <span className="workspace-label">StarTraders trading workspace</span>
        <span className="live-clock">{clock}</span>
      </div>
    </div>
  );
}
