import { useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { THEME_IDS, type ThemeId } from '@/core/theme/themes';
import { LOCALE_META, type LocaleId } from '@/core/i18n';
import styles from './Onboarding.module.css';

const ONBOARD_KEY = 'forma.onboarding.done';

export function needsOnboarding(): boolean {
  try {
    return localStorage.getItem(ONBOARD_KEY) !== '1';
  } catch {
    return false;
  }
}

export function Onboarding() {
  const [step, setStep] = useState(0);
  const setThemeId = useAppStore((s) => s.setThemeId);
  const setLocale = useAppStore((s) => s.setLocale);
  const themeId = useAppStore((s) => s.themeId);
  const locale = useAppStore((s) => s.locale);

  const finish = () => {
    localStorage.setItem(ONBOARD_KEY, '1');
    window.dispatchEvent(new Event('forma:onboarding-done'));
  };

  const steps = [
    {
      title: 'Welcome to FORMA',
      body: 'Personal workspace for Windows — themes, layouts, widgets and profiles in one place.',
    },
    {
      title: 'Language',
      body: 'Choose interface language. You can change it later in Appearance.',
    },
    {
      title: 'Theme',
      body: 'Pick a starting look. Full Theme Studio is in the sidebar.',
    },
    {
      title: 'Ready',
      body: 'Use Workspace Studio to place elements. Ctrl+K opens the command palette.',
    },
  ];

  const s = steps[step];

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.brand}>FORMA</div>
        <h2 className={styles.title}>{s.title}</h2>
        <p className={styles.body}>{s.body}</p>

        {step === 1 && (
          <div className={styles.grid}>
            {(Object.keys(LOCALE_META) as LocaleId[]).slice(0, 8).map((id) => (
              <button
                key={id}
                type="button"
                className={`${styles.chip} ${locale === id ? styles.active : ''}`}
                onClick={() => setLocale(id)}
              >
                {LOCALE_META[id].nativeName}
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className={styles.grid}>
            {THEME_IDS.slice(0, 6).map((id) => (
              <button
                key={id}
                type="button"
                className={`${styles.chip} ${themeId === id ? styles.active : ''}`}
                onClick={() => setThemeId(id as ThemeId)}
              >
                {id}
              </button>
            ))}
          </div>
        )}

        <div className={styles.actions}>
          {step > 0 && (
            <button type="button" className={styles.secondary} onClick={() => setStep((x) => x - 1)}>
              Back
            </button>
          )}
          {step < steps.length - 1 ? (
            <button type="button" className={styles.primary} onClick={() => setStep((x) => x + 1)}>
              Next
            </button>
          ) : (
            <button type="button" className={styles.primary} onClick={finish}>
              Get started
            </button>
          )}
          <button type="button" className={styles.secondary} onClick={finish}>
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
