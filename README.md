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

## Monitors

All 49 Anliegen, grouped by the 8 category tabs on the portal. Each maps to `tests/anliegen/<slug>.spec.ts`.

### Meldewesen
- Anmeldung Einzelperson — `meldewesen-anmeldung-einzelperson`
- Anmeldung EU-Bürger — `meldewesen-anmeldung-eu-buerger`
- Anmeldung Familie — `meldewesen-anmeldung-familie`
- Ummeldung / Abmeldung — `meldewesen-ummeldung-abmeldung`

### Allgemeine Ausländerangelegenheiten
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

### Bürger der Europäischen Union
- Beratung — `eu-buerger-beratung`
- Einreichen Dokumente EU-Bürger — `eu-buerger-einreichen-dokumente-eu-buerger`

### Visaangelegenheiten
- Anmeldung Einzelperson mit Visum — `visa-anmeldung-einzelperson-mit-visum`
- Anmeldung Familie mit Visum — `visa-anmeldung-familie-mit-visum`
- Beratung Familienzusammenführung — `visa-beratung-familienzusammenfuehrung`

### Mitarbeiter der Max-Planck-Institute
- Anmeldung — `max-planck-anmeldung`
- Ummeldung / Abmeldung — `max-planck-ummeldung-abmeldung`
- Erteilung Aufenthaltserlaubnis — `max-planck-erteilung-aufenthaltserlaubnis`
- Verlängerung Aufenthaltserlaubnis (Fiktion) — `max-planck-verlaengerung-aufenthaltserlaubnis-fiktion`
- Erteilung einer Niederlassungserlaubnis oder Blaue Karte EU — `max-planck-erteilung-niederlassungserlaubnis-oder-blaue-karte-eu`
- Allgemeine Beratung — `max-planck-allgemeine-beratung`

### Studierende und Anerkennung der Berufsqualifikation
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

### Einbürgerung
- Beratung zur Einbürgerung — `einbuergerung-beratung-zur-einbuergerung`
- Abgabe des Einbürgerungsantrages — `einbuergerung-abgabe-einbuergerungsantrag`

### Asylangelegenheiten und Rückkehrmanagement
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
