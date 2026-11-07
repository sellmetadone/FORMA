# FORMA

**Windows Personal Workspace & Customization Platform**

| | |
|---|---|
| **Author** | sellmetadone |
| **Telegram** | [@sofia_white_death](https://t.me/sofia_white_death) |
| **License** | MIT |
| **Version** | 0.6.1 |

## Quick start (Windows)

### Option A — double-click

1. Download ZIP from GitHub (**Code → Download ZIP**) or clone the repo.
2. Unpack so that `package.json` is in the folder.
3. Double-click **`install-and-run.bat`**

The bat will:
- check Node.js / npm
- fix broken npm `prefix`/`cache` (e.g. pointing at `F:\`)
- run `npm install`
- start `npm run electron:dev`

After the first install, you can use **`run.bat`** to start only.

### Option B — terminal

```bat
cd path\to\FORMA
npm install
npm run electron:dev
```

If `npm install` fails with `EPERM mkdir 'F:\'`:

```bat
npm config delete prefix
npm config set cache "%LOCALAPPDATA%\npm-cache"
npm config set prefix "%APPDATA%\npm"
npm install
```

## Scripts

| Command | Description |
|---------|-------------|
| `install-and-run.bat` | Install + run (Windows) |
| `run.bat` | Run after install |
| `npm run electron:dev` | Electron + Vite |
| `npm run dev` | Renderer only |
| `npm test` | Unit tests |
| `npm run test:e2e` | Playwright |

## Status

Source is being published incrementally. Core shell, CI, tests, preload, bats are on `main`. Some large modules may still land in follow-up commits.

## License

MIT © sellmetadone
