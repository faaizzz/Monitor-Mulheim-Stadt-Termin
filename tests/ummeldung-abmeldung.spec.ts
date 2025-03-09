import { test, expect } from '@playwright/test';
import player from 'play-sound';

const play = player();

test('Ummeldung / Abmeldung Termin', async ({ page }) => {
  await page.goto('https://terminvergabe.muelheim-ruhr.de/select2?md=9');
  await expect(page).toHaveTitle(/Terminvergabe/);
  await page.waitForSelector('#cookie_msg_btn_no', { timeout: 5000 });
  await page.click('#cookie_msg_btn_no');

  await page.waitForSelector('#concerns_accordion-6953', { timeout: 5000 });
  await page.click('#concerns_accordion-6953');

  await page.waitForSelector('#button-plus-2538', { timeout: 5000 });
  await page.click('#button-plus-2538');

  await page.waitForSelector('#WeiterButton', { timeout: 5000 });
  await page.click('#WeiterButton');

  await page.click('//*[@id="TevisDialog"]/div/div/div[2]/div/div[1]/div/label');
  await page.click('//*[@id="TevisDialog"]/div/div/div[2]/div/div[2]/div/label');
  await page.click('//*[@id="TevisDialog"]/div/div/div[2]/div/div[3]/div/label');

  await page.click('//*[@id="OKButton"]');

  await page.waitForSelector('text=Nächster Termin', { timeout: 5000 });
  const nextTerminExists = await page.isVisible('text=Nächster Termin');
  expect(nextTerminExists).toBeTruthy();
  if (!nextTerminExists) {
    console.log('Next Termin does not exist');
  }
  else {
    console.log('Next Termin for Ummeldung / Abmeldung exists');
    const content = await page.textContent('//*[@id="suggest_location_content"]/form/dl/dd[4]');
    console.log('Date Time:', content);
    console.log("\u0007");

    play.play('media/beep.mp3', (err: any) => {
      if (err) console.error("Error playing audio:", err);
    });
  }  
  

  await page.waitForTimeout(3000);
  // Add further steps to verify the behavior after clicking the button
});

