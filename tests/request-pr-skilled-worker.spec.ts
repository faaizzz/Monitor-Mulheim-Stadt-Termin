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
  // await page.waitForSelector('#cookie_msg_btn_no', { timeout: 5000 });
  // await page.click('#cookie_msg_btn_no');

  await page.waitForSelector('#concerns_accordion-6956', { timeout: 5000 });
  await page.click('#concerns_accordion-6956');

  await page.waitForSelector('#button-plus-2584', { timeout: 5000 });
  await page.click('#button-plus-2584');

  await page.waitForSelector('#WeiterButton', { timeout: 5000 });
  await page.click('#WeiterButton');

  for (let i = 1; i <= 14; i++) {
    await page.click(`//*[@id="TevisDialog"]/div/div/div[2]/div/div[${i}]/div/label`);
  }

  await page.click('//*[@id="OKButton"]');

  await page.waitForSelector('text=Nächster Termin', { timeout: 5000 });
  const nextTerminExists = await page.isVisible('text=Nächster Termin');
  expect(nextTerminExists).toBeTruthy();
  if (nextTerminExists) {
    console.log('Next Termin for Settlement Permit exists');
    const content = await page.textContent('//*[@id="suggest_location_content"]/form/dl/dd[4]');
    console.log('Date Time:', content);
    console.log("\u0007");

    play.play('media/beep-extended.mp3', (err: any) => {
      if (err) console.error("Error playing audio:", err);
    });
    try {

      const inputMessage = "Next Termin for Request PR exists. Date Time: " + content;
      const tempFilePath = join(tmpdir(), 'shortcut-input.txt');
      writeFileSync(tempFilePath, inputMessage, 'utf8');
      
      // Step 2: Run the shortcut using --input-path
      const command = `shortcuts run "Send iMessage for Slot" --input-path "${tempFilePath}"`;
      // const output = execSync(command, { encoding: 'utf8' });
  
      // console.log(`Shortcut Output: ${output}`);
  } catch (error) {
      console.error(`Error running shortcut: ${error}`);
  }


  } else {
    console.log('Next Termin for Settlement Permit does not exist');
  }
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
      await page.waitForTimeout(60000); // Wait for 1 minute before retrying
    }
  }
});
