import { ipcMain, app } from 'electron';
import type { DatabaseService } from '../services/database';
import {
  getSystemStats,
  getDisplays,
  setWallpaper,
  setWallpaperOnMonitor,
  getAutostartEnabled,
  setAutostart,
  launchApp,
  openExternal,
  importAssetFile,
  backupCursors,
  applyCursorArrow,
  restoreCursors,
  listImportedAssets,
} from '../windows/system';
import {
  startLiveWallpaper,
  stopLiveWallpaper,
  pauseLiveWallpaper,
  resumeLiveWallpaper,
  getLiveWallpaperStatus,
} from '../windows/liveDesktop';
import {
  SettingKeySchema,
  SettingValueSchema,
  ProfileCreateSchema,
  ProfileUpdateSchema,
  IdSchema,
  WallpaperAddSchema,
  LayoutSaveSchema,
  WorkspaceSaveSchema,
  WallpaperPathSchema,
  AppPathSchema,
  UrlSchema,
  AutostartSchema,
  parseOrThrow,
} from '../validation/schemas';
import { z } from 'zod';

const MonitorIndexSchema = z.number().int().min(0).max(31);
const AssetKindSchema = z.enum(['icon', 'cursor', 'wallpaper']);
const SourcePathSchema = z.string().min(1).max(1024);

function handle(channel: string, fn: (...args: unknown[]) => unknown) {
  ipcMain.handle(channel, async (_event, ...args) => {
    try {
      return await fn(...args);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[FORMA:IPC] ${channel}:`, message);
      throw new Error(message);
    }
  });
}

export function registerIpcHandlers(db: DatabaseService) {
  handle('app:getVersion', () => app.getVersion());

  handle('settings:getAll', () => db.getAllSettings());
  handle('settings:set', (key, value) => {
    const k = parseOrThrow(SettingKeySchema, key, 'settings.key');
    parseOrThrow(SettingValueSchema, value, 'settings.value');
    db.setSetting(k, typeof value === 'string' ? value : JSON.stringify(value));
  });

  handle('profiles:list', () => db.listProfiles());
  handle('profiles:create', (data) => {
    const parsed = parseOrThrow(ProfileCreateSchema, data, 'profiles.create');
    return db.createProfile(parsed);
  });
  handle('profiles:update', (id, data) => {
    const pid = parseOrThrow(IdSchema, id, 'profiles.id');
    const parsed = parseOrThrow(ProfileUpdateSchema, data, 'profiles.update');
    return db.updateProfile(pid, parsed);
  });
  handle('profiles:delete', (id) => {
    const pid = parseOrThrow(IdSchema, id, 'profiles.id');
    return db.deleteProfile(pid);
  });
  handle('profiles:activate', (id) => {
    const pid = parseOrThrow(IdSchema, id, 'profiles.id');
    db.activateProfile(pid);
  });

  handle('themes:list', () => db.listThemes());

  handle('wallpapers:list', () => db.listWallpapers());
  handle('wallpapers:add', (data) => {
    const parsed = parseOrThrow(WallpaperAddSchema, data, 'wallpapers.add');
    return db.addWallpaper(parsed);
  });
  handle('wallpapers:delete', (id) => {
    const pid = parseOrThrow(IdSchema, id, 'wallpapers.id');
    return db.deleteAsset(pid);
  });
  handle('wallpapers:favorite', (id, fav) => {
    const pid = parseOrThrow(IdSchema, id, 'wallpapers.id');
    db.setFavorite(pid, Boolean(fav));
  });
  handle('wallpapers:applySystem', async (imagePath) => {
    const p = parseOrThrow(WallpaperPathSchema, imagePath, 'wallpapers.path');
    return setWallpaper(p);
  });
  handle('wallpapers:applyOnMonitor', async (monitorIndex, imagePath) => {
    const idx = parseOrThrow(MonitorIndexSchema, monitorIndex, 'monitorIndex');
    const p = parseOrThrow(WallpaperPathSchema, imagePath, 'wallpapers.path');
    return setWallpaperOnMonitor(idx, p);
  });

  handle('layouts:list', () => db.listLayouts());
  handle('layouts:save', (data) => {
    const parsed = parseOrThrow(LayoutSaveSchema, data, 'layouts.save');
    return db.saveLayout(parsed);
  });
  handle('layouts:delete', (id) => {
    const pid = parseOrThrow(IdSchema, id, 'layouts.id');
    return db.deleteLayout(pid);
  });

  handle('workspaces:list', () => db.listWorkspaces());
  handle('workspaces:get', (id) => {
    const pid = parseOrThrow(IdSchema, id, 'workspaces.id');
    return db.getWorkspace(pid);
  });
  handle('workspaces:save', (data) => {
    const parsed = parseOrThrow(WorkspaceSaveSchema, data, 'workspaces.save');
    return db.saveWorkspace(parsed);
  });

  handle('system:getStats', () => getSystemStats());
  handle('system:getDisplays', () => getDisplays());
  handle('system:getAutostart', () => getAutostartEnabled());
  handle('system:setAutostart', (enabled) => {
    const v = parseOrThrow(AutostartSchema, enabled, 'system.autostart');
    setAutostart(v);
    db.setSetting('system.autostart', String(v));
    return getAutostartEnabled();
  });
  handle('system:launchApp', (appPath) => {
    const p = parseOrThrow(AppPathSchema, appPath, 'system.launchApp');
    return launchApp(p);
  });
  handle('system:openExternal', (url) => {
    const u = parseOrThrow(UrlSchema, url, 'system.openExternal');
    return openExternal(u);
  });

  handle('assets:import', (sourcePath, kind) => {
    const src = parseOrThrow(SourcePathSchema, sourcePath, 'assets.source');
    const k = parseOrThrow(AssetKindSchema, kind, 'assets.kind');
    return importAssetFile(src, k);
  });
  handle('assets:list', (kind) => {
    const k = parseOrThrow(AssetKindSchema, kind, 'assets.kind');
    return listImportedAssets(k);
  });

  handle('cursors:backup', () => backupCursors());
  handle('cursors:applyArrow', (filePath) => {
    const p = parseOrThrow(SourcePathSchema, filePath, 'cursors.path');
    return applyCursorArrow(p);
  });
  handle('cursors:restore', () => restoreCursors());

  handle('diagnostics:get', () => {
    return {
      version: app.getVersion(),
      electron: process.versions.electron,
      chrome: process.versions.chrome,
      node: process.versions.node,
      platform: process.platform,
      arch: process.arch,
      schemaVersion: db.getSetting('db.schema_version'),
      packaged: app.isPackaged,
    };
  });

  handle('liveWallpaper:start', async (data) => {
    const parsed = z
      .object({
        kind: z.enum(['video', 'web', 'gif', 'image']),
        source: z.string().min(1).max(2048),
        muted: z.boolean().optional(),
        monitorIndex: z.number().int().min(0).max(31).nullable().optional(),
      })
      .parse(data);
    return startLiveWallpaper(parsed);
  });
  handle('liveWallpaper:stop', () => stopLiveWallpaper());
  handle('liveWallpaper:pause', () => pauseLiveWallpaper());
  handle('liveWallpaper:resume', () => resumeLiveWallpaper());
  handle('liveWallpaper:status', () => getLiveWallpaperStatus());
}
