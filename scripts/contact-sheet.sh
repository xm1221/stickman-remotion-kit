#!/usr/bin/env bash
# Usage: scripts/contact-sheet.sh out/film.mp4 [every_n_seconds=6] [cols=6]
# Makes out/<name>-contact.png (thumbnails with timestamps) for quick visual QA.
set -euo pipefail
IN="$1"; N="${2:-6}"; COLS="${3:-6}"
BASE="$(basename "${IN%.*}")"; OUTDIR="$(dirname "$IN")"
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN")
COUNT=$(python3 -c "import math;print(math.ceil(float('$DUR')/$N))")
ROWS=$(( (COUNT + COLS - 1) / COLS ))
ffmpeg -y -loglevel error -i "$IN" \
  -vf "fps=1/$N,scale=320:-1,drawtext=text='%{pts\:hms}':x=6:y=6:fontsize=18:fontcolor=white:box=1:boxcolor=black@0.6,tile=${COLS}x${ROWS}" \
  -frames:v 1 "$OUTDIR/${BASE}-contact.png"
echo "$OUTDIR/${BASE}-contact.png"
