import { useCallback, useEffect, useState } from 'react';
import { LiveWallpaperPanel } from '@/components/wallpaper/LiveWallpaperPanel';
import { useAppStore } from '@/stores/appStore';
import { t } from '@/core/i18n';
import { eventBus } from '@/core/events/eventBus';
import type { DisplayInfo } from '@/types';
import styles from './Page.module.css';
import pageStyles from './ManagerPage.module.css';

interface WallpaperItem {
  id: string;
  name: string;
  path: string;
  category: string | null;
  is_favorite: number;
}

function uid() {
  return `wp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function WallpapersPage() {
  const locale = useAppStore((s) => s.locale);
  void locale;
  const [items, setItems] = useState<WallpaperItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [displays, setDisplays] = useState<DisplayInfo[]>([]);
  const [msg, setMsg] = useState('');
  const [pathInput, setPathInput] = useState('');
  const [slideshowEnabled, setSlideshowEnabled] = useState(
    () => localStorage.getItem('forma.wallpaper.slideshow') === '1'
  );

  const load = useCallback(async () => {
    if (window.forma?.getWallpapers) {
      try {
        const list = (await window.forma.getWallpapers()) as WallpaperItem[];
        setItems(list ?? []);
        return;
      } catch (err) {
        console.error(err);
      }
    }
    try {
      const raw = localStorage.getItem('forma.wallpapers');
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void load();
    (async () => {
      if (window.forma?.getDisplays) {
        try {
          setDisplays((await window.forma.getDisplays()) as DisplayInfo[]);
        } catch {
          /* ignore */
        }
      }
    })();
  }, [load]);

  const addPath = async () => {
    const path = pathInput.trim();
    if (!path) {
      setMsg('Enter image path');
      return;
    }
    const item: WallpaperItem = {
      id: uid(),
      name: path.split(/[/\\]/).pop() || path,
      path,
      category: 'user',
      is_favorite: 0,
    };
    if (window.forma?.addWallpaper) {
      try {
        await window.forma.addWallpaper(item);
      } catch (err) {
        console.error(err);
      }
    }
    const next = [item, ...items];
    setItems(next);
    localStorage.setItem('forma.wallpapers', JSON.stringify(next));
    setPathInput('');
    setMsg(`Added: ${item.name}`);
  };

  const apply = async (path: string, monitorIndex?: number) => {
    if (!window.forma?.applySystemWallpaper) {
      setMsg('Apply requires Electron on Windows');
      return;
    }
    try {
      const res =
        monitorIndex != null && window.forma.applyWallpaperOnMonitor
          ? await window.forma.applyWallpaperOnMonitor(monitorIndex, path)
          : await window.forma.applySystemWallpaper(path);
      setMsg(res.ok ? 'Wallpaper applied' : res.error || 'Failed');
      if (res.ok) eventBus.emit('wallpaper:changed', path);
    } catch (err) {
      setMsg(String(err));
    }
  };

  const toggleFav = async (id: string, fav: boolean) => {
    if (window.forma?.favoriteWallpaper) {
      try {
        await window.forma.favoriteWallpaper(id, !fav);
      } catch {
        /* ignore */
      }
    }
    const next = items.map((i) =>
      i.id === id ? { ...i, is_favorite: fav ? 0 : 1 } : i
    );
    setItems(next);
    localStorage.setItem('forma.wallpapers', JSON.stringify(next));
  };

  const remove = async (id: string) => {
    if (!confirm(t('common.delete') || 'Delete?')) return;
    if (window.forma?.deleteWallpaper) {
      try {
        await window.forma.deleteWallpaper(id);
      } catch {
        /* ignore */
      }
    }
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    localStorage.setItem('forma.wallpapers', JSON.stringify(next));
  };

  const visible =
    filter === 'favorites' ? items.filter((i) => i.is_favorite === 1) : items;

  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('header.wallpapers')}</h2>
        <p className={styles.description}>Static images, per-monitor apply, live preview panel.</p>
        <div className={pageStyles.toolbar}>
          <input
            value={pathInput}
            onChange={(e) => setPathInput(e.target.value)}
            placeholder="C:\\path\\to\\image.jpg"
            style={{ flex: 1, minWidth: 200, padding: '8px 10px' }}
          />
          <button type="button" className={styles.actionBtn} onClick={() => void addPath()}>
            Add
          </button>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => setFilter(filter === 'all' ? 'favorites' : 'all')}
          >
            {filter === 'all' ? 'Show favorites' : 'Show all'}
          </button>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => {
              const next = !slideshowEnabled;
              setSlideshowEnabled(next);
              localStorage.setItem('forma.wallpaper.slideshow', next ? '1' : '0');
            }}
          >
            Slideshow: {slideshowEnabled ? 'On' : 'Off'}
          </button>
          {msg && <span className={pageStyles.msg}>{msg}</span>}
        </div>
        {displays.length > 0 && (
          <p className={styles.description}>
            Displays: {displays.map((d) => d.label).join(', ')}
          </p>
        )}
        <div className={styles.grid}>
          {visible.map((w) => (
            <div key={w.id} className={styles.card}>
              <span className={styles.cardLabel}>{w.category || 'image'}</span>
              <span className={styles.cardValue}>{w.name}</span>
              <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                <button type="button" className={styles.actionBtn} onClick={() => void apply(w.path)}>
                  Apply
                </button>
                {displays.map((d, idx) => (
                  <button
                    key={d.id}
                    type="button"
                    className={styles.actionBtn}
                    onClick={() => void apply(w.path, idx)}
                  >
                    M{idx + 1}
                  </button>
                ))}
                <button type="button" className={styles.actionBtn} onClick={() => void toggleFav(w.id, w.is_favorite === 1)}>
                  {w.is_favorite ? '★' : '☆'}
                </button>
                <button type="button" className={styles.actionBtn} onClick={() => void remove(w.id)}>
                  {t('common.delete')}
                </button>
              </div>
            </div>
          ))}
          {visible.length === 0 && <p className={styles.placeholder}>No wallpapers yet.</p>}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Live desktop</h2>
        <LiveWallpaperPanel />
      </section>
    </div>
  );
}
