import { useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';
import { useWidgetStore } from '@/stores/widgetStore';
import { WIDGET_DEFINITIONS, WIDGET_TYPE_IDS } from '@/core/widgets/definitions';
import { WidgetRenderer } from '@/components/widgets/WidgetRenderer';
import { t } from '@/core/i18n';
import styles from './Page.module.css';
import pageStyles from './ManagerPage.module.css';
import wStyles from './WidgetsPage.module.css';

export function WidgetsPage() {
  const locale = useAppStore((s) => s.locale);
  void locale;
  const instances = useWidgetStore((s) => s.instances);
  const load = useWidgetStore((s) => s.load);
  const addWidget = useWidgetStore((s) => s.addWidget);
  const removeWidget = useWidgetStore((s) => s.removeWidget);
  const toggleEnabled = useWidgetStore((s) => s.toggleEnabled);

  useEffect(() => {
    load();
  }, [load]);

  const enabled = instances.filter((i) => i.enabled);

  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('header.widgets')}</h2>
        <p className={styles.description}>
          Widget Engine — add, configure and toggle widgets. Updates use controlled intervals.
        </p>

        <div className={pageStyles.toolbar}>
          {WIDGET_TYPE_IDS.map((type) => (
            <button
              key={type}
              type="button"
              className={styles.actionBtn}
              onClick={() => addWidget(type)}
            >
              + {t(WIDGET_DEFINITIONS[type].nameKey)}
            </button>
          ))}
        </div>

        <div className={wStyles.catalog}>
          {WIDGET_TYPE_IDS.map((type) => {
            const def = WIDGET_DEFINITIONS[type];
            const count = instances.filter((i) => i.type === type).length;
            return (
              <div key={type} className={styles.card}>
                <span className={styles.cardLabel}>
                  {def.refreshMs > 0 ? `${def.refreshMs / 1000}s refresh` : 'manual'}
                </span>
                <span className={styles.cardValue}>{t(def.nameKey)}</span>
                <span style={{ fontSize: 12, color: 'var(--forma-text-muted)' }}>
                  {t(def.descriptionKey)} · {count} active
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Active instances</h2>
        <div className={wStyles.instances}>
          {instances.map((inst) => (
            <div key={inst.id} className={wStyles.instanceCard}>
              <div className={wStyles.instanceHead}>
                <span>{t(WIDGET_DEFINITIONS[inst.type].nameKey)}</span>
                <div className={wStyles.instanceActions}>
                  <button type="button" className={styles.actionBtn} onClick={() => toggleEnabled(inst.id)}>
                    {inst.enabled ? 'Disable' : 'Enable'}
                  </button>
                  <button type="button" className={styles.actionBtn} onClick={() => removeWidget(inst.id)}>
                    {t('common.delete')}
                  </button>
                </div>
              </div>
              {inst.enabled && (
                <div className={wStyles.preview}>
                  <WidgetRenderer instance={inst} showClose />
                </div>
              )}
            </div>
          ))}
          {instances.length === 0 && (
            <p className={styles.placeholder}>No widgets yet. Add one from the catalog above.</p>
          )}
        </div>
        {enabled.length > 0 && (
          <p style={{ marginTop: 12, fontSize: 12, color: 'var(--forma-text-muted)' }}>
            {enabled.length} enabled
          </p>
        )}
      </section>
    </div>
  );
}
