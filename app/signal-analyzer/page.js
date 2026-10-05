'use client';

import { useEffect, useMemo, useState } from 'react';
import UtilityBar from '@/components/UtilityBar';
import TabNav from '@/components/TabNav';
import { useDeriv } from '@/context/DerivProvider';
import { findDerivSymbol, lastDigitFromQuote, formatDerivError } from '@/lib/deriv-market';

const STRATEGIES = ['Matches & Differs', 'Even/Odd', 'Over/Under', 'Rise/Fall'];

function analyseTicks(strategy, ticks) {
  if (ticks.length < 2) return null;

  const latest = ticks[ticks.length - 1];
  const previous = ticks[ticks.length - 2];
  const latestDigit = lastDigitFromQuote(latest.quote);

  if (strategy === 'Rise/Fall') {
    const rise = Number(latest.quote) > Number(previous.quote);
    const wins = ticks.slice(1).filter((tick, i) => Number(tick.quote) > Number(ticks[i].quote)).length;
    return {
      prediction: rise ? 'Rise' : 'Fall',
      confidence: ((Math.max(wins, ticks.length - 1 - wins) / (ticks.length - 1)) * 100).toFixed(1),
    };
  }

  const digits = ticks.map((tick) => lastDigitFromQuote(tick)).filter((d) => d !== null);
  if (!digits.length || latestDigit === null) return null;

  if (strategy === 'Even/Odd') {
    const even = digits.filter((d) => d % 2 === 0).length;
    return {
      prediction: latestDigit % 2 === 0 ? 'Even' : 'Odd',
      confidence: ((Math.max(even, digits.length - even) / digits.length) * 100).toFixed(1),
    };
  }

  if (strategy === 'Over/Under') {
    const over = digits.filter((d) => d > 4).length;
    return {
      prediction: latestDigit > 4 ? 'Over 4' : 'Under 5',
      confidence: ((Math.max(over, digits.length - over) / digits.length) * 100).toFixed(1),
    };
  }

  const matches = digits.filter((d) => d === latestDigit).length;
  return {
    prediction: matches >= digits.length / 10 ? 'Matches ' + latestDigit : 'Differs ' + latestDigit,
    confidence: ((matches / digits.length) * 100).toFixed(1),
  };
}

export default function SignalAnalyzerPage() {
  const { status, getActiveSymbols, subscribeTicks, unsubscribeTicks } = useDeriv();
  const [logs, setLogs] = useState([]);
  const [ticks, setTicks] = useState([]);
  const [strategy, setStrategy] = useState('Matches & Differs');
  const [market, setMarket] = useState('Volatility 100 (1s) Index');
  const [symbol, setSymbol] = useState('1HZ100V');
  const [markets, setMarkets] = useState([]);
  const [analysing, setAnalysing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const active = await getActiveSymbols();
        if (cancelled) return;
        setMarkets(active);
        setSymbol(findDerivSymbol(active, 'Volatility 100 (1s)', '1HZ100V'));
        setLogs((prev) => [...prev, '[SUCCESS] Live Deriv market list loaded']);
      } catch (err) {
        if (!cancelled) setError(formatDerivError(err));
      }
    })();

    return () => { cancelled = true; };
  }, [getActiveSymbols]);

  useEffect(() => {
    setTicks([]);
    setError('');

    if (status !== 'connected' || !symbol) return undefined;

    const onTick = (tick) => {
      setTicks((prev) => [...prev.slice(-199), tick]);
    };

    subscribeTicks(symbol, onTick)
      .then(() => setLogs((prev) => [...prev.slice(-7), '[SUCCESS] Live tick stream established']))
      .catch((err) => setError(formatDerivError(err)));

    return () => unsubscribeTicks();
  }, [status, symbol, subscribeTicks, unsubscribeTicks]);

  const result = useMemo(() => analyseTicks(strategy, ticks), [strategy, ticks]);
  const latest = ticks[ticks.length - 1];

  function runAnalysis() {
    if (ticks.length < 20) {
      setError('Waiting for at least 20 live ticks before analysing.');
      return;
    }
    setAnalysing(true);
    setError('');
    setTimeout(() => setAnalysing(false), 350);
  }

  function handleMarketChange(event) {
    const name = event.target.value;
    setMarket(name);
    const next = findDerivSymbol(markets, name, symbol);
    setSymbol(next);
  }

  return (
    <>
      <UtilityBar />
      <TabNav />
      <main>
        <div className="terminal">
          <div className="terminal-title">SIGNAL ANALYZER · LIVE DERIV DATA</div>
          <div className="log-window">
            {logs.slice(-8).map((line, i) => (
              <div className="line ok" key={i}>{line}</div>
            ))}
            {error && <div className="line err">[ERROR] {error}</div>}
            {!logs.length && <div className="line info">[INFO] Waiting for authenticated market data…</div>}
          </div>

          <div className="select-row">
            <div className="select-box">
              <label>Select strategy</label>
              <select value={strategy} onChange={(e) => setStrategy(e.target.value)}>
                {STRATEGIES.map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>
            <div className="select-box">
              <label>Select market</label>
              <select value={market} onChange={handleMarketChange}>
                <option>Volatility 100 (1s) Index</option>
                {markets.slice(0, 20).map((item) => {
                  const name = item.underlying_symbol_name || item.display_name;
                  return name ? <option key={item.underlying_symbol || item.symbol}>{name}</option> : null;
                })}
              </select>
            </div>
          </div>

          <div className="tick-display">
            <div className="lbl">LATEST LIVE TICK</div>
            <div className="val">{latest ? Number(latest.quote).toFixed(3) : '—'}</div>
            <small>{ticks.length} ticks collected</small>
          </div>

          <button className="analyse-btn" onClick={runAnalysis} disabled={analysing || ticks.length < 20}>
            {analysing ? 'Analysing…' : 'Analyse live stream'}
          </button>

          {result && (
            <div className="result-box visible">
              <div className="row"><span>Strategy</span><span>{strategy}</span></div>
              <div className="row"><span>Market</span><span>{market}</span></div>
              <div className="row"><span>Signal</span><span>{result.prediction}</span></div>
              <div className="row"><span>Observed frequency</span><span>{result.confidence}%</span></div>
              <div className="row"><span>Source</span><span>Live Deriv ticks</span></div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
