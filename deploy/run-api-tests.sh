#!/bin/bash
set -euo pipefail
if ! php -m | grep -qi pdo_sqlite; then
  DEBIAN_FRONTEND=noninteractive apt-get install -y php8.3-sqlite3
fi
cd /var/www/helphomes-api
php artisan config:clear
php artisan test
php artisan optimize
curl -sS -m 8 "http://127.0.0.1:8073/api/v1/categories?per_page=1"
echo
curl -sS -m 8 -o /dev/null -w "home:%{http_code}\n" -H "Host: helphomes.ru" http://127.0.0.1/
curl -sS -m 8 -o /dev/null -w "catalog:%{http_code}\n" -H "Host: helphomes.ru" http://127.0.0.1/catalog
