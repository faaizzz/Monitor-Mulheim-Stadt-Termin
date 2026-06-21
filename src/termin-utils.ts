// Optional: set BEFORE_DATE=YYYY-MM-DD env var to only alert when slot is before that date
export function parseTerminDate(text: string): Date | null {
  const match = text.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (!match) return null;
  const [, day, month, year] = match;
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

// "Nächster Termin" timing out is the expected signal for "no slot right
// now" (see CLAUDE.md). Any other failure (tab/button/Weiter/dialog not
// found) means a selector actually broke — report those as real errors.
export function classifyFailure(message: string): 'no-slot' | 'error' {
  return message.includes('Nächster Termin') ? 'no-slot' : 'error';
}
