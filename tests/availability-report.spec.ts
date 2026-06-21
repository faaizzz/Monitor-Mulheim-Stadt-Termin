import { test } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { ANLIEGEN_CONFIG } from '../src/anliegen-config';
import { fetchNextTermin } from '../src/fetch-next-termin';

export interface ReportRow {
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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Playwright error messages are multi-line, ANSI-colored, and often include a
// full element/call-log dump — show just the first line in the table, full
// text on hover via title.
function summarizeError(message: string): string {
  const clean = message.replace(/\x1b\[[0-9;]*m/g, '');
  return clean.split('\n')[0].trim();
}

export function buildHtmlReport(results: ReportRow[], generatedAt: string): string {
  const byTab = new Map<string, ReportRow[]>();
  for (const row of results) {
    byTab.set(row.tab, [...(byTab.get(row.tab) ?? []), row]);
  }

  const available = results.filter((r) => r.status === 'available').length;
  const noSlot = results.filter((r) => r.status === 'no-slot').length;
  const errors = results.filter((r) => r.status === 'error').length;

  const sections = [...byTab.entries()]
    .map(([tab, rows]) => {
      const tabRows = rows
        .map((row) => {
          const badge =
            row.status === 'available'
              ? '<span class="badge badge-available">Available</span>'
              : row.status === 'no-slot'
                ? '<span class="badge badge-noslot">No slot</span>'
                : '<span class="badge badge-error">Error</span>';
          const detail =
            row.status === 'available'
              ? `<span class="termin">${escapeHtml(row.termin ?? '')}</span>`
              : row.status === 'error'
                ? `<span class="error-detail" title="${escapeHtml(row.error ?? '')}">${escapeHtml(summarizeError(row.error ?? ''))}</span>`
                : '<span class="muted">—</span>';
          return `<tr class="row-${row.status}"><td>${escapeHtml(row.name)}</td><td>${badge}</td><td>${detail}</td></tr>`;
        })
        .join('\n');

      const tabAvailable = rows.filter((r) => r.status === 'available').length;
      return `<section class="tab-card">
  <h2>${escapeHtml(tab)} <span class="tab-count">${tabAvailable > 0 ? `${tabAvailable} available` : `${rows.length} checked`}</span></h2>
  <table>
    <thead><tr><th>Anliegen</th><th>Status</th><th>Detail</th></tr></thead>
    <tbody>
${tabRows}
    </tbody>
  </table>
</section>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Mülheim Termin — Availability Report</title>
<style>
  :root {
    --ink: #1b2430;
    --muted: #6b7785;
    --line: #e3e7ec;
    --bg: #f6f7f9;
    --card: #ffffff;
    --green: #1d7a4c;
    --green-bg: #e4f5ec;
    --amber: #9a6400;
    --amber-bg: #fdf1dc;
    --gray-bg: #eef0f3;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    background: var(--bg);
    color: var(--ink);
    padding: 2.5rem 1.5rem 4rem;
  }
  .wrap { max-width: 880px; margin: 0 auto; }
  header h1 { font-size: 1.5rem; margin: 0 0 0.25rem; letter-spacing: -0.01em; }
  header .meta { color: var(--muted); font-size: 0.85rem; margin-bottom: 1.5rem; }
  .stats { display: flex; gap: 0.75rem; margin-bottom: 2rem; flex-wrap: wrap; }
  .stat {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 0.75rem 1.1rem;
    min-width: 110px;
  }
  .stat .n { font-size: 1.6rem; font-weight: 600; line-height: 1; font-family: ui-monospace, "SF Mono", Menlo, monospace; }
  .stat .l { font-size: 0.75rem; color: var(--muted); margin-top: 0.2rem; }
  .stat.available .n { color: var(--green); }
  .stat.error .n { color: var(--amber); }
  .tab-card {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 12px;
    padding: 1.1rem 1.3rem 1.3rem;
    margin-bottom: 1.1rem;
  }
  .tab-card h2 {
    font-size: 1rem;
    margin: 0 0 0.8rem;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-weight: 600;
  }
  .tab-count { font-size: 0.75rem; font-weight: 500; color: var(--muted); }
  table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
  th { text-align: left; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--muted); font-weight: 600; padding: 0.4rem 0.6rem; border-bottom: 1px solid var(--line); }
  td { padding: 0.55rem 0.6rem; border-bottom: 1px solid var(--line); vertical-align: top; }
  tr:last-child td { border-bottom: none; }
  .badge { display: inline-block; font-size: 0.72rem; font-weight: 600; padding: 0.18rem 0.55rem; border-radius: 999px; }
  .badge-available { background: var(--green-bg); color: var(--green); }
  .badge-noslot { background: var(--gray-bg); color: var(--muted); }
  .badge-error { background: var(--amber-bg); color: var(--amber); }
  .termin { font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 0.85rem; }
  .error-detail { font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 0.78rem; color: var(--amber); }
  .muted { color: var(--line); }
  .row-available td:first-child { font-weight: 600; }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <h1>Mülheim Termin — Availability Report</h1>
    <div class="meta">Generated ${escapeHtml(generatedAt)} · Ausländeramt, 8 categories, ${results.length} Anliegen checked once</div>
  </header>
  <div class="stats">
    <div class="stat available"><div class="n">${available}</div><div class="l">available</div></div>
    <div class="stat"><div class="n">${noSlot}</div><div class="l">no slot</div></div>
    <div class="stat error"><div class="n">${errors}</div><div class="l">errors</div></div>
  </div>
  ${sections}
</div>
</body>
</html>`;
}

function saveReportFiles(results: ReportRow[]): void {
  const reportDir = join(__dirname, '..', 'reports');
  mkdirSync(reportDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const jsonPath = join(reportDir, `availability-report-${timestamp}.json`);
  const mdPath = join(reportDir, `availability-report-${timestamp}.md`);
  const htmlPath = join(reportDir, `availability-report-${timestamp}.html`);

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
  writeFileSync(htmlPath, buildHtmlReport(results, new Date().toISOString()));

  console.log(`Saved report: ${mdPath}`);
  console.log(`Saved report: ${jsonPath}`);
  console.log(`Saved report: ${htmlPath}`);
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
