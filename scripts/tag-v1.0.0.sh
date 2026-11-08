#!/usr/bin/env bash
set -euo pipefail
git status
git tag -a v1.0.0 -m "FORMA 1.0.0"
git push origin v1.0.0
if command -v gh >/dev/null 2>&1; then
  gh release create v1.0.0 --title "FORMA 1.0.0" --notes-file RELEASE_NOTES.md || true
fi
echo "Tagged v1.0.0"
