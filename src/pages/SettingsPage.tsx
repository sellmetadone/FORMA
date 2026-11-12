import { useEffect, useState } from 'react';
import { getActivityLog, clearActivityLog, type ActivityEntry } from '@/core/activity/log';
import { collectLocalBackup, downloadJson, validateBackup, applyBackup } from '@/core/backup';
import { logActivity } from '@/core/activity/log';
import { useAppStore } from '@/stores/appStore';
import { t, DEFAULT_LOCALE } from '@/core/i18n';
import { DEFAULT_THEME_ID } from '@/core/theme/themes';
import type { DisplayInfo } from '@/types';
import styles from './Page.module.css';
import pageStyles from './ManagerPage.module.css';

export function SettingsPage() {
  const locale = useAppStore((s) => s.locale);
  void locale;
  const setThemeId = useAppStore((s) => s.setThemeId);
  const setLocale = useAppStore((s) => s.setLocale);
  const setSettings = useAppStore((s) => s.setSettings);
  const version = useAppStore((s) => s.version);

  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [autostart, setAutostart] = useState(false);
  const [displays, setDisplays] = useState<DisplayInfo[]>([]);
  const [diag, setDiag] = useState<Record<string, unknown> | null>(null);
  const [msg, setMsg] = useState('');

  const refreshActivity = () => setActivity(getActivityLog());

  useEffect(() => {
    refreshActivity();
    (async () => {
      if (window.forma?.getAutostart) {
        try {
          setAutostart(await window.forma.getAutostart());
        } catch {
          /* ignore */
        }
      }
      if (window.forma?.getDisplays) {
        try {
          setDisplays((await window.forma.getDisplays()) as DisplayInfo[]);
        } catch {
          /* ignore */
        }
      }
      if (window.forma?.getDiagnostics) {
        try {
          setDiag((await window.forma.getDiagnostics()) as Record<string, unknown>);
        } catch {
          /* ignore */
        }
      }
    })();
  }, []);

  const toggleAutostart = async () => {
    if (!window.forma?.setAutostart) {
      setMsg('Autostart requires Electron');
      return;
    }
    try {
      const next = await window.forma.setAutostart(!autostart);
      setAutostart(next);
      logActivity('settings.autostart', String(next));
      setMsg(`Autostart: ${next ? 'on' : 'off'}`);
    } catch (err) {
      setMsg(String(err));
    }
  };

  const exportBackup = () => {
    const data = collectLocalBackup();
    downloadJson(`forma-backup-${Date.now()}.json`, data);
    logActivity('backup.export');
    setMsg('Backup downloaded');
  };

  const importBackup = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const v = validateBackup(data);
      if (!v.ok) {
        setMsg(v.error || 'Invalid backup');
        return;
      }
      applyBackup(data);
      logActivity('backup.import');
      setMsg('Backup applied — reload recommended');
      refreshActivity();
    } catch (err) {
      setMsg(String(err));
    }
  };

  const resetDefaults = () => {
    if (!confirm('Reset theme, locale and UI settings to defaults?')) return;
    setThemeId(DEFAULT_THEME_ID);
    setLocale(DEFAULT_LOCALE);
    setSettings({});
    logActivity('settings.reset');
    setMsg('Defaults restored');
  };

  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('header.settings')}</h2>
        <p className={styles.description}>Backup, system integration and diagnostics.</p>
        {msg && <p className={pageStyles.msg}>{msg}</p>}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>System</h2>
        <div className={pageStyles.toolbar}>
          <button type="button" className={styles.actionBtn} onClick={() => void toggleAutostart()}>
            Autostart: {autostart ? 'On' : 'Off'}
          </button>
          <button type="button" className={styles.actionBtn} onClick={resetDefaults}>
            Reset defaults
          </button>
        </div>
        {displays.length > 0 && (
          <div className={styles.grid}>
            {displays.map((d) => (
              <div key={d.id} className={styles.card}>
                <span className={styles.cardLabel}>{d.primary ? 'Primary' : 'Monitor'}</span>
                <span className={styles.cardValue}>{d.label}</span>
                <span className={styles.cardLabel}>
                  {d.bounds.width}×{d.bounds.height} @{d.scaleFactor}x
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Backup</h2>
        <div className={pageStyles.toolbar}>
          <button type="button" className={styles.actionBtn} onClick={exportBackup}>
            Export backup JSON
          </button>
          <label className={styles.actionBtn} style={{ cursor: 'pointer' }}>
            Import backup
            <input
              type="file"
              accept="application/json,.json"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void importBackup(f);
                e.target.value = '';
              }}
            />
          </label>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Activity log</h2>
        <div className={pageStyles.toolbar}>
          <button type="button" className={styles.actionBtn} onClick={refreshActivity}>
            Refresh
          </button>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => {
              clearActivityLog();
              refreshActivity();
            }}
          >
            Clear
          </button>
        </div>
        <div className={styles.moduleList}>
          {activity.slice(0, 30).map((a) => (
            <div key={a.id} className={styles.moduleItem}>
              <span className={styles.moduleName}>{a.action}</span>
              <span className={styles.moduleStatus}>
                {new Date(a.at).toLocaleString()}
                {a.detail ? ` · ${a.detail}` : ''}
              </span>
            </div>
          ))}
          {activity.length === 0 && <p className={styles.placeholder}>No activity yet.</p>}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Diagnostics</h2>
        <div className={styles.card}>
          <span className={styles.cardLabel}>App</span>
          <span className={styles.cardValue}>v{version}</span>
          {diag && (
            <pre style={{ fontSize: 11, marginTop: 8, whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(diag, null, 2)}
            </pre>
          )}
        </div>
      </section>
    </div>
  );
}
