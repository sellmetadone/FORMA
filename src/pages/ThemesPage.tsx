import { useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { t } from '@/core/i18n';
import { THEMES, THEME_IDS, type ThemeId, type ThemeColors } from '@/core/theme/themes';
import styles from './Page.module.css';
import pageStyles from './ManagerPage.module.css';

const COLOR_KEYS: (keyof ThemeColors)[] = [
  'bg', 'surface', 'text', 'accent', 'border', 'danger', 'success',
];

export function ThemesPage() {
  const themeId = useAppStore((s) => s.themeId);
  const locale = useAppStore((s) => s.locale);
  const setThemeId = useAppStore((s) => s.setThemeId);
  const previewThemeId = useAppStore((s) => s.previewThemeId);
  const setPage = useAppStore((s) => s.setPage);
  void locale;

  const [studioId, setStudioId] = useState<ThemeId>(themeId);
  const base = THEMES[studioId];
  const [custom, setCustom] = useState<Partial<ThemeColors>>({});
  const colors = { ...base.colors, ...custom };

  const applyCustomPreview = (patch: Partial<ThemeColors>) => {
    const next = { ...custom, ...patch };
    setCustom(next);
    const root = document.documentElement;
    const merged = { ...base.colors, ...next };
    root.style.setProperty('--forma-bg', merged.bg);
    root.style.setProperty('--forma-surface', merged.surface);
    root.style.setProperty('--forma-text', merged.text);
    root.style.setProperty('--forma-accent', merged.accent);
    root.style.setProperty('--forma-border', merged.border);
    root.style.setProperty('--forma-danger', merged.danger);
    root.style.setProperty('--forma-success', merged.success);
  };

  const resetCustom = () => {
    setCustom({});
    setThemeId(studioId, false);
  };

  const exportCustom = () => {
    const payload = {
      formatVersion: 1,
      application: 'FORMA',
      type: 'theme',
      base: studioId,
      colors: { ...base.colors, ...custom },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `forma-theme-${studioId}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const saveCustomLocal = () => {
    const key = 'forma.customThemes';
    const raw = localStorage.getItem(key);
    const list = raw ? JSON.parse(raw) : [];
    list.push({
      id: `custom-${Date.now().toString(36)}`,
      name: `Custom ${studioId}`,
      base: studioId,
      colors: { ...base.colors, ...custom },
    });
    localStorage.setItem(key, JSON.stringify(list));
  };

  const importThemeFile = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (data.base && THEMES[data.base as ThemeId]) {
        setStudioId(data.base as ThemeId);
        setCustom(data.colors ?? {});
        applyCustomPreview(data.colors ?? {});
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('header.themes')}</h2>
        <p className={styles.description}>Theme Studio — pick a base and tweak colors.</p>
        <div className={styles.grid}>
          {THEME_IDS.map((id) => (
            <button
              key={id}
              type="button"
              className={styles.card}
              style={{
                cursor: 'pointer',
                borderColor: themeId === id ? 'var(--forma-accent)' : undefined,
              }}
              onClick={() => {
                setStudioId(id);
                setThemeId(id);
                setCustom({});
              }}
              onMouseEnter={() => previewThemeId(id)}
              onMouseLeave={() => previewThemeId(null)}
            >
              <span className={styles.cardLabel}>{id}</span>
              <span className={styles.cardValue}>{t(THEMES[id].nameKey)}</span>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Color studio</h2>
        <div className={pageStyles.toolbar}>
          <select
            value={studioId}
            onChange={(e) => {
              const id = e.target.value as ThemeId;
              setStudioId(id);
              setCustom({});
            }}
          >
            {THEME_IDS.map((id) => (
              <option key={id} value={id}>
                {t(THEMES[id].nameKey)}
              </option>
            ))}
          </select>
          <button type="button" className={styles.actionBtn} onClick={resetCustom}>
            Reset tweaks
          </button>
          <button type="button" className={styles.actionBtn} onClick={() => setThemeId(studioId)}>
            Save base theme
          </button>
          <button type="button" className={styles.actionBtn} onClick={() => setPage('appearance')}>
            {t('appearance.title')}
          </button>
        </div>
        <div className={styles.grid}>
          {COLOR_KEYS.map((key) => (
            <label key={key} className={styles.card} style={{ cursor: 'pointer' }}>
              <span className={styles.cardLabel}>{key}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                <input
                  type="color"
                  value={String(colors[key])}
                  onChange={(e) => applyCustomPreview({ [key]: e.target.value })}
                  style={{ width: 40, height: 28, border: 'none', background: 'none', cursor: 'pointer' }}
                />
                <span className={styles.cardValue} style={{ fontSize: 12 }}>
                  {String(colors[key])}
                </span>
              </div>
            </label>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Custom theme actions</h2>
        <div className={pageStyles.toolbar}>
          <button type="button" className={styles.actionBtn} onClick={saveCustomLocal}>
            Save custom locally
          </button>
          <button type="button" className={styles.actionBtn} onClick={exportCustom}>
            Export JSON
          </button>
          <label className={styles.actionBtn} style={{ cursor: 'pointer' }}>
            Import JSON
            <input
              type="file"
              accept="application/json,.json"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void importThemeFile(f);
                e.target.value = '';
              }}
            />
          </label>
        </div>
      </section>
    </div>
  );
}
