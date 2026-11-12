/** FORMA Wallpaper Engine types — original MIT code. */

export type WallpaperKind = 'image' | 'video' | 'gif' | 'web';

export type WallpaperEntry = {
  id: string;
  name: string;
  kind: WallpaperKind;
  source: string;
  category?: string;
  favorite?: boolean;
  muted?: boolean;
  monitorIndex?: number | null;
  createdAt: string;
};

export type PerformancePolicy = {
  maxFps: number;
  pauseOnBlur: boolean;
  pauseOnBattery: boolean;
  pauseWhenHidden: boolean;
  batterySaver: boolean;
};

export type SmartPauseState = {
  paused: boolean;
  reason: 'none' | 'blur' | 'hidden' | 'battery' | 'manual' | 'fullscreen';
};

export const DEFAULT_PERFORMANCE: PerformancePolicy = {
  maxFps: 30,
  pauseOnBlur: true,
  pauseOnBattery: true,
  pauseWhenHidden: true,
  batterySaver: true,
};
