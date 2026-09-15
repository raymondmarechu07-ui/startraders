'use client';

import { useMemo, useState } from 'react';
import UtilityBar from '@/components/UtilityBar';
import TabNav from '@/components/TabNav';

const KEYS = ['7', '8', '9', '4', '5', '6', '1', '2', '3', 'C', '0', '⌫'];

export default function RiskCalculatorPage() {
  const [digits, setDigits] = useState('30');
  const [multiplier, setMultiplier] = useState(2);
  const [maxLosses, setMaxLosses] = useState(3);

  const baseStake = Number(digits) || 0;

  const { sequence, requiredCapital, stopLoss, takeProfit } = useMemo(() => {
    const seq = [];
    for (let i = 0; i <= maxLosses; i += 1) {
      seq.push(baseStake * Math.pow(multiplier, i));
    }
    const total = seq.reduce((sum, v) => sum + v, 0);
    return {
      sequence: seq,
      requiredCapital: total,
      stopLoss: total,
      takeProfit: baseStake,
    };
  }, [baseStake, multiplier, maxLosses]);

  function pressKey(key) {
    if (key === 'C') {
      setDigits('0');
      return;
    }
    if (key === '⌫') {
      setDigits((d) => (d.length > 1 ? d.slice(0, -1) : '0'));
      return;
    }
    setDigits((d) => (d === '0' ? key : d.length < 8 ? d + key : d));
  }

  function money(n) {
    return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return (
    <div className="star-dashboard">
      <UtilityBar />
      <TabNav />

      <main className="dashboard-content">
        <div className="rc-card">
          <div className="rc-header">
            <div>
              <h1>Risk Management Calculator</h1>
              <p>Calculate optimal stakes and manage risk effectively</p>
            </div>
            <div className="rc-header-icon">▦</div>
          </div>

          <div className="rc-display">
            <span>$</span>
            <strong>{digits}</strong>
          </div>

          <div className="rc-keypad">
            {KEYS.map((key) => (
              <button
                key={key}
                type="button"
                className={
                  key === 'C' ? 'rc-key rc-key-clear' : key === '⌫' ? 'rc-key rc-key-back' : 'rc-key'
                }
                onClick={() => pressKey(key)}
              >
                {key}
              </button>
            ))}
          </div>

          <div className="rc-settings">
            <label>
              Martingale multiplier
              <div className="rc-stepper">
                <button type="button" onClick={() => setMultiplier((m) => Math.max(1.1, +(m - 0.1).toFixed(1)))}>−</button>
                <span>x{multiplier.toFixed(1)}</span>
                <button type="button" onClick={() => setMultiplier((m) => +(m + 0.1).toFixed(1))}>+</button>
              </div>
            </label>
            <label>
              Max consecutive losses
              <div className="rc-stepper">
                <button type="button" onClick={() => setMaxLosses((l) => Math.max(1, l - 1))}>−</button>
                <span>{maxLosses}</span>
                <button type="button" onClick={() => setMaxLosses((l) => Math.min(8, l + 1))}>+</button>
              </div>
            </label>
          </div>

          <div className="rc-results">
            <div className="rc-row">
              <span>Stake</span>
              <strong>{money(baseStake)}</strong>
            </div>
            <div className="rc-row">
              <span>Martingale size</span>
              <strong>x{multiplier.toFixed(1)}</strong>
            </div>
            <div className="rc-row">
              <span>Take profit</span>
              <strong className="positive">{money(takeProfit)}</strong>
            </div>
            <div className="rc-row">
              <span>Stop loss</span>
              <strong className="negative">{money(stopLoss)}</strong>
            </div>
            <div className="rc-row">
              <span>Consecutive losses</span>
              <strong>{maxLosses}</strong>
            </div>
            <div className="rc-row rc-sequence-row">
              <span>Stake sequence</span>
              <div className="rc-sequence">
                {sequence.map((s, i) => (
                  <span key={i}>{money(s)}</span>
                ))}
              </div>
            </div>
            <div className="rc-row">
              <span>Required capital</span>
              <strong>{money(requiredCapital)}</strong>
            </div>
          </div>

          <p className="rc-note">
            This calculator uses a standard martingale model: each stake in the sequence
            is the previous stake × your multiplier, up to your chosen number of
            consecutive losses. Required capital is the sum of the full sequence — the
            most you could lose if every trade in the run lost. Take profit is set to one
            base stake, since a martingale cycle recovers all prior losses plus one stake
            of profit when it eventually wins.
          </p>
        </div>
      </main>
    </div>
  );
}
