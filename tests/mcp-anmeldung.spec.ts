import { test, expect } from '@playwright/test';

test('navigate and open Ummeldung/Abmeldung', async ({ page }) => {
  // 1. Navigate to the page
  await page.goto('https://terminvergabe.muelheim-ruhr.de/select2?md=9');

  // 2. Click on "Ablehnen" for cookies
  await page.getByRole('button', { name: 'Ablehnen' }).click();

  // 3. Expand the section of Meldewesen
  await page.getByRole('tab', { name: 'Meldewesen' }).click();

  // 4. Click on the plus button of Ummeldung / Abmeldung
  await page.getByRole('button', { name: 'Erhöhen der Anzahl des Anliegens Ummeldung / Abmeldung' }).click();

  // 5. Wait for 5 seconds
  await page.waitForTimeout(5000);

  // 6. Click on "Weiter" button
  await page.getByRole('button', { name: 'Weiter' }).click();

  // 7. Handle modal popup - check all checkboxes
  await page.evaluate(() => {
    const checkboxes = document.querySelectorAll('.documentlist_item_cb');
    checkboxes.forEach(cb => {
      cb.checked = true;
      cb.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });

  // 8. Click OK button in the modal
  await page.getByLabel('Weiter').click();

  // 9. Find "Nächster Termin" and extract the datetime
  // Wait for the location page to load
  await page.waitForURL(/.*location.*/);
  
  const nextAppointmentTerm = page.locator('dt').filter({ hasText: 'Nächster Termin' });
  await nextAppointmentTerm.waitFor({ state: 'visible', timeout: 10000 });

  // Get the corresponding definition (dd element) that follows the term
  const nextAppointmentValue = nextAppointmentTerm.locator('+ dd');
  const appointmentText = await nextAppointmentValue.textContent();

  // 10. Check if appointment is available and print accordingly
  if (appointmentText && appointmentText.trim() && !appointmentText.includes('nicht verfügbar') && !appointmentText.includes('keine')) {
    console.log(`✅ Appointment available: ${appointmentText.trim()}`);
  } else {
    console.log('❌ There is no slot available');
  }
});