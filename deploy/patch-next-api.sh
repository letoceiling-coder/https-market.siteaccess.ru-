#!/bin/bash
set -euo pipefail

SRC=/var/www/helphomes.ru/build-src
SHARED=/var/www/helphomes.ru/shared/.env
REL=/var/www/helphomes.ru/releases/20261101T205800Z

install -o helphomes -g helphomes -m 644 /tmp/hh-next/api.ts "$SRC/src/lib/api.ts"
install -o helphomes -g helphomes -m 644 /tmp/hh-next/about-page.tsx "$SRC/src/app/about/page.tsx"

python3 - <<'PY'
from pathlib import Path
path = Path("/var/www/helphomes.ru/shared/.env")
text = path.read_text()
updates = {
    "NEXT_PUBLIC_API_URL": "https://api.helphomes.ru",
    "API_INTERNAL_URL": "http://127.0.0.1:8073",
}
for key, value in updates.items():
    line = f"{key}={value}"
    if any(existing.startswith(key + "=") for existing in text.splitlines()):
        text = "\n".join(line if existing.startswith(key + "=") else existing for existing in text.splitlines()) + "\n"
    else:
        text = text.rstrip() + "\n" + line + "\n"
path.write_text(text)
PY
chmod 640 "$SHARED"
chown helphomes:helphomes "$SHARED"

if ! grep -q 'helphomes-build.swap' /proc/swaps; then
  fallocate -l 2G /swap-helphomes-build || dd if=/dev/zero of=/swap-helphomes-build bs=1M count=2048
  chmod 600 /swap-helphomes-build
  mkswap /swap-helphomes-build
  swapon /swap-helphomes-build
fi

cp -a "$SHARED" "$SRC/.env.production"
chown helphomes:helphomes "$SRC/.env.production"

echo "=== BUILD ==="
sudo -u helphomes bash -lc "cd '$SRC' && NODE_OPTIONS='--max-old-space-size=1536' npm run build"

rm -rf "$REL"
mkdir -p "$REL"
cp -a "$SRC/.next/standalone/." "$REL/"
mkdir -p "$REL/.next"
cp -a "$SRC/.next/static" "$REL/.next/static"
cp -a "$SRC/public" "$REL/public"
cp -a "$SHARED" "$REL/.env.production"
chown -R helphomes:helphomes "$REL"

old=$(readlink -f /var/www/helphomes.ru/current)
ln -sfn "$old" /var/www/helphomes.ru/previous
ln -sfn "$REL" /var/www/helphomes.ru/current
systemctl restart helphomes
sleep 3
systemctl is-active helphomes

echo "=== FRONT ==="
for p in / /map /search /catalog /account /favorites /messages /about; do
  code=$(curl -sS -m 12 -o /tmp/hh-body -w "%{http_code}" -H "Host: helphomes.ru" "http://127.0.0.1$p")
  echo "$p $code"
done
echo "=== ABOUT SNIP ==="
curl -sS -m 12 -H "Host: helphomes.ru" http://127.0.0.1/about | tr '\n' ' ' | sed -n 's/.*\(API: [^<]*\).*/\1/p'
echo
echo "=== SWAPOFF BUILD ==="
swapoff /swap-helphomes-build || true
rm -f /swap-helphomes-build
free -h
