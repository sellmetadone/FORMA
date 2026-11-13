import { describe, it, expect } from 'vitest';
import { t, setLocale, getLocale, LOCALE_META, LOCALE_IDS } from '../src/core/i18n';

describe('i18n', () => {
  it('has 13 locales', () => {
    expect(LOCALE_IDS).toHaveLength(13);
  });
  it('marks he and ar as RTL', () => {
    expect(LOCALE_META.he.dir).toBe('rtl');
    expect(LOCALE_META.ar.dir).toBe('rtl');
    expect(LOCALE_META.en.dir).toBe('ltr');
  });
  it('translates known keys', () => {
    setLocale('en');
    expect(t('app.name')).toBeTruthy();
    expect(t('app.name')).not.toBe('app.name');
  });
  it('falls back to key for missing', () => {
    setLocale('en');
    expect(t('this.key.does.not.exist')).toBe('this.key.does.not.exist');
  });
  it('switches locale and keeps translations', () => {
    setLocale('ru');
    expect(getLocale()).toBe('ru');
    expect(t('app.name')).toBeTruthy();
    setLocale('en');
    expect(getLocale()).toBe('en');
  });
});
