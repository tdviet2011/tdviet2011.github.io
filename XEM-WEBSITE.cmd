@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Can cai Node.js 22.12+ hoac 24 LTS de xem website local.
  pause
  exit /b 1
)
node scripts\serve.mjs --open
pause
