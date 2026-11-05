# Security Policy

## Supported versions

| Version | Supported |
|---------|-----------|
| 0.6.x   | Yes |
| < 0.6   | Best effort |

## Design constraints

FORMA is a local-first desktop app. Core features do not require network access.

### Electron

- `contextIsolation: true`
- `nodeIntegration: false`
- `sandbox: true` on BrowserWindow
- Preload exposes a minimal typed API (`window.forma`)
- Renderer never receives Node or Electron internals

### IPC

- Inputs validated with Zod schemas
- Setting keys restricted to `[a-zA-Z0-9._-]+`

### System changes

- Wallpaper: path validation, image extensions only
- Autostart: Electron `setLoginItemSettings` only
- App launcher: basename allowlist or absolute paths
- External URLs: http(s) only
- Cursor apply: backup before change, restore available

## Reporting

Telegram: **@sofia_white_death** · GitHub: **sellmetadone**
