'use client';

import { usePathname, useRouter } from 'next/navigation';
import UtilityBar from '@/components/UtilityBar';

const ITEMS = [
  { label: 'Speedbot', href: '/speedbot', icon: 'M13 2 4 14h7l-1 8 9-12h-7z' },
  { label: 'AI Software', href: '/signal-analyzer', icon: 'M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z' },
  { label: 'Auto Trader', href: null, icon: 'M4 8h16v12H4zM9 8V5a3 3 0 016 0v3' },
  { label: 'Analysis Tool', href: '/analysis-tool', icon: 'M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-4.35-4.35' },
  { label: 'Manual Trader', href: '/manual-trader', icon: 'M3 4h18v14H3zM8 21h8M12 18v3' },
  { label: 'Bulk Trader', href: null, icon: 'M4 5h16v4H4zM4 11h16v4H4zM4 17h10v3H4z' },
  { label: 'Charts', href: null, icon: 'M3 3v18h18M7 14l4-4 4 3 6-8' },
  { label: 'Copy Trader', href: null, icon: 'M8 8h12v12H8zM4 16H3V3h13v1' },
  { label: 'Risk Calculator', href: '/risk-calculator', icon: 'M12 2l8 4v6c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6zM9 12l2 2 4-4' },
];

export default function ManualTraderNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="dbt-shell">
      <UtilityBar />
      <nav className="dbt-nav" aria-label="Trading tools">
        <div className="dbt-nav-track">
          {ITEMS.map((item) => {
            const active = item.href === pathname;
            return (
              <button
                key={item.label}
                type="button"
                className={'dbt-nav-item' + (active ? ' active' : '') + (!item.href ? ' unavailable' : '')}
                aria-current={active ? 'page' : undefined}
                aria-disabled={!item.href || undefined}
                title={!item.href ? item.label + ' is not connected yet' : item.label}
                onClick={() => item.href && router.push(item.href)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={item.icon} />
                </svg>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
