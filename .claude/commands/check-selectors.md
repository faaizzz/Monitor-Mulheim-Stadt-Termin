---
description: Use Claude in Chrome to verify the Mülheim Termin portal's live selectors still match this repo's code, and fix any drift found.
---

This repo monitors `https://terminvergabe.muelheim-ruhr.de/select2?md=9` (Ausländeramt). It's a third-party site that **breaks selectors without warning** — we've already hit this once (the portal's internal `concerns_accordion-*` / `button-plus-*` element IDs regenerated, which is why `src/pages/AnliegenPage.ts` uses role-based selectors instead of those IDs). This command re-verifies the live site against the code and fixes anything that's drifted.

Load the Chrome browser tools if they're deferred:
`ToolSearch` with query `"select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__computer,mcp__claude-in-chrome__find,mcp__claude-in-chrome__get_page_text,mcp__claude-in-chrome__javascript_tool,mcp__claude-in-chrome__tabs_create_mcp"`

## What to check

1. **Tab names** — `src/anliegen-config.ts` has 8 distinct `tab` values (also see `TAB_SLUGS`). For each, confirm `page.getByRole('tab', { name: '<tab>' })` still resolves on the live site (use the `find` tool with the tab name, or `get_page_text` after navigating to `select2?md=9`).
2. **Anliegen button labels** — For each of the 49 entries in `ANLIEGEN_CONFIG`, the accessible label `Erhöhen der Anzahl des Anliegens <name>` must exist once its tab is expanded. You don't need to click through all 49 by hand — open each tab once, run `get_page_text`, and diff the "Anliegen ... ausgewählt" item names against the `name` fields in `anliegen-config.ts` for that tab. Flag any tab where the live list has added, removed, renamed, or reworded an item.
3. **Booking-flow selectors used by `src/pages/AnliegenPage.ts`** — after clicking through to the document-confirmation step for any one Anliegen, verify these still exist exactly as coded:
   - `#WeiterButton`
   - `#TevisDialog` (the `Hinweis` modal — note some Anliegen show no modal at all, which is expected, not a bug)
   - `.documentlist_item_cb` (checkbox class inside the modal)
   - `#OKButton`
   - the location/result page's `dl` structure at `//*[@id="suggest_location_content"]/form/dl/dd[4]` (the "Nächster Termin" value) — confirm the `dt`/`dd` ordering (Name, Anschrift, Entfernung, [Nächster Termin]) hasn't shifted.
4. Use `javascript_tool` to do quick structural checks (e.g. `document.querySelectorAll('.documentlist_item_cb').length`, `document.querySelector('#OKButton').id`) rather than relying only on screenshots.

## If something has drifted

- Update `src/anliegen-config.ts` (tab/name strings) and/or `src/pages/AnliegenPage.ts` (selectors) to match the live site. Also update `dashboard/src/tabSlugs.ts` if a tab name changed (it duplicates the tab list since the dashboard has no access to this repo's `src/`).
- Verify with `npx playwright test --list` (expect the same total count, no duplicates) and run the sequential monitor/sync briefly end-to-end, e.g.:
  `timeout 60 npx playwright test tests/notify-monitor.spec.ts --reporter=list`
- A `waiting for locator('text=Nächster Termin') to be visible` timeout on its own is **expected** (no slot currently available) — not a sign of drift. Only earlier-step failures (tab/button/Weiter/dialog not found) indicate a real selector break.

## Report back

Summarize: which of the 8 tabs and ~49 Anliegen were checked, what (if anything) had drifted, what was fixed, and the verification output. Keep it concise — a short pass/fail per tab, not a full transcript.
