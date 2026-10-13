@echo off
setlocal
echo Updating your portfolio from portfolio.ini...
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\build-site.ps1"
if errorlevel 1 (
  echo Your update did not finish. Read the message above.
) else (
  echo Ready. Double-click START-HERE.html to preview.
)
pause
