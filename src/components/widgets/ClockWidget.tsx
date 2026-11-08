import { useEffect, useState } from 'react';
import { WidgetChrome } from './WidgetChrome';
import styles from './Widgets.module.css';

interface Props {
  format24?: boolean;
  showSeconds?: boolean;
  title: string;
}

export function ClockWidget({ format24 = true, showSeconds = true, title }: Props) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const time = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: showSeconds ? '2-digit' : undefined,
    hour12: !format24,
  });
  const date = now.toLocaleDateString([], {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <WidgetChrome title={title}>
      <div className={styles.clockTime}>{time}</div>
      <div className={styles.clockDate}>{date}</div>
    </WidgetChrome>
  );
}
