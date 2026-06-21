import { defineAnliegenMonitor } from '../../src/anliegen-monitor';
import { ANLIEGEN_CONFIG } from '../../src/anliegen-config';

defineAnliegenMonitor(ANLIEGEN_CONFIG.find((a) => a.slug === 'max-planck-erteilung-aufenthaltserlaubnis')!);
