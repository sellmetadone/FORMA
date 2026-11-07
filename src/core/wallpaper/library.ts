import type { WallpaperEntry, WallpaperKind } from './types';

const KEY = 'forma.wallpaperLibrary';

export function loadLibrary(): WallpaperEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as WallpaperEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveLibrary(items: WallpaperEntry[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function addToLibrary(
  partial: Omit<WallpaperEntry, 'id' | 'createdAt'> & { id?: string }
): WallpaperEntry {
  const entry: WallpaperEntry = {
    ...partial,
    id: partial.id || `wp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
  };
  const list = loadLibrary();
  list.unshift(entry);
  saveLibrary(list);
  return entry;
}

export function removeFromLibrary(id: string) {
  saveLibrary(loadLibrary().filter((e) => e.id !== id));
}

export function toggleFavorite(id: string) {
  const list = loadLibrary().map((e) =>
    e.id === id ? { ...e, favorite: !e.favorite } : e
  );
  saveLibrary(list);
  return list;
}

export function filterLibrary(
  items: WallpaperEntry[],
  opts: { q?: string; kind?: WallpaperKind | 'all'; favorites?: boolean }
) {
  let out = items;
  if (opts.kind && opts.kind !== 'all') out = out.filter((e) => e.kind === opts.kind);
  if (opts.favorites) out = out.filter((e) => e.favorite);
  if (opts.q?.trim()) {
    const q = opts.q.trim().toLowerCase();
    out = out.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.source.toLowerCase().includes(q) ||
        (e.category || '').toLowerCase().includes(q)
    );
  }
  return out;
}

export function detectKind(pathOrUrl: string): WallpaperKind {
  const s = pathOrUrl.toLowerCase();
  if (s.startsWith('http://') || s.startsWith('https://')) {
    if (/\.(mp4|webm|mkv|mov)(\?|$)/.test(s)) return 'video';
    if (/\.gif(\?|$)/.test(s)) return 'gif';
    if (/\.(png|jpe?g|webp|bmp)(\?|$)/.test(s)) return 'image';
    return 'web';
  }
  if (/\.(mp4|webm|mkv|mov)$/.test(s)) return 'video';
  if (/\.gif$/.test(s)) return 'gif';
  return 'image';
}
