@echo off
setlocal EnableExtensions
cd /d "%~dp0"

title FORMA install
echo === FORMA install-and-run ===
echo Working directory: %CD%
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js not found. Install from https://nodejs.org/
  goto :end
)

where npm >nul 2>&1
if errorlevel 1 (
  echo ERROR: npm not found.
  goto :end
)

echo Node:
node -v
echo npm:
npm -v
echo.

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
echo Running npm install...
call npm install
if errorlevel 1 (
  echo npm install FAILED.
  goto :end
)

echo.
echo Rebuilding native modules...
call npm run rebuild:native
if errorlevel 1 (
  echo WARNING: rebuild failed — SQLite may not work.
)

echo.
echo Starting FORMA...
echo Leave this window open. Press Ctrl+C to stop.
echo.
call npm run electron:dev
echo.
echo --- FORMA exited, code %ERRORLEVEL% ---

:end
echo.
pause
