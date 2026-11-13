/** Shared i18n types */
export type LocaleId =
  | 'en'
  | 'ru'
  | 'uk'
  | 'de'
  | 'pl'
  | 'fr'
  | 'it'
  | 'cs'
  | 'he'
  | 'zh'
  | 'ar'
  | 'surzhyk'
  | 'cat';

export const RTL_LOCALES: LocaleId[] = ['he', 'ar'];

export interface LocaleMeta {
  id: LocaleId;
  nativeName: string;
  englishName: string;
  dir: 'ltr' | 'rtl';
}

export const LOCALE_META: Record<LocaleId, LocaleMeta> = {
  en: { id: 'en', nativeName: 'English', englishName: 'English', dir: 'ltr' },
  ru: { id: 'ru', nativeName: 'Русский', englishName: 'Russian', dir: 'ltr' },
  uk: { id: 'uk', nativeName: 'Українська', englishName: 'Ukrainian', dir: 'ltr' },
  de: { id: 'de', nativeName: 'Deutsch', englishName: 'German', dir: 'ltr' },
  pl: { id: 'pl', nativeName: 'Polski', englishName: 'Polish', dir: 'ltr' },
  fr: { id: 'fr', nativeName: 'Français', englishName: 'French', dir: 'ltr' },
  it: { id: 'it', nativeName: 'Italiano', englishName: 'Italian', dir: 'ltr' },
  cs: { id: 'cs', nativeName: 'Čeština', englishName: 'Czech', dir: 'ltr' },
  he: { id: 'he', nativeName: 'עברית', englishName: 'Hebrew', dir: 'rtl' },
  zh: { id: 'zh', nativeName: '中文', englishName: 'Chinese', dir: 'ltr' },
  ar: { id: 'ar', nativeName: 'العربية', englishName: 'Arabic', dir: 'rtl' },
  surzhyk: { id: 'surzhyk', nativeName: 'Суржик', englishName: 'Surzhyk', dir: 'ltr' },
  cat: { id: 'cat', nativeName: 'Котяча', englishName: 'Cat', dir: 'ltr' },
};

export const LOCALE_IDS = Object.keys(LOCALE_META) as LocaleId[];
export const DEFAULT_LOCALE: LocaleId = 'en';
export type Messages = Record<string, string>;
