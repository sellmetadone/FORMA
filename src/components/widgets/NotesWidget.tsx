import { WidgetChrome } from './WidgetChrome';
import styles from './Widgets.module.css';

interface Props {
  title: string;
  text?: string;
  onChange?: (text: string) => void;
}

export function NotesWidget({ title, text = '', onChange }: Props) {
  return (
    <WidgetChrome title={title}>
      <textarea
        className={styles.notesArea}
        value={text}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder="Notes…"
      />
    </WidgetChrome>
  );
}
