#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   bash scripts/optimize-images.sh
#   bash scripts/optimize-images.sh input-dir output-dir
#
# Default:
#   input-dir  = .
#   output-dir = assets/img/optimized

INPUT_DIR="${1:-.}"
OUTPUT_DIR="${2:-assets/img/optimized}"

mkdir -p "$OUTPUT_DIR"

if ! command -v sips >/dev/null 2>&1; then
  echo "sips not found. Install macOS image tools or use another optimizer."
  exit 1
fi

echo "Optimizing images from: $INPUT_DIR"
echo "Output directory: $OUTPUT_DIR"

find "$INPUT_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) | while read -r img; do
  base="$(basename "$img")"
  name="${base%.*}"
  ext="${base##*.}"
  out="$OUTPUT_DIR/${name}.webp"

  # Convert image to reasonable web size first.
  tmp="$OUTPUT_DIR/${name}.tmp.${ext}"
  sips -Z 1600 "$img" --out "$tmp" >/dev/null

  # If cwebp exists, create webp, else keep compressed source format.
  if command -v cwebp >/dev/null 2>&1; then
    cwebp -q 78 "$tmp" -o "$out" >/dev/null 2>&1 && rm -f "$tmp"
  else
    # Fallback: keep compressed PNG/JPG with same extension
    mv "$tmp" "$OUTPUT_DIR/${base}"
  fi
done

echo "Optimization complete."
