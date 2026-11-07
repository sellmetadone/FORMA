# FORMA

**Windows Personal Workspace & Customization Platform**

| | |
|---|---|
| **Author** | sellmetadone |
| **Telegram** | [@sofia_white_death](https://t.me/sofia_white_death) |
| **License** | MIT |
| **Version** | 0.9.0 |

> *The desktop adapts to the user, not the other way around.*

## Quick start (Windows)

1. Unpack the project so `package.json` is in the folder root.
2. Double-click **`install-and-run.bat`**
   - checks Node/npm
   - fixes broken npm prefix/cache (e.g. `F:\`)
   - runs `npm install`
   - starts Electron + Vite

After install, use **`run.bat`** for subsequent launches.

```bat
npm install
npm run electron:dev
```

**Ctrl+K** — Command Palette.

**Ctrl+Shift+F** — Global Search.

## Status (honest)

| Area | State |
|------|--------|
| Foundation (Electron, SQLite, IPC, shell) | Working |
| Themes (11 built-in + custom export) | Working |
| Workspace Studio (drag, resize, undo, multi-ws) | Working (expanding) |
| Widgets | Working |
| Profiles | Working |
| Wallpapers + multi-monitor | Working on Windows |
| Live desktop video/web (WorkerW) | Working on Windows (fallback if attach fails) |
| Icons / cursors | Working |
| Command Palette / Global Search | Working |
| Backup Manager | Working (JSON package) |
| Overall readiness | **~86%** |

## Live desktop (Windows)

Video / web / gif wallpapers use an Electron host window parented to the desktop **WorkerW** layer when possible.

1. Open **Wallpapers** → Live engine
2. Add a file path or URL
3. **Apply to desktop**
4. **Stop live desktop** to remove

Static images still use the system DesktopWallpaper COM API.

## Scripts

| Command | Description |
|---------|-------------|
| `install-and-run.bat` | Install + run |
| `run.bat` | Run only |
| `npm run electron:dev` | Dev app |
| `npm test` | Vitest |
| `npm run typecheck` | TypeScript |

## License

MIT © sellmetadone
