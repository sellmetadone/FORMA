@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo === FORMA install-and-run ===
echo Working directory: %CD%

where node >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js not found. Install from https://nodejs.org/
  pause
  exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
  echo ERROR: npm not found.
  pause
  exit /b 1
)

echo Node:
node -v
echo npm:
npm -v

REM Fix broken npm prefix/cache pointing at F:\ or other invalid roots (EPERM mkdir F:\)
for /f "delims=" %%A in ('npm config get prefix 2^>nul') do set NPM_PREFIX=%%A
for /f "delims=" %%A in ('npm config get cache 2^>nul') do set NPM_CACHE=%%A
echo npm prefix=%NPM_PREFIX%
echo npm cache=%NPM_CACHE%

echo %NPM_PREFIX% | findstr /I /C:"F:\" >nul
if not errorlevel 1 (
  echo Resetting invalid npm prefix...
  npm config delete prefix
)
echo %NPM_CACHE% | findstr /I /C:"F:\" >nul
if not errorlevel 1 (
  echo Resetting invalid npm cache...
  npm config delete cache
)

npm config set cache "%CD%\.npm-cache" --location=project 2>nul

echo.
echo Running npm install (this may take a few minutes)...
call npm install
if errorlevel 1 (
  echo npm install failed. See errors above.
  pause
  exit /b 1
)

echo.
echo Rebuilding native modules for Electron (better-sqlite3)...
call npm run rebuild:native
if errorlevel 1 (
  echo WARNING: rebuild:native failed. SQLite may not work until:
  echo   npm run rebuild:native
  echo Install "Desktop development with C++" Build Tools if needed.
)

echo.
echo Starting FORMA (vite + electron)...
call npm run electron:dev
pause
