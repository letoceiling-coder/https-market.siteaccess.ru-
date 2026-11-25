#!/bin/bash
# Ships the Avito category structure: new Next.js release + reseeded Laravel categories.
# Expects /tmp/hh-release/src.tgz (src/, next.config.ts) uploaded beforehand.
set -euo pipefail

SRC=/var/www/helphomes.ru/build-src
SHARED=/var/www/helphomes.ru/shared/.env
REL=/var/www/helphomes.ru/releases/$(date -u +%Y%m%dT%H%M%SZ)
API=/var/www/helphomes-api

backup=/root/backups/helphomes-src-$(date -u +%Y%m%dT%H%M%SZ).tgz
mkdir -p /root/backups
tar czf "$backup" -C "$SRC" src next.config.ts
echo "source backup: $backup"

tar xzf /tmp/hh-release/src.tgz -C "$SRC"
find "$SRC/src" "$SRC/next.config.ts" -type f -exec sed -i 's/\r$//' {} +
chown -R helphomes:helphomes "$SRC/src" "$SRC/next.config.ts"
cp -a "$SHARED" "$SRC/.env.production"
chown helphomes:helphomes "$SRC/.env.production"

if ! grep -q 'helphomes-build' /proc/swaps; then
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
sleep 4
systemctl is-active helphomes
echo "release: $REL (previous: $old)"

swapoff /swap-helphomes-build || true
rm -f /swap-helphomes-build

# Laravel: same taxonomy, drop categories that no longer exist (only if no listings use them).
install -o helphomes-api -g helphomes-api -m 644 "$SRC/src/data/taxonomy.json" "$API/database/data/taxonomy.json"
sudo -u helphomes-api php "$API/artisan" db:seed --class=CategorySeeder --force
sudo -u helphomes-api php "$API/artisan" tinker --execute='
$ids = collect(json_decode(file_get_contents(database_path("data/taxonomy.json")), true)["nodes"])->pluck("id");
$stale = App\Models\Category::whereNotIn("id", $ids)->whereNotIn("id", App\Models\Listing::query()->select("category_id"))->orderByDesc("depth")->get();
foreach ($stale as $c) { $c->delete(); }
echo "removed ".$stale->count()." stale, total ".App\Models\Category::count()."\n";
'
sudo -u helphomes-api php "$API/artisan" optimize >/dev/null

for p in / /catalog /catalog/lichnye-veshchi /catalog/zapchasti /catalog/uslugi/stroitelstvo /catalog/odezhda/obuv /map /search; do
  echo -n "$p "
  curl -sS -m 15 -o /dev/null -w "%{http_code} %{redirect_url}\n" --resolve avito.rinulik.ru:443:127.0.0.1 "https://avito.rinulik.ru$p"
done
echo -n "api roots: "
curl -sS -m 10 "http://127.0.0.1:8073/api/v1/categories?parent=root&per_page=20" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['meta']['total'], [i['name'] for i in d['data']])"
