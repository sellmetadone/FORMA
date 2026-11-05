import { describe, it, expect } from 'vitest';
import {
  SettingKeySchema,
  ProfileCreateSchema,
  WallpaperPathSchema,
  UrlSchema,
  ProfileExportSchema,
  parseOrThrow,
} from '../src/core/validation/schemas';

describe('SettingKeySchema', () => {
  it('accepts dotted keys', () => {
    expect(SettingKeySchema.parse('ui.themeId')).toBe('ui.themeId');
  });
  it('rejects empty', () => {
    expect(() => SettingKeySchema.parse('')).toThrow();
  });
  it('rejects spaces', () => {
    expect(() => SettingKeySchema.parse('bad key')).toThrow();
  });
});

describe('ProfileCreateSchema', () => {
  it('accepts valid profile', () => {
    const p = ProfileCreateSchema.parse({ id: 'profile-1', name: 'Work' });
    expect(p.name).toBe('Work');
  });
  it('rejects empty name', () => {
    expect(() => ProfileCreateSchema.parse({ id: 'x', name: '' })).toThrow();
  });
});

describe('WallpaperPathSchema', () => {
  it('accepts png path', () => {
    expect(WallpaperPathSchema.parse('C:\\Users\\a\\pic.png')).toContain('.png');
  });
  it('rejects exe', () => {
    expect(() => WallpaperPathSchema.parse('/tmp/a.exe')).toThrow();
  });
});

describe('UrlSchema', () => {
  it('accepts https', () => {
    expect(UrlSchema.parse('https://example.com')).toMatch(/^https/);
  });
  it('rejects file protocol', () => {
    expect(() => UrlSchema.parse('file:///etc/passwd')).toThrow();
  });
});

describe('ProfileExportSchema', () => {
  it('accepts v1 export', () => {
    const data = {
      formatVersion: 1 as const,
      application: 'FORMA' as const,
      profile: { name: 'DEFAULT', theme: 'white' },
    };
    expect(ProfileExportSchema.parse(data).profile.name).toBe('DEFAULT');
  });
});

describe('parseOrThrow', () => {
  it('returns data on success', () => {
    expect(parseOrThrow(SettingKeySchema, 'a.b')).toBe('a.b');
  });
  it('throws with label on failure', () => {
    expect(() => parseOrThrow(SettingKeySchema, '', 'test')).toThrow(/test/);
  });
});
