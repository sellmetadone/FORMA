# FORMA → 1.0.0

**Current:** 1.0.0-rc.1 (~90%)
**Target:** 1.0.0 — first daily-driver release (Windows 10/11 x64)

## Definition of done

1.0.0 ships when **all P0** are closed and **manual QA checklist** passes on clean Win10 + Win11.

### In scope
- Themes, locale, appearance
- Workspace + widgets (save/restore)
- Static wallpapers + live video/web (documented limits)
- Profiles + backup/import/export
- Tray, single-instance, autostart
- NSIS Setup + README + CHANGELOG + GitHub Release

### Out of scope (→ 1.1+)
- Full Lively/Wallpaper Engine parity
- Widget store / plugins
- Cloud sync
- macOS/Linux

---

## P0 — must fix before 1.0.0

| ID | Area | Issue |
|----|------|--------|
| P0-1 | Release | Full source on GitHub matches local |
| P0-2 | Build | `npm run electron:build` NSIS on clean PC |
| P0-3 | Data | Theme/locale/workspace survive restart |
| P0-4 | Backup | Export → Import restores settings + workspace |
| P0-5 | Live | Quit/Stop removes live desktop window |
| P0-6 | Security | contextIsolation, Zod IPC |
| P0-7 | QA | Manual checklist Win10/11 signed off |

## P1 — preferred

| ID | Issue |
|----|--------|
| P1-1 | CI typecheck + vitest |
| P1-2 | Playwright smoke |
| P1-3 | Tray Stop live wallpaper |
| P1-4 | Reset appearance defaults |
| P1-5 | Known issues WorkerW in README |
| P1-6 | App icon branding |

See docs/QA-1.0.md for the full manual checklist.
