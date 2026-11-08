import { useEffect, useState } from 'react';
import { WidgetChrome } from './WidgetChrome';
import type { SystemStats } from '@/types';
import styles from './Widgets.module.css';

interface Props {
  title: string;
}

type Stats = SystemStats & { uptimeSec?: number; cpuCount?: number };

const FALLBACK: Stats = {
  cpuPercent: 0,
  memUsedMb: 0,
  memTotalMb: 0,
  memPercent: 0,
  platform: typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
  uptimeSec: 0,
  cpuCount: 0,
};

function fmtUptime(sec: number) {
  if (!sec) return '—';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${h}h ${m}m`;
}

export function SystemMonitorWidget({ title }: Props) {
  const [stats, setStats] = useState<Stats>(FALLBACK);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      if (window.forma?.getSystemStats) {
        try {
          const s = (await window.forma.getSystemStats()) as Stats;
          if (alive && s) setStats(s);
          return;
        } catch {
          /* fallback */
        }
      }
      if (alive) {
        setStats({
          ...FALLBACK,
          memPercent: Math.min(100, Math.round(Math.random() * 15 + 40)),
          cpuPercent: Math.min(100, Math.round(Math.random() * 25 + 5)),
        });
      }
    };
    tick();
    const id = setInterval(tick, 2000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  return (
    <WidgetChrome title={title}>
      <div className={styles.meter}>
        <div className={styles.meterLabel}>
          <span>CPU{stats.cpuCount ? ` ×${stats.cpuCount}` : ''}</span>
          <span>{stats.cpuPercent}%</span>
        </div>
        <div className={styles.meterBar}>
          <div className={styles.meterFill} style={{ width: `${stats.cpuPercent}%` }} />
        </div>
      </div>
      <div className={styles.meter}>
        <div className={styles.meterLabel}>
          <span>RAM</span>
          <span>
            {stats.memTotalMb > 0
              ? `${stats.memUsedMb}/${stats.memTotalMb} MB`
              : `${stats.memPercent}%`}
          </span>
        </div>
        <div className={styles.meterBar}>
          <div className={styles.meterFill} style={{ width: `${stats.memPercent}%` }} />
        </div>
      </div>
      <div className={styles.platform}>
        {stats.platform}
        {stats.uptimeSec ? ` · up ${fmtUptime(stats.uptimeSec)}` : ''}
      </div>
    </WidgetChrome>
  );
}
