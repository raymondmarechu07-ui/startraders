const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const tempDir = path.join(root, '.dbot-build');
const publicDir = path.join(root, 'public');
const outputDir = path.join(publicDir, 'dbot-engine');
const repo = 'https://github.com/raymondmarechu07-ui/trading-bot-template.git';
// Pin the DBot source revision with the StarTraders production-environment fix.
const commit = 'd37ad5a44286c3589ddac83484372ebc991f4460';

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
  fs.mkdirSync(publicDir, { recursive: true });

  console.log('[StarTraders] Fetching pinned full DBot engine source...');
  run(git, ['clone', '--depth', '1', '--branch', 'master', repo, tempDir], root);
  run(git, ['fetch', '--depth', '1', 'origin', commit], tempDir);
  run(git, ['checkout', '--detach', commit], tempDir);

  // Apply StarTraders branding to the actual DBot application before building it.
  const brandPath = path.join(tempDir, 'brand.config.json');
  const brand = JSON.parse(fs.readFileSync(brandPath, 'utf8'));
  const hostname = process.env.STARTRADERS_HOSTNAME || 'startraders-xn1z.onrender.com';
  brand.brand_name = 'StarTraders';
  brand.brand_domain = hostname;
  brand.domain_name = 'StarTraders';
  brand.platform.name = 'StarTraders Bot Builder';
  brand.platform.logo.alt_text = 'StarTraders';
  brand.platform.logo.text = 'StarTraders';
  brand.platform.logo.show_text = true;
  brand.platform.hostname.production.com = hostname;
  brand.brand_hostname.production = `https://${hostname}/bot-builder/engine`;
  brand.brand_hostname.staging = `https://${hostname}/bot-builder/engine`;
  brand.colors.primary = '#17223a';
  brand.colors.secondary = '#55dfb1';
  brand.colors.tertiary = '#2375d8';
  fs.writeFileSync(brandPath, JSON.stringify(brand, null, 2) + '\\n');

  console.log('[StarTraders] Installing DBot engine dependencies...');
  run(npm, ['ci', '--strict-peer-deps'], tempDir);
  console.log('[StarTraders] Generating StarTraders theme variables...');
  run(npm, ['run', 'generate:brand-css'], tempDir);

  console.log('[StarTraders] Building full DBot engine for the same-origin StarTraders route...');
  run(npm, ['run', 'build'], tempDir, {
    ...process.env,
    APP_ENV: 'production',
    CLIENT_ID: process.env.DBOT_CLIENT_ID || process.env.DERIV_CLIENT_ID || process.env.CLIENT_ID || '',
    BOT_BASE_PATH: '/bot-builder/engine',
    NODE_ENV: 'production',
  });

  const builtDist = path.join(tempDir, 'dist');
  const engineIndex = path.join(builtDist, 'index.html');
  if (!fs.existsSync(engineIndex)) {
    throw new Error('DBot build completed without dist/index.html');
  }

  fs.cpSync(builtDist, outputDir, { recursive: true });

  // Catch broken root-relative asset paths before deploying.
  const html = fs.readFileSync(path.join(outputDir, 'index.html'), 'utf8');
  const references = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map(match => match[1])
    .filter(value => value.startsWith('/bot-builder/engine/'));
  const missing = references.filter(value => {
    const relative = value.slice('/bot-builder/engine/'.length).split(/[?#]/, 1)[0];
    return !fs.existsSync(path.join(outputDir, relative));
  });
  if (missing.length) {
    throw new Error('DBot manifest references missing assets: ' + missing.join(', '));
  }

  console.log('[StarTraders] Full DBot engine built into public/dbot-engine.');
  console.log('[StarTraders] Validated ' + references.length + ' entry assets.');
  if (!(process.env.DBOT_CLIENT_ID || process.env.DERIV_CLIENT_ID || process.env.CLIENT_ID)) {
    console.warn('[StarTraders] DBOT_CLIENT_ID is not configured; OAuth login needs the registered StarTraders Deriv client ID.');
  }
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
