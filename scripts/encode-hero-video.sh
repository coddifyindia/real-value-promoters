#!/usr/bin/env bash
# Turns any video into the two files the home page banner plays:
#   public/videos/hero.mp4        silent, 1280px wide H.264, ~1-4 MB
#   public/videos/hero-poster.jpg first frame, shown while the video loads
#
# Usage: scripts/encode-hero-video.sh path/to/client-video.mov [start-seconds] [length-seconds]
# Then commit both files. Nothing else needs to change.
#
# Why these settings:
# - No audio track: browsers only autoplay muted video, and a silent file is smaller.
# - H.264 + yuv420p: plays on every phone and browser, no second format needed.
# - CRF 28 at 1280px: the banner is darkened behind text, so fine detail is not
#   worth the bytes. Phones on 4G start playing within a second or two.
# - +faststart: moves the index to the front so playback starts before the
#   whole file has downloaded.
set -euo pipefail

in="${1:?Usage: $0 input-video [start-seconds] [length-seconds]}"
start="${2:-0}"
length="${3:-20}"
out="$(dirname "$0")/../public/videos"
mkdir -p "$out"

ffmpeg -y -ss "$start" -t "$length" -i "$in" -an \
  -vf "scale=1280:-2:flags=lanczos,fps=25" \
  -c:v libx264 -preset slow -crf 28 -pix_fmt yuv420p -profile:v high \
  -movflags +faststart "$out/hero.mp4"

ffmpeg -y -i "$out/hero.mp4" -frames:v 1 -q:v 4 "$out/hero-poster.jpg"

ls -lh "$out/hero.mp4" "$out/hero-poster.jpg"
