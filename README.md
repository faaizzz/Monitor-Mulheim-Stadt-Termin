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
  generate-anliegen-tests.js  <- (re)generates tests/anliegen/<tab>/*.spec.ts from anliegen-config.ts
  run-all-monitors.js         <- spawns one independent process per monitor
tests/anliegen/<tab>/*.spec.ts <- one thin generated spec file per Anliegen, one subfolder per category tab (49 files across 8 folders)
```

If the portal adds, removes, or renames an Anliegen, update `src/anliegen-config.ts` and re-run:
```bash
node scripts/generate-anliegen-tests.js
```

## Monitors

All 49 Anliegen, grouped by the 8 category tabs on the portal. Each tab has its own folder under `tests/anliegen/`.

### Meldewesen — `tests/anliegen/meldewesen/`
- Anmeldung Einzelperson — `meldewesen-anmeldung-einzelperson`
- Anmeldung EU-Bürger — `meldewesen-anmeldung-eu-buerger`
- Anmeldung Familie — `meldewesen-anmeldung-familie`
- Ummeldung / Abmeldung — `meldewesen-ummeldung-abmeldung`

### Allgemeine Ausländerangelegenheiten — `tests/anliegen/allgemeine-aufenthalt/`
- Erteilung Aufenthaltserlaubnis oder BlueCard/EU — `allgemeine-aufenthalt-erteilung-aufenthaltserlaubnis-oder-bluecard-eu`
- Verlängerung Aufenthaltserlaubnis oder BlueCard/EU — `allgemeine-aufenthalt-verlaengerung-aufenthaltserlaubnis-oder-bluecard-eu`
- Auflagenänderung bzgl. Wohnsitznahme — `allgemeine-aufenthalt-auflagenaenderung-bzgl-wohnsitznahme`
- Auflagenänderung bzgl. Arbeit — `allgemeine-aufenthalt-auflagenaenderung-bzgl-arbeit`
- Verlängerung Fiktion — `allgemeine-aufenthalt-verlaengerung-fiktion`
- Ausstellung eines Reiseausweises nach der Genfer Konvention — `allgemeine-aufenthalt-ausstellung-reiseausweis-genfer-konvention`
- Erteilung Niederlassungserlaubnis — `allgemeine-aufenthalt-erteilung-niederlassungserlaubnis`
- Erteilung Niederlassungserlaubnis für Fachkräfte — `allgemeine-aufenthalt-erteilung-niederlassungserlaubnis-fachkraefte`
- Übertragung Aufenthaltserlaubnis / Niederlassungserlaubnis — `allgemeine-aufenthalt-uebertragung-aufenthaltserlaubnis-niederlassungserlaubnis`
- Ausstellung einer Aufenthaltskarte EU/Daueraufenthaltskarte — `allgemeine-aufenthalt-ausstellung-aufenthaltskarte-eu-daueraufenthaltskarte`
- Allgemeine Beratung — `allgemeine-aufenthalt-allgemeine-beratung`
- Elektronische Aufenthaltstitel (eAT) > Aktivierung Online Funktion / PIN-Änderung — `allgemeine-aufenthalt-elektronische-aufenthaltstitel-eat-aktivierung-online-pin`
- Abgabe einer Verpflichtungserklärung — `allgemeine-aufenthalt-abgabe-verpflichtungserklaerung`

### Bürger der Europäischen Union — `tests/anliegen/eu-buerger/`
- Beratung — `eu-buerger-beratung`
- Einreichen Dokumente EU-Bürger — `eu-buerger-einreichen-dokumente-eu-buerger`

### Visaangelegenheiten — `tests/anliegen/visa/`
- Anmeldung Einzelperson mit Visum — `visa-anmeldung-einzelperson-mit-visum`
- Anmeldung Familie mit Visum — `visa-anmeldung-familie-mit-visum`
- Beratung Familienzusammenführung — `visa-beratung-familienzusammenfuehrung`

### Mitarbeiter der Max-Planck-Institute — `tests/anliegen/max-planck/`
- Anmeldung — `max-planck-anmeldung`
- Ummeldung / Abmeldung — `max-planck-ummeldung-abmeldung`
- Erteilung Aufenthaltserlaubnis — `max-planck-erteilung-aufenthaltserlaubnis`
- Verlängerung Aufenthaltserlaubnis (Fiktion) — `max-planck-verlaengerung-aufenthaltserlaubnis-fiktion`
- Erteilung einer Niederlassungserlaubnis oder Blaue Karte EU — `max-planck-erteilung-niederlassungserlaubnis-oder-blaue-karte-eu`
- Allgemeine Beratung — `max-planck-allgemeine-beratung`

### Studierende und Anerkennung der Berufsqualifikation — `tests/anliegen/studierende/`
- Anmeldung — `studierende-anmeldung`
- Ummeldung / Abmeldung — `studierende-ummeldung-abmeldung`
- Erteilung Aufenthaltserlaubnis — `studierende-erteilung-aufenthaltserlaubnis`
- Verlängerung Aufenthaltserlaubnis — `studierende-verlaengerung-aufenthaltserlaubnis`
- Auflagenänderung (Wechsel Studium, Arbeit o.ä.) — `studierende-auflagenaenderung-wechsel-studium-arbeit`
- Neuausstellung oder Übertragung Aufenthaltserlaubnis — `studierende-neuausstellung-oder-uebertragung-aufenthaltserlaubnis`
- Erteilung einer Niederlassungserlaubnis oder Blaue Karte EU — `studierende-erteilung-niederlassungserlaubnis-oder-blaue-karte-eu`
- Allgemeine Beratung — `studierende-allgemeine-beratung`
- Elektronische Aufenthaltstitel (eAT) > Aktivierung Online Funktion / PIN-Änderung — `studierende-elektronische-aufenthaltstitel-eat-aktivierung-online-pin`
- Abgabe einer Verpflichtungserklärung zur Sicherung des Lebensunterhaltesbei Studierenden — `studierende-abgabe-verpflichtungserklaerung-lebensunterhalt`

### Einbürgerung — `tests/anliegen/einbuergerung/`
- Beratung zur Einbürgerung — `einbuergerung-beratung-zur-einbuergerung`
- Abgabe des Einbürgerungsantrages — `einbuergerung-abgabe-einbuergerungsantrag`

### Asylangelegenheiten und Rückkehrmanagement — `tests/anliegen/asyl/`
- Beratung allgemein — `asyl-beratung-allgemein`
- Beratung freiwillige Ausreise — `asyl-beratung-freiwillige-ausreise`
- Ersterteilung einer Aufenthaltsgestattung — `asyl-ersterteilung-aufenthaltsgestattung`
- Verlängerung einer Aufenthaltsgestattung — `asyl-verlaengerung-aufenthaltsgestattung`
- Erteilung einer Duldung — `asyl-erteilung-duldung`
- Verlängerung einer Duldung — `asyl-verlaengerung-duldung`
- Änderung der Arbeitsauflage (Duldung oder Aufenthaltsgestattung) — `asyl-aenderung-arbeitsauflage`
- Antrag auf Streichung der Wohnsitzauflage (Duldung oder Aufenthaltsgestattung) — `asyl-antrag-streichung-wohnsitzauflage`
- Beantragung der Ersterteilung einer Aufenthaltserlaubnis — `asyl-beantragung-ersterteilung-aufenthaltserlaubnis`

## Usage

There are no npm scripts — use `npx playwright` directly.

```bash
# Run a single monitor (one Anliegen)
npx playwright test tests/anliegen/meldewesen/meldewesen-anmeldung-einzelperson.spec.ts

# Run with visible browser
npx playwright test tests/anliegen/meldewesen/meldewesen-anmeldung-einzelperson.spec.ts --headed

# List every monitor available
npx playwright test --list

# Run every monitor at once, each as its own process (heavy: ~49 Chromium instances)
node scripts/run-all-monitors.js
```

Each monitor runs forever, polling every 10 minutes by default — override with `MONITOR_INTERVAL_MS` (milliseconds) in `.env`. `npx playwright test` without a path argument is **not** recommended for this repo's monitors — Playwright's worker pool is bounded (CPU core count by default), so a handful of monitors would run forever while the rest starve in the queue. Use `scripts/run-all-monitors.js` to run everything, since it gives each monitor its own OS process instead of relying on Playwright's worker pool.

Optionally filter by a cutoff date — only alerts if the next slot is **before** the given date:
```bash
BEFORE_DATE=2026-06-01 npx playwright test tests/anliegen/meldewesen/meldewesen-ummeldung-abmeldung.spec.ts
```
`BEFORE_DATE` accepts `YYYY-MM-DD` format. `run.js` wraps this as a `--before-date=YYYY-MM-DD` flag for any single spec file.

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
- `monitor` — the existing 49 notification monitors (`scripts/run-all-monitors.js`), unchanged.
- `sync` — the Supabase sync job (`tests/availability-sync.spec.ts`).
- `dashboard` — the React app, built and served via nginx.

`monitor` and `sync` share the root `Dockerfile`; `dashboard` has its own under `dashboard/Dockerfile`.

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
   `playwright.config.ts` loads `.env` automatically (via `dotenv`), so every monitor — including all 49 spawned by `scripts/run-all-monitors.js` — picks it up without re-exporting anything.

## Notes

- The target site is third-party and not under our control — selectors can break without warning when the site updates. We've already seen this: the portal's internal `concerns_accordion-*` / `button-plus-*` element IDs regenerate periodically, which is why `AnliegenPage` uses role-based selectors (tab/button accessible names) instead of those IDs.
- Most Anliegen will show no slot most of the time. Seeing `waiting for locator('text=Nächster Termin') to be visible` time out in the logs is the expected, correct signal — it means "no slot yet," and the monitor will retry after `MONITOR_INTERVAL_MS` (default 10 minutes).
- Scripts retry on failure (including "no slot found") after `MONITOR_INTERVAL_MS`, default 10 minutes.

## License

This project is licensed under the MIT License.
