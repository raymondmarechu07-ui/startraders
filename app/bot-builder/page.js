'use client';

import UtilityBar from '@/components/UtilityBar';
import TabNav from '@/components/TabNav';
import { useDeriv } from '@/context/DerivProvider';

export default function BotBuilderPage() {
  const { status, activeAccount } = useDeriv();
  return (
    <>
      <UtilityBar />
      <TabNav />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
        <h1>Bot Builder</h1>
        <p>Open the official Deriv Bot engine to build strategies with native Blockly blocks and import or export XML strategy files.</p>
        <p>StarTraders connection: <strong>{status === 'connected' ? 'Connected' : 'Not connected'}</strong>{activeAccount ? ' · ' + activeAccount.account_id : ''}</p>
        <p><strong>Account sessions are separate:</strong> sign in to Deriv Bot and select your intended demo or real account there. StarTraders does not pass account credentials to the Bot app.</p>
        <p><a href="https://bot.deriv.com/" target="_blank" rel="noreferrer">Open official Deriv Bot ↗</a></p>
        <p>Use demo first and verify the selected account before starting a strategy. Automated trading can lose money.</p>
      </main>
    </>
  );
}
