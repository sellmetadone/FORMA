import { WidgetChrome } from './WidgetChrome';
import styles from './Widgets.module.css';

interface AppItem {
  label: string;
  path: string;
}

interface Props {
  title: string;
  apps?: AppItem[];
}

export function AppLauncherWidget({ title, apps = [] }: Props) {
  return (
    <WidgetChrome title={title}>
      <div className={styles.apps}>
        {apps.map((a) => (
          <button
            key={a.path}
            type="button"
            className={styles.appBtn}
            onClick={() => window.forma?.launchApp?.(a.path)}
          >
            {a.label}
          </button>
        ))}
      </div>
    </WidgetChrome>
  );
}
