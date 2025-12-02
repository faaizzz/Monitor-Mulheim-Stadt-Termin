# Test Context - Mülheim Stadt Termin Automation

## Overview
Automated Playwright test for booking appointments on the Mülheim Stadt online appointment system.

## Test File
`tests/mcp-test.spec.ts`

## Test Flow

### Step 1: Navigation
- **URL**: `https://terminvergabe.muelheim-ruhr.de/select2?md=9`
- **Purpose**: Access the appointment booking system for Ausländeramt

### Step 2: Cookie Consent
- **Action**: Click "Ablehnen" button to decline cookies
- **Selector**: `getByRole('button', { name: 'Ablehnen' })`

### Step 3: Expand Meldewesen Section
- **Action**: Click on the "Meldewesen" tab to expand service options
- **Selector**: `getByRole('tab', { name: 'Meldewesen' })`

### Step 4: Select Ummeldung/Abmeldung Service
- **Action**: Click the plus (+) button to add "Ummeldung / Abmeldung" service
- **Selector**: `getByRole('button', { name: 'Erhöhen der Anzahl des Anliegens Ummeldung / Abmeldung' })`
- **Result**: Increments counter to 1 and enables "Weiter" button

### Step 5: Wait Period
- **Duration**: 5 seconds
- **Purpose**: Allow UI updates to complete

### Step 6: Proceed to Next Step
- **Action**: Click "Weiter" (Continue) button
- **Selector**: `getByRole('button', { name: 'Weiter' })`

### Step 7: Handle Document Requirements Modal
- **Modal Title**: "Hinweis" (Notice)
- **Required Documents**:
  1. Gültiger Nationalpass (Valid national passport)
  2. Wohnungsgeberbescheinigung im Original (Original landlord confirmation)
  3. Einverständniserklärung der Sorgeberechtigten (Consent declaration from legal guardians)
  4. ggf. Eigentumsnachweis (Property ownership proof if applicable)

- **Implementation**: Uses JavaScript evaluation to check all checkboxes
  ```javascript
  document.querySelectorAll('.documentlist_item_cb')
  ```
- **Note**: Direct clicking failed due to viewport/scrolling issues; JavaScript workaround resolves this

### Step 8: Confirm Modal
- **Action**: Click "OK" button (labeled as "Weiter")
- **Selector**: `getByLabel('Weiter')`
- **Result**: Navigates to location/appointment selection page

### Step 9: Extract Appointment Information
- **Page**: Step 3 of 6 - "Terminvorschläge - Standortauswahl"
- **Target Field**: "Nächster Termin" (Next Appointment)
- **URL Pattern**: Contains `/location`
- **Selector Strategy**:
  ```typescript
  page.locator('dt').filter({ hasText: 'Nächster Termin' })
  nextAppointmentTerm.locator('+ dd')
  ```

### Step 10: Display Results
- **Success Output**: `✅ Appointment available: [datetime]`
- **Example**: `✅ Appointment available: ab 09.02.2026, 11:45 Uhr`
- **No Slot Output**: `❌ There is no slot available`
- **Detection Logic**: Checks for keywords "nicht verfügbar" or "keine"

## Key Technical Details

### Selectors Used
- **Role-based selectors**: Preferred for accessibility and stability
  - `getByRole('button', { name: '...' })`
  - `getByRole('tab', { name: '...' })`
  - `getByLabel('...')`
- **CSS class selector**: `.documentlist_item_cb` (for modal checkboxes)
- **Locator with filter**: `page.locator('dt').filter({ hasText: '...' })`
- **Adjacent sibling**: `locator('+ dd')` (for definition list navigation)

### Known Issues & Workarounds

1. **Checkbox clicking issue**:
   - **Problem**: Checkboxes in modal are "outside of viewport" despite being visible
   - **Solution**: Use `page.evaluate()` with JavaScript to directly set checkbox states
   - **Code**:
     ```javascript
     cb.checked = true;
     cb.dispatchEvent(new Event('change', { bubbles: true }));
     ```

2. **Page loading detection**:
   - Use `waitForURL(/.*location.*/)` to ensure navigation completion before querying elements

### Console Messages (Expected)
- `ReferenceError: jQuery is not defined` - Harmless, page still functions
- `[ERROR] Failed to load resource: 404` - Some assets missing but doesn't affect test

## Test Execution

### Run Commands
```bash
# Headless mode
npx playwright test tests/mcp-test.spec.ts

# Headed mode (visible browser)
npx playwright test tests/mcp-test.spec.ts --headed

# With specific reporter
npx playwright test tests/mcp-test.spec.ts --reporter=list
```

### Expected Duration
~9-10 seconds in headless mode

### Success Criteria
- All steps execute without errors
- Appointment datetime is extracted and displayed
- Exit code 0 with "1 passed"

## Page Structure Reference

### Step 2 Page (Anliegen Selection)
- Tabs: Meldewesen, Allgemeine Ausländerangelegenheiten, etc.
- Each service has:
  - Minus button (initially disabled)
  - Number spinner
  - Plus button
  - Counter text

### Modal Dialog Structure
```
dialog[role="dialog"]
  └── Hinweis title
      ├── Information text
      ├── Required documents list
      │   └── .documentlist_item_cb checkboxes (4 total)
      ├── OK button (disabled until all checked)
      └── Abbrechen button
```

### Step 3 Page (Location Selection)
```
Definition list (dl)
  ├── dt: Name → dd: Ausländeramt
  ├── dt: Anschrift → dd: Leineweberstr. 18, 45468 Mülheim
  ├── dt: Entfernung → dd: (distance if calculated)
  └── dt: Nächster Termin → dd: ab [date], [time] Uhr
```

## Date Format
German format: `DD.MM.YYYY, HH:MM Uhr`
Example: `09.02.2026, 11:45 Uhr`

## Future Enhancements

### Potential Improvements
1. Add retry logic for transient failures
2. Parameterize service selection (currently hardcoded to Ummeldung/Abmeldung)
3. Add screenshot capture on failure
4. Parse datetime into structured object for further processing
5. Add notification/alerting when slots become available
6. Support multiple location selections
7. Add assertions with `expect()` statements

### Monitoring Use Case
This test can be scheduled to run periodically to:
- Check appointment availability
- Send alerts when new slots open
- Track slot availability patterns over time

## Dependencies
- `@playwright/test`
- Node.js runtime
- Chromium browser (installed via Playwright)

## Created
December 1, 2025

## Last Test Run
- **Status**: ✅ Passed
- **Output**: `✅ Appointment available: ab 09.02.2026, 11:45 Uhr`
- **Duration**: 9.2s
