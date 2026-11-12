import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { runMigrations } from './migrations';

export class DatabaseService {
  private db: Database.Database;

  constructor(dbPath: string) {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    try {
      this.db = new Database(dbPath);
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('foreign_keys = ON');
    } catch (err) {
      console.error('[FORMA] Failed to open database:', err);
      const hint =
        ' If NODE_MODULE_VERSION mismatch: run npm run rebuild:native (Electron ABI).';
      if (err instanceof Error) {
        err.message = err.message + hint;
      }
      throw err;
    }
  }

  async initialize() {
    try {
      this.db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY, value TEXT NOT NULL,
        updated_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE,
        theme_id TEXT, wallpaper_id TEXT, layout_id TEXT,
        is_active INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS themes (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, is_dark INTEGER DEFAULT 0,
        colors TEXT NOT NULL, fonts TEXT, radii TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS workspaces (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, profile_id TEXT, config TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE SET NULL
      );
      CREATE TABLE IF NOT EXISTS widgets (
        id TEXT PRIMARY KEY, type TEXT NOT NULL, workspace_id TEXT, config TEXT NOT NULL,
        position_x REAL DEFAULT 0, position_y REAL DEFAULT 0,
        width REAL DEFAULT 200, height REAL DEFAULT 150, z_index INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS layouts (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, config TEXT NOT NULL,
        is_preset INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS assets (
        id TEXT PRIMARY KEY, type TEXT NOT NULL, name TEXT NOT NULL, path TEXT NOT NULL,
        category TEXT, is_favorite INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS collections (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      );
      `);

      runMigrations(this.db);

      const settingsCount = (this.db.prepare('SELECT COUNT(*) as c FROM settings').get() as { c: number }).c;
      if (settingsCount === 0) {
        const defaults: [string, string][] = [
          ['app.version', '1.0.0'], ['app.language', 'en'], ['ui.theme', 'light'],
          ['ui.themeId', 'white'], ['ui.locale', 'en'], ['ui.sidebarCollapsed', 'false'],
          ['system.autostart', 'false'],
        ];
        const insert = this.db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
        for (const [k, v] of defaults) insert.run(k, v);
      }

      const themesCount = (this.db.prepare('SELECT COUNT(*) as c FROM themes').get() as { c: number }).c;
      if (themesCount === 0) {
        const light = JSON.stringify({ background: '#ffffff', surface: '#f7f7f7', text: '#1a1a1a', accent: '#2d5a4a' });
        const dark = JSON.stringify({ background: '#141414', surface: '#1e1e1e', text: '#f0f0f0', accent: '#4a8a72' });
        this.db.prepare('INSERT INTO themes (id, name, is_dark, colors) VALUES (?, ?, ?, ?)').run('theme-light', 'FORMA Light', 0, light);
        this.db.prepare('INSERT INTO themes (id, name, is_dark, colors) VALUES (?, ?, ?, ?)').run('theme-dark', 'FORMA Graphite', 1, dark);
      }

      const profilesCount = (this.db.prepare('SELECT COUNT(*) as c FROM profiles').get() as { c: number }).c;
      if (profilesCount === 0) {
        this.db.prepare('INSERT INTO profiles (id, name, theme_id, is_active) VALUES (?, ?, ?, ?)').run('profile-default', 'DEFAULT', 'white', 1);
      }

      const layoutsCount = (this.db.prepare('SELECT COUNT(*) as c FROM layouts').get() as { c: number }).c;
      if (layoutsCount === 0) {
        const minimal = JSON.stringify({ name: 'Minimal', elements: [{ id: 'el-clock', type: 'clock', x: 40, y: 40, width: 200, height: 100, zIndex: 1, title: 'Clock' }], gridSize: 20, snapToGrid: true });
        this.db.prepare('INSERT INTO layouts (id, name, config, is_preset) VALUES (?, ?, ?, ?)').run('layout-minimal', 'Minimal', minimal, 1);
      }

      const wsCount = (this.db.prepare('SELECT COUNT(*) as c FROM workspaces').get() as { c: number }).c;
      if (wsCount === 0) {
        const cfg = JSON.stringify({ name: 'Default', elements: [], gridSize: 20, snapToGrid: true });
        this.db.prepare('INSERT INTO workspaces (id, name, profile_id, config) VALUES (?, ?, ?, ?)').run('ws-default', 'Default', 'profile-default', cfg);
      }
    } catch (err) {
      console.error('[FORMA] Database initialize failed:', err);
      throw err;
    }
  }

  getSetting(key: string): string | null {
    const row = this.db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;
    return row?.value ?? null;
  }

  getAllSettings(): Record<string, string> {
    const rows = this.db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  }

  setSetting(key: string, value: string) {
    this.db.prepare(
      `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`
    ).run(key, value);
  }

  listProfiles() {
    return this.db.prepare('SELECT * FROM profiles ORDER BY name').all();
  }

  createProfile(data: { id: string; name: string; theme_id?: string; wallpaper_id?: string; layout_id?: string }) {
    this.db.prepare('INSERT INTO profiles (id, name, theme_id, wallpaper_id, layout_id) VALUES (?, ?, ?, ?, ?)').run(
      data.id, data.name, data.theme_id ?? 'white', data.wallpaper_id ?? null, data.layout_id ?? null
    );
    return this.db.prepare('SELECT * FROM profiles WHERE id = ?').get(data.id);
  }

  updateProfile(id: string, data: { name?: string; theme_id?: string | null; wallpaper_id?: string | null; layout_id?: string | null }) {
    const current = this.db.prepare('SELECT * FROM profiles WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    if (!current) return null;
    this.db.prepare(
      `UPDATE profiles SET name = ?, theme_id = ?, wallpaper_id = ?, layout_id = ?, updated_at = datetime('now') WHERE id = ?`
    ).run(
      data.name ?? current.name,
      data.theme_id !== undefined ? data.theme_id : current.theme_id,
      data.wallpaper_id !== undefined ? data.wallpaper_id : current.wallpaper_id,
      data.layout_id !== undefined ? data.layout_id : current.layout_id,
      id
    );
    return this.db.prepare('SELECT * FROM profiles WHERE id = ?').get(id);
  }

  deleteProfile(id: string) {
    const row = this.db.prepare('SELECT is_active FROM profiles WHERE id = ?').get(id) as { is_active: number } | undefined;
    if (!row) return false;
    if (row.is_active === 1) throw new Error('Cannot delete active profile');
    this.db.prepare('DELETE FROM profiles WHERE id = ?').run(id);
    return true;
  }

  activateProfile(id: string) {
    this.db.transaction(() => {
      this.db.prepare('UPDATE profiles SET is_active = 0').run();
      this.db.prepare(`UPDATE profiles SET is_active = 1, updated_at = datetime('now') WHERE id = ?`).run(id);
    })();
  }

  listThemes() {
    return this.db.prepare('SELECT * FROM themes ORDER BY name').all();
  }

  listWallpapers() {
    return this.db.prepare(`SELECT * FROM assets WHERE type = 'wallpaper' ORDER BY name`).all();
  }

  addWallpaper(data: { id: string; name: string; path: string; category?: string }) {
    this.db.prepare('INSERT INTO assets (id, type, name, path, category) VALUES (?, ?, ?, ?, ?)').run(
      data.id, 'wallpaper', data.name, data.path, data.category ?? 'user'
    );
    return this.db.prepare('SELECT * FROM assets WHERE id = ?').get(data.id);
  }

  deleteAsset(id: string) {
    this.db.prepare('DELETE FROM assets WHERE id = ?').run(id);
    return true;
  }

  setFavorite(id: string, fav: boolean) {
    this.db.prepare('UPDATE assets SET is_favorite = ? WHERE id = ?').run(fav ? 1 : 0, id);
  }

  listLayouts() {
    return this.db.prepare('SELECT * FROM layouts ORDER BY is_preset DESC, name').all();
  }

  saveLayout(data: { id: string; name: string; config: string; is_preset?: number }) {
    const existing = this.db.prepare('SELECT id FROM layouts WHERE id = ?').get(data.id);
    if (existing) {
      this.db.prepare('UPDATE layouts SET name = ?, config = ? WHERE id = ?').run(data.name, data.config, data.id);
    } else {
      this.db.prepare('INSERT INTO layouts (id, name, config, is_preset) VALUES (?, ?, ?, ?)').run(
        data.id, data.name, data.config, data.is_preset ?? 0
      );
    }
    return this.db.prepare('SELECT * FROM layouts WHERE id = ?').get(data.id);
  }

  deleteLayout(id: string) {
    const row = this.db.prepare('SELECT is_preset FROM layouts WHERE id = ?').get(id) as { is_preset: number } | undefined;
    if (!row) return false;
    if (row.is_preset === 1) throw new Error('Cannot delete preset layout');
    this.db.prepare('DELETE FROM layouts WHERE id = ?').run(id);
    return true;
  }

  listWorkspaces() {
    return this.db.prepare('SELECT * FROM workspaces ORDER BY name').all();
  }

  getWorkspace(id: string) {
    return this.db.prepare('SELECT * FROM workspaces WHERE id = ?').get(id);
  }

  saveWorkspace(data: { id: string; name: string; profile_id?: string | null; config: string }) {
    const existing = this.db.prepare('SELECT id FROM workspaces WHERE id = ?').get(data.id);
    if (existing) {
      this.db.prepare('UPDATE workspaces SET name = ?, profile_id = ?, config = ? WHERE id = ?').run(
        data.name, data.profile_id ?? null, data.config, data.id
      );
    } else {
      this.db.prepare('INSERT INTO workspaces (id, name, profile_id, config) VALUES (?, ?, ?, ?)').run(
        data.id, data.name, data.profile_id ?? null, data.config
      );
    }
    return this.db.prepare('SELECT * FROM workspaces WHERE id = ?').get(data.id);
  }

  close() {
    this.db.close();
  }
}
