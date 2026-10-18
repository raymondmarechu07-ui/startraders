# DBot integration notes

## Non-negotiable constraints

- Keep the existing StarTraders Deriv OAuth routes, callback handling, token/session exchange, and `context/DerivProvider.js` intact.
- Keep `components/ManualTraderEmbed.js` and the existing DTrader build/CSP configuration intact.
- A bot may only place orders after the user explicitly starts it and confirms the currently selected account and stake.
- Stop must prevent new entries immediately while allowing already-purchased contracts to settle.
- Account changes or WebSocket disconnects must stop new entries. Never silently continue on a previously selected account.
- Test with a Deriv demo account before any real-account testing. No strategy can guarantee profits.

## Integration approach

Use Deriv's official `deriv-com/trading-bot-template` as the source reference for the Blockly editor, Deriv-specific blocks, strategy interpreter, and workspace serialization. Do not substitute a generic Blockly demo or a hosted DBot iframe: neither is the genuine engine running through the StarTraders-selected account.

The official template is a separate React/TypeScript application with its own store, router, API/session lifecycle, and sizeable dependency tree. It cannot safely be copied into the Next.js App Router as a single page. The integration must isolate the editor/runtime behind a client-only boundary and adapt its trade execution to the existing StarTraders account session, rather than initialize a second OAuth flow.

## Acceptance checklist

- [ ] Official Blockly workspace and Deriv-specific blocks render inside StarTraders navy/cyan layout.
- [ ] Workspace can load, save, and restore a strategy.
- [ ] Trade execution uses the currently selected `activeAccount` through the existing session; no second login or hard-coded token.
- [ ] Real/demo account type and currency are visible in the run confirmation.
- [ ] Start requires explicit confirmation; stake, trade count, and supported contract parameters are validated.
- [ ] Stop prevents new contracts; in-flight contract subscriptions continue until settlement.
- [ ] Switching account, disconnecting, or changing session stops new entries and cleans up subscriptions.
- [ ] Existing Manual Trader and Deriv authentication remain unchanged.
- [ ] Production build passes and a demo-account smoke test verifies a proposal, purchase, settlement, and stop behavior before deployment.

## Current status

Planning/compatibility review only. Do not describe the DBot integration as complete until the acceptance checklist is tested.
