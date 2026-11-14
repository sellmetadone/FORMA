# FORMA

**Windows Personal Workspace & Customization Platform**

| | |
|---|---|
| **Author** | sellmetadone |
| **Telegram** | [@sofia_white_death](https://t.me/sofia_white_death) |
| **License** | [MIT](./LICENSE) |
| **Version** | 1.0.1 |
| **Repo** | [github.com/sellmetadone/FORMA](https://github.com/sellmetadone/FORMA) |

> *The desktop adapts to the user, not the other way around.*

## What is FORMA

FORMA is an open-source desktop app for **Windows 10/11** that lets you build a personal workspace: themes, wallpapers (static + live), widgets, layouts, profiles, and system integrations — all in one place.

## Quick start

### One-click (recommended)

1. Clone or download the repo so `package.json` is at the folder root.
2. Double-click **`START.bat`** (or **`install-and-run.bat`** the first time).

The batch files check Node/npm, repair broken npm prefix/cache (e.g. `EPERM` on `F:\\`), install deps, rebuild native modules, and start Electron + Vite.

### Commands

```bat
npm install
npm run rebuild:native
npm run electron:dev
```

| Shortcut | Action |
|----------|--------|
| **Ctrl+K** | Command Palette |
| **Ctrl+Shift+F** | Global Search |

### Production installer (Windows)

```bat
npm run electron:build
```

Installer appears in `release/FORMA-Setup-1.0.1.exe`.

CI also builds the NSIS installer on every push to `main` — download from [Actions artifacts](https://github.com/sellmetadone/FORMA/actions). See [docs/CI.md](./docs/CI.md).

## Status (honest)

| Area | State |
|------|--------|
| Foundation (Electron, SQLite, IPC, shell) | Working |
| Themes (11 built-in) + Appearance | Working |
| i18n (13 locales, RTL) | Working |
| Workspace Studio | Working |
| Widgets (8 types) | Working |
| Profiles | Working |
| Static wallpapers + multi-monitor | Working (Windows) |
| Desktop wallpaper **crossfade** | Working (overlay → SPI/COM) |
| Live desktop (WorkerW video/web/gif) | Working (best-effort on Win10/11) |
| Icons / cursors | Working |
| Command Palette / Global Search | Working |
| Backup import/export | Working |
| CI (typecheck, tests, Windows installer) | Configured |
| Overall readiness | **~92% (1.0.1)** |

## Scripts

| Command | Description |
|---------|-------------|
| `START.bat` | Install if needed + run |
| `install-and-run.bat` | Full install + run |
| `run.bat` | Run only (deps required) |
| `npm run electron:dev` | Dev (Vite + Electron) |
| `npm run build` | Production renderer + main |
| `npm run electron:build` | NSIS installer |
| `npm run typecheck` | TypeScript |
| `npm test` | Vitest |
| `npm run ci` | typecheck + test + build |

## Architecture

- **Electron** main + preload (`contextIsolation`, no `nodeIntegration`)
- **React + TypeScript + Vite** renderer
- **SQLite** (`better-sqlite3`) local store
- **Zod**-validated IPC
- Modular pages: Workspace, Themes, Wallpapers, Widgets, Profiles, Settings…

## Docs

- [CHANGELOG](./CHANGELOG.md)
- [CI](./docs/CI.md)
- [SECURITY](./SECURITY.md)
- [CONTRIBUTING](./CONTRIBUTING.md)
- [ROADMAP](./ROADMAP-1.0.md)
- [UI refresh](./UI-REFRESH.md)

## License

MIT © sellmetadone
