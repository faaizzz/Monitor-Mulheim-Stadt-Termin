export interface AnliegenConfig {
  tab: string;
  name: string;
  slug: string;
}

// Folder name under tests/anliegen/ for each category tab.
export const TAB_SLUGS: Record<string, string> = {
  'Meldewesen': 'meldewesen',
  'Allgemeine Ausländerangelegenheiten': 'allgemeine-aufenthalt',
  'Bürger der Europäischen Union': 'eu-buerger',
  'Visaangelegenheiten': 'visa',
  'Mitarbeiter der Max-Planck-Institute': 'max-planck',
  'Studierende und Anerkennung der Berufsqualifikation': 'studierende',
  'Einbürgerung': 'einbuergerung',
  'Asylangelegenheiten und Rückkehrmanagement': 'asyl',
};

// Full enumeration of every appointment type ("Anliegen") offered for
// Ausländeramt (md=9) at https://terminvergabe.muelheim-ruhr.de/select2?md=9,
// grouped by category tab. `name` must match the live site's
// "Erhöhen der Anzahl des Anliegens <name>" accessible button label exactly.
export const ANLIEGEN_CONFIG: AnliegenConfig[] = [
  // Meldewesen
  { tab: 'Meldewesen', name: 'Anmeldung Einzelperson', slug: 'meldewesen-anmeldung-einzelperson' },
  { tab: 'Meldewesen', name: 'Anmeldung EU-Bürger', slug: 'meldewesen-anmeldung-eu-buerger' },
  { tab: 'Meldewesen', name: 'Anmeldung Familie', slug: 'meldewesen-anmeldung-familie' },
  { tab: 'Meldewesen', name: 'Ummeldung / Abmeldung', slug: 'meldewesen-ummeldung-abmeldung' },

  // Allgemeine Ausländerangelegenheiten
  { tab: 'Allgemeine Ausländerangelegenheiten', name: 'Erteilung Aufenthaltserlaubnis oder BlueCard/EU', slug: 'allgemeine-aufenthalt-erteilung-aufenthaltserlaubnis-oder-bluecard-eu' },
  { tab: 'Allgemeine Ausländerangelegenheiten', name: 'Verlängerung Aufenthaltserlaubnis oder BlueCard/EU', slug: 'allgemeine-aufenthalt-verlaengerung-aufenthaltserlaubnis-oder-bluecard-eu' },
  { tab: 'Allgemeine Ausländerangelegenheiten', name: 'Auflagenänderung bzgl. Wohnsitznahme', slug: 'allgemeine-aufenthalt-auflagenaenderung-bzgl-wohnsitznahme' },
  { tab: 'Allgemeine Ausländerangelegenheiten', name: 'Auflagenänderung bzgl. Arbeit', slug: 'allgemeine-aufenthalt-auflagenaenderung-bzgl-arbeit' },
  { tab: 'Allgemeine Ausländerangelegenheiten', name: 'Verlängerung Fiktion', slug: 'allgemeine-aufenthalt-verlaengerung-fiktion' },
  { tab: 'Allgemeine Ausländerangelegenheiten', name: 'Ausstellung eines Reiseausweises nach der Genfer Konvention', slug: 'allgemeine-aufenthalt-ausstellung-reiseausweis-genfer-konvention' },
  { tab: 'Allgemeine Ausländerangelegenheiten', name: 'Erteilung Niederlassungserlaubnis', slug: 'allgemeine-aufenthalt-erteilung-niederlassungserlaubnis' },
  { tab: 'Allgemeine Ausländerangelegenheiten', name: 'Erteilung Niederlassungserlaubnis für Fachkräfte', slug: 'allgemeine-aufenthalt-erteilung-niederlassungserlaubnis-fachkraefte' },
  { tab: 'Allgemeine Ausländerangelegenheiten', name: 'Übertragung Aufenthaltserlaubnis / Niederlassungserlaubnis', slug: 'allgemeine-aufenthalt-uebertragung-aufenthaltserlaubnis-niederlassungserlaubnis' },
  { tab: 'Allgemeine Ausländerangelegenheiten', name: 'Ausstellung einer Aufenthaltskarte EU/Daueraufenthaltskarte', slug: 'allgemeine-aufenthalt-ausstellung-aufenthaltskarte-eu-daueraufenthaltskarte' },
  { tab: 'Allgemeine Ausländerangelegenheiten', name: 'Allgemeine Beratung', slug: 'allgemeine-aufenthalt-allgemeine-beratung' },
  { tab: 'Allgemeine Ausländerangelegenheiten', name: 'Elektronische Aufenthaltstitel (eAT) > Aktivierung Online Funktion / PIN-Änderung', slug: 'allgemeine-aufenthalt-elektronische-aufenthaltstitel-eat-aktivierung-online-pin' },
  { tab: 'Allgemeine Ausländerangelegenheiten', name: 'Abgabe einer Verpflichtungserklärung', slug: 'allgemeine-aufenthalt-abgabe-verpflichtungserklaerung' },

  // Bürger der Europäischen Union
  { tab: 'Bürger der Europäischen Union', name: 'Beratung', slug: 'eu-buerger-beratung' },
  { tab: 'Bürger der Europäischen Union', name: 'Einreichen Dokumente EU-Bürger', slug: 'eu-buerger-einreichen-dokumente-eu-buerger' },

  // Visaangelegenheiten
  { tab: 'Visaangelegenheiten', name: 'Anmeldung Einzelperson mit Visum', slug: 'visa-anmeldung-einzelperson-mit-visum' },
  { tab: 'Visaangelegenheiten', name: 'Anmeldung Familie mit Visum', slug: 'visa-anmeldung-familie-mit-visum' },
  { tab: 'Visaangelegenheiten', name: 'Beratung Familienzusammenführung', slug: 'visa-beratung-familienzusammenfuehrung' },

  // Mitarbeiter der Max-Planck-Institute
  { tab: 'Mitarbeiter der Max-Planck-Institute', name: 'Anmeldung', slug: 'max-planck-anmeldung' },
  { tab: 'Mitarbeiter der Max-Planck-Institute', name: 'Ummeldung / Abmeldung', slug: 'max-planck-ummeldung-abmeldung' },
  { tab: 'Mitarbeiter der Max-Planck-Institute', name: 'Erteilung Aufenthaltserlaubnis', slug: 'max-planck-erteilung-aufenthaltserlaubnis' },
  { tab: 'Mitarbeiter der Max-Planck-Institute', name: 'Verlängerung Aufenthaltserlaubnis (Fiktion)', slug: 'max-planck-verlaengerung-aufenthaltserlaubnis-fiktion' },
  { tab: 'Mitarbeiter der Max-Planck-Institute', name: 'Erteilung einer Niederlassungserlaubnis oder Blaue Karte EU', slug: 'max-planck-erteilung-niederlassungserlaubnis-oder-blaue-karte-eu' },
  { tab: 'Mitarbeiter der Max-Planck-Institute', name: 'Allgemeine Beratung', slug: 'max-planck-allgemeine-beratung' },

  // Studierende und Anerkennung der Berufsqualifikation
  { tab: 'Studierende und Anerkennung der Berufsqualifikation', name: 'Anmeldung', slug: 'studierende-anmeldung' },
  { tab: 'Studierende und Anerkennung der Berufsqualifikation', name: 'Ummeldung / Abmeldung', slug: 'studierende-ummeldung-abmeldung' },
  { tab: 'Studierende und Anerkennung der Berufsqualifikation', name: 'Erteilung Aufenthaltserlaubnis', slug: 'studierende-erteilung-aufenthaltserlaubnis' },
  { tab: 'Studierende und Anerkennung der Berufsqualifikation', name: 'Verlängerung Aufenthaltserlaubnis', slug: 'studierende-verlaengerung-aufenthaltserlaubnis' },
  { tab: 'Studierende und Anerkennung der Berufsqualifikation', name: 'Auflagenänderung (Wechsel Studium, Arbeit o.ä.)', slug: 'studierende-auflagenaenderung-wechsel-studium-arbeit' },
  { tab: 'Studierende und Anerkennung der Berufsqualifikation', name: 'Neuausstellung oder Übertragung Aufenthaltserlaubnis', slug: 'studierende-neuausstellung-oder-uebertragung-aufenthaltserlaubnis' },
  { tab: 'Studierende und Anerkennung der Berufsqualifikation', name: 'Erteilung einer Niederlassungserlaubnis oder Blaue Karte EU', slug: 'studierende-erteilung-niederlassungserlaubnis-oder-blaue-karte-eu' },
  { tab: 'Studierende und Anerkennung der Berufsqualifikation', name: 'Allgemeine Beratung', slug: 'studierende-allgemeine-beratung' },
  { tab: 'Studierende und Anerkennung der Berufsqualifikation', name: 'Elektronische Aufenthaltstitel (eAT) > Aktivierung Online Funktion / PIN-Änderung', slug: 'studierende-elektronische-aufenthaltstitel-eat-aktivierung-online-pin' },
  { tab: 'Studierende und Anerkennung der Berufsqualifikation', name: 'Abgabe einer Verpflichtungserklärung zur Sicherung des Lebensunterhaltesbei Studierenden', slug: 'studierende-abgabe-verpflichtungserklaerung-lebensunterhalt' },

  // Einbürgerung
  { tab: 'Einbürgerung', name: 'Beratung zur Einbürgerung', slug: 'einbuergerung-beratung-zur-einbuergerung' },
  { tab: 'Einbürgerung', name: 'Abgabe des Einbürgerungsantrages', slug: 'einbuergerung-abgabe-einbuergerungsantrag' },

  // Asylangelegenheiten und Rückkehrmanagement
  { tab: 'Asylangelegenheiten und Rückkehrmanagement', name: 'Beratung allgemein', slug: 'asyl-beratung-allgemein' },
  { tab: 'Asylangelegenheiten und Rückkehrmanagement', name: 'Beratung freiwillige Ausreise', slug: 'asyl-beratung-freiwillige-ausreise' },
  { tab: 'Asylangelegenheiten und Rückkehrmanagement', name: 'Ersterteilung einer Aufenthaltsgestattung', slug: 'asyl-ersterteilung-aufenthaltsgestattung' },
  { tab: 'Asylangelegenheiten und Rückkehrmanagement', name: 'Verlängerung einer Aufenthaltsgestattung', slug: 'asyl-verlaengerung-aufenthaltsgestattung' },
  { tab: 'Asylangelegenheiten und Rückkehrmanagement', name: 'Erteilung einer Duldung', slug: 'asyl-erteilung-duldung' },
  { tab: 'Asylangelegenheiten und Rückkehrmanagement', name: 'Verlängerung einer Duldung', slug: 'asyl-verlaengerung-duldung' },
  { tab: 'Asylangelegenheiten und Rückkehrmanagement', name: 'Änderung der Arbeitsauflage (Duldung oder Aufenthaltsgestattung)', slug: 'asyl-aenderung-arbeitsauflage' },
  { tab: 'Asylangelegenheiten und Rückkehrmanagement', name: 'Antrag auf Streichung der Wohnsitzauflage (Duldung oder Aufenthaltsgestattung)', slug: 'asyl-antrag-streichung-wohnsitzauflage' },
  { tab: 'Asylangelegenheiten und Rückkehrmanagement', name: 'Beantragung der Ersterteilung einer Aufenthaltserlaubnis', slug: 'asyl-beantragung-ersterteilung-aufenthaltserlaubnis' },
];
