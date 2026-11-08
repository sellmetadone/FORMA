import { useEffect, useState } from 'react';
import { WidgetChrome } from './WidgetChrome';
import styles from './Widgets.module.css';

interface Props {
  title: string;
  city: string;
  unit: 'c' | 'f';
  onCityChange?: (city: string) => void;
}

interface WeatherData {
  temp: number;
  description: string;
  ok: boolean;
  message?: string;
}

export function WeatherWidget({ title, city, unit, onCityChange }: Props) {
  const [data, setData] = useState<WeatherData>({
    temp: 0,
    description: '—',
    ok: false,
    message: 'Optional external source',
  });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(city);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const geo = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
        );
        if (!geo.ok) throw new Error('geo failed');
        const gj = await geo.json();
        const loc = gj.results?.[0];
        if (!loc) throw new Error('city not found');
        const wx = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,weather_code`
        );
        if (!wx.ok) throw new Error('wx failed');
        const wj = await wx.json();
        const t = wj.current?.temperature_2m ?? 0;
        if (alive) {
          setData({
            temp: unit === 'f' ? Math.round((t * 9) / 5 + 32) : Math.round(t),
            description: String(wj.current?.weather_code ?? ''),
            ok: true,
          });
        }
      } catch {
        if (alive) {
          setData({
            temp: 0,
            description: 'Offline',
            ok: false,
            message: 'Weather requires network (optional)',
          });
        }
      }
    };
    load();
    const id = setInterval(load, 600_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [city, unit]);

  return (
    <WidgetChrome title={title}>
      <div className={styles.weatherCity}>
        {editing ? (
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => {
              setEditing(false);
              onCityChange?.(draft.trim() || city);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setEditing(false);
                onCityChange?.(draft.trim() || city);
              }
            }}
            autoFocus
            className={styles.weatherInput}
          />
        ) : (
          <button type="button" className={styles.weatherCityBtn} onClick={() => setEditing(true)}>
            {city}
          </button>
        )}
      </div>
      {data.ok ? (
        <>
          <div className={styles.weatherTemp}>
            {data.temp}°{unit === 'f' ? 'F' : 'C'}
          </div>
          <div className={styles.weatherDesc}>code {data.description}</div>
        </>
      ) : (
        <div className={styles.weatherDesc}>{data.message}</div>
      )}
    </WidgetChrome>
  );
}
