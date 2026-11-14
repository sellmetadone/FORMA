# Changelog

## [1.0.1] — 2026-11-14 — UI polish · desktop crossfade · CI

### UI
- Restrained global typography, form focus, button press/hover states
- Wallpaper thumbnails + animated in-app preview
- Respects `prefers-reduced-motion`

### Desktop wallpaper
- **Crossfade overlay** before SystemParametersInfo / DesktopWallpaper COM
  (`electron/windows/wallpaperCrossfade.ts`) — reduces black flash on apply
- Apply IPC accepts optional previous path for smooth transitions

### CI / release
- GitHub Actions: typecheck, unit tests, Vite build, **Windows NSIS** artifact
- Tag `v*` → GitHub Release with installer
- docs/CI.md

### Launch
- Robust `START.bat` / `install-and-run.bat` (npm prefix repair, rebuild native)

### Version
- Bump to **1.0.1**

## [1.0.0] — 2026-11-08 — First stable release

### Highlights
- Full application source tree synchronized to GitHub (P0-1)
- Live desktop WorkerW host (video/web/gif) + static COM wallpapers
- Workspace Studio, widgets, themes (11), i18n (13 locales)
- Profiles, backup import/export, command palette, global search
- Tray, single-instance, autostart, SQLite persistence
- Security: contextIsolation, no nodeIntegration, Zod IPC

### Docs
- ROADMAP-1.0.md, docs/QA-1.0.md
- README known limits for WorkerW

### Notes
- Production NSIS should be built on Windows: `npm run electron:build`
- Complete manual QA on Win10/11 using docs/QA-1.0.md


## [1.0.0-rc.1] — 2026-11-07 — Release candidate

### Hardening toward 1.0.0
- ROADMAP-1.0.md and docs/QA-1.0.md (P0/P1 + manual checklist)
- Tray: Stop live wallpaper; quit stops live host before exit
- Backup package unit tests (validate/build)
- Version bumped to 1.0.0-rc.1

### Still required for final 1.0.0
- Full GitHub tree sync
- Production NSIS verified on clean Win10/11
- Manual QA checklist signed off


## [0.7.0] — 2026-11-07 — FORMA 2.0 expansion (Stage I–II)

### Workspace Studio
- Duplicate element (Ctrl+D), send to back / bring to front
- Align left / top
- Multi-workspace create & switch
- Rename workspace
- Keyboard: Ctrl+Z/Y, Ctrl+S, Delete
- Activity log on save

### Theme Studio
- Export / import theme JSON
- Save custom overrides locally

### Profiles
- Duplicate profile

### Platform
- Command Palette (Ctrl+K)
- Activity log in Settings
- install-and-run.bat / run.bat / download-setup.bat

## [0.6.1] — System tray, single-instance, CI/E2E

## [0.6.0] — Icons, multi-monitor wallpaper

## [0.5.0] — Zod IPC, migrations, tests
