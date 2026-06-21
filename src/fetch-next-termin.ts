import { Page } from '@playwright/test';
import { AnliegenConfig } from './anliegen-config';
import { AnliegenPage } from './pages/AnliegenPage';

// Single attempt at the booking flow for one Anliegen: navigate, select it,
// confirm documents if prompted, and read the next available Termin.
// Throws if no slot is currently available (or a selector breaks) — callers
// decide whether that means "retry later" or "report as no-slot/error".
export async function fetchNextTermin(page: Page, config: AnliegenConfig): Promise<string> {
  const anliegenPage = new AnliegenPage(page);
  await anliegenPage.open();
  await anliegenPage.selectAnliegen(config.tab, config.name);
  await anliegenPage.confirmDocumentsIfPresent();
  return anliegenPage.getNextTermin();
}
