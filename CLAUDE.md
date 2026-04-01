# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

This is a Playwright-based **slot availability monitor** — not a test suite — that continuously checks for open appointments (Termine) on the Mülheim Stadt booking system (`terminvergabe.muelheim-ruhr.de`) and sends notifications when slots appear.

The target webapp is third-party and not under our control, so **selectors (especially XPaths) can break without warning** whenever the site updates. When a script stops working, the first thing to check is whether the page structure has changed and selectors need updating.

## Commands

```bash
# Install dependencies
npm install
npx playwright install --with-deps

# Run all tests
npx playwright test

# Run a single test file
npx playwright test tests/invite-friends-family.spec.ts

# Run with visible browser
npx playwright test tests/extend-rp.spec.ts --headed

# View HTML report after run
npx playwright show-report
```

There are no npm scripts — use `npx playwright` directly.

## Architecture

### Two Generations of Tests

**Legacy tests** (`extend-rp.spec.ts`, `ummeldung-abmeldung.spec.ts`, `request-pr-skilled-worker.spec.ts`, `invite-friends-family.spec.ts`):
- Use XPath and ID selectors
- Contain infinite retry loops (60-second intervals on failure)
- Play audio alerts via `play-sound` library (`media/beep.wav`)
- Invoke macOS Shortcut (`shortcuts run "Send iMessage for Slot"`) to send notifications
- Write temp files to OS temp dir for IPC with macOS Shortcuts

**MCP tests** (`mcp-anmeldung.spec.ts`, `mcp-invite-friends-family.spec.ts`):
- Use Playwright role-based selectors (`getByRole`, `getByLabel`)
- Use `page.evaluate()` for complex DOM interactions
- Cleaner structure, no retry loops

### Common Test Flow

Each test navigates through the same booking system steps:
1. Navigate to the appointment URL
2. Accept cookies
3. Click through service tabs to find the target appointment type
4. Check required document checkboxes in the modal
5. Extract the next available appointment datetime from the DOM
6. Display/notify when a slot is found; retry after 60s on failure

### Notification Stack (Legacy Tests)

- **Audio**: `play-sound` plays `media/beep.wav` or `media/beep-extended.mp3`
- **Terminal**: Bell character (`\u0007`) is printed to the console
- **iMessage**: macOS `shortcuts run` command triggers an iMessage Shortcut

### Key Files

- `playwright.config.ts` — Chromium only, HTML reporter, 2 retries on CI
- `TEST_CONTEXT.md` — Detailed selector reference, known issues, and page structure
- `media/` — Audio notification files
