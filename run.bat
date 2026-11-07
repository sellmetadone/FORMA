@echo off
chcp 65001 >nul
cd /d "%~dp0"
title FORMA
if not exist node_modules (
  echo node_modules missing — run install-and-run.bat first
  pause
  exit /b 1
)
call npm run electron:dev
if errorlevel 1 call npm run dev
pause
