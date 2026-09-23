const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const tempDir = path.join(root, '.dtrader-build');
const outputDir = path.join(root, 'public', 'manual-trader');
const dtraderRepo = 'https://github.com/raymondmarechu07-ui/startraders-dtrader.git';

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

  console.log('[StarTraders] Installing DTrader engine dependencies...');
  run(npm, ['ci', '--strict-peer-deps'], tempDir);

  console.log('[StarTraders] Generating StarTraders DTrader theme...');
  run(npm, ['run', 'generate:colors'], tempDir);

  console.log('[StarTraders] Building DTrader directly under /manual-trader/...');
  run(
    npm,
    ['run', 'build:all'],
    tempDir,
    {
      ...process.env,
      DTRADER_BASE_PATH: 'manual-trader',
      NODE_ENV: 'production',
    }
  );

  const builtDist = path.join(tempDir, 'packages', 'core', 'dist');

  if (!fs.existsSync(path.join(builtDist, 'index.html'))) {
    throw new Error('DTrader build completed without packages/core/dist/index.html');
  }

  fs.cpSync(builtDist, outputDir, { recursive: true });

  console.log('[StarTraders] DTrader engine installed at public/manual-trader/.');
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
