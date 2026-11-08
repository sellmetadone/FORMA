import { useCallback, useEffect, useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { t } from '@/core/i18n';
import styles from './Page.module.css';
import pageStyles from './ManagerPage.module.css';

interface AssetItem {
  id?: string;
  name: string;
  path: string;
}

export function IconsPage() {
  const locale = useAppStore((s) => s.locale);
  void locale;
  const [icons, setIcons] = useState<AssetItem[]>([]);
  const [cursors, setCursors] = useState<AssetItem[]>([]);
  const [msg, setMsg] = useState('');
  const [pathInput, setPathInput] = useState('');

  const refresh = useCallback(async () => {
    if (!window.forma?.listAssets) return;
    try {
      const i = (await window.forma.listAssets('icon')) as AssetItem[];
      const c = (await window.forma.listAssets('cursor')) as AssetItem[];
      setIcons(i ?? []);
      setCursors(c ?? []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const importByPath = async (kind: 'icon' | 'cursor') => {
    const src = pathInput.trim();
    if (!src) {
      setMsg('Enter an absolute file path (.ico / .png / .cur / .ani)');
      return;
    }
    if (!window.forma?.importAsset) {
      setMsg('Import requires Electron');
      return;
    }
    try {
      const res = await window.forma.importAsset(src, kind);
      if (!res.ok) {
        setMsg(res.error || 'Import failed');
        return;
      }
      setMsg(`Imported: ${res.name}`);
      setPathInput('');
      await refresh();
    } catch (err) {
      setMsg(String(err));
    }
  };

  const applyCursor = async (filePath: string) => {
    if (!confirm('Apply this cursor as the Windows Arrow cursor? FORMA will backup current cursors first.')) {
      return;
    }
    if (!window.forma?.applyCursorArrow) {
      setMsg('Cursor apply requires Electron on Windows');
      return;
    }
    try {
      const res = await window.forma.applyCursorArrow(filePath);
      setMsg(res.ok ? 'Cursor applied (backup saved)' : res.error || 'Failed');
    } catch (err) {
      setMsg(String(err));
    }
  };

  const restore = async () => {
    if (!confirm('Restore Windows cursors from the last FORMA backup?')) return;
    if (!window.forma?.restoreCursors) {
      setMsg('Restore requires Electron on Windows');
      return;
    }
    try {
      const res = await window.forma.restoreCursors();
      setMsg(res.ok ? 'Cursors restored' : res.error || 'Failed');
    } catch (err) {
      setMsg(String(err));
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('nav.icons')}</h2>
        <p className={styles.description}>Import icons and cursors. Cursor apply is Windows-only.</p>
        <div className={pageStyles.toolbar}>
          <input
            value={pathInput}
            onChange={(e) => setPathInput(e.target.value)}
            placeholder="C:\\path\\to\\file.ico"
            style={{ flex: 1, minWidth: 200, padding: '8px 10px' }}
          />
          <button type="button" className={styles.actionBtn} onClick={() => importByPath('icon')}>
            Import icon
          </button>
          <button type="button" className={styles.actionBtn} onClick={() => importByPath('cursor')}>
            Import cursor
          </button>
          <button type="button" className={styles.actionBtn} onClick={restore}>
            Restore cursors
          </button>
          {msg && <span className={pageStyles.msg}>{msg}</span>}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Icons</h2>
        <div className={styles.grid}>
          {icons.map((a) => (
            <div key={a.path} className={styles.card}>
              <span className={styles.cardValue}>{a.name}</span>
              <span className={styles.cardLabel}>{a.path}</span>
            </div>
          ))}
          {icons.length === 0 && <p className={styles.placeholder}>No icons imported.</p>}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Cursors</h2>
        <div className={styles.grid}>
          {cursors.map((a) => (
            <div key={a.path} className={styles.card}>
              <span className={styles.cardValue}>{a.name}</span>
              <button type="button" className={styles.actionBtn} onClick={() => applyCursor(a.path)}>
                Apply as Arrow
              </button>
            </div>
          ))}
          {cursors.length === 0 && <p className={styles.placeholder}>No cursors imported.</p>}
        </div>
      </section>
    </div>
  );
}
