/**
 * Live desktop wallpaper host (Windows).
 * Frameless BrowserWindow + WorkerW parenting. FORMA MIT (not Lively GPL).
 */
import { BrowserWindow, screen } from 'electron';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { attachToWorkerW } from './workerW';

export type LiveKind = 'video' | 'web' | 'gif' | 'image';

export type LiveWallpaperOptions = {
  kind: LiveKind;
  source: string;
  muted?: boolean;
  monitorIndex?: number | null;
};

type LiveState = {
  window: BrowserWindow | null;
  kind: LiveKind | null;
  source: string | null;
  paused: boolean;
  attachedWorkerW: boolean;
};

const state: LiveState = {
  window: null,
  kind: null,
  source: null,
  paused: false,
  attachedWorkerW: false,
};

function isWindows() {
  return process.platform === 'win32';
}

function hwndToNumber(buf: Buffer): string {
  if (buf.length >= 8) return buf.readBigUInt64LE(0).toString();
  return buf.readUInt32LE(0).toString();
}

function buildPlayerHtml(opts: LiveWallpaperOptions): string {
  const src = opts.source.replace(/\\/g, '/');
  const muted = opts.muted !== false;
  if (opts.kind === 'web') {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>html,body{margin:0;height:100%;background:#000;overflow:hidden}iframe{border:0;width:100%;height:100%}</style></head><body><iframe src=${JSON.stringify(opts.source)} sandbox="allow-scripts allow-same-origin allow-forms"></iframe><script>window.formaLive={pause(){},resume(){}};</script></body></html>`;
  }
  if (opts.kind === 'video' || opts.kind === 'gif') {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>html,body{margin:0;height:100%;background:#000;overflow:hidden}video{width:100%;height:100%;object-fit:cover}</style></head><body><video id="v" src=${JSON.stringify(src)} autoplay loop playsinline ${muted ? 'muted' : ''}></video><script>const v=document.getElementById('v');window.formaLive={pause(){try{v.pause()}catch(e){}},resume(){try{v.play()}catch(e){}},setMuted(m){v.muted=!!m}};</script></body></html>`;
  }
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>html,body{margin:0;height:100%;background:#000}img{width:100%;height:100%;object-fit:cover}</style></head><body><img src=${JSON.stringify(src)} alt=""/></body></html>`;
}

function resolveMonitorBounds(monitorIndex?: number | null) {
  const displays = screen.getAllDisplays();
  const primary = screen.getPrimaryDisplay();
  if (monitorIndex == null || monitorIndex < 0 || monitorIndex >= displays.length) {
    return primary.bounds;
  }
  return displays[monitorIndex].bounds;
}

export function getLiveWallpaperStatus() {
  return {
    active: !!state.window && !state.window.isDestroyed(),
    kind: state.kind,
    source: state.source,
    paused: state.paused,
    attachedWorkerW: state.attachedWorkerW,
    platform: process.platform,
  };
}

export async function stopLiveWallpaper(): Promise<{ ok: boolean }> {
  if (state.window && !state.window.isDestroyed()) {
    try {
      state.window.close();
    } catch {
      /* ignore */
    }
  }
  state.window = null;
  state.kind = null;
  state.source = null;
  state.paused = false;
  state.attachedWorkerW = false;
  return { ok: true };
}

export async function pauseLiveWallpaper(): Promise<{ ok: boolean }> {
  if (!state.window || state.window.isDestroyed()) return { ok: false };
  state.paused = true;
  try {
    await state.window.webContents.executeJavaScript(
      'window.formaLive&&window.formaLive.pause&&window.formaLive.pause()'
    );
  } catch {
    /* ignore */
  }
  return { ok: true };
}

export async function resumeLiveWallpaper(): Promise<{ ok: boolean }> {
  if (!state.window || state.window.isDestroyed()) return { ok: false };
  state.paused = false;
  try {
    await state.window.webContents.executeJavaScript(
      'window.formaLive&&window.formaLive.resume&&window.formaLive.resume()'
    );
  } catch {
    /* ignore */
  }
  return { ok: true };
}

export async function startLiveWallpaper(
  opts: LiveWallpaperOptions
): Promise<{ ok: boolean; error?: string; attachedWorkerW?: boolean }> {
  if (!isWindows()) {
    return { ok: false, error: 'Live desktop wallpaper is only supported on Windows' };
  }

  const kind = opts.kind;
  const source = String(opts.source || '').trim();
  if (!source) return { ok: false, error: 'Empty source' };
  if (kind === 'web' && !/^https?:\/\//i.test(source)) {
    return { ok: false, error: 'Web wallpaper source must be http(s) URL' };
  }
  if (kind === 'video' || kind === 'gif' || kind === 'image') {
    const asPath = source.replace(/^file:\/\//i, '');
    if (
      !/^https?:\/\//i.test(source) &&
      !fs.existsSync(asPath) &&
      !fs.existsSync(source) &&
      !/\.(mp4|webm|mkv|mov|gif|png|jpe?g|webp|bmp)$/i.test(source) &&
      !source.includes('://')
    ) {
      return { ok: false, error: 'File not found: ' + source };
    }
  }

  await stopLiveWallpaper();

  const bounds = resolveMonitorBounds(opts.monitorIndex);
  const html = buildPlayerHtml({ ...opts, source });
  const win = new BrowserWindow({
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    frame: false,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    show: false,
    focusable: false,
    hasShadow: false,
    backgroundColor: '#000000',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  win.setAlwaysOnTop(false);
  win.setMenuBarVisibility(false);

  const tmpHtml = path.join(os.tmpdir(), `forma-live-${Date.now()}.html`);
  fs.writeFileSync(tmpHtml, html, 'utf8');

  try {
    await win.loadFile(tmpHtml);
  } catch (err) {
    win.close();
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }

  win.once('closed', () => {
    if (state.window === win) {
      state.window = null;
      state.kind = null;
      state.source = null;
    }
    try {
      fs.unlinkSync(tmpHtml);
    } catch {
      /* ignore */
    }
  });

  win.showInactive();

  let attached = false;
  try {
    const hwnd = hwndToNumber(win.getNativeWindowHandle());
    attached = await attachToWorkerW(hwnd);
  } catch (err) {
    console.warn('[FORMA] WorkerW attach failed:', err);
  }

  if (!attached) {
    console.warn('[FORMA] WorkerW not attached — using fallback desktop window');
  }

  state.window = win;
  state.kind = kind;
  state.source = source;
  state.paused = false;
  state.attachedWorkerW = attached;

  return { ok: true, attachedWorkerW: attached };
}
