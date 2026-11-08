import { WidgetChrome } from './WidgetChrome';
import styles from './Widgets.module.css';

interface Link {
  label: string;
  url: string;
}

interface Props {
  title: string;
  links?: Link[];
}

export function QuickLinksWidget({ title, links = [] }: Props) {
  return (
    <WidgetChrome title={title}>
      <ul className={styles.links}>
        {links.map((l) => (
          <li key={l.url}>
            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => window.forma?.openExternal?.(l.url)}
            >
              {l.label}
            </button>
          </li>
        ))}
      </ul>
    </WidgetChrome>
  );
}
