import { AnliegenConfig } from './anliegen-config';
import { parseTerminDate } from './termin-utils';
import { notifySlotFound } from './notifier';

export interface MonitorResult {
  config: AnliegenConfig;
  status: 'available' | 'no-slot' | 'error';
  termin?: string;
  error?: string;
}

function passesBeforeDateFilter(termin: string | undefined, beforeDate: Date | null): boolean {
  if (!beforeDate) return true;
  const terminDate = termin ? parseTerminDate(termin) : null;
  if (!terminDate) return true; // unparsed date: notify anyway, same as the old per-Anliegen monitor
  return terminDate < beforeDate;
}

// Notifies for every slug whose status newly became 'available' since the
// last sweep (an already-open slot on the very first sweep after a process
// start still counts as "new" and is notified). Mutates and returns
// lastKnown so the caller can keep it across sweeps.
export async function checkAndNotify(
  results: MonitorResult[],
  lastKnown: Map<string, string>,
  beforeDate: Date | null
): Promise<Map<string, string>> {
  for (const result of results) {
    const becameAvailable = result.status === 'available' && lastKnown.get(result.config.slug) !== 'available';
    if (becameAvailable && passesBeforeDateFilter(result.termin, beforeDate)) {
      try {
        await notifySlotFound(result.config.name, result.termin ?? '');
      } catch (err: any) {
        console.error(`Slot found for ${result.config.name} but notification failed: ${err.message}`);
      }
    }
    lastKnown.set(result.config.slug, result.status);
  }
  return lastKnown;
}
