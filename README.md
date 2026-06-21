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

Monitoring for Ausländeramt covers all 49 appointment types ("Anliegen") offered across its 8 category tabs, built on a small Page Object Model so a selector fix in one place covers every check:

```
src/
  pages/AnliegenPage.ts   <- booking-flow Page Object (navigate, select Anliegen, confirm documents, read next Termin)
  fetch-next-termin.ts    <- single-attempt booking-flow call, shared by every script below
  notifier.ts             <- beep + terminal bell + Telegram on slot found
  telegram.ts             <- Telegram Bot API helper
  anliegen-config.ts      <- single source of truth: every {tab, name, slug} Anliegen
  notify-monitor.ts       <- transition-detection + notify logic, shared by the sequential monitor below
  termin-utils.ts         <- parseTerminDate/classifyFailure, pure helpers shared by every script below
tests/
  notify-monitor.spec.ts      <- the notification monitor: infinite loop, one sequential sweep of all 49 per pass
  availability-report.spec.ts <- one-shot sequential check of all 49, no retrying
  availability-sync.spec.ts   <- Supabase sync job: infinite loop, one sequential sweep of all 49 per pass
```

All three `tests/*.spec.ts` scripts above reuse the same single-attempt `fetchNextTermin` and run a single Chromium browser sequentially over the 49 Anliegen — no parallel browser instances, so they're cheap enough to run continuously on a small VPS.

If the portal adds, removes, or renames an Anliegen, update `src/anliegen-config.ts` (and `dashboard/src/tabSlugs.ts` if a tab name changed).

## Monitors

All 49 Anliegen monitored, grouped by the 8 category tabs on the portal:

### Meldewesen
- Anmeldung Einzelperson, Anmeldung EU-Bürger, Anmeldung Familie, Ummeldung / Abmeldung

### Allgemeine Ausländerangelegenheiten
- Erteilung/Verlängerung Aufenthaltserlaubnis oder BlueCard/EU, Auflagenänderung (Wohnsitznahme/Arbeit), Verlängerung Fiktion, Ausstellung Reiseausweis (Genfer Konvention), Erteilung Niederlassungserlaubnis (allgemein/Fachkräfte), Übertragung Aufenthaltserlaubnis/Niederlassungserlaubnis, Ausstellung Aufenthaltskarte EU/Daueraufenthaltskarte, Allgemeine Beratung, eAT-Aktivierung/PIN-Änderung, Abgabe Verpflichtungserklärung

### Bürger der Europäischen Union
- Beratung, Einreichen Dokumente EU-Bürger

### Visaangelegenheiten
- Anmeldung Einzelperson/Familie mit Visum, Beratung Familienzusammenführung

### Mitarbeiter der Max-Planck-Institute
- Anmeldung, Ummeldung / Abmeldung, Erteilung Aufenthaltserlaubnis, Verlängerung Aufenthaltserlaubnis (Fiktion), Erteilung Niederlassungserlaubnis oder Blaue Karte EU, Allgemeine Beratung

### Studierende und Anerkennung der Berufsqualifikation
- Anmeldung, Ummeldung / Abmeldung, Erteilung/Verlängerung Aufenthaltserlaubnis, Auflagenänderung, Neuausstellung/Übertragung Aufenthaltserlaubnis, Erteilung Niederlassungserlaubnis oder Blaue Karte EU, Allgemeine Beratung, eAT-Aktivierung/PIN-Änderung, Abgabe Verpflichtungserklärung

### Einbürgerung
- Beratung zur Einbürgerung, Abgabe des Einbürgerungsantrages

### Asylangelegenheiten und Rückkehrmanagement
- Beratung (allgemein/freiwillige Ausreise), Ersterteilung/Verlängerung Aufenthaltsgestattung, Erteilung/Verlängerung Duldung, Änderung Arbeitsauflage, Antrag Streichung Wohnsitzauflage, Beantragung Ersterteilung Aufenthaltserlaubnis

See `src/anliegen-config.ts` for the exact `{tab, name, slug}` for each.

## Usage

There are no npm scripts — use `npx playwright` directly.

```bash
# Run the notification monitor: infinite loop, sequential sweep of all 49 Anliegen per pass
npx playwright test tests/notify-monitor.spec.ts

# Run with visible browser
npx playwright test tests/notify-monitor.spec.ts --headed
```

Each pass sweeps all 49 Anliegen sequentially in one browser, then sleeps `MONITOR_INTERVAL_MS` (default 600000 = 10 minutes) before the next pass — override in `.env`. Notifies once per Anliegen per transition into `available` (so it notifies again if a slot disappears and a new one opens later).

Optionally filter by a cutoff date — only notifies if the next slot is **before** the given date:
```bash
BEFORE_DATE=2026-06-01 npx playwright test tests/notify-monitor.spec.ts
```
`BEFORE_DATE` accepts `YYYY-MM-DD` format and applies to every Anliegen in the sweep.

