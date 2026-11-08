# GitHub sync (2026-11-08)

Pushed to **main**:
- vite.config.ts (watch/fs repair)
- package.json **1.0.0**, install-and-run.bat, run.bat
- docs/INTEGRITY-REPAIR.md
- electron main / liveDesktop / workerW / validation schemas
- VERSION, tag scripts

**Full source tree** (database.ts, system.ts, handlers, all pages/stores/widgets/i18n):
prefer **FORMA-1.0.0-repaired-source.zip** until every path is on remote.

If after `git clone` you see `Could not resolve "../services/database"`, ensure this file exists:
`electron/services/database.ts` (from the ZIP if missing on GitHub).

```bat
git clone https://github.com/sellmetadone/FORMA.git
cd FORMA
install-and-run.bat
```
