# FORMA 1.0.0

**Tag:** `v1.0.0`  
**Date:** 2026-11-08  
**License:** MIT  

## Summary

First stable release of FORMA — Windows Personal Workspace & Customization Platform.

## Install (developers)

```bat
git clone https://github.com/sellmetadone/FORMA.git
cd FORMA
git checkout v1.0.0
install-and-run.bat
```

Production installer (build on Windows):

```bat
npm run electron:build
```

Artifact: `release/FORMA-Setup-1.0.0.exe`

## Features

- Themes (11) + i18n (13 locales, RTL)
- Workspace Studio + widgets
- Static & live (WorkerW) wallpapers
- Profiles, backup import/export
- Command palette, global search
- Tray, single-instance, autostart
- SQLite local storage, secure Electron defaults

## Known limitations

- Live WorkerW attach may fall back to a full-screen window on some systems
- NSIS build requires Windows + native modules (`better-sqlite3`)
- Manual QA on clean Win10/11 recommended (`docs/QA-1.0.md`)

## Create git tag (maintainers)

```bash
git tag -a v1.0.0 -m "FORMA 1.0.0"
git push origin v1.0.0
gh release create v1.0.0 --title "FORMA 1.0.0" --notes-file RELEASE_NOTES.md
```
