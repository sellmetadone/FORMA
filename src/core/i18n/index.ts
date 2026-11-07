import {
  DEFAULT_LOCALE,
  LOCALE_META,
  MESSAGES,
  RTL_LOCALES,
  type LocaleId,
  type Messages,
} from './locales';

export type { LocaleId, Messages };
export { LOCALE_META, LOCALE_IDS, DEFAULT_LOCALE, RTL_LOCALES, MESSAGES } from './locales';

let currentLocale: LocaleId = DEFAULT_LOCALE;

export function getLocale(): LocaleId {
  return currentLocale;
}

export function setLocale(locale: LocaleId): void {
  if (!MESSAGES[locale]) {
    console.warn(`[i18n] Unknown locale: ${locale}, falling back to ${DEFAULT_LOCALE}`);
    locale = DEFAULT_LOCALE;
  }
  currentLocale = locale;
  const meta = LOCALE_META[locale];
  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale === 'surzhyk' || locale === 'cat' ? 'uk' : locale;
    document.documentElement.dir = meta.dir;
    document.documentElement.setAttribute('data-locale', locale);
  }
}

export function t(key: string, params?: Record<string, string | number>): string {
  const dict = MESSAGES[currentLocale] ?? MESSAGES[DEFAULT_LOCALE];
  let text = dict[key] ?? MESSAGES.en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return text;
}

export function isRtl(locale?: LocaleId): boolean {
  return RTL_LOCALES.includes(locale ?? currentLocale);
}
