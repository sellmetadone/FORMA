# FORMA 1.0.1 — Release notes

**Date:** 2026-11-14  
**Author:** sellmetadone

## Install

- Windows 10/11 x64
- Node.js 18+ only needed for **source** builds
- CI / `npm run electron:build` produces `FORMA-Setup-1.0.1.exe`

## What’s new since 1.0.0

1. **UI refresh** — clearer controls, focus states, wallpaper thumbnails + preview
2. **Desktop wallpaper crossfade** — temporary fullscreen overlay then OS commit
3. **GitHub Actions CI** — automatic tests + Windows installer artifacts
4. More reliable **START.bat** install/run path

## Known limits

- Live WorkerW attachment varies by Windows version / third-party shell tools
- CI installers are **unsigned**
- Some e2e tests are best-effort in headless CI

## Verify

```bat
git pull
START.bat
npm run typecheck
npm test
```
