import { Page, expect } from '@playwright/test';

export class AnliegenPage {
  constructor(private page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('https://terminvergabe.muelheim-ruhr.de/select2?md=9');
    await expect(this.page).toHaveTitle(/Terminvergabe/);
    // Locator (not ElementHandle): re-queries the DOM on every retry, so it
    // can't go stale if the consent banner re-renders after this goto().
    await this.page
      .locator('#cookie_msg_btn_no')
      .click({ timeout: 3000 })
      .catch(() => {});
  }

  async selectAnliegen(tab: string, name: string): Promise<void> {
    // exact: true matters here — several Anliegen names are text-prefixes of
    // another Anliegen in the same tab (e.g. "Erteilung Niederlassungserlaubnis"
    // vs "...für Fachkräfte"), and getByRole's name match is substring-based
    // by default, which causes a strict-mode "resolved to 2 elements" error.
    await this.page.getByRole('tab', { name: tab, exact: true }).click({ timeout: 5000 });
    await this.page
      .getByRole('button', { name: `Erhöhen der Anzahl des Anliegens ${name}`, exact: true })
      .click({ timeout: 5000 });

    await this.page.waitForSelector('#WeiterButton', { timeout: 5000 });
    await this.page.click('#WeiterButton');
  }

  async confirmDocumentsIfPresent(): Promise<void> {
    const dialog = await this.page
      .waitForSelector('#TevisDialog', { timeout: 5000 })
      .catch(() => null);
    if (!dialog) return;

    await this.page.evaluate(() => {
      document.querySelectorAll('.documentlist_item_cb').forEach((cb: any) => {
        if (!cb.checked) {
          cb.checked = true;
          cb.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    });

    await this.page.click('//*[@id="OKButton"]');
  }

  async getNextTermin(): Promise<string> {
    await this.page.waitForSelector('text=Nächster Termin', { timeout: 5000 });
    const content = await this.page.textContent('//*[@id="suggest_location_content"]/form/dl/dd[4]');
    return content ?? '';
  }
}
