// Mirrors src/anliegen-config.ts:TAB_SLUGS in the monitoring repo. Duplicated
// here because the dashboard is a standalone app with no access to that
// repo's src/ — this is 8 static strings that rarely change.
export const TAB_ORDER: string[] = [
  'Meldewesen',
  'Allgemeine Ausländerangelegenheiten',
  'Bürger der Europäischen Union',
  'Visaangelegenheiten',
  'Mitarbeiter der Max-Planck-Institute',
  'Studierende und Anerkennung der Berufsqualifikation',
  'Einbürgerung',
  'Asylangelegenheiten und Rückkehrmanagement',
];
