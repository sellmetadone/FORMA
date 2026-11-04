# FORMA

**Windows Personal Workspace & Customization Platform**

FORMA lets you create and manage a personal Windows workspace — themes, wallpapers, widgets, layouts and profiles — in one coherent environment.

> *The desktop adapts to the user, not the other way around.*

---

## Status

**Stage I — Foundation** (in progress)

- Electron + React + TypeScript + Vite
- Application Core, Module Registry, Event Bus
- Design System (FORMA Light / Graphite)
- SQLite storage layer
- Main navigation and shell
- Settings Manager

Later stages: Theme Studio, Profile Manager, Workspace Studio, Widget Engine, Windows integration, installer.

---

## Concept

FORMA is not just a wallpaper or theme manager. It is a unified platform for:

- Appearance of Windows
- Personal workspace
- Themes and color systems
- Wallpapers (local, scheduled, multi-monitor)
- Widgets
- Icons and cursors
- Layouts
- Profiles (WORK, GAMING, MINIMAL, …)

---

## Stack

| Component          | Technology                    |
| ------------------ | ----------------------------- |
| Desktop Framework  | Electron                      |
| Frontend           | React                         |
| Language           | TypeScript                    |
| Build              | Vite                          |
| State              | Zustand                       |
| Database           | SQLite (better-sqlite3)       |
| Validation         | Zod                           |
| Styling            | CSS Modules + CSS Variables   |
| Icons              | Lucide                        |
| Testing            | Vitest + Playwright (planned) |
| Packaging          | electron-builder              |

---

## Architecture

Modular core with clear boundaries:

- **Application Core** — bootstrap, lifecycle
- **Module Registry** — registration, dependencies, status
- **Event Bus** — typed events between modules
- **Theme Engine / Workspace Engine / Widget Engine / …**
- **Storage Layer** (SQLite)
- **Windows Integration Layer** (adapters only; no direct system calls from UI)

UI never has direct access to Node.js or system APIs. All IPC is explicit and validated.

---

## Project structure

```
FORMA/
├── electron/
│   ├── main/          # Electron main process
│   ├── preload/       # Context-isolated preload
│   ├── ipc/           # IPC handlers
│   └── services/      # Database and system services
├── src/
│   ├── app/           # Root app
│   ├── components/    # UI components
│   ├── pages/         # Route pages
│   ├── core/          # Registry, Event Bus
│   ├── stores/        # Zustand stores
│   ├── styles/        # Design tokens + global CSS
│   └── types/
├── resources/
├── database/
├── tests/
├── docs/
├── README.md
├── LICENSE
└── package.json
```

---

## Requirements

- Node.js 20+
- Windows 10/11 (target platform)
- npm or pnpm

---

## Development

```bash
# Install
npm install

# Renderer only (browser)
npm run dev

# Full Electron (when electron scripts are wired)
npm run electron:dev

# Type check
npm run lint

# Build renderer
npm run build
```

---

## License

MIT — see [LICENSE](LICENSE).

---

## Author

**sellmetadone**  
Telegram: [@sofia_white_death](https://t.me/sofia_white_death)

Repository: [github.com/sellmetadone/FORMA](https://github.com/sellmetadone/FORMA)
