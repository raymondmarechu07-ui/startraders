'use client';

import { useState } from 'react';

const OFFICIAL_BOT_URL = 'https://bot.deriv.com/';

export default function BotBuilderPage() {
  const [frameFailed, setFrameFailed] = useState(false);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">StarTraders</p>
          <h1 className="mt-1 text-xl font-bold">Official Deriv Bot Builder</h1>
          <p className="mt-1 text-sm text-slate-300">
            The real Deriv visual bot builder — not a simulated strategy editor.
          </p>
        </div>
        <a
          href={OFFICIAL_BOT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-emerald-300"
        >
          Open Deriv Bot directly ↗
        </a>
      </header>

      <section className="p-3 sm:p-5">
        <div className="mb-3 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-100">
          This loads Deriv’s official service. If Deriv blocks embedding in this page, use “Open Deriv Bot directly”; the official builder will open in a new tab.
        </div>
        {!frameFailed ? (
          <iframe
            title="Official Deriv Bot Builder"
            src={OFFICIAL_BOT_URL}
            className="h-[calc(100vh-190px)] min-h-[600px] w-full rounded-xl border border-white/10 bg-white"
            allow="clipboard-read; clipboard-write; fullscreen"
            onError={() => setFrameFailed(true)}
          />
        ) : (
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 rounded-xl border border-white/10 bg-slate-900 p-8 text-center">
            <h2 className="text-lg font-semibold">Open the official builder</h2>
            <p className="max-w-xl text-sm text-slate-300">
              Deriv may prevent its app from loading inside another website. Open the official builder directly to use its real Blockly workspace and trading tools.
            </p>
            <a
              href={OFFICIAL_BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-emerald-400 px-5 py-3 font-bold text-slate-950 hover:bg-emerald-300"
            >
              Launch official Deriv Bot ↗
            </a>
          </div>
        )}
      </section>
    </main>
  );
}
