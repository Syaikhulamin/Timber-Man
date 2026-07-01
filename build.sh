#!/usr/bin/env bash
set -e

echo "Build: minify src/ -> js/"

for f in src/**/*.js src/*.js; do
  [ -f "$f" ] || continue
  out="js/${f#src/}"
  mkdir -p "$(dirname "$out")"
  npx terser "$f" -o "$out" -c -m --module
  echo "  $f -> $out"
done

echo "Done."
