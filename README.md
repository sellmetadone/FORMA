# FORMA

**Windows Personal Workspace & Customization Platform**

| | |
|---|---|
| **Author** | sellmetadone |
| **Telegram** | [@sofia_white_death](https://t.me/sofia_white_death) |
| **License** | MIT |
| **Version** | 1.0.0-rc.1 |

> *The desktop adapts to the user, not the other way around.*

## Quick start (Windows)

1. Unpack the project so `package.json` is in the folder root.
2. Double-click **`install-and-run.bat`**
3. After install, use **`run.bat`**

```bat
npm install
npm run electron:dev
```

**Ctrl+K** — Command Palette · **Ctrl+Shift+F** — Global Search

## Status

**1.0.0-rc.1** (~90%). Final **1.0.0** after P0 + QA on Win10/11.

See [ROADMAP-1.0.md](./ROADMAP-1.0.md) and [docs/QA-1.0.md](./docs/QA-1.0.md).

## Live desktop (Windows)

Video/web/gif → WorkerW host when possible. Static images → COM API.

**Known limit:** if WorkerW attach fails, a fallback full-screen window is used; use **Stop live desktop** or tray **Stop live wallpaper**.

## License

MIT © sellmetadone
