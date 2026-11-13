/** FORMA i18n — 13 locales. Full message catalogs. */
export type { LocaleId, LocaleMeta, Messages } from './types';
export {
  RTL_LOCALES,
  LOCALE_META,
  LOCALE_IDS,
  DEFAULT_LOCALE,
} from './types';

import type { LocaleId, Messages } from './types';
import { en } from './messages/en';
import { ru } from './messages/ru';
import { uk } from './messages/uk';
import { de } from './messages/de';
import { pl } from './messages/pl';
import { fr } from './messages/fr';
import { it } from './messages/it';
import { cs } from './messages/cs';
import { he } from './messages/he';
import { zh } from './messages/zh';
import { ar } from './messages/ar';
import { surzhyk } from './messages/surzhyk';
import { cat } from './messages/cat';

export { en, ru, uk, de, pl, fr, it, cs, he, zh, ar, surzhyk, cat };

export const MESSAGES: Record<LocaleId, Messages> = {
  en,
  ru,
  uk,
  de,
  pl,
  fr,
  it,
  cs,
  he,
  zh,
  ar,
  surzhyk,
  cat,
};
