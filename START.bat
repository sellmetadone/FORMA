@echo off
chcp 65001 >nul
setlocal EnableExtensions
cd /d "%~dp0"
title FORMA

echo ========================================
echo   FORMA — start
echo   Folder: %CD%
echo ========================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js not found.
  echo Install: https://nodejs.org/  (LTS)
  goto END
)

if not exist "package.json" (
  echo [ERROR] package.json not found. Wrong folder?
  goto END
)

REM Elevate to Administrator (WorkerW / desktop wallpaper)
net session >nul 2>&1
if errorlevel 1 (
  echo [!] Requesting Administrator rights...
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs -WorkingDirectory '%~dp0'"
  exit /b 0
)
echo [OK] Running elevated

if not exist "node_modules\vite\package.json" (
  echo [!] Dependencies missing — running npm install...
  echo.
  call npm install
  if errorlevel 1 (
    echo [ERROR] npm install failed.
    goto END
  )
  echo.
  echo [!] Rebuilding native modules for Electron...
  call npm run rebuild:native
  echo.
) else (
  if not exist "node_modules\better-sqlite3\build\Release\better_sqlite3.node" (
    echo [!] better-sqlite3 binary missing — rebuild:native...
    call npm run rebuild:native
  )
)

echo [OK] Starting Vite + Electron...
echo Keep this window open. Ctrl+C to stop.
echo.

call npm run electron:dev
set EXITCODE=%ERRORLEVEL%

echo.
echo ----------------------------------------
echo FORMA stopped. Exit code: %EXITCODE%
echo ----------------------------------------
if not "%EXITCODE%"=="0" (
  echo.
  echo If vite / sqlite failed:
  echo   npm install
  echo   npm run rebuild:native
  echo   npm run electron:dev
)

:END
echo.
pause
