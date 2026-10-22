#!/usr/bin/env bash
# Usage (inside a Remotion project): ../../scripts/stills.sh PointerAndCursor 0 900 1800 ...
# Renders single frames to out/still-<frame>.png without rendering the whole film.
set -euo pipefail
COMP="$1"; shift
mkdir -p out
for F in "$@"; do npx remotion still src/index.ts "$COMP" "out/still-$F.png" --frame="$F"; done
