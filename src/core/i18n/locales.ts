/** FORMA i18n — 13 locales. Keys cover all UI surfaces. */

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

/** Flat translation dictionary. Nested keys use dot notation in t(). */
export type Messages = Record<string, string>;

const en: Messages = {
  'app.name': 'FORMA',
  'app.tagline': 'Personal Workspace Platform',
  'nav.overview': 'Overview',
  'nav.workspace': 'Workspace',
  'nav.themes': 'Themes',
  'nav.wallpapers': 'Wallpapers',
  'nav.widgets': 'Widgets',
  'nav.appearance': 'Appearance',
  'nav.layouts': 'Layouts',
  'nav.profiles': 'Profiles',
  'nav.icons': 'Icons & Cursors',
  'nav.settings': 'Settings',
  'header.overview': 'Overview',
  'header.workspace': 'Workspace Studio',
  'header.themes': 'Theme Studio',
  'header.wallpapers': 'Wallpapers',
  'header.widgets': 'Widgets',
  'header.appearance': 'Appearance',
  'header.layouts': 'Layouts',
  'header.profiles': 'Profiles',
  'header.settings': 'Settings',
  'overview.welcome': 'Welcome to FORMA',
  'overview.subtitle': 'Your personal Windows workspace platform',
  'overview.modules': 'Modules',
  'overview.activeProfile': 'Active profile',
  'overview.theme': 'Theme',
  'overview.openWorkspace': 'Open Workspace Studio',
  'appearance.title': 'Personalization Center',
  'appearance.subtitle': 'Theme, language and visual preferences',
  'appearance.themes': 'Themes',
  'appearance.themesHint': 'Choose a theme. Preview on hover, click to apply.',
  'appearance.languages': 'Language',
  'appearance.languagesHint': 'Interface language. Applied instantly.',
  'appearance.preview': 'Preview',
  'appearance.apply': 'Apply',
  'appearance.applied': 'Applied',
  'appearance.comingSoon': 'More options coming soon',
  'themes.winter': 'Winter',
  'themes.summer': 'Summer',
  'themes.autumn': 'Autumn',
  'themes.spring': 'Spring',
  'themes.halloween': 'Halloween',
  'themes.newyear': 'New Year',
  'themes.easter': 'Easter',
  'themes.white': 'White',
  'themes.dark': 'Dark',
  'themes.pink': 'Pink',
  'themes.golden': 'Golden',
  'profiles.title': 'Profiles',
  'profiles.subtitle': 'Workspace profiles. Create, switch, edit.',
  'profiles.create': 'Create profile',
  'profiles.rename': 'Rename',
  'profiles.delete': 'Delete',
  'profiles.activate': 'Activate',
  'profiles.active': 'Active',
  'profiles.empty': 'No profiles yet',
  'profiles.namePlaceholder': 'Profile name',
  'profiles.confirmDelete': 'Delete this profile?',
  'profiles.cannotDeleteActive': 'Cannot delete the active profile',
  'settings.general': 'General',
  'settings.theme': 'Application theme',
  'settings.themeDesc': 'Color theme for the interface',
  'settings.language': 'Language',
  'settings.languageDesc': 'Interface language',
  'settings.version': 'Version',
  'settings.versionDesc': 'Current application version',
  'settings.about': 'About',
  'settings.stored': 'Stored settings',
  'settings.author': 'Author',
  'settings.license': 'License',
  'workspace.placeholder': 'Drag to move · corner to resize · Ctrl+Z undo',
  'workspace.canvas': 'Workspace canvas',
  'wallpapers.placeholder': 'Local library and system apply',
  'widgets.placeholder': 'Clock, Calendar, Notes, System Monitor and more',
  'layouts.placeholder': 'Preset and custom layouts',
  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.delete': 'Delete',
  'common.create': 'Create',
  'common.close': 'Close',
  'common.edit': 'Edit',
  'common.apply': 'Apply',
  'common.export': 'Export',
  'common.import': 'Import',
  'common.search': 'Search',
  'common.loading': 'Loading…',
  'common.error': 'Error',
  'common.success': 'Success',
  'common.yes': 'Yes',
  'common.no': 'No',
};

/** Other locales fall back to English until full translations are restored. */
const ru: Messages = { ...en };
const uk: Messages = { ...en };
const de: Messages = { ...en };
const pl: Messages = { ...en };
const fr: Messages = { ...en };
const it: Messages = { ...en };
const cs: Messages = { ...en };
const he: Messages = { ...en };
const zh: Messages = { ...en };
const ar: Messages = { ...en };
const surzhyk: Messages = { ...en };
const cat: Messages = { ...en };

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
