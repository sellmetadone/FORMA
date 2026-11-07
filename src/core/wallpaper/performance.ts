import type { PerformancePolicy } from './types';
import { DEFAULT_PERFORMANCE } from './types';

const KEY = 'forma.wallpaper.performance';

export function loadPerformancePolicy(): PerformancePolicy {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULT_PERFORMANCE, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return { ...DEFAULT_PERFORMANCE };
}

export function savePerformancePolicy(p: PerformancePolicy) {
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function estimateLoad(opts: {
  videoCount: number;
  webCount: number;
  widgetCount: number;
  maxFps: number;
}): number {
  const v = opts.videoCount * 25 + opts.webCount * 20 + opts.widgetCount * 3;
  const fpsFactor = opts.maxFps > 30 ? 1.2 : 1;
  return Math.min(100, Math.round(v * fpsFactor));
}
