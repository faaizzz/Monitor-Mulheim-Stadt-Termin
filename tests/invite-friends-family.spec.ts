import { test, expect } from '@playwright/test';
import player from 'play-sound';

const play = player();

async function checkTermin(page) {
  await page.goto('https://terminvergabe.muelheim-ruhr.de/select2?md=9');
  await expect(page).toHaveTitle(/Terminvergabe/);

  await page.getByRole('button', { name: 'Ablehnen' }).click({ timeout: 5000 });

  await page.getByRole('tab', { name: 'Allgemeine Ausländerangelegenheiten' }).click({ timeout: 5000 });

  await page.getByRole('button', { name: 'Erhöhen der Anzahl des Anliegens Abgabe einer Verpflichtungserklärung' }).click({ timeout: 5000 });

  await page.waitForSelector('#WeiterButton', { timeout: 5000 });
  await page.click('#WeiterButton');

  await page.click('//*[@id="OKButton"]');

  await page.waitForSelector('text=Nächster Termin', { timeout: 5000 });
  const nextTerminExists = await page.isVisible('text=Nächster Termin');
  expect(nextTerminExists).toBeTruthy();
  if (!nextTerminExists) {
    console.log('Next Termin for Invite Friends and Family does not exist');
  }
  else {
    console.log('Next Termin for Invite Friends and Family exists');
    const content = await page.textContent('//*[@id="suggest_location_content"]/form/dl/dd[4]');
    console.log('Date Time:', content);
    console.log("\u0007");

    play.play('media/beep.wav', (err: any) => {
      if (err) console.error("Error playing audio:", err);
    });
  }  
}

test('Invite Friends and Family Termin', async ({ page }) => {
  test.setTimeout(0); // Disable timeout for this test
  let success = false;
  while (!success) {
    try {
      await checkTermin(page);
      success = true;
    } catch (error) {
      const currentTime = new Date().toLocaleString();
      console.error(`[${currentTime}] Error checking termin:`, error.message);
      await page.waitForTimeout(60000); // Wait for 1 minute before retrying
    }
  }
});

