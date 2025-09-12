#!/usr/bin/env bash
set -e
echo "Downloading jsQR from unpkg.com..."
curl -L https://unpkg.com/jsqr/dist/jsQR.js -o webview/jsqr.min.js
echo "Downloaded webview/jsqr.min.js"
