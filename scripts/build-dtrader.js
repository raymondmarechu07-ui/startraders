const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const tempDir = path.join(root, '.dtrader-build');
const outputDir = path.join(root, 'public', 'manual-trader-engine');
const dtraderRepo = 'https://github.com/raymondmarechu07-ui/startraders-dtrader.git';
// Pin the exact tested StarTraders DTrader engine revision so a future upstream
// change cannot silently alter the production Manual Trader build.
const dtraderCommit = 'b80cb507b60467ec5f642d93830b88783f5c4cbd';

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
  fs.rmSync(outputDir, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(outputDir), { recursive: true });

  console.log('[StarTraders] Fetching the DTrader engine...');
  run(git, ['clone', '--depth', '1', dtraderRepo, tempDir], root);
  run(git, ['checkout', '--detach', dtraderCommit], tempDir);

  console.log('[StarTraders] Installing DTrader engine dependencies...');
  run(npm, ['ci', '--strict-peer-deps'], tempDir);

  console.log('[StarTraders] Generating StarTraders DTrader theme...');
  run(npm, ['run', 'generate:colors'], tempDir);

  console.log('[StarTraders] Building DTrader as the same-origin Manual Trader engine...');
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

  // The browser remains on /manual-trader while Next.js serves this static
  // DTrader build from /manual-trader-engine/. Make asset URLs absolute so
  // the native engine does not try to load them from /assets/.
  const engineIndex = path.join(outputDir, 'index.html');
  let indexHtml = fs.readFileSync(engineIndex, 'utf8');
  indexHtml = indexHtml
    .replace(/(src|href)="\.\/([^"]+)"/g, '$1="/manual-trader-engine/$2"')
    .replace(/(src|href)="(assets\/[^"]+)"/g, '$1="/manual-trader-engine/$2"');
  fs.writeFileSync(engineIndex, indexHtml);

  console.log('[StarTraders] DTrader engine installed at public/manual-trader-engine/.');
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
