@echo off
REM Create and push annotated tag v1.0.0 (run from repo root after git pull)
git status
git tag -a v1.0.0 -m "FORMA 1.0.0"
git push origin v1.0.0
echo.
echo Optional GitHub Release (requires gh CLI):
echo   gh release create v1.0.0 --title "FORMA 1.0.0" --notes-file RELEASE_NOTES.md
pause
