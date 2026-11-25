#!/bin/bash
set -euo pipefail

APP=/var/www/helphomes-api
SRC=/tmp/hh-laravel-src

sed -i 's/\r$//' "$SRC"/*.php

install -o helphomes-api -g helphomes-api -m 644 \
  "$SRC/2026_11_01_210000_create_categories_table.php" \
  "$APP/database/migrations/2026_11_01_210000_create_categories_table.php"
install -o helphomes-api -g helphomes-api -m 644 \
  "$SRC/2026_11_01_210100_create_listings_table.php" \
  "$APP/database/migrations/2026_11_01_210100_create_listings_table.php"

mkdir -p "$APP/app/Models" "$APP/database/seeders" "$APP/database/data"
install -o helphomes-api -g helphomes-api -m 644 "$SRC/Category.php" "$APP/app/Models/Category.php"
install -o helphomes-api -g helphomes-api -m 644 "$SRC/Listing.php" "$APP/app/Models/Listing.php"
install -o helphomes-api -g helphomes-api -m 644 "$SRC/CategorySeeder.php" "$APP/database/seeders/CategorySeeder.php"
install -o helphomes-api -g helphomes-api -m 644 "$SRC/DatabaseSeeder.php" "$APP/database/seeders/DatabaseSeeder.php"
install -o helphomes-api -g helphomes-api -m 644 "$SRC/CategoryController.php" "$APP/app/Http/Controllers/Api/V1/CategoryController.php"
install -o helphomes-api -g helphomes-api -m 644 "$SRC/ListingController.php" "$APP/app/Http/Controllers/Api/V1/ListingController.php"
install -o helphomes-api -g helphomes-api -m 644 "$SRC/CategoryResource.php" "$APP/app/Http/Resources/CategoryResource.php"
install -o helphomes-api -g helphomes-api -m 644 "$SRC/ListingResource.php" "$APP/app/Http/Resources/ListingResource.php"
install -o helphomes-api -g helphomes-api -m 644 "$SRC/api.php" "$APP/routes/api.php"
install -o helphomes-api -g helphomes-api -m 644 "$SRC/ApiV1Test.php" "$APP/tests/Feature/ApiV1Test.php"
install -o helphomes-api -g helphomes-api -m 644 /tmp/hh-taxonomy.json "$APP/database/data/taxonomy.json"

sudo -u helphomes-api php "$APP/artisan" migrate --force
sudo -u helphomes-api php "$APP/artisan" db:seed --class=CategorySeeder --force
sudo -u helphomes-api php "$APP/artisan" optimize

echo "=== MIGRATE ==="
sudo -u helphomes-api php "$APP/artisan" migrate:status
echo "=== CATEGORIES ==="
curl -sS -m 10 "http://127.0.0.1:8073/api/v1/categories?per_page=3"
echo
echo "=== ROOTS ==="
curl -sS -m 10 "http://127.0.0.1:8073/api/v1/categories?parent=root&per_page=20" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['meta']['total'], [i['path'] for i in d['data'][:8]])"
echo "=== LISTINGS ==="
curl -sS -m 10 "http://127.0.0.1:8073/api/v1/listings"; echo
echo "=== TEST ==="
cd "$APP"
php artisan config:clear
php artisan test --filter=ApiV1Test
php artisan optimize
