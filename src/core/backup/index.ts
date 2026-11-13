/** FORMA Backup / Import / Export — versioned JSON packages */

export const BACKUP_FORMAT_VERSION = 2;

export type FormaBackupPackage = {
  formatVersion: number;
  application: 'FORMA';
  exportedAt: string;
  appVersion?: string;
  appearance?: {
    themeId?: string;
    locale?: string;
    highContrast?: boolean;
  };
  settings?: Record<string, string>;
  profiles?: unknown[];
  workspace?: unknown;
  widgets?: unknown[];
  customThemes?: unknown[];
  wallpaperLibrary?: unknown[];
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

function readLS(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function collectLocalBackup(appVersion?: string): Promise<FormaBackupPackage> {
  const settings: Record<string, string> = {};
  try {
    if (window.forma?.getSettings) {
      const s = (await window.forma.getSettings()) as Record<string, string>;
      Object.assign(settings, s);
    }
  } catch {
    /* ignore */
  }
  try {
    const themeId = localStorage.getItem('forma.themeId') || settings['ui.themeId'];
    const locale = localStorage.getItem('forma.locale') || settings['ui.locale'];
    if (themeId) settings['ui.themeId'] = themeId;
    if (locale) settings['ui.locale'] = locale;
  } catch {
    /* ignore */
  }

  let profiles: unknown[] = [];
  try {
    if (window.forma?.getProfiles) profiles = (await window.forma.getProfiles()) as unknown[];
  } catch {
    /* ignore */
  }

  let workspace: unknown = null;
  try {
    if (window.forma?.getWorkspace) workspace = await window.forma.getWorkspace('ws-default');
  } catch {
    /* ignore */
  }
  if (!workspace) {
    const raw = localStorage.getItem('forma.workspace.ws-default');
    if (raw) workspace = { id: 'ws-default', config: raw };
  }

  const widgets = readLS('forma.widgets') || [];
  const customThemes = readLS('forma.customThemes') || [];
  const wallpaperLibrary = readLS('forma.wallpaperLibrary') || readLS('forma.wallpapers.library') || [];
  const activity = readLS('forma.activity') || [];

  let highContrast = false;
  try {
    highContrast = localStorage.getItem('forma.a11y.highContrast') === '1';
  } catch {
    /* ignore */
  }

  return buildFullBackup({
    appVersion,
    appearance: {
      themeId: settings['ui.themeId'] || localStorage.getItem('forma.themeId') || 'white',
      locale: settings['ui.locale'] || localStorage.getItem('forma.locale') || 'en',
      highContrast,
    },
    settings,
    profiles,
    workspace,
    widgets: Array.isArray(widgets) ? widgets : [],
    customThemes: Array.isArray(customThemes) ? customThemes : [],
    wallpaperLibrary: Array.isArray(wallpaperLibrary) ? wallpaperLibrary : [],
    activity: Array.isArray(activity) ? activity : [],
  });
}

export async function applyBackup(
  pkg: FormaBackupPackage,
  opts: { overwriteSettings?: boolean; overwriteWorkspace?: boolean } = {}
): Promise<string[]> {
  const notes: string[] = [];

  if (pkg.appearance) {
    try {
      if (pkg.appearance.themeId) {
        localStorage.setItem('forma.themeId', pkg.appearance.themeId);
        if (window.forma?.setSetting) await window.forma.setSetting('ui.themeId', pkg.appearance.themeId);
      }
      if (pkg.appearance.locale) {
        localStorage.setItem('forma.locale', pkg.appearance.locale);
        if (window.forma?.setSetting) await window.forma.setSetting('ui.locale', pkg.appearance.locale);
      }
      if (typeof pkg.appearance.highContrast === 'boolean') {
        localStorage.setItem('forma.a11y.highContrast', pkg.appearance.highContrast ? '1' : '0');
        document.documentElement.dataset.contrast = pkg.appearance.highContrast ? 'high' : 'normal';
      }
      notes.push('appearance applied');
    } catch {
      notes.push('appearance failed');
    }
  }

  if (opts.overwriteSettings !== false && pkg.settings && window.forma?.setSetting) {
    for (const [k, v] of Object.entries(pkg.settings)) {
      try {
        await window.forma.setSetting(k, v);
      } catch {
        notes.push(`settings:${k} failed`);
      }
    }
    notes.push('settings applied');
  }

  if (opts.overwriteWorkspace !== false && pkg.workspace) {
    try {
      const ws = pkg.workspace as { id?: string; name?: string; config?: string };
      const config =
        typeof ws.config === 'string' ? ws.config : ws.config != null ? JSON.stringify(ws.config) : '';
      if (window.forma?.saveWorkspace && config) {
        await window.forma.saveWorkspace({
          id: ws.id || 'ws-default',
          name: ws.name || 'Restored',
          config,
        });
        notes.push('workspace applied');
      } else if (config) {
        localStorage.setItem(`forma.workspace.${ws.id || 'ws-default'}`, config);
        notes.push('workspace applied (local)');
      }
    } catch {
      notes.push('workspace failed');
    }
  }

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

  if (pkg.wallpaperLibrary) {
    try {
      localStorage.setItem('forma.wallpaperLibrary', JSON.stringify(pkg.wallpaperLibrary));
      notes.push('wallpaper library applied');
    } catch {
      notes.push('wallpaper library failed');
    }
  }

  if (pkg.profiles && window.forma?.createProfile) {
    for (const pr of pkg.profiles as { id?: string; name?: string; theme_id?: string }[]) {
      if (!pr?.name) continue;
      try {
        await window.forma.createProfile({
          id: `imported-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
          name: `${pr.name} (import)`,
          theme_id: pr.theme_id,
        });
      } catch {
        notes.push(`profile ${pr.name} skip`);
      }
    }
    notes.push('profiles import attempted');
  }

  return notes;
}
