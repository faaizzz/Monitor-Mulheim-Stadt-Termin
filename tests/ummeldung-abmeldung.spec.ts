import { test, expect } from '@playwright/test';
import player from 'play-sound';
import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { sendTelegramMessage } from '../src/telegram';

const play = player();

// Optional: pass --before-date=YYYY-MM-DD via `node run.js` or set BEFORE_DATE env var
const beforeDateArg = process.env.BEFORE_DATE ?? null;
const beforeDate = beforeDateArg ? new Date(beforeDateArg) : null;

function parseTerminDate(text: string): Date | null {
  const match = text.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (!match) return null;
  const [, day, month, year] = match;
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

async function checkTermin(page) {
  await page.goto('https://terminvergabe.muelheim-ruhr.de/select2?md=9');
  await expect(page).toHaveTitle(/Terminvergabe/);
  const cookieBtn = await page.$('//*[@id="cookie_msg_btn_no"]');
  if (cookieBtn) await cookieBtn.click();

  await page.waitForSelector('#concerns_accordion-8944', { timeout: 5000 });
  await page.click('#concerns_accordion-8944');

  await page.waitForSelector('#button-plus-2698', { timeout: 5000 });
  await page.click('#button-plus-2698');

  await page.waitForSelector('#WeiterButton', { timeout: 5000 });
  await page.click('#WeiterButton');

  const items = await page.$$('//*[@id="TevisDialog"]//div[contains(@class,"doclist_item") or contains(@class,"documentlist_item")]');
  for (const item of items) {
    const label = await item.$('label');
    if (label) await label.click();
  }

  await page.click('//*[@id="OKButton"]');

  await page.waitForSelector('text=Nächster Termin', { timeout: 5000 });
  const nextTerminExists = await page.isVisible('text=Nächster Termin');
  expect(nextTerminExists).toBeTruthy();
  if (!nextTerminExists) {
    console.log('Next Termin does not exist');
  } else {
    console.log('Next Termin for Ummeldung / Abmeldung exists');
    const content = await page.textContent('//*[@id="suggest_location_content"]/form/dl/dd[4]');
    console.log('Date Time:', content);

    const terminDate = parseTerminDate(content ?? '');
    if (beforeDate && terminDate && terminDate >= beforeDate) {
      console.log(`Termin (${content?.trim()}) is not before ${process.env.BEFORE_DATE} — skipping notification`);
    } else {
      console.log('');

      play.play('media/beep.wav', (err: any) => {
        if (err) console.error('Error playing audio:', err);
      });

      await sendTelegramMessage(`Next Termin for Ummeldung / Abmeldung exists. Date Time: ${content}`);

      try {
        const inputMessage = 'Next Termin for Ummeldung / Abmeldung exists. Date Time: ' + content;
        const tempFilePath = join(tmpdir(), 'shortcut-input.txt');
        writeFileSync(tempFilePath, inputMessage, 'utf8');
        const command = `shortcuts run "Send iMessage for Slot" --input-path "${tempFilePath}"`;
        // const output = execSync(command, { encoding: 'utf8' });
        // console.log(`Shortcut Output: ${output}`);
      } catch (error) {
        console.error(`Error running shortcut: ${error}`);
      }
    }
  }

  await page.waitForTimeout(3000);
}

test('Ummeldung / Abmeldung Termin', async ({ page }) => {
  test.setTimeout(0); // Disable timeout for this test
  let success = false;
  while (!success) {
    try {
      await checkTermin(page);
      success = true;
    } catch (error) {
      console.log('Retrying due to error:', error);
      await page.waitForTimeout(60000); // wait for 1 minute before retrying
    }
  }
});
