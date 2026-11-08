import type { ReactNode } from 'react';
import styles from './Widgets.module.css';

interface Props {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function WidgetChrome({ title, children, actions }: Props) {
  return (
    <div className={styles.chrome}>
      <div className={styles.chromeHeader}>
        <span className={styles.chromeTitle}>{title}</span>
        {actions && <div className={styles.chromeActions}>{actions}</div>}
      </div>
      <div className={styles.chromeBody}>{children}</div>
    </div>
  );
}
