import { useAppStore } from '@/stores/appStore';
import { t } from '@/core/i18n';
import styles from './Page.module.css';

export function OverviewPage() {
  const version = useAppStore((s) => s.version);
  const setPage = useAppStore((s) => s.setPage);
  const themeId = useAppStore((s) => s.themeId);
  const locale = useAppStore((s) => s.locale);
  void locale;

  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('header.overview')}</h2>
        <p className={styles.description}>{t('app.tagline')}</p>
        <div className={styles.grid}>
          <div className={styles.card}>
            <span className={styles.cardLabel}>Version</span>
            <span className={styles.cardValue}>{version}</span>
          </div>
          <div className={styles.card}>
            <span className={styles.cardLabel}>Theme</span>
            <span className={styles.cardValue}>{themeId}</span>
          </div>
        </div>
        <div className={styles.actions} style={{ marginTop: 16 }}>
          <button type="button" className={styles.actionBtn} onClick={() => setPage('workspace')}>
            Workspace
          </button>
          <button type="button" className={styles.actionBtn} onClick={() => setPage('appearance')}>
            Appearance
          </button>
          <button type="button" className={styles.actionBtn} onClick={() => setPage('widgets')}>
            Widgets
          </button>
          <button type="button" className={styles.actionBtn} onClick={() => setPage('settings')}>
            Settings
          </button>
        </div>
      </section>
    </div>
  );
}
