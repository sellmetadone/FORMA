import { useEffect, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { WidgetChrome } from './WidgetChrome';
import styles from './Widgets.module.css';

interface Props {
  title: string;
}

export function MediaWidget({ title }: Props) {
  const [track, setTrack] = useState('No media session');
  const [artist, setArtist] = useState('');
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const tick = () => {
      try {
        const ms = navigator.mediaSession;
        if (ms?.metadata) {
          setTrack(ms.metadata.title || 'Unknown track');
          setArtist(ms.metadata.artist || '');
          setPlaying(ms.playbackState === 'playing');
        }
      } catch {
        /* ignore */
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const tryAction = (action: MediaSessionAction) => {
    try {
      void action;
    } catch {
      /* ignore */
    }
  };

  return (
    <WidgetChrome title={title}>
      <div className={styles.mediaBody}>
        <div className={styles.mediaTrack}>{track}</div>
        {artist && <div className={styles.mediaArtist}>{artist}</div>}
        <div className={styles.mediaControls}>
          <button type="button" className={styles.iconBtn} onClick={() => tryAction('previoustrack')} aria-label="Previous">
            <SkipBack size={16} />
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => tryAction(playing ? 'pause' : 'play')}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button type="button" className={styles.iconBtn} onClick={() => tryAction('nexttrack')} aria-label="Next">
            <SkipForward size={16} />
          </button>
          <Volume2 size={14} style={{ opacity: 0.5, marginLeft: 8 }} />
        </div>
        <p className={styles.mediaHint}>
          Shows Media Session metadata when available. Full system media needs OS integration.
        </p>
      </div>
    </WidgetChrome>
  );
}
