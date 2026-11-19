# Generate FORMA icons

Source mark: geometric F (white + sage on black).

From repo root (requires ImageMagick or Pillow):

```bash
# Prefer committed build/logo-source.png or public branding art
convert build/logo-source.png -resize 256x256 build/icon.png
convert build/icon-16.png build/icon-32.png build/icon-48.png build/icon-256.png build/icon.ico
```

electron-builder reads:
- `build/icon.png`
- `build/icon.ico` (Windows)

Package.json already sets `build.icon` and `build.win.icon`.
