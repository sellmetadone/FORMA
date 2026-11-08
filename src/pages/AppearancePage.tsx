import { useAppStore } from '@/stores/appStore';
import { t, LOCALE_META, LOCALE_IDS, type LocaleId } from '@/core/i18n';
import { THEMES, THEME_IDS, type ThemeId } from '@/core/theme/themes';
import styles from './AppearancePage.module.css';

export function AppearancePage() {
  const themeId = useAppStore((s) => s.themeId);
  const locale = useAppStore((s) => s.locale);
  const setThemeId = useAppStore((s) => s.setThemeId);
  const previewThemeId = useAppStore((s) => s.previewThemeId);
  const setLocale = useAppStore((s) => s.setLocale);
  void locale;

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>{t('appearance.title')}</h2>
        <p className={styles.heroSubtitle}>{t('appearance.subtitle')}</p>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h3 className={styles.sectionTitle}>{t('appearance.themes')}</h3>
          <p className={styles.sectionHint}>{t('appearance.themesHint')}</p>
        </div>
        <div className={styles.themeGrid}>
          {THEME_IDS.map((id) => {
            const theme = THEMES[id];
            const selected = themeId === id;
            return (
              <button
                key={id}
                type="button"
                className={`${styles.themeCard} ${selected ? styles.themeSelected : ''}`}
                onClick={() => setThemeId(id)}
                onMouseEnter={() => previewThemeId(id)}
                onMouseLeave={() => previewThemeId(null)}
                onFocus={() => previewThemeId(id)}
                onBlur={() => previewThemeId(null)}
              >
                <div className={styles.swatches}>
                  {theme.preview.map((color, i) => (
                    <span
                      key={i}
                      className={styles.swatch}
                      style={{ background: color }}
                    />
                  ))}
                </div>
                <span className={styles.themeName}>{t(theme.nameKey)}</span>
                {selected && (
                  <span className={styles.appliedTag}>{t('appearance.applied')}</span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h3 className={styles.sectionTitle}>{t('appearance.languages')}</h3>
          <p className={styles.sectionHint}>{t('appearance.languagesHint')}</p>
        </div>
        <div className={styles.langGrid}>
          {LOCALE_IDS.map((id) => {
            const meta = LOCALE_META[id];
            const selected = locale === id;
            return (
              <button
                key={id}
                type="button"
                className={`${styles.langCard} ${selected ? styles.langSelected : ''}`}
                onClick={() => setLocale(id as LocaleId)}
              >
                <span className={styles.langNative}>{meta.nativeName}</span>
                <span className={styles.langEnglish}>{meta.englishName}</span>
                {meta.dir === 'rtl' && <span className={styles.rtlBadge}>RTL</span>}
                {selected && (
                  <span className={styles.appliedTag}>{t('appearance.applied')}</span>
                )}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
