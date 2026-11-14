# Continuous Integration

FORMA uses **GitHub Actions** (`.github/workflows/ci.yml`).

## Triggers

- Push to `main` / `master` / `develop`
- Pull requests to those branches
- Tags `v*` (creates a GitHub Release with the Windows installer)
- Manual: Actions → CI → **Run workflow**

## Jobs

| Job | Runner | What it does |
|-----|--------|----------------|
| **test** | Ubuntu | `npm install` → typecheck → unit tests → `npm run build` → upload `dist` + `dist-electron` |
| **windows-installer** | Windows | rebuild native modules → `npm run electron:build` → upload `FORMA-Setup-*.exe` |
| **e2e** | Ubuntu | Playwright (non-blocking if flaky) |
| **release** | Ubuntu | On `v*` tags only — attach installer to GitHub Release |

## Artifacts

After a green run on `main`:

1. Open the workflow run on GitHub
2. **Artifacts** → `FORMA-Setup-Windows-<sha>`
3. Download the `.exe` installer

## Local equivalent

```bash
npm ci
npm run typecheck
npm test
npm run build
# Windows only:
npm run rebuild:native
npm run electron:build
```

## Notes

- Installers are **unsigned** in CI (`CSC_IDENTITY_AUTO_DISCOVERY=false`).
- `better-sqlite3` is rebuilt with `electron-builder install-app-deps`.
- Code signing can be added later via secrets (`CSC_LINK`, `CSC_KEY_PASSWORD`).
