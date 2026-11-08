import { contextBridge, ipcRenderer } from 'electron';

export type FormaAPI = {
  getVersion: () => Promise<string>;
  getSettings: () => Promise<Record<string, unknown>>;
  setSetting: (key: string, value: unknown) => Promise<void>;
  getProfiles: () => Promise<unknown[]>;
  createProfile: (data: unknown) => Promise<unknown>;
  updateProfile: (id: string, data: unknown) => Promise<unknown>;
  deleteProfile: (id: string) => Promise<boolean>;
  activateProfile: (id: string) => Promise<void>;
  getThemes: () => Promise<unknown[]>;
  getWallpapers: () => Promise<unknown[]>;
  addWallpaper: (data: unknown) => Promise<unknown>;
  deleteWallpaper: (id: string) => Promise<boolean>;
  favoriteWallpaper: (id: string, fav: boolean) => Promise<void>;
  applySystemWallpaper: (imagePath: string) => Promise<{ ok: boolean; error?: string }>;
  applyWallpaperOnMonitor: (
    monitorIndex: number,
    imagePath: string
  ) => Promise<{ ok: boolean; error?: string }>;
  getLayouts: () => Promise<unknown[]>;
  saveLayout: (data: unknown) => Promise<unknown>;
  deleteLayout: (id: string) => Promise<boolean>;
  getWorkspaces: () => Promise<unknown[]>;
  getWorkspace: (id: string) => Promise<unknown>;
  saveWorkspace: (data: unknown) => Promise<unknown>;
  getSystemStats: () => Promise<unknown>;
  getDisplays: () => Promise<unknown[]>;
  getAutostart: () => Promise<boolean>;
  setAutostart: (enabled: boolean) => Promise<boolean>;
  launchApp: (appPath: string) => Promise<{ ok: boolean; error?: string }>;
  openExternal: (url: string) => Promise<void>;
  importAsset: (
    sourcePath: string,
    kind: 'icon' | 'cursor' | 'wallpaper'
  ) => Promise<{ ok: boolean; dest?: string; name?: string; error?: string }>;
  listAssets: (kind: 'icon' | 'cursor' | 'wallpaper') => Promise<unknown[]>;
  backupCursors: () => Promise<{ ok: boolean; error?: string; path?: string }>;
  applyCursorArrow: (filePath: string) => Promise<{ ok: boolean; error?: string }>;
  restoreCursors: () => Promise<{ ok: boolean; error?: string }>;
  getDiagnostics: () => Promise<unknown>;
  startLiveWallpaper: (data: {
    kind: 'video' | 'web' | 'gif' | 'image';
    source: string;
    muted?: boolean;
    monitorIndex?: number | null;
  }) => Promise<{ ok: boolean; error?: string; attachedWorkerW?: boolean }>;
  stopLiveWallpaper: () => Promise<{ ok: boolean }>;
  pauseLiveWallpaper: () => Promise<{ ok: boolean }>;
  resumeLiveWallpaper: () => Promise<{ ok: boolean }>;
  getLiveWallpaperStatus: () => Promise<unknown>;
  onEvent: (channel: string, callback: (...args: unknown[]) => void) => () => void;
};

const api: FormaAPI = {
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  getSettings: () => ipcRenderer.invoke('settings:getAll'),
  setSetting: (key, value) => ipcRenderer.invoke('settings:set', key, value),
  getProfiles: () => ipcRenderer.invoke('profiles:list'),
  createProfile: (data) => ipcRenderer.invoke('profiles:create', data),
  updateProfile: (id, data) => ipcRenderer.invoke('profiles:update', id, data),
  deleteProfile: (id) => ipcRenderer.invoke('profiles:delete', id),
  activateProfile: (id) => ipcRenderer.invoke('profiles:activate', id),
  getThemes: () => ipcRenderer.invoke('themes:list'),
  getWallpapers: () => ipcRenderer.invoke('wallpapers:list'),
  addWallpaper: (data) => ipcRenderer.invoke('wallpapers:add', data),
  deleteWallpaper: (id) => ipcRenderer.invoke('wallpapers:delete', id),
  favoriteWallpaper: (id, fav) => ipcRenderer.invoke('wallpapers:favorite', id, fav),
  applySystemWallpaper: (imagePath) => ipcRenderer.invoke('wallpapers:applySystem', imagePath),
  applyWallpaperOnMonitor: (monitorIndex, imagePath) =>
    ipcRenderer.invoke('wallpapers:applyOnMonitor', monitorIndex, imagePath),
  getLayouts: () => ipcRenderer.invoke('layouts:list'),
  saveLayout: (data) => ipcRenderer.invoke('layouts:save', data),
  deleteLayout: (id) => ipcRenderer.invoke('layouts:delete', id),
  getWorkspaces: () => ipcRenderer.invoke('workspaces:list'),
  getWorkspace: (id) => ipcRenderer.invoke('workspaces:get', id),
  saveWorkspace: (data) => ipcRenderer.invoke('workspaces:save', data),
  getSystemStats: () => ipcRenderer.invoke('system:getStats'),
  getDisplays: () => ipcRenderer.invoke('system:getDisplays'),
  getAutostart: () => ipcRenderer.invoke('system:getAutostart'),
  setAutostart: (enabled) => ipcRenderer.invoke('system:setAutostart', enabled),
  launchApp: (appPath) => ipcRenderer.invoke('system:launchApp', appPath),
  openExternal: (url) => ipcRenderer.invoke('system:openExternal', url),
  importAsset: (sourcePath, kind) => ipcRenderer.invoke('assets:import', sourcePath, kind),
  listAssets: (kind) => ipcRenderer.invoke('assets:list', kind),
  backupCursors: () => ipcRenderer.invoke('cursors:backup'),
  applyCursorArrow: (filePath) => ipcRenderer.invoke('cursors:applyArrow', filePath),
  restoreCursors: () => ipcRenderer.invoke('cursors:restore'),
  getDiagnostics: () => ipcRenderer.invoke('diagnostics:get'),
  startLiveWallpaper: (data) => ipcRenderer.invoke('liveWallpaper:start', data),
  stopLiveWallpaper: () => ipcRenderer.invoke('liveWallpaper:stop'),
  pauseLiveWallpaper: () => ipcRenderer.invoke('liveWallpaper:pause'),
  resumeLiveWallpaper: () => ipcRenderer.invoke('liveWallpaper:resume'),
  getLiveWallpaperStatus: () => ipcRenderer.invoke('liveWallpaper:status'),
  onEvent: (channel, callback) => {
    const listener = (_event: Electron.IpcRendererEvent, ...args: unknown[]) => callback(...args);
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
  },
};

contextBridge.exposeInMainWorld('forma', api);

declare global {
  interface Window {
    forma: FormaAPI;
  }
}
