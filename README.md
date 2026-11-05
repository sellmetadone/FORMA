# FORMA

**Windows Personal Workspace & Customization Platform**

FORMA is a free, open-source desktop app for building a personal Windows workspace: themes, wallpapers, widgets, layouts, profiles and system integration — in one modular environment.

> *The desktop adapts to the user, not the other way around.*

| | |
|---|---|
| **Author** | sellmetadone |
| **Telegram** | [@sofia_white_death](https://t.me/sofia_white_death) |
| **License** | MIT |
| **Platform** | Windows 10 / 11 |
| **Stack** | Electron · React · TypeScript · Vite · SQLite · Zustand · Zod |
| **Version** | 0.6.1 |

## Status

| Stage | Focus | Readiness |
|-------|--------|-----------|
| I | Foundation | ~70% |
| II | Themes, profiles, wallpapers, layouts | ~75% |
| III | Workspace Studio | ~65% |
| IV | Widget Engine | ~80% |
| V | Windows integration | ~90% |
| VI | Stabilization, CI, E2E | ~85% |

## Quick start

```bash
git clone https://github.com/sellmetadone/FORMA.git
cd FORMA
npm install
npm run electron:dev
```

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server |
| `npm run electron:dev` | Full desktop app |
| `npm run build` | Production bundle |
| `npm run electron:build` | NSIS installer |
| `npm test` | Vitest unit tests |
| `npm run test:e2e` | Playwright smoke |
| `npm run ci` | typecheck + unit tests |

## Security

- `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`
- Zod-validated IPC
- Local-first data (SQLite)

See [SECURITY.md](./SECURITY.md).

## License

MIT © sellmetadone
