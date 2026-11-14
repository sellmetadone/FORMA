/**
 * Desktop wallpaper crossfade overlay (Windows).
 * Shows a fullscreen frameless layer, fades old→new, then commits via SystemParametersInfo.
 * FORMA MIT — avoids black flash between static wallpapers.
 */
import { BrowserWindow, screen } from 'electron';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { setWallpaper, setWallpaperOnMonitor } from './system';

let busy = false;
const activeWindows: BrowserWindow[] = [];

function toFileSrc(p: string): string {
  if (/^https?:\/\//i.test(p)) return p;
  const abs = p.replace(/^file:\/\//i, '');
  return 'file:///' + abs.replace(/\\/g, '/');
}

function buildHtml(fromSrc: string | null, toSrc: string, durationMs: number): string {
  const from = fromSrc ? toFileSrc(fromSrc) : '';
  const to = toFileSrc(toSrc);
  const dur = Math.max(200, Math.min(3000, durationMs));
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
html,body{margin:0;height:100%;overflow:hidden;background:#000}
.layer{position:absolute;inset:0;background-size:cover;background-position:center;background-repeat:no-repeat}
#from{opacity:1;z-index:1;background-image:${from ? `url(${JSON.stringify(from)})` : 'none'};background-color:#111}
#to{opacity:0;z-index:2;background-image:url(${JSON.stringify(to)})}
</style></head><body>
<div id="from" class="layer"></div>
<div id="to" class="layer"></div>
<script>
const dur=${dur};
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const to=document.getElementById('to');
const from=document.getElementById('from');
function done(){ try{ window.close(); }catch(e){} }
if(reduce){ to.style.opacity='1'; setTimeout(done, 40); }
else {
  to.style.transition = 'opacity '+dur+'ms cubic-bezier(.2,.75,.25,1)';
  from.style.transition = 'opacity '+dur+'ms cubic-bezier(.2,.75,.25,1)';
  requestAnimationFrame(()=>{
    requestAnimationFrame(()=>{
      to.style.opacity='1';
      from.style.opacity='0';
      setTimeout(done, dur+80);
    });
  });
}
</script></body></html>`;
}

async function spawnOverlay(
  bounds: Electron.Rectangle,
  fromSrc: string | null,
  toSrc: string,
  durationMs: number
): Promise<BrowserWindow> {
  const html = buildHtml(fromSrc, toSrc, durationMs);
  const tmp = path.join(os.tmpdir(), `forma-cf-${Date.now()}-${Math.random().toString(36).slice(2)}.html`);
  fs.writeFileSync(tmp, html, 'utf8');

  const win = new BrowserWindow({
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    frame: false,
    transparent: false,
    resizable: false,
    movable: false,
    skipTaskbar: true,
    focusable: false,
    show: false,
    hasShadow: false,
    backgroundColor: '#000000',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  win.setMenuBarVisibility(false);
  activeWindows.push(win);

  win.on('closed', () => {
    const i = activeWindows.indexOf(win);
    if (i >= 0) activeWindows.splice(i, 1);
    try { fs.unlinkSync(tmp); } catch { /* ignore */ }
  });

  await win.loadFile(tmp);
  win.showInactive();
  return win;
}

export type CrossfadeOptions = {
  imagePath: string;
  previousPath?: string | null;
  monitorIndex?: number | null;
  durationMs?: number;
  instant?: boolean;
};

export async function applyWallpaperWithCrossfade(
  opts: CrossfadeOptions
): Promise<{ ok: boolean; error?: string; crossfaded?: boolean }> {
  if (process.platform !== 'win32') {
    return { ok: false, error: 'Wallpaper apply is only supported on Windows' };
  }
  if (busy) {
    await new Promise((r) => setTimeout(r, 100));
  }
  busy = true;
  const durationMs = opts.durationMs ?? 700;
  const imagePath = String(opts.imagePath || '');
  const previousPath = opts.previousPath || null;

  try {
    if (opts.instant) {
      if (opts.monitorIndex != null && opts.monitorIndex >= 0) {
        return { ...(await setWallpaperOnMonitor(opts.monitorIndex, imagePath)), crossfaded: false };
      }
      return { ...(await setWallpaper(imagePath)), crossfaded: false };
    }

    const displays = screen.getAllDisplays();
    const targets =
      opts.monitorIndex != null && opts.monitorIndex >= 0 && opts.monitorIndex < displays.length
        ? [displays[opts.monitorIndex]]
        : displays;

    const wins: BrowserWindow[] = [];
    for (const d of targets) {
      try {
        wins.push(await spawnOverlay(d.bounds, previousPath, imagePath, durationMs));
      } catch (err) {
        console.warn('[FORMA] crossfade overlay failed', err);
      }
    }

    await new Promise((r) => setTimeout(r, Math.min(220, durationMs / 2)));

    let commit: { ok: boolean; error?: string };
    if (opts.monitorIndex != null && opts.monitorIndex >= 0) {
      commit = await setWallpaperOnMonitor(opts.monitorIndex, imagePath);
    } else {
      commit = await setWallpaper(imagePath);
    }

    await new Promise((r) => setTimeout(r, durationMs + 120));

    for (const w of wins) {
      try {
        if (!w.isDestroyed()) w.close();
      } catch {
        /* ignore */
      }
    }

    return { ...commit, crossfaded: wins.length > 0 };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  } finally {
    busy = false;
  }
}
