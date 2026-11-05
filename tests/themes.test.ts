import { describe, it, expect } from 'vitest';
import { THEMES, THEME_IDS, DEFAULT_THEME_ID } from '../src/core/theme/themes';

describe('THEMES', () => {
  it('has 11 themes', () => {
    expect(THEME_IDS).toHaveLength(11);
  });
  it('default theme exists', () => {
    expect(THEMES[DEFAULT_THEME_ID]).toBeDefined();
  });
  it('each theme has required color tokens', () => {
    for (const id of THEME_IDS) {
      const c = THEMES[id].colors;
      expect(c.bg).toMatch(/^#/);
      expect(c.surface).toMatch(/^#/);
      expect(c.text).toMatch(/^#/);
      expect(c.accent).toMatch(/^#/);
      expect(typeof c.isDark).toBe('boolean');
    }
  });
});
