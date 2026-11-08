import { useEffect, useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { t } from '@/core/i18n';
import type { LayoutRecord, WorkspaceConfig } from '@/types';
import styles from './Page.module.css';
import pageStyles from './ManagerPage.module.css';

export function LayoutsPage() {
  const setPage = useAppStore((s) => s.setPage);
  const locale = useAppStore((s) => s.locale);
  void locale;
  const getConfig = useWorkspaceStore((s) => s.getConfig);
  const loadConfig = useWorkspaceStore((s) => s.loadConfig);
  const [layouts, setLayouts] = useState<LayoutRecord[]>([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    (async () => {
      if (window.forma?.getLayouts) {
        try {
          const list = (await window.forma.getLayouts()) as LayoutRecord[];
          setLayouts(list ?? []);
          return;
        } catch {
          /* local */
        }
      }
      try {
        const raw = localStorage.getItem('forma.layouts');
        if (raw) setLayouts(JSON.parse(raw));
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const saveCurrentAsLayout = async () => {
    const cfg = getConfig();
    const id = `layout-${Date.now().toString(36)}`;
    const name = `Layout ${new Date().toLocaleString()}`;
    const record: LayoutRecord = {
      id,
      name,
      config: JSON.stringify(cfg),
      is_preset: 0,
      created_at: new Date().toISOString(),
    };
    if (window.forma?.saveLayout) {
      try {
        await window.forma.saveLayout({
          id,
          name,
          config: record.config,
          is_preset: 0,
        });
      } catch (err) {
        console.error(err);
      }
    }
    const next = [...layouts, record];
    setLayouts(next);
    localStorage.setItem('forma.layouts', JSON.stringify(next));
    setMsg(`Saved: ${name}`);
  };

  const apply = (layout: LayoutRecord) => {
    try {
      const cfg = JSON.parse(layout.config) as WorkspaceConfig;
      loadConfig('ws-default', { ...cfg, name: cfg.name || layout.name });
      setPage('workspace');
      setMsg(`Applied: ${layout.name}`);
    } catch (err) {
      console.error(err);
      setMsg('Invalid layout config');
    }
  };

  const remove = async (id: string, isPreset: number) => {
    if (isPreset) {
      setMsg('Cannot delete preset');
      return;
    }
    if (!confirm(t('profiles.confirmDelete'))) return;
    if (window.forma?.deleteLayout) {
      try {
        await window.forma.deleteLayout(id);
      } catch (err) {
        console.error(err);
        setMsg(String(err));
        return;
      }
    }
    const next = layouts.filter((l) => l.id !== id);
    setLayouts(next);
    localStorage.setItem('forma.layouts', JSON.stringify(next));
  };

  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('header.layouts')}</h2>
        <p className={styles.description}>{t('layouts.placeholder')}</p>
        <div className={pageStyles.toolbar}>
          <button type="button" className={styles.actionBtn} onClick={saveCurrentAsLayout}>
            Save current workspace as layout
          </button>
          <button type="button" className={styles.actionBtn} onClick={() => setPage('workspace')}>
            Open Workspace Studio
          </button>
          {msg && <span className={pageStyles.msg}>{msg}</span>}
        </div>
        <div className={styles.grid}>
          {layouts.map((l) => (
            <div key={l.id} className={styles.card}>
              <span className={styles.cardLabel}>{l.is_preset ? 'Preset' : 'Custom'}</span>
              <span className={styles.cardValue}>{l.name}</span>
              <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                <button type="button" className={styles.actionBtn} style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => apply(l)}>
                  Apply
                </button>
                {!l.is_preset && (
                  <button type="button" className={styles.actionBtn} style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => remove(l.id, l.is_preset)}>
                    {t('common.delete')}
                  </button>
                )}
              </div>
            </div>
          ))}
          {layouts.length === 0 && (
            <p className={styles.placeholder}>No layouts yet. Create one from Workspace Studio.</p>
          )}
        </div>
      </section>
    </div>
  );
}
