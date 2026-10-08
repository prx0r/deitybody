#!/usr/bin/env bash
set -euo pipefail
TARGET="${1:-.}"
BASE="$(cd "$(dirname "$0")" && pwd)"
cp -R "$BASE/sanskrithelp_overlay/app" "$TARGET/"
cp -R "$BASE/sanskrithelp_overlay/components" "$TARGET/"
mkdir -p "$TARGET/lib/memory"
cp -R "$BASE/sanskrithelp_overlay/lib/memory/"* "$TARGET/lib/memory/"
echo "Installed Bruno wheel lab. Visit /learn/bruno"
