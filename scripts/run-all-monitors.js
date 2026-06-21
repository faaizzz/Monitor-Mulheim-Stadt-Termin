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

for (const file of files) {
  const slug = path.basename(file, '.spec.ts');
  const logFd = fs.openSync(path.join(logDir, `${slug}.log`), 'a');
  spawn('npx', ['playwright', 'test', path.join('tests', 'anliegen', file)], {
    cwd: repoRoot,
    stdio: ['ignore', logFd, logFd],
  });
}

console.log(`Spawned ${files.length} monitor processes. Logs in ./logs/`);
