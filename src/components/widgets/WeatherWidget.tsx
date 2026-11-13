import { useMemo, useState } from 'react';
import styles from './Widgets.module.css';

/** Offline weather widget — local estimate, no network required. */

type LocalWeather = {
  label: string;
  tempC: number;
  hint: string;
};

function estimateLocalWeather(): LocalWeather {
  const h = new Date().getHours();
  const m = new Date().getMonth();
  const seasonal = [-2, 0, 5, 12, 18, 22, 24, 23, 18, 11, 5, 0][m];
  const diurnal = Math.sin(((h - 6) / 24) * Math.PI * 2) * 4;
  const tempC = Math.round(seasonal + diurnal);
  let label = 'Clear';
  let hint = 'Local estimate · offline';
  if (h >= 22 || h < 5) {
    label = 'Night';
    hint = 'Cooler overnight · offline model';
  } else if (h >= 5 && h < 9) {
    label = 'Morning';
  } else if (h >= 12 && h < 16) {
    label = 'Afternoon';
  }
  if (m >= 10 || m <= 1) {
    if (tempC <= 2) {
      label = 'Cold';
      hint = 'Winter-like baseline · offline';
    }
  } else if (m >= 5 && m <= 7 && tempC >= 22) {
    label = 'Warm';
  }
  return { label, tempC, hint };
}

export function WeatherWidget() {
  const [tick, setTick] = useState(0);
  const w = useMemo(() => estimateLocalWeather(), [tick]);

  return (
    <div className={styles.widgetBody} role="group" aria-label="Weather offline">
      <div style={{ fontSize: 28, fontWeight: 600 }} aria-live="polite">
        {w.tempC}°C
      </div>
      <div style={{ opacity: 0.85 }}>{w.label}</div>
      <div style={{ fontSize: 12, opacity: 0.65, marginTop: 6 }}>{w.hint}</div>
      <button
        type="button"
        className={styles.chipBtn}
        style={{ marginTop: 8 }}
        onClick={() => setTick((t) => t + 1)}
        aria-label="Refresh local weather estimate"
      >
        Refresh
      </button>
    </div>
  );
}
