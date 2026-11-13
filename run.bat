@echo off
setlocal EnableExtensions
cd /d "%~dp0"

title FORMA
echo === FORMA run ===
echo Working directory: %CD%
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js not found. Install from https://nodejs.org/
  goto :end
)

if not exist "package.json" (
  echo ERROR: package.json not found.
  goto :end
)

if not exist "node_modules\" (
  echo node_modules missing. Run install-and-run.bat first.
  goto :end
)

echo Node:
node -v
echo.
echo Starting FORMA (vite + electron)...
echo Leave this window open. Press Ctrl+C to stop.
echo.

call npm run electron:dev
echo.
echo --- FORMA exited, code %ERRORLEVEL% ---
echo If the window closed immediately, errors are above.
echo Try:
echo   npm run rebuild:native
echo   git pull origin main
echo   npm run electron:dev

:end
echo.
pause
