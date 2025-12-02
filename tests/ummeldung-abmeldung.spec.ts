import { test, expect } from '@playwright/test';
import player from 'play-sound';
import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const play = player();

async function checkTermin(page) {
  await page.goto('https://terminvergabe.muelheim-ruhr.de/select2?md=9');
  await expect(page).toHaveTitle(/Terminvergabe/);
  await page.waitForSelector('//*[@id="cookie_msg_btn_no"]', { timeout: 5000 });
  await page.click('//*[@id="cookie_msg_btn_no"]');

  await page.waitForSelector('//div[.//h3[contains(text(), "Meldewesen")]]', { timeout: 5000 });
  await page.click('//div[.//h3[contains(text(), "Meldewesen")]]');

  await page.waitForSelector('#button-plus-2698', { timeout: 5000 });
  await page.click('#button-plus-2698');

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
  } else {
    console.log('Next Termin for Ummeldung / Abmeldung exists');
    const content = await page.textContent('//*[@id="suggest_location_content"]/form/dl/dd[4]');
    console.log('Date Time:', content);
    console.log("\u0007");

    play.play('media/beep.wav', (err: any) => {
      if (err) console.error("Error playing audio:", err);
    });

    try {

      const inputMessage = "Next Termin for Ummeldung / Abmeldung exists. Date Time: " + content;
      const tempFilePath = join(tmpdir(), 'shortcut-input.txt');
      writeFileSync(tempFilePath, inputMessage, 'utf8');
      
      // Step 2: Run the shortcut using --input-path
      const command = `shortcuts run "Send iMessage for Slot" --input-path "${tempFilePath}"`;
      // const output = execSync(command, { encoding: 'utf8' });
  
      // console.log(`Shortcut Output: ${output}`);
  } catch (error) {
      console.error(`Error running shortcut: ${error}`);
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
