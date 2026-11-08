import { useEffect, useRef } from 'react';
import { WidgetChrome } from './WidgetChrome';
import styles from './Widgets.module.css';

interface Props {
  title: string;
  remaining: number;
  running: boolean;
  onChange: (patch: { remaining?: number; running?: boolean; seconds?: number }) => void;
  total?: number;
}

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export function TimerWidget({ title, remaining, running, onChange, total = 300 }: Props) {
  const ref = useRef(remaining);
  ref.current = remaining;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      if (ref.current <= 0) {
        onChange({ running: false, remaining: 0 });
        return;
      }
      onChange({ remaining: ref.current - 1 });
    }, 1000);
    return () => clearInterval(id);
  }, [running, onChange]);

  return (
    <WidgetChrome title={title}>
      <div className={styles.timerDisplay}>{fmt(remaining)}</div>
      <div className={styles.timerActions}>
        <button
          type="button"
          className={styles.timerBtn}
          onClick={() => onChange({ running: !running })}
        >
          {running ? 'Pause' : 'Start'}
        </button>
        <button
          type="button"
          className={styles.timerBtn}
          onClick={() => onChange({ remaining: total, running: false, seconds: total })}
        >
          Reset
        </button>
      </div>
    </WidgetChrome>
  );
}
