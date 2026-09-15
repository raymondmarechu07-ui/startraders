'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const TABS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'M3 12l9-9 9 9M5 10v10h14V10' },
  { label: 'Bot Builder', href: '/bot-builder', icon: 'M4 8h16v12H4zM9 8V5a3 3 0 016 0v3M9 14a1 1 0 100 2 1 1 0 000-2zM15 14a1 1 0 100 2 1 1 0 000-2z' },
  { label: 'Free Bots', href: '/free-bots', icon: 'M12 2l3 5.5L21 9l-4.5 4L18 20l-6-3.5L6 20l1.5-7L3 9l6-1.5z' },
  { label: 'Signals', href: null, icon: 'M22 12h-4l-3 9L9 3l-3 9H2' },
  { label: 'Speedbot', href: '/speedbot', icon: 'M13 2L4 14h7l-1 8 9-12h-7l1-8z' },
  { label: 'AI Software', href: '/signal-analyzer', icon: 'M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5zM19 14l.7 2.1L22 17l-2.3.9L19 20l-.7-2.1L16 17l2.3-.9z' },
  { label: 'Risk Calculator', href: '/risk-calculator', icon: 'M12 2l8 4v6c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-4zM9 12l2 2 4-4' },
  { label: 'Trade Academy', href: '/trade-academy', icon: 'M22 10L12 5 2 10l10 5 10-5zM6 12v5c0 1 3 3 6 3s6-2 6-3v-5' },
  { label: 'Manual Trader', href: '/manual-trader', icon: 'M3 4h18v14H3zM8 21h8M12 18v3' },
  { label: 'Analysis Tool', href: '/analysis-tool', icon: 'M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-4.35-4.35' },
  { label: 'Copy Trader', href: null, icon: 'M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3' },
  { label: 'Bulk Trader', href: null, icon: 'M20 12V8H6a2 2 0 010-4h12v4M4 6v12a2 2 0 002 2h14v-4M18 12a2 2 0 100 4 2 2 0 000-4z' },
];

const STORAGE_KEY = 'startraders_tab_prefs';

function loadPrefs() {
  if (typeof window === 'undefined') return TABS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return TABS;
    const saved = JSON.parse(raw);
    const byLabel = new Map(TABS.map((t) => [t.label, t]));
    const ordered = saved.map((s) => { const base = byLabel.get(s.label); if (!base) return null; byLabel.delete(s.label); return { ...base, hidden: !!s.hidden }; }).filter(Boolean);
    return [...ordered, ...Array.from(byLabel.values())];
  } catch { return TABS; }
}

export default function TabNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [tabs, setTabs] = useState(TABS);
  const [arrangeOpen, setArrangeOpen] = useState(false);
  const [draftTabs, setDraftTabs] = useState(TABS);
  const [dragIndex, setDragIndex] = useState(null);

  useEffect(() => setTabs(loadPrefs()), []);

  function handleDrop(index) {
    if (dragIndex === null || dragIndex === index) return;
    setDraftTabs((current) => { const copy = [...current]; const [moved] = copy.splice(dragIndex, 1); copy.splice(index, 0, moved); return copy; });
    setDragIndex(null);
  }
  function toggleHidden(index) { setDraftTabs((current) => current.map((t, i) => i === index ? { ...t, hidden: !t.hidden } : t)); }
  function handleSave() {
    setTabs(draftTabs); setArrangeOpen(false);
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draftTabs.map((t) => ({ label: t.label, hidden: !!t.hidden })))); } catch {}
  }
  function handleReset() { setDraftTabs(TABS.map((t) => ({ ...t }))); }

  return (
    <div className="tab-nav-shell">
      <div className="tab-nav">
        <button className="tab-icon-only" onClick={() => { setDraftTabs(tabs.map((t) => ({ ...t }))); setArrangeOpen(true); }} aria-label="Arrange navigation">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h6M4 18h4M14 6h6M17 18h3M8 3v6M8 15v6M17 3v9M20 18v3" /></svg>
        </button>
        {tabs.filter((tab) => !tab.hidden).map((tab) => {
          const isActive = tab.href === pathname;
          return (
            <button key={tab.label} type="button" className={isActive ? 'tab-item active' : 'tab-item'} onClick={() => { if (isActive) return; if (tab.href) router.push(tab.href); else alert(`${tab.label} — not built yet, coming up next in the plan.`); }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={tab.icon} /></svg>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {arrangeOpen && (
        <div className="arrange-modal-backdrop" onClick={() => setArrangeOpen(false)}>
          <div className="arrange-modal" onClick={(e) => e.stopPropagation()}>
            <div className="arrange-modal-header"><div><h3>Arrange navigation tabs</h3><p>Drag tabs or hide the ones you do not use.</p></div><button className="arrange-modal-close" onClick={() => setArrangeOpen(false)}>×</button></div>
            <div className="arrange-modal-list">
              {draftTabs.map((tab, index) => (
                <div key={tab.label} className="arrange-row" draggable onDragStart={() => setDragIndex(index)} onDragOver={(e) => e.preventDefault()} onDrop={() => handleDrop(index)}>
                  <span className="arrange-handle">⠿</span><span className="arrange-label">{tab.label}</span>
                  {tab.label !== 'Dashboard' && <button className={tab.hidden ? 'arrange-eye off' : 'arrange-eye'} onClick={() => toggleHidden(index)}>{tab.hidden ? '◉' : '◌'}</button>}
                </div>
              ))}
            </div>
            <div className="arrange-modal-footer"><button className="arrange-reset" onClick={handleReset}>↺ Reset</button><div className="arrange-modal-actions"><button className="arrange-cancel" onClick={() => setArrangeOpen(false)}>Cancel</button><button className="arrange-save" onClick={handleSave}>Save arrangement</button></div></div>
          </div>
        </div>
      )}
    </div>
  );
}
