@echo off
chcp 65001 >nul
setlocal EnableExtensions
cd /d "%~dp0"
title FORMA

echo === FORMA run ===
echo %CD%
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js not found.
  goto END
)

if not exist "node_modules\vite\package.json" (
  echo node_modules incomplete. Run START.bat or:
  echo   npm install
  goto END
)

echo Starting...
call npm run electron:dev
echo.
echo Exit code: %ERRORLEVEL%

:END
echo.
pause
