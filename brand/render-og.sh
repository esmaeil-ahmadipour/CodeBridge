#!/usr/bin/env bash
# Renders the six OG images (3 locales x home/guide) and the GitHub social preview from brand/og/og.html.
# Uses the website's own fonts (apps/web/public/fonts). Aborts if a required font did not load, so a fallback face can never ship.
# Needs only a Chrome/Chromium binary: CHROME=/path/to/chrome bash brand/render-og.sh
set -euo pipefail
cd "$(dirname "$0")/.."
CHROME="${CHROME:-$(command -v google-chrome || command -v chromium || command -v chromium-browser || command -v chrome || true)}"
[ -n "$CHROME" ] || { echo "Chrome/Chromium not found. Set CHROME=/path/to/chrome" >&2; exit 1; }
OUT=apps/web/public/og
mkdir -p "$OUT"
FLAGS=(--headless=new --no-sandbox --disable-gpu --hide-scrollbars --allow-file-access-from-files --force-device-scale-factor=1 --virtual-time-budget=8000)
render() { # key width height outfile
  local url="file://$PWD/brand/og/og.html#$1"
  if ! "$CHROME" "${FLAGS[@]}" --dump-dom "$url" 2>/dev/null | grep -q 'data-fonts="ok"'; then
    echo "FONT CHECK FAILED for $1: the project fonts in apps/web/public/fonts did not load. Nothing written." >&2; exit 1
  fi
  "$CHROME" "${FLAGS[@]}" --window-size="$2,$3" --screenshot="$4" "$url" >/dev/null 2>&1
  echo "wrote $4"
}
for l in en fa ar; do for k in home guide; do render "$l-$k" 1200 630 "$OUT/$k-$l-v2.png"; done; done
render en-social 1280 640 brand/github-social-preview.png
