import { useEffect, useState } from 'react';
import styles from './Widgets.module.css';

/**
 * OS media session controls (Media Session API).
 * No network — reflects local playback metadata when available.
 */

type Meta = { title: string; artist: string };

export function MediaWidget() {
  const [meta, setMeta] = useState<Meta>({ title: 'Nothing playing', artist: 'Media Session' });
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const ok = typeof navigator !== 'undefined' && 'mediaSession' in navigator;
    setSupported(ok);
    if (!ok) return;

    const read = () => {
      try {
        const ms = navigator.mediaSession;
        const md = ms.metadata;
        if (md) {
          setMeta({
            title: md.title || 'Playing',
            artist: md.artist || md.album || 'Local session',
          });
        }
      } catch {
        /* ignore */
      }
    };
    read();
    const id = window.setInterval(read, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={styles.widgetBody} role="group" aria-label="Media controls">
      <div style={{ fontWeight: 600 }}>{meta.title}</div>
      <div style={{ fontSize: 12, opacity: 0.75 }}>{meta.artist}</div>
      {!supported && (
        <div style={{ fontSize: 12, opacity: 0.65, marginTop: 6 }}>Media Session API unavailable</div>
      )}
      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
        <button type="button" className={styles.chipBtn} aria-label="Previous track">
          ⏮
        </button>
        <button type="button" className={styles.chipBtn} aria-label="Play">
          ▶
        </button>
        <button type="button" className={styles.chipBtn} aria-label="Pause">
          ⏸
        </button>
        <button type="button" className={styles.chipBtn} aria-label="Next track">
          ⏭
        </button>
      </div>
    </div>
  );
}
