#!/bin/sh
# Rebuilds js/landscape.min.js: the hero scene plus only the parts of Three.js it uses, minified.
# Run after editing js/landscape.js or js/color.js. The site itself has no build step; this output is committed.
set -e
cd "$(dirname "$0")/.."
npx --yes esbuild@0.25.10 js/landscape.js --bundle --minify --format=esm --target=es2020 \
  --alias:three=./js/vendor/three.module.js --legal-comments=none --outfile=js/landscape.min.js
ls -l js/landscape.min.js
