import { test } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { ANLIEGEN_CONFIG } from '../src/anliegen-config';
import { fetchNextTermin } from '../src/fetch-next-termin';

interface ReportRow {
  tab: string;
  name: string;
  slug: string;
  status: 'available' | 'no-slot' | 'error';
  termin?: string;
  error?: string;
}

// "Nächster Termin" timing out is the expected signal for "no slot right
// now" (see CLAUDE.md). Any other failure (tab/button/Weiter/dialog not
// found) means a selector actually broke — report those as real errors.
function classifyFailure(message: string): 'no-slot' | 'error' {
  return message.includes('Nächster Termin') ? 'no-slot' : 'error';
}

function printConsoleSummary(results: ReportRow[]): void {
  const byTab = new Map<string, ReportRow[]>();
  for (const row of results) {
    byTab.set(row.tab, [...(byTab.get(row.tab) ?? []), row]);
  }

  console.log('\n=== Availability Report ===\n');
  for (const [tab, rows] of byTab) {
    console.log(tab);
    for (const row of rows) {
      const marker = row.status === 'available' ? '✅' : row.status === 'no-slot' ? '⬜' : '⚠️ ';
      const detail = row.status === 'available' ? row.termin : row.status === 'error' ? row.error : '';
      console.log(`  ${marker} ${row.name}${detail ? ` — ${detail}` : ''}`);
    }
  }

  const available = results.filter((r) => r.status === 'available').length;
  const noSlot = results.filter((r) => r.status === 'no-slot').length;
  const errors = results.filter((r) => r.status === 'error').length;
  console.log(`\n${available} available, ${noSlot} no slot, ${errors} errors (of ${results.length} total)\n`);
}

function saveReportFiles(results: ReportRow[]): void {
  const reportDir = join(__dirname, '..', 'reports');
  mkdirSync(reportDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const jsonPath = join(reportDir, `availability-report-${timestamp}.json`);
  const mdPath = join(reportDir, `availability-report-${timestamp}.md`);

  writeFileSync(jsonPath, JSON.stringify(results, null, 2));

  const byTab = new Map<string, ReportRow[]>();
  for (const row of results) {
    byTab.set(row.tab, [...(byTab.get(row.tab) ?? []), row]);
  }

  const lines: string[] = [`# Availability Report — ${new Date().toISOString()}`, ''];
  for (const [tab, rows] of byTab) {
    lines.push(`## ${tab}`, '', '| Anliegen | Status | Detail |', '|---|---|---|');
    for (const row of rows) {
      const status = row.status === 'available' ? '✅ Available' : row.status === 'no-slot' ? '⬜ No slot' : '⚠️ Error';
      const detail = row.status === 'available' ? row.termin : row.status === 'error' ? row.error : '';
      lines.push(`| ${row.name} | ${status} | ${detail ?? ''} |`);
    }
    lines.push('');
  }
  writeFileSync(mdPath, lines.join('\n'));

  console.log(`Saved report: ${mdPath}`);
  console.log(`Saved report: ${jsonPath}`);
}

test('Generate one-shot availability report for all Anliegen', async ({ page }) => {
  test.setTimeout(0); // 49 sequential checks can take several minutes

  const results: ReportRow[] = [];

  for (const config of ANLIEGEN_CONFIG) {
    console.log(`Checking ${config.tab} - ${config.name}...`);
    try {
      const termin = await fetchNextTermin(page, config);
      results.push({ tab: config.tab, name: config.name, slug: config.slug, status: 'available', termin });
    } catch (err: any) {
      const status = classifyFailure(err.message ?? '');
      results.push({ tab: config.tab, name: config.name, slug: config.slug, status, error: err.message });
    }
  }

  printConsoleSummary(results);
  saveReportFiles(results);
});
