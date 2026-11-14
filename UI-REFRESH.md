# UI refresh — 2026-11-14

- Refined global typography, form controls, focus states and motion timing.
- Added tactile button press/hover feedback and quieter card elevation.
- Added wallpaper thumbnails and an animated in-app preview when selecting a wallpaper.
- Respects `prefers-reduced-motion`.

## Desktop crossfade (FORMA)

Static wallpaper apply uses a temporary fullscreen overlay that crossfades previous → next image, then commits via `SystemParametersInfo` / DesktopWallpaper COM so the OS desktop does not flash black. See `electron/windows/wallpaperCrossfade.ts`.
