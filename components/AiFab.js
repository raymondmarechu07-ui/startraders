'use client';

import { useState } from 'react';

export default function AiFab() {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState('scanning'); // scanning | result

  function openModal() {
    setOpen(true);
    setPhase('scanning');
    setTimeout(() => setPhase('result'), 1800);
  }

  function closeModal() {
    setOpen(false);
  }

  function confirmTrade() {
    alert('This is where the trade actually executes once live pricing and Deriv API calls are wired in.');
    closeModal();
  }

  return (
    <>
      <button className="ai-fab" onClick={openModal}>
        <span className="pulse-ring"></span>
        <span className="online-dot"></span>
        <span>AI</span>
      </button>

      {open && (
        <div
          className="ai-modal-backdrop visible"
          onClick={(e) => {
            if (e.target.classList.contains('ai-modal-backdrop')) closeModal();
          }}
        >
          <div className="ai-modal">
            {phase === 'scanning' ? (
              <>
                <div className="spinner-ring"></div>
                <h3>Scanning markets…</h3>
                <p>Checking live price action across your watchlist for a setup that matches your risk settings.</p>
              </>
            ) : (
              <>
                <h3>Signal found</h3>
                <p>Volatility 75 Index looks set up for an upward move based on recent price action.</p>
                <div className="signal-box">
                  <div className="row">
                    <span>Market</span>
                    <span>Volatility 75 Index</span>
                  </div>
                  <div className="row">
                    <span>Direction</span>
                    <span style={{ color: '#5eead4', fontWeight: 700 }}>Rise</span>
                  </div>
                  <div className="row">
                    <span>Suggested stake</span>
                    <span>$10.00</span>
                  </div>
                  <div className="row">
                    <span>Duration</span>
                    <span>5 ticks</span>
                  </div>
                </div>
                <div className="ai-modal-actions">
                  <button className="btn-dismiss" onClick={closeModal}>
                    Dismiss
                  </button>
                  <button className="btn-confirm" onClick={confirmTrade}>
                    Confirm trade
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
