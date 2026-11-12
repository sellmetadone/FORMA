import { useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';
import { Shell } from '@/components/layout/Shell';
import { moduleRegistry } from '@/core/registry/moduleRegistry';
import { applyTheme, DEFAULT_THEME_ID, type ThemeId, THEMES } from '@/core/theme/themes';
import { setLocale, DEFAULT_LOCALE, type LocaleId, LOCALE_META } from '@/core/i18n';

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

async function bootstrap() {
  const store = useAppStore.getState();

  [
    { id: 'core.settings', name: 'Settings Manager', status: 'active' as const },
    { id: 'core.theme', name: 'Theme Engine', status: 'active' as const },
    { id: 'core.profile', name: 'Profile Manager', status: 'active' as const },
    { id: 'core.i18n', name: 'Localization', status: 'active' as const },
    { id: 'core.widgets', name: 'Widget Engine', status: 'active' as const },
    { id: 'core.system', name: 'Windows Integration', status: 'active' as const },
    { id: 'core.workspace', name: 'Workspace Studio', status: 'active' as const },
  ].forEach((m) => moduleRegistry.register(m));

  if (window.forma) {
    try {
      const [version, settings, profiles] = await Promise.all([
        window.forma.getVersion(),
        window.forma.getSettings(),
        window.forma.getProfiles(),
      ]);
      store.setVersion(String(version));
      const s = (settings || {}) as Record<string, string>;
      store.setSettings(s);
      const themeId = resolveThemeId(s);
      const locale = resolveLocale(s);
      applyTheme(themeId);
      setLocale(locale);
      store.setThemeId(themeId, false);
      store.setLocale(locale, false);
      if (s['ui.sidebarCollapsed'] === 'true') {
        if (!store.sidebarCollapsed) store.toggleSidebar();
      }
      const list = (profiles || []) as {
        id: string;
        name: string;
        theme_id: string | null;
        wallpaper_id: string | null;
        layout_id: string | null;
        is_active: number;
        created_at: string;
        updated_at: string;
      }[];
      store.setProfiles(list);
      store.setActiveProfile(list.find((p) => p.is_active === 1) ?? null);
    } catch (err) {
      console.error('[FORMA] bootstrap', err);
      applyTheme(DEFAULT_THEME_ID);
      setLocale(DEFAULT_LOCALE);
    }
  } else {
    applyTheme(DEFAULT_THEME_ID);
    setLocale(DEFAULT_LOCALE);
  }

  store.setLoading(false);
}

export default function App() {
  const isLoading = useAppStore((s) => s.isLoading);

  useEffect(() => {
    void bootstrap();
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '100%', fontFamily: 'system-ui' }}>
        Loading FORMA…
      </div>
    );
  }

  return <Shell />;
}
