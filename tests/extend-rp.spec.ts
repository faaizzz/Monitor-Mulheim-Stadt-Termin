import { test, expect } from '@playwright/test';
import player from 'play-sound';

const play = player();

async function checkTermin(page) {
  await page.goto('https://terminvergabe.muelheim-ruhr.de/select2?md=9');
  await expect(page).toHaveTitle(/Terminvergabe/);
  await page.waitForSelector('#cookie_msg_btn_no', { timeout: 5000 });
  await page.click('#cookie_msg_btn_no');

  await page.waitForSelector('#concerns_accordion-6956', { timeout: 5000 });
  await page.click('#concerns_accordion-6956');

  await page.waitForSelector('#button-plus-2603', { timeout: 5000 });
  await page.click('#button-plus-2603');

  await page.waitForSelector('#WeiterButton', { timeout: 5000 });
  await page.click('#WeiterButton');

  await page.click('//*[@id="TevisDialog"]/div/div/div[2]/div/div[1]/div/label');
  await page.click('//*[@id="TevisDialog"]/div/div/div[2]/div/div[2]/div/label');
  await page.click('//*[@id="TevisDialog"]/div/div/div[2]/div/div[3]/div/label');
  await page.click('//*[@id="TevisDialog"]/div/div/div[2]/div/div[4]/div/label');
  await page.click('//*[@id="TevisDialog"]/div/div/div[2]/div/div[5]/div/label');
  await page.click('//*[@id="TevisDialog"]/div/div/div[2]/div/div[6]/div/label');
  await page.click('//*[@id="TevisDialog"]/div/div/div[2]/div/div[7]/div/label');
  await page.click('//*[@id="TevisDialog"]/div/div/div[2]/div/div[8]/div/label');
  await page.click('//*[@id="TevisDialog"]/div/div/div[2]/div/div[9]/div/label');
  await page.click('//*[@id="TevisDialog"]/div/div/div[2]/div/div[10]/div/label');
  await page.click('//*[@id="TevisDialog"]/div/div/div[2]/div/div[11]/div/label');
  await page.click('//*[@id="TevisDialog"]/div/div/div[2]/div/div[12]/div/label');
  await page.click('//*[@id="TevisDialog"]/div/div/div[2]/div/div[13]/div/label');

  await page.click('//*[@id="OKButton"]');

  await page.waitForSelector('text=Nächster Termin', { timeout: 5000 });
  const nextTerminExists = await page.isVisible('text=Nächster Termin');
  expect(nextTerminExists).toBeTruthy();
  if (!nextTerminExists) {
    console.log('Next Termin for Extend RP does not exist');
  }
  else {
    console.log('Next Termin for Extend RP exists');
    const content = await page.textContent('//*[@id="suggest_location_content"]/form/dl/dd[4]');
    console.log('Date Time:', content);
    console.log("\u0007");

    play.play('media/beep-extended.mp3', (err: any) => {
      if (err) console.error("Error playing audio:", err);
    });
  }  
  
  // Add further steps to verify the behavior after clicking the button
}


test('Settlement Permit for Skilled Workers Termin', async ({ page }) => {
  test.setTimeout(0); // Disable timeout for this test
  let success = false;
  while (!success) {
    try {
      await checkTermin(page);
      success = true;
    } catch (error) {
      const currentTime = new Date().toLocaleString();
      console.error(`[${currentTime}] Error checking termin:`, error.message);
      await page.waitForTimeout(150000); // Wait for 5 minute before retrying
    }
  }
});