### One-shot availability report (all 49, no retrying)

Unlike the monitors above (which loop forever), this checks every Anliegen exactly once and exits:
```bash
npx playwright test tests/availability-report.spec.ts
```
Takes several minutes (one sequential pass through all 49). Prints a summary grouped by tab to the console, and saves a timestamped `reports/availability-report-<timestamp>.{md,json,html}` (gitignored). Each item is classified `available` (with the Termin date), `no-slot` (the expected "Nächster Termin" timeout), or `error` (anything else — a real selector break worth investigating). Open the `.html` file in a browser for a readable, color-coded view grouped by tab; the `.json` is for programmatic use.

### Supabase sync job (persisted history)

Unlike the monitors (which stop after finding a slot) and the one-shot report (which exits), `tests/availability-sync.spec.ts` loops forever like a monitor but sweeps **all 49 Anliegen** once per pass and writes the result to Supabase instead of notifying:
```bash
npx playwright test tests/availability-sync.spec.ts
```
Each pass upserts one row per Anliegen into `current_status` (always-fresh snapshot) and appends a row to `availability_events` only when a status actually changed since the last pass (so restarting the job doesn't create spurious history). See `supabase/migrations/0001_availability_schema.sql` for the schema, and the [`dashboard/`](dashboard/) app for a UI on top of it. Requires `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env` — see "Supabase setup" below. Sweep gap defaults to 10 minutes; override with `SYNC_GAP_MS` (milliseconds) in `.env`.

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open the SQL editor and run `supabase/migrations/0001_availability_schema.sql`.
3. From Project Settings → API, copy the Project URL, `anon` key, and `service_role` key into `.env` (see `.env.example`):
   ```
   SUPABASE_URL=
   SUPABASE_SERVICE_ROLE_KEY=
   SUPABASE_ANON_KEY=
   ```
   The sync job uses the service-role key (server-side, full write access). The dashboard uses the anon key (read-only — RLS only grants `select` to `anon`/`authenticated`).

## Dashboard

`dashboard/` is a standalone Vite + React + TypeScript app reading directly from Supabase (not from this repo's monitors/sync job at runtime):
- **Current Status** (`/`) — all 49 Anliegen grouped by tab, live via Supabase Realtime on `current_status`.
- **Historical Analysis** (`/history`) — charts (availability frequency per tab, average availability-window duration, error counts per Anliegen) plus a filterable recent-events table, from `availability_events` and the `availability_windows`/`daily_availability_summary` views.

```bash
cd dashboard
cp .env.example .env   # fill in VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

## Docker

Three independent services, defined in `docker-compose.yml`:
- `monitor` — the notification monitor (`tests/notify-monitor.spec.ts`), one sequential sweep per pass.
- `sync` — the Supabase sync job (`tests/availability-sync.spec.ts`).
- `dashboard` — the React app, built and served via nginx.

`monitor` and `sync` share the root `Dockerfile`; `dashboard` has its own under `dashboard/Dockerfile`. Both `monitor` and `sync` run a single Chromium browser sequentially — safe to run together even on a small (2 vCPU / 8GB) VPS.

```bash
cp .env.example .env      # TELEGRAM_*, SUPABASE_*
docker compose up --build
```
The dashboard build inlines `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` at build time (via `docker-compose.yml` build args from `.env`) — changing them requires `docker compose build dashboard`, not just a restart.

## Notifications

When a slot is found, a monitor triggers:
- **Audio**: plays `media/beep.wav`
- **Terminal**: bell character printed to console
- **Telegram**: message via `src/telegram.ts` (silently skipped if not configured)

### Setting up Telegram alerts

1. In Telegram, message [@BotFather](https://t.me/BotFather), send `/newbot`, and follow the prompts. It replies with a token — that's `TELEGRAM_BOT_TOKEN`.
2. Send any message to your new bot, then visit `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates` and find `"chat":{"id":...}` — that's `TELEGRAM_CHAT_ID`. (For a group, add the bot to the group first; group chat IDs are negative.)
3. Copy `.env.example` to `.env` and fill in both values:
   ```bash
   cp .env.example .env
   ```
   `playwright.config.ts` loads `.env` automatically (via `dotenv`), so the monitor picks it up without re-exporting anything.

## Notes

- The target site is third-party and not under our control — selectors can break without warning when the site updates. We've already seen this: the portal's internal `concerns_accordion-*` / `button-plus-*` element IDs regenerate periodically, which is why `AnliegenPage` uses role-based selectors (tab/button accessible names) instead of those IDs.
- Most Anliegen will show no slot most of the time. Seeing `waiting for locator('text=Nächster Termin') to be visible` time out in the logs is the expected, correct signal — it means "no slot yet," and the monitor will retry after `MONITOR_INTERVAL_MS` (default 10 minutes).
- Scripts retry on failure (including "no slot found") after `MONITOR_INTERVAL_MS`, default 10 minutes.

## License

This project is licensed under the MIT License.
