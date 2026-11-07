import { describe, it, expect } from 'vitest';
import {
  BACKUP_FORMAT_VERSION,
  buildFullBackup,
  validateBackup,
} from '../src/core/backup/index';

describe('backup package', () => {
  it('builds versioned package', () => {
    const pkg = buildFullBackup({ appVersion: '1.0.0', settings: { 'ui.themeId': 'dark' } });
    expect(pkg.application).toBe('FORMA');
    expect(pkg.formatVersion).toBe(BACKUP_FORMAT_VERSION);
    expect(pkg.settings?.['ui.themeId']).toBe('dark');
    expect(pkg.exportedAt).toBeTruthy();
  });

  it('rejects non-FORMA payloads', () => {
    const r = validateBackup({ application: 'OTHER', formatVersion: 1 });
    expect(r.ok).toBe(false);
  });

  it('rejects future format versions', () => {
    const r = validateBackup({
      application: 'FORMA',
      formatVersion: BACKUP_FORMAT_VERSION + 10,
    });
    expect(r.ok).toBe(false);
  });

  it('accepts valid package', () => {
    const r = validateBackup(
      buildFullBackup({ settings: { 'ui.locale': 'en' } })
    );
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.settings?.['ui.locale']).toBe('en');
  });
});
