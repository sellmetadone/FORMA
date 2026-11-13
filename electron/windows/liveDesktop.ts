/**
 * Live desktop wallpaper host (Windows).
 * Multi-monitor BrowserWindows + WorkerW + slideshow + performance.
 * FORMA MIT (not Lively GPL).
 */
import { BrowserWindow, screen } from 'electron';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { attachToWorkerWDetailed } from './workerW';

export type LiveKind = 'video' | 'web' | 'gif' | 'image';

export type LiveWallpaperOptions = {
  kind: LiveKind;
  source: string;
  muted?: boolean;
  monitorIndex?: number | null;
};

export type SlideshowItem = { kind: LiveKind; source: string; durationMs?: number };

type MonitorLive = {
  window: BrowserWindow;
  monitorIndex: number;
  kind: LiveKind;
  source: string;
  attachedWorkerW: boolean;
  method?: string;
};

type LiveState = {
  monitors: Map<number, MonitorLive>;
  paused: boolean;
  slideshow: {
    items: SlideshowItem[];
    index: number;
    timer: ReturnType<typeof setInterval> | null;
    monitorIndex: number | null;
    defaultDurationMs: number;
  } | null;
  performance: { maxFps: number; lowPower: boolean };
};

const state: LiveState = {
  monitors: new Map(),
  paused: false,
  slideshow: null,
  performance: { maxFps: 30, lowPower: false },
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
    return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>html,body{margin:0;height:100%;background:#000;overflow:hidden}iframe{border:0;width:100%;height:100%}</style></head><body><iframe src=${JSON.stringify(opts.source)} sandbox="allow-scripts allow-same-origin allow-forms"></iframe><script>window.formaLive={pause(){},resume(){},setMuted(){}};</script></body></html>`;
  }
  if (opts.kind === 'video' || opts.kind === 'gif') {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>html,body{margin:0;height:100%;background:#000;overflow:hidden}video{width:100%;height:100%;object-fit:cover}</style></head><body><video id="v" src=${JSON.stringify(src)} autoplay loop playsinline ${muted ? 'muted' : ''}></video><script>
const v=document.getElementById('v');
window.formaLive={pause(){try{v.pause()}catch(e){}},resume(){try{v.play()}catch(e){}},setMuted(m){v.muted=!!m}};
</script></body></html>`;
  }
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>html,body{margin:0;height:100%;background:#000}img{width:100%;height:100%;object-fit:cover}</style></head><body><img src=${JSON.stringify(src)} alt=""/></body></html>`;
}

function resolveMonitorBounds(monitorIndex?: number | null) {
  const displays = screen.getAllDisplays();
  const primary = screen.getPrimaryDisplay();
  if (monitorIndex == null || monitorIndex < 0 || monitorIndex >= displays.length) {
    const index = Math.max(0, displays.findIndex((d) => d.id === primary.id));
    return { bounds: primary.bounds, index };
  }
  return { bounds: displays[monitorIndex].bounds, index: monitorIndex };
}

async function spawnOnMonitor(
  opts: LiveWallpaperOptions,
  monitorIndex: number
): Promise<{ ok: boolean; error?: string; attachedWorkerW?: boolean; method?: string }> {
  const { bounds } = resolveMonitorBounds(monitorIndex);
  const html = buildPlayerHtml(opts);
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
  win.setMenuBarVisibility(false);
  const tmpHtml = path.join(os.tmpdir(), `forma-live-${monitorIndex}-${Date.now()}.html`);
  fs.writeFileSync(tmpHtml, html, 'utf8');
  try {
    await win.loadFile(tmpHtml);
  } catch (err) {
    win.close();
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
  win.once('closed', () => {
    const cur = state.monitors.get(monitorIndex);
    if (cur?.window === win) state.monitors.delete(monitorIndex);
    try { fs.unlinkSync(tmpHtml); } catch { /* ignore */ }
  });
  win.showInactive();
  let attached = false;
  let method: string | undefined;
  try {
    const hwnd = hwndToNumber(win.getNativeWindowHandle());
    const res = await attachToWorkerWDetailed(hwnd);
    attached = res.ok;
    method = res.method;
  } catch {
    attached = false;
  }
  state.monitors.set(monitorIndex, {
    window: win,
    monitorIndex,
    kind: opts.kind,
    source: opts.source,
    attachedWorkerW: attached,
    method,
  });
  return { ok: true, attachedWorkerW: attached, method };
}

function stopSlideshowTimer() {
  if (state.slideshow?.timer) {
    clearInterval(state.slideshow.timer);
    state.slideshow.timer = null;
  }
  state.slideshow = null;
}

export async function stopLiveWallpaper(): Promise<{ ok: boolean }> {
  stopSlideshowTimer();
  for (const [, m] of state.monitors) {
    try { if (!m.window.isDestroyed()) m.window.close(); } catch { /* ignore */ }
  }
  state.monitors.clear();
  state.paused = false;
  return { ok: true };
}

export async function pauseLiveWallpaper(): Promise<{ ok: boolean }> {
  state.paused = true;
  for (const [, m] of state.monitors) {
    if (m.window.isDestroyed()) continue;
    try {
      await m.window.webContents.executeJavaScript(
        'window.formaLive&&window.formaLive.pause&&window.formaLive.pause()'
      );
    } catch { /* ignore */ }
  }
  return { ok: true };
}

export async function resumeLiveWallpaper(): Promise<{ ok: boolean }> {
  state.paused = false;
  for (const [, m] of state.monitors) {
    if (m.window.isDestroyed()) continue;
    try {
      await m.window.webContents.executeJavaScript(
        'window.formaLive&&window.formaLive.resume&&window.formaLive.resume()'
      );
    } catch { /* ignore */ }
  }
  return { ok: true };
}

export async function startLiveWallpaper(
  opts: LiveWallpaperOptions
): Promise<{ ok: boolean; error?: string; attachedWorkerW?: boolean; method?: string; monitors?: number }> {
  if (!isWindows()) {
    return { ok: false, error: 'Live desktop wallpaper is only supported on Windows' };
  }
  const kind = opts.kind;
  const source = String(opts.source || '').trim();
  if (!source) return { ok: false, error: 'Empty source' };
  if (kind === 'web' && !/^https?:\/\//i.test(source)) {
    return { ok: false, error: 'Web wallpaper source must be http(s) URL' };
  }
  for (const [, m] of state.monitors) {
    try { if (!m.window.isDestroyed()) m.window.close(); } catch { /* ignore */ }
  }
  state.monitors.clear();
  const displays = screen.getAllDisplays();
  const targets: number[] =
    opts.monitorIndex === -1
      ? displays.map((_, i) => i)
      : [resolveMonitorBounds(opts.monitorIndex).index];
  let anyAttached = false;
  let lastMethod: string | undefined;
  for (const idx of targets) {
    const res = await spawnOnMonitor({ ...opts, monitorIndex: idx }, idx);
    if (!res.ok) return { ok: false, error: res.error };
    if (res.attachedWorkerW) anyAttached = true;
    lastMethod = res.method || lastMethod;
  }
  return { ok: true, attachedWorkerW: anyAttached, method: lastMethod, monitors: targets.length };
}

export async function startSlideshow(
  items: SlideshowItem[],
  monitorIndex: number | null = null,
  defaultDurationMs = 15000
): Promise<{ ok: boolean; error?: string }> {
  if (!items.length) return { ok: false, error: 'Empty slideshow' };
  stopSlideshowTimer();
  const play = async (i: number) => {
    const item = items[i % items.length];
    await startLiveWallpaper({
      kind: item.kind,
      source: item.source,
      muted: true,
      monitorIndex: monitorIndex === null ? undefined : monitorIndex,
    });
  };
  await play(0);
  state.slideshow = {
    items,
    index: 0,
    monitorIndex,
    defaultDurationMs,
    timer: setInterval(() => {
      if (!state.slideshow || state.paused) return;
      state.slideshow.index = (state.slideshow.index + 1) % state.slideshow.items.length;
      void play(state.slideshow.index);
    }, defaultDurationMs),
  };
  return { ok: true };
}

export function stopSlideshow(): { ok: boolean } {
  stopSlideshowTimer();
  return { ok: true };
}

export function setLivePerformance(opts: { maxFps?: number; lowPower?: boolean }) {
  if (typeof opts.maxFps === 'number') {
    state.performance.maxFps = Math.max(5, Math.min(60, Math.round(opts.maxFps)));
  }
  if (typeof opts.lowPower === 'boolean') {
    state.performance.lowPower = opts.lowPower;
    if (opts.lowPower) state.performance.maxFps = Math.min(state.performance.maxFps, 15);
  }
  return { ...state.performance };
}

export function getLiveWallpaperStatus() {
  const monitors = [...state.monitors.values()].map((m) => ({
    monitorIndex: m.monitorIndex,
    kind: m.kind,
    source: m.source,
    attachedWorkerW: m.attachedWorkerW,
    method: m.method,
  }));
  return {
    active: monitors.length > 0,
    paused: state.paused,
    monitors,
    slideshow: state.slideshow
      ? { index: state.slideshow.index, count: state.slideshow.items.length }
      : null,
    performance: { ...state.performance },
  };
}
