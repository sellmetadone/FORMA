# FORMA 1.0 — Manual QA

Run on **Windows 10 x64** and **Windows 11 x64**. Record pass/fail.

## Install

| # | Step | Pass |
|---|------|------|
| 1 | Install via NSIS Setup | |
| 2 | Launch from Start Menu | |
| 3 | Launch from desktop shortcut | |

## Core UI

| # | Step | Pass |
|---|------|------|
| 4 | Switch theme; restart; theme kept | |
| 5 | Switch language; restart | |
| 6 | Collapse sidebar; restart | |
| 7 | Command Palette Ctrl+K | |
| 8 | Global Search Ctrl+Shift+F | |

## Workspace

| # | Step | Pass |
|---|------|------|
| 9 | Add widgets, drag, resize | |
| 10 | Undo after move | |
| 11 | Restart; layout restored | |

## Wallpapers

| # | Step | Pass |
|---|------|------|
| 12 | Apply static image | |
| 13 | Live video Apply to desktop | |
| 14 | Stop live desktop; window gone | |
| 15 | Quit app while live running; no zombie | |

## Data

| # | Step | Pass |
|---|------|------|
| 16 | Export backup JSON | |
| 17 | Import backup restores theme | |
| 18 | Profiles create / activate | |

## Shell

| # | Step | Pass |
|---|------|------|
| 19 | Close window → tray | |
| 20 | Tray Open / Quit | |
| 21 | Second launch focuses existing | |
| 22 | Autostart on/off | |

## Build

| # | Step | Pass |
|---|------|------|
| 23 | npm run typecheck | |
| 24 | npm test | |
| 25 | npm run electron:build | |

**Tester / date / OS:** ________________
