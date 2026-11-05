#!/usr/bin/env bash
# Thin launcher (Linux / macOS / Git-Bash). No logic here: it only starts CodeBridge.
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for b in "$here/codebridge-linux-x64" "$here/codebridge-macos-arm64" "$here/codebridge"; do
  if [ -x "$b" ]; then exec "$b" "$@"; fi
done
# running from a source checkout (launchers/ next to src/)
if [ -d "$here/../src/codebridge" ] && command -v python3 >/dev/null 2>&1; then
  PYTHONPATH="$here/../src${PYTHONPATH:+:$PYTHONPATH}" exec python3 -m codebridge "$@"
fi
if command -v python3 >/dev/null 2>&1; then exec python3 -m codebridge "$@"; fi
echo "CodeBridge binary not found next to this script and python3 is not installed." >&2
exit 1
