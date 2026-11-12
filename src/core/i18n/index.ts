import {
  DEFAULT_LOCALE,
  LOCALE_META,
  LOCALE_IDS,
  RTL_LOCALES,
  MESSAGES,
  type LocaleId,
} from './locales';

export { LOCALE_META, LOCALE_IDS, DEFAULT_LOCALE, RTL_LOCALES, MESSAGES };
export type { LocaleId };

let currentLocale: LocaleId = DEFAULT_LOCALE;

export function getLocale(): LocaleId {
  return currentLocale;
}

export function setLocale(locale: LocaleId): void {
  if (!(locale in LOCALE_META)) {
    console.warn(`[i18n] Unknown locale: ${locale}, falling back to ${DEFAULT_LOCALE}`);
    locale = DEFAULT_LOCALE;
  }
  currentLocale = locale;
  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale;
    document.documentElement.dir = RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';
  }
}

export function t(key: string, vars?: Record<string, string | number>): string {
  const dict = MESSAGES[currentLocale] ?? MESSAGES[DEFAULT_LOCALE];
  let text = dict[key] ?? MESSAGES[DEFAULT_LOCALE][key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return text;
}

export function isRtl(locale?: LocaleId): boolean {
  return RTL_LOCALES.includes(locale ?? currentLocale);
}
