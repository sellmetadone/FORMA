@echo off
chcp 65001 >nul
setlocal EnableExtensions
title FORMA — Install & Run
cd /d "%~dp0"

echo.
echo  ========================================
echo   FORMA — install dependencies and run
echo  ========================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js not found. Install from https://nodejs.org/ and reopen this window.
  pause
  exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
  echo [ERROR] npm not found. Reinstall Node.js with npm included.
  pause
  exit /b 1
)

echo Node:
node -v
echo npm:
npm -v
echo.

REM Fix broken npm prefix/cache pointing at drive roots (e.g. F:\)
for /f "delims=" %%A in ('npm config get prefix 2^>nul') do set "NPM_PREFIX=%%A"
echo Current npm prefix: %NPM_PREFIX%
echo %NPM_PREFIX%| findstr /I /R "^[A-Za-z]:\\$" >nul
if not errorlevel 1 (
  echo [FIX] npm prefix looks like a drive root. Resetting to user folders...
  npm config delete prefix 2>nul
  npm config set prefix "%APPDATA%\npm"
)
for /f "delims=" %%A in ('npm config get cache 2^>nul') do set "NPM_CACHE=%%A"
echo Current npm cache: %NPM_CACHE%
echo %NPM_CACHE%| findstr /I /R "^[A-Za-z]:\\$" >nul
if not errorlevel 1 (
  echo [FIX] npm cache looks like a drive root. Resetting...
  npm config delete cache 2>nul
  npm config set cache "%LOCALAPPDATA%\npm-cache"
)

if not exist "package.json" (
  echo [ERROR] package.json not found. Put this .bat into the FORMA project root.
  pause
  exit /b 1
)

echo.
echo [1/3] npm install ...
echo.
call npm install
if errorlevel 1 (
  echo.
  echo [ERROR] npm install failed.
  echo Try:
  echo   npm cache clean --force
  echo   npm config delete prefix
  echo   npm config set cache "%%LOCALAPPDATA%%\npm-cache"
  echo   npm install
  pause
  exit /b 1
)

echo.
echo [2/3] Starting FORMA (Electron + Vite)...
echo      Close the window or press Ctrl+C in this console to stop.
echo.

call npm run electron:dev
if errorlevel 1 (
  echo.
  echo electron:dev failed — trying renderer only: npm run dev
  call npm run dev
)

echo.
pause
endlocal
