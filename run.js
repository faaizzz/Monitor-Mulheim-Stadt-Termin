#!/usr/bin/env node
// Wrapper around `npx playwright test` that adds a --before-date flag.
// Usage: node run.js <test-file> [--before-date=YYYY-MM-DD] [playwright-flags...]
// Example: node run.js tests/ummeldung-abmeldung.spec.ts --before-date=2025-06-01

const { spawnSync } = require('child_process');

const args = process.argv.slice(2);
const env = { ...process.env };

const filtered = args.filter(arg => {
  if (arg.startsWith('--before-date=')) {
    env.BEFORE_DATE = arg.split('=')[1];
    return false;
  }
  return true;
});

const result = spawnSync('npx', ['playwright', 'test', ...filtered], {
  stdio: 'inherit',
  env,
});

process.exit(result.status ?? 1);
