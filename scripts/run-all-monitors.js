#!/usr/bin/env node
// Spawns one independent `npx playwright test <file>` process per generated
// Anliegen monitor, so each gets its own browser and infinite retry loop
// instead of competing for Playwright's bounded worker pool.
// Usage: node scripts/run-all-monitors.js
// Logs: logs/<slug>.log (one per monitor)

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const repoRoot = path.join(__dirname, '..');
const specDir = path.join(repoRoot, 'tests', 'anliegen');
const logDir = path.join(repoRoot, 'logs');

fs.mkdirSync(logDir, { recursive: true });

const files = fs
  .readdirSync(specDir, { recursive: true })
  .filter((f) => f.endsWith('.spec.ts'));

const children = [];

for (const file of files) {
  const slug = path.basename(file, '.spec.ts');
  const logFd = fs.openSync(path.join(logDir, `${slug}.log`), 'a');
  const child = spawn('npx', ['playwright', 'test', path.join('tests', 'anliegen', file)], {
    cwd: repoRoot,
    stdio: ['ignore', logFd, logFd],
  });
  children.push(child);
}

console.log(`Spawned ${files.length} monitor processes. Logs in ./logs/`);

// Forward shutdown signals to every child so `docker stop` doesn't have to
// wait out the full stop-timeout and SIGKILL orphaned Chromium processes.
function shutdown(signal) {
  for (const child of children) child.kill(signal);
  process.exit(0);
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
