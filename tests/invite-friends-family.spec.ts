import { test, expect } from '@playwright/test';
import player from 'play-sound';

const play = player();

test('Invite Friends and Family Termin', async ({ page }) => {
  await page.goto('https://terminvergabe.muelheim-ruhr.de/select2?md=9');
  await expect(page).toHaveTitle(/Terminvergabe/);
  await page.waitForSelector('#cookie_msg_btn_no', { timeout: 5000 });
  await page.click('#cookie_msg_btn_no');

  await page.waitForSelector('#concerns_accordion-6956', { timeout: 5000 });
  await page.click('#concerns_accordion-6956');

  await page.waitForSelector('#button-plus-2574', { timeout: 5000 });
  await page.click('#button-plus-2574');

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
  

  await page.waitForTimeout(3000);
  // Add further steps to verify the behavior after clicking the button
});

