import { useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';
import { Shell } from '@/components/layout/Shell';
import { eventBus } from '@/core/events/eventBus';
import { moduleRegistry } from '@/core/registry/moduleRegistry';
import { applyTheme, DEFAULT_THEME_ID, type ThemeId, THEMES } from '@/core/theme/themes';
import { setLocale, DEFAULT_LOCALE, type LocaleId, LOCALE_META } from '@/core/i18n';
import './App.css';

function resolveThemeId(settings: Record<string, string>): ThemeId {
  const id = settings['ui.themeId'];
  if (id && id in THEMES) return id as ThemeId;
  if (settings['ui.theme'] === 'dark') return 'dark';
  return DEFAULT_THEME_ID;
}

function resolveLocale(settings: Record<string, string>): LocaleId {
  const loc = settings['ui.locale'];
  if (loc && loc in LOCALE_META) return loc as LocaleId;
  return DEFAULT_LOCALE;
}

type ProfileLike = {
  id: string;
  name: string;
  theme_id: string | null;
  wallpaper_id: string | null;
  layout_id: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
};

type ThemeLike = {
  id: string;
  name: string;
  is_dark: number;
  colors: string;
  created_at: string;
};

async function bootstrap() {
  const store = useAppStore.getState();

  moduleRegistry.register({
    id: 'core.settings',
    name: 'Settings Manager',
    version: '0.1.0',
    status: 'idle',
  });
  moduleRegistry.register({
    id: 'core.theme',
    name: 'Theme Engine',
    version: '0.1.0',
    status: 'idle',
    dependencies: ['core.settings'],
  });
  moduleRegistry.register({
    id: 'core.profile',
    name: 'Profile Manager',
    version: '0.1.0',
    status: 'idle',
    dependencies: ['core.settings'],
  });
  moduleRegistry.register({
    id: 'core.i18n',
    name: 'Localization',
    version: '0.1.0',
    status: 'idle',
  });
  moduleRegistry.register({
    id: 'core.widgets',
    name: 'Widget Engine',
    version: '0.4.0',
    status: 'idle',
  });
  moduleRegistry.register({
    id: 'core.system',
    name: 'Windows Integration',
    version: '0.4.0',
    status: 'idle',
  });
  moduleRegistry.register({
    id: 'core.stabilization',
    name: 'Stabilization',
    version: '0.5.0',
    status: 'idle',
  });

  await moduleRegistry.initAll();

  if (window.forma) {
    try {
      const [version, settings, profiles, themes] = await Promise.all([
        window.forma.getVersion(),
        window.forma.getSettings(),
        window.forma.getProfiles(),
        window.forma.getThemes(),
      ]);
      const s = settings as Record<string, string>;
      store.setVersion(version);
      store.setSettings(s);
      store.setProfiles(profiles as ProfileLike[]);
      store.setThemes(themes as ThemeLike[]);

      const active =
        (profiles as ProfileLike[]).find((p) => p.is_active === 1) ?? null;
      store.setActiveProfile(active);

      const themeId = resolveThemeId(s);
      const locale = resolveLocale(s);
      store.setThemeId(themeId, false);
      store.setLocale(locale, false);

      if (s['ui.sidebarCollapsed'] === 'true') {
        useAppStore.setState({ sidebarCollapsed: true });
      }
    } catch (err) {
      console.error('Failed to load from IPC:', err);
      applyTheme(DEFAULT_THEME_ID);
      setLocale(DEFAULT_LOCALE);
    }
  } else {
    store.setProfiles([
      {
        id: 'profile-default',
        name: 'DEFAULT',
        theme_id: 'theme-light',
        wallpaper_id: null,
        layout_id: null,
        is_active: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);
    store.setActiveProfile({
      id: 'profile-default',
      name: 'DEFAULT',
      theme_id: 'theme-light',
      wallpaper_id: null,
      layout_id: null,
      is_active: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    store.setThemes([
      {
        id: 'theme-light',
        name: 'FORMA Light',
        is_dark: 0,
        colors: '{}',
        created_at: new Date().toISOString(),
      },
      {
        id: 'theme-dark',
        name: 'FORMA Graphite',
        is_dark: 1,
        colors: '{}',
        created_at: new Date().toISOString(),
      },
    ]);
    applyTheme(DEFAULT_THEME_ID);
    setLocale(DEFAULT_LOCALE);
  }

  store.setLoading(false);
  eventBus.emit('settings:updated');
}

export default function App() {
  const isLoading = useAppStore((s) => s.isLoading);

  useEffect(() => {
    bootstrap();
  }, []);

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="app-loading__logo">FORMA</div>
        <div className="app-loading__spinner" />
      </div>
    );
  }

  return <Shell />;
}
