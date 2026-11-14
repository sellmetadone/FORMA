import { LiveWallpaperPanel } from '@/components/wallpaper/LiveWallpaperPanel';
import { useCallback, useEffect, useState } from 'react';
import { ImagePlus, Star, Trash2 } from 'lucide-react';
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
  created_at?: string;
}

function toFileUrl(path: string) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path) || path.startsWith('data:')) return path;
  return `file:///${path.replace(/\\/g, '/')}`;
}

function uid() {
  return `wp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function WallpapersPage() {
  const locale = useAppStore((s) => s.locale);
  void locale;
  const [items, setItems] = useState<WallpaperItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [slideshowEnabled, setSlideshowEnabled] = useState(
    () => localStorage.getItem('forma.wallpaper.slideshow') === '1'
  );
  const [slideshowMin, setSlideshowMin] = useState(() =>
    Number(localStorage.getItem('forma.wallpaper.intervalMin') || '30')
  );
  const [displays, setDisplays] = useState<DisplayInfo[]>([]);
  const [monitorMap, setMonitorMap] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState('');
  const [previewPath, setPreviewPath] = useState<string | null>(null);
  const [lastAppliedPath, setLastAppliedPath] = useState<string | null>(() =>
    localStorage.getItem('forma.lastWallpaperPath')
  );
  const [pathInput, setPathInput] = useState('');

  const load = useCallback(async () => {
    if (window.forma?.getWallpapers) {
      try {
        const list = (await window.forma.getWallpapers()) as WallpaperItem[];
        setItems(list ?? []);
      } catch (err) {
        console.error(err);
      }
    } else {
      try {
        const raw = localStorage.getItem('forma.wallpapers');
        if (raw) setItems(JSON.parse(raw));
      } catch {
        /* ignore */
      }
    }
    if (window.forma?.getDisplays) {
      try {
        setDisplays(((await window.forma.getDisplays()) as DisplayInfo[]) ?? []);
      } catch {
        /* ignore */
      }
    }
    try {
      const raw = localStorage.getItem('forma.wallpaper.monitors');
      if (raw) setMonitorMap(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void load();
    const saved = localStorage.getItem('forma.activeWallpaper');
    if (saved) setActiveId(saved);
  }, [load]);

  const persistLocal = (list: WallpaperItem[]) => {
    try {
      localStorage.setItem('forma.wallpapers', JSON.stringify(list));
    } catch {
      /* ignore */
    }
  };

  const persistMonitors = (map: Record<string, string>) => {
    setMonitorMap(map);
    localStorage.setItem('forma.wallpaper.monitors', JSON.stringify(map));
    if (window.forma?.setSetting) {
      void window.forma.setSetting('wallpaper.monitors', JSON.stringify(map)).catch(() => {});
    }
  };

  const addFromFile = async (file: File) => {
    const item: WallpaperItem = {
      id: uid(),
      name: file.name.replace(/\.[^.]+$/, ''),
      path: file.name,
      category: 'user',
      is_favorite: 0,
      created_at: new Date().toISOString(),
    };
    if (window.forma?.addWallpaper) {
      try {
        const row = (await window.forma.addWallpaper(item)) as WallpaperItem;
        setItems((prev) => [...prev, row ?? item]);
        eventBus.emit('wallpaper:changed');
        return;
      } catch (err) {
        console.error(err);
      }
    }
    const next = [...items, item];
    setItems(next);
    persistLocal(next);
  };

  const addFromPath = async () => {
    const src = pathInput.trim();
    if (!src) return;
    if (window.forma?.importAsset) {
      try {
        const res = await window.forma.importAsset(src, 'wallpaper');
        if (!res.ok || !res.dest) {
          setMsg(res.error || 'Import failed');
          return;
        }
        const item: WallpaperItem = {
          id: uid(),
          name: res.name || 'Wallpaper',
          path: res.dest,
          category: 'user',
          is_favorite: 0,
        };
        if (window.forma.addWallpaper) await window.forma.addWallpaper(item);
        setItems((prev) => [...prev, item]);
        setPathInput('');
        setMsg('Imported wallpaper');
        return;
      } catch (err) {
        setMsg(String(err));
        return;
      }
    }
    const item: WallpaperItem = {
      id: uid(),
      name: src.split(/[\\/]/).pop() || 'Wallpaper',
      path: src,
      category: 'user',
      is_favorite: 0,
    };
    setItems((prev) => [...prev, item]);
    persistLocal([...items, item]);
    setPathInput('');
  };

  const remove = async (id: string) => {
    if (window.forma?.deleteWallpaper) {
      try {
        await window.forma.deleteWallpaper(id);
      } catch (err) {
        console.error(err);
      }
    }
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    persistLocal(next);
    if (activeId === id) {
      setActiveId(null);
      localStorage.removeItem('forma.activeWallpaper');
    }
  };

  const toggleFav = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const fav = item.is_favorite ? 0 : 1;
    if (window.forma?.favoriteWallpaper) {
      try {
        await window.forma.favoriteWallpaper(id, !!fav);
      } catch (err) {
        console.error(err);
      }
    }
    const next = items.map((i) => (i.id === id ? { ...i, is_favorite: fav } : i));
    setItems(next);
    persistLocal(next);
  };

  const applyPrimary = async (id: string) => {
    setActiveId(id);
    const found = items.find((i) => i.id === id);
    if (found) setPreviewPath(found.path);
    localStorage.setItem('forma.activeWallpaper', id);
    eventBus.emit('wallpaper:changed', id);
    const item = items.find((i) => i.id === id);
    if (item && window.forma?.applySystemWallpaper && /[\\/]/.test(item.path)) {
      try {
        const res = await window.forma.applySystemWallpaper(
          item.path,
          lastAppliedPath || undefined
        );
        if (res.ok) {
          setLastAppliedPath(item.path);
          localStorage.setItem('forma.lastWallpaperPath', item.path);
        }
        setMsg(
          res.ok
            ? (res as { crossfaded?: boolean }).crossfaded
              ? 'Applied to desktop (crossfade)'
              : 'Applied to desktop'
            : res.error || 'Apply failed'
        );
      } catch (err) {
        setMsg(String(err));
      }
    } else {
      setMsg('Applied in app (system path required for OS wallpaper)');
    }
  };

  const assignToMonitor = async (wallpaperId: string, monitorIndex: number, displayId: string) => {
    const item = items.find((i) => i.id === wallpaperId);
    if (!item) return;
    persistMonitors({ ...monitorMap, [String(displayId)]: wallpaperId });
    if (window.forma?.applyWallpaperOnMonitor && /[\\/]/.test(item.path)) {
      try {
        const res = await window.forma.applyWallpaperOnMonitor(
          monitorIndex,
          item.path,
          lastAppliedPath || undefined
        );
        if (res.ok) {
          setLastAppliedPath(item.path);
          localStorage.setItem('forma.lastWallpaperPath', item.path);
        }
        setMsg(
          res.ok
            ? `Applied to monitor ${monitorIndex + 1}${(res as { crossfaded?: boolean }).crossfaded ? ' (crossfade)' : ''}`
            : res.error || 'Failed'
        );
      } catch (err) {
        setMsg(String(err));
      }
    } else {
      setMsg(`Assigned wallpaper to display ${displayId}`);
    }
  };

  const visible = filter === 'favorites' ? items.filter((i) => i.is_favorite) : items;

  useEffect(() => {
    if (!slideshowEnabled) return;
    const ms = Math.max(1, slideshowMin) * 60_000;
    const timer = window.setInterval(async () => {
      const pool = filter === 'favorites' ? items.filter((i) => i.is_favorite) : items;
      if (pool.length === 0) return;
      const pick = pool[Math.floor(Math.random() * pool.length)];
      if (window.forma?.applySystemWallpaper) {
        try {
          await window.forma.applySystemWallpaper(
            pick.path,
            localStorage.getItem('forma.lastWallpaperPath') || undefined
          );
          localStorage.setItem('forma.lastWallpaperPath', pick.path);
        } catch (err) {
          console.error(err);
        }
      }
    }, ms);
    return () => clearInterval(timer);
  }, [slideshowEnabled, slideshowMin, items, filter]);

  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('header.wallpapers')}</h2>
        <p className={styles.description}>{t('wallpapers.placeholder')}</p>

        <div className={pageStyles.toolbar}>
          <label className={pageStyles.fileBtn}>
            <ImagePlus size={16} />
            Add image
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void addFromFile(f);
                e.target.value = '';
              }}
            />
          </label>
          <input
            value={pathInput}
            onChange={(e) => setPathInput(e.target.value)}
            placeholder="Absolute path to import"
            style={{
              minWidth: 180,
              padding: '8px 12px',
              borderRadius: 'var(--forma-radius-sm)',
              border: '1px solid var(--forma-border)',
              background: 'var(--forma-surface)',
              color: 'var(--forma-text)',
              fontSize: 13,
            }}
          />
          <button type="button" className={styles.actionBtn} onClick={() => void addFromPath()}>
            Import path
          </button>
          <button
            type="button"
            className={`${styles.actionBtn} ${filter === 'all' ? styles.selected : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            type="button"
            className={`${styles.actionBtn} ${filter === 'favorites' ? styles.selected : ''}`}
            onClick={() => setFilter('favorites')}
          >
            Favorites
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginTop: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <input
              type="checkbox"
              checked={slideshowEnabled}
              onChange={(e) => {
                const v = e.target.checked;
                setSlideshowEnabled(v);
                localStorage.setItem('forma.wallpaper.slideshow', v ? '1' : '0');
              }}
            />
            Auto-rotate wallpapers
          </label>
          <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            Interval (min)
            <input
              type="number"
              min={1}
              max={1440}
              value={slideshowMin}
              onChange={(e) => {
                const n = Math.max(1, Number(e.target.value) || 30);
                setSlideshowMin(n);
                localStorage.setItem('forma.wallpaper.intervalMin', String(n));
              }}
              style={{ width: 64 }}
            />
          </label>
        </div>

        {msg && <p className={pageStyles.msg}>{msg}</p>}

        {previewPath && (
          <div className={styles.wallpaperPreview} style={{ marginBottom: 16, maxWidth: 720 }}>
            <img key={previewPath} src={toFileUrl(previewPath)} alt="Selected wallpaper preview" />
            <button
              type="button"
              className={styles.actionBtn}
              onClick={() => {
                const match = items.find((i) => i.path === previewPath);
                if (match) void applyPrimary(match.id);
              }}
              style={{ position: 'absolute', right: 12, bottom: 12, zIndex: 2 }}
            >
              Apply wallpaper
            </button>
          </div>
        )}

        {visible.length === 0 ? (
          <p className={styles.placeholder}>No wallpapers yet. Add a local image.</p>
        ) : (
          <div className={pageStyles.cardGrid}>
            {visible.map((wp) => (
              <div
                key={wp.id}
                className={`${pageStyles.mediaCard} ${activeId === wp.id ? pageStyles.mediaActive : ''}`}
              >
                <button
                  type="button"
                  className={styles.wallpaperCardPreview}
                  aria-label={`Preview ${wp.name}`}
                  onClick={() => setPreviewPath(wp.path)}
                >
                  <img src={toFileUrl(wp.path)} alt="" loading="lazy" />
                </button>
                <div className={pageStyles.mediaMeta}>
                  <span className={pageStyles.mediaName}>{wp.name}</span>
                  <span className={pageStyles.mediaPath}>{wp.path}</span>
                </div>
                <div style={{ display: 'flex', gap: 6, padding: '0 12px 8px', flexWrap: 'wrap' }}>
                  <button type="button" className={styles.actionBtn} onClick={() => void applyPrimary(wp.id)}>
                    Apply
                  </button>
                  <button type="button" className={pageStyles.iconOnly} onClick={() => void toggleFav(wp.id)} title="Favorite">
                    <Star size={14} fill={wp.is_favorite ? 'currentColor' : 'none'} />
                  </button>
                  <button type="button" className={pageStyles.iconOnly} onClick={() => void remove(wp.id)} title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
                {displays.length > 0 && (
                  <div style={{ padding: '0 12px 12px', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {displays.map((d, idx) => (
                      <button
                        key={d.id}
                        type="button"
                        className={styles.actionBtn}
                        style={{ padding: '2px 8px', fontSize: 11 }}
                        onClick={() => void assignToMonitor(wp.id, idx, d.id)}
                        title={d.label}
                      >
                        Mon {idx + 1}
                        {monitorMap[String(d.id)] === wp.id ? ' ✓' : ''}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {displays.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Displays</h2>
          <div className={styles.grid}>
            {displays.map((d, idx) => {
              const wpId = monitorMap[String(d.id)];
              const wp = items.find((i) => i.id === wpId);
              return (
                <div key={d.id} className={styles.card}>
                  <span className={styles.cardLabel}>{d.primary ? 'Primary' : `Monitor ${idx + 1}`}</span>
                  <span className={styles.cardValue}>{d.label}</span>
                  <span style={{ fontSize: 12, color: 'var(--forma-text-muted)' }}>
                    {d.bounds.width}×{d.bounds.height}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--forma-text-secondary)', marginTop: 6 }}>
                    {wp ? wp.name : 'No assignment'}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Live desktop</h2>
        <LiveWallpaperPanel />
      </section>
    </div>
  );
}
