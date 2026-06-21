# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

This is a Playwright-based **slot availability monitor** — not a test suite — that continuously checks for open appointments (Termine) on the Mülheim Stadt booking system (`terminvergabe.muelheim-ruhr.de`) and sends notifications when slots appear.

The target webapp is third-party and not under our control, so **selectors can break without warning** whenever the site updates. We've already hit this once: the portal's internal `concerns_accordion-*` / `button-plus-*` element IDs regenerate periodically (observed changing between sessions), which is why the Page Object uses role-based selectors (tab/button accessible names) instead of those IDs. When a monitor stops working, the first thing to check is whether the page structure or accessible labels have changed.

## Commands

```bash
# Install dependencies
npm install
npx playwright install --with-deps

# Run a single monitor
npx playwright test tests/anliegen/meldewesen/meldewesen-anmeldung-einzelperson.spec.ts

# Run with visible browser
npx playwright test tests/anliegen/meldewesen/meldewesen-anmeldung-einzelperson.spec.ts --headed

# List every monitor
npx playwright test --list

# Run every monitor at once, each as its own OS process
node scripts/run-all-monitors.js

# Regenerate tests/anliegen/<tab>/*.spec.ts after editing src/anliegen-config.ts
node scripts/generate-anliegen-tests.js

# One-shot: check all 49 Anliegen exactly once (no retrying) and generate a report
npx playwright test tests/availability-report.spec.ts

# View HTML report after run
npx playwright show-report
```

There are no npm scripts — use `npx playwright` directly, or the scripts above for multi-monitor orchestration.

**Do not run `npx playwright test` with no path argument.** Playwright's worker pool is bounded (CPU core count by default); since every monitor loops forever, only `workers`-many would ever run while the rest starve in the queue. Use `scripts/run-all-monitors.js` instead — it spawns one independent process per monitor.

## Architecture

Ausländeramt (`md=9`) offers 49 appointment types ("Anliegen") across 8 category tabs. Rather than duplicating the navigate/select/confirm/notify flow 49 times, it's built as a Page Object Model:

- `src/pages/AnliegenPage.ts` — the booking-flow Page Object: `open()`, `selectAnliegen(tab, name)`, `confirmDocumentsIfPresent()`, `getNextTermin()`.
- `src/anliegen-config.ts` — single source of truth: every `{ tab, name, slug }` Anliegen, plus `TAB_SLUGS` (tab name → folder name). `name` must match the live site's `Erhöhen der Anzahl des Anliegens <name>` accessible button label exactly.
- `src/fetch-next-termin.ts` — `fetchNextTermin(page, config)`: the single-attempt booking-flow call (`open` → `selectAnliegen` → `confirmDocumentsIfPresent` → `getNextTermin`), shared by both the infinite monitors and the one-shot report below. Throws if no slot / a selector breaks.
- `src/anliegen-monitor.ts` — `defineAnliegenMonitor(config)`: registers one Playwright `test()` per Anliegen with the infinite 60s-retry loop (reads `BEFORE_DATE` env var to optionally skip slots on/after a cutoff date). A found (and date-filter-passing) slot is terminal — notification failures are caught/logged but don't trigger re-running the flow.
- `src/notifier.ts` — beep + terminal bell + Telegram on slot found.
- `tests/anliegen/<tab>/<slug>.spec.ts` — 49 generated files in 8 per-tab folders, each just importing a config entry by slug and calling `defineAnliegenMonitor`. Regenerate with `scripts/generate-anliegen-tests.js` if `anliegen-config.ts` changes.
- `tests/availability-report.spec.ts` — one Playwright `test()` that calls `fetchNextTermin` for all 49 Anliegen exactly once (no retry loop), classifies each as `available`/`no-slot`/`error`, prints a console summary grouped by tab, and saves `reports/availability-report-<timestamp>.{md,json}` (gitignored).
- `scripts/run-all-monitors.js` — spawns each generated spec file as its own `npx playwright test <file>` child process.

### Flow per Anliegen

1. `open()` — navigate to the appointment URL, decline cookies if prompted
2. `selectAnliegen(tab, name)` — click the tab, click the "Erhöhen der Anzahl..." button for that Anliegen, click Weiter. Uses `exact: true` on both `getByRole` calls — several Anliegen names are text-prefixes of another in the same tab (e.g. "Erteilung Niederlassungserlaubnis" vs "...für Fachkräfte"), and Playwright's default substring name-matching would otherwise hit a strict-mode "resolved to 2 elements" error.
3. `confirmDocumentsIfPresent()` — if the `Hinweis` modal (`#TevisDialog`) appears, check every `.documentlist_item_cb` via `page.evaluate` (direct click fails — checkboxes report "outside viewport" despite being visible) and click `#OKButton`. Some Anliegen show no modal at all; this step is a no-op then.
4. `getNextTermin()` — wait for `text=Nächster Termin`, read the date from `dl/dd[4]`

### Expected behavior, not a bug

Most Anliegen have no open slot most of the time. `getNextTermin()` timing out — logged as `waiting for locator('text=Nächster Termin') to be visible`, `Timeout 5000ms exceeded` — is the **expected, correct signal**, not a failure: it means "no slot yet," and the monitor's retry loop will check again in 60 seconds. Don't "fix" this unless the timeout happens at an *earlier* step (tab/button/Weiter/dialog) — that would indicate real selector drift.

### Notification Stack

- **Audio**: `play-sound` plays `media/beep.wav`
- **Terminal**: Bell character (``) printed to console
- **Telegram**: `src/telegram.ts`, requires `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` env vars (silently skipped if unset)

### Key Files

- `playwright.config.ts` — Chromium only, HTML reporter, 2 retries on CI
- `src/anliegen-config.ts` — add/remove/rename an Anliegen here, then regenerate
- `media/` — audio notification files
