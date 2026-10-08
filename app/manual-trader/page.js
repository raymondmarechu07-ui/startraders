'use client';

import TabNav from '@/components/TabNav';
import ManualTraderEmbed from '@/components/ManualTraderEmbed';

export const dynamic = 'force-dynamic';

export default function ManualTraderPage() {
  return (
    <div className="star-dashboard manual-trader-dashboard">
      <TabNav />
      <ManualTraderEmbed />
    </div>
  );
}
