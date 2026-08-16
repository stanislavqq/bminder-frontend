#!/bin/sh
set -e

API_HOST="${API_HOST:-http://127.0.0.1:3333}"
API_HOST="${API_HOST%/}"

cat > /usr/share/nginx/html/config.js <<EOF
window.__APP_CONFIG__ = { apiHost: "${API_HOST}" };
EOF
