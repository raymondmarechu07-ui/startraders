'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useDeriv } from '../../context/DerivProvider';

const BLOCKLY_VERSION = '11.2.2';
const scripts = [
  `https://unpkg.com/blockly@${BLOCKLY_VERSION}/blockly_compressed.js`,
  `https://unpkg.com/blockly@${BLOCKLY_VERSION}/blocks_compressed.js`,
  `https://unpkg.com/blockly@${BLOCKLY_VERSION}/javascript_compressed.js`,
  `https://unpkg.com/blockly@${BLOCKLY_VERSION}/msg/en.js`,
];

const starterXml = `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="deriv_on_start" x="36" y="36">
    <statement name="DO">
      <block type="deriv_trade_settings">
        <field name="SYMBOL">R_100</field>
        <field name="CONTRACT">CALL</field>
        <field name="STAKE">1</field>
        <next><block type="deriv_repeat"><field name="COUNT">1</field></block></next>
      </block>
    </statement>
  </block>
</xml>`;

const palette = {
  page: { minHeight: '100vh', background: '#0b1020', color: '#e8edf7', fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', padding: '18px 24px', borderBottom: '1px solid #26314a', background: '#10172a' },
  eyebrow: { margin: '0 0 5px', color: '#55dfb1', fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase' },
  title: { margin: 0, fontSize: 24, letterSpacing: '-0.03em', fontWeight: 800 },
  subtitle: { margin: '6px 0 0', color: '#9aa9c4', fontSize: 13 },
  button: { border: '1px solid #34425e', background: '#17223a', color: '#e8edf7', borderRadius: 9, padding: '10px 13px', fontWeight: 700, cursor: 'pointer', fontSize: 12 },
  primary: { border: '1px solid #55dfb1', background: '#55dfb1', color: '#071b18', borderRadius: 9, padding: '10px 15px', fontWeight: 800, cursor: 'pointer', fontSize: 12 },
  muted: { color: '#93a3c0', fontSize: 12, lineHeight: 1.6 },
};

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-blockly-src="${src}"]`);
    if (existing?.dataset.loaded === 'true') return resolve();
    if (existing) {
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.dataset.blocklySrc = src;
    script.onload = () => { script.dataset.loaded = 'true'; resolve(); };
    script.onerror = () => reject(new Error('Could not load Blockly editor assets. Check your connection and refresh.'));
    document.head.appendChild(script);
  });
}

export default function BotBuilderPage() {
  const workspaceHost = useRef(null);
  const workspaceRef = useRef(null);
  const fileInput = useRef(null);
  const [editorStatus, setEditorStatus] = useState('loading');
  const [notice, setNotice] = useState('Loading the visual strategy editor…');
  const [blockCount, setBlockCount] = useState(0);
  const [strategyName, setStrategyName] = useState('My Deriv Strategy');
  const [isRunningDemo, setIsRunningDemo] = useState(false);
  const [activeContract, setActiveContract] = useState(null);
  const [tradeUpdates, setTradeUpdates] = useState([]);
  const { accounts, activeAccount, activeAccountId, isLoggedIn, status: connectionStatus, login, switchAccount, requestProposal, buyContract, subscribeContract, sellContract } = useDeriv();
  const isDemoAccount = Boolean(activeAccount?.account_id && /^VRTC/i.test(activeAccount.account_id));

  const updateCount = useCallback(() => {
    const ws = workspaceRef.current;
    if (ws) setBlockCount(ws.getAllBlocks(false).length);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let resizeObserver;
    (async () => {
      try {
        for (const src of scripts) await loadScript(src);
        if (cancelled || !workspaceHost.current || !window.Blockly) return;
        const Blockly = window.Blockly;
        if (!Blockly.Blocks.deriv_on_start) {
          Blockly.Blocks.deriv_on_start = {
            init() {
              this.appendDummyInput().appendField('When bot starts');
              this.appendStatementInput('DO').setCheck(null).appendField('run');
              this.setColour('#1e9b78');
              this.setTooltip('Starting point for your strategy. Blocks connected below describe the strategy.');
              this.setDeletable(false);
            },
          };
          Blockly.Blocks.deriv_trade_settings = {
            init() {
              this.appendDummyInput().appendField('Trade settings');
              this.appendDummyInput().appendField('Market').appendField(new Blockly.FieldDropdown([['Volatility 100','R_100'],['Volatility 50','R_50'],['Volatility 10','R_10'],['Volatility 25','R_25'],['Volatility 75','R_75']]), 'SYMBOL');
              this.appendDummyInput().appendField('Contract').appendField(new Blockly.FieldDropdown([['Rise','CALL'],['Fall','PUT']]), 'CONTRACT');
              this.appendDummyInput().appendField('Stake (demo units)').appendField(new Blockly.FieldNumber(1, 0.35, 1000, 0.01), 'STAKE');
              this.setPreviousStatement(true, null);
              this.setNextStatement(true, null);
              this.setColour('#2375d8');
              this.setTooltip('Configures a sample contract. This editor does not place real trades.');
            },
          };
          Blockly.Blocks.deriv_repeat = {
            init() {
              this.appendDummyInput().appendField('Repeat strategy').appendField(new Blockly.FieldNumber(1, 1, 100, 1), 'COUNT').appendField('time(s)');
              this.setPreviousStatement(true, null);
              this.setNextStatement(true, null);
              this.setColour('#b7791f');
              this.setTooltip('Sets an example repetition count for strategy planning.');
            },
          };
          Blockly.Blocks.deriv_note = {
            init() {
              this.appendDummyInput().appendField('Strategy note').appendField(new Blockly.FieldTextInput('Describe your rule'), 'TEXT');
              this.setPreviousStatement(true, null);
              this.setNextStatement(true, null);
              this.setColour('#64748b');
            },
          };
        }
        const toolbox = {
          kind: 'categoryToolbox',
          contents: [
            { kind: 'category', name: 'Deriv strategy', colour: '#1e9b78', contents: [
              { kind: 'block', type: 'deriv_on_start' },
              { kind: 'block', type: 'deriv_trade_settings' },
              { kind: 'block', type: 'deriv_repeat' },
              { kind: 'block', type: 'deriv_note' },
            ]},
            { kind: 'category', name: 'Logic', categorystyle: 'logic_category', contents: [
              { kind: 'block', type: 'controls_if' },
              { kind: 'block', type: 'logic_compare' },
              { kind: 'block', type: 'logic_operation' },
              { kind: 'block', type: 'logic_boolean' },
              { kind: 'block', type: 'logic_negate' },
            ]},
            { kind: 'category', name: 'Loops', categorystyle: 'loop_category', contents: [
              { kind: 'block', type: 'controls_repeat_ext' },
              { kind: 'block', type: 'controls_whileUntil' },
            ]},
            { kind: 'category', name: 'Math', categorystyle: 'math_category', contents: [
              { kind: 'block', type: 'math_number' },
              { kind: 'block', type: 'math_arithmetic' },
              { kind: 'block', type: 'math_random_int' },
            ]},
            { kind: 'category', name: 'Text', categorystyle: 'text_category', contents: [
              { kind: 'block', type: 'text' },
              { kind: 'block', type: 'text_print' },
            ]},
            { kind: 'category', name: 'Variables', custom: 'VARIABLE', categorystyle: 'variable_category' },
          ],
        };
        const ws = Blockly.inject(workspaceHost.current, {
          toolbox,
          renderer: 'zelos',
          theme: Blockly.Theme.defineTheme('starTradersDark', {
            base: Blockly.Themes.Classic,
            componentStyles: {
              workspaceBackgroundColour: '#0d1425',
              toolboxBackgroundColour: '#111b30',
              toolboxForegroundColour: '#dce6f8',
              flyoutBackgroundColour: '#17223a',
              flyoutForegroundColour: '#e8edf7',
              flyoutOpacity: 1,
              scrollbarColour: '#3a4b69',
              insertionMarkerColour: '#55dfb1',
              insertionMarkerOpacity: 0.3,
              scrollbarOpacity: 0.6,
              cursorColour: '#55dfb1',
            },
            fontStyle: { family: 'Inter, Arial, sans-serif', weight: '600', size: 12 },
          }),
          grid: { spacing: 24, length: 3, colour: '#26314a', snap: true },
          zoom: { controls: true, wheel: true, startScale: 0.9, maxScale: 1.5, minScale: 0.45, scaleSpeed: 1.1 },
          trashcan: true,
          move: { scrollbars: true, drag: true, wheel: true },
          sounds: false,
        });
        workspaceRef.current = ws;
        ws.addChangeListener(updateCount);
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(starterXml, 'text/xml');
        Blockly.Xml.domToWorkspace(xmlDoc.documentElement, ws);
        setEditorStatus('ready');
        setNotice('Editor ready. Build and save your strategy below.');
        updateCount();
        resizeObserver = new ResizeObserver(() => Blockly.svgResize(ws));
        resizeObserver.observe(workspaceHost.current);
      } catch (error) {
        if (!cancelled) {
          setEditorStatus('error');
          setNotice(error?.message || 'The Blockly editor could not be loaded.');
        }
      }
    })();
    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      if (workspaceRef.current) {
        workspaceRef.current.dispose();
        workspaceRef.current = null;
      }
    };
  }, [updateCount]);

  const saveXml = () => {
    const ws = workspaceRef.current;
    if (!ws || !window.Blockly) return;
    const xml = window.Blockly.Xml.domToPrettyText(window.Blockly.Xml.workspaceToDom(ws));
    const blob = new Blob([xml], { type: 'text/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${(strategyName || 'deriv-strategy').trim().replace(/[^a-z0-9-_]+/gi, '-').toLowerCase()}.xml`;
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice('Strategy exported as Blockly XML.');
  };

  const loadXml = async (event) => {
    const file = event.target.files?.[0];
    const ws = workspaceRef.current;
    if (!file || !ws || !window.Blockly) return;
    try {
      const text = await file.text();
      const xml = new DOMParser().parseFromString(text, 'text/xml');
      if (xml.querySelector('parsererror')) throw new Error('That XML file could not be read.');
      ws.clear();
      window.Blockly.Xml.domToWorkspace(xml.documentElement, ws);
      setNotice(`Loaded ${file.name} into the workspace.`);
      updateCount();
    } catch (error) {
      setNotice(error.message || 'Could not load that strategy file.');
    } finally {
      event.target.value = '';
    }
  };

  const stopActiveContract = async () => {
    if (!activeContract || activeContract.is_sold) return;
    if (!window.confirm('Ask Deriv to sell this open demo contract now? Deriv may reject the sale if it is not sellable.')) return;
    try {
      setNotice(`Requesting a sell for demo contract #${activeContract.contract_id}…`);
      await sellContract(activeContract.contract_id);
      setNotice('Sell request sent. Waiting for Deriv to confirm the final contract status.');
    } catch (error) {
      setNotice(error?.message || 'Deriv could not sell this contract. It may not be sellable at this time.');
    }
  };

  const runDemoCheck = async () => {
    const ws = workspaceRef.current;
    if (!ws) return;
    const blocks = ws.getAllBlocks(false);
    const start = blocks.find((block) => block.type === 'deriv_on_start');
    const trade = blocks.find((block) => block.type === 'deriv_trade_settings');
    if (!start) {
      setNotice('Add “When bot starts” to define the strategy entry point.');
      return;
    }
    if (!trade) {
      setNotice('Add “Trade settings” under the start block before running this strategy.');
      return;
    }
    if (!isLoggedIn || !activeAccount) {
      setNotice('Connect a Deriv account first. This runner is restricted to demo accounts.');
      return;
    }
    if (!isDemoAccount) {
      setNotice('Safety block: automated execution is limited to Deriv virtual (VRTC) accounts. Switch to a demo account first; no order was sent.');
      return;
    }
    if (connectionStatus !== 'connected') {
      setNotice('Deriv connection is not ready yet. Wait for the account connection to show Connected, then try again.');
      return;
    }
    if (activeContract && !activeContract.is_sold) {
      setNotice('A contract is already being monitored. Wait for it to settle before starting another.');
      return;
    }
    const market = trade.getFieldValue('SYMBOL');
    const direction = trade.getFieldValue('CONTRACT');
    const stake = Number(trade.getFieldValue('STAKE'));
    if (!Number.isFinite(stake) || stake < 0.35 || stake > 10) {
      setNotice('Demo stake must be between 0.35 and 10 account currency units.');
      return;
    }
    setIsRunningDemo(true);
    setNotice('Requesting a demo-only price proposal…');
    try {
      const proposal = await requestProposal({
        amount: stake,
        basis: 'stake',
        contract_type: direction,
        currency: activeAccount.currency || 'USD',
        duration: 1,
        duration_unit: 't',
        symbol: market,
      });
      if (!proposal?.id || !Number.isFinite(Number(proposal.ask_price))) {
        throw new Error('Deriv returned an incomplete proposal; no order was sent.');
      }
      setNotice('Proposal received. Sending one demo order…');
      const buy = await buyContract(proposal.id, Number(proposal.ask_price));
      const initial = {
        contract_id: String(buy.contract_id),
        buy_price: Number(buy.buy_price ?? proposal.ask_price),
        payout: Number(buy.payout ?? proposal.payout ?? 0),
        profit: Number(buy.profit ?? 0),
        status: 'open',
        is_sold: false,
        symbol: market,
        direction,
      };
      setActiveContract(initial);
      setTradeUpdates((items) => [{ ...initial, time: new Date().toISOString() }, ...items].slice(0, 10));
      setNotice(`Demo order accepted. Contract #${buy.contract_id} is being monitored; the result will update when Deriv settles it.`);
      await subscribeContract(buy.contract_id, (contract) => {
        const update = {
          contract_id: String(contract.contract_id || buy.contract_id),
          buy_price: Number(contract.buy_price ?? initial.buy_price),
          payout: Number(contract.payout ?? initial.payout),
          profit: Number(contract.profit ?? 0),
          status: contract.status || (contract.is_sold ? 'sold' : 'open'),
          is_sold: Boolean(contract.is_sold),
          symbol: market,
          direction,
        };
        setActiveContract(update);
        setTradeUpdates((items) => {
          const exists = items.some((item) => item.contract_id === update.contract_id);
          const next = exists ? items.map((item) => item.contract_id === update.contract_id ? { ...item, ...update, time: new Date().toISOString() } : item) : [{ ...update, time: new Date().toISOString() }, ...items];
          return next.slice(0, 10);
        });
        if (update.is_sold) {
          setNotice(`Demo contract settled: ${update.profit >= 0 ? 'profit' : 'loss'} ${update.profit.toFixed(2)} ${activeAccount.currency || ''}. Start another trade manually when ready.`);
        }
      });
    } catch (error) {
      setNotice(error?.message || 'Demo execution failed. Check the Deriv connection and try again.');
    } finally {
      setIsRunningDemo(false);
    }
  };

  const clearWorkspace = () => {
    const ws = workspaceRef.current;
    if (!ws || !window.Blockly) return;
    ws.clear();
    const xml = new DOMParser().parseFromString(starterXml, 'text/xml');
    window.Blockly.Xml.domToWorkspace(xml.documentElement, ws);
    setNotice('Workspace reset to the starter strategy.');
    updateCount();
  };

  return (
    <main style={palette.page}>
      <header style={palette.header}>
        <div>
          <p style={palette.eyebrow}>StarTraders · Visual automation</p>
          <h1 style={palette.title}>Deriv Bot Builder</h1>
          <p style={palette.subtitle}>Build a strategy with drag-and-drop blocks — right inside StarTraders.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button style={palette.button} onClick={clearWorkspace}>Reset workspace</button>
          <button style={palette.button} onClick={() => fileInput.current?.click()}>Import XML</button>
          <button style={palette.button} onClick={saveXml}>Export XML</button>
          <button style={palette.primary} onClick={runDemoCheck} disabled={editorStatus !== 'ready' || isRunningDemo}>{isRunningDemo ? 'Submitting…' : 'Run one demo trade'}</button>
          <input ref={fileInput} type="file" accept=".xml,text/xml,application/xml" onChange={loadXml} style={{ display: 'none' }} />
        </div>
      </header>

      <section style={{ padding: '14px 24px 10px', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px', borderRadius: 10, border: '1px solid #26314a', background: '#111a2c' }}>
          <span style={{ width: 8, height: 8, borderRadius: 99, background: editorStatus === 'ready' ? '#55dfb1' : editorStatus === 'error' ? '#fb7185' : '#fbbf24' }} />
          <span style={{ fontSize: 12, fontWeight: 700 }}>{editorStatus === 'ready' ? 'Editor ready' : editorStatus === 'error' ? 'Editor unavailable' : 'Loading editor'}</span>
        </div>
        <label style={{ color: '#91a0bc', fontSize: 12 }}>Strategy name <input value={strategyName} onChange={(e) => setStrategyName(e.target.value)} style={{ marginLeft: 8, background: '#111a2c', border: '1px solid #34425e', color: '#e8edf7', borderRadius: 7, padding: '7px 9px', width: 210 }} /></label>
        <span style={{ color: '#91a0bc', fontSize: 12 }}>{blockCount} blocks in workspace</span>
        <span style={{ color: isLoggedIn && isDemoAccount && connectionStatus === 'connected' ? '#55dfb1' : '#fbbf24', fontSize: 12, fontWeight: 700 }}>{isLoggedIn ? (isDemoAccount ? `DEMO ACCOUNT · ${connectionStatus.toUpperCase()}` : 'LIVE ACCOUNT · AUTOMATION BLOCKED') : 'DERIV NOT CONNECTED'}</span>
        {isLoggedIn && <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#aab8d0' }}>Account <select value={activeAccountId || ''} onChange={(event) => switchAccount(event.target.value)} style={{ background: '#111b30', color: '#e7eefb', border: '1px solid #34425e', borderRadius: 7, padding: '7px 9px', maxWidth: 230 }}>{accounts.map((account) => <option key={account.account_id} value={account.account_id}>{account.account_id}{account.currency ? ` · ${account.currency}` : ''}{/^VRTC/i.test(account.account_id) ? ' · Demo' : ' · Real'}</option>)}</select></label>}
        {!isLoggedIn && <button style={palette.button} onClick={login}>Connect Deriv</button>}
      </section>

      <section style={{ padding: '0 24px 16px' }}>
        <div style={{ border: '1px solid #26314a', borderRadius: 14, overflow: 'hidden', background: '#0d1425' }}>
          <div ref={workspaceHost} style={{ height: 'min(66vh, 700px)', minHeight: 430, width: '100%' }} aria-label="Blockly visual strategy workspace" />
        </div>
        {editorStatus === 'error' && <div role="alert" style={{ marginTop: 12, border: '1px solid #7f1d35', background: '#2a1220', color: '#fecdd3', borderRadius: 10, padding: 12, fontSize: 13 }}>{notice}</div>}
        {editorStatus !== 'error' && <div role="status" style={{ marginTop: 12, border: '1px solid #26314a', background: '#111a2c', color: '#cbd5e1', borderRadius: 10, padding: 12, fontSize: 13 }}>{notice}</div>}
      </section>

      <section style={{ padding: '0 24px 16px' }}>
        <article style={{ padding: 16, border: '1px solid #26314a', background: '#111a2c', borderRadius: 12 }}>
          <h2 style={{ margin: '0 0 10px', fontSize: 14 }}>Execution monitor</h2>
          <p style={palette.muted}>{activeContract ? `Contract #${activeContract.contract_id} · ${activeContract.symbol} · ${activeContract.direction === 'CALL' ? 'Rise' : 'Fall'} · ${activeContract.is_sold ? 'Settled' : 'Open'} · P/L ${Number(activeContract.profit || 0).toFixed(2)} ${activeAccount?.currency || ''}` : 'No contract running. Execution is demo-only and submits at most one contract per click.'}</p>
          {activeContract && !activeContract.is_sold && <button style={{ ...palette.button, borderColor: '#a44b5a', color: '#ffb4bd', marginTop: 8 }} onClick={stopActiveContract}>Request sell / stop contract</button>}
          {tradeUpdates.length > 0 && <div style={{ overflowX: 'auto', marginTop: 10 }}><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}><thead><tr>{['Contract','Market','Direction','Status','Profit'].map((x) => <th key={x} style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #34425e', color: '#91a0bc' }}>{x}</th>)}</tr></thead><tbody>{tradeUpdates.map((item) => <tr key={item.contract_id}><td style={{ padding: 8, borderBottom: '1px solid #26314a' }}>#{item.contract_id}</td><td style={{ padding: 8, borderBottom: '1px solid #26314a' }}>{item.symbol}</td><td style={{ padding: 8, borderBottom: '1px solid #26314a' }}>{item.direction === 'CALL' ? 'Rise' : 'Fall'}</td><td style={{ padding: 8, borderBottom: '1px solid #26314a' }}>{item.status}</td><td style={{ padding: 8, borderBottom: '1px solid #26314a' }}>{Number(item.profit || 0).toFixed(2)}</td></tr>)}</tbody></table></div>}
        </article>
      </section>

      <section style={{ padding: '0 24px 28px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
        <article style={{ padding: 16, border: '1px solid #26314a', background: '#111a2c', borderRadius: 12 }}>
          <h2 style={{ margin: '0 0 7px', fontSize: 14 }}>01 · Build visually</h2>
          <p style={palette.muted}>Drag categories from the left toolbox, connect blocks, and adjust the sample market, direction, and stake.</p>
        </article>
        <article style={{ padding: 16, border: '1px solid #26314a', background: '#111a2c', borderRadius: 12 }}>
          <h2 style={{ margin: '0 0 7px', fontSize: 14 }}>02 · Save your work</h2>
          <p style={palette.muted}>Export your workspace to XML and import it later. Keep your strategy files somewhere safe.</p>
        </article>
        <article style={{ padding: 16, border: '1px solid #26314a', background: '#111a2c', borderRadius: 12 }}>
          <h2 style={{ margin: '0 0 7px', fontSize: 14 }}>03 · Safety first</h2>
          <p style={palette.muted}>This initial runner can submit one Rise/Fall tick contract from the Trade settings block, but only on a VRTC virtual account. It does not yet interpret arbitrary Blockly logic or run repeating strategies. Verify stake and market before starting.</p>
        </article>
      </section>
      <style jsx global>{`
        .blocklyToolboxDiv { background: #111b30 !important; border-right: 1px solid #26314a; }
        .blocklyTreeLabel { color: #dce6f8 !important; font-family: Inter, Arial, sans-serif !important; font-size: 12px !important; }
        .blocklyFlyout { filter: drop-shadow(0 12px 20px rgba(0,0,0,.25)); }
        .blocklyMainBackground { stroke: none !important; }
        .blocklyScrollbarHandle { fill: #3a4b69 !important; }
        .blocklyZoom > image { opacity: .85; }
        .blocklyText { font-family: Inter, Arial, sans-serif !important; font-weight: 600 !important; }
        @media (max-width: 720px) {
          .blocklyToolboxDiv { max-width: 135px; }
        }
      `}</style>
    </main>
  );
}
