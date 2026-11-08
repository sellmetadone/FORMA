# FORMA

**Windows Personal Workspace & Customization Platform**

| | |
|---|---|
| **Author** | sellmetadone |
| **Telegram** | [@sofia_white_death](https://t.me/sofia_white_death) |
| **License** | MIT |
| **Version** | **1.0.0** |

> *The desktop adapts to the user, not the other way around.*

## Quick start (Windows)

```bat
git clone https://github.com/sellmetadone/FORMA.git
cd FORMA
install-and-run.bat
```

If `npm` errors with `EPERM mkdir F:\`:

```bat
npm config delete prefix
npm config delete cache
npm install
npm run electron:dev
```

**Ctrl+K** — Command Palette · **Ctrl+Shift+F** — Global Search

## Docs

- [RELEASE_NOTES.md](./RELEASE_NOTES.md)
- [docs/INTEGRITY-REPAIR.md](./docs/INTEGRITY-REPAIR.md)
- [docs/QA-1.0.md](./docs/QA-1.0.md)
- [docs/GITHUB-SYNC.md](./docs/GITHUB-SYNC.md)

## Tag v1.0.0

```bat
scripts\tag-v1.0.0.bat
```

## License

MIT © sellmetadone
