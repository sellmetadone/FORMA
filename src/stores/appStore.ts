import { create } from 'zustand';
import type { PageId, Profile, Theme } from '@/types';
import {
  applyTheme,
  DEFAULT_THEME_ID,
  type ThemeId,
  THEMES,
} from '@/core/theme/themes';
import {
  setLocale as applyLocale,
  DEFAULT_LOCALE,
  type LocaleId,
} from '@/core/i18n';

interface AppState {
  currentPage: PageId;
  sidebarCollapsed: boolean;
  themeId: ThemeId;
  locale: LocaleId;
  themeMode: 'light' | 'dark';
  activeProfile: Profile | null;
  profiles: Profile[];
  themes: Theme[];
  settings: Record<string, string>;
  isLoading: boolean;
  version: string;

  setPage: (page: PageId) => void;
  toggleSidebar: () => void;
  setThemeId: (id: ThemeId, persist?: boolean) => void;
  previewThemeId: (id: ThemeId | null) => void;
  setLocale: (locale: LocaleId, persist?: boolean) => void;
  setThemeMode: (mode: 'light' | 'dark') => void;
  setActiveProfile: (profile: Profile | null) => void;
  setProfiles: (profiles: Profile[]) => void;
  setThemes: (themes: Theme[]) => void;
  setSettings: (settings: Record<string, string>) => void;
  setLoading: (loading: boolean) => void;
  setVersion: (version: string) => void;
}

function persistSetting(key: string, value: string) {
  if (typeof window !== 'undefined' && window.forma?.setSetting) {
    window.forma.setSetting(key, value).catch((err) => {
      console.error(`Failed to persist ${key}:`, err);
    });
  }
}

export const useAppStore = create<AppState>((set, get) => ({
  currentPage: 'overview',
  sidebarCollapsed: false,
  themeId: DEFAULT_THEME_ID,
  locale: DEFAULT_LOCALE,
  themeMode: 'light',
  activeProfile: null,
  profiles: [],
  themes: [],
  settings: {},
  isLoading: true,
  version: '1.0.0',

  setPage: (page) => set({ currentPage: page }),

  toggleSidebar: () => {
    const next = !get().sidebarCollapsed;
    set({ sidebarCollapsed: next });
    persistSetting('ui.sidebarCollapsed', String(next));
  },

  setThemeId: (id, persist = true) => {
    applyTheme(id);
    const isDark = THEMES[id]?.colors.isDark ?? false;
    set({ themeId: id, themeMode: isDark ? 'dark' : 'light' });
    if (persist) {
      persistSetting('ui.themeId', id);
      persistSetting('ui.theme', isDark ? 'dark' : 'light');
    }
  },

  previewThemeId: (id) => {
    if (id === null) {
      applyTheme(get().themeId);
    } else {
      applyTheme(id);
    }
  },

  setLocale: (locale, persist = true) => {
    applyLocale(locale);
    set({ locale });
    if (persist) {
      persistSetting('ui.locale', locale);
    }
  },

  setThemeMode: (mode) => {
    const id: ThemeId = mode === 'dark' ? 'dark' : 'white';
    get().setThemeId(id);
  },

  setActiveProfile: (profile) => set({ activeProfile: profile }),
  setProfiles: (profiles) => set({ profiles }),
  setThemes: (themes) => set({ themes }),
  setSettings: (settings) => set({ settings }),
  setLoading: (isLoading) => set({ isLoading }),
  setVersion: (version) => set({ version }),
}));
