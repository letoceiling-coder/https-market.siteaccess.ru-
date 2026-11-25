#!/bin/bash
set -euo pipefail

SRC=/var/www/helphomes.ru/build-src
SHARED=/var/www/helphomes.ru/shared/.env
REL=/var/www/helphomes.ru/releases/20261101T224700Z

install -o helphomes -g helphomes -m 644 /tmp/hh-next/api.ts "$SRC/src/lib/api.ts"
install -o helphomes -g helphomes -m 644 /tmp/hh-next/about-page.tsx "$SRC/src/app/about/page.tsx"
install -o helphomes -g helphomes -m 644 /tmp/hh-next/card-data.ts "$SRC/src/services/card-data.ts"
mkdir -p "$SRC/src/app/catalog/[...slug]"
install -o helphomes -g helphomes -m 644 /tmp/hh-next/catalog-slug-page.tsx "$SRC/src/app/catalog/[...slug]/page.tsx"

cp -a "$SHARED" "$SRC/.env.production"
chown helphomes:helphomes "$SRC/.env.production"

if ! grep -q 'helphomes-build.swap' /proc/swaps; then
  fallocate -l 2G /swap-helphomes-build || dd if=/dev/zero of=/swap-helphomes-build bs=1M count=2048
  chmod 600 /swap-helphomes-build
  mkswap /swap-helphomes-build
  swapon /swap-helphomes-build
fi

sudo -u helphomes bash -lc "cd '$SRC' && NODE_OPTIONS='--max-old-space-size=1536' npm run build"

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

for p in / /map /search /catalog /catalog/uslugi /about /account /account/partner; do
  echo -n "$p "
  curl -sS -m 12 -o /dev/null -w "%{http_code}\n" --resolve avito.rinulik.ru:443:127.0.0.1 "https://avito.rinulik.ru$p"
done

swapoff /swap-helphomes-build || true
rm -f /swap-helphomes-build
