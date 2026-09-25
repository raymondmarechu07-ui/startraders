const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const tempDir = path.join(root, '.dtrader-build');
const publicDir = path.join(root, 'public');
const outputDir = path.join(publicDir, 'manual-trader-engine');
const oldOutputDir = path.join(publicDir, 'dtrader-engine');
const dtraderRepo = 'https://github.com/raymondmarechu07-ui/startraders-dtrader.git';
// Pin the exact tested StarTraders DTrader engine revision so a future upstream
// change cannot silently alter the production Manual Trader build.
const dtraderCommit = 'cc3b1e0dd0d91479d0e7de860afefcab6eb84278';

const run = (command, args, cwd, env = process.env) => {
  const result = spawnSync(command, args, {
    cwd,
    env,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(' ')}`);
  }
};

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const git = process.platform === 'win32' ? 'git.exe' : 'git';

try {
  fs.rmSync(tempDir, { recursive: true, force: true });
  // The DTrader engine is an internal implementation detail. It must not own
  // the public /manual-trader URL because StarTraders owns that route.
  fs.rmSync(oldOutputDir, { recursive: true, force: true });
  fs.rmSync(outputDir, { recursive: true, force: true });
  fs.mkdirSync(publicDir, { recursive: true });

  console.log('[StarTraders] Fetching the DTrader engine...');
  run(git, ['clone', '--depth', '1', dtraderRepo, tempDir], root);
  run(git, ['checkout', '--detach', dtraderCommit], tempDir);

  console.log('[StarTraders] Installing DTrader engine dependencies...');
  run(npm, ['ci', '--strict-peer-deps'], tempDir);

  console.log('[StarTraders] Generating StarTraders DTrader theme...');
  run(npm, ['run', 'generate:colors'], tempDir);

  console.log('[StarTraders] Building DTrader as the embedded Manual Trader engine...');
  run(
    npm,
    ['run', 'build:all'],
    tempDir,
    {
      ...process.env,
      OAUTH_CLIENT_ID: process.env.OAUTH_CLIENT_ID || process.env.DERIV_CLIENT_ID || '',
      DTRADER_BASE_PATH: 'manual-trader-engine',
      DTRADER_EMBEDDED: '1',
      NODE_ENV: 'production',
    }
  );

  const builtDist = path.join(tempDir, 'packages', 'core', 'dist');

  if (!fs.existsSync(path.join(builtDist, 'index.html'))) {
    throw new Error('DTrader build completed without packages/core/dist/index.html');
  }

  fs.cpSync(builtDist, outputDir, { recursive: true });

  // The DTrader webpack build can still emit its original public asset prefix
  // (/trader/) for lazy-loaded JS/CSS chunks. Because StarTraders serves the
  // engine from /manual-trader-engine/, rewrite that runtime prefix throughout
  // the generated text assets. Without this, the initial bundle loads but a
  // lazy CSS chunk is requested from /trader/css/... and fails with a 404.
  const rewriteAssetPrefixes = directory => {
    const entries = fs.readdirSync(directory, { withFileTypes: true });

    for (const entry of entries) {
      const filePath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        rewriteAssetPrefixes(filePath);
        continue;
      }

      if (!/\.(?:js|css|html|map|json)$/i.test(entry.name)) continue;

      const original = fs.readFileSync(filePath, 'utf8');
      const rewritten = original
        .replaceAll('/trader/', '/manual-trader-engine/')
        .replaceAll('\\\\/trader\\\\/', '/manual-trader-engine/');

      if (rewritten !== original) fs.writeFileSync(filePath, rewritten);
    }
  };

  rewriteAssetPrefixes(outputDir);

  // StarTraders owns /manual-trader. The DTrader engine lives at an internal
  // same-origin asset path and is displayed inside the StarTraders shell.
  const engineIndex = path.join(outputDir, 'index.html');
  let indexHtml = fs.readFileSync(engineIndex, 'utf8');

  // DTrader normally prevents iframe embedding. We intentionally remove only
  // that document-level anti-clickjacking block for this same-origin embed.
  indexHtml = indexHtml.replace(
    /\s*<!-- Start Anti-Clickjack -->[\s\S]*?<!-- End Anti-Clickjack -->\s*/i,
    '\n'
  );

  // Make every generated asset URL resolve from the internal engine path.
  indexHtml = indexHtml
    .replace(/(src|href)="\.\/([^"]+)"/g, '$1="/manual-trader-engine/$2"')
    .replace(/(src|href)="(assets\/[^"]+)"/g, '$1="/manual-trader-engine/$2"');

  fs.writeFileSync(engineIndex, indexHtml);

  console.log('[StarTraders] DTrader engine installed at public/manual-trader-engine/.');
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
