import { useEffect, useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { eventBus } from '@/core/events/eventBus';
import { THEMES, type ThemeId } from '@/core/theme/themes';
import { t } from '@/core/i18n';
import type { Profile } from '@/types';
import styles from './Page.module.css';
import pageStyles from './ManagerPage.module.css';

export function ProfilesPage() {
  const locale = useAppStore((s) => s.locale);
  void locale;
  const profiles = useAppStore((s) => s.profiles);
  const setProfiles = useAppStore((s) => s.setProfiles);
  const activeProfile = useAppStore((s) => s.activeProfile);
  const setActiveProfile = useAppStore((s) => s.setActiveProfile);
  const setThemeId = useAppStore((s) => s.setThemeId);
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');

  const refresh = async () => {
    if (!window.forma?.getProfiles) return;
    try {
      const list = (await window.forma.getProfiles()) as Profile[];
      setProfiles(list ?? []);
      const active = list?.find((p) => p.is_active === 1) ?? null;
      setActiveProfile(active);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const create = async () => {
    const n = name.trim();
    if (!n) {
      setMsg('Enter a name');
      return;
    }
    const id = `profile-${Date.now().toString(36)}`;
    if (window.forma?.createProfile) {
      try {
        await window.forma.createProfile({ id, name: n, theme_id: 'white' });
        setName('');
        setMsg(`Created: ${n}`);
        await refresh();
      } catch (err) {
        setMsg(String(err));
      }
    } else {
      setMsg('Profiles require Electron / SQLite');
    }
  };

  const activate = async (id: string) => {
    const profile = profiles.find((p) => p.id === id);
    if (!profile) return;
    if (window.forma?.activateProfile) {
      try {
        await window.forma.activateProfile(id);
      } catch (err) {
        console.error(err);
      }
    }
    const updated = profiles.map((p) => ({
      ...p,
      is_active: p.id === id ? 1 : 0,
    }));
    setProfiles(updated);
    setActiveProfile({ ...profile, is_active: 1 });
    if (profile.theme_id && profile.theme_id in THEMES) {
      setThemeId(profile.theme_id as ThemeId);
    }
    eventBus.emit('profile:activated', id);
    setMsg(`Active: ${profile.name}`);
  };

  const remove = async (id: string) => {
    if (!confirm(t('profiles.confirmDelete'))) return;
    if (window.forma?.deleteProfile) {
      try {
        await window.forma.deleteProfile(id);
        await refresh();
        setMsg('Deleted');
      } catch (err) {
        setMsg(String(err));
      }
    }
  };

  const exportProfile = (p: Profile) => {
    const payload = {
      formatVersion: 1,
      application: 'FORMA',
      profile: {
        name: p.name,
        theme: p.theme_id,
        wallpaper: p.wallpaper_id,
        layout: p.layout_id,
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `forma-profile-${p.name}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('header.profiles')}</h2>
        <p className={styles.description}>Create and switch personal workspace profiles.</p>
        <div className={pageStyles.toolbar}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New profile name"
            style={{ padding: '8px 10px', minWidth: 180 }}
          />
          <button type="button" className={styles.actionBtn} onClick={() => void create()}>
            {t('common.create') || 'Create'}
          </button>
          {msg && <span className={pageStyles.msg}>{msg}</span>}
        </div>
        <div className={styles.grid}>
          {profiles.map((p) => (
            <div key={p.id} className={styles.card}>
              <span className={styles.cardLabel}>
                {p.is_active === 1 || activeProfile?.id === p.id ? 'Active' : 'Profile'}
              </span>
              <span className={styles.cardValue}>{p.name}</span>
              <span className={styles.cardLabel}>theme: {p.theme_id || '—'}</span>
              <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                <button type="button" className={styles.actionBtn} onClick={() => void activate(p.id)}>
                  Activate
                </button>
                <button type="button" className={styles.actionBtn} onClick={() => exportProfile(p)}>
                  Export
                </button>
                {p.is_active !== 1 && (
                  <button type="button" className={styles.actionBtn} onClick={() => void remove(p.id)}>
                    {t('common.delete')}
                  </button>
                )}
              </div>
            </div>
          ))}
          {profiles.length === 0 && (
            <p className={styles.placeholder}>No profiles yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
