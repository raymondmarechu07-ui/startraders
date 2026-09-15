'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function AiFab() {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState('scanning');
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return undefined;

    const timer = setTimeout(() => setPhase('result'), 1800);
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function openModal() {
    setPhase('scanning');
    setOpen(true);
  }

  function confirmTrade() {
    alert('Trade confirmation is ready here. Actual execution must be wired to Deriv proposal/buy APIs before live trading.');
    setOpen(false);
  }

  const modal = open && mounted
    ? createPortal(
        <div
          className="ai-modal-backdrop visible"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div className="ai-modal" role="dialog" aria-modal="true" aria-label="StarTraders AI scanner">
            {phase === 'scanning' ? (
              <>
                <div className="spinner-ring"></div>
                <div className="ai-modal-kicker">STARTRADERS AI</div>
                <h3>Scanning markets…</h3>
                <p>
                  Checking price action across your watchlist for a setup that matches your selected risk settings.
                </p>
              </>
            ) : (
              <>
                <div className="ai-modal-kicker">STARTRADERS AI</div>
                <h3>Signal found</h3>
                <p>
                  Volatility 75 Index shows a possible upward setup based on recent price action.
                </p>

                <div className="signal-box">
                  <div className="row"><span>Market</span><span>Volatility 75 Index</span></div>
                  <div className="row"><span>Direction</span><span className="signal-positive">Rise</span></div>
                  <div className="row"><span>Suggested stake</span><span>$10.00</span></div>
                  <div className="row"><span>Duration</span><span>5 ticks</span></div>
                </div>

                <div className="ai-modal-actions">
                  <button className="btn-dismiss" onClick={() => setOpen(false)}>Dismiss</button>
                  <button className="btn-confirm" onClick={confirmTrade}>Confirm trade</button>
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <button className="ai-fab" type="button" onClick={openModal} aria-label="Open StarTraders AI scanner">
        <span className="pulse-ring"></span>
        <span className="online-dot"></span>
        <span>AI</span>
      </button>

      {modal}
    </>
  );
}
