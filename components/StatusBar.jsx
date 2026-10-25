"use client";

import { useEffect, useState } from "react";

/**
 * Footer status bar for StarTraders (Deriv-style).
 *
 * Props:
 *  - connected: boolean. Pass true when your Deriv WebSocket is open.
 *               Hook it to ws.onopen / ws.onclose (or your ping/pong check).
 *  - onToggleTheme: optional function called when the sun icon is clicked.
 */
export default function StatusBar({ connected = true, onToggleTheme }) {
  const [now, setNow] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Live GMT clock, updates every second.
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Keep the fullscreen icon state in sync (Esc key also exits fullscreen).
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  // Format like: 2026-10-25 15:26:52 GMT
  const gmt = now
    ? now.toISOString().replace("T", " ").slice(0, 19) + " GMT"
    : "";

  return (
    <footer className="st-statusbar">
      <div className="st-right">
        <span
          className={`st-dot ${connected ? "on" : "off"}`}
          title={connected ? "Connected" : "Disconnected"}
        />
        <span className="st-clock">{gmt}</span>

        <span className="st-sep" />

        <button className="st-btn" title="Download" aria-label="Download">
          ↓
        </button>

        <button
          className="st-btn"
          title="Toggle theme"
          aria-label="Toggle theme"
          onClick={onToggleTheme}
        >
          ☀
        </button>

        <button className="st-btn st-lang" title="Language">
          🇬🇧 <b>EN</b>
        </button>

        <button
          className="st-btn"
          title="Fullscreen"
          aria-label="Fullscreen"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? "🗗" : "⛶"}
        </button>
      </div>

      <style jsx>{`
        .st-statusbar {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          height: 32px;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          padding: 0 16px;
          background: #0a1426;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          color: #d6dbe6;
          font-size: 13px;
          z-index: 1000;
        }
        .st-right {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .st-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .st-dot.on {
          background: #4bb4b3;
          box-shadow: 0 0 6px #4bb4b3;
        }
        .st-dot.off {
          background: #e5484d;
        }
        .st-clock {
          font-variant-numeric: tabular-nums;
          letter-spacing: 0.2px;
        }
        .st-sep {
          width: 1px;
          height: 16px;
          background: rgba(255, 255, 255, 0.12);
        }
        .st-btn {
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          font-size: 15px;
          padding: 2px 4px;
        }
        .st-btn:hover {
          color: #fff;
        }
        .st-lang {
          font-size: 13px;
        }
      `}</style>
    </footer>
  );
}
