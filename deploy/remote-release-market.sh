#!/bin/bash
set -euo pipefail

APP_ROOT="/var/www/market.siteaccess.ru"
STAMP="${1:-$(date -u +%Y%m%dT%H%M%SZ)}"
SRC="$APP_ROOT/src"
RELEASE="$APP_ROOT/releases/$STAMP"
SHARED="$APP_ROOT/shared"

if ! id market >/dev/null 2>&1; then
  useradd --system --home "$APP_ROOT" --shell /usr/sbin/nologin market
fi

mkdir -p "$APP_ROOT/releases" "$SHARED" "$APP_ROOT/log" /var/www/letsencrypt
chown -R market:market "$APP_ROOT"
chmod 750 "$APP_ROOT" "$SHARED"

if [[ ! -f "$SHARED/.env" ]]; then
  cat > "$SHARED/.env" <<'EOF'
NODE_ENV=production
HOSTNAME=127.0.0.1
PORT=3110
UI_DEMO_MODE=true
NEXT_PUBLIC_SITE_URL=https://market.siteaccess.ru
EOF
  chown market:market "$SHARED/.env"
  chmod 640 "$SHARED/.env"
fi

cd "$SRC"
# Prefer clean install; fall back if lockfile drift.
if [[ -f package-lock.json ]]; then
  npm ci
else
  npm install
fi

# Build with the flags of shared/.env (UI_DEMO_MODE=true shows the test listings).
set -a
# shellcheck disable=SC1091
source "$SHARED/.env"
set +a
NODE_ENV=production npx next build

mkdir -p "$RELEASE"
cp -a "$SRC/.next/standalone/." "$RELEASE/"
mkdir -p "$RELEASE/.next"
cp -a "$SRC/.next/static" "$RELEASE/.next/static"
if [[ -d "$SRC/public" ]]; then
  cp -a "$SRC/public" "$RELEASE/public"
fi

chown -R market:market "$RELEASE"
ln -sfn "$RELEASE" "$APP_ROOT/current"
# Keep previous pointer for quick rollback when an older release exists.
PREV=$(ls -1dt "$APP_ROOT/releases"/* 2>/dev/null | awk -v cur="$RELEASE" '$0 != cur {print; exit}')
if [[ -n "${PREV:-}" ]]; then
  ln -sfn "$PREV" "$APP_ROOT/previous"
fi

install -m 644 /tmp/market-siteaccess.service /etc/systemd/system/market-siteaccess.service
systemctl daemon-reload
systemctl enable market-siteaccess
systemctl restart market-siteaccess
sleep 2
systemctl --no-pager --full status market-siteaccess | head -25
curl -sS -o /dev/null -w "local_home=%{http_code}\n" http://127.0.0.1:3110/ || true

echo "release=$RELEASE"
echo "stamp=$STAMP"
