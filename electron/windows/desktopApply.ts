/**
 * Unified "set on real Windows desktop" apply for static images and live media.
 */
import path from 'path';
import { applyWallpaperWithCrossfade } from './wallpaperCrossfade';
import { startLiveWallpaper, stopLiveWallpaper } from './liveDesktop';

export type DesktopMediaKind = 'image' | 'video' | 'gif' | 'web';

const VIDEO_EXT = new Set(['mp4', 'webm', 'mkv', 'mov', 'avi', 'm4v']);
const GIF_EXT = new Set(['gif']);
const IMAGE_EXT = new Set(['jpg', 'jpeg', 'png', 'webp', 'bmp', 'jfif', 'tif', 'tiff']);

export function detectDesktopMediaKind(source: string): DesktopMediaKind {
  const s = String(source || '').trim();
  if (!s) return 'image';
  if (/^https?:\/\//i.test(s)) {
    const ext = s.split('?')[0].split('#')[0].split('.').pop()?.toLowerCase() || '';
    if (VIDEO_EXT.has(ext)) return 'video';
    if (GIF_EXT.has(ext)) return 'gif';
    if (IMAGE_EXT.has(ext)) return 'image';
    return 'web';
  }
  const ext = path.extname(s).replace(/^\./, '').toLowerCase();
  if (VIDEO_EXT.has(ext)) return 'video';
  if (GIF_EXT.has(ext)) return 'gif';
  return 'image';
}

export type ApplyDesktopResult = {
  ok: boolean;
  error?: string;
  kind?: DesktopMediaKind;
  mode?: 'static' | 'live';
  crossfaded?: boolean;
  attachedWorkerW?: boolean;
  method?: string;
  monitors?: number;
};

/**
 * Apply media to the actual Windows desktop:
 * - images → SystemParametersInfo / per-monitor COM (+ optional crossfade overlay)
 * - video / gif / web → WorkerW live host window
 */
export async function applyToDesktop(opts: {
  source: string;
  previousPath?: string | null;
  monitorIndex?: number | null;
  muted?: boolean;
  instant?: boolean;
}): Promise<ApplyDesktopResult> {
  const source = String(opts.source || '').trim();
  if (!source) return { ok: false, error: 'Empty wallpaper path' };
  if (process.platform !== 'win32') {
    return { ok: false, error: 'Desktop wallpaper apply is only supported on Windows' };
  }

  const kind = detectDesktopMediaKind(source);

  if (kind === 'image') {
    try {
      await stopLiveWallpaper();
    } catch {
      /* ignore */
    }
    const res = await applyWallpaperWithCrossfade({
      imagePath: source,
      previousPath: opts.previousPath ?? null,
      monitorIndex: opts.monitorIndex ?? null,
      durationMs: 700,
      instant: opts.instant,
    });
    return {
      ok: res.ok,
      error: res.error,
      kind,
      mode: 'static',
      crossfaded: res.crossfaded,
    };
  }

  const live = await startLiveWallpaper({
    kind,
    source,
    muted: opts.muted !== false,
    monitorIndex: opts.monitorIndex === undefined ? -1 : opts.monitorIndex,
  });
  return {
    ok: live.ok,
    error: live.error,
    kind,
    mode: 'live',
    attachedWorkerW: live.attachedWorkerW,
    method: live.method,
    monitors: live.monitors,
  };
}
