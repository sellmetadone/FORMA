@echo off
cd /d "%~dp0"
if not exist node_modules (
  echo node_modules missing. Run install-and-run.bat first.
  pause
  exit /b 1
)
call npm run electron:dev
