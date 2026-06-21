#!/usr/bin/env node
// (Re)generates tests/anliegen/<slug>.spec.ts from src/anliegen-config.ts.
// Run this after adding/removing/renaming an entry in ANLIEGEN_CONFIG.
// Usage: node scripts/generate-anliegen-tests.js

const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const outDir = path.join(repoRoot, 'tests', 'anliegen');

// anliegen-config.ts is TypeScript; extract the slug list without a full TS toolchain.
const configSource = fs.readFileSync(path.join(repoRoot, 'src', 'anliegen-config.ts'), 'utf8');
const slugs = [...configSource.matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1]);

if (slugs.length === 0) {
  console.error('No slugs found in src/anliegen-config.ts');
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

for (const file of fs.readdirSync(outDir)) {
  fs.unlinkSync(path.join(outDir, file));
}

for (const slug of slugs) {
  const content = `import { defineAnliegenMonitor } from '../../src/anliegen-monitor';
import { ANLIEGEN_CONFIG } from '../../src/anliegen-config';

defineAnliegenMonitor(ANLIEGEN_CONFIG.find((a) => a.slug === '${slug}')!);
`;
  fs.writeFileSync(path.join(outDir, `${slug}.spec.ts`), content);
}

console.log(`Generated ${slugs.length} spec files in tests/anliegen/`);
