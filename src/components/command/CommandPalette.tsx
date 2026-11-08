import { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import type { PageId } from '@/types';
import styles from './CommandPalette.module.css';

type Cmd = { id: string; label: string; run: () => void };

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const setPage = useAppStore((s) => s.setPage);
  const setThemeId = useAppStore((s) => s.setThemeId);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
        setQ('');
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const commands: Cmd[] = useMemo(
    () => [
      { id: 'go-overview', label: 'Go: Overview', run: () => setPage('overview') },
      { id: 'go-workspace', label: 'Go: Workspace Studio', run: () => setPage('workspace') },
      { id: 'go-themes', label: 'Go: Theme Studio', run: () => setPage('themes') },
      { id: 'go-wallpapers', label: 'Go: Wallpapers', run: () => setPage('wallpapers') },
      { id: 'go-widgets', label: 'Go: Widgets', run: () => setPage('widgets') },
      { id: 'go-appearance', label: 'Go: Appearance', run: () => setPage('appearance') },
      { id: 'go-profiles', label: 'Go: Profiles', run: () => setPage('profiles') },
      { id: 'go-settings', label: 'Go: Settings', run: () => setPage('settings') },
      { id: 'go-icons', label: 'Go: Icons & Cursors', run: () => setPage('icons' as PageId) },
      { id: 'theme-white', label: 'Theme: White', run: () => setThemeId('white') },
      { id: 'theme-dark', label: 'Theme: Dark', run: () => setThemeId('dark') },
    ],
    [setPage, setThemeId]
  );

  const filtered = commands.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()));

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={() => setOpen(false)}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()} role="dialog">
        <input
          className={styles.input}
          autoFocus
          placeholder="Type a command… (Ctrl+K)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && filtered[0]) {
              filtered[0].run();
              setOpen(false);
            }
          }}
        />
        <ul className={styles.list}>
          {filtered.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className={styles.item}
                onClick={() => {
                  c.run();
                  setOpen(false);
                }}
              >
                {c.label}
              </button>
            </li>
          ))}
          {filtered.length === 0 && <li className={styles.empty}>No commands</li>}
        </ul>
      </div>
    </div>
  );
}
