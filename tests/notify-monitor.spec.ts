import { test } from '@playwright/test';
import { ANLIEGEN_CONFIG } from '../src/anliegen-config';
import { fetchNextTermin } from '../src/fetch-next-termin';
import { classifyFailure } from '../src/termin-utils';
import { checkAndNotify, MonitorResult } from '../src/notify-monitor';

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const MONITOR_INTERVAL_MS = process.env.MONITOR_INTERVAL_MS
  ? parseInt(process.env.MONITOR_INTERVAL_MS, 10)
  : 600_000; // 10 minutes

test('Continuously check all Anliegen and notify on new availability', async ({ page }) => {
  test.setTimeout(0); // Runs forever: one sequential sweep of all 49 Anliegen, then a fixed gap, repeat.

  const beforeDateArg = process.env.BEFORE_DATE ?? null;
  const beforeDate = beforeDateArg ? new Date(beforeDateArg) : null;
  const lastKnown = new Map<string, string>();

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const results: MonitorResult[] = [];

    for (const config of ANLIEGEN_CONFIG) {
      try {
        const termin = await fetchNextTermin(page, config);
        results.push({ config, status: 'available', termin });
      } catch (err: any) {
        const status = classifyFailure(err.message ?? '');
        results.push({ config, status, error: err.message });
      }
    }

    await checkAndNotify(results, lastKnown, beforeDate);
    console.log(`[${new Date().toLocaleString()}] Checked ${results.length} Anliegen`);

    await sleep(MONITOR_INTERVAL_MS);
  }
});
