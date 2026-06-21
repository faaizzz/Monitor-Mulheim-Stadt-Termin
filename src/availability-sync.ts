import { SupabaseClient } from '@supabase/supabase-js';
import { AnliegenConfig } from './anliegen-config';
import { parseTerminDate } from './termin-utils';

export interface SyncResult {
  config: AnliegenConfig;
  status: 'available' | 'no-slot' | 'error';
  termin?: string;
  error?: string;
}

function toIsoDate(text: string | undefined): string | null {
  if (!text) return null;
  const date = parseTerminDate(text);
  return date ? date.toISOString().slice(0, 10) : null;
}

// Seeds the in-memory "last known status" map from whatever is already
// persisted in current_status, so a sync job restart doesn't re-emit 49
// spurious transitions just because its in-process map started empty.
export async function loadLastKnownStatus(client: SupabaseClient): Promise<Map<string, string>> {
  const { data, error } = await client.from('current_status').select('slug, status');
  if (error) throw new Error(`Failed to load current_status: ${error.message}`);

  const lastKnown = new Map<string, string>();
  for (const row of data ?? []) {
    lastKnown.set(row.slug, row.status);
  }
  return lastKnown;
}

// Upserts current_status for every result, and appends an availability_events
// row only for slugs whose status changed since the last sweep (per lastKnown).
// Mutates and returns lastKnown so the caller can keep it across sweeps.
export async function syncOnce(
  client: SupabaseClient,
  results: SyncResult[],
  lastKnown: Map<string, string>
): Promise<Map<string, string>> {
  const checkedAt = new Date().toISOString();

  const currentStatusRows = results.map((result) => ({
    slug: result.config.slug,
    tab: result.config.tab,
    name: result.config.name,
    status: result.status,
    termin_raw: result.termin ?? null,
    termin_date: toIsoDate(result.termin),
    error_message: result.error ?? null,
    checked_at: checkedAt,
  }));

  const { error: upsertError } = await client.from('current_status').upsert(currentStatusRows);
  if (upsertError) throw new Error(`Failed to upsert current_status: ${upsertError.message}`);

  const eventRows = results
    .filter((result) => lastKnown.get(result.config.slug) !== result.status)
    .map((result) => ({
      slug: result.config.slug,
      tab: result.config.tab,
      name: result.config.name,
      previous_status: lastKnown.get(result.config.slug) ?? null,
      new_status: result.status,
      termin_raw: result.termin ?? null,
      termin_date: toIsoDate(result.termin),
      error_message: result.error ?? null,
      transitioned_at: checkedAt,
    }));

  if (eventRows.length > 0) {
    const { error: insertError } = await client.from('availability_events').insert(eventRows);
    if (insertError) throw new Error(`Failed to insert availability_events: ${insertError.message}`);
  }

  for (const result of results) {
    lastKnown.set(result.config.slug, result.status);
  }
  return lastKnown;
}
