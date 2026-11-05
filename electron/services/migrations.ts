import type Database from 'better-sqlite3';

const CURRENT_SCHEMA_VERSION = 2;

export function runMigrations(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

  const row = db.prepare(`SELECT value FROM settings WHERE key = 'db.schema_version'`).get() as
    | { value: string }
    | undefined;
  let version = row ? Number(row.value) : 0;
  if (Number.isNaN(version)) version = 0;

  if (version < 1) {
    version = 1;
  }

  if (version < 2) {
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_profiles_active ON profiles(is_active);
      CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type);
      CREATE INDEX IF NOT EXISTS idx_workspaces_profile ON workspaces(profile_id);
    `);
    version = 2;
  }

  db.prepare(
    `INSERT INTO settings (key, value, updated_at) VALUES ('db.schema_version', ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`
  ).run(String(CURRENT_SCHEMA_VERSION));

  return CURRENT_SCHEMA_VERSION;
}

export { CURRENT_SCHEMA_VERSION };
