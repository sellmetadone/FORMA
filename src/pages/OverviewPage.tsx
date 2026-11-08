import { useAppStore } from '@/stores/appStore';
import { moduleRegistry } from '@/core/registry/moduleRegistry';
import { t } from '@/core/i18n';
import { THEMES } from '@/core/theme/themes';
import styles from './Page.module.css';

export function OverviewPage() {
  const activeProfile = useAppStore((s) => s.activeProfile);
  const themeId = useAppStore((s) => s.themeId);
  const locale = useAppStore((s) => s.locale);
  const setPage = useAppStore((s) => s.setPage);
  void locale;

  const modules = moduleRegistry.list();
  const themeName = t(THEMES[themeId]?.nameKey ?? 'themes.white');

  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('overview.currentState')}</h2>
        <div className={styles.grid}>
          <div className={styles.card}>
            <span className={styles.cardLabel}>{t('overview.activeProfile')}</span>
            <span className={styles.cardValue}>{activeProfile?.name ?? '—'}</span>
          </div>
          <div className={styles.card}>
            <span className={styles.cardLabel}>{t('overview.theme')}</span>
            <span className={styles.cardValue}>{themeName}</span>
          </div>
          <div className={styles.card}>
            <span className={styles.cardLabel}>{t('overview.workspace')}</span>
            <span className={styles.cardValue}>Default</span>
          </div>
          <div className={styles.card}>
            <span className={styles.cardLabel}>{t('overview.widgets')}</span>
            <span className={styles.cardValue}>{t('overview.widgetsActive', { count: 0 })}</span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('overview.modules')}</h2>
        <div className={styles.moduleList}>
          {modules.map((m) => (
            <div key={m.id} className={styles.moduleItem}>
              <span className={styles.moduleName}>{m.name}</span>
              <span className={`${styles.moduleStatus} ${styles[m.status]}`}>
                {t(`status.${m.status}`)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('overview.quickActions')}</h2>
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={() => setPage('profiles')}>
            {t('overview.switchProfile')}
          </button>
          <button className={styles.actionBtn} onClick={() => setPage('appearance')}>
            {t('overview.applyTheme')}
          </button>
          <button className={styles.actionBtn} onClick={() => setPage('workspace')}>
            {t('overview.openWorkspace')}
          </button>
        </div>
      </section>
    </div>
  );
}
