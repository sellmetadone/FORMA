/** FORMA Backup / Import / Export — versioned JSON packages */

export const BACKUP_FORMAT_VERSION = 1;

export type FormaBackupPackage = {
  formatVersion: number;
  application: 'FORMA';
  exportedAt: string;
  appVersion?: string;
  settings?: Record<string, string>;
  profiles?: unknown[];
  workspace?: unknown;
  widgets?: unknown[];
  customThemes?: unknown[];
  activity?: unknown[];
};

export function buildFullBackup(
  partial: Omit<FormaBackupPackage, 'formatVersion' | 'application' | 'exportedAt'>
): FormaBackupPackage {
  return {
    formatVersion: BACKUP_FORMAT_VERSION,
    application: 'FORMA',
    exportedAt: new Date().toISOString(),
    ...partial,
  };
}

export function validateBackup(
  data: unknown
): { ok: true; data: FormaBackupPackage } | { ok: false; error: string } {
  if (!data || typeof data !== 'object') return { ok: false, error: 'Not an object' };
  const d = data as Record<string, unknown>;
  if (d.application !== 'FORMA') return { ok: false, error: 'Not a FORMA backup' };
  if (typeof d.formatVersion !== 'number') return { ok: false, error: 'Missing formatVersion' };
  if (d.formatVersion > BACKUP_FORMAT_VERSION) {
    return {
      ok: false,
      error: `Backup format ${d.formatVersion} is newer than supported ${BACKUP_FORMAT_VERSION}`,
    };
  }
  return { ok: true, data: data as FormaBackupPackage };
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function collectLocalBackup(appVersion?: string): FormaBackupPackage {
  const settings: Record<string, string> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith('forma.')) settings[k] = localStorage.getItem(k) || '';
    }
  } catch {
    /* ignore */
  }

  let widgets: unknown[] = [];
  try {
    const raw = localStorage.getItem('forma.widgets');
    if (raw) widgets = JSON.parse(raw);
  } catch {
    /* ignore */
  }

  let customThemes: unknown[] = [];
  try {
    const raw = localStorage.getItem('forma.customThemes');
    if (raw) customThemes = JSON.parse(raw);
  } catch {
    /* ignore */
  }

  let activity: unknown[] = [];
  try {
    const raw = localStorage.getItem('forma.activityLog');
    if (raw) activity = JSON.parse(raw);
  } catch {
    /* ignore */
  }

  let workspace: unknown = null;
  try {
    const raw = localStorage.getItem('forma.workspace.ws-default');
    if (raw) workspace = { id: 'ws-default', config: raw };
  } catch {
    /* ignore */
  }

  return buildFullBackup({
    appVersion,
    settings,
    workspace,
    widgets,
    customThemes,
    activity,
  });
}

export function applyBackup(
  pkg: FormaBackupPackage,
  _opts: { overwriteSettings?: boolean; overwriteWorkspace?: boolean } = {}
): string[] {
  const notes: string[] = [];
  if (pkg.widgets) {
    try {
      localStorage.setItem('forma.widgets', JSON.stringify(pkg.widgets));
      notes.push('widgets applied');
    } catch {
      notes.push('widgets failed');
    }
  }
  if (pkg.customThemes) {
    try {
      localStorage.setItem('forma.customThemes', JSON.stringify(pkg.customThemes));
      notes.push('custom themes applied');
    } catch {
      notes.push('custom themes failed');
    }
  }
  if (pkg.workspace) {
    try {
      const ws = pkg.workspace as { id?: string; config?: string };
      const cfg = typeof ws.config === 'string' ? ws.config : JSON.stringify(ws.config ?? ws);
      localStorage.setItem(`forma.workspace.${ws.id || 'ws-default'}`, cfg);
      notes.push('workspace applied');
    } catch {
      notes.push('workspace failed');
    }
  }
  if (pkg.activity) {
    try {
      localStorage.setItem('forma.activityLog', JSON.stringify(pkg.activity));
      notes.push('activity applied');
    } catch {
      notes.push('activity failed');
    }
  }
  return notes;
}
