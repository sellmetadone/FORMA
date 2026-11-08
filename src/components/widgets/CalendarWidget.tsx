import { useMemo, useState } from 'react';
import { WidgetChrome } from './WidgetChrome';
import styles from './Widgets.module.css';

interface Props {
  title: string;
}

export function CalendarWidget({ title }: Props) {
  const [cursor, setCursor] = useState(() => new Date());
  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const cells = useMemo(() => {
    const first = new Date(year, month, 1);
    const startPad = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const out: { day: number | null; isToday: boolean }[] = [];
    for (let i = 0; i < startPad; i++) out.push({ day: null, isToday: false });
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday =
        d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
      out.push({ day: d, isToday });
    }
    return out;
  }, [year, month]);

  const label = cursor.toLocaleString([], { month: 'long', year: 'numeric' });

  return (
    <WidgetChrome title={title}>
      <div className={styles.calNav}>
        <button type="button" onClick={() => setCursor(new Date(year, month - 1, 1))}>
          ‹
        </button>
        <span>{label}</span>
        <button type="button" onClick={() => setCursor(new Date(year, month + 1, 1))}>
          ›
        </button>
      </div>
      <div className={styles.calGrid}>
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
          <span key={d} className={styles.calDow}>
            {d}
          </span>
        ))}
        {cells.map((c, i) => (
          <span key={i} className={`${styles.calDay} ${c.isToday ? styles.calToday : ''}`}>
            {c.day ?? ''}
          </span>
        ))}
      </div>
    </WidgetChrome>
  );
}
