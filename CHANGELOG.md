# Changelog

## [1.0.2] — 2026-11-19 — Snapshot UX · Icon · Desktop apply

### Snapshot
- Full snapshot export (theme, locale, settings, workspace, widgets, wallpapers, profiles)
- Restore preview with section checklist
- Automatic safety backup JSON before restore

### Branding
- Official FORMA geometric icon (window, tray, NSIS, favicon)

### Desktop
- Unified image/video apply to real Windows desktop
- Admin elevation for WorkerW reliability

### Release
- GitHub Actions tag `v*` → Release with NSIS installer

## [1.0.1] — 2026-11-14 — UI polish · desktop crossfade · CI

### UI
- Restrained global typography, form focus, button press/hover states
- Wallpaper thumbnails + animated in-app preview
- Respects `prefers-reduced-motion`

### Desktop wallpaper
- Crossfade overlay before SystemParametersInfo / DesktopWallpaper COM

### CI / release
- GitHub Actions: typecheck, unit tests, Vite build, Windows NSIS artifact

## [1.0.0] — 2026-11-08 — First stable release

- Full application source tree synchronized to GitHub
- Live desktop WorkerW host + static COM wallpapers
- Workspace Studio, widgets, themes (11), i18n (13 locales)
- Profiles, backup import/export, command palette, global search
- Tray, single-instance, autostart, SQLite persistence
