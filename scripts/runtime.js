/**
 * runtime.js — Run an npm script from the C: runtime directory.
 *
 * Uses ONLY Node.js built-ins (no require of npm packages).
 * Safe to invoke from G: drive even without local node_modules.
 *
 * Usage (called by npm scripts in package.json):
 *   node scripts/runtime.js <script-name>
 *   node scripts/runtime.js typecheck
 *   node scripts/runtime.js test:e2e-local
 *   node scripts/runtime.js dev
 *   node scripts/runtime.js db:check
 */

const { spawnSync } = require('child_process');
const path = require('path');

const RUNTIME = 'C:\\lungmat_agent';
const SRC = path.join(__dirname, '..');

const SCRIPT_CMDS = {
  'dev':             'nodemon --watch src --ext ts --exec ts-node src/index.ts',
  'build':           'tsc',
  'start':           'node dist/index.js',
  'typecheck':       'tsc --noEmit',
  'db:check':        'ts-node db/check.ts',
  'db:seed':         'ts-node db/seed.ts',
  'db:test-log':     'ts-node db/test-log.ts',
  'test:e2e-local':  'ts-node scripts/e2e-local.ts',
  'install':         null,  // handled separately — runs npm install directly
};

const scriptName = process.argv[2];

if (!scriptName) {
  console.error('[runtime.js] Usage: node scripts/runtime.js <script-name>');
  console.error('[runtime.js] Available:', Object.keys(SCRIPT_CMDS).join(', '));
  process.exit(1);
}

if (!(scriptName in SCRIPT_CMDS)) {
  console.error(`[runtime.js] Unknown script: ${scriptName}`);
  process.exit(1);
}

// Sync source → runtime (excludes node_modules, dist, logs, .git, .env)
console.log(`[runtime.js] Syncing source to ${RUNTIME}…`);
const sync = spawnSync(
  'robocopy',
  [SRC, RUNTIME, '/E',
    '/XD', 'node_modules', 'dist', 'logs', '.git',
    '/XF', '.env', '*.log',
    '/NFL', '/NJH', '/NJS'],
  { stdio: 'pipe', shell: false }
);
// robocopy exit codes 0–7 are non-error; 8+ indicate failures
if (sync.status !== null && sync.status >= 8) {
  console.error('[runtime.js] robocopy failed:', sync.stderr?.toString());
  process.exit(1);
}

// Run the script from the C: runtime where node_modules exists
const cmd = SCRIPT_CMDS[scriptName] === null
  ? 'npm install'
  : `npx ${SCRIPT_CMDS[scriptName]}`;

console.log(`[runtime.js] Running: ${cmd} in ${RUNTIME}\n`);
const run = spawnSync(cmd, [], {
  cwd: RUNTIME,
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

process.exit(run.status ?? 0);
