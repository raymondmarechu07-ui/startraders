'use client';

import ManualTraderNav from '@/components/ManualTraderNav';
import ManualTraderEmbed from '@/components/ManualTraderEmbed';

export const dynamic = 'force-dynamic';

export default function ManualTraderPage() {
  return (
    <div className="star-dashboard manual-trader-dashboard dbt-manual-trader">
      <ManualTraderNav />
      <ManualTraderEmbed />
    </div>
  );
}
