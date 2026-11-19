# FORMA 1.0.2

## Highlights
- **App icon** — official geometric F mark (window, tray, installer)
- **Desktop wallpaper** — images via SPI/COM, video/GIF via WorkerW; unified Apply
- **Administrator elevation** — START.bat UAC + NSIS requireAdministrator
- **Snapshot restore UX** — load JSON → preview sections → selective restore + safety backup
- **Native file picker** for wallpapers (Browse files…)

## Install (Windows)
1. Download `FORMA-Setup-1.0.2.exe` from this Release (or build with `npm run electron:build`)
2. Run installer (UAC required)
3. Launch FORMA from Start Menu

## Dev
```bat
git clone https://github.com/sellmetadone/FORMA.git
cd FORMA
START.bat
```

## Notes
- Live desktop WorkerW is best-effort on some Windows builds
- Installer is not code-signed (`forceCodeSigning: false`)
