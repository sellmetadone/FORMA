@echo off
chcp 65001 >nul
setlocal
title FORMA — Download & Setup

echo.
echo  FORMA — clone from GitHub and install
echo.

where git >nul 2>&1
if errorlevel 1 (
  echo [ERROR] git not found. Install Git for Windows: https://git-scm.com/
  echo Or download ZIP: https://github.com/sellmetadone/FORMA/archive/refs/heads/main.zip
  pause
  exit /b 1
)

set "TARGET=%USERPROFILE%\Desktop\FORMA"
if exist "%TARGET%\package.json" (
  echo Folder already exists: %TARGET%
  cd /d "%TARGET%"
) else (
  echo Cloning into %TARGET% ...
  git clone https://github.com/sellmetadone/FORMA.git "%TARGET%"
  if errorlevel 1 (
    echo Clone failed.
    pause
    exit /b 1
  )
  cd /d "%TARGET%"
)

if exist "install-and-run.bat" (
  call install-and-run.bat
) else (
  echo install-and-run.bat missing — run npm install manually
  call npm install
  call npm run electron:dev
)

endlocal
