# P0-1 Source sync status (1.0.0)

## On GitHub (main) — critical

- package.json **1.0.0**, VERSION, RELEASE_NOTES.md
- electron/main/index.ts (live stop on quit)
- electron/windows/liveDesktop.ts, workerW.ts
- electron/validation/schemas.ts
- src/core/wallpaper/*, activity/log
- ROADMAP-1.0.md, docs/QA-1.0.md, scripts/tag-v1.0.0.*
- Branch **release/v1.0.0** (release marker)

## Full tree

Use the **FORMA-1.0.0-source.zip** artifact from the maintainer if a file is missing after `git clone`.

Priority if `npm run electron:dev` fails:

1. `electron/ipc/handlers.ts`
2. `electron/preload/index.ts`
3. `electron/services/database.ts`
4. `electron/windows/system.ts`
5. `src/pages/*`, `src/stores/*`, `src/components/**`
6. `src/core/i18n/locales.ts`

## Tag v1.0.0

```bat
git pull origin main
scripts\tag-v1.0.0.bat
```

```bash
git tag -a v1.0.0 -m "FORMA 1.0.0"
git push origin v1.0.0
gh release create v1.0.0 --title "FORMA 1.0.0" --notes-file RELEASE_NOTES.md
```
