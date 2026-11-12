import { useEffect, useState } from 'react';
import {
  addToLibrary,
  detectKind,
  filterLibrary,
  loadLibrary,
  removeFromLibrary,
  toggleFavorite,
} from '@/core/wallpaper/library';
import type { WallpaperEntry, WallpaperKind } from '@/core/wallpaper/types';
import { smartPause } from '@/core/wallpaper/smartPause';
import { VideoRenderer } from './VideoRenderer';
import { WebRenderer } from './WebRenderer';
import styles from '@/pages/Page.module.css';

export function LiveWallpaperPanel() {
  const [items, setItems] = useState<WallpaperEntry[]>(() => loadLibrary());
  const [kind, setKind] = useState<WallpaperKind | 'all'>('all');
  const [q, setQ] = useState('');
  const [preview, setPreview] = useState<WallpaperEntry | null>(null);
  const [pauseState, setPauseState] = useState(smartPause.getState());
  const [urlInput, setUrlInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [liveMsg, setLiveMsg] = useState('');

  useEffect(() => {
    const unsub = smartPause.subscribe(setPauseState);
    const detach = smartPause.attach();
    return () => {
      unsub();
      detach();
    };
  }, []);

  const visible = filterLibrary(items, { q, kind });
  const refresh = () => setItems(loadLibrary());

  const addUrl = () => {
    const source = urlInput.trim();
    if (!source) return;
    const k = detectKind(source);
    addToLibrary({
      name: nameInput.trim() || source.slice(0, 48),
      kind: k,
      source,
      category: k,
      muted: true,
    });
    setUrlInput('');
    setNameInput('');
    refresh();
  };

  const startSystemLive = async (entry: WallpaperEntry) => {
    if (!window.forma?.startLiveWallpaper) {
      setLiveMsg('Live desktop requires Electron');
      return;
    }
    try {
      const res = await window.forma.startLiveWallpaper({
        kind: entry.kind === 'web' ? 'web' : entry.kind === 'gif' ? 'gif' : 'video',
        source: entry.source,
        muted: entry.muted !== false,
      });
      setLiveMsg(
        res.ok
          ? res.attachedWorkerW
            ? 'Live wallpaper attached (WorkerW)'
            : 'Live window started (fallback)'
          : res.error || 'Failed'
      );
    } catch (err) {
      setLiveMsg(String(err));
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <input
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Name"
          style={{ padding: '6px 10px' }}
        />
        <input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Path or https:// URL"
          style={{ flex: 1, minWidth: 180, padding: '6px 10px' }}
        />
        <button type="button" className={styles.actionBtn} onClick={addUrl}>
          Add to library
        </button>
        <select value={kind} onChange={(e) => setKind(e.target.value as WallpaperKind | 'all')}>
          <option value="all">All</option>
          <option value="video">Video</option>
          <option value="web">Web</option>
          <option value="image">Image</option>
          <option value="gif">GIF</option>
        </select>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter…"
          style={{ padding: '6px 10px' }}
        />
        <button
          type="button"
          className={styles.actionBtn}
          onClick={() => smartPause.setManualPause(!pauseState.paused)}
        >
          SmartPause: {pauseState.paused ? pauseState.reason : 'running'}
        </button>
        {window.forma?.stopLiveWallpaper && (
          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => void window.forma.stopLiveWallpaper().then(() => setLiveMsg('Stopped'))}
          >
            Stop live desktop
          </button>
        )}
      </div>
      {liveMsg && <p className={styles.description}>{liveMsg}</p>}

      <div className={styles.grid}>
        {visible.map((e) => (
          <div key={e.id} className={styles.card}>
            <span className={styles.cardLabel}>{e.kind}</span>
            <span className={styles.cardValue}>{e.name}</span>
            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              <button type="button" className={styles.actionBtn} onClick={() => setPreview(e)}>
                Preview
              </button>
              <button type="button" className={styles.actionBtn} onClick={() => void startSystemLive(e)}>
                Live desktop
              </button>
              <button
                type="button"
                className={styles.actionBtn}
                onClick={() => {
                  toggleFavorite(e.id);
                  refresh();
                }}
              >
                {e.favorite ? '★' : '☆'}
              </button>
              <button
                type="button"
                className={styles.actionBtn}
                onClick={() => {
                  removeFromLibrary(e.id);
                  refresh();
                  if (preview?.id === e.id) setPreview(null);
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {preview && (
        <div
          style={{
            marginTop: 16,
            height: 220,
            borderRadius: 10,
            overflow: 'hidden',
            border: '1px solid var(--forma-border)',
          }}
        >
          {(preview.kind === 'video' || preview.kind === 'gif') && (
            <VideoRenderer src={preview.source} muted={preview.muted !== false} />
          )}
          {preview.kind === 'web' && <WebRenderer url={preview.source} />}
          {preview.kind === 'image' && (
            <img
              src={preview.source.startsWith('http') ? preview.source : `file:///${preview.source.replace(/\\/g, '/')}`}
              alt={preview.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
        </div>
      )}
    </div>
  );
}
