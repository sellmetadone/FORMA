import { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { THEMES, THEME_IDS } from '@/core/theme/themes';
import { WIDGET_TYPE_IDS, WIDGET_DEFINITIONS } from '@/core/widgets/definitions';
import { t } from '@/core/i18n';
import type { PageId } from '@/types';
import styles from './GlobalSearch.module.css';

type Hit = {
  id: string;
  group: string;
  label: string;
  run: () => void;
};

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const setPage = useAppStore((s) => s.setPage);
  const setThemeId = useAppStore((s) => s.setThemeId);
  const profiles = useAppStore((s) => s.profiles);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setOpen((v) => !v);
        setQ('');
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const hits: Hit[] = useMemo(() => {
    const pages: { id: PageId; label: string }[] = [
      { id: 'overview', label: 'Overview' },
      { id: 'workspace', label: 'Workspace Studio' },
      { id: 'themes', label: 'Theme Studio' },
      { id: 'wallpapers', label: 'Wallpapers' },
      { id: 'widgets', label: 'Widgets' },
      { id: 'appearance', label: 'Appearance' },
      { id: 'layouts', label: 'Layouts' },
      { id: 'profiles', label: 'Profiles' },
      { id: 'icons', label: 'Icons' },
      { id: 'settings', label: 'Settings' },
    ];
    const list: Hit[] = [
      ...pages.map((p) => ({
        id: `page-${p.id}`,
        group: 'Pages',
        label: p.label,
        run: () => setPage(p.id),
      })),
      ...THEME_IDS.map((id) => ({
        id: `theme-${id}`,
        group: 'Themes',
        label: t(THEMES[id].nameKey),
        run: () => {
          setThemeId(id);
          setPage('themes');
        },
      })),
      ...WIDGET_TYPE_IDS.map((id) => ({
        id: `widget-${id}`,
        group: 'Widgets',
        label: t(WIDGET_DEFINITIONS[id].nameKey),
        run: () => setPage('widgets'),
      })),
      ...profiles.map((p) => ({
        id: `profile-${p.id}`,
        group: 'Profiles',
        label: p.name,
        run: () => setPage('profiles'),
      })),
    ];
    const query = q.trim().toLowerCase();
    if (!query) return list.slice(0, 40);
    return list.filter(
      (h) =>
        h.label.toLowerCase().includes(query) || h.group.toLowerCase().includes(query)
    );
  }, [q, profiles, setPage, setThemeId]);

  if (!open) return null;

  const grouped = hits.reduce<Record<string, Hit[]>>((acc, h) => {
    (acc[h.group] ||= []).push(h);
    return acc;
  }, {});

  return (
    <div className={styles.overlay} onClick={() => setOpen(false)}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()} role="dialog">
        <input
          className={styles.input}
          autoFocus
          placeholder="Search pages, themes, widgets, profiles… (Ctrl+Shift+F)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && hits[0]) {
              hits[0].run();
              setOpen(false);
            }
          }}
        />
        <div className={styles.results}>
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group} className={styles.group}>
              <div className={styles.groupTitle}>{group}</div>
              {items.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  className={styles.item}
                  onClick={() => {
                    h.run();
                    setOpen(false);
                  }}
                >
                  {h.label}
                </button>
              ))}
            </div>
          ))}
          {hits.length === 0 && <div className={styles.empty}>No results</div>}
        </div>
      </div>
    </div>
  );
}
