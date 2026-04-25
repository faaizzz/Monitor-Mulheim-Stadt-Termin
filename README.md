# Monitor Mülheim Stadt Termin

A Playwright-based slot availability monitor that continuously checks for open appointments on the [Mülheim Stadt booking system](https://terminvergabe.muelheim-ruhr.de) and sends notifications when slots appear.

> **Note:** This is a monitor, not a test suite. Scripts run in infinite loops and alert when an appointment becomes available.

## Current Availability

| Appointment Type | Next Available |
|---|---|
| Anmeldung Einzelperson (Ausländeramt) | ab 30.06.2026, 08:30 Uhr |

## Prerequisites

- Node.js (v16 or later)
- npm

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd Monitor-Mulheim-Stadt-Termin
   ```
3. Install dependencies:
   ```bash
   npm install
   npx playwright install --with-deps
   ```

## Usage

There are no npm scripts — use `npx playwright` directly.

```bash
# Run all monitors
npx playwright test

# Run a specific monitor
npx playwright test tests/extend-rp.spec.ts

# Run with visible browser
npx playwright test tests/extend-rp.spec.ts --headed

# View HTML report after run
npx playwright show-report
```

## Monitors

- **Extend RP Slots**:
  ```bash
  npx playwright test tests/extend-rp.spec.ts
  ```

- **Ummeldung/Abmeldung Slots**:
  ```bash
  npx playwright test tests/ummeldung-abmeldung.spec.ts
  ```
  Optionally filter by a cutoff date — only alerts if the next slot is **before** the given date:
  ```bash
  BEFORE_DATE=2026-06-01 npx playwright test tests/ummeldung-abmeldung.spec.ts
  ```
  `BEFORE_DATE` accepts `YYYY-MM-DD` format.

- **Request PR Skilled Worker Slots**:
  ```bash
  npx playwright test tests/request-pr-skilled-worker.spec.ts
  ```

- **Invite Friends/Family Slots**:
  ```bash
  npx playwright test tests/invite-friends-family.spec.ts
  ```

## Notifications

When a slot is found, monitors trigger:
- **Audio**: plays `media/beep.wav` or `media/beep-extended.mp3`
- **Terminal**: bell character printed to console
- **iMessage**: macOS `shortcuts run "Send iMessage for Slot"` (requires Shortcuts setup)

## Project Structure

```
playwright.config.ts
package.json
media/
    beep.wav
    beep-extended.mp3
tests/
    extend-rp.spec.ts
    invite-friends-family.spec.ts
    request-pr-skilled-worker.spec.ts
    ummeldung-abmeldung.spec.ts
playwright-report/
test-results/
```

## Notes

- The target site is third-party and not under our control — selectors (especially XPaths) can break without warning when the site updates. If a monitor stops working, check whether the page structure has changed.
- Scripts retry every 60 seconds on failure.
- Session info and IPC with macOS Shortcuts is handled via temp files in the OS temp directory.

## License

This project is licensed under the MIT License.
