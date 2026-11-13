@echo off
chcp 65001 >nul
setlocal EnableExtensions
cd /d "%~dp0"
title FORMA install

echo ========================================
echo   FORMA — install and run
echo   Folder: %CD%
echo ========================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js not found: https://nodejs.org/
  goto END
)
where npm >nul 2>&1
if errorlevel 1 (
  echo [ERROR] npm not found.
  goto END
)

echo Node: & node -v
echo npm:  & npm -v
echo.

call npm config get prefix > "%TEMP%\forma-npm-prefix.txt" 2>nul
if exist "%TEMP%\forma-npm-prefix.txt" (
  findstr /I /R /C:"^[A-Za-z]:\\$" "%TEMP%\forma-npm-prefix.txt" >nul
  if not errorlevel 1 (
    echo Resetting npm prefix (was drive root^)...
    call npm config delete prefix
  )
)
call npm config get cache > "%TEMP%\forma-npm-cache.txt" 2>nul
if exist "%TEMP%\forma-npm-cache.txt" (
  findstr /I /R /C:"^[A-Za-z]:\\$" "%TEMP%\forma-npm-cache.txt" >nul
  if not errorlevel 1 (
    echo Resetting npm cache path (was drive root^)...
    call npm config delete cache
  )
)

echo.
echo [1/3] npm install ...
call npm install
if errorlevel 1 (
  echo [ERROR] npm install failed. Scroll up for details.
  goto END
)

echo.
echo [2/3] rebuild native (better-sqlite3 for Electron^) ...
call npm run rebuild:native
if errorlevel 1 (
  echo [WARN] native rebuild failed — app may still start, SQLite may fail.
  echo        Install Visual Studio Build Tools "Desktop development with C++"
)

echo.
echo [3/3] start app ...
echo Keep this window open. Ctrl+C to stop.
echo.
call npm run electron:dev
echo.
echo Exit code: %ERRORLEVEL%

:END
echo.
pause
