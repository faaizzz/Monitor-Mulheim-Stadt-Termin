import { test } from '@playwright/test';
import { AnliegenConfig } from './anliegen-config';
import { AnliegenPage } from './pages/AnliegenPage';
import { notifySlotFound } from './notifier';

// Optional: set BEFORE_DATE=YYYY-MM-DD env var to only alert when slot is before that date
function parseTerminDate(text: string): Date | null {
  const match = text.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (!match) return null;
  const [, day, month, year] = match;
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

async function checkOnce(page: import('@playwright/test').Page, config: AnliegenConfig): Promise<void> {
  const anliegenPage = new AnliegenPage(page);
  await anliegenPage.open();
  await anliegenPage.selectAnliegen(config.tab, config.name);
  await anliegenPage.confirmDocumentsIfPresent();
  const content = await anliegenPage.getNextTermin();

  console.log(`Next Termin for ${config.name} exists`);

  const beforeDateArg = process.env.BEFORE_DATE ?? null;
  const beforeDate = beforeDateArg ? new Date(beforeDateArg) : null;
  const terminDate = parseTerminDate(content);
  if (beforeDate && terminDate && terminDate >= beforeDate) {
    throw new Error(`Termin (${content.trim()}) is not before ${process.env.BEFORE_DATE} — will retry`);
  }

  // A found (and date-filter-passing) slot is terminal: don't redo the whole
  // booking flow again just because a notification channel failed (e.g. a
  // network-blocked Telegram). Log it and move on instead of retrying.
  try {
    await notifySlotFound(config.name, content);
  } catch (err: any) {
    console.error(`Slot found but a notification failed (not retrying): ${err.message}`);
  }
}

export function defineAnliegenMonitor(config: AnliegenConfig): void {
  test(`${config.tab} - ${config.name}`, async ({ page }) => {
    test.setTimeout(0); // Disable timeout for this test

    let success = false;
    while (!success) {
      try {
        await checkOnce(page, config);
        success = true;
      } catch (error: any) {
        const currentTime = new Date().toLocaleString();
        console.error(`[${currentTime}] Retrying in 60s:`, error.message);
        await sleep(60000);
      }
    }
  });
}
