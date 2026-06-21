# Monitor Mülheim Stadt Termin

A Playwright-based slot availability monitor that continuously checks for open appointments on the [Mülheim Stadt booking system](https://terminvergabe.muelheim-ruhr.de) and sends notifications when slots appear.

> **Note:** This is a monitor, not a test suite. Scripts run in infinite loops and alert when an appointment becomes available.

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

## Architecture

Monitoring for Ausländeramt covers all 49 appointment types ("Anliegen") offered across its 8 category tabs, built on a small Page Object Model so a selector fix in one place covers every monitor:

```
src/
  pages/AnliegenPage.ts   <- booking-flow Page Object (navigate, select Anliegen, confirm documents, read next Termin)
  notifier.ts             <- beep + terminal bell + Telegram on slot found
  telegram.ts             <- Telegram Bot API helper
  anliegen-config.ts      <- single source of truth: every {tab, name, slug} Anliegen
  anliegen-monitor.ts     <- shared test()-with-infinite-retry-loop runner
scripts/
  generate-anliegen-tests.js  <- (re)generates tests/anliegen/*.spec.ts from anliegen-config.ts
  run-all-monitors.js         <- spawns one independent process per monitor
tests/anliegen/*.spec.ts <- one thin generated spec file per Anliegen (49 total)
```

If the portal adds, removes, or renames an Anliegen, update `src/anliegen-config.ts` and re-run:
```bash
node scripts/generate-anliegen-tests.js
```

## Usage

There are no npm scripts — use `npx playwright` directly.

```bash
# Run a single monitor (one Anliegen)
npx playwright test tests/anliegen/meldewesen-anmeldung-einzelperson.spec.ts

# Run with visible browser
npx playwright test tests/anliegen/meldewesen-anmeldung-einzelperson.spec.ts --headed

# List every monitor available
npx playwright test --list

# Run every monitor at once, each as its own process (heavy: ~49 Chromium instances)
node scripts/run-all-monitors.js
```

Each monitor runs forever, polling every 60 seconds. `npx playwright test` without a path argument is **not** recommended for this repo's monitors — Playwright's worker pool is bounded (CPU core count by default), so a handful of monitors would run forever while the rest starve in the queue. Use `scripts/run-all-monitors.js` to run everything, since it gives each monitor its own OS process instead of relying on Playwright's worker pool.

Optionally filter by a cutoff date — only alerts if the next slot is **before** the given date:
```bash
BEFORE_DATE=2026-06-01 npx playwright test tests/anliegen/meldewesen-ummeldung-abmeldung.spec.ts
```
`BEFORE_DATE` accepts `YYYY-MM-DD` format. `run.js` wraps this as a `--before-date=YYYY-MM-DD` flag for any single spec file.

## Notifications

When a slot is found, a monitor triggers:
- **Audio**: plays `media/beep.wav`
- **Terminal**: bell character printed to console
- **Telegram**: message via `src/telegram.ts` (requires `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` env vars; silently skipped if unset)

## Notes

- The target site is third-party and not under our control — selectors can break without warning when the site updates. We've already seen this: the portal's internal `concerns_accordion-*` / `button-plus-*` element IDs regenerate periodically, which is why `AnliegenPage` uses role-based selectors (tab/button accessible names) instead of those IDs.
- Most Anliegen will show no slot most of the time. Seeing `waiting for locator('text=Nächster Termin') to be visible` time out in the logs is the expected, correct signal — it means "no slot yet," and the monitor will retry in 60 seconds.
- Scripts retry every 60 seconds on failure (including "no slot found").

## License

This project is licensed under the MIT License.
