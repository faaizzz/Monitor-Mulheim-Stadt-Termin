import { test } from '@playwright/test';
import { ANLIEGEN_CONFIG } from '../src/anliegen-config';
import { fetchNextTermin } from '../src/fetch-next-termin';
import { classifyFailure } from '../src/termin-utils';
import { createSupabaseClient } from '../src/supabase-client';
import { loadLastKnownStatus, syncOnce, SyncResult } from '../src/availability-sync';

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const SYNC_GAP_MS = process.env.SYNC_GAP_MS ? parseInt(process.env.SYNC_GAP_MS, 10) : 60000;

test('Continuously sync availability for all Anliegen to Supabase', async ({ page }) => {
  test.setTimeout(0); // Runs forever: one sweep of all 49 Anliegen, then a fixed gap, repeat.

  const client = createSupabaseClient();
  const lastKnown = await loadLastKnownStatus(client);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const results: SyncResult[] = [];

    for (const config of ANLIEGEN_CONFIG) {
      try {
        const termin = await fetchNextTermin(page, config);
        results.push({ config, status: 'available', termin });
      } catch (err: any) {
        const status = classifyFailure(err.message ?? '');
        results.push({ config, status, error: err.message });
      }
    }

    try {
      await syncOnce(client, results, lastKnown);
      console.log(`[${new Date().toLocaleString()}] Synced ${results.length} Anliegen to Supabase`);
    } catch (err: any) {
      console.error(`[${new Date().toLocaleString()}] Sync failed (will retry next sweep): ${err.message}`);
    }

    await sleep(SYNC_GAP_MS);
  }
});
