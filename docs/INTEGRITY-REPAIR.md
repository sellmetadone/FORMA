# FORMA Integrity & Startup Repair (2026-11-08)

## Root causes

1. Incomplete tree → `Could not resolve "../services/database"` if `electron/services/database.ts` missing.
2. npm prefix/cache on `F:\` → EPERM mkdir F:\.
3. Vite watching system paths (DumpStack.log.tmp).
4. `electron:dev` starting Electron before vite-plugin-electron built main/preload.

## Fixes in this package

- vite.config.ts: fs.strict + watch.ignored (dist, node_modules, F:\, DumpStack, …)
- electron/main: preload .js/.mjs/.cjs resolution; live wallpaper cleanup
- package.json: electron:dev = vite
- install-and-run.bat: reset bad npm prefix/cache
- tsconfig: remove noUncheckedSideEffectImports
- Verified present: database.ts, handlers, preload, appStore, themes, pages

## On Windows

```bat
install-and-run.bat
npm run typecheck
npm test
npm run build
npm run electron:dev
npm run electron:build
```
