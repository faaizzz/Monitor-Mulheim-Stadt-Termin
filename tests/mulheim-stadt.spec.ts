import { test, expect } from '@playwright/test';

test('Check for Terminvergabe title', async ({ page }) => {
  await page.goto('https://terminvergabe.muelheim-ruhr.de/select2?md=9');
  await expect(page).toHaveTitle(/Terminvergabe/);
});


test('Ummeldung / Abmeldung Termin', async ({ page }) => {
  await page.goto('https://terminvergabe.muelheim-ruhr.de/select2?md=9');
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
  console.log('Next Termin exists');
  
  

  await page.waitForTimeout(3000);
  // Add further steps to verify the behavior after clicking the button
});

