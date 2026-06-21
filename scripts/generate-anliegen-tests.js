#!/usr/bin/env node
// (Re)generates tests/anliegen/<tab-folder>/<slug>.spec.ts from src/anliegen-config.ts,
// one subfolder per category tab. Run this after adding/removing/renaming an
// entry in ANLIEGEN_CONFIG or TAB_SLUGS.
// Usage: node scripts/generate-anliegen-tests.js

const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const outDir = path.join(repoRoot, 'tests', 'anliegen');

// anliegen-config.ts is TypeScript; extract entries without a full TS toolchain.
const configSource = fs.readFileSync(path.join(repoRoot, 'src', 'anliegen-config.ts'), 'utf8');

const tabSlugs = {};
for (const m of configSource.matchAll(/'([^']+)':\s*'([^']+)',/g)) {
  tabSlugs[m[1]] = m[2];
}

const entries = [...configSource.matchAll(/\{\s*tab:\s*'([^']+)',\s*name:\s*'[^']*',\s*slug:\s*'([^']+)'\s*\}/g)].map(
  (m) => ({ tab: m[1], slug: m[2] }),
);

if (entries.length === 0) {
  console.error('No entries found in src/anliegen-config.ts');
  process.exit(1);
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

for (const { tab, slug } of entries) {
  const tabFolder = tabSlugs[tab];
  if (!tabFolder) {
    console.error(`No TAB_SLUGS entry for tab "${tab}" (needed for ${slug})`);
    process.exit(1);
  }

  const dir = path.join(outDir, tabFolder);
  fs.mkdirSync(dir, { recursive: true });

  const content = `import { defineAnliegenMonitor } from '../../../src/anliegen-monitor';
import { ANLIEGEN_CONFIG } from '../../../src/anliegen-config';

defineAnliegenMonitor(ANLIEGEN_CONFIG.find((a) => a.slug === '${slug}')!);
`;
  fs.writeFileSync(path.join(dir, `${slug}.spec.ts`), content);
}

console.log(`Generated ${entries.length} spec files in tests/anliegen/<tab>/`);
