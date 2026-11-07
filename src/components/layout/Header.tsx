import { useAppStore } from '@/stores/appStore';
import { t } from '@/core/i18n';
import { THEMES } from '@/core/theme/themes';
import styles from './Header.module.css';

const PAGE_KEYS: Record<string, string> = {
  overview: 'header.overview',
  workspace: 'header.workspace',
  themes: 'header.themes',
  wallpapers: 'header.wallpapers',
  widgets: 'header.widgets',
  appearance: 'header.appearance',
  layouts: 'header.layouts',
  profiles: 'header.profiles',
  icons: 'nav.icons',
  settings: 'header.settings',
};

export function Header() {
  const currentPage = useAppStore((s) => s.currentPage);
  const activeProfile = useAppStore((s) => s.activeProfile);
  const themeId = useAppStore((s) => s.themeId);
  const locale = useAppStore((s) => s.locale);
  void locale;

  const themeName = t(THEMES[themeId]?.nameKey ?? 'themes.white');

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{t(PAGE_KEYS[currentPage] ?? 'header.overview')}</h1>
      <div className={styles.actions}>
        {activeProfile && (
          <span className={styles.profileBadge} title={t('overview.activeProfile')}>
            {activeProfile.name}
          </span>
        )}
        <span className={styles.themeBadge} title={t('overview.theme')}>
          {themeName}
        </span>
      </div>
    </header>
  );
}
