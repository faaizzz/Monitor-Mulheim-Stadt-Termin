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
    await this.page.getByRole('tab', { name: tab }).click({ timeout: 5000 });
    await this.page
      .getByRole('button', { name: `Erhöhen der Anzahl des Anliegens ${name}` })
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
